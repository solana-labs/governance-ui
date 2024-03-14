import {useRealmVoterWeightPlugins} from "@hooks/useRealmVoterWeightPlugins";
import {VoterWeightPluginInfo} from "./types";
import {useState} from "react";

/**
 * A useful debug dashboard for plugins, allowing you to see the voter weights and plugin config, without having to infer it
 * through the UI.
 *
 * Access it using the query param ?debug on any DAO
 *
 * Should be removed before QV-2 is merged.
 */

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
    const {plugins, totalCalculatedVoterWeight, calculatedMaxVoterWeight, isReady} = useRealmVoterWeightPlugins(kind)

    return <div>
        <div><h1>Hello! This is a voter weight plugin debug dashboard</h1></div>
        <KindToggle kind={kind} toggle={toggle}/>
        <div>Voter Weight: {totalCalculatedVoterWeight?.value?.toString()}</div>
        <div>Max Voter Weight: {calculatedMaxVoterWeight?.value?.toString()}</div>
        <div>Is Ready: {isReady.toString()}</div>
        <div>Voter Weight Plugins:
            <ul>
                {isReady && (plugins?.voterWeight || []).map((plugin, i) =>
                    <li key={i}>
                        <div>Plugin Name: {plugin.name}</div>
                        <div>Voter Weight (on-chain): {plugin.weights?.map(w => w?.toString()).join(",")}</div>
                        <div>Voter Weight
                            (calculated): {totalCalculatedVoterWeight?.details[i].pluginWeight?.toString()}</div>
                        <div>Voter Weight
                            (error): {totalCalculatedVoterWeight?.details[i].error?.stack}</div>
                        <div>Params: <Params plugin={plugin}/></div>
                    </li>)}
            </ul>
        </div>
        <div>Max Voter Weight Plugins:
            <ul>
                {isReady && (plugins?.maxVoterWeight || []).map((plugin, i) =>
                    <li key={i}>
                        <div>Plugin Name: {plugin.name}</div>
                        <div>Max Voter Weight (on-chain): {plugin.weights?.map(w => w?.toString()).join(",")}</div>
                        <div>Max Voter Weight
                            (calculated): {calculatedMaxVoterWeight?.details[i].pluginWeight?.toString()}</div>
                        <div>Max Voter Weight
                            (error): {calculatedMaxVoterWeight?.details[i].error?.stack}</div>
                        <div>Params: <Params plugin={plugin}/></div>
                    </li>)}
            </ul>
        </div>
    </div>
}