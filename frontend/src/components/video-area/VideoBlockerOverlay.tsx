import { useCallback } from 'react';

export function VideoBlockerOverlay() {
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && ['t', 'n', 'w'].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  }, []);

  return (
    <div
      className="video-blocker-overlay"
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      aria-hidden="true"
    />
  );
}

export function VideoShareBlocker() {
  return (
    <>
      <div className="video-share-blocker" aria-hidden="true" />
      <div className="video-share-blocker-left" aria-hidden="true" />
      <div className="video-share-blocker-top" aria-hidden="true" />
    </>
  );
}

export function YouTubeButtonBlocker() {
  return (
    <>
      <div className="yt-blocker yt-blocker-share" aria-hidden="true" />
      <div className="yt-blocker yt-blocker-later" aria-hidden="true" />
      <div className="yt-blocker yt-blocker-youtube" aria-hidden="true" />
      <div className="yt-blocker yt-blocker-settings" aria-hidden="true" />
      <div className="yt-blocker yt-blocker-menu" aria-hidden="true" />
    </>
  );
}
