import {NextFunction, Request, Response} from 'express'
import Schedule, { ITimeSlot, IScheduleModel } from './schedule';
import { APILogger } from '../utils/logger';

//TODO (Q) wait for flat offerer registration
export let getSchedules = async (req: Request, res: Response, next: NextFunction) => {
    let schedules = await Schedule.find().catch((e) => {
        APILogger.logger.info(`[GET] [/schedules] something went wrong`);
        next(e)
        return null;
    })

    return schedules.toJSON();
};

export let getSchedule = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    let schedule = await Schedule.findById(id).catch((e) => {
        APILogger.logger.info(`[GET] [/schedules] something went wrong`);
        next(e)
        return null;
    })

    return schedule.toJSON();
};

export let createSchedule = async (req: Request, res: Response, next: NextFunction) => {
    const newSchedule = new Schedule(req.body);
    console.log(req.body, newSchedule)
    await newSchedule.save((error, schedule) => {
        if (error) {
            APILogger.logger.error(`[POST] [/schedules] something went wrong when saving a new schedule | ${error.message}`);
            next(error)
        }
        
        next(schedule.toJSON());
    })
}

export let createTimeslot = async (req: Request, res: Response, next: NextFunction) => {
    const scheduleId = req.body.scheduleId;
    delete req.body.scheduleId;
    const newTimeSlot: ITimeSlot = req.body;

    let schedule: IScheduleModel = await Schedule.findById(scheduleId).catch((e) => {
        console.error(e)
        APILogger.logger.info(`[GET] [/schedules] something went wrong`);
        next(e)
        return null;
    })
    
    schedule.timeslots.push(newTimeSlot)
    await schedule.save((error, schedule) => {
        if (error) {
            APILogger.logger.error(`[POST] [/schedules] something went wrong when saving a new timeslot | ${error.message}`);
            next(error)
        }
        next(schedule.toJSON())
    })
};

export let updateTimeslot = async (req: Request, res: Response, next: NextFunction) => {
    return {}
};
