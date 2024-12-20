from flask import Blueprint, render_template, request
from web_portfolio.pages.exhibition import exhibition_structure

bp = Blueprint('portfolio', __name__, url_prefix="/")

@bp.route("/")
@bp.route("/edit/")
def portfolio():
    structure = exhibition_structure("portfolio")
    return render_template("portfolio/portfolio.html", structure = structure, edit_mode = "edit" in request.path)
