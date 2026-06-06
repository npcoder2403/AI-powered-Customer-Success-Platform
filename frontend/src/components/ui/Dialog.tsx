"use client";

import { useEffect, useRef } from "react";
import { X, AlertTriangle, Trash2, Info } from "lucide-react";
import Button from "./Button";

type DialogVariant = "danger" | "warning" | "info";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  loading?: boolean;
}

const variantConfig: Record<DialogVariant, { icon: typeof AlertTriangle; iconBg: string; iconColor: string; buttonVariant: "danger" | "primary" }> = {
  danger: { icon: Trash2, iconBg: "bg-red-100", iconColor: "text-red-600", buttonVariant: "danger" },
  warning: { icon: AlertTriangle, iconBg: "bg-amber-100", iconColor: "text-amber-600", buttonVariant: "primary" },
  info: { icon: Info, iconBg: "bg-blue-100", iconColor: "text-blue-600", buttonVariant: "primary" },
};

export default function Dialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current && !loading) onClose(); }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
              <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors -mt-1 -mr-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {description && (
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
            {cancelLabel}
          </Button>
          <Button variant={config.buttonVariant} onClick={onConfirm} loading={loading} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
