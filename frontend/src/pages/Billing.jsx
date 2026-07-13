import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  FileText, 
  Download, 
  Send, 
  CheckCircle2, 
  Clock,
  MoreHorizontal,
  Eye,
  Calendar,
  AlertCircle,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { Card, Badge, Button, Modal, Drawer } from '../components/common/UI';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

const Billing = () => {
  const { invoices, updateInvoiceStatus, addInvoice, addToast, guests, bookings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  
  const [invoiceForm, setInvoiceForm] = useState({ 
    bookingId: '', 
    tax: 12, 
    discount: 0,
    status: 'Unpaid',
    method: 'Credit Card'
  });

  const selectedBooking = bookings.find(b => b.id === invoiceForm.bookingId);

  const handleSendInvoice = (id) => {
    addToast(`Invoice ${id} sent to guest email.`, 'success');
  };

  const handleDownloadPDF = (inv) => {
    addToast(`Generating PDF for ${inv.id}...`);
    setTimeout(() => {
      addToast('Invoice PDF downloaded.', 'success');
    }, 1500);
  };

  const handleOpenPayment = (inv) => {
    setSelectedInvoice(inv);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    updateInvoiceStatus(selectedInvoice.id, 'Paid', paymentMethod);
    setIsPaymentModalOpen(false);
    setSelectedInvoice(null);
  };

  const calculateInvoiceTotal = () => {
    if (!selectedBooking) return 0;
    const subtotal = selectedBooking.amount || 0;
    const taxAmount = subtotal * (invoiceForm.tax / 100);
    return subtotal + taxAmount - invoiceForm.discount;
  };

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    // Check if invoice already exists for this booking
    const exists = invoices.find(inv => inv.bookingId === selectedBooking.id);
    if (exists) {
      addToast('An invoice already exists for this booking!', 'warning');
      return;
    }

    const total = calculateInvoiceTotal();
    const newInv = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      bookingId: selectedBooking.id,
      guestName: selectedBooking.guestName,
      room: selectedBooking.room,
      checkIn: selectedBooking.checkIn,
      checkOut: selectedBooking.checkOut,
      amount: total,
      status: invoiceForm.status,
      method: invoiceForm.method,
      date: new Date().toISOString().split('T')[0],
      details: {
        roomCharges: selectedBooking.amount,
        services: [], // Manual creation doesn't fetch dynamic services in this mock
        subtotal: selectedBooking.amount,
        taxRate: invoiceForm.tax,
        taxAmount: selectedBooking.amount * (invoiceForm.tax / 100),
        discount: invoiceForm.discount,
        total: total
      }
    };

    addInvoice(newInv);
    setIsCreateModalOpen(false);
    setInvoiceForm({ bookingId: '', tax: 12, discount: 0, status: 'Unpaid', method: 'Credit Card' });
    addToast('Invoice generated successfully', 'success');
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || inv.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleExportCSV = () => {
    const headers = ['Invoice ID', 'Guest', 'Amount', 'Status', 'Date'];
    const rows = filteredInvoices.map(inv => `${inv.id},${inv.guestName},${inv.amount},${inv.status},${inv.date}`);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + '\n' + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "invoices_report.csv");
    document.body.appendChild(link);
    link.click();
    addToast('Invoice report exported successfully', 'success');
  };

  const totalRevenue = invoices.reduce((acc, inv) => inv.status === 'Paid' ? acc + inv.amount : acc, 0);
  const pendingRevenue = invoices.reduce((acc, inv) => inv.status !== 'Paid' ? acc + inv.amount : acc, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Receipt className="text-primary-600" /> Billing & Payments
          </h1>
          <p className="text-slate-500 mt-1">Automated financial management and real-time invoicing.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button variant="secondary" className="gap-2 w-full sm:w-auto border-slate-200" onClick={handleExportCSV}>
            <Download size={18} /> Export Records
          </Button>
          <Button className="gap-2 w-full sm:w-auto shadow-lg shadow-primary-500/30" onClick={() => setIsCreateModalOpen(true)}>
            <FileText size={18} /> Manual Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0 shadow-xl shadow-emerald-200">
          <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest">Settled Revenue</p>
          <h2 className="text-3xl font-black mt-1">${totalRevenue.toLocaleString()}</h2>
          <div className="flex items-center gap-1 text-xs text-emerald-100 mt-4 font-bold">
            <TrendingUp size={14} /> +12% from last month
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-xl shadow-amber-200">
          <p className="text-amber-100 text-[10px] font-black uppercase tracking-widest">Outstanding Balance</p>
          <h2 className="text-3xl font-black mt-1">${pendingRevenue.toLocaleString()}</h2>
          <p className="text-xs text-amber-100 mt-4 font-bold flex items-center gap-2">
            <Clock size={14} /> {invoices.filter(i => i.status !== 'Paid').length} invoices pending
          </p>
        </Card>
        <Card className="bg-white border-slate-100 shadow-xl shadow-slate-200/50">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Folios</p>
          <h2 className="text-3xl font-black text-slate-800 mt-1">{bookings.filter(b => b.status === 'IN_HOUSE').length}</h2>
          <p className="text-xs text-primary-600 mt-4 font-bold">In-house guests with open bills</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-xl shadow-slate-200/50 border-slate-100">
        <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50/30">
          <div className="relative max-w-full xl:max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by Invoice ID or Guest Name..."
              className="input-field pl-10 h-11 w-full border-slate-200 focus:border-primary-500" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full xl:w-auto">
            {['All', 'Paid', 'Unpaid'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "flex-1 xl:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                  filterStatus === status ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" : "text-slate-400 hover:bg-slate-50"
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
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice / Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest & Stay</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-900">{inv.id}</span>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 flex items-center gap-1">
                      <Calendar size={10} /> {inv.date}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-800">{inv.guestName}</span>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-tight">Room {inv.room} • {inv.checkIn} → {inv.checkOut}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-900">${inv.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={inv.status.toLowerCase() === 'paid' ? 'success' : 'error'} className="text-[9px] font-black uppercase tracking-widest">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" className="h-9 w-9 p-0 rounded-lg" onClick={() => setSelectedInvoice(inv)} title="View Detail"><Eye size={16} /></Button>
                      {inv.status !== 'Paid' && (
                        <Button onClick={() => handleOpenPayment(inv)} className="h-9 px-4 text-xs bg-emerald-600 hover:bg-emerald-700 gap-2">
                          <CheckCircle2 size={14} /> Pay
                        </Button>
                      )}
                      <Button variant="secondary" className="h-9 w-9 p-0 rounded-lg" onClick={() => handleDownloadPDF(inv)} title="Download"><Download size={16} /></Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <Receipt size={48} className="opacity-20" />
                      <p className="text-sm font-bold">No financial records found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Card Layout */}
          <div className="md:hidden flex flex-col divide-y divide-slate-100">
            {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
              <div key={inv.id} className="p-5 space-y-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-black text-slate-900">{inv.id}</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{inv.date}</p>
                  </div>
                  <Badge variant={inv.status.toLowerCase() === 'paid' ? 'success' : 'error'} className="text-[9px] font-black uppercase">
                    {inv.status}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-xl">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{inv.guestName}</span>
                    <span className="text-[10px] text-slate-500 font-bold">Room {inv.room}</span>
                  </div>
                  <span className="font-black text-slate-900 text-lg">${inv.amount.toLocaleString()}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1 h-10 text-xs" onClick={() => setSelectedInvoice(inv)}>View</Button>
                  {inv.status !== 'Paid' && (
                    <Button onClick={() => handleOpenPayment(inv)} className="flex-1 h-10 text-xs bg-emerald-600">Mark Paid</Button>
                  )}
                  <Button variant="secondary" className="h-10 w-10 p-0" onClick={() => handleDownloadPDF(inv)}><Download size={16} /></Button>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-slate-400">
                <p className="text-sm font-bold">No invoices found</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Create Invoice Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Generate Manual Invoice">
        <form onSubmit={handleCreateInvoice} className="space-y-5">
          <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-center gap-3">
            <AlertCircle className="text-primary-600 shrink-0" size={20} />
            <p className="text-[11px] font-bold text-primary-800 leading-relaxed">Selecting a reservation will auto-fill room and stay details. Total amount includes taxes and discounts.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Reservation</label>
              <select 
                className="input-field h-12" 
                required 
                value={invoiceForm.bookingId}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, bookingId: e.target.value })}
              >
                <option value="">Choose active or completed booking...</option>
                {bookings.map(b => (
                  <option key={b.id} value={b.id}>{b.guestName} (Room {b.room}) - {b.id}</option>
                ))}
              </select>
            </div>

            {selectedBooking && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-in zoom-in-95">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Rate</p>
                  <p className="text-sm font-black text-slate-800">${selectedBooking.amount}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stay Period</p>
                  <p className="text-[11px] font-bold text-slate-700">{selectedBooking.checkIn} - {selectedBooking.checkOut}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tax Rate (%)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={invoiceForm.tax}
                  onChange={e => setInvoiceForm({...invoiceForm, tax: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Discount ($)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={invoiceForm.discount}
                  onChange={e => setInvoiceForm({...invoiceForm, discount: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Estimated Total</span>
              <span className="text-2xl font-black text-primary-600">${calculateInvoiceTotal().toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1 h-12" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1 h-12 bg-primary-600 shadow-lg shadow-primary-500/30">Generate Invoice</Button>
          </div>
        </form>
      </Modal>

      {/* Invoice Detail Drawer */}
      <Drawer
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice ? `Invoice ${selectedInvoice.id}` : ''}
        subtitle={selectedInvoice ? `Date: ${selectedInvoice.date}` : ''}
      >
        {selectedInvoice && (
          <div className="space-y-8 h-full flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Billed To</p>
                <h4 className="text-xl font-black text-slate-900 mt-1">{selectedInvoice.guestName}</h4>
                <p className="text-xs text-slate-500 font-bold mt-1">Room {selectedInvoice.room} • {selectedInvoice.checkIn} → {selectedInvoice.checkOut}</p>
              </div>
              <Badge variant={selectedInvoice.status.toLowerCase() === 'paid' ? 'success' : 'error'} className="font-black uppercase tracking-widest text-[10px]">
                {selectedInvoice.status}
              </Badge>
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Item Description</span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest text-right">Amount</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Room Accommodation</span>
                  <span className="text-[10px] text-slate-400 font-medium">Standard / Deluxe stay charges</span>
                </div>
                <span className="text-sm font-black text-slate-900">${selectedInvoice.details?.roomCharges?.toLocaleString() || selectedInvoice.amount.toLocaleString()}</span>
              </div>

              {selectedInvoice.details?.services?.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{s.name} (x{s.qty})</span>
                    <span className="text-[10px] text-slate-400 font-medium">In-house service</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">${(s.price * s.qty).toLocaleString()}</span>
                </div>
              ))}

              <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-slate-900">${selectedInvoice.details?.subtotal?.toLocaleString() || selectedInvoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>Tax ({selectedInvoice.details?.taxRate || 12}%)</span>
                  <span className="text-slate-900">${selectedInvoice.details?.taxAmount?.toLocaleString() || '0'}</span>
                </div>
                {selectedInvoice.details?.discount > 0 && (
                  <div className="flex justify-between text-xs font-bold text-rose-500 uppercase tracking-widest">
                    <span>Discount</span>
                    <span>-${selectedInvoice.details.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900 border-dashed">
                  <span className="text-base font-black text-slate-900 uppercase tracking-widest">Total Amount</span>
                  <span className="text-2xl font-black text-primary-600">${selectedInvoice.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary-600 shadow-sm">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                  <p className="text-sm font-black text-slate-800">{selectedInvoice.method || 'Not Selected'}</p>
                </div>
              </div>
              
              {selectedInvoice.status !== 'Paid' ? (
                <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 gap-2" onClick={() => handleOpenPayment(selectedInvoice)}>
                  <CheckCircle2 size={18} /> Mark as Paid
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1 h-11" onClick={() => handleDownloadPDF(selectedInvoice)}>Download PDF</Button>
                  <Button variant="secondary" className="flex-1 h-11" onClick={() => handleSendInvoice(selectedInvoice.id)}>Send Email</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Payment Confirmation Modal */}
      <Modal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        title="Confirm Payment Settlement"
      >
        <div className="space-y-6">
          <div className="text-center p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">Total Outstanding</p>
            <h3 className="text-4xl font-black text-emerald-700">${selectedInvoice?.amount.toLocaleString()}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {['Credit Card', 'Cash', 'UPI / QR', 'Bank Transfer'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={cn(
                      "p-3 rounded-xl border text-xs font-bold transition-all text-left",
                      paymentMethod === m ? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm" : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1 h-12" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 h-12 bg-emerald-600 shadow-lg shadow-emerald-500/30" onClick={handleConfirmPayment}>Confirm Payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Billing;
