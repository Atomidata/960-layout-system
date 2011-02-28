#!/usr/bin/env python
from flask import Flask
from flask import render_template, redirect, url_for
from flask import request
from flask import Response
from database import db_session
from models import Template
from pygments import highlight
from pygments.lexers import CssLexer, HtmlLexer
from pygments.formatters import HtmlFormatter
import zipfile
import os
import sys
import errno
import uuid
from datetime import datetime

SITE_DOMAIN = '960ls.atomidata.com'

DEFAULT_FLUID_COL_WIDTH = 3.33333
DEFAULT_FLUID_GUT_WIDTH = 1
DEFAULT_FLUID_COL_NUM =  12

DEFAULT_COL_WIDTH = 60
DEFAULT_GUT_WIDTH = 20
DEFAULT_COL_NUM =  12


app = Flask(__name__)


def mkdir_p(path):
    try:
        os.makedirs(path)
    except OSError as exc: # Python >2.5
        if exc.errno == errno.EEXIST:
            pass
        else: raise


@app.route("/")
def index():
    """
    The index view, just renders the index template.
    TODO in reality this is not really necessary, we might as well serve it with nginx
    """
    
    return  render_template('index.html')

@app.route("/960.css")
def css():
    """
    View that generates a non-fluid layout css
    to display the grid the user works with
    on the front page
    """
    
    content = render_template('960.css',
                           column_width = long( request.args.get('column_width', DEFAULT_COL_WIDTH)),
                           gutter_width = long( request.args.get('gutter_width', DEFAULT_GUT_WIDTH)),
                           column_number = long( request.args.get('column_number', DEFAULT_COL_NUM)),
                          )

    return Response(
        response = content,
        mimetype = 'text/css',
        )


@app.route("/960fluid.css")
def fluid_css():
    """
    View that generates a fluid layout css
    to display the grid the user works with
    on the frontpage
    """
    
    content = render_template('960fluid.css',
                           column_width = float( request.args.get('column_width', DEFAULT_FLUID_COL_WIDTH)),
                           gutter_width = float( request.args.get('gutter_width', DEFAULT_FLUID_GUT_WIDTH)),
                           column_number = long( request.args.get('column_number', DEFAULT_FLUID_COL_NUM)),
                          )
    return Response(response = content, mimetype = 'text/css')

@app.route('/saved_templates/<int:template_id>')
def template(template_id):
    """
    The view where we display the result
    in syntax-highlighted HTML and CSS
    """
    
    template  = Template.query.filter(Template.id == long(template_id)).first()
    if not template:
        return "The requested template doesn't exist", 404
    hashtml = len(template.html.strip()) > 0
    
    
        
    cssperma = template.css_url
    
    pygmented_css_link =  highlight('<link rel="stylesheet" type="text/css" href="%s">'%cssperma,
                                    CssLexer(),
                                    HtmlFormatter(style = 'bw',
                                                  linenos = 'table'))
    return render_template('saved_template.html',
                           template = template,
                            pygmented_css_link_code = pygmented_css_link, 

                            pygmented_html_code = highlight(template.html,
                                                            HtmlLexer(),
                                                            HtmlFormatter(style = 'bw',
                                                                          linenos = 'table')), 
                            pygmented_css_code = highlight(template.css,
                                                           CssLexer(),
                                                           HtmlFormatter(style = 'bw',
                                                                         linenos = 'table')), 

                            pygments_style = HtmlFormatter(style = 'bw').get_style_defs('.highlight'),

                            hashtml = hashtml,
                            )
    
def _save_code():
    """
    Generate and save the CSS and HTML code based on the request parameters
    in the database and write the css file that may be served at any time.
    """
    
    if request.form.get('fluid'):
        csscontent = render_template('960fluid.css',
                               column_width = float( request.form.get('column_width', DEFAULT_FLUID_COL_WIDTH)),
                               gutter_width = float( request.form.get('gutter_width', DEFAULT_FLUID_GUT_WIDTH)),
                               column_number = long( request.form.get('column_number', DEFAULT_FLUID_COL_NUM)),
                              )
    else:
        csscontent = render_template('960.css',
                               column_width = long( request.form.get('column_width', DEFAULT_COL_WIDTH)),
                               gutter_width = long( request.form.get('gutter_width', DEFAULT_GUT_WIDTH)),
                               column_number = long( request.form.get('column_number', DEFAULT_COL_NUM)),
                              )

    n = datetime.now()
    root = os.path.dirname(__file__)
    csspath = os.path.join(os.path.join(root, 'static'), 'cssserve')
    csspath = os.path.join(csspath, str(n.year))
    csspath = os.path.join(csspath, str(n.month))
    csspath = os.path.join(csspath, str(n.day))
    
    if not os.path.isdir(csspath):
        mkdir_p(csspath)

    filename = "%s.css"%uuid.uuid4().hex
    
    cssf = open(os.path.join(csspath, filename), 'w')

    cssf.write(csscontent)
    cssf.close()

    cssperma = 'http://%s/static/cssserve/%s/%s'%(SITE_DOMAIN,
                                                      '/'.join([str(n.year), str(n.month), str(n.day)]), filename)
    template = Template(html = unicode(request.form.get('html_code')), css = unicode(csscontent), css_url = cssperma)
    
    db_session.add(template)
    db_session.commit()

    return template.id

@app.route("/zipped/<int:template_id>")
def download_zipped(template_id):
    """
    Packs up generated HTML and CSS given the template id
    into a zipped archive. Writes the archive to disk and
    redirects to it's url so that we can serve it with
    whatever is serving static fles.
    """

    template  = Template.query.filter(Template.id == long(template_id)).first()
    if not template:
        return "The requested template doesn't exist", 404

    root = os.path.dirname(__file__)
    today = datetime.today()
    zippath = os.path.join(os.path.join(os.path.join(os.path.join(os.path.join(root, 'static'), 'zip'), str(today.year) ), str(today.month)) , str(today.day))
    if not os.path.isdir(zippath):
        mkdir_p(zippath)
    zf = zipfile.ZipFile(os.path.join(zippath, "%s.zip"%str(template_id)), "w")
    zf.writestr('index.html', template.html)
    zf.writestr('960.css', template.css)   
    zf.close()
    return redirect(url_for('static', filename = "zip/%s/%s/%s/%s.zip"%( str(today.year), str(today.month), str(today.day), str(template_id))))
    
    

@app.route("/save_code", methods = ['POST'])
def save_code():
    """
    This is the form's POST handler. It will
    generate and save the code based on the
    form parameters and redirect to the appropriate
    view depending on wether the user requested to view the
    code or download a zipped archive of it.
    """
    
    if request.form.get('zip'):
        return redirect(url_for('download_zipped', template_id = _save_code()))
    else:
        return redirect(url_for('template', template_id = _save_code()))

    

    

@app.after_request
def shutdown_session(response):
    db_session.remove()
    return response


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug = True)
