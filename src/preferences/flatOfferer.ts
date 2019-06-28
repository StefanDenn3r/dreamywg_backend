import {Document, Model, model, Schema} from "mongoose";


interface IOfferer {
    location?: string;
    rentType?: string;
    flatType?: string;
    nearbyStation?: [string];
    nearbyStore?: [string];
    miscellaneous?: [string];
    flooring?: [string];
    photo?: boolean;
}

export interface IOffererModel extends IOfferer, Document {
}

export var FlatOffererSchema: Schema = new Schema({
    location: Map,
    rentType: String,
    flatType: String,
    nearbyStation: [String],
    nearbyStore: [String],
    miscellaneous:[String],
    flooring: [String],
    photo: { data: Buffer, contentType: String }
}, {versionKey: false});


// transformer : should be separated in different file if big enough
FlatOffererSchema.set('toJSON')

const FlatOfferer: Model<IOffererModel> = model("FlatOfferer", FlatOffererSchema);
export default FlatOfferer