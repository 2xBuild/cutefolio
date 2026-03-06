import { ImageResponse } from "next/og";
import {
  GEIST_PIXEL_FONT_NAME,
  OG_IMAGE_SIZE,
  loadGeistPixelFont,
  readPublicImageAsDataUrl,
} from "@/lib/og/shared";
import { APP_LOGO_PATH } from "@/lib/constants";

const BRAND_NAME = "cutefol.io";
const TAGLINE = "folios that actually look cute";

export async function buildMainSiteOgImage(): Promise<Response> {
  const [fonts, logoSrc] = await Promise.all([
    loadGeistPixelFont(),
    readPublicImageAsDataUrl(APP_LOGO_PATH),
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
          background: "#000000",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
            }}
          >
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc}
                alt="cutefolio logo"
                width={120}
                height={120}
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "contain",
                }}
              />
            ) : null}
            <div
              style={{
                fontSize: 72,
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
              marginTop: 0,
              marginLeft: 34, 
              fontSize: 32,
              lineHeight: 1.3,
              color: "#ffffff",
              fontFamily: "Inter, Arial, Helvetica, sans-serif",
              textAlign: "center",
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
