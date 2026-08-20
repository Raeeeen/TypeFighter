"use client";

import { useEffect } from "react";

export default function PresenceBeacon() {
  useEffect(() => {
    const sendHeartbeat = () => {
      void fetch("/api/presence", {
        method: "POST",
        keepalive: true,
      }).catch(() => {});
    };

    sendHeartbeat();
    const timer = window.setInterval(sendHeartbeat, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  return null;
}