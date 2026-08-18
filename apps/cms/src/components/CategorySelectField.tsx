import React from 'react';
// Browser-only: payload/components/forms pulls admin styles (.scss). This module
// is loaded lazily (React.lazy in CategorySelect.tsx) so the ts-node server never
// imports it — keeping CMS boot safe.
import { useField } from 'payload/components/forms';

export type CategoryOption = string | { label: string; value: string };

export interface CategorySelectFieldProps {
  path: string;
  label?: unknown;
  required?: boolean;
  baseOptions: CategoryOption[];
}

const optValue = (o: CategoryOption): string => (typeof o === 'string' ? o : o.value);

// Payload field labels can be a string or a localized object ({ en, ar }).
const labelText = (label: unknown, fallback: string): string => {
  if (typeof label === 'string') return label;
  if (label && typeof label === 'object') {
    const en = (label as Record<string, unknown>).en;
    if (typeof en === 'string') return en;
  }
  return fallback;
};

/**
 * Creatable category control: a native datalist combobox. Editors pick an
 * existing option OR type a brand-new category, which persists as plain text.
 * Backed by useField so it binds to Payload's form state like any field.
 */
const CategorySelectField: React.FC<CategorySelectFieldProps> = ({
  path,
  label,
  required,
  baseOptions,
}) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path });
  const listId = `cat-${path.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const values = Array.from(new Set(baseOptions.map(optValue)));

  return (
    <div className="field-type text" style={{ marginBottom: 24 }}>
      <label
        className="field-label"
        htmlFor={`field-${path}`}
        style={{ display: 'block', marginBottom: 6 }}
      >
        {labelText(label, path)}
        {required ? ' *' : ''}
      </label>
      <input
        id={`field-${path}`}
        list={listId}
        type="text"
        autoComplete="off"
        value={value ?? ''}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Select an option or type a new category…"
        style={{
          width: '100%',
          padding: '10px 12px',
          border: `1px solid ${showError ? '#e11d48' : 'var(--theme-elevation-150, #d9d9d9)'}`,
          borderRadius: 4,
          background: 'var(--theme-input-bg, #fff)',
          color: 'var(--theme-elevation-800, #111)',
          fontSize: 14,
        }}
      />
      <datalist id={listId}>
        {values.map((v) => (
          <option key={v} value={v} />
        ))}
      </datalist>
      {showError && errorMessage && (
        <div style={{ color: '#e11d48', fontSize: 12, marginTop: 6 }}>{String(errorMessage)}</div>
      )}
    </div>
  );
};

export default CategorySelectField;
