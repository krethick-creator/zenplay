import React from 'react';

const ROOM_WIDTH = 700;
const ROOM_HEIGHT = 450;

type RoomType = 'living_room' | 'study_room' | 'bedroom';

interface RoomBackgroundProps {
  room: RoomType;
  className?: string;
}

/** Graphical room illustration as SVG background. Shop items are placed on top. */
const RoomBackground: React.FC<RoomBackgroundProps> = ({ room, className = '' }) => {
  const viewBox = `0 0 ${ROOM_WIDTH} ${ROOM_HEIGHT}`;

  if (room === 'living_room') {
    return (
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
        className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
        aria-hidden
      >
        {/* Floor */}
        <rect x="0" y="280" width="700" height="170" fill="hsl(30, 25%, 75%)" />
        {/* Floor boards */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={i * 95} y="280" width="90" height="170" fill="none" stroke="hsl(30, 20%, 65%)" strokeWidth="1" opacity="0.5" />
        ))}
        {/* Back wall */}
        <rect x="0" y="0" width="700" height="280" fill="hsl(35, 30%, 88%)" />
        {/* Window */}
        <rect x="250" y="40" width="200" height="140" rx="4" fill="hsl(200, 50%, 92%)" stroke="hsl(35, 25%, 70%)" strokeWidth="8" />
        <line x1="350" y1="40" x2="350" y2="180" stroke="hsl(35, 25%, 70%)" strokeWidth="4" />
        <line x1="250" y1="110" x2="450" y2="110" stroke="hsl(35, 25%, 70%)" strokeWidth="4" />
        {/* Base sofa outline (placeholder - user adds real sofa from shop) */}
        <rect x="80" y="300" width="160" height="80" rx="12" fill="hsl(25, 35%, 82%)" stroke="hsl(30, 30%, 70%)" strokeWidth="2" opacity="0.6" />
        {/* Carpet */}
        <ellipse cx="350" cy="380" rx="180" ry="45" fill="hsl(15, 40%, 72%)" opacity="0.7" />
      </svg>
    );
  }

  if (room === 'study_room') {
    return (
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
        className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
        aria-hidden
      >
        {/* Floor */}
        <rect x="0" y="260" width="700" height="190" fill="hsl(200, 20%, 78%)" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={i * 105} y="260" width="100" height="190" fill="none" stroke="hsl(200, 15%, 68%)" strokeWidth="1" opacity="0.4" />
        ))}
        {/* Back wall */}
        <rect x="0" y="0" width="700" height="260" fill="hsl(205, 25%, 90%)" />
        {/* Window */}
        <rect x="260" y="30" width="180" height="120" rx="4" fill="hsl(200, 55%, 94%)" stroke="hsl(205, 25%, 72%)" strokeWidth="6" />
        <line x1="350" y1="30" x2="350" y2="150" stroke="hsl(205, 25%, 72%)" strokeWidth="3" />
        {/* Bookshelf outline */}
        <rect x="480" y="80" width="120" height="170" rx="4" fill="hsl(25, 40%, 75%)" stroke="hsl(25, 35%, 65%)" strokeWidth="2" opacity="0.7" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="480" y1={80 + i * 34} x2="600" y2={80 + i * 34} stroke="hsl(25, 35%, 65%)" strokeWidth="1" />
        ))}
        {/* Desk outline */}
        <rect x="80" y="280" width="220" height="100" rx="6" fill="hsl(25, 35%, 78%)" stroke="hsl(25, 30%, 68%)" strokeWidth="2" opacity="0.6" />
        <rect x="100" y="320" width="180" height="60" fill="hsl(25, 30%, 72%)" rx="2" />
      </svg>
    );
  }

  if (room === 'bedroom') {
    return (
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
        className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
        aria-hidden
      >
        {/* Floor */}
        <rect x="0" y="270" width="700" height="180" fill="hsl(270, 20%, 80%)" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={i * 102} y="270" width="98" height="180" fill="none" stroke="hsl(270, 18%, 70%)" strokeWidth="1" opacity="0.4" />
        ))}
        {/* Back wall */}
        <rect x="0" y="0" width="700" height="270" fill="hsl(275, 28%, 92%)" />
        {/* Window */}
        <rect x="270" y="35" width="160" height="110" rx="4" fill="hsl(220, 45%, 94%)" stroke="hsl(275, 20%, 75%)" strokeWidth="6" />
        <line x1="350" y1="35" x2="350" y2="145" stroke="hsl(275, 20%, 75%)" strokeWidth="3" />
        {/* Bed base outline */}
        <rect x="100" y="290" width="280" height="130" rx="12" fill="hsl(260, 25%, 82%)" stroke="hsl(260, 22%, 72%)" strokeWidth="2" opacity="0.7" />
        <rect x="120" y="310" width="240" height="95" rx="8" fill="hsl(280, 30%, 88%)" />
        {/* Nightstand outlines */}
        <rect x="400" y="310" width="70" height="70" rx="6" fill="hsl(25, 35%, 78%)" stroke="hsl(25, 30%, 68%)" strokeWidth="2" opacity="0.6" />
        <rect x="530" y="310" width="70" height="70" rx="6" fill="hsl(25, 35%, 78%)" stroke="hsl(25, 30%, 68%)" strokeWidth="2" opacity="0.6" />
      </svg>
    );
  }

  return null;
};

export default RoomBackground;
