import {NextFunction, Request, Response} from "express";
import {mergeWith, isArray} from "lodash";
import {getUserByToken} from "../users/userService";
import {formatOutput, formatUser} from "../utils";
import {APILogger} from "../utils/logger";
import {Type} from "../utils/selectionEnums";
import {FlatSeeker} from "./flatSeeker";
import {matchOnDb} from "./flatSeekerService";

export let searchFlats = async (req: Request, res: Response) => {
    try {
        const user = await getUserByToken(req.header('Authorization'));
        let flatSeeker = await FlatSeeker.findOne({user: user}).populate('user');

        const body = req.body;
        const page = body.page;
        const elementsPerPage = body.elementsPerPage;

        flatSeeker = mergeWith(flatSeeker, body, (objValue, srcValue) => {
            if (isArray(objValue)) {
                return srcValue;
            }
        });

        if (body.preferences.flat.room.dateAvailable)
            flatSeeker.preferences.flat.room.dateAvailableRange = [];
        else
            flatSeeker.preferences.flat.room.dateAvailable = undefined;

        const result = await matchOnDb(flatSeeker)

        const resultLength = result.length;
        if (resultLength > 0) {
            const slicedResult = result.slice((page - 1) * elementsPerPage, page * elementsPerPage);
            return res.send({
                data: slicedResult,
                totalResults: resultLength
            })
        }
        return res.status(200).send({
            data: [],
            totalResults: 0
        })
    } catch (e) {
        console.log(e)
        return res.status(400).send()
    }
};


export let deleteAllFlatSeekers = async (req: Request, res: Response) => {
    APILogger.logger.warn(`[DELETE] [/flatSeekers]`);

    await FlatSeeker.remove({});

    return res.status(204).send();
};


// TODO add try catch to every await
export let getFlatSeekers = async (req: Request, res: Response) => {
    const flatOfferer = await FlatSeeker.find();
    if (!flatOfferer) {
        APILogger.logger.info(`[GET] [/flatseekers] something went wrong`);
        return res.status(404).send();
    }

    return formatOutput(res, flatOfferer.map(formatUser), 200, "flatofferer");
};

export let getFlatSeeker = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    APILogger.logger.info(`[GET] [/flatseekers] ${id}`);

    const flatofferer = await FlatSeeker.findById(id);
    if (!flatofferer) {
        APILogger.logger.info(
            `[GET] [/flatseekers/:{id}] flatseekers with id ${id} not found`
        );
        return res.status(404).send();
    }
    return formatOutput(res, formatUser(flatofferer), 200, "flatseekers");
};

export let loadSearchProperties = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    const user = await getUserByToken(token);
    const flatSeeker = await FlatSeeker.findOne({user: user});

    const result = {
        preferences: {
            flat: {
                regions: flatSeeker.preferences.flat.regions,
                room: {
                    size: {
                        from: flatSeeker.preferences.flat.room.size.from,
                        to: flatSeeker.preferences.flat.room.size.to,
                    },
                    rent: {
                        from: flatSeeker.preferences.flat.room.rent.from,
                        to: flatSeeker.preferences.flat.room.rent.to,
                    },
                    furnished: flatSeeker.preferences.flat.room.furnished,
                    rentType: flatSeeker.preferences.flat.room.rentType,
                    dateAvailable: flatSeeker.preferences.flat.room.dateAvailable,
                    dateAvailableRange: flatSeeker.preferences.flat.room.dateAvailableRange,
                },
                flatshareType: flatSeeker.preferences.flat.flatshareType,

            },
            flatEquipment: {
                balcony: flatSeeker.preferences.flatEquipment.balcony
            },
            smokers: flatSeeker.preferences.smokers,
            pets: flatSeeker.preferences.pets
        }
    };

    return res.status(200).send(result)
};

export let addFlatSeeker = async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserByToken(req.header('Authorization'));
    const newSeeker = new FlatSeeker(req.body);

    if (!user || !newSeeker) {
        APILogger.logger.info(`Something went wrong.`);
        return res.status(404).send();
    }

    newSeeker.user = user._id;
    user.type = Type.SEEKER;
    try {
        await user.save();
        await newSeeker.save();
        console.log(`Seeker successfully saved for user with email: ${newSeeker.user.email}`);
        return res.status(200).send();
    } catch (e) {
        APILogger.logger.info(`Something went wrong. Error: ${e}`);
    }
};
