export enum Flag {
  Danger,
  Warning,
  OK,
}

type OptionDetail = {
  label: string;
  text: string;
  flag?: Flag;
};

const flagColorClassMap: {
  [flag in Flag]: string;
} = {
  [Flag.Danger]: 'text-red',
  [Flag.Warning]: 'text-orange',
  [Flag.OK]: 'text-green',
};

const setFlagColorText = (flag?: Flag) => {
  if (flag === undefined) {
    return '';
  }

  return flagColorClassMap[flag];
};

const SelectOptionDetailed = ({
  title,
  details,
  diffValue,
}: {
  title: string;
  details: OptionDetail[];
  diffValue?: OptionDetail;
}) => {
  return (
    <div className="flex flex-col">
      <div className="mb-0.5">{title}</div>

      <div className="flex flex-col">
        {details.map((opt, i) => (
          <div
            key={opt.label + i}
            className={`space-y-0.5 text-xs text-fgd-3 ${setFlagColorText(
              opt.flag,
            )}`}
          >
            {`${opt.label}: ${opt.text}`}
          </div>
        ))}
        {diffValue && (
          <div className="mt-0.5">
            <span className={`text-xs ${setFlagColorText(diffValue.flag)}`}>
              {diffValue.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectOptionDetailed;
