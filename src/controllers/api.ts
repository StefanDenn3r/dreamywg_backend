import {NextFunction, Request, Response} from 'express'
import {formatOutput} from '../utility/'

export let getApi = (req: Request, res: Response, next: NextFunction) => {
    return formatOutput(res, {title: 'User API'}, 200, 'api')
};
