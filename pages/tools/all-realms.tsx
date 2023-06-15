import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@components/instructions/tools'
import { useRealmsByProgramQuery } from '@hooks/queries/realm'
import { PublicKey } from '@solana/web3.js'

const AllRealmsPage = () => {
  const realms = useRealmsByProgramQuery(
    new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID)
  )

  return realms.isLoading ? (
    <>loading...</>
  ) : (
    <>
      {realms.data?.map((x) => (
        <div key={x.pubkey.toString()}>
          {x.pubkey.toString()} <b>{x.account.name}</b>
        </div>
      ))}
    </>
  )
}

export default AllRealmsPage
