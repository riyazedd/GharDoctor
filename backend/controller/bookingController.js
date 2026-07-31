import asyncHandler from '../middleware/asyncHandler.js';
import Booking from '../models/bookingModel.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const {
    bookingId,
    userId,
    serviceId,
    serviceProviderId,
    userEmail,
    userName,
    serviceName,
    price,
    duration,
    category,
    image,
    providerName,
    providerPhone,
    date,
    time,
    address,
    instructions,
  } = req.body;

  if (!userId || !serviceId || !serviceProviderId || !date || !time || !address) {
    res.status(400).json({ message: "All required fields must be provided" });
    return;
  }

  // Check if provider already has a booking for the same date and time
  const existingBooking = await Booking.findOne({
    serviceProviderId,
    date,
    time,
    status: { $ne: "Cancelled" }, // Exclude cancelled bookings
  });

  if (existingBooking) {
    res.status(409).json({
      message: "This time slot is already booked for this provider on the selected date. Please choose a different time.",
    });
    return;
  }

  const booking = await Booking.create({
    bookingId: bookingId || `BK-${Math.floor(100000 + Math.random() * 900000)}`,
    userId,
    serviceId,
    serviceProviderId,
    userEmail,
    userName,
    serviceName,
    price,
    duration,
    category,
    image,
    providerName,
    providerPhone,
    date,
    time,
    address,
    instructions: instructions || "No special instructions provided.",
    status: "Scheduled",
  });

  res.status(201).json(booking);
});

// @desc    Get all bookings for a user
// @route   GET /api/bookings/user/:userId
// @access  Private
const getUserBookings = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });

  res.json(bookings);
});

// @desc    Get all bookings (admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });

  res.json(bookings);
});

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);

  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  res.json(booking);
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, address, date, time, instructions } = req.body;

  const booking = await Booking.findById(id);

  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  if (status) booking.status = status;
  if (address) booking.address = address;
  if (date) booking.date = date;
  if (time) booking.time = time;
  if (instructions) booking.instructions = instructions;

  booking.updatedAt = Date.now();

  const updatedBooking = await booking.save();

  res.json(updatedBooking);
});

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);

  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  booking.status = "Cancelled";
  booking.updatedAt = Date.now();

  const cancelledBooking = await booking.save();

  res.json(cancelledBooking);
});



// @desc    Get all bookings for a service provider
// @route   GET /api/bookings/provider/:providerId
// @access  Private
const getProviderBookings = asyncHandler(async (req, res) => {
  const { providerId } = req.params;

  const bookings = await Booking.find({ serviceProviderId: providerId }).sort({
    createdAt: -1,
  });

  res.json(bookings);
});

const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
    });
  }

  if (
    booking.status !== "Cancelled" &&
    booking.status !== "Completed"
  ) {
    return res.status(400).json({
      success: false,
      message: "Only cancelled or completed bookings can be deleted.",
    });
  }

  await booking.deleteOne();

  res.status(200).json({
    success: true,
    message: "Booking deleted successfully.",
  });
});

// @desc    Get available time slots for a provider on a specific date
// @route   GET /api/bookings/available-slots/:providerId/:date
// @access  Public
const getAvailableTimeSlots = asyncHandler(async (req, res) => {
  const { providerId, date } = req.params;

  // All available time slots
  const allTimeSlots = [
    "09:00 AM",
    "11:30 AM",
    "02:00 PM",
    "04:30 PM",
  ];

  // Get booked time slots for this provider on the given date
  const bookedSlots = await Booking.find({
    serviceProviderId: providerId,
    date,
    status: { $ne: "Cancelled" }, // Exclude cancelled bookings
  }).select("time");

  // Extract just the time values
  const bookedTimes = bookedSlots.map((booking) => booking.time);

  // Filter out booked slots
  const availableSlots = allTimeSlots.filter((slot) => !bookedTimes.includes(slot));

  res.json({
    date,
    allSlots: allTimeSlots,
    bookedSlots: bookedTimes,
    availableSlots,
  });
});

export {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  deleteBooking,
  getProviderBookings,
  getAvailableTimeSlots,
};
