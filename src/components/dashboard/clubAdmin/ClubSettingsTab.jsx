"use client";

import { Settings } from "lucide-react";

export default function ClubSettingsTab() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-6 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
            <Settings className="w-16 h-16 text-violet-500 dark:text-violet-400" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Club Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Coming Soon...
        </p>
        <p className="text-gray-500 text-sm max-w-md">
          Club settings and customization options will be available here soon.
        </p>
      </div>
    </div>
  );
}
