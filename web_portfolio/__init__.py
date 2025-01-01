from flask import Flask, Blueprint
import os
import web_portfolio.pages.portfolio as portfolio
import web_portfolio.pages.exhibition as exhibition
from web_portfolio import db_handler
from lib.flask_material import flask_material

root_path = os.path.dirname(__file__)
bp = Blueprint("web_portfolio", __name__, static_folder = root_path + "\\static\\", template_folder = root_path + "\\templates\\", url_prefix = '/web_portfolio')

def create_app(config = None):
    app = Flask(__name__)
    flask_material.init(app)

    # Set default config settings
    app.config.from_mapping(DATABASE_PATH = os.path.join(app.instance_path, 'web_portfolio.sqlite'))

    # Try to load config
    app.config.from_pyfile("default_config.py")

    if config is not None:
        app.config.from_object(config)
    elif os.path.exists(os.path.join(app.instance_path, 'config.py')):
        app.config.from_pyfile(os.path.join(app.instance_path, 'config.py'))

    # Create instance folder
    try:
        os.mkdir(app.instance_path)
    except OSError:
        pass

    # Register DB Handler
    db_handler.register(app)

    # Register Blueprints
    app.register_blueprint(bp)
    app.register_blueprint(portfolio.bp)
    app.register_blueprint(exhibition.bp)

    return app
