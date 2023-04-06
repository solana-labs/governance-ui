import ListItem from './ListItem'

interface Props {
  className?: string
  onSelect?(): void
  name: string
  selected?: boolean
  thumbnail: JSX.Element
}
export default function TokenOwnerRecordListItem(props: Props) {
  return (
    <ListItem
      className={props.className}
      name={props.name}
      rhs={<></>}
      selected={props.selected}
      onSelect={props.onSelect}
      thumbnail={props.thumbnail}
    />
  )
}
