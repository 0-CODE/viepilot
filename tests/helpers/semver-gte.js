/**
 * Semver greater-than-or-equal comparison for resilient version assertions.
 * Compares two semantic version strings (X.Y.Z format).
 * @param {string} actual - Actual version string (e.g., "3.13.0")
 * @param {string} expected - Expected minimum version string (e.g., "3.12.1")
 * @returns {boolean} true if actual >= expected
 */
function isVersionGte(actual, expected) {
  const parts = (v) => v.split('.').map(Number);
  const [actualMajor, actualMinor, actualPatch] = parts(actual);
  const [expectedMajor, expectedMinor, expectedPatch] = parts(expected);

  if (actualMajor !== expectedMajor) {
    return actualMajor > expectedMajor;
  }
  if (actualMinor !== expectedMinor) {
    return actualMinor > expectedMinor;
  }
  return actualPatch >= expectedPatch;
}

module.exports = { isVersionGte };
