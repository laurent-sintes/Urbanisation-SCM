# Revue de code de FLOW Atlas — 9 octobre 2026

## Périmètre

Interface React/TypeScript, projection des cartes, graphe Relations, lecture des publications et parcours de vérification. Cette revue porte sur le code local avec les corrections de carte et de tooltips encore non commitées. Elle ne modifie aucun snapshot publié.

## Constats et suites

| Priorité | Constat | Suite |
| --- | --- | --- |
| P2 | `App.tsx` réunit lecture de route, chargement, navigation, bandeaux et sélection de toutes les vues. Les chemins de navigation sont difficiles à relire malgré des tests solides. | Le contrôleur de route est maintenant dans `useAtlasLocation.ts` avec React Router. Les paramètres de publication et de sélection restent dans l'URL. Le découpage du grand rendu JSX par vue demeure utile lors des prochaines évolutions. |
| P2 | `ReactFlowPane.tsx` mêle calcul des descendants, placement, mesure DOM et rendu. Une promesse immédiatement résolue donnait une impression d'asynchronisme sans quitter le fil principal. | Les descendants sont mémorisés par périmètre et détail ; le placement est maintenant synchrone, avec une erreur affichée si le calcul échoue. Le commentaire explique pourquoi une mesure de hauteur ne reconstruit pas les descendants. Une extraction du calcul de placement en fonction pure reste utile si les règles de grille changent. |
| P2 | `MetaTypeLabel` et `MapNodeButton` dupliquaient positionnement, fermeture au défilement et gestion d'Échap. | Un hook commun `useAnchoredTooltip` conserve leur cycle de vie et Floating UI gère ancrage, débordement et plein écran. Les liens de glossaire gardent leur interaction distincte, car leur tooltip peut être parcouru et contient parfois une liste. |
| P2 | Le graphe Relations utilise encore un placement sur le fil principal ; le chunk de 664 Ko avant compression domine le build. | Chargement différé vérifié ; budget de placement de 2 s sur la publication courante. Mesurer une publication plus dense avant de changer de moteur ou d'introduire un worker. |
| P3 | Plusieurs fichiers combinent expressions JSX et logique métier sur une ligne (`App.tsx`, `DependenciesPane.tsx`, `BusinessSheet.tsx`). Les commentaires existants expliquent surtout les exceptions. | Découper au fil des modifications fonctionnelles, avec des noms et tests qui rendent le comportement lisible. Ne pas ajouter un commentaire à chaque instruction : commenter les invariants et les raisons non évidentes. |

Les fonctions pures de modèle, de navigation et de projection ont des tests dédiés. Le chargement des publications contrôle l'identité et les empreintes avant affichage. Aucun `TODO`, `FIXME`, `@ts-ignore` ou `eslint-disable` n'a été trouvé dans `app/src`. Le projet utilise TypeScript strict et les recettes navigateur couvrent les cartes à chaque niveau, les liens directs et le retour navigateur. Biome contrôle désormais le lint, le formatage et les imports des sources et des tests maintenus. Les avertissements hérités restent visibles en diagnostic.

## Bibliothèques envisagées

| Bibliothèque | Apport réel | Décision |
| --- | --- | --- |
| [Biome](https://biomejs.dev/configuration/configure-biome/) | Réunit formatage et lint pour TypeScript, TSX, CSS et JSON. | Installé. `check:code` vérifie aussi le formatage et les imports ; `format:code` applique les corrections sûres. Les anciennes alertes de style et d'accessibilité restent des avertissements à traiter par lots lisibles. |
| [Floating UI React](https://floating-ui.com/docs/react) | Gère l'ancrage, les interactions et la mise à jour de position au défilement. Son [portail accepte une racine explicite](https://floating-ui.com/docs/floatingportal), utile au plein écran. | Installé et utilisé pour les aides des types, objets et liens. |
| [React Router `HashRouter`](https://reactrouter.com/api/declarative-routers/HashRouter) | Synchronise vues et historique dans le fragment d'URL. | Installé ; les chemins `#/map`, `#/sheet`, `#/relations` et les autres vues remplacent le format des liens générés auparavant. L'ancienne compatibilité des liens partagés n'est plus une contrainte de conception. |
| Bibliothèque d'état globale | Partager sélection et réglages entre composants. | Aucun besoin établi : le modèle publié est chargé une fois, la navigation réside dans l'URL et les réglages locaux sont limités. |

## Commentaires et documentation

Les commentaires ajoutés portent sur les invariants fragiles : composition des navigations avant le commit React, descendants indépendants des mesures de hauteur, et cycle de vie des tooltips. Le contrat de publication et les différences historiques restent décrits dans `app/README.md` et dans les tests. Les commentaires ne doivent pas recopier les expressions TypeScript ; cela les rendrait vite obsolètes.

## Vérification

`pnpm --dir app test` : 152 tests réussis après retrait de cinq tests consacrés aux anciens liens et à une interface Informations retirée. `pnpm --dir app build` et `pnpm --dir app verify` réussis, y compris Biome, cartes, tooltips, plein écran, historique de navigation, Relations et ancienne publication. `git diff --check` ne relève pas d'erreur. Les recettes actives inspectent les chemins du routeur. Les mesures de performance de `rapport.md` concernent la publication `2026-10-09.6` dans Chrome local ; elles ne mesurent pas un appareil lent ni la peinture complète de React.

Le formatage de l'ensemble des sources et des tests actifs augmente fortement le diff courant. Il ne faut pas interpréter son nombre de lignes comme l'effet isolé des bibliothèques.

## Suite de l'audit du 9 octobre

Le lecteur de routes ne reconnaît plus l'ancien format `#view=…` ; les chemins `#/vue?…` sont le seul contrat courant. Le module d'interface Informations, inutilisé par l'application, est retiré. Les huit recettes maintenues restent à la racine d'`app` ; les anciennes recettes candidates et spécialisées sont conservées sous `app/legacy/`. Les alias de commande historiques lancent la recette consolidée. Le test de tooltip réessaie une interaction lorsque la mesure de carte remplace le nœud survolé.

Le contrôle Biome passe sur 103 fichiers. Il reste 124 avertissements dans `src` et deux diagnostics informatifs : surtout assertions TypeScript non nulles, clés de listes par index et dépendances de hooks. Ils ne sont pas masqués et ne deviennent pas une garantie de propreté complète. Leur correction doit préserver les mécanismes de navigation, de mesure et de focus ; l'application automatique des correctifs « unsafe » n'a pas été retenue.
