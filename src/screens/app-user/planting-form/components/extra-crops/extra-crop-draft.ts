import type {AreaUnit} from '../../../../../shared/core/fields/model';
import {areaInputValue, parseAreaInput} from '../../../../../shared/core/fields/model';
import type {CropShare} from '../../../../../shared/core/fields/planting';

// Another crop on the plot as it is being typed; its area stays text until the planting is saved.
export type ExtraCropDraft = {key: string; crop: string; variety: string; area: string; unit: AreaUnit};

let lastKey = 0;
const nextKey = () => `extra-crop-${++lastKey}`;

// Small shares read in sotky, large ones in hectares, as elsewhere in the app.
export const unitForArea = (areaM2: number): AreaUnit => (areaM2 >= 5000 ? 'hectare' : 'sotka');

export function newExtraDraft(unit: AreaUnit): ExtraCropDraft {
  return {key: nextKey(), crop: '', variety: '', area: '', unit};
}

export function extraDraftFrom(share: CropShare): ExtraCropDraft {
  const unit = unitForArea(share.areaM2);
  return {key: nextKey(), crop: share.crop, variety: share.variety ?? '', area: areaInputValue(share.areaM2, unit), unit};
}

// The saved crop, or null for a card left empty; `valid` is false while the name or the area is missing.
export function parseExtraDraft(draft: ExtraCropDraft): {share: CropShare | null; valid: boolean} {
  const crop = draft.crop.trim();
  if (!crop && !draft.area.trim() && !draft.variety.trim()) return {share: null, valid: true};
  const areaM2 = parseAreaInput(draft.area, draft.unit);
  if (!crop || areaM2 === null || areaM2 < 1) return {share: null, valid: false};
  return {share: {crop, variety: draft.variety.trim() || null, areaM2}, valid: true};
}
