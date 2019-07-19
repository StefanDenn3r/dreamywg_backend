import {NextFunction, Request, Response} from 'express'
import {IUserModel, User} from "../users/user";
import Schedule, { IScheduleModel } from './schedule';
import { APILogger } from '../utils/logger';
import * as scheduleService from './scheduleService'

export let getSchedules = async (req: Request, res: Response, next: NextFunction) => {
    let schedules = await Schedule.find().lean().catch((e) => {
        APILogger.logger.info(`[GET] [/schedules] something went wrong`);
        next(e)
        return null;
    })

    return res.end(JSON.stringify(schedules));
};

export let getSchedulesByFlat = async (req: Request, res: Response, next: NextFunction) => {
    let schedules = await Schedule.find({flatId: req.params.flatId}).lean().catch((e) => {
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
    return res.json(schedule);
};

export let createSchedules = async (req: Request, res: Response, next: NextFunction) => {
    const startDate = new Date(req.body.startDate)
    const endDate = new Date(req.body.endDate)
    const flatId = req.body.flatId

    const schedules = scheduleService.createSchedule(startDate, endDate, flatId)

    const response = await Promise.all(schedules).catch(error => {
        APILogger.logger.error(`[POST] [/schedules] something went wrong when saving a new schedule | ${error.message}`);
        next(error)
        return null
    });
    
    return res.end(JSON.stringify(response));
}

export let createTimeslots = async (req: Request, res: Response, next: NextFunction) => {
    const scheduleId = req.params.id;
    const [startHour, startMinute] = req.body.startTime.split(':');
    const [endHour, endMinute] = req.body.endTime.split(':');
    const sessionTime = parseInt(req.body.sessionTime);
    
    let schedule: IScheduleModel = await Schedule.findById(scheduleId).catch((e) => {
        console.error(e)
        APILogger.logger.info(`[GET] [/schedules] something went wrong`);
        next(e)
        return null;
    })

    schedule = scheduleService.createTimeslots(schedule, startHour, startMinute, endHour, endMinute, sessionTime)

    const savedSchedule = await schedule.save().catch(error => {
        APILogger.logger.error(`[POST] [/schedules] something went wrong when saving a new timeslot | ${error.message}`);
        next(error)
        return null
    })
    return res.end(JSON.stringify(savedSchedule));
};

export let getPastTimeslots = async (req: Request, res: Response, next: NextFunction) => {
    const flatId = req.params.flatId
    const recentDate = new Date();
    const schedules = await Schedule.find({
                        "flatId": flatId,
                        "timeslots.endTime": {$lt: recentDate}
                    }).select("timeslots")

    const timeslots = scheduleService.getPastTimeslot(schedules)

    return res.end(JSON.stringify(timeslots));
};

export let updatePastTimeslotStatus = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');

    const user: IUserModel = await User.findOne({jwt_token: token});
    if (!user) {
        APILogger.logger.info(`[PATCH] user not found`);
        return res.status(404).send()
    }

    const timeslotId = req.params.id
    const newStatus = req.body.status
    let schedules = []
    
    if (newStatus == 'BOOKED') { // TODO should use enum
        //only update user id when status is booked
        schedules = await Schedule.update({'timeslots._id': timeslotId}, {'$set': {
            'timeslots.$.userId' : user._id,
            'timeslots.$.status': newStatus
        }})
    } else {
        schedules = await Schedule.update({'timeslots._id': timeslotId}, {'$set': {
            'timeslots.$.status': newStatus
        }})
    }

    return res.end(JSON.stringify(schedules));
};

export let cancelTimeslot = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    const timeslotId = req.params.id

    const user: IUserModel = await User.findOne({jwt_token: token});
    if (!user) {
        APILogger.logger.info(`[PATCH] user not found`);
        return res.status(404).send()
    }

    const schedules = await Schedule.update({'timeslots._id': timeslotId}, {'$set': {
        'timeslots.$.userId' : null,
        'timeslots.$.status': 'IDLE' // TODO should use enum
    }})

    return res.end(JSON.stringify(schedules));
}

export let deleteAllSchedule = async (req: Request, res: Response, next: NextFunction) => {
    await Schedule.deleteMany({})
    return res.end(JSON.stringify("HAHAHA"));
};
