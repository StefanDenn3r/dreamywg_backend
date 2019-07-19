import {NextFunction, Request, Response} from "express";
import {isArray, mergeWith} from "lodash";
import {FlatSeeker} from "./flatSeeker";
import {FlatSeekerService} from "./flatSeekerService";
import {saveImageToFile} from '../utils/file';
import {UserService} from "../users/userService";
import {SearchService} from "./searchService";

export class FlatSeekerController {
    static deleteAllFlatSeekers = async (req: Request, res: Response) => {
        const flatSeeker = await FlatSeekerService.deleteAllFlatSeekers();

        if (!flatSeeker)
            return res.status(400).send();
        else {
            return res.json(flatSeeker)
        }
    };


    static getFlatSeeker = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const flatSeeker = await FlatSeekerService.getFlatSeekerById(id);

        if (!flatSeeker)
            return res.status(400).send();
        else {
            return res.json(flatSeeker)
        }
    };

    static getFlatSeekers = async (req: Request, res: Response) => {
        const flatSeekers = await FlatSeekerService.getAllFlatSeekers();

        if (!flatSeekers)
            return res.status(400).send();
        else {
            return res.json(flatSeekers)
        }
    };


    static createFlatSeeker = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.header('Authorization');

        req.body.personalInformation.image = await saveImageToFile(req.body.personalInformation.image);

        const flatSeeker = await FlatSeekerService.createFlatSeeker(token, req.body);

        if (!flatSeeker)
            return res.status(400).send();
        else {
            return res.json(flatSeeker)
        }

    };

    static searchFlats = async (req: Request, res: Response) => {
        const body = req.body;
        const page = body.page;
        const elementsPerPage = body.elementsPerPage;
        const token = req.header('Authorization');

        const user = await UserService.getUserByToken(token);
        if (!user)
            return res.status(400).send();

        let flatSeeker = await FlatSeekerService.getFlatSeekerByUser(user);
        if (!flatSeeker)
            return res.status(400).send();

        flatSeeker = mergeWith(flatSeeker, body, (objValue, srcValue) => {
            if (isArray(objValue)) {
                return srcValue;
            }
        });

        if (body.preferences.flat.room.dateAvailable)
            flatSeeker.preferences.flat.room.dateAvailableRange = [];
        else
            flatSeeker.preferences.flat.room.dateAvailable = undefined;

        const result = SearchService.searchFlats(flatSeeker, page, elementsPerPage);
        if (!result)
            return res.status(400).send();
        else {
            return res.json(result)
        }


    };

    static loadSearchProperties = async (req: Request, res: Response, next: NextFunction) => {
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

}
