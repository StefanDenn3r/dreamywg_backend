import {Document, Model, model, Schema} from "mongoose";

//TODO (Q) wait for flat offerer registration
interface ISchedule {
    date: Date;
    timeslots: ITimeSlot[];
}

// TODO (Q) how should I use this?
export interface ITimeSlot {
    time: Date;
    userId: string;
    status?: InterviewStatus;
}

export interface IScheduleModel extends ISchedule, Document {

}

enum InterviewStatus {
    IDLE="IDLE", // if no user book the time slot
    BOOKED="BOOKED", // if there's a user book the time slot
    ACCEPTED= "ACCEPTED", // user is accepted
    REJECTED= "REJECTED", // user is rejected
    NO_SHOW= "NO_SHOW" // user is not coming to interview
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
    },
    status: {
        type: String, 
        enum: this.InterviewStatus,
        default: InterviewStatus.IDLE
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