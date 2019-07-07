import {Document, Model, model, Schema} from "mongoose";

//TODO (Q) wait for flat offerer registration
interface ISchedule {
    timeslots: [];
}

// TODO (Q) how should I use this?
interface ITimeSlot {
    dateTime: Date;
    userId: string;
}

export interface IScheduleModel extends ISchedule, Document {

}

var TimeSlotSchema: Schema = new Schema({
    dateTime: {
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
    timeslots: {
        type: [TimeSlotSchema],
        default: []
    }
}, {versionKey: false});

const Schedule: Model<IScheduleModel> = model<IScheduleModel>("Schedule", ScheduleSchema);
export default Schedule