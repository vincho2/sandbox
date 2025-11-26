import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";

import { getOverview } from "./services/overview.js";
import { getDistribution } from "./services/distribution.js";
import { getWhales } from "./services/whales.js";


dotenv.config();

const fastify = Fastify({ logger: true });

// Autoriser ton frontend
await fastify.register(cors, { origin: "*" });

// 1) Overview en haut de page
app.get("/api/overview", async (request, reply) => {
  return await getOverview();
});

// 2) Distribution (graphique)
app.get("/api/distribution", async (request, reply) => {
  return await getDistribution();
});

// 3) Whales (liste des grosses adresses)
app.get("/api/whales", async (request, reply) => {
  return await getWhales();
});

// Get a Bitcoin address via Blockstream API
fastify.get("/api/address/:addr", async (request, reply) => {

    // Get Address from the request parameters
    const addr = request.params.addr;

    try {
        // Get address data from blockstream
        const response = await fetch(`https://blockstream.info/api/address/${addr}`);

        // Extract the data from the request response
        const data = response.json();

        // Send the reply
        reply.send(data);

    } catch (err) {
        // Return an 500 error if address is not valid or if request failed
        reply.status(500).send({ error: "API request failed" });
    }
});

// Start server on port 3001 (localhost)
const start = async () => {
    try {
        await fastify.listen({ port: 3001 });
        console.log("Backend running on http://localhost:3001");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
