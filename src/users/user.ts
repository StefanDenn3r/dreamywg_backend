import {Document, Model, model, Schema} from "mongoose";

interface IUser {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    isVerified: boolean
}

export interface IUserModel extends IUser, Document {
    fullName(): string;
}

export var UserSchema: Schema = new Schema({
    email: {type: String, unique: true},
    firstName: String,
    lastName: String,
    password: String,
    isVerified: {type: Boolean, default: false}
}, {versionKey: false});

UserSchema.methods.fullName = function (): string {
    return (this.firstName.trim() + " " + this.lastName.trim());
};

const User: Model<IUserModel> = model<IUserModel>("User", UserSchema);
export default User