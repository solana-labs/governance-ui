import { Menu } from '@headlessui/react'
import { useMemo, useState, useEffect } from 'react'
import { CheckCircleIcon, ChevronDownIcon } from '@heroicons/react/solid'
import styled from '@emotion/styled'
import useWalletStore from '../stores/useWalletStore'
import { getWalletProviderByUrl, WALLET_PROVIDERS } from '../utils/wallet-adapters'
import { AddressImage, DisplayAddress, useAddressName, useWalletIdentity } from '@cardinal/namespaces-components'
import { BackspaceIcon } from '@heroicons/react/solid'
import { UserCircleIcon } from '@heroicons/react/outline'
import { abbreviateAddress } from '@utils/formatting'
import { useRouter } from 'next/router'
import TwitterIcon from './TwitterIcon'
import Switch from './Switch'
import { NavButton } from './Button'

const StyledWalletProviderLabel = styled.p`
	font-size: 0.65rem;
	line-height: 1.5;
`
export const ConnectWalletSimple = (props) => {
	const { connected, current, providerUrl, connection, set: setWalletStore } = useWalletStore((s) => s)

	const provider = useMemo(() => getWalletProviderByUrl(providerUrl), [providerUrl])

	const handleDisconnect = () => current?.disconnect()

	const handleConnect = () => {
		current?.connect()
	}

	const handleConnectDisconnect = async () => {
		try {
			if (connected) {
				await handleDisconnect()
			} else {
				await handleConnect()
			}
		} catch (e) {
			console.warn('handleConnectDisconnect', e)
		}
	}

	useEffect(() => {
		if (props.setConnected) props.setConnected(connected)
	}, [connected])

	const { show } = useWalletIdentity()

	const { displayName } = useAddressName(connection.current, current?.publicKey || undefined)

	const walletAddressFormatted = current?.publicKey ? abbreviateAddress(current?.publicKey) : ''

	return (
		<div>
			<div>
				<>
					{WALLET_PROVIDERS.map(({ name, url, icon }, index) => (
						<div key={name}>
							<NavButton
								selectionkey={index + 1}
								className={provider?.url === url ? 'nav-button:active' : ''}
								onClick={() =>
									setWalletStore((s) => {
										s.providerUrl = url
									})
								}
							>
								<span className="h-4 w-4 mr-2 image-on-brand flex items-center">
									<img src={icon} className="w-full block" />
								</span>
								<span className="flex items-center">{name}</span>

								{/* {provider?.url === url ? <CheckCircleIcon className="h-5 ml-2 text-green w-5" /> : null} */}
							</NavButton>
						</div>
					))}
				</>
			</div>

			<button disabled={connected} className={`${connected ? 'cursor-default' : 'hover:bg-bkg-3 focus:outline-none'}`} onClick={handleConnectDisconnect} {...props}>
				<span className="flex font-bold items-center text-fgd-1 text-left text-sm relative">
					{connected && current?.publicKey && (
						<span className="w-12 pr-2 flex items-center">
							<span className="flex items-center">
								<AddressImage
									dark={true}
									connection={connection.current}
									address={current?.publicKey}
									height="40px"
									width="40px"
									// placeholder={
									// 	<div className="bg-bkg-4 flex flex-shrink-0 items-center justify-center h-10  w-10 mr-2">
									// 		<UserCircleIcon className="h-9 text-fgd-3 w-9" />
									// 	</div>
									// }
								/>
							</span>
							{/* <span className="h-4 w-4 mr-2 image-on-brand flex items-center">
								<img src={provider?.icon} className="w-full block" />
							</span> */}
						</span>
					)}
				</span>
			</button>
			{connected && current?.publicKey ? (
				<div className="">
					<div className="flex flex-wrap items-center pb-4">SUCCESS!</div>
					<div className="flex flex-wrap items-center">{provider?.name} Wallet Connected</div>
					<div className="flex flex-wrap items-center">
						<span className="h-4 w-4 mr-2 image-on-brand flex items-center">
							<img src={provider?.icon} className="w-full block" />
						</span>
						{connected && current?.publicKey && (
							<>
								<DisplayAddress connection={connection.current} address={current?.publicKey} width="100px" height="20px" dark={true} />
								{walletAddressFormatted}
							</>
						)}
					</div>
					{/*
						<div className="py-4">
							<NavButton selectionkey={"ENTER"} onClick={ e  => {
								alert("Show me DAOs");
								e.preventDefault();
							}} target="_blank">
								Go to DOA
							</NavButton>
						</div>
						*/}
				</div>
			) : (
				<div className="pt-4 pb-16">
					<ul>
						<li>You selected &quot;{provider?.name}&quot; as your wallet...</li>
						<li className="flex flex-wrap items-center">
							<span className="flex flex-grow-1 flex items-center mr-4">Connect &quot;{provider?.name}&quot; Wallet:</span>
							<ul className="flex items-center flex-shink-0">
								<li className="flex align-center flex-shink-0 mr-4">
									<NavButton
										selectionkey="Y"
										onClick={(e) => {
											handleConnectDisconnect()
											e.preventDefault()
										}}
									>
										Yes
									</NavButton>
								</li>
								<li className="flex items-center flex-shink-0">
									<NavButton
										selectionkey="N"
										onClick={(e) => {
											handleDisconnect()
											e.preventDefault()
										}}
									>
										No
									</NavButton>
								</li>
							</ul>
						</li>
						{/*
							<li className="flex flex-wrap items-center">
								Connecting wallet...
							</li>
							*/}
					</ul>
				</div>
			)}
		</div>
	)
	//  */
}

