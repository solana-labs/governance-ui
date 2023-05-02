import React, { useMemo } from 'react'
import DiscussionForm from './DiscussionForm'
import Comment from './Comment'
import useWalletStore from '../../stores/useWalletStore'
import { VariableSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

const DiscussionPanel: React.FC<any> = () => {
  const { chatMessages, voteRecordsByVoter, proposalMint } = useWalletStore(
    (s) => s.selectedProposal
  )

  const sortedMessages = useMemo(
    () =>
      Object.values(chatMessages).sort(
        (m1, m2) =>
          m2.account.postedAt.toNumber() - m1.account.postedAt.toNumber()
      ),
    [chatMessages]
  )

  const Row = ({ index, style }) => {
    const cm = sortedMessages[index]
    return (
      <div style={{ ...style }} className="border-b border-fgd-4">
        <Comment
          chatMessage={cm.account}
          voteRecord={voteRecordsByVoter[cm.account.author.toBase58()]?.account}
          proposalMint={proposalMint}
        />
      </div>
    )
  }

  const getItemSize = (index) => {
    const cm = sortedMessages[index]
    const startingHeight = 100
    const charsPerLine = 77
    const lines = Math.ceil(cm.account.body.value.length / charsPerLine)

    return startingHeight + lines * 22
  }

  return (
    <div className="border border-fgd-4 p-4 md:p-6 rounded-lg">
      <h2 className="mb-4">
        Discussion{' '}
        <span className="text-base text-fgd-3">
          ({Object.keys(chatMessages).length})
        </span>
      </h2>
      <div className="pb-4">
        <DiscussionForm />
      </div>

      <div
        style={{
          height: sortedMessages.length / 0.5,
          minHeight: 500,
        }}
      >
        <AutoSizer>
          {({ height, width }) => (
            <List
              className="comments"
              height={height}
              itemCount={sortedMessages.length}
              itemSize={getItemSize}
              width={width}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  )
}

export default DiscussionPanel
