
import React, { useState } from 'react';
import { X, Settings, Bell, Clock, Palette, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [tempSettings, setTempSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(tempSettings);
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    setTempSettings(settings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <Tabs defaultValue="general" className="p-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <Label className="text-base font-medium">Calendar Preferences</Label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultView">Default View</Label>
                    <Select
                      value={tempSettings.defaultView}
                      onValueChange={(value: 'daily' | 'weekly') =>
                        setTempSettings(prev => ({ ...prev, defaultView: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="weekStart">Week Starts On</Label>
                    <Select
                      value={tempSettings.weekStartsOn.toString()}
                      onValueChange={(value) =>
                        setTempSettings(prev => ({ ...prev, weekStartsOn: parseInt(value) as 0 | 1 }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <Label className="text-base font-medium">Working Hours</Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="workStart">Start Time</Label>
                      <Input
                        id="workStart"
                        type="time"
                        value={tempSettings.workingHours.start}
                        onChange={(e) =>
                          setTempSettings(prev => ({
                            ...prev,
                            workingHours: { ...prev.workingHours, start: e.target.value }
                          }))
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="workEnd">End Time</Label>
                      <Input
                        id="workEnd"
                        type="time"
                        value={tempSettings.workingHours.end}
                        onChange={(e) =>
                          setTempSettings(prev => ({
                            ...prev,
                            workingHours: { ...prev.workingHours, end: e.target.value }
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <Label className="text-base font-medium">Notification Settings</Label>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Notifications</Label>
                      <p className="text-sm text-gray-500">Receive reminders for your events</p>
                    </div>
                    <Switch
                      checked={tempSettings.notifications.enabled}
                      onCheckedChange={(checked) =>
                        setTempSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, enabled: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Browser Notifications</Label>
                      <p className="text-sm text-gray-500">Show notifications in your browser</p>
                    </div>
                    <Switch
                      checked={tempSettings.notifications.browserNotifications}
                      onCheckedChange={(checked) =>
                        setTempSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, browserNotifications: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sound Notifications</Label>
                      <p className="text-sm text-gray-500">Play sound with notifications</p>
                    </div>
                    <Switch
                      checked={tempSettings.notifications.soundEnabled}
                      onCheckedChange={(checked) =>
                        setTempSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, soundEnabled: checked }
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="defaultReminder">Default Reminder (minutes before)</Label>
                    <Select
                      value={tempSettings.notifications.defaultReminder.toString()}
                      onValueChange={(value) =>
                        setTempSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, defaultReminder: parseInt(value) }
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <Label className="text-base font-medium">Appearance</Label>
                </div>

                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={tempSettings.theme}
                    onValueChange={(value: 'light' | 'dark' | 'system') =>
                      setTempSettings(prev => ({ ...prev, theme: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
