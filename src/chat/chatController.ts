import {NextFunction, Request, Response} from "express";
import {User} from '../users/user'
import {getUserByToken} from "../users/userService";
import {APILogger} from "../utils/logger";
import MessageUnit from "./messageUnit";
import {getFlatOffererByFlatId} from "../flatOfferer/flatService";
import {createNewChat, getChatUnit, retrieveChatlist} from "./chatService";


export let createChat = async (req: Request, res: Response, next: NextFunction) => {
    const flatId = req.params.id;
    const token = req.header('Authorization');

    try {
        const currentUser = convertToMessageUser(await getUserByToken(token));
        const flatOfferer = await getFlatOffererByFlatId(flatId);
        const targetUser = convertToMessageUser(flatOfferer.user);

        const chatUnit = await getChatUnit(currentUser, targetUser);

        if (!chatUnit)
            await createNewChat(currentUser, targetUser);

        const chats = await retrieveChatlist(token);

        return res.status(200).send({
                chats: chats,
                userId: targetUser.id
            }
        );
    } catch (err) {
        return res.status(400).send(err)
    }
};


export let retrieveChatList = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');

    try {
        const chats = await retrieveChatlist(token);
        return res.json(chats)
    } catch (err) {
        return res.status(400).send(err)
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