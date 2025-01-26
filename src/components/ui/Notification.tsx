"use client"

import React, { useState, useEffect } from "react"
import { Bell, Check, User, Heart, Bookmark, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Notification {
  id: string
  type: "like" | "save" | "other"
  message: string
  read: boolean
  timeAgo: string
  actionUser: {
    name: string | null
    image: string | null
  }
  resource: {
    title: string
  }
}

interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
  error?: string
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/notifications")
      const data: NotificationsResponse = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error("Failed to fetch notifications", error)
      setNotifications([])
      setUnreadCount(0)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        body: JSON.stringify({ notificationIds }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to clear notifications")
      }

      setNotifications((prev) => prev.filter((notification) => !notificationIds.includes(notification.id)))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to clear notifications", error)
      setError(error instanceof Error ? error.message : "Failed to clear notifications")
    }
  }

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
            <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs rounded-full">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 rounded-lg border bg-background">
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-base font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary hover:bg-transparent p-1"
              onClick={() => {
                const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
                markAsRead(unreadIds)
              }}
            >
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-3/4 rounded" />
                    <Skeleton className="h-2 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <DropdownMenuItem disabled className="px-3 py-2 text-destructive text-sm">
              {error}
            </DropdownMenuItem>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Inbox className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs text-muted-foreground">No new notifications.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-center space-x-2 px-3 py-2 transition-colors ${
                  !notification.read
                    ? "dark:bg-primary/5 hover:bg-primary/10 dark:hover:bg-primary/10"
                    : "hover:bg-muted/10 dark:hover:bg-muted/10"
                }`}
              >
                {notification.actionUser.image ? (
                  <Image
                    src={notification.actionUser.image || "/placeholder.svg"}
                    alt={notification.actionUser.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full h-8 w-8"
                  />
                ) : (
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {notification.type === "like" && <Heart className="inline h-3 w-3 text-red-500 mr-1" />}
                    {notification.type === "save" && <Bookmark className="inline h-3 w-3 text-blue-500 mr-1" />}
                    <span className="font-semibold">{notification.actionUser.name}</span> {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{notification.timeAgo}</p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

