import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceProviderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    providerName: {
      type: String,
      required: true,
    },
    providerPhone: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    instructions: {
      type: String,
      default: "No special instructions provided.",
    },
    status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// The database, rather than a pre-insert query, is the authority on whether an
// active provider slot can be reserved.
bookingSchema.index(
  { serviceProviderId: 1, date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['Scheduled', 'In Progress', 'Completed'] } },
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
