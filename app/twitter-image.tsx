import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0a0a0b",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ fontSize: 22, color: "#fafafa", opacity: 0.9 }}>LEXOUTIL</div>

          <div style={{ fontSize: 58, fontWeight: 800, color: "#ffffff", lineHeight: 1.05 }}>
            Documents juridiques
            <br />
            en quelques minutes
          </div>

          <div style={{ fontSize: 24, color: "#d4d4d8", maxWidth: 980, lineHeight: 1.35 }}>
            Modèles + prévisualisation + export PDF. Pas de conseil juridique personnalisé.
          </div>
        </div>
      </div>
    ),
    size
  );
}
