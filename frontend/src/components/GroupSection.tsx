import { Col, Row } from "react-bootstrap";
import type { Group } from "backend/schema";
import { CardRenderer } from "./CardRenderer";

interface GroupSectionProps {
  group: Group;
}

export function GroupSection({ group }: GroupSectionProps) {
  return (
    <section className="mb-4">
      <h2 className="h5 mb-3">{group.title}</h2>
      {group.cards.length === 0 ? (
        <p className="text-muted">カードがありません</p>
      ) : (
        <Row xs={1} sm={2} lg={3} xl={4} className="g-3">
          {group.cards.map((card, index) => (
            <Col key={index}>
              <CardRenderer card={card} />
            </Col>
          ))}
        </Row>
      )}
    </section>
  );
}
