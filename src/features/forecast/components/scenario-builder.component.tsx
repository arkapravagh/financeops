import { Bookmark, CopyPlus, Pencil, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../shared/ui/button.component";
import { sameAssumptions, type LibraryScenario, type Scenario } from "../scenario.model";
import { ScenarioLevers } from "./scenario-levers.component";
import { ScenarioPicker } from "./scenario-picker.component";
import { ScenarioSection } from "./scenario-section.component";

export type ScenarioBuilderProps = {
  scenario: Scenario;
  current: Scenario;
  /** Picker options: custom scenarios first, then the predefined library. */
  options: LibraryScenario[];
  origin: Date;
  canSave: boolean;
  onChange: (s: Scenario) => void;
  onSave: (name: string) => void;
  /** Open the custom-scenario dialog: blank (from the panel's settings) or editing an existing custom one. */
  onCreateCustom: () => void;
  onEditCustom: (s: LibraryScenario) => void;
};

const field =
  "h-9 rounded-md border border-line bg-surface px-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function ScenarioBuilder({ scenario: s, current, options, origin, canSave, onChange, onSave, onCreateCustom, onEditCustom }: ScenarioBuilderProps) {
  const [name, setName] = useState("");
  // Any manual edit turns the panel into an unsaved "working" scenario.
  const set = (patch: Partial<Scenario>) => onChange({ ...s, ...patch, id: "working", name: "Your scenario" });
  const isCurrent = sameAssumptions(s, current);
  const selected = options.find((o) => o.id === s.id);

  return (
    <div className="flex flex-col">
      <ScenarioSection title="Start from" aside={`${options.length} scenarios`}>
        <ScenarioPicker options={options} selectedId={s.id} onSelect={(p) => onChange(p)} onCreate={onCreateCustom} />
        {selected?.description && <p className="mt-2 text-xs text-ink-2">{selected.description}</p>}
        <div className="mt-2 flex flex-wrap gap-1">
          {selected?.custom ? (
            <Button variant="ghost" className="h-8 px-2 text-[13px]" icon={<Pencil size={13} />} onClick={() => onEditCustom(selected)}>
              Edit custom scenario
            </Button>
          ) : (
            <Button variant="ghost" className="h-8 px-2 text-[13px]" icon={<CopyPlus size={13} />} onClick={onCreateCustom}>
              {s.id === "working" ? "Save as custom scenario" : "Customise a copy"}
            </Button>
          )}
        </div>
      </ScenarioSection>

      <ScenarioLevers scenario={s} current={current} origin={origin} onChange={set} />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-4">
        <form
          className="flex min-w-0 flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSave || isCurrent) return;
            onSave(name || s.name);
            setName("");
          }}
        >
          <label className="min-w-0 flex-1">
            <span className="sr-only">Name for the comparison</span>
            <input
              className={`${field} w-full`}
              placeholder={isCurrent ? "Pick a scenario first" : "Name for the comparison"}
              value={name}
              disabled={isCurrent}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <Button
            type="submit"
            variant="primary"
            icon={<Bookmark size={15} />}
            disabled={isCurrent || !canSave}
            title={canSave ? "Pin this scenario to the chart and comparison table" : "You can compare two scenarios. Remove one first."}
          >
            Compare
          </Button>
        </form>
        <Button variant="ghost" icon={<RotateCcw size={14} />} onClick={() => onChange(current)} disabled={isCurrent && s.id === "current"}>
          Reset
        </Button>
      </div>
    </div>
  );
}
