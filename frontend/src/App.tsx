import { Alert, Button, Container, Spinner } from "react-bootstrap";
import { useConfig } from "./hooks/useConfig";
import { GroupSection } from "./components/GroupSection";

function App() {
  const { config, loading, error, reload } = useConfig();

  return (
    <Container className="py-4">
      <h1 className="mb-4">TileBoard</h1>

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">読み込み中...</span>
          </Spinner>
        </div>
      )}

      {!loading && error && (
        <Alert
          variant="danger"
          className="d-flex justify-content-between align-items-center"
        >
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={reload}>
            再試行
          </Button>
        </Alert>
      )}

      {!loading &&
        !error &&
        config &&
        (config.groups.length === 0 ? (
          <p className="text-muted">グループがありません</p>
        ) : (
          config.groups.map((group, index) => (
            <GroupSection key={index} group={group} />
          ))
        ))}
    </Container>
  );
}

export default App;
