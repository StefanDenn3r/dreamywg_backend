import {NextFunction, Request, Response} from "express";
import {FlatSeeker, IFlatSeekerModel} from "../users/user";
import {APILogger} from "../utils/logger";
import {formatOutput, formatUser} from "../utils";
import {getUserByToken} from "../users/userController";
import {FlatOfferer} from "../users/user";

//TODO add try catch to every await
export let getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let flatOfferer = await FlatSeeker.find();
    if (!flatOfferer) {
        APILogger.logger.info(`[GET] [/users] something went wrong`);
        return res.status(404).send();
    }

    return formatOutput(res, flatOfferer.map(formatUser), 200, "flatofferer");
};

export let getUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id;

    APILogger.logger.info(`[GET] [/flatofferer] ${id}`);

    let flatofferer = await FlatSeeker.findById(id);
    if (!flatofferer) {
        APILogger.logger.info(
            `[GET] [/flatofferer/:{id}] flatofferer with id ${id} not found`
        );
        return res.status(404).send();
    }
    return formatOutput(res, formatUser(flatofferer), 200, "flatofferer");
};

export let addFlatSeeker = async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserByToken(req.header('Authorization'));
    const newSeeker = new FlatSeeker(req.body);

    if (!user || !newSeeker) {
        APILogger.logger.info(`Something went wrong.`);
        return res.status(404).send();
    }

    newSeeker.user = user;
    try {
        await newSeeker.save()
        console.log(`Seeker successfully saved for user with email: ${newSeeker.user.email}`);
        return res.status(200).send();
    } catch (e) {
        APILogger.logger.info(`Something went wrong. Error: ${e}`);
    }
};

export let updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id;

    APILogger.logger.info(`[PATCH] [/flatofferer] ${id}`);

    let oferrer: IFlatSeekerModel = await FlatSeeker.findById(id);

    if (!oferrer) {
        APILogger.logger.info(
            `[PATCH] [/flatofferer/:{id}] flatofferer with id ${id} not found`
        );
        return res.status(404).send();
    }

    return oferrer.save(() => res.status(204).send());
};

export let removeUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id;

    APILogger.logger.warn(`[DELETE] [/flatofferer] ${id}`);

    let oferrer = await FlatSeeker.findById(id);
    if (!oferrer) {
        APILogger.logger.info(
            `[DELETE] [/flatofferer/:{id}] flatofferer with id ${id} not found`
        );
        return res.status(404).send();
    }

    return oferrer.remove(() => res.status(204).send());
};
