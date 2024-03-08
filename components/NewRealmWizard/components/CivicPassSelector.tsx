import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useState } from 'react'
interface Props {
  className?: string
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
  'pl-4',
  'rounded-md',
  'text-left',
  'transition-colors',
  'dark:bg-neutral-800',
  'dark:border-neutral-700',
  'dark:hover:bg-neutral-700'
)

const labelStyles = cx('font-700', 'dark:text-neutral-50', 'w-full')
const iconStyles = cx('fill-neutral-500', 'h-5', 'transition-transform', 'w-4')

export default function CivicPassSelector({ className }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedPass, setSelectedPass] = useState(availablePasses[0])
  return (
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
            {selectedPass?.name || 'Select a Civic Pass'}
          </div>
          <ChevronDownIcon className={cx(iconStyles, open && '-rotate-180')} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="dark space-y-0.5 z-20"
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
                  // setSelectedPass(config)
                  // onPassTypeChange(
                  //   config?.value ? new PublicKey(config.value) : undefined
                  // )
                }}
              >
                <div className={labelStyles}>{config.name}</div>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </div>
    </DropdownMenu.Root>
  )
}
