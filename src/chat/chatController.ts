import {NextFunction, Request, Response} from "express";

import {APILogger} from "../utils/logger";
import MessageUnit, {MessageUnitModel} from "./messageUnit";
import { ObjectId } from "bson";

export let retrieveChatList = async (req:Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    let messageList = await MessageUnit.aggregate([{ $or: [{user1: userId}, {user2: userId}]},{ $sort : { "messages.timestamp": 1} }, {$project: {_messageId:1, user1:1, user2:1, messages: {$slice:-1}}}, (err, data) => {
        if (messageList) {
            //res.status(400).send(err)
            console.log(messageList)
        } else {
            //do sort based on timestamp and show to frontend the most recent message text
            //
            console.log("data not found");
        }
    }]);

    //if(!messag) return res.status(400).send("data not found");

    //return formatOutput(res, formatUser(user), 200, 'user');
};

export let retrieveChatUnit = async (req:Request, res: Response, next: NextFunction) => {
    const user1 = req.params.user1;
    const user2 = req.params.user2;
    let messageList = await MessageUnit.aggregate([{ $or: [{$and:  [{user1: user1}, {user2: user2}]}, {$and:  [{user1: user2}, {user2: user1}]}]},{ $sort : { "messages.timestamp": 1} }, {$project: {_messageId:1, user1:1, user2:1, messages: 1}}, (err, data) => {
        if (messageList) {
            //res.status(400).send(err)
            console.log(messageList)
        } else {
            //do sort based on timestamp and show to frontend the most recent message text
            //
            console.log("data not found");
        }
    }]);

};

export let storeChattoDB = async (user1: string, user2: string, content: string, timestamp: Date) => {
    //check message existence
    let chatUnit = await MessageUnit.findOne({ $or: [{$and:  [{user1: user1}, {user2: user2}]}, {$and:  [{user1: user2}, {user2: user1}]}]});
    //create new random message id
    if (!chatUnit) {
        //create random message id
        let messageId = new ObjectId();
        createNewChat(messageId, user1, user2, content, timestamp);
    }else{
        let messageId = chatUnit._messageId;
        updateChat(messageId, user1, user2, content, timestamp);
    }
};

export let updateChat = async(messageId, user1, user2, content, timestamp) => {
    const id = messageId;

    let message: MessageUnitModel = await MessageUnit.findById(id);

    if (!message) {
        APILogger.logger.info(`message not found`);
    }
    message.update({_messageId: messageId}, {$push: {messages: {content: content, timestamp: timestamp }}});

};

export let createNewChat = async (messageId, senderId, receiverId, content, timestamp) => {
    let newMessage = new MessageUnit({
        _messageId: messageId,
        senderId: senderId,
        receiverId: receiverId,
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