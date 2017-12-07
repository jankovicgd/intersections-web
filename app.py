import os
import psycopg2
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash

app=Flask(__name__)
app.config.from_object('config')

def mainquery(selection, features, xtentPoly, extent):
    conn = psycopg2.connect(app.config['DATABASE'])
    cur = conn.cursor()

    if xtentPoly == 'polygon':
        cur.execute("SELECT * FROM junctions WHERE ST_Contains(ST_Transform(ST_GeomFromText(%s, 3857), 4326), geom)", (features,))

    elif xtentPoly == 'extent':
        extent = extent.split(",")
        extent = list(map(float, extent))
        cur.execute("SELECT * FROM junctions WHERE ST_Contains(ST_Transform(ST_MakeEnvelope(%s,%s,%s,%s,3857), 4326), geom)", (extent[0],extent[1],extent[2],extent[3],))

    results = cur.fetchall()
    conn.close()
    return results

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        selection = request.form['selection']
        features = request.form['features']
        xtentPoly = request.form['xtentpoly']
        extent = request.form['sizeextent']
        print(selection, features, xtentPoly, extent)
        results = mainquery(selection, features, xtentPoly, extent)
        return render_template("results.html", results=json.dumps(results))
    else:
        return render_template("index.html")



if __name__ == "__main__":
    app.run(debug=True)
