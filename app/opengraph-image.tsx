import { ImageResponse } from "next/og";
import { siteName, siteDescription } from "@/lib/site";

export const alt = `${siteName} - files stay on your device`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#E8F0EE",
          color: "#1B2423",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 64,
              height: 64,
              alignItems: "center",
              justifyContent: "center",
              background: "#2C6B63",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 28,
                height: 36,
                background: "#E8F0EE",
                borderRadius: 4,
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>{siteName}</div>
        </div>
        <div style={{ display: "flex", fontSize: 36, fontWeight: 600, maxWidth: 900 }}>
          Everyday tools, without the upload
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 24,
            color: "#5B6C69",
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          {siteDescription}
        </div>
      </div>
    ),
    { ...size }
  );
}
