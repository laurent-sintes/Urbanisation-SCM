import type { View } from '../navigation';
import type { WorkshopStage } from '../workshop';
import { workshopUrl } from '../workshop';
import './help.css';

interface Props {
  topic: 'start' | 'workshop';
  onNavigate: (view: View, topic?: 'workshop') => void;
  stage: WorkshopStage | null;
  stageMatchesPublication: boolean;
  stageError: string;
  onDownloadWorkingModel: () => void;
}

export function HelpPage({
  topic,
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
            <strong>Atelier actif · {stage.session_id}</strong>
            <p>
              {stage.operations.length} changement(s) enregistré(s) sur la publication {stage.base_version}.
            </p>
            <a href={workshopUrl()} download={`flow-atlas-staging-${stage.session_id}.json`}>
              Télécharger le staging
            </a>
            {' · '}
            <button type="button" className="help-link" onClick={onDownloadWorkingModel}>
              Télécharger le modèle de travail
            </button>
          </div>
        ) : (
          <p className="help-notice" role="status">
            {stage
              ? `L’atelier ${stage.session_id} est lié à la publication ${stage.base_version}. Tu peux la consulter, mais une nouvelle publication courante peut bloquer les éditions : demande à Codex de comparer les versions avant de reprendre.`
              : 'Aucun atelier actif sur cette publication. Demande à Codex de démarrer une séance avec le skill atlas-workshop.'}
          </p>
        )}
        {stageError && <p role="alert">Lecture du staging : {stageError}</p>}
        <section>
          <h2>Procédure pour un atelier en présentiel</h2>
          <ol>
            <li>
              Lancer Atlas localement, choisir la publication courante et projeter la cartographie en plein écran.
            </li>
            <li>
              Demander à Codex de démarrer l’atelier. Les points chauds apparaissent aussi sur la carte d’accueil.
            </li>
            <li>
              Demander à Codex d’ajouter, modifier ou retirer un point chaud. Atlas le montre sur la carte sans release.
            </li>
            <li>Télécharger le staging et le modèle de travail avant de terminer la séance.</li>
            <li>Clôturer la séance avec Codex après avoir conservé le staging.</li>
            <li>
              Plus tard, demander à Codex un aperçu des changements, puis l’intégration des propositions retenues au
              backlog.
            </li>
            <li>Reprendre la validation et la release habituelles.</li>
          </ol>
        </section>
        <section>
          <h2>Exemples de prompts pour Codex</h2>
          <p>Une phrase courte suffit pour démarrer ; les détails peuvent être ajoutés après la discussion.</p>
          <ul className="help-prompts">
            <li>
              « Ajoute un point chaud entre Logistics et Supply Chain Orchestration : qui décide du site d’expédition ?
              »
            </li>
            <li>« Place un post-it sur Order Management : clarifier le traitement des commandes partielles. »</li>
            <li>« Ajoute à ce point chaud l’exemple discuté : une commande est préparée depuis deux sites. »</li>
            <li>
              « Déplace ce point chaud vers Process Management et précise que la difficulté politique reste à évaluer. »
            </li>
            <li>« Retire le post-it créé par erreur pendant cette séance. »</li>
            <li>« Liste les points chauds ajoutés aujourd’hui et prépare le fichier de staging. »</li>
            <li>« Clôture la séance après sauvegarde du staging. »</li>
            <li>« Prépare un aperçu des changements de l’atelier et signale les conflits avec le backlog. »</li>
            <li>« Intègre au backlog les points chauds retenus dans cet aperçu. »</li>
          </ul>
          <p>Un point chaud d’atelier reste une proposition. Son affichage ne signifie ni validation ni publication.</p>
          <p>
            Le staging sert à la reprise automatisée par Codex. Le modèle de travail téléchargé sert à relire la séance
            ; son JSON n’est pas un fichier de backlog directement importable. Codex vérifie les conflits et les sources
            avant d’écrire dans le modèle YAML.
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
            pour situer les systèmes, domaines et responsabilités métier. La tirette de détail révèle les niveaux
            suivants.
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
          Atlas affiche une publication du modèle. Le menu Télécharger fournit son JSON et son YAML complets, y compris
          les points chauds publiés. Une publication historique reste fixée à son état d’origine.
        </p>
      </section>
      <section>
        <h2>Préparer une séance collective</h2>
        <p>
          La rubrique{' '}
          <button type="button" className="help-link" onClick={() => onNavigate('help', 'workshop')}>
            Mode atelier
          </button>{' '}
          explique comment recueillir des points chauds sur la carte locale avec Codex, avant leur intégration au
          backlog.
        </p>
      </section>
    </div>
  );
}
