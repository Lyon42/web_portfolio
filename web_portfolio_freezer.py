from web_portfolio import create_app
from flask_frozen import Freezer
import web_portfolio.default_config as config
from shutil import rmtree

config.BUILD_MODE = True
app = create_app(config)
freezer = Freezer(app, True, False, False)

@freezer.register_generator
def register_urls():
    yield "/"
    yield "/exhibition/"

if __name__ == '__main__':
    freezer.freeze()
