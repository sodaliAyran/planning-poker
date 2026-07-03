import { useEffect, useState, useCallback } from 'react';
import socket from '../socket';
import type { RoomStateDTO } from '@poker/shared';

export function useRoom(roomId: string | undefined) {
  const [room, setRoom] = useState<RoomStateDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const onState = (state: RoomStateDTO) => setRoom(state);
    const onError = ({ message }: { message: string }) => setError(message);

    socket.on('room:state', onState);
    socket.on('error', onError);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off('room:state', onState);
      socket.off('error', onError);
    };
  }, [roomId]);

  const castVote = useCallback((value: string) => {
    socket.emit('vote:cast', { value });
  }, []);

  const revealVotes = useCallback(() => {
    socket.emit('reveal');
  }, []);

  const resetRound = useCallback(() => {
    socket.emit('reset');
  }, []);

  const setAutoReveal = useCallback((enabled: boolean) => {
    socket.emit('settings:autoReveal', { enabled });
  }, []);

  return { room, error, castVote, revealVotes, resetRound, setAutoReveal };
}
