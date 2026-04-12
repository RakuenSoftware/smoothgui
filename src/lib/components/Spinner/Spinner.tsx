interface Props {
  loading: boolean;
  text?: string;
}

export default function Spinner({ loading, text = 'Loading...' }: Props) {
  if (!loading) return null;
  return (
    <div className="spinner-wrapper">
      <div className="spinner" />
      {text && <span className="spinner-text">{text}</span>}
      <style>{`
        .spinner-wrapper { display: flex; align-items: center; gap: 12px; padding: 24px; color: #888; font-size: 14px; }
        .spinner { width: 24px; height: 24px; border: 3px solid #e0e0e0; border-top-color: #4fc3f7; border-radius: 50%; animation: sp 0.8s linear infinite; }
        @keyframes sp { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
