import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.ObjectId,
        ref: "User"
    },
    channel: {
        type: Schema.ObjectId,
        ref: "User"
    }
},{timestamps: true});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;