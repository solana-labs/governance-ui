import Button from './Button'

const KickstartSolana = () => {
  return (
    <div className="z-10">
      <div className="text-center md:text-left mt-28">
        <h1 className="font-thin tracking-tight md:text-6xl">Kickstart your</h1>
        <h1 className="font-thin tracking-tight md:text-6xl">
          community on Solana
        </h1>
        <p className="mt-4 text-base tracking-tight text-center md:text-left opacity-70">
          Create and participate in fully on-chain DAOs of all kinds.
        </p>
      </div>
      <div className="py-4 text-center md:text-left">
        <Button className="m-4">Create DAO</Button>
      </div>
    </div>
  )
}

export default KickstartSolana
