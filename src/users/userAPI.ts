import * as userController from './userController'

export class UserRoute {
    public static routes(app): void {
        app.route('/users').post(userController.addUser);
        app.route('/users').patch(userController.updateUser);
        app.route('/users').delete(userController.removeAllUsers);
        app.route('/users/:id').delete(userController.removeUser);
        app.route('/users/:id').get(userController.getUser);
        app.route('/users').get(userController.getUsers);
        app.route('/users/login').post(userController.login);
        app.route('/confirmation/:token').get(userController.confirmEmail);
    }
}
