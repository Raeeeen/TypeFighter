/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";
import TypeFighterScene from "@/game/scenes/TypeFighterScene";

type Props = {
  floor: number;
  playerName: string;
  mode?: "solo" | "multiplayer";
  spectator?: boolean;
  setSceneRef?: (scene: any | null) => void;
  onSentenceChange?: (sentence: string) => void;
  onFloorCleared?: () => void;
  onCorrectHit?: () => void;
  onMistake?: () => void;
  muted?: boolean;
  onVictory?: (stats: { wpm: number; accuracy: number; time: number }) => void;
  onDefeat?: () => void;
};

export default function PhaserGame({
  floor,
  playerName,
  mode = "solo",
  spectator = false,
  setSceneRef,
  onSentenceChange,
  onFloorCleared,
  onCorrectHit,
  onMistake,
  onVictory,
  onDefeat,
  muted = false,
}: Props) {
  const gameRef = useRef<HTMLDivElement>(null);

  const callbacksRef = useRef({
    onSentenceChange,
    onFloorCleared,
    onCorrectHit,
    onMistake,
    onVictory,
    onDefeat,
  });
  useEffect(() => {
    callbacksRef.current = {
      onSentenceChange,
      onFloorCleared,
      onCorrectHit,
      onMistake,
      onVictory,
      onDefeat,
    };
  });

  useEffect(() => {
    if (!gameRef.current) return;
    const parent = gameRef.current;
    let destroyed = false;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent,
      backgroundColor: "#090b0f",
      audio: { noAudio: muted },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 450,
      },
      scene: TypeFighterScene,
    });

    game.scene.start("TypeFighterScene", {
      floor,
      playerName,
      mode,
      spectator,
      muted,
      onSentenceChange: (s: string) =>
        !destroyed && callbacksRef.current.onSentenceChange?.(s),
      onFloorCleared: () =>
        !destroyed && callbacksRef.current.onFloorCleared?.(),
      onCorrectHit: () => !destroyed && callbacksRef.current.onCorrectHit?.(),
      onMistake: () => !destroyed && callbacksRef.current.onMistake?.(),
      onVictory: (stats: any) =>
        !destroyed && callbacksRef.current.onVictory?.(stats),
      onDefeat: () => !destroyed && callbacksRef.current.onDefeat?.(),
      onSceneReady: (scene: any) => !destroyed && setSceneRef?.(scene),
    });

    return () => {
      destroyed = true;
      setSceneRef?.(null);
      try {
        game.destroy(true);
      } catch {
        // AudioContext
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floor, playerName, mode, spectator, muted]);

  return <div ref={gameRef} className="h-full w-full" />;
}
