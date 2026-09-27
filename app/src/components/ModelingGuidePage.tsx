import { ReadingHelp } from './ReadingHelp';
import type { GuideState } from '../useModelingGuide';
import { useId, useState } from 'react';
import { ArrowUpRight, BookOpen, RefreshCw } from 'lucide-react';
import { lessonForPublication, type GuideLesson, type ModelingGuide } from '../modelingGuide';
import type { PublishedModel } from '../types';
import { ReferenceLink, MethodLink, MethodReturn, ModelText, CatalogLink } from './ModelLinks';
import './modeling-guide.css';

function LessonScene({ scene }: { scene: GuideLesson['scene'] }) {
  return <div className={`guide-scene guide-scene-${scene.kind}`}>
    {scene.parent && <p className="guide-parent">{scene.parent}</p>}
    <div className={`guide-scene-pieces${scene.connector && scene.items.length === 2 ? ' with-connector' : ''}`}>
      {scene.items.map((item, index) => <div className="guide-scene-unit" key={index}>
        <div className="guide-piece"><small>{item.label}</small><strong>{item.text}</strong></div>
        {index === 0 && scene.connector && scene.items.length === 2 && <span className="guide-connector">{scene.connector}</span>}
      </div>)}
    </div>
    <p className="guide-scene-caption">{scene.caption}</p>
  </div>;
}

function Lesson({ guide, lesson, model, index }: { guide: ModelingGuide; lesson: GuideLesson; model: PublishedModel; index: number }) {
  const [choice, setChoice] = useState<number>();
  const titleId = useId();
  const questionId = useId();
  const answerId = useId();
  const modelLinks = lesson.model_links.filter(link => model.nodeById.has(link.id));
  const missingLinks = lesson.model_links.filter(link => !model.nodeById.has(link.id));
  const answer = choice !== undefined ? lesson.choices[choice]?.feedback : undefined;

  return <article className="guide-lesson" aria-labelledby={titleId}>
    <div className="guide-lesson-heading">
      <p className="guide-kicker">Clé {String(index + 1).padStart(2, '0')} / {String(guide.lessons.length).padStart(2, '0')}<span>Découvrir</span></p>
      <h2 id={titleId}>{lesson.title}</h2>
      <p className="guide-rule">{lesson.rule}</p>
    </div>
    <LessonScene scene={lesson.scene}/>
    <p className="guide-explanation"><ModelText text={lesson.explanation}/></p>
    <details className="guide-exercise"><summary>Tester ma compréhension</summary>
      <h3 id={questionId}>{lesson.question}</h3>
      <div className="guide-choices" role="group" aria-labelledby={questionId}>
        {lesson.choices.map((item, itemIndex) => <button type="button" key={itemIndex} aria-pressed={choice === itemIndex}
          aria-controls={answerId} onClick={() => { setChoice(itemIndex); }}>{item.label}</button>)}
      </div>
      <div id={answerId} className={`guide-answer${answer ? ' is-visible' : ''}`} role="status" aria-atomic="true">{answer && <p>{answer}</p>}</div>
      <p>Les réponses ne sont pas enregistrées.</p>
    </details>
    <section className="guide-contribute">
      <h3>Pour contribuer</h3>
      <div className="guide-contributor-content">
        <div className="guide-detail-grid">
          <section><h3>Le critère utile</h3><p>{lesson.contributor.criterion}</p></section>
          <section><h3>La frontière à préserver</h3><p>{lesson.contributor.boundary}</p></section>
        </div>
        {lesson.model_links.length > 0 && <section className="guide-model-links">
          <h3>Dans la publication {model.version}</h3>
          {modelLinks.length > 0 && <ul>{modelLinks.map(link => <li key={link.id}><ReferenceLink target={link.id}>{model.nodeById.get(link.id)!.name}<ArrowUpRight size={13} aria-hidden="true"/></ReferenceLink></li>)}</ul>}
          {missingLinks.length > 0 && <p className="guide-unpublished">{missingLinks.map(link => link.label).join(' · ')} : {missingLinks.length === 1 ? 'exemple absent' : 'exemples absents'} de cette publication. L’illustration ci-dessus reste pédagogique.</p>}
        </section>}
      </div>
    </section>
  </article>;
}

