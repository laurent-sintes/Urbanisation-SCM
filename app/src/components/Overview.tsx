import type { PublishedModel } from '../types';
import { childrenOf, rootsOf } from '../model';
import { ModelText } from './ModelLinks';

/** The overview follows the publication's explicit hierarchy and frozen order. */
export function Overview({ model, onExplore, onRead }: { model: PublishedModel; onExplore: (id: string) => void; onRead: (id: string) => void }) {
  return <section className="urbanisation-overview" aria-label="Vue d’ensemble des systèmes métier">
    {rootsOf(model).filter(node => node.kind === 'business_system').map(system => {
      const domains = childrenOf(model, system.id);
      return <article data-node-id={system.id} key={system.id} className={`overview-system ${domains.length ? 'operating' : 'context'}`}>
        <small>{domains.length ? 'Domaines opérationnels' : 'Vue de contexte'}</small>
        <h2><button onClick={() => onRead(system.id)}>{system.name}</button></h2>
        <p><ModelText text={system.purpose || system.definition}/></p>
        {domains.length > 0 && <ul>{domains.map(domain => <li key={domain.id}>
          <button onClick={() => childrenOf(model, domain.id).length ? onExplore(domain.id) : onRead(domain.id)}>{domain.name}<span>{childrenOf(model, domain.id).length ? 'Explorer les sous-domaines →' : 'Lire le périmètre →'}</span></button>
        </li>)}</ul>}
        <button className="secondary-button" onClick={() => domains.length ? onExplore(system.id) : onRead(system.id)}>{domains.length ? 'Explorer les domaines' : 'Lire le contexte'}</button>
      </article>;
    })}
  </section>;
}
