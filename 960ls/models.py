from sqlalchemy import Column, Integer, String, UnicodeText
from database import Base, init_db

class Template(Base):
    __tablename__ = 'templates'
    id = Column(Integer, primary_key=True)
    html = Column(UnicodeText())
    css = Column(UnicodeText())

    def __init__(self, html = None, css = None):
        self.html = html
        self.css = css

    def __repr__(self):
        return '<Template %s>' % (str(self.id))
        def init_db():
            Base.metadata.create_all(bind=engine)



if __name__ == '__main__':
    init_db()