import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema({
    owner: {
        type: Schema.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        required: true,
        trim: true,
    }
},{timestamps: true});

const Tweet = mongoose.model("Tweet", tweetSchema);

export default Tweet;