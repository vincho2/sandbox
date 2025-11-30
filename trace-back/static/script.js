let loading = false;

let lastTxId = "{{ tx_history[-1].tx_id if tx_history else '' }}"; // revois comment cette variable obtient sa valeur
let address = "{{ address_info.address_id }}";

const observer = new IntersectionObserver(async entries => {
    if (entries[0].isIntersecting && !loading) {
        loading = true;

        const url = `/load_more_txs?address=${address}&last_txid=${lastTxId}`; // enrichis avec les autres arguments (balance et tx_count)
        const res = await fetch(url);
        const data = await res.json();  // quel format ?

        if (data.length === 0) {
            observer.disconnect(); // plus rien à charger
            return;
        }

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
