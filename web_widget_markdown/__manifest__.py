# Copyright 2021 codingdodo.com - L'ATTENTION Philippe
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)
{
    "name": "Web widget Markdown",
    "summary": """
        Add support of markdown content into an Odoo widget form.
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
            "/web_widget_markdown/static/src/js/markdown_field.js",
            "/web_widget_markdown/static/src/js/markdown_field.xml",
            "/web_widget_markdown/static/lib/simplemde.min.css",
        ],
        "web.assets_qweb": [
            "/web_widget_markdown/static/src/xml/qweb_template.xml",
        ],
    },
    "external_dependencies": {"python": ["markdown"]},
    "auto_install": False,
    "installable": True,
}
