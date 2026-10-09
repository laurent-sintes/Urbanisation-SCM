import type { PublishedModel } from '../types';

/** Interface help describes only the policy actually present in this snapshot. */
export function ReadingHelp({ model }: { model: PublishedModel }) {
  if (!model.raw.display_index) return null;
  return (
    <section className="reading-help" aria-label="Identité et codes de lecture">
      <h2>Identité et codes de lecture</h2>
      <p>
        Le code repère un élément dans cette publication : SYS — système métier, DOM — domaine, SUB — sous-domaine, REF
        — référentiel, CAP — capacité, BHV — comportement.
      </p>
      <dl>
        <dt>Identifiant persistant</dt>
        <dd>L’identité qui conserve les liens et les relations d’un élément entre les publications.</dd>
        <dt>Code de lecture</dt>
        <dd>
          Un préfixe et au moins trois chiffres, par exemple CAP-025. Visible dans la fiche, il peut changer dans une
          publication suivante.
        </dd>
        <dt>Ordre de lecture</dt>
        <dd>
          Chaque type suit sa séquence dans l’arbre de haut en bas. Codes et ordre sont figés pour la publication ;
          aucun filtre, recherche ou déplacement ne les renumérote.
        </dd>
      </dl>
      <p>
        La recherche accepte le code, son début ou l’identifiant persistant. « Copier le lien » conserve l’identité et
        la publication pour partager une référence durable.
      </p>
    </section>
  );
}
