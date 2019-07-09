import {NextFunction, Request, Response} from "express";
import {FlatSeeker} from "./flatSeeker";
import {APILogger} from "../utils/logger";
import {formatOutput, formatUser} from "../utils";
import {getUserByToken} from "../users/userController";

//TODO add try catch to every await
export let getFlatSeekers = async (req: Request, res: Response) => {
    let flatOfferer = await FlatSeeker.find();
    if (!flatOfferer) {
        APILogger.logger.info(`[GET] [/flatseekers] something went wrong`);
        return res.status(404).send();
    }

    return formatOutput(res, flatOfferer.map(formatUser), 200, "flatofferer");
};

export let getFlatSeeker = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    APILogger.logger.info(`[GET] [/flatseekers] ${id}`);

    let flatofferer = await FlatSeeker.findById(id);
    if (!flatofferer) {
        APILogger.logger.info(
            `[GET] [/flatseekers/:{id}] flatseekers with id ${id} not found`
        );
        return res.status(404).send();
    }
    return formatOutput(res, formatUser(flatofferer), 200, "flatseekers");
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
        await newSeeker.save();
        console.log(`Seeker successfully saved for user with email: ${newSeeker.user.email}`);
        return res.status(200).send();
    } catch (e) {
        APILogger.logger.info(`Something went wrong. Error: ${e}`);
    }
};
