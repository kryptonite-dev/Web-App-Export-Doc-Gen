import React from 'react';
import { ChevronDown } from 'lucide-react';

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="label">{children}</label>;
}

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { right?: React.ReactNode }
) {
  const { right, style, ...rest } = props;
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        {...rest}
        style={{
          ...(style || {}),
          ...(right ? { paddingRight: 52 } : {}),
        }}
        className={'input ' + (props.className || '')}
      />
      {right && (
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
          className="muted"
        >
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
  value, onChange, options, placeholder, style,
}: {
  value?: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
        style={{
          ...style,
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          paddingRight: 40,
        }}
      >
        <option value="">{placeholder || 'Select...'}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <div
        style={{
          position: 'absolute',
          right: 12,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          pointerEvents: 'none',
          color: '#45617c',
        }}
      >
        <ChevronDown size={18} strokeWidth={2.1} />
      </div>
    </div>
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
