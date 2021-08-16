import useWalletStore from '../stores/useWalletStore'

const ProposalPage = () => {
  const {
    connected,
    connection: { endpoint },
    proposals: proposals,
  } = useWalletStore((state) => state)

  return (
    <>
      <p>connected:</p>
      <pre>{connected}</pre>
      <p>endpoint:</p>
      <pre>{endpoint}</pre>
      <p>proposals:</p>
      {Object.entries(proposals || {}).map(([k, v]) => (
        <>
          <p>{k.toString()}</p>
          <p>{JSON.stringify(v['info'])}</p>
        </>
      ))}
    </>
  )
}

export default ProposalPage
