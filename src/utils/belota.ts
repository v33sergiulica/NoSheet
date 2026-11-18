import type { SimpleTableConfig, ColumnConfig, TableRow, HeaderGroup } from '../types';
import { getShortestUniqueAbbreviations } from './whist';

export interface BelotaOptions {
  team1Name: string;
  team1Players: [string, string];
  team2Name: string;
  team2Players: [string, string];
  initialRows?: number;
}

/**
 * Creates a fully formatted Belota (Belot) SimpleTableConfig
 * Ratios: 2 1 2 1 2 1 1
 * 1. Round points & team (2)
 * 2. Team 1: current round points (1) & total points (2)
 * 3. Team 2: current round points (1) & total points (2)
 * 4. Declarations: Team 1 declarations (1) & Team 2 declarations (1)
 *
 * Circular dealer order: T1 Player 1 -> T2 Player 1 -> T1 Player 2 -> T2 Player 2
 */
export function createBelotaTableConfig(options: BelotaOptions): SimpleTableConfig {
  const t1 = options.team1Name.trim() || 'Team 1';
  const t2 = options.team2Name.trim() || 'Team 2';

  const t1p1 = options.team1Players[0].trim() || 'P1';
  const t1p2 = options.team1Players[1].trim() || 'P3';
  const t2p1 = options.team2Players[0].trim() || 'P2';
  const t2p2 = options.team2Players[1].trim() || 'P4';

  // Circular deal order around the table:
  // Team 1 first player -> Team 2 first player -> Team 1 second player -> Team 2 second player
  const playerDealOrder = [t1p1, t2p1, t1p2, t2p2];
  const dealerAbbreviations = getShortestUniqueAbbreviations(playerDealOrder);

  const rowCount = Math.max(1, options.initialRows || 12);

  // Short label abbreviations for declarations sub-headers
  const t1Short = t1.length > 6 ? t1.slice(0, 5) : t1;
  const t2Short = t2.length > 6 ? t2.slice(0, 5) : t2;

  const headerGroups: HeaderGroup[] = [
    {
      id: 'group-contract',
      title: 'Contract',
      colSpan: 1,
    },
    {
      id: 'group-t1',
      title: t1,
      colSpan: 2,
    },
    {
      id: 'group-t2',
      title: t2,
      colSpan: 2,
    },
    {
      id: 'group-decl',
      title: 'Declarations',
      colSpan: 2,
    },
  ];

  const columns: ColumnConfig[] = [
    {
      id: 'contract',
      label: 'Contract & Team',
      subLabel: 'Points/Team',
      widthRatio: 2,
      groupId: 'group-contract',
    },
    {
      id: 't1_round',
      label: `${t1} Round`,
      subLabel: 'Round',
      widthRatio: 1,
      groupId: 'group-t1',
    },
    {
      id: 't1_total',
      label: `${t1} Total`,
      subLabel: 'Total',
      widthRatio: 2,
      groupId: 'group-t1',
    },
    {
      id: 't2_round',
      label: `${t2} Round`,
      subLabel: 'Round',
      widthRatio: 1,
      groupId: 'group-t2',
    },
    {
      id: 't2_total',
      label: `${t2} Total`,
      subLabel: 'Total',
      widthRatio: 2,
      groupId: 'group-t2',
    },
    {
      id: 't1_decl',
      label: `${t1} Declarations`,
      subLabel: t1Short,
      widthRatio: 1,
      groupId: 'group-decl',
    },
    {
      id: 't2_decl',
      label: `${t2} Declarations`,
      subLabel: t2Short,
      widthRatio: 1,
      groupId: 'group-decl',
    },
  ];

  const rows: TableRow[] = Array.from({ length: rowCount }).map((_, rIdx) => {
    const dealer = dealerAbbreviations[rIdx % dealerAbbreviations.length];

    const cells: Record<string, string> = {
      contract: '',
      t1_round: '',
      t1_total: '',
      t2_round: '',
      t2_total: '',
      t1_decl: '',
      t2_decl: '',
    };

    return {
      id: `belota-row-${rIdx + 1}`,
      roundLabel: dealer,
      cells,
    };
  });

  return {
    id: `belota-${Date.now()}`,
    title: `Belota (${t1} vs ${t2})`,
    hasRoundColumn: true,
    rowIndexingType: 'circular',
    roundColumnName: 'Dealer',
    circularItems: dealerAbbreviations,
    headerGroups,
    columns,
    rows,
    createdAt: Date.now(),
    lastModified: Date.now(),
  };
}
