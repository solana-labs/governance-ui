import Text from '@components/Text'
interface Props {
  advancedOption?: boolean
  children: React.ReactNode
  className?: string
  description: string | React.ReactNode
  disabled?: boolean
  optional?: boolean
  title: string
  titleExtra?: React.ReactNode
}

export default function FormField({
  title,
  description,
  optional = false,
  advancedOption = false,
  disabled = false,
  className = '',
  titleExtra,
  children,
}: Props) {
  const splitTitle = title.split(' ')
  return (
    <div className={className}>
      <div className="flex items-center gap-x-2">
        <Text
          level="1"
          className={disabled ? 'opacity-30 cursor-not-allowed' : ''}
        >
          <span>
            {splitTitle
              .slice(
                0,
                splitTitle.length - (optional || advancedOption ? 1 : 0)
              )
              .join(' ')}
          </span>
          {(optional || advancedOption) && (
            <Text level="1" as="span" className="whitespace-nowrap">
              {` ${splitTitle[splitTitle.length - 1]} `}
              {optional && (
                <Text level="2" as="span" className="ml-1 opacity-50">
                  (optional)
                </Text>
              )}
              {advancedOption && (
                <Text
                  level="2"
                  as="span"
                  className="px-2 ml-2 rounded bg-night-grey text-white/50"
                >
                  Advanced Option
                </Text>
              )}
            </Text>
          )}
        </Text>
        {titleExtra}
      </div>

      <Text
        level="2"
        className={`pt-1 ${
          disabled ? 'opacity-10 cursor-not-allowed' : 'text-fgd-2'
        }`}
      >
        {description}
      </Text>
      <div className="mt-4">{children}</div>
    </div>
  )
}
