//Dark Mode Switch
function getDarkModeSwitchInitState()
{
    return localStorage.darkMode != null ? localStorage.darkMode === "true" : false
}

function switchDarkMode(switch_id, newState)
{
    window.baseFunctions.updateDarkMode(newState)
}

window.centrallyFunctions = {getDarkModeSwitchInitState, switchDarkMode}