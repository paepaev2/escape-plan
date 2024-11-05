"use client";

import { socket } from "@/socket";
import React, { useRef, useEffect, useState } from "react";
import Grid from "./grid";
import { GameLayoutProps, CellType, Player } from "@/types";
import Image from "next/image";

export default function GameLayout({ roomInfo }: GameLayoutProps) {
  const [currentRoomInfo, setCurrentRoomInfo] = useState(roomInfo);
  const map = currentRoomInfo.mapInfo.map;
  const moveSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const player = whoseTurn();
      if (player) {
        const move = getUpdatedPos(event.keyCode);
        if (move && isMoveValid(player, move)) {
          movePlayer(player, move);
        }
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [currentRoomInfo]);

  useEffect(() => {
    socket.on("update-room", (newRoomInfo) => {
      setCurrentRoomInfo(newRoomInfo);
    });

    return () => {
      socket.off("update-room");
    };
  }, []);

  const getCellContent = (cell: CellType) => {
    const wardenImage = "/images/warden.png";
    const prisonerImage = "/images/prisoner.png";

    switch (cell) {
      case 0:
        return (
          <div className="relative w-full h-full">
            <Image
              src="/images/base-tile.png"
              alt="base-tile"
              layout="fill"
              objectFit="cover"
            />
          </div>
        );
      case 1:
        return (
          <div className="relative w-full h-full">
            <Image
              src="/images/obstacle-tile.png"
              alt="Obstacle"
              layout="fill"
              objectFit="cover"
            />
          </div>
        );
      case "w":
        return (
          <div className="relative w-full h-full">
            <Image
              src="/images/base-tile.png"
              alt="base-tile"
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute inset-0">
              <Image
                src={wardenImage}
                alt="Warden"
                layout="fill"
                objectFit="contain"
              />
            </div>
          </div>
        );
      case "p":
        return (
          <div className="relative w-full h-full">
            <Image
              src="/images/base-tile.png"
              alt="base-tile"
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute inset-0">
              <Image
                src={prisonerImage}
                alt="Prisoner"
                layout="fill"
                objectFit="contain"
              />
            </div>
          </div>
        );
      case "h":
        return (
          <div className="relative w-full h-full">
            <Image
              src="/images/base-tile.png"
              alt="base-tile"
              layout="fill"
              objectFit="cover"
            />
          </div>
        );
      default:
        return "";
    }
  };

  const whoseTurn = (): Player | undefined => {
    // Mock the role to always be the prisoner
    return currentRoomInfo.players.find((p) => p.role === "warden");
  };

  const movePlayer = (player: Player, move: { x: number; y: number }) => {
    const currentIndex =
      player.role === "warden"
        ? currentRoomInfo.mapInfo.wCoor
        : currentRoomInfo.mapInfo.pCoor;

    const newRowIndex = currentIndex[0] + move.y;
    const newColumnIndex = currentIndex[1] + move.x;

    if (
      newRowIndex < 0 ||
      newRowIndex >= map.length ||
      newColumnIndex < 0 ||
      newColumnIndex >= map[0].length ||
      map[newRowIndex][newColumnIndex] === 1 ||
      (player.role === "warden" && map[newRowIndex][newColumnIndex] === "h")
    ) {
      return alert("Invalid move");
    }

    moveSoundRef.current?.play();
    const newMap = map.map((row) => [...row]);
    newMap[currentIndex[0]][currentIndex[1]] = 0;
    newMap[newRowIndex][newColumnIndex] = player.role[0] as CellType;

    const newRoomInfo = {
      ...currentRoomInfo,
      players: currentRoomInfo.players.map((p) => {
        if (p.role === player.role) {
          return {
            ...p,
            isTurn: false,
            win:
              map[newRowIndex][newColumnIndex] === "p" ||
              map[newRowIndex][newColumnIndex] === "h",
          };
        } else {
          return { ...p, isTurn: true, win: false };
        }
      }),
      mapInfo: {
        ...currentRoomInfo.mapInfo,
        map: newMap,
        [`${player.role[0]}Coor`]: [newRowIndex, newColumnIndex],
      },
    };

    setCurrentRoomInfo(newRoomInfo);
    socket.emit("update-position", newRoomInfo);
  };

  const isMoveValid = (
    player: Player,
    move: { x: number; y: number }
  ): boolean => {
    const currentIndex =
      player.role === "warden"
        ? currentRoomInfo.mapInfo.wCoor
        : currentRoomInfo.mapInfo.pCoor;
    const newRowIndex = currentIndex[0] + move.y;
    const newColumnIndex = currentIndex[1] + move.x;

    return (
      newRowIndex >= 0 &&
      newRowIndex < map.length &&
      newColumnIndex >= 0 &&
      newColumnIndex < map[0].length &&
      map[newRowIndex][newColumnIndex] !== 1 &&
      map[newRowIndex][newColumnIndex] !== player.role[0]
    );
  };

  const getUpdatedPos = (keyCode: number) => {
    switch (keyCode) {
      case 37: // left
        return { x: -1, y: 0 };
      case 38: // up
        return { x: 0, y: -1 };
      case 39: // right
        return { x: 1, y: 0 };
      case 40: // down
        return { x: 0, y: 1 };
      default:
        return null;
    }
  };

  return (
    <>
      <Grid
        map={map}
        onCellClick={() => {}}
        whoseTurn={whoseTurn}
        getCellContent={getCellContent}
        isMoveValid={() => true}
      />
      <audio ref={moveSoundRef} hidden>
        <source src="/music/move.m4a" type="audio/mp4" />
      </audio>
    </>
  );
}
