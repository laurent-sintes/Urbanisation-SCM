# Audit UX de FLOW Atlas

Audit du site GitHub Pages, publication 2026-09-27.4, le 27 septembre 2026.

## Périmètre et méthode

Inspection du site publié en navigateur sans fenêtre à 1440 × 1000, puis d’un scénario à 390 × 844. Écrans examinés : accueil, Pour commencer, métamodèle, méthode, domaine Supply Chain Orchestration, capacité Replenishment, catalogue, scénario de commande B2B avec stock partiel, flux de valeur, glossaire méthodologique, relations et sources d’inspiration. Lecture du code pour identifier les causes et distinguer contenu, présentation et navigation.

Parcours effectivement testés : catalogue filtré → scénario → retour catalogue ; scénario → capacité. Les captures et relevés temporaires sont dans `app/.runtime/ux-audit/`. Les observations ne constituent ni un test avec des utilisateurs ni un audit complet de conformité d’accessibilité. Aucun score de satisfaction ou gain de temps n’est déduit.

## Diagnostic

Atlas possède des repères solides : arbre métier, fiches, liens vers les scénarios, glossaires, recherche et références publiées. La difficulté principale est l’effort nécessaire pour lire et conserver son contexte. Des informations courtes sont masquées, les mêmes commandes reviennent à plusieurs endroits et les transitions perdent une partie du parcours.

La priorité est de rendre l’information utile directement lisible, puis d’organiser les approfondissements. Tout déplier sans revoir la structure allongerait encore les fiches : les suppressions de clics doivent s’accompagner d’un regroupement visuel et d’un ordre de lecture clair.

## Constats et corrections recommandées

| Priorité | Constat vérifié | Conséquence pour le lecteur | Correction proposée |
| --- | --- | --- | --- |
| P1 | Les six blocs « Approfondir » des chapitres méthodologiques contiennent chacun seulement 19 à 37 mots. « Pour commencer » en contient deux. | Un clic pour un court paragraphe, sans indication du contenu caché. | Afficher ces paragraphes directement et supprimer le libellé générique. |
| P1 | Aucun lien dans le contenu de « Pour commencer ». Les chapitres affichent leurs textes bruts, sans le composant de liens utilisé dans les fiches. | Les concepts sont cités sans définition immédiate ni destination. | Relier système, domaine, sous-domaine, capacité, comportement, scénario et parcours à leur définition publiée ; proposer aussi des liens explicites vers la carte et le catalogue. Ajouter les références dans la source du guide et les rendre avec le composant de liens. |
| P1 | Replenishment affiche 21 blocs repliés : 3 comportements et 18 interactions. Les blocs de comportements comptent seulement 20 à 26 mots, titre compris. | La comparaison des comportements et des responsabilités exige des ouvertures répétées. | Comportements : nom lié, définition et type visibles. Interactions : nom lié et sens du lien visibles, regroupés par partenaire. Conserver chaque relation et sa qualification, même quand plusieurs liens concernent le même partenaire. |
| P1 | Le scénario B2B masque quatre listes d’entrées très courtes. Les étapes du flux masquent chacune deux phrases d’entrée et de sortie. | Le lecteur doit reconstituer les conditions nécessaires étape par étape. | Afficher les entrées, contributions et résultats dans une structure répétée et compacte. Garder le repli uniquement pour un complément substantiel et secondaire. |
| P1 | Depuis le catalogue filtré sur Replenishment, ouvrir un scénario puis « Catalogue des scénarios » efface le filtre. Depuis un scénario, ouvrir une capacité ne fournit pas de retour au scénario. | La consultation d’une définition interrompt l’exploration. | Conserver filtres et position du catalogue ; afficher un retour contextuel scénario/parcours sur la capacité. Conserver ce contexte de navigation sans créer d’historique de visites. |
| P1 | Le glossaire méthodologique propose encore « Cas d’usage » dans les notions associées, alors que MOD026 est retiré. La fiche Scénario expose aussi des notes de maintenance telles que « U793 », `scenario_catalog` et `fields.examples`. | Le lecteur ne distingue pas facilement le modèle actif des traces historiques. | Navigation courante centrée sur les notions actives ; signaler explicitement les anciennes notions lors d’un accès historique. Séparer l’explication utile au lecteur des traces d’évolution, sans supprimer les preuves. |
| P2 | Le sommaire de fiche mélange des ancres et « Sources d’inspiration », qui change de vue. Cette destination existe aussi en onglet et en bas de fiche. « Interactions » mène à « Responsabilités liées ». | Une même rangée de commandes produit des effets différents et utilise des noms différents. | Sommaire réservé aux sections de la fiche, noms identiques aux titres. Conserver une entrée stable vers les références dans les vues de l’élément. |
| P2 | Le sélecteur de parcours apparaît pour tous les scénarios ; 25 sur 26 n’ont qu’un parcours. | Un contrôle suggère un choix inexistant. | Un titre simple pour un parcours unique ; un choix explicite, avec le nombre d’alternatives, lorsqu’il y en a plusieurs. |
| P2 | Le catalogue affiche cinq cartes de flux avant la recherche et les résultats. Un flux détaille toutes ses étapes avant les scénarios associés. | L’accès aux scénarios est repoussé, surtout sur petit écran. | Recherche et nombre de résultats en tête ; flux accessibles comme classement. Sur une fiche de flux, montrer rapidement les scénarios associés puis les explications détaillées. |
| P2 | L’arbre métier occupe la même place dans la méthode, le glossaire et les scénarios. Les accès à ces espaces sont placés dans « Aide à la lecture ». | Des espaces de consultation importants paraissent secondaires ; l’arbre ne représente pas leur organisation. | Donner quatre entrées principales stables : Cartographie, Scénarios, Glossaires, Méthode. Garder l’arbre pour la cartographie et adapter la navigation locale à l’espace choisi. |
| P2 | La recherche globale indexe modèle, glossaire métier, scénarios et flux, mais pas les termes MOD ni les chapitres du guide. Le glossaire affiche des voisins ambigus : Capacité / Capacité métier, Function / Fonction, deux Domaine. | La même notion n’est pas retrouvée de façon homogène ; des doublons apparents demandent une interprétation. | Étendre la recherche aux notions et pages de méthode de la même publication. Présenter langue et origine comme attributs ; rapprocher les synonymes sans fusionner des concepts distincts sans décision métier. |
| P2 | « Identité et codes de lecture » est ajouté à toutes les pages de méthode ; la phrase sur les choix non enregistrés apparaît même hors exercice. | Des informations secondaires encombrent la lecture courante. | Ranger l’aide aux codes dans une rubrique dédiée, avec accès contextuel. Réserver les consignes d’exercice aux exercices. |
| P2 | Les explications des six principes passent par un exercice ou « Voir directement l’explication ». | Un utilisateur venu consulter une règle doit interagir pour lire. | Règle, explication et exemple visibles ; exercice facultatif dans un bloc « Tester ma compréhension ». |

