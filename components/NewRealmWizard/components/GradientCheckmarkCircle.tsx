export default function ({ selected = false }) {
  return (
    <div
      className={`h-[32px] w-[32px] rounded-full flex items-center justify-center text-fgd-1 ${
        selected
          ? 'bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF]'
          : 'border border-fgd-4'
      } group-hover:border-fgd-3 hover:border-fgd-3  group-disabled:text-fgd-4 group-disabled:group-hover:border-fgd-4 group-disabled:hover:border-fgd-4`}
    >
      {selected && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M15 3 6 13 1 7" stroke="currentColor" strokeWidth="2" />
        </svg>
      )}
    </div>
  )
}
