import {Document, model, Model, models, Schema} from "mongoose";
import {IUser} from "../users/user";
import {IFlat} from "../flats/flat";

/**
 * FlatOfferer
 */
interface IFlatOfferer {
    user: IUser,
    flat: IFlat,
}

export interface IFlatOffererModel extends IFlatOfferer, Document {
}

export const FlatOffererSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    flat: {type: Schema.Types.ObjectId, ref: 'Flat'}
});

export const FlatOfferer: Model<IFlatOffererModel> = models.FlatOfferer || model<IFlatOffererModel>("FlatOfferer", FlatOffererSchema);
