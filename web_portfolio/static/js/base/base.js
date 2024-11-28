import {getElementHeight} from "../util.js";

window.addEventListener("load", removeNoInitialAnimationClass)
updateDarkMode(false)

function updateDarkMode(darkModeActivated = null)
{
    if(darkModeActivated != null)
    {
        localStorage.darkMode = darkModeActivated
    }

    document.documentElement.className = localStorage.darkMode === "true" ? "dark" : "light";
}

function toggleDarkMode()
{
    updateDarkMode(localStorage.darkMode === "true" ? "false" : "true");
}

function removeNoInitialAnimationClass()
{
    const elements = document.getElementsByClassName("no-initial-animation");

    while(elements.length > 0)
    {
        elements[0].classList.remove("no-initial-animation")
    }
}

window.baseFunctions = {updateDarkMode, toggleDarkMode}