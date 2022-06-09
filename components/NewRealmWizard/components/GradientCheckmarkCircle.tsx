export default function ({ selected = false, hover = false }) {
  return (
    <div
      className={`h-[32px] w-[32px] rounded-full flex items-center justify-center text-black ${
        selected
          ? 'bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF]'
          : 'border'
      } ${hover ? 'border-white/50' : 'border-white/30'}`}
    >
      {selected && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M15 3 6 13 1 7" stroke="#000" strokeWidth="2" />
        </svg>
      )}
    </div>
  )
}
