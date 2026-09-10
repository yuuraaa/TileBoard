import { describe, expect, it } from "vitest";
import { CardSchema, ConfigSchema, GroupSchema } from "./schema.js";

describe("CardSchema", () => {
  it("正常な link カードを受け入れる", () => {
    const result = CardSchema.safeParse({
      type: "link",
      title: "GitHub",
      url: "https://github.com",
    });
    expect(result.success).toBe(true);
  });

  it("icon・description は省略できる", () => {
    const result = CardSchema.safeParse({
      type: "link",
      title: "GitHub",
      url: "https://github.com",
      icon: "github",
      description: "コード管理",
    });
    expect(result.success).toBe(true);
  });

  it("不正なURLを拒否する", () => {
    const result = CardSchema.safeParse({
      type: "link",
      title: "GitHub",
      url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("titleが欠けている場合は拒否する", () => {
    const result = CardSchema.safeParse({
      type: "link",
      url: "https://github.com",
    });
    expect(result.success).toBe(false);
  });

  it("未知のtypeを拒否する（discriminatedUnion）", () => {
    const result = CardSchema.safeParse({
      type: "unknown",
      title: "GitHub",
      url: "https://github.com",
    });
    expect(result.success).toBe(false);
  });

  it("typeが欠けている場合は拒否する", () => {
    const result = CardSchema.safeParse({
      title: "GitHub",
      url: "https://github.com",
    });
    expect(result.success).toBe(false);
  });
});

describe("GroupSchema", () => {
  it("空のcards配列を許容する", () => {
    const result = GroupSchema.safeParse({ title: "開発", cards: [] });
    expect(result.success).toBe(true);
  });

  it("titleが欠けている場合は拒否する", () => {
    const result = GroupSchema.safeParse({ cards: [] });
    expect(result.success).toBe(false);
  });

  it("cardsに不正なカードが含まれる場合は拒否する", () => {
    const result = GroupSchema.safeParse({
      title: "開発",
      cards: [{ type: "link", title: "GitHub", url: "not-a-url" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("ConfigSchema", () => {
  it("正常なconfig全体を受け入れる", () => {
    const result = ConfigSchema.safeParse({
      groups: [
        {
          title: "開発",
          cards: [{ type: "link", title: "GitHub", url: "https://github.com" }],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("groupsが空配列でも許容する", () => {
    const result = ConfigSchema.safeParse({ groups: [] });
    expect(result.success).toBe(true);
  });

  it("groupsが欠けている場合は拒否する", () => {
    const result = ConfigSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("groupsが配列でない場合は拒否する", () => {
    const result = ConfigSchema.safeParse({ groups: "not-an-array" });
    expect(result.success).toBe(false);
  });
});
