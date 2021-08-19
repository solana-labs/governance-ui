import useWalletStore from '../stores/useWalletStore'
import PageBodyContainer from '../components/PageBodyContainer'
import ProposalCard from '../components/ProposalCard'
import ProposalFilter from '../components/ProposalFilter'
import Button from '../components/Button'

const ProposalPage = () => {
  const {
    // connected,
    // connection: { endpoint },
    proposals: proposals,
  } = useWalletStore((state) => state)

  console.log(proposals)

  return (
    <PageBodyContainer>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2>{`${Object.keys(proposals || {}).length} proposals`}</h2>
            <ProposalFilter />
          </div>
          {Object.entries(proposals || {}).map(([k, v]) => (
            <ProposalCard key={k} proposal={v['info']} />
          ))}
        </div>
        <div className="col-span-4">
          <div className="bg-bkg-2 col-span-4 p-6 rounded-md">
            <h3 className="mb-4">MNGO balance</h3>
            <div className="bg-bkg-3 mb-6 p-4 rounded">
              <div className="text-xl">124.4k</div>
            </div>
            <div className="flex space-x-4">
              <Button className="w-1/2">Deposit</Button>
              <Button className="w-1/2">Withdraw</Button>
            </div>
          </div>
        </div>
      </div>
    </PageBodyContainer>
  )
}

export default ProposalPage
