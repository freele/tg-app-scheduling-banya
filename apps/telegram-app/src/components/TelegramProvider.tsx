"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  initDataUnsafe: {
    user?: TelegramUser;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isReady: false,
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const app = window.Telegram?.WebApp;
    if (app) {
      setWebApp(app);
      setUser(app.initDataUnsafe.user ?? null);
      setIsReady(true);

      // Apply theme colors
      const { themeParams } = app;
      if (themeParams.bg_color) {
        document.documentElement.style.setProperty(
          "--tg-theme-bg-color",
          themeParams.bg_color
        );
      }
      if (themeParams.text_color) {
        document.documentElement.style.setProperty(
          "--tg-theme-text-color",
          themeParams.text_color
        );
      }
      if (themeParams.hint_color) {
        document.documentElement.style.setProperty(
          "--tg-theme-hint-color",
          themeParams.hint_color
        );
      }
      if (themeParams.link_color) {
        document.documentElement.style.setProperty(
          "--tg-theme-link-color",
          themeParams.link_color
        );
      }
      if (themeParams.button_color) {
        document.documentElement.style.setProperty(
          "--tg-theme-button-color",
          themeParams.button_color
        );
      }
      if (themeParams.button_text_color) {
        document.documentElement.style.setProperty(
          "--tg-theme-button-text-color",
          themeParams.button_text_color
        );
      }
      if (themeParams.secondary_bg_color) {
        document.documentElement.style.setProperty(
          "--tg-theme-secondary-bg-color",
          themeParams.secondary_bg_color
        );
      }
    } else {
      // Development mode without Telegram
      setIsReady(true);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ webApp, user, isReady }}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  return useContext(TelegramContext);
}
