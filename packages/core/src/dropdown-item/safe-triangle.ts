export interface Point {
  x: number;
  y: number;
}

export interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function pointInBox(point: Point, box: Box): boolean {
  return (
    point.x >= box.left &&
    point.x <= box.right &&
    point.y >= box.top &&
    point.y <= box.bottom
  );
}

function sign(p: Point, a: Point, b: Point): number {
  return (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
}

export function pointInTriangle(
  point: Point,
  a: Point,
  b: Point,
  c: Point,
): boolean {
  const d1 = sign(point, a, b);
  const d2 = sign(point, b, c);
  const d3 = sign(point, c, a);
  const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNegative && hasPositive);
}

/**
 * Safe-triangle hover (FR-DROPDOWN-03): while a submenu is open, the pointer travelling from the
 * parent item towards it may cross sibling items on the way. As long as it stays inside the
 * triangle formed by the point it left the item at and the submenu's near edge, the submenu stays
 * open instead of closing the moment the pointer touches a sibling.
 */
export function inSafeTriangle(
  pointer: Point,
  leftAt: Point,
  submenu: Box,
  item: Box,
): boolean {
  const submenuIsEnd = submenu.left + submenu.right >= item.left + item.right;
  const edgeX = submenuIsEnd ? submenu.left : submenu.right;
  return pointInTriangle(
    pointer,
    leftAt,
    { x: edgeX, y: submenu.top },
    { x: edgeX, y: submenu.bottom },
  );
}
