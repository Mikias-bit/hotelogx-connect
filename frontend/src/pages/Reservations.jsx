import React, { useState } from 'react';
import { 
  format, 
  addDays, 
  subDays, 
  startOfToday, 
  eachDayOfInterval, 
  parseISO,
  differenceInDays
} from 'date-fns';
import { 
  Plus, Search, Filter, ChevronLeft, ChevronRight, X,
  Calendar as CalendarIcon, CreditCard, User, MapPin, Globe, Bed
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, Badge, Button, Drawer } from '../components/common/UI';
import { cn } from '../utils/cn';

const Reservations = () => {
  const { bookings, addBooking, updateBooking, deleteBooking, rooms, addToast } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('All');
  
  // Timeline State
  const [viewMode, setViewMode] = useState('Day'); // 'Day' (7 days) or 'Week' (14 days)
  const [viewDate, setViewDate] = useState(new Date('2026-05-01')); // Setting to May 1st to match sample data
  
  const daysToShow = viewMode === 'Day' ? 7 : 14;
  const timelineDays = eachDayOfInterval({
    start: viewDate,
    end: addDays(viewDate, daysToShow - 1)
  });

  const handlePrev = () => {
    setViewDate(prev => subDays(prev, daysToShow));
  };

  const handleNext = () => {
    setViewDate(prev => addDays(prev, daysToShow));
  };

  const [formData, setFormData] = useState({
    guestName: '',
    room: '101',
    checkIn: '',
    checkOut: '',
    roomType: 'Deluxe',
    price: 150,
    source: 'Direct',
    paymentStatus: 'pending'
  });

  const handleOpenDrawer = (booking = null) => {
    setSelectedBooking(booking);
    if (booking) {
      setFormData({
        guestName: booking.guestName,
        room: booking.room,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        roomType: 'Deluxe',
        price: booking.amount,
        source: booking.source || 'Direct',
        paymentStatus: booking.paymentStatus || 'pending'
      });
    } else {
      setFormData({
        guestName: '',
        room: '101',
        checkIn: '',
        checkOut: '',
        roomType: 'Deluxe',
        price: 150,
        source: 'Direct',
        paymentStatus: 'pending'
      });
    }
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.guestName || !formData.checkIn || !formData.checkOut) {
      addToast('Please fill all required fields', 'error');
      return;
    }
    
    let success = false;
    if (selectedBooking) {
      success = updateBooking(selectedBooking.id, formData);
    } else {
      success = addBooking({
        ...formData,
        status: 'confirmed',
        amount: formData.price
      });
    }
    
    if (success) {
      setIsDrawerOpen(false);
    }
  };

  const handleDelete = () => {
    if (selectedBooking) {
      deleteBooking(selectedBooking.id);
      setIsDrawerOpen(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const hasBookingMatch = bookings.some(b => 
      b.room === room.id && 
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterSource === 'All' || b.source === filterSource)
    );
    
    if (filterSource !== 'All' && !hasBookingMatch) {
        return false;
    }

    return searchQuery === '' || room.id.includes(searchQuery) || hasBookingMatch;
  });

  const filteredBookingsForMobile = bookings.filter(b => {
    const matchesSearch = b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || b.room.includes(searchQuery);
    const matchesSource = filterSource === 'All' || b.source === filterSource;
    return matchesSearch && matchesSource;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reservations</h1>
          <p className="text-slate-500 mt-1">Manage guest bookings and room availability.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search bookings or rooms..." 
              className="input-field pl-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              className="input-field py-2 text-sm flex-1 md:w-[150px]"
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
            >
              <option value="All">All Sources</option>
              <option value="Direct">Direct</option>
              <option value="Booking.com">Booking.com</option>
              <option value="Expedia">Expedia</option>
              <option value="Airbnb">Airbnb</option>
            </select>
            <Button onClick={() => handleOpenDrawer()} className="gap-2 flex-1 md:w-auto justify-center">
              <Plus size={18} /> New Booking
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Timeline Layout */}
      <Card className="p-0 overflow-hidden hidden lg:block">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-800">Booking Timeline</h3>
            <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('Day')}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                  viewMode === 'Day' ? "bg-primary-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                Day
              </button>
              <button 
                onClick={() => setViewMode('Week')}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                  viewMode === 'Week' ? "bg-primary-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                Week
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="p-2 h-auto rounded-xl hover:bg-slate-100" onClick={handlePrev}><ChevronLeft size={18} /></Button>
            <span className="text-sm font-bold text-slate-800 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
              {format(timelineDays[0], 'MMM dd')} - {format(timelineDays[timelineDays.length - 1], 'MMM dd, yyyy')}
            </span>
            <Button variant="secondary" className="p-2 h-auto rounded-xl hover:bg-slate-100" onClick={handleNext}><ChevronRight size={18} /></Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-4 md:px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-32 md:w-48 sticky left-0 bg-slate-50 z-40">Room</th>
                {timelineDays.map(day => (
                  <th key={day.toString()} className="px-3 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 min-w-[100px] md:min-w-[120px]">
                    <div className="flex flex-col items-center">
                      <span className="text-slate-900 text-xs">{format(day, 'EEE')}</span>
                      <span className="text-[10px]">{format(day, 'MMM dd')}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.id} className="h-24 hover:bg-slate-50/50 transition-colors relative">
                  <td className="px-4 md:px-6 py-4 border-b border-slate-100 sticky left-0 bg-white z-30 font-bold text-slate-800 text-sm w-32 md:w-48 shadow-[10px_0_15px_-3px_rgba(0,0,0,0.04)]">
                    <div className="flex flex-col">
                      <span className="text-slate-900">Room {room.id}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{room.type}</span>
                    </div>
                  </td>
                  <td colSpan={timelineDays.length} className="p-0 border-b border-slate-100 relative h-24">
                    {/* Day Grid Lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {timelineDays.map(day => (
                        <div key={day.toString()} className="flex-1 border-r border-slate-100/50 last:border-0" />
                      ))}
                    </div>
                    
                    {/* Booking Bars */}
                    {bookings.filter(b => b.room === room.id).map((booking) => {
                      const checkIn = parseISO(booking.checkIn);
                      const checkOut = parseISO(booking.checkOut);
                      
                      const timelineStart = timelineDays[0];
                      const timelineEnd = timelineDays[timelineDays.length - 1];
                      
                      // Check if booking overlaps with current timeline
                      const isOverlapping = checkIn <= timelineEnd && checkOut >= timelineStart;
                      
                      if (!isOverlapping) return null;
                      
                      const start = checkIn < timelineStart ? timelineStart : checkIn;
                      const end = checkOut > timelineEnd ? timelineEnd : checkOut;
                      
                      const diffDays = differenceInDays(end, start) + 1;
                      const offsetDays = differenceInDays(start, timelineStart);
                      
                      const left = (offsetDays / timelineDays.length) * 100;
                      const width = (diffDays / timelineDays.length) * 100;
                      
                      return (
                        <div 
                          key={booking.id}
                          onClick={() => handleOpenDrawer(booking)}
                          style={{ left: `${left}%`, width: `${width}%` }}
                          className={cn(
                            "absolute top-3 bottom-3 mx-1 rounded-xl p-3 cursor-pointer shadow-md flex flex-col justify-center border-l-4 transition-all hover:scale-[1.01] hover:z-30 z-20 overflow-hidden",
                            booking.status === 'checked-in' ? "bg-emerald-600 border-emerald-400 text-white" :
                            booking.status === 'checked-out' ? "bg-slate-400 border-slate-300 text-white" :
                            "bg-primary-600 border-primary-400 text-white"
                          )}
                        >
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-tight truncate">{booking.guestName}</span>
                            <div className="flex items-center gap-2 mt-1.5">
                              {booking.source && booking.source !== 'Direct' && (
                                <span className="bg-white/20 text-white text-[8px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 uppercase">
                                  <Globe size={10} /> {booking.source}
                                </span>
                              )}
                              <span className="text-[10px] opacity-90 font-bold truncate tracking-tight">{booking.id} • ${booking.amount}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-4">
        {filteredBookingsForMobile.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No bookings found matching your filters.
          </div>
        ) : (
          filteredBookingsForMobile.map((booking) => (
            <Card key={booking.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow border-slate-200" onClick={() => handleOpenDrawer(booking)}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{booking.guestName}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
                    <CalendarIcon size={12} className="text-slate-400" />
                    {booking.checkIn} <span className="text-slate-300">→</span> {booking.checkOut}
                  </p>
                </div>
                <Badge variant={
                  booking.status === 'checked-in' ? "success" :
                  booking.status === 'checked-out' ? "slate" :
                  "primary"
                }>
                  {booking.status.replace('-', ' ')}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2 items-center text-xs mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <Bed size={14} className="text-slate-400" />
                  Room {booking.room}
                </div>
                <div className="w-[1px] h-3 bg-slate-300 mx-1"></div>
                <div className="flex items-center gap-1 font-black text-slate-800">
                  ${booking.amount}
                </div>
                {booking.source && booking.source !== 'Direct' && (
                  <>
                    <div className="w-[1px] h-3 bg-slate-300 mx-1"></div>
                    <div className="flex items-center gap-1 text-primary-600 font-bold uppercase text-[10px] tracking-wider">
                      <Globe size={12} /> {booking.source}
                    </div>
                  </>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title={selectedBooking ? 'Booking Details' : 'New Reservation'}
        subtitle="Manage stay details and room assignment."
        footer={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {selectedBooking ? (
              <>
                <Button variant="danger" className="flex-1 w-full" onClick={handleDelete}>Delete</Button>
                <Button className="flex-1 w-full" onClick={handleSubmit}>Update Booking</Button>
              </>
            ) : (
              <>
                <Button variant="secondary" className="flex-1 w-full" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
                <Button className="flex-1 w-full" onClick={handleSubmit}>Confirm Booking</Button>
              </>
            )}
          </div>
        }
      >
        <form className="space-y-6" onSubmit={e => e.preventDefault()}>
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Guest Information</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                className="input-field pl-10" 
                placeholder="Full Name" 
                value={formData.guestName} 
                onChange={e => setFormData({...formData, guestName: e.target.value})} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Check-in</label>
              <input 
                type="date" 
                className="input-field w-full" 
                value={formData.checkIn} 
                onChange={e => setFormData({...formData, checkIn: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Check-out</label>
              <input 
                type="date" 
                className="input-field w-full" 
                value={formData.checkOut} 
                onChange={e => setFormData({...formData, checkOut: e.target.value})} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Room Selection</label>
              <select 
                className="input-field w-full" 
                value={formData.room} 
                onChange={e => setFormData({...formData, room: e.target.value})}
              >
                {rooms.map(r => <option key={r.id} value={r.id}>Room {r.id} - {r.type}</option>)}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Booking Source</label>
              <select 
                className="input-field w-full" 
                value={formData.source} 
                onChange={e => {
                  const source = e.target.value;
                  const paymentStatus = source !== 'Direct' ? 'paid' : 'pending';
                  setFormData({...formData, source, paymentStatus});
                }}
              >
                <option value="Direct">Direct</option>
                <option value="Booking.com">Booking.com</option>
                <option value="Expedia">Expedia</option>
                <option value="Airbnb">Airbnb</option>
              </select>
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-500 font-medium">Amount</span>
              <span className="text-sm font-black text-slate-900">${formData.price || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500 font-medium">Payment Status</span>
              <Badge variant={formData.paymentStatus === 'paid' ? 'success' : 'warning'}>
                {formData.paymentStatus}
              </Badge>
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default Reservations;
