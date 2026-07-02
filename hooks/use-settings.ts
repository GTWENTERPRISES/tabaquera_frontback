"use client";

import { useState, useEffect } from "react";

export interface CompanySettings {
  companyName: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  alerts: boolean;
  reports: boolean;
}

export interface ProductionParams {
  minTemp: number;
  maxTemp: number;
  minHumidity: number;
  maxHumidity: number;
}

export interface AppSettings {
  animationsEnabled: boolean;
  compactMode: boolean;
  language: string;
  timezone: string;
  dateFormat: string;
  weightUnit: string;
  notifications: NotificationSettings;
  companySettings: CompanySettings;
  productionParams: ProductionParams;
}

const defaultSettings: AppSettings = {
  animationsEnabled: true,
  compactMode: false,
  language: "es",
  timezone: "america_managua",
  dateFormat: "dd/mm/yyyy",
  weightUnit: "kg",
  notifications: {
    email: true,
    push: true,
    alerts: true,
    reports: false,
  },
  companySettings: {
    companyName: "Golden Leaf Tobacco Co.",
    taxId: "J0310000012345",
    address: "Km 152 Carretera Panamericana Norte, Esteli, Nicaragua",
    phone: "+505 2713-1234",
    email: "info@goldenleaf.com",
  },
  productionParams: {
    minTemp: 18,
    maxTemp: 32,
    minHumidity: 55,
    maxHumidity: 75,
  },
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem("app-settings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch (e) {
        console.error("Failed to load settings from localStorage", e);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Auto-save settings when they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("app-settings", JSON.stringify(settings));
    }
  }, [settings, loading]);

  const saveSettings = async (newSettings: Partial<AppSettings>) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      return { success: true };
    } catch (e) {
      console.error("Failed to save settings", e);
      return { success: false };
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return {
    settings,
    loading,
    saving,
    setSettings,
    saveSettings,
    updateSetting,
  };
}
