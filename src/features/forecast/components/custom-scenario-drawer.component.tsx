import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { formatMonthYear } from "../../../shared/utils/dates.util";
import type { ForecastInput } from "../../../shared/utils/metrics.util";
import { FORECAST_MONTHS } from "../../../services/forecast.service";
import { Button } from "../../../shared/ui/button.component";
import { Drawer } from "../../../shared/ui/drawer.component";
import { evaluateScenario, type LibraryScenario, type Scenario } from "../scenario.model";
import { ScenarioLevers } from "./scenario-levers.component";
import { ScenarioSection } from "./scenario-section.component";

export type CustomScenarioDraft = Omit<LibraryScenario, "category" | "custom" | "id"> & { id?: string };

export type CustomScenarioDrawerProps = {
  open: boolean;
  /** Starting values. Pass an `id` to edit an existing custom scenario. */
  initial: CustomScenarioDraft;
  base: ForecastInput;
  current: Scenario;
  origin: Date;
  /** Names already taken (excluding the one being edited), to warn about duplicates. */
  takenNames: string[];
  onSave: (draft: CustomScenarioDraft) => void;
  onDelete?: () => void;
  onClose: () => void;
};

const input =
  "w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent";

/** Build or edit a reusable scenario. Shows the projected outcome live while you change assumptions. */
export function CustomScenarioDrawer({ open, initial, base, current, origin, takenNames, onSave, onDelete, onClose }: CustomScenarioDrawerProps) {
  const [draft, setDraft] = useState<CustomScenarioDraft>(initial);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const editing = !!initial.id;
  const result = useMemo(() => evaluateScenario(base, { ...draft, id: "draft" }, origin), [base, draft, origin]);

  const name = draft.name.trim();
  const duplicate = takenNames.some((n) => n.toLowerCase() === name.toLowerCase());
  const canSave = name.length > 0 && !duplicate;

  const set = (patch: Partial<CustomScenarioDraft>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <Drawer
      open={open}
      title={editing ? "Edit custom scenario" : "Create custom scenario"}
      description="Set your own assumptions and save them. Custom scenarios appear at the top of the scenario list."
      onClose={onClose}
      footer={
        <>
          {editing && onDelete && (
            <Button
              variant="ghost"
              className="mr-auto text-critical hover:text-critical"
              icon={<Trash2 size={14} />}
              onClick={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}
            >
              {confirmDelete ? "Click again to delete" : "Delete"}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="custom-scenario-form" variant="primary" disabled={!canSave}>
            {editing ? "Save changes" : "Save scenario"}
          </Button>
        </>
      }
    >
      <form
        id="custom-scenario-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) onSave({ ...draft, name });
        }}
      >
        <ScenarioSection title="Details">
          <div className="flex flex-col gap-3">
            <label className="block">
              <span className="text-sm font-medium text-ink">Name</span>
              <input
                className={`${input} mt-1.5 h-9`}
                value={draft.name}
                maxLength={60}
                required
                data-autofocus
                placeholder="For example: Hire 2 AEs after the bridge"
                aria-invalid={duplicate}
                aria-describedby={duplicate ? "custom-scenario-name-error" : undefined}
                onChange={(e) => set({ name: e.target.value })}
              />
              {duplicate && (
                <span id="custom-scenario-name-error" className="mt-1 flex items-center gap-1 text-xs text-critical">
                  <AlertTriangle size={12} aria-hidden /> You already have a scenario with this name.
                </span>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">
                Description <span className="font-normal text-muted">(optional)</span>
              </span>
              <textarea
                className={`${input} mt-1.5 min-h-16 resize-y py-2`}
                value={draft.description}
                maxLength={200}
                placeholder="What this scenario assumes, so you remember later"
                onChange={(e) => set({ description: e.target.value })}
              />
            </label>
          </div>
        </ScenarioSection>

        <div className="border-t border-line">
          <ScenarioLevers scenario={{ ...draft, id: "draft" }} current={current} origin={origin} onChange={(patch) => set(patch)} />
        </div>
      </form>

      {/* Live outcome: projected, so labelled as such */}
      <div className="sticky bottom-0 border-t border-line bg-surface-2 px-5 py-3" aria-live="polite">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-2">
          <span>
            Projected runway{" "}
            <strong className="font-semibold text-ink">
              {result.runway === null ? `${FORECAST_MONTHS}+ months` : `${result.runway.toFixed(1)} months`}
            </strong>
            {result.zeroDate && <> (cash runs out {formatMonthYear(result.zeroDate)})</>}
          </span>
          <span className={`inline-flex items-center gap-1 font-medium ${result.alive ? "text-good-ink" : "text-critical"}`}>
            {result.alive ? <CheckCircle2 size={13} aria-hidden /> : <AlertTriangle size={13} aria-hidden />}
            {result.alive ? "Default alive" : "Default dead"}
          </span>
        </p>
      </div>
    </Drawer>
  );
}
