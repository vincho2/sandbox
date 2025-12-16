// Initialize address-info required data
const requiredAddressFields = [
    "address_id",
    "conf_balance",
    "tx_count",
    "pool_tx_count",
    "pool_io_flow"
];

// -------------------------------------------------------------------------------------------------
// Function to validate the load initial data API response
// -------------------------------------------------------------------------------------------------
export function validateData(data) {

    const errorMsg = "Invalid JSON format returned by API";

    console.log("JSON received:", data);
    // Check that data is actually a JSON (and not null)
    if (!data || typeof data !== "object") {
        throw new Error(`${errorMsg}: expected an object`);
    }

    // Check that address info is actually an object format
    if (!data.address_info || typeof data.address_info !== "object") {
        throw new Error(`${errorMsg}: missing or invalid address_info object`);
    }

    // Check that each required field is present in address info
    const missingAddress = requiredAddressFields.filter(k => !(k in data.address_info));
    if (missingAddress.length > 0) {
        throw new Error(`${errorMsg}: missing field(s) in address_info: ${missingAddress.join(", ")}`);
    }

    // Check transaction history format
    if (!Array.isArray(data.tx_history)) {
        throw new Error(`${errorMsg}: Transaction history should be an array`);
    }

     // Check that transaction history is not empty
    if (data.tx_history.length === 0) {
        throw new Error(`${errorMsg}: Transaction history is empty`);
    }

    const requiredFields = ["last_tx_id", "last_tx_nb", "old_balance"];

    const missingFields = requiredFields.filter(key => !(key in data));
    if (missingFields.length > 0) {
        throw new Error(`${errorMsg} Missing field(s): ${missingFields.join(", ")}`);
    }
}

// -------------------------------------------------------------------------------------------------
// Functions to format amounts
// -------------------------------------------------------------------------------------------------
export function satsAmount(amount) {

    if (typeof amount !== "number" || isNaN(amount)) {
        console.error("formatAmount error — received:", amount, "type:", typeof amount);
        console.trace(); 
        throw new Error(`formatAmount: ${amount} must be a number (in satoshis)`);
    }

    const sats = amount.toLocaleString("en-US");

    return `${sats} sats`;
}

// -------------------------------------------------------------------------------------------------
// Functions to format amounts
// -------------------------------------------------------------------------------------------------
export function btcAmount(amount) {

    if (typeof amount !== "number" || isNaN(amount)) {
        console.error("formatAmount error — received:", amount, "type:", typeof amount);
        console.trace(); 
        throw new Error(`formatAmount: ${amount} must be a number (in satoshis)`);
    }

    const amountBtc = amount / 100_000_000;
    const btc = amountBtc.toLocaleString("en-US", {
         maximumFractionDigits: 8
    });

    return `${btc} BTC`;
}

// -------------------------------------------------------------------------------------------------
// Function to set a value in a selector inside an HTML fragment
// -------------------------------------------------------------------------------------------------
export function set(fragment, selector, value) {
    const el = fragment.querySelector(selector);
    if (el) el.textContent = value;
}
