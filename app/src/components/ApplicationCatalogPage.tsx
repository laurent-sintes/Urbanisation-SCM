import { CircleCheck, CircleHelp, CircleMinus, CircleX } from 'lucide-react';
import { type CSSProperties, type Ref, useEffect, useRef } from 'react';
import { componentBranch, contextName, productFor, selectionMappings } from '../applicationCatalog';
import type { RouteState } from '../navigation';
import { staticUrl } from '../publication';
import type {
  ApplicationCatalog,
  ApplicationComponent,
  ApplicationProduct,
  ApplicationSelection,
  PublishedModel,
} from '../types';
import './applications.css';

const usageLabel: Record<string, string> = {
  unknown: 'Usage non évalué',
  declared: 'Usage déclaré',
  historical_document: 'Document historique',
  documented: 'Usage documenté',
  confirmed: 'Usage confirmé',
  no: 'Non utilisé, selon preuve',
};
const selectionStateLabel: Record<string, string> = {
  unknown: 'inconnue',
  declared: 'déclarée',
  documented: 'documentée',
  confirmed: 'confirmée',
  no: 'non établie',
};
const evidenceLabel: Record<string, string> = {
  candidate: 'Correspondance à vérifier',
  declared: 'Correspondance déclarée',
  historical_document: 'Document historique',
  documented: 'Correspondance documentée',
  confirmed: 'Correspondance confirmée',
  planned: 'Périmètre cible',
};

function ProductIdentity({
  product,
  headingRef,
}: {
  product: ApplicationProduct;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <div
      className="application-identity"
      style={{ '--product-accent': product.branding?.accent_color || '#236159' } as CSSProperties}
    >
      {product.branding ? (
        <img src={staticUrl(product.branding.logo_path)} alt={`Logo ${product.name}`} width="120" height="40" />
      ) : (
        <span className="application-identity-mark" aria-hidden="true">
          {product.kind === 'internal_product' ? 'Interne' : 'Logo à documenter'}
        </span>
      )}
      <div>
        <h2 ref={headingRef} tabIndex={-1}>
          {product.name}
        </h2>
        <span>{product.publisher}</span>
      </div>
    </div>
  );
}

function ProductFacts({ product }: { product: ApplicationProduct }) {
  return (
    <dl className="application-facts">
      <div>
        <dt>Éditeur</dt>
        <dd>{product.publisher}</dd>
      </div>
      <div>
        <dt>Périmètre produit</dt>
        <dd>{product.scope}</dd>
      </div>
      <div>
        <dt>Date de lancement</dt>
        <dd>{product.launched_on || 'Non documentée'}</dd>
      </div>
      <div>
        <dt>Dernière release éditeur</dt>
        <dd>
          {product.latest_release ? (
            <a href={product.latest_release.source_url} target="_blank" rel="noopener noreferrer">
              {product.latest_release.version}
              {product.latest_release.released_on ? ` · ${product.latest_release.released_on}` : ''}
            </a>
          ) : (
            'Non vérifiée'
          )}
        </dd>
      </div>
      {product.website_url && (
        <div>
          <dt>Site éditeur</dt>
          <dd>
            <a href={product.website_url} target="_blank" rel="noopener noreferrer">
              Consulter
            </a>
          </dd>
        </div>
      )}
    </dl>
  );
}

function SelectionFacts({ selection }: { selection: ApplicationSelection }) {
  return (
    <dl className="application-facts application-selection-facts">
      <div>
        <dt>Version dans ce SI</dt>
        <dd>{selection.perspective === 'target' ? 'À définir' : selection.deployed_version || 'À documenter'}</dd>
      </div>
      <div>
        <dt>Mise en service</dt>
        <dd>{selection.perspective === 'target' ? 'À définir' : selection.deployed_on || 'À documenter'}</dd>
      </div>
    </dl>
  );
}

const contexts = ['beaumanoir-historique', 'boardriders', 'flow-platform'];

function rootOf(product: ApplicationProduct) {
  return product.components.find((component) => component.kind === 'product');
}

