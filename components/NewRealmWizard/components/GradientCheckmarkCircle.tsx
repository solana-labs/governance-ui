export default function ({ selected = false }) {
  return (
    <div
      className={`h-[32px] w-[32px] rounded-full flex items-center justify-center text-black ${
        selected
          ? 'bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF]'
          : 'border border-white/30'
      } group-hover:border-white/50 hover:border-white/50  group-disabled:opacity-30 group-disabled:group-hover:border-white/30 group-disabled:hover:border-white/30`}
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
