import { useCallback, useState } from "react";
import type { Card, Config } from "backend/schema";
import { updateConfig } from "../api/client";
import {
  addCard,
  addGroup,
  createDraftCard,
  createDraftGroup,
  findGroupIdByCardId,
  fromDraft,
  moveCard,
  moveGroup,
  removeCard,
  removeGroup,
  toDraft,
  updateCard,
  updateGroup,
  type DraftConfig,
} from "../utils/configDraft";

interface UseConfigEditorParams {
  config: Config | null;
  onSaved: (config: Config) => void;
}

interface UseConfigEditorResult {
  isEditing: boolean;
  draft: DraftConfig | null;
  saving: boolean;
  saveError: string | null;
  startEditing: () => void;
  cancelEditing: () => void;
  save: () => Promise<void>;
  addGroupToDraft: (title: string) => void;
  updateGroupTitle: (groupId: string, title: string) => void;
  removeGroupFromDraft: (groupId: string) => void;
  reorderGroups: (activeId: string, overId: string) => void;
  addCardToDraft: (groupId: string, card: Card) => void;
  updateCardInDraft: (groupId: string, cardId: string, card: Card) => void;
  removeCardFromDraft: (groupId: string, cardId: string) => void;
  reorderCards: (activeId: string, overId: string) => void;
}

export function useConfigEditor({
  config,
  onSaved,
}: UseConfigEditorParams): UseConfigEditorResult {
  const [draft, setDraft] = useState<DraftConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isEditing = draft !== null;

  const startEditing = useCallback(() => {
    if (!config) return;
    setDraft(toDraft(config));
    setSaveError(null);
  }, [config]);

  const cancelEditing = useCallback(() => {
    setDraft(null);
    setSaveError(null);
  }, []);

  const save = useCallback(async () => {
    if (!draft) return;

    setSaving(true);
    setSaveError(null);

    try {
      const saved = await updateConfig(fromDraft(draft));
      onSaved(saved);
      setDraft(null);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "設定の保存に失敗しました",
      );
    } finally {
      setSaving(false);
    }
  }, [draft, onSaved]);

  const addGroupToDraft = useCallback((title: string) => {
    setDraft((current) =>
      current ? addGroup(current, createDraftGroup(title)) : current,
    );
  }, []);

  const updateGroupTitle = useCallback((groupId: string, title: string) => {
    setDraft((current) =>
      current ? updateGroup(current, groupId, { title }) : current,
    );
  }, []);

  const removeGroupFromDraft = useCallback((groupId: string) => {
    setDraft((current) => (current ? removeGroup(current, groupId) : current));
  }, []);

  const reorderGroups = useCallback((activeId: string, overId: string) => {
    setDraft((current) =>
      current ? moveGroup(current, activeId, overId) : current,
    );
  }, []);

  const addCardToDraft = useCallback((groupId: string, card: Card) => {
    setDraft((current) =>
      current ? addCard(current, groupId, createDraftCard(card)) : current,
    );
  }, []);

  const updateCardInDraft = useCallback(
    (groupId: string, cardId: string, card: Card) => {
      setDraft((current) =>
        current ? updateCard(current, groupId, cardId, card) : current,
      );
    },
    [],
  );

  const removeCardFromDraft = useCallback((groupId: string, cardId: string) => {
    setDraft((current) =>
      current ? removeCard(current, groupId, cardId) : current,
    );
  }, []);

  const reorderCards = useCallback((activeId: string, overId: string) => {
    setDraft((current) => {
      if (!current) return current;
      const groupId = findGroupIdByCardId(current, activeId);
      if (!groupId) return current;
      return moveCard(current, groupId, activeId, overId);
    });
  }, []);

  return {
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
  };
}
