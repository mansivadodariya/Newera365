import React from 'react';
import type { CategoryOption, CategorySelectFieldProps } from './CategorySelectField';

// Server-safe wrapper. Only `react` is imported at module load; the inner field
// (which imports payload/components/forms → admin .scss) is pulled in lazily so
// the ts-node CMS server never evaluates it. Webpack code-splits it for the
// browser admin bundle.
const Inner = React.lazy(() => import('./CategorySelectField'));

export type { CategoryOption };

/**
 * Factory → Payload `admin.components.Field`. Pass the curated dropdown options;
 * editors can still type a new value. Usage:
 *   admin: { components: { Field: CategorySelect(['forex', 'crypto']) } }
 */
export const CategorySelect = (baseOptions: CategoryOption[]) => {
  const Field: React.FC<Record<string, unknown>> = (props) => (
    <React.Suspense fallback={null}>
      <Inner {...(props as unknown as CategorySelectFieldProps)} baseOptions={baseOptions} />
    </React.Suspense>
  );
  return Field;
};

export default CategorySelect;
