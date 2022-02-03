import Select from '@components/inputs/Select'
import { NameVal } from '../types/types'

const SelectFilter = ({
  onChange,
  value,
  options,
  placeholder,
}: {
  onChange: (selected: NameVal) => void
  value: string
  options: NameVal[]
  placeholder: string
}) => {
  return (
    <Select
      mintWidth="150px"
      wrapperClassNames="mt-1"
      onChange={onChange}
      placeholder={placeholder}
      value={value}
    >
      {options.map((x) => {
        return (
          <Select.Option key={x.val} value={x}>
            {x.name}
          </Select.Option>
        )
      })}
    </Select>
  )
}

export default SelectFilter
