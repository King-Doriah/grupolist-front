import { useState, useRef } from "react";
import { X, ImagePlus, Zap, Loader } from "lucide-react";
import api from "../services/api";
import Switch from "./Switch";

interface Props {
  onClose: () => void;
  onDone: () => void;
}

export default function CreateListModal({ onClose, onDone }: Props) {
  const [produto, setProduto] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [publica, setPublica] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setFoto(f);
    setPreview(URL.createObjectURL(f));
  };
  const drop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] ?? null;
    if (!f) return;
    setFoto(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!produto.trim()) return setError("Informe o nome do produto.");
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("produto", produto.trim());
      fd.append("disponivel", String(publica));
      if (foto) fd.append("foto", foto);
      await api.post("/lists", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onDone();
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Erro ao criar lista.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(6,9,20,0.88)",
        backdropFilter: "blur(14px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{`@media(min-width:640px){.modal-inner{align-self:center !important;border-radius:24px !important;}}`}</style>
      <div
        className="modal-inner anim-slide-up"
        style={{
          width: "100%",
          maxWidth: 520,
          borderRadius: "28px 28px 0 0",
          overflow: "hidden",
          background: "var(--s100)",
          border: "1px solid var(--border-md)",
          boxShadow: "0 -8px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 24px 8px",
          }}
        >
          <div>
            <h2
              className="font-display"
              style={{ fontSize: 22, fontWeight: 800, color: "var(--text-hi)" }}
            >
              Nova lista
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-lo)", marginTop: 4 }}>
              Um token único será gerado para compartilhar
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--s200)",
              border: "none",
              cursor: "pointer",
              color: "var(--text-lo)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            padding: "16px 24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {error && (
            <div
              style={{
                borderRadius: 12,
                padding: "14px 16px",
                fontSize: 15,
                background: "rgba(244,63,94,0.10)",
                border: "1px solid rgba(244,63,94,0.25)",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          {/* Photo upload */}
          <div
            onClick={() => ref.current?.click()}
            onDrop={drop}
            onDragOver={(e) => e.preventDefault()}
            style={{
              height: 140,
              borderRadius: 18,
              overflow: "hidden",
              cursor: "pointer",
              position: "relative",
              background: "var(--s200)",
              border: `2px dashed ${preview ? "transparent" : "var(--border-md)"}`,
            }}
          >
            {preview ? (
              <img
                src={preview}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                alt="preview"
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <ImagePlus size={28} style={{ color: "var(--text-lo)" }} />
                <span style={{ fontSize: 15, color: "var(--text-lo)" }}>
                  Toque para adicionar foto
                </span>
              </div>
            )}
            <input
              ref={ref}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={pick}
            />
          </div>

          {/* Name */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-lo)",
                marginBottom: 8,
              }}
            >
              Nome do produto
            </label>
            <input
              type="text"
              className="field"
              placeholder="Ex: Tênis Nike Air Max — Lote 40/41"
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          {/* Switch */}
          <div
            style={{
              borderRadius: 14,
              padding: "18px 20px",
              background: "var(--s200)",
              border: "1px solid var(--border)",
            }}
          >
            <Switch
              checked={publica}
              onChange={setPublica}
              label="Lista pública"
              sub="Qualquer pessoa com o token pode ver"
            />
          </div>

          {/* Info */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              borderRadius: 14,
              padding: "16px",
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.18)",
            }}
          >
            <Zap
              size={18}
              style={{ color: "#a5b4fc", flexShrink: 0, marginTop: 2 }}
            />
            <p
              style={{
                fontSize: 15,
                color: "var(--text-mid)",
                lineHeight: 1.6,
              }}
            >
              Após criar, copie o{" "}
              <strong style={{ color: "#a5b4fc" }}>token único</strong> e envie
              no grupo do WhatsApp.
            </p>
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="btn btn-pink"
            style={{ fontSize: 17 }}
          >
            {loading ? <Loader size={18} className="spin" /> : "Criar lista"}
          </button>
        </div>
      </div>
    </div>
  );
}
