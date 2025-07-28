import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema({
    likedBy: {
        type: Schema.ObjectId,
        ref: "User"
    },
    video: {
        type: Schema.ObjectId,
        ref: "Video"
    },
    tweet: {
        type: Schema.ObjectId,
        ref: "Tweet"
    },
    comment: {
        type: Schema.ObjectId,
        ref: "Comment"
    }
},{timestamps: true});

const Like = mongoose.model("Like", likeSchema);

export default Like;