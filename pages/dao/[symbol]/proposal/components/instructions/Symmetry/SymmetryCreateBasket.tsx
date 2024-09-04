import { ProgramAccount, Governance, serializeInstructionToBase64 } from '@solana/spl-governance'
import { SymmetryCreateBasketForm, UiInstruction } from '@utils/uiTypes/proposalCreationTypes';
import { useContext, useEffect, useState } from 'react';
import Tooltip from '@components/Tooltip'
import Input from '@components/inputs/Input'
import { NewProposalContext } from '../../../new';
import Switch from '@components/Switch';
import { BasketsSDK } from "@symmetry-hq/baskets-sdk";
import { createBasketIx } from "@symmetry-hq/baskets-sdk/dist/basketInstructions";
import { useConnection } from '@solana/wallet-adapter-react';
import Button from '@components/Button';
import AddTokenToBasketModal from './AddTokenToBasketModal';
import { TrashCan } from '@carbon/icons-react';
import { PublicKey } from '@solana/web3.js';
import { LinkIcon } from '@heroicons/react/solid';
import useGovernanceAssets from '@hooks/useGovernanceAssets';
import GovernedAccountSelect from '../../GovernedAccountSelect';

const SymmetryCreateBasket = ({ 
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance>
}) => {
  const {connection} = useConnection();
  const { assetAccounts } = useGovernanceAssets()
  const [form, setForm] = useState<SymmetryCreateBasketForm>({
    basketName: "",
    basketSymbol: "",
    basketMetadataUrl: "",
    basketType: 2,
    basketComposition: [],
    rebalanceThreshold: 1000,
    rebalanceSlippageTolerance: 50,
    depositFee: 10,
    feeCollectorAddress: "",
    liquidityProvision: false,
    liquidityProvisionRange: 0,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [supportedTokens, setSupportedTokens] = useState<any|null>(null);
  const [addTokenModal, setAddTokenModal] = useState(false);



  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  useEffect(() => {
    BasketsSDK.init(connection).then((sdk) => {
      setSupportedTokens(sdk.getTokenListData());
    });
  }, []);

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  async function getInstruction(): Promise<UiInstruction> {

    const basketParams = {
      name: form.basketName,
      symbol: form.basketSymbol,
      uri: form.basketMetadataUrl,
      hostPlatform: new PublicKey('4Vry5hGDmbwGwhjgegHmoitjMHniSotpjBFkRuDYHcDG'),
      hostPlatformFee: 10,
      //@ts-ignore
      manager: form.governedAccount?.extensions.transferAddress,
      managerFee: form.depositFee,
      activelyManaged: 1,
      rebalanceInterval: 3600,
      rebalanceThreshold: form.rebalanceThreshold,
      rebalanceSlippage: form.rebalanceSlippageTolerance,
      lpOffsetThreshold: 0,
      disableRebalance: false,
      disableLp: !form.liquidityProvision,
      composition: form.basketComposition.map((token) => {
        return {
          token: token.token,
          weight: token.weight,
        }
      }),
      feeDelegate: new PublicKey(form.feeCollectorAddress)
    }
    //@ts-ignore
    const ix = await createBasketIx(connection, basketParams)
    return {
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid: true,
      governance: form.governedAccount?.governance
    };
  }
  return (
    <>
      <Tooltip content="If enabled, basket will be public, allowing anyone to deposit/withdraw their funds.">
        <p className="text-sm text-fgd-1 mt-2 mb-1">Allow anyone to Deposit</p>
        <Switch checked={form.basketType === 2} onChange={(x) => handleSetForm({ value: x ? 2 : 1, propertyName: 'basketType' })}/>
      </Tooltip>
      <Input
        subtitle={"Create a name for your basket, basket tokens will show up under this name in wallets & platforms."}
        label="Basket Name"
        value={form.basketName}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'basketName',
          })
        }
        error={formErrors['basketName']}
      />
      <Input
        subtitle={"Basket token symbol/ticker. This will be used to identify the basket token in wallets & platforms."}
        label="Basket Symbol"
        value={form.basketSymbol}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'basketSymbol',
          })
        }
        error={formErrors['basketSymbol']}
      />
      <Input
        subtitle={"Basket Metadata URL, containing basket name, symbol & description, as well as basket image URL, example metadata URL: https://github.com/symmetry-protocol/markets/blob/master/ysol-metadata.json"}
        label="Basket Metadata URL"
        value={form.basketMetadataUrl}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'basketMetadataUrl',
          })
        }
        error={formErrors['basketMetadataUrl']}
      />
      <Input
        subtitle={"A deposit fee charged to all deposits that go to the basket creator/delegate (in bps. 100 bps = 1%)"}
        label="Basket Deposit Fee"
        value={form.depositFee}
        type="number"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'depositFee',
          })
        }
        error={formErrors['depositFee']}
      />
      <GovernedAccountSelect
        label="Basket Manager Account"
        governedAccounts={assetAccounts.filter(x => x.isSol)}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
        type='wallet'
      />
      <Input
        subtitle={"This address will collect deposit fees from the basket."}
        label="Fee Collector Address"
        value={form.feeCollectorAddress}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'feeCollectorAddress',
          })
        }
        error={formErrors['feeCollectorAddress']}
      />
      <Input
        subtitle={"Maximum allowed slippage (including price impact) for rebalancing trades, in bps. 100 bps = 1%"}
        label="Basket Slippage Tolerance"
        value={form.rebalanceSlippageTolerance}
        type="number"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'rebalanceSlippageTolerance',
          })
        }
        error={formErrors['rebalanceSlippageTolerance']}
      />
      <Input
        subtitle={"Weight threshold for triggering basket rebalance. Applies relative to each token target weight. in bps. 100 bps = 1%. Example: 1000 (10%) would mean, if any token weight is off by 10% or more from their target weight, a rebalance would be triggered."}
        label="Rebalance Threshold"
        value={form.rebalanceThreshold}
        type="number"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'rebalanceThreshold',
          })
        }
        error={formErrors['rebalanceThreshold']}
      />
      <div className='flex flex-col'>
        <p className="text-sm text-fgd-1 mb-1">Enable Passive Rebalancing</p>
        <p className="text-sm text-fgd-3 mt-1 mb-1">Plugs into DEX Aggregators to passively allow for favorable swaps that keep the composition rebalanced. 
        <span className='text-green-500'>Earns Extra Yield.</span>
        </p>
        <Switch checked={form.liquidityProvision} onChange={(x) => handleSetForm({ value: x, propertyName: 'liquidityProvision' })}/>
      </div>
      <div className='flex flex-col gap-4'>
        <p className='text-sm'>Basket Composition</p>
        <div className='flex flex-col gap-2 p-2 rounded-md bg-bkg-1'>
          <div className='w-full grid grid-cols-8 items-center px-4'>
            <p className='text-sm col-span-2 text-fgd-3'>Token</p>
            <p className='text-sm col-span-4 text-fgd-3'>Mint Address</p>
            <p className='text-sm text-fgd-3 text-left'>Token Weight</p>
            <p className='text-sm text-fgd-3 text-right'>Actions</p>
          </div>
          { form.basketComposition.length > 0 ?
            form.basketComposition.map((token, i) => {
              return (
                <div key={i} className='grid grid-cols-8 items-center bg-bkg-3 py-2 px-4 rounded-lg'>
                  <div className='flex flex-col col-span-2'>
                    <p className='text-sm text-fgd-3'>
                      {
                        token.name
                      }
                    </p>
                    <p className='text-sm font-bold'>
                      {
                        token.symbol
                      }
                    </p>
                  </div>
                  <div className='w-full col-span-4 flex items-center gap-1 justify-start'>
                    <p className='text-sm text-fgd-3'>
                      {
                        token.token.toBase58().slice(0,6) + '...' + token.token.toBase58().slice(-6)
                      }
                    </p>
                    <a rel='noreferrer' target='_blank' href={`https://explorer.solana.com/address/${token.token.toBase58()}`}>
                      <LinkIcon className='h-4 w-4 ml-2 cursor-pointer text-fgd-3 hover:text-fgd-1' />
                    </a>
                  </div>
                  <div className='w-full flex items-center justify-start'>
                    <input placeholder='Weight' className='w-24 rounded text-left border-none bg-bkg-1 text-fgd-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' value={token.weight} type='number' onChange={(evt) => {
                        const newComposition = form.basketComposition;
                        newComposition[i].weight = parseFloat(evt.target.value);
                        setForm({
                          ...form,
                          basketComposition: newComposition
                        });
                      }
                      }
                    />
                  </div>
                  <div className='w-full flex items-center justify-end'>
                    <TrashCan className='h-5 w-5 cursor-pointer text-red-500 hover:text-red-400' onClick={() => {
                        const newComposition = form.basketComposition;
                        newComposition.splice(i, 1);
                        setForm({
                          ...form,
                          basketComposition: newComposition
                        });
                      }}
                    />
                  </div>
                </div>
              )
            })
            :
            <p className='w-full flex items-center justify-center text-center text-sm text-fgd-3 h-[56px]'>Composition Empty. Add tokens below</p>
          }
        </div>
        {
          form.basketComposition.length < 15 && supportedTokens && (
            <Button onClick={() => setAddTokenModal(true)}>Add Token</Button>
          )
        }
        {
          addTokenModal &&
          <AddTokenToBasketModal
            open={addTokenModal}
            onClose={() => setAddTokenModal(false)}
            supportedTokens={supportedTokens}
            onSelect={(token) => {
              if(form.basketComposition.find((t) => t.token.toBase58() === token.tokenMint)
              || form.basketComposition.length >= 15) {
                return;
              }

              setForm({
                ...form,
                basketComposition: [
                  ...form.basketComposition,
                  {
                    name: token.name,
                    symbol: token.symbol,
                    token: new PublicKey(token.tokenMint),
                    weight: 0,
                  }
                ]
              });
              setAddTokenModal(false);
            }}
          />
        }
        
      </div>
      {
        form.governedAccount &&
          <div className='w-full flex items-center gap-2 p-4 border text-yellow-500 border-yellow-500 rounded-md'>
            <svg
              className='flex flex-shrink-0'
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className='text-xs text-yellow-500'>
              Make sure {form.governedAccount?.pubkey.toBase58()} has at least 0.22 SOL, which will required to deploy the basket after the proposal passes.
            </p>
          </div>
      }
    </>
  )
}

export default SymmetryCreateBasket;