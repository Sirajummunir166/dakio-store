import { SCHEMA_VERSION } from '../ThemeContract.js'

/**
 * Checks whether a ThemeContract object is compatible with the current runtime.
 * Returns true if the contract can be used without upgrade.
 */
export function isCompatible(contract) {
  return contract?._meta?.schemaVersion === SCHEMA_VERSION
}

/**
 * Upgrade a ThemeContract from an older schema version to the current one.
 * Called automatically by the runtime when loading a saved/cached contract.
 *
 * Add migration branches here as SCHEMA_VERSION advances.
 * Each branch must be additive — never remove fields.
 */
export function upgradeContract(contract) {
  if (!contract?._meta) return contract

  // v1.0.0 is the initial version — no upgrades needed yet.
  // Future example:
  //   if (contract._meta.schemaVersion === '1.0.0') {
  //     contract = migrate_1_0_0_to_1_1_0(contract)
  //   }

  return contract
}
