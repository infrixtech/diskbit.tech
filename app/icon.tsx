import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Square forest mark with a simple page, so the tab never reuses another site's icon. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2C6B63",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 14,
            height: 18,
            background: "#E8F0EE",
            borderRadius: 2,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
