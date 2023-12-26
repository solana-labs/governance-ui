import Text from '@components/Text'

export function GenericTokenIcon() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 31C24.2843 31 31 24.2843 31 16C31 7.71573 24.2843 1 16 1C7.71573 1 1 7.71573 1 16C1 24.2843 7.71573 31 16 31ZM16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 26C21.5228 26 26 21.5228 26 16C26 10.4772 21.5228 6 16 6C10.4772 6 6 10.4772 6 16C6 21.5228 10.4772 26 16 26ZM16 27C22.0751 27 27 22.0751 27 16C27 9.92487 22.0751 5 16 5C9.92487 5 5 9.92487 5 16C5 22.0751 9.92487 27 16 27Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 21C18.7614 21 21 18.7614 21 16C21 13.2386 18.7614 11 16 11C13.2386 11 11 13.2386 11 16C11 18.7614 13.2386 21 16 21ZM16 22C19.3137 22 22 19.3137 22 16C22 12.6863 19.3137 10 16 10C12.6863 10 10 12.6863 10 16C10 19.3137 12.6863 22 16 22Z"
        fill="currentColor"
      />
    </svg>
  )
}

function TokenInfoCell({ title = '', children }) {
  return (
    <div className="flex flex-col h-full px-5 pt-2 pb-3 space-y-1 rounded-md md:space-y-2 md:pt-5 md:pb-5 md:px-6 bg-bkg-2">
      <Text level="2" className="text-fgd-2">
        {title}
      </Text>
      <div className="flex items-center grow">{children}</div>
    </div>
  )
}

export default function TokenInfoTable({ tokenInfo, loading }) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 ${
        loading ? 'animate-pulse' : ''
      }`}
    >
      <TokenInfoCell title="Token Name">
        <div className="flex items-center space-x-2">
          {tokenInfo?.logoURI ? (
            <div className="w-10">
              <img src={tokenInfo?.logoURI} alt="token" className="w-full" />
            </div>
          ) : (
            <div className="w-10 mr-4 text-white/50">
              <GenericTokenIcon />
            </div>
          )}
          {tokenInfo ? (
            <Text level="0" className="input-base">
              {tokenInfo.name || '(No name)'}
            </Text>
          ) : (
            <Text className="ml-2 text-white/30">
              <div
                className="text-[22px] font-medium"
                dangerouslySetInnerHTML={{
                  __html: `&#8212;`,
                }}
              ></div>
            </Text>
          )}
        </div>
      </TokenInfoCell>
      <TokenInfoCell title="Token Symbol">
        <Text className="flex items-center">
          {tokenInfo ? (
            <Text
              level="0"
              className="flex items-baseline space-x-2 input-base"
            >
              <div className="text-white/30">#</div>
              <div>{tokenInfo.symbol || '(No symbol)'}</div>
            </Text>
          ) : (
            <div
              className="text-[22px] font-normal text-white/30"
              dangerouslySetInnerHTML={{
                __html: `&#8212;`,
              }}
            ></div>
          )}
        </Text>
      </TokenInfoCell>
    </div>
  )
}
