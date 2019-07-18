import * as config from 'config'
import * as crypto from 'crypto'
import * as nodemailer from 'nodemailer'
import Token, {ITokenModel} from "../tokens/token";
import {IUserModel, User} from "./user";


export let sendVerificationMail = async (user) => {
    const token: ITokenModel = new Token({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});

    await token.save();

    // Send email
    const nodemailerOptions:any = config.get('nodemailer');
    const transporter = nodemailer.createTransport(nodemailerOptions);
    const mailOptions = {
        from: nodemailerOptions.auth.user,
        to: user.email,
        subject: 'Account Verification Token',
        text: `Hello,\n\n Please verify your account by clicking the link: \nhttp://${config.get('host')}:${config.get('frontend_port')}/confirmation/${token.token}\n`
    };
    await transporter.sendMail(mailOptions)
};

export let getUserByToken = async (token: String) => {
    const user: IUserModel = await User.findOne({jwt_token: token});
    return user
}



