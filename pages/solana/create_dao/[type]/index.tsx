import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Navbar from 'components_2/NavBar'

import GovTokenWizard from './components/GovToken/Wizard'
import NFTWizard from './components/NFT/Wizard'
import MultiSigWizard from './components/MultiSig/Wizard'

export default function DAOCreationForm() {
  const { query, replace } = useRouter()

  useEffect(() => {
    if (
      typeof document !== 'undefined' &&
      document.body?.className !== 'bg-[#282933]'
    ) {
      document.body.className = 'bg-[#282933]'
    }
  })

  useEffect(() => {
    if (
      query?.type !== 'gov-token' &&
      query?.type !== 'nft' &&
      query?.type !== 'multisig'
    ) {
      replace('/404', undefined, { shallow: true })
    }
  }, [query])

  return (
    <div className="relative pb-8 md:pb-20 landing-page">
      <Navbar showWalletButton />
      <div className="absolute w-[100vw] h-[100vh]">
        <Image
          alt="background image"
          src="/1-Landing-v2/creation-bg-desktop.png"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>

      {query?.type === 'gov-token' && <GovTokenWizard />}
      {query?.type === 'nft' && <NFTWizard />}
      {query?.type === 'multisig' && <MultiSigWizard />}
    </div>
  )
}
