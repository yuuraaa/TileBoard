import { Col, Row } from "react-bootstrap";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DraftGroup } from "../utils/configDraft";
import { SortableCard } from "./SortableCard";

interface EditableGroupSectionProps {
  group: DraftGroup;
  onEditGroup: () => void;
  onDeleteGroup: () => void;
  onAddCard: () => void;
  onEditCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
}

export function EditableGroupSection({
  group,
  onEditGroup,
  onDeleteGroup,
  onAddCard,
  onEditCard,
  onDeleteCard,
}: EditableGroupSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id, data: { type: "group" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <section ref={setNodeRef} style={style} className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <button
          type="button"
          className="btn btn-sm btn-light border"
          aria-label="ドラッグしてグループを並び替え"
          {...attributes}
          {...listeners}
        >
          <i className="bi bi-grip-vertical" aria-hidden="true" />
        </button>
        <h2 className="h5 mb-0">{group.title}</h2>
        <div className="d-flex gap-1 ms-auto">
          <button
            type="button"
            className="btn btn-sm btn-light border"
            aria-label="グループを編集"
            onClick={onEditGroup}
          >
            <i className="bi bi-pencil" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-light border text-danger"
            aria-label="グループを削除"
            onClick={onDeleteGroup}
          >
            <i className="bi bi-trash" aria-hidden="true" />
          </button>
        </div>
      </div>

      <SortableContext
        items={group.cards.map((entry) => entry.id)}
        strategy={rectSortingStrategy}
      >
        <Row xs={1} sm={2} lg={3} xl={4} className="g-3">
          {group.cards.map((entry) => (
            <Col key={entry.id}>
              <SortableCard
                id={entry.id}
                card={entry.card}
                onEdit={() => onEditCard(entry.id)}
                onDelete={() => onDeleteCard(entry.id)}
              />
            </Col>
          ))}
          <Col>
            <button
              type="button"
              className="btn btn-outline-secondary h-100 w-100 d-flex align-items-center justify-content-center gap-2"
              style={{ minHeight: 72 }}
              onClick={onAddCard}
            >
              <i className="bi bi-plus-lg" aria-hidden="true" />
              カードを追加
            </button>
          </Col>
        </Row>
      </SortableContext>
    </section>
  );
}
