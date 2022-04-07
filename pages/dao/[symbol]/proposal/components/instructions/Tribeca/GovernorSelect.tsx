import Select from '@components/inputs/Select';
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration';
import {
  configurations as tribecaConfigurations,
  getConfigurationByName,
} from '@tools/sdk/tribeca/configurations';
import SelectOptionList from '../../SelectOptionList';

const configurationList = Object.values(tribecaConfigurations || {}).map(
  (configuration) => configuration.name,
);

const GovernorSelect = ({
  tribecaConfiguration,
  setTribecaConfiguration,
}: {
  tribecaConfiguration: ATribecaConfiguration | null;
  setTribecaConfiguration: (v: ATribecaConfiguration | null) => void;
}) => {
  return (
    <Select
      label="Governor"
      value={tribecaConfiguration?.name ?? null}
      placeholder="Please select..."
      onChange={(value) => {
        setTribecaConfiguration(getConfigurationByName(value));
      }}
    >
      <SelectOptionList list={configurationList} />
    </Select>
  );
};

export default GovernorSelect;
