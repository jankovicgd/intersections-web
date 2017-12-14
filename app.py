import os
import psycopg2
import psycopg2.extras
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash, Response, Session, send_file
import json
import csv
from glob import glob
from os.path import expanduser

def create_csv(data, desc):
    """ returns (file_basename, server_path, file_size) """
    file_basename = 'output.csv'
    server_path = ''
    w_file = open(server_path+file_basename,'w')
    w_file.write(','.join(desc)+'\n')

    for row in data:
        row_as_string = str(row)
        w_file.write(row_as_string[1:-1] + '\n') ## row_as_string[1:-1] because row is a tuple

    w_file.close()

    w_file = open(server_path+file_basename,'r')
    file_size = len(w_file.read())
    return file_basename, server_path, file_size

def mainQuery(selection, features, xtentPoly, extent):
    conn = psycopg2.connect(app.config['DATABASE'])
    cur = conn.cursor()

    if xtentPoly == 'polygon':
        cur.execute("SELECT * FROM junctions WHERE ST_Contains(ST_Transform(ST_GeomFromText(%s, 3857), 4326), geom)", (features,))

    elif xtentPoly == 'extent':
        extent = extent.split(",")
        extent = list(map(float, extent))
        cur.execute("SELECT * FROM junctions WHERE ST_Contains(ST_Transform(ST_MakeEnvelope(%s,%s,%s,%s,3857), 4326), geom)", (extent[0],extent[1],extent[2],extent[3],))

    ans = cur.fetchall()
    description = cur.description
    columns = []
    for column in description:
        columns.append(column[0])
    csv1 = create_csv(ans, columns)
    cur.close()
    conn.close()
    return csv1, ans

def statisticQuery(selection, features, xtentPoly, extent):
    conn = psycopg2.connect(app.config['DATABASE'])
    cur = conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor)

    if xtentPoly == 'polygon':
        cur.execute("\
            SELECT num_ways, COUNT(num_ways), round(AVG(delta)::numeric, 2) AS avg_delta, round(AVG(delta_t)::numeric, 2) AS avg_delta_t \
            FROM junctions \
            WHERE ST_Contains(ST_Transform(ST_GeomFromText(%s, 3857), 4326), geom) \
            GROUP BY num_ways \
            ORDER BY num_ways", (features,))

    elif xtentPoly == 'extent':
        extent = extent.split(",")
        extent = list(map(float, extent))
        cur.execute("\
        SELECT num_ways, COUNT(num_ways), round(AVG(delta)::numeric, 2) AS avg_delta, round(AVG(delta_t)::numeric, 2) AS avg_delta_t \
        FROM junctions \
        WHERE ST_Contains(ST_Transform(ST_MakeEnvelope(%s,%s,%s,%s,3857), 4326), geom) \
        GROUP BY num_ways \
        ORDER BY num_ways", (extent[0],extent[1],extent[2],extent[3],))

    ans = cur.fetchall()
    description = cur.description
    columns = []
    for column in description:
        columns.append(column[0])
    cur.close()
    conn.close()
    return ans, columns

def resultCreate(statquery):
    pass

app = Flask(__name__)
#sess = Session()
app.config.from_object('config')

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        selection = request.form['selection']
        features = request.form['features']
        xtentPoly = request.form['xtentpoly']
        extent = request.form['sizeextent']
        print(selection, features, xtentPoly, extent)
        csvfile, results = mainQuery(selection, features, xtentPoly, extent)
        statresults, columns = statisticQuery(selection, features, xtentPoly, extent)
        session['csvfile'] = csvfile
        return render_template("results.html", xtentPoly=xtentPoly, polygon=features, sizeextent=extent, statresults=statresults, columns=columns)
    else:
        return render_template("index.html")

@app.route("/getCSV")
def getCSV():
    csvfile = session.get('csvfile', None)
    print(csvfile[2])
    return send_file(csvfile[0], mimetype='text/csv')
if __name__ == "__main__":
    app.secret_key = app.config['SECRET_KEY']
    app.config['SESSION_TYPE'] = 'filesystem'
    app.debug = app.config['DEBUG']
    app.run()
