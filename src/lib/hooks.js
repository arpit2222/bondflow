'use client';

import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { VAULT_ABI, VAULT_ADDRESS, PYUSD_ABI, PYUSD_ADDRESS } from './contracts';

// Custom hook to get user's balance from the Vault contract
export function useUserBalance() {
  const { address } = useAccount();
  
  const { 
    data: balance, 
    error, 
    isLoading, 
    refetch 
  } = useContractRead({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'getUserBalance',
    args: [address],
    watch: true,
    enabled: !!address,
    select: (data) => data ? formatEther(data) : '0'
  });

  return {
    balance: balance || '0',
    isLoading,
    error,
    refetch
  };
}

// Custom hook to get user's PYUSD token balance
export function usePYUSDBalance() {
  const { address } = useAccount();
  
  const { 
    data: balance, 
    error, 
    isLoading, 
    refetch 
  } = useContractRead({
    address: PYUSD_ADDRESS,
    abi: PYUSD_ABI,
    functionName: 'balanceOf',
    args: [address],
    watch: true,
    enabled: !!address,
    select: (data) => data ? formatEther(data) : '0'
  });

  return {
    balance: balance || '0',
    isLoading,
    error,
    refetch
  };
}

// Custom hook to handle PYUSD approval and deposit
export function useDeposit() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { address } = useAccount();

  // Check allowance
  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: PYUSD_ADDRESS,
    abi: PYUSD_ABI,
    functionName: 'allowance',
    args: [address, VAULT_ADDRESS],
    enabled: !!address,
  });

  // Approve transaction
  const { writeAsync: approveAsync } = useContractWrite({
    address: PYUSD_ADDRESS,
    abi: PYUSD_ABI,
    functionName: 'approve',
  });

  // Deposit transaction
  const { writeAsync: depositAsync } = useContractWrite({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'deposit',
  });

  const deposit = async (amount) => {
    if (!address) {
      setError('Please connect your wallet');
      return { success: false };
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const amountWei = parseEther(amount.toString());
      
      // Check if approval is needed
      await refetchAllowance();
      const currentAllowance = allowance || 0n;
      
      if (currentAllowance < amountWei) {
        // Approve PYUSD spending
        const approveTx = await approveAsync({
          args: [VAULT_ADDRESS, amountWei],
        });
        
        await approveTx.wait();
      }
      
      // Execute deposit
      const tx = await depositAsync({
        args: [amountWei],
      });
      
      await tx.wait();
      setIsSuccess(true);
      return { success: true };
      
    } catch (err) {
      console.error('Deposit failed:', err);
      setError(err.shortMessage || err.message || 'Transaction failed');
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deposit,
    isLoading,
    error,
    isSuccess,
  };
}

// Custom hook to handle withdrawals from the Vault
export function useWithdraw() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Withdraw transaction
  const { writeAsync: withdrawAsync } = useContractWrite({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'withdraw',
  });

  const withdraw = async (amount) => {
    if (!amount || amount <= 0) {
      setError('Invalid amount');
      return { success: false };
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const amountWei = parseEther(amount.toString());
      
      // Execute withdrawal
      const tx = await withdrawAsync({
        args: [amountWei],
      });
      
      await tx.wait();
      setIsSuccess(true);
      return { success: true };
      
    } catch (err) {
      console.error('Withdrawal failed:', err);
      setError(err.shortMessage || err.message || 'Transaction failed');
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    withdraw,
    isLoading,
    error,
    isSuccess,
  };
}
