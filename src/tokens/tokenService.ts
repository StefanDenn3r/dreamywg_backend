import * as crypto from 'crypto'
import {Logger} from "../utils/logger";
import {ITokenModel, Token} from "./token";

export class TokenService {
    constructor() {

    }

    static getToken = async (token: String) => {
        try {
            return await Token.findOne({token: token});
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    };

    static createToken = async (user) => {
        const token: ITokenModel = new Token({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});

        try {
            await token.save();
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }
}