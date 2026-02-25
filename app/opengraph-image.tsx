import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          background: "white"
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 800, color: "#111827" }}>LEXOUTIL</div>
        <div style={{ marginTop: 18, fontSize: 28, color: "#374151" }}>
          Assistance juridique & génération de documents
        </div>
        <div style={{ marginTop: 28, fontSize: 18, color: "#6B7280" }}>
          Modèles, guides et documents prêts à copier.
        </div>
      </div>
    ),
    size
  );
}
