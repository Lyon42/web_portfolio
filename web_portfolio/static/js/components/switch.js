import {callFunctionByName} from "../util.js";

var timeoutIdMap = new Map()

window.addEventListener("load", switchInit)

function switchInit()
{
    const elements= document.getElementsByClassName("base_switch");

    for(let i= 0; i < elements.length; i++)
    {
        let switch_id = elements[i].id
        let switchInput = document.getElementById(switch_id + "_input")
        let defaultStateFunction = elements[i].attributes["defaultStateFunction"]

        if(defaultStateFunction)
        {
            let defaultState = callFunctionByName(elements[i].attributes["defaultStateFunction"].value.toString())

            if(defaultState)
            {
                switchInput.checked = defaultState
            }
        }

        switchToggle(switch_id)
    }
}

function switchToggle(switchId, callback = null)
{
    const switchComponent = document.getElementById(switchId)
    const input = document.getElementById(switchId + "_input")
    const track = document.getElementById(switchId + "_track")
    const thumb = document.getElementById(switchId + "_thumb")
    const thumbIcons = document.querySelectorAll("#" + switchId + "_thumb svg")
    const labelOff = document.getElementById(switchId + "_label_off")
    const labelOn = document.getElementById(switchId + "_label_on")
    const iconOff = document.getElementById(switchId + "_icon_off")
    const iconOn = document.getElementById(switchId + "_icon_on")

    //Animation
    const animation_duration = parseFloat(getComputedStyle(document.getElementById(switchId)).getPropertyValue("--switch-time").replace("s", ""))

    if(timeoutIdMap.has(switchId))
    {
        window.clearTimeout(timeoutIdMap.get(switchId))
        timeoutIdMap.delete(switchId)
    }

    track.style.transitionDuration = animation_duration + "s"
    thumb.style.transitionDuration = animation_duration + "s"
    thumbIcons.forEach((element) => element.style.transitionDuration = animation_duration + "s")

    const id = window.setTimeout(function()
    {
        track.style.transitionDuration = null
        thumb.style.transitionDuration = null
        thumbIcons.forEach((element) => element.style.transitionDuration = null)

        timeoutIdMap.delete(switchId)
    }, animation_duration * 1000)

    timeoutIdMap.set(switchId, id)

    //Label
    if(labelOff)
    {
        labelOff.style.opacity = input.checked ? "0%" : "100%"
    }

    if(labelOn)
    {
        labelOn.style.opacity = input.checked ? "100%" : "0%"
    }
    
    //Icon
    if(iconOff || iconOn)
    {
        if(iconOff)
        {
            iconOff.style.opacity = input.checked ? "0%" : "100%"
        }

        if(iconOn)
        {
            iconOn.style.opacity = input.checked ? "100%" : "0%"
        }

        if(input.checked && iconOn || !input.checked && iconOff)
        {
            thumb.classList.add("base_switch_thumb_with_icon")
        }
        else
        {
            thumb.classList.remove("base_switch_thumb_with_icon")
        }
    }

    if(switchComponent.classList.contains("useLocalStorage"))
    {
        localStorage.setItem(switchId, input.checked)
    }

    if(callback)
    {
        callback(switchId, input.checked)
    }
}

function switchPress(event, switchId)
{
    if(event.button === 0)
    {
        const input = document.getElementById(switchId + "_input")
        const thumb = document.getElementById(switchId + "_thumb")
        const isSwitchChecked = input.checked

        if(!isSwitchChecked)
        {
            thumb.classList.remove("base_switch_thumb_on_uncheck")
            thumb.classList.add("base_switch_thumb_on_check")
        }
        else
        {
            thumb.classList.remove("base_switch_thumb_on_check")
            thumb.classList.add("base_switch_thumb_on_uncheck")
        }

        addEventListener("mouseup", () =>
        {
            setTimeout(function ()
            {
                if(input.checked === isSwitchChecked)
                {
                    switchCancelToggle(switchId)
                }
            }, 0)
        }, {once: true, capture: false})
    }

    return false;
}

function switchCancelToggle(switchId)
{
    const thumb = document.getElementById(switchId + "_thumb")

    thumb.classList.remove("base_switch_thumb_on_check")
    thumb.classList.remove("base_switch_thumb_on_uncheck")
}

window.switchFunctions = {switchToggle, switchPress, switchCancelToggle}