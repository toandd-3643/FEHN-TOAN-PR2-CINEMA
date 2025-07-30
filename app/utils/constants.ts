export const MOVIE_STATUS_TEXT: Record<string, string> = {
  NOW_SHOWING: 'Đang chiếu',
  COMING_SOON: 'Sắp chiếu',
  ENDED: 'Đã kết thúc'
};

export function getStatusText(status: string): string {
  return MOVIE_STATUS_TEXT[status] || status;
}
