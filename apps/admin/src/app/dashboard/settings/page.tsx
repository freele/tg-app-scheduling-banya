"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [googleConnected, setGoogleConnected] = useState(false);

  const handleConnectGoogle = async () => {
    // Redirect to Google OAuth flow
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Google Calendar Integration</h2>
        <p className="text-gray-600 mb-4">
          Connect your Google Calendar to sync events automatically.
        </p>

        {googleConnected ? (
          <div className="flex items-center gap-2">
            <span className="text-green-600">Connected</span>
            <button className="text-sm text-red-600 hover:text-red-800">
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectGoogle}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Connect Google Calendar
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Telegram Bot</h2>
        <p className="text-gray-600 mb-4">
          Configure your Telegram bot settings.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bot Token
            </label>
            <input
              type="password"
              value="••••••••••••"
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Set via TELEGRAM_BOT_TOKEN environment variable
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Webhook URL
            </label>
            <input
              type="text"
              value={`${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}/api/telegram/webhook`}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
