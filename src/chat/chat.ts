import {Document, Model, model, models, Schema} from "mongoose";

interface IChat {
    user1: {
        id: string
        fullName: string
    },
    user2: {
        id: string
        fullName: string
    }
    messages: {
        senderId?: string,
        content?: string,
        timestamp?: Date
    }[]

}

export interface IChatModel extends IChat, Document {

}

export const ChatSchema: Schema = new Schema({
    user1: {
        id: {type: String, required: true},
        fullName: {type: String, required: true}
    },
    user2: {
        id: {type: String, required: true},
        fullName: {type: String, required: true}
    },
    messages: [{
        senderId: {type: String, required: true},
        content: {type: String, required: true},
        timestamp: {type: Date, required: true}
    }]
}, {versionKey: false});

export const Chat: Model<IChatModel> = models.Chat || model<IChatModel>("Chat", ChatSchema);

