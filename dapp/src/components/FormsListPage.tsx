import { useState } from "react";
import { Box, Button, Heading } from "@radix-ui/themes";
import { Form } from "../types";
import { useForms, useVoteQuestion } from "../hooks";

export function FormsListPage() {
  const { forms, loading } = useForms();
  const { voteQuestion } = useVoteQuestion();

  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const handleResponse = (questionId: string, answer: string) => {
    setResponses({ ...responses, [questionId]: answer });
  };

  const submitForm = async () => {
    if (!selectedForm) return;
    
    // For now, just show success - TODO: implement actual blockchain voting
    alert("Form submitted successfully!");
    setResponses({});
    setSelectedForm(null);
  };

  if (loading) {
    return (
      <Box>
        <Heading style={{ marginBottom: "1rem" }}>All Public Forms</Heading>
        <p>Loading forms from blockchain...</p>
      </Box>
    );
  }

  if (selectedForm) {
    return (
      <Box>
        <div style={{ marginBottom: "1rem" }}>
          <Button variant="outline" onClick={() => setSelectedForm(null)}>
            ← Back to Forms
          </Button>
        </div>
        
        <div style={{ 
          border: "1px solid #e0e0e0", 
          padding: "1rem", 
          borderRadius: "8px",
          marginBottom: "1rem"
        }}>
          <Heading size="5" style={{ marginBottom: "0.5rem" }}>
            {selectedForm.title}
          </Heading>
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            {selectedForm.description}
          </p>
          
          {selectedForm.questions.map((_, index) => (
            <div key={index} style={{ 
              marginBottom: "1.5rem", 
              padding: "1rem", 
              backgroundColor: "#f9f9f9",
              borderRadius: "8px"
            }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ marginBottom: "1rem" }}>
                    Question {index + 1}: Coming from blockchain...
                  </h4>
                  <div style={{ marginBottom: "8px" }}>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value="option1"
                        checked={responses[`question-${index}`] === "option1"}
                        onChange={() => handleResponse(`question-${index}`, "option1")}
                        style={{ marginRight: "8px" }}
                      />
                      Option 1 (from blockchain)
                    </label>
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value="option2"
                        checked={responses[`question-${index}`] === "option2"}
                        onChange={() => handleResponse(`question-${index}`, "option2")}
                        style={{ marginRight: "8px" }}
                      />
                      Option 2 (from blockchain)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <Button onClick={submitForm} size="3">
            Submit Form
          </Button>
        </div>
      </Box>
    );
  }

  // Filter only active (public) forms
  const publicForms = forms.filter(form => form.isActive);

  return (
    <Box>
      <Heading style={{ marginBottom: "1rem" }}>All Public Forms</Heading>
      
      <div style={{ marginBottom: "1rem", color: "#666" }}>
        Click on any form to view and fill it out
      </div>
      
      {publicForms.length === 0 && (
        <div style={{ 
          textAlign: "center", 
          padding: "2rem", 
          color: "#666",
          border: "2px dashed #ddd",
          borderRadius: "8px"
        }}>
          <p style={{ margin: "0 0 1rem 0", fontSize: "1.2rem" }}>📋</p>
          <p style={{ margin: 0 }}>
            No public forms available yet.<br />
            Create a form and make it public to see it here!
          </p>
        </div>
      )}
      
      {publicForms.map((form) => (
        <div 
          key={form.id} 
          onClick={() => setSelectedForm(form)}
          style={{ 
            border: "1px solid #e0e0e0", 
            padding: "1rem", 
            marginBottom: "0.5rem",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
        >
          <h3 style={{ margin: "0 0 0.5rem 0" }}>{form.title}</h3>
          <p style={{ margin: "0 0 0.5rem 0", color: "#666" }}>{form.description}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span><strong>Questions:</strong> {form.questions.length}</span>
            <span style={{ 
              color: form.isActive ? "green" : "red",
              fontSize: "0.9rem"
            }}>
              {form.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#888" }}>
            Created by: {form.creator}
          </div>
        </div>
      ))}
    </Box>
  );
}