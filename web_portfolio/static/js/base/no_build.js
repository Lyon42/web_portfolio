document.addEventListener("keypress", function (e)
{
    if(e.code === "KeyB" && e.ctrlKey)
    {
        toggle_edit_mode()
    }
})

function toggle_edit_mode()
{
    let url = window.location.href.replace(/\/+$/, "")
    let edit_mode = url.endsWith("/edit");

    if(edit_mode)
    {
        window.location.href = url.replaceAll("/edit", "")
    }
    else
    {
        window.location.href = url + "/edit"
    }
}