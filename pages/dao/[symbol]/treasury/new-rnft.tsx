import Loader from '@components/Loader';
import useQueryContext from '@hooks/useQueryContext';
import useRealm from '@hooks/useRealm';
import router, { useRouter } from 'next/router';
import { useEffect, useLayoutEffect, useState } from 'react';
import New from './new'

const NewRnft = (props) => {
	const router = useRouter();
	const { fmtUrlWithCluster } = useQueryContext();
	const { realmDisplayName, realm } = useRealm();
	const [initialLoad, setInitialLoad] = useState<boolean>(true);
	const [intake, setIntake] = useState<boolean>(false);

	useLayoutEffect(() => {
		if (realmDisplayName && realm?.pubkey) setInitialLoad(false)
	}, [realmDisplayName, realm]);

	useLayoutEffect(() => {
		if (router.query?.initial) {
			setIntake(true)
		}
	}, [router])

	return initialLoad ? <Loader /> : <>
	<New rnft={true} realmName={ realmDisplayName }>
			<div className="py-16">
				<p>
					{intake ? <>
						Now that you succesfully created <a className="hover:underline" href={`/dao/${realm?.pubkey.toBase58()}`} onClick={e => {
							router.push(fmtUrlWithCluster(`/dao/${realm?.pubkey.toBase58()}`))
							e.preventDefault();
						}}>{realmDisplayName ? realmDisplayName : 'your' }</a>{` `} DAO.{` `} <br />
					</> : ''}
					You will have to create {realmDisplayName ? realmDisplayName + ' ' : `your DAO's ` } rNFT Treasury Account. This Treasury Account will be used to store all certified {props.realmName ? props.realmName + ' ' : ' '} properties that you submit via Tokr.
				</p>
			</div>
		</New>
	</>
}

export default NewRnft
