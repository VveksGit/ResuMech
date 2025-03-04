import dotenv from "dotenv";
import app from "./app";
import connectDB from "./Config/db";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server is running on PORT", process.env.PORT || 8000);
    });
  })
  .catch((error: unknown) => {
    console.error(
      "Failed to connect with MongoDB Atlas",
      (error as Error).message
    );
  });