P1 : gêne répétée ou compréhension du modèle actif. P2 : simplification de structure et confort de consultation. Aucun blocage d’accès général identifié dans cet échantillon.

## Structure cible proposée

Quatre espaces de navigation, avec des destinations explicites :

- **Cartographie** : arbre et carte pour se situer ; fiche pour comprendre ; relations pour explorer les dépendances ; références pour examiner les choix.
- **Scénarios** : recherche, classement par flux, filtres, puis situations et parcours.
- **Glossaires** : métier et méthode clairement distingués, avec recherche commune et indication de l’origine.
- **Méthode** : commencer, comprendre le métamodèle, contribuer, consulter les références.

« Pour commencer » doit répondre brièvement à trois questions pratiques : ce que je peux trouver, par où entrer selon mon besoin, comment lire une fiche. Le public visé reste utile, mais ne doit pas être le seul contenu d’accueil. Chaque notion employée fournit sa définition au survol ou au focus et un accès à sa page.

Une fiche de capacité peut suivre cet ordre : service rendu et définition ; exemple court ; périmètre et frontières ; comportements ; scénarios mobilisant la capacité ; responsabilités liées ; références. Pour les domaines et sous-domaines, l’accès aux éléments du périmètre doit apparaître tôt. Éviter de répéter la même phrase dans finalité, définition et introduction ; préserver leurs différences lorsqu’elles apportent une information.

Le graphe des relations reste utile pour l’exploration. Il ne doit pas être requis pour comprendre une dépendance : une liste lisible des partenaires et du sens des liens doit rester disponible. Les réglages avancés du graphe peuvent rester repliés, car ils sont secondaires dans la lecture initiale.

Les détails bibliographiques peuvent également rester repliés : ils regroupent des informations nombreuses et spécifiques. Leur intitulé doit annoncer le contenu, par exemple « Passages consultés et limites de la source ». La synthèse, le lien source et les limites nécessaires à l’interprétation restent visibles.

## Règles d’interaction proposées

- Aucun clic pour révéler une définition courte, une paire entrée/sortie ou une explication nécessaire à la lecture.
- Un repli doit annoncer un complément identifiable ; pas de « Approfondir » sans objet.
- Le clic sur un nom ouvre sa destination ; il ne sert pas d’abord à révéler un second lien portant la même intention.
- Un sélecteur n’apparaît que s’il existe plusieurs choix.
- Une navigation de consultation conserve le contexte d’origine et la publication.
- Une infobulle explique brièvement ; la page de définition approfondit. Sur mobile, prévoir un accès utilisable sans survol, à vérifier lors de la conception.
- Les rubriques et sommaires emploient les mêmes intitulés.

