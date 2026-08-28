/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

type OpponentInfo = { username: string; floor: number; status: string };
type TypingInfo = { sentence: string; text: string };

export function useMultiplayer() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<any>(null);
  const [opponents, setOpponents] = useState<Record<string, OpponentInfo>>({});
  const [opponentTyping, setOpponentTyping] = useState<
    Record<string, TypingInfo>
  >({});
  const [results, setResults] = useState<any[] | null>(null);
  const [notInRoom, setNotInRoom] = useState(false);
  const opponentActionHandlers = useRef<
    Record<string, Set<(type: "correct" | "mistake") => void>>
  >({});

  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;

    getSocket().then((s) => {
      if (!active) return;
      setSocket(s);

      const onMatchFound = (r: any) => setRoom(r);
      const onLobbyCreated = (r: any) => setRoom(r);
      const onLobbyUpdated = (r: any) => setRoom(r);
      const onGameStart = ({ room: r }: any) => {
        setRoom(r);
        setOpponents((prev) => {
          const next = { ...prev };
          r.players.forEach((p: any) => {
            if (p.id !== s.id) {
              next[p.userId] = {
                username: p.username,
                floor: p.floor ?? next[p.userId]?.floor ?? 1,
                status: p.status ?? "playing",
              };
            }
          });
          return next;
        });
      };
      const onNotInRoom = () => setNotInRoom(true);
      const onPlayerReady = ({ userId, username, floor }: any) => {
        setOpponents((prev) => ({
          ...prev,
          [userId]: { username, floor, status: "playing" },
        }));
      };
      const onOpponentAction = ({ userId, type }: any) => {
        opponentActionHandlers.current[userId]?.forEach((handler) =>
          handler(type),
        );
      };
      const onOpponentTyping = ({ userId, sentence, text }: any) => {
        setOpponentTyping((prev) => ({
          ...prev,
          [userId]: { sentence, text },
        }));
      };
      const onPlayerFinished = ({ userId }: any) => {
        setOpponents((prev) =>
          prev[userId]
            ? { ...prev, [userId]: { ...prev[userId], status: "finished" } }
            : prev,
        );
      };
      const onResults = ({ ranking }: any) => setResults(ranking);
      const onPlayerLeft = ({ userId }: any) => {
        setOpponents((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      };

      s.on("match:found", onMatchFound);
      s.on("lobby:created", onLobbyCreated);
      s.on("lobby:updated", onLobbyUpdated);
      s.on("game:start", onGameStart);
      s.on("game:notInRoom", onNotInRoom);
      s.on("game:playerReady", onPlayerReady);
      s.on("game:opponentAction", onOpponentAction);
      s.on("game:opponentTyping", onOpponentTyping);
      s.on("game:playerFinished", onPlayerFinished);
      s.on("game:results", onResults);
      s.on("game:playerLeft", onPlayerLeft);

      cleanup = () => {
        s.off("match:found", onMatchFound);
        s.off("lobby:created", onLobbyCreated);
        s.off("lobby:updated", onLobbyUpdated);
        s.off("game:start", onGameStart);
        s.off("game:notInRoom", onNotInRoom);
        s.off("game:playerReady", onPlayerReady);
        s.off("game:opponentAction", onOpponentAction);
        s.off("game:opponentTyping", onOpponentTyping);
        s.off("game:playerFinished", onPlayerFinished);
        s.off("game:results", onResults);
        s.off("game:playerLeft", onPlayerLeft);
      };
    });

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  const emitLeave = useCallback(
    (code: string) => socket?.emit("game:leave", { code }),
    [socket],
  );

  const registerOpponentHandler = useCallback(
    (userId: string, handler: (type: "correct" | "mistake") => void) => {
      if (!opponentActionHandlers.current[userId]) {
        opponentActionHandlers.current[userId] = new Set();
      }
      opponentActionHandlers.current[userId].add(handler);
      return () => {
        opponentActionHandlers.current[userId]?.delete(handler);
      };
    },
    [],
  );

  const joinQueue = useCallback(() => socket?.emit("queue:join"), [socket]);
  const createLobby = useCallback(
    (maxPlayers: number) => socket?.emit("lobby:create", { maxPlayers }),
    [socket],
  );
  const joinLobby = useCallback(
    (code: string) => socket?.emit("lobby:join", { code }),
    [socket],
  );
  const startLobby = useCallback(
    (code: string) => socket?.emit("lobby:start", { code }),
    [socket],
  );

  const announceReady = useCallback(
    (code: string, floor: number) =>
      socket?.emit("game:ready", { code, floor }),
    [socket],
  );
  const emitAction = useCallback(
    (code: string, type: "correct" | "mistake") =>
      socket?.emit("game:action", { code, type }),
    [socket],
  );
  const emitTyping = useCallback(
    (code: string, sentence: string, text: string) =>
      socket?.emit("game:typing", { code, sentence, text }),
    [socket],
  );
  const emitFinish = useCallback(
    (
      code: string,
      wpm: number,
      accuracy: number,
      time: number,
      outcome: "victory" | "defeat",
    ) => socket?.emit("game:finish", { code, wpm, accuracy, time, outcome }),
    [socket],
  );

  return {
    socket,
    room,
    opponents,
    opponentTyping,
    results,
    notInRoom,
    joinQueue,
    createLobby,
    joinLobby,
    startLobby,
    announceReady,
    emitAction,
    emitTyping,
    emitFinish,
    emitLeave,
    registerOpponentHandler,
  };
}
