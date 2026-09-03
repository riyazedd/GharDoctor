import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9+\-()\s]{7,20}$/, 'Please provide a valid phone number'],
    },

    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 300,
    },

    profileImg: {
      type: String,
      // required: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 128,
    },

    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
