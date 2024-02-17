import {useRealmVoterWeightPlugins} from "@hooks/useRealmVoterWeightPlugins";
import {VoterWeightPluginInfo} from "./types";
import {useState} from "react";

const Params = ({ plugin } : { plugin: VoterWeightPluginInfo }) => {
    const trimmedParams = Object.entries(plugin.params as any).filter(([key]) => key !== 'reserved');
    return <div>
        {trimmedParams.map(([key, value]) => <pre key={key}>{key}: {JSON.stringify(value)}</pre>)}
    </div>
}

const useKindToggle = () => {
    const [kind, setKind] = useState<'community' | 'council'>('community')
    const toggle = () => setKind(kind === 'community' ? 'council' : 'community')
    return { kind, toggle }
}

const KindToggle = ({ kind, toggle } : { kind: 'community' | 'council', toggle: () => void }) => {
    return <div>
        <div>Kind: {kind}</div>
        <button onClick={toggle} style={{
            backgroundColor: 'lightblue',
            color: 'black',
            padding: '2px',
            fontSize: '16px',
            borderRadius: '5px',
            cursor: 'pointer'

        }}>Toggle Kind</button>
    </div>
}

export const PluginDebug = () => {
    const {kind, toggle} = useKindToggle();
    const {plugins, calculatedVoterWeight, calculatedMaxVoterWeight, isReady} = useRealmVoterWeightPlugins(kind)

    return <div>
        <div><h1>Hello! This is a voter weight plugin debug dashboard</h1></div>
        <KindToggle kind={kind} toggle={toggle}/>
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