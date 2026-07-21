import StudioCanvas from '@/components/studio/StudioCanvas';

// Store Studio canvas — rendered ONLY inside the studio chrome iframe (dakio-merchant).
// Shoppers never reach this route; it renders nothing without a bridge parent.
export const metadata = {
  title: 'Store Studio Canvas',
  robots: { index: false, follow: false },
};

export default function StudioCanvasPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Instrument+Serif&family=Archivo:wght@500;600;700;800;900&family=Cormorant+Garamond:wght@500;600;700&family=Karla:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        html, body { margin:0; background:transparent; }
        @keyframes popIn { 0% { opacity:0; transform:scale(0.97) translateY(8px); } 100% { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes marquee { 0% { transform:translateX(0); } 100% { transform:translateX(-33.333%); } }
        @keyframes rvrise { 0% { opacity:0; transform:translateY(30px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes rvfade { 0% { opacity:0; } 100% { opacity:1; } }
        @keyframes rvzoom { 0% { opacity:0; transform:scale(0.94); } 100% { opacity:1; transform:scale(1); } }
        input::placeholder { color: currentColor; opacity: .38; }
        [contenteditable] { outline:none; }
        [contenteditable]:focus { box-shadow:0 0 0 2px rgba(198,240,53,0.9), 0 0 0 4px rgba(26,29,18,0.85); border-radius:4px; }
        ::-webkit-scrollbar { width:8px; height:8px; }
        ::-webkit-scrollbar-thumb { background:rgba(27,30,21,0.16); border-radius:99px; }
        ::-webkit-scrollbar-track { background:transparent; }
        .st-sec:hover { outline:2px dashed rgba(154,176,44,0.9); outline-offset:-2px; }
        .st-zone { opacity:0; transition:opacity .12s ease; }
        .st-zone:hover { opacity:1; }
        .st-endzone { opacity:0.4; transition:opacity .12s; }
        .st-endzone:hover { opacity:1; }
        .st-tbtn:hover { background:rgba(198,240,53,0.16); }
        .st-tbtn-danger:hover { background:rgba(176,58,46,0.35); }
      `}</style>
      <StudioCanvas />
    </>
  );
}
