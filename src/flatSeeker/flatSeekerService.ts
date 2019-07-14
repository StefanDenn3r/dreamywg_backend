import {Flat} from "../flats/flat";
import {FlatshareExperience, rentType} from "../utils/selectionEnums";
import {IFlatSeekerModel} from "./flatSeeker";
import * as moment from 'moment';

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
            roomSize: currentFlat.rooms[0].roomSize,
            dateAvailable:
                currentFlat.rooms[0].rentType === rentType.UNLIMITED
                    ? moment(currentFlat.rooms[0].dateAvailable).format("YYYY-MM-DD")
                    : `${moment(currentFlat.rooms[0].dateAvailableRange[0]).format("YYYY-MM-DD")} - ${moment(currentFlat.rooms[0].dateAvailableRange[1]).format("YYYY-MM-DD")}`,
            sponsored: false
        })
    }
    return result;
};

const NonUndefined = (property, comparision) => {
    return !!property ? comparision : true
};

const NonEmpty = (property, comparision) => {
    return !!property && property.length > 0 ? comparision : true;
};

const inBetween = (range, value) => (!!range.from && !!range.to) ? range.from <= value && value <= range.to : true;

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
};

const matchBooleanRestrictions = (seekerProperty, offererPreference) => {
    return !(!offererPreference && seekerProperty)
};

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
};

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
};

const calculateFlatshareActivityScore = (flatActivities, seekerActivties) => {
    return seekerActivties.map(activity => +(flatActivities.contains(activity))).reduce((a, b) => a + b) / seekerActivties.length
};

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

    try {
        const dbFilteredFlats = (await Flat.find()
                .where('region').in(preferences.flat.regions)
                .where('flatshareType').equals(preferences.flat.flatshareType)
                .where('genderRestriction').equals(preferences.genderRestriction)
                .elemMatch('rooms', (elem) => {
                    elem.where('rentType').equals(preferences.flat.room.rentType);
                    elem.where('furnished').equals(preferences.flat.room.furnished);
                    elem.where('roomSize').gte(preferences.flat.room.size.from);
                    elem.where('roomSize').lte(preferences.flat.room.size.to);
                    elem.where('rent').gte(preferences.flat.room.rent.from);
                    elem.where('rent').lte(preferences.flat.room.rent.to)
                })
                .where('flatmatePreferences.cleanliness').equals(preferences.cleanliness)
                .where('flatmatePreferences.cleaningSchedule').equals(preferences.cleaningSchedule)
                .where('flatmatePreferences.smokersAllowed').equals(preferences.smokers)
                .where('flatmatePreferences.petsAllowed').equals(preferences.pets)
                .where('flatmatePreferences.occupations').equals(personalInformation.occupation)
                .$where(`this.flatmates.length>=${preferences.flatmates.amount.from}`)
                .$where(`this.flatmates.length<=${preferences.flatmates.amount.to}`)
                .sort({'rooms[0].roomSize': -1, 'rooms[0].rent': 1})
        );
        const filteredFlats = dbFilteredFlats
            .filter(flat => flat.flatmatePreferences.gender === flatSeeker.user.gender)
            .filter(flat => NonUndefined(preferences.flat.room.dateAvailable, preferences.flat.room.dateAvailable <= flat.rooms[0].dateAvailable))
            .filter(flat => flat.flatmates.every(flatmate => inBetween(preferences.flatmates.age, flatmate.age)))
            .filter(flat => {
                    return NonEmpty(preferences.flat.room.dateAvailableRange,
                        flat.rooms[0].dateAvailableRange[0] <= new Date(preferences.flat.room.dateAvailableRange[0])
                        && flat.rooms[0].dateAvailableRange[1] >= new Date(preferences.flat.room.dateAvailableRange[1]));
                }
            )
            .filter(flat => NonEmpty(personalInformation.practiceOfAbstaining, personalInformation.practiceOfAbstaining.every(practice => NonUndefined(flat.flatmatePreferences.practiceOfAbstaining, flat.flatmatePreferences.practiceOfAbstaining.contains(practice)))))
            .filter(flat => flat.flatmates.every(flatmate => inBetween(preferences.flatmates.age, flatmate.age)))
            .filter(flat => inBetween(flat.flatmatePreferences.age, personalInformation.age))
            .filter(flat => flatshareExperienceComparison(flat.flatmatePreferences.flatshareExperience, personalInformation.flatshareExperience))
            .filter(flat => matchBooleanRestrictions(personalInformation.smoker, flat.flatmatePreferences.smokersAllowed))
            .filter(flat => matchBooleanRestrictions(personalInformation.pets, flat.flatmatePreferences.petsAllowed))
            .filter(flat => matchBooleanRestrictions(personalInformation.weekendAbsent, flat.flatmatePreferences.weekendAbsent));

        const matchedScores = filteredFlats.map(flat => {
            const equipmentScore = calculateEquipmentScore(flat.flatEquipment, preferences.flatEquipment);
            const flatmateScore = calculateFlatmateScore(flat.flatmates, personalInformation);
            const flatActivityScore = calculateFlatshareActivityScore(flat.flatmatePreferences.activities, preferences.activities);
            return Math.round(((equipmentScore + flatmateScore + flatActivityScore) / 3) * 100)
        });

        const res = convertToSearchResult(filteredFlats, matchedScores);

        return res.sort((a, b) => b.matched - a.matched)
    } catch (e) {
        console.log(e);
        return null
    }
};
