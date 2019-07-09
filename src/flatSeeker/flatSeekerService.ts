import {IFlatSeekerModel} from "./flatSeeker";
import {IFlatModel} from "../flats/flat";

export let match = (flatSeeker: IFlatSeekerModel, flats: IFlatModel[]) => {
    const personalInformation = flatSeeker.personalInformation;
    const preferences = flatSeeker.preferences;
    flats
        .filter(flat => preferences.flat.regions.includes(flat.region))
        .filter(flat => preferences.flat.flatshareType === flat.flatshareType)
        .filter(flat => inBetween(preferences.flat.room.size, flat.rooms[0]. )
}


let inBetween = (range, value) => range.from <= value && value <= range.to;