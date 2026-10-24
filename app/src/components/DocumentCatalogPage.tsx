import { Download } from 'lucide-react';
import { useState } from 'react';
import { DOCUMENT_CATEGORY, documentDownloadName, documentFormat, documentUrl } from '../documentCatalog';
import type { RouteState } from '../navigation';
import { publicationYamlUrl } from '../publication';
import {
  scmStudyAuthor,
  scmStudyDate,
  scmStudyFilename,
  scmStudyFullTitle,
  scmStudyPages,
  scmStudyTitle,
  scmStudyUrl,
} from '../scmStudy';
import type { PublishedModel } from '../types';
import { ui } from '../ui.ts';
import { downloadWorkingModel, workshopUrl } from '../workshop';
import './documents.css';

export function DocumentCatalogPage({
  model,
  route,
  onChange,
}: {
  model: PublishedModel;
  route: RouteState;
  onChange: (changes: Partial<RouteState>) => void;
}) {
  const documents = model.raw.document_catalog?.documents || [];
  const [query, setQuery] = useState('');
  const selected = documents.find((document) => document.id === route.document);
  const filtered = documents.filter((document) =>
    `${document.title} ${document.summary} ${document.context}`
      .toLocaleLowerCase('fr')
      .includes(query.toLocaleLowerCase('fr')),
  );
  const relatedHotspots = selected
    ? (model.raw.hotspot_catalog?.hotspots || []).filter((hotspot) => hotspot.document_ids?.includes(selected.id))
    : [];

  return (
    <section className="documents-page" aria-label={ui('documentCatalogPage.documents_et_etudes_flow')}>
      <details className="publication-downloads">
        <summary>
          <Download size={17} aria-hidden="true" />
          {ui('documentCatalogPage.telecharger_le_modele_et_les_fichiers_de_seance')}
        </summary>
        <a
          className="documents-download"
          href={publicationYamlUrl(model.version)}
          download={`flow-atlas-model-${model.version}.yaml`}
        >
          {ui('documentCatalogPage.modele_complet_yaml')}
          {model.version}
        </a>
        {model.raw.workshop && (
          <>
            <a
              className="documents-download"
              href={workshopUrl()}
              download={`flow-atlas-staging-${model.raw.workshop.session_id}.json`}
            >
              {ui('documentCatalogPage.fichier_de_seance_json')}
            </a>
            <button type="button" className="documents-download" onClick={() => downloadWorkingModel(model)}>
              {ui('documentCatalogPage.modele_de_travail_json')}
            </button>
          </>
        )}
      </details>
      {selected ? (
        <article className="documents-detail">
          <button type="button" onClick={() => onChange({ document: '' })}>
            {ui('documentCatalogPage.tous_les_documents')}
          </button>
          <p className="documents-category">
            {DOCUMENT_CATEGORY[selected.category]} · {documentFormat(selected)}
          </p>
          <h2>{selected.title}</h2>
          <p>{selected.summary}</p>
          <p>{selected.context}</p>
          <a
            className="documents-download"
            href={documentUrl(model, selected)}
            download={documentDownloadName(selected)}
          >
            <Download size={17} aria-hidden="true" />
            {ui('documentCatalogPage.telecharger_le')}
            {documentFormat(selected)}
          </a>
          {relatedHotspots.length > 0 && (
            <section>
              <h3>{ui('documentCatalogPage.points_chauds_lies')}</h3>
              <ul>
                {relatedHotspots.map((hotspot) => (
                  <li key={hotspot.id}>
                    <button
                      type="button"
                      onClick={() => onChange({ view: 'hotspots', hotspot: hotspot.id, document: '' })}
                    >
                      {hotspot.title}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      ) : (
        <>
          <section className="documents-studies" aria-labelledby="flow-studies-title">
            <h2 id="flow-studies-title">{ui('documentCatalogPage.etudes_flow')}</h2>
            <p>{ui('documentCatalogPage.des_dossiers_transversaux_communs_aux_differentes_versions_du_mod')}</p>
            <article className="documents-study">
              <p className="documents-category">
                {ui('documentCatalogPage.dossier_de_pilotage_pdf')}
                {scmStudyPages}
                {ui('documentCatalogPage.pages')}
                {scmStudyDate}
              </p>
              <h3>{scmStudyFullTitle}</h3>
              <p>{ui('documentCatalogPage.sept_indicateurs_prioritaires_six_questions_de_pilotage_et_des_ca')}</p>
              <p className="documents-study-author">{scmStudyAuthor}</p>
              <a className="documents-download" href={scmStudyUrl} download={scmStudyFilename}>
                <Download size={17} aria-hidden="true" />
                {ui('documentCatalogPage.telecharger')}
                {scmStudyTitle}
                {ui('documentCatalogPage.pdf')}
              </a>
            </article>
          </section>
          <h2>{ui('documentCatalogPage.documents_de_la_publication')}</h2>
          <p>{ui('documentCatalogPage.document_count', { count: documents.length, version: model.version })}</p>
          {documents.length === 0 && <p>{ui('documentCatalogPage.aucun_document_n_est_publie_dans_cette_version')}</p>}
          {documents.length > 0 && (
            <label className="documents-search">
              {ui('documentCatalogPage.rechercher_un_document')}
              <input value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
          )}
          <div className="documents-list">
            {filtered.map((document) => (
              <button type="button" key={document.id} onClick={() => onChange({ document: document.id })}>
                <span className="documents-category">
                  {DOCUMENT_CATEGORY[document.category]} · {documentFormat(document)}
                </span>
                <strong>{document.title}</strong>
                <span>{document.summary}</span>
              </button>
            ))}
          </div>
          {documents.length > 0 && filtered.length === 0 && <p>{ui('documentCatalogPage.aucun_document_trouve')}</p>}
        </>
      )}
    </section>
  );
}
