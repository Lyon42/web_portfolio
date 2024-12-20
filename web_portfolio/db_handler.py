import click
from flask import Flask, g, current_app
from PIL import Image, ExifTags
import sqlite3
import os, shutil, json
from typing import Optional, Any

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
    app.cli.add_command(init_db)
    app.cli.add_command(index_photos)
    app.cli.add_command(clear_indexed_photos)

@click.command("init-db")
def init_db():
    click.echo("Creating Database")
    db = get_db()

    if not len(db.execute("SELECT name FROM sqlite_master").fetchall()) == 0:
        click.echo("Database could not be created, as it already exists and is not empty", err=True)
        return

    with current_app.open_resource("schema.sql") as f:
        db.executescript(f.read().decode("utf8"))

    click.echo("Successfully created Database")

@click.command("index-photos")
@click.pass_context
def index_photos(ctx):
    ctx.invoke(clear_indexed_photos)

    click.echo("Indexing Photos")
    index_photos_in()
    click.echo("Successfully Indexed Photos")

@click.command("clear-photos")
def clear_indexed_photos():
    click.echo("Clearing indexed photos")
    # Clear thumbnail folder
    if os.path.exists(current_app.static_folder + "\\image\\thumbnail\\"):
        shutil.rmtree(current_app.static_folder + "\\image\\thumbnail\\")

    # Clear photos table
    db = get_db()
    db.execute("DELETE FROM photos")
    db.commit()

    click.echo("Successfully cleared indexed photos")

def index_photos_in(dir_to_search = None):
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
            index_photos_in(dir_to_search = cur_element + "\\")
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

    click.echo(f"\tIndexed Photos in {dir_to_search}")

def add_exhibition(name: str, visible: bool = False, structure: str = None):
    name = name.lower().replace(" ", "_")
    structure = structure if structure is not None else "[]"

    if not name.replace("_", "").isalpha():
        raise Exception("Exhibition name must be alphanumeric!")

    db = get_db()
    db.execute("INSERT INTO exhibitions (name, visible, structure) VALUES (?,?,?)", (name, visible, structure))
    db.commit()

def get_exhibition_structure(name: str) -> Any:
    db = get_db()
    result = db.execute("SELECT structure FROM exhibitions WHERE name = ?", (name,))

    if result.rowcount == 0:
        raise Exception(f"Exhibition with name '{name}' does not exist!")
    elif result.rowcount > 1:
        raise Exception(f"Multiple exhibitions with name '{name}' exist!")

    return json.loads(result.fetchone()[0])

def set_exhibition_structure(name: str, structure: Optional[json] = None):
    structure = json.dumps(structure) if structure is not None else "[]"

    db = get_db()
    db.execute("UPDATE exhibitions SET structure = ? WHERE name = ?", (structure, name))
    db.commit()
