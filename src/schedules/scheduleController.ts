import {NextFunction, Request, Response} from 'express'
import {Logger} from '../utils/logger';
import {IScheduleModel, Schedule} from "./schedule";
import {UserService} from '../users/userService';
import {ScheduleService} from "./scheduleService";

export class ScheduleController {
    static getSchedules = async (req: Request, res: Response, next: NextFunction) => {
        let schedules = await ScheduleService.findSchedule({});

        if (!schedules)
            return res.status(400).send();
        else {
            return res.json(schedules)
        }
    };

    static getSchedulesByFlat = async (req: Request, res: Response, next: NextFunction) => {
        let schedules = await ScheduleService.findSchedule({flatId: req.params.flatId});
        if (!schedules)
            return res.status(400).send();
        else {
            return res.json(schedules)
        }
    };

    static getSchedule = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        let schedule = await ScheduleService.findScheduleById(id);

        if (!schedule)
            return res.status(400).send();
        else {
            return res.json(schedule)
        }
    };

    static createSchedules = async (req: Request, res: Response, next: NextFunction) => {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        const flatId = req.body.flatId;

        const schedules = ScheduleService.createSchedule(startDate, endDate, flatId);

        const response = await Promise.all(schedules).catch(error => {
            Logger.logger.error(`[POST] [/schedules] something went wrong when saving a new schedule | ${error.message}`);
            next(error);
            return null
        });

        return res.json(response);
    };

    static createTimeslots = async (req: Request, res: Response, next: NextFunction) => {
        const scheduleId = req.params.id;
        const [startHour, startMinute] = req.body.startTime.split(':');
        const [endHour, endMinute] = req.body.endTime.split(':');
        const sessionTime = parseInt(req.body.sessionTime);

        let schedule: IScheduleModel = await ScheduleService.findScheduleById(scheduleId);
        schedule = ScheduleService.createTimeslots(schedule, startHour, startMinute, endHour, endMinute, sessionTime);

        const savedSchedule = await schedule.save().catch(error => {
            Logger.logger.error(`[POST] [/schedules] something went wrong when saving a new timeslot | ${error.message}`);
            next(error);
            return null
        });
        return res.json(savedSchedule);
    };

    static getPastTimeslots = async (req: Request, res: Response, next: NextFunction) => {
        const flatId = req.params.flatId;
        const recentDate = new Date();

        const schedules = await ScheduleService.findTimeslots({
            "flatId": flatId,
            "timeslots.endTime": {$lt: recentDate}
        });

        if (!schedules)
            return res.status(400).send();

        const timeslots = ScheduleService.getPastTimeslot(schedules);

        return res.json(timeslots)
    };

    static updatePastTimeslotStatus = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.header('Authorization');

        const user = await UserService.getUserByToken(token);
        if (!user) {
            return res.status(404).send()
        }

        const timeslotId = req.params.id;
        const newStatus = req.body.status;
        let schedules = [];

        if (newStatus == 'BOOKED') {
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
        if (!schedules)
            return res.status(400).send();
        else {
            return res.json(schedules)
        }
    };

    static cancelTimeslot = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.header('Authorization');
        const timeslotId = req.params.id;

        const user = await UserService.getUserByToken(token);
        if (!user) {
            return res.status(404).send()
        }

        const schedules = await Schedule.update({'timeslots._id': timeslotId}, {
            '$set': {
                'timeslots.$.userId': null,
                'timeslots.$.status': 'IDLE'
            }
        });

        if (!schedules)
            return res.status(400).send();
        else {
            return res.json(schedules)
        }
    };

    static deleteAllSchedule = async (req: Request, res: Response, next: NextFunction) => {
        const schedules = await ScheduleService.deleteAllSchedules();

        if (!schedules)
            return res.status(400).send();
        else {
            return res.json(schedules)
        }
    };
}