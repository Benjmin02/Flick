import React from "react";
import { C, GRAD, GRAD2, FONT_DISPLAY, BG_GRADIENTS } from "../theme.js";

export function LogoMark({ size = 30 }) {
  return (
    <img
      src="/assets/flick.png"
      alt="Flick"
      width={size}
      height={size}
      style={{ display: "block", objectFit: "contain", borderRadius: size * 0.22 }}
      onError={(e) => { e.currentTarget.style.display = "none"; }}
    />
  );
}

export function FlickMojiAvatar({ flickmoji, size = 52, ring = false }) {
  const fm = flickmoji || { emoji: "😀", bg: 0, accessory: null };
  const grad = BG_GRADIENTS[fm.bg % BG_GRADIENTS.length];
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {ring && <div style={{ position: "absolute", inset: -3, borderRadius: 9999, background: GRAD2 }} />}
      <div
        style={{
          position: "absolute", inset: ring ? 3 : 0, borderRadius: 9999,
          background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.5, border: `2px solid ${C.bg}`,
        }}
      >
        {fm.emoji}
      </div>
      {fm.accessory && (
        <div
          style={{
            position: "absolute", bottom: -2, right: -2, fontSize: size * 0.3,
            background: C.panel2, borderRadius: 9999, width: size * 0.42, height: size * 0.42,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${C.bg}`,
          }}
        >
          {fm.accessory}
        </div>
      )}
    </div>
  );
}

export function GradButton({ children, onClick, disabled, style, small }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? C.panel2 : GRAD,
        color: disabled ? C.faint : "#fff",
        border: "none", borderRadius: 14,
        padding: small ? "8px 16px" : "13px 20px",
        fontFamily: FONT_DISPLAY, fontWeight: 600,
        fontSize: small ? 13 : 15, cursor: disabled ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        transition: "transform 0.15s ease, opacity 0.15s ease",
        ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

export function Toast({ text }) {
  if (!text) return null;
  return (
    <div style={{
      position: "absolute", bottom: 90, left: "50%", transform: "translateX(-50%)",
      background: C.panel2, color: C.text, padding: "10px 18px", borderRadius: 999,
      fontSize: 13, fontFamily: "inherit", border: `1px solid ${C.border}`,
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 200, whiteSpace: "nowrap",
      animation: "flickToastIn 0.2s ease",
    }}>
      {text}
    </div>
  );
}

export function SectionLabel({ children }) {
  return <div style={{ color: C.muted, fontSize: 12.5, margin: "0 0 10px", fontWeight: 500 }}>{children}</div>;
}

export function Checkbox({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 20, height: 20, borderRadius: 6, cursor: "pointer",
        background: checked ? GRAD : "transparent",
        border: checked ? "none" : `1.5px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}
    >
      {checked && <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</div>}
    </div>
  );
}

export function Swatch({ color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0, cursor: "pointer",
        background: color, border: active ? `2px solid ${C.text}` : `2px solid ${C.border}`,
      }}
    />
  );
}

export function ModeTab({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 999,
      border: `1px solid ${active ? "transparent" : C.border}`, background: active ? GRAD : "transparent",
      color: active ? "#fff" : C.muted, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 12.5, cursor: "pointer",
    }}>
      {icon} {label}
    </button>
  );
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "70px 30px 20px", gap: 14 }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: C.panel2, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16 }}>{title}</div>
      {subtitle && <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>{subtitle}</div>}
      {actionLabel && <GradButton small onClick={onAction}>{actionLabel}</GradButton>}
    </div>
  );
}
