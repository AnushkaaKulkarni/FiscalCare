// backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

  gstin: {
  type: String,
  required: true,
  uppercase: true,
  trim: true
},

    // add other fields as needed
  },
  { timestamps: true }
);

// Use an async function that DOES NOT accept `next` parameter.
// This ensures Mongoose will treat it as async middleware and we can use await.
UserSchema.pre("save", async function () {
  // `this` is the document
  if (!this.isModified("password")) return;

  const saltRounds = 10;
  const hashed = await bcrypt.hash(this.password, saltRounds);
  this.password = hashed;
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Avoid OverwriteModelError when hot-reloading or re-importing
const User = mongoose.models.User || mongoose.model("User", UserSchema);



export default User;
