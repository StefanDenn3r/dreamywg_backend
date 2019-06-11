import {Document, Model, model, Schema} from "mongoose";


interface IToken {
    _userId?: Schema.Types.ObjectId;
    token?: string;
    createdAt?: string;
}

export interface ITokenModel extends IToken, Document {
}

export var tokenSchema: Schema = new Schema({
    _userId: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    token: {type: String, required: true},
    createdAt: {type: Date, required: true, default: Date.now, expires: 43200}
}, {versionKey: false});


const Token: Model<ITokenModel> = model<ITokenModel>("Token", tokenSchema);
export default Token

