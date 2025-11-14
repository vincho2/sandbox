Parfait — on y va ✅

Je te donne **une architecture pratique, étape par étape**, avec les composants concrets, les endpoints à utiliser, la base de données minimale, et un planning réaliste pour tenir dans tes ~50 heures. Pas de code long ici — juste tout ce qu’il te faut pour démarrer et avancer vite.

---

# Vue d’ensemble (ce qu’on va construire)

* **Frontend** : React (create-react-app ou Vite) — dashboard SPA
* **Backend léger** : Node.js + Express (ou Fastify) — agrégations, cache, gateway vers APIs externes et (optionnel) ton nœud Bitcoin
* **Sources de données** :

  * **Blockchair API** pour snapshots historiques & distribution
  * **Blockstream API** pour blocs / txs (fetch et / ou ZMQ pour le live)
  * **Ton nœud Bitcoin (optionnel)** : RPC + ZMQ pour capter blocs/txs en temps réel sans dépendre d’un tiers
* **Base locale** : SQLite (léger, simple) — stocke historique quotidien, alerts, cache des requêtes lourdes
* **Déploiement local** : tout tourne sur ta machine (ou sur un petit VPS si tu veux exposer publiquement)
* **Visualisations** : Recharts ou Chart.js pour graphiques

---

# Composants détaillés

## Frontend (React)

Pages / composants :

1. **Home / Overview**

   * métriques clés (tx mean, volume 24h, mempool size)
2. **Distribution** (Satoshi → Whales)

   * histogramme interactif, sliders pour choisir seuils et période
   * tableau récapitulatif (% adresses > X)
3. **Whale Pulse**

   * feed temps réel des grosses tx détectées
   * possibilité de filtrer par seuil (ex : > 50 BTC)
   * bouton “mute / unmute” alertes visuelles/sonores
4. **Historique multi-jours**

   * graphiques (tx mean, fees, addresses ≥ X) sur N jours
5. **Settings**

   * seuils, sources API keys (Blockchair), toggle nœud local vs APIs publiques

Communication :

* Frontend appelle le backend (fetch / SSE / WebSocket) pour :

  * récupérer snapshots historisés
  * s’abonner aux alerts whale (WebSocket ou Server-Sent Events)

---

## Backend (Node.js + Express)

Responsabilités :

* **Gateway API** vers Blockchair & Blockstream

  * endpoints REST simplifiés pour le frontend (ex : `/api/distribution?days=30`)
* **Cache** (SQLite + simple TTL) pour limiter appels aux APIs externes
* **Worker périodique** (cron ou setInterval) :

  * récupérer snapshot quotidien Blockchair → stocker dans SQLite
  * calculer tx_mean, fees_mean, etc.
* **Whale Detector** :

  * mode “poll” : every 30s → fetch latest block via Blockstream, parse txs → push alerts
  * mode “ZMQ” (si nœud local) : subscribe to rawtx/rawblock → parse → push alerts
* **Push vers frontend** : WebSocket ou SSE pour envoyer alerts en temps réel

Endpoints utiles à exposer (exemples) :

* `GET /api/overview` → metrics rapides (tx_mean, volume_24h, mempool_size)
* `GET /api/distribution?days=30` → séries historiques distribution
* `GET /api/whales?limit=50` → dernières grosses tx
* `GET /api/address/:addr` → solde + recent txs (via Blockchair)

---

# Sources & endpoints précis

## Blockchair (analytics / historical)

* Endpoint stats : `https://api.blockchair.com/bitcoin/stats`
* Endpoint historical stats : `https://api.blockchair.com/bitcoin/stats?q=...&days=30`
  (la doc exacte : utiliser `stats` et les query params `days` / `interval` — Blockchair renvoie des séries quotidiennes pour beaucoup de métriques)

→ Utilise Blockchair pour : distribution adresses par tranche, séries journalières (addresses_balance_1btc, etc.), metrics 24h.

## Blockstream (raw blocks / txs)

* Blocks list : `https://blockstream.info/api/blocks`
* Block TXs : `https://blockstream.info/api/block/{hash}/txs`
* Mempool : `https://blockstream.info/api/mempool`
* ZMQ (si nœud local) : activer `zmqpubrawtx` / `zmqpubrawblock` dans bitcoin.conf

→ Utilise Blockstream pour : lire rapidement les tx d’un bloc, détecter whales en quasi temps réel.

## Ton nœud Bitcoin (optionnel)

* RPC endpoints (`getblockhash`, `getblock`, `getrawtransaction`, `getrawmempool`) via HTTP RPC
* ZMQ pour la détection instantanée de txs/blocks

---

# Schéma de la base SQLite (minimal)

Tables recommandées :

