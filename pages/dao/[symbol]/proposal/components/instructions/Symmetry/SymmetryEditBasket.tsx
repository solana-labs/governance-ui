import { ProgramAccount, Governance, serializeInstructionToBase64 } from '@solana/spl-governance'
import { SymmetryEditBasketForm, UiInstruction } from '@utils/uiTypes/proposalCreationTypes';
import { useContext, useEffect, useState } from 'react';
import Tooltip from '@components/Tooltip'
import Input from '@components/inputs/Input'
import { NewProposalContext } from '../../../new';
import Switch from '@components/Switch';
import { BasketsSDK, FilterOption } from "@symmetry-hq/baskets-sdk";
import { editBasketIx } from "@symmetry-hq/baskets-sdk/dist/basketInstructions";
import { useConnection } from '@solana/wallet-adapter-react';
import Button from '@components/Button';
import AddTokenToBasketModal from './AddTokenToBasketModal';
import { TrashCan } from '@carbon/icons-react';
import { PublicKey } from '@solana/web3.js';
import { LinkIcon } from '@heroicons/react/solid';
import useGovernanceAssets from '@hooks/useGovernanceAssets';
import Select from '@components/inputs/Select';
import GovernedAccountSelect from '../../GovernedAccountSelect';
import ArrowButton from './components/ArrowButton';


export const LoaderIcon = () => {
  return <div className='w-[12px] h-[12px] border-2 rounded-full border-[#e0e0e0] border-r-[#616161] animate-spin' />;
}

