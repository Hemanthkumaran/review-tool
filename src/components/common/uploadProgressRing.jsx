export default function UploadProgressRing({ percent }) {
  const radius = 42;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <svg width="100" height="100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#1E1E1E"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#F9EF38"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fill="#EDEDED"
          fontSize="16"
          fontWeight="500"
        >
          {percent}%
        </text>
      </svg>

      <div className="text-sm text-gray-200">Uploading</div>
      <div className="text-xs text-gray-400">
        ETA: ~15 mins
      </div>
    </div>
  );
}
