/**
 * SITE CONFIG
 * ===========
 * 여기서 status bar, 연락처, 현재 상태 등을 관리합니다.
 * 사이트 전체에 자동으로 반영됩니다.
 */

export const site = {
  name: {
    en: 'Kim, Dohyeong',
    ko: '김도형',
  },
  role: {
    en: 'Designer working at the seam of 3D, brand, and industrial form.',
    ko: '3D, 브랜드, 그리고 산업 디자인의 경계에서 작업하는 디자이너.',
  },
  location: {
    origin: {
      label: 'KOR / Seoul',
      lat: '37.5665°N',
      city: 'Seoul',
    },
    current: {
      label: 'MKE',
      lat: '42.8859°N',
      city: 'Milwaukee',
      timezone: 'America/Chicago', // CST/CDT auto-handled
      tzAbbr: 'CST',
    },
    next: {
      label: 'ANYWHERE',
      symbol: '∞',
    },
  },
  tools: ['Maya', 'Rhino', 'Ai'], // status bar에 표시
  status: {
    available: true,
    nowDesigning: 'Open to new projects', // GitHub에서 한 줄만 바꾸면 사이트에 반영됨
  },
  contact: {
    email: 'hello@kimdohyeong.com', // 실제 이메일로 바꿔줘
    instagram: 'https://instagram.com/your-handle', // 본인 인스타!
    linkedin: 'https://linkedin.com/in/dohyeong-kim',
  },
} as const;
