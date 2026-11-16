export type MosaicTileVariant = 'hero-left' | 'hero-right' | 'standard';

export interface MosaicTilePlacement {
  index: number;
  cycleIndex: number;
  positionInCycle: number;
  variant: MosaicTileVariant;
  colSpan: 1 | 2;
  rowSpan: 1 | 2;
}

export function getResponsiveMosaicColumns(widthPx: number): number {
  if (widthPx >= 1280) return 9;
  if (widthPx >= 768) return 6;
  return 3;
}

export function getMosaicCycleLength(columns: number): number {
  const safeCols = Math.max(1, Math.floor(columns));
  if (safeCols <= 3) return safeCols * 6;
  return 6 * safeCols - 6;
}

export function getMosaicTilePlacement(index: number, columns = 3): MosaicTilePlacement {
  const safeCols = Math.max(1, Math.floor(columns));
  const cycleLength = getMosaicCycleLength(safeCols);
  const cycleIndex = Math.floor(index / cycleLength);
  const positionInCycle = ((index % cycleLength) + cycleLength) % cycleLength;

  if (safeCols <= 3) {
    return {
      index,
      cycleIndex,
      positionInCycle,
      variant: 'standard',
      colSpan: 1,
      rowSpan: 1,
    };
  }

  if (positionInCycle === 0) {
    return {
      index,
      cycleIndex,
      positionInCycle,
      variant: 'hero-left',
      colSpan: 2,
      rowSpan: 2,
    };
  }

  if (positionInCycle === 4 * safeCols - 5) {
    return {
      index,
      cycleIndex,
      positionInCycle,
      variant: 'hero-right',
      colSpan: 2,
      rowSpan: 2,
    };
  }

  return {
    index,
    cycleIndex,
    positionInCycle,
    variant: 'standard',
    colSpan: 1,
    rowSpan: 1,
  };
}
