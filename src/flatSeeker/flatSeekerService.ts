import {IFlatSeekerModel} from "./flatSeeker";
import {IFlatModel} from "../flats/flat";
import {rentType} from "../utils/selectionEnums";

export let match = (flatSeeker: IFlatSeekerModel, flats: IFlatModel[]) => {
    const personalInformation = flatSeeker.personalInformation;
    const preferences = flatSeeker.preferences;
    flats
        .filter(flat => preferences.flat.regions.includes(flat.region))
        .filter(flat => preferences.flat.flatshareType === flat.flatshareType)
        .filter(flat => inBetween(preferences.flat.room.size, flat.rooms[0].roomSize))
        .filter(flat => inBetween(preferences.flat.room.rent, flat.rooms[0].rent))
        .filter(flat => preferences.flat.room.rentType === flat.rooms[0].rentType)
        .filter(flat => {
            if(preferences.flat.room.rentType === rentType.UNLIMITED)
                return inBetweenDate(preferences.flat.room.dateAvailable, flat.rooms[0].dateAvailable)
        })
        .filter(flat => preferences.flat.room.furnished === flat.rooms[0].furnished)
}


let inBetween = (range, value) => range.from <= value && value <= range.to;
let inBetweenDate = (range, value) => range[0] <= value && value <= range[1]; // check if this works with date as well

let dateAvailable = (range, value) => range.from <= value && value <= range.to;