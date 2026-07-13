import React, { useState } from 'react';
import { 
  Brush, 
  Trash2, 
  CheckCircle2, 
  UserPlus, 
  History, 
  Search,
  Play,
  ArrowRight,
  MoreVertical,
  Wrench,
  Ban
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, Badge, Button, Modal, Drawer } from '../components/common/UI';
import { cn } from '../utils/cn';

const Housekeeping = () => {
  const { rooms, staff, assignHousekeeping, updateRoomStatus, markRoomMaintenance, systemEvents, addToast } = useApp();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenAssign = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleAssign = (staffId) => {
    assignHousekeeping(selectedRoom.id, staffId);
    setIsModalOpen(false);
  };

  const handleStartCleaning = (roomId) => {
    updateRoomStatus(roomId, { cleaning: 'in_progress' });
    addToast(`Cleaning started for Room ${roomId}`, 'info');
  };

  const handleMarkClean = (roomId) => {
    updateRoomStatus(roomId, { 
      cleaning: 'clean', 
      status: 'vacant', 
      assignedStaff: null, 
      lastCleaned: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    });
    addToast(`Room ${roomId} marked as Ready`, 'success');
  };

  const handleMarkDirty = (roomId) => {
    updateRoomStatus(roomId, { cleaning: 'dirty' });
    addToast(`Room ${roomId} marked as Needs Cleaning`, 'warning');
  };

  const filteredRooms = rooms.filter(r => 
    r.id.includes(searchQuery) || 
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Grouped Rooms
  const groupedRooms = {
    needsCleaning: filteredRooms.filter(r => r.cleaning === 'dirty' && r.status !== 'maintenance'),
    cleaning: filteredRooms.filter(r => r.cleaning === 'in_progress' && r.status !== 'maintenance'),
    ready: filteredRooms.filter(r => r.cleaning === 'clean' && r.status !== 'maintenance'),
    maintenance: filteredRooms.filter(r => r.status === 'maintenance' || r.cleaning === 'out_of_order')
  };

  const RoomCard = ({ room }) => {
    const isDirty = room.cleaning === 'dirty';
    const isInProgress = room.cleaning === 'in_progress';
    const isClean = room.cleaning === 'clean';
    const isMaintenance = room.status === 'maintenance';

    return (
      <Card className="p-4 shadow-md hover:shadow-lg transition-shadow border-slate-100 relative group">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg",
              isClean ? "bg-emerald-100 text-emerald-700" : 
              isDirty ? "bg-rose-100 text-rose-700" : 
              isInProgress ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-slate-100"
            )}>
              {room.id}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{room.type}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{room.status}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {room.assignedStaff && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                <div className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center text-[8px] font-black text-primary-600">
                  {room.assignedStaff[0]}
                </div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{room.assignedStaff}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto">
          {isDirty && !room.assignedStaff && (
            <Button className="w-full h-10 text-xs font-black uppercase tracking-widest bg-primary-600 shadow-lg shadow-primary-500/20 gap-2" onClick={() => handleOpenAssign(room)}>
              <UserPlus size={14} /> Assign Staff
            </Button>
          )}

          {isDirty && room.assignedStaff && (
            <Button className="w-full h-10 text-xs font-black uppercase tracking-widest bg-amber-600 shadow-lg shadow-amber-500/20 gap-2" onClick={() => handleStartCleaning(room.id)}>
              <Play size={14} /> Start Cleaning
            </Button>
          )}

          {isInProgress && (
            <Button className="w-full h-10 text-xs font-black uppercase tracking-widest bg-emerald-600 shadow-lg shadow-emerald-500/20 gap-2" onClick={() => handleMarkClean(room.id)}>
              <CheckCircle2 size={14} /> Mark Ready
            </Button>
          )}

          {isClean && (
            <Button variant="secondary" className="w-full h-10 text-xs font-black uppercase tracking-widest text-rose-500 border-rose-100 hover:bg-rose-50 gap-2" onClick={() => handleMarkDirty(room.id)}>
              <Trash2 size={14} /> Mark Dirty
            </Button>
          )}

          {isMaintenance && (
            <Button className="w-full h-10 text-xs font-black uppercase tracking-widest bg-slate-700 gap-2" onClick={() => updateRoomStatus(room.id, { status: 'vacant', cleaning: 'clean' })}>
              <Wrench size={14} /> Finish Repair
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Housekeeping</h1>
          <p className="text-slate-500 mt-1">Simple one-action room management.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2 border-slate-200 h-10 text-xs font-bold" onClick={() => setIsLogOpen(true)}>
            <History size={16} /> Logs
          </Button>
        </div>
      </div>

      <div className="relative max-w-md w-full">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search rooms..." 
          className="input-field pl-12 h-12 w-full border-slate-200 rounded-2xl shadow-sm" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-12">
        {/* Needs Cleaning Section */}
        {groupedRooms.needsCleaning.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 size={18} />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Needs Cleaning</h3>
              <Badge variant="error" className="rounded-full h-5 min-w-[20px] flex items-center justify-center p-0 text-[10px]">{groupedRooms.needsCleaning.length}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {groupedRooms.needsCleaning.map(room => <RoomCard key={room.id} room={room} />)}
            </div>
          </section>
        )}

        {/* Cleaning Active Section */}
        {groupedRooms.cleaning.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Brush size={18} />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Cleaning Active</h3>
              <Badge variant="warning" className="rounded-full h-5 min-w-[20px] flex items-center justify-center p-0 text-[10px]">{groupedRooms.cleaning.length}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {groupedRooms.cleaning.map(room => <RoomCard key={room.id} room={room} />)}
            </div>
          </section>
        )}

        {/* Ready Rooms Section */}
        {groupedRooms.ready.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Ready Rooms</h3>
              <Badge variant="success" className="rounded-full h-5 min-w-[20px] flex items-center justify-center p-0 text-[10px]">{groupedRooms.ready.length}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {groupedRooms.ready.map(room => <RoomCard key={room.id} room={room} />)}
            </div>
          </section>
        )}

        {/* Maintenance Section */}
        {groupedRooms.maintenance.length > 0 && (
          <section className="space-y-4 opacity-75">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Ban size={18} />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest text-slate-500">Maintenance</h3>
              <Badge variant="slate" className="rounded-full h-5 min-w-[20px] flex items-center justify-center p-0 text-[10px]">{groupedRooms.maintenance.length}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {groupedRooms.maintenance.map(room => <RoomCard key={room.id} room={room} />)}
            </div>
          </section>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Assign Staff: Room ${selectedRoom?.id}`}>
        <div className="grid grid-cols-1 gap-3">
          {staff.map(member => (
            <button 
              key={member.id} 
              onClick={() => handleAssign(member.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                member.status === 'Available' ? "border-slate-100 hover:border-primary-500 hover:bg-primary-50" : "opacity-50 cursor-not-allowed"
              )}
              disabled={member.status !== 'Available'}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 shadow-sm">
                  {member.name[0]}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 tracking-tight">{member.name}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{member.role}</p>
                </div>
              </div>
              <Badge variant={member.status === 'Available' ? 'success' : 'warning'} className="text-[9px] font-black uppercase tracking-widest px-3">
                {member.status}
              </Badge>
            </button>
          ))}
        </div>
      </Modal>

      <Drawer isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} title="Activity Log">
        <div className="space-y-4">
          {systemEvents.filter(e => e.message.toLowerCase().includes('room') || e.message.toLowerCase().includes('assigned')).map(log => (
            <div key={log.id} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{log.time}</p>
              <p className="text-sm font-bold text-slate-800 leading-relaxed">{log.message}</p>
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
};

export default Housekeeping;
