import {NextFunction, Request, Response} from "express";
import {FlatOfferer} from "./flatOfferer";
import {APILogger} from "../utils/logger";
import {formatOutput, formatUser} from "../utils";
import {getUserByToken} from "../users/userController";
import {Flat} from "../flats/flat";

//TODO add try catch to every await
export let getFlatOfferers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let flatOfferer = await FlatOfferer.find();
    if (!flatOfferer) {
        APILogger.logger.info(`[GET] [/users] something went wrong`);
        return res.status(404).send();
    }

    return formatOutput(res, flatOfferer.map(formatUser), 200, "flatOfferer");
};

export let getFlatOfferer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id;

    APILogger.logger.info(`[GET] [/flatofferer] ${id}`);

    let flatOfferer = await FlatOfferer.findById(id);
    if (!flatOfferer) {
        APILogger.logger.info(`[GET] [/flatofferer/:{id}] flatofferer with id ${id} not found`);
        return res.status(404).send();
    }
    return formatOutput(res, formatUser(flatOfferer), 200, "flatOfferer");
};

export let addFlatOfferer = async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserByToken(req.header('Authorization'));
    const flat = new Flat(req.body);
    if (!user || !flat) {
        APILogger.logger.info(`Something went wrong.`);
        return res.status(404).send();
    }

    const flatOfferer = new FlatOfferer();
    flatOfferer.user = user;
    flatOfferer.flat = flat;

    try {
        await flatOfferer.save();
        console.log(`Offerer successfully saved for user with email: ${flatOfferer.user.email}`);
        return res.status(200).send();
    } catch (e) {
        APILogger.logger.info(`Something went wrong. Error: ${e}`);
    }
};