function ComponentList({
  catalog,
  product,
  selection,
  parentId,
  currentId,
  onSelect,
}: {
  catalog: ApplicationCatalog;
  product: ApplicationProduct;
  selection?: ApplicationSelection;
  parentId: string;
  currentId: string;
  onSelect: (componentId: string) => void;
}) {
  const children = product.components.filter((component) => component.parent_id === parentId);
  if (!children.length) return null;
  return (
    <ul className="application-component-list">
      {children.map((component) => (
        <li
          key={component.id}
          className={
            selection?.component_states.find((item) => item.component_id === component.id)?.activated === 'no'
              ? 'application-component-disabled'
              : undefined
          }
        >
          <button
            type="button"
            aria-current={currentId === component.id ? 'true' : undefined}
            onClick={() => onSelect(component.id)}
          >
            <span>{component.name}</span>
            <ComponentCoverageBadge catalog={catalog} product={product} component={component} selection={selection} />
          </button>
          <ComponentList
            catalog={catalog}
            product={product}
            selection={selection}
            parentId={component.id}
            currentId={currentId}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}

function coverageFor(
  catalog: ApplicationCatalog,
  product: ApplicationProduct,
  component: ApplicationComponent,
  selection?: ApplicationSelection,
) {
  const ids = new Set(componentBranch(product, component.id).map((item) => item.id));
  const selections = selection ? [selection] : catalog.selections.filter((item) => item.product_id === product.id);
  return selections.flatMap((item) =>
    item.mappings.filter((mapping) => ids.has(mapping.component_id)).map((mapping) => ({ selection: item, mapping })),
  );
}

function offeringCoverageFor(product: ApplicationProduct, component: ApplicationComponent) {
  const ids = new Set(componentBranch(product, component.id).map((item) => item.id));
  return (product.offering_mappings || []).filter((mapping) => ids.has(mapping.component_id));
}

function ComponentCoverageBadge({
  catalog,
  product,
  component,
  selection,
}: {
  catalog: ApplicationCatalog;
  product: ApplicationProduct;
  component: ApplicationComponent;
  selection?: ApplicationSelection;
}) {
  const coverage = coverageFor(catalog, product, component, selection);
  if (!selection) {
    const offering = offeringCoverageFor(product, component);
    return (
      <small>
        {offering.length ? `${offering.length} lien${offering.length > 1 ? 's' : ''} de l’offre` : 'Offre à documenter'}
        {coverage.length ? ` · ${coverage.length} lien${coverage.length > 1 ? 's' : ''} par SI` : ''}
      </small>
    );
  }
  const state = selection.component_states.find((item) => item.component_id === component.id);
  const activated = state?.activated || 'unknown';
  const activationLabel =
    activated === 'no'
      ? 'Désactivé'
      : activated === 'unknown'
        ? 'Activation inconnue'
        : `Activé · ${selectionStateLabel[activated]}`;
  const ActivationIcon = activated === 'no' ? CircleX : activated === 'unknown' ? CircleHelp : CircleCheck;
  return (
    <small className="application-component-status">
      <span className={`application-activation-${activated}`}>
        <ActivationIcon size={12} aria-hidden="true" /> {activationLabel}
      </span>
      {state?.used === 'no' ? (
        <span>
          <CircleMinus size={12} aria-hidden="true" /> Non utilisé
        </span>
      ) : state?.used && state.used !== 'unknown' ? (
        <span>{usageLabel[state.used]}</span>
      ) : null}
      <span>
        {coverage.length ? `${coverage.length} lien${coverage.length > 1 ? 's' : ''} métier` : 'Carto à documenter'}
      </span>
    </small>
  );
}

function ComponentDetail({
  catalog,
  product,
  component,
  selection,
  model,
  onShowOnMap,
  onShowBusinessNode,
}: {
  catalog: ApplicationCatalog;
  product: ApplicationProduct;
  component: ApplicationComponent;
  selection?: ApplicationSelection;
  model: PublishedModel;
  onShowOnMap: (selectionId: string, componentId?: string) => void;
  onShowBusinessNode: (nodeId: string) => void;
}) {
  const state = selection?.component_states.find((item) => item.component_id === component.id);
  const coverage = coverageFor(catalog, product, component, selection);
  const offeringCoverage = offeringCoverageFor(product, component);
  return (
    <section className="application-component-detail" aria-label={`Détail de ${component.name}`}>
      {component.kind !== 'product' && <h4>{component.name}</h4>}
      {component.kind !== 'product' && (
        <p className="application-kind">{component.kind === 'feature' ? 'Fonction documentée' : component.kind}</p>
      )}
      {component.note && <p>{component.note}</p>}
      {component.source_url && (
        <a href={component.source_url} target="_blank" rel="noopener noreferrer">
          Documentation éditeur
        </a>
      )}
      {selection && (
        <>
          <h5>Dans ce SI</h5>
          <p className="application-state">
            Acquisition : {state ? selectionStateLabel[state.acquired] || state.acquired : 'inconnue'} · Activation :{' '}
            {state ? selectionStateLabel[state.activated] || state.activated : 'inconnue'} ·{' '}
            {state ? usageLabel[state.used] || state.used : 'Usage non évalué'}
          </p>
        </>
      )}
      {!selection && (
        <>
          <h5>Périmètre possible de l’offre éditeur</h5>
          <p>Ces correspondances décrivent l’offre documentée, sans prouver son activation dans un SI.</p>
          {offeringCoverage.length ? (
            offeringCoverage.map((mapping) => (
              <div className="application-mapping" key={mapping.id}>
                {component.id !== mapping.component_id && (
                  <small>{product.components.find((item) => item.id === mapping.component_id)?.name}</small>
                )}
                <strong>{model.nodeById.get(mapping.node_id)?.name || mapping.node_id}</strong>
                <span>{mapping.note}</span>
                <div className="application-mapping-actions">
                  <button type="button" onClick={() => onShowBusinessNode(mapping.node_id)}>
                    Voir dans la cartographie métier
                  </button>
                  {mapping.source_url && (
                    <a href={mapping.source_url} target="_blank" rel="noopener noreferrer">
                      Source éditeur
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>Aucune correspondance de l’offre suffisamment documentée pour cette fonctionnalité.</p>
          )}
        </>
      )}
      <h5>{selection ? 'Couverture métier dans ce SI' : 'Correspondances documentées par SI'}</h5>
      {coverage.length ? (
        coverage.map(({ selection: context, mapping }) => (
          <div className="application-mapping" key={mapping.id}>
            {!selection && <small>{contextName[context.context_id] || context.context_id}</small>}
            {component.id !== mapping.component_id && (
              <small>{product.components.find((item) => item.id === mapping.component_id)?.name}</small>
            )}
            <strong>{model.nodeById.get(mapping.node_id)?.name || mapping.node_id}</strong>
            <span>
              {evidenceLabel[mapping.evidence_state]} · {mapping.note}
            </span>
            <button type="button" onClick={() => onShowOnMap(context.id, mapping.component_id)}>
              Voir sur la carte
            </button>
          </div>
        ))
      ) : (
        <p>
          {selection
            ? 'Aucune correspondance métier documentée pour cette fonctionnalité dans ce SI.'
            : 'Aucune correspondance documentée dans un SI pour cette fonctionnalité. Les liens de l’offre ne prouvent pas son activation.'}
        </p>
      )}
    </section>
  );
}

export function ApplicationCatalogPage({
  model,
  mode,
  route,
  onChange,
  onShowOnMap,
  onShowBusinessNode,
}: {
  model: PublishedModel;
  mode: 'systems' | 'products';
  route: RouteState;
  onChange: (changes: Partial<RouteState>) => void;
  onShowOnMap: (selectionId: string, componentId?: string) => void;
  onShowBusinessNode: (nodeId: string) => void;
}) {
  const catalog = model.raw.application_catalog;
  const detailTitle = useRef<HTMLHeadingElement>(null);
  const listTitle = useRef<HTMLHeadingElement>(null);
  const explicit = Boolean(route.appSelection || route.appComponent);
  const selectedKey = [route.appSelection, route.appComponent].filter(Boolean).join(':');
  useEffect(() => {
    if (!selectedKey) return;
    requestAnimationFrame(() => {
      if (window.matchMedia('(max-width: 850px)').matches) {
        detailTitle.current?.closest('.application-detail')?.scrollIntoView({ block: 'start' });
        detailTitle.current?.focus({ preventScroll: true });
      } else {
        const rail = document.querySelector<HTMLElement>('.application-rail');
        const current = rail?.querySelector<HTMLElement>('button[aria-current="true"]');
        if (rail && current) {
          const bounds = current.getBoundingClientRect();
          const viewport = rail.getBoundingClientRect();
          if (bounds.bottom > viewport.bottom) rail.scrollTop += bounds.bottom - viewport.bottom + 8;
          if (bounds.top < viewport.top) rail.scrollTop -= viewport.top - bounds.top + 8;
        }
      }
    });
  }, [selectedKey]);
  if (!catalog) return <p>Aucun catalogue applicatif dans cette publication.</p>;

  const selection =
    mode === 'systems'
      ? catalog.selections.find((item) => item.id === route.appSelection) || catalog.selections[0]
      : undefined;
  const product =
    mode === 'systems'
      ? selection && productFor(catalog, selection)
      : catalog.products.find(
          (item) =>
            item.kind === 'vendor_product' && item.components.some((component) => component.id === route.appComponent),
        ) || catalog.products.find((item) => item.kind === 'vendor_product');
  const root = product && rootOf(product);
  const component = product?.components.find((item) => item.id === route.appComponent) || root;
  const availableMappings = selection && component ? selectionMappings(catalog, selection.id, component.id) : [];
  const selectItem = (appSelection: string, appComponent: string) =>
    onChange({ appSelection, appComponent, section: '' });
  const backToList = () => {
    onChange({ appSelection: '', appComponent: '', section: '' });
    requestAnimationFrame(() => {
      listTitle.current?.scrollIntoView({ block: 'start' });
      listTitle.current?.focus({ preventScroll: true });
    });
  };

  return (
    <div className={`application-page ${explicit ? 'application-has-selection' : ''}`}>
      <p className="application-intro">
        {mode === 'products'
          ? 'Produits de marché connus. Sélectionne un produit pour voir sa fiche et ses modules.'
          : 'Produits par SI. La présence d’un produit ne prouve pas que tous ses modules sont acquis, activés ou utilisés.'}
      </p>
      <div className="application-explorer">
        <nav className="application-rail" aria-label={mode === 'systems' ? 'SI et produits' : 'Produits du marché'}>
          <h2 ref={listTitle} tabIndex={-1}>
            {mode === 'systems' ? 'Systèmes d’information' : 'Produits'}
          </h2>
          {mode === 'systems' ? (
            contexts
              .filter((context) => catalog.selections.some((item) => item.context_id === context))
              .map((context) => (
                <section key={context} className="application-nav-group">
                  <h3>{contextName[context] || context}</h3>
                  <ul>
                    {catalog.selections
                      .filter((item) => item.context_id === context)
                      .map((item) => {
                        const entry = productFor(catalog, item);
                        const entryRoot = entry && rootOf(entry);
                        if (!entry || !entryRoot) return null;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              aria-current={explicit && selection?.id === item.id ? 'true' : undefined}
                              onClick={() => selectItem(item.id, entryRoot.id)}
                            >
                              {entry.name}
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </section>
              ))
          ) : (
            <ul>
              {catalog.products
                .filter((item) => item.kind === 'vendor_product')
                .map((item) => {
                  const entryRoot = rootOf(item);
                  if (!entryRoot) return null;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        aria-current={explicit && product?.id === item.id ? 'true' : undefined}
                        onClick={() => selectItem('', entryRoot.id)}
                      >
                        {item.name}
                      </button>
                    </li>
                  );
                })}
            </ul>
          )}
        </nav>
        {product && component && (
          <article className="application-detail">
            <button className="application-back" type="button" onClick={backToList}>
              ← Retour à la liste
            </button>
            <p className="application-detail-context">
              {selection ? contextName[selection.context_id] || selection.context_id : 'Produit logiciel du marché'}
            </p>
            <div className="application-product-heading">
              <ProductIdentity product={product} headingRef={detailTitle} />
              {selection && availableMappings.length > 0 && (
                <button
                  type="button"
                  onClick={() => onShowOnMap(selection.id, component.id === root?.id ? undefined : component.id)}
                >
                  Voir sur la carte
                </button>
              )}
            </div>
            {selection ? (
              <>
                <p>
                  {selection.perspective === 'target'
                    ? 'Cible prévue'
                    : selection.presence === 'unknown'
                      ? 'Présence à vérifier'
                      : selection.presence === 'documented'
                        ? 'Présence documentée'
                        : selection.presence === 'confirmed'
                          ? 'Présence confirmée'
                          : 'Présence déclarée'}
                </p>
                <SelectionFacts selection={selection} />
                {selection.note && <p>{selection.note}</p>}
                <details className="application-product-details">
                  <summary>Fiche du produit</summary>
                  <ProductFacts product={product} />
                </details>
              </>
            ) : (
              <>
                <p>
                  Inventaire{' '}
                  {product.inventory_status === 'partial'
                    ? 'partiel'
                    : product.inventory_status === 'complete'
                      ? 'complet'
                      : 'à établir'}
                </p>
                {product.note && <p>{product.note}</p>}
                <ProductFacts product={product} />
              </>
            )}
            <div
              className={`application-composition ${product.components.length > 1 ? 'application-has-modules' : ''}`}
            >
              {root && product.components.length > 1 && (
                <nav className="application-components" aria-label={`Modules de ${product.name}`}>
                  <h3>Modules et fonctions</h3>
                  <ul className="application-component-list">
                    <li>
                      <button
                        type="button"
                        aria-current={component.id === root.id ? 'true' : undefined}
                        onClick={() => selectItem(selection?.id || '', root.id)}
                      >
                        <span>Vue d’ensemble</span>
                        <ComponentCoverageBadge
                          catalog={catalog}
                          product={product}
                          component={root}
                          selection={selection}
                        />
                      </button>
                      <ComponentList
                        catalog={catalog}
                        product={product}
                        selection={selection}
                        parentId={root.id}
                        currentId={component.id}
                        onSelect={(id) => selectItem(selection?.id || '', id)}
                      />
                    </li>
                  </ul>
                </nav>
              )}
              <ComponentDetail
                catalog={catalog}
                product={product}
                component={component}
                selection={selection}
                model={model}
                onShowOnMap={onShowOnMap}
                onShowBusinessNode={onShowBusinessNode}
              />
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
