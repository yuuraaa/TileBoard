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

// crypto.randomUUID() はセキュアコンテキスト（HTTPS/localhost）でしか使えないため、
// LAN内のプレーンHTTPアクセスも想定するこのアプリでは crypto.getRandomValues() で代替する。
// 生成したIDは編集中のみ使う一時キーでありYAMLへは書き出さないため、暗号学的な強度は不要。
function newId(): string {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }

  if (typeof crypto?.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// カードが1件も無いグループにもドロップできるよう、カード列コンテナ自体を
// 別名前空間のドロップ先として登録するための識別子
export function cardContainerId(groupId: string): string {
  return `container-${groupId}`;
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

export function moveCardToGroup(
  draft: DraftConfig,
  cardId: string,
  fromGroupId: string,
  toGroupId: string,
  beforeCardId?: string,
): DraftConfig {
  if (fromGroupId === toGroupId) return draft;

  const fromGroup = draft.groups.find((group) => group.id === fromGroupId);
  const entry = fromGroup?.cards.find((card) => card.id === cardId);

  if (!fromGroup || !entry) return draft;

  return {
    groups: draft.groups.map((group) => {
      if (group.id === fromGroupId) {
        return {
          ...group,
          cards: group.cards.filter((card) => card.id !== cardId),
        };
      }

      if (group.id === toGroupId) {
        const insertAt = beforeCardId
          ? group.cards.findIndex((card) => card.id === beforeCardId)
          : -1;
        const cards = [...group.cards];
        cards.splice(insertAt === -1 ? cards.length : insertAt, 0, entry);
        return { ...group, cards };
      }

      return group;
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
