import type { Card } from "backend/schema";
import { LinkCard } from "./LinkCard";

interface CardRendererProps {
  card: Card;
  disabled?: boolean;
}

export function CardRenderer({ card, disabled }: CardRendererProps) {
  if (card.type === "link") {
    return <LinkCard card={card} disabled={disabled} />;
  }

  return null;
}
