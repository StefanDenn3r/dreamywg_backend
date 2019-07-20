import {Logger} from "../utils/logger";
import {FlatSeeker} from "./flatSeeker";
import {UserService} from "../users/userService";
import {Type} from "../utils/selectionEnums";


export class FlatSeekerService {

    /**
     * Database functions
     */
    static async deleteAllFlatSeekers() {
        try {
            return await FlatSeeker.deleteMany({});
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async getFlatSeekerByUser(user) {
        try {
            return await FlatSeeker.findOne({user: user}).populate('user');
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async getFlatSeekerById(id) {
        try {
            return await FlatSeeker.findById(id);
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async getAllFlatSeekers() {
        try {
            return await FlatSeeker.find();
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async createFlatSeeker(token, body) {
        const user = await UserService.getUserByToken(token);
        if (!user)
            return null;

        const updatedUser = await UserService.updateUser(user, {"type": Type.SEEKER});

        if (!updatedUser)
            return null;

        const newSeeker = new FlatSeeker(body);
        newSeeker.user = updatedUser._id;

        try {
            return await newSeeker.save();
        } catch (e) {
            Logger.logger.error(e);
            return null
        }

    }
}