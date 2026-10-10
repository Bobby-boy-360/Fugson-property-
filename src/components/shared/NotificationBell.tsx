
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, X, LoaderCircle } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('auth_token');

    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? 'Your session may have expired. Please sign in again.'
            : 'Could not load notifications.'
        );
      }

      const data: NotificationItem[] = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load notifications.'
      );
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();

    const interval = window.setInterval(() => {
      void fetchNotifications();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${id}/read`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Could not mark this notification as read.');
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setError('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.'
      );
      void fetchNotifications();
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/read-all`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Could not mark notifications as read.');
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
      setError('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.'
      );
      void fetchNotifications();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        title="Notifications"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <section className="absolute right-0 top-full z-50 mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Notifications
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {unreadCount} unread
                </p>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void markAllAsRead()}
                    disabled={loading}
                    className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 disabled:opacity-50"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Read all
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="border-b border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                {error}
              </div>
            )}

            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 && !error ? (
                <div className="px-6 py-10 text-center">
                  <Bell className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">
                    You&apos;re all caught up
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    New notifications will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    type="button"
                    key={notification.id}
                    onClick={() => {
                      if (!notification.is_read) {
                        void markAsRead(notification.id);
                      }
                    }}
                    className={`flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${
                      notification.is_read ? 'bg-white' : 'bg-teal-50/60'
                    }`}
                  >
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        notification.is_read
                          ? 'bg-slate-200'
                          : 'bg-teal-600'
                      }`}
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-800">
                        {notification.title}
                      </span>
                      <span className="mt-1 block whitespace-normal break-words text-xs leading-5 text-slate-600">
                        {notification.message}
                      </span>
                      <span className="mt-2 block text-[10px] text-slate-400">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 text-[11px] text-slate-500">
              <LoaderCircle className="h-3 w-3" />
              Updates automatically every 10 seconds
            </div>
          </section>
        </>
      )}
    </div>
  );
}