## Points à préserver et limites

La version publiée, les liens de partage figés et la séparation métier/méthode sont précieux. Préserver aussi l’arbre, la recherche par code, les scénarios indépendants de la hiérarchie et la distinction entre illustration et situation documentée.

Pas de débordement horizontal constaté sur les écrans de bureau inspectés ni sur le scénario mobile. Le scénario mobile est lisible mais très vertical ; supprimer les petits replis ne suffira pas sans compacter les répétitions. La totalité des écrans mobiles, le contraste, les lecteurs d’écran et tous les parcours clavier restent à tester : aucune conformité globale n’est affirmée.

## Plan de transformation

1. **Lecture directe** : supprimer les petits replis ; afficher les comportements et le sens des interactions ; retirer les sélecteurs sans alternative ; homogénéiser titres et sommaires. Vérifier un scénario, un flux et une capacité riche en relations.
2. **Navigation continue** : conserver filtres et retours contextuels ; relier les notions méthodologiques ; rechercher dans le guide ; écarter les notions retirées de la navigation courante. Vérifier catalogue filtré → scénario → capacité → retour, et fiche → notion → retour.
3. **Organisation des espaces** : rendre les quatre entrées principales visibles ; adapter la navigation locale ; réorganiser Pour commencer, les fiches et le catalogue ; déplacer exercices et codes vers leurs usages spécifiques. Vérifier premier accès, lecture approfondie et mobile.

Les changements de composants peuvent être livrés sans nouvelle release métier. Les textes et liens du guide figé nécessitent une nouvelle édition de guide associée à une publication : ne pas modifier les versions existantes. Les corrections du glossaire suivent également le parcours de publication adapté. Les lots peuvent être implémentés ensemble puis vérifiés avant un déploiement commun.

Critères de réception : zéro repli pour les courts contenus recensés ; notions citées dans Pour commencer liées ; aucun sélecteur à choix unique ; retour au même filtre et au même parcours ; notions retirées clairement signalées ; titres cohérents ; publication respectée ; contrôle bureau, mobile et clavier.

Cet audit propose une évolution de présentation et de navigation. Il ne modifie ni le modèle métier ni l’application.

## Application du plan

Les trois lots ont été implémentés après la demande « Applique le plan ».

- Lecture directe des courts compléments, comportements, conditions et entrées/sorties. Les exercices sont facultatifs ; les explications restent visibles. Les illustrations longues peuvent conserver un repli explicite.
- Interactions regroupées par partenaire, avec chaque relation et ses qualifications conservées. Replenishment conserve ses 18 relations visibles et ses trois comportements.
- Sommaire aligné sur l’ordre et les titres de la fiche ; accès au périmètre remonté ; références accessibles par leur onglet.
- Catalogue : recherche et filtres en tête, scénarios avant l’explication détaillée du flux, sélection de parcours uniquement en présence d’alternatives.
- Retours contextuels et conservation des filtres, du parcours et de la position. Le contexte est porté par les liens, sans catalogue de visites.
- Quatre espaces principaux ; arbre réservé à la cartographie ; navigation des rubriques et des flux dans leurs espaces. Navigation méthodologique sans duplication sur ordinateur, rubriques accessibles sur mobile.
- Recherche étendue au guide de la publication et à ses notions actives. Origine des termes affichée ; aucune fusion sémantique automatique. Notions retirées signalées sur accès direct et écartées des notions associées courantes.
- Nouvelle édition de guide préparée dans `modeles/backlog/atlas-methodology-ux.yaml` : accueil orienté usage, liens explicites vers les notions, notes de maintenance conservées séparément.

Contrôles réalisés : 124 tests frontend réussis ; quatre tests du contrat des chapitres et 18 tests historiques du guide exécutés (un test historique ignoré par sa condition existante) ; validation du référentiel sans erreur ; build ; recette navigateur standard et recette du catalogue. La recette UX dédiée couvre les retours après rechargement, les filtres et la position, l’intégrité des relations, les infobulles au clavier, les notions actives, quatre vues mobiles et le confinement du focus dans le menu mobile. Les captures de recette sont sous `app/.runtime/qa-ux/`.

Le build local comprend la nouvelle interface. Le nouveau contenu du guide a été testé par injection dans une fixture isolée, sans repli backlog dans Atlas. Les publications figées n’ont pas été modifiées. Activer cette édition de guide exige une nouvelle publication avec `--guide modeles/backlog/atlas-methodology-ux.yaml` ; commit, push et déploiement restent distincts. Aucun de ces actes de publication n’a été exécuté dans ce lot UX.
