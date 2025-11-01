import { useState } from "react";
import { Box, Button, Heading } from "@radix-ui/themes";
import { useCreateForm, useAddQuestion, useListForm } from "../hooks";
import { Form } from "../types";

export function CreateQuestionPage() {
  // Form creation state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [currentForm, setCurrentForm] = useState<string | null>(null);
  
  // Question creation state
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionDescription, setQuestionDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [image, setImage] = useState<string>("");
  
  // Local state for created forms
  const [createdForms, setCreatedForms] = useState<Form[]>([]);
  
  const { createForm } = useCreateForm();
  const { addQuestion } = useAddQuestion();
  const { listForm } = useListForm();

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Create Form first
  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formTitle || !formDescription) {
      alert("Please fill form title and description");
      return;
    }

    try {
      const result = await createForm(formTitle, formDescription);
      
      setCurrentForm(result.id);
      
      // Add to local list
      const newForm: Form = {
        id: result.id,
        title: formTitle,
        description: formDescription,
        questions: [],
        creator: "current-user",
        isActive: false
      };
      
      setCreatedForms([...createdForms, newForm]);
      
      alert("Form created successfully! Now you can add questions.");
    } catch (error) {
      alert("Error creating form: " + (error as Error).message);
    }
  };

  // Add Question to existing Form
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentForm) {
      alert("Please create a form first");
      return;
    }
    
    if (!questionTitle || !questionDescription || options.some(opt => !opt)) {
      alert("Please fill all question fields");
      return;
    }

    try {
      await addQuestion(currentForm, questionTitle, questionDescription, options);
      
      // Reset question form
      setQuestionTitle("");
      setQuestionDescription("");
      setOptions(["", ""]);
      setImage("");
      
      alert("Question added successfully!");
    } catch (error) {
      alert("Error adding question: " + (error as Error).message);
    }
  };

  // List Form (make it public)
  const handleListForm = async (formId: string) => {
    try {
      await listForm(formId);
      alert("Form listed successfully! It's now public.");
    } catch (error) {
      alert("Error listing form: " + (error as Error).message);
    }
  };

  return (
    <Box>
      <Heading style={{ marginBottom: "1rem" }}>Create Forms & Questions</Heading>
      
      {/* Step 1: Create Form */}
      {!currentForm && (
        <div style={{ 
          border: "2px solid #4CAF50", 
          padding: "1rem", 
          marginBottom: "1rem",
          borderRadius: "8px",
          backgroundColor: "#f9fff9"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#4CAF50" }}>Step 1: Create a Form</h3>
          <form onSubmit={handleCreateForm}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Form Title
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter form title"
                style={{ 
                  width: "100%", 
                  padding: "8px", 
                  borderRadius: "4px", 
                  border: "1px solid #ccc" 
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Form Description
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter form description"
                style={{ 
                  width: "100%", 
                  padding: "8px", 
                  borderRadius: "4px", 
                  border: "1px solid #ccc" 
                }}
              />
            </div>

            <Button type="submit" size="3">
              Create Form
            </Button>
          </form>
        </div>
      )}

      {/* Step 2: Add Questions */}
      {currentForm && (
        <div style={{ 
          border: "2px solid #2196F3", 
          padding: "1rem", 
          marginBottom: "1rem",
          borderRadius: "8px",
          backgroundColor: "#f9fdff"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#2196F3" }}>
            Step 2: Add Questions to Form
          </h3>
          <form onSubmit={handleAddQuestion}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Question Title
              </label>
              <input
                type="text"
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
                placeholder="Enter question title"
                style={{ 
                  width: "100%", 
                  padding: "8px", 
                  borderRadius: "4px", 
                  border: "1px solid #ccc" 
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Question Description
              </label>
              <input
                type="text"
                value={questionDescription}
                onChange={(e) => setQuestionDescription(e.target.value)}
                placeholder="Enter question description"
                style={{ 
                  width: "100%", 
                  padding: "8px", 
                  borderRadius: "4px", 
                  border: "1px solid #ccc" 
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Question Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ 
                  width: "100%", 
                  padding: "8px", 
                  borderRadius: "4px", 
                  border: "1px solid #ccc" 
                }}
              />
              {image && (
                <div style={{ marginTop: "0.5rem" }}>
                  <img 
                    src={image} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: "200px", 
                      maxHeight: "200px", 
                      borderRadius: "4px",
                      border: "1px solid #ccc"
                    }} 
                  />
                </div>
              )}
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Options
              </label>
              {options.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  style={{ 
                    width: "100%", 
                    padding: "8px", 
                    borderRadius: "4px", 
                    border: "1px solid #ccc",
                    marginBottom: "8px"
                  }}
                />
              ))}
              <Button type="button" variant="outline" onClick={addOption}>
                Add Option
              </Button>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <Button type="submit" size="3">
                Add Question
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentForm(null)}
              >
                Create New Form
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Created Forms List */}
      <Box>
        <Heading size="4" style={{ marginBottom: "1rem" }}>
          My Forms ({createdForms.length})
        </Heading>
        {createdForms.map((form) => (
          <div key={form.id} style={{ 
            border: "1px solid #e0e0e0", 
            padding: "1rem", 
            marginBottom: "0.5rem",
            borderRadius: "8px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 0.5rem 0" }}>{form.title}</h3>
                <p style={{ margin: "0 0 0.5rem 0", color: "#666" }}>{form.description}</p>
                <div>
                  <strong>Questions:</strong> {form.questions.length}
                  <span style={{ 
                    marginLeft: "1rem", 
                    color: form.isActive ? "green" : "orange" 
                  }}>
                    {form.isActive ? "Public" : "Private"}
                  </span>
                </div>
              </div>
              <div>
                {!form.isActive && (
                  <Button 
                    variant="solid" 
                    onClick={() => handleListForm(form.id)}
                    size="2"
                  >
                    Make Public
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {createdForms.length === 0 && (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            No forms created yet. Create your first form above!
          </p>
        )}
      </Box>
    </Box>
  );
}