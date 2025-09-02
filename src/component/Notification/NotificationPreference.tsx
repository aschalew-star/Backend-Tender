import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Mail, Smartphone, Clock, X } from 'lucide-react';
import { useNotifications } from './UseNotification';
import {type NotificationPreferences } from '../type/Notifications';

interface NotificationPreferencesProps {
  onClose: () => void;
  userId?: number;
  customerId?: number;
}

const NotificationPreferencesComponent: React.FC<NotificationPreferencesProps> = ({
  onClose,
  userId,
  customerId
}) => {
  const { preferences, updatePreferences } = useNotifications(userId, customerId);
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences>(preferences);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    const newValue = !localPreferences[key];
    const updatedPrefs = { ...localPreferences, [key]: newValue };
    setLocalPreferences(updatedPrefs);
    updatePreferences({ [key]: newValue });
  };

  const handleTimeChange = (timeType: 'morningTime' | 'afternoonTime' | 'eveningTime', value: string) => {
    const updatedPrefs = { ...localPreferences, [timeType]: value };
    setLocalPreferences(updatedPrefs);
    updatePreferences({ [timeType]: value });
  };

  const handleCategoryToggle = (category: string) => {
    const categories = localPreferences.categories.includes(category)
      ? localPreferences.categories.filter(c => c !== category)
      : [...localPreferences.categories, category];
    
    const updatedPrefs = { ...localPreferences, categories };
    setLocalPreferences(updatedPrefs);
    updatePreferences({ categories });
  };

  const testSound = () => {
    const audio = new Audio('/sounds/default-notification.mp3');
    audio.play().catch(console.error);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-b border-gray-100 bg-gray-50/50"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-900">Notification Preferences</h4>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Communication Preferences */}
          <div>
            <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
              Communication
            </h5>
            <div className="space-y-2">
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Email Notifications</span>
                </div>
                <button
                  onClick={() => handleToggle('emailNotifications')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    localPreferences.emailNotifications ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    className="w-4 h-4 bg-white rounded-full absolute top-1"
                    animate={{
                      x: localPreferences.emailNotifications ? 20 : 4
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Push Notifications</span>
                </div>
                <button
                  onClick={() => handleToggle('pushNotifications')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    localPreferences.pushNotifications ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    className="w-4 h-4 bg-white rounded-full absolute top-1"
                    animate={{
                      x: localPreferences.pushNotifications ? 20 : 4
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </button>
              </label>
            </div>
          </div>

          {/* Sound Preferences */}
          <div>
            <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
              Sound
            </h5>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {localPreferences.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-gray-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-sm text-gray-700">Sound Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={testSound}
                  className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  Test
                </button>
                <button
                  onClick={() => handleToggle('soundEnabled')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    localPreferences.soundEnabled ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    className="w-4 h-4 bg-white rounded-full absolute top-1"
                    animate={{
                      x: localPreferences.soundEnabled ? 20 : 4
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Time Preferences */}
          <div>
            <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
              Daily Reminder Times
            </h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-700">Morning</span>
                </div>
                <input
                  type="time"
                  value={localPreferences.morningTime}
                  onChange={(e) => handleTimeChange('morningTime', e.target.value)}
                  className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-700">Afternoon</span>
                </div>
                <input
                  type="time"
                  value={localPreferences.afternoonTime}
                  onChange={(e) => handleTimeChange('afternoonTime', e.target.value)}
                  className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-700">Evening</span>
                </div>
                <input
                  type="time"
                  value={localPreferences.eveningTime}
                  onChange={(e) => handleTimeChange('eveningTime', e.target.value)}
                  className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Category Preferences */}
          <div>
            <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
              Notification Types
            </h5>
            <div className="flex flex-wrap gap-2">
              {['tender', 'payment', 'system', 'reminder'].map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${
                    localPreferences.categories.includes(category)
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } border`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationPreferencesComponent;