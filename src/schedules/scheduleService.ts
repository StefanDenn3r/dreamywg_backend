import {Logger} from '../utils/logger';
import {IScheduleModel, Schedule} from './schedule';
import moment = require("moment");

export class ScheduleService {
    static createSchedule = (startDate, endDate, flatId) => {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const schedules = [];
        for (let index = 0; index <= diffDays; index++) {
            const scheduledDate = new Date(startDate);
            scheduledDate.setDate(startDate.getDate() + index);
            schedules[index] = new Schedule({
                date: scheduledDate,
                flatId: flatId
            }).save()
        }
        return schedules
    };

    static createTimeslots = (schedule, startHour, startMinute, endHour, endMinute, sessionTime): IScheduleModel => {
        let timeslot = new Date(schedule.date);
        timeslot.setHours(startHour);
        timeslot.setMinutes(startMinute);

        const endTimeslot = new Date(schedule.date);
        endTimeslot.setHours(endHour);
        endTimeslot.setMinutes(endMinute);

        let startTime = timeslot;

        while (timeslot < endTimeslot) {
            timeslot = moment(timeslot).add(sessionTime, 'minutes').toDate();
            schedule.timeslots.push({
                startTime: startTime,
                endTime: timeslot,
                userId: null
            });
            startTime = timeslot;
        }

        return schedule
    };

    static async deleteAllSchedules() {
        try {
            return await Schedule.deleteMany({});
        } catch (e) {
            Logger.logger.error(e.message);
            return null
        }
    }


    static getPastTimeslot = (schedules) => {
        let timeslots = [];
        schedules.forEach(schedule => {
            timeslots = timeslots.concat(schedule.timeslots)
        });

        timeslots = timeslots.filter(timeslot => timeslot.status !== "IDLE");

        return timeslots
    };

    static findSchedule = async (param) => {
        try {
            return await Schedule.find(param).populate('timeslots.userId', ['firstName', 'lastName', 'email']).lean()
        } catch (e) {
            Logger.logger.error(e.message);
            return null
        }
    };

    static findScheduleById = async (id) => {
        try {
            return await Schedule.findById(id).populate('timeslots.userId', ['firstName', 'lastName', 'email'])
        } catch (e) {
            Logger.logger.error(e.message);
            return null
        }
    };

    static findTimeslots = async (param) => {
        try {
            return await Schedule.find(param).populate('timeslots.userId', ['firstName', 'lastName', 'email']).select("timeslots");
        } catch (e) {
            Logger.logger.error(e.message);
            return null
        }
    }
}