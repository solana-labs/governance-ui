import { FunctionComponent, ReactNode } from 'react'
import { LinkButton } from './Button'
import Tooltip from './Tooltip'

interface EmptyStateProps {
  buttonText?: string
  disableButton?: boolean
  icon?: ReactNode
  onClickButton?: () => void
  desc?: string
  title?: string
  toolTipContent?: string
}

const EmptyState: FunctionComponent<EmptyStateProps> = ({
  buttonText,
  disableButton,
  icon,
  onClickButton,
  desc,
  title,
  toolTipContent,
}) => {
  return (
    <div className="border border-bkg-4 flex flex-col items-center rounded-lg p-4 text-fgd-1">
      {icon ? <div className="mb-1 h-6 w-6 text-fgd-3">{icon}</div> : null}
      {title ? <h2 className="mb-1 text-base">{title}</h2> : null}
      {desc ? (
        <p
          className={`text-center ${
            buttonText && onClickButton ? 'mb-1' : 'mb-0'
          }`}
        >
          {desc}
        </p>
      ) : null}
      {buttonText && onClickButton ? (
        <Tooltip content={toolTipContent}>
          <LinkButton
            className="text-primary-light"
            disabled={disableButton}
            onClick={onClickButton}
          >
            {buttonText}
          </LinkButton>
        </Tooltip>
      ) : null}
    </div>
  )
}

export default EmptyState
