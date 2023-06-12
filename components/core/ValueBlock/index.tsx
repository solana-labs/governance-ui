import { ValueDescription } from '../ValueDescription'
import { ValueLabel } from '../ValueLabel'

interface Props {
  className?: string
  title: string
  description: React.ReactNode
  children: React.ReactNode
  descriptionStyle?: string
}

export function ValueBlock(props: Props) {
  return (
    <div className={props.className}>
      <ValueLabel className="mb-1" text={props.title} />
      <ValueDescription
        className="mb-4"
        text={props.description}
        style={props.descriptionStyle}
      />
      <div>{props.children}</div>
    </div>
  )
}
