import requests
import sqlite3
from flask import Flask, redirect, render_template, request


from helpers import format_amount, get_address_info, get_tx_history, apology, login_required, lookup, usd

# Configure application
app = Flask(__name__)
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
       
    # Get address from the form
    address = request.args.get("address")
    address = ADDRESS
    address_info = None
    error = None
    tx_history = None

    # If an address has been entered
    if address:
        
        # Check address and get results (or return the error message)
        try:
            address_info = get_address_info(address)
            tx_count = address_info["tx_count"]
            total_balance = address_info["conf_balance"] + address_info["pool_io_flow"] 

        except ValueError as e:
            error=str(e)

        # If address info is correctly retrieved, then get transaction history
        if not error:
            try:
                # Confirmed transaction history
                if tx_count > 0:
                    tx_history, final_tx_count, final_balance = get_tx_history(
                        address=address,
                        last_tx_id=None,
                        tx_count=tx_count, 
                        balance=total_balance
                    )
            
            except ValueError as e:
                error=str(e)

    # return home page with the results
    return render_template("index.html", 
                            address_info=address_info,
                            tx_history=tx_history,
                            final_tx_count=final_tx_count,
                            final_balance=final_balance,
                            error=error)

@app.route("/load_next_txs")
def load_next_txs():
    
    address = request.args.get("address")
    address = ADDRESS
    last_txid = request.args.get("last_txid")
    tx_count = int(request.args.get("tx_count"))
    balance = int(request.args.get("balance"))

    try:
        # Get history and initialize transaction count to the oldest transaction already fetched minus 1
        tx_history = get_tx_history(
            address=address,
            last_txid=last_txid,
            tx_count=tx_count,
            balance=balance
        )
    
    except ValueError as e:
        error=str(e)
    
    return tx_history




