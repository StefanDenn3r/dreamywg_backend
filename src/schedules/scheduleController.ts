import {NextFunction, Request, Response} from 'express'
import Schedule, { ITimeSlot, IScheduleModel } from './schedule';
import { APILogger } from '../utils/logger';

//TODO (Q) wait for flat offerer registration
//TODO (Q) refactor logic to service class
export let getSchedules = async (req: Request, res: Response, next: NextFunction) => {
    let schedules = await Schedule.find().lean().catch((e) => {
        APILogger.logger.info(`[GET] [/schedules] something went wrong`);
        next(e)
        return null;
    })

    return res.end(JSON.stringify(schedules));
};

export let getSchedule = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    let schedule = await Schedule.findById(id).lean().catch((e) => {
        APILogger.logger.info(`[GET] [/schedules] something went wrong`);
        next(e)
        return null;
    })

    return res.end(JSON.stringify(schedule));
};

export let createSchedule = async (req: Request, res: Response, next: NextFunction) => {
    const timeslots = req.body.timeslots.map(timeslot => {
        return JSON.parse(timeslot)
    });

    const newSchedule = new Schedule({
        date: req.body.date,
        timeslots: timeslots
    });

    const savedSchedule = await newSchedule.save().catch(error => {
        APILogger.logger.error(`[POST] [/schedules] something went wrong when saving a new schedule | ${error.message}`);
        next(error)
        return null
    })
    return res.end(JSON.stringify(savedSchedule));
}

export let createTimeslot = async (req: Request, res: Response, next: NextFunction) => {
    const scheduleId = req.params.id;
    const newTimeSlot: ITimeSlot = JSON.parse(req.body.timeslots);
    
    let schedule: IScheduleModel = await Schedule.findById(scheduleId).catch((e) => {
        console.error(e)
        APILogger.logger.info(`[GET] [/schedules] something went wrong`);
        next(e)
        return null;
    })
    
    schedule.timeslots.push(newTimeSlot);
    const savedSchedule = await schedule.save().catch(error => {
        APILogger.logger.error(`[POST] [/schedules] something went wrong when saving a new timeslot | ${error.message}`);
        next(error)
        return null
    })
    return res.end(JSON.stringify(savedSchedule));
};

export let getPastTimeslots = async (req: Request, res: Response, next: NextFunction) => {

    const schedules = await Schedule.find({ "timeslots": 
                        { $elemMatch: 
                            { "status": ["ACCEPTED", "REJECTED", "NO_SHOW"] }
                        } 
                    }).select("timeslots")

    // TODO join with user
    let timeslots = []
    schedules.forEach(schedule => {
        timeslots = timeslots.concat(schedule.timeslots)
    })

    // TODO find more efficient way
    timeslots.forEach((timeslot) => {
        const status = timeslot.status
        if(status === "IDLE" || status === "BOOKED") {
            const index = timeslots.indexOf(timeslot)
            timeslots.splice(index, 1)
        } 
    })

    return res.end(JSON.stringify(timeslots));
};

export let updateTimeslot = async (req: Request, res: Response, next: NextFunction) => {
    return {}
};