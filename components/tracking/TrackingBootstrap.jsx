import { configJson, CONFIG_ELEMENT_ID, BOOTSTRAP_SCRIPT } from '../../lib/tracking/config'

// Server component. The store's tracking config as inert JSON plus ONE constant
// inline script (lib/tracking/config.js) that creates the dataLayer and loads
// GTM before React hydrates. `config` comes from buildTrackingConfig, which has
// already validated every id; nothing here is interpolated into code.
export default function TrackingBootstrap({ config }) {
  if (!config) return null
  return (
    <>
      <script type="application/json" id={CONFIG_ELEMENT_ID} dangerouslySetInnerHTML={{ __html: configJson(config) }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP_SCRIPT }} />
    </>
  )
}
