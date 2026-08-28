"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PresenceBeacon() {
  const router = useRouter();

  useEffect(() => {
    const sendHeartbeat = () => {
      void fetch("/api/presence", { method: "POST", keepalive: true })
        .then(() => router.refresh())
        .catch(() => {});
    };

    sendHeartbeat();
    const timer = window.setInterval(sendHeartbeat, 30_000);

    return () => window.clearInterval(timer);
  }, [router]);

  return null;
}