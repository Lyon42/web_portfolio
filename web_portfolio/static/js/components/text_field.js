window.addEventListener("load", () => setTimeout(textFieldInit, 10))

function textFieldInit()
{
    const textFields = document.getElementsByClassName("base_text_field")

    for(let i = 0; i < textFields.length; i++)
    {
        textFieldInput(textFields[i].id)
    }
}

function textFieldInput(textFieldId)
{
    const input = document.getElementById(textFieldId + "_input")
    const label = document.getElementById(textFieldId + "_label")

    if(label)
    {
        if(input.value)
        {
            label.classList.add("base_text_field_label_populated")
        }
        else
        {
            label.classList.remove("base_text_field_label_populated")
        }
    }
}

function textFieldClear(textFieldId)
{
    const input = document.getElementById(textFieldId + "_input")
    input.value = ""
    textFieldInput(textFieldId)
}

window.textFieldFunctions = {textFieldInput, textFieldClear}