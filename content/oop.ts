/**
 * Out of Plane 히어로 문구 + 모델 경로.
 * 모델: Rhino에서 내보낸 조인트(obj)와 도웰 선(3dm)을 메시로 바꿔 합친 파일.
 */
export const OOP_MODEL_URL = '/models/oop-hero.bin';

// 스크롤 단계별 캡션 (정면 → 도는 중 → 옆)
export const OOP_CAPTIONS = [
  { label: 'Front', text: 'Reads as a flat Voronoi from here.' },
  { label: 'Turning', text: 'Every joint sits at its own depth.' },
  { label: 'Side', text: 'Up to 3 in out of plane. No two joints alike.' },
];
