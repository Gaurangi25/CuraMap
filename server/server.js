import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import MongoStore from "connect-mongo";

import session from "express-session";
import passport from "./config/passport.js";

import hospitalRoutes from "./routes/hospitals.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

//console.log("JWT SECRET : ",process.env.JWT_SECRET);

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:3000", "https://cura-map.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

// to get nearby hospitals
app.use("/api/hospitals", hospitalRoutes);

app.get("/", (req, res) => {
  res.send("CuraMap is running");
});

/* google oauth connection using passport.js */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sessionsecret",
    resave: false,
    saveUninitialized: false,

    /* Warning: connect.session() MemoryStore is not -> for this error express-mongo is used */
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/api/auth", authRoutes); //Using auth routes

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
