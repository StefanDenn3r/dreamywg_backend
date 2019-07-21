import {Logger} from "../utils/logger";
import {Flat} from "./flat";
import {UserService} from "../users/userService";
import {FlatOffererService} from "../flatOfferer/flatOffererService";

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

    static async getFlatByToken(token) {
        const user = await UserService.getUserByToken(token);
        if (!user)
            return null;

        const flatOfferer = await FlatOffererService.getFlatoffererByUser(user);
        if (!flatOfferer)
            return null;

        return flatOfferer.flat;
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