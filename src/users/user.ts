import {Document, Model, model, Schema} from "mongoose";
import {ITokenFacebook} from './tokens/tokenFacebook'
import {ITokenLinkedin} from './tokens/tokenLinkedin'
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
    facebookToken: ITokenFacebook;
    linkedinToken: ITokenLinkedin;
    hasOffers?: boolean; // to determine if the said user is an offerer
    isVerified: boolean
}

export interface IUserModel extends IUser, Document {
    fullName(): string;
    setFacebookToken(data: ITokenFacebook);
    setLinkedinToken(data: ITokenLinkedin);
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
    // TODO define schema object per giben interface
    facebookToken: Schema.Types.Mixed,
    linkedinToken: Schema.Types.Mixed,
    isVerified: {type: Boolean, default: false}
}, {versionKey: false});

UserSchema.methods.fullName = function (): string {
    return (this.firstName.trim() + " " + this.lastName.trim());
};

UserSchema.methods.setFacebookToken = function (data: ITokenFacebook) {
    this.facebookToken = data;
}

UserSchema.methods.setLinkedinToken = function (data: ITokenLinkedin) {
    this.linkedinToken = data;
}

// transformer : should be separated in different file if big enough
UserSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.dateOfBirth = new Date(ret.dateOfBirth).toLocaleDateString();
        delete ret.password;
        return ret;
    }
})

const User: Model<IUserModel> = model<IUserModel>("User", UserSchema);
export default User