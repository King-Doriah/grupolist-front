import {
  type ListStatus,
  STATUS_LABEL,
  STATUS_PILL,
  STATUS_DOT,
} from "../types";

export default function StatusBadge({ status }: { status: ListStatus }) {
  return (
    <span
      className={STATUS_PILL[status] ?? "pill pill-open"}
      style={{ fontSize: 13, whiteSpace: "nowrap" }}
    >
      <span
        className={`w-2 h-2 rounded-full inline-block ${STATUS_DOT[status] ?? "bg-blue-400"}`}
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
