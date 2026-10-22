import { Download } from 'lucide-react';
import { useState } from 'react';
import { DOCUMENT_CATEGORY, documentDownloadName, documentFormat, documentUrl } from '../documentCatalog';
import type { RouteState } from '../navigation';
import { scmStudyFilename, scmStudyUrl } from '../scmStudy';
import type { PublishedModel } from '../types';
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
    <section className="documents-page" aria-label="Documents et études FLOW">
      {selected ? (
        <article className="documents-detail">
          <button type="button" onClick={() => onChange({ document: '' })}>
            ← Tous les documents
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
            Télécharger le {documentFormat(selected)}
          </a>
          {relatedHotspots.length > 0 && (
            <section>
              <h3>Points chauds liés</h3>
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
            <h2 id="flow-studies-title">Études FLOW</h2>
            <p>Des dossiers transversaux, communs aux différentes versions du modèle.</p>
            <article className="documents-study">
              <p className="documents-category">Dossier de pilotage · PDF · 22 octobre 2026</p>
              <h3>Piloter la supply chain : indicateurs et décisions</h3>
              <p>
                Sept indicateurs prioritaires, six questions de pilotage et des cas concrets, des achats aux retours et
                au déstockage. Plomberie, délais de décision, CTP et conditionnements, Lean et impacts pour FLOW.
              </p>
              <p className="documents-study-author">Laurent Sintès</p>
              <a className="documents-download" href={scmStudyUrl} download={scmStudyFilename}>
                <Download size={17} aria-hidden="true" />
                Télécharger le dossier SCM (PDF)
              </a>
            </article>
          </section>
          <h2>Documents de la publication</h2>
          <p>
            {documents.length} document{documents.length > 1 ? 's' : ''} dans la publication {model.version}.
          </p>
          {documents.length === 0 && <p>Aucun document n’est publié dans cette version.</p>}
          {documents.length > 0 && (
            <label className="documents-search">
              Rechercher un document
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
          {documents.length > 0 && filtered.length === 0 && <p>Aucun document trouvé.</p>}
        </>
      )}
    </section>
  );
}
