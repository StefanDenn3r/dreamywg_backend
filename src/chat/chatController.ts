import {NextFunction, Request, Response} from "express";
import {User} from '../users/user'
import {getUserByToken} from "../users/userController";
import {APILogger} from "../utils/logger";
import MessageUnit from "./messageUnit";


export let retrieveChatList = async (req: Request, res: Response, next: NextFunction) => {
    console.log("calling retrieve chat list backend");
    const token = req.header('Authorization');
    const user = await getUserByToken(token);
    try {
        const messageList = await MessageUnit.find({$or: [{'user1.id': user._id.toString()}, {'user2.id': user._id.toString()}]}).sort({"messages.timestamp": 1});

        const chats = new Map();
        messageList.forEach(element => {
            const receiverId = (element.user1.id === user._id.toString()) ? element.user2.id : element.user1.id;
            chats[receiverId] = element;
            return res
        });

        return res.json(chats)
    } catch (err) {
        return res.status(400).send(err)
    }
};

export let storeChatToDB = async (user1, user2, senderId, content, timestamp: Date) => {
    const chatUnit = await MessageUnit.findOne({$or: [{$and: [{'user1.id': user1.id}, {'user2.id': user2.id}]}, {$and: [{'user1.id': user2.id}, {'user2.id': user1.id}]}]});
    if (!chatUnit) { // todo: maybbe to delete
        // create random message id
        await createNewChat(user1, user2);
    } else {
        await updateChat(chatUnit._id, senderId, content, timestamp);
    }
};

export let updateChat = async (messageId, senderId, content, timestamp) => {
    try {
        await MessageUnit.update({_id: messageId}, {
            $push: {
                messages: {
                    senderId: senderId,
                    content: content,
                    timestamp: timestamp
                }
            }
        });
    } catch (e) {
        console.log(e);
        return null;
    }
};

export let createNewChat = async (user1, user2) => {
    const newMessage = new MessageUnit({
        user1: user1,
        user2: user2,
        messages: []
    });

    try {
        await newMessage.save()
    } catch (err) {
        APILogger.logger.error(`[POST] [/users] something went wrong when saving a new message # ${err.message}`);
    }
};

export let deleteChat = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.query._id;

    APILogger.logger.warn(`[DELETE] [/users] ${id}`);

    await MessageUnit.findByIdAndDelete(id);

    return res.status(204).send()

};

export let initChatWithAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    const currentuser = await getUserByToken(token);
    const users = await User.find();
    users.forEach(async user => {
        if (user._id.toString() !== currentuser._id.toString()) {
            await createNewChat(convertToMessageUser(currentuser), convertToMessageUser(user));
        }
    });
    return res.status(200).send();
};

const convertToMessageUser = (user) => {
    return {
        id: user.id,
        fullName: user.fullName()
    }
};

export let removeAllChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await MessageUnit.remove({});
        return res.status(204).send()
    } catch (e) {
        return res.status(400).send(e)
    }
};