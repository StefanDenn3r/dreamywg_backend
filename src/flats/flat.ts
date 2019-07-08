import {Document, Model, model, Schema} from "mongoose";

//TODO (Q) wait for flat offerer registration
interface IFlat {
    
}

export interface IFlatModel extends IFlat, Document {
}

export var FlatSchema: Schema = new Schema({
    
}, {versionKey: false});

const Flat: Model<IFlatModel> = model<IFlatModel>("Flat", FlatSchema);
export default Flat