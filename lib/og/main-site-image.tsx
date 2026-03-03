import { ImageResponse } from "next/og";
import {
  GEIST_PIXEL_FONT_NAME,
  OG_IMAGE_SIZE,
  loadGeistPixelFont,
  readPublicImageAsDataUrl,
} from "@/lib/og/shared";

const BRAND_NAME = "kno.li";
const TAGLINE = "Let the world know you better";

export async function buildMainSiteOgImage(): Promise<Response> {
  const [fonts, logoSrc] = await Promise.all([
    loadGeistPixelFont(),
    readPublicImageAsDataUrl("/flat_logo.png"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: 52,
          paddingRight: 52,
          background: "#000000",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
            }}
          >
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 9999,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoSrc}
                  alt="kno.li logo"
                  width={140}
                  height={140}
                  style={{
                    width: 140,
                    height: 140,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: 70,
                    color: "#ffffff",
                    fontFamily: `${GEIST_PIXEL_FONT_NAME}, monospace`,
                  }}
                >
                  k
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 122,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: "#ffffff",
                fontFamily: `${GEIST_PIXEL_FONT_NAME}, monospace`,
              }}
            >
              {BRAND_NAME}
            </div>
          </div>
          <div
            style={{
              marginTop: 7,
              marginLeft: 38,
              fontSize: 34,
              lineHeight: 1.3,
              color: "#ffffff",
              fontFamily: "Inter, Arial, Helvetica, sans-serif",
              textAlign: "left",
            }}
          >
            {TAGLINE}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      fonts,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
