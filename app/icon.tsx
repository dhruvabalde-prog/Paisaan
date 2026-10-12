import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

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
          backgroundColor: "#059669",
          borderRadius: "112px",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="320"
          height="320"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Banknote Border */}
          <rect x="2" y="5" width="20" height="14" rx="2.5" />
          {/* Center Circle */}
          <circle cx="12" cy="12" r="3" />
          {/* Security details */}
          <path d="M2 9C3.5 9 4.5 8 4.5 6.5" />
          <path d="M2 15C3.5 15 4.5 16 4.5 17.5" />
          <path d="M22 9C20.5 9 19.5 8 19.5 6.5" />
          <path d="M22 15C20.5 15 19.5 16 19.5 17.5" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
