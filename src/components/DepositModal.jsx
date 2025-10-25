'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2 } from 'lucide-react';

export default function DepositModal({ isOpen, onClose, onDeposit }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Mock balance - in a real app, this would come from a hook or context
  const availableBalance = 1000; // Example balance

  useEffect(() => {
    // Reset states when modal is opened/closed
    if (!isOpen) {
      setAmount('');
      setError('');
      setSuccess('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleMaxClick = () => {
    setAmount(availableBalance.toString());
    setError('');
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError('');
      setSuccess('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (amountNum > availableBalance) {
      setError('Insufficient balance');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Call the onDeposit prop with the amount
      await onDeposit(amountNum);
      
      // If successful, show success message
      setSuccess('Deposit successful!');
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Deposit failed:', err);
      setError(err.message || 'Failed to process deposit');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-background rounded-lg shadow-xl border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Deposit PYUSD</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="amount" className="text-sm font-medium text-muted-foreground">
                  Amount (PYUSD)
                </label>
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="text-xs text-primary hover:underline"
                  disabled={isLoading}
                >
                  Max: {availableBalance} PYUSD
                </button>
              </div>
              <div className="relative">
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  className="pr-16 text-lg"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-muted-foreground">PYUSD</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-500 bg-green-50 dark:bg-green-900/20 rounded-md">
                {success}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
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
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Deposit'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
