from flask import Blueprint, render_template
import web_portfolio.db_handler as db_handler
from math import ceil

bp = Blueprint('portfolio', __name__, url_prefix="/")
COLUMN_NUM = 3

@bp.route("/")
def portfolio():
    db = db_handler.get_db()
    photos = db.execute('SELECT thumbnail_path, aspect_ratio FROM photos').fetchall()
    rows = []

    """
    for i in range(ceil(len(photos)/COLUMN_NUM)):
        photos_in_row = photos[i*COLUMN_NUM:min((i+1)*COLUMN_NUM, len(photos))]
        aspect_ratios = [p[1] for p in photos_in_row]
        paths = [p[0] for p in photos_in_row]
        rows.append([aspect_ratios, paths])
    """

    return render_template("portfolio/portfolio.html", photos=photos)
