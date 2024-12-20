window.addEventListener("load", () => window.setTimeout(init, 0))
window.addEventListener("resize", on_resize)

const DOC_ELEMENT = document.documentElement
const TOP_BAR = document.getElementById("top_bar")

const PHOTO_CONTAINER = document.getElementById("photo_container")
const PHOTO_ROWS = Array.from(document.getElementsByClassName("photo_row"))
let PHOTO_ELEMENTS = []

let MAX_ROW_ASPECT_RATIO = 3
let MAX_PHOTO_HEIGHT = parseFloat(getComputedStyle(document.body).getPropertyValue("--max-photo-height"))
let PHOTO_SPACING = parseFloat(getComputedStyle(document.body).getPropertyValue("--photo-spacing"))

function init()
{
    let elements = Array.from(document.getElementsByClassName("photo_element"))
    PHOTO_ELEMENTS = elements.map((e) => {return {"element": e,
                                                                "type": e.getAttribute("type"),
                                                                "aspect_ratio": parse_aspect_ratio(e.getAttribute("aspect_ratio")),
                                                                "line_break_behavior": e.getAttribute("line-break-behavior")}})

    on_resize()
}

function on_resize()
{
    update_variables()
    update_photo_grid()
}

function update_variables()
{
    // Update JS variables
    MAX_ROW_ASPECT_RATIO = Math.min(1.75 * (DOC_ELEMENT.clientWidth / DOC_ELEMENT.clientHeight), 10)
    MAX_PHOTO_HEIGHT = 0.9 * (DOC_ELEMENT.clientHeight - TOP_BAR.clientHeight)

    // Update CSS variables
    document.body.style.setProperty("--max-photo-height", MAX_PHOTO_HEIGHT)
}

function update_photo_grid()
{
    let index = 0
    let row_values = []
    let min_max_row_width = DOC_ELEMENT.clientWidth

    // Assign photos to rows and store row aspect ratio and number of photos in each row
    for(let row of PHOTO_ROWS)
    {
        let num_of_non_spacer = 0
        let row_aspect_ratio = [0.0, 0.0]
        let aspect_ratios = []
        let collapse_row_vert = true

        while(index < PHOTO_ELEMENTS.length && (num_of_non_spacer === 0 || (row_aspect_ratio[0] + PHOTO_ELEMENTS[index]["aspect_ratio"][0]) < MAX_ROW_ASPECT_RATIO))
        {
            row_aspect_ratio[0] += PHOTO_ELEMENTS[index]["aspect_ratio"][0]
            row_aspect_ratio[1] += PHOTO_ELEMENTS[index]["aspect_ratio"][1]

            if(PHOTO_ELEMENTS[index]["type"] !== "spacer") 
            {
                PHOTO_ELEMENTS[index]["element"].style.marginLeft = num_of_non_spacer > 0 ? (PHOTO_SPACING + "px") : "0"
                num_of_non_spacer++
            }
            else
            {
                PHOTO_ELEMENTS[index]["element"].style.marginLeft = "0"
            }

            row.appendChild(PHOTO_ELEMENTS[index]["element"])
            aspect_ratios.push(PHOTO_ELEMENTS[index]["aspect_ratio"])
            collapse_row_vert &= PHOTO_ELEMENTS[index]["type"] !== "photo"
            index++

            if(PHOTO_ELEMENTS[index-1]["line_break_behavior"] === "break")
            {
                break
            }
        }

        // Calculate photo container width
        if(num_of_non_spacer > 0 && row_aspect_ratio[1] < Infinity)
        {
            min_max_row_width = Math.min(min_max_row_width, MAX_PHOTO_HEIGHT * row_aspect_ratio[1] + (num_of_non_spacer + 1) * PHOTO_SPACING)
        }

        row_values.push({"row": row, "num_of_non_spacer": num_of_non_spacer, "aspect_ratios": aspect_ratios, "row_aspect_ratio": row_aspect_ratio,
                         "collapse_row_vert": collapse_row_vert})
    }

    PHOTO_CONTAINER.style.width = min_max_row_width + "px"

    // Update visibility, gird template and height of each row
    for(let r of row_values)
    {
        let row_width_without_spacing = min_max_row_width - (r["num_of_non_spacer"] + 1) * PHOTO_SPACING
        let ideal_row_aspect_ratio = row_width_without_spacing / MAX_PHOTO_HEIGHT
        let actual_row_aspect_ratio = clamp(ideal_row_aspect_ratio, r["row_aspect_ratio"][0], r["row_aspect_ratio"][1])
        let row_height = Math.min(row_width_without_spacing / actual_row_aspect_ratio, MAX_PHOTO_HEIGHT)

        r["row"].style.display = r["num_of_non_spacer"] > 0 ? "grid" : "none"
        r["row"].style.height = !r["collapse_row_vert"] ? (row_height + "px") : "fit-content"

        // Distribute free space over all elements by water filling
        let [aspect_ratios, ] = water_fill(r["aspect_ratios"], actual_row_aspect_ratio)

        // Convert from aspect ratios to width in pixels
        r["row"].style.gridTemplateColumns = aspect_ratios.map(function (a, index)
        {
            return a * row_height + parseFloat(r["row"].children[index].style.marginLeft)
        }).join("px ") + "px"
    }
}

function parse_aspect_ratio(aspect_ratio)
{
    if(aspect_ratio === "fill")
    {
        return [0.0, Infinity]
    }

    return aspect_ratio.replaceAll(/[()]/g, "").split(",").map(parseFloat)
}

function water_fill(limits, volume)
{
    let leftover_volume = volume
    let levels = Array(limits.length).fill(0.0)

    if(volume > 0.0 && levels.length > 0)
    {
        let current_level = Number.MAX_VALUE
        let num_full = 0

        limits.map(function(limit) {
            current_level = Math.min(current_level, limit[0])
        })

        while(leftover_volume > 0.001 && num_full < levels.length)
        {
            leftover_volume = volume
            num_full = 0

            levels = levels.map(function (level, index)
            {
                level = clamp(current_level, limits[index][0], limits[index][1])
                leftover_volume -= level

                if(level >= limits[index][1])
                {
                    num_full++
                }

                return level
            })

            current_level += leftover_volume / (levels.length - num_full)
        }
    }

    return [levels, leftover_volume]
}

function clamp(number, lower_limit, upper_limit)
{
    return Math.max(Math.min(number, upper_limit), lower_limit)
}