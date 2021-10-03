import useWalletStore from '../../../stores/useWalletStore'
import useRealm from '../../../hooks/useRealm'
import React, { useEffect, useState } from 'react'
import { GlobeAltIcon } from '@heroicons/react/outline'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import Link from 'next/link'
import ProposalFilter from '../../../components/ProposalFilter'
import ProposalCard from '../../../components/ProposalCard'
import TokenBalanceCard from '../../../components/TokenBalanceCard'
import { Proposal, ProposalState } from '../../../models/accounts'
import { TwitterIcon } from '../../../components/icons'

const compareProposals = (p1: Proposal, p2: Proposal) => {
  const p1Rank = p1.getStateSortRank()
  const p2Rank = p2.getStateSortRank()

  if (p1Rank > p2Rank) {
    return 1
  } else if (p1Rank < p2Rank) {
    return -1
  }

  const tsCompare = p1.getStateTimestamp() - p2.getStateTimestamp()

  // Show the proposals in voting state expiring earlier at the top
  return p1.state === ProposalState.Voting ? ~tsCompare : tsCompare
}

const DAO = () => {
  const {
    proposals,
    realmTokenAccount,
    ownTokenRecord,
    realm,
    realmInfo,
  } = useRealm()
  const [filters, setFilters] = useState([])
  const [displayedProposals, setDisplayedProposals] = useState([])
  const [filteredProposals, setFilteredProposals] = useState(displayedProposals)
  const wallet = useWalletStore((s) => s.current)
  // const [showAltImg, setShowAltImg] = useState(false)

  const realmName = realmInfo?.mainnetName ?? realm?.info?.name
  const allProposals = Object.entries(proposals)
    .filter(([, v]) => v.info.votingAt)
    .sort((a, b) => compareProposals(b[1].info, a[1].info))
  // const onLogoError = () => {
  //   setShowAltImg(true)
  // }

  useEffect(() => {
    setDisplayedProposals(allProposals)
    setFilteredProposals(allProposals)
  }, [proposals])

  useEffect(() => {
    if (filters.length > 0) {
      const proposals = displayedProposals.filter(
        ([, v]) => !filters.includes(ProposalState[v.info.state])
      )
      setFilteredProposals(proposals)
    } else {
      setFilteredProposals(allProposals)
    }
  }, [filters])

  // DEBUG print remove
  console.log(
    'governance page tokenAccount',
    realmTokenAccount && realmTokenAccount.publicKey.toBase58()
  )

  console.log(
    'governance page wallet',
    wallet?.connected && wallet.publicKey.toBase58()
  )

  console.log(
    'governance page tokenRecord',
    wallet?.connected && ownTokenRecord
  )

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="bg-bkg-2 border border-bkg-3 col-span-12 md:col-span-7 lg:col-span-8 p-6 rounded-lg">
          <div className="pb-4">
            <Link href={`/realms`}>
              <a className="default-transition flex items-center mb-6 text-fgd-3 text-sm transition-all hover:text-fgd-1">
                <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
                Back
              </a>
            </Link>
            <div className="border-b border-bkg-4 flex items-center justify-between pb-4">
              {realmName && (
                <div className="flex items-center">
                  {realmInfo?.ogImage ? (
                    <div className="bg-[rgba(255,255,255,0.1)] rounded-full h-14 w-14 flex items-center justify-center">
                      <img className="w-8" src={realmInfo?.ogImage}></img>
                    </div>
                  ) : (
                    <div className="bg-[rgba(255,255,255,0.1)] h-14 w-14 flex font-bold items-center justify-center rounded-full text-fgd-3">
                      {realmName?.charAt(0)}
                    </div>
                  )}
                  <h1 className="ml-3">{realmName}</h1>
                </div>
              )}
              <div className="flex items-center space-x-6">
                {realmInfo?.website ? (
                  <a
                    className="default-transition flex items-center text-fgd-2 text-sm hover:text-fgd-1"
                    href={realmInfo?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GlobeAltIcon className="mr-1.5 h-4 w-4" />
                    Website
                  </a>
                ) : null}
                {realmInfo?.twitter ? (
                  <a
                    className="default-transition flex items-center text-fgd-2 text-sm hover:text-fgd-1"
                    href={`https://twitter.com/${realmInfo?.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TwitterIcon className="mr-1.5 h-4 w-4" />
                    Twitter
                  </a>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pb-2">
            <h4>{`${filteredProposals.length} proposals`}</h4>
            <ProposalFilter filters={filters} setFilters={setFilters} />
          </div>
          <div className="space-y-2">
            {filteredProposals.length > 0 ? (
              filteredProposals.map(([k, v]) => (
                <ProposalCard key={k} id={k} proposal={v.info} />
              ))
            ) : (
              <div className="bg-bkg-2 border border-bkg-3 px-6 py-4 rounded-lg text-center text-fgd-3">
                No proposals found
              </div>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-5 lg:col-span-4">
          <TokenBalanceCard />
        </div>
      </div>
    </>
  )
}

export default DAO
