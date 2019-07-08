import * as scheduleController from './scheduleController'

export class ScheduleRoute {
    public static routes(app): void {
        app.route('/schedules').get(scheduleController.getSchedules);
        app.route('/schedules/:id').get(scheduleController.getSchedule);
        app.route('/schedules').post(scheduleController.createSchedule);
        app.route('/schedules/:id/timeslot').post(scheduleController.createTimeslot);
        app.route('/schedules/:id/timeslot').put(scheduleController.updateTimeslot);
    }
}
