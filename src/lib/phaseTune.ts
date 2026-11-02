export type Wave = "sine" | "triangle";

/** Partials of the triangle wave; only the odd ones sound. */
export const TRIANGLE_PARTIALS = 15;

/**
 * Strudel code for PhaseShift: a reference wave and a copy shifted by
 * `degrees`, both started together so their phase relation is fixed.
 * `phases` only works on waves built from partials: `s("sine")` ignores it,
 * so the sine is built from one partial. Shifting a whole wave by a part of
 * its period shifts its n-th partial by n times that.
 * In stereo, the reference plays on the left and the copy on the right.
 */
export function phaseTune(
  wave: Wave,
  freq: number,
  degrees: number,
  stereo: boolean,
): string {
  const phase = Number((degrees / 360).toFixed(4));
  const [source, phases] =
    wave === "triangle"
      ? [
          `s("triangle").partials(${TRIANGLE_PARTIALS})`,
          `[...Array(${TRIANGLE_PARTIALS})].map((_, i) => (i + 1) * ${phase} % 1)`,
        ]
      : [`s("user").partials([1])`, `[${phase}]`];
  return stereo
    ? `${source}.freq(${freq}).slow(4).pan(0).superimpose(x => x.phases(${phases}).pan(1))`
    : `${source}.freq(${freq}).slow(4).superimpose(x => x.phases(${phases}))`;
}

/**
 * One period of the wave Strudel plays, for x in periods, with peak 1.
 * superdough builds its triangle from cosines: Σ cos(2πnx) / n² for odd n.
 * It is drawn a quarter period later, rising from zero like the sine; that
 * shifts both curves alike, so the phase relation stays the same.
 */
export function waveShape(wave: Wave): (x: number) => number {
  if (wave === "sine") return (x) => Math.sin(2 * Math.PI * x);
  let peak = 0;
  for (let n = 1; n <= TRIANGLE_PARTIALS; n += 2) peak += 1 / n ** 2;
  return (x) => {
    let y = 0;
    for (let n = 1; n <= TRIANGLE_PARTIALS; n += 2) {
      y += Math.cos(2 * Math.PI * n * (x - 0.25)) / n ** 2;
    }
    return y / peak;
  };
}
