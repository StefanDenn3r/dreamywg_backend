import {Flat, IFlatModel} from "../flats/flat";
import {FlatshareExperience, rentType} from "../utils/selectionEnums";
import {IFlatSeekerModel} from "./flatSeeker";

export const convertToSearchResult = (hardCriteriaFilteredFlats, matchedScores) => {
    const result = [];
    for (let i = 0; i < hardCriteriaFilteredFlats.length; i++) {
        const currentFlat = hardCriteriaFilteredFlats[i];
        result.push({
            id: currentFlat.id,
            img: [], // todo: currentFlat.rooms[0].images[0],
            title: currentFlat.title,
            description: currentFlat.shortDescription,
            matched: matchedScores[i],
            location: `${currentFlat.street} ${currentFlat.houseNr}, ${currentFlat.region}`,
            price: currentFlat.rooms[0].rent,
            dateAvailable: currentFlat.rooms[0].rentType === rentType.UNLIMITED ? currentFlat.rooms[0].dateAvailable : `${currentFlat.rooms[0].dateAvailableRange[0]} - ${currentFlat.rooms[0].dateAvailableRange[1]}`,
            sponsored: false
        })
    }
    return result;
}

const NonUndefined = (property, comparision) => !!property ? comparision : true

const NonEmpty = (property, comparision) => !!property && property.length > 0 ? comparision : true

const inBetween = (range, value) => (!!range.from && !!range.to) ? range.from <= value && value <= range.to : true;

const inBetweenDate = (range, value) => range[0] <= value && value <= range[1]; // check if this works with date as well

const flatshareExperienceComparison = (requiredExperience: FlatshareExperience, seekerExperience: FlatshareExperience) => {
    if (requiredExperience === FlatshareExperience.NONE)
        return true;
    if (requiredExperience === FlatshareExperience.LT_ONE) {
        if (seekerExperience === FlatshareExperience.LT_ONE) return true;
        if (seekerExperience === FlatshareExperience.GT_ONE) return true;
        if (seekerExperience === FlatshareExperience.GT_TWO) return true
    }
    if (requiredExperience === FlatshareExperience.GT_ONE) {
        if (seekerExperience === FlatshareExperience.GT_ONE) return true;
        if (seekerExperience === FlatshareExperience.GT_TWO) return true
    }
    if (requiredExperience === FlatshareExperience.GT_TWO) {
        if (seekerExperience === FlatshareExperience.GT_TWO) return true
    }
    return false;
}

const matchBooleanRestrictions = (seekerProperty, offererPreference) => {
    return !(!offererPreference && seekerProperty)
}

/**
 * Measures similarity between requested and offered flat equipment.
 * @param flatEquipment
 * @param seekerEquipmentPref
 * @return value between 0 and 1 with 1 high similarity and 0 low similarity
 */
const calculateEquipmentScore = (flatEquipment, seekerEquipmentPref) => {
    const requestedSeekerEquipmentPrefs = Object.keys(seekerEquipmentPref).filter(key => seekerEquipmentPref[key]);
    const offeredFlatEquipment = requestedSeekerEquipmentPrefs.filter(key => flatEquipment[key]);
    return offeredFlatEquipment.length / requestedSeekerEquipmentPrefs.length;
}

/**
 * Occupation with at least one flatmate in the same field, same language in common and hobbies (each 1/3 points)
 * @param flatmates
 * @param personalInformation
 */
const calculateFlatmateScore = (flatmates, personalInformation) => {
    const hasCommonField = +flatmates.some(flatmate => flatmate.field === personalInformation.field);
    const speaksSameLangauges = +flatmates.some(flatmate => personalInformation.languages.some(language => flatmate.languages.contains(language)));
    const hasSameHobbies = +flatmates.some(flatmate => personalInformation.hobbies.some(hobby => flatmate.hobbies.contains(hobby)));
    return (hasCommonField + speaksSameLangauges + hasSameHobbies) / 3
}

const calculateFlatshareActivityScore = (flatActivities, seekerActivties) => {
    return seekerActivties.map(activity => +(flatActivities.contains(activity))).reduce((a, b) => a + b) / seekerActivties.length
}

const dateAvailable = (range, value) => range.from <= value && value <= range.to;

Array.prototype.contains = function (element) {
    return this.indexOf(element) > -1;
};

declare global {
    interface Array<T> {
        contains(o: T): boolean;
    }
}

export const matchOnDb = async (flatSeeker: IFlatSeekerModel) => {
    const personalInformation = flatSeeker.personalInformation;
    const preferences = flatSeeker.preferences;
    const allFlats = await Flat.find();
    const flats = await Flat.find({
        region: {"$in": preferences.flat.regions},
        flatshareType: preferences.flat.flatshareType,

    });

    return flats
}


