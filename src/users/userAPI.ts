import * as userController from './userController'
import * as userService from './userService'

export class UserRoute {
    public static routes(app): void {
        app.route('/users').post(userController.addUser);
        app.route('/users/:id').patch(userController.updateUser);
        app.route('/users/:id').delete(userController.removeUser);
        app.route('/users/:id').get(userController.getUser);
        app.route('/users').get(userController.getUsers);

        app.route('/confirmation/:token').get(userController.confirmEmail);
        //app.route('/verify/:id').post(userService.sendVerificationMail);
    }
}
