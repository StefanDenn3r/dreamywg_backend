import {createLogger, format, transports} from 'winston'
import * as mongoose from 'mongoose'

const {combine, timestamp, label, prettyPrint, printf, json} = format;

export class Logger {
    public static myFormat = printf(info => {
        return `[${info.timestamp}] [${info.level}] => ${info.message}`
    });

    public static logger = createLogger({
        transports: [
            new transports.File({
                level: 'info',
                filename: 'aggregated.log',
                format: combine(
                    label({label: 'api errors'}),
                    timestamp(),
                    json()
                ),
            }),
            new transports.Console({
                level: 'error',
                handleExceptions: true,
                format: combine(
                    label({label: 'api errors'}),
                    timestamp(),
                    printf(info => {
                        return `[${info.timestamp}] [${info.level}] => ${info.message}`
                    })
                ),
            }),
        ],
        exitOnError: false,
    })
}

export class WinstonStream {
    write(text: string) {
        mongoose.set('debug', true);
        Logger.logger.info(text);
        Logger.logger.debug(text)
    }
}


