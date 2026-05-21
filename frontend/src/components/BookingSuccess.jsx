import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BookingSuccess({ bookingDetails }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 pt-8">
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 animate-fade-in">
        <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full shadow-lg shadow-emerald-500/5">
          <CheckCircle className="w-12 h-12 stroke-[2.5]" />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Booking Confirmed!
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Your home maintenance appointment has been scheduled successfully. Our professional is informed.
          </p>
        </div>

        {/* Invoice Summary Card */}
        <div className="p-6.5 sm:p-8 rounded-3xl bg-slate-900/30 border border-slate-900 text-left space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Booking reference
              </span>
              <span className="text-sm font-extrabold text-cyan-400">
                {bookingDetails.id}
              </span>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
              Scheduled
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                  Service
                </span>
                <span className="text-sm font-semibold text-slate-200">
                  {bookingDetails.serviceName}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                  Technician / Pro
                </span>
                <span className="text-sm font-medium text-slate-300">
                  {bookingDetails.providerName}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                  Address
                </span>
                <span className="text-sm font-medium text-slate-400">
                  {bookingDetails.address}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                  Date & Time
                </span>
                <span className="text-sm font-medium text-slate-200">
                  {bookingDetails.date} at {bookingDetails.time}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                  Estimated Duration
                </span>
                <span className="text-sm font-medium text-slate-400">
                  {bookingDetails.duration}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                  Total Amount
                </span>
                <span className="text-base font-black text-cyan-400">
                  Rs. {bookingDetails.price}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/bookings')}
            className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-2xl transition-all duration-200 cursor-pointer text-sm tracking-wide active:scale-95 shadow-lg shadow-cyan-500/10"
          >
            View Bookings
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold rounded-2xl transition-all duration-200 cursor-pointer text-sm"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
