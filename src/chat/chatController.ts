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
        const messageList = await MessageUnit.aggregate([{$match: {$or: [{user1: user._id.toString()}, {user2: user._id.toString()}]}}, {$sort: {"messages.timestamp": 1}}, {
            $project: {
                _messageId: 1,
                user1: 1,
                user2: 1,
                messages: {$slice: ["$messages", -1]}
            }
        }]);
        return res.json(messageList)

    } catch (err) {
        return res.status(400).send(err)

    }
};

export let retrieveChatUnit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const messageUnit = await MessageUnit.findById(req.query._id).sort({'messages.timestamp': 1});
        return res.json(messageUnit)
    } catch (err) {
        return res.status(400).send(err)
    }
};

export let storeChatoDB = async (user1: string, user2: string, senderId: string, content: string, timestamp: Date) => {
    // check message existence

    const chatUnit = await MessageUnit.findOne({$or: [{$and: [{user1: user1}, {user2: user2}]}, {$and: [{user1: user2}, {user2: user1}]}]});
    // create new random message id
    if (!chatUnit) {
        // create random message id
        await createNewChat(user1, user2, senderId, content, timestamp);
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
        console.log(e)
        return null;
    }
};

export let createNewChat = async (user1, user2, senderId, content, timestamp) => {
    const newMessage = new MessageUnit({
        user1: user1,
        user2: user2,
        messages: [{
            senderId: senderId,
            content: content,
            timestamp: timestamp
        }]
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

    const messageunit = await MessageUnit.findById(id);
    if (!messageunit) {
        APILogger.logger.info(`[DELETE] [/users/:{id}] message not found`);
        return res.status(404).send()
    }

    return messageunit.remove(() => res.status(204).send())

};

export let initChatwithAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    const currentuser = await getUserByToken(token);
    const users = await User.find();
    users.forEach(async user => {
        if (user._id.toString() !== currentuser._id.toString()) {
            console.log("creating new chat for each user");
            await createNewChat(currentuser._id, user._id, user._id, "Hey", Date.now()); // create new chat except for self
        }
    });
    return;
};

export let removeAllChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await MessageUnit.remove({});
        return res.status(204).send()
    } catch (e) {
        return res.status(400).send(e)
    }
};