import Select from '@components/inputs/Select';
import { GaugeInfos } from '@tools/sdk/tribeca/ATribecaConfiguration';

const GaugeSelect = ({
  gauges,
  value,
  error,
  onChange,
}: {
  gauges: GaugeInfos | null;
  value?: string;
  error?: string;
  onChange: (v: string) => void;
}) => {
  return (
    <Select
      label="Gauge"
      value={value}
      placeholder="Please select..."
      onChange={onChange}
      error={error}
    >
      {Object.entries(gauges || {}).map(([name, { logoURI }]) => (
        <Select.Option key={name} value={name}>
          <span className="flex flex-row items-center">
            <img className="w-8" src={logoURI} />

            <span className="relative left-2">{name}</span>
          </span>
        </Select.Option>
      ))}
    </Select>
  );
};

export default GaugeSelect;
