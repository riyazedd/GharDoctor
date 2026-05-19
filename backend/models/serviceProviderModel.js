import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const serviceProviderSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    skill: {
      type: String,
      required: true,
    },

    experience: {
      type: Number,
      required: true,
      default: 0,
    },

    availability: {
      type: Boolean,
      default: true,
    },

    citizenshipImage: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

serviceProviderSchema.methods.matchPassword = async function (
  enteredPassword
) {
  return await bcrypt.compare(enteredPassword, this.password);
};

serviceProviderSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const ServiceProvider = mongoose.model(
  "ServiceProvider",
  serviceProviderSchema
);

export default ServiceProvider;