"use client"

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  actionUser: {
    name: string | null;
    image: string | null;
  };
  resource?: {
    id: string;
    title: string;
  };
  blog?: {
    id: string;
    title: string;
  };
  comment?: {
    content: string;
  };
}

// Helper functions for reuse
function getNotificationMessage(notification: Notification) {
  try {
    // Handle undefined notification
    if (!notification) {
      return 'interacted with your content';
    }

    switch (notification.type) {
      case 'RESOURCE_LIKE':
        return `liked your resource "${notification.resource?.title || 'Unknown resource'}"`;
      case 'RESOURCE_SAVE':
        return `saved your resource "${notification.resource?.title || 'Unknown resource'}"`;
      case 'BLOG_VOTE':
        return `voted on your post "${notification.blog?.title || 'Unknown post'}"`;
      case 'BLOG_SAVE':
        return `saved your post "${notification.blog?.title || 'Unknown post'}"`;
      case 'BLOG_COMMENT':
        return `commented on your post "${notification.blog?.title || 'Unknown post'}"`;
      default:
        return 'interacted with your content';
    }
  } catch (error) {
    return 'interacted with your content';
  }
}

function getNotificationLink(notification: Notification) {
  try {
    // Handle undefined notification
    if (!notification) {
      return '#';
    }
    
    switch (notification.type) {
      case 'RESOURCE_LIKE':
      case 'RESOURCE_SAVE':
        if (!notification.resource?.id) {
          return '#';
        }
        return `/resources/${notification.resource.id}`;
      case 'BLOG_VOTE':
      case 'BLOG_SAVE':
      case 'BLOG_COMMENT':
        // Check if blog exists and has an id
        if (!notification.blog || !notification.blog.id) {
          return '#';
        }
        return `/blog/${notification.blog.id}`;
      default:
        return '#';
    }
  } catch (error) {
    return '#';
  }
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      const notificationArray = data.notifications || [];
      setNotifications(notificationArray);
    } catch (error) {
      toast.error('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark notification as read');
      }

      setNotifications(notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
      
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const clearNotifications = async () => {
    if (notifications.length === 0) {
      toast.info('No notifications to clear');
      return;
    }
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationIds: notifications.map((n: Notification) => n.id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear notifications');
      }

      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  // Get counts for tabs
  const unreadCount = notifications.filter(n => !n.read).length;
  const allCount = notifications.length;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px] p-0 rounded-xl border-border/60 shadow-lg">
        <div className="flex items-center justify-between p-3 border-b rounded-t-xl bg-muted/30">
          <h3 className="text-base font-semibold">Notifications</h3>
          {notifications.length > 0 && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs rounded-lg hover:bg-background/80"
                onClick={() => {
                  const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
                  if (unreadIds.length > 0) {
                    fetch('/api/notifications', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ notificationIds: unreadIds }),
                    }).then(() => {
                      setNotifications(notifications.map(n => ({ ...n, read: true })));
                      toast.success('All notifications marked as read');
                    });
                  }
                }}
              >
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs rounded-lg hover:bg-background/80"
                onClick={clearNotifications}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>
        
        <ScrollArea className="max-h-[400px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                We'll notify you when something happens
              </p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification) => {
                // Generate the message and link for the notification
                const message = getNotificationMessage(notification);
                const link = getNotificationLink(notification);
                
                return (
                  <div 
                    key={notification.id}
                    className={`
                      flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer relative
                      ${!notification.read ? 'bg-muted/30' : ''}
                      border-b border-border/20 last:border-0
                    `}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full text-muted-foreground/40 hover:text-foreground hover:bg-muted/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    
                    <div 
                      className="flex items-start gap-3 w-full pr-6" 
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                        window.location.href = link;
                      }}
                    >
                      {notification.actionUser.image ? (
                        <Image
                          src={notification.actionUser.image}
                          alt={notification.actionUser.name || 'User'}
                          width={40}
                          height={40}
                          className="rounded-full ring-2 ring-background"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background">
                          <span className="text-sm font-medium">
                            {notification.actionUser.name?.[0] || 'U'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">
                            {notification.actionUser.name}
                          </span>{' '}
                          {message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                        
                        {/* Display badge for notification type */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {notification.type.includes('RESOURCE') ? (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                              Resource
                            </Badge>
                          ) : notification.type.includes('BLOG') ? (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                              Blog
                            </Badge>
                          ) : null}
                          
                          {notification.type.includes('LIKE') && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-full bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                              Like
                            </Badge>
                          )}
                          
                          {notification.type.includes('SAVE') && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                              Save
                            </Badge>
                          )}
                          
                          {notification.type.includes('VOTE') && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                              Vote
                            </Badge>
                          )}
                          
                          {notification.type.includes('COMMENT') && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
                              Comment
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        {!loading && notifications.length > 0 && (
          <div className="p-2 border-t text-center text-xs text-muted-foreground bg-muted/20 rounded-b-xl">
            {allCount} {allCount === 1 ? 'notification' : 'notifications'} total • {unreadCount} unread
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 