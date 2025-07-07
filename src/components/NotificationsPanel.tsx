
import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '../contexts/SettingsContext';
import { CalendarBlock } from '../types/calendar';
import { format } from 'date-fns';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: CalendarBlock[];
  onOpenSettings: () => void;
}

interface UpcomingEvent {
  block: CalendarBlock;
  timeUntil: string;
  isToday: boolean;
}

const NotificationsPanel = ({ isOpen, onClose, blocks, onOpenSettings }: NotificationsPanelProps) => {
  const { settings } = useSettings();
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    const updateUpcomingEvents = () => {
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      const upcoming: UpcomingEvent[] = [];

      blocks.forEach(block => {
        const blockDateTime = new Date(`${block.date}T${block.startTime}`);
        const timeDiff = blockDateTime.getTime() - now.getTime();
        
        // Show events within the next 24 hours
        if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          
          let timeUntil = '';
          if (hours > 0) {
            timeUntil = `${hours}h ${minutes}m`;
          } else {
            timeUntil = `${minutes}m`;
          }

          upcoming.push({
            block,
            timeUntil,
            isToday: block.date === today
          });
        }
      });

      // Sort by time
      upcoming.sort((a, b) => {
        const timeA = new Date(`${a.block.date}T${a.block.startTime}`);
        const timeB = new Date(`${b.block.date}T${b.block.startTime}`);
        return timeA.getTime() - timeB.getTime();
      });

      setUpcomingEvents(upcoming);
    };

    updateUpcomingEvents();
    const interval = setInterval(updateUpcomingEvents, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [blocks]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onOpenSettings}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {!settings.notifications.enabled ? (
              <div className="text-center py-8">
                <BellOff className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Notifications Disabled</h3>
                <p className="text-gray-600 mb-4">Enable notifications in settings to see upcoming events.</p>
                <Button onClick={onOpenSettings} variant="outline">
                  Open Settings
                </Button>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Events</h3>
                <p className="text-gray-600">You have no events scheduled for the next 24 hours.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Upcoming Events</h4>
                {upcomingEvents.map((event) => (
                  <div
                    key={event.block.id}
                    className="p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{event.block.title}</h5>
                        <p className="text-sm text-gray-600">
                          {format(new Date(`${event.block.date}T${event.block.startTime}`), 'h:mm a')} - 
                          {format(new Date(`${event.block.date}T${event.block.endTime}`), 'h:mm a')}
                        </p>
                        {event.block.description && (
                          <p className="text-sm text-gray-500 mt-1">{event.block.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={event.isToday ? "default" : "secondary"}>
                          {event.timeUntil}
                        </Badge>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: event.block.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPanel;
