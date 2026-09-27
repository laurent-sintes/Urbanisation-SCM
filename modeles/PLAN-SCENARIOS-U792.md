# Transformation des scénarios et des flux de valeur — U792

Date : 27 septembre 2026. Statut : les six lots autorisés sous U793 sont réalisés ; publication `2026-09-27.2` activée et vérifiée dans Atlas. Le catalogue contient 5 flux de valeur, 26 scénarios et 27 parcours ; 23 illustrations restent dans les fiches. La publication précédente est sauvegardée par le commit local `db8aba5`, explicitement autorisé ; aucun push. Les changements d’implémentation et la nouvelle publication restent non committés. La publication ne vaut pas approbation métier des nouveaux contenus proposés.

Recette : 122 tests frontend et 48 tests Python ciblés réussis, build Atlas réussi, navigation et affichage mobile vérifiés ; aucune erreur de validation à la publication. Les constats ci-dessous conservent l’état de départ de l’audit U792.

## Périmètre et méthode de l’audit

Lecture ciblée du backlog et du snapshot courant résolu par index → descripteur → snapshot (`2026-09-27.1`), comptage par `scripts/business_scenarios.py`, examen du schéma, des validateurs, de la préparation/publication et du frontend. Inspection détaillée de deux récits composites. Cet audit ne constitue pas une revue métier ligne à ligne des 49 exemples, ni une étude des processus installés. Les références méthodologiques restent celles effectivement consultées dans [l’analyse U791](../marche/scenarios-classement-U791.md) ; aucune nouvelle étude marché opérationnelle n’est nécessaire pour ce diagnostic technique et éditorial.

## Constats

| Élément observé | Résultat | Conséquence |
| --- | --- | --- |
| Exemples structurés dans `fields.examples` | 49, répartis dans 17 fiches ; mêmes compteurs backlog et publication courante | Le catalogue ne part pas de zéro, mais tous les exemples ne sont pas des scénarios autonomes. |
| Exemples dotés d’un identifiant | 30 ; aucun doublon global actuellement | Identités existantes réutilisables après qualification, sans déduire que tout objet identifié doit être migré. |
| Récits avec étapes et mapping | 26 récits, 80 étapes ; 23 sous Supply Chain Orchestration et 3 sous des capacités | Le stockage dépend encore d’un propriétaire de la cartographie ; le scénario et son parcours sont fusionnés. |
| Illustrations restantes | 23 sans étapes, dont 4 identifiées et 19 sans identifiant | Conserver les illustrations pédagogiques utiles ; examiner les quatre exemples partagés, sans conversion automatique. |
| Références partagées | 4 entrées `scenario_refs` | La clé actuelle associe fiche propriétaire et identifiant local ; prévoir une table de migration. |
| Couverture par les références explicites | 74 capacités citées sur 74 | Indicateur de présence uniquement : ne démontre ni chaîne complète, ni couverture nominale/exceptions, ni réalisation installée. |
| Champs structurés renseignés parmi les 49 | Déclencheur : 1 ; objectif : 5 ; contraintes : 1 ; options : 5 ; points de contrôle : 26 | Des éléments existent peut-être dans le récit ; les extraire et les qualifier, sans inventer les manquants. |
| Provenance et qualification | `source_refs` présent sur les 49 exemples ; aucun champ `review` propre aux exemples | Préserver provenance et accords existants ; vérifier leur portée champ par champ avant toute qualification autonome. Absence de champ local ne signifie pas absence d’accord historique. |

### Modèle et méthode

- MOD027/MOD028 et le principe des scénarios intègrent désormais U791/U792. Les flux de valeur, leurs étapes et leurs relations au scénario n’ont pas encore de contrat métier complet.
- MOD026 est conservé comme entrée historique avec une note de retrait. Il manque une gestion explicite du retrait dans la future édition du guide : ne pas le présenter comme concept actif, préserver les liens historiques.
- `modeles/backlog/atlas-methodology-U788.yaml` et le guide publié contiennent encore la distinction cas d’usage/scénario. Le guide publié doit rester figé ; préparer une nouvelle édition cohérente, pas corriger l’historique.
- Aucun catalogue autonome de scénarios ou de flux n’est présent. Les principes adoptés décrivent une cible, pas une migration déjà accomplie.

### Contrats et publication

