import {Document, Model, model, Schema} from "mongoose";

export interface ITokenFacebook {
    access_token?: string;
    token_type?: string;
    expires_in?: Date;
}

export interface ITokenModelFacebook extends ITokenFacebook, Document {

}

export var tokenSchema: Schema = new Schema({
    access_token: {type: String, required: true},
    token_type: {type: String, required: true},
    expires_in: {type: Date, required: true, default: Date.now, expires: 43200}
}, {versionKey: false});


const TokenFacebook: Model<ITokenModelFacebook> = model<ITokenModelFacebook>("TokenFacebook", tokenSchema);
export default TokenFacebook