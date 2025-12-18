import { satsAmount, btcAmount, set } from "./utils.js";
import { el } from "./dom.js";

// Initialize transaction information required data
// Common mandatory
const requiredTxInfoFields = [
    "tx_nb",
    "tx_id",
    "tx_status",
    "flow_direction",
    "flow_amount",
    "old_balance",
    "new_balance",
];

// Mandatory if confirmed
const requiredConfTxFields = [
    "block_nb",
    "block_date_time"
];


// -------------------------------------------------------------------------------------------------
// Function to display address info
// -------------------------------------------------------------------------------------------------
export function renderAddressInfo(address_info) {

    console.log("address_info received:", address_info);

    // Initialize fragment based on template
    const fragment = el.addrInfoTpl.content.cloneNode(true);

    // Populate data
    set(fragment, "[data-address-id]", address_info.address_id);
    set(fragment, "[data-conf-balance-sats]", satsAmount(address_info.conf_balance));
    set(fragment, "[data-conf-balance-btc]", "(" + btcAmount(address_info.conf_balance) + ")");
    set(fragment, "[data-conf-tx-count]", address_info.tx_count);
    
    // Display mem pool info if there are transaction in the mempool
    if (address_info.pool_tx_count > 0) {
        const mem = fragment.getElementById("mempool-info");
        if (mem) {
            mem.hidden = false;
        } else {
            console.error("Mempool info block not found in Address-info template");
        }
    }
    
    set(fragment, "[data-pool-io-flow-sats]", satsAmount(address_info.pool_io_flow));
    set(fragment, "[data-pool-io-flow-btc]", "(" + btcAmount(address_info.pool_io_flow) + ")");
    set(fragment, "[data-pool-tx-count]", address_info.pool_tx_count);

    
    // Compute total balance
    const totalBalance =  
        (address_info.conf_balance ?? 0) +
        (address_info.pool_io_flow ?? 0);

    set(fragment, "[data-total-balance-sats]", satsAmount(totalBalance));
    set(fragment, "[data-total-balance-btc]", "(" + btcAmount(totalBalance) + ")");

    // return the clone
    return fragment;
}

// -------------------------------------------------------------------------------------------------
// Function to display the list of transactions
// -------------------------------------------------------------------------------------------------
export function renderTxHistory(tx_history) {

    console.log("tx_history :", tx_history);

    // Create document fragment as container for the transcation history
    const fragment = document.createDocumentFragment();

    // Loop on each transaction
    tx_history.forEach(tx => {

        // console.log("transaction:", tx);

        // Check that each required field is present in the transaction list
        const missingTxField = requiredTxInfoFields.filter(k => !(k in tx));
        if (missingTxField.length > 0) {
            throw new Error(`Invalid JSON returned by API, missing field(s) in transaction: ${missingTxField.join(", ")}`);
        }

        const txFragment = renderTx(tx);

        // Add transaction block to history block
        fragment.appendChild(txFragment);
    });

    return fragment;
}

// -------------------------------------------------------------------------------------------------
// Function to display the a transaction ====> use a template
// -------------------------------------------------------------------------------------------------
function renderTx(tx) {

    // Clone transaction template content
    const fragment = el.txTpl.content.cloneNode(true);

    const icon = fragment.querySelector("[data-tx-icon]");
    const amountSats = fragment.querySelector("[data-tx-amount-sats]");
    const amountBtc = fragment.querySelector("[data-tx-amount-btc]");

    if (tx.flow_direction === "receive") {
        icon.className = "bi bi-arrow-down-circle-fill text-success fs-3";
        amountSats.textContent = "+" + satsAmount(tx.flow_amount);
        amountSats.classList.add("text-success");
        amountBtc.textContent = "(+" + btcAmount(tx.flow_amount) + ")";
        amountBtc.classList.add("text-success");
    } else {
        icon.className = "bi bi-arrow-up-circle-fill text-danger fs-3";
        amountSats.textContent = satsAmount(tx.flow_amount);
        amountSats.classList.add("text-danger");
        amountBtc.textContent = "(" + btcAmount(tx.flow_amount) + ")";
        amountBtc.classList.add("text-danger");
    }
    
    // Fill center
    set(fragment, "[data-tx-nb]", tx.tx_nb);
    set(fragment, "[data-tx-id]", tx.tx_id);
    set(fragment, "[data-tx-status]", tx.tx_status);
    set(fragment, "[data-flow-direction]", tx.flow_direction);
    
    set(fragment, "[data-new-balance-sats]", satsAmount(tx.new_balance));
    set(fragment, "[data-new-balance-btc]", "(+" + btcAmount(tx.new_balance) + ")");

    // Add element for confirmed transaction
    if (tx.tx_status === "Confirmed") {

        // Check that block's info are present for confirmed transactions
        const missingconfTxField = requiredConfTxFields.filter(k => !(k in tx));
        if (missingconfTxField.length > 0) {
            throw new Error(`Invalid JSON returned by API, missing field(s) in confirmed transaction: ${missingconfTxField.join(", ")}`);
        }
        
        set(fragment, "[data-block-nb]", tx.block_nb);
        set(fragment, "[data-block-datetime]", tx.block_date_time);

    }

    return fragment;
}


// -------------------------------------------------------------------------------------------------
// Function to display an error if the address info is not well retrieved
// -------------------------------------------------------------------------------------------------
export function showError(error) {

    // Generic error message
    const genericError = "Not able to retrieve address information, check error below:"

    // Create fragment based on clone template
    const fragment = el.errTpl.content.cloneNode(true);

    // Populate content
    set(fragment, "[data-error-generic]", genericError);
    set(fragment, "[data-error-message]", error);

    // Add clone to document
    el.errorDisplay.appendChild(fragment);
}

