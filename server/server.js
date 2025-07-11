import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import hospitalRoutes from "./routes/hospitals.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CuraMap is running");
});

//Using hospital routes
app.use("/api/hospitals", hospitalRoutes);

/* MongoDB Connection */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })

  .catch((error) => {
    console.log("MongoDB connection error : ", error);
  });
