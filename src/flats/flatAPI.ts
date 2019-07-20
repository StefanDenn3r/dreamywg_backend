import {FlatController} from './flatController'

export class FlatRoute {
    public static routes(app): void {
        app.route('/flats').get(FlatController.getFlats);
        app.route('/flats').post(FlatController.createFlat);
        app.route('/flats/my-flat').get(FlatController.getOffererFlat);
        app.route('/flats/:id').get(FlatController.getFlat);
        app.route("/flats/:id").delete(FlatController.deleteFlat);
        app.route("/flats").delete(FlatController.deleteAllFlats)
    }
}
