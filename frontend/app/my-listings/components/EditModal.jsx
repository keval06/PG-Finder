"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
const PGForm = dynamic(() => import("./PGForm"), { ssr: false });

export default function EditModal({ 
  isOpen, 
  onClose, 
  pg, 
  roomTypes, 
  onEdit, 
  saving, 
  setRtDeleteTarget 
}) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#222222]/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white shadow-[0_8px_28px_rgba(0,0,0,0.28)] rounded-3xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#222222]">Editor Mode</h2>
            <p className="text-sm text-[#717171] mt-0.5">Update listing details and room types.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X size={22} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <PGForm
            initial={{ ...pg, roomTypes }}
            onSubmit={onEdit}
            onCancel={onClose}
            saving={saving}
            onRemoveRT={(i, doDelete) => setRtDeleteTarget({ i, doDelete })}
          />
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #dddddd;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cccccc;
        }
      `}</style>
    </div>
  );
}
