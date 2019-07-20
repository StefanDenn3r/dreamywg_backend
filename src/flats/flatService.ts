import {Logger} from "../utils/logger";
import {Flat} from "./flat";
import {User} from "../users/user"
import {FlatOfferer} from '../flatOfferer/flatOfferer'

export class FlatService {
    /**
     * Database functions
     */
    static async getAllFlats() {
        try {
            return await Flat.find();
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async deleteAllFlats() {
        try {
            return await Flat.deleteMany({});
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async getFlatById(id) {
        try {
            return await Flat.findById(id);
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async getOffererFlat(token) {
        try {
            const userId = await User.findOne({jwt_token: token}).select("_id");
            const flatOfferer = await FlatOfferer.findOne({user: userId});

            return await Flat.findById(flatOfferer.flat);
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async deleteFlatById(id) {
        try {
            return await Flat.findByIdAndDelete(id);
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async createFlat(flat) {
        try {
            await flat.save();
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }
}