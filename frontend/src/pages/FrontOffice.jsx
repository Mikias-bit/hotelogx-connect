import React, { useState } from 'react';
import { 
  LogIn, 
  LogOut, 
  UserCheck, 
  Search, 
  MoreHorizontal, 
  FileText, 
  Key,
  CreditCard,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, Badge, Button, Modal } from '../components/common/UI';
import { cn } from '../utils/cn';

const FrontOffice = () => {
  const { rooms, bookings, checkInGuest, checkOutGuest, addToast, updateBooking } = useApp();
  const [activeTab, setActiveTab] = useState('check-in');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [roomTypeFilter, setRoomTypeFilter] = useState('All');
  
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [extraServices, setExtraServices] = useState([]); // { name, price, qty }
  const [newService, setNewService] = useState({ name: '', price: '', qty: 1 });
  const [newCheckOutDate, setNewCheckOutDate] = useState('');
  const [paymentInfo, setPaymentInfo] = useState({ status: 'paid', method: 'Credit Card' });

  // Filter logic for tabs
  const getFilteredData = () => {
    let data = [];
    switch (activeTab) {
      case 'check-in': 
        data = bookings.filter(b => b.status === 'confirmed');
        break;
      case 'in-house': 
        data = bookings.filter(b => b.status === 'IN_HOUSE');
        break;
      case 'check-out': 
        data = bookings.filter(b => b.status === 'completed');
        break;
      default: data = [];
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(item => 
        item.guestName.toLowerCase().includes(q) || 
        item.room.toLowerCase().includes(q)
      );
    }

    if (paymentFilter !== 'All') {
      data = data.filter(item => item.paymentStatus === paymentFilter.toLowerCase());
    }

    if (roomTypeFilter !== 'All') {
      data = data.filter(item => {
        const room = rooms.find(r => r.id === item.room);
        return room?.type === roomTypeFilter;
      });
    }

    return data;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <Badge variant="primary" className="bg-purple-100 text-purple-700 border-purple-200">Confirmed</Badge>;
      case 'IN_HOUSE': return <Badge variant="primary" className="bg-blue-100 text-blue-700 border-blue-200">In House</Badge>;
      case 'completed': return <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-emerald-200">Completed</Badge>;
      default: return <Badge variant="slate">{status}</Badge>;
    }
  };

  const handleOpenCheckIn = (booking) => {
    setSelectedBooking(booking);
    setIsCheckInModalOpen(true);
  };

  const handleConfirmCheckIn = () => {
    checkInGuest(selectedBooking.id, selectedBooking.room);
    setIsCheckInModalOpen(false);
    setActiveTab('in-house');
  };

  const handleOpenServices = (booking) => {
    setSelectedBooking(booking);
    setExtraServices([]);
    setIsServiceModalOpen(true);
  };

  const handleAddService = () => {
    if (!newService.name || !newService.price) return;
    setExtraServices([...extraServices, { ...newService, id: Date.now() }]);
    setNewService({ name: '', price: '', qty: 1 });
    addToast('Service added to folio');
  };

  const handleOpenCheckOut = (booking) => {
    setSelectedBooking(booking);
    // Add some random services if none added for demo
    if (extraServices.length === 0) {
      setExtraServices([
        { name: 'Mini Bar', price: 25, qty: 1 },
        { name: 'Room Service', price: 45, qty: 1 }
      ]);
    }
    setIsCheckOutModalOpen(true);
  };

  const handleConfirmCheckOut = () => {
    checkOutGuest(selectedBooking.id, extraServices, paymentInfo);
    setIsCheckOutModalOpen(false);
    setActiveTab('check-out');
  };

  const calculateTotal = () => {
    if (!selectedBooking) return 0;
    const roomCharges = selectedBooking.amount || 0;
    const servicesTotal = extraServices.reduce((acc, s) => acc + (parseFloat(s.price) * s.qty), 0);
    return roomCharges + servicesTotal;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Front Office</h1>
          <p className="text-slate-500 mt-1">Manage guest arrivals, departures and in-house requests.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto">
          {['check-in', 'in-house', 'check-out'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all capitalize whitespace-nowrap",
                activeTab === tab ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-xl shadow-slate-200/50 border-slate-100">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/30 gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Filter by guest or room..." 
              className="input-field pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              className="input-field py-2 text-sm flex-1 md:w-[150px]"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="All">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <select 
              className="input-field py-2 text-sm flex-1 md:w-[150px]"
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
            >
              <option value="All">All Room Types</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full hidden md:table">
            <thead>
              <tr className="text-left bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Room</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {getFilteredData().length > 0 ? getFilteredData().map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {item.guestName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.guestName}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.checkIn} → {item.checkOut}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">Room {item.room}</span>
                      {activeTab === 'check-out' && (
                        <span className="text-[9px] text-rose-500 font-black uppercase tracking-tight flex items-center gap-1">
                          <AlertCircle size={8} /> Room Needs Cleaning
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={item.paymentStatus === 'paid' ? 'success' : 'warning'} className="text-[10px] uppercase font-black tracking-widest">
                      {item.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {activeTab === 'check-in' && (
                      <Button onClick={() => handleOpenCheckIn(item)} className="h-9 px-4 text-xs bg-emerald-600 hover:bg-emerald-700 gap-2">
                        <LogIn size={14} /> Check-in
                      </Button>
                    )}
                    {activeTab === 'in-house' && (
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => handleOpenServices(item)} className="h-9 px-3 text-xs gap-1.5">
                          <Plus size={14} /> Services
                        </Button>
                        <Button onClick={() => handleOpenCheckOut(item)} className="h-9 px-4 text-xs bg-rose-600 hover:bg-rose-700 gap-2">
                          <LogOut size={14} /> Check-out
                        </Button>
                      </div>
                    )}
                    {activeTab === 'check-out' && (
                      <Button variant="secondary" className="h-9 px-4 text-xs gap-2">
                        <FileText size={14} /> View Folio
                      </Button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <UserCheck size={32} className="opacity-20" />
                      <p className="text-sm font-medium">No guests currently in {activeTab.replace('-', ' ')} stage.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Card Layout */}
          <div className="md:hidden flex flex-col divide-y divide-slate-100">
            {getFilteredData().length > 0 ? getFilteredData().map((item) => (
              <div key={item.id} className="p-5 space-y-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-lg shrink-0">
                      {item.guestName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{item.guestName}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Room {item.room}</p>
                    </div>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stay Dates</p>
                    <p className="text-[10px] font-bold text-slate-700">{item.checkIn} - {item.checkOut}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment</p>
                    <Badge variant={item.paymentStatus === 'paid' ? 'success' : 'warning'} className="text-[9px] py-0 px-2 h-4">
                      {item.paymentStatus}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {activeTab === 'check-in' && (
                    <Button onClick={() => handleOpenCheckIn(item)} className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 gap-2">
                      <LogIn size={16} /> Check-in Guest
                    </Button>
                  )}
                  {activeTab === 'in-house' && (
                    <>
                      <Button variant="secondary" onClick={() => handleOpenServices(item)} className="flex-1 h-11">
                        Services
                      </Button>
                      <Button onClick={() => handleOpenCheckOut(item)} className="flex-1 h-11 bg-rose-600 hover:bg-rose-700">
                        Check-out
                      </Button>
                    </>
                  )}
                  {activeTab === 'check-out' && (
                    <Button variant="secondary" className="w-full h-11 gap-2">
                      <FileText size={16} /> View Folio
                    </Button>
                  )}
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-slate-400">
                <p className="text-sm font-medium">No guests found for {activeTab}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Check-In Modal */}
      <Modal 
        isOpen={isCheckInModalOpen} 
        onClose={() => setIsCheckInModalOpen(false)} 
        title="Guest Check-in"
        footer={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button variant="secondary" className="flex-1" onClick={() => setIsCheckInModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmCheckIn} className="flex-1 bg-emerald-600 hover:bg-emerald-700">Confirm Check-in</Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Confirm Guest Details</p>
            <p className="text-lg font-black text-slate-900">{selectedBooking?.guestName}</p>
            <div className="flex items-center gap-4 mt-2 text-xs font-bold text-emerald-800">
              <span className="flex items-center gap-1"><Calendar size={14} /> {selectedBooking?.checkIn}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> 02:00 PM Arrival</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Assigned Room</label>
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center">
                <span className="font-bold text-slate-800">Room {selectedBooking?.room}</span>
                <Badge variant="primary" className="text-[9px]">Confirmed</Badge>
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex gap-3 text-blue-800">
              <Key className="shrink-0" size={18} />
              <p className="text-xs font-medium leading-relaxed">System will automatically generate a digital key and notify the guest via SMS.</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Services Modal */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title="Manage Folio & Services"
        footer={<Button variant="secondary" className="w-full" onClick={() => setIsServiceModalOpen(false)}>Done</Button>}
      >
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <h4 className="font-black text-slate-900 mb-1">{selectedBooking?.guestName}</h4>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Room {selectedBooking?.room} • In House</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Post Extra Charges</h5>
              <Badge variant="slate" className="text-[9px]">{extraServices.length} items added</Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Service Name" 
                  className="input-field h-10 text-xs flex-[2]"
                  value={newService.name}
                  onChange={e => setNewService({...newService, name: e.target.value})}
                />
                <input 
                  type="number" 
                  placeholder="$" 
                  className="input-field h-10 text-xs flex-1"
                  value={newService.price}
                  onChange={e => setNewService({...newService, price: e.target.value})}
                />
                <Button onClick={handleAddService} className="h-10 px-3 shrink-0"><Plus size={16} /></Button>
              </div>
            </div>

            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
              {extraServices.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-400" />
                    <span className="text-xs font-bold text-slate-700">{s.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">${s.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => { setIsServiceModalOpen(false); setIsExtendModalOpen(true); }} className="w-full gap-2 text-xs">
              <Calendar size={14} /> Extend Guest Stay
            </Button>
          </div>
        </div>
      </Modal>

      {/* Extend Stay Modal */}
      <Modal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        title="Extend Stay"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="secondary" className="flex-1" onClick={() => setIsExtendModalOpen(false)}>Cancel</Button>
            <Button onClick={() => { addToast('Stay extended successfully'); setIsExtendModalOpen(false); }} className="flex-1">Update Dates</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Current Checkout</label>
            <p className="text-sm font-bold text-slate-800">{selectedBooking?.checkOut}</p>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">New Checkout Date</label>
            <input type="date" className="input-field" value={newCheckOutDate} onChange={e => setNewCheckOutDate(e.target.value)} />
          </div>
        </div>
      </Modal>

      {/* Check-Out / Billing Modal */}
      <Modal 
        isOpen={isCheckOutModalOpen} 
        onClose={() => setIsCheckOutModalOpen(false)} 
        title="Billing Summary & Check-out"
        footer={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button variant="secondary" className="flex-1 w-full" onClick={() => setIsCheckOutModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmCheckOut} className="flex-1 w-full bg-rose-600 hover:bg-rose-700 gap-2">
              <CheckCircle2 size={16} /> Complete Check-out
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-black text-slate-900 leading-tight">Guest: {selectedBooking?.guestName}</h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Room {selectedBooking?.room} • {selectedBooking?.checkIn} - {selectedBooking?.checkOut}</p>
            </div>
            <Badge variant={paymentInfo.status === 'paid' ? 'success' : 'warning'} className="uppercase font-black text-[9px] tracking-widest">
              {paymentInfo.status === 'paid' ? 'Paid' : 'Unpaid'}
            </Badge>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500 uppercase tracking-widest">Room Charges</span>
                <span className="text-slate-900">${selectedBooking?.amount || 0}</span>
              </div>
              {extraServices.map((s, idx) => (
                <div key={idx} className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500 uppercase tracking-widest">{s.name} (x{s.qty})</span>
                  <span className="text-slate-900">${s.price * s.qty}</span>
                </div>
              ))}
            </div>
            <div className="h-[1px] bg-slate-200 border-dashed border"></div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Amount</span>
              <span className="text-2xl font-black text-primary-600 tracking-tight">${calculateTotal()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Payment Status</label>
              <select className="input-field h-10 text-xs" value={paymentInfo.status} onChange={e => setPaymentInfo({...paymentInfo, status: e.target.value})}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Method</label>
              <select className="input-field h-10 text-xs" value={paymentInfo.method} onChange={e => setPaymentInfo({...paymentInfo, method: e.target.value})}>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="UPI / QR">UPI / QR</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800">
            <AlertCircle className="shrink-0" size={18} />
            <p className="text-[10px] font-bold leading-relaxed">Completion will mark Room {selectedBooking?.room} as "DIRTY" and notify Housekeeping for cleaning wing.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FrontOffice;
