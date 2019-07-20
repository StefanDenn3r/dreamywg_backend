import {NextFunction, Request, Response} from 'express'
import {FlatService} from "./flatService";
import {Flat} from './flat'

export class FlatController {
    static getFlats = async (req: Request, res: Response, next: NextFunction) => {
        const flats = await FlatService.getAllFlats();

        if (!flats)
            return res.status(400).send();
        else {
            return res.json(flats)
        }
    };

    static getFlat = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const flat = await FlatService.getFlatById(id);

        if (!flat)
            return res.status(400).send();
        else {
            return res.json(flat)
        }
    };

    static getOffererFlat = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.header('Authorization');
        
        const flat = await FlatService.getOffererFlat(token)
        
        if (!flat)
            return res.status(400).send();
        else {
            return res.json(flat)
        }
    };
    

    static createFlat = async (req: Request, res: Response, next: NextFunction) => {
        let flat = new Flat(req.body);
        flat = await FlatService.createFlat(flat);

        if (!flat)
            return res.status(400).send();
        else {
            return res.json(flat)
        }
    };

    static deleteFlat = async (req: Request, res: Response) => {
        const id = req.params.id;
        const flat = await FlatService.deleteFlatById(id);

        if (!flat)
            return res.status(400).send();
        else {
            return res.json(flat)
        }
    };


    static deleteAllFlats = async (req: Request, res: Response) => {
        const flat = await FlatService.deleteAllFlats();

        if (!flat)
            return res.status(400).send();
        else {
            return res.json(flat)
        }
    };
}
