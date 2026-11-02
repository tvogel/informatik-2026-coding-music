/**
 * Strudel code for PhaseShift: a reference sine and a copy shifted by
 * `degrees`, both started together so their phase relation is fixed.
 * `s("sine")` ignores `phases`, so the sine is built from one partial.
 * In stereo, the reference plays on the left and the copy on the right.
 */
export function phaseTune(
  freq: number,
  degrees: number,
  stereo: boolean,
): string {
  const phase = Number((degrees / 360).toFixed(4));
  return stereo
    ? `s("user").partials([1]).freq(${freq}).slow(4).pan(0).superimpose(x => x.phases([${phase}]).pan(1))`
    : `s("user").partials([1]).freq(${freq}).slow(4).superimpose(x => x.phases([${phase}]))`;
}
