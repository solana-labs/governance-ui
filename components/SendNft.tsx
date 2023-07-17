import Button from '@components/Button'
import Input from '@components/inputs/Input'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import { tryParseKey } from '@tools/validators/pubkey'
import { abbreviateAddress } from '@utils/formatting'
import { useMemo, useState } from 'react'
import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
  CheckCircleIcon,
  PhotographIcon,
  //   InformationCircleIcon,
} from '@heroicons/react/solid'
import {
  getInstructionDataFromBase64,
  getNativeTreasuryAddress,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import useQueryContext from '@hooks/useQueryContext'
import { useRouter } from 'next/router'
import { notify } from '@utils/notifications'
import Textarea from '@components/inputs/Textarea'
// import { Popover } from '@headlessui/react'
import Tooltip from '@components/Tooltip'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import useCreateProposal from '@hooks/useCreateProposal'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import NFTAccountSelect from './TreasuryAccount/NFTAccountSelect'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  Token,
} from '@solana/spl-token'
import { createIx_transferNft } from '@utils/metaplex'
import { useRealmDigitalAssetsQuery } from '@hooks/queries/digitalAssets'
import { SetStateAction } from 'react'
import ImgWithLoader from './ImgWithLoader'
import useTreasuryAddressForGovernance from '@hooks/useTreasuryAddressForGovernance'
import Loading from './Loading'
import { fetchGovernanceByPubkey } from '@hooks/queries/governance'
import { useConnection } from '@solana/wallet-adapter-react'
import useGovernanceSelect from '@hooks/useGovernanceSelect'
import { SUPPORT_CNFTS } from '@constants/flags'
import clsx from 'clsx'

const SendNft = ({
  initialNftAndGovernanceSelected,
}: {
  initialNftAndGovernanceSelected?:
    | [PublicKey, PublicKey]
    | [undefined, PublicKey]
}) => {
  const { connection } = useConnection()
  const realm = useRealmQuery().data?.result
  const { canChooseWhoVote } = useRealm()
  const { propose } = useCreateProposal()
  const { canUseTransferInstruction } = useGovernanceAssets()
  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletOnePointOh()
  const router = useRouter()

  const [selectedNfts, setSelectedNfts] = useState<PublicKey[]>(
    initialNftAndGovernanceSelected?.[0]
      ? [initialNftAndGovernanceSelected[0]]
      : []
  )
  const [selectedGovernance, setSelectedGovernance] = useGovernanceSelect(
    initialNftAndGovernanceSelected?.[1]
  )
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [destination, setDestination] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const nftName: string | undefined = undefined
  const defaultTitle = `Send ${nftName ? nftName : 'NFT'} to ${
    tryParseKey(destination)
      ? abbreviateAddress(new PublicKey(destination))
      : '...'
  }`

  const { data: nfts } = useRealmDigitalAssetsQuery() // TODO somewhat better use a more narrow query

  const walletPk = wallet?.publicKey ?? undefined
  const handleProposeNftSend = async () => {
    if (!realm || !selectedGovernance) {
      throw new Error()
    }
    if (walletPk === undefined) {
      throw 'connect wallet'
    }

    const toOwner = tryParseKey(destination)
    if (toOwner === null)
      return setFormErrors({ destination: 'invalid destination' })

    setIsLoading(true)

    const instructions = await Promise.all(
      selectedNfts.map(async (nftMint) => {
        const destinationAtaPk = await Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          nftMint, // mint
          toOwner, // owner
          true
        )
        const destinationAtaQueried = await connection.getAccountInfo(
          destinationAtaPk
        )

        // typically this should just be the same as the account that owns the NFT, but sometimes the governance owns it
        const nativeTreasury = await getNativeTreasuryAddress(
          realm.owner,
          selectedGovernance
        )

        const fromOwnerString = nfts
          ?.flat()
          .find((x) => x.id === nftMint.toString()).ownership.owner
        const fromOwner = tryParseKey(fromOwnerString)
        // should be impossible, but stuff isn't typed
        if (fromOwner === null) throw new Error()

        const transferIx = await createIx_transferNft(
          connection,
          fromOwner,
          toOwner,
          nftMint,
          fromOwner,
          nativeTreasury
        )

        return {
          serializedInstruction: serializeInstructionToBase64(transferIx),
          isValid: true,
          prerequisiteInstructions:
            destinationAtaQueried === null
              ? [
                  Token.createAssociatedTokenAccountInstruction(
                    ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
                    TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
                    nftMint, // mint
                    destinationAtaPk, // ata
                    toOwner, // owner of token account
                    walletPk // fee payer
                  ),
                ]
              : [],
        }
      })
    )

    const governanceFetched = await fetchGovernanceByPubkey(
      connection,
      selectedGovernance
    )
    if (governanceFetched.result === undefined)
      throw new Error('governance not found')

    const instructionsData = instructions.map((instruction) => ({
      data: getInstructionDataFromBase64(instruction.serializedInstruction),
      holdUpTime:
        governanceFetched.result.account.config.minInstructionHoldUpTime,
      prerequisiteInstructions: instruction.prerequisiteInstructions ?? [],
      chunkBy: 1,
    }))

    try {
      const proposalAddress = await propose({
        title: title !== '' ? title : defaultTitle,
        description,
        voteByCouncil,
        instructionsData,
        governance: selectedGovernance,
      })
      const url = fmtUrlWithCluster(
        `/dao/${router.query.symbol}/proposal/${proposalAddress}`
      )
      router.push(url)
    } catch (ex) {
      notify({ type: 'error', message: `${ex}` })
      //console.error(ex)
      setIsLoading(false)
      throw ex
    }
    setIsLoading(false)
  }

  return (
    <>
      <h3 className="mb-4 flex items-center">
        <>Send NFT</>
      </h3>

      {selectedGovernance !== undefined && (
        <NFTAccountSelect
          onChange={(value) => setSelectedGovernance(value)}
          selectedGovernance={selectedGovernance}
        />
      )}

      <div className="space-y-4 w-full pb-4">
        {
          // TODO use some kind of good wallet pubkey input
        }
        <Input
          label="Destination account"
          value={destination}
          type="text"
          onChange={(evt) => setDestination(evt.target.value)}
          noMaxWidth={true}
          error={formErrors['destination']}
        />

        {selectedGovernance !== undefined && (
          <GovernanceNFTSelector
            selectedNfts={selectedNfts}
            setSelectedNfts={setSelectedNfts}
            governance={selectedGovernance}
          />
        )}
        <div
          className={'flex items-center hover:cursor-pointer w-24'}
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? (
            <ArrowCircleUpIcon className="h-4 w-4 mr-1 text-primary-light" />
          ) : (
            <ArrowCircleDownIcon className="h-4 w-4 mr-1 text-primary-light" />
          )}
          <small className="text-fgd-3">Options</small>
        </div>
        {showOptions && (
          <>
            <Input
              noMaxWidth={true}
              label="Title"
              placeholder={
                tryParseKey(destination)
                  ? defaultTitle
                  : 'Title of your proposal'
              }
              value={title}
              type="text"
              onChange={(evt) => setTitle(evt.target.value)}
            />
            <Textarea
              noMaxWidth={true}
              label="Description"
              placeholder={
                'Description of your proposal or use a github gist link (optional)'
              }
              wrapperClassName="mb-5"
              value={description}
              onChange={(evt) => setDescription(evt.target.value)}
            ></Textarea>
            {canChooseWhoVote && (
              <VoteBySwitch
                checked={voteByCouncil}
                onChange={() => {
                  setVoteByCouncil(!voteByCouncil)
                }}
              ></VoteBySwitch>
            )}
          </>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4">
        <Button
          className="ml-auto"
          onClick={handleProposeNftSend}
          isLoading={isLoading}
        >
          <Tooltip
            content={
              !canUseTransferInstruction
                ? 'You need to have connected wallet with ability to create token transfer proposals'
                : !selectedNfts.length
                ? 'Please select nft'
                : ''
            }
          >
            <div>Propose</div>
          </Tooltip>
        </Button>
      </div>
    </>
  )
}

