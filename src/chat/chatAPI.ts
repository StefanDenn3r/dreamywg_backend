import * as chatController from './chatController'


export class ChatRoute {
    public static routes(app): void {
        app.route('retrieveChat/:senderUserId/:receiverUserId').get(chatController.retrieveChat);
        //app.route('storeChat/:senderUserId/:receiverUserId/:content/:timestamp').post(chatController.pushChat);

    }
}