import { DuplicateIcon } from '@heroicons/react/outline'

export default function CommandLineInfo({
  info,
}: {
  info: string | undefined
}) {
  return (
    <div className="flex flex-row text-xs items-center break-all">
      <span className="text-fgd-1">{info}</span>
      <DuplicateIcon
        className="flex-shrink-0 ml-4 w-4 h-4 cursor-pointer text-primary-light"
        onClick={() => {
          navigator.clipboard.writeText(info ?? '')
        }}
      />
    </div>
  )
}
