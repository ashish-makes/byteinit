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
import { cn } from '@/lib/utils';

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
          className="relative h-9 w-9 rounded-full hover:bg-muted/50 transition-colors duration-200"
        >
          <Bell className="h-4.5 w-4.5 transition-colors duration-200" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center rounded-full text-[10px] font-medium animate-in zoom-in-75 duration-200"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={cn(
          "w-[380px] p-0 rounded-xl",
          "border border-border/50",
          "bg-background/95 backdrop-blur-sm",
          "shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.2)]",
          "animate-in zoom-in-75 duration-200"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex flex-col">
            <h3 className="text-sm font-medium">Notifications</h3>
            {!loading && notifications.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {unreadCount} unread • {allCount} total
              </p>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs rounded-lg hover:bg-muted/80 transition-colors duration-200"
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
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs rounded-lg hover:bg-muted/80 transition-colors duration-200"
                onClick={clearNotifications}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Clear all
              </Button>
            </div>
          )}
        </div>
        
        <ScrollArea className="max-h-[420px] overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <Bell className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                We'll notify you when something happens
              </p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification) => {
                const message = getNotificationMessage(notification);
                const link = getNotificationLink(notification);
                
                return (
                  <div 
                    key={notification.id}
                    className={cn(
                      "group flex items-start gap-3 p-4 hover:bg-muted/50 relative",
                      "transition-colors duration-200",
                      !notification.read && "bg-muted/30",
                      "border-b border-border/40 last:border-0"
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100",
                        "transition-all duration-200",
                        "text-muted-foreground/40 hover:text-foreground hover:bg-muted/80"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    
                    <div 
                      className="flex items-start gap-3 w-full pr-8 cursor-pointer" 
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
                          width={36}
                          height={36}
                          className="rounded-full ring-2 ring-background"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background">
                          <span className="text-sm font-medium">
                            {notification.actionUser.name?.[0] || 'U'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed">
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
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50">
                              Resource
                            </Badge>
                          ) : notification.type.includes('BLOG') ? (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 rounded-full bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200/50 dark:border-green-800/50">
                              Blog
                            </Badge>
                          ) : null}
                          
                          {notification.type.includes('LIKE') && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-800/50">
                              Like
                            </Badge>
                          )}
                          
                          {notification.type.includes('SAVE') && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50">
                              Save
                            </Badge>
                          )}
                          
                          {notification.type.includes('VOTE') && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50">
                              Vote
                            </Badge>
                          )}
                          
                          {notification.type.includes('COMMENT') && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-200/50 dark:border-teal-800/50">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 