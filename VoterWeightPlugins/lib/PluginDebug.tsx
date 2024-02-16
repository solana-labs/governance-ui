import {useRealmVoterWeightPlugins} from "@hooks/useRealmVoterWeightPlugins";
import {VoterWeightPluginInfo} from "./types";

const Params = ({ plugin } : { plugin: VoterWeightPluginInfo }) => {
    const trimmedParams = Object.entries(plugin.params as any).filter(([key]) => key !== 'reserved');
    return <div>
        {trimmedParams.map(([key, value]) => <pre key={key}>{key}: {JSON.stringify(value)}</pre>)}
    </div>
}

export const PluginDebug = () => {
    const {plugins, calculatedVoterWeight, calculatedMaxVoterWeight, isReady} = useRealmVoterWeightPlugins()

    return <div>
        <div>Hello! This is a voter weight plugin debug dashboard</div>
        <div>Voter Weight: {calculatedVoterWeight?.value?.toString()}</div>
        <div>Max Voter Weight: {calculatedMaxVoterWeight?.value?.toString()}</div>
        <div>Is Ready: {isReady.toString()}</div>
        <div>Plugins:
            <ul>
                {isReady && (plugins || []).map((plugin, i) =>
                    <li key={i}>
                        <div>Plugin Name: {plugin.name}</div>
                        <div>Voter Weight (on-chain): {plugin.voterWeight?.toString()}</div>
                        <div>Max Voter Weight (on-chain): {plugin.maxVoterWeight?.toString()}</div>
                        <div>Voter Weight
                            (calculated): {calculatedVoterWeight?.details[i].pluginWeight?.toString()}</div>
                        <div>Voter Weight
                            (error): {calculatedVoterWeight?.details[i].error?.stack}</div>
                        <div>Params: <Params plugin={plugin}/></div>
                    </li>)}
            </ul>
        </div>
    </div>
}