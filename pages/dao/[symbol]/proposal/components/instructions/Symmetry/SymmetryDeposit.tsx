import { ProgramAccount, Governance, serializeInstructionToBase64 } from '@solana/spl-governance'
import { SymmetryDepositForm, UiInstruction } from '@utils/uiTypes/proposalCreationTypes';
import { useContext, useEffect, useState } from 'react';
import Tooltip from '@components/Tooltip'
import Input from '@components/inputs/Input'
import { NewProposalContext } from '../../../new';
import Switch from '@components/Switch';
import { Basket, BasketsSDK, FilterOption } from "@symmetry-hq/baskets-sdk";
import { buyBasketIx, buyBasketWithSingleTokenIx, editBasketIx } from "@symmetry-hq/baskets-sdk/dist/basketInstructions";

import { useConnection } from '@solana/wallet-adapter-react';
import Button from '@components/Button';
import { AddTokenToBasketModal } from './AddTokenToBasketModal';
import { TrashCan } from '@carbon/icons-react';
import { PublicKey } from '@solana/web3.js';
import { LinkIcon } from '@heroicons/react/solid';
import useGovernanceAssets from '@hooks/useGovernanceAssets';
import Select from '@components/inputs/Select';
import GovernedAccountSelect from '../../GovernedAccountSelect';
import { SelectBasketModal } from './SelectBasketModal';

const SymmetryDeposit = ({ 
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance>
}) => {
  const {connection} = useConnection();
  const { assetAccounts } = useGovernanceAssets();
  const [basketsSdk, setBasketSdk] = useState<BasketsSDK|undefined>(undefined);
  const [form, setForm] = useState<SymmetryDepositForm>({
    governedAccount: undefined,
    basketAddress: undefined,
    depositToken: undefined,
    depositAmount: 0,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext);
  const [managedBaskets, setManagedBaskets] = useState<any>(undefined);
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [assetAccountsLoaded, setAssetAccountsLoaded] = useState(false);


  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  useEffect(() => {
    if(assetAccounts && assetAccounts.length > 0 && !assetAccountsLoaded)
      setAssetAccountsLoaded(true);
  }, [assetAccounts]);

  useEffect(() => {
    if(assetAccountsLoaded) {
      console.log('assetacc',assetAccounts);
      const basketsOwnerAccounts: FilterOption[] = assetAccounts.filter(x => x.isSol).map((token) => {
        return {
          filterType: 'manager',
          filterPubkey: token.pubkey
        }
      })
      BasketsSDK.init(connection).then((sdk) => {
        setBasketSdk(sdk);
        sdk.findBaskets(basketsOwnerAccounts).then((baskets) => {
          sdk.getCurrentCompositions(baskets).then((compositions) => {
            //console.log('compositions', compositions)
            const basketAccounts:any[] = [];
            baskets.map((basket, i) => {

              basketAccounts.push({
                governedAccount: assetAccounts.filter(x => x.pubkey.toBase58() === basket.data.manager.toBase58())[0],
                basket: basket,
                composition: compositions[i]
              });
            });
            setManagedBaskets(basketAccounts);
            console.log('baskets', basketAccounts)
          });
        });
      });
    }
  }, [assetAccountsLoaded]);

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  async function getInstruction(): Promise<UiInstruction> {
    console.log('FORM', form)
    // const ix = await buyBasketIx(
    //   connection, 
    //   //@ts-ignore
    //   form.governedAccount?.extensions.transferAddress,
    //   form.basketAddress,
    //   form.governedAccount?.extensions.mint?.publicKey,
    //   Number(form.depositAmount)
    // )
    //@ts-ignore
    const ix = await buyBasketIx(
      connection, 
      //@ts-ignore
      form.governedAccount?.governance.nativeTreasuryAddress,
      form.basketAddress,
      Number(form.depositAmount)
    )
    
    return {
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid: true,
      governance: form.governedAccount?.governance
    };
  }
  
  return <>
    {
      managedBaskets ?
      <Select
        label='Select Basket'
        subtitle='Select a basket managed by the DAO'
        value={form.basketAddress?.toBase58()}
        placeholder="Select Basket"
        onChange={(e) => {
          handleSetForm({ propertyName: 'basketAddress', value: new PublicKey(e) })
        }}
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
      <p className='text-sm'>Loading Baskets Managed by the DAO</p>
    }
    {
      form.basketAddress &&
      <div className='flex flex-col gap-2'>
        <p className='text-fgd-1'>Selected Basket:</p>
        <p className='text-fgd-3'>{form.basketAddress.toBase58()}</p>
        <a className='p-3 bg-bkg-4 hover:bg-bkg-5 w-fit rounded-md flex items-center gap-2' href={`https://app.symmetry.fi/view/${form.basketAddress.toBase58()}`} target='_blank' rel='noreferrer'>
          <img src={'/img/symmetry.png'} className='h-4 w-4' />
          <p className='text-sm text-fgd-1'>View Basket on Symmetry</p>
        </a>
      </div>
    }
    <GovernedAccountSelect
      label="USDC Account to Deposit"
      governedAccounts={assetAccounts.filter(x => x.extensions.mint?.publicKey.toBase58() === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')} /* Only allow USDC deposits for now */
      onChange={(value) => {
        handleSetForm({ value, propertyName: 'governedAccount' })
      }}
      value={form.governedAccount}
      error={formErrors['governedAccount']}
      shouldBeGoverned={shouldBeGoverned}
      governance={governance}
      type='token'
    />

    <Input
      subtitle={"Amount of selected tokens will be deposited into the basket"}
      label="Deposit Amount"
      value={form.depositAmount}
      type="number"
      onChange={(e) => handleSetForm({ propertyName: 'depositAmount', value: e.target.value })}
      error={formErrors['depositAmount']}
    />
  </>
}

export default SymmetryDeposit;