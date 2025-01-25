'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, User, Heart, Bookmark, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Notification {
  id: string;
  type: 'like' | 'save' | 'other';
  message: string;
  read: boolean;
  timeAgo: string;
  actionUser: {
    name: string | null;
    image: string | null;
  };
  resource: {
    title: string;
  };
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  error?: string;
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications');
      const data: NotificationsResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      setNotifications([]);
      setUnreadCount(0);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        body: JSON.stringify({ notificationIds }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear notifications');
      }

      // Immediately update local state to remove notifications
      setNotifications(prev =>
        prev.filter(notification => !notificationIds.includes(notification.id))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications', error);
      setError(error instanceof Error ? error.message : 'Failed to clear notifications');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative bg-background hover:bg-primary/10 transition-colors duration-300 rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 p-0 rounded-lg border bg-background"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-lg font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-primary hover:bg-transparent"
              onClick={() => {
                const unreadIds = notifications
                  .filter(n => !n.read)
                  .map(n => n.id);
                markAsRead(unreadIds);
              }}
            >
              <Check className="h-4 w-4 mr-2" /> Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <DropdownMenuItem disabled className="px-4 py-3 text-destructive">
              {error}
            </DropdownMenuItem>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Inbox className="h-10 w-10 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                All caught up!
              </h3>
              <p className="text-sm text-muted-foreground">
                You have no new notifications at the moment.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start space-x-3 px-4 py-3 transition-colors ${
                  !notification.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/10'
                }`}
              >
                {notification.actionUser.image ? (
                  <Image
                    src={notification.actionUser.image}
                    alt={notification.actionUser.name || 'User'}
                    width={40}
                    height={40}
                    className="rounded-full h-10 w-10"
                  />
                ) : (
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    {notification.type === 'like' && (
                      <Heart className="h-4 w-4 text-red-500" />
                    )}
                    {notification.type === 'save' && (
                      <Bookmark className="h-4 w-4 text-blue-500" />
                    )}
                    <p className="text-sm font-medium">
                      <span className="font-semibold">{notification.actionUser.name}</span>{' '}
                      {notification.message}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.timeAgo}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}