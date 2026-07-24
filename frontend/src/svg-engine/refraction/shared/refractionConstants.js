// Shared physics + layout for all refraction intro parts (NCERT Ch.9)
import { snellsLaw } from "../../shared/PhysicsEngine";

export const W = 560;
export const H = 400;
export const CX = 280;
export const SY = 200;

export const N_AIR = 1.0;
export const N_WATER = 1.33;
export const I_DEG = 40;
export const R_DEG = Math.round(snellsLaw(N_AIR, N_WATER, I_DEG)); // 29°

export const I_RAD = (I_DEG * Math.PI) / 180;
export const R_RAD = (R_DEG * Math.PI) / 180;
export const RAY = 155;

export const IX1 = CX - RAY * Math.sin(I_RAD);
export const IY1 = SY - RAY * Math.cos(I_RAD);
export const RX2 = CX + RAY * Math.sin(R_RAD);
export const RY2 = SY + RAY * Math.cos(R_RAD);

export const NY_TOP = SY - 160;
export const NY_BOT = SY + 155;
export const AR = 56;

export function arcAbove(cx, cy, r, a1, a2) {
  const r1 = (a1 * Math.PI) / 180;
  const r2 = (a2 * Math.PI) / 180;
  const x1 = cx + r * Math.sin(r1);
  const y1 = cy - r * Math.cos(r1);
  const x2 = cx + r * Math.sin(r2);
  const y2 = cy - r * Math.cos(r2);
  return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 0,1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
}

export function arcBelow(cx, cy, r, a1, a2) {
  const r1 = (a1 * Math.PI) / 180;
  const r2 = (a2 * Math.PI) / 180;
  const x1 = cx + r * Math.sin(r1);
  const y1 = cy + r * Math.cos(r1);
  const x2 = cx + r * Math.sin(r2);
  const y2 = cy + r * Math.cos(r2);
  return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 0,0 ${x2.toFixed(2)},${y2.toFixed(2)}`;
}

export const INC_ARC = arcAbove(CX, SY, AR, -I_DEG, 0);
export const REF_ARC = arcBelow(CX, SY, AR, 0, R_DEG);

export const I_LX = CX + (AR + 24) * Math.sin((-I_DEG / 2) * (Math.PI / 180));
export const I_LY = SY - (AR + 24) * Math.cos((-I_DEG / 2) * (Math.PI / 180));
export const R_LX = CX + (AR + 24) * Math.sin((R_DEG / 2) * (Math.PI / 180));
export const R_LY = SY + (AR + 24) * Math.cos((R_DEG / 2) * (Math.PI / 180));

export const CAPTIONS = [
  {
    top: { text: "Part 1 — The Two Mediums", color: "#1D4ED8" },
    bot: { text: "AIR (n=1.00): light is faster   |   WATER (n=1.33): light is slower", color: "#4B5563" },
  },
  {
    top: { text: "Part 2 — Real-Life Example: Straw in Water", color: "#B45309" },
    bot: { text: "Straw looks BENT — because light bends at the boundary (Refraction!)", color: "#4B5563" },
  },
  {
    top: { text: "Part 3 — The Incident Ray", color: "#2563EB" },
    bot: { text: "Blue ray = Incident Ray, hits the surface at Point of Incidence (P)", color: "#4B5563" },
  },
  {
    top: { text: "Part 4 — The Normal", color: "#4B5563" },
    bot: { text: "All angles in refraction are measured from the Normal — NOT the surface!", color: "#DC2626" },
  },
  {
    top: { text: "Part 5 — The Refracted Ray", color: "#0D9488" },
    bot: { text: "Teal ray bends TOWARD Normal — light entered denser medium (water)", color: "#4B5563" },
  },
  {
    top: { text: "Part 6 — Angle of Incidence (i) and Angle of Refraction (r)", color: "#064E3B" },
    bot: { text: `i = ${I_DEG}°  |  r = ${R_DEG}°  |  r < i  →  confirms ray bent toward Normal ✓`, color: "#065F46" },
  },
];
