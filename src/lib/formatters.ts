// Utility function để format số 
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

// Utility function để format ngày tháng
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Utility function để format tiền tệ
export const formatCurrency = (amount: number): string => {
  return `$${new Intl.NumberFormat('en-US').format(amount)}`;
};
