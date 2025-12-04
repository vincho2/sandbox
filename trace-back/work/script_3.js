let lastTxId = null;
let loading = false;
let address = null;

document.getElementById("address-input").addEventListener("change", async (e) => {
    address = e.target.value;
    await loadInitialTxs();
});

async function loadInitialTxs() {
    const response = await fetch(`/api/address/${address}/txs/initial`);
    const data = await response.json();

    lastTxId = data.last_tx_id;
    renderAddressInfo(data.address_info);
    appendTxsToPage(data.tx_history);
}

async function loadNextTxs() {
    if (loading || !lastTxId) return;
    loading = true;

    const response = await fetch(`/api/address/${address}/txs/next?last=${lastTxId}`);
    const data = await response.json();

    appendTxsToPage(data.tx_history);

    if (data.tx_history.length > 0)
        lastTxId = data.tx_history[data.tx_history.length - 1].tx_id;

    loading = false;
}

window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        loadNextTxs();
    }
});

const observer = new IntersectionObserver(async entries => {
    if (entries[0].isIntersecting && !loading) {
        loading = true;

        const url = `/load_more_txs?address=${address}&last_txid=${lastTxId}`; // enrichis avec les autres arguments (balance et tx_count)
        const res = await fetch(url);
        const data = await res.json();  // quel format ?

        

        // append dans la liste
        const container = document.getElementById("tx-history");

        data.forEach(tx => {
            container.insertAdjacentHTML("beforeend", renderTxHtml(tx));
        });

        // met à jour lastTxId pour la prochaine requête
        lastTxId = data[data.length - 1].tx_id;

        loading = false;
    }
});

observer.observe(document.getElementById("scroll-trigger"));


// Fonction JS qui génère le HTML d'une transaction
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

// Fonction pour loader un template (à revoir)
async function loadTemplate(path) {
    const resp = await fetch(path);
    return await resp.text();
}

const template = await loadTemplate("/static/templates/tx_row.html");