import { Message, User } from './';

export class ChatMessage extends Message{
    constructor(from: User, content: string, timestamp: Date) {
        super(from, content, timestamp);
    }
}




