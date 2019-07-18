import {NextFunction, Request, Response} from "express";
import {Flat} from "../flats/flat";
import {getUserByToken} from "../users/userController";
import {formatOutput, formatUser} from "../utils";
import {APILogger} from "../utils/logger";
import {Type} from "../utils/selectionEnums";
import {FlatOfferer} from "./flatOfferer";
import {saveImageToFile} from '../utils/file';

export let deleteAllFlatOfferers = async (req: Request, res: Response) => {
    APILogger.logger.warn(`[DELETE] [/flatOfferers]`);

    await FlatOfferer.remove({})

    return res.status(204).send();
};


// TODO add try catch to every await
export let getFlatOfferers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const flatOfferer = await FlatOfferer.find();
    if (!flatOfferer) {
        APILogger.logger.info(`[GET] [/flatofferers] something went wrong`);
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

    const flatOfferer = await FlatOfferer.findById(id);
    if (!flatOfferer) {
        APILogger.logger.info(`[GET] [/flatofferer/:{id}] flatofferer with id ${id} not found`);
        return res.status(404).send();
    }
    return formatOutput(res, formatUser(flatOfferer), 200, "flatOfferer");
};

export let addFlatOfferer = async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserByToken(req.header('Authorization'));
    const promises = req.body.images.map(async image => {
        const fileName = await saveImageToFile(image)
        return fileName;
    })
    req.body.images = await Promise.all(promises)

    req.body.rooms.forEach(async room => {
        room.image = await saveImageToFile(room.image)
    })

    const flat = new Flat(req.body);
    if (!user || !flat) {
        APILogger.logger.info(`Something went wrong.`);
        return res.status(404).send();
    }

    const flatOfferer = new FlatOfferer();
    flatOfferer.user = user._id;
    flatOfferer.flat = flat._id;
    user.type = Type.OFFERER;

    try {
        await Promise.all([user.save(), flat.save(), flatOfferer.save()]);
        console.log(`Offerer successfully saved for user with email: ${flatOfferer.user.email}`);
        return res.status(200).send();
    } catch (e) {
        APILogger.logger.info(`Something went wrong. Error: ${e}`);
    }
};