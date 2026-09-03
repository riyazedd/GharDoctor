import { randomUUID } from 'crypto';
import asyncHandler from '../middleware/asyncHandler.js';
import Booking from '../models/bookingModel.js';
import Service from '../models/serviceModel.js';
import ServiceProvider from '../models/serviceProviderModel.js';

const TIME_SLOTS = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];
const ACTIVE_STATUSES = ['Scheduled', 'In Progress', 'Completed'];
const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date)
  && !Number.isNaN(new Date(`${date}T00:00:00`).getTime());
const isAdmin = (req) => req.actor?.role === 'admin';
const isBookingUser = (req, booking) => req.actor?.role === 'user' && String(booking.userId) === req.actor.id;
const isBookingProvider = (req, booking) => req.actor?.role === 'provider' && String(booking.serviceProviderId) === req.actor.id;

const canAccessBooking = (req, booking) => isAdmin(req) || isBookingUser(req, booking) || isBookingProvider(req, booking);

const createBooking = asyncHandler(async (req, res) => {
  if (req.actor?.role !== 'user') return res.status(403).json({ message: 'Only customers can create bookings' });

  const { serviceId, serviceProviderId, date, time, address, instructions } = req.body;
  if (!serviceId || !serviceProviderId || !date || !time || !address?.trim()) {
    return res.status(400).json({ message: 'Service, provider, date, time, and address are required' });
  }
  if (!isValidDate(date) || date < new Date().toISOString().slice(0, 10)) {
    return res.status(400).json({ message: 'Date must be today or a future date in YYYY-MM-DD format' });
  }
  if (!TIME_SLOTS.includes(time)) return res.status(400).json({ message: 'Invalid booking time slot' });

  const [service, provider] = await Promise.all([Service.findById(serviceId), ServiceProvider.findById(serviceProviderId)]);
  if (!service || !service.isAvailable) return res.status(400).json({ message: 'Selected service is unavailable' });
  if (!provider || !provider.availability || !provider.isVerified) {
    return res.status(400).json({ message: 'Selected provider is unavailable or unverified' });
  }
  if (provider.skill.toLowerCase() !== service.category.toLowerCase()) {
    return res.status(400).json({ message: 'Provider does not offer the selected service category' });
  }

  try {
    const booking = await Booking.create({
      bookingId: `BK-${randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`,
      userId: req.user._id,
      serviceId: service._id,
      serviceProviderId: provider._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`.trim(),
      serviceName: service.serviceName,
      price: service.price,
      duration: service.duration,
      category: service.category,
      image: service.image,
      providerName: `${provider.firstName} ${provider.lastName}`.trim(),
      providerPhone: provider.phone,
      date,
      time,
      address: address.trim(),
      instructions: instructions?.trim() || 'No special instructions provided.',
      status: 'Scheduled',
    });
    return res.status(201).json(booking);
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'This time slot has just been booked. Please choose another slot.' });
    throw error;
  }
});

const getUserBookings = asyncHandler(async (req, res) => {
  if (!isAdmin(req) && (req.actor?.role !== 'user' || req.actor.id !== req.params.userId)) {
    return res.status(403).json({ message: 'You are not allowed to view these bookings' });
  }
  res.json(await Booking.find({ userId: req.params.userId }).sort({ createdAt: -1 }));
});

const getAllBookings = asyncHandler(async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: 'Admin access required' });
  res.json(await Booking.find().sort({ createdAt: -1 }));
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (!canAccessBooking(req, booking)) return res.status(403).json({ message: 'You are not allowed to access this booking' });
  res.json(booking);
});

const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  const { status, address, date, time, instructions } = req.body;

  if (isBookingProvider(req, booking)) {
    if (!status || !['In Progress', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Providers may only update booking status' });
    }
    if (status === 'In Progress' && booking.status !== 'Scheduled') return res.status(400).json({ message: 'Only scheduled bookings can be started' });
    if (status === 'Completed' && !['Scheduled', 'In Progress'].includes(booking.status)) return res.status(400).json({ message: 'This booking cannot be completed' });
    booking.status = status;
  } else if (isBookingUser(req, booking)) {
    if (booking.status !== 'Scheduled') return res.status(400).json({ message: 'Only scheduled bookings can be edited' });
    if (status || date || time) return res.status(400).json({ message: 'Customers may only update address or instructions' });
    if (address?.trim()) booking.address = address.trim();
    if (instructions !== undefined) booking.instructions = instructions.trim() || 'No special instructions provided.';
  } else if (isAdmin(req)) {
    if (status) booking.status = status;
    if (address?.trim()) booking.address = address.trim();
    if (date) booking.date = date;
    if (time) booking.time = time;
    if (instructions !== undefined) booking.instructions = instructions.trim() || 'No special instructions provided.';
  } else {
    return res.status(403).json({ message: 'You are not allowed to update this booking' });
  }
  const updatedBooking = await booking.save();
  if (isBookingProvider(req, booking) && ['Completed', 'Cancelled'].includes(updatedBooking.status)) {
    req.app.get('io')?.to(String(updatedBooking._id)).emit('booking:status', {
      bookingId: String(updatedBooking._id),
      status: updatedBooking.status,
      updatedById: req.actor.id,
      updatedAt: updatedBooking.updatedAt,
      message: updatedBooking.status === 'Completed'
        ? `Your ${updatedBooking.serviceName} booking has been completed.`
        : `Your ${updatedBooking.serviceName} booking has been cancelled by the provider.`,
    });
  }
  res.json(updatedBooking);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (!isAdmin(req) && !isBookingUser(req, booking)) {
    return res.status(403).json({ message: 'Only the customer or an admin can cancel this booking' });
  }
  if (!['Scheduled', 'In Progress'].includes(booking.status)) return res.status(400).json({ message: 'This booking cannot be cancelled' });
  booking.status = 'Cancelled';
  res.json(await booking.save());
});

const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (!isAdmin(req) && !isBookingUser(req, booking)) return res.status(403).json({ success: false, message: 'You are not allowed to delete this booking' });
  if (!['Cancelled', 'Completed'].includes(booking.status)) return res.status(400).json({ success: false, message: 'Only cancelled or completed bookings can be deleted.' });
  await booking.deleteOne();
  res.json({ success: true, message: 'Booking deleted successfully.' });
});

const getProviderBookings = asyncHandler(async (req, res) => {
  if (!isAdmin(req) && (req.actor?.role !== 'provider' || req.actor.id !== req.params.providerId)) {
    return res.status(403).json({ message: 'You are not allowed to view these bookings' });
  }
  res.json(await Booking.find({ serviceProviderId: req.params.providerId }).sort({ createdAt: -1 }));
});

const getAvailableTimeSlots = asyncHandler(async (req, res) => {
  const { providerId, date } = req.params;
  if (!isValidDate(date)) return res.status(400).json({ message: 'Invalid date format' });
  const bookedSlots = await Booking.find({ serviceProviderId: providerId, date, status: { $in: ACTIVE_STATUSES } }).select('time');
  const bookedTimes = bookedSlots.map((booking) => booking.time);
  res.json({ date, allSlots: TIME_SLOTS, bookedSlots: bookedTimes, availableSlots: TIME_SLOTS.filter((slot) => !bookedTimes.includes(slot)) });
});

export { createBooking, getUserBookings, getAllBookings, getBookingById, updateBooking, cancelBooking, deleteBooking, getProviderBookings, getAvailableTimeSlots };
