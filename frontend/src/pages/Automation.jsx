import React, { useState } from 'react';
import { Cpu, Zap, RefreshCcw, Bell, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, Badge, Button, Modal } from '../components/common/UI';
import { cn } from '../utils/cn';

const Automation = () => {
  const { isAutoPilot, toggleAutoPilot, automationLogs, addToast, featureToggles, toggleFeatureToggle } = useApp();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({ subject: '', priority: 'Medium', message: '' });

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    addToast('Support ticket submitted! Ticket ID: #SR-' + Math.floor(Math.random() * 10000));
    setIsSupportOpen(false);
    setSupportForm({ subject: '', priority: 'Medium', message: '' });
  };

  const features = [
    { id: 'assignment', name: 'Smart Room Assignment', desc: 'Automatically assigns guests to the best available rooms based on priority and type.', icon: Cpu },
    { id: 'housekeeping', name: 'Auto Housekeeping', desc: 'Generates cleaning tasks instantly upon guest check-out and marks rooms dirty.', icon: RefreshCcw },
    { id: 'alerts', name: 'Billing Error Alerts', desc: 'Proactively detects pricing inconsistencies or missing charges before checkout.', icon: Bell },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Automation Center</h1>
          <p className="text-slate-500 mt-1">Operational intelligence to streamline your hotel workflows.</p>
        </div>
        <div className={cn(
          "flex items-center justify-between w-full md:w-auto gap-4 px-6 py-3 rounded-2xl border-2 transition-all duration-500",
          isAutoPilot ? "bg-primary-600 border-primary-500 shadow-xl shadow-primary-500/20 text-white" : "bg-white border-slate-200"
        )}>
          <div className="flex flex-col">
            <span className={cn("text-xs font-bold uppercase tracking-widest opacity-60")}>System Status</span>
            <span className="text-lg font-black">{isAutoPilot ? "AUTO-PILOT ON" : "MANUAL MODE"}</span>
          </div>
          <button 
            onClick={toggleAutoPilot}
            className={cn("w-14 h-7 rounded-full relative transition-all", isAutoPilot ? "bg-white" : "bg-slate-200")}
          >
            <div className={cn("absolute top-1 w-5 h-5 rounded-full transition-all shadow-sm", isAutoPilot ? "right-1 bg-primary-600" : "left-1 bg-white")}></div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card title="Operational Intelligence" subtitle="Configure automated rules for daily operations.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div key={feature.id} className={cn(
                  "p-6 rounded-2xl border transition-all duration-300 relative group",
                  isAutoPilot ? "bg-white border-primary-100 shadow-sm" : "bg-slate-50 border-slate-100 grayscale opacity-60"
                )}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                      <feature.icon size={24} />
                    </div>
                    {isAutoPilot && (
                      <button 
                        onClick={() => toggleFeatureToggle(feature.id)}
                        className={cn("w-10 h-5 rounded-full relative transition-all", featureToggles[feature.id] ? "bg-emerald-500" : "bg-slate-200")}
                      >
                        <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm", featureToggles[feature.id] ? "right-0.5" : "left-0.5")}></div>
                      </button>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">{feature.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Automation Logs" subtitle="Execution history for system actions.">
            <div className="space-y-4">
              {automationLogs.length > 0 ? automationLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white transition-colors cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                      <Zap size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{log.action}</p>
                      <p className="text-[10px] text-slate-500">{log.details}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter shrink-0">{log.time}</span>
                </div>
              )) : (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-400">No automation activity recorded.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Performance Analytics">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Efficiency Gain</span>
                <span className="text-sm font-black text-emerald-600">+24%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Task Automation</span>
                <span className="text-sm font-black text-slate-800">85%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full w-4/5"></div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-slate-900 text-white border-0">
            <h4 className="font-black text-lg mb-2">Need Help?</h4>
            <p className="text-sm text-slate-400 mb-6">Our support team is available 24/7 to help you configure custom automation rules.</p>
            <Button className="w-full bg-white text-slate-900 hover:bg-slate-50" onClick={() => setIsSupportOpen(true)}>Contact Support</Button>
          </Card>
        </div>
      </div>

      <Modal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} title="Contact Technical Support">
        <form onSubmit={handleSupportSubmit} className="space-y-4">
          <p className="text-sm text-slate-500 mb-6">Describe your issue or custom automation requirement, and our engineers will get back to you within 2 hours.</p>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Subject</label>
            <input 
              type="text" 
              required 
              className="input-field" 
              placeholder="e.g. Custom API Integration" 
              value={supportForm.subject}
              onChange={e => setSupportForm({...supportForm, subject: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Priority</label>
            <select 
              className="input-field"
              value={supportForm.priority}
              onChange={e => setSupportForm({...supportForm, priority: e.target.value})}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent (SLA 30m)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Description</label>
            <textarea 
              required 
              className="input-field min-h-[120px] py-3" 
              placeholder="Please provide as much detail as possible..."
              value={supportForm.message}
              onChange={e => setSupportForm({...supportForm, message: e.target.value})}
            ></textarea>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="secondary" className="flex-1 w-full" onClick={() => setIsSupportOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1 w-full bg-primary-600">Submit Ticket</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Automation;
