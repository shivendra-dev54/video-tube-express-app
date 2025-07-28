import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    owner: {
        type: Schema.ObjectId,
        ref: "User"
    },
    videos: {
        type: [Schema.ObjectId],
        ref: "Video"
    }

},{timestamps: true});

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;