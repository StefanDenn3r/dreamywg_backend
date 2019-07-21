import {NextFunction, Request, Response} from 'express'

export let errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).send({
        error: err.message
    })
};
