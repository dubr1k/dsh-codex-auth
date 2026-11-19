/** Each supported DSH graph is verified independently; mixed graphs are never accepted. */
export const SUPPORTED_DSH_RUNTIMES: readonly string[] = Object.freeze([
  '0.2.2-rc.1',
  '0.2.2-rc.2',
  '0.2.2-rc.3',
  '0.2.2-rc.4',
  '0.2.2-rc.5',
])

/** Observed coherent prereleases; future RCs and stable releases need their own verification. */
export const SUPPORTED_DSH_PEER_RANGE = '0.2.2-rc.1 || 0.2.2-rc.2 || 0.2.2-rc.3 || 0.2.2-rc.4 || 0.2.2-rc.5'

export function isSupportedDshGraph(versions: readonly string[]): boolean {
  const version = versions[0]
  return version !== undefined
    && SUPPORTED_DSH_RUNTIMES.includes(version)
    && versions.every(candidate => candidate === version)
}

/** Development version of the Pi converter shared with the updated Harness build. */
export const CURRENT_PI_AI_VERSION = '1.5.2'

/** Accept the converter versions shipped by the original Desktop and the updated build. */
export function isSupportedPiAiVersion(version: string): boolean {
  return version === '1.3.0' || version === CURRENT_PI_AI_VERSION
}
