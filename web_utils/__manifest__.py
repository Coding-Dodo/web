# Copyright 2021 codingdodo.com - L'ATTENTION Philippe
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)
{
    "name": "Web utils",
    "summary": """
        Library of functions, classes, to use in Odoo OWL Developpement.
    """,
    "author": "Coding Dodo",
    "website": "https://github.com/Coding-Dodo/web",
    "category": "web",
    "version": "16.0.1.0.0",
    "license": "AGPL-3",
    "depends": ["base", "web"],
    "data": [],
    "qweb": [],
    "assets": {
        "web.assets_backend": [
            "/web_utils/static/src/js/utils.js",
        ],
    },
    "auto_install": False,
    "installable": True,
}
