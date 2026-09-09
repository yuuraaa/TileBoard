import { arrayMove } from "@dnd-kit/sortable";
import type { Card, Config } from "backend/schema";

// YAMLスキーマにidが無いため、D&Dが要求する安定したキーを編集中だけ付与する
export interface DraftCard {
  id: string;
  card: Card;
}

export interface DraftGroup {
  id: string;
  title: string;
  cards: DraftCard[];
}

export interface DraftConfig {
  groups: DraftGroup[];
}

function newId(): string {
  return crypto.randomUUID();
}

export function toDraft(config: Config): DraftConfig {
  return {
    groups: config.groups.map((group) => ({
      id: newId(),
      title: group.title,
      cards: group.cards.map((card) => ({ id: newId(), card })),
    })),
  };
}

export function fromDraft(draft: DraftConfig): Config {
  return {
    groups: draft.groups.map((group) => ({
      title: group.title,
      cards: group.cards.map((entry) => entry.card),
    })),
  };
}

export function createDraftGroup(title: string): DraftGroup {
  return { id: newId(), title, cards: [] };
}

export function createDraftCard(card: Card): DraftCard {
  return { id: newId(), card };
}

export function addGroup(draft: DraftConfig, group: DraftGroup): DraftConfig {
  return { groups: [...draft.groups, group] };
}

export function updateGroup(
  draft: DraftConfig,
  groupId: string,
  update: Partial<Omit<DraftGroup, "id">>,
): DraftConfig {
  return {
    groups: draft.groups.map((group) =>
      group.id === groupId ? { ...group, ...update } : group,
    ),
  };
}

export function removeGroup(draft: DraftConfig, groupId: string): DraftConfig {
  return { groups: draft.groups.filter((group) => group.id !== groupId) };
}

export function moveGroup(
  draft: DraftConfig,
  activeId: string,
  overId: string,
): DraftConfig {
  const from = draft.groups.findIndex((group) => group.id === activeId);
  const to = draft.groups.findIndex((group) => group.id === overId);

  if (from === -1 || to === -1 || from === to) return draft;

  return { groups: arrayMove(draft.groups, from, to) };
}

export function addCard(
  draft: DraftConfig,
  groupId: string,
  card: DraftCard,
): DraftConfig {
  return {
    groups: draft.groups.map((group) =>
      group.id === groupId
        ? { ...group, cards: [...group.cards, card] }
        : group,
    ),
  };
}

export function updateCard(
  draft: DraftConfig,
  groupId: string,
  cardId: string,
  card: Card,
): DraftConfig {
  return {
    groups: draft.groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            cards: group.cards.map((entry) =>
              entry.id === cardId ? { ...entry, card } : entry,
            ),
          }
        : group,
    ),
  };
}

export function removeCard(
  draft: DraftConfig,
  groupId: string,
  cardId: string,
): DraftConfig {
  return {
    groups: draft.groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            cards: group.cards.filter((entry) => entry.id !== cardId),
          }
        : group,
    ),
  };
}

export function moveCard(
  draft: DraftConfig,
  groupId: string,
  activeId: string,
  overId: string,
): DraftConfig {
  return {
    groups: draft.groups.map((group) => {
      if (group.id !== groupId) return group;

      const from = group.cards.findIndex((entry) => entry.id === activeId);
      const to = group.cards.findIndex((entry) => entry.id === overId);

      if (from === -1 || to === -1 || from === to) return group;

      return { ...group, cards: arrayMove(group.cards, from, to) };
    }),
  };
}

export function findGroupIdByCardId(
  draft: DraftConfig,
  cardId: string,
): string | undefined {
  return draft.groups.find((group) =>
    group.cards.some((entry) => entry.id === cardId),
  )?.id;
}
