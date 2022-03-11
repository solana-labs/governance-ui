import useQueryContext from '@hooks/useQueryContext'
import { SecondaryButton, ButtonLink } from './Button'
import { useRouter } from 'next/router'

const Sorry = (props) => {
	const { fmtUrlWithCluster } = useQueryContext()
	const router = useRouter()

	return (
		<>
			<div className="w-full flex items-center justify-center min-h-screen flex-col space-y-8">
				<p>Uh oh! Looks like your browser is not a Web3 capable browser or you do not have a Web3 crypto wallet</p>

				<div className="flex space-x-4">
					<SecondaryButton
						onClick={() => {
							router.push(fmtUrlWithCluster(`/realms`))
						}}
					>
						Browse DAOs
					</SecondaryButton>
					<ButtonLink href="https://phantom.app/download" target="_blank">Learn More</ButtonLink>
				</div>
			</div>
		</>
	)
}

export default Sorry
