import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface BrandOutroProps {
  brandName: string;
  tagline?: string;
  /** Optional logo URL (file:// or http) shown above the brand name. */
  logoSrc?: string;
}

const LIME = "#C8F135";
const BG = "#0a0a0a";

export const BrandOutro: React.FC<BrandOutroProps> = ({
  brandName,
  tagline,
  logoSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });

  const nameSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  const nameScale = interpolate(nameSpring, [0, 1], [0.6, 1]);

  const taglineProgress = spring({
    frame: frame - 12,
    fps,
    config: { damping: 18, stiffness: 100 },
  });
  const taglineY = interpolate(taglineProgress, [0, 1], [30, 0]);
  const taglineOpacity = interpolate(frame, [12, 28], [0, 1], {
    extrapolateRight: "clamp",
  });

  const ctaPulse = interpolate(Math.sin(frame * 0.18), [-1, 1], [1, 1.04]);

  // Logo enters with name spring
  const logoOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(nameSpring, [0, 1], [0.7, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: fadeIn }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 60%, rgba(200,241,53,0.15) 0%, transparent 65%)",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 32,
        }}
      >
        {logoSrc && (
          <div
            style={{
              opacity: logoOpacity,
              transform: `scale(${logoScale})`,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              filter: "drop-shadow(0 0 40px rgba(200,241,53,0.3))",
            }}
          >
            <Img
              src={logoSrc}
              style={{
                width: 220,
                height: 220,
                objectFit: "contain",
              }}
            />
          </div>
        )}

        <div
          style={{
            transform: `scale(${nameScale})`,
            fontFamily: "Impact, 'Bebas Neue', sans-serif",
            fontSize: 200,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: 14,
            lineHeight: 1,
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
          }}
        >
          {brandName.split("").map((char, i) => (
            <span
              key={i}
              style={{
                color: char === "3" ? LIME : "#fff",
                textShadow:
                  char === "3" ? "0 0 40px rgba(200,241,53,0.6)" : "none",
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {tagline && (
          <div
            style={{
              opacity: taglineOpacity,
              transform: `translateY(${taglineY}px) scale(${ctaPulse})`,
              fontFamily: "system-ui, sans-serif",
              fontSize: 44,
              color: LIME,
              letterSpacing: 6,
              textTransform: "uppercase",
              fontWeight: 600,
              padding: "16px 48px",
              border: `2px solid ${LIME}`,
              borderRadius: 999,
            }}
          >
            {tagline}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
