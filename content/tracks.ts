/**
 * Tracklist data
 * ==============
 * 35 tracks from My Tracklist book.
 *
 * youtubeSearchUrl은 YouTube 검색 URL을 사용합니다 — 직접 영상 링크 대신.
 * 이유: 영상이 삭제되거나 지역 제한이 걸려도 깨지지 않고,
 *       사용자가 official audio / music video 중 선택할 수 있습니다.
 */

export type Track = {
  id: string;        // "01" ~ "35"
  artist: string;
  title: string;
  poster: string;    // /images/tracks/01.jpg 등
  wide?: boolean;    // SZA Saturn처럼 가로 포스터
  color: string;     // My Tracklist 히어로 배경색 (포스터에서 뽑은 대표색). 글자색은 밝기 보고 자동으로 정해짐
};

const buildSearchUrl = (artist: string, title: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title}`)}`;

export const tracks: Track[] = [
  { id: '01', artist: 'LANY', title: 'ILYSB', poster: '/images/tracks/01.jpg', color: '#ee328f' },
  { id: '02', artist: 'LANY', title: 'you!', poster: '/images/tracks/02.jpg', color: '#92c1de' },
  { id: '03', artist: 'Frank Ocean', title: 'IVY', poster: '/images/tracks/03.jpg', color: '#5c4d3a' },
  { id: '04', artist: 'BIGBANG', title: 'Last Dance', poster: '/images/tracks/04.jpg', color: '#abaebb' },
  { id: '05', artist: 'The Weeknd', title: 'Heartless', poster: '/images/tracks/05.jpg', color: '#060101' },
  { id: '06', artist: 'Groovyroom', title: 'Somewhere', poster: '/images/tracks/06.jpg', color: '#bfd6ab' },
  { id: '07', artist: 'Tyler, The Creator', title: 'See You Again', poster: '/images/tracks/07.jpg', color: '#bd9c26' },
  { id: '08', artist: 'The Chainsmokers', title: 'Roses', poster: '/images/tracks/08.jpg', color: '#e35f72' },
  { id: '09', artist: 'Quinn XCII', title: 'Stacy', poster: '/images/tracks/09.jpg', color: '#8eac65' },
  { id: '10', artist: 'Lauv', title: 'Steal the Show', poster: '/images/tracks/10.jpg', color: '#4ab7e9' },
  { id: '11', artist: 'LANY', title: 'Cowboys in LA', poster: '/images/tracks/11.jpg', color: '#94ada6' },
  { id: '12', artist: 'Sabrina Carpenter', title: 'Juno', poster: '/images/tracks/12.jpg', color: '#b75c2d' },
  { id: '13', artist: 'Troye Sivan', title: 'for him.', poster: '/images/tracks/13.jpg', color: '#bbeae5' },
  { id: '14', artist: 'Troye Sivan', title: 'Youth', poster: '/images/tracks/14.jpg', color: '#589eda' },
  { id: '15', artist: 'Briston Maroney', title: "Freakin' Out on the Interstate", poster: '/images/tracks/15.jpg', color: '#3f4ea9' },
  { id: '16', artist: 'SZA', title: 'Saturn', poster: '/images/tracks/16.jpg', wide: true, color: '#231e1d' },
  { id: '17', artist: 'ODESZA', title: 'A Moment Apart', poster: '/images/tracks/17.jpg', color: '#13111d' },
  { id: '18', artist: 'BIGBANG', title: 'Still Life', poster: '/images/tracks/18.jpg', color: '#04020e' },
  { id: '19', artist: 'Sunmi', title: 'Full Moon', poster: '/images/tracks/19.jpg', color: '#521a1f' },
  { id: '20', artist: 'Post Malone', title: 'Circles', poster: '/images/tracks/20.jpg', color: '#a7462d' },
  { id: '21', artist: 'Katy Perry', title: 'Firework', poster: '/images/tracks/21.jpg', color: '#1f1017' },
  { id: '22', artist: 'Billie Eilish', title: 'Birds of a Feather', poster: '/images/tracks/22.jpg', color: '#488c72' },
  { id: '23', artist: 'Post Malone', title: 'Take What You Want', poster: '/images/tracks/23.jpg', color: '#1d0807' },
  { id: '24', artist: 'Joji', title: 'Sanctuary', poster: '/images/tracks/24.jpg', color: '#d3a4bc' },
  { id: '25', artist: 'Flume', title: 'Never Be Like You', poster: '/images/tracks/25.jpg', color: '#f3a684' },
  { id: '26', artist: 'IU', title: 'Blueming', poster: '/images/tracks/26.jpg', color: '#cbc4e6' },
  { id: '27', artist: 'Kanye West', title: 'Waves', poster: '/images/tracks/27.jpg', color: '#8f77c3' },
  { id: '28', artist: 'Post Malone & Swae Lee', title: 'Sunflower', poster: '/images/tracks/28.jpg', color: '#9e9d3f' },
  { id: '29', artist: '(G)I-DLE', title: 'HANN', poster: '/images/tracks/29.jpg', color: '#caa0bd' },
  { id: '30', artist: 'Avicii', title: 'Wake Me Up', poster: '/images/tracks/30.jpg', color: '#c89666' },
  { id: '31', artist: 'Kendrick Lamar', title: 'LOVE.', poster: '/images/tracks/31.jpg', color: '#e23c53' },
  { id: '32', artist: 'SZA', title: 'Good Days', poster: '/images/tracks/32.jpg', color: '#6fa2cd' },
  { id: '33', artist: 'Kygo', title: 'Freeze', poster: '/images/tracks/33.jpg', color: '#b9e3f4' },
  { id: '34', artist: 'Major Lazer', title: 'All My Love', poster: '/images/tracks/34.jpg', color: '#f1d5d7' },
  { id: '35', artist: 'BIBI', title: 'very, slowly', poster: '/images/tracks/35.jpg', color: '#3c3a38' },
];

export const getTrackYouTubeUrl = (track: Track) => buildSearchUrl(track.artist, track.title);
