import {Document, Model, model, Schema} from "mongoose";

interface MessageUnit{
    senderId?: string;
    receiverId?: string;
    content?: string;
    timestamp?: Date;
}

export interface MessageUnitModel extends MessageUnit, Document {

}

export var messageUnitSchema: Schema = new Schema({
    senderId: {type: String, required: true},
    receiverId: {type: String, required: true},
    content: {type:String, required: true},
    timestamp: {type: Date, required: true}
}, {versionKey: false});


const MessageUnit: Model<MessageUnitModel> = model<MessageUnitModel>("MessageUnit", messageUnitSchema);

export default MessageUnit

