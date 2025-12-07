// Initialize variables
let lastTxId = null;
let address = null;
let loading = false;
let observer;

const maxNbTxsApi = 25;

// Get html elements
const el = {
    // DOM static elements
    form: document.querySelector("form"),
    searchResult: document.getElementById("search-result"),
    errorDisplay: document.getElementById("error-display"),
    sentinel: document.getElementById("page-end"),
    // Templates
    errTpl: document.getElementById("error-display-template"),
    searchResultTpl: document.getElementById("search-result-template"),
    addrInfoTpl: document.getElementById("address-info-template"),
    txTpl: document.getElementById("tx-template")
};

// Check each element existence
for (const [key, value] of Object.entries(el)) {
    if (!value) throw new Error(`Missing required HTML element: ${key}`);
}

// Initialize address-info required data
const requiredAddressFields = [
    "address_id",
    "conf_balance",
    "tx_count",
    "pool_tx_count",
    "pool_io_flow"
];

// Initialize transaction information required data
const requiredTxInfoFields = [
    "tx_nb",
    "tx_id",
    "block_confirmed",
    "flow_direction",
    "flow_amount",
    "old_balance",
    "new_balance"
];

// Load address information and the initial transactions list upon address submission from the page form
el.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    // Get address from the form
    address = el.form.address.value;
    // Return nothing if no address is input
    if (!address) return;

    // Reinitialize last transaction id and /empty results from html in case of past search
    lastTxId = null;
    loading = false;
    searchResult.innerHTML = "";
    errorDisplay.innerHTML = "";

    // Deconnect observer if active from previous search
    if (observer) observer.disconnect();

    // Load address info and most recent transactions for the new address input
    await loadInitialTxs();
});


// -------------------------------------------------------------------------------------------------
// Function to load the address information and the initial transactions list calling the dedicated api
// -------------------------------------------------------------------------------------------------
async function loadInitialTxs() {
    
    try {
        const response = await fetch(`/api/address/${address}/txs/initial`);
    
        // Catch any error coming from the HTTP request
        if (!response.ok) {
            throw new Error (`HTTP error ${response.status}`);
        }

        // Initialize data object
        let data;
    
        // Catch error if data is not a proper JSON file
        try {
            data = await response.json();
        } catch(error) {
            throw new Error(`Invalid JSON loaded from server: ${error}`);
        }
        // Catch any error returned by the API caught on server side
        if (data.error) {
            throw new Error(`Error coming from API call: ${data.error}`);
        }
        
        // Catch any error coming from data content
        validateData(data);

        // If no error, return search results
        renderSearchResult(data);
    
        //  In case a full batch of transactions was loaded:
        if (data.tx_history.length === maxNbTxsApi) {
            // Activate observer to load next transaction batch
            setupObserver();
            // Update last transaction id for next api call
            lastTxId = data.last_tx_id;
        }

    } catch (err) {
        console.error("load Initial transaction error:", err);
        showError(err);
    }
}


// -------------------------------------------------------------------------------------------------
// Function to display search result
// -------------------------------------------------------------------------------------------------
function renderSearchResult(data) {

    // Clone template
    const clone = el.searchResultTpl.content.cloneNode(true);
    
    // Append address info to template
    const addressInfoContainer = clone.getElementById("address-info");
    if (!addressInfoContainer) {
        console.error("No Address info placeholder in the template");
    } else {
        const addressInfo = renderAddressInfo(data.address_info);
        addressInfoContainer.innerHTML = "";
        addressInfoContainer.appendChild(addressInfo);
    }

    // Append transaction history to template
    const txHistoryContainer = clone.getElementById("tx-history");
    if (!txHistoryContainer) {
        console.error("No Transaction history placeholder in the template");
    } else {
        const txHistory = renderTxHistory(data.tx_history);
        txHistoryContainer.innerHTML = "";
        txHistoryContainer.appendChild(txHistory);
    }

    // Append search results to document
    el.searchResult.innerHTML = "";
    el.searchResult.appendChild(clone);

}

