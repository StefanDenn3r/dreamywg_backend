import { createServer, Server } from 'http';
import * as express from 'express';
import * as mongoose from "mongoose";
import * as socketIo from 'socket.io';
import { Message } from './chat';
import * as chatContoller from './chat/chatController';
import {APILogger} from "./utils/logger";
import * as config from "config";

export class ChatServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: socketIo.Server;
    private port: string | number;
    private mongoUrl: string = config.get('mongo.URI');
    private clients =[];
    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
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

    private async sockets(){
        this.io = socketIo(this.server);
        await this.mongoSetup();
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);
            socket.on('storeClientInfo', function (data) {
                let clientInfo = {
                    customId : data.customId,
                    clientId : socket.id
                };
                this.clients.push(clientInfo);
                this.io.broadcast.emit('broadcastClientInfo', this.clients);
                this.io.emit('selfBroadcastClientInfo', this.clients);
            });

            socket.on('message', (m: Message) => {
                console.log('[server](message): %s', JSON.stringify(m));
                this.io.emit('receive_message', m);
                //store message on mongod
                const message = JSON.parse(JSON.stringify(m));
                console.log("storing chat to db 1", message)

                for (let client of this.clients) {
                    console.log("client info", client)
                    if(client.customId === message.receiver){

                        this.io.to(client.clientId).emit('testmessage',message);
                    }
                }


                chatContoller.storeChattoDB(message.user1, message.user2, message.content, message.timestamp);

            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }
    private async mongoSetup() {
        try {
            await mongoose.connect(this.mongoUrl, {socketOptions: config.get("mongo.config")});
            APILogger.logger.info(
                `Connection to MongoDB at ${this.mongoUrl} established`
            );
        } catch (err) {
            APILogger.logger.error(
                `Connection to MONGO DB failed : ${err} - Shutting down Server`
            );
        }
    }
    public getApp(): express.Application {
        return this.app;
    }
}