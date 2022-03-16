import useQueryContext from '@hooks/useQueryContext';
import router, { useRouter } from 'next/router';
import New from './new'

const NewRnft = (props) => {
	const router = useRouter();
	const { fmtUrlWithCluster } = useQueryContext();

	return (
		<New rnft={true} realmName={ props.realmName }>
			<div className="py-16">
				<p>
					{props.intake ? <>
						Now that you succesfully created <a href={`/dao/${props.realmId}`} onClick={e => {
							router.push(fmtUrlWithCluster(`/dao/${props.realmId}`))
							e.preventDefault();
						}}>{props.realmName ? props.realmName + ' ' : 'your ' }</a> DAO.`
					</> : ''}
					You will have to create {props.realmName ? props.realmName + ' ' : `your DAO's ` } rNFT Treasury Account. This Treasury Account will be used to store all certified {props.realmName ? props.realmName + ' ' : ' '} properties that you submit via Tokr.
				</p>
			</div>
		</New>
	)
}

export default NewRnft
