import type { Card } from "backend/schema";
import { LinkCard } from "./LinkCard";

interface CardRendererProps {
  card: Card;
}

export function CardRenderer({ card }: CardRendererProps) {
  if (card.type === "link") {
    return <LinkCard card={card} />;
  }

  return null;
}
