import {FlatOfferer} from "./flatOfferer";
import {Flat} from "../flats/flat";
import {Logger} from "../utils/logger";
import {UserService} from "../users/userService";
import {saveImageToFile} from "../utils/file";
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
            Logger.logger.error(e);
            return null
        }
    }

    static async deleteAllFlatofferers() {
        try {
            return await FlatOfferer.deleteMany({});
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async getFlatoffererById(id) {
        try {
            return await FlatOfferer.findById(id);
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async createFlatOfferer(token, body) {
        const user = await UserService.getUserByToken(token);
        if (!user)
            return null;

        const promises = body.images.map(async image => {
            return await saveImageToFile(image);
        });
        try {
            body.images = await Promise.all(promises);

            body.rooms.forEach(async room => {
                room.image = await saveImageToFile(room.image)
            })
        } catch (e) {
            Logger.logger.error(e);
            return null
        }

        const flat = new Flat(body);

        const flatOfferer = new FlatOfferer();
        flatOfferer.user = user._id;
        flatOfferer.flat = flat._id;
        user.type = Type.OFFERER;

        try {
            return await Promise.all([user.save(), flat.save(), flatOfferer.save()]);
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static getFlatOffererByFlatId = async (id) => {
        const flat = FlatService.getFlatById(id);
        if (!flat)
            return null;

        try {
            return await FlatOfferer.findOne({'flat': flat}).populate('user');
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    };
}