import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      max: 10000000,
    },

    image: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
    duration: {
      type: String,
      default: '2-3 hours',
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;
