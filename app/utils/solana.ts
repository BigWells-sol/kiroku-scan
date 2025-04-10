import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';

// Using Helius public RPC endpoint
const SOLANA_RPC_URL = 'https://rpc.helius.xyz/?api-key=df346764-d15c-460d-8407-25395c29f205';
// Fallback to public RPC if needed
const FALLBACK_RPC_URL = 'https://api.mainnet-beta.solana.com';
const LAMPORTS_PER_SOL = 1000000000;

export type WalletRank = 'A' | 'B' | 'C' | 'D';

export interface WalletAnalysis {
  totalVolume: number;
  rank: WalletRank;
}

export const getWalletRank = (volume: number): WalletRank => {
  if (volume >= 10) return 'A';
  if (volume >= 1) return 'B';
  if (volume >= 0.2) return 'C';
  return 'D';
};

export const calculateTransactionVolume = async (address: string): Promise<WalletAnalysis> => {
  let connection = new Connection(SOLANA_RPC_URL);
  const publicKey = new PublicKey(address);
  
  try {
    // Get transaction signatures
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 1000 });
    
    if (signatures.length === 0) {
      throw new Error('No transactions found for this wallet');
    }

    let totalVolume = 0;

    // Process each transaction
    for (const signature of signatures) {
      const tx = await connection.getParsedTransaction(signature.signature);
      
      if (!tx || !tx.meta) continue;

      const { preBalances, postBalances } = tx.meta;
      const accountIndex = tx.transaction.message.accountKeys.findIndex(
        (key) => key.pubkey.toBase58() === address
      );

      if (accountIndex === -1) continue;

      const preBalance = preBalances[accountIndex];
      const postBalance = postBalances[accountIndex];
      const difference = Math.abs(postBalance - preBalance);
      
      totalVolume += difference;
    }

    // Convert lamports to SOL
    const totalVolumeInSOL = totalVolume / LAMPORTS_PER_SOL;
    
    return {
      totalVolume: totalVolumeInSOL,
      rank: getWalletRank(totalVolumeInSOL)
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Invalid public key')) {
        throw new Error('Invalid Solana wallet address');
      }
      if (error.message.includes('403') || error.message.includes('429')) {
        // Try fallback RPC
        connection = new Connection(FALLBACK_RPC_URL);
        return calculateTransactionVolume(address);
      }
    }
    throw error;
  }
}; 