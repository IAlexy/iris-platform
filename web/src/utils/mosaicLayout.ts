export type MosaicTileVariant = 'hero-left' | 'hero-right' | 'standard';
export type ScreenBreakpointMode = 'desktop-9' | 'medium-6' | 'mobile-3';

export interface MosaicTilePlacement {
  index: number;
  cycleIndex: number;
  positionInCycle: number;
  variant: MosaicTileVariant;
  colSpan: 1 | 2;
  rowSpan: 1 | 2;
  /** Explicit CSS grid-column value to guarantee exact left/right alignment */
  gridColumn: string;
  /** Explicit CSS grid-row value */
  gridRow: string;
}

export interface FocalPointInput {
  focalPoint?: { xPercent: number; yPercent: number };
  critiquePins?: Array<{ xPercent: number; yPercent: number }>;
  width?: number;
  height?: number;
}

/**
 * Computes the responsive number of columns for the Iris Photo Gallery:
 * - >= 1280px (Big screens): 9 columns (Mosaic with AA & LL 2x2)
 * - 768px - 1279px (Medium screens): 6 columns (Mosaic with AA & LL 2x2)
 * - < 768px (Small screens): 3 columns (Classic 3 pictures per line, uniform 1x1)
 */
export function getResponsiveMosaicColumns(widthPx: number): number {
  if (widthPx >= 1280) return 9;
  if (widthPx >= 768) return 6;
  return 3;
}

/**
 * Returns the human-readable breakpoint mode for a given column count.
 */
export function getBreakpointMode(columns: number): ScreenBreakpointMode {
  if (columns >= 9) return 'desktop-9';
  if (columns >= 6) return 'medium-6';
  return 'mobile-3';
}

/**
 * Returns the number of photos in one complete cycle:
 * - For classic 3-column mobile display (columns <= 3): 18 photos (6 classic rows of 3)
 * - For N-column mosaic display (columns >= 4, e.g. 6 or 9):
 *   6 grid rows = 6N - 6 photos (48 photos for N=9, 30 photos for N=6).
 */
export function getMosaicCycleLength(columns: number): number {
  const safeCols = Math.max(1, Math.floor(columns));
  if (safeCols <= 3) {
    return safeCols * 6; // 6 classic rows of 3 = 18 photos
  }
  return 6 * safeCols - 6;
}

/**
 * Computes the exact CSS Grid placement for a photo at `index`:
 *
 * - On small screens (columns <= 3): Classic 3 pictures per line (all 1x1 standard).
 * - On medium (6 cols) & big screens (9 cols):
 *   Repeating 6-row cycle (6N - 6 items):
 *     Rows 1-2: AA (2x2 left at pos 0) + 2*(N-2) standard 1x1 tiles
 *     Row 3:    N standard 1x1 tiles
 *     Rows 4-5: 2*(N-2) standard 1x1 tiles + LL (2x2 right at pos 4N - 5)
 *     Row 6:    N standard 1x1 tiles
 */
export function getMosaicTilePlacement(index: number, columns = 9): MosaicTilePlacement {
  const safeCols = Math.max(1, Math.floor(columns));
  const cycleLength = getMosaicCycleLength(safeCols);
  const cycleIndex = Math.floor(index / cycleLength);
  const positionInCycle = ((index % cycleLength) + cycleLength) % cycleLength;

  // Classic 3-per-line mode on small screens: no 2x2 tiles
  if (safeCols <= 3) {
    return {
      index,
      cycleIndex,
      positionInCycle,
      variant: 'standard',
      colSpan: 1,
      rowSpan: 1,
      gridColumn: 'span 1',
      gridRow: 'span 1',
    };
  }

  // Position 0 in the 6-row cycle: AA (2x2 Hero on the left, columns 1..2, rows 1..2)
  if (positionInCycle === 0) {
    return {
      index,
      cycleIndex,
      positionInCycle,
      variant: 'hero-left',
      colSpan: 2,
      rowSpan: 2,
      gridColumn: '1 / span 2',
      gridRow: 'span 2',
    };
  }

  // Position (3N - 3) + (N - 2) = 4N - 5 in the cycle: LL (2x2 Hero on the right, columns N-1..N, rows 4..5)
  const rightHeroOffset = 4 * safeCols - 5;
  if (positionInCycle === rightHeroOffset) {
    return {
      index,
      cycleIndex,
      positionInCycle,
      variant: 'hero-right',
      colSpan: 2,
      rowSpan: 2,
      gridColumn: `${safeCols - 1} / span 2`,
      gridRow: 'span 2',
    };
  }

  return {
    index,
    cycleIndex,
    positionInCycle,
    variant: 'standard',
    colSpan: 1,
    rowSpan: 1,
    gridColumn: 'span 1',
    gridRow: 'span 1',
  };
}

/**
 * Computes a smart CSS `object-position` ("X% Y%") so that truncated 1:1 grid thumbnails
 * automatically center on the main subject of the original picture:
 * 1. Explicit `focalPoint` coordinates if provided on the photo.
 * 2. Centroid of technical `critiquePins` if reviewers pinned a subject area.
 * 3. Aspect-ratio heuristic: Portrait photos (height > width) bias upward (50% 28%)
 *    toward faces/upper-third subjects; wide panoramas bias slightly toward the horizon (50% 42%).
 */
export function getSmartObjectPosition(input: FocalPointInput): string {
  const clamp = (val: number) => Math.min(90, Math.max(10, Math.round(val)));

  if (input.focalPoint) {
    return `${clamp(input.focalPoint.xPercent)}% ${clamp(input.focalPoint.yPercent)}%`;
  }

  if (input.critiquePins && input.critiquePins.length > 0) {
    const avgX =
      input.critiquePins.reduce((sum, p) => sum + p.xPercent, 0) / input.critiquePins.length;
    const avgY =
      input.critiquePins.reduce((sum, p) => sum + p.yPercent, 0) / input.critiquePins.length;
    return `${clamp(avgX)}% ${clamp(avgY)}%`;
  }

  if (input.width && input.height) {
    if (input.height > input.width * 1.1) {
      // Portrait orientation: keep upper-third subject (head/eyes/peaks) in frame
      return '50% 28%';
    }
    if (input.width > input.height * 1.6) {
      // Panoramic landscape: slight golden-ratio horizon bias
      return '50% 42%';
    }
  }

  return '50% 50%';
}
