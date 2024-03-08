import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useEffect, useState } from 'react'
interface Props {
  className?: string
  selectedPass: string
  onPassSelected: (string) => void
}
import cx from '@hub/lib/cx'
import { availablePasses } from 'GatewayPlugin/config'
import { ChevronDownIcon } from '@heroicons/react/solid'

const itemStyles = cx(
  'border',
  'cursor-pointer',
  'gap-x-4',
  'grid-cols-[150px,1fr,20px]',
  'grid',
  'h-14',
  'items-center',
  'px-4',
  'w-full',
  'rounded-md',
  'text-left',
  'transition-colors',
  'dark:bg-neutral-800',
  'dark:border-neutral-700',
  'dark:hover:bg-neutral-700'
)

const labelStyles = cx('font-700', 'dark:text-neutral-50', 'w-full')
const iconStyles = cx('fill-neutral-500', 'h-5', 'transition-transform', 'w-4')
const descriptionStyles = cx('dark:text-neutral-400 text-sm')

export default function CivicPassSelector({
  className,
  onPassSelected,
}: Props) {
  const [open, setOpen] = useState(false)
  const [selectedPassState, setSelectedPass] = useState(availablePasses[0])

  useEffect(() => {
    onPassSelected(selectedPassState.value)
  }, [onPassSelected, selectedPassState.value])

  return (
    <div>
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <div>
          <DropdownMenu.Trigger
            className={cx(
              itemStyles,
              className,
              open && 'border dark:border-white/40'
            )}
          >
            <div className={labelStyles}>
              {selectedPassState?.name || 'Select a Civic Pass'}
            </div>
            <div className={descriptionStyles}>
              {selectedPassState?.description || ''}
            </div>
            <ChevronDownIcon
              className={cx(iconStyles, open && '-rotate-180')}
            />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="dark space-y-0.5 z-20 w-5/6 mx-auto lg:max-w-[920px]"
              sideOffset={2}
            >
              {availablePasses.slice(0, -1).map((config, i) => (
                <DropdownMenu.Item
                  className={cx(
                    itemStyles,
                    'w-full',
                    'focus:outline-none',
                    'dark:focus:bg-neutral-700'
                  )}
                  key={i}
                  onClick={() => {
                    setSelectedPass(config)
                  }}
                >
                  <div className={labelStyles}>{config.name}</div>
                  <div className={descriptionStyles}>{config.description}</div>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </div>
      </DropdownMenu.Root>
      {!selectedPassState.isSybilResistance && (
        <div className="body-sm mt-2">
          <span className="text-[#5DC9EB]">Warning:</span> This pass type does
          not provide sybil resistance.
        </div>
      )}
    </div>
  )
}
