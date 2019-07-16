import {Document, Model, model, Schema} from "mongoose";

interface MessageUnit {
    user1: {
        id: string
        fullName: string
    },
    user2: {
        id: string
        fullName: string
    }
    messages?: [{
        senderId?: string,
        content?: string,
        timestamp?: Date
    }]

}

export interface MessageUnitModel extends MessageUnit, Document {

}

export const messageUnitSchema: Schema = new Schema({
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


const MessageUnit: Model<MessageUnitModel> = model<MessageUnitModel>("MessageUnit", messageUnitSchema);

export default MessageUnit

