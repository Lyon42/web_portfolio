const DOC_ELEMENT = document.documentElement
const NAVIGATION_ELEMENTS = document.getElementById("navigation_elements")
const NAVIGATION_SPACER = document.getElementById("navigation_spacer")
const MENU_ICON = document.getElementById("menu_icon")
let MENU_CLOSE_TIMEOUT_ID

window.addEventListener("load", () => window.setTimeout(update_top_bar, 0))
window.addEventListener("resize", update_top_bar)
document.addEventListener("scroll", hide_menu)

MENU_ICON.addEventListener("mouseenter", update_menu)
MENU_ICON.addEventListener("click", update_menu)
MENU_ICON.addEventListener("mouseleave", update_menu)
NAVIGATION_ELEMENTS.addEventListener("mouseenter", update_menu)
NAVIGATION_ELEMENTS.addEventListener("mouseleave", update_menu)

function update_top_bar()
{
    NAVIGATION_ELEMENTS.classList.remove("menu_collapsed")
    NAVIGATION_ELEMENTS.classList.remove("menu_collapsed_full")
    NAVIGATION_ELEMENTS.classList.add("menu")
    MENU_ICON.style.display = ""

    let aspect_ratio = DOC_ELEMENT.clientWidth / DOC_ELEMENT.clientHeight
    let collapse = parseFloat(getComputedStyle(NAVIGATION_SPACER).marginLeft) < 25 || aspect_ratio < 1
    MENU_ICON.style.display = collapse ? "block" : ""

    if(collapse)
    {
        NAVIGATION_ELEMENTS.classList.remove("menu")
        NAVIGATION_ELEMENTS.classList.add(aspect_ratio < 0.8 ? "menu_collapsed_full" : "menu_collapsed")
    }
    else
    {
        NAVIGATION_ELEMENTS.classList.remove("menu_active")
        NAVIGATION_ELEMENTS.style.transition = ""
    }
}

function update_menu(e)
{
    if(e.type === "mouseenter" || e.type === "click")
    {
        NAVIGATION_ELEMENTS.classList.add("menu_active")
        NAVIGATION_ELEMENTS.style.transition = "var(--animation-time-hover) transform"

        if(MENU_CLOSE_TIMEOUT_ID)
        {
            window.clearTimeout(MENU_CLOSE_TIMEOUT_ID)
            MENU_CLOSE_TIMEOUT_ID = null
        }
    }
    else if(e.type === "mouseleave" && e.relatedTarget !== NAVIGATION_ELEMENTS && e.relatedTarget !== MENU_ICON)
    {
        MENU_CLOSE_TIMEOUT_ID = window.setTimeout(() => NAVIGATION_ELEMENTS.classList.remove("menu_active"), 100)
    }
}

function hide_menu(e)
{
    NAVIGATION_ELEMENTS.classList.remove("menu_active")
}