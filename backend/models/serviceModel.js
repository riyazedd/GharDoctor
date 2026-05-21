import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
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