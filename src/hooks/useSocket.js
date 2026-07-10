import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '@/constants';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import toast from 'react-hot-toast';

let socketInstance = null;

export const useSocket = () => {
  const { accessToken, user } = useAuthStore();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const initialized = useRef(false);

  useEffect(() => {
    if (!accessToken || !user || initialized.current) return;
    initialized.current = true;

    socketInstance = io(SOCKET_URL, {
      auth:            { token: accessToken },
      transports:      ['websocket'],
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] connected');
    });

    // Real-time notification
    socketInstance.on('notification', (n) => {
      addNotification(n);
      toast(n.message, { icon: '🔔' });
    });

    socketInstance.on('lead:updated', (data) => {
      // Components can subscribe to this via queryClient.invalidateQueries
      window.dispatchEvent(new CustomEvent('lead:updated', { detail: data }));
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket] disconnected');
    });

    return () => {
      socketInstance?.disconnect();
      initialized.current = false;
    };
  }, [accessToken, user, addNotification]);

  return socketInstance;
};

export const getSocket = () => socketInstance;
