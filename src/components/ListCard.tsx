import { useState } from "react";
import { Copy, Check, Pencil, Globe, Lock } from "lucide-react";
import { type ListItem, safe, fmtDate } from "../types";
import StatusBadge from "./StatusBadge";
import { imgUrl } from "../services/api";

// WhatsApp icon (not in lucide)
function WaIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface Props {
  item: ListItem;
  onEdit: () => void;
}

export default function ListCard({ item, onEdit }: Props) {
  const [copied, setCopied] = useState(false);
  const photo = imgUrl(item.foto);
  const nome = safe(item.produto, "Produto sem nome");
  const date = fmtDate(item.createdAt || item.created_at || "");
  const pub = item.disponivel ?? false;

  // The shareable link pointing to the token route
  const shareLink = `${window.location.origin}/search/${item.token}`;

  // WhatsApp share — opens wa.me with a pre-filled message + link
  const shareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.token) return;
    const msg = encodeURIComponent(
      `Acompanhe o progresso da lista "*${safe(item.produto, "Lista")}*" aqui:\n${shareLink}`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
  };

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.token) return;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="card"
      style={{
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 32px rgba(99,102,241,0.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
      }}
    >
      {/* Photo strip */}
      <div
        style={{ position: "relative", height: 160, background: "var(--s200)" }}
      >
        {photo ? (
          <img
            src={photo}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s",
            }}
            alt={nome}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}
          >
            🛍️
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top,var(--s50) 0%,transparent 55%)",
          }}
        />

        {/* Visibility badge */}
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 10px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: pub ? "#6ee7b7" : "var(--text-lo)",
            }}
          >
            {pub ? <Globe size={11} /> : <Lock size={11} />}
            {pub ? "Pública" : "Privada"}
          </span>
        </div>

        {/* Edit button */}
        <button
          onClick={onEdit}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 40,
            height: 40,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.60)",
            backdropFilter: "blur(8px)",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            opacity: 0.85,
          }}
          title="Editar lista"
        >
          <Pencil size={16} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 18px 18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <h3
            className="font-display"
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "var(--text-hi)",
              lineHeight: 1.3,
              flex: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {nome}
          </h3>
          <StatusBadge status={item.status} />
        </div>

        {/* Token row + share button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {/* Copy link button */}
          <button
            onClick={copy}
            className="token"
            style={{ flex: 1 }}
            title="Copiar link"
          >
            {copied ? (
              <Check size={13} style={{ color: "#34d399" }} />
            ) : (
              <Copy size={13} />
            )}
            {safe(item.token, "—")}
          </button>

          {/* WhatsApp share button */}
          <button
            onClick={shareWhatsApp}
            title="Compartilhar no WhatsApp"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 14px",
              borderRadius: 10,
              cursor: "pointer",
              background: "rgba(37,211,102,0.12)",
              border: "1px solid rgba(37,211,102,0.28)" as any,
              color: "#4ade80",
              fontSize: 13,
              fontWeight: 700,
              transition: "all 0.18s",
              flexShrink: 0,
              minHeight: 36,
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(37,211,102,0.20)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(37,211,102,0.12)";
            }}
          >
            <WaIcon size={14} />
            Partilhar
          </button>
        </div>

        {/* Date */}
        <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 10 }}>
          {date}
        </p>
      </div>
    </div>
  );
}
