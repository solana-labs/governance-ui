import {useRealmVoterWeightPlugins} from "@hooks/useRealmVoterWeightPlugins";
export const PluginDebug = () => {
    const { plugins, voterWeight, maxVoterWeight} = useRealmVoterWeightPlugins()

    return <div>
        <div>Hello! This is a voter weight plugin debug dashboard</div>
        <div>Voter Weight: {voterWeight?.toString()}</div>
        <div>Max Voter Weight: {maxVoterWeight?.toString()}</div>
        <div>Plugins:
            <ul>
                {plugins.map((plugin, i) =>
                    <li key={i}>
                        <div>Plugin Name: {plugin.name}</div>
                        <div>Voter Weight: {plugin.voterWeight?.toString()}</div>
                        <div>Max Voter Weight: {plugin.maxVoterWeight?.toString()}</div>
                        <div>Params: <pre>{JSON.stringify(plugin.params, null, 2)}</pre></div>
                    </li>)}
            </ul>
        </div>
    </div>
}