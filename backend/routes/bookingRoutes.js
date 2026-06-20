import express from "express";
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  getProviderBookings,
  getAvailableTimeSlots,
} from "../controller/bookingController.js";

const router = express.Router();

// Create a new booking
router.post("/", createBooking);

// Get all bookings
router.get("/", getAllBookings);

// Get available time slots for a provider on a specific date (must be before /:id route)
router.get("/available-slots/:providerId/:date", getAvailableTimeSlots);

// Get bookings for a specific user
router.get("/user/:userId", getUserBookings);

// Get bookings for a specific service provider
router.get("/provider/:providerId", getProviderBookings);

// Get a specific booking by ID
router.get("/:id", getBookingById);

// Update booking
router.put("/:id", updateBooking);

// Cancel booking
router.delete("/:id", cancelBooking);

export default router;
