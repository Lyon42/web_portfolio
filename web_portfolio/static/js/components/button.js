window.addEventListener("load", buttonInit)

function buttonInit()
{
    const elements = document.getElementsByClassName("base_button")

    for(let i = 0; i < elements.length; i++)
    {
        let keys = elements[i].attributes["keys"]
        let clickCallback = elements[i].onclick

        if(keys && keys.value && clickCallback)
        {
            keys = keys.value.substring(1, keys.value.length-1).replaceAll(/( )|(')/g, "").split(",")

            window.addEventListener("keyup", (event) =>
            {
                if(keys.includes(event.code))
                {
                    clickCallback.apply(elements[i])
                }
            })
        }
    }
}