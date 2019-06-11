import {default as User, IUserModel} from './user'
import Token, {ITokenModel} from "../tokens/token";
import {Request, Response} from "express";
import * as crypto from 'crypto'
import * as nodemailer from 'nodemailer'
import * as config from 'config'


export let sendVerificationMail = async (req: Request, res: Response, userId) => {
    //const userId = await req.params.id;
    let user: IUserModel = await User.findById(userId);
    let token: ITokenModel = new Token({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});

    try {
        await token.save();
    } catch (err) {
        return res.status(500).send({msg: err.message});
    }

    // Send email
    const nodemailerOptions = config.get('nodemailer');
    const transporter = nodemailer.createTransport(nodemailerOptions);
    const mailOptions = {
        from: nodemailerOptions.auth.user,
        to: user.email,
        subject: 'Account Verification Token',
        text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation?token=' + token.token + '.\n'
    };
    try {
        transporter.sendMail(mailOptions)
    } catch (err) {
        return res.status(500).send({msg: err.message});
    }

    return res.status(200).send();
};