export const ConnectWalletButtonAlternative = (props) => {
	const { connected, current, providerUrl, connection, set: setWalletStore } = useWalletStore((s) => s)

	const provider = useMemo(() => getWalletProviderByUrl(providerUrl), [providerUrl])

	const handleConnectDisconnect = async () => {
		try {
			if (connected) {
				await current?.disconnect()
			} else {
				await current?.connect()
			}
		} catch (e) {
			console.warn('handleConnectDisconnect', e)
		}
	}

	const { show } = useWalletIdentity()

	const { displayName } = useAddressName(connection.current, current?.publicKey || undefined)

	const walletAddressFormatted = current?.publicKey ? abbreviateAddress(current?.publicKey) : ''

	return (
		<div className="flex">
			<button disabled={connected} className={`bg-transparent border border-fgd-4 border-r-0 default-transition flex h-12 items-center pl-1 pr-2 ${connected ? 'cursor-default' : 'hover:bg-bkg-3 focus:outline-none'}`} onClick={handleConnectDisconnect} {...props}>
				<div className="flex font-bold items-center text-fgd-1 text-left text-sm relative">
					{connected && current?.publicKey ? (
						<div className="hidden">
							<div className="w-12 pr-2">
								<AddressImage
									dark={true}
									connection={connection.current}
									address={current?.publicKey}
									height="40px"
									width="40px"
									// placeholder={
									// 	<div className="bg-bkg-4 flex flex-shrink-0 items-center justify-center h-10  w-10 mr-2">
									// 		<UserCircleIcon className="h-9 text-fgd-3 w-9" />
									// 	</div>
									// }
								/>
							</div>
						</div>
					) : (
						<div className="pr-2 pl-2 image-on-brand">
							<img src={provider?.icon} className="h-5 w-5" />
						</div>
					)}
					<div>
						{connected && current?.publicKey ? (
							<div className="pl-2">
								<DisplayAddress connection={connection.current} address={current?.publicKey} width="100px" height="20px" dark={true} />
								<StyledWalletProviderLabel className="font-normal text-fgd-3">{walletAddressFormatted}</StyledWalletProviderLabel>
							</div>
						) : (
							<>
								Connect
								<StyledWalletProviderLabel className="font-normal text-fgd-3">{provider?.name}</StyledWalletProviderLabel>
							</>
						)}
					</div>
				</div>
			</button>

			<div className="relative ">
				<Menu>
					{({ open }) => (
						<>
							<Menu.Button className={`border border-fgd-4 cursor-pointer default-transition h-12 w-12 py-2 px-2 hover:bg-bkg-3 focus:outline-none`}>
								<ChevronDownIcon className={`${open ? 'transform rotate-180' : 'transform rotate-360'} default-transition h-5 m-auto ml-1 text-primary-light w-5`} />
							</Menu.Button>
							<Menu.Items className="absolute bg-bkg-1 border border-fgd-4 p-2 right-0 ztop-14 shadow-md outline-none w-48 z-20 ">
								<>
									{WALLET_PROVIDERS.map(({ name, url, icon }) => (
										<Menu.Item key={name}>
											<button
												className="flex default-transition h-9 items-center p-2 w-full hover:bg-bkg-3 hover:cursor-pointer hover:rounded font-normal focus:outline-none"
												onClick={() =>
													setWalletStore((s) => {
														s.providerUrl = url
													})
												}
											>
												<span className="image-on-brand h-4 w-4 mr-2">
													<img src={icon} className="w-full" />
												</span>

												<span className="text-sm">{name}</span>

												{provider?.url === url ? <CheckCircleIcon className="h-5 ml-2 text-green w-5" /> : null}
											</button>
										</Menu.Item>
									))}

									{current && current.publicKey && (
										<>
											<hr className={`border border-fgd-3 opacity-50 mt-2 mb-2`}></hr>
											<Menu.Item
												key={'twitter'}
												onClick={() =>
													show(
														// @ts-ignore
														current,
														connection.current,
														connection.cluster
													)
												}
											>
												<button className="flex default-transition h-9 items-center p-2 w-full hover:bg-bkg-3 hover:cursor-pointer hover:rounded font-normal focus:outline-none">
													<TwitterIcon className="h-4 w-4 mr-2" />
													<span className="text-sm">{displayName ? 'Edit Twitter' : 'Link Twitter'}</span>
												</button>
											</Menu.Item>
											<Menu.Item key={'disconnect'} onClick={handleConnectDisconnect}>
												<button className="flex default-transition h-9 items-center p-2 w-full hover:bg-bkg-3 hover:cursor-pointer hover:rounded font-normal focus:outline-none">
													<BackspaceIcon className="h-4 w-4 mr-2" />
													<span className="text-sm">Disconnect</span>
												</button>
											</Menu.Item>
										</>
									)}
								</>
							</Menu.Items>
						</>
					)}
				</Menu>
			</div>
		</div>
	)
}

