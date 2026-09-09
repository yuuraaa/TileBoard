import { Card } from "react-bootstrap";
import type { Card as CardData } from "backend/schema";
import { CardIcon } from "./CardIcon";

interface LinkCardProps {
  card: Extract<CardData, { type: "link" }>;
}

export function LinkCard({ card }: LinkCardProps) {
  return (
    <Card
      as="a"
      href={card.url}
      target="_blank"
      rel="noopener noreferrer"
      className="h-100 text-decoration-none text-body"
    >
      <Card.Body className="d-flex align-items-center gap-3">
        <CardIcon icon={card.icon} title={card.title} />
        <div className="overflow-hidden">
          <Card.Title as="div" className="mb-0 text-truncate">
            {card.title}
          </Card.Title>
          {card.description && (
            <Card.Text className="text-muted small text-truncate mb-0">
              {card.description}
            </Card.Text>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
