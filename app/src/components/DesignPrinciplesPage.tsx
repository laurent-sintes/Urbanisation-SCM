import { ArrowRight, BookOpen } from 'lucide-react';
import { useEffect } from 'react';
import {
  annotatePrincipleText,
  featuredPrinciples,
  principleCategories,
  principleChildren,
  principleDestination,
  principleTitle,
  readingGuides,
  readingsForPrinciple,
} from '../designPrinciples';
import { plainInlineText } from '../inlineLinks';
import type { RouteState } from '../navigation';
import { routeHash } from '../navigation';
import { revealSection } from '../readerNavigation';
import type { ArchitecturePrinciple, PublishedModel } from '../types';
import { ModelText, ReferenceLink, readingOrigin } from './ModelLinks';
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
  const destination = principleDestination(model, route.principle || '');
  const selected = destination?.principle;
  const choices = featuredPrinciples(model);
  const guides = readingGuides(model);
  const isGuide = Boolean(selected?.reading_children?.length);
  const related = selected
    ? [
        ...new Map(
          (selected.related_principles || []).flatMap((id) => {
            const p = principleDestination(model, id)?.principle;
            return p && !p.reading_children?.length && p.id !== selected.id ? [[p.id, p] as const] : [];
          }),
        ).values(),
      ]
    : [];
  const section = route.section || destination?.section;
  useEffect(() => {
    if (!section) return;
    const target = document.getElementById(section);
    if (target) revealSection(target);
  }, [section]);
  const link = (id: string) => {
    const target = principleDestination(model, id);
    return routeHash({
      ...route,
      view: 'design-principles',
      principle: target?.principle.id || '',
      section: target?.section || '',
      query: '',
    });
  };
  const list = (items: ArchitecturePrinciple[]) => (
    <ol className="principle-list">
      {items.map((p, index) => (
        <li key={p.id}>
          <a href={link(p.id)} aria-labelledby={`principle-choice-${p.id}`}>
            <span className="principle-number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="principle-preview">
              <strong id={`principle-choice-${p.id}`}>{principleTitle(p)}</strong>
              <span>{plainInlineText(p.summary || p.statement)}</span>
            </span>
            <ArrowRight size={21} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ol>
  );
  if (!selected)
    return (
      <section className="design-principles" aria-label="Référentiel des principes directeurs">
        {route.principle && <p role="status">Ce principe n’est pas présenté dans cette publication.</p>}
        <div className="principle-overview">
          <section className="principle-choices">
            <div className="principle-index-heading">
              <h2>
                <span className="principle-total">{choices.length}</span>{' '}
                {choices.length > 1 ? 'principes directeurs' : 'principe directeur'}
              </h2>
              {guides.map((p) => (
                <a className="principle-reading-link" key={p.id} href={link(p.id)}>
                  <BookOpen size={18} aria-hidden="true" />
                  Comment lire la cartographie
                </a>
              ))}
            </div>
            {choices.length > 0 && list(choices)}
          </section>
        </div>
        {!choices.length && <p>Aucun principe directeur présenté dans cette publication.</p>}
      </section>
    );
  return (
    <article className="design-principles principle-detail" aria-label={principleTitle(selected)}>
      <button type="button" onClick={() => onSelect('')}>
        Tous les principes directeurs
      </button>
      <p className="eyebrow">
        {isGuide ? 'Guide de lecture' : principleCategories[selected.category || ''] || 'Règle du modèle'}
      </p>
      <h2>{principleTitle(selected)}</h2>
      <section>
        <h3>{isGuide ? 'Lire une cartographie métier' : 'Le principe'}</h3>
        <p>
          <PrincipleText text={selected.statement} />
        </p>
      </section>
      {selected.reading_children?.length && (
        <section className="principle-practices">
          <h3>Bonnes pratiques de cartographie</h3>
          {principleChildren(model, selected).map((child) => (
            <section key={child.id} id={`principle-${child.id}`} tabIndex={-1} className="principle-practice">
              <h4>{principleTitle(child)}</h4>
              <p>
                <PrincipleText text={child.statement} />
              </p>
            </section>
          ))}
        </section>
      )}
      <section>
        <h3>{isGuide ? 'À quoi servent ces repères' : 'Pourquoi ce choix'}</h3>
        <p>
          <PrincipleText text={selected.rationale || 'Justification non renseignée dans cette publication.'} />
        </p>
      </section>
      {selected.implications && (
        <section>
          <h3>{isGuide ? 'Parcourir le modèle' : 'Ce que cela change dans la carte'}</h3>
          <p>
            <PrincipleText text={selected.implications} />
          </p>
        </section>
      )}
      {(selected.examples || []).map((e) => (
        <section key={`${e.kind}:${e.text}`} className={`principle-example ${e.kind}`}>
          <h3>{e.kind === 'illustration' ? 'Exemple illustratif' : 'Contre-exemple'}</h3>
          <p>
            <PrincipleText text={e.text} />
          </p>
        </section>
      ))}
      {selected.tradeoffs && (
        <section>
          <h3>Limites et compromis</h3>
          <p>
            <PrincipleText text={selected.tradeoffs} />
          </p>
        </section>
      )}
      {selected.scope && (
        <section>
          <h3>{isGuide ? 'Points d’entrée dans la cartographie' : 'Périmètres concernés'}</h3>
          <p>
            {isGuide
              ? 'Ces liens permettent de mettre les repères de lecture en pratique.'
              : selected.scope.kind === 'global'
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
      {readingsForPrinciple(model, selected.id).length > 0 && (
        <section className="principle-readings">
          <h3>{isGuide ? 'Descriptions qui citent ces repères' : 'Descriptions qui citent ce principe'}</h3>
          <p>
            {isGuide
              ? 'Ces descriptions renvoient aux bonnes pratiques du guide.'
              : 'Ces renvois expliquent un passage ; ils n’étendent pas le périmètre d’application du principe.'}
          </p>
          <ul>
            {readingsForPrinciple(model, selected.id).map((r) => (
              <li key={`${r.collection}:${r.id}`}>
                {r.collection === 'nodes' ? (
                  <ReferenceLink target={r.id} anchor={r.fields[0]}>
                    {model.nodeById.get(r.id)?.name || r.id}
                  </ReferenceLink>
                ) : r.collection === 'terms' ? (
                  <ReferenceLink kind="glossary" target={r.id}>
                    {model.glossaryById.get(r.id)?.name || r.id}
                  </ReferenceLink>
                ) : (
                  <a
                    href={routeHash({
                      ...route,
                      view: 'relations',
                      principle: '',
                      relation: r.id,
                      node: '',
                      scope: '',
                      query: '',
                      section: '',
                      scroll: '',
                      returnTo: readingOrigin(route, model.version),
                    })}
                    onClick={(event) => {
                      event.currentTarget.href = routeHash({
                        ...route,
                        view: 'relations',
                        principle: '',
                        relation: r.id,
                        node: '',
                        scope: '',
                        query: '',
                        section: '',
                        scroll: '',
                        returnTo: readingOrigin(route, model.version),
                      });
                    }}
                  >
                    {model.relationById.get(r.id)?.label || r.id}
                  </a>
                )}
                <small>
                  {' '}
                  · {r.collection === 'nodes' ? 'Fiche' : r.collection === 'terms' ? 'Glossaire' : 'Relation'}
                </small>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h3>{isGuide ? 'Références de méthode' : 'Recherche et marché'}</h3>
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
      {related.length > 0 ? (
        <section>
          <h3>{isGuide ? 'Principes directeurs à explorer' : 'Autres principes directeurs'}</h3>
          <ul>
            {related.map((p) => (
              <li key={p.id}>
                <a href={link(p.id)}>{principleTitle(p)}</a>
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
      {!isGuide && selected.review_trigger && (
        <section>
          <h3>Quand réexaminer ce choix</h3>
          <p>
            <PrincipleText text={selected.review_trigger} />
          </p>
        </section>
      )}
    </article>
  );
}
