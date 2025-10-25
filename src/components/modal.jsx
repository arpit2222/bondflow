'use client';

import { X } from 'lucide-react';
import { Button } from './ui/button';

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DepositModal({ isOpen, onClose, onDeposit }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;
    
    setIsLoading(true);
    try {
      await onDeposit(amount);
      onClose();
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deposit PYUSD">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (PYUSD)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Deposit'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function WithdrawModal({ isOpen, onClose, onWithdraw, balance }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;
    
    setIsLoading(true);
    try {
      await onWithdraw(amount);
      onClose();
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Withdraw PYUSD">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="withdraw-amount" className="block text-sm font-medium text-gray-700">
                Amount (PYUSD)
              </label>
              <span className="text-sm text-gray-500">
                Balance: {balance} PYUSD
              </span>
            </div>
            <input
              type="number"
              id="withdraw-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.00"
              step="0.01"
              min="0"
              max={balance}
              required
            />
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => setAmount(balance.toString())}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Max
              </button>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              isLoading={isLoading}
              disabled={isLoading || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
            >
              {isLoading ? 'Processing...' : 'Withdraw'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
