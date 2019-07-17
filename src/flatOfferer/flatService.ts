import {FlatOfferer, IFlatOffererModel} from "./flatOfferer";
import {Flat} from "../flats/flat";

export let getFlatOffererByFlatId = async (id: String) => {
    try {
        const flat = await Flat.findById(id);
        const flatOfferer: IFlatOffererModel = await FlatOfferer.findOne({'flat': flat}).populate('user');
        return flatOfferer
    } catch (e) {
        console.log(e);
        return null;
    }
};
