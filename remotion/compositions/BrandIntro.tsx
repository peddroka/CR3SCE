import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface BrandIntroProps {
  brandName: string;
  tagline?: string;
  /** Optional file:// or http URL to a custom logo image (replaces the CR3SCE styled text). */
  logoSrc?: string;
}

const LIME = "#C8F135";
const BG = "#0a0a0a";

export const BrandIntro: React.FC<BrandIntroProps> = ({
  brandName,
  tagline,
  logoSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Logo entry: spring scale + fade
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.3, 1]);
  const logoOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Brand name slides in after logo
  const nameProgress = spring({
    frame: frame - 18,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const nameY = interpolate(nameProgress, [0, 1], [40, 0]);
  const nameOpacity = interpolate(frame, [18, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Tagline fades in
  const taglineOpacity = interpolate(frame, [38, 50], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Final exit
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const exitScale = interpolate(exitProgress, [0, 1], [1, 1.15]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Background pulse
  const bgPulse = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.06, 0.12],
  );

  const useCustomLogo = !!logoSrc;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: exitOpacity }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(200,241,53,${bgPulse}) 0%, transparent 60%)`,
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.015) 4px, rgba(255,255,255,0.015) 5px)",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${exitScale})`,
        }}
      >
        {/* Logo (custom or default "3") */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            marginBottom: 40,
            filter: "drop-shadow(0 0 60px rgba(200,241,53,0.4))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {useCustomLogo ? (
            <Img
              src={logoSrc!}
              style={{
                width: 320,
                height: 320,
                objectFit: "contain",
              }}
            />
          ) : (
            <svg width="280" height="280" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e4f050" />
                  <stop offset="100%" stopColor="#b8f050" />
                </linearGradient>
              </defs>
              <text
                x="50"
                y="78"
                textAnchor="middle"
                fontFamily="Impact, sans-serif"
                fontSize="100"
                fontWeight="900"
                fill="url(#g1)"
              >
                3
              </text>
            </svg>
          )}
        </div>

        {/* Brand name */}
        <div
          style={{
            opacity: nameOpacity,
            transform: `translateY(${nameY}px)`,
            fontFamily: "Impact, 'Bebas Neue', sans-serif",
            fontSize: 160,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: 12,
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          {brandName}
        </div>

        {tagline && (
          <div
            style={{
              opacity: taglineOpacity,
              marginTop: 24,
              fontFamily: "system-ui, sans-serif",
              fontSize: 36,
              color: LIME,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {tagline}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
