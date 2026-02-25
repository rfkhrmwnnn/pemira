import * as ed from "@noble/ed25519";
import { webcrypto } from "node:crypto";

// @ts-ignore
if (!globalThis.crypto) globalThis.crypto = webcrypto;

async function generateKeys() {
  const privKey = ed.utils.randomPrivateKey();
  const pubKey = await ed.getPublicKey(privKey);

  console.log("\n🔑 --- PEMIRA DIGITAL IKMI : KEY GENERATOR --- 🔑\n");
  console.log("Salin kunci di bawah ini ke file .env.local Anda:\n");
  console.log(`NEXT_PUBLIC_PUBLIC_KEY=${Buffer.from(pubKey).toString("hex")}`);
  console.log(`PRIVATE_KEY=${Buffer.from(privKey).toString("hex")}`);
  console.log("\n⚠️ PERINGATAN: Simpan PRIVATE_KEY di tempat yang sangat aman.");
  console.log("Jangan pernah bagikan PRIVATE_KEY kepada siapapun!\n");
}

generateKeys();
