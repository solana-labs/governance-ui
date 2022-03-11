import useQueryContext from '@hooks/useQueryContext'
import Link from 'next/link'
import { ConnectWalletButtonAlternative } from './ConnectWalletButton'
import { useRouter } from 'next/router'

const NavBar = props => {
	const router = useRouter()
	const { fmtUrlWithCluster } = useQueryContext()

	return (
		<>
		{ !props.web3 && <>
			<a href="https://phantom.app/download" target="_blank" className="bg-green text-dark block w-full text-center py-2 px-16">
				<span className="text-black">tokr_ Realms</span> requires a Web3 crypto wallet
			</a>
		</> }
		<div className="grid grid-cols-12 mb-3 border border-fgd-1">
			<div className="col-span-12 xl:col-start-2 xl:col-span-10 flex h-20 items-center justify-between px-4 md:px-8 xl:px-4">
				<a href="/realms" onClick={e => {
					router.push(fmtUrlWithCluster(`/realms`))
					e.preventDefault();
				}}>
					<span className="cursor-pointer flex items-center">
						<h1 className="text-lg">tokr_</h1>
					</span>
				</a>
				<ul className="flex ite ms-center space-x-4">
					{/*
					 <li className="flex items-center">
						<Link href="#">
							<span className="nav-link uppercase flex items-center">
								<span>Tokens</span>
							</span>
						</Link>
					</li>
					*/}
					{ props.web3 === true && <li className="flex items-center">
						<a href="/realms/new" onClick={e => {
							router.push(fmtUrlWithCluster(`/realms/new`))
							e.preventDefault();
						}}>
							<span className="nav-link flex items-center">
								<span>Create DAO</span>
							</span>
						</a>
					</li> }
					<li className="flex items-center">
						<a href="/realms" onClick={e => {
							router.push(fmtUrlWithCluster(`/realms`))
							e.preventDefault();
						}}>
							<span className="nav-link flex items-center">
								<span>DAOs</span>
							</span>
						</a>
					</li>
					<li className="flex items-center">
						<a href="/" onClick={e => {
							router.push(fmtUrlWithCluster(`/`))
							e.preventDefault();
						}}>
							<span className="nav-link uppercase flex items-center">
								<span>Docs</span>
							</span>
						</a>
					</li>
					{ props.web3 === true && <li className="pl-4 flex items-center">
						<ConnectWalletButtonAlternative />
					</li> }
				</ul>
			</div>
		</div>
		</>
	)
}

export default NavBar
