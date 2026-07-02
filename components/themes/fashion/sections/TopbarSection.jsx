import { sanitizeThemeUrl } from '../../../../lib/theme/sanitizeThemeUrl.js'

export default function TopbarSection({ settings }) {
  return (
    <div className="topbar">
      <div className="container topbar__inner">
        <p>{settings.message}</p>
        <div className="topbar__links">
          {settings.links?.map((link) => (
            <a key={link.label} href={sanitizeThemeUrl(link.href) ?? '#'}>{link.label}</a>
          ))}
          {settings.currency && <span>{settings.currency}</span>}
        </div>
      </div>
    </div>
  )
}
