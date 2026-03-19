import { useState } from "react";
import { X, Check, Loader } from "lucide-react";
import api, { imgUrl } from "../services/api";
import {
  type ListItem,
  type ListStatus,
  STATUS_FLOW,
  STATUS_LABEL,
  STATUS_DESC,
  STATUS_EMOJI,
} from "../types";
import StatusBadge from "./StatusBadge";
import Switch from "./Switch";
import { safe } from "../types";

interface Props {
  item: ListItem;
  onClose: () => void;
  onDone: () => void;
}

export default function EditListModal({ item, onClose, onDone }: Props) {
  const [status, setStatus] = useState<ListStatus>(item.status);
  const [disponivel, setDisponivel] = useState<boolean>(
    item.disponivel ?? false,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const photo = imgUrl(item.foto);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      await api.patch(`/lists/${item.id}`, { status, disponivel });
      onDone();
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Erro ao atualizar lista.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(8,6,18,0.88)", backdropFilter: "blur(14px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:w-[500px] rounded-t-3xl sm:rounded-2xl overflow-hidden animate-slide-up sm:animate-scale-in"
        style={{
          background: "var(--s100)",
          border: "1px solid var(--border-md)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Product photo header */}
        <div
          className="relative h-32 overflow-hidden"
          style={{ background: "var(--s200)" }}
        >
          {photo ? (
            <img
              src={photo}
              className="w-full h-full object-cover"
              alt={safe(item.produto, "produto")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl select-none">
              🛍️
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top,var(--s100) 0%,transparent 70%)",
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Product name + current status */}
          <div>
            <h2
              className="font-display font-bold text-lg leading-snug"
              style={{ color: "var(--text-hi)" }}
            >
              {safe(item.produto, "Produto sem nome")}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <StatusBadge status={item.status} />
              <span className="token">{safe(item.token, "—")}</span>
            </div>
          </div>

          {error && (
            <div
              className="rounded-xl px-4 py-2.5 text-sm"
              style={{
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.25)",
                color: "#fda4af",
              }}
            >
              {error}
            </div>
          )}

          {/* Status grid */}
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2.5"
              style={{ color: "var(--text-lo)" }}
            >
              Novo status
            </p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_FLOW.map((s) => {
                const active = status === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className="flex items-center gap-3 p-3.5 rounded-xl text-left transition-all"
                    style={{
                      background: active
                        ? "rgba(99,102,241,0.12)"
                        : "var(--s200)",
                      border: `1.5px solid ${active ? "rgba(99,102,241,0.45)" : "var(--border)"}`,
                    }}
                  >
                    <span className="text-xl leading-none">
                      {STATUS_EMOJI[s]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-bold truncate"
                        style={{
                          color: active ? "#a5b4fc" : "var(--text-mid)",
                        }}
                      >
                        {STATUS_LABEL[s]}
                      </p>
                      <p
                        className="text-[10px] mt-0.5 truncate"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {STATUS_DESC[s]}
                      </p>
                    </div>
                    {active && (
                      <Check
                        size={13}
                        style={{ color: "#a5b4fc", flexShrink: 0 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visibility switch */}
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--s200)",
              border: "1px solid var(--border)",
            }}
          >
            <Switch
              checked={disponivel}
              onChange={setDisponivel}
              label="Lista pública"
              sub="Visível para qualquer pessoa com o token"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="btn btn-ghost flex-1 justify-center"
            >
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={loading}
              className="btn btn-pink flex-[2] justify-center"
            >
              {loading ? (
                <Loader size={15} className="spin" />
              ) : (
                "Salvar alterações"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
