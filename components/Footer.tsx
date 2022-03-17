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
		<div className="border-t py-6 border-green overflow-hidden">
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
			<div className="container mx-auto text-xs my-6">
				<p className="text-legal text-justify">The Current Owner, Tokr DAO, and any Tokr affiliates or contributors to the open source software and systems involved in the Tokr Protocol and the minting of this rNFT hereby disclaim any representation or warranty relating to the sufficiency or adequacy of the title to the real estate owned by the entity specified in the rNFT metadata, and, by purchasing this rNFT, you hereby acknowledge that you are not relying on any such representations or warranties. Linked in the metadata is a copy of the Owner's Title Insurance Policy that was obtained at the time of acquisition (or subsequently as amended in the metadata, if applicable). The metadata and documentation submitted as part of rNFT certification and verification process is intended to make data collection easier to assist you in conducting your own due diligence. It is strongly encouraged that you conduct your own research and additional due diligence as it relates to the sufficiency and adequacy of the title to such real estate prior to acquiring this rNFT, which may include obtaining a title insurance policy. Any validations or certifications made by the Current Owner or Tokr DAO and any affiliates or contributors relating to the rNFT do not relate to the title of such real estate.</p>
			</div>
		</div>
	)
}

export default Footer
