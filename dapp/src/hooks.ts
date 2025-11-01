import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState, useEffect } from "react";
import { Form } from "./types";

// Simple config for our MVP
export function useContractConfig() {
  const packageId = import.meta.env.VITE_PACKAGE_ID;
  const formsRegistryId = import.meta.env.VITE_FORMS_REGISTRY_ID;
  
  return { packageId, formsRegistryId };
}

// Create Form (not individual questions anymore, based on Move contract)
export function useCreateForm() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { packageId, formsRegistryId } = useContractConfig();

  const createForm = async (title: string, description: string): Promise<{ success: boolean; id: string }> => {
    if (!account) throw new Error("Wallet not connected");
    
    return new Promise((resolve, reject) => {
      const tx = new Transaction();
      
      // Call create_form from Move contract
      tx.moveCall({
        target: `${packageId}::form::create_form`,
        arguments: [
          tx.pure.string(title),
          tx.pure.string(description),
          tx.object(formsRegistryId),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Form created successfully:", result);
            // Extract form ID from transaction result
            const formId = result.digest; // Temporary ID, should extract proper object ID
            resolve({ success: true, id: formId });
          },
          onError: (error) => {
            console.error("Error creating form:", error);
            reject(error);
          },
        }
      );
    });
  };

  return { createForm };
}

// Add Question to Form
export function useAddQuestion() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { packageId } = useContractConfig();

  const addQuestion = async (
    formId: string, 
    title: string, 
    description: string, 
    options: string[]
  ): Promise<{ success: boolean }> => {
    if (!account) throw new Error("Wallet not connected");
    
    return new Promise((resolve, reject) => {
      const tx = new Transaction();
      
      // Call add_question from Move contract
      tx.moveCall({
        target: `${packageId}::form::add_question`,
        arguments: [
          tx.object(formId),
          tx.pure.string(title),
          tx.pure.string(description),
          tx.pure.vector("string", options),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Question added successfully:", result);
            resolve({ success: true });
          },
          onError: (error) => {
            console.error("Error adding question:", error);
            reject(error);
          },
        }
      );
    });
  };

  return { addQuestion };
}

// List Form (make it public)
export function useListForm() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { packageId } = useContractConfig();

  const listForm = async (formId: string): Promise<{ success: boolean }> => {
    if (!account) throw new Error("Wallet not connected");
    
    return new Promise((resolve, reject) => {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${packageId}::form::list_form`,
        arguments: [tx.object(formId)],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Form listed successfully:", result);
            resolve({ success: true });
          },
          onError: (error) => {
            console.error("Error listing form:", error);
            reject(error);
          },
        }
      );
    });
  };

  return { listForm };
}

// Vote on Question
export function useVoteQuestion() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { packageId } = useContractConfig();

  const voteQuestion = async (
    formId: string, 
    questionId: string, 
    optionIndex: number
  ): Promise<{ success: boolean }> => {
    if (!account) throw new Error("Wallet not connected");
    
    return new Promise((resolve, reject) => {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${packageId}::form::vote_question`,
        arguments: [
          tx.object(formId),
          tx.pure.id(questionId),
          tx.pure.u64(optionIndex),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Vote submitted successfully:", result);
            resolve({ success: true });
          },
          onError: (error) => {
            console.error("Error voting:", error);
            reject(error);
          },
        }
      );
    });
  };

  return { voteQuestion };
}

// Fetch Forms from Registry
export function useForms() {
  const client = useSuiClient();
  const { formsRegistryId } = useContractConfig();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        // Get registry object
        const registryObject = await client.getObject({
          id: formsRegistryId,
          options: { showContent: true },
        });

        if (registryObject.data?.content?.dataType === "moveObject") {
          // Extract form IDs from registry
          const fields = (registryObject.data.content as any).fields;
          const formIds = fields.forms || [];

          // Fetch each form
          const formPromises = formIds.map(async (formId: string) => {
            const formObject = await client.getObject({
              id: formId,
              options: { showContent: true },
            });
            
            if (formObject.data?.content?.dataType === "moveObject") {
              const formFields = (formObject.data.content as any).fields;
              return {
                id: formId,
                title: formFields.title,
                description: formFields.description,
                questions: formFields.questions || [],
                creator: formFields.author,
                isActive: formFields.is_active,
              };
            }
            return null;
          });

          const formsData = await Promise.all(formPromises);
          setForms(formsData.filter(Boolean) as Form[]);
        }
      } catch (error) {
        console.error("Error fetching forms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [client, formsRegistryId]);

  return { forms, loading, refetch: () => window.location.reload() };
}