import { useId } from 'react';
import type { GuideChapter } from '../modelingGuide';

/** The labels and meaning travel with the publication, not with live assets. */
export function MethodVisual({ visual }: { visual: NonNullable<GuideChapter['visual']> }) {
  const id = useId();
  if (visual.overview_svg) {
    const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(visual.overview_svg)}`;
    return <figure className="method-visual method-overview">
      <figcaption>{visual.title}</figcaption>
      <img className="method-overview-image" src={source} alt={visual.title} aria-describedby={`${id}-description`}/>
      <details className="method-overview-zoom"><summary>Lire le schéma en grand format</summary>
        <div tabIndex={0} role="region" aria-label={`Vue agrandie : ${visual.title}`}><img src={source} alt={visual.title}/></div>
      </details>
      <p id={`${id}-description`}>{visual.description}</p>
      <details><summary>Repères textuels du schéma</summary><p>{visual.center}</p><ul>{visual.items.map(item=><li key={item}>{item}</li>)}</ul></details>
    </figure>;
  }
  const dimensions = visual.kind === 'dimensions';
  const positions = dimensions ? [[200, 68], [600, 68], [200, 178], [600, 178], [200, 288], [600, 288]] : [[400, 62], [200, 200], [600, 200]];
  const words = (label: string) => {
    const parts = label.split(' '); const lines: string[] = []; let line = '';
    for (const word of parts) { if ((line + ' ' + word).trim().length > 26) { lines.push(line); line = word; } else line = (line + ' ' + word).trim(); }
    return [...lines, line];
  };
  return <figure className="method-visual">
    <figcaption>{visual.title}</figcaption>
    <div className="method-visual-scroll" tabIndex={0} role="region" aria-label={visual.title}>
      <svg viewBox="0 0 800 410" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{visual.title}</title><desc id={`${id}-desc`}>{visual.description} {visual.items.join(' ; ')}. {visual.center}.</desc>
        <defs><marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#236159"/></marker></defs>
        {dimensions ? <path d="M400 50V338 M375 68H425 M375 178H425 M375 288H425" fill="none" stroke="#236159" strokeWidth="2"/> : ['M335 108L240 153','M465 108L560 153','M380 200H420'].map(d=><path key={d} d={d} fill="none" stroke="#236159" strokeWidth="2" markerStart={`url(#${id}-arrow)`} markerEnd={`url(#${id}-arrow)`}/>)}
        {visual.items.map((item, index) => { const [x,y] = positions[index]; return <g key={item}>
          <rect x={x-175} y={y-42} width="350" height="84" rx="12" fill={index % 2 ? '#DAE0F2' : '#D9F2EA'} stroke="#b9cdc6"/>
          <text x={x} y={y-(words(item).length-1)*13+7} textAnchor="middle" fontSize="22" fill="#173f39" fontFamily="Segoe UI, Arial, sans-serif">{words(item).map((line,i)=><tspan x={x} dy={i?26:0} key={i}>{line}</tspan>)}</text>
        </g>; })}
        <rect x="25" y="338" width="750" height="58" rx="12" fill="#236159"/>
        <text x="400" y="363" textAnchor="middle" fill="white" fontSize={dimensions?21:18} fontFamily="Segoe UI, Arial, sans-serif">{dimensions ? visual.center : visual.center.split(' : ')[0]}{!dimensions && <tspan x="400" dy="22">{visual.center.split(' : ')[1]}</tspan>}</text>
      </svg>
    </div>
    <div className="method-visual-mobile"><p><strong>{visual.center}</strong></p><ul>{visual.items.map(item=><li key={item}>{item}</li>)}</ul></div>
    <p>{visual.description}</p>
  </figure>;
}
