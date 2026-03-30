"use client";

import { useEffect } from "react";
import Button from "../atoms/Button";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle className="text-red-500" size={32} />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
      <p className="text-slate-500 mb-6 max-w-xs">
        We encountered an error while loading this page. Please try again.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
        <Button variant="primary" onClick={() => reset()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