1. `daily_stats`

   * date (YYYY-MM-DD)
   * tx_count
   * tx_volume_btc
   * tx_mean_btc
   * fees_mean
   * mempool_size
   * addresses_1btc
   * addresses_10btc
   * addresses_100btc
   * raw_json (optionnel)

2. `whale_alerts`

   * id (pk)
   * timestamp
   * txid
   * total_value_btc
   * inputs_summary (text)
   * outputs_summary (text)
   * json_raw

3. `config` (seuils, last_block_processed, api_keys, etc.)

SQLite = suffisant et extrêmement rapide pour reads/writes simples.

---

# Workflow / Algorithmes (haut niveau)

## Distribution dynamique

* Backend : fetch `stats` daily from Blockchair → populate `daily_stats`
* Frontend : request `/api/distribution?days=30` → build histogram from `addresses_1btc` etc.
* Pour tranches non fournies, calculer approximations à partir UTXO top buckets (mais préférer tranches Blockchair propose)

## Whale Activity Pulse

* Polling mode (simple) : every 30s -> call Blockstream to fetch latest block(s) -> inspect transactions -> sum outputs (BTC) -> if any tx total_value >= threshold -> insert into `whale_alerts` and push to clients
* ZMQ mode (advanced) : subscribe to rawtx -> decode -> same logic -> lower latency

## Analyses multi-jours

* Scheduler once per day:

  * fetch Blockchair stats for last day -> insert into `daily_stats`
  * compute moving averages / percent change for quick display
* Frontend pulls series and plots

---

# Plan de travail 50 heures (estimation réaliste)

### Phase 0 — Setup initial (3h)

* init repo frontend + backend
* installer libs (axios/node-fetch, sqlite3, express, ws, react, recharts)
* config Blockchair key (si nécessaire)

### Phase 1 — Backend minimal + cache (10h)

* endpoints basiques (`/api/overview`, `/api/distribution`, `/api/whales`)
* intégration Blockchair stats -> populate `daily_stats` (manual seed script)
* SQLite schema + simple cache TTL
  (≈10h incl tests)

### Phase 2 — Whale detector (polling) (8h)

* implémenter fetch last block(s) via Blockstream
* parser txs -> detect txs > threshold -> insert `whale_alerts`
* expose `GET /api/whales`
* add WebSocket/SSE to push alerts au frontend

### Phase 3 — Frontend (React) MVP (14h)

* Home + Distribution page + Whale feed
* Charts (Recharts) + tables
* connect to backend endpoints & WebSocket
* basic UI/UX, responsive

### Phase 4 — Historique multi-jours & polishing (8h)

* scheduler daily fetch (or seed historical via Blockchair for N days)
* graphs temporisés, period selector (7/30/90 days)
* small polish: loading states, errors, tooltips

### Phase 5 — Tests, docs, packaging (7h)

* README, how-to-run, scripts (start-backend, seed-db, start-frontend)
* small improvements: debounce, rate limit handling, environment variables
* final polish UI, icons, small animations for alerts

**Total ≈ 50 heures**

---

# Priorités & MVP (si le temps manque)

1. Backend: endpoints `/api/distribution` (Blockchair seed) + `/api/whales` (poll Blockstream)
2. Frontend: afficher distribution + live whale feed (WebSocket)
3. Seed historique 30 jours via Blockchair
4. Polissage UI / alert sound

---

# Commandes & notes pratiques pour démarrer (rapide)

* Frontend :

  * `npx create-react-app btc-dashboard` ou `npm init vite@latest btc-dashboard --template react`
  * `npm install recharts axios`
* Backend :

  * `mkdir backend && npm init -y`
  * `npm install express axios sqlite3 ws node-cron`
* ZMQ from Bitcoin node (si utilisé) : ajouter dans `bitcoin.conf` :

  ```
  zmqpubrawblock=tcp://127.0.0.1:28332
  zmqpubrawtx=tcp://127.0.0.1:28333
  ```

  puis redémarrer bitcoind.

---

# Sécurité & quotas

* Blockchair a des limites et peut demander une clé pour usage intensif → cache et TTL obligatoires.
* Rate-limit tes appels, utilise cache SQLite et évite d’appeler endpoints à chaque requête front.
* Si tu exposes l’API publiquement, ajoute une clé / auth minimale.

---

# Prochaine étape (immédiate)

Tu me dis :

* Tu veux qu’on **démarre par le backend** (je te file le squelette Express + endpoints exacts et scripts seed) — **ou**
* Tu préfères **débuter par le frontend** (maquette React + composants à implémenter) — **ou**
* Tu veux que je te fournisse **les requêtes exactes Blockchair / Blockstream** à coller dans ton backend pour seed et detection (sans code complet, juste les URLs et payloads)?

Dis lequel de ces trois tu veux que je te fournisse **tout de suite** et je te lance les fichiers / commandes précis.
