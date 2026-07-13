import React, { useState } from 'react';
import { Plus, Hotel, MapPin, Users, Activity, MoreVertical, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, Badge, Button, Modal } from '../../components/common/UI';
import { cn } from '../../utils/cn';

const HotelManagement = () => {
  const { hotels, addHotel, deleteHotel, updateHotel, addToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [formData, setFormData] = useState({ name: '', city: '', country: '', rooms: 50, plan: 'Standard' });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.city || !formData.country) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    const hotelData = {
      ...formData,
      location: `${formData.city}, ${formData.country}`,
      status: editingHotel ? editingHotel.status : 'Pending'
    };

    if (editingHotel) {
      updateHotel(editingHotel.id, hotelData);
    } else {
      addHotel(hotelData);
    }
    
    closeModal();
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    const [city = '', country = ''] = (hotel.location || '').split(', ');
    setFormData({
      name: hotel.name,
      city: city.trim(),
      country: country.trim(),
      rooms: hotel.rooms,
      plan: hotel.plan
    });
    setIsModalOpen(true);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ plan: 'All', status: 'All' });

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = (hotel.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (hotel.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filters.plan === 'All' || hotel.plan === filters.plan;
    const matchesStatus = filters.status === 'All' || (hotel.status || 'Active') === filters.status;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHotel(null);
    setFormData({ name: '', city: '', country: '', rooms: 50, plan: 'Standard' });
  };

  const getStatusVariant = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hotel Management</h1>
          <p className="text-slate-500 mt-1">Onboard and manage hotel properties on the platform.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 w-full md:w-auto">
          <Plus size={18} /> Add New Hotel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary-600 text-white border-0 shadow-lg shadow-primary-500/20">
          <p className="text-primary-200 text-[10px] font-bold uppercase tracking-widest">Total Properties</p>
          <h2 className="text-3xl font-black mt-1">{hotels.length}</h2>
          <div className="mt-4 flex items-center gap-2 text-xs text-primary-200">
            <Activity size={14} /> Global coverage active
          </div>
        </Card>
        <Card>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Global Capacity</p>
          <h2 className="text-3xl font-black text-slate-800 mt-1">
            {hotels.reduce((acc, h) => acc + parseInt(h.rooms || 0), 0)}
          </h2>
          <div className="mt-4 text-xs text-emerald-600 font-bold uppercase tracking-tight">Rooms Live</div>
        </Card>
        <Card>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Avg. Occupancy</p>
          <h2 className="text-3xl font-black text-slate-800 mt-1">72%</h2>
          <div className="mt-4 text-xs text-slate-400 font-bold uppercase tracking-tight">Platform Average</div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-xl shadow-slate-200/50 border-slate-100">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/30 gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search hotels..." 
              className="input-field pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold shadow-sm">
              <Filter size={14} /> Filters
            </div>
            <select 
              className="input-field h-10 text-xs py-0 min-w-[120px]"
              value={filters.plan}
              onChange={(e) => setFilters({...filters, plan: e.target.value})}
            >
              <option value="All">All Plans</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Standard">Standard</option>
              <option value="Trial">Trial</option>
            </select>
            <select 
              className="input-field h-10 text-xs py-0 min-w-[120px]"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hotel Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHotels.length > 0 ? filteredHotels.map((hotel) => (
                <tr key={hotel.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                        <Hotel size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{hotel.name}</p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold">
                          <MapPin size={10} /> {hotel.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={hotel.plan === 'Enterprise' ? 'primary' : 'slate'}>{hotel.plan}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusVariant(hotel.status)}>{hotel.status || 'Active'}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(hotel)}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteHotel(hotel.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={24} className="text-slate-300" />
                      <p className="text-sm font-medium">No hotels found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingHotel ? "Edit Hotel Details" : "Add New Hotel Property"}
        footer={
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <Button variant="secondary" onClick={closeModal} className="flex-1 md:flex-none">Cancel</Button>
            <Button onClick={handleSubmit} className="flex-1">{editingHotel ? "Save Changes" : "Create Hotel"}</Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-widest">Hotel Name</label>
            <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Blue Lagoon Hotel" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-widest">City</label>
              <input type="text" className="input-field" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="e.g. New York" required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-widest">Country</label>
              <input type="text" className="input-field" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} placeholder="e.g. USA" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-widest">Rooms Count</label>
              <input type="number" className="input-field" value={formData.rooms} onChange={e => setFormData({...formData, rooms: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-widest">Plan Type</label>
              <select className="input-field" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                <option>Standard</option>
                <option>Enterprise</option>
                <option>Trial</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HotelManagement;
