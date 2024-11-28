window.addEventListener("load", () => window.setTimeout(init, 0))
window.addEventListener("resize", on_resize)

const CONTENT = document.getElementById("content")
const TOP_BAR = document.getElementById("top_bar")

const PHOTO_CONTAINER = document.getElementById("photo_container")
const PHOTO_ROWS = Array.from(document.getElementsByClassName("photo_row"))
const PHOTOS = Array.from(document.getElementsByClassName("photo"))

const ASPECT_RATIOS = []
let MAX_ROW_ASPECT_RATIO = 3
let MAX_PHOTO_HEIGHT = parseFloat(getComputedStyle(document.body).getPropertyValue("--max-photo-height"))
let PHOTO_SPACING = parseFloat(getComputedStyle(document.body).getPropertyValue("--photo-spacing"))

function init()
{
    PHOTOS.forEach((p) => ASPECT_RATIOS.push(parseFloat(p.style.aspectRatio)))
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
    MAX_ROW_ASPECT_RATIO = 1.75 * (CONTENT.clientWidth / CONTENT.clientHeight)
    MAX_PHOTO_HEIGHT = 0.85 * (CONTENT.clientHeight - TOP_BAR.clientHeight)

    // Update CSS variables
    document.body.style.setProperty("--max-photo-height", MAX_PHOTO_HEIGHT)
}

function update_photo_grid()
{
    let photo_index = 0
    let row_values = []

    // Assign photos to rows and store row aspect ratio and number of photos in each row
    for(let i = 0; i < PHOTO_ROWS.length; i++)
    {
        let row = PHOTO_ROWS[i]
        let num_of_photos_in_row = 0
        let column_template = ""
        let row_aspect_ratio = 0.0

        while(((row_aspect_ratio + ASPECT_RATIOS[photo_index]) < MAX_ROW_ASPECT_RATIO || num_of_photos_in_row === 0) && photo_index < PHOTOS.length)
        {
            row.appendChild(PHOTOS[photo_index])
            column_template += ASPECT_RATIOS[photo_index] + "fr "
            row_aspect_ratio += ASPECT_RATIOS[photo_index]
            photo_index++
            num_of_photos_in_row++
        }

        row_values.push({"row": row, "num_of_photos_in_row": num_of_photos_in_row, "column_template": column_template, "row_aspect_ratio": row_aspect_ratio})
    }

    // Calculate and set photo container width
    let min_row_width = CONTENT.clientWidth

    for(let r of row_values)
    {
        if(r["num_of_photos_in_row"] > 0)
        {
            min_row_width = Math.min(min_row_width, MAX_PHOTO_HEIGHT * r["row_aspect_ratio"] + (r["num_of_photos_in_row"] + 1) * PHOTO_SPACING)
        }
    }

    PHOTO_CONTAINER.style.width = min_row_width + "px"
    PHOTO_CONTAINER.style.left = (CONTENT.clientWidth - min_row_width) / 2 + "px"

    // Update visibility, gird template and height of each row
    for(let r of row_values)
    {
        r["row"].style.display = r["num_of_photos_in_row"] > 0 ? "grid" : "none"
        r["row"].style.gridTemplateColumns = r["num_of_photos_in_row"] > 1 ? r["column_template"] : "1fr"
        r["row"].style.height = (r["row"].clientWidth - (r["num_of_photos_in_row"] - 1) * PHOTO_SPACING) / r["row_aspect_ratio"] + "px"
    }
}