"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Mail,
  Smartphone,
  Settings,
  Save,
  ChevronDown,
  ChevronRight,
  Check,
  AlertCircle,
  MapPin,
  Tag,
  Layers,
  Info,
  Calendar,
} from "lucide-react";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";

// Native JavaScript date formatting function
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
};

// Mock data aligned with Prisma schema
const mockCategories = [
  { id: 1, name: "Construction", subcategories: [{ id: 1, name: "Building" }, { id: 2, name: "Infrastructure" }, { id: 3, name: "Roads" }] },
  { id: 2, name: "IT Services", subcategories: [{ id: 4, name: "Software Development" }, { id: 5, name: "Hardware" }, { id: 6, name: "Consulting" }] },
  { id: 3, name: "Healthcare", subcategories: [{ id: 7, name: "Medical Equipment" }, { id: 8, name: "Pharmaceuticals" }, { id: 9, name: "Services" }] },
  { id: 4, name: "Education", subcategories: [{ id: 10, name: "Supplies" }, { id: 11, name: "Technology" }, { id: 12, name: "Services" }] },
];

const mockRegions = [
  { id: 1, name: "Addis Ababa", code: "AA" },
  { id: 2, name: "Oromia", code: "OR" },
  { id: 3, name: "Amhara", code: "AM" },
  { id: 4, name: "Tigray", code: "TI" },
  { id: 5, name: "SNNP", code: "SN" },
];

const notificationPreferences = [
  { id: "MORNING", label: "Morning", description: "Receive reminders at 8 AM" },
  { id: "AFTERNOON", label: "Afternoon", description: "Receive reminders at 2 PM" },
  { id: "EVENING", label: "Evening", description: "Receive reminders at 6 PM" },
  { id: "DAILY", label: "Daily", description: "Daily summary at 9 AM" },
];

interface Settings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  reminderPreference: string; // Maps to NotificationPreference enum
  reminderDays: number[];
  customDueDate: string;
  selectedReminderCategories: number[];
  selectedReminderSubcategories: number[];
  selectedReminderRegions: number[];
}

interface ExpandedSections {
  general: boolean;
  reminders: boolean;
}

