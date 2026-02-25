const crypto = require('crypto');

function generateKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');

  // Export raw bytes for Ed25519
  // Node.js returns a Buffer for raw export of Ed25519
  const pubRaw = publicKey.export({ type: 'spki', format: 'der' }).subarray(-32);
  const privRaw = privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32);

  const pubHex = pubRaw.toString('hex');
  const privHex = privRaw.toString('hex');

  console.log("\n🔑 --- PEMIRA DIGITAL IKMI : KEY GENERATOR --- 🔑\n");
  console.log("Salin kunci di bawah ini ke file .env.local Anda:\n");
  console.log(`NEXT_PUBLIC_PUBLIC_KEY=${pubHex}`);
  console.log(`PRIVATE_KEY=${privHex}`);
  console.log("\n⚠️ PERINGATAN: Simpan PRIVATE_KEY di tempat yang sangat aman.");
  console.log("Jangan pernah bagikan PRIVATE_KEY kepada siapapun!\n");
}

generateKeys();
