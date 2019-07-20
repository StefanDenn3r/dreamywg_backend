import {NextFunction, Request, Response} from "express";
import {ChatService} from "./chatService";

export class ChatController {

    static createChat = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.header('Authorization');
        const flatId = req.params.id;

        const chats = await ChatService.createChatByTokenAndFlatId(token, flatId);

        if (!chats)
            return res.status(400).send();
        else
            return res.json(chats)

    };

    static retrieveChatList = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.header('Authorization');

        const chats = await ChatService.retrieveChatList(token);
        if (!chats)
            return res.status(400).send();
        else
            return res.json(chats)

    };

    static removeAllChat = async (req: Request, res: Response, next: NextFunction) => {
        const chats = await ChatService.deleteAllChats();

        if (!chats)
            return res.status(400).send();
        else
            return res.json(chats)

    };
}