import { useEffect, useLayoutEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useWalletStore from 'stores/useWalletStore'
import { NavButton } from '@components/Button'
import { ConnectWalletSimple } from '@components/ConnectWalletButton'
import useQueryContext from '@hooks/useQueryContext'
import { notify } from '@utils/notifications'

const NavOption = (props) => {
	return (
		<>
			<li>
				<NavButton selectionkey={props.selectionkey} onClick={props.onClick} href={props.href} target={props.target} title={props.title}>
					{props.children}
				</NavButton>
			</li>
		</>
	)
}

const Index = () => {
	const router = useRouter()
	const { fmtUrlWithCluster } = useQueryContext()

	useEffect(() => {
		const { REALM } = process.env
		// const mainUrl = REALM ? `/dao/${REALM}` : '/realms'
		const mainUrl = REALM ? `/dao/${REALM}` : '/'
		router.replace(mainUrl)
	}, [])

	const { actions, selectedRealm, connection } = useWalletStore((s) => s)

	const [connectingWallet, setConnectingWallet] = useState(false)
	const [successfulConnect, setSuccessfulConnect] = useState(false)
	const { connected, current: wallet } = useWalletStore((s) => s)

	const handleCreateRealmButtonClick = async () => {
		if (!connected) {
			try {
				if (wallet) await wallet.connect()
			} catch (error) {
				const err = error as Error
				return notify({
					type: 'error',
					message: err.message,
				})
			}
		}
		router.push(fmtUrlWithCluster(`/realms/new`))
	}

	useLayoutEffect(() => {
		document?.querySelector("html")?.classList.add('u-fs-4')
	},[])

	return (
		<a
			href="/realms"
			onClick={() => {
				router.push(fmtUrlWithCluster(`/realms`))
			}}
			className="flex w-full h-full items-center justify-center"
		>
			<div className="flex flex-col justify-center items-center min-h-screen">
				<div className="pt-8 w-full flex flex-col items-center pb-8">
					<div>************************************</div>
					<div className="pt-4">Tokr_</div>
					<div className="py-2">Tokenize Real Estate v0.1.0 Beta</div>
					<div className="pb-4">Open Source Software</div>
					<div>************************************</div>
				</div>
				<div className="pb-8">
					<p>
						A protocol for financing real world assets on the Solana blockchain
					</p>
				</div>
				<div>
					&lt; ENTER &gt;
				</div>
			</div>
		</a>
	)

	return null
}

export default Index
