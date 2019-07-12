import {Document, Model, model, models, Schema} from "mongoose";
import {Gender, Type} from "../utils/selectionEnums";

export interface IUser {
    jwt_token: string,
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    gender: Gender;
    dateOfBirth: Date;
    residenceId?: string;
    isVerified: boolean;
    finishedRegistrationProcess: boolean;
    type: Type;
}

export interface IUserModel extends IUser, Document {
    fullName(): string;
}

export const UserSchema: Schema = new Schema({
    jwt_token: {type: String, unique: true},
    email: {type: String, unique: true},
    password: String,
    firstName: String,
    lastName: String,
    phoneNumber: String,
    gender: {type: String, enum: this.Gender},
    dateOfBirth: Date,
    isVerified: {type: Boolean, default: false},
    type: {type: String, enum: this.Type},
}, {versionKey: false});

UserSchema.methods.fullName = function (): string {
    return (this.firstName.trim() + " " + this.lastName.trim());
};

// transformer : should be separated in different file if big enough
UserSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.dateOfBirth = new Date(ret.dateOfBirth).toLocaleDateString();
        delete ret.password;
        return ret;
    }
});

export const User: Model<IUserModel> = models.User || model<IUserModel>("User", UserSchema);
