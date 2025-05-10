// src/hooks/useWebSocket.js
import { useEffect, useState } from 'react';
import { WS_URL } from '../constants/constants';

const useWebSocket = (username) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!username) return;

    // Use native WebSocket instead of socket.io
    const ws = new WebSocket(`${WS_URL.replace('http', 'ws')}/ws/notifications/?username=${username}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotifications((prev) => [
        { ...data, read: false },
        ...prev,
      ]);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [username]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const clearNotifications = () => setNotifications([]);

  return { notifications, markAsRead, clearNotifications };
};

export default useWebSocket;