import * as scheduleController from './scheduleController'

export class ScheduleRoute {
    public static routes(app): void {
        app.route('/schedules').get(scheduleController.getSchedules);
        app.route('/schedules/:id').get(scheduleController.getSchedule);
        app.route('/schedules').post(scheduleController.createSchedule);
        app.route('/schedules/:id/timeslots').post(scheduleController.createTimeslot);
        app.route('/schedules/:scheduleId/timeslots/:timeslotId').put(scheduleController.updateTimeslot);
        app.route('/schedules/timeslots/past').get(scheduleController.getPastTimeslots);
    }
}
