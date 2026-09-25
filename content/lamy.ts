/**
 * LAMY Safari showcase data
 * =========================
 * 히어로 라인업(components/lamy/LamyLineup)과 분해 섹션(components/lamy/LamyExploded)이
 * 이 파일 하나를 같이 읽음.
 *
 * 컬러 렌더 교체: public/images/lamy-lineup/ 에 같은 파일명으로 덮어쓰기.
 *   캔버스 560 x 764 비율, 투명 배경, 그림자 없이 (그림자는 shadow.webp를 사이트가 따로 깔아줌),
 *   펜 축이 가운데, 펜 발끝이 위에서 88.9% 지점.
 * 색 이름은 LAMY 표기 그대로 소문자.
 */

export type LamyColor = {
  name: string;
  hex: string; // 스와치 + 분해 섹션 재색상 기준
  note: string;
  file: string;
  base?: boolean; // 분해 프레임에 실제로 렌더된 색 (재색상 안 함)
};

export const LAMY_COLORS: LamyColor[] = [
  { name: 'white', hex: '#EEEDE8', note: 'Regular lineup', file: '01-white.webp' },
  { name: 'yellow', hex: '#F4C300', note: 'Regular lineup', file: '02-yellow.webp' },
  { name: 'mango', hex: '#FF9A1A', note: '2020 special edition', file: '03-mango.webp' },
  { name: 'red', hex: '#D7262B', note: 'The one I took apart and measured', file: '04-red.webp', base: true },
  { name: 'pink', hex: '#E0438E', note: 'Regular lineup', file: '05-pink.webp' },
  { name: 'violet', hex: '#8C6BC9', note: '2020 special edition', file: '06-violet.webp' },
  { name: 'blue', hex: '#1F4DB0', note: 'Regular lineup', file: '07-blue.webp' },
  { name: 'aquasky', hex: '#8CCFE4', note: '2023 special edition', file: '08-aquasky.webp' },
  { name: 'springgreen', hex: '#7CC98E', note: '2023 special edition', file: '09-springgreen.webp' },
  { name: 'black', hex: '#1C1C1C', note: 'Regular lineup', file: '10-black.webp' },
];

/** 처음 선택된 색: 실제로 분해하고 측정한 빨강 */
export const LAMY_DEFAULT_INDEX = 3;

export const LAMY_LINEUP = {
  dir: '/images/lamy-lineup',
  shadow: 'shadow.webp',
  width: 560,
  height: 764,
  foot: 0.889, // 펜 발끝 높이 (이미지 위에서부터 비율)
};

export const LAMY_EXPLODED: {
  dir: string;
  count: number;
  frameBg: [number, number, number];
  baseRed: number;
} = {
  dir: '/images/lamy-exploded', // lg(1920) / sm(960) 두 세트, 000.webp부터
  count: 89,
  frameBg: [251.96, 250.98, 251.95], // 프레임 배경 RGB (종이 색 맞출 때 기준)
  baseRed: 229, // KeyShot 빨강 재질의 R 값 (재색상 기준)
};

export type LamyPart = {
  id: string;
  name: string;
  dims: string; // 도면(lamy-orthography.jpg)에서 가져온 캘리퍼 측정값
  muted?: boolean;
  side: 'above' | 'below';
  anchor: [number, number]; // 마지막 분해 프레임 기준 % (x, y)
  hit: [number, number, number, number]; // 마우스 영역 % (x0, y0, x1, y1)
};

export const LAMY_PARTS: LamyPart[] = [
  { id: 'cap', name: 'Cap', dims: '69.9 mm · Ø 12.6', side: 'below', anchor: [19.79, 54.72], hit: [4.43, 42.13, 34.9, 59.26] },
  { id: 'clip', name: 'Clip', dims: 'Spring wire', muted: true, side: 'above', anchor: [17.19, 42.59], hit: [5.0, 37.78, 30.31, 42.13] },
  { id: 'nib', name: 'Nib', dims: '8.0 mm', side: 'below', anchor: [35.52, 59.26], hit: [32.55, 51.39, 37.76, 61.3] },
  { id: 'grip', name: 'Grip section', dims: '37.8 mm · Ø 9.7 → 12.0', side: 'above', anchor: [50.0, 52.87], hit: [38.18, 49.54, 62.76, 64.81] },
  { id: 'barrel', name: 'Barrel', dims: '74.0 mm · Ø 12.4 → 11.2', side: 'above', anchor: [78.12, 58.06], hit: [63.02, 54.17, 95.31, 72.69] },
];
