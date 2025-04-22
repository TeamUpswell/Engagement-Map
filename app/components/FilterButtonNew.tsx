'use client';

interface FilterButtonProps { active: boolean; onClick: () => void; count: number; label: string; }

export default function FilterButtonNew({ active, onClick, count, label }: FilterButtonProps) {
  return (
    <button onClick={onClick} style={{ backgroundColor: active ? "#007bff" : "#f8f9fa", color: active ? "#ffffff" : "#333333", border: `1px solid ${active ? "#0069d9" : "#ddd"}`, borderRadius: "4px", padding: "5px 10px", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.2s ease" }}>
      <span>{label}</span>
      <span style={{ marginLeft: "6px", backgroundColor: active ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)", padding: "2px 6px", borderRadius: "20px", fontSize: "12px" }}>{count}</span>
    </button>
  );
}