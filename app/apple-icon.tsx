import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 72,
            height: 92,
            background: "#E8F0EE",
            borderRadius: 8,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
