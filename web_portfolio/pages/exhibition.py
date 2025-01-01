import sqlite3

from flask import Blueprint, render_template
from typing import List, Any
import web_portfolio.db_handler as db_handler

HORIZONTAL_ALIGN_MAP = {"left": "flex-start", "center": "center", "right": "flex-end"}
VERTICAL_ALIGN_MAP = {"top": "flex-start", "center": "center", "bottom": "flex-end"}
TEXT_ALIGN_MAP = {"left": "left", "center": "center", "right": "right", "justify": "justify"}

bp = Blueprint('exhibition', __name__, url_prefix="/exhibition")


@bp.route("/")
def exhibition():
    return render_template("web_portfolio/exhibition/exhibition.html")


def exhibition_structure(name: str) -> List[Any]:
    db = db_handler.get_db()
    db.row_factory = sqlite3.Row
    structure = db_handler.get_exhibition_structure(name)

    # Check if json has a list at the top level
    if not isinstance(structure, list):
        raise Exception(f"Exhibition '{name}' doesn't have a list at the top level!")

    result = []
    i = 0
    for e in structure:
        # Check whether the list element is a dict, has a valid type and a priority
        if not isinstance(e, dict):
            raise Exception(f"Element {i} of exhibition '{name}' isn't a dict!")
        elif "type" not in e:
            raise Exception(f"Element {i} of exhibition '{name}' doesn't have a 'type' key!")
        elif e["type"] not in ["photo", "spacer", "text"]:
            raise Exception(f"Element {i} of exhibition '{name}' does not a valid type!")
        elif "order" not in e:
            raise Exception(f"Element {i} of exhibition '{name}' doesn't have a order!")

        elem = {"type": e["type"], "order": e["order"], "line_break_behavior": "auto"}

        # Try to get the line break behavior
        if "line_break_behavior" in e and e["line_break_behavior"] in ["break", "no_break"]:
            elem["line_break_behavior"] = e["line_break_behavior"]

        # Handle the different types
        if e["type"] == "photo":
            # Check whether the photo element has a path
            if "path" not in e:
                raise Exception(f"Element {i} of exhibition '{name}' is a photo, but doesn't have a path!")

            photo_data = db.execute("SELECT thumbnail_path, aspect_ratio FROM photos WHERE path = ?", (e["path"],))

            if photo_data.rowcount == 0:
                raise Exception(f"Element {i} of exhibition '{name}', but no photo with path '{e['path']}' exists!")
            elif photo_data.rowcount > 1:
                raise Exception(f"Element {i} of exhibition '{name}', but multiple photos with path '{e['path']}' exist!")

            elem |= photo_data.fetchone()
        elif e["type"] == "spacer":
            if "aspect_ratio" in e and e["aspect_ratio"] != "fill" and not isinstance(e["aspect_ratio"], (float, int, list)):
                raise Exception(f"Element {i} of exhibition '{name}' is a spacer with invalid aspect ratio!")

            elem["aspect_ratio"] = e["aspect_ratio"] if "aspect_ratio" in e else "fill"
        elif e["type"] == "text":
            # Check whether the text element has text and aspect ratio
            if "text" not in e:
                raise Exception(f"Element {i} of exhibition '{name}' is a text element, but doesn't have a text!")
            elif "aspect_ratio" not in e or not (isinstance(e["aspect_ratio"], (float, int, list)) or e["aspect_ratio"] == "fill"):
                raise Exception(f"Element {i} of exhibition '{name}' is a text element, but doesn't have a valid aspect ratio!")
            elif "horizontal_align" in e and e["horizontal_align"] not in HORIZONTAL_ALIGN_MAP:
                raise Exception(f"Element {i} of exhibition '{name}' is a text element, but has an invalid horizontal alignment!")
            elif "vertical_align" in e and e["vertical_align"] not in VERTICAL_ALIGN_MAP:
                raise Exception(f"Element {i} of exhibition '{name}' is a text element, but has an invalid vertical alignment!")
            elif "text_align" in e and e["text_align"] not in TEXT_ALIGN_MAP:
                raise Exception(f"Element {i} of exhibition '{name}' is a text element, but has an invalid text alignment!")

            elem |= {"text": str(e["text"]), "aspect_ratio": e["aspect_ratio"], "horizontal_align": HORIZONTAL_ALIGN_MAP[e.get("horizontal_align", "center")],
                     "vertical_align": VERTICAL_ALIGN_MAP[e.get("vertical_align", "center")], "text_align": TEXT_ALIGN_MAP[e.get("text_align", "center")]}

        # Create tuple from single values
        if isinstance(elem["aspect_ratio"], (float, int)):
            elem["aspect_ratio"] = [elem["aspect_ratio"], elem["aspect_ratio"]]

        if isinstance(elem["aspect_ratio"], list):
            elem["aspect_ratio"] = str(tuple(elem["aspect_ratio"]))

        result.append(elem)
        i += 1

    result.sort(key = lambda e: e["order"])
    return result
