import click
from flask import Flask, g, current_app
from flask.cli import with_appcontext
from PIL import Image, ExifTags
import sqlite3
import os, shutil

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE_PATH"], detect_types=sqlite3.PARSE_DECLTYPES)

    return g.db

def close_db(e = None):
    db = g.pop("db", None)

    if db is not None:
        db.close()

def register(app: Flask):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)

@click.command("init-db")
@with_appcontext
def init_db_command():
    click.echo("Clearing old data")
    shutil.rmtree(current_app.static_folder + "\\image\\thumbnail\\")
    click.echo("Successfully cleared old data")

    click.echo("Creating the database")
    create_db()
    click.echo("Successfully created the database")

    click.echo("Indexing Photos")
    index_photos()
    click.echo("Successfully indexed Photos")

def create_db():
    db = get_db()

    with current_app.open_resource("schema.sql") as f:
        db.executescript(f.read().decode("utf8"))

def index_photos(dir_to_search = None):
    if dir_to_search is None:
        dir_to_search = "\\image\\photo\\"

    db = get_db()
    elements = os.listdir(current_app.static_folder + dir_to_search)
    was_dir_created = False

    # Index Photos
    for element in elements:
        cur_element = dir_to_search + element

        if os.path.isdir(current_app.static_folder + cur_element) and cur_element != "temp":
            # Search recursive in sub folder for images
            index_photos(dir_to_search = cur_element + "\\")
        elif os.path.isfile(current_app.static_folder + cur_element):
            # Create directory if not existing
            if not was_dir_created:
                os.makedirs(current_app.static_folder + dir_to_search.replace("\\photo\\", "\\thumbnail\\"))
                was_dir_created = True

            # Collect needed image data
            image = Image.open(current_app.static_folder + cur_element)
            path = cur_element.replace("\\", "/")
            thumbnail_path = path.replace("/photo/", "/thumbnail/")
            aspect_ratio = image.width / image.height
            rotation = 0

            # Invert aspect ratio if rotated by 90° or 270°
            if image.getexif()[ExifTags.Base.Orientation] >= 5:
                aspect_ratio = 1 / aspect_ratio
                rotation = 90 if 6 <= image.getexif()[ExifTags.Base.Orientation] <= 8 else -90

            # Create thumbnail
            max_dimension = max(image.width, image.height)
            new_size = (image.width * current_app.config["MAX_THUMBNAIL_DIMENSIONS"] / max_dimension,
                        image.height * current_app.config["MAX_THUMBNAIL_DIMENSIONS"] / max_dimension)
            image = image.rotate(rotation, expand=True)
            image.thumbnail(new_size, )
            image.save(current_app.static_folder + thumbnail_path, "JPEG", quality=100)

            # Add image to photos database
            db.execute("INSERT INTO photos (path, thumbnail_path, aspect_ratio) VALUES (?,?,?)", (path, thumbnail_path, aspect_ratio))
            db.commit()
