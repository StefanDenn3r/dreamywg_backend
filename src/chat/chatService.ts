import {getUserByToken} from "../users/userService";
import MessageUnit from "./messageUnit";
import {APILogger} from "../utils/logger";

export const retrieveChatlist = async (token) => {
    const user = await getUserByToken(token);
    const messageList = await MessageUnit.find({$or: [{'user1.id': user._id.toString()}, {'user2.id': user._id.toString()}]}).sort({"messages.timestamp": 1});

    if (!messageList)
        return null;

    const chats = {};
    messageList.forEach(element => {
        const receiverId = (element.user1.id === user._id.toString()) ? element.user2.id : element.user1.id;
        chats[receiverId] = element;
    });
    return chats;
};

export let getChatUnit = async (user1, user2) => {
    try {
        return await MessageUnit.findOne({$or: [{$and: [{'user1.id': user1.id}, {'user2.id': user2.id}]}, {$and: [{'user1.id': user2.id}, {'user2.id': user1.id}]}]})
    } catch (e) {
        console.log(e);
        return null;
    }
}

export let updateChatUnit = async (user1, user2, senderId, content, timestamp: Date) => {
    try {
        await MessageUnit.update({$or: [{$and: [{'user1.id': user1.id}, {'user2.id': user2.id}]}, {$and: [{'user1.id': user2.id}, {'user2.id': user1.id}]}]}, {
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
    const newMessageUnit = new MessageUnit({
        user1: user1,
        user2: user2,
        messages: []
    });

    try {
        await newMessageUnit.save();
    } catch (err) {
        APILogger.logger.error(`[POST] [/users] something went wrong when saving a new message # ${err.message}`);
    }
};