- `urbanism.schema.json` ferme les propriétés racines : ajouter explicitement le catalogue optionnel et ses contrats.
- `scripts/business_scenarios.py` impose un propriétaire Domain/Subdomain/Capability aux scénarios identifiés. Les contributions globales peuvent cibler ces niveaux ; les contributions des étapes ciblent des capacités. Séparer à l’avenir mobilisation et simple pertinence contextuelle.
- La liste ordonnée actuelle des étapes n’exprime pas explicitement les dépendances, répétitions ou branches parallèles. Ne pas transformer automatiquement la contiguïté de deux étapes en dépendance métier.
- `scripts/element_versions.py` gère nodes, relations, principles, glossaire et catalogue d’informations ; `prepare_release.py` possède des différences spécifiques à ces collections. Étendre révisions, empreintes, différences, notes de publication et contrôle de livraison au nouveau catalogue.
- `record_decision.py` cible nodes/relations : prévoir une qualification des nouveaux objets/champs, sans faire hériter l’accord d’une fiche propriétaire. Le registre méthodologique conserve les accords de méthode, pas les accords sur tous les contenus.
- `export_atlas.py` exporte les publications vérifiées avec leur guide associé : conserver cette architecture statique, sans API ni accès au backlog. Vérifier toute la chaîne d’export, pas seulement la présence de la collection dans le YAML.

### Contenus à reprendre

- `pickup-or-direct-shipment` réunit un retrait non honoré et une livraison directe partielle, pour deux clients : candidat à une séparation en deux scénarios, à confirmer par l’objectif et le déclencheur.
- `supplier-return-outcomes` répartit un même lot entre avoir, remplacement et réparation : peut rester un scénario composite avec branches ; ne pas découper automatiquement chaque issue en scénario.
- Les 26 récits sont des candidats initiaux, pas une cible imposée de 26 scénarios. Le nombre final dépendra des frontières retenues et des regroupements justifiés.
- Les parties hors Supply Chain Orchestration doivent être décrites comme limites ou contributions externes quand elles ne sont pas modélisées, sans fabriquer des capacités opérationnelles pour compléter une histoire.

### Atlas

- `examples.ts` résout les scénarios par leur fiche d’origine et calcule des liens inverses ; adapter cette logique à des identités autonomes dans le même snapshot.
- `BusinessExamples.tsx` présente tout sous « Scénarios métier », y compris les illustrations. Il affiche une fiche d’origine, un déroulement unique en liste et un lien méthodologique MOD026 : distinguer illustrations locales et scénarios liés.
- La recherche indexe les récits dans les fiches : ajouter des résultats de type scénario/flux, uniques et directement accessibles.
- Ajouter routes, liens directs, filtres, sélection de parcours et retours de navigation ; maintenir le contexte de publication. Les anciens liens vers les exemples de fiches doivent rester utilisables.

## Cible proposée pour l’implémentation

Un `scenario_catalog` canonique dans `modeles/backlog/model.yaml`, repris et figé dans chaque nouvelle publication. Ce choix technique est proposé, il ne crée pas un catalogue YAML concurrent.

| Objet ou lien | Contenu minimal proposé |
| --- | --- |
| Flux de valeur | Identité stable, nom anglais, description française, bénéficiaire, valeur attendue, déclencheur, frontières et étapes de valeur. |
| Étape de valeur | Identité stable dans le flux, résultat de valeur, critères d’entrée/sortie ; ne pas la confondre avec une étape de parcours. |
| Scénario | Identité stable, situation, déclencheur, résultat recherché, conditions, nature illustrative/documentée et sources. |
| Parcours | Identité stable, scénario concerné, réponse examinée, conditions et résultat attendu ; plusieurs parcours possibles. |
| Étape du parcours | Identité, contribution au résultat, informations/conditions nécessaires, résultat intermédiaire, capacités mobilisées et contribution de chacune. |
| Relations | Scénario ↔ flux : plusieurs-à-plusieurs ; parcours → scénario ; dépendances explicites entre étapes ; contributions → capacités existantes. Mapping aux étapes de valeur lorsqu’il est utile et documenté. |
| Classement | Événement, objet métier, nominal/exception/reprise ; filtres capacités/domaines dérivés des contributions et de la hiérarchie du même snapshot. Référentiels de filtres contrôlés, pas de saisies libres divergentes. |

Les statuts de revue, réserves et accords restent internes. L’indication « illustration » ou « situation documentée » est une information de lecture distincte. Les concepts méthodologiques restent dans le glossaire méthodologique ; les éventuels termes métier nouveaux sont traités dans le glossaire métier.

## Plan de réalisation et critères de sortie

