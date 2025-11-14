import Fastify from "fastify";
import cors from "@fastify/cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const fastify = Fastify({ logger: true });

// Autoriser ton frontend
await fastify.register(cors, { origin: "*" });

// Exemple endpoint : récupère une adresse Bitcoin via Blockstream
fastify.get("/api/address/:addr", async (request, reply) => {
  const { addr } = request.params;
  try {
    const { data } = await axios.get(
      `https://blockstream.info/api/address/${addr}`
    );
    return data;
  } catch (err) {
    reply.status(500).send({ error: "API request failed" });
  }
});

// Lancer le serveur
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
