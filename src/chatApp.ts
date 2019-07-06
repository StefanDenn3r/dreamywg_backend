import * as config from 'config';
import {ChatServer} from './chatServer';

let app = new ChatServer().getApp();

export {app};