export let match = (flatSeeker: IFlatSeekerModel, flats: Array<IFlatModel>) => {
    const personalInformation = flatSeeker.personalInformation;
    const preferences = flatSeeker.preferences;
    // filter by hard criteria
    const hardCriteriaFilteredFlats = flats
    // Flatseeker POV
        .filter(flat => NonEmpty(preferences.flat.regions, preferences.flat.regions.contains(flat.region)))
        .filter(flat => NonUndefined(preferences.flat.flatshareType, preferences.flat.flatshareType === flat.flatshareType))
        .filter(flat => inBetween(preferences.flat.room.size, flat.rooms[0].roomSize))
        .filter(flat => inBetween(preferences.flat.room.rent, flat.rooms[0].rent))
        .filter(flat => NonUndefined(preferences.flat.room.rentType, preferences.flat.room.rentType === flat.rooms[0].rentType))
        // .filter(flat => {
        //     if (preferences.flat.room.rentType === rentType.UNLIMITED)
        //         return preferences.flat.room.dateAvailable <= flat.rooms[0].dateAvailable; // 01.08 >= 01.07 => true
        //     else
        //         return inBetweenDate(flat.rooms[0].dateAvailable, preferences.flat.room.dateAvailableRange[0])
        //             && inBetweenDate(flat.rooms[0].dateAvailable, preferences.flat.room.dateAvailableRange[1])
        // })
        .filter(flat => NonUndefined(preferences.flat.room.dateAvailable, preferences.flat.room.dateAvailable <= flat.rooms[0].dateAvailable)) // 01.08 >= 01.07 => true
        .filter(flat => NonEmpty(preferences.flat.room.dateAvailableRange,
            inBetweenDate(flat.rooms[0].dateAvailable, preferences.flat.room.dateAvailableRange[0])
            && inBetweenDate(flat.rooms[0].dateAvailable, preferences.flat.room.dateAvailableRange[1])))
        .filter(flat => preferences.flat.room.furnished === flat.rooms[0].furnished)
        .filter(flat => inBetween(preferences.flatmates.amount, flat.flatmates.length))
        .filter(flat => flat.flatmates.every(flatmate => inBetween(preferences.flatmates.age, flatmate.age)))
        // // Both POV
        .filter(flat => NonUndefined(preferences.genderRestriction, preferences.genderRestriction === flat.genderRestriction))
        .filter(flat => NonUndefined(preferences.cleanliness, preferences.cleanliness === flat.flatmatePreferences.cleanliness))
        .filter(flat => NonUndefined(preferences.cleaningSchedule, preferences.cleaningSchedule === flat.flatmatePreferences.cleaningSchedule))
        .filter(flat => NonUndefined(preferences.smokers, preferences.smokers === flat.flatmatePreferences.smokersAllowed))
        .filter(flat => NonUndefined(preferences.pets, preferences.pets === flat.flatmatePreferences.petsAllowed))
        // // FlatOfferer POV
        .filter(flat => NonUndefined(flat.flatmatePreferences.gender, flat.flatmatePreferences.gender === flatSeeker.user.gender))
        .filter(flat => NonEmpty(flat.flatmatePreferences.occupations, flat.flatmatePreferences.occupations.contains(personalInformation.occupation)))
        .filter(flat => inBetween(flat.flatmatePreferences.age, personalInformation.age))
        .filter(flat => flatshareExperienceComparison(flat.flatmatePreferences.flatshareExperience, personalInformation.flatshareExperience))
        .filter(flat => NonEmpty(personalInformation.practiceOfAbstaining, personalInformation.practiceOfAbstaining.every(practice => NonUndefined(flat.flatmatePreferences.practiceOfAbstaining, flat.flatmatePreferences.practiceOfAbstaining.contains(practice)))))
        .filter(flat => matchBooleanRestrictions(personalInformation.smoker, flat.flatmatePreferences.smokersAllowed))
        .filter(flat => matchBooleanRestrictions(personalInformation.pets, flat.flatmatePreferences.petsAllowed))
        .filter(flat => matchBooleanRestrictions(personalInformation.weekendAbsent, flat.flatmatePreferences.weekendAbsent));

    const matchedScores = hardCriteriaFilteredFlats.map(flat => {
        const equipmentScore = calculateEquipmentScore(flat.flatEquipment, preferences.flatEquipment);
        const flatmateScore = calculateFlatmateScore(flat.flatmates, personalInformation);
        const flatActivityScore = calculateFlatshareActivityScore(flat.flatmatePreferences.activities, preferences.activities);
        return Math.round(((equipmentScore + flatmateScore + flatActivityScore) / 3) * 100)
    });
    const res = convertToSearchResult(hardCriteriaFilteredFlats, matchedScores);
    return res.sort((a, b) => b.matched - a.matched)
};