// -------------------------------------------------------------------------------------------------
// Function to display address info
// -------------------------------------------------------------------------------------------------
function renderAddressInfo(address_info) {

    // Clone template
    const clone = el.addrInfoTpl.content.cloneNode(true);

    // Populate data
    clone.querySelector("[data-address-id]").textContent = address_info.address_id;
    // NEXT ............................  TO DO .............    

    // return the clone
    return clone;
}

// -------------------------------------------------------------------------------------------------
// Function to display the list of transaction
// -------------------------------------------------------------------------------------------------
function appendTxsToPage(tx_history) {
    // TO DO
    return;
}



// -------------------------------------------------------------------------------------------------
// Function to load next transaction calling the dedicated api
// -------------------------------------------------------------------------------------------------
async function loadNextTxs() {
    // Avoid loading transacitons if page is already loading or if the lastTxId is not present
    if (loading || !lastTxId) return;
    // Set loading to true to "lock" the loading progress
    loading = true;

    const response = await fetch(`/api/address/${address}/txs/chain?last_tx_id=${lastTxId}`);
    const data = await response.json();

    // Display earlier transactions
    // =====> Add logic in case error is not empty -------------------
    appendTxsToPage(data.tx_history);

    // If a full batch of transactions were loaded, then update last transaction id for next call
    if (data.tx_history.length === maxNbTxsApi) {
        lastTxId = data.tx_history[data.tx_history.length - 1].tx_id;
    }
    // Else, there is no more transaction to load, so disconnect observer 
    else if (observer) {
        observer.disconnect();
    }
    // Unlock loading
    loading = false;
}


// -------------------------------------------------------------------------------------------------
// Function to display the a transaction ====> use a template
// -------------------------------------------------------------------------------------------------
function renderTxHistory(tx) {
    return `
        <div class="tx-line ${tx.flow_direction}">
            <div class="tx-arrow">
                ${tx.flow_direction === "receive" ? "←" : "→"}
            </div>
            <div class="tx-info">
                <div class="tx-amount">${tx.flow_amount_btc}</div>
                <div class="tx-balance">${tx.new_balance_btc}</div>
            </div>
        </div>
    `;
}

// -------------------------------------------------------------------------------------------------
// Function to display an error if the address info is not well retrieved
// -------------------------------------------------------------------------------------------------
function showError(error) {

    // Generic error message
    const genericError = "Not able to retrieve address information, please try again with a valid address"

    // Clone template
    const clone = el.errTpl.cloneNode(true);
    clone.removeAttribute("id");
    clone.hidden = false;

    // Populate content
    clone.querySelector("[data-error-generic]").textContent = genericError;
    clone.querySelector("[data-error-message]").textContent = error;

    // Add clone to document
    el.errorDisplay.appendChild(clone);
}

// -------------------------------------------------------------------------------------------------
// Function to setup observer
// -------------------------------------------------------------------------------------------------
function setupObserver() {

    // Define observer
    observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
            await loadNextTxs();
        }
    });

    // Activate observer
    obverser.observe(el.sentinel);
}

// -------------------------------------------------------------------------------------------------
// Function to validate the load initial data API response
// -------------------------------------------------------------------------------------------------
function validateData(data) {
    if (!data || typeof data !== "object") {
        throw new Error("Invalid JSON format returned by API");
    }

    // Check address info format
    if (!data.address_info || typeof data.address_info !== "object") {
        throw new Error("Invalid JSON returned by API, missing or invalid address_info object");
    }

    const missingAddress = requiredAddressFields.filter(k => !(k in data.address_info));
    if (missingAddress.length > 0) {
        throw new Error(`Invalid JSON returned by API, missing field(s) in address_info: ${missingAddress.join(", ")}`);
    }

    // Check transaction history and last transaction id
    if (!Array.isArray(data.tx_history)) {
        throw new Error("Invalid JSON returned by API, tx_history should be an array");
    }
    if (!data.last_tx_id) {
        throw new Error("Invalid JSON returned by API, missing last_tx_id");
    }

    // Check that transaction history is not empty
    if (data.tx_history.length === 0) {
        throw new Error("Invalid JSON returned by API, tx_history is empty");
    }
}
