import {NextFunction, Request, Response} from "express";
import MessageUnit from "./messageUnit";
import {formatOutput, formatUser} from "../utils";
import {APILogger} from "../utils/logger";
import {MessageUnitModel} from "./messageUnit";

export let retrieveChat = async (req:Request, res: Response, next: NextFunction) => {
    const senderUserIdParam = req.params.senderUserId;
    const receiverUserIdParam = req.params.receiverUserId;

    let messageUnit: MessageUnitModel = await MessageUnit.findOne({senderId: senderUserIdParam,  receiverId: receiverUserIdParam} , (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            console.log(data);
        }
    });

    //if(!messageUnit) return res.status(400).send("data not found");

    //return formatOutput(res, formatUser(user), 200, 'user');
};

export let pushChat = async (req:Request, res: Response, next: NextFunction) => {
    const newMessage = new Message(req.body);
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