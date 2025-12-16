// -------------------------------------------------------------------------------------------------
// Load initial transactions
// -------------------------------------------------------------------------------------------------
export async function loadInitialTxs(address) {

    const url = `/api/address/${address}/txs/initial`;
    const context = "initial transactions";

    return fetchAndValidate(url, context);
}

// -------------------------------------------------------------------------------------------------
// Load next transactions
// -------------------------------------------------------------------------------------------------
export async function loadNextTxs(address, lastTxId, oldBalance, lastTxNb, page) {

    const params = new URLSearchParams({
        last_tx_id: lastTxId,
        old_balance: oldBalance,
        last_tx_nb: lastTxNb
    });

    const url = `/api/address/${address}/txs/chain/?${params.toString()}`;
    const context = `next transactions page ${page}`;

    return fetchAndValidate(url, context);
}


// -------------------------------------------------------------------------------------------------
// Generic fetch + validation helper
// -------------------------------------------------------------------------------------------------
async function fetchAndValidate(url, context) {

    let response;

    // Try the network request itself
    try {
        response = await fetch(url);
    } catch (err) {
        throw new Error(`Network error while loading ${context}: ${err}`);
    }

    // HTTP error ? (404 / 500 / etc.)
    if (!response.ok) {
        throw new Error(`HTTP error while loading ${context}: ${response.status}`);
    }

    // JSON parsing error ?
    let data;
    try {
        data = await response.json();
    } catch (err) {
        throw new Error(`Invalid JSON returned for ${context}: ${err}`);
    }

    // API error returned by backend ?
    if (data.error) {
        console.log("data :", data);
        throw new Error(`Server error while loading ${context}: ${data.error}`);
    }

    // Ok
    return data;
}
