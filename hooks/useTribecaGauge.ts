import { useCallback, useEffect, useState } from 'react';
import ATribecaConfiguration, {
  GaugeInfos,
} from '@tools/sdk/tribeca/ATribecaConfiguration';
import useTribecaPrograms from './useTribecaPrograms';

export default function useTribecaGauge(
  tribecaConfiguration: ATribecaConfiguration | null,
) {
  const { programs } = useTribecaPrograms(tribecaConfiguration);

  const [gauges, setGauges] = useState<GaugeInfos | null>(null);

  const loadGauges = useCallback(async (): Promise<GaugeInfos | null> => {
    if (!tribecaConfiguration || !programs) {
      return null;
    }

    return tribecaConfiguration.fetchAllGauge(programs);
  }, [tribecaConfiguration, programs]);

  useEffect(() => {
    loadGauges().then(setGauges);
  }, [loadGauges]);

  return {
    gauges,
    programs,
  };
}
