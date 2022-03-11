declare global {
	interface Window {
		solana: any
	}
}

const checkProvider = (returnProvider?: any) => {
	if ('solana' in window) {
		const provider = window?.solana
		if (returnProvider && provider) {
			return provider
		} else {
			return provider === undefined ? false : true
		}
	} else {
		return false
	}
}

const phantomBrowser = () => {
	if (checkProvider()) {
		if (checkProvider(true) !== undefined && checkProvider(true).isPhantom) {
			return checkProvider(true).isPhantom
		}
	} else {
		return false
	}
}

export const getProvider = () => <any>checkProvider(true)
export const isPhantomBrowser = () => <boolean>phantomBrowser()
export const isSolanaBrowser = () => <boolean>checkProvider()
export const web3 = () => <boolean>isSolanaBrowser()
