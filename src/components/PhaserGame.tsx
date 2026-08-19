/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";
import TypeFighterScene from "@/game/scenes/TypeFighterScene";

type Props = {
  floor: number;
  setSceneRef?: (scene: any | null) => void;
};

export default function PhaserGame({ floor, setSceneRef }: Props) {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const parent = gameRef.current;

    const game = new Phaser.Game({
      type: Phaser.AUTO,

      parent,

      backgroundColor: "#090b0f",

      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: parent.clientWidth,
        height: parent.clientHeight,
      },

      scene: TypeFighterScene,
    });

    game.scene.start("TypeFighterScene", {
      floor,
    });

    // expose the scene instance to parent via callback
    const sceneInstance = game.scene.getScene("TypeFighterScene");
    setSceneRef?.(sceneInstance as any);

    return () => {
      setSceneRef?.(null);
      game.destroy(true);
    };
  }, [floor]);

  return <div ref={gameRef} className="h-full w-full" />;
}