import hash from "hash.js";

export function createMerkleRoot(leaves: string[]): string {
  if (leaves.length === 0) return "";
  if (leaves.length === 1) return hash.sha256().update(leaves[0]).digest('hex');

  let currentLevel = leaves.map(leaf => hash.sha256().update(leaf).digest('hex'));

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        nextLevel.push(hash.sha256().update(currentLevel[i] + currentLevel[i + 1]).digest('hex'));
      } else {
        nextLevel.push(currentLevel[i]);
      }
    }
    currentLevel = nextLevel;
  }

  return currentLevel[0];
}

export function generateVoteHash(voterId: string, candidateId: string, previousHash: string, timestamp: string): string {
  return hash.sha256().update(voterId + candidateId + previousHash + timestamp).digest('hex');
}
