import express from "express";
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  deleteBooking,
  getProviderBookings,
  getAvailableTimeSlots,
} from "../controller/bookingController.js";
import { protectAny } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new booking
router.post("/", protectAny, createBooking);

// Get all bookings
router.get("/", protectAny, getAllBookings);

// Get available time slots for a provider on a specific date (must be before /:id route)
router.get("/available-slots/:providerId/:date", getAvailableTimeSlots);

// Get bookings for a specific user
router.get("/user/:userId", protectAny, getUserBookings);

// Get bookings for a specific service provider
router.get("/provider/:providerId", protectAny, getProviderBookings);

// Get a specific booking by ID
router.get("/:id", protectAny, getBookingById);

// Update booking
router.put("/:id", protectAny, updateBooking);

// Cancel booking
router.put("/:id/cancel", protectAny, cancelBooking);

// Delete booking
router.delete("/:id", protectAny, deleteBooking);

export default router;
