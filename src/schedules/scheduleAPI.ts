import {ScheduleController} from "./scheduleController";

export class ScheduleRoute {
    public static routes(app): void {
        app.route('/schedules').get(ScheduleController.getSchedules);
        app.route('/schedules/flat/:flatId').get(ScheduleController.getSchedulesByFlat);
        app.route('/schedules/:id').get(ScheduleController.getSchedule);
        app.route('/schedules').post(ScheduleController.createSchedules);
        app.route('/schedules/:id/timeslots').post(ScheduleController.createTimeslots);
        app.route('/schedules').delete(ScheduleController.deleteAllSchedule);
        app.route('/timeslots/:flatId/past').get(ScheduleController.getPastTimeslots);
        app.route('/timeslots/:id').put(ScheduleController.updatePastTimeslotStatus);
        app.route('/timeslots/:id/cancel').put(ScheduleController.cancelTimeslot);
    }
}
