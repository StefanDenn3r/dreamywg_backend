import {ChatController} from "./chatController";

export class ChatRoute {
    public static routes(app): void {
        app.route('/chat/flat/:id').post(ChatController.createChat);
        app.route('/chat').get(ChatController.retrieveChatList);
        app.route('/chat').delete(ChatController.removeAllChat);
    }
}