function GuideContent({ model, selected, onSelect, state, retry }: { model: PublishedModel; selected?: string; onSelect: (id: string) => void; state: GuideState; retry: () => void }) {
  if (selected === 'codes') return <><MethodReturn/><button className="method-link" onClick={()=>onSelect('start')}>Retour à la méthode</button>{model.raw.display_index ? <ReadingHelp model={model}/> : <p>Cette publication ne définit pas de codes de lecture.</p>}</>;
  if (state.version !== model.version || state.status === 'loading') return <section className="guide-status" role="status" aria-live="polite"><p>Chargement du méta modèle pour {model.version}…</p></section>;
  if (state.status === 'error') return <section className="guide-status"><div role="alert"><h2>Le guide n’est pas accessible</h2><p>{state.message}</p></div><button type="button" className="secondary-button" onClick={retry}><RefreshCw size={16} aria-hidden="true"/>Réessayer</button></section>;
  const { response } = state;
  if (response.status === 'unavailable' || !response.guide) return <section className="guide-status"><BookOpen size={28} aria-hidden="true"/><h2>Guide non associé à cette publication</h2><p>{response.message}</p><small>Publication {model.version}</small></section>;
  const { guide } = response;
  const chapter = guide.chapters?.find(item => item.id === (selected || 'start'));
  const index = selected ? guide.lessons.findIndex(lesson => lesson.id === selected) : 0;
  const lesson = guide.lessons[index] && lessonForPublication(guide.lessons[index], model);

  return <div className="modeling-guide-page">
    <MethodReturn/>
    <p className="guide-edition">Méthode · {guide.version} — associée au modèle {model.version}</p>
    {guide.chapters && <nav className="method-chapters" aria-label="Rubriques de la méthode">{guide.chapters.map(item => <button key={item.id} aria-pressed={chapter?.id === item.id} onClick={() => onSelect(item.id)}>{item.title}</button>)}</nav>}
    {chapter?.id === 'start' && <nav className="method-entry-links" aria-label="Par où commencer"><a href={`#version=${model.version}&view=map`}>Explorer la cartographie</a><CatalogLink>Parcourir les scénarios</CatalogLink><MethodLink term="MOD015">Comprendre les notions</MethodLink></nav>}
    {chapter && <article className="guide-lesson method-chapter"><h2>{chapter.title}</h2><p><ModelText text={chapter.intro}/></p>{chapter.sections.map(item => <section key={item.title}><h3>{item.title}</h3><p><ModelText text={item.text}/></p>{item.example && <p className="guide-scene"><ModelText text={item.example}/></p>}{item.detail && <p><ModelText text={item.detail}/></p>}{item.url && <a href={item.url} target="_blank" rel="noreferrer">Consulter la référence</a>}</section>)}</article>}
    {(!chapter || chapter.id === 'metamodel') && <>
    <p><MethodLink term="MOD015">Ouvrir le glossaire méthodologique</MethodLink></p>
    <nav className="guide-topics" aria-label="Choisir un principe">
      {guide.lessons.map((item, itemIndex) => <button type="button" key={item.id} aria-pressed={item.id === lesson?.id}
        onClick={() => onSelect(item.id)}><span className="guide-topic-number" aria-hidden="true">{String(itemIndex + 1).padStart(2, '0')}</span><span>{item.label}</span></button>)}
    </nav>
    {lesson ? <Lesson key={`${model.version}:${guide.version}:${lesson.id}`} guide={guide} lesson={lesson} model={model} index={index}/>
      : !chapter && <section className="guide-status"><h2>Principe absent de ce guide</h2><p>La référence « {selected} » ne figure pas dans cette version. Choisis l’un des repères ci-dessus.</p></section>}
    </>}
    <p className="guide-footer"><button onClick={() => onSelect('codes')}>Comprendre les codes et identifiants</button></p>
  </div>;
}


/** Rules are read only for publications that explicitly carry the frozen policy. */
export function ModelingGuidePage(props: Parameters<typeof GuideContent>[0]) {
  return <GuideContent {...props}/>;
}
