import { connect } from "mongoose";
const connectToDB = async () => {
    try {
        await connect(process.env.MONGODB as string);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log(`Couldn't connect to MongoDB: ${err}`);
    }
}

export default connectToDB;