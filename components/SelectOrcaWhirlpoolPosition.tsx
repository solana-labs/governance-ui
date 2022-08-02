import { WhirlpoolPositionInfo } from '@tools/sdk/orca/configuration';
import Select from './inputs/Select';

const SelectOrcaWhirlpoolPosition = ({
  title,
  positionsInfo,
  selectedValue,
  onSelect,
}: {
  title: string;
  positionsInfo: WhirlpoolPositionInfo[];
  selectedValue?: WhirlpoolPositionInfo;
  onSelect: (positionInfo: WhirlpoolPositionInfo | null) => void;
}) => {
  const getPositionDisplay = (positionInfo: WhirlpoolPositionInfo) => (
    <div className="flex flex-col flex-wrap space-y-2">
      <div className="flex w-full justify-between items-center flex-wrap">
        <strong>
          Price range {positionInfo.tokenAName} per {positionInfo.tokenBName}
        </strong>
        <span>
          {positionInfo.uiLowerPrice} - {positionInfo.uiUpperPrice}
        </span>
      </div>

      <div className="flex w-full justify-between items-center flex-wrap">
        <strong>Pubkey</strong>
        <span className="overflow-auto text-xs">
          {positionInfo.publicKey.toBase58()}
        </span>
      </div>

      <div className="flex w-full justify-between items-center flex-wrap">
        <strong>Liquidity</strong>
        <span>{positionInfo.liquidity}</span>
      </div>

      <div className="flex w-full justify-between items-center flex-wrap">
        <strong>Position Mint</strong>
        <span className="overflow-auto text-xs">
          {positionInfo.positionMint.toBase58()}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      <div className="mb-0.5">{title}</div>

      {positionsInfo.length ? (
        <Select
          className="flex flex-col w-full"
          value={
            selectedValue ? (
              <>
                Position with price range {selectedValue.uiLowerPrice}/
                {selectedValue.uiUpperPrice} ({selectedValue.tokenAName} per
                {selectedValue.tokenBName})
              </>
            ) : null
          }
          onChange={(positionPublicKey: string) =>
            onSelect(
              positionsInfo.find(
                (positionInfo) =>
                  positionInfo.publicKey.toBase58() === positionPublicKey,
              ) ?? null,
            )
          }
        >
          {positionsInfo.map((positionInfo) => (
            <Select.Option
              key={positionInfo.publicKey.toBase58()}
              value={positionInfo.publicKey.toBase58()}
              className="space-y-0.5 text-xs text-fgd-3"
            >
              {getPositionDisplay(positionInfo)}
            </Select.Option>
          ))}
        </Select>
      ) : (
        <div>No position available</div>
      )}
    </div>
  );
};

export default SelectOrcaWhirlpoolPosition;
