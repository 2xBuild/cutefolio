import { GEIST_PIXEL_FONT_NAME } from "@/lib/og/shared";
import { Avatar } from "@/lib/og/profile-template-visuals";
import type { PreparedOgProfile } from "@/lib/og/profile-template-visuals";

export function renderPortfolioTwoOgImage(data: PreparedOgProfile) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        background: "#000000",
        color: "#f8fafc",
        fontFamily: `${GEIST_PIXEL_FONT_NAME}, monospace`,
        paddingLeft: 64,
        paddingRight: 64,
        paddingTop: 56,
        paddingBottom: 56,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 940,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 14,
          border: "1px solid rgba(248, 250, 252, 0.2)",
          borderRadius: 20,
          padding: "28px 32px 34px",
          background: "rgba(255, 255, 255, 0.03)",
        }}
      >
        {data.bannerSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.bannerSrc}
            alt="banner"
            width={760}
            height={120}
            style={{
              width: 760,
              height: 120,
              borderRadius: 12,
              objectFit: "cover",
              opacity: 0.92,
            }}
          />
        ) : null}
        <Avatar
          src={data.avatarSrc}
          size={96}
          borderColor="rgba(248, 250, 252, 0.5)"
          background="rgba(15, 23, 42, 0.8)"
        />
        <h1 style={{ margin: 0, fontSize: 56, lineHeight: 1 }}>{data.displayName}</h1>
        <p style={{ margin: 0, fontSize: 26, lineHeight: 1.25, color: "#e2e8f0" }}>
          {data.headline}
        </p>
        <p style={{ margin: 0, fontSize: 20, color: "#94a3b8" }}>
          Projects: {data.stats[0]?.value ?? "0"} | Experience: {data.stats[1]?.value ?? "0"} |
          Blogs: {data.stats[2]?.value ?? "0"}
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          left: 28,
          bottom: 22,
          display: "flex",
          alignItems: "center",
          gap: 8,
          opacity: 0.9,
        }}
      >
        {data.brandLogoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.brandLogoSrc} alt="kno.li logo" width={18} height={18} />
        ) : null}
        <span style={{ fontSize: 18, color: "#cbd5e1" }}>kno.li</span>
      </div>
    </div>
  );
}
