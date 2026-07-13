import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-slate-100"
      >
        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-8 shadow-lg shadow-rose-500/10">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Access Restricted</h1>
        <p className="text-slate-500 mb-10 leading-relaxed">
          You don't have the necessary permissions to view this module. Please contact your system administrator for access.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
