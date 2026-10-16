import {
  FloatingFocusManager,
  FloatingPortal,
  useClick,
  useDismiss,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { ChevronDown, Layers3, X } from 'lucide-react';
import { useId, useState } from 'react';
import { contextName, productFor } from '../applicationCatalog';
import type { ApplicationCatalog } from '../types';
import { useHotspotFloating } from './HotspotDisplay';

export function MapApplicationPicker({
  catalog,
  selectionId,
  componentId,
  onChange,
}: {
  catalog: ApplicationCatalog;
  selectionId?: string;
  componentId?: string;
  onChange: (selectionId: string, componentId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const { refs, floatingStyles, context, host } = useHotspotFloating(open, setOpen, 0.75, { reserveToolbar: false });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);
  const selected = catalog.selections.find((item) => item.id === selectionId);
  const product = selected
    ? productFor(catalog, selected)
    : catalog.products.find((item) => item.id === selectionId && item.kind === 'vendor_product');
  const component = product?.components.find((item) => item.id === componentId);
  const contexts = [...new Set(catalog.selections.map((item) => item.context_id))];
  const choose = (nextSelection: string, nextComponent = '') => {
    onChange(nextSelection, nextComponent);
    setOpen(false);
  };

  return (
    <div className="map-application-picker">
      <button
        type="button"
        className="detail-trigger"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <Layers3 size={15} />
        <span>
          Applications <strong>{product?.name || selected?.product_id || 'masquées'}</strong>
          {product && !selected && <span> · Offre éditeur</span>}
          {component && <span> · {component.name}</span>}
        </span>
        <ChevronDown size={14} className={open ? 'is-open' : ''} />
      </button>
      {open && (
        <FloatingPortal root={host}>
          <FloatingFocusManager context={context} modal={matchMedia('(max-width: 900px)').matches}>
            <div
              {...getFloatingProps()}
              ref={refs.setFloating}
              style={floatingStyles}
              id={id}
              className="application-picker-popover"
              role="dialog"
              aria-label="Applications sur la carte"
            >
              <div className="application-picker-heading">
                <strong>Empreinte applicative</strong>
                <button type="button" aria-label="Fermer les applications" onClick={() => setOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <p>Produits du marché : couverture de l’offre éditeur. Par SI : couverture documentée dans ce SI.</p>
              <button
                type="button"
                className="application-picker-option"
                aria-pressed={!product && !selected}
                onClick={() => choose('')}
              >
                Masquer les applications
              </button>
              <div className="application-picker-list">
                <section>
                  <h3>Produits du marché</h3>
                  {catalog.products
                    .filter((item) => item.kind === 'vendor_product')
                    .map((item) => (
                      <button
                        type="button"
                        className="application-picker-option"
                        key={item.id}
                        aria-pressed={!selected && item.id === product?.id}
                        onClick={() => choose(item.id)}
                      >
                        {item.name}
                      </button>
                    ))}
                </section>
                {contexts.map((contextId) => (
                  <section key={contextId}>
                    <h3>{contextName[contextId] || contextId}</h3>
                    {catalog.selections
                      .filter((item) => item.context_id === contextId)
                      .map((item) => (
                        <button
                          type="button"
                          className="application-picker-option"
                          key={item.id}
                          aria-pressed={item.id === selected?.id}
                          onClick={() => choose(item.id)}
                        >
                          {productFor(catalog, item)?.name || item.product_id}
                        </button>
                      ))}
                  </section>
                ))}
              </div>
              {product && product.components.length > 1 && (
                <div className="application-picker-components" role="group" aria-label="Fonctionnalité affichée">
                  <strong>Fonctionnalité affichée</strong>
                  <button
                    type="button"
                    className="application-picker-option"
                    aria-pressed={!component}
                    onClick={() => choose(selected?.id || product.id)}
                  >
                    Tout le produit
                  </button>
                  {product.components
                    .filter((item) => item.kind !== 'product')
                    .map((item) => (
                      <button
                        type="button"
                        className="application-picker-option"
                        key={item.id}
                        aria-pressed={item.id === component?.id}
                        onClick={() => choose(selected?.id || product.id, item.id)}
                      >
                        {item.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
