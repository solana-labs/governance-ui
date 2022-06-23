import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import useQueryContext from '@hooks/useQueryContext'

import Header from '@components/Header'
import Text from '@components/Text'

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
      url: '/realms/new/community-token',
      name: 'Community Token DAO',
      description:
        'DAO members use a community token to denote their membership and allow them to vote on proposals.',
    },
  ]
  return (
    <>
      <Head>
        <title>Create new DAO | Realms</title>
      </Head>
      <Header as="h2" className="mt-8 ">
        What type of DAO <br />
        would you like to create?
      </Header>
      <div className="pt-5 pb-4 mx-auto mt-8 rounded lg:mt-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {DAO_TYPES.map(({ url, name, description }) => (
            <Link key={name} href={fmtUrlWithCluster(url)}>
              <a className="flex flex-col items-start px-12 py-12 border rounded cursor-pointer border-bkg-2 hover:border hover:border-fgd-1 bg-bkg-3">
                <Header as="h4" className="mb-6">
                  {name}
                </Header>
                <Text level="2" className="text-left text-fgd-2">
                  {description}
                </Text>
              </a>
            </Link>
          ))}
        </div>
        <div className="flex items-center justify-center px-4 mt-10 space-x-8">
          <a
            href="https://governance-docs.vercel.app/DAO-Management/creating-DAOs/DAO-wizard"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="rounded px-3 py-1.5 hover:text-primary-dark default-transition cursor-pointer underline">
              <span className="text-sm font-semibold">Tutorial Docs</span>
            </div>
          </a>
        </div>
      </div>
    </>
  )
}

export default New
