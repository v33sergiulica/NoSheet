import type { SimpleTableConfig, ColumnConfig, TableRow, HeaderGroup } from '../types';

export interface WhistOptions {
  playerCount: number; // 3 to 6
  playerNames: string[];
  variant: 'short' | 'long'; // 'short' = 1-8-1, 'long' = 8-1-8
  columnOrder: 'tricks-first' | 'score-first'; // 'tricks-first' = 1 2, 'score-first' = 2 1
}

/**
 * Computes shortest unique abbreviations for player names.
 * Example: ["Serj", "Dave", "Dick"] -> ["S", "Da", "Di"]
 */
export function getShortestUniqueAbbreviations(names: string[]): string[] {
  const cleanNames = names.map((n, i) => {
    const trimmed = n.trim();
    return trimmed.length > 0 ? trimmed : `P${i + 1}`;
  });

  return cleanNames.map((name, i) => {
    const otherNames = cleanNames.filter((_, j) => j !== i);

    // Try finding shortest prefix not shared by any other name
    for (let len = 1; len <= name.length; len++) {
      const prefix = name.slice(0, len).toLowerCase();
      const hasPrefixCollision = otherNames.some((other) =>
        other.toLowerCase().startsWith(prefix)
      );

      if (!hasPrefixCollision) {
        return formatCapitalization(name.slice(0, len));
      }
    }

    // If one name is an exact prefix of another (e.g. "Dan" and "Danny")
    // or identical names ("Alex" and "Alex")
    const duplicatesBefore = cleanNames
      .slice(0, i)
      .filter((n) => n.toLowerCase() === name.toLowerCase()).length;
    const totalDuplicates = cleanNames.filter(
      (n) => n.toLowerCase() === name.toLowerCase()
    ).length;

    if (totalDuplicates > 1) {
      return `${formatCapitalization(name.slice(0, Math.min(3, name.length)))}${duplicatesBefore + 1}`;
    }

    return formatCapitalization(name);
  });
}

function formatCapitalization(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Generates the sequence of cards dealt per round in Romanian Whist.
 * - Short (1-8-1): N rounds of 1, climbing 2-7, N rounds of 8, falling 7-2, N rounds of 1
 * - Long (8-1-8): N rounds of 8, falling 7-2, N rounds of 1, climbing 2-7, N rounds of 8
 */
export function getWhistCardSequence(playerCount: number, variant: 'short' | 'long'): number[] {
  const count = Math.max(3, Math.min(6, playerCount));
  const sequence: number[] = [];

  const addRepeated = (val: number, times: number) => {
    for (let i = 0; i < times; i++) sequence.push(val);
  };

  const addRange = (start: number, end: number) => {
    if (start <= end) {
      for (let v = start; v <= end; v++) sequence.push(v);
    } else {
      for (let v = start; v >= end; v--) sequence.push(v);
    }
  };

  if (variant === 'short') {
    // 1-8-1
    addRepeated(1, count); // e.g. 1 1 1 1
    addRange(2, 7);        // 2 3 4 5 6 7
    addRepeated(8, count); // 8 8 8 8
    addRange(7, 2);        // 7 6 5 4 3 2
    addRepeated(1, count); // 1 1 1 1
  } else {
    // 8-1-8
    addRepeated(8, count); // 8 8 8 8
    addRange(7, 2);        // 7 6 5 4 3 2
    addRepeated(1, count); // 1 1 1 1
    addRange(2, 7);        // 2 3 4 5 6 7
    addRepeated(8, count); // 8 8 8 8
  }

  return sequence;
}

/**
 * Creates a fully formatted Romanian Whist SimpleTableConfig
 */
export function createWhistTableConfig(options: WhistOptions): SimpleTableConfig {
  const { playerCount, playerNames, variant, columnOrder } = options;

  // Clean player names
  const finalNames: string[] = [];
  for (let i = 0; i < playerCount; i++) {
    const raw = playerNames[i]?.trim();
    finalNames.push(raw && raw.length > 0 ? raw : `P${i + 1}`);
  }

  // Abbreviations for dealer rounds
  const dealerAbbreviations = getShortestUniqueAbbreviations(finalNames);

  // Cards per round sequence
  const cardSequence = getWhistCardSequence(playerCount, variant);

  // Column layout:
  // Col 0: Cards dealt (ratio 1)
  // For each player: 2 columns based on columnOrder:
  // - 'tricks-first': Tricks (ratio 1), Score (ratio 2) -> pattern 1 2
  // - 'score-first': Score (ratio 2), Tricks (ratio 1) -> pattern 2 1
  const columns: ColumnConfig[] = [
    {
      id: 'cards',
      label: 'Cards',
      subLabel: '🃏',
      widthRatio: 1,
      groupId: 'group-cards',
    },
  ];

  const headerGroups: HeaderGroup[] = [
    {
      id: 'group-cards',
      title: 'Cards',
      colSpan: 1,
    },
  ];

  finalNames.forEach((name, pIdx) => {
    const groupId = `group-player-${pIdx}`;
    headerGroups.push({
      id: groupId,
      title: name,
      colSpan: 2,
    });

    if (columnOrder === 'tricks-first') {
      columns.push({
        id: `p${pIdx}_tricks`,
        label: `${name} Tricks`,
        subLabel: 'Tricks',
        widthRatio: 1,
        groupId,
      });
      columns.push({
        id: `p${pIdx}_score`,
        label: `${name} Score`,
        subLabel: 'Score',
        widthRatio: 2,
        groupId,
      });
    } else {
      columns.push({
        id: `p${pIdx}_score`,
        label: `${name} Score`,
        subLabel: 'Score',
        widthRatio: 2,
        groupId,
      });
      columns.push({
        id: `p${pIdx}_tricks`,
        label: `${name} Tricks`,
        subLabel: 'Tricks',
        widthRatio: 1,
        groupId,
      });
    }
  });

  // Generate rows with prefilled Cards count and rotating Dealer abbreviation
  const rows: TableRow[] = cardSequence.map((cardsCount, roundIdx) => {
    // Dealer rotates circularly through players
    const dealer = dealerAbbreviations[roundIdx % dealerAbbreviations.length];

    const cells: Record<string, string> = {
      cards: String(cardsCount),
    };

    // Initialize all player cells to empty string
    finalNames.forEach((_, pIdx) => {
      cells[`p${pIdx}_tricks`] = '';
      cells[`p${pIdx}_score`] = '';
    });

    return {
      id: `whist-row-${roundIdx + 1}`,
      roundLabel: dealer,
      cells,
    };
  });

  const variantLabel = variant === 'short' ? 'Short (1-8-1)' : 'Long (8-1-8)';

  return {
    id: `whist-${Date.now()}`,
    title: `Romanian Whist (${variantLabel})`,
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
