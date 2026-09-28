import {t} from '../../../../../shared/config/i18n';
import {useStyles} from './materials-section.styles';
import React, {useState} from 'react';
import {Text, View} from 'react-native';
import type {MaterialKind} from '../../../../../shared/core/records/model';
import {formatMoney, materialKinds, materialsCostKopecks} from '../../../../../shared/core/records/model';
import {Chip} from '../../../components/record-chip/record-chip.component';
import {MaterialRow} from '../material-row/material-row.component';
import {MaterialSheet} from '../material-sheet/material-sheet.component';
import type {MaterialDraft} from '../material-sheet/material-draft';
import {newDraft, parseDraft} from '../material-sheet/material-draft';

const addLabels: Record<MaterialKind, string> = {
  seed: 'addSeed', fertilizer: 'addFertilizer', protection: 'addProtection', other: 'addOtherMaterial',
};

type Props = {
  drafts: MaterialDraft[];
  onChange: (drafts: MaterialDraft[]) => void;
  // The crop of this plot and season in the crop rotation: new seed starts with it.
  seedName: string;
  season: number;
  workCostKopecks: number | null;
};

// Seed, fertiliser, crop protection and anything else a job used. Each one is typed in its own sheet,
// any number of each kind; here they are listed with what they cost together.
export function MaterialsSection({drafts, onChange, seedName, season, workCostKopecks}: Props) {
  const styles = useStyles();
  const [sheet, setSheet] = useState<{draft: MaterialDraft; isNew: boolean} | null>(null);
  const listed = drafts.flatMap(draft => {
    const {material} = parseDraft(draft);
    return material ? [{draft, material}] : [];
  });
  const materialsCost = materialsCostKopecks(listed.map(item => item.material));

  return <View style={styles.section}>
    <Text style={styles.label}>{t("materialsOptional")}</Text>
    {listed.length === 0
      ? <Text style={styles.hint}>{t("materialsHint")}</Text>
      : <View>
        {listed.map(({draft, material}, index) => <MaterialRow key={draft.key} material={material} first={index === 0}
          onPress={() => setSheet({draft, isNew: false})} />)}
      </View>}
    <View style={styles.chips}>
      {materialKinds.map(kind => <Chip key={kind} label={t(addLabels[kind])} selected={false}
        onPress={() => setSheet({draft: newDraft(kind, kind === 'seed' ? seedName : ''), isNew: true})} />)}
    </View>
    {materialsCost > 0 && <View style={styles.totals}>
      <Text style={styles.total}>{t("materialsTotal", [formatMoney(materialsCost)])}</Text>
      {workCostKopecks !== null && workCostKopecks > 0 &&
        <Text style={styles.total}>{t("recordTotal", [formatMoney(workCostKopecks + materialsCost)])}</Text>}
    </View>}
    {sheet && <MaterialSheet key={sheet.draft.key} initial={sheet.draft} isNew={sheet.isNew} seedName={seedName}
      season={season} onCancel={() => setSheet(null)}
      onSave={draft => {
        onChange(sheet.isNew ? [...drafts, draft] : drafts.map(item => (item.key === draft.key ? draft : item)));
        setSheet(null);
      }}
      onDelete={() => {
        onChange(drafts.filter(item => item.key !== sheet.draft.key));
        setSheet(null);
      }} />}
  </View>;
}
