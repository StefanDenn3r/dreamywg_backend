import {Document, Model, model, Schema} from "mongoose";

interface MessageUnit{
    _messageId?: Schema.Types.ObjectId;
    user1?: string;
    user2?: string;
    messages?: [{
        content?: string,
        timestamp?: Date
    }]

}

export interface MessageUnitModel extends MessageUnit, Document {

}

export var messageUnitSchema: Schema = new Schema({
    _messageId: {type: Schema.Types.ObjectId, required: true, ref: 'MessageUnit'},
    user1: {type: String, required: true},
    user2: {type: String, required: true},
    messages : [{
        content: {type:String, required: true},
        timestamp: {type: Date, required: true}
    }]
}, {versionKey: false});


const MessageUnit: Model<MessageUnitModel> = model<MessageUnitModel>("MessageUnit", messageUnitSchema);

export default MessageUnit

