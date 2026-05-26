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

    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5,
    },

    reviews: {
      type: Number,
      default: 0,
    },

    completedJobs: {
      type: Number,
      default: 0,
    },

    isServiceProvider: {
      type: Boolean,
      default: true,
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

serviceProviderSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const ServiceProvider = mongoose.model(
  "ServiceProvider",
  serviceProviderSchema
);

export default ServiceProvider;