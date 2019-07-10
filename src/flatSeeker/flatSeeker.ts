import {FlatshareExperience, flatshareType, genderRestrictions, Occupations, rentType} from "../utils/selectionEnums";
import {Document, model, Model, models, Schema} from "mongoose";
import {IUser} from "../users/user";

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


export const FlatSeeker: Model<IFlatSeekerModel> = models.FlatSeeker || model<IFlatSeekerModel>("FlatSeeker", FlatSeekerSchema);
