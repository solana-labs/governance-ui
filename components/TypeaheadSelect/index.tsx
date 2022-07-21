import { Combobox } from '@headlessui/react'
import { useState } from 'react'
import classNames from 'classnames'
import { ChevronDownIcon } from '@heroicons/react/solid'

interface Option {
  key: string
  text: string
}

interface Props<O extends Option> {
  className?: string
  placeholder?: string
  options: O[]
  selected?: Pick<O, 'key'>
  onSelect(option?: O): void
}

export default function TypeaheadSelect<O extends Option>(props: Props<O>) {
  const [query, setQuery] = useState('')
  const value = props.options.find(
    (option) => option.key === props.selected?.key
  )
  const list = props.options.filter((option) => {
    if (!query) {
      return true
    }

    return option.text.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  })

  return (
    <Combobox
      value={value}
      onChange={(value) => {
        props.onSelect(value)
        setQuery('')
      }}
    >
      {({ open }) => {
        const isOpen = !!(open && list.length)

        return (
          <Combobox.Button
            as="div"
            className={classNames('relative', props.className)}
          >
            <Combobox.Input
              className={classNames(
                'bg-bkg-1',
                'border-fgd-3',
                'border',
                'default-transition',
                'h-auto',
                'pl-3',
                'py-2',
                'pr-10',
                'rounded-md',
                'text-fgd-1',
                'text-sm',
                'w-full',
                'disabled:cursor-not-allowed',
                'disabled:opacity-50',
                'disabled:text-fgd-3',
                'disabled:border-bkg-4',
                'disabled:focus:border-bkg-4',
                'disabled:hover:border-bkg-4',
                'focus:border-primary-light',
                'focus:outline-none',
                'hover:border-primary-light'
              )}
              displayValue={(option: O) => option?.text || ''}
              placeholder={props.placeholder}
              onChange={(e) => setQuery(e.currentTarget.value)}
              onFocus={(e) => e.currentTarget.select()}
            />
            <ChevronDownIcon
              className={classNames(
                '-translate-y-1/2',
                'absolute',
                'default-transition',
                'flex-shrink-0',
                'h-5',
                'mr-1',
                'right-3',
                'text-primary-light',
                'top-1/2',
                'w-5',
                isOpen ? 'transform rotate-180' : 'transform rotate-360'
              )}
            />
            {isOpen && (
              <Combobox.Options
                static
                className={classNames(
                  'absolute',
                  'bg-bkg-1',
                  'mt-1',
                  'py-2',
                  'rounded-md',
                  'w-full',
                  'z-10'
                )}
              >
                <div
                  className={classNames('h-full', 'max-h-60', 'overflow-auto')}
                >
                  {list.map((option) => (
                    <Combobox.Option key={option.key} value={option}>
                      {({ selected, active }) => (
                        <div
                          className={classNames(
                            'border-l-2',
                            'border-transparent',
                            'cursor-pointer',
                            'px-3',
                            'py-2',
                            active && 'bg-bkg-3',
                            selected && 'border-light-theme-primary-light'
                          )}
                        >
                          {option.text}
                        </div>
                      )}
                    </Combobox.Option>
                  ))}
                </div>
              </Combobox.Options>
            )}
          </Combobox.Button>
        )
      }}
    </Combobox>
  )
}
