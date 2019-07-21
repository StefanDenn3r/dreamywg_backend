import {createLogger, format, info, transports} from 'winston'

const {combine, timestamp, printf} = format;

export class Logger {

    static format = combine(
        timestamp(),
        printf(log => `[${log.timestamp}] [${log.level}] => ${log.message}`)
    );

    public static logger = createLogger({
        level: 'info',
        transports: [
            new transports.File({level: 'info', filename: 'aggregated.log', format: Logger.format}),
            new transports.Console({level: 'info', format: Logger.format}),
        ],
        exitOnError: false,
    })
}
