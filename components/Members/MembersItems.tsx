import MemberItem from './MemberItem'
import { List, AutoSizer } from 'react-virtualized'

const MembersItems = ({ activeMembers }) => {
  //TODO implement auto height if needed;
  const minRowHeight = 84
  const rowHeight =
    activeMembers.length > 4 ? 350 : activeMembers.length * minRowHeight
  function rowRenderer({ key, index, style }) {
    return (
      <div key={key} style={style}>
        <MemberItem item={activeMembers[index]}></MemberItem>
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
            rowCount={activeMembers.length}
            rowHeight={minRowHeight}
            rowRenderer={rowRenderer}
          />
        )}
      </AutoSizer>
    </div>
  )
}
export default MembersItems
