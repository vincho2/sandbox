import requests
import sqlite3
from flask import Flask, redirect, render_template, request, jsonify, send_from_directory


from helpers import format_amount, get_address_info, get_tx_history, apology, login_required, lookup, usd

# Configure application
app = Flask(__name__, static_folder="static", static_url_path="")
app.jinja_env.globals.update(format_amount=format_amount)

ADDRESS = "bc1pmzlcd8sce4e7lvwr6thh6qwcvvmp0v5wg5n69p3ajndmqe8rvdlqc6skjq"
ADDRESS2 = "16w7QP8hq8AXrTJ5QUyoJEQxZLonzEj1pT"

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
    
    # return home page with the results
    return app.send_static_file("index.html")

# --------------------------------------------------------------------------------------------------
# First address search route
# --------------------------------------------------------------------------------------------------
@app.route("/api/address/<address>/txs/initial")
def load_initial_txs(address):

    # Check that url is correctly typed
    if not address:
        return jsonify({"error": "Address is required"}), 400
    
    # Initialize data
    address_info = None
    error = None
    tx_history = None
    last_tx_id = None
 
    # Check address and get results (or return the error message)
    try:
        address_info = get_address_info(address)
        tx_count = address_info["tx_count"]
        total_balance = address_info["conf_balance"] + address_info["pool_io_flow"] 

    except ValueError as e:
        error=str(e)

    # If address info is correctly retrieved, then get transaction history
    if not error and tx_count > 0:
        try:
            tx_history = get_tx_history(
                address=address,
                last_tx_id=None,
                tx_count=tx_count, 
                balance=total_balance
            )

            # Get last Transaction id
            last_tx_id = tx_history[-1]["tx_id"]
        
        except KeyError as e:
            error=(f"Missing transaction id in JSON: {e})")
    
        except ValueError as e:
            error=str(e)

    
    # return initial transactions results
    return jsonify({
        "address_info": address_info,
        "tx_history": tx_history,
        "last_tx_id": last_tx_id,
        "error": error
    })


# --------------------------------------------------------------------------------------------------
# Next transaction route
# --------------------------------------------------------------------------------------------------
@app.route("/api/address/<address>/txs/chain/")
def load_next_txs(address):

    # Check that url is correctly typed
    if not address:
        return jsonify({"error": "Address is required"}), 400
    
    # Get arguments
    last_tx_id = request.args.get("last_tx_id")    
    last_tx_count = int(request.args.get("last_tx_count"))
    last_balance = int(request.args.get("last_balance"))

    try:
        # Get history and initialize transaction count to the oldest transaction already fetched minus 1
        tx_history = get_tx_history(
            address=address,
            last_tx_id=last_tx_id,
            tx_count=last_tx_count - 1,
            balance=last_balance
        )
    
    except ValueError as e:
        error=str(e)
    
    return jsonify({
        "tx_history": tx_history,
        "error": error})