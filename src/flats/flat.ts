import {Document, model, Model, models, Schema} from "mongoose";
import {
    FlatshareExperience,
    flatshareType,
    Gender,
    genderRestrictions,
    occupation,
    rentType
} from "../utils/selectionEnums";

/**
 * Flat
 */
export interface IFlat {
    title: String,
    shortDescription: String,
    longDescription: String,
    region: String,
    street: String,
    houseNr: Number,
    flatSize: Number,
    stations: String[],
    stores: String[],
    images: String[],
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
        languages: String[],
        practiceOfAbstaining: String[],
        occupation: occupation,
        field: String,
        hobbies: String[],
        socialMedia: String
    }],
    rooms: [{
        roomSize: Number,
        rent: Number,
        rentType: rentType,
        dateAvailableRange: Date[],
        dateAvailable: Date,
        furnished: Boolean,
        image: String
    }],
    flatmatePreferences: {
        gender: Gender,
        age: {
            from: Number,
            to: Number
        }
        occupations: occupation[],
        flatshareExperience: FlatshareExperience,
        practiceOfAbstaining: String[],
        cleanliness: String,
        cleaningSchedule: String,
        activities: String[],
        smokersAllowed: Boolean,
        petsAllowed: Boolean,
        weekendAbsent: Boolean
    }
}

export interface IFlatModel extends IFlat, Document {

}

export const FlatSchema = new Schema({
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    longDescription: {type: String, required: true},
    region: {type: String, required: true},
    street: {type: String, required: true},
    houseNr: {type: Number, required: true},
    flatSize: {type: Number, required: true},
    stations: [String],
    stores: [String],
    images: [String],
    flatshareType: {type: String, enum: this.flatshareType, required: true},
    genderRestriction: {type: String, enum: this.genderRestrictions, required: true},
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
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        age: {type: Number, required: true},
        description: String,
        languages: [String],
        practiceOfAbstaining: [String],
        occupation: {type: String, enum: this.occupation, require: true},
        field: String,
        hobbies: [String],
        socialMedia: String
    }],
    rooms: [{
        roomSize: {type: Number, required: true},
        rent: {type: Number, required: true},
        rentType: {type: String, enum: this.rentType, require: true},
        dateAvailableRange: [Date],
        dateAvailable: Date,
        furnished: {type: Boolean, default: false},
        image: String
    }],
    flatmatePreferences: {
        gender: {type: String, enum: this.Gender},
        age: {
            from: {type: Number, required: true},
            to: {type: Number, required: true}
        },
        occupations: {type: [String], enum: this.occupation, required: true},
        flatshareExperience: {type: String, enum: this.FlatshareExperience, required: true},
        practiceOfAbstaining: [String],
        cleanliness: {type: String, required: true},
        cleaningSchedule: {type: String, required: true},
        activities: [String],
        smokersAllowed: {type: Boolean, default: false},
        petsAllowed: {type: Boolean, default: false},
        weekendAbsent: {type: Boolean, default: false},
    },
});


export const Flat: Model<IFlatModel> = models.Flat || model<IFlatModel>("Flat", FlatSchema);
