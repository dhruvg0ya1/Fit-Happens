import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui';
import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon } from './Icons';

const TRACKS = [
  'https://raw.githubusercontent.com/Sarthaksharma28-bit/meditation-audios/main/calm.mp3',
  'https://raw.githubusercontent.com/Sarthaksharma28-bit/meditation-audios/main/relaxing.mp3',
  'https://raw.githubusercontent.com/Sarthaksharma28-bit/meditation-audios/main/flute.mp3'
];

// Fisher-Yates shuffle algorithm
const shuffle = (array: string[]) => {
  let currentIndex = array.length,  randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
};

interface MusicPlayerProps {
    isActive: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isActive }) => {
    const [playlist, setPlaylist] = useState<string[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        setPlaylist(shuffle([...TRACKS]));
        setIsPlaying(isActive);
    }, [isActive]);
    
    const handleNextTrack = useCallback(() => {
        setCurrentTrackIndex(prevIndex => {
            const nextIndex = prevIndex + 1;
            if (nextIndex >= playlist.length) {
                setPlaylist(shuffle([...TRACKS])); // Reshuffle and start from beginning
                return 0;
            }
            return nextIndex;
        });
    }, [playlist.length]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !playlist.length) return;

        if (isPlaying) {
            if (audio.src !== playlist[currentTrackIndex]) {
                audio.src = playlist[currentTrackIndex];
            }
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // The AbortError is expected if we call pause() before play() is resolved.
                    // This can happen if the user clicks pause very quickly, or the component unmounts.
                    if (error.name !== 'AbortError') {
                        console.error("Audio play failed:", error);
                        // If play fails for any other reason, sync UI to paused state.
                        setIsPlaying(false);
                    }
                });
            }
        } else {
            audio.pause();
        }
    }, [isPlaying, currentTrackIndex, playlist]);


    const handlePlayPause = () => {
        setIsPlaying(prev => !prev);
    };

    const handlePrevTrack = () => {
        setCurrentTrackIndex(prevIndex => (prevIndex - 1 + playlist.length) % playlist.length);
    };
    
    // Cleanup on unmount
    useEffect(() => {
        const audio = audioRef.current;
        return () => {
            if (audio) {
                audio.pause();
                audio.src = "";
            }
        }
    }, []);

    const currentTrackName = playlist.length > 0 ? playlist[currentTrackIndex]?.split('/').pop()?.replace('.mp3', '') || 'Loading...' : 'Loading...';

    return (
        <div className="bg-secondary-bg/80 backdrop-blur-md p-2 rounded-2xl shadow-lg flex items-center gap-2 border border-white/10">
            <div className="flex flex-col text-left">
                <p className="font-bold text-sm text-light-1 capitalize w-24 truncate" title={currentTrackName}>{currentTrackName}</p>
                <p className="text-xs text-medium-1">Meditation Music</p>
            </div>
            <div className="flex items-center gap-0">
                <Button variant="ghost" size="sm" className="!p-2" onClick={handlePrevTrack} aria-label="Previous track">
                    <SkipBackIcon className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="!p-2" onClick={handlePlayPause} aria-label={isPlaying ? 'Pause music' : 'Play music'}>
                    {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                </Button>
                <Button variant="ghost" size="sm" className="!p-2" onClick={handleNextTrack} aria-label="Next track">
                    <SkipForwardIcon className="w-5 h-5" />
                </Button>
            </div>
             <audio
                ref={audioRef}
                onEnded={handleNextTrack}
                // We remove onPlay/onPause and src handlers to make `isPlaying` state the single source of truth
                // and avoid feedback loops and race conditions.
            />
        </div>
    );
};

export default MusicPlayer;
