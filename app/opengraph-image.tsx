import { ImageResponse } from "next/og";

export const alt = "Abdellah Kachani — Creative Developer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          backgroundColor: "#0e0e0c",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#5b8fff",
            }}
          >
            Portfolio — 2026
          </div>
          <div
            style={{
              display: "flex",
              width: 12,
              height: 12,
              borderRadius: 9999,
              backgroundColor: "#5b8fff",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: -2,
              color: "#e8e6e1",
            }}
          >
            Abdellah Kachani
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "rgba(232, 230, 225, 0.6)",
            }}
          >
            Creative Developer — designing & building intelligent digital products
          </div>
        </div>

        <div
          style={{
            display: "flex",
            height: 4,
            width: 160,
            backgroundColor: "#5b8fff",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
