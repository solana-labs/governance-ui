import { PackageType } from '@hooks/useGovernanceAssets';
import { PackageEnum } from '@utils/uiTypes/proposalCreationTypes';

const PackageSelection = ({
  selected,
  className,
  onClick,
  packages,
}: {
  selected: PackageEnum | null;
  className?: string | undefined;
  onClick: (selected: PackageEnum) => void;
  packages: PackageType[];
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {packages.map(({ id, name, image }) => {
        if (image) {
          return (
            <img
              title={name}
              key={name}
              style={{
                boxShadow: selected === id ? '0 0 8px 4px #aeaeae' : 'none',
              }}
              src={image}
              className={`h-6 max-w-6 p-0.5 rounded-full hover:grayscale-0 ${
                selected !== id ? 'grayscale' : ''
              } cursor-pointer`}
              onClick={() => onClick(Number(id) as PackageEnum)}
            />
          );
        }

        // There is no image, we use the text instead
        return (
          <span
            style={{
              boxShadow: selected === id ? '0 0 8px 4px #aeaeae' : 'none',
            }}
            className={`text-xs hover:text-white pl-2 pr-2 pt-0.5 pb-0.5 rounded-full cursor-pointer ${
              selected !== id ? 'text-gray-400' : 'text-white'
            }`}
            onClick={() => onClick(Number(id) as PackageEnum)}
            key={name}
          >
            {name}
          </span>
        );
      })}
    </div>
  );
};

export default PackageSelection;
