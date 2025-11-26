import requests
import sqlite3
from flask import Flask, redirect, render_template, request
from datetime import datetime

from helpers import apology, login_required, lookup, usd

# Configure application
app = Flask(__name__)

API_BASE_URL = "https://blockstream.info/api"

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
    address_info = None
    error = None
    history = None

    # If an address has been entered
    if address:
        
        # Check address and get results (or return the error message)
        try:
            address_info = get_address_info(address)
        except ValueError as e:
            error=str(e)

    if not error:
        try:
            history = get_history(address)
        except ValueError as e:
            error=str(e)

    # return home page with the results
    return render_template("index.html", 
                            address_info=address_info,
                            history=history, 
                            error=error)

def get_address_info(address):
    # Get address info
    address_info_url = f"{API_BASE_URL}/address/{address}"
    error_message = None
    try:
        # Get address info
        response = requests.get(address_info_url)
        # Raise HTTP error in case of bad request 
        response.raise_for_status()
        result = response.json()
    # Catch exceptions
    except requests.RequestException as e:
        raise ValueError(f"Request error: {e}")
    except ValueError as e:
        raise ValueError(f"JSON parsing error: {e}")
    return result

# Get address transaction history
def get_history(address):
    
    # API URL
    txs_history_url = f"{API_BASE_URL}/address/{address}/txs"
    error_message = None
    try:
        # Get history
        response = requests.get(txs_history_url)
        # Raise HTTP error in case of bad request
        response.raise_for_status()
        result = response.json()
    
    except requests.RequestException as e:
        raise ValueError(f"Request Error")
    except ValueError as e:
        raise ValueError(f"JSON parsing error")
    return result