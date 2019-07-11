import {NextFunction, Request, Response} from 'express'
import {User} from '../users/user'
import {formatOutput, formatUser} from '../utils'
import {APILogger} from '../utils/logger'
import {Flat} from "./flat";

//TODO (Q) wait for flat offerer registration
export let getFlats = async (req: Request, res: Response, next: NextFunction) => {
    let flats = await Flat.find();
    if (!flats) {
        APILogger.logger.info(`[GET] [/flats] something went wrong`);
        return res.status(404).send();
    }

    return formatOutput(res, flats, 200, "flats");
};

export let getFlat = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    APILogger.logger.info(`[GET] [/flats/] ${id}`);

    let flat = await Flat.findById(id);
    if (!flat) {
        APILogger.logger.info(`[GET] [/flats/:{id}] flats with id ${id} not found`);
        return res.status(404).send();
    }
    return formatOutput(res, flat, 200, "flat");
};

export let addFlat = async (req: Request, res: Response, next: NextFunction) => {
    const flat = new Flat(req.body);
    if (!flat) {
        APILogger.logger.info(`Something went wrong.`);
        return res.status(404).send();
    }

    try {
        await flat.save();
        console.log(`Flat added successfully`);
        return res.status(200).send();
    } catch (e) {
        APILogger.logger.info(`Something went wrong. Error: ${e}`);
    }
};

export let removeAllFlats = async (req: Request, res: Response) => {
    APILogger.logger.warn(`[DELETE] [/flats]`);

    let flats = await Flat.find();
    await flats.forEach(async (flats) => await flats.remove());

    return res.status(204).send();
};


export let getFlatResidents = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    try {
        let users = await User.find({residenceId: id});
        // TODO (Q) join with preferences
        return formatOutput(res, users.map(formatUser), 200, 'residents')
    } catch (e) {
        console.error(e)
        // TODO set error logger
        APILogger.logger.info(`Exception when getting residents with flat id ${id}`);
        return res.status(404).send()
    }

};