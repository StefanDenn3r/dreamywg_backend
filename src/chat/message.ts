import {Runtime} from "inspector";
import {User} from './user';

export class Message {
    constructor(private from: User, private content: string, private timestamp: Date) {}
}