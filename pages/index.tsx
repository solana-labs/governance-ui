import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useWalletStore from 'stores/useWalletStore'
import { NavButton } from '@components/Button'
import { ConnectWalletSimple } from '@components/ConnectWalletButton'
import useQueryContext from '@hooks/useQueryContext'

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
	const [connected, setConnected] = useState(false)

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

	return (
		<div>
			<div className="flex flex-col justify-center items-center min-h-screen">
				<div className="pt-8 w-full flex flex-col items-center pb-8">
					<div>************************************</div>
					<div className="pt-4">Tokr_</div>
					<div className="py-2">Tokenize Real Estate v0.1.0 Beta</div>
					<div className="pb-4">Open Source Software</div>
					<div>************************************</div>
				</div>
				<div className="py-8 w-full px-16">
					<div className="py-2">Choose one of the following options:</div>
					<ul className="">
						<NavOption
							selectionkey={1}
							onClick={(e) => {
								// alert("Connect my wallet :)");
								setConnectingWallet(connectingWallet === false ? true : false)
								e.preventDefault()
							}}
						>
							Connect your wallet
						</NavOption>

						{connectingWallet ? (
							<>
								<li className="pt-4">Connect your wallet, make a selection below:</li>
								<li>
									<ConnectWalletSimple setConnected={setConnected} />
								</li>
								{connected && (
									<>
										<li className="pt-8">
											<NavButton selectionkey="ENTER" href={fmtUrlWithCluster('/realms')}>
												Browse DOAs
											</NavButton>
										</li>
										<li className="pb-4">
											<NavButton
												selectionkey={`&nbsp;&nbsp;N&nbsp;&nbsp;`}
												onClick={ handleCreateRealmButtonClick }
											>
												Create DOA
											</NavButton>
										</li>
									</>
								)}
								<li>
									------------------------------------
									<br />
									<NavOption
										selectionkey="ESC"
										onClick={(e) => {
											setConnectingWallet(false)
											e.preventDefault()
										}}
									>
										To Cancel
									</NavOption>
								</li>
							</>
						) : (
							<>
								<NavOption selectionkey={2} href={fmtUrlWithCluster('/realms')}>
									Browse DAOs
								</NavOption>
								<NavOption selectionkey={3} href="https://github.com" target="_blank">
									Read docs
								</NavOption>
								<NavOption selectionkey={4} href="https://rhove.com" target="_blank">
									Download white paper
								</NavOption>
								<NavOption selectionkey={5} href="https://discord.com" target="_blank">
									Join discord
								</NavOption>
							</>
						)}
					</ul>
				</div>
			</div>
		</div>
	)

	return null
}

export default Index

// import { useEffect } from 'react'
// import { useRouter } from 'next/router'
// const Index = () => {
// 	const router = useRouter()

// 	useEffect(() => {
// 		const { REALM } = process.env
// 		const mainUrl = REALM ? `/dao/${REALM}` : '/realms'
// 		router.replace(mainUrl)
// 	}, [])

// 	return null
// }

// export default Index
