import {Document, Model, model, Schema} from "mongoose";

interface ISchedule {
    date: Date;
    timeslots: ITimeSlot[];
    flatId: string;
}

export interface ITimeSlot {
    startTime: Date;
    endTime: Date;
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
    startTime: {
        type: Date,
        default: Date(),
        unique: true,
        sparse: true
    },
    endTime: {
        type: Date,
        default: Date(),
        unique: true,
        sparse: true
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
}, {
    usePushEach: true
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
    },
    flatId: {
        type: Schema.Types.ObjectId,
        ref: 'Flat'
    }
}, {
    versionKey: false,
    usePushEach: true
});

const Schedule: Model<IScheduleModel> = model<IScheduleModel>("Schedule", ScheduleSchema);
export default Schedule