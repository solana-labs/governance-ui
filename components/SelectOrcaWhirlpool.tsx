import { WhirlpoolName, Whirlpools } from '@tools/sdk/orca/configuration';
import Select from './inputs/Select';

const SelectOrcaWhirlpool = ({
  title,
  whirlpools,
  selectedValue,
  onSelect,
}: {
  title: string;
  whirlpools: Whirlpools;
  selectedValue?: WhirlpoolName;
  onSelect: (whirlpoolName: WhirlpoolName) => void;
}) => {
  return (
    <div className="flex flex-col">
      <div className="mb-0.5">{title}</div>

      <Select
        className="flex flex-col"
        value={selectedValue}
        onChange={(v: WhirlpoolName) => onSelect(v)}
      >
        {Object.entries(whirlpools).map(
          ([whirlpoolName, { displayName }], i) => (
            <Select.Option
              key={whirlpoolName + i}
              value={whirlpoolName}
              className="space-y-0.5 text-xs text-fgd-3"
            >
              {`${displayName}`}
            </Select.Option>
          ),
        )}
      </Select>
    </div>
  );
};

export default SelectOrcaWhirlpool;
