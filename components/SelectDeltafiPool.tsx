import { PoolInfo } from '@tools/sdk/deltafi/configuration';
import Select from './inputs/Select';

export type PoolName = string;

const SelectDeltafiPool = ({
  title,
  poolInfoList,
  selectedValue,
  onSelect,
}: {
  title: string;
  poolInfoList: PoolInfo[];
  selectedValue?: PoolName;
  onSelect: (poolName: PoolName) => void;
}) => {
  return (
    <div className="flex flex-col">
      <div className="mb-0.5">{title}</div>

      <Select
        className="flex flex-col"
        value={selectedValue}
        onChange={(v: PoolName) => onSelect(v)}
      >
        {poolInfoList.map((poolInfo, i) => (
          <Select.Option
            key={poolInfo.name + i}
            value={poolInfo.name}
            className="space-y-0.5 text-xs text-fgd-3"
          >
            {`${poolInfo.name}`}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default SelectDeltafiPool;
