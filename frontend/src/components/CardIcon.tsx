import { useState } from "react";

const DASHBOARD_ICONS_BASE_URL =
  "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png";

interface CardIconProps {
  icon?: string;
  title: string;
}

export function CardIcon({ icon, title }: CardIconProps) {
  const [failed, setFailed] = useState(false);

  if (!icon || failed) {
    return (
      <div
        className="d-flex align-items-center justify-content-center bg-secondary-subtle rounded"
        style={{ width: 40, height: 40, fontSize: "1.1rem", fontWeight: 600 }}
      >
        {title.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={`${DASHBOARD_ICONS_BASE_URL}/${icon}.png`}
      alt=""
      width={40}
      height={40}
      onError={() => setFailed(true)}
    />
  );
}
