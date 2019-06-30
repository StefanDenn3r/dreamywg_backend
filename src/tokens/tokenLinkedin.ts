import {Document, Model, model, Schema} from "mongoose";


interface ITokenLinkedin {
    access_token?: string;
    expires_in?: Date;
}

export interface ITokenModelLinkedin extends ITokenLinkedin, Document {

}

export var tokenSchema: Schema = new Schema({
    access_token: {type: String, required: true},
    expires_in: {type: Date, required: true, default: Date.now, expires: 43200}
}, {versionKey: false});


const TokenLinkedin: Model<ITokenModelLinkedin> = model<ITokenModelLinkedin>("TokenLinkedin", tokenSchema);
export default TokenLinkedin