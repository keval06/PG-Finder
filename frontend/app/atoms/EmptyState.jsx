import React from "react";

/**
 * EmptyState - Standardized placeholder for empty lists
 * 
 * Props:
 *  icon: LucideIcon component
 *  title: Bold heading text
 *  description: Muted helper text
 *  action: Optional JSX (e.g. Button) to show below description
 */
export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) {
  return (
    <div className="text-center py-20 px-6 bg-white rounded-3xl border border-[#DDDDDD] shadow-sm">
      {Icon && (
        <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Icon size={32} className="text-rose-500" />
        </div>
      )}
      <h2 className="text-[22px] font-semibold text-[#222222] mb-2 leading-tight">
        {title}
      </h2>
      <p className="text-base text-[#717171] max-w-xs mx-auto mb-8 leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}
