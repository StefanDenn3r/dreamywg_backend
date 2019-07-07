import {NextFunction, Request, Response} from "express";
import * as halson from "halson";
import {FlatOfferer, IFlatOffererModel} from "../users/user";
import {APILogger} from "../utils/logger";
import {formatOutput, formatUser} from "../utils";
import {getUserByToken} from "../users/userController";

//TODO add try catch to every await
export let getFlatofferers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let flatOfferer = await FlatOfferer.find();
    if (!flatOfferer) {
        APILogger.logger.info(`[GET] [/users] something went wrong`);
        return res.status(404).send();
    }

    return formatOutput(res, flatOfferer.map(formatUser), 200, "flatofferer");
};

export let getFlatofferer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id;

    APILogger.logger.info(`[GET] [/flatofferer] ${id}`);

    let flatofferer = await FlatOfferer.findById(id);
    if (!flatofferer) {
        APILogger.logger.info(
            `[GET] [/flatofferer/:{id}] flatofferer with id ${id} not found`
        );
        return res.status(404).send();
    }
    return formatOutput(res, formatUser(flatofferer), 200, "flatofferer");
};

export let addFlatofferer = async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserByToken(req.header('Authorization'));
    const newOfferer = new FlatOfferer(req.body);
    newOfferer.user = user;
    try {
        await newOfferer.save()
        console.log('saved successfully')
        return res.status(200).send();

    } catch (err) {
        console.log('error occured')

        return res.status(500).send(err.message);
    }
    return newOfferer.save((error, user) => {
        console.log("entered save callback")
        if (error) {
            APILogger.logger.error(
                `[POST] [/users] something went wrong when saving a new flatofferer ${newOfferer} | ${
                    error.message
                    }`
            );
            return res.status(500).send(error);
        }
        user = halson(user.toJSON()).addLink(
            "self",
            `/flatofferer/${newOfferer._id}`
        );
        return formatOutput(res, user, 201, "flatofferer");
    });
};

export let updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id;

    APILogger.logger.info(`[PATCH] [/flatofferer] ${id}`);

    let offerer: IFlatOffererModel = await FlatOfferer.findById(id);

    if (!offerer) {
        APILogger.logger.info(
            `[PATCH] [/flatofferer/:{id}] flatofferer with id ${id} not found`
        );
        return res.status(404).send();
    }

    return offerer.save(() => res.status(204).send());
};

export let removeUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id;

    APILogger.logger.warn(`[DELETE] [/flatofferer] ${id}`);

    let oferrer = await FlatOfferer.findById(id);
    if (!oferrer) {
        APILogger.logger.info(
            `[DELETE] [/flatofferer/:{id}] flatofferer with id ${id} not found`
        );
        return res.status(404).send();
    }

    return oferrer.remove(() => res.status(204).send());
};
