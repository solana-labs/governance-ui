export default function ({ selected = false }) {
    return (
      <div
        className={`h-[16px] w-[16px] rounded-full flex items-center justify-center text-fgd-1 ${
          selected
            ? 'bg-fgd-1'
            : 'border border-fgd-4'
        } group-hover:border-fgd-3 hover:border-fgd-3  group-disabled:text-fgd-4 group-disabled:group-hover:border-fgd-4 group-disabled:hover:border-fgd-4`}
      >
      </div>
    )
  }
  