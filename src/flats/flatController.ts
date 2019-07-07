import {NextFunction, Request, Response} from 'express'
import User from '../users/user'
import {formatOutput, formatUser} from '../utils'
import {APILogger} from '../utils/logger'

//TODO (Q) wait for flat offerer registration
export let getFlats = async (req: Request, res: Response, next: NextFunction) => {
    return {}
};

export let getFlat = async (req: Request, res: Response, next: NextFunction) => {
    return {}
};


export let addFlat = (req: Request, res: Response, next: NextFunction) => {
    return {}
};

export let updateFlat = async (req: Request, res: Response, next: NextFunction) => {
    return {}
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