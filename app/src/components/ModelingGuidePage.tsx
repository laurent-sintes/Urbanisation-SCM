import { ArrowUpRight, BookOpen, RefreshCw } from 'lucide-react';
import { useId, useState } from 'react';
import { activeMethod, isTransformationGuide } from '../methodNavigation';
import { type GuideLesson, lessonForPublication, type ModelingGuide } from '../modelingGuide';
import { revealSection } from '../readerNavigation';
import type { PublishedModel } from '../types';
import { ui } from '../ui.ts';
import type { GuideState } from '../useModelingGuide';
import { MethodNavigation } from './MethodNavigation';
import { CatalogLink, MethodLink, MethodReturn, ModelText, ReferenceLink } from './ModelLinks';
import { ReadingHelp } from './ReadingHelp';
import './modeling-guide.css';
import { HotspotAssessmentGuide } from './HotspotAssessmentGuide';
import { MethodVisual } from './MethodVisual';

function LessonScene({ scene }: { scene: GuideLesson['scene'] }) {
  return (
    <div className={`guide-scene guide-scene-${scene.kind}`}>
      {scene.parent && <p className="guide-parent">{scene.parent}</p>}
      <div className={`guide-scene-pieces${scene.connector && scene.items.length === 2 ? ' with-connector' : ''}`}>
        {scene.items.map((item, index) => (
          <div className="guide-scene-unit" key={`${item.label}:${item.text}`}>
            <div className="guide-piece">
              <small>{item.label}</small>
              <strong>{item.text}</strong>
            </div>
            {index === 0 && scene.connector && scene.items.length === 2 && (
              <span className="guide-connector">{scene.connector}</span>
            )}
          </div>
        ))}
      </div>
      <p className="guide-scene-caption">{scene.caption}</p>
    </div>
  );
}

