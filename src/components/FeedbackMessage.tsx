interface FeedbackMessageProps {
  type: 'error' | 'success';
  message: string;
}

export function FeedbackMessage({ type, message }: FeedbackMessageProps) {
  if (!message) {
    return null;
  }

  return <div className={`feedback ${type}`}>{message}</div>;
}
