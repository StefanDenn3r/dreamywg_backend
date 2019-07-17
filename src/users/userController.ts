import axios from 'axios';
import * as bcrypt from 'bcrypt'
import * as config from 'config'
import {NextFunction, Request, Response} from 'express'
import * as halson from 'halson'
import * as jwt from 'jsonwebtoken'
import * as querystring from 'querystring';
import Token, {ITokenModel} from "../tokens/token";
import {formatOutput, formatUser} from '../utils'
import {APILogger} from '../utils/logger'
import {IUserModel, User} from './user'
import {getUserByToken, sendVerificationMail} from './userService'

const serverUrl = `http://${config.get('host')}:${config.get('port')}`;

// TODO add try catch to every await
export let getUsers = async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();

    if (!users) {
        APILogger.logger.info(`[GET] [/users] something went wrong`);
        return res.status(404).send()
    }

    return formatOutput(res, users.map(formatUser), 200, 'user')
};

export let getUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    APILogger.logger.info(`[GET] [/users] ${id}`);

    const user = await User.findById(id);
    if (!user) {
        APILogger.logger.info(`[GET] [/users/:{id}] user with id ${id} not found`);
        return res.status(404).send()
    }

    return formatOutput(res, formatUser(user), 200, 'user')
};


export let addUser = async (req: Request, res: Response, next: NextFunction) => {
    const newUser = new User(req.body);
    try {
        newUser.password = bcrypt.hashSync(newUser.password, 10)
    } catch (err) {
        APILogger.logger.error(`[POST] [/users] something went wrong when saving a new user ${newUser.fullName()}  # ${err.message}`);
        next(err)
    }
    return newUser.save(async (error, user) => {
        if (error) {
            APILogger.logger.error(`[POST] [/users] something went wrong when saving a new user ${newUser.fullName()} | ${error.message}`);
            return res.status(500).send(error)
        }
        user = halson(user.toJSON()).addLink('self', `/users/${user._id}`);
        await sendVerificationMail(user);
        return formatOutput(res, user, 200, 'user')
    })
};

export let updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    const id = token
    APILogger.logger.info(`[PATCH] [/users] ${id}`);

    const user: IUserModel = await User.findOne({jwt_token: token});

    if (!user) {
        APILogger.logger.info(`[PATCH] [/users/:{id}] user with id ${id} not found`);
        return res.status(404).send()
    }
    
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.password = req.body.password || user.password;

    return user.save(() => res.status(204).send())
};

export let deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    APILogger.logger.warn(`[DELETE] [/users] ${id}`);

    await User.findByIdAndDelete(id);

    return res.status(204).send()
};

export let deleteAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    APILogger.logger.warn(`[DELETE] [/users]`);

    await User.remove({})

    return res.status(204).send();
};

export let login = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email;
    const password = req.body.password;
    let user;

    user = await User.findOne({email: email});
    if (!user) {
        APILogger.logger.info(`[GET] [/users/login] no user found with the email ${email}`);
        return res.status(404).send('User not found')
    }

    if (!user.isVerifiedByMail) {
        return res.status(412).send('Please verify you account first.')
    }

    const validate = bcrypt.compareSync(password, user.password.valueOf());

    if (validate) {
        const body = {_id: user._id, email: user.email};

        const token = jwt.sign({user: body}, 'top_secret');
        user.jwt_token = token;
        try {
            await user.save()
        } catch (err) {
            return res.status(500).send(err.message);
        }
        return res.json({
            user: user,
            token: token
        })
    } else {
        APILogger.logger.info(`[GET] [/users/login] user not authorized ${email}`);
        return res.status(401).send('Username and/or password don\'t match.')
    }
};

export let confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
    const tokenParam = req.params.token;
    const token: ITokenModel = await Token.findOne({token: tokenParam});
    if (!token) {
        return res.status(400).send("token not found");
    }

    const user: IUserModel = await User.findById(token._userId);
    if (!user) {
        return res.status(400).send("invalid token");
    }

    // maybe add check if user already verified
    user.isVerifiedByMail = true;
    try {
        await user.save()
    } catch (err) {
        return res.status(500).send(err.message);
    }
    return res.status(200).send("Your account has successfully been verified.");
};


export let getUserId = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    const currentuser = await getUserByToken(token);
    if (currentuser) {
        return res.status(200).send(currentuser._id);
    } else {
        console.log("data not found");
        return res.status(400).send('User not found')
    }

};


export let oAuthLinkedIn = async (req: Request, res: Response, next: NextFunction) => {
    const code = req.query.code;
    const state = req.query.state;

    if (code && state) {
        try {
            const redirectUrl = `${serverUrl}/users/oauthLinkedin`;
            const clientId = config.get('linkedIn.clientId');
            const clientSecret = config.get('linkedIn.clientSecret');
            const data = querystring.stringify({
                grant_type: "authorization_code",
                code: code,
                state: state,
                redirect_uri: redirectUrl,
                client_id: clientId,
                client_secret: clientSecret
            });
            const linkedInURL = 'https://www.linkedin.com/oauth/v2/accessToken';
            const result = await axios.post(linkedInURL, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            const user = await User.findById(state);
            user.isVerifiedBySocialMedia = true;
            user.accessTokenLinkedIn = result.data.access_token;
            await user.save();
            return res.redirect(`http://${config.get('host')}:${config.get('frontend_port')}/login`);

        } catch (e) {
            console.log(e)
        }
    }
};

export let oAuthFacebook = async (req: Request, res: Response, next: NextFunction) => {
    const code = req.query.code;
    const state = req.query.state;

    if (code && state) {
        try {
            const redirectUrl = `${serverUrl}/users/oauthFacebook`;
            const clientId = config.get('facebook.clientId');
            const clientSecret = config.get('facebook.clientSecret');
            const data = {
                grant_type: "authorization_code",
                code: code,
                state: state,
                redirect_uri: redirectUrl,
                client_id: clientId,
                client_secret: clientSecret
            };
            const facebookUrl = 'https://graph.facebook.com/v3.3/oauth/access_token';
            const result = await axios.post(facebookUrl, data);

            const user = await User.findById(state);
            user.isVerifiedBySocialMedia = true;
            user.accessTokenFacebook = result.data.access_token;
            await user.save();
            return res.redirect(`http://${config.get('host')}:${config.get('frontend_port')}/login`);

        } catch (e) {

        }
    }
    return res.status(400).send();
};