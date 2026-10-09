import { useEffect, useRef, useState } from 'react';
import { overviewLayout, prominentChildIndex } from '../adaptiveLayout';
import { childrenOf, descendantsOf, rootsOf } from '../model';
import type { PublishedModel } from '../types';
import { MapNodeButton, MetaTypeLabel, ModelText } from './ModelLinks';

const plainDefinition = (text: string) => text.replace(/^\[[^\]]+\]\([^)]*\)\s*:\s*/, '');

/** The overview follows the publication's explicit hierarchy and frozen order. */
export function Overview({
  model,
  detail,
  onOpen,
}: {
  model: PublishedModel;
  detail: number;
  onOpen: (id: string) => void;
}) {
  const universe = rootsOf(model).find((node) => node.kind === 'universe');
  const systems = universe
    ? childrenOf(model, universe.id).filter((node) => node.kind === 'business_system')
    : rootsOf(model).filter((node) => node.kind === 'business_system');
  const section = useRef<HTMLElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  useEffect(() => {
    const target = section.current;
    if (!target) return;
    const observer = new ResizeObserver(() => setAvailableWidth(target.clientWidth));
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  const weights = systems.map((system) => {
    const domains = childrenOf(model, system.id).filter((node) => node.kind === 'domain');
    return (
      1 +
      (detail > 0 ? domains.length * 2 : 0) +
      (detail > 1
        ? domains.reduce(
            (total, domain) => total + childrenOf(model, domain.id).filter((node) => node.kind === 'area').length,
            0,
          )
        : 0)
    );
  });
  const layout = overviewLayout(weights, availableWidth);
  return (
    <section
      ref={section}
      className="universe-overview"
      aria-label={`${universe?.name || 'Univers'} des systèmes métier`}
    >
      <div className="universe-toolbar">
        <h2>Systèmes métier</h2>
      </div>
      <div
        className={`urbanisation-overview layout-${layout.kind} ${layout.featuredIndex === 0 ? 'featured-first' : 'featured-middle'}`}
        data-layout={layout.kind}
      >
        {systems.map((system) => {
          const domains = childrenOf(model, system.id).filter((node) => node.kind === 'domain');
          const subdomains = domains.flatMap((domain) =>
            childrenOf(model, domain.id).filter((node) => node.kind === 'area'),
          );
          const capabilities = descendantsOf(model, system.id).filter((node) => node.kind === 'capability');
          const prominentDomain = prominentChildIndex(
            domains.map(
              (domain) =>
                1 + childrenOf(model, domain.id).filter((node) => node.kind === 'area').length * (detail > 1 ? 2 : 1),
            ),
          );
          return (
            <article data-node-id={system.id} key={system.id} className="overview-system">
              <small>
                <MetaTypeLabel node={system} />
              </small>
              <h3>
                <MapNodeButton node={system} onClick={() => onOpen(system.id)}>
                  {system.name}
                </MapNodeButton>
              </h3>
              <p>
                <ModelText text={system.purpose || system.definition} />
              </p>
              {system.purpose && system.definition && (
                <p className="overview-definition">
                  <ModelText text={plainDefinition(system.definition)} />
                </p>
              )}
              <div className="overview-stats" role="group" aria-label={`Contenu publié de ${system.name}`}>
                <span>
                  <strong>{domains.length}</strong> domaine{domains.length > 1 ? 's' : ''}
                </span>
                <span>
                  <strong>{subdomains.length}</strong> sous-domaine{subdomains.length > 1 ? 's' : ''}
                </span>
                {capabilities.length > 0 && (
                  <span>
                    <strong>{capabilities.length}</strong> capacité{capabilities.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {detail > 0 && (
                <div className="overview-hierarchy">
                  {domains.length ? (
                    <ul>
                      {domains.map((domain, domainIndex) => {
                        const areas = childrenOf(model, domain.id).filter((node) => node.kind === 'area');
                        return (
                          <li
                            key={domain.id}
                            className={domainIndex === prominentDomain ? 'overview-domain-prominent' : undefined}
                          >
                            <MapNodeButton
                              node={domain}
                              className="overview-domain-link"
                              onClick={() => onOpen(domain.id)}
                            >
                              {domain.name}
                            </MapNodeButton>
                            {domain.purpose && (
                              <span className="overview-domain-purpose">
                                <ModelText text={domain.purpose} />
                              </span>
                            )}
                            {detail > 1 && areas.length > 0 && (
                              <ul>
                                {areas.map((area) => (
                                  <li key={area.id}>
                                    <MapNodeButton
                                      node={area}
                                      className="overview-subdomain-link"
                                      onClick={() => onOpen(area.id)}
                                    >
                                      {area.name}
                                    </MapNodeButton>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p>Aucun domaine détaillé dans cette publication.</p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
