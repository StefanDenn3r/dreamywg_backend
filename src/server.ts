import * as bodyParser from "body-parser";
import * as compression from "compression";
import * as helmet from "helmet";
import * as cors from "cors";
import * as errorHandler from "./utils/errorHandler";
import * as express from "express";
import * as config from "config";
import * as morgan from "morgan";
import * as mongoose from "mongoose";
import {APILogger, WinstonStream} from "./utils/logger";


import {UserRoute} from './users/userAPI'
import {FlatOffererRoute} from "./flatOfferer/flatOffererAPI";
import {FlatSeekerRoute} from "./flatSeeker/flatSeekerAPI";
import {FlatRoute} from './flats/flatAPI'
import {ScheduleRoute} from './schedules/scheduleAPI'

class Server {
    public app: express.Application;
    public userRoutes: UserRoute = new UserRoute();
    public flatRoutes: UserRoute = new FlatRoute();
    public flatOffererRoutes: FlatOffererRoute = new FlatOffererRoute();
    public env: string = process.env.NODE_ENV || 'development';
    public port: number | string;
    private mongoUrl: string = config.get('mongo.URI');

    constructor(port: number | string = 5003) {
        this.app = express();
        this.app.set("port", port);
        this.app.set("env", this.env);
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.applyLogger();
        this.applyRoutes();
        this.applyMiddleWare();
        this.start();
    }

    private async start() {
        await this.mongoSetup();
        this.app.listen(this.app.get("port"), () => {
            APILogger.logger.info(
                `Server [${config.get(
                    "name"
                )}] is running at http://localhost:${this.app.get(
                    "port"
                )} in ${this.app.get("env")} Mode`
            );
            APILogger.logger.info("Press CTRL-C to stop");
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
        APILogger.logger.info(
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
        APILogger.logger.info('Applied Routes: [USER][FLAT][AUTHENTICATION][BUSINESS LOGIC]')
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
}

export default Server;
