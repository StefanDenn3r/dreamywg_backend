import * as bcrypt from 'bcrypt'
import {NextFunction, Request, Response} from 'express'
import * as halson from 'halson'
import * as jwt from 'jsonwebtoken'
import {default as User, IUserModel} from './user'
import {APILogger} from '../utils/logger'
import {formatOutput, formatUser} from '../utils'
import Token, {ITokenModel} from "../tokens/token";
import TokenLinkedin, {ITokenModelLinkedin} from "../tokens/tokenLinkedin";
import TokenFacebook, {ITokenModelFacebook} from "../tokens/tokenFacebook";
import * as querystring from 'query-string';
import axios from 'axios';
import {OAuth} from 'oauth';
import * as mongoose from "mongoose";

export let getUsers = async (req: Request, res: Response, next: NextFunction) => {
    let users = await User.find();

    if (!users) {
        APILogger.logger.info(`[GET] [/users] something went wrong`);
        return res.status(404).send()
    }

    return formatOutput(res, users.map(formatUser), 200, 'user')
};

export let getUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    APILogger.logger.info(`[GET] [/users] ${id}`);

    let user = await User.findById(id);
    if (!user) {
        APILogger.logger.info(`[GET] [/users/:{id}] user with id ${id} not found`);
        return res.status(404).send()
    }

    return formatOutput(res, formatUser(user), 200, 'user')
};


export let addUser = (req: Request, res: Response, next: NextFunction) => {
    const newUser = new User(req.body);
    try {
        newUser.password = bcrypt.hashSync(newUser.password, 10)
    } catch (err) {
        APILogger.logger.error(`[POST] [/users] something went wrong when saving a new user ${newUser.fullName()}  # ${err.message}`);
        next(err)
    }
    return newUser.save((error, user) => {
        if (error) {
            APILogger.logger.error(`[POST] [/users] something went wrong when saving a new user ${newUser.fullName()} | ${error.message}`);
            return res.status(500).send(error)
        }
        user = halson(user.toJSON()).addLink('self', `/users/${user._id}`);
        return formatOutput(res, user, 201, 'user')
    })
};

export let updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    APILogger.logger.info(`[PATCH] [/users] ${id}`);

    let user: IUserModel = await User.findById(id);

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

export let removeUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    APILogger.logger.warn(`[DELETE] [/users] ${id}`);

    let user = await User.findById(id);
    if (!user) {
        APILogger.logger.info(`[DELETE] [/users/:{id}] user with id ${id} not found`);
        return res.status(404).send()
    }

    return user.remove(() => res.status(204).send())
};

export let login = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.query.email;
    const password = req.query.password;

    let user = await User.findOne({email: email});
    if (!user) {
        APILogger.logger.info(`[GET] [/users/login] no user found with the email ${email}`);
        return res.status(404).send()
    }

    const validate = bcrypt.compareSync(password, user.password.valueOf());

    if (validate) {
        const body = {_id: user._id, email: user.email};

        const token = jwt.sign({user: body}, 'top_secret');

        return res.json({token: token})
    } else {
        APILogger.logger.info(`[GET] [/users/login] user not authorized ${email}`);
        return res.status(401).send()
    }
};

export let confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
    const tokenParam = req.params.token;
    let token: ITokenModel = await Token.findOne({token: tokenParam});
    if (!token) {
        return res.status(400).send("token not found");
    }

    let user: IUserModel = await User.findById(token._userId);
    if (!user) {
        return res.status(400).send("invalid token");
    }

    // maybe add check if user already verified
    user.isVerified = true;
    try {
        await user.save()
    } catch (err) {
        return res.status(500).send(err.message);
    }
    return res.status(200).send("Your account has successfully been verified.");
};
export let registerFacebook = async (req: Request, res: Response, next: NextFunction) => {
    const code = req.query.code;
    const state = req.query.state;

    try {
        handshakeFb(code, state, res);
    } catch (err) {
        APILogger.logger.error(`[POST] [/users] something went wrong # ${err.message}`);
        next(err);
        return;
    }
    //return res.status(200).send("Facebook auth ok");
    res.redirect("http://localhost:3000");

}

export let registerLinkedin = async (req: Request, res: Response, next: NextFunction) => {
    console.log("register linkedin is being called")
    const code = req.query.code;
    const state = req.query.state;

    try {
        handshake(code, state, res);
    } catch (err) {
        APILogger.logger.error(`[POST] [/users] something went wrong # ${err.message}`);
        next(err);
        return;
    }
    //return res.status(200).send("Linkedin auth ok");
    res.redirect("http://localhost:3000");
}
export let handshakeFb = async (code: string, state: string, res: Response) => {
    const redirect_uri = "https://98229c38.ngrok.io/socialmediaauth/facebook";
    const client_id = "595941830904271";
    const client_secret = "c68a35d1246498371ce21c3277753016";

    let result;
    try {
        const data = querystring.stringify({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirect_uri,//should match as in Linkedin application setup
            client_id: client_id,
            client_secret: client_secret// the secret
        });
        result = await axios.post('https://graph.facebook.com/v3.3/oauth/access_token', data)
    } catch (e) {
        console.log("problem with request: " + e.message);
        return res.status(500).send(e.message);
    }

    let data = result.data

    let access_token: ITokenModelFacebook = new TokenFacebook(data);

    await access_token.save();

    return;
};

export let handshake = async (code: string, state: string, res: Response) => {

    console.log("handshake function");
    const redirect_uri = "http://03440e01.ngrok.io/socialmediaauth/linkedin";
    const client_id = "78guq2rtxaouam";
    const client_secret = "tWZPBjm8WgX9ngaH";

    let result;
    try {
        const data = querystring.stringify({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirect_uri,//should match as in Linkedin application setup
            client_id: client_id,
            client_secret: client_secret// the secret
        });
         result = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', data)
    } catch (e) {
        console.log("problem with request: " + e.message);
        return res.status(500).send(e.message);
    }
    let data = result.data

    let access_token: ITokenModelLinkedin = new TokenLinkedin(data);

    await access_token.save();

    return;

};