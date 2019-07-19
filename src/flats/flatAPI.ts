import * as flatController from './flatController'

export class FlatRoute {
    public static routes(app): void {
        app.route('/flats/generate').get(flatController.generateFlats);
        app.route('/flats').get(flatController.getFlats);
        app.route('/flats').post(flatController.addFlat);
        app.route('/flats/:id').get(flatController.getFlat);
        app.route("/flats/:id").delete(flatController.deleteFlat);
        app.route("/flats").delete(flatController.deleteAllFlats)
    }
}
