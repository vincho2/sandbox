// Initialize variables
let lastTxId = null;
let address = null;
let loading = false;
let observer;

const maxNbTxsApi = 25;
// Get form from document
const form = document.querySelector("form");
// Get sentinel from document (page end)
const sentinel = document.querySelector("#page-end");

// Load address information and the initial transactions list upon address submission from the page form
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Get address from the form
    address = form.address.value;
    // Return nothing if no address is input
    if (!address) return;

    // Reinitialize last transaction id and /empty results from html in case of past search
    lastTxId = null;
    loading = false;
    const searchResult = document.querySelector("#search-result");
    searchResult.innerHTML = "";
    // Deconnect observer if active from previous search
    if (observer) observer.disconnect();

    // Load address info and most recent transactions for the new address input
    await loadInitialTxs();
});


// -------------------------------------------------------------------------------------------------
// Function to load the address information and the initial transactions list calling the dedicated api
// -------------------------------------------------------------------------------------------------
async function loadInitialTxs() {
    const response = await fetch(`/api/address/${address}/txs/initial`);
    const data = await response.json();

    // ======> Add logic in case error is not empty or if no address info or no tx_history -------------------

    // Display address information
    renderAddressInfo(data.address_info);
    // Display the most recent transactions
    appendTxsToPage(data.tx_history);

    //  In case a full batch of transactions was loaded...
    if (data.tx_history.length === maxNbTxsApi) {
        // Activate observer to load next transaction batch
        setupObserver();
        // Update last transaction id for next api call
        lastTxId = data.last_tx_id;

    }
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
    obverser.observe(sentinel);
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
// Function to display address info
// -------------------------------------------------------------------------------------------------
function renderAddressInfo(address_info) {
    // TO DO
    return;
}

// -------------------------------------------------------------------------------------------------
// Function to display the list of transaction
// -------------------------------------------------------------------------------------------------
function appendTxsToPage(tx_history) {
    // TO DO
    return;
}

// -------------------------------------------------------------------------------------------------
// Function to display the a transaction ====> use a template
// -------------------------------------------------------------------------------------------------
function renderTxHtml(tx) {
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


