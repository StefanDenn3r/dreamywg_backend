import { Document, Model, model, Schema } from "mongoose";

interface Roommate {
  nationality: string;
  age: number;
  occupation: string;
  description: string;
}

enum GENDER {
  MALE_ONLY = "MALE_ONLY",
  FEMALE_ONLY = "FEMALE_ONLY",
  BOTH = "BOTH"
}

interface ISeeker {
  location?: string;
  rentType?: string;
  flatType?: string;
  nearbyStation?: [string];
  nearbyStore?: [string];
  miscellaneous?: [string];
  flooring?: [string];
  photo?: boolean;
  roommate?: [Roommate];
  gender?: GENDER;
  minAge?: number;
  maxAge?: number;
  occupation?: string;
  flatshareExperience: string;
  practiceOfAbstaining: string;
  cleanliness: string;
  cleaningSchedule: string;
  activities: [string];
  smokersAllowed: boolean;
  petsAllowed: boolean;
}

export interface ISeekerModel extends ISeeker, Document {}

export const FlatSeekerSchema: Schema = new Schema(
  {
    location: String,
    rentType: String,
    flatshareType: String,
    nearbyStation: [String],
    nearbyStore: [String],
    miscellaneous: [String],
    flooring: [String],
    photo: { data: Buffer, contentType: String },
    roommate: [
      {
        nationality: String,
        age: Number,
        occupation: String,
        description: String
      }
    ],
    gender: { type: String, enum: this.GENDER, default: GENDER.BOTH },
    minAge: Number,
    maxAge: Number,
    occupation: String,
    flatshareExperience: String,
    practiceOfAbstaining: String,
    cleanliness: String,
    cleaningSchedule: String,
    activities: [String],
    smokersAllowed: Boolean,
    petsAllowed: Boolean
  },
  { versionKey: false }
);

// transformer : should be separated in different file if big enough
FlatSeekerSchema.set("toJSON");

const FlatSeeker: Model<ISeekerModel> = model(
  "FlatSeeker",
  FlatSeekerSchema
);
export default FlatSeeker;
