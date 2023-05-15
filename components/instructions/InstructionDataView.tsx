import { InstructionDescriptor } from './tools'

export default function InstructionDataView({
  descriptor,
}: {
  descriptor: InstructionDescriptor | undefined
}) {
  return (
    <div>
      <span className="break-all font-display text-fgd-1 text-xs">
        {descriptor?.dataUI}
      </span>
    </div>
  )
}
