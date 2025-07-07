
import { useEffect, useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { CalendarBlock } from '../types/calendar';
import { toast } from '@/hooks/use-toast';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  time: Date;
  blockId: string;
}

export const useNotifications = (blocks: CalendarBlock[]) => {
  const { settings } = useSettings();

  const requestNotificationPermission = useCallback(async () => {
    if (!settings.notifications.browserNotifications) return false;
    
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  }, [settings.notifications.browserNotifications]);

  const showNotification = useCallback((data: NotificationData) => {
    if (!settings.notifications.enabled) return;

    // Show toast notification
    toast({
      title: data.title,
      description: data.message,
    });

    // Show browser notification if enabled and permission granted
    if (settings.notifications.browserNotifications && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(data.title, {
        body: data.message,
        icon: '/favicon.ico',
        tag: data.blockId,
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    // Play sound if enabled
    if (settings.notifications.soundEnabled) {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DvwGEjBTOF0fPTgjMGJoPN9eGWRwwPVqXh6bpYGAg+ltryxnkpBSl+zPLaizsIGGS57OOaWRMJQXHV5rmVOw0FWKhS4vIjNgAQTXTNtKzj6Y8aEgBPcsyt5qK46DYADEd7xbex4OE8AAhJccGrqOPjOwAMS3jDswAUCRFLJ8K+MBsVUcLF02gCCE2ryLKByXy28OTbQ1e5h1KGClZFsIi6hmWgVMBEKqNBq+RNHUIunCGCAyITJ2ZGhQZPt7+xGh+GHhY4QFEM5V7dTFOD4WFCa0G4CwK1U4/rPBMDqWFPHNExvyEEABsFQD4HCGrDhIDRUZBv');
        audio.play().catch(() => {
          // Ignore audio play errors (browser restrictions)
        });
      } catch (error) {
        // Ignore audio creation errors
      }
    }
  }, [settings.notifications]);

  const scheduleNotifications = useCallback(() => {
    if (!settings.notifications.enabled) return;

    // Clear existing timeouts (in a real app, you'd want to manage these properly)
    blocks.forEach(block => {
      const blockDate = new Date(`${block.date}T${block.startTime}`);
      const reminderTime = new Date(blockDate.getTime() - (settings.notifications.defaultReminder * 60 * 1000));
      const now = new Date();

      // Only schedule future notifications
      if (reminderTime > now) {
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        
        setTimeout(() => {
          showNotification({
            id: `${block.id}-reminder`,
            title: `Upcoming: ${block.title}`,
            message: `Starting in ${settings.notifications.defaultReminder} minutes`,
            time: reminderTime,
            blockId: block.id
          });
        }, timeUntilReminder);
      }
    });
  }, [blocks, settings.notifications, showNotification]);

  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  useEffect(() => {
    scheduleNotifications();
  }, [scheduleNotifications]);

  return {
    showNotification,
    requestNotificationPermission,
  };
};
