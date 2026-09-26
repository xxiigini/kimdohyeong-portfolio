/**
 * Soban 비교 히어로 설정.
 * 두 사진 모두 1800 × 720, 같은 자리에 겹쳐 두고 선으로 비교함.
 *   before.webp: 예전 메뉴판 사진을 새 사진의 원근에 맞춰 편 것 (화면 네 개 모서리 기준)
 *   after.webp: Hales Corners 새 메뉴판 사진 (soban-after-hero.jpg 위쪽 720px)
 * 더 큰 원본 사진으로 바꿀 때는 before를 다시 원근에 맞춰야 함 (그냥 바꿔 넣으면 화면이 어긋남).
 */
export const SOBAN_COMPARE = {
  before: '/images/soban-compare/before.webp',
  after: '/images/soban-compare/after.webp',
  beforeAlt: 'Soban menu boards before the redesign: green panels with bold condensed type and icons',
  afterAlt: 'Soban menu boards after the redesign at Hales Corners: black and white panels with food photography',
  hint: 'Drag to compare',
  caption: 'Same four screens, every piece of information kept, half as crowded.',
};
