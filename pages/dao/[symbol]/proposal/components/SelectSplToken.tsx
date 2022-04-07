import Select from '@components/inputs/Select';
import { SPL_TOKENS, SupportedSplTokenNames } from '@utils/splTokens';

const SelectSplToken = ({
  label,
  selectedValue,
  onChange,
  error,
}: {
  label: string;
  selectedValue?: string;
  onChange: (value: SupportedSplTokenNames) => void;
  error?: string;
}) => (
  <Select
    label={label}
    value={selectedValue}
    placeholder="Please select..."
    onChange={onChange}
    error={error}
  >
    {Object.entries(SPL_TOKENS).map(([key, { name, mint }]) => (
      <Select.Option key={key} value={name}>
        <div className="flex flex-col">
          <span>{name}</span>

          <span className="text-gray-500 text-sm">{mint.toString()}</span>
        </div>
      </Select.Option>
    ))}
  </Select>
);

export default SelectSplToken;
