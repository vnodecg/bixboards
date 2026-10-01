/**
 * Fenwick (binary indexed) tree over item sizes: O(log n) point update, O(log n) offset lookup and
 * O(log n) "which item contains this offset" search — the prefix-sum index
 * `VirtualizerController` uses for variable-size lists (docs/features/_conventions.md §4).
 *
 * A plain `number[]` of offsets would make a single measured-size correction O(n) (every later
 * offset shifts); at 100k items that is a visible stall per resize. Here a correction touches
 * ~17 cells.
 */
export class PrefixSums {
  #length = 0;
  #sizes = new Float64Array(0);
  /** 1-indexed Fenwick array; `#tree[0]` is unused. */
  #tree = new Float64Array(1);
  #topBit = 0;

  get length(): number {
    return this.#length;
  }

  /** Rebuilds the whole index in O(n). */
  rebuild(length: number, sizeAt: (index: number) => number): void {
    this.#length = length;
    if (this.#sizes.length < length) {
      this.#sizes = new Float64Array(length);
      this.#tree = new Float64Array(length + 1);
    } else {
      this.#tree.fill(0, 0, length + 1);
    }
    for (let i = 0; i < length; i++) {
      const size = sizeAt(i);
      this.#sizes[i] = size;
      this.#tree[i + 1] = size;
    }
    // Linear-time Fenwick construction: push each node's total into its parent.
    for (let i = 1; i <= length; i++) {
      const parent = i + (i & -i);
      if (parent <= length) this.#tree[parent]! += this.#tree[i]!;
    }
    this.#topBit = length > 0 ? 1 << (31 - Math.clz32(length)) : 0;
  }

  size(index: number): number {
    return this.#sizes[index] ?? 0;
  }

  /** Sets one item's size in O(log n); returns the delta applied. */
  set(index: number, size: number): number {
    if (index < 0 || index >= this.#length) return 0;
    const delta = size - this.#sizes[index]!;
    if (delta === 0) return 0;
    this.#sizes[index] = size;
    for (let i = index + 1; i <= this.#length; i += i & -i)
      this.#tree[i]! += delta;
    return delta;
  }

  /** Sum of the sizes of items `[0, index)` — i.e. the start offset of `index`. */
  offsetOf(index: number): number {
    let sum = 0;
    for (let i = Math.min(index, this.#length); i > 0; i -= i & -i)
      sum += this.#tree[i]!;
    return sum;
  }

  get total(): number {
    return this.offsetOf(this.#length);
  }

  /**
   * Index of the item containing `offset` (the last item whose start is <= offset), clamped to
   * `[0, length - 1]`. Returns -1 for an empty index.
   */
  indexAt(offset: number): number {
    if (this.#length === 0) return -1;
    let position = 0;
    let remaining = offset;
    for (let step = this.#topBit; step > 0; step >>= 1) {
      const next = position + step;
      if (next <= this.#length && this.#tree[next]! <= remaining) {
        position = next;
        remaining -= this.#tree[next]!;
      }
    }
    return Math.min(position, this.#length - 1);
  }
}
