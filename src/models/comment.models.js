import mongoose, {Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true,
    },
    owner: {
        type: Schema.ObjectId,
        ref: "User"
    },
    videos: {
        type: Schema.ObjectId,
        ref: "Video"
    }
}, {timestamps: true});

commentSchema.plugin(mongooseAggregatePaginate);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;