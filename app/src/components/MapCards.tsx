import type { Node, NodeProps } from '@xyflow/react';
import { ArrowUpRight } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import { startsCapabilityTypeSection } from '../capabilityTypes';
import { categoryCaption, startsCategorySection } from '../categories';
import { NodeIcon } from '../icons';
import { directSectionCaption, startsDirectSection } from '../mapSections';
import { type CardChildList, cardListedItems, type scopeStatistics } from '../model';
import { kindLabel, modelingDepthLabel } from '../presentation';
import { roleOf } from '../subdomainRoles';
import type { AtlasNode } from '../types';
import { MapNodeButton, MetaTypeLabel, ModelText } from './ModelLinks';
export type MapChildList = CardChildList & { subdomainChildren?: Record<string, CardChildList> };
type Card = Node<
  {
    item: AtlasNode;
    summary: string;
    statistics: ReturnType<typeof scopeStatistics>;
    parentName?: string;
    childList?: MapChildList;
    detail: number;
    selectedId: string;
    behaviorsByCapability: Record<string, AtlasNode[]>;
    onHeight: (id: string, height: number) => void;
    onRead: (id: string) => void;
    highlighted: boolean;
    muted: boolean;
  },
  'business'
>;
type Container = Node<{ item: AtlasNode }, 'container'>;
function OverviewName({ item }: { item: AtlasNode }) {
  return <>{item.name}</>;
}
function BusinessCard({ data, selected }: NodeProps<Card>) {
  const dominantRole = roleOf(data.item);
  const presentation = data.item.kind === 'group' && data.item.groupRole !== 'urbanism_level';
  const card = useRef<HTMLElement>(null);
  const expanded = data.childList !== undefined;
  const listed = data.childList ? cardListedItems(data.childList) : [];
  const visibleCount =
    data.childList?.businessAreaChildren && data.detail < 3 ? data.childList.items.length : listed.length;
  const listLabel =
    data.item.kind === 'domain'
      ? 'Sous-domaines'
      : data.childList?.businessAreaChildren
        ? data.detail >= 3
          ? 'Business Areas et capacités'
          : 'Business Areas'
        : data.childList?.kind === 'domain'
          ? 'Domaines'
          : data.childList?.kind === 'mixed'
            ? 'Périmètres et éléments'
            : data.childList?.kind === 'reference'
              ? 'Référentiels'
              : data.childList?.kind === 'behavior'
                ? 'Comportements'
                : 'Capacités';
  const title = (
    <h3>
      <MapNodeButton
        node={data.item}
        className="overview-name-link nodrag nopan"
        onClick={(event) => {
          event.stopPropagation();
          data.onRead(data.item.id);
        }}
      >
        {data.item.name}
      </MapNodeButton>
    </h3>
  );
  const childLink = (child: AtlasNode) => (
    <>
      <MapNodeButton
        node={child}
        itemId={child.id}
        selected={data.selectedId === child.id}
        className={`card-child-link ${child.kind === 'reference' ? 'reference-link' : child.kind === 'behavior' ? 'behavior-link' : 'capacity-link'}`}
        onClick={() => data.onRead(child.id)}
      >
        <NodeIcon node={child} size={16} />
        <span>{child.name}</span>
        <ArrowUpRight size={12} className="child-arrow" />
      </MapNodeButton>
      {data.detail >= 4 && data.behaviorsByCapability[child.id]?.length ? (
        <ul className="card-behavior-list" aria-label={`Comportements de ${child.name}`}>
          {data.behaviorsByCapability[child.id].map((behavior) => (
            <li key={behavior.id}>
              <MapNodeButton
                node={behavior}
                itemId={behavior.id}
                selected={data.selectedId === behavior.id}
                className="card-child-link behavior-link"
                onClick={() => data.onRead(behavior.id)}
              >
                <NodeIcon node={behavior} size={14} />
                <span>{behavior.name}</span>
                <ArrowUpRight size={12} className="child-arrow" />
              </MapNodeButton>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
  const areaItems = (list: CardChildList, area: AtlasNode) =>
    list.items.map((child, index) =>
      child.kind === 'business_area' && list.businessAreaChildren ? (
        <li key={child.id} className="business-area-list-group">
          <div className="category-list-banner" data-business-area-summary={child.id}>
            <MapNodeButton
              node={child}
              className="nodrag nopan"
              selected={data.selectedId === child.id}
              onClick={() => data.onRead(child.id)}
            >
              {child.name}
            </MapNodeButton>
          </div>
          {data.detail >= 3 && (
            <ul aria-label={`Capacités de ${child.name}`}>
              {(list.businessAreaChildren?.[child.id] || []).map((capability) => (
                <li key={capability.id}>{childLink(capability)}</li>
              ))}
            </ul>
          )}
        </li>
      ) : (
        <li
          key={child.id}
          className={startsCapabilityTypeSection(list.items, index) ? 'capability-type-section-start' : undefined}
        >
          {list.businessAreaChildren && startsDirectSection(list.items, index) && (
            <div className="category-list-banner">{directSectionCaption([child])}</div>
          )}
          {area.kind === 'area' && startsCategorySection(list.items, index) && (
            <div className="category-list-banner">{categoryCaption(child)}</div>
          )}
          {childLink(child)}
        </li>
      ),
    );
  // Content revisions need a fresh natural height even while the row holds a fixed height.
  // biome-ignore lint/correctness/useExhaustiveDependencies: These fields are remeasurement triggers.
  useLayoutEffect(() => {
    if (!card.current) return;
    // Measure the natural card height, not the equal height assigned to its row.
    const measure = () => {
      if (!card.current) return;
      const assignedHeight = card.current.style.height;
      card.current.style.height = 'auto';
      const naturalHeight = card.current.offsetHeight;
      card.current.style.height = assignedHeight;
      data.onHeight(data.item.id, naturalHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card.current);
    return () => observer.disconnect();
  }, [expanded, data.item, data.childList, data.detail, data.behaviorsByCapability, data.onHeight]);
  return (
    <article
      ref={card}
      className={`business-card ${expanded ? 'has-child-list' : ''} ${selected ? 'is-selected' : ''} ${presentation ? 'is-presentation' : ''} ${data.highlighted ? 'is-highlighted' : ''} ${data.muted ? 'is-muted' : ''}`}
      style={{ height: '100%' }}
      data-node-id={data.item.id}
      data-kind={data.item.kind}
      data-depth={String(data.item.fields.modeling_depth || '')}
    >
      {data.item.kind === 'area' ? (
        <div className="subdomain-card-heading">
          <NodeIcon node={data.item} size={20} />
          <MetaTypeLabel node={data.item} />
          {title}
        </div>
      ) : (
        <div className="card-eyebrow">
          <NodeIcon node={data.item} size={22} />
          <MetaTypeLabel node={data.item} />
        </div>
      )}
      {data.parentName && <small className="map-card-parent">{data.parentName}</small>}
      {data.item.kind !== 'area' && title}
      {modelingDepthLabel(data.item) && <span className="modeling-depth">{modelingDepthLabel(data.item)}</span>}
      {dominantRole && (
        <span
          className="subdomain-role"
          data-role={dominantRole.id}
          title="Finalité dominante ; les autres responsabilités du sous-domaine restent applicables."
        >
          {dominantRole.display_name}
        </span>
      )}
      <p>
        <ModelText
          text={data.item.purpose || data.item.definition || 'Description non renseignée dans cette publication.'}
        />
      </p>
      {data.childList && (
        // biome-ignore lint/a11y/noStaticElementInteractions: This wrapper only stops React Flow event bubbling; its nested buttons handle interaction.
        <div
          className="card-child-list nodrag nopan nowheel"
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (['Enter', ' '].includes(event.key)) event.stopPropagation();
          }}
        >
          <div className="child-list-heading">
            {listLabel} <span>{visibleCount}</span>
          </div>
          {data.childList.items.length ? (
            <ul aria-label={`${listLabel} de ${data.item.name}`}>
              {data.childList.subdomainChildren
                ? data.childList.items.map((subdomain) => (
                    <li key={subdomain.id} className="domain-subdomain-group">
                      {childLink(subdomain)}
                      {data.detail >= 2 && data.childList?.subdomainChildren?.[subdomain.id] && (
                        <ul className="domain-subdomain-contents" aria-label={`Business Areas de ${subdomain.name}`}>
                          {areaItems(data.childList.subdomainChildren[subdomain.id], subdomain)}
                        </ul>
                      )}
                    </li>
                  ))
                : areaItems(data.childList, data.item)}
            </ul>
          ) : (
            <p>Aucun élément publié.</p>
          )}
        </div>
      )}
      {data.item.kind === 'area' ? (
        data.statistics.length > 0 && (
          <div className="subdomain-stats" role="group" aria-label={`Contenu publié de ${data.item.name}`}>
            {data.statistics.map((stat) => (
              <span key={stat.kind}>
                <strong>{stat.count}</strong> {stat.label}
              </span>
            ))}
          </div>
        )
      ) : (
        <div className="card-bottom">
          <span>{data.summary || kindLabel(data.item)}</span>
        </div>
      )}
    </article>
  );
}
function GroupCard({ data }: NodeProps<Container>) {
  const role = roleOf(data.item);
  return (
    <div
      className={`map-container ${data.item.kind === 'group' && data.item.groupRole !== 'urbanism_level' ? 'presentation-container' : ''}`}
    >
      <div className="container-label">
        <NodeIcon node={data.item} size={20} />
        <strong>
          <OverviewName item={data.item} />
        </strong>
        <MetaTypeLabel node={data.item} />
        {role && (
          <span className="subdomain-role" data-role={role.id}>
            {role.display_name}
          </span>
        )}
      </div>
    </div>
  );
}
function CapabilityTypeDivider() {
  return <div className="map-capability-type-divider" role="separator" aria-label="Changement de type de capacité" />;
}
function CategoryBanner({ data }: NodeProps<Node<{ caption: string; area?: AtlasNode }, 'categoryBanner'>>) {
  return (
    <div className="category-banner" role="heading" aria-level={3} data-business-area={data.area?.id}>
      {data.caption}
    </div>
  );
}
export const nodeTypes = {
  business: BusinessCard,
  container: GroupCard,
  capabilityTypeDivider: CapabilityTypeDivider,
  categoryBanner: CategoryBanner,
};
