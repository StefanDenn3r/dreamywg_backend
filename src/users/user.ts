import {Document, Model, model, Schema} from "mongoose";

enum Gender {
    MALE="MALE",
    FEMALE="FEMALE",
    DIVERSE= "DIVERSE"
}

interface IUser {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    gender: Gender;
    dateOfBirth: Date;
    jwt_token: string,
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
    gender: {type: String, enum: this.Gender, default: Gender.DIVERSE},
    dateOfBirth: Date,
    hasOffers: Boolean,
    jwt_token: String,
    isVerified: {type: Boolean, default: false}
}, {versionKey: false});

UserSchema.methods.fullName = function (): string {
    return (this.firstName.trim() + " " + this.lastName.trim());
};

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