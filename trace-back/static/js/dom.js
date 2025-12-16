// Get html elements
export const el = {
    // DOM static elements
    navbar: document.getElementById("main-navbar"),
    main: document.getElementById("main-content"),
    form: document.querySelector("form"),
    addressInfo: document.getElementById("address-info"),
    txHistoryList: document.getElementById("tx-history-list"),
    errorDisplay: document.getElementById("error-display"),
    sentinel: document.getElementById("page-end"),
    loader: document.getElementById("loading-indicator"),
    // Templates
    errTpl: document.getElementById("error-display-template"),
    addrInfoTpl: document.getElementById("address-info-template"),
    txTpl: document.getElementById("tx-template")
};

// Check each element existence
for (const [key, value] of Object.entries(el)) {
    if (!value) throw new Error(`Missing required HTML element: ${key}`);
}