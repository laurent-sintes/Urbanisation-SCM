import type { PublishedModel } from '../types';
import { childrenOf, descendantsOf, rootsOf } from '../model';

const plainDefinition = (text: string) => text.replace(/^\[[^\]]+\]\([^)]*\)\s*:\s*/, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

/** The overview follows the publication's explicit hierarchy and frozen order. */
export function Overview({ model, detail, onOpen }: { model: PublishedModel; detail: number; onOpen: (id: string) => void }) {
  const universe = rootsOf(model).find(node => node.kind === 'universe');
  const systems = universe ? childrenOf(model, universe.id).filter(node => node.kind === 'business_system') : rootsOf(model).filter(node => node.kind === 'business_system');
  return <section className="universe-overview" aria-label="Univers des systèmes métier">
    <div className="universe-toolbar"><h2>Systèmes métier</h2></div>
    <div className="urbanisation-overview">{systems.map(system => {
      const domains = childrenOf(model, system.id).filter(node => node.kind === 'domain');
      const subdomains = domains.flatMap(domain => childrenOf(model, domain.id).filter(node => node.kind === 'area'));
      const capabilities = descendantsOf(model, system.id).filter(node => node.kind === 'capability');
      return <article data-node-id={system.id} key={system.id} className="overview-system">
        <small>Système métier</small>
        <h3><button onClick={() => onOpen(system.id)}>{system.name}</button></h3>
        <p>{system.purpose || system.definition}</p>
        {system.purpose && system.definition && <p className="overview-definition">{plainDefinition(system.definition)}</p>}
        <div className="overview-stats" aria-label={`Contenu publié de ${system.name}`}><span><strong>{domains.length}</strong> domaine{domains.length > 1 ? 's' : ''}</span><span><strong>{subdomains.length}</strong> sous-domaine{subdomains.length > 1 ? 's' : ''}</span>{capabilities.length > 0 && <span><strong>{capabilities.length}</strong> capacité{capabilities.length > 1 ? 's' : ''}</span>}</div>
        {detail > 0 && <div className="overview-hierarchy">{domains.length ? <ul>{domains.map(domain => {
          const areas = childrenOf(model, domain.id).filter(node => node.kind === 'area');
          return <li key={domain.id}><button className="overview-domain-link" onClick={() => onOpen(domain.id)}>{domain.name}</button>{domain.purpose && <span className="overview-domain-purpose">{domain.purpose}</span>}{detail > 1 && areas.length > 0 && <ul>{areas.map(area => <li key={area.id}><button className="overview-subdomain-link" onClick={() => onOpen(area.id)}>{area.name}</button></li>)}</ul>}</li>;
        })}</ul> : <p>Aucun domaine détaillé dans cette publication.</p>}</div>}
      </article>;
    })}</div>
  </section>;
}
