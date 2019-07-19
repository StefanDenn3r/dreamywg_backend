import {NextFunction, Request, Response} from 'express'
import {Logger} from './logger'

export let logging = (err: Error, req: Request, res: Response, next: NextFunction) => {
    Logger.logger.error(err);
    next(err)
};

export let clientErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (req.xhr) {
        res.status(500).send({error: 'Something failed!'})
    } else {
        next(err)
    }
};

export let errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).send({
        error: err.message
    })
};