/** Select NFTs owned by a given governance */
function GovernanceNFTSelector({
  governance,
  nftWidth = '150px',
  nftHeight = '150px',
  selectedNfts,
  setSelectedNfts,
}: {
  governance: PublicKey
  selectedNfts: PublicKey[]
  setSelectedNfts: React.Dispatch<SetStateAction<PublicKey[]>>
  nftWidth?: string
  nftHeight?: string
}) {
  const { result: treasuryAddress } = useTreasuryAddressForGovernance(
    governance
  )

  // TODO just query by owner (which should be in cache already)
  const { data: allNfts, isLoading } = useRealmDigitalAssetsQuery()
  const nfts = useMemo(
    () =>
      allNfts
        ?.flat()
        .filter((x) => SUPPORT_CNFTS || !x.compression.compressed)
        .filter(
          (x) =>
            x.ownership.owner === governance.toString() ||
            x.ownership.owner === treasuryAddress?.toString()
        ),
    [allNfts, governance, treasuryAddress]
  )

  return (
    <>
      <div className="overflow-y-auto">
        {!isLoading ? (
          nfts?.length ? (
            <div className="flex flex-row flex-wrap gap-4 mb-4">
              {nfts.map((nft) => (
                <div
                  onClick={() =>
                    setSelectedNfts((prev) => {
                      const alreadyIncluded = prev.find(
                        (x) => x.toString() === nft.id
                      )
                      return alreadyIncluded
                        ? prev.filter((x) => x.toString() !== nft.id)
                        : [...prev, new PublicKey(nft.id)]
                    })
                  }
                  key={nft.id}
                  className={clsx(
                    `bg-bkg-2 flex-shrink-0 flex items-center justify-center cursor-pointer default-transition rounded-lg relative overflow-hidden`,
                    selectedNfts.find((k) => k.toString() === nft.id)
                      ? 'border-4 border-green'
                      : 'border border-transparent hover:border-primary-dark '
                  )}
                  style={{
                    width: nftWidth,
                    height: nftHeight,
                  }}
                >
                  {selectedNfts.find((k) => k.toString() === nft.id) && (
                    <CheckCircleIcon className="w-10 h-10 absolute text-green z-10" />
                  )}

                  <ImgWithLoader
                    style={{ width: '150px' }}
                    src={
                      nft.content.files[0]?.cdn_uri ?? nft.content.files[0]?.uri
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-fgd-3 flex flex-col items-center">
              {"Account doesn't have any NFTs"}
              <PhotographIcon className="opacity-5 w-56 h-56" />
            </div>
          )
        ) : (
          <Loading />
        )}
      </div>
    </>
  )
}

export default SendNft
