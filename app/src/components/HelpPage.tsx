import { Download } from 'lucide-react';
import type { View } from '../navigation';
import type { WorkshopStage } from '../workshop';
import { workshopUrl } from '../workshop';
import './help.css';

interface Props {
  topic: 'start' | 'workshop';
  supplyDomainName?: string;
  onNavigate: (view: View, topic?: 'workshop') => void;
  stage: WorkshopStage | null;
  stageMatchesPublication: boolean;
  stageError: string;
  onDownloadWorkingModel: () => void;
}

export function HelpPage({
  topic,
  supplyDomainName,
  onNavigate,
  stage,
  stageMatchesPublication,
  stageError,
  onDownloadWorkingModel,
}: Props) {
  if (topic === 'workshop') {
    return (
      <div className="help-page">
        {stageMatchesPublication && stage ? (
          <div className="help-notice" role="status">
            <strong>Atelier actif</strong>
            <p>
              {stage.operations.length} changement{stage.operations.length > 1 ? 's' : ''} enregistré
              {stage.operations.length > 1 ? 's' : ''} sur la version {stage.base_version}.
            </p>
            <a href={workshopUrl()} download={`flow-atlas-staging-${stage.session_id}.json`}>
              <Download size={16} aria-hidden="true" />
              Télécharger le fichier de séance
            </a>
            {' · '}
            <button type="button" className="help-link" onClick={onDownloadWorkingModel}>
              <Download size={16} aria-hidden="true" />
              Télécharger le modèle de travail
            </button>
          </div>
        ) : (
          <p className="help-notice" role="status">
            {stage
              ? `Cette séance a été ouverte sur la version ${stage.base_version}. Consulte-la ou demande à Codex de vérifier les différences avant de reprendre.`
              : 'Aucun atelier actif sur cette version. La saisie en atelier est disponible dans Atlas local ; demande à Codex d’ouvrir une séance.'}
          </p>
        )}
        {stageError && <p role="alert">Chargement de la séance : {stageError}</p>}
        <section>
          <h2>Procédure pour un atelier en présentiel</h2>
          <ol>
            <li>
              Lancer Atlas localement, choisir la publication courante et projeter la cartographie en plein écran.
            </li>
            <li>
              Vérifier que « Atelier actif » apparaît ici. Les points chauds de la séance apparaissent aussi sur la
              cartographie.
            </li>
            <li>
              Demander à Codex d’ajouter ou retirer un point chaud, ou de modifier sa fiche. Pour les attributs du
              tableau « Points chauds », les saisir directement ; une fenêtre réunit les champs liés (type et périmètre,
              résolution et décision, complexités et justification). Choisir ensuite « Enregistrer les modifications ».
              Atlas les montre immédiatement dans la séance.
            </li>
            <li>Télécharger le fichier de séance et le modèle de travail avant de terminer l’atelier.</li>
            <li>Clôturer la séance avec Codex après avoir conservé ces fichiers.</li>
            <li>
              Plus tard, demander à Codex un aperçu des changements, puis l’intégration des propositions retenues au
              modèle en préparation.
            </li>
            <li>Faire valider les propositions retenues, puis demander leur publication.</li>
          </ol>
        </section>
        <section>
          <h2>Exemples de prompts pour Codex</h2>
          <p>Une phrase courte suffit pour démarrer ; les détails peuvent être ajoutés après la discussion.</p>
          <ul className="help-prompts">
            <li>
              « Ajoute un point chaud entre Logistics et {supplyDomainName || 'le domaine Supply'} : qui décide du site
              d’expédition ? »
            </li>
            <li>« Place un post-it sur Order Management : clarifier le traitement des commandes partielles. »</li>
            <li>« Ajoute à ce point chaud l’exemple discuté : une commande est préparée depuis deux sites. »</li>
            <li>
              « Déplace ce point chaud vers Process Management et précise que la complexité d’arbitrage reste à évaluer.
              »
            </li>
            <li>« Retire le post-it créé par erreur pendant cette séance. »</li>
            <li>« Liste les points chauds ajoutés aujourd’hui et prépare le fichier de séance. »</li>
            <li>« Clôture la séance après sauvegarde des changements. »</li>
            <li>
              « Prépare un aperçu des changements de l’atelier et signale les conflits avec le modèle en préparation. »
            </li>
            <li>« Intègre au modèle en préparation les points chauds retenus dans cet aperçu. »</li>
          </ul>
          <p>Un point chaud d’atelier reste une proposition. Son affichage ne signifie ni validation ni publication.</p>
          <p>
            Le fichier de séance permet à Codex de reprendre et d’intégrer les changements. Le modèle de travail sert à
            relire l’ensemble de la séance. Avant l’intégration, Codex compare les versions et vérifie les sources.
          </p>
        </section>
        <button type="button" className="help-link" onClick={() => onNavigate('hotspots')}>
          Voir les points chauds affichés
        </button>
      </div>
    );
  }

  return (
    <div className="help-page">
      <section>
        <h2>Par où commencer ?</h2>
        <ol>
          <li>
            <button type="button" className="help-link" onClick={() => onNavigate('map')}>
              Ouvrir la cartographie
            </button>{' '}
            pour situer les systèmes, domaines et responsabilités métier. Dans le Catalogue, choisis le niveau de détail
            ; dans Flux, zoome et déplace-toi sur la carte.
          </li>
          <li>Choisir un élément sur la carte, puis ouvrir sa fiche pour lire son périmètre et ses exemples.</li>
          <li>Utiliser la recherche à gauche pour retrouver un nom, un code ou une notion.</li>
          <li>
            <button type="button" className="help-link" onClick={() => onNavigate('hotspots')}>
              Explorer les points chauds
            </button>{' '}
            et activer leur affichage sur les cartes qui les concernent.
          </li>
          <li>Consulter les relations pour comprendre les dépendances explicites entre objets.</li>
        </ol>
      </section>
      <section>
        <h2>Comprendre ce que montre Atlas</h2>
        <p>
          Le{' '}
          <button type="button" className="help-link" onClick={() => onNavigate('metamodel')}>
            métamodèle FLOW
          </button>{' '}
          explique les types d’objets, leurs liens et les règles de la publication consultée. Le glossaire définit les
          termes métier employés dans les fiches.
        </p>
        <p>
          Atlas présente la version que tu as choisie. Le menu Télécharger fournit le modèle complet, y compris les
          points chauds publiés. Les anciennes versions conservent leur contenu d’origine.
        </p>
      </section>
      <section>
        <h2>Préparer une séance collective</h2>
        <p>
          La rubrique{' '}
          <button type="button" className="help-link" onClick={() => onNavigate('help', 'workshop')}>
            Mode atelier
          </button>{' '}
          explique comment recueillir des points chauds sur la carte locale avec Codex, avant leur intégration au modèle
          en préparation.
        </p>
      </section>
    </div>
  );
}
