# Suite du réaudit Atlas — 9 octobre 2026

Périmètre : code local et publication courante `2026-10-09.6`. Cette intervention ne modifie aucun snapshot métier, ne crée pas de release et ne déploie pas le site distant.

## Corrections réalisées

| Sujet | Résultat |
| --- | --- |
| Pleine largeur | La grille réserve les marges avant de calculer ses colonnes. Un panneau seul peut occuper presque toute la largeur d'une carte de bureau, à l'échelle native. Les paragraphes gardent une longueur de ligne de 80 caractères environ. Pleine page conserve une grille choisie pour tenir dans la hauteur visible. |
| Régression de cadrage | La recette attend la position finale du panneau et vérifie qu'il reste entièrement dans la carte. Elle contrôle la largeur de disposition avant transformation et le zoom à 1, afin qu'un simple grossissement ne suffise plus à faire passer le test. |
| Code et lint | Les assertions non nulles, clés de listes instables, callbacks ambigus et dépendances de hooks signalés ont été repris. Biome ne signale plus de diagnostic sur les 107 fichiers actifs. `check:code` échoue désormais dès un nouvel avertissement. |
| Accessibilité | Le type du métamodèle est un bouton nommé dans l'arbre d'accessibilité et conserve sa définition au survol et au clavier. La recette vérifie aussi l'ouverture des modes par tap et le défilement vertical en émulation tactile. Les groupes ARIA qui ne sont pas des formulaires et les régions défilantes focusables restent intentionnels ; leurs deux recommandations Biome incompatibles avec cet usage sont désactivées dans `biome.json`. |
| Structure du code | Commandes et état du plein écran sont dans `components/MapPanel.tsx` ; contenu des panneaux dans `components/MapCards.tsx`. `ReactFlowPane.tsx` passe de 785 à 510 lignes et porte le placement ; `App.tsx` passe de 1 097 à 1 015 lignes. |
| Relations | fCoSE et Dagre sont chargés selon la disposition choisie. Le chunk Relations passe de 664 Ko à 458 Ko avant compression ; fCoSE (122 Ko) et Dagre (84 Ko) ont leurs propres chunks. La recette vérifie que Dagre n'est pas chargé lors de la première ouverture en mode organique. |

## Contrôles

- `pnpm --dir app test` : 155 tests réussis.
- `pnpm --dir app build` : export et compilation réussis.
- `pnpm --dir app verify` : huit recettes réussies, dont Chrome, plein écran, tactile, clavier, navigation, contenus et anciennes publications.
- `verify-map-history.mjs` : 67 publications, 396 périmètres et 776 projections contrôlés.
- `pnpm --dir app check:code`, `pnpm --dir app exec tsc --noEmit` et `git diff --check` : réussis.

L'arbre d'accessibilité Chrome et l'émulation tactile donnent un contrôle automatisé supplémentaire. Ils ne remplacent pas une lecture avec un lecteur d'écran réel ni un essai sur appareil tactile physique. La publication courante est la plus volumineuse des 67 exportées, avec 224 objets et 479 relations brutes. Sa vue Relations contrôlée contient 35 nœuds et 79 liens ; les placements Chrome ont pris 42 ms en organique et 81 ms en hiérarchique lors de cette recette. Une publication future nettement plus dense demandera une nouvelle mesure.
