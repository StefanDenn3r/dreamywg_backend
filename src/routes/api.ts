import * as apiController from '../controllers/api'

export class APIRoute {
    public static routes(app): void {
        app.route('/api').get(apiController.getApi)
    }
}
