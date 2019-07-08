import {Document, Model, model, Schema} from "mongoose";

//TODO (Q) wait for flat offerer registration
interface ISchedule {
    timeslots: ITimeSlot[];
}

// TODO (Q) how should I use this?
export interface ITimeSlot {
    dateTime: Date;
    userId: string;
}

export interface IScheduleModel extends ISchedule, Document {

}

export var TimeSlotSchema: Schema = new Schema({
    time: {
        type: Date,
        default: Date(),
        unique: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

export var ScheduleSchema: Schema = new Schema({
    date: {
        type: Date,
        default: Date(),
        unique: true
    },
    timeslots: {
        type: [TimeSlotSchema],
        default: []
    }
}, {versionKey: false});

const Schedule: Model<IScheduleModel> = model<IScheduleModel>("Schedule", ScheduleSchema);
export default Schedule