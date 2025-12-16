import { state } from "./state.js";
import { loadInitialTxs, loadNextTxs } from "./api.js";
import { renderAddressInfo, renderTxHistory, showError } from "./render.js";
import { el } from "./dom.js";
import { setupObserver } from "./observer.js";
import { validateData } from "./utils.js";

const maxNbTxsApi = 25;

// -------------------------------------------------------------------------------------------------
// Controller function for the address information and latest transactions display
// -------------------------------------------------------------------------------------------------
export async function controllerLoadInitialTxs(event) {
    event.preventDefault();

    // Get address from the form
    const address = el.form.address.value.trim();
    // Return nothing if no address is input
    if (!address) return;

    // Reset
    initNewSearch(address);

    try {
        // Call API function to get address information and latest transactions
        setLoading(true);
        state.page = 1;
        const data = await loadInitialTxs(address);

        // Catch any error coming from data content
        validateData(data);

        // If no error, render search result fragment
        const addressInfoFrag = renderAddressInfo(data.address_info);

        // Append address info to document
        el.addressInfo.innerHTML = "";
        el.addressInfo.appendChild(addressInfoFrag);
        adjustMainPadding();

        // Append transaction history to document
        const txHistoryFrag = renderTxHistory(data.tx_history)
        el.main.hidden = false;
        el.txHistoryList.innerHTML = "<h5>History</h5>";
        el.txHistoryList.appendChild(txHistoryFrag);
        
        
        // Unlock loading
        setLoading(false);

        //  In case a full batch of transactions was loaded:
        if (data.address_info.tx_count >= maxNbTxsApi) {
            // Activate observer to load next transaction batch
            setupObserver();
            // Update last transaction id & nb and old balance for next api call
            state.lastTxId = data.last_tx_id;
            state.lastTxNb = data.last_tx_nb;
            state.oldBalance = data.old_balance;
        }

    } catch (err) {
        console.error(err);
        showError(err);
        adjustMainPadding();
    } finally {
        setLoading(false);
    }

    // Empty address field after submit
    el.form.address.value = "";
    el.form.address.focus();
}

// -------------------------------------------------------------------------------------------------
// Controller function for the next transaction display
// -------------------------------------------------------------------------------------------------
export async function controllerLoadNextTxs() {

    console.log("Load next");
    // Avoid loading transactions if page is already loading or if the lastTxId is not present
    if (state.loading || !state.lastTxId || !state.lastTxNb || !state.oldBalance) return;
    // Set loading to true to "lock" the loading progress
    setLoading(true);
    state.page++;

    try {
        // Call API function to retrieve next transactions
        const data = await loadNextTxs(
            state.address, 
            state.lastTxId, 
            state.oldBalance, 
            state.lastTxNb,
            state.page
        );

        // Render transaction history fragment
        const fragment = renderTxHistory(data.tx_history);
        // Append results to document
        el.txHistoryList.appendChild(fragment);

        // Update state variables in case full batch of transactions was loaded
        if (data.tx_history.length === maxNbTxsApi) {
            state.lastTxId = data.tx_history[data.tx_history.length - 1].tx_id;
            state.lastTxNb = data.tx_history[data.tx_history.length - 1].tx_nb;
            state.oldBalance = data.tx_history[data.tx_history.length - 1].old_balance;
        }
        // Else, there is no more transaction to load, so disconnect observer 
        else state.observer?.disconnect();
        // Unlock loading
        setLoading(false);
    
    } catch (err) {
        console.error(err);
        showError(err);
        state.loading = false;
        state.observer?.disconnect();
        return;

    } finally {
        setLoading(false);
    }
}

// -------------------------------------------------------------------------------------------------
// Function to intialize a new search
// -------------------------------------------------------------------------------------------------
function initNewSearch(address) {

    // Reinitialize state variables
    state.address = address;
    state.lastTxId = null;
    state.oldBalance = null;
    state.loading = false;

    // Empty UI
    el.addressInfo.innerHTML = "";
    el.main.hidden = true;
    el.txHistoryList.innerHTML = "";
    el.errorDisplay.innerHTML = "";
    adjustMainPadding();

    // Disconnect observer
    if (state.observer) state.observer.disconnect();
}

// -------------------------------------------------------------------------------------------------
// Function to adjust navigation bar size
// -------------------------------------------------------------------------------------------------
export function adjustMainPadding() {

    console.log("adjust window");
    const navbarHeight = el.navbar.offsetHeight + 20;
    el.main.style.paddingTop = navbarHeight + 'px';
}

// -------------------------------------------------------------------------------------------------
// Function to set loader
// -------------------------------------------------------------------------------------------------
export function setLoading(isLoading) {

    console.log(`Loading: ${isLoading}`);

    el.loader.classList.toggle("d-none", !isLoading);
    state.loading = isLoading;
}
