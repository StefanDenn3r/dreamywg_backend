import * as scheduleController from './scheduleController'

export class ScheduleRoute {
    public static routes(app): void {
        app.route('/schedules').get(scheduleController.getSchedules);
        app.route('/schedules/flat/:flatId').get(scheduleController.getSchedulesByFlat);
        app.route('/schedules/:id').get(scheduleController.getSchedule);
        app.route('/schedules').post(scheduleController.createSchedules);
        app.route('/schedules/:id/timeslots').post(scheduleController.createTimeslots);
        app.route('/schedules').delete(scheduleController.deleteAllSchedule);
        app.route('/timeslots/:flatId/past').get(scheduleController.getPastTimeslots);
        app.route('/timeslots/:id').put(scheduleController.updatePastTimeslotStatus);
    }
}
