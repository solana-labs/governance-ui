import React from 'react'
import Link from 'next/link'
import useQueryContext from '@hooks/useQueryContext'

import Header from '@components/Header'
import Text from '@components/Text'
import { NewButton } from '@components/Button'

const New: React.FC = () => {
  const { fmtUrlWithCluster } = useQueryContext()
  const DAO_TYPES = [
    {
      url: '/realms/new/multisig',
      name: 'Multi-Signature Wallet',
      description:
        'A "multisig" is a shared wallet, typically with two or more members authorizing transactions.',
    },
    {
      url: '/realms/new/nft',
      name: 'NFT Community DAO',
      description:
        'NFT Community DAOs leverage NFTs as membership, giving NFT holders voting power to make decisions.',
    },
    {
      url: '/realms/new/tokenized',
      name: 'Tokenized DAO',
      description:
        'DAO members receive a governance token to denote their membership and allow them to vote on proposals.',
    },
  ]
  return (
    <>
      <Header as="h1" className="text-center">
        What type of DAO would you like to create?
      </Header>
      <div className="px-4 pt-5 pb-4 mt-8 rounded bg-bkg-grey lg:mt-16">
        <div className="grid grid-cols-1 gap-4 text-center lg:grid-cols-3 ">
          {DAO_TYPES.map(({ url, name, description }) => (
            <Link key={name} href={fmtUrlWithCluster(url)}>
              <a className="flex flex-col items-start px-5 py-3 border rounded cursor-pointer default-transition hover:bg-bkg-3">
                <Header as="h2" className="mb-6">
                  {name}
                </Header>
                <Text level="2" className="text-left">
                  {description}
                </Text>
              </a>
            </Link>
          ))}
        </div>
        <div className="flex items-center justify-center px-4 mt-10 space-x-8">
          <Link href={fmtUrlWithCluster('/realms')}>
            <a>
              <NewButton secondary>Back</NewButton>
            </a>
          </Link>
          <a
            href="https://governance-docs.vercel.app/DAO-Management/createing-DAOs/DAO-wizard"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="rounded px-3 py-1.5 hover:text-primary-dark default-transition cursor-pointer ">
              <span className="text-sm font-semibold">Tutorial Docs</span>
            </div>
          </a>
        </div>
      </div>
    </>
  )
}

export default New
