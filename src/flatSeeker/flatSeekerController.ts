import {NextFunction, Request, Response} from "express";
import {mergeWith, isArray} from "lodash";
import {formatOutput, formatUser} from "../utils";
import {Logger} from "../utils/logger";
import {Type} from "../utils/selectionEnums";
import {FlatSeeker} from "./flatSeeker";
import {matchOnDb} from "./flatSeekerService";
import {saveImageToFile} from '../utils/file';
import {UserService} from "../users/userService";

export let searchFlats = async (req: Request, res: Response) => {
    try {
        const user = await UserService.getUserByToken(req.header('Authorization'));
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
    Logger.logger.warn(`[DELETE] [/flatSeekers]`);

    await FlatSeeker.remove({});

    return res.status(204).send();
};


// TODO add try catch to every await
export let getFlatSeekers = async (req: Request, res: Response) => {
    const flatOfferer = await FlatSeeker.find();
    if (!flatOfferer) {
        Logger.logger.info(`[GET] [/flatseekers] something went wrong`);
        return res.status(404).send();
    }

    return formatOutput(res, flatOfferer.map(formatUser), 200, "flatofferer");
};

export let getFlatSeeker = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    Logger.logger.info(`[GET] [/flatseekers] ${id}`);

    const flatofferer = await FlatSeeker.findById(id);
    if (!flatofferer) {
        Logger.logger.info(
            `[GET] [/flatseekers/:{id}] flatseekers with id ${id} not found`
        );
        return res.status(404).send();
    }
    return formatOutput(res, formatUser(flatofferer), 200, "flatseekers");
};

export let loadSearchProperties = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    const user = await UserService.getUserByToken(token);
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
                    rentType: flatSeeker.preferences.flat.room.rentType,
                    dateAvailable: flatSeeker.preferences.flat.room.dateAvailable,
                    dateAvailableRange: flatSeeker.preferences.flat.room.dateAvailableRange,
                },
                flatshareType: flatSeeker.preferences.flat.flatshareType,

            },
            flatEquipment: {
                balcony: flatSeeker.preferences.flatEquipment.balcony,
                washingMachine: flatSeeker.preferences.flatEquipment.washingMachine,
                dishwasher: flatSeeker.preferences.flatEquipment.dishwasher,
                parkingLot: flatSeeker.preferences.flatEquipment.parkingLot
            }
        }
    };

    return res.status(200).send(result)
};

export let addFlatSeeker = async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.getUserByToken(req.header('Authorization'));
    req.body.personalInformation.image = await saveImageToFile(req.body.personalInformation.image)
    const newSeeker = new FlatSeeker(req.body);

    if (!user || !newSeeker) {
        Logger.logger.info(`Something went wrong.`);
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
        Logger.logger.info(`Something went wrong. Error: ${e}`);
    }
};