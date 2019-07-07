import {Document, Model, model, models, Schema} from "mongoose";

enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    DIVERSE = "DIVERSE"
}

enum Type {
    SEEKER = "SEEKER",
    OFFERER = "OFFERER"
}

enum rentType {
    UNLIMITED = "UNLIMITED",
    LIMITED = "LIMITED"
}

enum Occupations {
    STUDENT = 'Student',
    WORKING = 'Working',
    ON_VACATION = 'On Vacation',
    OTHERS = 'Others'
}

enum FlatshareExperience {
    NONE = 'None',
    LT_ONE = '≤ 1 year',
    GT_ONE = '> 1 year',
    GT_TWO = '> 2 year'
}

enum flatshareType {
    STUDENTS_ONLY = 'students only',
    WORKERS_ONLY = 'workers only',
    STUDENT_ASSOCIATION = 'Student association',
    MIXED = 'mixed'
}

enum genderRestrictions {
    WOMEN_ONLY = 'Women only',
    MEN_ONLY = 'Men only'
}

interface IUser {
    jwt_token: string,
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    gender: Gender;
    dateOfBirth: Date;
    isVerified: boolean;
}

export interface IUserModel extends IUser, Document {
    fullName(): string;
}

export var UserSchema: Schema = new Schema({
    jwt_token: {type: String, unique: true},
    email: {type: String, unique: true},
    password: String,
    firstName: String,
    lastName: String,
    phoneNumber: String,
    gender: {type: String, enum: this.Gender},
    dateOfBirth: Date,
    isVerified: {type: Boolean, default: false}
}, {versionKey: false});

UserSchema.methods.fullName = function (): string {
    return (this.firstName.trim() + " " + this.lastName.trim());
};

// transformer : should be separated in different file if big enough
UserSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.dateOfBirth = new Date(ret.dateOfBirth).toLocaleDateString();
        delete ret.password;
        return ret;
    }
});

interface IFlatOfferer {
    user: IUser,
    flat: {
        region: string,
        street: string,
        houseNr: number,
        flatSize: number,
        stations: [string],
        stores: [string],
        flatshareType: flatshareType,
        genderRestriction: genderRestrictions,
        flatEquipment: {
            parkingLot: Boolean,
            livingroom: Boolean,
            shower: Boolean,
            bathtub: Boolean,
            kitchen: Boolean,
            internet: Boolean,
            balcony: Boolean,
            terrace: Boolean,
            garden: Boolean,
            washingMachine: Boolean,
            dishwasher: Boolean,
        },
        flatmates: [{
            firstName: String,
            lastName: String,
            age: Number,
            description: String,
            languages: [String],
            practiceOfAbstaining: [String],
            occupation: Occupations,
            field: String,
            hobbies: [String],
            socialMedia: String
        }],
        room: {
            roomSize: Number,
            rent: Number,
            rentType: rentType,
            dateAvailable: [Date],
            furnished: Boolean,
            images: [ArrayBuffer]
        },
        flatmatePreferences: {
            gender: Gender,
            ageFrom: Number,
            ageTo: Number,
            occupations: Occupations,
            flatshareExperience: FlatshareExperience,
            practiceOfAbstaining: [String],
            cleanliness: String,
            cleaningSchedule: String,
            activities: [String],
            smokersAllowed: Boolean,
            petsAllowed: Boolean,
            weekendAbsent: Boolean
        }
    }
}

export interface IFlatOffererModel extends IFlatOfferer, Document {
}

export const FlatOffererSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    flat: {
        region: String,
        street: String,
        houseNr: Number,
        flatSize: Number,
        stations: [String],
        stores: [String],
        flatshareType: {type: String, enum: this.flatshareType},
        genderRestriction: {type: String, enum: this.genderRestrictions},
        flatEquipment: {
            parkingLot: Boolean,
            livingroom: Boolean,
            shower: Boolean,
            bathtub: Boolean,
            kitchen: Boolean,
            internet: Boolean,
            balcony: Boolean,
            terrace: Boolean,
            garden: Boolean,
            washingMachine: Boolean,
            dishwasher: Boolean,
        },
        flatmates: [{
            firstName: String,
            lastName: String,
            age: Number,
            description: String,
            languages: [String],
            practiceOfAbstaining: [String],
            occupation: {type: String, enum: this.Occupations},
            field: String,
            hobbies: [String],
            socialMedia: String
        }],
        room: {
            roomSize: Number,
            rent: Number,
            rentType: {type: String, enum: this.rentType},
            dateAvailable: [Date],
            furnished: Boolean,
            images: [{data: Buffer, contentType: String}]
        },
        flatmatePreferences: {
            gender: {type: String, enum: this.Gender},
            ageFrom: Number,
            ageTo: Number,
            occupations: {type: String, enum: this.Occupations},
            flatshareExperience: {type: String, enum: this.FlatshareExperience},
            practiceOfAbstaining: [String],
            cleanliness: String,
            cleaningSchedule: String,
            activities: [String],
            smokersAllowed: Boolean,
            petsAllowed: Boolean,
            weekendAbsent: Boolean,
        },

    }
});

export const User: Model<IUserModel> = models.User || model<IUserModel>("User", UserSchema);
export const FlatOfferer: Model<IFlatOffererModel> = models.FlatOfferer || model<IFlatOffererModel>("FlatOfferer", FlatOffererSchema);
