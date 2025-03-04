import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const dbResponse = await mongoose.connect(
      `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
    );
    console.log("MongoDB Atlas is connected to", dbResponse.connection.host);
  } catch (error: unknown) {
    console.error(
      "Connection to MongoDB Atlas failed:",
      (error as Error).message
    );
    process.exit(1);
  }
};

export default connectDB;
