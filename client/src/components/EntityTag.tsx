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

export const EntityTag: React.FC<EntityTagProps> = ({ type, name, onClick, count, selected = false }) => {
  const getStyling = () => {
    switch (type) {
      case "PERSON":
        return {
          bg: selected ? "bg-indigo-600 text-white border-indigo-400" : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300",
          icon: <User className="w-3 h-3 mr-1 text-indigo-600" />
        };
      case "ORG":
        return {
          bg: selected ? "bg-emerald-600 text-white border-emerald-400" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300",
          icon: <Building2 className="w-3 h-3 mr-1 text-emerald-600" />
        };
      case "GPE":
        return {
          bg: selected ? "bg-amber-600 text-white border-amber-400" : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300",
          icon: <MapPin className="w-3 h-3 mr-1 text-amber-600" />
        };
      case "DATE":
        return {
          bg: selected ? "bg-purple-600 text-white border-purple-400" : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300",
          icon: <Calendar className="w-3 h-3 mr-1 text-purple-600" />
        };
      default:
        return {
          bg: selected ? "bg-gray-600 text-white border-gray-400" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300",
          icon: <Tag className="w-3 h-3 mr-1 text-gray-600" />
        };
    }
  };

  const style = getStyling();

  return (
    <button
      type="button"
      onClick={() => onClick && onClick(name, type)}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${style.bg} ${onClick ? "cursor-pointer" : "cursor-default"}`}
      title={`${type}: ${name}`}
    >
      {style.icon}
      <span className="truncate max-w-[140px]">{name}</span>
      {count !== undefined && (
        <span className="ml-1 px-1 py-0.2 rounded-full text-[10px] bg-gray-200 text-gray-700">{count}</span>
      )}
    </button>
  );
};