const ConnectWalletButton = (props) => {
	const { connected, current, providerUrl, connection, set: setWalletStore } = useWalletStore((s) => s)

	const provider = useMemo(() => getWalletProviderByUrl(providerUrl), [providerUrl])

	const [useDevnet, setUseDevnet] = useState(true)
	const router = useRouter()
	const handleToggleDevnet = () => {
		// setUseDevnet(!useDevnet)
		// if (useDevnet) {
		// 	router.push(`${window.location.pathname}`)
		// } else {
		// 	router.push(`${window.location.href}?cluster=devnet`)
		// }
	}

	const handleConnectDisconnect = async () => {
		try {
			if (connected) {
				await current?.disconnect()
			} else {
				await current?.connect()
			}
		} catch (e) {
			console.warn('handleConnectDisconnect', e)
		}
	}

	const { show } = useWalletIdentity()

	const { displayName } = useAddressName(connection.current, current?.publicKey || undefined)

	const walletAddressFormatted = current?.publicKey ? abbreviateAddress(current?.publicKey) : ''

	return (
		<div className="flex">
			<button disabled={connected} className={`bg-transparent border border-fgd-4 border-r-0 default-transition flex h-12 items-center pl-1 pr-2 rounded-l-full rounded-r-none ${connected ? 'cursor-default' : 'hover:bg-bkg-3 focus:outline-none'}`} onClick={handleConnectDisconnect} {...props}>
				<div className="flex font-bold items-center text-fgd-1 text-left text-sm relative">
					{connected && current?.publicKey ? (
						<div className="w-12 pr-2">
							<AddressImage
								dark={true}
								connection={connection.current}
								address={current?.publicKey}
								height="40px"
								width="40px"
								placeholder={
									<div className="bg-bkg-4 flex flex-shrink-0 items-center justify-center h-10 rounded-full w-10 mr-2">
										<UserCircleIcon className="h-9 text-fgd-3 w-9" />
									</div>
								}
							/>
						</div>
					) : (
						<div className="pr-2 pl-2">
							<img src={provider?.icon} className="h-5 w-5" />
						</div>
					)}
					<div>
						{connected && current?.publicKey ? (
							<>
								<DisplayAddress connection={connection.current} address={current?.publicKey} width="100px" height="20px" dark={true} />
								<StyledWalletProviderLabel className="font-normal text-fgd-3">{walletAddressFormatted}</StyledWalletProviderLabel>
							</>
						) : (
							<>
								Connect
								<StyledWalletProviderLabel className="font-normal text-fgd-3">{provider?.name}</StyledWalletProviderLabel>
							</>
						)}
					</div>
				</div>
			</button>

			<div className="relative ">
				<Menu>
					{({ open }) => (
						<>
							<Menu.Button className={`border border-fgd-4 cursor-pointer default-transition h-12 w-12 py-2 px-2 rounded-r-full hover:bg-bkg-3 focus:outline-none`}>
								<ChevronDownIcon className={`${open ? 'transform rotate-180' : 'transform rotate-360'} default-transition h-5 m-auto ml-1 text-primary-light w-5`} />
							</Menu.Button>
							<Menu.Items className="absolute bg-bkg-1 border border-fgd-4 p-2 right-0 top-14 shadow-md outline-none rounded-md w-48 z-20">
								<>
									{WALLET_PROVIDERS.map(({ name, url, icon }) => (
										<Menu.Item key={name}>
											<button
												className="flex default-transition h-9 items-center p-2 w-full hover:bg-bkg-3 hover:cursor-pointer hover:rounded font-normal focus:outline-none"
												onClick={() =>
													setWalletStore((s) => {
														s.providerUrl = url
													})
												}
											>
												<img src={icon} className="h-4 w-4 mr-2" />
												<span className="text-sm">{name}</span>

												{provider?.url === url ? <CheckCircleIcon className="h-5 ml-2 text-green w-5" /> : null}
											</button>
										</Menu.Item>
									))}

									{current && current.publicKey && (
										<>
											<hr className={`border border-fgd-3 opacity-50 mt-2 mb-2`}></hr>
											<Menu.Item
												key={'twitter'}
												onClick={() =>
													show(
														// @ts-ignore
														current,
														connection.current,
														connection.cluster
													)
												}
											>
												<button className="flex default-transition h-9 items-center p-2 w-full hover:bg-bkg-3 hover:cursor-pointer hover:rounded font-normal focus:outline-none">
													<TwitterIcon className="h-4 w-4 mr-2" />
													<span className="text-sm">{displayName ? 'Edit Twitter' : 'Link Twitter'}</span>
												</button>
											</Menu.Item>
											<Menu.Item key={'disconnect'} onClick={handleConnectDisconnect}>
												<button className="flex default-transition h-9 items-center p-2 w-full hover:bg-bkg-3 hover:cursor-pointer hover:rounded font-normal focus:outline-none">
													<BackspaceIcon className="h-4 w-4 mr-2" />
													<span className="text-sm">Disconnect</span>
												</button>
											</Menu.Item>
											<Menu.Item
												key={'devnet'}
												onClick={() => {
													handleToggleDevnet()
												}}
											>
												<button className="flex default-transition h-9 items-center p-2 w-full hover:bg-bkg-3 hover:cursor-pointer hover:rounded font-normal focus:outline-none">
													<span className="text-sm">Devnet</span>
													<Switch
														checked={useDevnet}
														onChange={() => {
															handleToggleDevnet()
														}}
													/>
												</button>
											</Menu.Item>
										</>
									)}
								</>
							</Menu.Items>
						</>
					)}
				</Menu>
			</div>
		</div>
	)
}

export default ConnectWalletButton
