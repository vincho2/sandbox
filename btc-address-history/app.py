from flask import Flask, request, jsonify
from helpers import get_address_info, get_tx_history

# Configure application
app = Flask(__name__, static_folder="static", static_url_path="")

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
    last_tx_nb = None
    old_balance = None
 
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
                tx_nb=tx_count, 
                balance=total_balance
            )

            # Get last Transaction id and nb and oldest balance
            last_tx_id = tx_history[-1]["tx_id"]
            last_tx_nb = tx_history[-1]["tx_nb"]
            old_balance = tx_history[-1]["old_balance"]
        
        except KeyError as e:
            error=(f"Missing transaction id in JSON: {e})")
    
        except ValueError as e:
            error=str(e)

    
    # return initial transactions results
    return jsonify({
        "address_info": address_info,
        "tx_history": tx_history,
        "last_tx_id": last_tx_id,
        "last_tx_nb": last_tx_nb,
        "old_balance": old_balance,
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
    last_tx_nb = int(request.args.get("last_tx_nb"))
    old_balance = int(request.args.get("old_balance"))

    error = None

    try:
        # Get history and initialize transaction count to the oldest transaction already fetched minus 1
        tx_history = get_tx_history(
            address=address,
            last_tx_id=last_tx_id,
            tx_nb=last_tx_nb - 1,
            balance=old_balance
        )
    
    except ValueError as e:
        error=str(e)
    
    return jsonify({
        "tx_history": tx_history,
        "error": error})