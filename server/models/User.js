import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: { type: String }, // Will be present only for Google-authenticated users
},{
  // for tracking account creation & updates)
  timestamps:true}
);

const User = mongoose.model("User", userSchema);

export default User;
