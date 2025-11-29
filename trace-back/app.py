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
    address = "16w7QP8hq8AXrTJ5QUyoJEQxZLonzEj1pT"
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

        # If address info is correctly retrieved, then get transaction history
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


# --------------------------------------------------------------------------------------------------
# Get address information (Balance and number of transactions)
# --------------------------------------------------------------------------------------------------
def get_address_info(address):
    # Get address info
    address_info_url = f"{API_BASE_URL}/address/{address}"
    error_message = None
    try:
        # Get address info
        response = requests.get(address_info_url)
        # Raise HTTP error in case of bad request 
        response.raise_for_status()

        # Get raw result JSON
        raw_result = response.json()

        # Get confirmed balance and number of transactions
        chain_stats = raw_result["chain_stats"]
        # Get unconfirmed in/out flows and of unconfirmed transactions
        mem_pool_stats = raw_result["mempool_stats"]

        # Build the resulting dictionary
        result = {
            "conf_balance": chain_stats["funded_txo_sum"] - chain_stats["spent_txo_sum"],
            "conf_tx_count": chain_stats["tx_count"],
            "pool_tx_count": mem_pool_stats["tx_count"],
            "pool_io_flow": mem_pool_stats["funded_txo_sum"] - mem_pool_stats["spent_txo_sum"],
        }

    # Catch exceptions
    except requests.RequestException as e:
        raise ValueError(f"Request error: {e}")
    except KeyError as e:
        raise ValueError(f"Missing expected field in JSON: {e}")
    except ValueError as e:
        raise ValueError(f"JSON parsing error: {e}")
    
    # Return result if no exception raised
    return result

# --------------------------------------------------------------------------------------------------
# Get address transaction history
# --------------------------------------------------------------------------------------------------
def get_history(address):
    
    # API URL
    txs_history_url = f"{API_BASE_URL}/address/{address}/txs"
    error_message = None
    try:
        # Get history
        response = requests.get(txs_history_url)
        # Raise HTTP error in case of bad request
        response.raise_for_status()
        raw_result = response.json()
        
        # Initialize resulting list
        result = []

        i = 0
        # Get transactions info and add them to the resulting dictionary
        for tx in raw_result:
            
            # Increment transaction number
            i += 1
            print(f"tx : {i}")

            # Get tansaction data
            tx_id = tx["txid"]

            # Get transaction block info
            block_info = tx["status"]
            block_nb = block_info["block_height"]
            block_time_raw = block_info["block_time"]
            block_confirmed = block_info["confirmed"]
            
            # Get transaction source data
            source_data = tx["vin"]

            # Initialize paid amount
            paid_amount = 0
            
            # Loop on each source transaction and update paid amount when the  source address is the input address 
            for in_tx in source_data:
                previous_output = in_tx["prevout"]
                source_address = previous_output["scriptpubkey_address"]
                if source_address == address:
                    paid_amount += previous_output["value"]
            
            # Get transaction destination data
            destination_data = tx["vout"]

            # Initialize received amount
            received_amount = 0
            
            # Loop on each source transaction and update paid amount when the  source address is the input address 
            for out_data in destination_data:
                destination_address = out_data["scriptpubkey_address"]
                if destination_address == address:
                    received_amount += out_data["value"]

            flow_amount = received_amount - paid_amount
            flow_direction = "receive" if flow_amount > 0 else "pay"
            
            # Build the resulting dictionary
            result = {
                "block_nb": block_info["block_height"],
                "block_time_raw": block_info["block_time"],
                "block_confirmed": block_info["confirmed"],
                "flow_direction": flow_direction,
                "flow_anount": flow_amount,
            }

    # Catch exceptions
    except requests.RequestException as e:
        raise ValueError(f"Request Error: {e}")
    except KeyError as e:
        raise ValueError(f"Missing expected field in JSON: {e}")
    except ValueError as e:
        raise ValueError(f"JSON parsing error: {e}")
    
    # Return result
    return result