import {NextFunction, Request, Response} from "express";
import {FlatOffererService} from "./flatOffererService";
import {saveImageToFile} from "../utils/file";

export class FlatOffererController {

    static deleteAllFlatOfferers = async (req: Request, res: Response, next: NextFunction) => {
        const flatOfferers = await FlatOffererService.deleteAllFlatofferers();

        if (!flatOfferers)
            return res.status(400).send();
        else {
            return res.status(204).send();
        }
    };

    static getFlatOfferers = async (req: Request, res: Response, next: NextFunction) => {
        const flatOfferers = await FlatOffererService.getAllFlatofferers();

        if (!flatOfferers)
            return res.status(400).send();
        else {
            return res.json(flatOfferers)
        }
    };

    static getFlatOfferer = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const flatofferer = await FlatOffererService.getFlatoffererById(id);

        if (!flatofferer)
            return res.status(400).send();
        else {
            return res.json(flatofferer)
        }
    };

    static createFlatOfferer = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.header('Authorization');
        const promises = req.body.images.map(async image => {
            return await saveImageToFile(image);
        });

        req.body.images = await Promise.all(promises);

        req.body.rooms.forEach(async room => {
            room.image = await saveImageToFile(room.image)
        });

        const result = await FlatOffererService.createFlatOfferer(token, req.body);

        if (!result) {
            return res.status(400).send();
        } else {
            return res.status(200).send();

        }
    };
}