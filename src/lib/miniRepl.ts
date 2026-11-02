/**
 * Replaces the code of a `<strudel-editor>` created by MiniRepl. A playing
 * editor restarts, so that even long notes change at once.
 */
export function setTune(
  repl: HTMLElement & { editor?: any },
  code: string,
): void {
  repl.setAttribute("code", code);
  if (repl.editor?.repl?.scheduler?.started) {
    repl.dispatchEvent(new Event("mini-repl:restart"));
  }
}
