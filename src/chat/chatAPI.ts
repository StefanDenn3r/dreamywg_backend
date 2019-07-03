import * as chatController from './chatController'


export class ChatRoute {
    public static routes(app): void {
        app.route('chat/:senderUserId/:receiverUserId').get(chatController.retrieveChat);
        app.route('chat/:senderUserId/:receiverUserId/:content/:timestamp').post(chatController.storeChatUnit);
        
    }
}