import { AspectData, type AspectType } from "../../types/aspect";
import { Widget, type WidgetProps } from "../widgets/Widget";

// A key for the matrix's symbols. Each aspect pairs its symbol with its name, so the meaning
// does not depend on colour.
export const AspectKey = ({ className }: WidgetProps) => (
  <Widget id="aspect-key" title="Aspect key" className={className}>
    <ul className="flex flex-col gap-2">
      {(Object.keys(AspectData) as AspectType[]).map((type) => {
        const info = AspectData[type];
        return (
          <li key={type} className="flex items-center gap-3 text-sm text-gray-800">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base"
              style={{ backgroundColor: `${info.color}22`, color: info.color }}
            >
              {info.glyph}
            </span>
            <span className="font-medium">{info.name}</span>
          </li>
        );
      })}
    </ul>
  </Widget>
);
