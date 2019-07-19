import {IUserModel, User} from "../users/user";
import Schedule, { IScheduleModel, ScheduleSchema } from './schedule';
import moment = require("moment");

export let createSchedule = (startDate, endDate, flatId) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    // TODO add validation
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const schedules = []
    for (let index = 0; index <= diffDays; index++) {
        const scheduledDate = new Date(startDate)
        scheduledDate.setDate(startDate.getDate() + index)
        schedules[index] = new Schedule({
            date: scheduledDate,
            flatId: flatId
        }).save()
    }
    return schedules
}

export let createTimeslots = (schedule, startHour, startMinute, endHour, endMinute, sessionTime): IScheduleModel => {
    //TODO validation
    let timeslot = new Date(schedule.date)
    timeslot.setHours(startHour)
    timeslot.setMinutes(startMinute)

    const endTimeslot = new Date(schedule.date)
    endTimeslot.setHours(endHour)
    endTimeslot.setMinutes(endMinute)

    let startTime = timeslot

    while (timeslot < endTimeslot) {
        timeslot = moment(timeslot).add(sessionTime, 'minutes').toDate()
        schedule.timeslots.push({
            startTime: startTime,
            endTime : timeslot,
            userId: null
        })
        startTime = timeslot;
    }

    schedule.timeslots.push({
        startTime: startTime,
        endTime : moment(timeslot).add(sessionTime, 'minutes').toDate(),
        userId: null
    });

    return schedule
}

export let getPastTimeslot = (schedules) => {
    // TODO join with user
    let timeslots = []
    schedules.forEach(schedule => {
        timeslots = timeslots.concat(schedule.timeslots)
    })

    timeslots = timeslots.filter(timeslot => timeslot.status !== "IDLE")

    return timeslots
}