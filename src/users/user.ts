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
    transform: function (doc, ret) {
        ret.dateOfBirth = new Date(ret.dateOfBirth).toLocaleDateString();
        delete ret.password;
        return ret;
    }
});

/**
 * FlatOfferer
 */
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
            age: {
                from: Number,
                to: Number
            }
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
            parkingLot: {type: Boolean, default: false},
            livingroom: {type: Boolean, default: false},
            shower: {type: Boolean, default: false},
            bathtub: {type: Boolean, default: false},
            kitchen: {type: Boolean, default: false},
            internet: {type: Boolean, default: false},
            balcony: {type: Boolean, default: false},
            terrace: {type: Boolean, default: false},
            garden: {type: Boolean, default: false},
            washingMachine: {type: Boolean, default: false},
            dishwasher: {type: Boolean, default: false},
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
            furnished: {type: Boolean, default: false},
            images: [{data: Buffer, contentType: String}]
        },
        flatmatePreferences: {
            gender: {type: String, enum: this.Gender},
            age: {
                from: Number,
                to: Number
            },
            occupations: {type: String, enum: this.Occupations},
            flatshareExperience: {type: String, enum: this.FlatshareExperience},
            practiceOfAbstaining: [String],
            cleanliness: String,
            cleaningSchedule: String,
            activities: [String],
            smokersAllowed: {type: Boolean, default: false},
            petsAllowed: {type: Boolean, default: false},
            weekendAbsent: {type: Boolean, default: false},
        },

    }
});

/**
 * FlatSeeker
 */
interface IFlatSeeker {
    user: IUser,
    personalInformation: {
        occupation: Occupations,
        field: String,
        flatshareExperience: FlatshareExperience,
        languages: [String],
        practiceOfAbstaining: [String],
        hobbies: [String],
        age: Number,
        socialMedia: String
        description: String,
        smoker: Boolean,
        pets: Boolean,
        weekendAbsent: Boolean,
        image: ArrayBuffer
    },
    preferences: {
        flat: {
            regions: [String],
            stations: [String],
            stores: [String],
            flatshareType: flatshareType,
            room: {
                size: {
                    from: Number,
                    to: Number,
                }
                rent: {
                    from: Number,
                    to: Number,
                }
                rentType: rentType,
                dateAvailable: [Date],
                furnished: Boolean,
            }
        },
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
        flatmates: {
            amount: {
                from: Number,
                to: Number,
            },
            age: {
                from: Number,
                to: Number,
            },

        },
        genderRestriction: genderRestrictions,
        cleanliness: String
        cleaningSchedule: String
        activities: [String]
        smokers: Boolean
        pets: Boolean
    }
}


export interface IFlatSeekerModel extends IFlatSeeker, Document {
}

export const FlatSeekerSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    personalInformation: {
        occupation: {type: String, enum: this.Occupations},
        field: String,
        flatshareExperience: {type: String, enum: this.FlatshareExperience},
        languages: [String],
        practiceOfAbstaining: [String],
        hobbies: [String],
        age: Number,
        socialMedia: String,
        description: String,
        smoker: {type: Boolean, default: false},
        pets: {type: Boolean, default: false},
        weekendAbsent: {type: Boolean, default: false},
        image:{data: Buffer, contentType: String}
    },
    preferences: {
        flat: {
            regions: [String],
            stations: [String],
            stores: [String],
            flatshareType: {type: String, enum: this.flatshareType},
            room: {
                size: {
                    from: Number,
                    to: Number,
                },
                rent: {
                    from: Number,
                    to: Number,
                },
                rentType: {type: String, enum: this.rentType},
                dateAvailable: [Date],
                furnished: {type: Boolean, default: false},
            }
        },
        flatEquipment: {
            parkingLot: {type: Boolean, default: false},
            livingroom: {type: Boolean, default: false},
            shower: {type: Boolean, default: false},
            bathtub: {type: Boolean, default: false},
            kitchen: {type: Boolean, default: false},
            internet: {type: Boolean, default: false},
            balcony: {type: Boolean, default: false},
            terrace: {type: Boolean, default: false},
            garden: {type: Boolean, default: false},
            washingMachine: {type: Boolean, default: false},
            dishwasher: {type: Boolean, default: false},
        },
        flatmates: {
            amount: {
                from: Number,
                to: Number,
            },
            age: {
                from: Number,
                to: Number,
            },
        },
        genderRestriction: {type: String, enum: this.genderRestrictions},
        cleanliness: String,
        cleaningSchedule: String,
        activities: [String],
        smokers: {type: Boolean, default: false},
        pets: {type: Boolean, default: false},
    }
});


export const User: Model<IUserModel> = models.User || model<IUserModel>("User", UserSchema);
export const FlatOfferer: Model<IFlatOffererModel> = models.FlatOfferer || model<IFlatOffererModel>("FlatOfferer", FlatOffererSchema);
export const FlatSeeker: Model<IFlatSeekerModel> = models.FlatSeeker || model<IFlatSeekerModel>("FlatSeeker", FlatSeekerSchema);
