import React, { useEffect, useRef, useState } from 'react';
import { CVRenderer } from '../templates/CVRenderer';
import type { MasterProfile, CVDesignConfig } from '../types/cv';

interface ScaledCVThumbnailProps {
  profile: MasterProfile;
  config: CVDesignConfig;
  className?: string;
}

export const ScaledCVThumbnail: React.FC<ScaledCVThumbnailProps> = ({ profile, config, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width || 0;
      setContainerWidth(width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const scale = containerWidth > 0 ? Math.min(1, containerWidth / 794) : 0;
  const height = 1123 * scale;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden bg-white ${className}`}
      style={{ width: '100%', height: height || 'auto', minHeight: containerWidth ? undefined : 260 }}
    >
      {containerWidth > 0 && (
        <div
          style={{
            width: 794,
            height: 1123,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <CVRenderer profile={profile} config={config} />
        </div>
      )}
    </div>
  );
};
