import { useEffect, useMemo, useState } from 'react';
import { revealSection } from '../readerNavigation';
import { sheetSections } from '../sheetSections';
import type { AtlasNode, PublishedModel } from '../types';

export function SheetNavigation({
  model,
  node,
  onClose,
}: {
  model: PublishedModel;
  node: AtlasNode;
  onClose: () => void;
}) {
  const sections = useMemo(() => sheetSections(model, node), [model, node]);
  const [active, setActive] = useState('');
  useEffect(() => {
    const pane = document.querySelector<HTMLElement>('.workspace-content');
    if (!pane) return;
    const update = () => {
      const top = pane.getBoundingClientRect().top + 40;
      let current = sections[0]?.[0] || '';
      for (const [id] of sections) {
        const section = document.getElementById(`field-${node.id}-${id}`);
        if (section && section.getBoundingClientRect().top <= top) current = id;
      }
      setActive(current);
    };
    update();
    pane.addEventListener('scroll', update, { passive: true });
    return () => pane.removeEventListener('scroll', update);
  }, [node.id, sections]);
  return (
    <nav className="space-navigation sheet-navigation" aria-label="Dans cette fiche">
      <h2>Dans cette fiche</h2>
      {sections.map(([id, label]) => (
        <button
          type="button"
          key={id}
          aria-current={active === id ? 'location' : undefined}
          onClick={() => {
            onClose();
            requestAnimationFrame(() => {
              const target = document.getElementById(`field-${node.id}-${id}`);
              if (target) revealSection(target);
            });
          }}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
