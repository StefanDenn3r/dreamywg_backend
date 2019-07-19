import {UserController} from './userController'

export class UserRoute {
    public static routes(app): void {
        app.route('/users/oauthLinkedin').get(UserController.oAuthLinkedIn);
        app.route('/users/oauthFacebook').get(UserController.oAuthFacebook);
        app.route('/users/login').post(UserController.login);
        app.route('/users').post(UserController.createUser);
        app.route('/users').patch(UserController.updateUser);
        app.route('/users').delete(UserController.deleteAllUsers);
        app.route('/users/:id').delete(UserController.deleteUser);
        app.route('/users/:id').get(UserController.getUser);
        app.route('/users').get(UserController.getUsers);
        app.route('/confirmation/:token').get(UserController.confirmEmail);
    }
}
