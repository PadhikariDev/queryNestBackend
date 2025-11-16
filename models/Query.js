import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    text: { type: String, required: true },
    time: { type: Date, default: Date.now },
    tag: { type: String },
    role: { type: String, enum: ["user", "staff", "system"], default: "user" }
});

const querySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categories: [String],
    message: { type: String, required: true, maxLength: 500 },
    tags: [String],
    priority: { type: String, default: "Normal" },
    status: { type: String, default: "Pending" },
    messages: [messageSchema],
    submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Query", querySchema);
