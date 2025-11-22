import sqlite3
from flask import Flask, redirect, render_template, request
from datetime import datetime

from helpers import apology, login_required, lookup, usd

# Configure application
app = Flask(__name__)

# Connect to DB
#connection = sqlite3.connect("transactions.db")
# db = connection.cursor()


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

# --------------------------------------------------------------------------------------------------
# HOME route
# --------------------------------------------------------------------------------------------------


@app.route("/")
def index():
       
    # Get address from the form
    address = request.args.get("address")

    # If an address has been entered
    if (address):
        # Check address and get results
        results = trace_address(address)
        # return home page with the results
        return render_template("index.html", results=results)
    
    # Else, return the home page with no parameters
    return render_template("index.html")

def trace_address(address):
    # Call API
    