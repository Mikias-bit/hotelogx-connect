import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Card = ({ children, className, title, subtitle, action }) => (
  <div className={cn("card-premium p-6", className)}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-6">
        <div>
          {title && <h3 className="font-bold text-slate-800 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export const Badge = ({ children, variant = 'primary', className }) => {
  const variants = {
    primary: 'bg-primary-50 text-primary-700 border-primary-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-rose-50 text-rose-700 border-rose-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export const Button = ({ children, variant = 'primary', className, ...props }) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'hover:bg-slate-50 text-slate-600',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-lg font-medium",
        variants[variant],
        className
      )} 
      {...props}
    >
      {children}
    </button>
  );
};

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
        {footer && (
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const Drawer = ({ isOpen, onClose, title, subtitle, children, footer }) => (
  <div className={cn(
    "fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300",
    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
  )} onClick={onClose}>
    <div 
      className={cn(
        "absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
      onClick={e => e.stopPropagation()}
    >
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        {children}
      </div>
      {footer && (
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          {footer}
        </div>
      )}
    </div>
  </div>
);

export const ToastContainer = ({ toasts }) => (
  <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3">
    {toasts.map(toast => (
      <div 
        key={toast.id} 
        className={cn(
          "px-6 py-4 rounded-2xl shadow-premium border flex items-center gap-4 animate-in slide-in-from-right-full duration-500",
          toast.type === 'success' ? "bg-white border-emerald-100 text-emerald-800" : "bg-white border-rose-100 text-rose-800"
        )}
      >
        {toast.type === 'success' ? <CheckCircle2 className="text-emerald-500" size={20} /> : <AlertCircle className="text-rose-500" size={20} />}
        <span className="text-sm font-bold">{toast.message}</span>
      </div>
    ))}
  </div>
);

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", variant = "danger" }) => (
  <Modal 
    isOpen={isOpen} 
    onClose={onClose} 
    title={title}
    footer={
      <>
        <Button variant="secondary" onClick={onClose}>{cancelText}</Button>
        <Button variant={variant} onClick={onConfirm}>{confirmText}</Button>
      </>
    }
  >
    <div className="flex flex-col items-center text-center space-y-4">
      <div className={cn(
        "p-4 rounded-full",
        variant === 'danger' ? "bg-rose-50 text-rose-600" : "bg-primary-50 text-primary-600"
      )}>
        {variant === 'danger' ? <AlertCircle size={32} /> : <Info size={32} />}
      </div>
      <p className="text-slate-600 font-medium leading-relaxed">{message}</p>
    </div>
  </Modal>
);
