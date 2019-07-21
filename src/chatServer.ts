import {createServer, Server} from 'http';
import * as express from 'express';
import * as mongoose from "mongoose";
import * as socketIo from 'socket.io';
import {Logger} from "./utils/logger";
import * as config from "config";
import {ChatService} from "./chat/chatService";

export class ChatServer {
    public static readonly PORT: number = 8080;
    private app: express.Application;
    private server: Server;
    private io: socketIo.Server;
    private port: string | number;
    private mongoUrl: string = config.get('mongo.URI');
    private clients = new Map();
    private socket;

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }

    public getApp(): express.Application {
        return this.app;
    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = createServer(this.app);

    }

    private config(): void {
        this.port = process.env.PORT || ChatServer.PORT;
    }

    private async sockets() {
        this.io = socketIo(this.server);
        await this.mongoSetup();
    }

    private async listen() {
        this.server.listen(this.port, () => {
            Logger.logger.info(`Running server on port ${this.port}`);
        });

        this.io.on('connect', this.connect.bind(this));
    }

    private connect(socket) {
        Logger.logger.info(`Connected client on port ${this.port}`);
        this.socket = socket;
        socket.on('storeClientInfo', this.storeClientInfo.bind(this));
        socket.on('sendMessage', this.message.bind(this));

        socket.on('disconnect', () => {
            Logger.logger.info('Client disconnected');
        });
    }

    private storeClientInfo(data) {
        this.clients[data.userId] = this.socket.id
    }

    private async message(message) {
        Logger.logger.info(`[server](message): ${JSON.stringify(message)}`);

        const user1 = message.user1;
        const user2 = message.user2;

        const receiverId = (user1.id === message.senderId) ? user2.id : user1.id;

        const receiverSocketId = this.clients[receiverId];
        if (receiverSocketId) {
            this.io.to(receiverSocketId).emit('reply', message);
        }

        await ChatService.updateChatUnit(user1, user2, message.senderId, message.content, message.timestamp);
    }

    private async mongoSetup() {
        try {
            await mongoose.connect(this.mongoUrl, config.get("mongo.config"));
            Logger.logger.info(
                `Connection to MongoDB at ${this.mongoUrl} established`
            );
        } catch (err) {
            Logger.logger.error(
                `Connection to MONGO DB failed : ${err} - Shutting down Server`
            );
        }
    }
}