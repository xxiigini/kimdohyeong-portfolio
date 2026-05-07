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
};

const buildSearchUrl = (artist: string, title: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title}`)}`;

export const tracks: Track[] = [
  { id: '01', artist: 'LANY', title: 'ILYSB', poster: '/images/tracks/01.jpg' },
  { id: '02', artist: 'LANY', title: 'you!', poster: '/images/tracks/02.jpg' },
  { id: '03', artist: 'Frank Ocean', title: 'IVY', poster: '/images/tracks/03.jpg' },
  { id: '04', artist: 'BIGBANG', title: 'Last Dance', poster: '/images/tracks/04.jpg' },
  { id: '05', artist: 'The Weeknd', title: 'Heartless', poster: '/images/tracks/05.jpg' },
  { id: '06', artist: 'Groovyroom', title: 'Somewhere', poster: '/images/tracks/06.jpg' },
  { id: '07', artist: 'Tyler, The Creator', title: 'See You Again', poster: '/images/tracks/07.jpg' },
  { id: '08', artist: 'The Chainsmokers', title: 'Roses', poster: '/images/tracks/08.jpg' },
  { id: '09', artist: 'Quinn XCII', title: 'Stacy', poster: '/images/tracks/09.jpg' },
  { id: '10', artist: 'Lauv', title: 'Steal the Show', poster: '/images/tracks/10.jpg' },
  { id: '11', artist: 'LANY', title: 'Cowboys in LA', poster: '/images/tracks/11.jpg' },
  { id: '12', artist: 'Sabrina Carpenter', title: 'Juno', poster: '/images/tracks/12.jpg' },
  { id: '13', artist: 'Troye Sivan', title: 'for him.', poster: '/images/tracks/13.jpg' },
  { id: '14', artist: 'Troye Sivan', title: 'Youth', poster: '/images/tracks/14.jpg' },
  { id: '15', artist: 'Briston Maroney', title: "Freakin' Out on the Interstate", poster: '/images/tracks/15.jpg' },
  { id: '16', artist: 'SZA', title: 'Saturn', poster: '/images/tracks/16.jpg', wide: true },
  { id: '17', artist: 'ODESZA', title: 'A Moment Apart', poster: '/images/tracks/17.jpg' },
  { id: '18', artist: 'BIGBANG', title: 'Still Life', poster: '/images/tracks/18.jpg' },
  { id: '19', artist: 'Sunmi', title: 'Full Moon', poster: '/images/tracks/19.jpg' },
  { id: '20', artist: 'Post Malone', title: 'Circles', poster: '/images/tracks/20.jpg' },
  { id: '21', artist: 'Katy Perry', title: 'Firework', poster: '/images/tracks/21.jpg' },
  { id: '22', artist: 'Billie Eilish', title: 'Birds of a Feather', poster: '/images/tracks/22.jpg' },
  { id: '23', artist: 'Post Malone', title: 'Take What You Want', poster: '/images/tracks/23.jpg' },
  { id: '24', artist: 'Joji', title: 'Sanctuary', poster: '/images/tracks/24.jpg' },
  { id: '25', artist: 'Flume', title: 'Never Be Like You', poster: '/images/tracks/25.jpg' },
  { id: '26', artist: 'IU', title: 'Blueming', poster: '/images/tracks/26.jpg' },
  { id: '27', artist: 'Kanye West', title: 'Waves', poster: '/images/tracks/27.jpg' },
  { id: '28', artist: 'Post Malone & Swae Lee', title: 'Sunflower', poster: '/images/tracks/28.jpg' },
  { id: '29', artist: '(G)I-DLE', title: 'HANN', poster: '/images/tracks/29.jpg' },
  { id: '30', artist: 'Avicii', title: 'Wake Me Up', poster: '/images/tracks/30.jpg' },
  { id: '31', artist: 'Kendrick Lamar', title: 'LOVE.', poster: '/images/tracks/31.jpg' },
  { id: '32', artist: 'SZA', title: 'Good Days', poster: '/images/tracks/32.jpg' },
  { id: '33', artist: 'Kygo', title: 'Freeze', poster: '/images/tracks/33.jpg' },
  { id: '34', artist: 'Major Lazer', title: 'All My Love', poster: '/images/tracks/34.jpg' },
  { id: '35', artist: 'BIBI', title: 'very, slowly', poster: '/images/tracks/35.jpg' },
];

export const getTrackYouTubeUrl = (track: Track) => buildSearchUrl(track.artist, track.title);
