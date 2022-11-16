import React, { useEffect, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import Input from '@components/inputs/Input'
import { tryParseKey } from '@tools/validators/pubkey'
import { debounce } from '@utils/debounce'
import useWalletStore from 'stores/useWalletStore'
import axios from 'axios'
import { notify } from '@utils/notifications'
import Loading from '@components/Loading'
import Button, { LinkButton } from '@components/Button'
import { PublicKey } from '@solana/web3.js'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import Tooltip from '@components/Tooltip'
import { tryGetAta } from '@utils/validations'
import useRealm from '@hooks/useRealm'
import { createATA } from '@utils/ataTools'
import { abbreviateAddress } from '@utils/formatting'
import { DuplicateIcon, ExclamationIcon } from '@heroicons/react/outline'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import DepositLabel from './DepositLabel'
import NFTAccountSelect from './NFTAccountSelect'
import ImgWithLoader from '@components/ImgWithLoader'
import { findMetadataPda, Metaplex } from '@metaplex-foundation/js'
import {
  Nft,
  NftWithToken,
  Sft,
  SftWithToken,
} from '@metaplex-foundation/js/dist/types/plugins/nftModule/models'
const DepositNFTAddress = ({ additionalBtns }: { additionalBtns?: any }) => {
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount)

  const wallet = useWalletStore((s) => s.current)
  const { realm } = useRealm()
  const connected = useWalletStore((s) => s.connected)
  const [form, setForm] = useState({
    mint: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [nftMetaData, setNftMetaData] = useState<
    Sft | SftWithToken | Nft | NftWithToken | null
  >(null)
  const [isInvalidMint, setIsInvalidMint] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [imgUrl, setImgUrl] = useState('')
  const [ataAddress, setAtaAddress] = useState('')
  const { nftsGovernedTokenAccounts } = useGovernanceAssets()
  const { setCurrentAccount } = useTreasuryAccountStore()
  const connection = useWalletStore((s) => s.connection)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const handleGenerateATAAddress = async () => {
    setAtaAddress('')
    if (!currentAccount) {
      throw 'No governance selected'
    }
    if (!realm) {
      throw 'no realm selected'
    }
    const mintPK = new PublicKey(form.mint)
    const owner = currentAccount?.isSol
      ? currentAccount.extensions.transferAddress!
      : currentAccount!.governance!.pubkey
    const ataPk = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
      TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
      mintPK, // mint
      owner!, // owner
      true
    )
    const ata = ataPk.toBase58()
    const isExistingAta = await tryGetAta(connection.current, mintPK, owner)
    if (!isExistingAta) {
      try {
        await createATA(
          connection.current,
          wallet,
          mintPK,
          owner,
          wallet!.publicKey!
        )
        setAtaAddress(ata)
      } catch (e) {
        notify({
          type: 'error',
          message: 'Unable to create address',
        })
        setAtaAddress('')
      }
    } else {
      setAtaAddress(ata)
    }
  }
  useEffect(() => {
    setIsInvalidMint(false)
    if (form.mint) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.mint)
        if (pubKey) {
          setIsLoading(true)
          try {
            const metaplex = new Metaplex(connection.current)
            const metadataPDA = findMetadataPda(pubKey)
            const tokenMetadata = await metaplex.nfts().findByMetadata({
              metadata: new PublicKey(metadataPDA.toBase58()),
            })
            setNftMetaData(tokenMetadata)
          } catch (e) {
            notify({
              type: 'error',
              message: 'Unable to fetch nft',
            })
            setNftMetaData(null)
          }
          setIsLoading(false)
        } else {
          setIsInvalidMint(true)
          setNftMetaData(null)
        }
      })
    } else {
      setNftMetaData(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form.mint])
  useEffect(() => {
    const uri = nftMetaData?.uri
    const getNftData = async (uri) => {
      if (uri) {
        setIsLoading(true)
        try {
          const nftResponse = (await axios.get(uri)).data
          setImgUrl(nftResponse.image)
        } catch (e) {
          notify({
            type: 'error',
            message: 'Unable to fetch nft',
          })
        }
        setIsLoading(false)
      } else {
        setImgUrl('')
      }
    }
    setAtaAddress('')
    getNftData(uri)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [JSON.stringify(nftMetaData)])
  return (
    <>
      <NFTAccountSelect
        onChange={(value) => setCurrentAccount(value, connection)}
        currentAccount={currentAccount}
        nftsGovernedTokenAccounts={nftsGovernedTokenAccounts}
      ></NFTAccountSelect>
      <DepositLabel
        transferAddress={currentAccount?.extensions.transferAddress}
      ></DepositLabel>
      <div className="space-y-4 w-full pb-4">
        <div className="text-sm mt-4">
          <div className="flex flex-row text-xs items-center border-t border-fgd-4 default-transition py-4">
            <ExclamationIcon className="w-5 h-5 mr-2 text-primary-light"></ExclamationIcon>
            {
              "If your wallet doesn't support sending nfts to shared wallets please generate address using the nft mint"
            }
          </div>
        </div>
        <Input
          label="Mint address"
          value={form.mint}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'mint',
            })
          }
          noMaxWidth={true}
          error={formErrors['mint']}
        />
        <Button
          disabled={isLoading || !imgUrl || !connected}
          onClick={handleGenerateATAAddress}
          isLoading={isLoading}
        >
          <Tooltip content={!connected && 'Please connect your wallet'}>
            <div>Generate Address</div>
          </Tooltip>
        </Button>
        {isInvalidMint && (
          <div className="text-xs text-red">Invalid mint address</div>
        )}
        {isLoading ? (
          <Loading />
        ) : (
          imgUrl && (
            <div className="flex justify-center">
              <ImgWithLoader style={{ width: '150px' }} src={imgUrl} />
            </div>
          )
        )}
      </div>
      {ataAddress && (
        <div className="bg-bkg-1 px-4 py-2 rounded-md w-full break-all flex items-center mb-4">
          <div>
            <div className="text-fgd-3 text-xs">
              {abbreviateAddress(new PublicKey(ataAddress))}
            </div>
          </div>
          <div className="ml-auto">
            <LinkButton
              className="ml-4 text-th-fgd-1"
              onClick={() => {
                navigator.clipboard.writeText(ataAddress)
              }}
            >
              <DuplicateIcon className="w-5 h-5 mt-1" />
            </LinkButton>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
        <div className="ml-auto">{additionalBtns}</div>
      </div>
    </>
  )
}

export default DepositNFTAddress
