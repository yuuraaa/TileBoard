import { useState } from "react";
import { Alert, Button, Container, Spinner } from "react-bootstrap";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Card } from "backend/schema";
import { useConfig } from "./hooks/useConfig";
import { useConfigEditor } from "./hooks/useConfigEditor";
import { useTheme } from "./hooks/useTheme";
import { fromDraft } from "./utils/configDraft";
import { GroupSection } from "./components/GroupSection";
import { EditableGroupSection } from "./components/EditableGroupSection";
import { CardFormModal } from "./components/CardFormModal";
import { GroupFormModal } from "./components/GroupFormModal";
import { ConfirmDialog } from "./components/ConfirmDialog";

type GroupModalState =
  { mode: "add" } | { mode: "edit"; groupId: string; title: string };

type CardModalState =
  | { mode: "add"; groupId: string }
  | { mode: "edit"; groupId: string; cardId: string; card: Card };

function App() {
  const { theme, toggleTheme } = useTheme();
  const { config, loading, error, reload, setConfig } = useConfig();
  const editor = useConfigEditor({ config, onSaved: setConfig });
  const {
    isEditing,
    draft,
    saving,
    saveError,
    startEditing,
    cancelEditing,
    save,
    addGroupToDraft,
    updateGroupTitle,
    removeGroupFromDraft,
    reorderGroups,
    addCardToDraft,
    updateCardInDraft,
    removeCardFromDraft,
    reorderCards,
    moveCardAcrossGroups,
  } = editor;

  const [groupModal, setGroupModal] = useState<GroupModalState | null>(null);
  const [cardModal, setCardModal] = useState<CardModalState | null>(null);
  const [confirmDeleteGroupId, setConfirmDeleteGroupId] = useState<
    string | null
  >(null);
  const [confirmDeleteCard, setConfirmDeleteCard] = useState<{
    groupId: string;
    cardId: string;
  } | null>(null);
  const [confirmCancelEditing, setConfirmCancelEditing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.data.current?.type !== "card") return;

    const fromGroupId = active.data.current?.groupId as string | undefined;
    const overType = over.data.current?.type;
    const toGroupId =
      overType === "card" || overType === "container"
        ? (over.data.current?.groupId as string | undefined)
        : undefined;

    if (!fromGroupId || !toGroupId || fromGroupId === toGroupId) return;

    moveCardAcrossGroups(
      String(active.id),
      fromGroupId,
      toGroupId,
      overType === "card" ? String(over.id) : undefined,
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const type = active.data.current?.type;
    if (type === "group") {
      reorderGroups(String(active.id), String(over.id));
    } else if (type === "card" && over.data.current?.type === "card") {
      reorderCards(String(active.id), String(over.id));
    }
  };

  const isDirty =
    draft !== null &&
    config !== null &&
    JSON.stringify(fromDraft(draft)) !== JSON.stringify(config);

  const handleCancelEditing = () => {
    if (isDirty) {
      setConfirmCancelEditing(true);
      return;
    }
    cancelEditing();
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">TileBoard</h1>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={toggleTheme}
            aria-label="テーマ切り替え"
          >
            <i
              className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon-stars"}`}
              aria-hidden="true"
            />
          </Button>
          {!loading && !error && config && (
            <>
              {isEditing ? (
                <>
                  <Button
                    variant="outline-secondary"
                    onClick={handleCancelEditing}
                    disabled={saving}
                  >
                    キャンセル
                  </Button>
                  <Button variant="primary" onClick={save} disabled={saving}>
                    {saving ? "保存中..." : "保存"}
                  </Button>
                </>
              ) : (
                <Button variant="outline-primary" onClick={startEditing}>
                  <i className="bi bi-pencil me-1" aria-hidden="true" />
                  編集
                </Button>
              )}
            </>
          )}
        </div>
      </div>

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

      {saveError && <Alert variant="danger">{saveError}</Alert>}

      {!loading &&
        !error &&
        config &&
        !isEditing &&
        (config.groups.length === 0 ? (
          <p className="text-muted">グループがありません</p>
        ) : (
          config.groups.map((group, index) => (
            <GroupSection key={index} group={group} />
          ))
        ))}

      {!loading && !error && isEditing && draft && (
        <DndContext
          sensors={sensors}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={draft.groups.map((group) => group.id)}
            strategy={verticalListSortingStrategy}
          >
            {draft.groups.map((group) => (
              <EditableGroupSection
                key={group.id}
                group={group}
                onEditGroup={() =>
                  setGroupModal({
                    mode: "edit",
                    groupId: group.id,
                    title: group.title,
                  })
                }
                onDeleteGroup={() => setConfirmDeleteGroupId(group.id)}
                onAddCard={() =>
                  setCardModal({ mode: "add", groupId: group.id })
                }
                onEditCard={(cardId) => {
                  const entry = group.cards.find((c) => c.id === cardId);
                  if (!entry) return;
                  setCardModal({
                    mode: "edit",
                    groupId: group.id,
                    cardId,
                    card: entry.card,
                  });
                }}
                onDeleteCard={(cardId) =>
                  setConfirmDeleteCard({ groupId: group.id, cardId })
                }
              />
            ))}
          </SortableContext>

          <Button
            variant="outline-secondary"
            className="d-flex align-items-center gap-2"
            onClick={() => setGroupModal({ mode: "add" })}
          >
            <i className="bi bi-plus-lg" aria-hidden="true" />
            グループを追加
          </Button>
        </DndContext>
      )}

      <GroupFormModal
        key={
          groupModal === null
            ? "closed"
            : groupModal.mode === "edit"
              ? `edit-${groupModal.groupId}`
              : "add"
        }
        show={groupModal !== null}
        initialTitle={groupModal?.mode === "edit" ? groupModal.title : null}
        onCancel={() => setGroupModal(null)}
        onSubmit={(title) => {
          if (groupModal?.mode === "edit") {
            updateGroupTitle(groupModal.groupId, title);
          } else {
            addGroupToDraft(title);
          }
          setGroupModal(null);
        }}
      />

      <CardFormModal
        key={
          cardModal === null
            ? "closed"
            : cardModal.mode === "edit"
              ? `edit-${cardModal.cardId}`
              : `add-${cardModal.groupId}`
        }
        show={cardModal !== null}
        initialCard={cardModal?.mode === "edit" ? cardModal.card : null}
        onCancel={() => setCardModal(null)}
        onSubmit={(card) => {
          if (cardModal?.mode === "edit") {
            updateCardInDraft(cardModal.groupId, cardModal.cardId, card);
          } else if (cardModal) {
            addCardToDraft(cardModal.groupId, card);
          }
          setCardModal(null);
        }}
      />

      <ConfirmDialog
        show={confirmDeleteGroupId !== null}
        title="グループを削除"
        message="このグループと内包するすべてのカードを削除します。よろしいですか？"
        onCancel={() => setConfirmDeleteGroupId(null)}
        onConfirm={() => {
          if (confirmDeleteGroupId) removeGroupFromDraft(confirmDeleteGroupId);
          setConfirmDeleteGroupId(null);
        }}
      />

      <ConfirmDialog
        show={confirmDeleteCard !== null}
        title="カードを削除"
        message="このカードを削除します。よろしいですか？"
        onCancel={() => setConfirmDeleteCard(null)}
        onConfirm={() => {
          if (confirmDeleteCard) {
            removeCardFromDraft(
              confirmDeleteCard.groupId,
              confirmDeleteCard.cardId,
            );
          }
          setConfirmDeleteCard(null);
        }}
      />

      <ConfirmDialog
        show={confirmCancelEditing}
        title="編集を終了"
        message="編集内容を破棄します。よろしいですか？"
        confirmLabel="破棄"
        onCancel={() => setConfirmCancelEditing(false)}
        onConfirm={() => {
          setConfirmCancelEditing(false);
          cancelEditing();
        }}
      />
    </Container>
  );
}

export default App;
