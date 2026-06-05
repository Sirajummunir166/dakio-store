'use client'
import Script from 'next/script'

// Injects Meta Pixel and/or Google Tag Manager scripts for this store.
// Only fires if the merchant has saved a pixelId / gtmId.
// PageView is fired inline in the Pixel init script.
// GTM noscript iframe is rendered after the script for non-JS fallback.
export default function TrackingScripts({ store }) {
  const pixelId = store?.metaPixelId     || null
  const gtmId   = store?.gtmContainerId  || null

  if (!pixelId && !gtmId) return null

  return (
    <>
      {/* ── Meta Pixel ── */}
      {pixelId && (
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
              n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
              t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','${pixelId}');
              fbq('track','PageView');
            `,
          }}
        />
      )}

      {/* ── Google Tag Manager ── */}
      {gtmId && (
        <>
          <Script
            id="gtm-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
          {/* GTM noscript fallback — for non-JS environments */}
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />
        </>
      )}
    </>
  )
}