const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    reminderPreference: "DAILY",
    reminderDays: [1, 3, 7],
    customDueDate: "",
    selectedReminderCategories: [1, 2],
    selectedReminderSubcategories: [1, 4],
    selectedReminderRegions: [1, 2],
  });

  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    general: true,
    reminders: true,
  });

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  useEffect(() => {
    const autoSave = setTimeout(() => {
      console.log("Auto-saving settings...");
    }, 30000);
    return () => clearTimeout(autoSave);
  }, [settings]);

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleReminderCategory = (categoryId: number) => {
    setSettings((prev) => ({
      ...prev,
      selectedReminderCategories: prev.selectedReminderCategories.includes(categoryId)
        ? prev.selectedReminderCategories.filter((id) => id !== categoryId)
        : [...prev.selectedReminderCategories, categoryId],
    }));
  };

  const toggleReminderSubcategory = (subcategoryId: number) => {
    setSettings((prev) => ({
      ...prev,
      selectedReminderSubcategories: prev.selectedReminderSubcategories.includes(subcategoryId)
        ? prev.selectedReminderSubcategories.filter((id) => id !== subcategoryId)
        : [...prev.selectedReminderSubcategories, subcategoryId],
    }));
  };

  const toggleReminderRegion = (regionId: number) => {
    setSettings((prev) => ({
      ...prev,
      selectedReminderRegions: prev.selectedReminderRegions.includes(regionId)
        ? prev.selectedReminderRegions.filter((id) => id !== regionId)
        : [...prev.selectedReminderRegions, regionId],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call to save settings
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

    return (
        <div className="flex flex-col">
            <div>
                <Navbar/>
            </div>
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-16 pb-7">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Notification Settings */}
            <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
              <button
                onClick={() => toggleSection("general")}
                className="w-full flex items-center justify-between p-6 hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-xl flex items-center justify-center animate-pulse-slow">
                    <Settings className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-slate-900">General Settings</h3>
                    <p className="text-sm text-slate-600">Choose your notification channels</p>
                  </div>
                </div>
                {expandedSections.general ? (
                  <ChevronDown className="w-5 h-5 text-indigo-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-indigo-500" />
                )}
              </button>

              {expandedSections.general && (
                <div className="px-6 pb-6 space-y-6 animate-fadeIn">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                      Notification Channels
                      <Info
                        className="w-4 h-4 text-indigo-500 cursor-help"
                        onMouseEnter={() => setShowTooltip("channels")}
                        onMouseLeave={() => setShowTooltip(null)}
                      />
                      {showTooltip === "channels" && (
                        <div className="absolute z-10 p-2 bg-indigo-100 rounded-md text-sm text-indigo-800 shadow-md">
                          Select how you want to receive notifications
                        </div>
                      )}
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-indigo-600" />
                          <div>
                            <div className="font-medium text-slate-900">Email Notifications</div>
                            <div className="text-sm text-slate-600">Receive alerts via email</div>
                          </div>
                        </div>
                        <button
                          onClick={() => updateSetting("emailNotifications", !settings.emailNotifications)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            settings.emailNotifications ? "bg-indigo-600" : "bg-slate-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                              settings.emailNotifications ? "translate-x-6" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-indigo-600" />
                          <div>
                            <div className="font-medium text-slate-900">SMS Notifications</div>
                            <div className="text-sm text-slate-600">Receive alerts via SMS</div>
                          </div>
                        </div>
                        <button
                          onClick={() => updateSetting("smsNotifications", !settings.smsNotifications)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            settings.smsNotifications ? "bg-indigo-600" : "bg-slate-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                              settings.smsNotifications ? "translate-x-6" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-indigo-600" />
                          <div>
                            <div className="font-medium text-slate-900">Push Notifications</div>
                            <div className="text-sm text-slate-600">Browser push notifications</div>
                          </div>
                        </div>
                        <button
                          onClick={() => updateSetting("pushNotifications", !settings.pushNotifications)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            settings.pushNotifications ? "bg-indigo-600" : "bg-slate-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                              settings.pushNotifications ? "translate-x-6" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reminder Settings */}
            <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
              <button
                onClick={() => toggleSection("reminders")}
                className="w-full flex items-center justify-between p-6 hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-xl flex items-center justify-center animate-pulse-slow">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-slate-900">Reminder Settings</h3>
                    <p className="text-sm text-slate-600">Stay on top of tender deadlines</p>
                  </div>
                </div>
                {expandedSections.reminders ? (
                  <ChevronDown className="w-5 h-5 text-indigo-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-indigo-500" />
                )}
              </button>

              {expandedSections.reminders && (
                <div className="px-6 pb-6 space-y-8 animate-fadeIn">
                  {/* Reminder Preference */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                      Reminder Schedule
                      <Info
                        className="w-4 h-4 text-indigo-500 cursor-help"
                        onMouseEnter={() => setShowTooltip("reminderPreference")}
                        onMouseLeave={() => setShowTooltip(null)}
                      />
                      {showTooltip === "reminderPreference" && (
                        <div className="absolute z-10 p-2 bg-indigo-100 rounded-md text-sm text-indigo-800 shadow-md max-w-xs">
                          Choose when you want to receive reminder notifications for tender deadlines
                        </div>
                      )}
                    </h4>
                    <select
                      value={settings.reminderPreference}
                      onChange={(e) => updateSetting("reminderPreference", e.target.value)}
                      className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      {notificationPreferences.map((pref) => (
                        <option key={pref.id} value={pref.id}>
                          {pref.label} - {pref.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reminder Days */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                      Days Before Deadline
                      <Info
                        className="w-4 h-4 text-indigo-500 cursor-help"
                        onMouseEnter={() => setShowTooltip("reminderDays")}
                        onMouseLeave={() => setShowTooltip(null)}
                      />
                      {showTooltip === "reminderDays" && (
                        <div className="absolute z-10 p-2 bg-indigo-100 rounded-md text-sm text-indigo-800 shadow-md max-w-xs">
                          Select how many days before a tender deadline you want to be reminded
                        </div>
                      )}
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">Get reminders before tender deadlines</p>
                    <div className="flex flex-wrap gap-3">
                      {[1, 2, 3, 5, 7, 14, 30].map((days) => (
                        <button
                          key={days}
                          onClick={() => {
                            const newDays = settings.reminderDays.includes(days)
                              ? settings.reminderDays.filter((d) => d !== days)
                              : [...settings.reminderDays, days];
                            updateSetting("reminderDays", newDays);
                          }}
                          className={`px-5 py-2 rounded-full border transition-all duration-300 transform hover:scale-105 ${
                            settings.reminderDays.includes(days)
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                              : "bg-white text-indigo-700 border-indigo-200 hover:border-indigo-400 hover:shadow"
                          }`}
                        >
                          {days} day{days > 1 ? "s" : ""}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Due Date */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                      Custom Due Date
                      <Info
                        className="w-4 h-4 text-indigo-500 cursor-help"
                        onMouseEnter={() => setShowTooltip("dueDate")}
                        onMouseLeave={() => setShowTooltip(null)}
                      />
                      {showTooltip === "dueDate" && (
                        <div className="absolute z-10 p-2 bg-indigo-100 rounded-md text-sm text-indigo-800 shadow-md max-w-xs">
                          Set a specific date for a one-time tender reminder
                        </div>
                      )}
                    </h4>
                    <div className="relative">
                      <input
                        type="date"
                        value={settings.customDueDate}
                        onChange={(e) => updateSetting("customDueDate", e.target.value)}
                        className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-shadow"
                      />
                      {settings.customDueDate && (
                        <p className="text-sm text-indigo-600 mt-2 animate-fadeIn">
                          Reminder set for: {formatDate(settings.customDueDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Reminder Categories */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                      Reminder Categories
                      <Info
                        className="w-4 h-4 text-indigo-500 cursor-help"
                        onMouseEnter={() => setShowTooltip("reminderCategories")}
                        onMouseLeave={() => setShowTooltip(null)}
                      />
                      {showTooltip === "reminderCategories" && (
                        <div className="absolute z-10 p-2 bg-indigo-100 rounded-md text-sm text-indigo-800 shadow-md max-w-xs">
                          Choose categories to receive reminders for specific tender types
                        </div>
                      )}
                    </h4>
                    <div className="space-y-4">
                      {mockCategories.map((category) => (
                        <div key={category.id} className="border border-indigo-200 rounded-xl p-5 bg-indigo-50/30 hover:bg-indigo-50 transition-colors duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Layers className="w-5 h-5 text-indigo-600" />
                              <span className="font-medium text-slate-900">{category.name}</span>
                            </div>
                            <button
                              onClick={() => toggleReminderCategory(category.id)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                                settings.selectedReminderCategories.includes(category.id)
                                  ? "bg-indigo-600 border-indigo-600"
                                  : "border-indigo-300 hover:border-indigo-500"
                              }`}
                            >
                              {settings.selectedReminderCategories.includes(category.id) && (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 ml-8">
                            {category.subcategories.map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => toggleReminderSubcategory(sub.id)}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors duration-300 transform hover:scale-105 ${
                                  settings.selectedReminderSubcategories.includes(sub.id)
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                    : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:shadow"
                                }`}
                              >
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reminder Regions */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                      Reminder Regions
                      <Info
                        className="w-4 h-4 text-indigo-500 cursor-help"
                        onMouseEnter={() => setShowTooltip("reminderRegions")}
                        onMouseLeave={() => setShowTooltip(null)}
                      />
                      {showTooltip === "reminderRegions" && (
                        <div className="absolute z-10 p-2 bg-indigo-100 rounded-md text-sm text-indigo-800 shadow-md max-w-xs">
                          Select regions to receive reminders for tenders in those areas
                        </div>
                      )}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {mockRegions.map((region) => (
                        <div
                          key={region.id}
                          onClick={() => toggleReminderRegion(region.id)}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                            settings.selectedReminderRegions.includes(region.id)
                              ? "border-indigo-400 bg-indigo-50 shadow-md"
                              : "border-indigo-100 hover:border-indigo-300 hover:shadow"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                  settings.selectedReminderRegions.includes(region.id)
                                    ? "bg-indigo-600 text-white"
                                    : "bg-indigo-100 text-indigo-600"
                                }`}
                              >
                                {region.code}
                              </div>
                              <span className="font-medium text-slate-900">{region.name}</span>
                            </div>
                            {settings.selectedReminderRegions.includes(region.id) && (
                              <Check className="w-5 h-5 text-indigo-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Changes Button */}
            <div className="flex justify-end sticky bottom-4 z-20">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-full hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-lg animate-float"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 transform hover:scale-[1.01] transition-transform duration-300">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                Reminder Summary
                <Info
                  className="w-4 h-4 text-purple-500 cursor-help"
                  onMouseEnter={() => setShowTooltip("summary")}
                  onMouseLeave={() => setShowTooltip(null)}
                />
                {showTooltip === "summary" && (
                  <div className="absolute z-10 p-2 bg-purple-100 rounded-md text-sm text-purple-800 shadow-md max-w-xs">
                    Overview of your reminder settings
                  </div>
                )}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 hover:bg-purple-50 rounded-md transition-colors">
                  <span className="text-sm text-slate-600">Active Channels</span>
                  <span className="font-medium text-purple-600">
                    {
                      [settings.emailNotifications, settings.smsNotifications, settings.pushNotifications].filter(
                        Boolean,
                      ).length
                    }
                    /3
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-purple-50 rounded-md transition-colors">
                  <span className="text-sm text-slate-600">Reminder Categories</span>
                  <span className="font-medium text-purple-600">{settings.selectedReminderCategories.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-purple-50 rounded-md transition-colors">
                  <span className="text-sm text-slate-600">Reminder Subcategories</span>
                  <span className="font-medium text-purple-600">{settings.selectedReminderSubcategories.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-purple-50 rounded-md transition-colors">
                  <span className="text-sm text-slate-600">Reminder Regions</span>
                  <span className="font-medium text-purple-600">{settings.selectedReminderRegions.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-purple-50 rounded-md transition-colors">
                  <span className="text-sm text-slate-600">Reminder Days</span>
                  <span className="font-medium text-purple-600">{settings.reminderDays.length}</span>
                </div>
              </div>
            </div>

            {/* Recent Reminders */}
            <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 transform hover:scale-[1.01] transition-transform duration-300">
              <h3 className="font-semibold text-slate-900 mb-4">Recent Reminders</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">Construction Tender Deadline</div>
                    <div className="text-xs text-slate-600">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">IT Services Deadline</div>
                    <div className="text-xs text-slate-600">5 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">Healthcare Tender Reminder</div>
                    <div className="text-xs text-slate-600">1 day ago</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl border border-indigo-200 p-6 transform hover:scale-[1.01] transition-transform duration-300">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900">Need Help?</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Set up reminders to never miss a tender deadline.
              </p>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                View Documentation →
              </button>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
                
            </div>
            <div>
                <Footer/>
            </div>
            </div>
  );
};

export default NotificationSettingsPage;