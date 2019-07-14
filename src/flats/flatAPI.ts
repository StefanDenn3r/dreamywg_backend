import * as flatController from './flatController'

export class FlatRoute {
    public static routes(app): void {
        app.route('/flats').get(flatController.getFlats);
        app.route('/flats/:id').get(flatController.getFlat);
        app.route('/flats/:id/residents').get(flatController.getFlatResidents);
    }
}
