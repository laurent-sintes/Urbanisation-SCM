import type { PublishedModel } from '../types';
import { ui } from '../ui.ts';

/** Interface help describes only the policy actually present in this snapshot. */
export function ReadingHelp({ model }: { model: PublishedModel }) {
  if (!model.raw.display_index) return null;
  const prefixes = new Map<string, string>();
  for (const node of model.nodes) {
    const prefix = node.displayCode?.split('-')[0];
    const label = node.reading?.kind;
    if (prefix && label) prefixes.set(prefix, label);
  }
  const explanation = [...prefixes].map(([prefix, label]) => ui('readingHelp.prefix', { prefix, label })).join(', ');
  return (
    <section className="reading-help" aria-label={ui('readingHelp.identite_et_codes_de_lecture')}>
      <h2>{ui('readingHelp.identite_et_codes_de_lecture')}</h2>
      <p>{ui('readingHelp.code_intro', { prefixes: explanation })}</p>
      <dl>
        <dt>{ui('readingHelp.identifiant_persistant')}</dt>
        <dd>{ui('readingHelp.l_identite_qui_conserve_les_liens_et_les_relations_d_un_element_e')}</dd>
        <dt>{ui('readingHelp.code_de_lecture')}</dt>
        <dd>{ui('readingHelp.un_prefixe_et_au_moins_trois_chiffres_par_exemple_cap_025_visible')}</dd>
        <dt>{ui('readingHelp.ordre_de_lecture')}</dt>
        <dd>{ui('readingHelp.chaque_type_suit_sa_sequence_dans_l_arbre_de_haut_en_bas_codes_et')}</dd>
      </dl>
      <p>{ui('readingHelp.la_recherche_accepte_le_code_son_debut_ou_l_identifiant_persistan')}</p>
    </section>
  );
}
