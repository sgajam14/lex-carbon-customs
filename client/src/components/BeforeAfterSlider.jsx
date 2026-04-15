import { useState, useRef, useCallback, useEffect } from 'react';

export default function BeforeAfterSlider({ beforeSrc, afterSrc, beforeLabel = 'Before', afterLabel = 'After' }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const onMouseDown = () => { dragging.current = true; };
  const onMouseUp = () => { dragging.current = false; };
  const onMouseMove = (e) => { if (dragging.current) updatePosition(e.clientX); };
  const onTouchMove = (e) => { updatePosition(e.touches[0].clientX); };

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  });

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden rounded-lg cursor-ew-resize aspect-video dark:bg-dark-surface-2 bg-gray-200"
      onMouseDown={onMouseDown}
      onTouchMove={onTouchMove}
    >
      {/* After (full) */}
      <img src={afterSrc} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover" />

      {/* Before (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <img src={beforeSrc} alt={beforeLabel} className="absolute inset-0 w-full h-full object-cover" style={{ width: `${100 / (position / 100)}%`, maxWidth: 'none' }} />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-0.5">
            <span className="w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-gray-800" />
            <span className="w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-gray-800" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute bottom-3 left-3 text-xs font-heading font-semibold tracking-widest uppercase bg-black/60 text-white px-2 py-1 rounded backdrop-blur">
        {beforeLabel}
      </span>
      <span className="absolute bottom-3 right-3 text-xs font-heading font-semibold tracking-widest uppercase bg-brand-red/90 text-white px-2 py-1 rounded backdrop-blur">
        {afterLabel}
      </span>
    </div>
  );
}
