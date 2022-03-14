import DiscussionForm from './DiscussionForm'
import Comment from './Comment'
import useWalletStore from '../../stores/useWalletStore'
import { useLayoutEffect, useState } from 'react'

const DiscussionPanel = props => {
	const { chatMessages, voteRecordsByVoter, proposalMint } = useWalletStore((s) => s.selectedProposal)
	const [canCreateAction, setCanCreateAction] = useState(props.canCreateAction || false)

	useLayoutEffect(() => {
		if (props.canCreateAction) setCanCreateAction(props.canCreateAction);
	}, [props.canCreateAction]);

	return ((Object.keys(chatMessages).length === 0 && !props.solanaBrowser) || (!canCreateAction && Object.keys(chatMessages).length === 0)) ? (
		<></>
	) : (
		<div className="border border-fgd-4 p-4 md:p-6">
			<h2 className="mb-4">
				Discussion <span className="text-base text-fgd-3">({Object.keys(chatMessages).length})</span>
			</h2>
			<div className="pb-4">
				<DiscussionForm canCreateAction={canCreateAction} solanaBrowser={props.solanaBrowser} />
			</div>
			{Object.values(chatMessages)
				.sort((m1, m2) => m2.account.postedAt.toNumber() - m1.account.postedAt.toNumber())
				.map((cm) => (
					<Comment chatMessage={cm.account} voteRecord={voteRecordsByVoter[cm.account.author.toBase58()]?.account} key={cm.pubkey.toBase58()} proposalMint={proposalMint} />
				))}
		</div>
	)
}

export default DiscussionPanel
