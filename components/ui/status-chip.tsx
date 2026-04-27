// components/ui/status-chip.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";

export type OrderStatus =
  | "en_preparation"
  | "produit_non_disponible"
  | "sortie_en_livraison"
  | "probleme_commande"
  | "livree"
  | "reportee"
  | "annulee"
  | "En préparation"
  | "Produit non disponible"
  | "Sortie en livraison"
  | "Probleme dans la commande"
  | "Livrée"
  | "Reportée"
  | "Annulée"
  | string;

type StatusConfig = { 
  variant: "default" | "success" | "warning" | "destructive" | "secondary" | "info";
  label: string;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  // Lowercase keys (from API)
  en_preparation: { variant: "warning", label: "En préparation" },
  produit_non_disponible: { variant: "destructive", label: "Produit non disponible" },
  sortie_en_livraison: { variant: "info", label: "Sortie en livraison" },
  probleme_commande: { variant: "destructive", label: "Problème dans la commande" },
  livree: { variant: "success", label: "Livrée" },
  reportee: { variant: "warning", label: "Reportée" },
  annulee: { variant: "destructive", label: "Annulée" },

  // Capitalized keys (display format)
  "En préparation": { variant: "warning", label: "En préparation" },
  "Produit non disponible": { variant: "destructive", label: "Produit non disponible" },
  "Sortie en livraison": { variant: "info", label: "Sortie en livraison" },
  "Probleme dans la commande": { variant: "destructive", label: "Problème dans la commande" },
  "Livrée": { variant: "success", label: "Livrée" },
  "Reportée": { variant: "warning", label: "Reportée" },
  "Annulée": { variant: "destructive", label: "Annulée" },
};

const FALLBACK: StatusConfig = { variant: "secondary", label: "Unknown" };

function normalizeStatus(s?: string | null): string | undefined {
  if (!s) return undefined;
  const trimmed = s.trim();
  
  // Direct match
  if (STATUS_CONFIG[trimmed]) return trimmed;
  
  // Try lowercase
  const lower = trimmed.toLowerCase();
  if (STATUS_CONFIG[lower]) return lower;
  
  // Try converting to underscore format
  const underscored = lower.replace(/\s+/g, "_").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (STATUS_CONFIG[underscored]) return underscored;
  
  return trimmed;
}

interface StatusChipProps {
  status?: OrderStatus | null;
  className?: string;
}

export default function StatusChip({ status, className }: StatusChipProps) {
  const norm = normalizeStatus(status as string | undefined);
  const config = (norm && STATUS_CONFIG[norm]) || STATUS_CONFIG[status as string] || FALLBACK;

  return (
    <Badge 
      variant={config.variant}
      className={className}
      role="status"
      aria-label={`status-${config.label}`}
    >
      {config.label}
    </Badge>
  );
}
