/**
 * Acro 스크롤 히어로 설정.
 * 프레임: public/videos/acro-final.mp4 (60fps, 324프레임)에서 2프레임마다 뽑은 162장.
 * 멈춰 있는 구간은 같은 파일을 다시 써서 실제 파일은 151장.
 * 크기별 폴더: md (1024px), lg (1536px). 화면 크기에 맞춰 자동 선택.
 */
export const ACRO_FRAMES = {
  base: '/images/acro-frames',
  width: 1536,
  height: 1072,
  fps: 60, // 원본 영상 fps
  step: 2, // 원본 2프레임마다 한 장
  files: 151,
  // 샘플 순서(0~161) → 파일 번호 (000.webp ~ 150.webp)
  map: [
    0, 1, 2, 3, 4, 4, 5, 6, 7, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105,
    106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132,
    133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150,
  ],
};

// 동작 구간 (원본 60fps 프레임 번호). 진행 바의 눈금 위치.
export const ACRO_PHASES = [
  { name: 'Pick', from: 24 },
  { name: 'Swing', from: 48 },
  { name: 'Place', from: 72 },
  { name: 'Lift', from: 180 },
  { name: 'Return', from: 228 },
  { name: 'Index', from: 252 },
];

// 스크롤 캡션: at = 이 프레임(60fps 기준)부터 보임
export const ACRO_CAPTIONS = [
  { at: 0, label: 'The cell', text: 'Rebuilt from the drawings of a cell Acro actually programmed.' },
  { at: 24, label: 'Pick', text: 'A real pick-and-place cycle, not a generic demo.' },
  { at: 48, label: 'Swing', text: 'Fast enough to feel alive,' },
  { at: 72, label: 'Place', text: 'slow enough to read.' },
  { at: 180, label: 'Return', text: 'Every move hand-keyed at 60 fps.' },
  { at: 252, label: 'Live', text: 'The first thing every visitor to acro.com sees.' },
];

// 스크롤이 이 지점(0~1)을 넘으면 마지막 캡션에서 실제 속도로 루프 재생 (acro.com에서처럼)
// 끄려면 1로 바꾸면 됨
export const ACRO_LIVE_FROM = 0.95;
