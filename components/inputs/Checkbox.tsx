import React from 'react'
import { CheckIcon } from '@heroicons/react/solid'

const Checkbox = ({ checked, label = '', disabled = false, ...props }) => (
  <label className="default-transition flex cursor-pointer items-center text-fgd-3 hover:text-fgd-2">
    <input
      checked={checked}
      {...props}
      disabled={disabled}
      type="checkbox"
      style={{
        border: '0',
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: '1px',
        margin: '-1px',
        overflow: 'hidden',
        padding: '0',
        position: 'absolute',
        whiteSpace: 'nowrap',
        width: '1px',
      }}
    />
    <div
      className={`${
        checked && !disabled ? 'border-primary-light' : 'border-fgd-2'
      } default-transition flex h-4 w-4 cursor-pointer items-center justify-center rounded border`}
    >
      <CheckIcon
        className={`${checked ? 'block' : 'hidden'} h-4 w-4 ${
          disabled ? 'text-fgd-3' : 'text-primary'
        }`}
      />
    </div>
    <span
      className={`ml-2 text-xs ${checked && !disabled ? 'text-fgd-2' : ''}`}
    >
      {label}
    </span>
  </label>
)

export default Checkbox
