import MemberItem from './MemberItem'
import useMembers from './useMembers'
import { List, AutoSizer } from 'react-virtualized'

const MembersItems = () => {
  const { members } = useMembers()
  //TODO implement auto height if needed;
  const minRowHeight = 84
  const rowHeight = members.length > 4 ? 350 : members.length * minRowHeight
  function rowRenderer({
    key, // Unique key within array of rows
    index, // Index of row within collection
    style, // Style object to be applied to row (to position it)
  }) {
    return (
      <div key={key} style={style}>
        <MemberItem item={members[index]}></MemberItem>
      </div>
    )
  }
  //TODO implement CellMeasurer for now every row has to be same height
  return (
    <div className="space-y-3">
      <AutoSizer disableHeight>
        {({ width }) => (
          <List
            width={width}
            height={rowHeight}
            rowCount={members.length}
            rowHeight={minRowHeight}
            rowRenderer={rowRenderer}
          />
        )}
      </AutoSizer>
    </div>
  )
}
export default MembersItems
