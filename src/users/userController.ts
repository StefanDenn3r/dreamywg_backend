import * as bcrypt from 'bcrypt'
import {NextFunction, Request, Response} from 'express'
import * as halson from 'halson'
import * as jwt from 'jsonwebtoken'
import {default as User} from './user'
import {OrderAPILogger} from '../utils/logger'
import {formatOutput, formatUser} from '../utils'

export let getUsers = async (req: Request, res: Response, next: NextFunction) => {
    let users = await User.find();

    if (!users) {
        OrderAPILogger.logger.info(`[GET] [/users] something went wrong`);
        return res.status(404).send()
    }

    return formatOutput(res, users.map(formatUser), 200, 'user')
};

export let getUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    OrderAPILogger.logger.info(`[GET] [/users] ${id}`);

    let user = await User.findById(id);
    if (!user) {
        OrderAPILogger.logger.info(`[GET] [/users/:{id}] user with id ${id} not found`);
        return res.status(404).send()
    }

    return formatOutput(res, formatUser(user), 200, 'user')
};


export let addUser = (req: Request, res: Response, next: NextFunction) => {
    const newUser = new User(req.body);
    try {
        newUser.password = bcrypt.hashSync(newUser.password, 10)
    } catch (err) {
        OrderAPILogger.logger.error(`[POST] [/users] something went wrong when saving a new user ${newUser.fullName()}  # ${err.message}`);
        next(err)
    }
    return newUser.save((error, user) => {
        if (error) {
            OrderAPILogger.logger.error(`[POST] [/users] something went wrong when saving a new user ${newUser.fullName()} | ${error.message}`);
            return res.status(500).send(error)
        }
        user = halson(user.toJSON()).addLink('self', `/users/${user._id}`);
        return formatOutput(res, user, 201, 'user')
    })
};

export let updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    OrderAPILogger.logger.info(`[PATCH] [/users] ${id}`);

    let user = await User.findById(id);

    if (!user) {
        OrderAPILogger.logger.info(`[PATCH] [/users/:{id}] user with id ${id} not found`);
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

    OrderAPILogger.logger.warn(`[DELETE] [/users] ${id}`);

    let user = await User.findById(id);
    if (!user) {
        OrderAPILogger.logger.info(`[DELETE] [/users/:{id}] user with id ${id} not found`);
        return res.status(404).send()
    }

    return user.remove(() => res.status(204).send())
};

export let login = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.query.email;
    const password = req.query.password;

    let user = await User.findOne({email: email});
    if (!user) {
        OrderAPILogger.logger.info(`[GET] [/users/login] no user found with the email ${email}`);
        return res.status(404).send()
    }

    const validate = bcrypt.compareSync(password, user.password.valueOf());

    if (validate) {
        const body = {_id: user._id, email: user.email};

        const token = jwt.sign({user: body}, 'top_secret');

        return res.json({token: token})
    } else {
        OrderAPILogger.logger.info(`[GET] [/users/login] user not authorized ${email}`);
        return res.status(401).send()
    }
};
