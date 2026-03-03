export type TemplateFamily = "linkfolio" | "portfolio";

export interface PreparedOgProfile {
  templateId: string;
  family: TemplateFamily;
  displayName: string;
  headline: string;
  description: string;
  accent: string;
  avatarSrc: string | null;
  bannerSrc: string | null;
  brandLogoSrc: string | null;
  username: string;
  linkLabels: string[];
  techLabels: string[];
  stats: Array<{ label: string; value: string }>;
}

export function Avatar({
  src,
  size,
  borderColor,
  background,
}: {
  src: string | null;
  size: number;
  borderColor: string;
  background: string;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `2px solid ${borderColor}`,
        background,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          style={{ width: size, height: size, objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            fontSize: Math.floor(size * 0.4),
            fontWeight: 700,
          }}
        >
          ?
        </div>
      )}
    </div>
  );
}
