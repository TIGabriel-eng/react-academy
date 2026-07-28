import { useRef, useEffect, useState, useCallback } from 'react';
import { VideoBlockerOverlay, VideoShareBlocker, YouTubeButtonBlocker } from './VideoBlockerOverlay';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  cursoId: number | null;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onResumeAt?: (seconds: number) => void;
}

type VideoType = 'youtube' | 'vimeo' | 'html5' | 'unknown';

function detectVideoType(url: string): VideoType {
  if (!url) return 'unknown';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  return 'html5';
}

function extractYouTubeId(url: string): string {
  const patterns = [
    /youtube\.com\/embed\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return url.split('/').pop()?.split('?')[0] || '';
}

function extractVimeoId(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1]?.split('?')[0] || '';
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

export function VideoPlayer({ videoUrl, title, cursoId, onProgress, onEnded }: VideoPlayerProps) {
  const videoType = detectVideoType(videoUrl);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletedOverlay, setShowCompletedOverlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const tempoAssistidoRef = useRef(0);
  const ultimoTempoRef = useRef(0);
  const cursoJaConcluidoRef = useRef(false);
  const watchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const vimeoPlayerRef = useRef<any>(null);
  const isPlayingRef = useRef(false);
  const isSeekingRef = useRef(false);
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const speeds = [0.5, 1, 1.5, 2];

  const getProgress = useCallback(() => {
    try {
      const storage = JSON.parse(localStorage.getItem('orcoma_progresso') || '{}');
      const email = localStorage.getItem('orcoma_user_email') || localStorage.getItem('orcoma_user_name') || 'guest';
      const userKey = 'user_' + email.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return storage.users?.[userKey]?.cursos?.[cursoId?.toString() || ''];
    } catch { return null; }
  }, [cursoId]);

  const saveProgress = useCallback((progresso: number) => {
    if (!cursoId || progresso <= 0 || progresso >= 100) return;
    const atual = getProgress();
    if (atual?.concluido) return;
    try {
      const storage = JSON.parse(localStorage.getItem('orcoma_progresso') || '{}');
      const email = localStorage.getItem('orcoma_user_email') || localStorage.getItem('orcoma_user_name') || 'guest';
      const userKey = 'user_' + email.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!storage.users) storage.users = {};
      if (!storage.users[userKey]) storage.users[userKey] = { cursos: {}, ultima_atualizacao: null };
      const key = cursoId.toString();
      storage.users[userKey].cursos[key] = {
        concluido: false,
        progresso: Math.max(atual?.progresso || 0, progresso),
        ultima_atualizacao: new Date().toISOString(),
        ultimo_segundo_assistido: Math.floor(ultimoTempoRef.current),
      };
      storage.users[userKey].ultima_atualizacao = new Date().toISOString();
      localStorage.setItem('orcoma_progresso', JSON.stringify(storage));
    } catch {}
  }, [cursoId, getProgress]);

  const markCompleted = useCallback(() => {
    if (cursoJaConcluidoRef.current) return;
    cursoJaConcluidoRef.current = true;
    setShowCompletedOverlay(true);
    setTimeout(() => setShowCompletedOverlay(false), 4000);
    if (onEnded) onEnded();
    if (watchIntervalRef.current) {
      clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = null;
    }
  }, [onEnded]);

  useEffect(() => {
    cursoJaConcluidoRef.current = false;
    tempoAssistidoRef.current = 0;
    ultimoTempoRef.current = 0;
    isSeekingRef.current = false;
  }, [videoUrl]);

  useEffect(() => {
    if (videoType !== 'html5' || !videoRef.current) return;
    const vid = videoRef.current;

    const onMeta = () => {
      setDuration(vid.duration);
      setIsLoading(false);
    };
    const onTimeUpdate = () => {
      if (isSeekingRef.current) return;
      const cur = vid.currentTime;
      setCurrentTime(cur);
      const delta = cur - ultimoTempoRef.current;
      if (delta > 0) tempoAssistidoRef.current += Math.min(delta, 3);
      ultimoTempoRef.current = cur;
      if (vid.duration > 0) {
        const pct = Math.min(100, Math.round((tempoAssistidoRef.current / vid.duration) * 100));
        saveProgress(pct);
        if (onProgress) onProgress(cur, vid.duration);
        if (tempoAssistidoRef.current / vid.duration >= 0.90) markCompleted();
      }
    };
    const onPlay = () => { setIsPlaying(true); isPlayingRef.current = true; };
    const onPause = () => { setIsPlaying(false); isPlayingRef.current = false; };
    const onEndedHandler = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
      markCompleted();
    };
    const onLoadStart = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    vid.addEventListener('loadedmetadata', onMeta);
    vid.addEventListener('timeupdate', onTimeUpdate);
    vid.addEventListener('play', onPlay);
    vid.addEventListener('pause', onPause);
    vid.addEventListener('ended', onEndedHandler);
    vid.addEventListener('loadstart', onLoadStart);
    vid.addEventListener('canplay', onCanPlay);

    return () => {
      vid.removeEventListener('loadedmetadata', onMeta);
      vid.removeEventListener('timeupdate', onTimeUpdate);
      vid.removeEventListener('play', onPlay);
      vid.removeEventListener('pause', onPause);
      vid.removeEventListener('ended', onEndedHandler);
      vid.removeEventListener('loadstart', onLoadStart);
      vid.removeEventListener('canplay', onCanPlay);
    };
  }, [videoType, saveProgress, onProgress, markCompleted]);

  useEffect(() => {
    if (videoType !== 'youtube') return;
    const ytId = extractYouTubeId(videoUrl);
    if (!ytId) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstTag = document.getElementsByTagName('script')[0];
    firstTag?.parentNode?.insertBefore(tag, firstTag);

    let player: any = null;

    const onPlayerReady = () => {
      setIsLoading(false);
      setDuration(player.getDuration());
      player.playVideo();
    };

    const onPlayerStateChange = (event: any) => {
      if (event.data === 1) {
        setIsPlaying(true);
        isPlayingRef.current = true;
        setIsLoading(false);
      } else if (event.data === 2) {
        setIsPlaying(false);
        isPlayingRef.current = false;
      } else if (event.data === 3) {
        setIsLoading(true);
      } else if (event.data === 0) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        markCompleted();
      }
    };

    const createPlayer = () => {
      if (typeof (window as any).YT === 'undefined' || !(window as any).YT.Player) {
        setTimeout(createPlayer, 300);
        return;
      }
      const divId = 'yt-player-container';
      const container = document.getElementById(divId);
      if (!container) return;
      player = new (window as any).YT.Player(divId, {
        videoId: ytId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          autoplay: 1,
          controls: 1,
          disablekb: 1,
          fs: 1,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
      ytPlayerRef.current = player;

      watchIntervalRef.current = setInterval(() => {
        if (!player || typeof player.getCurrentTime !== 'function') return;
        if (isSeekingRef.current) return;
        try {
          const cur = player.getCurrentTime();
          const dur = player.getDuration();
          setCurrentTime(cur);
          const delta = cur - ultimoTempoRef.current;
          if (delta > 0) tempoAssistidoRef.current += Math.min(delta, 3);
          ultimoTempoRef.current = cur;
          if (dur > 0) {
            const pct = Math.min(100, Math.round((tempoAssistidoRef.current / dur) * 100));
            saveProgress(pct);
            if (onProgress) onProgress(cur, dur);
            if (tempoAssistidoRef.current / dur >= 0.90) markCompleted();
          }
        } catch {}
      }, 3000);
    };

    createPlayer();

    return () => {
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current);
        watchIntervalRef.current = null;
      }
      ytPlayerRef.current = null;
      try { player?.destroy(); } catch {}
    };
  }, [videoType, videoUrl, saveProgress, onProgress, markCompleted]);

  useEffect(() => {
    if (videoType !== 'vimeo') return;
    const vimeoId = extractVimeoId(videoUrl);
    if (!vimeoId) return;

    let player: any = null;

    const initVimeo = async () => {
      if (typeof (window as any).Vimeo === 'undefined' || !(window as any).Vimeo.Player) {
        const tag = document.createElement('script');
        tag.src = 'https://player.vimeo.com/api/player.js';
        document.head.appendChild(tag);
        tag.onload = () => setTimeout(initVimeo, 500);
        return;
      }

      const iframe = iframeRef.current;
      if (!iframe) return;
      player = new (window as any).Vimeo.Player(iframe);
      vimeoPlayerRef.current = player;

      const dur = await player.getDuration();
      setDuration(dur);
      setIsLoading(false);

      player.on('timeupdate', (data: any) => {
        if (isSeekingRef.current) return;
        const cur = data.seconds;
        setCurrentTime(cur);
        const delta = cur - ultimoTempoRef.current;
        if (delta > 0) tempoAssistidoRef.current += Math.min(delta, 3);
        ultimoTempoRef.current = cur;
        if (dur > 0) {
          const pct = Math.min(100, Math.round((tempoAssistidoRef.current / dur) * 100));
          saveProgress(pct);
          if (onProgress) onProgress(cur, dur);
            if (tempoAssistidoRef.current / dur >= 0.90) markCompleted();
        }
      });

      player.on('play', () => { setIsPlaying(true); isPlayingRef.current = true; });
      player.on('pause', () => { setIsPlaying(false); isPlayingRef.current = false; });
      player.on('ended', () => {
        setIsPlaying(false);
        isPlayingRef.current = false;
        markCompleted();
      });

      player.play();
    };

    initVimeo();

    return () => {
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current);
        watchIntervalRef.current = null;
      }
      vimeoPlayerRef.current = null;
      try { player?.destroy(); } catch {}
    };
  }, [videoType, videoUrl, saveProgress, onProgress, markCompleted]);

  const togglePlay = useCallback(() => {
    const playing = isPlayingRef.current;
    if (videoType === 'html5' && videoRef.current) {
      if (playing) videoRef.current.pause();
      else videoRef.current.play();
    } else if (videoType === 'youtube' && ytPlayerRef.current) {
      const player = ytPlayerRef.current;
      try {
        if (typeof player.playVideo === 'function' && typeof player.pauseVideo === 'function') {
          if (playing) player.pauseVideo();
          else player.playVideo();
        }
      } catch {}
    } else if (videoType === 'vimeo' && vimeoPlayerRef.current) {
      const player = vimeoPlayerRef.current;
      try {
        if (playing) player.pause();
        else player.play();
      } catch {}
    }
  }, [videoType]);

  const handleSeekStart = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const time = parseFloat((e.target as HTMLInputElement).value);
    setCurrentTime(time);
    isSeekingRef.current = true;
  }, []);

  const applySeek = useCallback((time: number) => {
    isSeekingRef.current = false;
    if (videoType === 'html5' && videoRef.current) {
      videoRef.current.currentTime = time;
    } else if (videoType === 'youtube' && ytPlayerRef.current) {
      try { ytPlayerRef.current.seekTo(time, true); } catch {}
    } else if (videoType === 'vimeo' && vimeoPlayerRef.current) {
      try { vimeoPlayerRef.current.setCurrentTime(time); } catch {}
    }
  }, [videoType]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (videoType === 'html5' && videoRef.current) {
      videoRef.current.volume = vol;
    } else if (videoType === 'youtube' && ytPlayerRef.current) {
      try { ytPlayerRef.current.setVolume(vol * 100); } catch {}
    } else if (videoType === 'vimeo' && vimeoPlayerRef.current) {
      try { vimeoPlayerRef.current.setVolume(vol); } catch {}
    }
  }, [videoType]);

  const toggleMute = useCallback(() => {
    if (videoType === 'html5' && videoRef.current) {
      videoRef.current.muted = !isMuted;
    } else if (videoType === 'youtube' && ytPlayerRef.current) {
      try { isMuted ? ytPlayerRef.current.unMute() : ytPlayerRef.current.mute(); } catch {}
    } else if (videoType === 'vimeo' && vimeoPlayerRef.current) {
      try { vimeoPlayerRef.current.setMuted(!isMuted); } catch {}
    }
    setIsMuted(!isMuted);
  }, [videoType, isMuted]);

  const changeSpeed = useCallback((speed: number) => {
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
    if (videoType === 'html5' && videoRef.current) {
      videoRef.current.playbackRate = speed;
    } else if (videoType === 'youtube' && ytPlayerRef.current) {
      try { ytPlayerRef.current.setPlaybackRate(speed); } catch {}
    } else if (videoType === 'vimeo' && vimeoPlayerRef.current) {
      try { vimeoPlayerRef.current.setPlaybackRate(speed); } catch {}
    }
  }, [videoType]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    if (isPlayingRef.current) {
      hideControlsTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
        hideControlsTimerRef.current = null;
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          showControlsTemporarily();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          showControlsTemporarily();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          showControlsTemporarily();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          showControlsTemporarily();
          if (videoType === 'html5' && videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          } else if (videoType === 'youtube' && ytPlayerRef.current) {
            try { ytPlayerRef.current.seekTo(Math.max(0, ytPlayerRef.current.getCurrentTime() - 10), true); } catch {}
          } else if (videoType === 'vimeo' && vimeoPlayerRef.current) {
            try { vimeoPlayerRef.current.getCurrentTime().then((t: number) => vimeoPlayerRef.current.setCurrentTime(Math.max(0, t - 10))); } catch {}
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          showControlsTemporarily();
          if (videoType === 'html5' && videoRef.current) {
            videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
          } else if (videoType === 'youtube' && ytPlayerRef.current) {
            try { ytPlayerRef.current.seekTo(ytPlayerRef.current.getCurrentTime() + 10, true); } catch {}
          } else if (videoType === 'vimeo' && vimeoPlayerRef.current) {
            try { vimeoPlayerRef.current.getCurrentTime().then((t: number) => vimeoPlayerRef.current.setCurrentTime(t + 10)); } catch {}
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePlay, toggleFullscreen, toggleMute, showControlsTemporarily, videoType, duration]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isPlaying) {
        saveProgress(Math.min(100, Math.round((tempoAssistidoRef.current / (duration || 1)) * 100)));
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying && videoType === 'html5' && videoRef.current) {
        videoRef.current.pause();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, duration, saveProgress, videoType]);

  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    };
  }, []);

  const renderVideo = () => {
    if (videoType === 'youtube') {
      const ytId = extractYouTubeId(videoUrl);
      return (
        <div id="yt-player-container" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
          {!ytId && (
            <div className="va-no-video">
              <i className="fa-solid fa-video-slash" style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.4 }} />
              <span>Nenhum vídeo disponível para esta aula.</span>
            </div>
          )}
        </div>
      );
    }

    if (videoType === 'vimeo') {
      const vimeoId = extractVimeoId(videoUrl);
      return (
        <iframe
          ref={iframeRef}
          src={'https://player.vimeo.com/video/' + vimeoId + '?autoplay=1&title=0&byline=0&portrait=0'}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          sandbox="allow-scripts allow-same-origin"
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, border: 'none' }}
        />
      );
    }

    if (videoType === 'html5') {
      return (
        <video
          ref={videoRef}
          className="va-html5-video"
          preload="metadata"
          playsInline
          onContextMenu={(e) => e.preventDefault()}
          style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
        >
          <source src={videoUrl} type="video/mp4" />
          Seu navegador não suporta vídeo HTML5.
        </video>
      );
    }

    return (
      <div className="va-no-video">
        <i className="fa-solid fa-video-slash" style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.4 }} />
        <span>Nenhum vídeo disponível para esta aula.</span>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="va-video-container"
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => { if (isPlayingRef.current) setControlsVisible(false); }}
      onClick={showControlsTemporarily}
    >
      {renderVideo()}

      <VideoBlockerOverlay />
      <VideoShareBlocker />
      {videoType === 'youtube' && <YouTubeButtonBlocker />}

      {showCompletedOverlay && (
        <div className="va-completed-overlay">
          <div className="va-completed-badge">
            <div className="va-completed-badge__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="va-completed-badge__text">Aula Concluída!</span>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="va-loading">
          <div className="va-loading-spinner" />
          <span>Carregando vídeo...</span>
        </div>
      )}

      {videoType !== 'youtube' && (
      <div className={"va-controls" + (controlsVisible ? " visible" : "")}>
        <button
          className="va-controls__btn"
          onClick={() => { togglePlay(); showControlsTemporarily(); }}
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
        >
          {isPlaying ? (
            <i className="fa-solid fa-pause" />
          ) : (
            <i className="fa-solid fa-play" style={{ marginLeft: '2px' }} />
          )}
        </button>

        <div className="va-controls__timeline">
          <span className="va-controls__time">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onInput={handleSeekStart}
            onMouseUp={(e) => applySeek(parseFloat((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => applySeek(parseFloat((e.target as HTMLInputElement).value))}
            className="va-controls__slider"
            aria-label="Barra de progresso"
          />
          <span className="va-controls__time">{formatTime(duration)}</span>
        </div>

        <div className="va-controls__right">
          <div className="va-controls__volume">
            <button
              className="va-controls__btn"
              onClick={toggleMute}
              aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
            >
              <i className={isMuted ? 'fa-solid fa-volume-xmark' : volume > 0.5 ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-low'} />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="va-controls__volume-slider"
              aria-label="Volume"
            />
          </div>

          <div className="va-controls__speed">
            <button
              className="va-controls__speed-btn"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              aria-label="Velocidade de reprodução"
            >
              {playbackRate}x
            </button>
            {showSpeedMenu && (
              <div className="va-controls__speed-menu">
                {speeds.map((s) => (
                  <button
                    key={s}
                    className={'va-controls__speed-option' + (playbackRate === s ? ' active' : '')}
                    onClick={() => changeSpeed(s)}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="va-controls__btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            <i className={isFullscreen ? 'fa-solid fa-compress' : 'fa-solid fa-expand'} />
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
