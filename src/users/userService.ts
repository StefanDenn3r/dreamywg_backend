import * as config from 'config'
import * as nodemailer from 'nodemailer'
import {IUserModel, User} from "./user";
import {Logger} from "../utils/logger";
import axios from "axios";
import * as querystring from "querystring";
import {sendVerificationMail} from "../../dist/users/userService";
import * as bcrypt from 'bcrypt'
import {merge} from "lodash";
import * as jwt from "jsonwebtoken";
import {TokenService} from "../tokens/tokenService";
import {ITokenModel} from "../tokens/token";

const serverUrl = `http://${config.get('host')}:${config.get('port')}`;

export class UserService {
    constructor() {

    }

    static getUserByToken = async (token: String) => {
        try {
            return await User.findOne({jwt_token: token});
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    };

    static async oAuth(code, state, provider, path) {
        if (code && state) {
            try {
                const redirectUrl = `${serverUrl}/users/${path}`;
                const clientId = config.get(`${provider}.clientId`);
                const clientSecret = config.get(`${provider}.clientSecret`);
                const data = {
                    grant_type: "authorization_code",
                    code: code,
                    state: state,
                    redirect_uri: redirectUrl,
                    client_id: clientId,
                    client_secret: clientSecret
                };
                const url: string = config.get(`${provider}.handshakeUrl`);

                const headers = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                };

                const result = await axios.post(url, querystring.stringify(data), provider === 'linkedIn' ? headers : {});
                const user = await User.findById(state);
                user.isVerifiedBySocialMedia = true;
                user.accessTokenFacebook = result.data.access_token;
                await user.save();
            } catch (e) {
                Logger.logger.error(e);
                return null
            }
        }
    }

    static async login(user, credentials) {
        const validate = bcrypt.compareSync(credentials.password, user.password.valueOf());

        if (validate) {
            const body = {_id: user._id, email: user.email};

            const token = jwt.sign({user: body}, 'top_secret');
            user.jwt_token = token;
            try {
                await user.save();

                return {
                    user: user,
                    token: token
                }
            } catch (e) {
                Logger.logger.error(e);
                return null
            }
        } else {
            return {errorMessage: 'Username and password don\'t match.'}
        }
    }

    static async confirmEmail(tokenParam) {
        const token: ITokenModel = await TokenService.getToken(tokenParam);

        if (!token) {
            return {errorMessage: "Token not found"};
        }

        const user: IUserModel = await UserService.getUserById(token._userId)
        if (!user) {
            return {errorMessage: "invalid token"};
        }

        const updatedUser = await this.updateUser(user, {isVerifiedByMail: true});
        if (!updatedUser)
            return null;
        else
            return updatedUser;
    }

    /**
     * Database functions
     */
    static async getAllUsers() {
        try {
            return await User.find();
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async getUserById(id) {
        try {
            return await User.findById(id);
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async getUserByEmail(email) {
        try {
            return await User.findOne({email: email});
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }


    static async createUser(user) {
        try {
            user.password = bcrypt.hashSync(user.password, 10);
            await user.save();
            await sendVerificationMail(user);
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async updateUser(user, values) {

        const mergedUser = merge(user, values);

        try {
            return await mergedUser.save()
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async deleteUserById(id) {
        try {
            return await User.findByIdAndDelete(id);
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }

    static async deleteAllUsers() {
        try {
            return await User.deleteMany({});
        } catch (e) {
            Logger.logger.error(e);
            return null
        }
    }


    /**
     * Private functions
     */

    private sendVerificationMail = async (user) => {

        const token = await TokenService.createToken(user)
        if (!token)
            return null

        // Send email
        const nodemailerOptions: any = config.get('nodemailer');
        const transporter = nodemailer.createTransport(nodemailerOptions);
        const mailOptions = {
            from: nodemailerOptions.auth.user,
            to: user.email,
            subject: 'Account Verification Token',
            text: `Hello,\n\n Please verify your account by clicking the link: \nhttp://${config.get('host')}:${config.get('frontend_port')}/confirmation/${token.token}\n`
        };
        await transporter.sendMail(mailOptions)
    };
}