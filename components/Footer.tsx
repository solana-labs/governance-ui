import useQueryContext from '@hooks/useQueryContext'
import router, { useRouter } from 'next/router'
import DiscordIcon from './DiscordIcon'
import GithubIcon from './GithubIcon'
import TwitterIcon from './TwitterIcon'

const Footer = () => {
  const { REALM } = process.env;
  const router = useRouter();
  const { fmtUrlWithCluster } = useQueryContext();

//   if (REALM) return null
//   else
    return (
		<div className="border-t py-6 border-green">
			<div className="-my-2 -mx-6">
				<ul className="flex justify-center flex-wrap">
					<li className="py-2 px-6 flex-shrink-0">
						<a href="/realms" onClick={() => router.push(fmtUrlWithCluster(`/realms`))}>
							<span className="whitespace-nowrap">[ Browse DAOs ]</span>
						</a>
					</li>
					<li className="py-2 px-6 flex-shrink-0">
						<a href="/realms" target="_blank">
							<span className="whitespace-nowrap">[ Read docs ]</span>
						</a>
					</li>
					<li className="py-2 px-6 flex-shrink-0">
						<a href="/realms" target="_blank">
							<span className="whitespace-nowrap">[ White paper ]</span>
						</a>
					</li>
					<li className="py-2 px-6 flex-shrink-0">
						<a href="https://twitter.com/tokrfi" target="_blank">
							<span className="whitespace-nowrap">[ Twitter ]</span>
						</a>
					</li>
				</ul>
			</div>
		</div>
	)
}

export default Footer
