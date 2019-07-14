import * as bcrypt from 'bcrypt'
import {NextFunction, Request, Response} from 'express'
import * as halson from 'halson'
import * as jwt from 'jsonwebtoken'
import {IUserModel, User} from './user'
import {APILogger} from '../utils/logger'
import {formatOutput, formatUser} from '../utils'
import Token, {ITokenModel} from "../tokens/token";
import {sendVerificationMail} from './userService'
import * as querystring from 'query-string';
import { request } from 'http';
import {OAuth} from 'oauth'

//TODO add try catch to every await
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

export let getUserByToken = async (token: String) => {
    let user: IUserModel = await User.findOne({jwt_token: token});
    return user
}

export let updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    const id = token
    APILogger.logger.info(`[PATCH] [/users] ${id}`);

    let user: IUserModel = await User.findOne({jwt_token: token});

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

export let removeAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    APILogger.logger.warn(`[DELETE] [/users]`);

    let users = await User.find();
    await users.forEach(async (user) => await user.remove());

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

    if (!user.isVerified) {
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
        return res.json({token: token})
    } else {
        APILogger.logger.info(`[GET] [/users/login] user not authorized ${email}`);
        return res.status(401).send('Username and/or password don\'t match.')
    }
};

export let confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
    const tokenParam = req.params.token;
    let token: ITokenModel = await Token.findOne({token: tokenParam});
    if (!token) return res.status(400).send("token not found");

    let user: IUserModel = await User.findById(token._userId);
    if (!user) return res.status(400).send("invalid token");

    // maybe add check if user already verified
    user.isVerified = true;
    try {
        await user.save()
    } catch (err) {
        return res.status(500).send(err.message);
    }
    return res.status(200).send("Your account has successfully been verified.");
};
export let registerFacebook = async(req: Request, res: Response, next: NextFunction) => {
    const code = req.query.code;
    const state = req.query.state;

    try {
        handshakeFb(code, state, res);
    } catch (err) {
        APILogger.logger.error(`[POST] [/users] something went wrong # ${err.message}`);
        next(err)
    }
    return res.status(200).send("Linkedin auth ok");

}


export let registerLinkedin = async(req: Request, res: Response, next: NextFunction) => {
    console.log("register linkedin is being called")
    const code = req.query.code;
    const state = req.query.state;

    try {
        handshake(code, state, res);
    } catch (err) {
        APILogger.logger.error(`[POST] [/users] something went wrong # ${err.message}`);
        next(err)
    }
    return res.status(200).send("Linkedin auth ok");
}
export let handshakeFb = (code: string, state: string, res: Response) => {

};
export let handshake = (code: string, state: string, res: Response) => {
    console.log("handshake function");
    const redirect_uri = "http://localhost:4005/socialmediaauth/linkedin";
    const client_id = "78guq2rtxaouam";
    const client_secret = "tWZPBjm8WgX9ngaH";

    const data = querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri,//should match as in Linkedin application setup
        client_id: client_id,
        client_secret: client_secret// the secret
    });

      const req = request(
      {
        host: 'www.linkedin.com',
        path: '/oauth/v2/accessToken',
        protocol: 'https:',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data)
        }
      },
      response => {
        var data = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('error', (e) => {
            console.log("problem with request: " + e.message);
            res.status(500).send(e.message);
        });
        response.on('end', () => {
          //const result = Buffer.concat(chunks).toString();
          console.log(JSON.parse(data));
          //return result;
        });
      }
    );
    req.write(data);
    req.end();
    res.status(200).send("Linkedin auth ok");
};