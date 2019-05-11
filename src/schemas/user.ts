import {Document, Model, model, Schema} from "mongoose";
import {IUser} from '../models/user'

export interface IUserModel extends IUser, Document {
    fullName(): string;
}

export var UserSchema: Schema = new Schema({
    email: String,
    firstName: String,
    lastName: String,
    password: String
}, {versionKey: false});

UserSchema.methods.fullName = function (): string {
    return (this.firstName.trim() + " " + this.lastName.trim());
};

const User: Model<IUserModel> = model<IUserModel>("User", UserSchema);
export default User