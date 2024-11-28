from flask import Flask
import web_portfolio.pages.portfolio as portfolio
import web_portfolio.pages.exhibition as exhibition
from web_portfolio.util import custom_template_functions
from web_portfolio import db_handler
import os

def create_app(config = None):
    app = Flask(__name__)

    # Set default config settings
    app.config.from_mapping(DATABASE_PATH = os.path.join(app.instance_path, 'web_portfolio.sqlite'))

    # Try to load config
    if config is None:
        app.config.from_pyfile("default_config.py", silent = True)
    else:
        app.config.from_mapping(config)

    # Create instance folder
    try:
        os.mkdir(app.instance_path)
    except OSError:
        pass

    # Load Jinja extensions
    app.jinja_env.add_extension('jinja2.ext.do')

    # Register context processors
    custom_template_functions.register_functions(app)

    # Register DB Handler
    db_handler.register(app)

    # Register Blueprints
    app.register_blueprint(portfolio.bp)
    app.register_blueprint(exhibition.bp)

    return app
