import { useState } from "react";
import { THEMES, applyTheme, readStoredTheme, type ThemeId } from "../theme/themes";

export const ThemeSwitcher = ({ showLabels = false }: { showLabels?: boolean }) => {
  const [theme, setTheme] = useState<ThemeId>(readStoredTheme);

  const choose = (id: ThemeId) => {
    applyTheme(id);
    setTheme(id);
  };

  return (
    <div role="group" aria-label="Theme" className="flex items-center gap-0.5 rounded-full border border-gray-200 p-0.5">
      {THEMES.map((item) => {
        const selected = theme === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected}
            aria-label={`${item.label} theme`}
            title={`${item.label} theme`}
            onClick={() => choose(item.id)}
            className={`flex min-h-7 min-w-7 cursor-pointer items-center gap-1.5 rounded-full px-1.5 py-1 text-xs transition-colors ${
              selected ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 rounded-full border"
              style={{ backgroundColor: item.swatch, borderColor: item.ring }}
            />
            {showLabels && item.label}
          </button>
        );
      })}
    </div>
  );
};
