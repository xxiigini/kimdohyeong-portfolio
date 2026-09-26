/**
 * My Tracklist 스크롤 히어로 설정.
 * 포스터 35장은 content/tracks.ts 순서 그대로 쓰고, 곡마다 배경색도 거기 color에서 가져옴.
 * 이미지: public/images/tracklist-hero/ 크기별 폴더 두 개, 화면 크기에 맞춰 자동 선택.
 *   md: 680 × 1020 (휴대폰, 일반 화면)
 *   lg: 1000 × 1500 (큰 화면, 레티나)
 *   16번 Saturn은 가로라서 두 폴더 모두 1200 × 900, 마지막 cover.webp는 책 앞표지.
 */
export const TRACKLIST_HERO = {
  base: '/images/tracklist-hero',
  // 곡당 스크롤 길이 배수. 미리보기에서 고른 '길게' = 1.6 (보통 1, 짧게 0.6)
  perTrack: 1.6,
  // 35번 다음 책 표지에서 보이는 문구
  book: {
    label: 'The book',
    title: '84 pages, 35 posters',
  },
};
