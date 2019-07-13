import {NextFunction, Request, Response} from 'express'
import Schedule, { ITimeSlot, IScheduleModel } from './schedule';
import { APILogger } from '../utils/logger';
import { start } from 'repl';

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

export let createSchedules = async (req: Request, res: Response, next: NextFunction) => {
    const startDate = new Date(req.body.startDate)
    const endDate = new Date(req.body.endDate)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    // TODO add validation
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    const scheduledDate = new Date(startDate)
    const schedules = []
    for (let index = 0; index <= diffDays; index++) {
        schedules[index] = new Schedule({
            date: scheduledDate.setDate(startDate.getDate() + index),
            timeslots: []
        }).save()
    }
    const response = await Promise.all(schedules).catch(error => {
        APILogger.logger.error(`[POST] [/schedules] something went wrong when saving a new schedule | ${error.message}`);
        next(error)
        return null
    });
    console.log(response, 'response')
    return res.end(JSON.stringify(response));
}

export let createTimeslots = async (req: Request, res: Response, next: NextFunction) => {
    const scheduleId = req.params.id;
    
    const [startHour, startMinute] = req.body.startTime.split(':'); 
    const [endHour, endMinute] = req.body.endTime.split(':');
    const sessionTime = parseInt(req.body.sessionTime);
    
    const schedule: IScheduleModel = await Schedule.findById(scheduleId).catch((e) => {
        console.error(e)
        APILogger.logger.info(`[GET] [/schedules] something went wrong`);
        next(e)
        return null;
    })

    //TODO validation
    const timeslot = new Date(schedule.date)
    timeslot.setHours(startHour)
    timeslot.setMinutes(startMinute)

    const endTimeslot = new Date(schedule.date)
    endTimeslot.setHours(endHour)
    endTimeslot.setMinutes(endMinute)

    schedule.timeslots.push({
        time: new Date(timeslot),
        userId: null
    })

    while (timeslot < endTimeslot) {
        const minute = timeslot.getMinutes()
        const hour = timeslot.getHours()
        
        if (minute + sessionTime < 60) {
            timeslot.setMinutes(minute + sessionTime)
        } else {
            timeslot.setHours(hour+1)
            timeslot.setMinutes((minute + sessionTime) % 60)
        }

        schedule.timeslots.push({
            time: new Date(timeslot),
            userId: null
        })
    }

    const savedSchedule = await schedule.save().catch(error => {
        APILogger.logger.error(`[POST] [/schedules] something went wrong when saving a new timeslot | ${error.message}`);
        next(error)
        return null
    })
    return res.end(JSON.stringify(savedSchedule));
};

export let getPastTimeslots = async (req: Request, res: Response, next: NextFunction) => {

    var recentDate = new Date();
    const schedules = await Schedule.find({
                        "timeslots.time": {$lt: recentDate}
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
