/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import { useMultiplayer } from "@/hooks/useMultiplayer";

const PhaserGame = dynamic(() => import("@/components/PhaserGame"), { ssr: false });

type Props = {
  userId: string;
  username: string;
  floor: number;
  status: string;
  large?: boolean;
  thumbnailOnly?: boolean;
  registerOpponentHandler: ReturnType<typeof useMultiplayer>["registerOpponentHandler"];
};

export default function MiniOpponentScreen({
  userId, username, floor, status, large, thumbnailOnly, registerOpponentHandler,
}: Props) {
  const sceneRef = useRef<any>(null);

  const handleSceneRef = useCallback((scene: any | null) => {
    sceneRef.current = scene;
  }, []);

  useEffect(() => {
    return registerOpponentHandler(userId, (type) => {
      if (type === "correct") sceneRef.current?.remoteCorrectHit?.();
      else sceneRef.current?.remoteMistake?.();
    });
  }, [userId, registerOpponentHandler]);

  return (
    <div className={large ? "relative h-full w-full" : "relative h-full w-full"}>
      <PhaserGame floor={floor} playerName={username} mode="multiplayer" spectator muted setSceneRef={handleSceneRef} />
      <div className="pointer-events-none absolute bottom-1 left-1 flex items-center gap-1 bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white/80">
        {username}
        {status === "finished" && <span className="text-green-400">✓</span>}
      </div>
    </div>
  );
}