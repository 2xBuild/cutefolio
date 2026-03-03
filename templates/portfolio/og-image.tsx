import type { PreparedOgProfile } from "@/lib/og/profile-template-visuals";
import { GEIST_PIXEL_FONT_NAME } from "@/lib/og/shared";
import { renderPortfolioOneOgImage } from "@/templates/portfolio/1/og-image";
import { renderPortfolioTwoOgImage } from "@/templates/portfolio/2/og-image";

function renderPortfolioFallbackOgImage(data: PreparedOgProfile) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: "#000000",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 9999,
            overflow: "hidden",
            border: "2px solid rgba(248, 250, 252, 0.4)",
            background: "rgba(15, 23, 42, 0.86)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {data.avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.avatarSrc}
              alt=""
              width={132}
              height={132}
              style={{ width: 132, height: 132, objectFit: "cover" }}
            />
          ) : null}
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 70,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            fontFamily: `${GEIST_PIXEL_FONT_NAME}, monospace`,
            textAlign: "center",
          }}
        >
          {data.displayName}
        </h1>
      </div>

      <div
        style={{
          position: "absolute",
          left: 28,
          bottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: 9999,
          overflow: "hidden",
        }}
      >
        {data.brandLogoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.brandLogoSrc}
            alt="kno.li logo"
            width={56}
            height={56}
            style={{ width: 56, height: 56, objectFit: "cover" }}
          />
        ) : (
          <span
            style={{
              color: "#f8fafc",
              fontSize: 28,
              fontFamily: `${GEIST_PIXEL_FONT_NAME}, monospace`,
            }}
          >
            k
          </span>
        )}
      </div>
    </div>
  );
}

export function renderPortfolioOgImage(data: PreparedOgProfile) {
  switch (data.templateId) {
    case "portfolio-2":
      return renderPortfolioTwoOgImage(data);
    case "portfolio-1":
      return renderPortfolioOneOgImage(data);
    default:
      return renderPortfolioFallbackOgImage(data);
  }
}
