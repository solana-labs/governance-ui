import MemberItem from './MemberItem'
import useMembers from './useMembers'
import { List, AutoSizer } from 'react-virtualized'
import useRealm from '@hooks/useRealm'
import { fmtMintAmount } from '@tools/sdk/units'

const MembersItems = () => {
  const { members } = useMembers()
  const { councilMint } = useRealm()
  //if member is council type but he don't have tokens kept in realm we filter him out to not show him inside component
  //but his previous votes are used for statistic.
  const membersFiltred = members.filter((x) =>
    x.council
      ? Number(
          fmtMintAmount(councilMint, x.council.info.governingTokenDepositAmount)
        ) > 0
      : true
  )
  //TODO implement auto height if needed;
  const minRowHeight = 84
  const rowHeight =
    membersFiltred.length > 4 ? 350 : membersFiltred.length * minRowHeight
  function rowRenderer({ key, index, style }) {
    return (
      <div key={key} style={style}>
        <MemberItem item={membersFiltred[index]}></MemberItem>
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
            rowCount={membersFiltred.length}
            rowHeight={minRowHeight}
            rowRenderer={rowRenderer}
          />
        )}
      </AutoSizer>
    </div>
  )
}
export default MembersItems
