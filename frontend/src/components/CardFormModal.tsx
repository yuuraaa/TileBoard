import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import type { Card } from "backend/schema";
import { CardSchema } from "backend/schema";

interface CardFormModalProps {
  show: boolean;
  initialCard: Card | null;
  onSubmit: (card: Card) => void;
  onCancel: () => void;
}

interface FormState {
  title: string;
  url: string;
  icon: string;
  description: string;
}

const EMPTY_FORM: FormState = { title: "", url: "", icon: "", description: "" };

function toFormState(card: Card | null): FormState {
  if (!card) return EMPTY_FORM;
  return {
    title: card.title,
    url: card.url,
    icon: card.icon ?? "",
    description: card.description ?? "",
  };
}

export function CardFormModal({
  show,
  initialCard,
  onSubmit,
  onCancel,
}: CardFormModalProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialCard));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const result = CardSchema.safeParse({
      type: "link",
      title: form.title,
      url: form.url,
      icon: form.icon || undefined,
      description: form.description || undefined,
    });

    if (!result.success || form.title.trim() === "") {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error?.issues ?? []) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      if (form.title.trim() === "" && !fieldErrors.title) {
        fieldErrors.title = "タイトルを入力してください";
      }
      setErrors(fieldErrors);
      return;
    }

    onSubmit(result.data);
  };

  return (
    <Modal show={show} onHide={onCancel} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5 mb-0">
            {initialCard ? "カードを編集" : "カードを追加"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column gap-3">
          <Form.Group controlId="card-title">
            <Form.Label>タイトル</Form.Label>
            <Form.Control
              value={form.title}
              isInvalid={!!errors.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="card-url">
            <Form.Label>URL</Form.Label>
            <Form.Control
              value={form.url}
              isInvalid={!!errors.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://example.com"
            />
            <Form.Control.Feedback type="invalid">
              {errors.url}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="card-icon">
            <Form.Label>
              アイコン<span className="text-muted small ms-1">(任意)</span>
            </Form.Label>
            <Form.Control
              value={form.icon}
              isInvalid={!!errors.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="github"
            />
            <Form.Text muted>
              walkxcode/dashboard-icons のサービス名スラッグ
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              {errors.icon}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="card-description">
            <Form.Label>
              説明<span className="text-muted small ms-1">(任意)</span>
            </Form.Label>
            <Form.Control
              value={form.description}
              isInvalid={!!errors.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <Form.Control.Feedback type="invalid">
              {errors.description}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onCancel}>
            キャンセル
          </Button>
          <Button variant="primary" type="submit">
            {initialCard ? "更新" : "追加"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
