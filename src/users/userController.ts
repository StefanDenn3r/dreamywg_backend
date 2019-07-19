import * as config from 'config'
import {NextFunction, Request, Response} from 'express'
import {User} from './user'
import {UserService} from "./userService";

// TODO add Logging and Unauthorized
export class UserController {

    static loginUrl = `http://${config.get('host')}:${config.get('frontend_port')}/login`;

    static oAuthLinkedIn = async (req: Request, res: Response, next: NextFunction) => {
        const code = req.query.code;
        const state = req.query.state;

        try {
            await UserService.oAuth(code, state, 'linkedIn', 'oauthLinkedin');
        } catch (e) {
            return res.status(400).send();
        }
        return res.redirect(UserController.loginUrl);
    };

    static oAuthFacebook = async (req: Request, res: Response, next: NextFunction) => {
        const code = req.query.code;
        const state = req.query.state;

        try {
            await UserService.oAuth(code, state, 'facebook', 'oauthFacebook');
        } catch (e) {
            return res.status(400).send();
        }
        return res.redirect(UserController.loginUrl);
    };

    static getUsers = async (req: Request, res: Response, next: NextFunction) => {
        const users = await UserService.getAllUsers();

        if (!users)
            return res.status(400).send();
        else {
            return res.json(users)
        }
    };

    static getUser = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const user = await UserService.getUserById(id);

        if (!user)
            return res.status(400).send();
        else {
            return res.json(user)
        }
    };

    static createUser = async (req: Request, res: Response, next: NextFunction) => {
        let user = new User(req.body);
        user = await UserService.createUser(user);

        if (!user)
            return res.status(400).send();
        else {
            return res.json(user)
        }
    };

    static updateUser = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.header('Authorization');

        const user = await UserService.getUserByToken(token);
        if (!user)
            return res.status(400).send();

        const updatedUser = await UserService.updateUser(user, req.body);

        if (!updatedUser)
            return res.status(400).send();
        else {
            return res.status(204).send(updatedUser)
        }
    };

    static deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const user = await UserService.deleteUserById(id);

        if (!user)
            return res.status(400).send();
        else {
            return res.json(user)
        }
    };

    static deleteAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        const user = await UserService.deleteAllUsers();

        if (!user)
            return res.status(400).send();
        else {
            return res.json(user)
        }
    };

    static login = async (req: Request, res: Response, next: NextFunction) => {
        const email = req.body.email;

        const user = await UserService.getUserByEmail(email);
        if (!user) {
            return res.status(404).send('User not found')
        }

        if (!user.isVerifiedByMail) {
            return res.status(412).send('Please verify you account first.')
        }

        const result = await UserService.login(user, req.body);

        if (!result)
            return res.status(400).send();
        else if (result.errorMessage) {
            return res.status(400).send(result.errorMessage)
        }


        return res.json(result);
    };

    static confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.params.token;

        const result = await UserService.confirmEmail(token);

        if (!result)
            return res.status(400).send();
        else if (result.errorMessage) {
            return res.status(400).send(result.errorMessage)
        }

        return res.json(result)
    };
}