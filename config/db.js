import mongoose from "mongoose";
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("db connection established.");
    } catch (error) {
        console.error("MongoDB error:", error);
        process.exit(1);
    }
}
export default connectDB;