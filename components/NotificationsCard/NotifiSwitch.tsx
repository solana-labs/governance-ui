import { FunctionComponent } from 'react'

interface SwitchProps {
  checked: boolean
  onChange: (x: boolean) => void
}

const Switch: FunctionComponent<SwitchProps> = ({
  checked = false,
  onChange,
}) => {
  const handleClick = () => {
    onChange(!checked)
  }

  return (
    <div className="mt-4 flex float-right mb-12">
      <label className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            onChange={handleClick}
            type="checkbox"
            checked={checked}
            className={'sr-only'}
          />
          <div
            className={`w-10 ${
              checked ? 'bg-primary-light' : 'bg-gray-400'
            } h-4 rounded-full shadow-inner`}
          ></div>
          <div
            className={`${checked ? 'translate-x-full' : 'translate-x-0'}
            absolute w-5 h-5 bg-white rounded-full shadow -mt-[18px] transition`}
          ></div>
        </div>
      </label>
    </div>
  )
}

export default Switch
