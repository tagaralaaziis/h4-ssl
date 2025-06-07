import { useState, useEffect, useCallback } from 'react';
import useSound from 'use-sound';

// Alarm sound URL (using a CDN-hosted sound)
const alarmSoundUrl = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const useAlarmSound = () => {
  const [play, { stop }] = useSound(alarmSoundUrl, { volume: 0.5 });
  const [isPlaying, setIsPlaying] = useState(false);

  // Clean up when unmounting
  useEffect(() => {
    return () => {
      if (isPlaying) stop();
    };
  }, [isPlaying, stop]);

  const playAlarm = useCallback(() => {
    setIsPlaying(true);
    play();
    
    // Auto-stop after 3 seconds
    setTimeout(() => {
      stop();
      setIsPlaying(false);
    }, 3000);
  }, [play, stop]);

  const stopAlarm = useCallback(() => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
    }
  }, [isPlaying, stop]);

  return { playAlarm, stopAlarm, isPlaying };
};

export default useAlarmSound;