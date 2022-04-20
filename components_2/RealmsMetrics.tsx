import GradientTitle from './GradientTitle'

const RealmsMetrics = () => {
  return (
    <div>
      <div className="px-16">
        <img
          src="/img/realms-web/backgrounds/divider-glow.png"
          className=""
          alt=""
        />
      </div>
      <div className="pb-28 px-56">
        <div className="flex flex-row">
          <div className="basis-1/2">
            {/* <div className="flex-none"> */}
            <h1 className="md:text-3xl font-thin">
              <GradientTitle>Key Metrics on Realms</GradientTitle>
            </h1>
          </div>

          <div className="basis-1/2 grow">
            <div className="grid grid-cols-2 gap-y-32">
              <div>
                <div className="flex items-center">
                  <h1 className="inline text-5xl font-thin tracking-tight">
                    $
                  </h1>
                  <h1 className="inline text-7xl font-thin tracking-tight">
                    31.8B
                  </h1>
                </div>
                <p className="text-lg font-thin opacity-70 mt-3 tracking-tight">
                  Total value locked
                </p>
              </div>
              <div>
                <div className="flex items-center">
                  <h1 className="inline text-7xl font-thin tracking-tight">
                    3.8K
                  </h1>
                  <h1 className="inline text-5xl font-thin tracking-tight">
                    +
                  </h1>
                </div>
                <p className="text-lg font-thin opacity-70 mt-3 tracking-tight">
                  Proposals created
                </p>
              </div>
              <div>
                <div className="flex items-center">
                  <h1 className="inline text-7xl font-thin tracking-tight">
                    289
                  </h1>
                  <h1 className="inline text-5xl font-thin tracking-tight">
                    +
                  </h1>
                </div>
                <p className="text-lg font-thin opacity-70 mt-3 tracking-tight">
                  DAOs created on Realms
                </p>
              </div>
              <div>
                <div className="flex items-center">
                  <h1 className="inline text-7xl font-thin tracking-tight">
                    23.7K
                  </h1>
                  <h1 className="inline text-5xl font-thin tracking-tight">
                    +
                  </h1>
                </div>
                <p className="text-lg font-thin opacity-70 mt-3 tracking-tight">
                  DAO members
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealmsMetrics
