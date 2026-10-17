export class HitRate {
  constructor(
    readonly hitCount: number,
    readonly missCount: number,
    readonly hitRate: number | undefined,
  ) {}
}
