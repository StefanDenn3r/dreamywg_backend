import {IFlatSeekerModel} from "./flatSeeker";
import {IFlatModel} from "../flats/flat";
import {FlatshareExperience, rentType} from "../utils/selectionEnums";

export let match = (flatSeeker: IFlatSeekerModel, flats: IFlatModel[]) => {
    const personalInformation = flatSeeker.personalInformation;
    const preferences = flatSeeker.preferences;
    // filter by hard criteria
    const hardCriteriaFilteredFlats = flats
    // Flatseeker POV
        .filter(flat => preferences.flat.regions.includes(flat.region))
        .filter(flat => preferences.flat.flatshareType === flat.flatshareType)
        .filter(flat => inBetween(preferences.flat.room.size, flat.rooms[0].roomSize))
        .filter(flat => inBetween(preferences.flat.room.rent, flat.rooms[0].rent))
        .filter(flat => preferences.flat.room.rentType === flat.rooms[0].rentType)
        .filter(flat => {
            if (preferences.flat.room.rentType === rentType.UNLIMITED)
                return preferences.flat.room.dateAvailable >= flat.rooms[0].dateAvailable; // 01.08 >= 01.07 => true
            else
                return inBetweenDate(flat.rooms[0].dateAvailable, preferences.flat.room.dateAvailableRange[0])
                    && inBetweenDate(flat.rooms[0].dateAvailable, preferences.flat.room.dateAvailableRange[1])
        })
        .filter(flat => preferences.flat.room.furnished === flat.rooms[0].furnished)
        .filter(flat => inBetween(preferences.flatmates.amount, flat.flatmates.length))
        .filter(flat => flat.flatmates.every(flatmate => inBetween(preferences.flatmates.age, flatmate.age)))
        // Both POV
        .filter(flat => preferences.genderRestriction === flat.genderRestriction)
        .filter(flat => preferences.cleanliness === flat.flatmatePreferences.cleanliness)
        .filter(flat => preferences.cleaningSchedule === flat.flatmatePreferences.cleaningSchedule)
        .filter(flat => preferences.smokers === flat.flatmatePreferences.smokersAllowed)
        .filter(flat => preferences.pets === flat.flatmatePreferences.petsAllowed)
        // FlatOfferer POV
        .filter(flat => flat.flatmatePreferences.gender === flatSeeker.user.gender) // check if even present
        .filter(flat => flat.flatmatePreferences.occupations === personalInformation.occupation)
        .filter(flat => inBetween(flat.flatmatePreferences.age, personalInformation.age))
        .filter(flat => flatshareExperienceComparison(flat.flatmatePreferences.flatshareExperience, personalInformation.flatshareExperience))
        .filter(flat => personalInformation.practiceOfAbstaining.every(practice => flat.flatmatePreferences.practiceOfAbstaining.includes(practice)))
        .filter(flat => matchBooleanRestrictions(personalInformation.smoker, flat.flatmatePreferences.smokersAllowed))
        .filter(flat => matchBooleanRestrictions(personalInformation.pets, flat.flatmatePreferences.petsAllowed))
        .filter(flat => matchBooleanRestrictions(personalInformation.weekendAbsent, flat.flatmatePreferences.weekendAbsent));

    const matchedScores = hardCriteriaFilteredFlats.map(flat => {
        const equipmentScore = calculateEquipmentScore(flat.flatEquipment, preferences.flatEquipment);
        const flatmateScore = calculateFlatmateScore(flat.flatmates, personalInformation);
        const flatActivityScore = calculateFlatshareActivityScore(flat.flatmatePreferences.activities, preferences.activities);
        return ((equipmentScore + flatmateScore + flatActivityScore) / 3) * 100
    });
    let result = [];
    for (let i = 0; i < hardCriteriaFilteredFlats.length; i++) {
        let currentFlat = hardCriteriaFilteredFlats[i];
        result.push({
            "img": currentFlat.rooms[0].images[0],
            "title": currentFlat.title,
            "description": currentFlat.shortDescription,
            "matched": matchedScores[i],
            "location": `${currentFlat.street} ${currentFlat.houseNr}, ${currentFlat.region}`,
            "price": currentFlat.rooms[0].rent,
            "dateAvailable": currentFlat.rooms[0].rentType === rentType.UNLIMITED ? currentFlat.rooms[0].dateAvailable : `${currentFlat.rooms[0].dateAvailableRange[0]} - ${currentFlat.rooms[0].dateAvailableRange[1]}`,
            "sponsored": false
        })
    }
    return result;
};

let inBetween = (range, value) => range.from <= value && value <= range.to;

let inBetweenDate = (range, value) => range[0] <= value && value <= range[1]; // check if this works with date as well

function flatshareExperienceComparison(requiredExperience: FlatshareExperience, seekerExperience: FlatshareExperience) {
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

function matchBooleanRestrictions(seekerProperty, offererPreference) {
    return !(!offererPreference && seekerProperty) //todo: verify this especially
}

/**
 * Measures similarity between requested and offered flat equipment.
 * @param flatEquipment
 * @param seekerEquipmentPref
 * @return value between 0 and 1 with 1 high similarity and 0 low similarity
 */
function calculateEquipmentScore(flatEquipment, seekerEquipmentPref) {
    const requestedSeekerEquipmentPrefs = Object.keys(seekerEquipmentPref).filter(key => seekerEquipmentPref[key]);
    const offeredFlatEquipment = requestedSeekerEquipmentPrefs.filter(key => flatEquipment[key]);
    return offeredFlatEquipment.length / requestedSeekerEquipmentPrefs.length;
}

/**
 * Occupation with at least one flatmate in the same field, same language in common and hobbies (each 1/3 points)
 * @param flatmates
 * @param personalInformation
 */
function calculateFlatmateScore(flatmates, personalInformation) {
    const hasCommonField = flatmates.some(flatmate => flatmate.field === personalInformation.field) && 1;
    const speaksSameLangauges = flatmates.some(flatmate => personalInformation.languages.some(language => flatmate.languages.includes(language))) && 1;
    const hasSameHobbies = flatmates.some(flatmate => personalInformation.hobbies.some(hobby => flatmate.hobbies.includes(hobby))) && 1;
    return (hasCommonField + speaksSameLangauges + hasSameHobbies) / 3 //todo: probably won't work
}

function calculateFlatshareActivityScore(flatActivities, seekerActivties) {
    return seekerActivties.map(activity => (flatActivities.include(activity) ? 1 : 0)).reduce((a, b) => a + b) / seekerActivties.length
}

let dateAvailable = (range, value) => range.from <= value && value <= range.to;