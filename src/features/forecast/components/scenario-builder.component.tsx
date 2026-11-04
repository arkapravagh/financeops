/** Scenario panel: pick a scenario, adjust its levers, pin it for comparison or reset. */

import { Bookmark, CopyPlus, Pencil, RotateCcw } from "lucide-react";
import { useState } from "react";
import { scenarioBuilderLabels as L, scenarioNames } from "../../../language/en/forecast.lang";
import { Button } from "../../../shared/ui/button.component";
import type { LibraryScenario, Scenario } from "../../../types/forecast.types";
import { sameAssumptions } from "../scenario.model";
import { ScenarioLevers } from "./scenario-levers.component";
import { ScenarioPicker } from "./scenario-picker.component";
import { ScenarioSection } from "./scenario-section.component";

/** The scenario in the panel, picker options, and callbacks for change, compare, create and edit. */
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

/** The Forecast page's right-hand panel. Any lever edit turns the scenario into an unsaved "Your scenario". */
export function ScenarioBuilder({ scenario: s, current, options, origin, canSave, onChange, onSave, onCreateCustom, onEditCustom }: ScenarioBuilderProps) {
  const [name, setName] = useState("");
  // Any manual edit turns the panel into an unsaved "working" scenario.
  const set = (patch: Partial<Scenario>) => onChange({ ...s, ...patch, id: "working", name: scenarioNames.working });
  const isCurrent = sameAssumptions(s, current);
  const selected = options.find((o) => o.id === s.id);

  return (
    <div className="flex flex-col">
      <ScenarioSection title={L.startFrom} aside={L.count(options.length)}>
        <ScenarioPicker options={options} selectedId={s.id} onSelect={(p) => onChange(p)} onCreate={onCreateCustom} />
        {selected?.description && <p className="mt-2 text-xs text-ink-2">{selected.description}</p>}
        <div className="mt-2 flex flex-wrap gap-1">
          {selected?.custom ? (
            <Button variant="ghost" className="h-8 px-2 text-[13px]" icon={<Pencil size={13} />} onClick={() => onEditCustom(selected)}>
              {L.editCustom}
            </Button>
          ) : (
            <Button variant="ghost" className="h-8 px-2 text-[13px]" icon={<CopyPlus size={13} />} onClick={onCreateCustom}>
              {s.id === "working" ? L.saveAsCustom : L.customiseCopy}
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
            <span className="sr-only">{L.compareName}</span>
            <input
              className={`${field} w-full`}
              placeholder={isCurrent ? L.pickFirst : L.compareName}
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
            title={canSave ? L.compareTitle : L.compareFull}
          >
            {L.compare}
          </Button>
        </form>
        <Button variant="ghost" icon={<RotateCcw size={14} />} onClick={() => onChange(current)} disabled={isCurrent && s.id === "current"}>
          {L.reset}
        </Button>
      </div>
    </div>
  );
}
