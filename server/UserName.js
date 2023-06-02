import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userName = new Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    points: Number,
    online: Boolean
});

export default mongoose.model('UserName', userName);