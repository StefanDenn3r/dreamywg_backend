import * as crypto from 'crypto'
import {Logger} from "../utils/logger";
import {Token} from "./token";

export class TokenService {

    static getToken = async (token: String) => {
        try {
            return await Token.findOne({token: token});
        } catch (e) {
            Logger.logger.error(e.message);
            return null
        }
    };

    static createToken = async (user) => {
        const token = new Token({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});

        try {
            return await token.save();
        } catch (e) {
            Logger.logger.error(e.message);
            return null
        }
    }
}