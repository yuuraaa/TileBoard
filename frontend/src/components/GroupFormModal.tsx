import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { GroupSchema } from "backend/schema";

interface GroupFormModalProps {
  show: boolean;
  initialTitle: string | null;
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

export function GroupFormModal({
  show,
  initialTitle,
  onSubmit,
  onCancel,
}: GroupFormModalProps) {
  const [title, setTitle] = useState(initialTitle ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const result = GroupSchema.shape.title.safeParse(title);

    if (!result.success || result.data.trim() === "") {
      setError(
        result.error?.issues[0]?.message ?? "タイトルを入力してください",
      );
      return;
    }

    onSubmit(result.data);
  };

  return (
    <Modal show={show} onHide={onCancel} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5 mb-0">
            {initialTitle !== null ? "グループを編集" : "グループを追加"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="group-title">
            <Form.Label>タイトル</Form.Label>
            <Form.Control
              value={title}
              isInvalid={!!error}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">
              {error}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onCancel}>
            キャンセル
          </Button>
          <Button variant="primary" type="submit">
            {initialTitle !== null ? "更新" : "追加"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
