import {ObjectId} from "bson";
import {NextFunction, Request, Response} from "express";
import * as mongoose from "mongoose";
import {Schema} from "mongoose";
import {getUserByToken} from "../users/userController";
import {formatOutput} from "../utils";
import {APILogger} from "../utils/logger";
import MessageUnit, {MessageUnitModel} from "./messageUnit";
import {IUserModel, User} from '../users/user'


export let retrieveChatList = async (req:Request, res: Response, next: NextFunction) => {
    console.log("calling retrieve chat list backend")
    let token = req.header('Authorization');
    const user = await getUserByToken(token);
    let messageList = await MessageUnit.aggregate([{$match: { $or: [{user1: user._id.toString()}, {user2: user._id.toString()}]}},{ $sort : { "messages.timestamp": 1} }, {$project: {_messageId:1, user1:1, user2:1, messages: {$slice:["$messages", -1]}}}], (err, data) => {
        if (data) {
            //res.status(400).send(err)
            console.log(JSON.stringify(data))
            return formatOutput(res, data, 200, "chatlist");
        } else {
            return res.status(400).send(err)
        }
    });
};

export let retrieveChatUnit = async (req:Request, res: Response, next: NextFunction) => {
    const messageid = req.query._id;
    let messageUnit = await MessageUnit.aggregate([{$match:{_id: new ObjectId(messageid)}}, { $sort : { "messages.timestamp": 1} }, {$project: {_messageId:1, user1:1, user2:1, messages: 1}}], (err, data) => {
        if (data) {
            //res.status(400).send(err)
            console.log(data)
            return formatOutput(res, data, 200, "chatunit");
        } else {
            console.log("data not found");
            return res.status(400).send(err)
        }
    });
};

export let storeChattoDB = async (user1: string, user2: string, content: string, timestamp: Date) => {
    //check message existence

    let chatUnit = await MessageUnit.findOne({ $or: [{$and:  [{user1: user1}, {user2: user2}]}, {$and:  [{user1: user2}, {user2: user1}]}]});
    //create new random message id
    if (!chatUnit) {
        //create random message id
        createNewChat(user1, user2, content, timestamp);
    }else{
        updateChat(chatUnit._id, content, timestamp);
    }
};

export let updateChat = async(messageId, content, timestamp) => {
    const id = messageId;

    let message: MessageUnitModel = await MessageUnit.findById(id);

    if (!message) {
        APILogger.logger.info(`message not found`);
    }
    message.update({_id: messageId}, {$push: {messages: {content: content, timestamp: timestamp }}});

};

export let createNewChat = async (user1, user2, content, timestamp) => {
    let newMessage = new MessageUnit({
        user1: user1,
        user2: user2,
        messages: [{
            content: content,
            timestamp: timestamp
        }]
    });

    try {
        await newMessage.save().catch(console.error);
    } catch (err) {
        APILogger.logger.error(`[POST] [/users] something went wrong when saving a new message # ${err.message}`);
    }
};

export let deleteChat = async (req:Request, res: Response, next: NextFunction) => {
    const id = req.query._id;

    APILogger.logger.warn(`[DELETE] [/users] ${id}`);

    let messageunit = await MessageUnit.findById(id);
    if (!messageunit) {
        APILogger.logger.info(`[DELETE] [/users/:{id}] message not found`);
        return res.status(404).send()
    }

    return messageunit.remove(() => res.status(204).send())

};

export let initChatwithAllUsers = async (req:Request, res:Response, next: NextFunction) => {
    let token = req.header('Authorization');
    const currentuser = await getUserByToken(token);
    let users = await User.find();
    await users.forEach(function(user){
        if(user._id !== currentuser._id){
            console.log("creating new chat for each user");
            createNewChat(currentuser._id, user._id, "Hey", Date.now()); //create new chat except for self
        }
    });
    return;
};

export let removeAllChat = async (req:Request, res:Response, next: NextFunction) => {
    let chats = await MessageUnit.remove({});
}