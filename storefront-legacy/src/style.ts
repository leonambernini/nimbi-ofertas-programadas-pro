const STYLE_ID = "ofertas-pro-legacy-styles";

const CSS = `
@keyframes op-pulse { 0%,100%{opacity:1} 50%{opacity:.82} }
@keyframes op-shine { 0%{background-position:200% center} 100%{background-position:-200% center} }
@keyframes op-slide { 0%,100%{transform:translateX(0)} 50%{transform:translateX(6px)} }
@keyframes op-tick-pulse { 0%,100%{opacity:1} 50%{opacity:.7} }

.ofertas-pro-root { box-sizing:border-box; width:100%; }
.ofertas-pro-banner {
  position:relative; width:100%; box-sizing:border-box; margin:0;
}
.ofertas-pro-banner--pulse { animation:op-pulse 2s ease-in-out infinite; }
.ofertas-pro-banner--shine {
  background-size:200% 100%;
  animation:op-shine 2.8s linear infinite;
}
.ofertas-pro-banner--slide { animation:op-slide 2.4s ease-in-out infinite; }
.ofertas-pro-banner__inner {
  display:flex; flex-wrap:wrap; align-items:center; gap:12px;
  padding:12px 16px; box-sizing:border-box; width:100%;
}
.ofertas-pro-banner__label {
  font-weight:700; font-size:14px; line-height:1.2; margin:0;
}
.ofertas-pro-banner__label--caps {
  font-size:12px; font-weight:600; letter-spacing:.1em;
  text-transform:uppercase; line-height:1;
}
.ofertas-pro-banner__time {
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
  font-weight:700; font-variant-numeric:tabular-nums; line-height:1;
  padding:6px 10px; border-radius:var(--op-radius-sm,6px); flex-shrink:0;
}
.ofertas-pro-banner__time--large { font-size:18px; padding:0; background:transparent; }
.ofertas-pro-banner__time--urgent {
  font-size:14px; border-radius:999px; padding:6px 12px;
  background:rgba(0,0,0,.25);
}
.ofertas-pro-banner__btn {
  display:inline-flex; align-items:center; justify-content:center;
  padding:8px 14px; border-radius:999px; font-size:12px; font-weight:700;
  text-decoration:none; flex-shrink:0; box-sizing:border-box;
}
.ofertas-pro-banner__full-link {
  position:absolute; inset:0; z-index:2; display:block;
  text-decoration:none; color:transparent; background:transparent;
}
.ofertas-pro-banner__img {
  display:block; width:100%; height:auto; margin:0;
}
.ofertas-pro-banner__img img {
  display:block; width:100%; height:auto; border:0;
}

.ofertas-pro-cd {
  box-sizing:border-box; pointer-events:none;
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
}
.ofertas-pro-cd--badge,
.ofertas-pro-cd--flash,
.ofertas-pro-cd--floating {
  position:absolute; z-index:4; max-width:90%;
  padding:4px 8px; border-radius:var(--op-radius-sm,6px);
  background:var(--op-countdown-bg,#111);
  color:var(--op-countdown-text,#fff);
  font-size:11px; font-weight:700; line-height:1.2;
  white-space:nowrap;
}
.ofertas-pro-cd--tl { top:6px; left:6px; }
.ofertas-pro-cd--tr { top:6px; right:6px; }
.ofertas-pro-cd--bl { bottom:6px; left:6px; }
.ofertas-pro-cd--br { bottom:6px; right:6px; }
.ofertas-pro-cd--bar,
.ofertas-pro-cd--inline,
.ofertas-pro-cd--hero,
.ofertas-pro-cd--urgency,
.ofertas-pro-cd--progress,
.ofertas-pro-cd--banner {
  display:block; width:100%; margin:6px 0; pointer-events:none;
  border-radius:var(--op-radius-sm,6px);
  background:var(--op-countdown-bg,#111);
  color:var(--op-countdown-text,#fff);
  padding:6px 8px; box-sizing:border-box;
  font-size:12px; font-weight:700; line-height:1.3;
}
.ofertas-pro-cd__label {
  display:block; font-size:10px; font-weight:600; opacity:.85;
  margin-bottom:2px; letter-spacing:.02em;
}
.ofertas-pro-cd__time {
  font-variant-numeric:tabular-nums; animation:op-tick-pulse 2s ease-in-out infinite;
}
.ofertas-pro-cd__track {
  margin-top:4px; height:4px; width:100%; border-radius:999px;
  background:rgba(255,255,255,.2); overflow:hidden;
}
.ofertas-pro-cd__fill {
  height:100%; border-radius:999px; background:var(--op-primary,#e11);
  min-width:4%;
}
.ofertas-pro-img-host { position:absolute; inset:0; pointer-events:none; z-index:3; }
`;

export function ensureStylesInjected(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}
