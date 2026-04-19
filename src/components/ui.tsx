import React from 'react';

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="label">{children}</label>;
}

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { right?: React.ReactNode }
) {
  const { right, ...rest } = props;
  return (
    <div style={{ position: 'relative' }}>
      <input {...rest} className={'input ' + (props.className || '')} />
      {right && (
        <div style={{ position: 'absolute', right: 8, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }} className="muted">
          {right}
        </div>
      )}
    </div>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={'input ' + (props.className || '')} />;
}

export function Select({
  value, onChange, options, placeholder,
}: { value?: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
      <option value="">{placeholder || 'Select...'}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function Card({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={'card ' + className}>
      {title && <div style={{ marginBottom: 8 }} className="label">{title}</div>}
      {children}
    </div>
  );
}
