document.addEventListener("mouseup", (e) =>
{
    const leftSideBar = document.getElementById("left_side_bar")

    if(leftSideBar.classList.contains("modal_navigation_drawer") && !leftSideBar.contains(e.target))
    {
        setModalNavigationDrawer(false)
    }
})

function setModalNavigationDrawer(extended)
{
    const leftSideBar = document.getElementById("left_side_bar")

    if(extended)
    {
        leftSideBar.classList.add("left_side_bar_extended")
    }
    else
    {
        leftSideBar.classList.remove("left_side_bar_extended")
    }
}

function toggleModalNavigationDrawer()
{
    setModalNavigationDrawer(!document.getElementById("left_side_bar").classList.contains("left_side_bar_extended"))
}

function isModalNavigationDrawerExtended()
{
    return document.getElementById("left_side_bar").classList.contains("left_side_bar_extended");
}

window.navigationDrawerFunctions = {setModalNavigationDrawer, toggleModalNavigationBar: toggleModalNavigationDrawer, isModalNavigationDrawerExtended}