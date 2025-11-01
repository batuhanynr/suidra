import { Box, Heading } from "@radix-ui/themes";
import { useForms } from "../hooks";

export function CreateFormPage() {
  const { forms, loading } = useForms();

  if (loading) {
    return (
      <Box>
        <Heading style={{ marginBottom: "1rem" }}>My Created Forms</Heading>
        <p>Loading forms from blockchain...</p>
      </Box>
    );
  }

  return (
    <Box>
      <Heading style={{ marginBottom: "1rem" }}>My Created Forms</Heading>
      
      <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#f0f8ff", borderRadius: "8px" }}>
        <p style={{ margin: 0, color: "#0066cc" }}>
          💡 <strong>Tip:</strong> Go to "Create Questions" tab to create new forms and add questions to them.
        </p>
      </div>
      
      {/* Forms List */}
      <Box>
        <Heading size="4" style={{ marginBottom: "1rem" }}>
          All My Forms ({forms.length})
        </Heading>
        
        {forms.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "2rem", 
            color: "#666",
            border: "2px dashed #ddd",
            borderRadius: "8px"
          }}>
            <p style={{ margin: "0 0 1rem 0", fontSize: "1.2rem" }}>📝</p>
            <p style={{ margin: 0 }}>
              You haven't created any forms yet.<br />
              Go to "Create Questions" tab to get started!
            </p>
          </div>
        ) : (
          forms.map((form) => (
            <div key={form.id} style={{ 
              border: "1px solid #e0e0e0", 
              padding: "1rem", 
              marginBottom: "0.5rem",
              borderRadius: "8px",
              backgroundColor: form.isActive ? "#f9fff9" : "#fff9f0"
            }}>
              <h3 style={{ margin: "0 0 0.5rem 0" }}>{form.title}</h3>
              <p style={{ margin: "0 0 0.5rem 0", color: "#666" }}>{form.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Questions:</strong> {form.questions.length}
                </div>
                <span style={{ 
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  backgroundColor: form.isActive ? "#4CAF50" : "#FF9800",
                  color: "white"
                }}>
                  {form.isActive ? "🌍 Public" : "🔒 Private"}
                </span>
              </div>
              <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#888" }}>
                Form ID: {form.id}
              </div>
            </div>
          ))
        )}
      </Box>
    </Box>
  );
}