"use client";

const EYE_PATH = "M2,34 C24,10 76,4 118,30 C84,62 30,66 2,34 Z";

function Eye({ side }) {
  const id = `g-${side}`;
  return (
    <div className={`eye-box ${side}`}>
      <div className="eye-tilt">
        {/* молнии: не сжимаются при моргании */}
        <svg viewBox="0 0 120 60" className="bolts-svg" overflow="visible">
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polyline
              className="bolt b1"
              points="2,34 -12,28 -6,38 -22,36 -16,48"
            />
            <polyline className="bolt b2" points="30,14 38,0 48,6 58,-8" />
            <polyline
              className="bolt b3"
              points="100,52 110,66 104,72 118,84"
            />
          </g>
        </svg>

        <div className="eye-blink">
          <svg viewBox="0 0 120 60" className="eye-svg" overflow="visible">
            <defs>
              <radialGradient id={id} cx="52%" cy="55%" r="58%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#eaf8ff" />
                <stop offset="80%" stopColor="#7cc8ff" />
                <stop offset="100%" stopColor="#2f7dff" />
              </radialGradient>
            </defs>
            <path d={EYE_PATH} fill={`url(#${id})`} className="eye-shape" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function EyesLoader({ leaving = false, quick = false }) {
  return (
    <div
      className={`eyes-screen ${quick ? "quick" : ""} ${leaving ? "leaving" : ""}`}
    >
      <div className="smoke s1" />
      <div className="smoke s2" />
      <div className="vignette" />

      <div className="eyes-row">
        <Eye side="left" />
        <Eye side="right" />
      </div>

      <style>{`
        .eyes-screen {
          --d: 1.4s;          /* темнота перед появлением */
          --tilt: 14deg;      /* наклон: больше = злее */
          position: fixed; inset: 0; z-index: 9999;
          background: #000;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          transition: opacity 1s ease;
        }
        .eyes-screen.quick { --d: 0.3s; }
        .eyes-screen.leaving { opacity: 0; }

        .smoke {
          position: absolute; border-radius: 50%;
          filter: blur(55px); opacity: 0;
          animation: smokeIn 2.2s ease-out var(--d) forwards,
                     drift 9s ease-in-out infinite alternate;
        }
        .s1 { width: 70vmin; height: 45vmin; background: rgba(25,90,255,0.30); }
        .s2 { width: 40vmin; height: 35vmin; left: 10%; top: 40%; background: rgba(10,50,170,0.30); }
        .vignette {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 20%, #000 78%);
        }

        .eyes-row {
          position: relative;
          display: flex; align-items: center; gap: clamp(10px, 3vmin, 30px);
        }
        .eye-box { width: clamp(100px, 28vmin, 190px); }
        .eye-box.right { transform: scaleX(-1); }

        /* наклон: внутренний конец вниз */
        .eye-tilt {
          position: relative;
          transform: rotate(var(--tilt));
        }
        .eye-svg, .bolts-svg { width: 100%; height: auto; display: block; }
        .bolts-svg { position: absolute; inset: 0; }

        /* моргание по собственной оси глаза */
        .eye-blink {
          opacity: 0;
          transform: scaleY(0);
          transform-origin: 50% 50%;
          animation: eyeOpen 3.6s cubic-bezier(.4,0,.2,1) var(--d) forwards;
        }
        .quick .eye-blink { animation-duration: 1.8s; }

        .eye-shape {
          filter:
            drop-shadow(0 0 5px rgba(170,225,255,1))
            drop-shadow(0 0 16px rgba(50,130,255,0.95))
            drop-shadow(0 0 40px rgba(20,80,255,0.8));
        }

        .bolt {
          stroke: #9fdcff; stroke-width: 1.6; opacity: 0;
          filter: drop-shadow(0 0 3px #3b9dff) drop-shadow(0 0 8px #1f6bff);
          animation: flicker 1.4s steps(1) infinite;
          animation-delay: calc(var(--d) + 1.2s);
        }
        .b2 { animation-duration: 1.1s; animation-delay: calc(var(--d) + 1.5s); }
        .b3 { animation-duration: 1.7s; animation-delay: calc(var(--d) + 1.8s); }

        @keyframes smokeIn { to { opacity: 1; } }
        @keyframes drift {
          from { transform: translate(-3%, 2%) scale(1); }
          to   { transform: translate(3%, -2%) scale(1.12); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 0; }
          8%  { opacity: 1; }
          14% { opacity: 0; }
          20% { opacity: .9; }
          26% { opacity: 0; }
          70% { opacity: 0; }
          74% { opacity: 1; }
          80% { opacity: 0; }
        }
        /* тьма -> щель -> открылись -> моргнули -> моргнули -> открыты */
        @keyframes eyeOpen {
          0%   { transform: scaleY(0);    opacity: 0; }
          8%   { transform: scaleY(0.06); opacity: 1; }
          30%  { transform: scaleY(1); }
          49%  { transform: scaleY(1); }
          52%  { transform: scaleY(0.04); }
          57%  { transform: scaleY(1); }
          76%  { transform: scaleY(1); }
          79%  { transform: scaleY(0.04); }
          84%  { transform: scaleY(1); }
          100% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
