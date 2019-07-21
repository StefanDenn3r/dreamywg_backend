import {FlatOfferer} from "./flatOfferer";
import {Flat} from "../flats/flat";
import {Logger} from "../utils/logger";
import {UserService} from "../users/userService";
import {Type} from "../utils/selectionEnums";
import {FlatService} from "../flats/flatService";


export class FlatOffererService {
    /**
     * Database functions
     */
    static async getAllFlatofferers() {
        try {
            return await FlatOfferer.find();
        } catch (e) {
            Logger.logger.error(e.message);
            return null
        }
    }

    static async deleteAllFlatofferers() {
        try {
            return await FlatOfferer.deleteMany({});
        } catch (e) {
            Logger.logger.error(e.message);
            return null
        }
    }

    static async getFlatoffererById(id) {
        try {
            return await FlatOfferer.findById(id);
        } catch (e) {
            Logger.logger.error(e.message);
            return null
        }
    }

    static async getFlatoffererByUser(user) {
        try {
            return await FlatOfferer.findOne({user: user}).populate('flat').exec();
        } catch (e) {
            Logger.logger.error(e.message);
            return null
        }
    }

    static async createFlatOfferer(token, body) {
        const user = await UserService.getUserByToken(token);
        if (!user)
            return null;

        const flat = new Flat(body);

        const flatOfferer = new FlatOfferer();
        flatOfferer.user = user._id;
        flatOfferer.flat = flat._id;
        user.type = Type.OFFERER;

        try {
            return await Promise.all([user.save(), flat.save(), flatOfferer.save()]);
        } catch (e) {
            Logger.logger.error(e.message);
            return null
        }
    }

    static getFlatOffererByFlatId = async (id) => {
        const flat = await FlatService.getFlatById(id);
        if (!flat)
            return null;

        try {
            return await FlatOfferer.findOne({'flat': flat}).populate('user');
        } catch (e) {
            Logger.logger.error(e.message);
            return null
        }
    };
}