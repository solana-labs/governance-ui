import Button from '../../components/Button'
import { arweaveUpload } from './upload/arweave'
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js'
import useWalletStore from 'stores/useWalletStore'
import { sendTransaction } from '@utils/send'
import { ARWEAVE_PAYMENT_WALLET } from './upload/constants'
import * as anchor from '@project-serum/anchor'

const ArweaveIndex = () => {
	const wallet = useWalletStore((s) => s.current)
	const connection = useWalletStore((s) => s.connection)

	const upload = async () => {
		const transaction = new Transaction()

		const instructions = [
			anchor.web3.SystemProgram.transfer({
				fromPubkey: wallet!.publicKey!,
				toPubkey: ARWEAVE_PAYMENT_WALLET,
				lamports: 100,
			}),
		]
		transaction.add(...instructions)

		const tx = await sendTransaction({
			connection: connection.current,
			wallet,
			transaction,
			sendingMessage: 'Funding arweave',
			successMessage: 'Success Funding arweave',
		})
		console.log('******')
		console.log(tx)

		// [link, imageLink] = await arweaveUpload(
		// 	walletKeyPair,
		// 	anchorProgram,
		// 	env,
		// 	image,
		// 	manifestBuffer,
		// 	manifest,
		// 	asset.index,
		//   );
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-6 w-full">
				<h1 className="mb-0">AR WEAVE DEMO</h1>
				<Button onClick={upload} title={'CLICK ME'}>
					CLICK ME
				</Button>
			</div>
		</div>
	)
}

export default ArweaveIndex