function Lesson({
  guide,
  lesson,
  model,
  index,
}: {
  guide: ModelingGuide;
  lesson: GuideLesson;
  model: PublishedModel;
  index: number;
}) {
  const [choice, setChoice] = useState<number>();
  const titleId = useId();
  const questionId = useId();
  const answerId = useId();
  const modelLinks = lesson.model_links.filter((link) => model.nodeById.has(link.id));
  const missingLinks = lesson.model_links.filter((link) => !model.nodeById.has(link.id));
  const answer = choice !== undefined ? lesson.choices[choice]?.feedback : undefined;

  return (
    <article className="guide-lesson" aria-labelledby={titleId}>
      <div className="guide-lesson-heading">
        <p className="guide-kicker">
          {ui('modelingGuidePage.cle')}
          {String(index + 1).padStart(2, '0')} / {String(guide.lessons.length).padStart(2, '0')}
          <span>{ui('modelingGuidePage.decouvrir')}</span>
        </p>
        <h2 id={titleId}>{lesson.title}</h2>
        <p className="guide-rule">{lesson.rule}</p>
      </div>
      <LessonScene scene={lesson.scene} />
      <p className="guide-explanation">
        <ModelText text={lesson.explanation} />
      </p>
      <details className="guide-exercise">
        <summary>{ui('modelingGuidePage.tester_ma_comprehension')}</summary>
        <h3 id={questionId}>{lesson.question}</h3>
        <div className="guide-choices" role="group" aria-labelledby={questionId}>
          {lesson.choices.map((item, itemIndex) => (
            <button
              type="button"
              key={`${item.label}:${item.feedback}`}
              aria-pressed={choice === itemIndex}
              aria-controls={answerId}
              onClick={() => {
                setChoice(itemIndex);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div id={answerId} className={`guide-answer${answer ? ' is-visible' : ''}`} role="status" aria-atomic="true">
          {answer && <p>{answer}</p>}
        </div>
        <p>{ui('modelingGuidePage.les_reponses_ne_sont_pas_enregistrees')}</p>
      </details>
      <section className="guide-contribute">
        <h3>{ui('modelingGuidePage.pour_contribuer')}</h3>
        <div className="guide-contributor-content">
          <div className="guide-detail-grid">
            <section>
              <h3>{ui('modelingGuidePage.le_critere_utile')}</h3>
              <p>{lesson.contributor.criterion}</p>
            </section>
            <section>
              <h3>{ui('modelingGuidePage.la_frontiere_a_preserver')}</h3>
              <p>{lesson.contributor.boundary}</p>
            </section>
          </div>
          {lesson.model_links.length > 0 && (
            <section className="guide-model-links">
              <h3>
                {ui('modelingGuidePage.dans_la_publication')}
                {model.version}
              </h3>
              {modelLinks.length > 0 && (
                <ul>
                  {modelLinks.map((link) => (
                    <li key={link.id}>
                      <ReferenceLink target={link.id}>
                        {model.nodeById.get(link.id)?.name || link.id}
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </ReferenceLink>
                    </li>
                  ))}
                </ul>
              )}
              {missingLinks.length > 0 && (
                <p className="guide-unpublished">
                  {missingLinks.map((link) => link.label).join(' · ')} :{' '}
                  {missingLinks.length === 1
                    ? ui('modelingGuidePage.exemple_absent')
                    : ui('modelingGuidePage.exemples_absents')}
                  {ui('modelingGuidePage.de_cette_publication_l_illustration_ci_dessus_reste_pedagogique')}
                </p>
              )}
            </section>
          )}
        </div>
      </section>
    </article>
  );
}

function GuideContent({
  model,
  selected,
  routeVersion,
  onSelect,
  state,
  retry,
}: {
  model: PublishedModel;
  selected?: string;
  routeVersion?: string;
  onSelect: (id: string) => void;
  state: GuideState;
  retry: () => void;
}) {
  if (state.version !== model.version || state.status === 'loading')
    return (
      <section className="guide-status" role="status" aria-live="polite">
        <p>
          {ui('modelingGuidePage.chargement_de_la_methodologie_pour')}
          {model.version}…
        </p>
      </section>
    );
  if (state.status === 'error')
    return (
      <section className="guide-status">
        <div role="alert">
          <h2>{ui('modelingGuidePage.le_guide_n_est_pas_accessible')}</h2>
          <p>{state.message}</p>
        </div>
        <button type="button" className="secondary-button" onClick={retry}>
          <RefreshCw size={16} aria-hidden="true" />
          {ui('modelingGuidePage.reessayer')}
        </button>
      </section>
    );
  const { response } = state;
  if (response.status === 'unavailable' || !response.guide)
    return (
      <section className="guide-status">
        <BookOpen size={28} aria-hidden="true" />
        <h2>{ui('modelingGuidePage.guide_non_associe_a_cette_publication')}</h2>
        <p>{response.message}</p>
        <small>
          {ui('modelingGuidePage.publication')}
          {model.version}
        </small>
      </section>
    );
  const { guide } = response;
  const current = activeMethod(guide, selected);
  const home = current === 'home';
  const codes = current === 'codes';
  const chapter = guide.chapters?.find((item) => item.id === activeMethod(guide, selected));
  const reading = guide.chapters?.filter((c) => !['metamodel', 'method', 'references'].includes(c.id)) || [];
  const readingIndex = reading.findIndex((c) => c.id === chapter?.id);
  const mapHref = `#${routeVersion ? `version=${encodeURIComponent(routeVersion)}&` : ''}view=map`;
  const index = selected ? guide.lessons.findIndex((lesson) => lesson.id === selected) : 0;
  const lesson = guide.lessons[index] && lessonForPublication(guide.lessons[index], model);

  return (
    <div className="modeling-guide-page">
      <MethodReturn />
      <p className="guide-edition">
        {guide.title} · {guide.version}
        {ui('modelingGuidePage.associee_au_modele')}
        {model.version}
      </p>
      {guide.chapters && !home && (
        <nav className="method-chapters" aria-label={ui('modelingGuidePage.rubriques_de_la_methode')}>
          <MethodNavigation guide={guide} selected={selected} onSelect={onSelect} compact />
        </nav>
      )}
      {home && (
        <article className="guide-lesson method-home">
          <h2>{ui('modelingGuidePage.une_demarche_plusieurs_portes_d_entree')}</h2>
          <p>{ui('modelingGuidePage.comprendre_ensemble_eprouver_les_options_et_decider_progressiveme')}</p>
          <div className="method-home-cards">
            {reading.map((c) => (
              <button type="button" key={c.id} onClick={() => onSelect(c.id)}>
                <strong>{c.title}</strong>
                <span>{c.intro}</span>
              </button>
            ))}
          </div>
          <details className="method-home-resources">
            <summary>{ui('modelingGuidePage.ressources_de_la_methode')}</summary>
            <MethodNavigation guide={guide} selected={selected} onSelect={onSelect} resourcesOnly />
          </details>
          {reading[0]?.visual && <MethodVisual visual={reading[0].visual} />}
        </article>
      )}
      {(home || chapter?.id === 'start') && (
        <nav className="method-entry-links" aria-label={ui('modelingGuidePage.espaces_lies')}>
          <a href={mapHref}>{ui('modelingGuidePage.explorer_la_cartographie')}</a>
          {!!model.raw.scenario_catalog && <CatalogLink>{ui('modelingGuidePage.parcourir_les_scenarios')}</CatalogLink>}
          <MethodLink index>{ui('modelingGuidePage.ouvrir_le_glossaire_methodologique')}</MethodLink>
        </nav>
      )}
      {codes && (
        <section className="guide-lesson">
          <h2>{ui('modelingGuidePage.codes_et_identifiants')}</h2>
          {model.raw.display_index ? (
            <ReadingHelp model={model} />
          ) : (
            <p>{ui('modelingGuidePage.cette_publication_ne_definit_pas_de_codes_de_lecture')}</p>
          )}
        </section>
      )}
      {chapter && (
        <article className="guide-lesson method-chapter">
          <h2>{chapter.title}</h2>
          <p>
            <ModelText text={chapter.intro} />
          </p>
          <nav className="method-section-index" aria-label={ui('modelingGuidePage.dans_cette_rubrique')}>
            {chapter.sections.map((item, i) => (
              <button
                type="button"
                key={item.title}
                onClick={() => {
                  const target = document.getElementById(`method-section-${i}`);
                  if (target) revealSection(target);
                }}
              >
                {item.title}
              </button>
            ))}
          </nav>
          {chapter.visual && <MethodVisual visual={chapter.visual} />}{' '}
          {chapter.sections.map((item, i) => (
            <section key={item.title} id={`method-section-${i}`} tabIndex={-1}>
              <h3>{item.title}</h3>
              <p>
                <ModelText text={item.text} />
              </p>
              {item.example && (
                <p className="guide-scene">
                  <ModelText text={item.example} />
                </p>
              )}
              {item.detail && (
                <details>
                  <summary>{ui('modelingGuidePage.precisions_et_points_d_attention')}</summary>
                  <p>
                    <ModelText text={item.detail} />
                  </p>
                </details>
              )}
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer">
                  {ui('modelingGuidePage.consulter_la_reference')}
                  {item.title}
                </a>
              )}
            </section>
          ))}
        </article>
      )}
      {chapter?.id === 'metamodel' && <HotspotAssessmentGuide model={model} />}
      {!home && !codes && (!chapter || chapter.id === 'metamodel') && (
        <>
          <p>
            <MethodLink index>{ui('modelingGuidePage.ouvrir_le_glossaire_methodologique')}</MethodLink>
          </p>
          <nav className="guide-topics" aria-label={ui('modelingGuidePage.choisir_un_principe')}>
            {guide.lessons.map((item, itemIndex) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={item.id === lesson?.id}
                onClick={() => onSelect(item.id)}
              >
                <span className="guide-topic-number" aria-hidden="true">
                  {String(itemIndex + 1).padStart(2, '0')}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          {lesson ? (
            <Lesson
              key={`${model.version}:${guide.version}:${lesson.id}`}
              guide={guide}
              lesson={lesson}
              model={model}
              index={index}
            />
          ) : (
            !chapter && (
              <section className="guide-status">
                <h2>{ui('modelingGuidePage.principe_absent_de_ce_guide')}</h2>
                <p>
                  {ui('modelingGuidePage.la_reference')}
                  {selected}
                  {ui('modelingGuidePage.ne_figure_pas_dans_cette_version_choisis_l_un_des_reperes_ci_dess')}
                </p>
              </section>
            )
          )}
        </>
      )}
      {readingIndex >= 0 && (
        <nav className="method-reading-path" aria-label={ui('modelingGuidePage.parcours_de_lecture')}>
          {readingIndex > 0 && (
            <button type="button" onClick={() => onSelect(reading[readingIndex - 1].id)}>
              ← {reading[readingIndex - 1].title}
            </button>
          )}
          {readingIndex < reading.length - 1 && (
            <button type="button" onClick={() => onSelect(reading[readingIndex + 1].id)}>
              {ui('modelingGuidePage.continuer')}
              {reading[readingIndex + 1].title} →
            </button>
          )}
        </nav>
      )}
      <p className="guide-footer">
        <button
          type="button"
          onClick={() =>
            onSelect(
              guide.id === 'flow-atlas-metamodel' ? 'metamodel' : isTransformationGuide(guide) ? 'home' : 'start',
            )
          }
        >
          {ui('modelingGuidePage.retour_a_l_accueil')}{' '}
          {guide.id === 'flow-atlas-metamodel'
            ? ui('modelingGuidePage.du_metamodele')
            : isTransformationGuide(guide)
              ? ui('modelingGuidePage.de_la_methodologie_de_transformation')
              : ui('modelingGuidePage.de_la_methode')}
        </button>
      </p>
      <p className="guide-footer">
        <button type="button" onClick={() => onSelect('codes')}>
          {ui('modelingGuidePage.comprendre_les_codes_et_identifiants')}
        </button>
      </p>
    </div>
  );
}

/** Rules are read only for publications that explicitly carry the frozen policy. */
export function ModelingGuidePage(props: Parameters<typeof GuideContent>[0]) {
  return <GuideContent {...props} />;
}
