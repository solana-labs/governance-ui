import {useRealmVoterWeightPlugins} from "@hooks/useRealmVoterWeightPlugins";
import {VoterWeightPluginInfo} from "./types";

const Params = ({ plugin } : { plugin: VoterWeightPluginInfo }) => {
    const trimmedParams = Object.entries(plugin.params as any).filter(([key]) => key !== 'reserved');
    return <div>
        {trimmedParams.map(([key, value]) => <pre key={key}>{key}: {JSON.stringify(value)}</pre>)}
    </div>
}

export const PluginDebug = () => {
    const {plugins, voterWeight, maxVoterWeight, isReady} = useRealmVoterWeightPlugins()

    return <div>
        <div>Hello! This is a voter weight plugin debug dashboard</div>
        <div>Voter Weight: {voterWeight?.toString()}</div>
        <div>Max Voter Weight: {maxVoterWeight?.toString()}</div>
        <div>Is Ready: {isReady.toString()}</div>
        <div>Plugins:
            <ul>
                {isReady && (plugins || []).map((plugin, i) =>
                    <li key={i}>
                        <div>Plugin Name: {plugin.name}</div>
                        <div>Voter Weight: {plugin.voterWeight?.toString()}</div>
                        <div>Max Voter Weight: {plugin.maxVoterWeight?.toString()}</div>
                        <div>Params: <Params plugin={plugin}/></div>
                    </li>)}
            </ul>
        </div>
    </div>
}