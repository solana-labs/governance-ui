import Select from '@components/inputs/Select'

type Props = {
  list: string[] | number[]
}

const SelectOptionList = ({ list }: Props) => {
  if (!list?.length) return null
  return (
    <>
      {list.map((elt) => (
        <Select.Option key={elt} value={elt}>
          {elt}
        </Select.Option>
      ))}
    </>
  )
}

export default SelectOptionList
