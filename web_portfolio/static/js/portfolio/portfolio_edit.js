const ADD_ELEMENT_BUTTON = document.getElementById("add_element_button")
const ADD_ELEMENT_DIALOG = document.getElementById("add_element_dialog")
const ADD_ELEMENT_DIALOG_WRAPPER = document.getElementById("add_element_dialog_wrapper")

window.addEventListener("click", on_click)

function on_click(event)
{
    if(!ADD_ELEMENT_DIALOG.contains(event.target) && !ADD_ELEMENT_BUTTON.contains(event.target))
    {
        ADD_ELEMENT_DIALOG_WRAPPER.style.display = "none"
    }
}