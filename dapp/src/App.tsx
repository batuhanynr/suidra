import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Button } from "@radix-ui/themes";
import { useState } from "react";
import { CreateQuestionPage } from "./components/CreateQuestionPage";
import { CreateFormPage } from "./components/CreateFormPage";
import { FormsListPage } from "./components/FormsListPage";

type Page = "questions" | "forms" | "view-forms";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("questions");

  const renderPage = () => {
    switch (currentPage) {
      case "questions":
        return <CreateQuestionPage />;
      case "forms":
        return <CreateFormPage />;
      case "view-forms":
        return <FormsListPage />;
      default:
        return <CreateQuestionPage />;
    }
  };

  return (
    <>
      {/* Header */}
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading>SuiDra - Form Builder</Heading>
        </Box>
        <Box>
          <ConnectButton />
        </Box>
      </Flex>

      {/* Navigation */}
      <Flex gap="2" p="4" style={{ borderBottom: "1px solid var(--gray-a2)" }}>
        <Button
          variant={currentPage === "questions" ? "solid" : "outline"}
          onClick={() => setCurrentPage("questions")}
        >
          Create Questions
        </Button>
        <Button
          variant={currentPage === "forms" ? "solid" : "outline"}
          onClick={() => setCurrentPage("forms")}
        >
          Create Forms
        </Button>
        <Button
          variant={currentPage === "view-forms" ? "solid" : "outline"}
          onClick={() => setCurrentPage("view-forms")}
        >
          View Forms
        </Button>
      </Flex>

      {/* Main Content */}
      <Container p="4">
        {renderPage()}
      </Container>
    </>
  );
}

export default App;
