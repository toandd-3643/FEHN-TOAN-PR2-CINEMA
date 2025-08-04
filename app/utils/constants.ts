export const MOVIE_STATUS_TEXT: Record<string, string> = {
  NOW_SHOWING: 'Đang chiếu',
  COMING_SOON: 'Sắp chiếu',
  ENDED: 'Đã kết thúc'
};

export const BOOKING_STATUS_TEXT: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn'
}

export function getStatusText(status: string): string {
  return MOVIE_STATUS_TEXT[status] || status;
}

export function getBookingStatusText(status: string): string {
  return BOOKING_STATUS_TEXT[status] || status
}
