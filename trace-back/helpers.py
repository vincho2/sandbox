import requests

from flask import redirect, render_template, session
from functools import wraps
from datetime import datetime

API_BASE_URL = "https://blockstream.info/api"
POOL = "mempool"
CONFIRMED = "confirmed"

# --------------------------------------------------------------------------------------------------
# Convert Nb to BTC and sats
# --------------------------------------------------------------------------------------------------
def format_amount(amount):
    """Format value as satoshis and BTC."""
    amount_btc = amount / 100_000_000
    return f"{amount:,} sats ({amount_btc:,.8f} BTC)"

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
            "address_id": address,
            "conf_balance": chain_stats["funded_txo_sum"] - chain_stats["spent_txo_sum"],
            "tx_count": chain_stats["tx_count"],
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
# Get address confirmed transaction history and update balance decrementally
# --------------------------------------------------------------------------------------------------
def get_tx_history(address, last_tx_id, tx_count, balance):
    
    # Set suffix to call the proper api url in case the function is called after scrolling
    url_suffix = f"/chain/{last_tx_id}" if last_tx_id != -1 else "" 

    # API URL
    txs_history_url = f"{API_BASE_URL}/address/{address}/txs{url_suffix}"

    try:
        # Get history
        response = requests.get(txs_history_url)
        # Raise HTTP error in case of bad request
        response.raise_for_status()
        raw_result = response.json()
        
        # Initialize resulting list
        result = []

        i = tx_count
        # Get transactions info and add them to the resulting dictionary
        for tx in raw_result:
            
            # Initialize paid amount
            paid_amount = 0
            # Get transaction source data
            source_data = tx["vin"]
            
            # Loop on each source transaction and update paid amount when the  source address is the input address 
            for in_tx in source_data:
                previous_output = in_tx["prevout"]
                source_address = previous_output["scriptpubkey_address"]
                if source_address == address:
                    paid_amount += previous_output["value"]
            
            # Initialize received amount
            received_amount = 0
            # Get transaction destination data
            destination_data = tx["vout"]            
            # Loop on each destination address and update received amount when it matches the input address 
            for out_data in destination_data:
                destination_address = out_data["scriptpubkey_address"]
                if destination_address == address:
                    received_amount += out_data["value"]

            # Deduce flow amount, direction and previous balance
            flow_amount = received_amount - paid_amount
            flow_direction = "receive" if flow_amount > 0 else "pay"
            old_balance = balance - flow_amount
            
            # Get current transaction block info
            block_info = tx["status"]
            tx_status = CONFIRMED if block_info["confirmed"] == True else POOL


            # Build the resulting dictionary for the current transaction
            tx_info = {
                "tx_nb": tx_count,
                "tx_id": tx["txid"],
                "block_confirmed": block_info["confirmed"],
                "flow_direction": flow_direction,
                "flow_amount": flow_amount,
                "old_balance": old_balance,
                "new_balance": balance,
            }

            # Add block information for confirmed transactions
            if tx_status == CONFIRMED:
                tx_info["block_nb"] = block_info["block_height"]
                tx_info["block_date_time"] = datetime.fromtimestamp(block_info["block_time"])

            result.append(tx_info)

            # Decrement transaction number and update balance to the previous one
            tx_count -= 1
            balance = old_balance

    # Catch exceptions
    except requests.RequestException as e:
        raise ValueError(f"Request Error: {e}")
    except KeyError as e:
        raise ValueError(f"Missing expected field in JSON: {e} ({tx_status} transaction {i})")
    except ValueError as e:
        raise ValueError(f"JSON parsing error: {e}")
    
    # Return result
    return result, tx_count, balance


# --------------------------------------------------------------------------------------------------
# --------------------------------------------------------------------------------------------------
# --------------------------------------------------------------------------------------------------


def apology(message, code=400):
    """Render message as an apology to user."""

    def escape(s):
        """
        Escape special characters.

        https://github.com/jacebrowning/memegen#special-characters
        """
        for old, new in [
            ("-", "--"),
            (" ", "-"),
            ("_", "__"),
            ("?", "~q"),
            ("%", "~p"),
            ("#", "~h"),
            ("/", "~s"),
            ('"', "''"),
        ]:
            s = s.replace(old, new)
        return s

    return render_template("apology.html", top=code, bottom=escape(message)), code


def login_required(f):
    """
    Decorate routes to require login.

    https://flask.palletsprojects.com/en/latest/patterns/viewdecorators/
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)

    return decorated_function


def lookup(symbol):
    """Look up quote for symbol."""
    url = f"https://finance.cs50.io/quote?symbol={symbol.upper()}"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for HTTP error responses
        quote_data = response.json()
        return {
            "name": quote_data["companyName"],
            "price": quote_data["latestPrice"],
            "symbol": symbol.upper()
        }
    except requests.RequestException as e:
        print(f"Request error: {e}")
    except (KeyError, ValueError) as e:
        print(f"Data parsing error: {e}")
    return None





def usd(value):
    """Format value as USD."""
    return f"${value:,}"
