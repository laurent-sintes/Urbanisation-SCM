# Audit de FLOW Atlas — 9 octobre 2026

État audité : interface locale et publication courante `2026-10-09.6`, avec les corrections de carte et de tooltips encore non commitées. Le site GitHub Pages n'a pas été redéployé pendant cet audit.

## Périmètre et preuves

Lecture du frontend React, du chargement des publications, du build, de l'export, du serveur statique et du workflow Pages. Recettes navigateur sur les vues Enterprise Architecture, Business System, Domain, fiche, documentation, relations et scénarios ; niveaux de détail 0 à 4 ; plein écran ; clavier ; largeurs 320, 390, 768 et 1440 px. Contrôle structurel des 67 publications exportées.

Contrôles obtenus : build TypeScript/Vite ; 157 tests JavaScript ; 33 tests Python de l'application (2 ignorés) ; 26 tests Python ciblés du build, de l'export et de la livraison ; huit recettes `pnpm verify`. Le contrôle historique a parcouru 396 périmètres et 776 projections. Les premiers échecs Python venaient des restrictions locales sur les fichiers temporaires et les sockets ; les mêmes tests sont passés avec un répertoire temporaire accessible et l'accès à la boucle locale. Une recette navigateur complémentaire couvre désormais l'historique de navigation, les deux dispositions du graphe Relations, son chargement différé et une publication ancienne avec capacités directement sous un domaine.

## Défauts corrigés dans ce lot local

| Gravité | Constat | Correction et preuve |
| --- | --- | --- |
| P1 | En vue Business System, augmenter le détail créait des panneaux Subdomain, Business Area et Capability à côté des panneaux Domain. | La projection conserve les Domain comme seuls panneaux et ajoute les descendants à l'intérieur. Parcours navigateur à chaque niveau et contrôle des 67 publications. |
| P1 | Les noms imbriqués de la carte ne donnaient plus de description au survol ou au clavier. Les aides pouvaient rester hors de la carte en plein écran. | Boutons de carte avec tooltip descriptif ; conteneur des tooltips synchronisé avec le plein écran ; tests de survol, focus, Échap et placement. |
| P2 | Une capacité ou un référentiel directement rattaché à un Subdomain pouvait apparaître dès le niveau Business Areas. | Les objets sont révélés au niveau Capability ; test de la forme historique. |
| P2 | Les descriptions des panneaux étaient coupées à deux lignes alors qu'elles peuvent contenir des liens de glossaire accessibles au clavier. | Coupure supprimée et contrôle des liens visibles dans la carte. |
| P3 | La documentation annonçait quatre recettes et un arbre latéral disparus. | Description alignée sur les huit recettes et le menu Explorer actuel. |

## Suite donnée aux points restants

1. **Navigation.** Le changement d'historique est sorti de la fonction de mise à jour React. Une référence conserve la dernière route pendant les actions rapprochées et se resynchronise au retour navigateur. La recette vérifie un seul ajout d'historique par clic, puis retour et avance. `App.tsx` reste volumineux ; une séparation plus large attend un besoin précis.
2. **Cartes détaillées.** Les listes imbriquées et les comportements sont désormais calculés une fois par modèle, périmètre et niveau de détail, sans être reconstruits à chaque mesure de hauteur. Sur Chrome local, le calcul de placement relevé pour 5 panneaux Domain dans Business System et 9 panneaux Subdomain dans Domain reste entre 0 et 2 ms aux niveaux 0 à 4. Cette mesure n'inclut ni le dessin React ni la lecture humaine. Le mode manuel Pleine page reste disponible et peut rendre le texte petit ; la recette vérifie que le cadrage tient dans l'écran, pas sa lisibilité sur appareil lent.
3. **Relations.** La signature de projection est mémorisée et n'est plus recalculée lors d'une simple sélection. Le chunk Relations reste chargé seulement à l'ouverture de cette vue. Le graphe complet au niveau Subdomain de la publication courante contient 35 nœuds et 79 liens ; deux passages Chrome ont mesuré 52 à 80 ms pour la disposition organique et 87 à 133 ms pour la hiérarchique. La recette fixe à 2 s le budget de placement pour cette publication. Ce sont des mesures du placement, pas du temps de peinture ou de l'interactivité. Le chunk pèse encore 664 Ko avant compression (203 Ko gzip) et les algorithmes de placement restent sur le fil principal. Une publication nettement plus dense demandera une mesure sur son jeu de données avant de choisir un budget ou une autre stratégie.
4. **Héritage.** Le contrôle structurel parcourt les 67 publications et un test navigateur ouvre maintenant un lien direct vers la plus ancienne : ses capacités directement rattachées au Domain restent visibles. Les 97 projections de domaines utilisant le rendu de repli restent intentionnelles et fidèles à leurs snapshots.

## Limites de l'audit

Les tests navigateur utilisent Chrome et des données isolées ; ils ne remplacent ni un essai avec lecteur d'écran, ni un essai tactile réel, ni une mesure de performance sur appareil lent. Aucun scan en ligne des vulnérabilités de dépendances n'a été effectué. La réussite locale ne prouve pas le déploiement de ces changements sur GitHub Pages : release, commit, push et déploiement restent des opérations distinctes.
