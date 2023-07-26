interface Props {
  showNfts: boolean
  isLoading: boolean
  className?: string
  data: any[] | undefined
  highlighted?: string
}

const ProposalTopVotersNftChart = (props: Props) => {
  const nfts = props.data && props.highlighted && props.data[props.highlighted]
  if (!props.showNfts) {
    return <></>
  }

  if (props.isLoading) {
    return (
      <div className="w-full">
        <h3>
          Voter<span>&#39;</span>s NFTs
        </h3>
        <div className={`${props.className}`}>Loading NFTs...</div>
      </div>
    )
  }

  if (!props.highlighted || !props.data || props.data.length === 0) {
    return (
      <div className="w-full">
        <h3>
          Voter<span>&#39;</span>s NFTs
        </h3>
        <div className={`${props.className}`}>Move cursor to an account</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h3>
        Voter<span>&#39;</span>s NFTs
      </h3>
      <div className={`w-full ${props.className} overflow-scroll`}>
        <div className="grid grid-cols-10 gap-3">
          {nfts &&
            nfts.map((nft: any) => {
              return (
                <img
                  key={nft.id}
                  src={nft.image || ''}
                  className={`w-full rounded-full ${
                    nft.voteType === 1 ? 'grayscale' : 'grayscale-0'
                  }`}
                  alt={nft.name}
                />
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default ProposalTopVotersNftChart
