export type DemoField = {
  id: string;
  name: string;
  type: string;
  areaM2: number;
  crop: string;
  note: string;
};

export const demoFields: DemoField[] = [
  {
    id: 'wheat',
    name: 'Пшеничне поле',
    type: 'Поле',
    areaM2: 20000,
    crop: 'Озима пшениця',
    note: 'Посів восени 2026 · урожай 2027',
  },
  {
    id: 'raspberry',
    name: 'Малинник',
    type: 'Ягідник',
    areaM2: 2000,
    crop: 'Малина',
    note: 'Багаторічна посадка · кілька зборів за сезон',
  },
];

export const demoJournal = [
  {id: 'j1', title: 'Посів озимої пшениці', field: 'Пшеничне поле', date: '18.09.2026', amount: '2 400 грн'},
  {id: 'j2', title: 'Сапання малини', field: 'Малинник', date: '12.08.2026', amount: '1 000 грн'},
  {id: 'j3', title: 'Збір малини', field: 'Малинник', date: '10.08.2026', amount: '3 відра · 15 кг'},
];

export function formatArea(areaM2: number): string {
  return areaM2 < 10000
    ? `${Number((areaM2 / 100).toFixed(1))} соток`
    : `${Number((areaM2 / 10000).toFixed(2))} га`;
}
