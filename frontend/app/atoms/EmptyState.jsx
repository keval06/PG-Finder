import React from "react";

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action  //accepts a JSX element as a prop. Not a string. Not a function. An actual React element.
}) {
  return (
    <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
      {Icon && (
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <Icon size={28} className="text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">{description}</p>
      {action}
    </div>
  );
}
