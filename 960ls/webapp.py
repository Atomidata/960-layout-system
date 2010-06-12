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

app = Flask(__name__)

@app.route("/")
def index():
    return  render_template('index.html')

@app.route("/960.css")
def css():

    content = render_template('960.css', column_width = long( request.args.get('column_width', 60)),
                           gutter_width = long( request.args.get('gutter_width', 20)),
                           column_number = long( request.args.get('column_number', 12)),
                          )
    return Response(response = content, mimetype = 'text/css')


@app.route("/960fluid.css")
def fluid_css():

    content = render_template('960fluid.css', column_width = float( request.args.get('column_width', 3.33333)),
                           gutter_width = float( request.args.get('gutter_width', 1)),
                           column_number = long( request.args.get('column_number', 12)),
                          )
    return Response(response = content, mimetype = 'text/css')

@app.route('/saved_templates/<int:template_id>')
def template(template_id):
    
    template  = Template.query.filter(Template.id == long(template_id)).first()
    if not template:
        return "The requested template doesn't exist", 404
    hashtml = len(template.html.strip()) > 0 
    return render_template('saved_template.html', template = template,
                            pygmented_css_link_code = highlight('<link rel="stylesheet" type="text/css" href="http://960ls.atomidata.com/static/cssserve/%s.css">'%str(template.id), CssLexer(), HtmlFormatter(style = 'bw', linenos = 'table')), 
                            pygmented_html_code = highlight(template.html, HtmlLexer(), HtmlFormatter(style = 'bw', linenos = 'table')), 
                            pygmented_css_code = highlight(template.css, CssLexer(), HtmlFormatter(style = 'bw', linenos = 'table')), 
                            pygments_style = HtmlFormatter(style = 'bw').get_style_defs('.highlight'),
                            hashtml = hashtml,
                            )
    
def _save_code():
    if request.form.get('fluid'):
        csscontent = render_template('960fluid.css', column_width = float( request.form.get('column_width', 3.33333)),
                               gutter_width = float( request.form.get('gutter_width', 1)),
                               column_number = long( request.form.get('column_number', 12)),
                              )
    else:
        csscontent = render_template('960.css', column_width = long( request.form.get('column_width', 60)),
                               gutter_width = long( request.form.get('gutter_width', 20)),
                               column_number = long( request.form.get('column_number', 12)),
                              )
    
    
    
    template = Template(html = unicode(request.form.get('html_code')), css = unicode(csscontent))
    root = os.path.dirname(__file__)
    
    db_session.add(template)
    db_session.commit()
    csspath = os.path.join(os.path.join(root, 'static'), 'cssserve')
    cssf = open(os.path.join(csspath, "%s.css"%str(template.id)), 'w')
    cssf.write(csscontent)
    cssf.close()
    return template.id

@app.route("/zipped/<int:template_id>")
def download_zipped(template_id):
    template  = Template.query.filter(Template.id == long(template_id)).first()
    if not template:
        return "The requested template doesn't exist", 404

    root = os.path.dirname(__file__)
    zippath = os.path.join(os.path.join(root, 'static'), 'zip')
    if not os.path.isdir(zippath):
        os.mkdir(zippath)
    zf = zipfile.ZipFile(os.path.join(zippath, "%s.zip"%str(template_id)), "w")
    zf.writestr('index.html', template.html)
    zf.writestr('960.css', template.css)   
    zf.close()
    return redirect(url_for('static', filename = "zip/%s.zip"%str(template_id) ))
    
    

@app.route("/save_code", methods = ['POST'])
def save_code():
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
