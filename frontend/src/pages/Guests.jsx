import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Star, 
  MapPin, 
  Phone, 
  Mail,
  History,
  MoreVertical,
  ChevronDown,
  Trophy,
  DollarSign,
  Calendar,
  Settings,
  CreditCard,
  Crown,
  Wallet,
  ArrowRight,
  Trash2,
  Edit
} from 'lucide-react';
import { Card, Badge, Button, Drawer, Modal } from '../components/common/UI';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

const Guests = () => {
  const { guests, addGuest, updateGuest, deleteGuest, bookings, invoices, loyaltyRules, setLoyaltyRules } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', location: '' });

  const getGuestStatus = (guest) => {
    if (guest.spent >= loyaltyRules.minSpend || guest.visits >= loyaltyRules.minVisits) {
      return 'VIP';
    }
    return 'Regular';
  };

  const handleOpenModal = (guest = null) => {
    if (guest) {
      setSelectedGuest(guest);
      setFormData({ name: guest.name, email: guest.email, phone: guest.phone, location: guest.location });
    } else {
      setSelectedGuest(null);
      setFormData({ name: '', email: '', phone: '', location: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedGuest) {
      updateGuest(selectedGuest.id, formData);
    } else {
      addGuest({ ...formData, spent: 0, visits: 0 });
    }
    setIsModalOpen(false);
  };

  const handleViewProfile = (guest) => {
    setSelectedGuest(guest);
    setIsProfileOpen(true);
  };

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.email.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getGuestStatus(g);
    
    let matchesFilter = true;
    if (filterStatus === 'VIP') matchesFilter = status === 'VIP';
    else if (filterStatus === 'Regular') matchesFilter = status === 'Regular';
    else if (filterStatus === 'High Spending') matchesFilter = g.spent > 1000;
    
    return matchesSearch && matchesFilter;
  });

  const guestBookings = selectedGuest ? bookings.filter(b => b.guestName === selectedGuest.name) : [];
  const guestInvoices = selectedGuest ? invoices.filter(i => i.guestName === selectedGuest.name) : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="text-primary-600" /> Guest Intelligence
          </h1>
          <p className="text-slate-500 mt-1">Smart CRM tracking guest behavior and loyalty tiering.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button variant="secondary" className="gap-2 w-full sm:w-auto border-slate-200" onClick={() => setIsLoyaltyModalOpen(true)}>
            <Trophy size={18} className="text-amber-500" /> Loyalty Rules
          </Button>
          <Button className="gap-2 w-full sm:w-auto shadow-lg shadow-primary-500/30" onClick={() => handleOpenModal()}>
            <UserPlus size={18} /> Add New Guest
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-slate-100 p-6 shadow-xl shadow-slate-200/50">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Database</p>
          <h2 className="text-3xl font-black text-slate-900 mt-1">{guests.length}</h2>
          <p className="text-xs text-slate-500 mt-4 font-bold flex items-center gap-2">
            <Users size={14} /> Unified guest profiles
          </p>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-0 shadow-xl shadow-indigo-200">
          <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest">VIP Members</p>
          <h2 className="text-3xl font-black mt-1">{guests.filter(g => getGuestStatus(g) === 'VIP').length}</h2>
          <p className="text-xs text-indigo-100 mt-4 font-bold flex items-center gap-2">
            <Crown size={14} className="text-amber-300" /> Elite loyalty tier
          </p>
        </Card>
        <Card className="bg-white border-slate-100 p-6 shadow-xl shadow-slate-200/50">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Avg. Spend / Guest</p>
          <h2 className="text-3xl font-black text-slate-900 mt-1">
            ${guests.length > 0 ? (guests.reduce((acc, g) => acc + g.spent, 0) / guests.length).toFixed(0) : 0}
          </h2>
          <p className="text-xs text-emerald-600 mt-4 font-bold flex items-center gap-2">
            <DollarSign size={14} /> CLV Tracking
          </p>
        </Card>
        <Card className="bg-white border-slate-100 p-6 shadow-xl shadow-slate-200/50">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Repeat Guests</p>
          <h2 className="text-3xl font-black text-slate-900 mt-1">
            {guests.filter(g => g.visits > 1).length}
          </h2>
          <p className="text-xs text-blue-600 mt-4 font-bold flex items-center gap-2">
            <Calendar size={14} /> Retention rate active
          </p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-xl shadow-slate-200/50 border-slate-100">
        <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50/30">
          <div className="relative max-w-full xl:max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by name, email or ID..."
              className="input-field pl-10 h-11 w-full border-slate-200 focus:border-primary-500" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full xl:w-auto overflow-x-auto">
            {['All', 'VIP', 'Regular', 'High Spending'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "flex-1 xl:flex-none px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  filterStatus === status ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="w-full hidden md:table">
            <thead>
              <tr className="bg-slate-50/50 text-left border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Profile</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Visits</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Lifetime Spend</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Loyalty Tier</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredGuests.map((guest) => {
                const status = getGuestStatus(guest);
                const isVIP = status === 'VIP';
                return (
                  <tr key={guest.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-sm",
                          isVIP ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {guest.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{guest.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                            <MapPin size={10} /> {guest.location || 'Not Specified'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-600 flex items-center gap-2 truncate max-w-[150px]">
                          <Mail size={12} className="text-slate-400 shrink-0" /> {guest.email}
                        </p>
                        <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                          <Phone size={12} className="text-slate-400 shrink-0" /> {guest.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="slate" className="font-black">{guest.visits || 0}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-slate-900">${(guest.spent || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={cn(
                        "font-black uppercase tracking-widest text-[9px] px-3",
                        isVIP ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-500"
                      )}>
                        {isVIP && <Crown size={10} className="inline mr-1" />} {status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest border-slate-200" onClick={() => handleViewProfile(guest)}>Profile</Button>
                        <Button variant="secondary" className="h-9 w-9 p-0 rounded-lg border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200" onClick={() => handleOpenModal(guest)}><Edit size={16} /></Button>
                        <Button variant="secondary" className="h-9 w-9 p-0 rounded-lg border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200" onClick={() => { if(window.confirm('Are you sure you want to delete this guest?')) { deleteGuest(guest.id); } }}><Trash2 size={16} /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile Card Layout */}
          <div className="md:hidden flex flex-col divide-y divide-slate-100">
            {filteredGuests.length > 0 ? filteredGuests.map((guest) => {
              const status = getGuestStatus(guest);
              const isVIP = status === 'VIP';
              return (
                <div key={guest.id} className="p-5 space-y-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md",
                        isVIP ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {guest.name[0]}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900">{guest.name}</p>
                        <Badge className={cn(
                          "mt-1 font-black uppercase tracking-widest text-[8px] px-2",
                          isVIP ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                        )}>
                          {status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" className="h-10 w-10 p-0 rounded-xl text-blue-600 hover:bg-blue-50 hover:border-blue-200" onClick={() => handleOpenModal(guest)}>
                        <Edit size={18} />
                      </Button>
                      <Button variant="secondary" className="h-10 w-10 p-0 rounded-xl text-rose-500 hover:bg-rose-50 hover:border-rose-200" onClick={() => { if(window.confirm('Are you sure you want to delete this guest?')) { deleteGuest(guest.id); } }}>
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Visits</p>
                      <p className="text-sm font-black text-slate-900">{guest.visits || 0}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Spend</p>
                      <p className="text-sm font-black text-slate-900">${(guest.spent || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1 h-11 text-xs font-black uppercase tracking-widest" onClick={() => handleViewProfile(guest)}>View Full Profile</Button>
                    <Button className="h-11 px-4 bg-primary-600">
                      <Mail size={18} />
                    </Button>
                  </div>
                </div>
              );
            }) : (
              <div className="p-12 text-center text-slate-400">
                <Users size={48} className="mx-auto opacity-20 mb-3" />
                <p className="text-sm font-black uppercase tracking-widest">No matching guests</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Guest Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedGuest ? 'Refine Guest Profile' : 'Initialize New Guest'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-center gap-3">
            <UserPlus className="text-primary-600 shrink-0" size={20} />
            <p className="text-[11px] font-bold text-primary-800 leading-relaxed">System automatically calculates VIP status based on lifetime spend and booking frequency.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Guest Identity (Full Name)</label>
              <input type="text" required className="input-field h-12" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Johnathan Wick" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email Address</label>
                <input type="email" required className="input-field h-12" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone Number</label>
                <input type="text" required className="input-field h-12" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Origin / Location</label>
              <input type="text" className="input-field h-12" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. New York, USA" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1 h-12" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1 h-12 bg-primary-600 shadow-lg shadow-primary-500/30">
              {selectedGuest ? 'Save Changes' : 'Register Guest'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Loyalty Rules Modal */}
      <Modal isOpen={isLoyaltyModalOpen} onClose={() => setIsLoyaltyModalOpen(false)} title="Loyalty Program Configuration">
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
            <Trophy className="text-amber-600 shrink-0" size={24} />
            <p className="text-[11px] font-bold text-amber-800 leading-relaxed">Adjust thresholds below to redefine how guests reach VIP status. Changes apply retroactively to all profiles.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Minimum Lifetime Spend ($)</label>
              <input 
                type="number" 
                className="input-field h-12 text-lg font-black" 
                value={loyaltyRules.minSpend} 
                onChange={e => setLoyaltyRules({...loyaltyRules, minSpend: parseInt(e.target.value)})} 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Minimum Successful Bookings</label>
              <input 
                type="number" 
                className="input-field h-12 text-lg font-black" 
                value={loyaltyRules.minVisits} 
                onChange={e => setLoyaltyRules({...loyaltyRules, minVisits: parseInt(e.target.value)})} 
              />
            </div>
          </div>

          <Button className="w-full h-12 bg-slate-900" onClick={() => setIsLoyaltyModalOpen(false)}>Apply Global Rules</Button>
        </div>
      </Modal>

      {/* Guest Profile Drawer */}
      <Drawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} title="Guest Intelligence Profile">
        {selectedGuest && (
          <div className="space-y-8 pb-20">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={cn(
                "w-24 h-24 rounded-3xl flex items-center justify-center font-black text-4xl shadow-xl",
                getGuestStatus(selectedGuest) === 'VIP' ? "bg-amber-100 text-amber-700 ring-4 ring-amber-50" : "bg-slate-100 text-slate-600"
              )}>
                {selectedGuest.name[0]}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedGuest.name}</h2>
                <Badge className={cn(
                  "mt-2 font-black uppercase tracking-widest text-[10px] px-4 h-6",
                  getGuestStatus(selectedGuest) === 'VIP' ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-500"
                )}>
                  {getGuestStatus(selectedGuest) === 'VIP' && <Crown size={12} className="inline mr-1" />} {getGuestStatus(selectedGuest)} MEMBER
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Spent</p>
                <p className="text-xl font-black text-slate-900">${selectedGuest.spent.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Stays</p>
                <p className="text-xl font-black text-slate-900">{selectedGuest.visits}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} className="text-primary-600" /> Booking History
                </h4>
                <Badge variant="slate" className="text-[9px]">{guestBookings.length}</Badge>
              </div>
              
              <div className="space-y-3">
                {guestBookings.length > 0 ? guestBookings.map(b => (
                  <div key={b.id} className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-primary-200 transition-colors shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-black text-slate-800">Room {b.room}</p>
                      <Badge variant={b.status === 'completed' ? 'success' : 'primary'} className="text-[8px] uppercase">{b.status}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold flex items-center gap-2">
                      {b.checkIn} <ArrowRight size={10} /> {b.checkOut}
                    </p>
                  </div>
                )) : (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                    <p className="text-xs font-bold text-slate-400">No previous stay records found.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mt-8">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard size={14} className="text-emerald-600" /> Payment History
                </h4>
                <Badge variant="slate" className="text-[9px]">{guestInvoices.length}</Badge>
              </div>
              
              <div className="space-y-3">
                {guestInvoices.length > 0 ? guestInvoices.map(i => (
                  <div key={i.id} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex justify-between items-center">
                    <div>
                      <p className="text-sm font-black text-slate-800">{i.id}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{i.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">${i.amount.toLocaleString()}</p>
                      <Badge variant={i.status === 'Paid' ? 'success' : 'error'} className="text-[8px] uppercase mt-1">{i.status}</Badge>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                    <p className="text-xs font-bold text-slate-400">No payment records available.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 flex gap-3 shadow-2xl">
              <Button variant="secondary" className="flex-1 h-12 font-black uppercase tracking-widest border-slate-200" onClick={() => { setIsProfileOpen(false); handleOpenModal(selectedGuest); }}>Edit Profile</Button>
              <Button variant="secondary" className="h-12 w-12 p-0 text-rose-500 border-rose-100 hover:bg-rose-50" onClick={() => { if(window.confirm('Are you sure? This will erase all history for this guest.')) { deleteGuest(selectedGuest.id); setIsProfileOpen(false); } }}>
                <Trash2 size={20} />
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Guests;
