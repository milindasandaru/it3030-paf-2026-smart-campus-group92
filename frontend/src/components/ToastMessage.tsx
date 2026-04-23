interface ToastMessageProps {
  message: string;
  tone?: 'success' | 'error';
}

export function ToastMessage({ message, tone = 'success' }: ToastMessageProps) {
  return <div className={`toast toast-${tone}`}>{message}</div>;
}