| Lot | Travail | Critère de sortie et dépendances |
| --- | --- | --- |
| 1 — Contrat et qualification | Définir flux/étapes/liens, identités, champs, sources, qualifications et retrait de MOD026 ; spécifier les filtres et l’interface avec les accords. | Métamodèle et schéma cohérents ; aucune hypothèse de flux ou de contenu devenue accord implicite. Préalable aux autres lots. |
| 2 — Inventaire éditorial et pilote | Qualifier chacun des 49 exemples : illustration conservée, scénario à migrer, fusion/séparation proposée ; formaliser un petit ensemble de flux candidats. Pilote proposé : stock partiel B2B, réception partielle et retour fournisseur à issues multiples. | Matrice source → cible complète, aucune perte de provenance ; pilote démontrant un scénario lié à plusieurs flux et plusieurs réponses sans duplication. Dépend du lot 1. |
| 3 — Chaîne de données | Implémenter catalogue, validateurs, qualification, révisions/différences/empreintes, export et migration reproductible. Préserver la lecture ancienne. | Migration rejouable sans doublon, références intègres, tous les retraits explicités, accords non étendus. Dépend du contrat ; les contenus peuvent se préparer parallèlement. |
| 4 — Atlas sur le pilote | Entrée Scénarios métier, regroupement par flux, filtres, fiches flux/scénario, parcours et contributions, recherche dédiée, liens vers capacités et retour. Actualiser le guide candidat. | Parcours de lecture complet, utilisable au clavier et sur mobile ; publication sélectionnée respectée ; aucun repli backlog ; ancienne publication toujours lisible. Dépend du lot 3 et du pilote. |
| 5 — Migration et revue du corpus | Étendre la qualification et la migration à tous les exemples retenus ; compléter déclencheurs/objectifs, justifier branches et dépendances ; harmoniser liens et méthode. | Chacun des 49 exemples a un devenir documenté ; chaque scénario du catalogue est classé au moins une fois ; lacunes explicites et accords limités aux champs effectivement validés. |
| 6 — Recette et publication | Tests contrats/migration/export/navigation, validation du modèle, build Atlas, vérification des liens historiques et de la nouvelle édition méthodologique. Préparer puis activer une release selon la demande correspondante. | Publication autonome et cohérente, empreintes vérifiées, ancienne version intacte, contrôles de livraison satisfaits. Commit, push et déploiement restent des opérations distinctes. |

Ordre recommandé : 1 → pilote 2 → 3 → 4 → généralisation 5 → 6. Le pilote teste le contrat avant la réécriture du corpus. La réalisation des contrats et la préparation éditoriale peuvent progresser ensemble après le lot 1 ; leur capture d’accord et publication s’effectuent sur un état final figé.

## Recette et risques à maîtriser

- Un identifiant ou une relation absent doit être détecté ; une répétition d’une capacité dans plusieurs étapes est légitime. Une boucle explicitement définie n’est pas rejetée comme anomalie par principe.
- Vérifier les références de capacités exclues d’une publication, les liens entre versions, les anciens couples propriétaire/scénario et les ancres de fiches.
- Distinguer scénario non étudié, contribution non documentée et trou métier confirmé. Ne pas afficher « 100 % couvert » à partir des 74 capacités citées.
- Un scénario multiplement classé n’apparaît qu’une fois dans une recherche ; le comptage global utilise ses identités uniques.
- Une publication sans catalogue n’est jamais complétée avec le nouveau backlog ; elle conserve son mode de lecture historique.
- Un flux est une création de valeur de bout en bout, pas un sous-domaine renommé. Le principal risque métier est de reconstruire la même hiérarchie sous un nouveau vocabulaire.
- L’effort principal porte sur la qualification éditoriale et l’intégration aux contrats de publication, davantage que sur le déplacement des récits. Chiffrer le reste après le pilote, sans promettre maintenant un nombre de flux ou de scénarios.

## Références internes

- [Modèle canonique](backlog/model.yaml), [glossaire méthodologique](backlog/modeling-glossary.yaml), [schéma](schemas/urbanism.schema.json).
- [Validation et mesure des scénarios](../scripts/business_scenarios.py), [versions](../scripts/element_versions.py), [préparation](../scripts/prepare_release.py), [export Atlas](../scripts/export_atlas.py).
- [Résolution des exemples](../app/src/examples.ts), [présentation](../app/src/components/BusinessExamples.tsx), [navigation](../app/src/navigation.ts), [recherche](../app/src/search.ts).

L’audit initial U792 était une analyse statique ciblée. Sa mise en œuvre sous U793 a ensuite inclus la recette visuelle et la publication indiquées en tête de ce document.
