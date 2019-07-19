import {NextFunction, Request, Response} from "express";
import {FlatOffererService} from "./flatOffererService";

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


        const result = await FlatOffererService.createFlatOfferer(token, req.body);

        if (!result) {
            return res.status(400).send();
        } else {
            return res.status(200).send();

        }
    };
}