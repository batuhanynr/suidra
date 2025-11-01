import { Transaction } from "@mysten/sui/transactions";
import { suiClient, getKeyPair, getUserAddress } from "../suiClient";
import { TransactionResult, TransactionOptions } from "../types/sui.types";
import { CONTRACTS, GAS_CONFIG } from "../utils/constants";

export class ContractService {
  
  /**
   * Execute a transaction and return the result
   */
  static async executeTransaction(
    transaction: Transaction,
    options: TransactionOptions = {}
  ): Promise<TransactionResult> {
    try {
      const keypair = getKeyPair();
      
      // Set gas budget
      transaction.setGasBudget(options.gasBudget || GAS_CONFIG.DEFAULT_BUDGET);
      
      // Sign and execute transaction
      const result = await suiClient.signAndExecuteTransaction({
        transaction,
        signer: keypair,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
          showBalanceChanges: true,
        },
      });

      if (result.effects?.status?.status !== 'success') {
        return {
          success: false,
          error: result.effects?.status?.error || 'Transaction failed',
        };
      }

      return {
        success: true,
        transactionId: result.digest,
        data: result,
      };
    } catch (error) {
      console.error('Transaction execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a new transaction instance
   */
  static createTransaction(): Transaction {
    return new Transaction();
  }

  /**
   * Get the current user address
   */
  static getUserAddress(): string {
    return getUserAddress();
  }

  /**
   * Get package ID
   */
  static getPackageId(): string {
    return CONTRACTS.PACKAGE_ID;
  }

  /**
   * Get registry ID
   */
  static getRegistryId(): string {
    return CONTRACTS.REGISTRY_ID;
  }
}