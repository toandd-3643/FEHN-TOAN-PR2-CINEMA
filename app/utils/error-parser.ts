export const parseApiError = (error: unknown): string => {
  if (!error) {
    return 'Có lỗi không xác định xảy ra'
  }

  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object') {
    const objError = error as Record<string, any>

    if (objError.data?.statusMessage) {
      return objError.data.statusMessage
    }

    if (objError.statusMessage) {
      return objError.statusMessage
    }

    if (objError.response?.data?.message) {
      return objError.response.data.message
    }

    if (objError.message) {
      return objError.message
    }

    if (objError.code) {
      return getPrismaErrorMessage(objError.code, objError.message)
    }

    if (Array.isArray(objError.errors) && objError.errors.length > 0) {
      return objError.errors[0].message || 'Dữ liệu không hợp lệ'
    }
  }

  return 'Có lỗi xảy ra. Vui lòng thử lại.'
}

const getPrismaErrorMessage = (code: string, message?: string): string => {
  switch (code) {
    case 'P2002':
      return 'Dữ liệu đã tồn tại trong hệ thống'
    case 'P2025':
      return 'Không tìm thấy dữ liệu'
    case 'P2003':
      return 'Vi phạm ràng buộc dữ liệu'
    case 'P2014':
      return 'Dữ liệu không hợp lệ'
    default:
      return message || 'Lỗi cơ sở dữ liệu'
  }
}

export interface ApiErrorResponse {
  statusCode?: number
  statusMessage?: string
  data?: {
    statusMessage?: string
    message?: string
  }
  message?: string
  response?: {
    data?: {
      message?: string
      statusMessage?: string
    }
  }
}

export const parseApiErrorTyped = (error: unknown): string => {
  if (!error) return 'Có lỗi không xác định xảy ra'
  
  if (typeof error === 'string') return error
  
  if (error instanceof Error) return error.message
  
  const apiError = error as ApiErrorResponse
  
  return (
    apiError.data?.statusMessage ||
    apiError.data?.message ||
    apiError.statusMessage ||
    apiError.response?.data?.statusMessage ||
    apiError.response?.data?.message ||
    apiError.message ||
    'Có lỗi xảy ra. Vui lòng thử lại.'
  )
}
