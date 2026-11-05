/** Small Lucide icon in a tinted box — use instead of emoji in stat cards & actions */

export function IconBadge({ Icon, color = "#6366F1", size = 16, box = 34 }) {
  if (!Icon) return null
  return (
    <div
      style={{
        width: box,
        height: box,
        borderRadius: "10px",
        background: `${color}22`,
        border: `1px solid ${color}33`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={size} color={color} strokeWidth={2} />
    </div>
  )
}

export function ActionRow({ Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 10px",
        borderRadius: "8px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        color: "white",
        fontSize: "10px",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      {Icon && <Icon size={14} color="#a5b4fc" strokeWidth={2} />}
      <span>{label}</span>
    </button>
  )
}
