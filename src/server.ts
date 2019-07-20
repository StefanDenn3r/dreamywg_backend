import * as bodyParser from "body-parser";
import * as compression from "compression";
import * as config from "config";
import * as cors from "cors";
import * as express from "express";
import * as helmet from "helmet";
import * as mongoose from "mongoose";
import * as morgan from "morgan";
import * as errorHandler from "./utils/errorHandler";
import {Logger, WinstonStream} from "./utils/logger";


import {FlatOffererRoute} from "./flatOfferer/flatOffererAPI";
import {FlatSeekerRoute} from "./flatSeeker/flatSeekerAPI";
import {FlatRoute} from './flats/flatAPI';
import {ChatRoute} from './chat/chatAPI';
import {ScheduleRoute} from './schedules/scheduleAPI'
import {UserRoute} from './users/userAPI'

export default class Server {
    public app: express.Application;
    public userRoutes: UserRoute = new UserRoute();
    public flatRoutes: UserRoute = new FlatRoute();
    public flatOffererRoutes: FlatOffererRoute = new FlatOffererRoute();
    public chatRoutes: ChatRoute = new ChatRoute();
    public env: string = process.env.NODE_ENV || 'development';
    public port: number | string;
    private mongoUrl: string = config.get('mongo.URI');

    constructor(port: number | string = 5003) {
        this.app = express();
        this.app.set("port", port);
        this.app.set("env", this.env);
        this.app.use('/static', express.static('images'))
        this.app.use(bodyParser.json({limit: '10mb'}));
        this.app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
        this.applyLogger();
        this.applyRoutes();
        this.applyMiddleWare();
        this.start();
    }

    private async start() {
        await this.mongoSetup();
        this.app.listen(this.app.get("port"), () => {
            Logger.logger.info(
                `Server [${config.get(
                    "name"
                )}] is running at http://localhost:${this.app.get(
                    "port"
                )} in ${this.app.get("env")} Mode`
            );
            Logger.logger.info("Press CTRL-C to stop");
        });
    }

    private applyLogger(): void {
        this.app.use(
            morgan(config.get("morganFormat"), {stream: new WinstonStream()})
        );
    }

    private applyMiddleWare(): void {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(compression());
        this.app.use(errorHandler.logging);
        this.app.use(errorHandler.clientErrorHandler);
        this.app.use(errorHandler.errorHandler);
        Logger.logger.info(
            "Applied middleware: [HELMET][CORS][COMPRESSION][LOGGING][ERROR HANDLER]"
        );
    }

    private applyRoutes(): void {
        this.app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header(
                "Access-Control-Allow-Headers",
                "Origin, X-Requested-With, Content-Type, Accept"
            );
            next();
        });

        UserRoute.routes(this.app);
        FlatRoute.routes(this.app);
        FlatOffererRoute.routes(this.app);
        FlatSeekerRoute.routes(this.app);
        ScheduleRoute.routes(this.app);
        ChatRoute.routes(this.app);
    }

    private async mongoSetup() {
        try {
            await mongoose.connect(this.mongoUrl, {socketOptions: config.get("mongo.config")});
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