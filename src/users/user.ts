import {Document, Model, model, Schema} from "mongoose";

enum Gender {
    MALE="MALE",
    FEMALE="FEMALE",
    FLUID= "FLUID" // 2019 yolo
}

interface IUser {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    gender?: Gender;
    dateOfBirth?: Date;
    hasOffers?: boolean; // to determine if the said user is an offerer
    isVerified: boolean
}

export interface IUserModel extends IUser, Document {
    fullName(): string;
}

export var UserSchema: Schema = new Schema({
    email: {type: String, unique: true},
    password: String,
    firstName: String,
    lastName: String,
    phoneNumber: String,
    gender: {type: String, enum: this.Gender, default: Gender.FLUID},
    dateOfBirth: Date,
    hasOffers: Boolean,
    isVerified: {type: Boolean, default: false}
}, {versionKey: false});

UserSchema.methods.fullName = function (): string {
    return (this.firstName.trim() + " " + this.lastName.trim());
};

const User: Model<IUserModel> = model<IUserModel>("User", UserSchema);
export default User