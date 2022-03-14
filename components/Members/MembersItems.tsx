import MemberItem from './MemberItem'
import { List, AutoSizer } from 'react-virtualized'
import { Member } from '@utils/uiTypes/members'

const MembersItems = ({ activeMembers }: { activeMembers: Member[] }) => {
  const minRowHeight = 84
  const listHeight =
    activeMembers.length > 4
      ? 350
      : activeMembers.reduce((acc, member) => {
          const hasBothVotes =
            !member?.communityVotes.isZero() && !member?.councilVotes.isZero()

          return acc + (hasBothVotes ? 100 : minRowHeight)
        }, 0)
  const getRowHeight = ({ index }) => {
    const currentMember = activeMembers[index]
    const hasBothVotes =
      !currentMember?.communityVotes.isZero() &&
      !currentMember?.councilVotes.isZero()
    return hasBothVotes ? 100 : minRowHeight
  }
  function rowRenderer({ key, index, style }) {
		return (
			<div key={key} style={style}>
				<MemberItem item={activeMembers[index]}></MemberItem>
			</div>
		)
  }
  return (
    <div className="space-y-3">
      <AutoSizer disableHeight>
        {({ width }) => (
          <List
            width={width}
            height={listHeight}
            rowCount={activeMembers.length}
            rowHeight={getRowHeight}
            rowRenderer={rowRenderer}
          />
        )}
      </AutoSizer>
    </div>
  )
}
export default MembersItems
