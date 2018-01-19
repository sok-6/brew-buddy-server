let pluginSet = [
    require("./plugins/horses")
];

let getPluginNameList = () => {
    let result = [];

    for (let i = 0; i < pluginSet.length; i++) {
        result.push(pluginSet[i].name);
    }

    return result;
}; 

let getPluginByName = (pluginName) => {
    return pluginSet.find((p) => p.name === pluginName);
}

module.exports = {
    getPluginNameList: getPluginNameList,
    getPluginByName: getPluginByName
};