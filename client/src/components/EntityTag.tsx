import React from "react";
import { User, Building2, MapPin, Calendar, Tag } from "lucide-react";

export type EntityType = "PERSON" | "ORG" | "GPE" | "DATE" | "GENERIC";

interface EntityTagProps {
  type: EntityType;
  name: string;
  onClick?: (name: string, type: EntityType) => void;
  count?: number;
  selected?: boolean;
}

export const EntityTag: React.FC<EntityTagProps> = ({
  type,
  name,
  onClick,
  count,
  selected = false
}) => {
  const getStyling = () => {
    switch (type) {
      case "PERSON":
        return {
          bg: selected ? "bg-indigo-600 text-white border-indigo-400" : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-400/40",
          icon: <User className="w-3 h-3 mr-1 text-indigo-400" />
        };
      case "ORG":
        return {
          bg: selected ? "bg-emerald-600 text-white border-emerald-400" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-400/40",
          icon: <Building2 className="w-3 h-3 mr-1 text-emerald-400" />
        };
      case "GPE":
        return {
          bg: selected ? "bg-amber-600 text-white border-amber-400" : "bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-400/40",
          icon: <MapPin className="w-3 h-3 mr-1 text-amber-400" />
        };
      case "DATE":
        return {
          bg: selected ? "bg-purple-600 text-white border-purple-400" : "bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-400/40",
          icon: <Calendar className="w-3 h-3 mr-1 text-purple-400" />
        };
      default:
        return {
          bg: selected ? "bg-slate-700 text-white border-slate-500" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700",
          icon: <Tag className="w-3 h-3 mr-1 text-slate-400" />
        };
    }
  };

  const style = getStyling();

  return (
    <button
      type="button"
      onClick={() => onClick && onClick(name, type)}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${style.bg} ${
        onClick ? "cursor-pointer" : "cursor-default"
      }`}
      title={`${type}: ${name}`}
    >
      {style.icon}
      <span className="truncate max-w-[140px]">{name}</span>
      {count !== undefined && (
        <span className="ml-1 px-1 py-0.2 rounded-full text-[10px] bg-black/25">
          {count}
        </span>
      )}
    </button>
  );
};

