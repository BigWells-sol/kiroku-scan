import { motion } from 'framer-motion';
import { WalletAnalysis } from '../utils/solana';

interface WalletResultProps {
  analysis: WalletAnalysis;
}

const rankColors = {
  A: 'bg-green-500',
  B: 'bg-blue-500',
  C: 'bg-yellow-500',
  D: 'bg-red-500',
};

export default function WalletResult({ analysis }: WalletResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 p-6 bg-white rounded-lg shadow-lg"
    >
      <div className="flex flex-col items-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className={`w-24 h-24 ${rankColors[analysis.rank]} rounded-full flex items-center justify-center text-white text-4xl font-bold`}
        >
          {analysis.rank}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-2xl font-semibold text-gray-800">Total Volume</h3>
          <p className="text-3xl font-bold text-gray-900">
            {analysis.totalVolume.toFixed(2)} SOL
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
} 