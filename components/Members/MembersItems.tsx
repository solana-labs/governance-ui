import MemberItem from './MemberItem'
import { List, AutoSizer } from 'react-virtualized'
import { Member } from '@utils/uiTypes/members'
import { rem } from '@utils/funStuff'

const MembersItems = ({ activeMembers }: { activeMembers: Member[] }) => {
	const minRowHeight = 61
	const listHeight =
		activeMembers.length > 4
			? 350
			: activeMembers.reduce((acc, member) => {
					const hasBothVotes = !member?.communityVotes.isZero() && !member?.councilVotes.isZero()

					return acc + (hasBothVotes ? 100 : minRowHeight)
			  }, 0)
	const getRowHeight = ({ index }) => {
		const currentMember = activeMembers[index]
		const hasBothVotes = !currentMember?.communityVotes.isZero() && !currentMember?.councilVotes.isZero()
		return hasBothVotes ? 100 : minRowHeight
	}

	const getRowHeight2 = ({ index }) => {
		return  minRowHeight
	}

	const reStyle = (style) => {
		const tempHeight = style.height;
		style.height = rem(tempHeight);
		const tempTop = style.top;
		style.top = rem(tempTop)

		return style;
	}
	function rowRenderer({ key, index, style }) {
		return (
			<div key={key} style={reStyle(style)}>
				<MemberItem item={activeMembers[index]}></MemberItem>
			</div>
		)
	}
	return ( <div className="space-y-3">
			{ activeMembers.map((member, index) => {
				return <div key={`member_${index}`} >
				<MemberItem item={activeMembers[index]}></MemberItem>
			</div>
			} ) }
	</div> )

}
export default MembersItems
