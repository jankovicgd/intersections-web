from flask import Flask, render_template, request, g
import psycopg2
import json
import re
from dbinfo import DATABASE

def mainquery(selection, features, xtentPoly, extent):
    conn = psycopg2.connect(DATABASE)
    cur = conn.cursor()
    # TODO Fix for SQL injection, sanitize


    cur.execute("SELECT * FROM junctions WHERE ST_Contains(ST_Transform(ST_GeomFromText(%s, 3857), 4326), geom)", (features,))
    results = cur.fetchall()
    print(results)
    conn.close()
    return results

app=Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        selection = request.form['selection']
        features = request.form['features']
        xtentPoly = request.form['xtentpoly']
        extent = request.form['extent']
        print(selection, features, xtentPoly, extent)
        results = mainquery(selection, features, xtentPoly, extent)
        print(results)
        return render_template("results.html")
    else:
        return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
