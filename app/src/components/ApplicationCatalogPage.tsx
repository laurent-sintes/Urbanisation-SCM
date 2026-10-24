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
import { ui } from '../ui.ts';
import './applications.css';
import { ModelText } from './ModelLinks';

const usageLabel: Record<string, string> = {
  unknown: ui('applicationCatalogPage.usage_non_evalue'),
  declared: ui('applicationCatalogPage.usage_declare'),
  historical_document: ui('applicationCatalogPage.document_historique'),
  documented: ui('applicationCatalogPage.usage_documente'),
  confirmed: ui('applicationCatalogPage.usage_confirme'),
  no: ui('applicationCatalogPage.non_utilise_selon_preuve'),
};
const selectionStateLabel: Record<string, string> = {
  unknown: ui('applicationCatalogPage.selection_unknown'),
  declared: ui('applicationCatalogPage.declaree'),
  documented: ui('applicationCatalogPage.documentee'),
  confirmed: ui('applicationCatalogPage.confirmee'),
  no: ui('applicationCatalogPage.non_etablie'),
};
const evidenceLabel: Record<string, string> = {
  candidate: ui('applicationCatalogPage.correspondance_a_verifier'),
  declared: ui('applicationCatalogPage.correspondance_declaree'),
  historical_document: ui('applicationCatalogPage.document_historique'),
  documented: ui('applicationCatalogPage.correspondance_documentee'),
  confirmed: ui('applicationCatalogPage.correspondance_confirmee'),
  planned: ui('applicationCatalogPage.perimetre_cible'),
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
        <div className="application-logo">
          <img
            src={staticUrl(product.branding.logo_path)}
            alt={ui('applicationCatalogPage.logo', {
              value1: product.branding.role === 'publisher' ? ui('applicationCatalogPage.editeur_de') : '',
              name: product.name,
            })}
            width="120"
            height="40"
          />
          {product.branding.role === 'publisher' && <small>{ui('applicationCatalogPage.logo_de_l_editeur')}</small>}
        </div>
      ) : (
        <span className="application-identity-mark" aria-hidden="true">
          {product.kind === 'internal_product'
            ? ui('applicationCatalogPage.interne')
            : ui('applicationCatalogPage.logo_a_documenter')}
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
  const documentation = product.documentation;
  const channels = {
    store: ui('applicationCatalogPage.vente_en_magasin'),
    online_b2c: ui('applicationCatalogPage.vente_aux_particuliers_en_ligne'),
    wholesale_b2b: ui('applicationCatalogPage.vente_aux_revendeurs'),
  };
  return (
    <>
      <dl className="application-facts">
        <div>
          <dt>{ui('applicationCatalogPage.editeur')}</dt>
          <dd>{product.publisher}</dd>
        </div>
        <div>
          <dt>{ui('applicationCatalogPage.perimetre_produit')}</dt>
          <dd>
            <ModelText text={product.scope} />
          </dd>
        </div>
        {documentation ? (
          <>
            <div>
              <dt>{ui('applicationCatalogPage.mode_d_exploitation')}</dt>
              <dd>
                <ModelText text={documentation.deployment_model} />
              </dd>
            </div>
            {documentation.channels.length > 0 && (
              <div>
                <dt>{ui('applicationCatalogPage.canaux_documentes')}</dt>
                <dd>{documentation.channels.map((channel) => channels[channel]).join(' · ')}</dd>
              </div>
            )}
            <div>
              <dt>{ui('applicationCatalogPage.verifie_le')}</dt>
              <dd>{documentation.reviewed_on}</dd>
            </div>
          </>
        ) : (
          product.kind === 'vendor_product' && (
            <div>
              <dt>{ui('applicationCatalogPage.date_de_lancement')}</dt>
              <dd>{product.launched_on || ui('applicationCatalogPage.non_documentee')}</dd>
            </div>
          )
        )}
        {!documentation && product.kind === 'vendor_product' && (
          <div>
            <dt>{ui('applicationCatalogPage.derniere_version_editeur')}</dt>
            <dd>
              {product.latest_release ? (
                <a href={product.latest_release.source_url} target="_blank" rel="noopener noreferrer">
                  {product.latest_release.version}
                  {product.latest_release.released_on ? ` · ${product.latest_release.released_on}` : ''}
                </a>
              ) : (
                ui('applicationCatalogPage.non_verifiee')
              )}
            </dd>
          </div>
        )}
        {product.website_url && (
          <div>
            <dt>{ui('applicationCatalogPage.site_editeur')}</dt>
            <dd>
              <a href={product.website_url} target="_blank" rel="noopener noreferrer">
                {ui('applicationCatalogPage.consulter')}
              </a>
            </dd>
          </div>
        )}
      </dl>
      {documentation && (
        <section
          className="application-documentation"
          aria-label={ui('applicationCatalogPage.documentation_du_produit')}
        >
          <div className="application-boundary">
            <ModelText text={documentation.scope_boundary} />
          </div>
          <h3>{ui('applicationCatalogPage.reperes_de_dates')}</h3>
          <ul className="application-history">
            {documentation.history.map((milestone) => (
              <li key={`${milestone.date}:${milestone.kind}`}>
                <time dateTime={milestone.date}>{milestone.date}</time>
                <span>
                  <ModelText text={milestone.title} />{' '}
                  <a href={milestone.source_url} target="_blank" rel="noopener noreferrer">
                    {ui('applicationCatalogPage.source')}
                  </a>
                </span>
              </li>
            ))}
          </ul>
          <div className="application-release-tracking">
            <strong>{ui('applicationCatalogPage.versions_et_mises_a_jour')}</strong>
            <a href={documentation.release_tracking.source_url} target="_blank" rel="noopener noreferrer">
              {documentation.release_tracking.label}
            </a>
            <p>
              <ModelText text={documentation.release_tracking.note} />
            </p>
          </div>
          <details className="application-research-details">
            <summary>{ui('applicationCatalogPage.integrations_sources_et_points_a_confirmer')}</summary>
            <p>
              <ModelText text={documentation.integration_summary} />
            </p>
            <ul>
              {documentation.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.title}
                  </a>{' '}
                  — <ModelText text={source.focus} />
                </li>
              ))}
            </ul>
            {documentation.gaps.length > 0 && (
              <>
                <h4>{ui('applicationCatalogPage.points_a_confirmer')}</h4>
                <ul>
                  {documentation.gaps.map((gap) => (
                    <li key={gap}>
                      <ModelText text={gap} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </details>
        </section>
      )}
    </>
  );
}

function SelectionFacts({ selection }: { selection: ApplicationSelection }) {
  return (
    <dl className="application-facts application-selection-facts">
      <div>
        <dt>{ui('applicationCatalogPage.version_dans_ce_si')}</dt>
        <dd>
          {selection.perspective === 'target'
            ? ui('applicationCatalogPage.a_definir')
            : selection.deployed_version || ui('applicationCatalogPage.a_documenter')}
        </dd>
      </div>
      <div>
        <dt>{ui('applicationCatalogPage.mise_en_service')}</dt>
        <dd>
          {selection.perspective === 'target'
            ? ui('applicationCatalogPage.a_definir')
            : selection.deployed_on || ui('applicationCatalogPage.a_documenter')}
        </dd>
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
        {offering.length
          ? ui('applicationCatalogPage.lien_de_l_offre', { count: offering.length })
          : ui('applicationCatalogPage.offre_a_documenter')}
        {coverage.length ? ui('applicationCatalogPage.lien_par_si', { count: coverage.length }) : ''}
      </small>
    );
  }
  const state = selection.component_states.find((item) => item.component_id === component.id);
  const activated = state?.activated || 'unknown';
  const activationLabel =
    activated === 'no'
      ? ui('applicationCatalogPage.desactive')
      : activated === 'unknown'
        ? ui('applicationCatalogPage.activation_inconnue')
        : ui('applicationCatalogPage.active', { activated: selectionStateLabel[activated] });
  const ActivationIcon = activated === 'no' ? CircleX : activated === 'unknown' ? CircleHelp : CircleCheck;
  return (
    <small className="application-component-status">
      <span className={`application-activation-${activated}`}>
        <ActivationIcon size={12} aria-hidden="true" /> {activationLabel}
      </span>
      {state?.used === 'no' ? (
        <span>
          <CircleMinus size={12} aria-hidden="true" />
          {ui('applicationCatalogPage.non_utilise')}
        </span>
      ) : state?.used && state.used !== 'unknown' ? (
        <span>{usageLabel[state.used]}</span>
      ) : null}
      <span>
        {coverage.length
          ? ui('applicationCatalogPage.lien_metier', { count: coverage.length })
          : ui('applicationCatalogPage.carto_a_documenter')}
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
    <section
      className="application-component-detail"
      aria-label={ui('applicationCatalogPage.detail_de', { name: component.name })}
      tabIndex={-1}
    >
      {component.kind !== 'product' && <h4>{component.name}</h4>}
      {component.kind !== 'product' && (
        <p className="application-kind">
          {component.kind === 'feature' ? ui('applicationCatalogPage.fonction_documentee') : component.kind}
        </p>
      )}
      {component.note && (
        <p>
          <ModelText text={component.note} />
        </p>
      )}
      {component.source_url && (
        <a href={component.source_url} target="_blank" rel="noopener noreferrer">
          {ui('applicationCatalogPage.documentation_editeur')}
        </a>
      )}
      {selection && (
        <>
          <h5>{ui('applicationCatalogPage.dans_ce_si')}</h5>
          <p className="application-state">
            {ui('applicationCatalogPage.acquisition')}
            {state ? selectionStateLabel[state.acquired] || state.acquired : 'inconnue'}
            {ui('applicationCatalogPage.activation')}{' '}
            {state ? selectionStateLabel[state.activated] || state.activated : 'inconnue'} ·{' '}
            {state ? usageLabel[state.used] || state.used : ui('applicationCatalogPage.usage_non_evalue')}
          </p>
        </>
      )}
      {!selection && (
        <>
          <h5>{ui('applicationCatalogPage.perimetre_possible_de_l_offre_editeur')}</h5>
          <p>{ui('applicationCatalogPage.chaque_correspondance_precise_son_niveau_de_preuve_sans_prouver_l')}</p>
          {offeringCoverage.length ? (
            offeringCoverage.map((mapping) => (
              <div className="application-mapping" data-offering-mapping={mapping.id} key={mapping.id}>
                {component.id !== mapping.component_id && (
                  <small>{product.components.find((item) => item.id === mapping.component_id)?.name}</small>
                )}
                <strong>{model.nodeById.get(mapping.node_id)?.name || mapping.node_id}</strong>
                <span>
                  {evidenceLabel[mapping.evidence_state]} · <ModelText text={mapping.note} />
                </span>
                <div className="application-mapping-actions">
                  <button type="button" onClick={() => onShowBusinessNode(mapping.node_id)}>
                    {ui('applicationCatalogPage.voir_dans_la_cartographie_metier')}
                  </button>
                  {mapping.source_url && (
                    <a href={mapping.source_url} target="_blank" rel="noopener noreferrer">
                      {ui('applicationCatalogPage.source_editeur')}
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>{ui('applicationCatalogPage.aucune_correspondance_de_l_offre_suffisamment_documentee_pour_cet')}</p>
          )}
        </>
      )}
      <h5>
        {selection
          ? ui('applicationCatalogPage.couverture_metier_dans_ce_si')
          : ui('applicationCatalogPage.correspondances_documentees_par_si')}
      </h5>
      {coverage.length ? (
        coverage.map(({ selection: context, mapping }) => (
          <div className="application-mapping" key={mapping.id}>
            {!selection && <small>{contextName(model.raw.application_catalog, context.context_id)}</small>}
            {component.id !== mapping.component_id && (
              <small>{product.components.find((item) => item.id === mapping.component_id)?.name}</small>
            )}
            <strong>{model.nodeById.get(mapping.node_id)?.name || mapping.node_id}</strong>
            <span>
              {evidenceLabel[mapping.evidence_state]} · <ModelText text={mapping.note} />
            </span>
            <button type="button" onClick={() => onShowOnMap(context.id, mapping.component_id)}>
              {ui('applicationCatalogPage.voir_sur_la_carte')}
            </button>
          </div>
        ))
      ) : (
        <p>
          {selection
            ? ui('applicationCatalogPage.aucune_correspondance_metier_documentee_pour_cette_fonctionnalite')
            : ui('applicationCatalogPage.aucune_correspondance_documentee_dans_un_si_pour_cette_fonctionna')}
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
      const rail = document.querySelector<HTMLElement>('.application-rail');
      const composition = document.querySelector<HTMLElement>('.application-composition');
      const currentModule = composition?.querySelector('.application-components button[aria-current="true"]');
      const rootModule = composition?.querySelector('.application-component-list > li > button');
      if (
        composition &&
        currentModule &&
        currentModule !== rootModule &&
        getComputedStyle(composition).gridTemplateColumns.split(' ').length === 1
      ) {
        const moduleDetail = composition.querySelector<HTMLElement>('.application-component-detail');
        moduleDetail?.scrollIntoView({ block: 'start' });
        moduleDetail?.focus({ preventScroll: true });
      } else if (rail && getComputedStyle(rail).display === 'none') {
        detailTitle.current?.closest('.application-detail')?.scrollIntoView({ block: 'start' });
        detailTitle.current?.focus({ preventScroll: true });
      } else {
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
  if (!catalog) return <p>{ui('applicationCatalogPage.aucun_catalogue_applicatif_dans_cette_publication')}</p>;

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
      <div className="application-explorer">
        <nav
          className="application-rail"
          aria-label={
            mode === 'systems'
              ? ui('applicationCatalogPage.si_et_produits')
              : ui('applicationCatalogPage.produits_du_marche')
          }
        >
          <h2 ref={listTitle} tabIndex={-1}>
            {mode === 'systems'
              ? ui('applicationCatalogPage.systemes_d_information')
              : ui('applicationCatalogPage.produits')}
          </h2>
          {mode === 'systems' ? (
            contexts
              .filter((context) => catalog.selections.some((item) => item.context_id === context))
              .map((context) => (
                <section key={context} className="application-nav-group">
                  <h3>{contextName(model.raw.application_catalog, context)}</h3>
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
              {ui('applicationCatalogPage.retour_a_la_liste')}
            </button>
            <p className="application-detail-context">
              {selection
                ? contextName(model.raw.application_catalog, selection.context_id)
                : ui('applicationCatalogPage.produit_logiciel_du_marche')}
            </p>
            <div className="application-product-heading">
              <ProductIdentity product={product} headingRef={detailTitle} />
              {selection && availableMappings.length > 0 && (
                <button
                  type="button"
                  onClick={() => onShowOnMap(selection.id, component.id === root?.id ? undefined : component.id)}
                >
                  {ui('applicationCatalogPage.voir_sur_la_carte')}
                </button>
              )}
            </div>
            {selection ? (
              <>
                <p>
                  {selection.perspective === 'target'
                    ? ui('applicationCatalogPage.cible_prevue')
                    : selection.presence === 'unknown'
                      ? ui('applicationCatalogPage.presence_a_verifier')
                      : selection.presence === 'documented'
                        ? ui('applicationCatalogPage.presence_documentee')
                        : selection.presence === 'confirmed'
                          ? ui('applicationCatalogPage.presence_confirmee')
                          : ui('applicationCatalogPage.presence_declaree')}
                </p>
                <SelectionFacts selection={selection} />
                {selection.note && (
                  <p>
                    <ModelText text={selection.note} />
                  </p>
                )}
                <details className="application-product-details">
                  <summary>{ui('applicationCatalogPage.fiche_du_produit')}</summary>
                  <ProductFacts product={product} />
                </details>
              </>
            ) : (
              <>
                <p>
                  {ui('applicationCatalogPage.inventaire')}{' '}
                  {product.inventory_status === 'partial'
                    ? 'partiel'
                    : product.inventory_status === 'complete'
                      ? 'complet'
                      : ui('applicationCatalogPage.a_etablir')}
                </p>
                {product.note && !product.documentation && (
                  <p>
                    <ModelText text={product.note} />
                  </p>
                )}
                <ProductFacts product={product} />
              </>
            )}
            <div
              className={`application-composition ${product.components.length > 1 ? 'application-has-modules' : ''}`}
            >
              {root && product.components.length > 1 && (
                <nav
                  className="application-components"
                  aria-label={ui('applicationCatalogPage.modules_de', { name: product.name })}
                >
                  <h3>{ui('applicationCatalogPage.modules_et_fonctions')}</h3>
                  <ul className="application-component-list">
                    <li>
                      <button
                        type="button"
                        aria-current={component.id === root.id ? 'true' : undefined}
                        onClick={() => selectItem(selection?.id || '', root.id)}
                      >
                        <span>{ui('applicationCatalogPage.vue_d_ensemble')}</span>
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
