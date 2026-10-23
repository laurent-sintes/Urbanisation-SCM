import { useState } from 'react';
import { annotatePrincipleText, designPrinciples, principleCategories, principleTitle } from '../designPrinciples';
import type { RouteState } from '../navigation';
import { routeHash } from '../navigation';
import type { ArchitecturePrinciple, PublishedModel } from '../types';
import { ModelText, ReferenceLink } from './ModelLinks';
import './design-principles.css';

export function DesignPrinciplesPage({
  model,
  route,
  onSelect,
}: {
  model: PublishedModel;
  route: RouteState;
  onSelect: (id: string) => void;
}) {
  const PrincipleText = ({ text }: { text: string }) => <ModelText text={annotatePrincipleText(model, text)} />;
  const [category, setCategory] = useState('');
  const [scope, setScope] = useState('');
  const principles = designPrinciples(model);
  const selected = principles.find((p) => p.id === route.principle);
  const featured = principles.filter((p) => p.featured);
  const legacy = principles.filter((p) => !p.featured);
  const targets = [
    ...new Set(
      featured.flatMap((p) => p.scope?.targets.filter((t) => t.collection === 'nodes').map((t) => t.id) || []),
    ),
  ]
    .map((id) => model.nodeById.get(id))
    .filter((n) => !!n)
    .sort((a, b) => a.name.localeCompare(b.name));
  const filtered = featured.filter(
    (p) =>
      (!category || p.category === category) &&
      (!scope || p.scope?.targets.some((t) => t.collection === 'nodes' && t.id === scope)),
  );
  const link = (id: string) =>
    routeHash({ ...route, view: 'design-principles', principle: id, section: '', query: '' });
  const cards = (items: ArchitecturePrinciple[]) => (
    <ul className="principle-cards">
      {items.map((p) => (
        <li key={p.id}>
          <a href={link(p.id)}>
            <strong>{principleTitle(p)}</strong>
          </a>
          <p>
            <PrincipleText text={p.summary || p.statement} />
          </p>
          <small>{principleCategories[p.category || ''] || 'Règle du modèle'}</small>
        </li>
      ))}
    </ul>
  );
  if (!selected)
    return (
      <section className="design-principles" aria-label="Référentiel des principes directeurs">
        {route.principle && <p role="status">Ce principe n’est pas présent dans cette publication.</p>}
        <p>
          Ces choix orientent la cartographie cible : ils expliquent ses frontières, les responsabilités retenues et les
          compromis. Une comparaison au marché apporte un éclairage ; elle ne prouve pas une réalisation installée.
        </p>
        {featured.length > 0 && (
          <>
            <div className="principle-filters">
              <label>
                Thème
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Tous les thèmes</option>
                  {Object.entries(principleCategories)
                    .filter(([key]) => featured.some((p) => p.category === key))
                    .map(([key, label]) => (
                      <option value={key} key={key}>
                        {label}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Périmètre
                <select value={scope} onChange={(e) => setScope(e.target.value)}>
                  <option value="">Tous les périmètres</option>
                  {targets.map((n) => (
                    <option value={n.id} key={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p role="status">
              {filtered.length} principe{filtered.length > 1 ? 's' : ''}
            </p>
            {cards(filtered)}
          </>
        )}
        {legacy.length > 0 && (
          <details className="principle-conventions" open={!featured.length}>
            <summary>Conventions et règles associées ({legacy.length})</summary>
            {!featured.length && (
              <p>
                Cette publication contient les énoncés historiques. Leurs justifications détaillées ne sont pas
                renseignées dans cette édition.
              </p>
            )}
            {cards(legacy)}
          </details>
        )}
        {!principles.length && <p>Aucun principe documenté dans cette publication.</p>}
      </section>
    );
  return (
    <article className="design-principles principle-detail" aria-label={principleTitle(selected)}>
      <button type="button" onClick={() => onSelect('')}>
        Tous les principes directeurs
      </button>
      <p className="eyebrow">{principleCategories[selected.category || ''] || 'Règle du modèle'}</p>
      <h2>{principleTitle(selected)}</h2>
      <section>
        <h3>Le principe</h3>
        <PrincipleText text={selected.statement} />
      </section>
      <section>
        <h3>Pourquoi ce choix</h3>
        <PrincipleText text={selected.rationale || 'Justification non renseignée dans cette publication.'} />
      </section>
      {selected.implications && (
        <section>
          <h3>Ce que cela change dans la carte</h3>
          <PrincipleText text={selected.implications} />
        </section>
      )}
      {(selected.examples || []).map((e) => (
        <section key={`${e.kind}:${e.text}`} className={`principle-example ${e.kind}`}>
          <h3>{e.kind === 'illustration' ? 'Exemple illustratif' : 'Contre-exemple'}</h3>
          <PrincipleText text={e.text} />
        </section>
      ))}
      {selected.tradeoffs && (
        <section>
          <h3>Limites et compromis</h3>
          <PrincipleText text={selected.tradeoffs} />
        </section>
      )}
      {selected.scope && (
        <section>
          <h3>Périmètres concernés</h3>
          <p>
            {selected.scope.kind === 'global'
              ? 'Orientation applicable à l’ensemble de la carte. Les liens suivants donnent des points d’entrée.'
              : 'Orientation ciblée sur les responsabilités suivantes et leurs composantes.'}
          </p>
          <ul>
            {selected.scope.targets.map((t) => (
              <li key={`${t.collection}:${t.id}`}>
                {t.collection === 'nodes' ? (
                  <ReferenceLink target={t.id}>{model.nodeById.get(t.id)?.name || t.id}</ReferenceLink>
                ) : (
                  <a
                    href={routeHash({
                      ...route,
                      view: 'relations',
                      principle: '',
                      relation: t.id,
                      node: '',
                      scope: '',
                      query: '',
                      returnTo: routeHash(route),
                    })}
                  >
                    {model.relationById.get(t.id)?.label || t.id}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h3>Recherche et marché</h3>
        {selected.references?.length ? (
          <ul className="principle-references">
            {selected.references.map((r) => (
              <li key={r.id}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.publisher} — {r.title}
                </a>
                <p>
                  {r.edition} · consulté le {r.consulted_on} · {r.locator}
                </p>
                <p>
                  <strong>Apport observé : </strong>
                  <PrincipleText text={r.observed} />
                </p>
                <p>
                  <strong>Utilisation : </strong>
                  <PrincipleText text={r.role} />
                </p>
                <p>
                  <strong>Limites : </strong>
                  <PrincipleText text={r.limits} />
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            Aucun appui externe documenté dans cette publication. Le principe exprime un choix de conception de la
            carte.
          </p>
        )}
      </section>
      {selected.related_principles?.length ? (
        <section>
          <h3>Principes et conventions liés</h3>
          <ul>
            {selected.related_principles.map((id) => (
              <li key={id}>
                <a href={link(id)}>{principleTitle(principles.find((p) => p.id === id) || { id, statement: '' })}</a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {selected.exceptions?.length ? (
        <section>
          <h3>Exceptions documentées</h3>
          <ul>
            {selected.exceptions.map((s) => (
              <li key={s}>
                <PrincipleText text={s} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {selected.review_trigger && (
        <section>
          <h3>Quand réexaminer ce choix</h3>
          <PrincipleText text={selected.review_trigger} />
        </section>
      )}
    </article>
  );
}
