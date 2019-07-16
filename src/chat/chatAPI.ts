import * as chatController from './chatController'


export class ChatRoute {
    public static routes(app): void {
        app.route('/chat').get(chatController.retrieveChatList);
        // app.route('/chatunit').get(chatController.retrieveChatUnit);
        app.route('/chatunit').delete(chatController.deleteChat);
        app.route('/initchat').post(chatController.initChatWithAllUsers);
        app.route('/chat').delete(chatController.removeAllChat);
    }
}