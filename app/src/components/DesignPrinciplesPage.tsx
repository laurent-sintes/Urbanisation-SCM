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
import { ui } from '../ui.ts';
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
      <section
        className="design-principles"
        aria-label={ui('designPrinciplesPage.referentiel_des_principes_directeurs')}
      >
        {route.principle && (
          <p role="status">{ui('designPrinciplesPage.ce_principe_n_est_pas_presente_dans_cette_publication')}</p>
        )}
        <div className="principle-overview">
          <section className="principle-choices">
            <div className="principle-index-heading">
              <h2>
                <span className="principle-total">{choices.length}</span>{' '}
                {choices.length > 1
                  ? ui('designPrinciplesPage.principes_directeurs')
                  : ui('designPrinciplesPage.principe_directeur')}
              </h2>
              {guides.map((p) => (
                <a className="principle-reading-link" key={p.id} href={link(p.id)}>
                  <BookOpen size={18} aria-hidden="true" />
                  {ui('designPrinciplesPage.comment_lire_la_cartographie')}
                </a>
              ))}
            </div>
            {choices.length > 0 && list(choices)}
          </section>
        </div>
        {!choices.length && (
          <p>{ui('designPrinciplesPage.aucun_principe_directeur_presente_dans_cette_publication')}</p>
        )}
      </section>
    );
  return (
    <article className="design-principles principle-detail" aria-label={principleTitle(selected)}>
      <button type="button" onClick={() => onSelect('')}>
        {ui('designPrinciplesPage.tous_les_principes_directeurs')}
      </button>
      <p className="eyebrow">
        {isGuide
          ? ui('designPrinciplesPage.guide_de_lecture')
          : principleCategories[selected.category || ''] || ui('designPrinciplesPage.regle_du_modele')}
      </p>
      <h2>{principleTitle(selected)}</h2>
      <section>
        <h3>
          {isGuide ? ui('designPrinciplesPage.lire_une_cartographie_metier') : ui('designPrinciplesPage.le_principe')}
        </h3>
        <p>
          <PrincipleText text={selected.statement} />
        </p>
      </section>
      {selected.reading_children?.length && (
        <section className="principle-practices">
          <h3>{ui('designPrinciplesPage.bonnes_pratiques_de_cartographie')}</h3>
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
        <h3>
          {isGuide
            ? ui('designPrinciplesPage.a_quoi_servent_ces_reperes')
            : ui('designPrinciplesPage.pourquoi_ce_choix')}
        </h3>
        <p>
          <PrincipleText
            text={selected.rationale || ui('designPrinciplesPage.justification_non_renseignee_dans_cette_publication')}
          />
        </p>
      </section>
      {selected.implications && (
        <section>
          <h3>
            {isGuide
              ? ui('designPrinciplesPage.parcourir_le_modele')
              : ui('designPrinciplesPage.ce_que_cela_change_dans_la_carte')}
          </h3>
          <p>
            <PrincipleText text={selected.implications} />
          </p>
        </section>
      )}
      {(selected.examples || []).map((e) => (
        <section key={`${e.kind}:${e.text}`} className={`principle-example ${e.kind}`}>
          <h3>
            {e.kind === 'illustration'
              ? ui('designPrinciplesPage.exemple_illustratif')
              : ui('designPrinciplesPage.contre_exemple')}
          </h3>
          <p>
            <PrincipleText text={e.text} />
          </p>
        </section>
      ))}
      {selected.tradeoffs && (
        <section>
          <h3>{ui('designPrinciplesPage.limites_et_compromis')}</h3>
          <p>
            <PrincipleText text={selected.tradeoffs} />
          </p>
        </section>
      )}
      {selected.scope && (
        <section>
          <h3>
            {isGuide
              ? ui('designPrinciplesPage.points_d_entree_dans_la_cartographie')
              : ui('designPrinciplesPage.perimetres_concernes')}
          </h3>
          <p>
            {isGuide
              ? ui('designPrinciplesPage.ces_liens_permettent_de_mettre_les_reperes_de_lecture_en_pratique')
              : selected.scope.kind === 'global'
                ? ui('designPrinciplesPage.orientation_applicable_a_l_ensemble_de_la_carte_les_liens_suivant')
                : ui('designPrinciplesPage.orientation_ciblee_sur_les_responsabilites_suivantes_et_leurs_com')}
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
          <h3>
            {isGuide
              ? ui('designPrinciplesPage.descriptions_qui_citent_ces_reperes')
              : ui('designPrinciplesPage.descriptions_qui_citent_ce_principe')}
          </h3>
          <p>
            {isGuide
              ? ui('designPrinciplesPage.ces_descriptions_renvoient_aux_bonnes_pratiques_du_guide')
              : ui('designPrinciplesPage.ces_renvois_expliquent_un_passage_ils_n_etendent_pas_le_perimetre')}
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
                  ·{' '}
                  {r.collection === 'nodes'
                    ? ui('designPrinciplesPage.fiche')
                    : r.collection === 'terms'
                      ? ui('designPrinciplesPage.glossaire')
                      : ui('designPrinciplesPage.relation')}
                </small>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h3>
          {isGuide ? ui('designPrinciplesPage.references_de_methode') : ui('designPrinciplesPage.recherche_et_marche')}
        </h3>
        {selected.references?.length ? (
          <ul className="principle-references">
            {selected.references.map((r) => (
              <li key={r.id}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.publisher} — {r.title}
                </a>
                <p>
                  {r.edition}
                  {ui('designPrinciplesPage.consulte_le')}
                  {r.consulted_on} · {r.locator}
                </p>
                <p>
                  <strong>{ui('designPrinciplesPage.apport_observe')}</strong>
                  <PrincipleText text={r.observed} />
                </p>
                <p>
                  <strong>{ui('designPrinciplesPage.utilisation')}</strong>
                  <PrincipleText text={r.role} />
                </p>
                <p>
                  <strong>{ui('designPrinciplesPage.limites')}</strong>
                  <PrincipleText text={r.limits} />
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>{ui('designPrinciplesPage.aucun_appui_externe_documente_dans_cette_publication_le_principe_')}</p>
        )}
      </section>
      {related.length > 0 ? (
        <section>
          <h3>
            {isGuide
              ? ui('designPrinciplesPage.principes_directeurs_a_explorer')
              : ui('designPrinciplesPage.autres_principes_directeurs')}
          </h3>
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
          <h3>{ui('designPrinciplesPage.exceptions_documentees')}</h3>
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
          <h3>{ui('designPrinciplesPage.quand_reexaminer_ce_choix')}</h3>
          <p>
            <PrincipleText text={selected.review_trigger} />
          </p>
        </section>
      )}
    </article>
  );
}
