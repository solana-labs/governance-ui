import React, { useEffect, useLayoutEffect, useState } from 'react'
import RealmWizard from '@components/RealmWizard/RealmWizard'
import { isSolanaBrowser } from '@utils/browserInfo';
import { boolean } from 'superstruct';
import Loader from '@components/Loader';
import Sorry from '@components/Sorry';

const New: React.FC = () => {
	const isLoading = false

	const [solanaBrowser, setSolanaBrowser] = useState<boolean>(false);
	const [initialLoad, setInitialLoad] = useState<boolean>(true);

	useEffect(() => {
		setInitialLoad(false)
	}, [solanaBrowser])

	useLayoutEffect(() => {
		setSolanaBrowser(isSolanaBrowser());
	}, []);

	return initialLoad ? (
		<Loader />
	) : !solanaBrowser ? (
		<Sorry />
	) : (
		<div className={`w-full flex justify-center bg-bkg-2  ${isLoading ? 'pointer-events-none' : ''}`}>
			<RealmWizard />
		</div>
	)
}

export default New
