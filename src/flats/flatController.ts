import {NextFunction, Request, Response} from 'express'
import {User} from '../users/user'
import {formatOutput, formatUser} from '../utils'
import {Logger} from '../utils/logger'
import {Flat} from "./flat";
import {createMockFlats} from "./flatService";

// TODO (Q) wait for flat offerer registration
export let getFlats = async (req: Request, res: Response, next: NextFunction) => {
    const flats = await Flat.find();

    if (!flats) {
        Logger.logger.info(`[GET] [/flats] something went wrong`);
        return res.status(404).send();
    }

    return formatOutput(res, flats, 200, "flats");
};

export let getFlat = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    Logger.logger.info(`[GET] [/flats/] ${id}`);

    const flat = await Flat.findById(id);
    if (!flat) {
        Logger.logger.info(`[GET] [/flats/:{id}] flats with id ${id} not found`);
        return res.status(404).send();
    }
    
    return formatOutput(res, flat, 200, "flat");
};

export let addFlat = async (req: Request, res: Response, next: NextFunction) => {
    const flat = new Flat(req.body);
    if (!flat) {
        Logger.logger.info(`Something went wrong.`);
        return res.status(404).send();
    }

    try {
        await flat.save();
        console.log(`Flat added successfully`);
        return res.status(200).send();
    } catch (e) {
        Logger.logger.info(`Something went wrong. Error: ${e}`);
    }
};

export let deleteFlat = async (req: Request, res: Response) => {
    const id = req.params.id;

    Logger.logger.info(`[GET] [/flats/] ${id}`);

    await Flat.findByIdAndDelete(id);

    return res.status(204).send();
};


export let deleteAllFlats = async (req: Request, res: Response) => {
    Logger.logger.warn(`[DELETE] [/flats]`);

    await Flat.remove({});

    return res.status(204).send();
};


export let getFlatResidents = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    try {
        const users = await User.find({residenceId: id});
        // TODO (Q) join with preferences
        return formatOutput(res, users.map(formatUser), 200, 'residents')
    } catch (e) {
        console.error(e)
        // TODO set error logger
        Logger.logger.info(`Exception when getting residents with flat id ${id}`);
        return res.status(404).send()
    }
};

export const generateFlats =async (req: Request, res: Response) => {
    try {
        await createMockFlats(5);
        res.status(200).send()
    } catch (e) {
        return res.status(404).send(e);
    }
}
