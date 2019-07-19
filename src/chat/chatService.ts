import {UserService} from "../users/userService";
import {Logger} from "../utils/logger";
import {Chat} from "./chat";
import {FlatOffererService} from "../flatOfferer/flatOffererService";
import {createNewChat} from "../../dist/chat/chatController";

export class ChatService {
    static retrieveChatList = async (token) => {
        const user = await UserService.getUserByToken(token);

        if (!user)
            return null;

        try {
            const messageList = await Chat.find({$or: [{'user1.id': user._id.toString()}, {'user2.id': user._id.toString()}]}).sort({"messages.timestamp": 1});
            const chats = {};
            messageList.forEach(element => {
                const receiverId = (element.user1.id === user._id.toString()) ? element.user2.id : element.user1.id;
                chats[receiverId] = element;
            });
            return chats;
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    };

    static getChat = async (user1, user2) => {
        try {
            return await Chat.findOne({$or: [{$and: [{'user1.id': user1.id}, {'user2.id': user2.id}]}, {$and: [{'user1.id': user2.id}, {'user2.id': user1.id}]}]})
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    };

    static updateChatUnit = async (user1, user2, senderId, content, timestamp: Date) => {
        try {
            await Chat.update({$or: [{$and: [{'user1.id': user1.id}, {'user2.id': user2.id}]}, {$and: [{'user1.id': user2.id}, {'user2.id': user1.id}]}]}, {
                $push: {
                    messages: {
                        senderId: senderId,
                        content: content,
                        timestamp: timestamp
                    }
                }
            });
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    };

    static async deleteAllChats() {
        try {
            return await Chat.deleteMany({});
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }


    static createChatByTokenAndFlatId = async (token, flatId) => {
        let currentUser = await UserService.getUserByToken(token);
        const flatOfferer = await FlatOffererService.getFlatOffererByFlatId(flatId);

        if (!currentUser || !flatOfferer)
            return null;
        const currentMessageUser = ChatService.convertToMessageUser(currentUser);
        const targetMessageUser = ChatService.convertToMessageUser(flatOfferer.user);

        const chat = await ChatService.getChat(currentMessageUser, targetMessageUser);

        if (!chat)
            await createNewChat(currentMessageUser, targetMessageUser);

        const chats = await ChatService.retrieveChatList(token);

        return {
            chats: chats,
            userId: targetMessageUser.id
        }
    };

    static convertToMessageUser = (user) => {
        return {
            id: user.id,
            fullName: user.fullName()
        }
    };

    private static createChat = async (user1, user2) => {
        const Chat = new Chat({
            user1: user1,
            user2: user2,
            messages: []
        });

        try {
            await Chat.save();
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    };
}