import {NextFunction, Request, Response} from "express";
import {User} from "../users/user";
import {formatOutput} from "../utils";
import {APILogger} from "../utils/logger";
import MessageUnit, {MessageUnitModel} from "./messageUnit";
import { ObjectId } from "bson";

export let retrieveChatList = async (req:Request, res: Response, next: NextFunction) => {
    console.log("calling retrieve chat list backend")
    const userId = req.query.userId;
    console.log("userid", userId);
    let messageList = await MessageUnit.aggregate([{$match: { $or: [{user1: userId}, {user2: userId}]}},{ $sort : { "messages.timestamp": 1} }, {$project: {_messageId:1, user1:1, user2:1, messages: {$slice:["$messages", -1]}}}], (err, data) => {
        if (data) {
            //res.status(400).send(err)
            console.log(data)
            return formatOutput(res, data, 201, 'chatlist')
        } else {
            console.log("data not found");
            return res.status(400).send(err)
        }
    });
    //return formatOutput(res, messageList, 201, 'chatlist')

};

export let retrieveChatUnit = async (req:Request, res: Response, next: NextFunction) => {
    const user1 = req.params.user1;
    const user2 = req.params.user2;
    let messageUnit = await MessageUnit.aggregate([{$match:{ $or: [{$and:  [{user1: user1}, {user2: user2}]}, {$and:  [{user1: user2}, {user2: user1}]}]}}, { $sort : { "messages.timestamp": 1} }, {$project: {_messageId:1, user1:1, user2:1, messages: 1}}], (err, data) => {
        if (messageUnit) {
            //res.status(400).send(err)
            console.log(messageUnit)
        } else {
            //do sort based on timestamp and show to frontend the most recent message text
            //
            console.log("data not found");
        }
    });
    return formatOutput(res, messageUnit, 201, 'chatunit')
};

export let storeChattoDB = async (user1: string, user2: string, content: string, timestamp: Date) => {
    //check message existence

    console.log("storing chat to db", user1, user2, content, timestamp);
    let chatUnit = await MessageUnit.findOne({ $or: [{$and:  [{user1: user1}, {user2: user2}]}, {$and:  [{user1: user2}, {user2: user1}]}]});
    //create new random message id
    console.log(chatUnit)
    if (!chatUnit) {
        //create random message id
        console.log("create new chat");
        let messageId = new ObjectId();
        createNewChat(messageId, user1, user2, content, timestamp);
    }else{
        console.log("update chat1");
        let messageId = chatUnit._id;
        console.log("messageid", messageId)
        updateChat(messageId, user1, user2, content, timestamp);
    }
};

export let updateChat = async(messageId, user1, user2, content, timestamp) => {
    console.log("update chat2")
    const id = messageId;
    console.log("id", id)
    let message: MessageUnitModel = await MessageUnit.findById(id);

    if (!message) {
        APILogger.logger.info(`message not found`);
    }
    message.update({_messageId: messageId}, {$push: {messages: {content: content, timestamp: timestamp }}});

};

export let createNewChat = async (messageId, user1, user2, content, timestamp) => {
    let newMessage = new MessageUnit({
        _messageId: messageId,
        user1: user1,
        user2: user2,
        content: content,
        timestamp: timestamp
    });

    try {
        await newMessage.save().catch(console.error);
    } catch (err) {
        APILogger.logger.error(`[POST] [/users] something went wrong when saving a new message # ${err.message}`);
        //next(err)
    }
};

export let deleteChat = async (req:Request, res: Response, next: NextFunction) => {
    const id = req.query.id;

    APILogger.logger.warn(`[DELETE] [/users] ${id}`);

    let messageunit = await MessageUnit.findById(id);
    if (!messageunit) {
        APILogger.logger.info(`[DELETE] [/users/:{id}] message not found`);
        return res.status(404).send()
    }

    return messageunit.remove(() => res.status(204).send())

};