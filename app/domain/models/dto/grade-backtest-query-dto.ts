export class GradeBacktestQueryDto {
  constructor(
    readonly completedFrom: string,
    readonly completedTo: string,
    readonly symbol: string,
    readonly category: string,
  ) {}
}