const SymmetryEditBasket = ({ 
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance>
}) => {
  const {connection} = useConnection();
  const { assetAccounts } = useGovernanceAssets()
  const [form, setForm] = useState<SymmetryEditBasketForm>({

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
  const { handleSetInstructions } = useContext(NewProposalContext);
  const [managedBaskets, setManagedBaskets] = useState<any>(undefined);
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [addTokenModal, setAddTokenModal] = useState(false);
  const [supportedTokens, setSupportedTokens] = useState<any|null>(null);
  const [assetAccountsLoaded, setAssetAccountsLoaded] = useState(false);
  const [govAccount, setGovAccount] = useState<any>(undefined);


  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const handleSelectBasket = (address: string) => {
    const foundBasket = managedBaskets.filter(x => x.basket.ownAddress.toBase58() === address)[0]
    if(!foundBasket) return;
    const formData = {
      governedAccount: foundBasket.governedAccount,
      basketAddress: new PublicKey(address),
      basketName: String.fromCharCode.apply(null, foundBasket.basket.data.name),
      basketSymbol: String.fromCharCode.apply(null, foundBasket.basket.data.symbol),
      basketMetadataUrl: String.fromCharCode.apply(null, foundBasket.basket.data.uri),
      basketType: foundBasket.basket.data.activelyManaged.toNumber(),
      basketComposition: foundBasket.composition.currentComposition.map((comp) => {
        return {
          name: comp.name,
          symbol: comp.symbol,
          token: new PublicKey(comp.mintAddress),
          weight: comp.targetWeight
        }
      }),
      rebalanceThreshold: foundBasket.basket.data.rebalanceThreshold.toNumber(),
      rebalanceSlippageTolerance: foundBasket.basket.data.rebalanceSlippage.toNumber(),
      depositFee: foundBasket.basket.data.managerFee.toNumber(),
      feeCollectorAddress: foundBasket.basket.data.feeDelegate.toBase58(),
      liquidityProvision: foundBasket.basket.data.disableLp.toNumber === 0,
      liquidityProvisionRange: foundBasket.basket.data.lpOffsetThreshold.toNumber()
    }
    setForm(formData);    
  }

  useEffect(() => {
    if(assetAccounts && assetAccounts.length > 0 && !assetAccountsLoaded)
      setAssetAccountsLoaded(true);
  }, [assetAccounts]);

  useEffect(() => {
    if(form.governedAccount) {
      console.log("govAcc", form.governedAccount);
      const basketsOwnerAccounts: FilterOption[] = [{
        filterType: 'manager',
        filterPubkey: form.governedAccount.pubkey
      }]
      if(basketsOwnerAccounts.length > 0) {
        BasketsSDK.init(connection).then((sdk) => {
          setSupportedTokens(sdk.getTokenListData());
          sdk.findBaskets(basketsOwnerAccounts).then((baskets) => {
            sdk.getCurrentCompositions(baskets).then((compositions) => {
              const basketAccounts:any[] = [];
              baskets.map((basket, i) => {

                basketAccounts.push({
                  governedAccount: assetAccounts.filter(x => x.pubkey.toBase58() === basket.data.manager.toBase58())[0],
                  basket: basket,
                  composition: compositions[i]
                });
              });
              setManagedBaskets(basketAccounts);
            });
          });
        });
      }
    }
  }, [form.governedAccount]);

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  async function getInstruction(): Promise<UiInstruction> {
    const basketParams = {
      //@ts-ignore
      managerFee: form.depositFee,
      activelyManaged: form.basketType,
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
    const ix = await editBasketIx(connection, form.basketAddress, basketParams)
    
    return {
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid: true,
      governance: form.governedAccount?.governance
    };
  }
  
  return <>
    {
      assetAccountsLoaded ?
      <GovernedAccountSelect
        label="Select DAO Account that manages the Basket"
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
      :
      <div className='flex items-center gap-2 p-2 px-3 rounded-full bg-lime-700 max-w-fit'>
        <LoaderIcon/>
        <p className='text-sm font-bold'>Loading DAO Accounts</p>
      </div>
      
    }
    {
      form.governedAccount &&
      (managedBaskets ?
      <Select
        label='Select Basket to Edit'
        subtitle='Select a basket managed by the DAO'
        value={form.basketAddress?.toBase58()}
        placeholder="Select Basket"
        onChange={(e:string) => handleSelectBasket(e)}
      >
        {
          managedBaskets.map((basket, i) => {
            return <Select.Option key={i} value={basket.basket.ownAddress.toBase58()}>
              {
                basket.composition.name + " (" + basket.composition.symbol + ") : " + basket.basket.ownAddress.toBase58()
              }
            </Select.Option>
          })
        }
      </Select>
      :
      <div className='flex items-center gap-2 p-2 px-3 rounded-full bg-blue-700 max-w-fit'>
        <LoaderIcon/>
        <p className='text-sm font-bold'>Loading Baskets Managed by the Account</p>
      </div>)
    }
    
    {
      form.basketAddress &&
      <>
      <div className='flex flex-col gap-2'>
        <a className='max-w-fit' href={`https://app.symmetry.fi/view/${form.basketAddress.toBase58()}`} target='_blank' rel='noreferrer'>
          <ArrowButton title='View Basket on Symmetry'/>
        </a>
      </div>
      <Tooltip content="If enabled, basket will be public, allowing anyone to deposit/withdraw their funds.">
      <p className="text-sm text-fgd-1 mt-2 mb-1">Allow anyone to Deposit</p>
      <Switch checked={form.basketType === 1} onChange={(x) => handleSetForm({ value: x ? 1 : 2, propertyName: 'basketType' })}/>
    </Tooltip>
    <Input
      subtitle={"Create a name for your basket, basket tokens will show up under this name in wallets & platforms."}
      label="Basket Name"
      value={form.basketName}
      disabled={true}
      type="text"
      onChange={() => null}
      error={formErrors['basketName']}
    />
    <Input
      subtitle={"Basket token symbol/ticker. This will be used to identify the basket token in wallets & platforms."}
      label="Basket Symbol"
      value={form.basketSymbol}
      type="text"
      disabled={true}
      onChange={() => null }
      error={formErrors['basketSymbol']}
    />
    <Input
      subtitle={"Basket Metadata URL, containing basket name, symbol & description, as well as basket image URL, example metadata URL: https://github.com/symmetry-protocol/markets/blob/master/ysol-metadata.json"}
      label="Basket Metadata URL"
      value={form.basketMetadataUrl}
      type="text"
      disabled={true}
      onChange={() => null}
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
    </>
    }
  </>
}

export default SymmetryEditBasket;