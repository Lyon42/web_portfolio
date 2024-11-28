from flask import Blueprint, render_template

bp = Blueprint('exhibition', __name__, url_prefix="/exhibition")

@bp.route("/")
def exhibition():
    return render_template("exhibition/exhibition.html")
