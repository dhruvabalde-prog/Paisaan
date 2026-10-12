export function PaisaanLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-600/25 border border-emerald-500/40 p-1.5 shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Crisp Banknote Outer Frame */}
        <rect
          x="2"
          y="5"
          width="20"
          height="14"
          rx="2.5"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
        {/* Center Currency Circle */}
        <circle
          cx="12"
          cy="12"
          r="3"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
        {/* Left Side Security Notch */}
        <path
          d="M2 9C3.5 9 4.5 8 4.5 6.5"
          stroke="white"
          strokeWidth="1.5"
        />
        <path
          d="M2 15C3.5 15 4.5 16 4.5 17.5"
          stroke="white"
          strokeWidth="1.5"
        />
        {/* Right Side Security Notch */}
        <path
          d="M22 9C20.5 9 19.5 8 19.5 6.5"
          stroke="white"
          strokeWidth="1.5"
        />
        <path
          d="M22 15C20.5 15 19.5 16 19.5 17.5"
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
