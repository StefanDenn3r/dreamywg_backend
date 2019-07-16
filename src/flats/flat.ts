import {Document, model, Model, models, Schema} from "mongoose";
import {
    FlatshareExperience,
    flatshareType,
    Gender,
    genderRestrictions,
    occupation,
    rentType
} from "../utils/selectionEnums";

//not sure if this is a good thing
import {convertAddressToCoordinate} from '../utils/locationUtil'

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
        images: ArrayBuffer[]
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
    getFullAddress();
    getCoordinate();
}

export const FlatSchema = new Schema({
    title: String,
    shortDescription: String,
    longDescription: String,
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
        occupation: {type: String, enum: this.occupation},
        field: String,
        hobbies: [String],
        socialMedia: String
    }],
    rooms: [{
        roomSize: Number,
        rent: Number,
        rentType: {type: String, enum: this.rentType},
        dateAvailableRange: [Date],
        dateAvailable: Date,
        furnished: {type: Boolean, default: false},
        images: [{data: Buffer, contentType: String}]
    }],
    flatmatePreferences: {
        gender: {type: String, enum: this.Gender},
        age: {
            from: Number,
            to: Number
        },
        occupations: [{type: String, enum: this.occupation}],
        flatshareExperience: {type: String, enum: this.FlatshareExperience},
        practiceOfAbstaining: [String],
        cleanliness: String,
        cleaningSchedule: String,
        activities: [String],
        smokersAllowed: {type: Boolean, default: false},
        petsAllowed: {type: Boolean, default: false},
        weekendAbsent: {type: Boolean, default: false},
    },
});

FlatSchema.methods.getFullAddress = function (): string {
    return `${this.region.trim()} ${this.street.trim()}, ${this.houseNr}`;
};

FlatSchema.methods.getCoordinates = async function () {
    return await convertAddressToCoordinate(this.getFullAddress());
};

export const Flat: Model<IFlatModel> = models.Flat || model<IFlatModel>("Flat", FlatSchema);
