import { z } from "zod";

const LinkCardSchema = z.object({
  type: z.literal("link"),
  title: z.string(),
  url: z.string().url({ message: "有効なURLを入力してください" }),
  // walkxcode/dashboard-icons のサービス名スラッグ（例: "github"）。フロント側でCDN URLに変換する
  icon: z.string().optional(),
  description: z.string().optional(),
});

export const CardSchema = z.discriminatedUnion("type", [LinkCardSchema]);

export const GroupSchema = z.object({
  title: z.string(),
  cards: z.array(CardSchema),
});

export const ConfigSchema = z.object({
  groups: z.array(GroupSchema),
});

export type Card = z.infer<typeof CardSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type Config = z.infer<typeof ConfigSchema>;
