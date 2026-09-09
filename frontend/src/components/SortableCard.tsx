import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "backend/schema";
import { CardRenderer } from "./CardRenderer";

interface SortableCardProps {
  id: string;
  card: Card;
  onEdit: () => void;
  onDelete: () => void;
}

export function SortableCard({
  id,
  card,
  onEdit,
  onDelete,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { type: "card" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="position-relative h-100">
      <CardRenderer card={card} disabled />
      <div className="position-absolute top-0 end-0 d-flex gap-1 p-1">
        <button
          type="button"
          className="btn btn-sm btn-light border"
          aria-label="ドラッグして並び替え"
          {...attributes}
          {...listeners}
        >
          <i className="bi bi-grip-vertical" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-sm btn-light border"
          aria-label="カードを編集"
          onClick={onEdit}
        >
          <i className="bi bi-pencil" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-sm btn-light border text-danger"
          aria-label="カードを削除"
          onClick={onDelete}
        >
          <i className="bi bi-trash" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
