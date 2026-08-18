import React from 'react';

type SyncStatus = 'never' | 'synced' | 'failed';

type Props = {
  cellData: SyncStatus | undefined;
  rowData?: Record<string, unknown>;
};

const BADGE: Record<SyncStatus, { bg: string; label: string }> = {
  synced: { bg: '#16a34a', label: 'Synced' },
  failed: { bg: '#dc2626', label: 'Failed' },
  never: { bg: '#6b7280', label: 'Never' },
};

const Mt5SyncStatusCell: React.FC<Props> = ({ cellData, rowData }) => {
  const status: SyncStatus = cellData ?? 'never';
  const badge = BADGE[status] ?? BADGE.never;
  const lastSync = rowData?.mt5LastSyncedAt as string | undefined;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          display: 'inline-block',
          padding: '2px 7px',
          borderRadius: 3,
          fontSize: 11,
          fontWeight: 700,
          color: '#fff',
          backgroundColor: badge.bg,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
        }}
      >
        {badge.label}
      </span>
      {lastSync && (
        <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>
          {new Date(lastSync).toLocaleString('en-GB', {
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </span>
      )}
    </span>
  );
};

export default Mt5SyncStatusCell;
