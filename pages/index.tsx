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

	return (<>
		<a
			href="/realms"
			onClick={() => {
				router.push(fmtUrlWithCluster(`/realms`))
			}}
			className="flex w-full h-full-min items-center justify-center"
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
					<p>A protocol for financing real world assets on the Solana blockchain</p>
				</div>
				<div>&lt; ENTER &gt;</div>
			</div>
		</a>
		<div className='hidden'>
			<pre className='ascii text-center text-legal pt-16'>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;M&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;dM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MMr&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4MMML&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MMMMM.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;xf&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"MMMMM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.MM-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;Mh..&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+MMMMMM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.MMMM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;.MMM.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.MMMMML.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MMMMMh&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)MMMh.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MMMMMM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MMMMMMM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3MMMMx.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'MMMMMMf&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;xnMMMMMM"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'*MMMMM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MMMMMM.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;nMMMMMMP"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*MMMMMx&nbsp;&nbsp;&nbsp;&nbsp;"MMMMM\&nbsp;&nbsp;&nbsp;&nbsp;.MMMMMMM=&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*MMMMMh&nbsp;&nbsp;&nbsp;"MMMMM"&nbsp;&nbsp;&nbsp;JMMMMMMP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MMMMMM&nbsp;&nbsp;&nbsp;3MMMM.&nbsp;&nbsp;dMMMMMM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MMMMMM&nbsp;&nbsp;"MMMM&nbsp;&nbsp;.MMMMM(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.nnMP"<br />
&nbsp;&nbsp;=..&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*MMMMx&nbsp;&nbsp;MMM"&nbsp;&nbsp;dMMMM"&nbsp;&nbsp;&nbsp;&nbsp;.nnMMMMM*&nbsp;&nbsp;<br />
&nbsp;&nbsp;"MMn...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'MMMMr&nbsp;'MM&nbsp;&nbsp;&nbsp;MMM"&nbsp;&nbsp;&nbsp;.nMMMMMMM*"&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;"4MMMMnn..&nbsp;&nbsp;&nbsp;*MMM&nbsp;&nbsp;MM&nbsp;&nbsp;MMP"&nbsp;&nbsp;.dMMMMMMM""&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;^MMMMMMMMx.&nbsp;&nbsp;*ML&nbsp;"M&nbsp;.M*&nbsp;&nbsp;.MMMMMM**"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*PMMMMMMhn.&nbsp;*x&nbsp;>&nbsp;M&nbsp;&nbsp;.MMMM**""&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;""**MMMMhx/.h/&nbsp;.=*"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
&nbsp;&nbsp;&nbsp;.3P"%....<br />
&nbsp;&nbsp;&nbsp;nP"&nbsp;&nbsp;"*MMnx
			</pre>
		</div>
		</>
	)

	return null
}

export default Index
