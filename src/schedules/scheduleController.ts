import {NextFunction, Request, Response} from 'express'
import {IUserModel, User} from "../users/user";
import {Logger} from '../utils/logger';
import * as scheduleService from './scheduleService'
import {IScheduleModel, Schedule} from "./schedule";
import { UserService } from '../users/userService';

export let getSchedules = async (req: Request, res: Response, next: NextFunction) => {
    let schedules = await scheduleService.findSchedule({})

    return res.end(JSON.stringify(schedules));
};

export let getSchedulesByFlat = async (req: Request, res: Response, next: NextFunction) => {
    let schedules = await scheduleService.findSchedule({flatId: req.params.flatId})
    
    return res.end(JSON.stringify(schedules));
};

export let getSchedule = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    let schedule = await scheduleService.findScheduleById(id)
    
    return res.json(schedule);
};

export let createSchedules = async (req: Request, res: Response, next: NextFunction) => {
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const flatId = req.body.flatId;

    const schedules = scheduleService.createSchedule(startDate, endDate, flatId);

    const response = await Promise.all(schedules).catch(error => {
        Logger.logger.error(`[POST] [/schedules] something went wrong when saving a new schedule | ${error.message}`);
        next(error);
        return null
    });

    return res.end(JSON.stringify(response));
};

export let createTimeslots = async (req: Request, res: Response, next: NextFunction) => {
    const scheduleId = req.params.id;
    const [startHour, startMinute] = req.body.startTime.split(':');
    const [endHour, endMinute] = req.body.endTime.split(':');
    const sessionTime = parseInt(req.body.sessionTime);

    let schedule: IScheduleModel = await scheduleService.findScheduleById(scheduleId)
    console.log(schedule, 'schedule')
    schedule = scheduleService.createTimeslots(schedule, startHour, startMinute, endHour, endMinute, sessionTime);

    const savedSchedule = await schedule.save().catch(error => {
        Logger.logger.error(`[POST] [/schedules] something went wrong when saving a new timeslot | ${error.message}`);
        next(error);
        return null
    });
    return res.end(JSON.stringify(savedSchedule));
};

export let getPastTimeslots = async (req: Request, res: Response, next: NextFunction) => {
    const flatId = req.params.flatId;
    const recentDate = new Date();
    
    const schedules = await scheduleService.findTimeslots({
        "flatId": flatId,
        "timeslots.endTime": {$lt: recentDate}
    })

    const timeslots = scheduleService.getPastTimeslot(schedules);

    return res.end(JSON.stringify(timeslots));
};

export let updatePastTimeslotStatus = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');

    const user: IUserModel = await UserService.getUserByToken(token)
    if (!user) {
        Logger.logger.info(`[PATCH] user not found`);
        return res.status(404).send()
    }

    const timeslotId = req.params.id
    const newStatus = req.body.status
    let schedules = []
    
    if (newStatus == 'BOOKED') { // TODO should use enum
        //only update user id when status is booked
        schedules = await Schedule.update({'timeslots._id': timeslotId}, {
            '$set': {
                'timeslots.$.userId': user._id,
                'timeslots.$.status': newStatus
            }
        })
    } else {
        schedules = await Schedule.update({'timeslots._id': timeslotId}, {
            '$set': {
                'timeslots.$.status': newStatus
            }
        })
    }

    return res.end(JSON.stringify(schedules));
};

export let cancelTimeslot = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    const timeslotId = req.params.id

    const user: IUserModel = await UserService.getUserByToken(token)
    if (!user) {
        Logger.logger.info(`[PATCH] user not found`);
        return res.status(404).send()
    }

    const schedules = await Schedule.update({'timeslots._id': timeslotId}, {'$set': {
        'timeslots.$.userId' : null,
        'timeslots.$.status': 'IDLE' // TODO should use enum
    }})

    return res.end(JSON.stringify(schedules));
}

export let deleteAllSchedule = async (req: Request, res: Response, next: NextFunction) => {
    await Schedule.deleteMany({});
    return res.end(JSON.stringify("HAHAHA. ALL SCHEDULES DELETED"));
};
