import { DuplicateIcon } from '@heroicons/react/outline'

export function CommandLineInfo({ info }: { info: string | undefined }) {
  return (
    <div className="flex flex-row text-xs items-center break-all mb-3">
      <span className="text-fgd-3">{info}</span>
      <DuplicateIcon
        className="ml-4 text-th-fgd-1 w-5 h-5 hover:cursor-pointer text-primary-light"
        onClick={() => {
          navigator.clipboard.writeText(info ?? '')
        }}
      ></DuplicateIcon>
    </div>
  )
}
