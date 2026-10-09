# Modèles structurés

La nouvelle édition de la méthode de transformation est préparée dans
[`backlog/atlas-transformation-methodology.yaml`](backlog/atlas-transformation-methodology.yaml)
(U825, édition `2026-09-28.2`). Elle sépare cinq rubriques de travail, le métamodèle,
les conventions de cartographie et les références ; ses notions complémentaires
figurent dans le glossaire méthodologique canonique. Ses deux schémas sont décrits
dans l’édition elle-même, sans ressource mutable partagée entre publications.
Elle est publiée avec le modèle `2026-09-28.3` (v041). Les éditions suivantes restent
associées explicitement par `--guide modeles/backlog/atlas-transformation-methodology.yaml`.
Dans Atlas, les éditions qui portent un groupe explicite de notions de transformation sont exposées sous deux documents distincts : le métamodèle est intégré à l’en-tête du modèle exporté avec son glossaire, et la transformation est exportée dans `guide.json` avec le sien. La répartition est faite depuis l’édition figée associée à la publication, jamais depuis le brouillon courant. La source de travail et le format historique des guides figés restent combinés à ce stade ; la séparation concerne les documents consultables et téléchargeables dans Atlas.
L’export Atlas place les règles et définitions dans `metamodel`, et les nombres ainsi que les couples de liens observés dans `metamodel.profile`. Le schéma embarqué reste un contrat général ; le profil indique les types réellement présents dans l’édition consultée.
`node app/verify-transformation-method.mjs` vérifie le candidat dans le frontend
compilé, sur une fixture isolée, et produit un aperçu HTML et les SVG sous
`app/.runtime/qa-transformation-method/`. Aucun serveur ni publication n’est modifié.

### Une seule source de travail par information

Les entrées du glossaire métier peuvent porter `alias_of` vers une entrée canonique de la même publication. Les alias restent accessibles par les anciens liens et par la recherche, sans doubler la liste. `presentation: historical` conserve une définition hors de la liste courante ; `presentation: method` avec `guide_section: method` déplace les conseils de rédaction vers la méthode. Les cibles absentes, cycles et alias vers des entrées masquées bloquent la validation. Aucun repli vers le backlog ou une autre publication. `as_of` désigne la date du dernier lot éditorial du brouillon ; les dates des snapshots sont conservées.

Une déclaration de livraison peut exiger `required_glossary`, avec `id` et `field_sha256`, pour contrôler la présence et le contenu des définitions, contextes et renvois dans le candidat. Ce contrôle ne confère aucun accord métier. `node app/verify-glossary-audit.mjs` vérifie les routes du candidat en mémoire, les anciens liens, la recherche et l’isolation historique. Les liens `guide:references#method-section-N` renvoient aux notices de l’édition méthodologique associée.

`backlog/atlas-transformation-methodology.yaml` est la seule source de travail du guide. Les noms, libellés, définitions et descriptions courtes des notions sont référencés par identifiant dans `backlog/modeling-glossary.yaml`, via `glossary.canonical_source` et `canonical_fields`. Les notes pédagogiques propres au guide restent dans le guide. Un champ référencé ne peut pas être redéfini localement.

`scripts.guide_candidate.load_draft(root, source)` assemble le candidat pour les aperçus et contrôles. La préparation avec `--guide` matérialise un guide complet et fige les empreintes du brouillon, du glossaire canonique et, lorsque le guide déclare `model_examples`, du modèle dont ces exemples vérifient les noms, types et parents ; leur modification bloque l’activation. Atlas lit uniquement les éditions publiées, autonomes et immuables. Ne pas lire le brouillon brut comme une édition publiable.

Les six anciennes copies de travail identiques à une édition publiée ont quitté le backlog. Tests et références actives utilisent `modeling-guides/versions/` ; les anciens chemins restent récupérables au commit exact dans `git-history.json`. Les documents historiques ne deviennent pas des sources courantes. Les vues Markdown du modèle sont désormais [générées localement](../restitutions/README.md), sans double maintenance dans Git.

Pour choisir le niveau de lecture et comprendre qui utilise ou maintient le modèle, consulter les [publics et usages du modèle et du métamodèle](../CONVENTIONS-MODELE.md#publics-et-usages-du-modèle-et-du-métamodèle). La méthode s’adresse aux profils métier comme SI ; le métamodèle porte les règles communes de construction et de lecture.

**Backlog U915 — Enterprise Architecture et systèmes métier.** Enterprise Architecture → Business System → Domain → Subdomain → Business Area → Capability → Behavior. Enterprise Architecture représente le SI Beaumanoir cible ; elle est la racine des trois systèmes métier et dispose d’une fiche. Business Operations comprend Sales, Sourcing and Procurement, Supply Chain Orchestration et Logistics. Le détail des capacités et comportements reste concentré sur l’orchestration ; les systèmes périphériques sont des vues de contexte. [Portée U780](backlog/business-systems-U780.yaml). `business_system` et ses relations `presents` sont contrôlés par `PRINCIPLE-BUSINESS-SYSTEM` ; `modeling_depth` distingue profondeur de description, accord et réalisation. Les déclarations `publication_delivery.required_nodes` peuvent préciser `kind`, `parent` et `parent_type` (`contains` par défaut, `presents` pour les domaines). Ce changement n’est visible dans Atlas qu’après une release demandée ; les publications historiques restent figées.

Les intentions d’accord non encore publiées peuvent être suspendues explicitement dans `decision-intents.yaml`, sans modifier leur capture historique : `suspensions` précise l’identifiant, le responsable et la date du réexamen, ses sources et sa justification. Une suspension ne crée aucun accord. Les intentions déjà publiées relèvent toujours du parcours de réexamen des décisions ; une suspension figée ne peut pas être effacée ou réécrite.

**Publication courante :** [index](release/index.json) et [restitution générée](../restitutions/README.md). Le [parcours regroupé](#parcours-de-release-regroupé--u504) évite de recopier les compteurs et de refaire les contrôles manuellement.

**Publication U502 : v017 / `2026-09-19.10`.** Service Requests et Backing Services, demande d’optimisation du carnet et six comportements, indicateurs Frontoffice/Backoffice. 48 capacités, 82 comportements, 348 relations et 110 termes métier. Guide méthodologique `.4` associé ; Périmètre lisible sans dépliage. Accords repris dans leur portée, détails éditoriaux proposés. Atlas vérifié, zéro erreur. [Rapport](../audits/2026-09-19-release-U502/rapport.md).

**Publication U484 : v016 / `2026-09-19.9`.** La fiche métier Authoritative Data est complétée : finalité, définition, périmètre et limites, autorité sur les informations et exemple de conditionnement produit. Elle porte explicitement la source de vérité locale Supply en articulation avec les maîtres externes. Un seul nœud modifié ; autres fiches, relations, glossaire, inspirations et guide .3 conservés. Accord sur le nom repris après réexamen, ajouts éditoriaux proposés. Correction vérifiée dans Atlas. [Rapport](../audits/2026-09-19-authoritative-data-U484/rapport.md) ; [note figée](release/2026-09-19.9/release-notes.md).

**Publication U483 : v015 / `2026-09-19.8`.** Les Sources d’inspiration couvrent les 247 fiches visibles : 137 objets du modèle et 110 termes du glossaire métier. La release intègre Authoritative Data et les niveaux Domain → Area → Capability → Behavior adoptés U482, avec le guide méthodologique `2026-09-19.3`. Les 47 capacités, 76 comportements et 338 relations sont conservés ; une qualification de relation est reformulée à sens constant. 123 accords repris automatiquement, 120 après réexamen explicite de portée et deux décisions limitées aux changements adoptés. Les nouvelles inspirations restent proposées. Atlas vérifié sur le snapshot publié ; publications antérieures préservées. [Rapport](../audits/2026-09-19-release-U483/rapport.md) ; [note figée](release/2026-09-19.8/release-notes.md).

**Noms et niveaux U482, complétés au backlog par U507.** La hiérarchie courante est **Domain → Area → Capability → Behavior** : Supply Chain Orchestration occupe le niveau Domain, auparavant Universe. Aux six Areas opérationnelles s’ajoute désormais **Authoritative Data**, renommé en U482 et adopté comme Area en U507. Ses sept référentiels distincts, dont Assortment ajouté en U509, portent la source de vérité locale (U479), en articulation avec les sources de vérité d’entreprise externes ; chacun contient son ingestion et sa Visibility. Les liens `Area presents Reference` organisent leur présentation sans créer un niveau supplémentaire d’Area. Les identifiants et rattachements existants sont conservés. [Niveaux et inspirations](backlog/model-level-naming-U481.yaml) ; [nom et autorité locale](backlog/authoritative-data-review-U478.yaml) ; [accord U507](backlog/party-reference-review-U505.yaml). Les publications antérieures gardent leurs noms, types et contrats historiques ; Les changements U507/U509 restent au backlog jusqu’à une release demandée.

**Publication U476 : v014 / `2026-09-19.7`.** La rubrique Sources d’inspiration de Supply Chain Orchestration est publiée au format C retenu en U475 : choix en tête, cinq références comparées, synthèse et exemple Oracle des 75 pièces livrables sur 100 attendues. Une seule fiche modifiée ; autres nœuds, relations et glossaire conservés. Accord sur le nom repris après réexamen ; nouvelle décision limitée à `market_inspiration`, comparaisons détaillées toujours proposées. [Note figée](release/2026-09-19.7/release-notes.md) ; [rapport de préparation](release/2026-09-19.7/changes.json).

**Publication U473 : v013 / `2026-09-19.6`.** Retours de revue U470–U472 publiés : univers Supply expliqué concrètement, périmètre d’orchestration et projections externes explicités, 47 fiches enrichies en références marché, Business Services retiré. Les 47 capacités, 76 comportements et 338 relations sont conservés. Le catalogue d’informations reste préservé en interne et masqué dans Atlas ; son extension reste en attente. Bandeau fixe et barre haute compacte disponibles. [Rapport](../audits/2026-09-19-release-U473/rapport.md) ; [note figée](release/2026-09-19.6/release-notes.md).

**Retrait U472 publié dans v013 :** Business Services est retiré, ainsi que son terme TER067 ; Supply Chain Orchestration reste le seul univers instancié. Aucun domaine, capacité ou lien n’était rattaché à cet univers vide. Le commerce est différé après la Supply Chain. V012 et son historique restent inchangés. [Rapport du retrait](../audits/2026-09-19-business-services-U472/rapport.md).

## Informations métier — contrat U468

Le catalogue courant réside dans [`backlog/model.yaml`](backlog/model.yaml), propriété `information_catalog` : 14 informations issues des cinq pilotes, 21 usages explicites par les capacités et 15 liens qualifiés. L’annexe [`information-cards-U465.yaml`](backlog/information-cards-U465.yaml) conserve le pilote et ses preuves ; elle n’est plus la source du catalogue courant.

Chaque information décrit une question métier, une définition, un contexte, les éléments essentiels à son sens, une justification de maille, des limites, des exemples et des références marché. Ce contrat organise une cartographie conceptuelle, sans définir de tables, d’API ni de schéma logiciel implémentable. Les rôles rattachent les informations à des capacités existantes ; les liens entre informations expriment un sens, une condition et un effet. Ils ne créent aucun niveau dans l’arbre ni aucun flux technique implicite.

La collection est facultative pour préserver les anciennes publications. Le schéma et les contrôles interdisent les identités dupliquées, les capacités absentes ou exclues et les liens orphelins. La préparation fige le catalogue dans le snapshot, lui attribue des révisions et empreintes, puis publie exactement ce contenu. Les différences et notes de publication recensent les ajouts, modifications et retraits. Une publication ancienne sans catalogue reste sans catalogue ; Atlas ne consulte pas l’annexe pilote.

Les fiches et liens conservent leurs qualifications internes proposées ; U466 porte uniquement sur la distinction et la coexistence proposition/engagement. Ce premier contrat n’ajoute pas de circuit d’adoption implicite des fiches. Autorités locales, versions, confirmations et règles de libération ne sont pas déduites des exemples.

L’intégration U468 est publiée dans **v012** par U469 ; v011 reste inchangée. Le catalogue est conservé sans enrichissement dans v013, avec sa consultation masquée dans Atlas à la demande U470. [Rapport d’implémentation et recette isolée](../audits/2026-09-19-informations-atlas-U468/rapport.md).

## Publications et jalons antérieurs

**Publication U467 : v011 / `2026-09-19.4`.** Retrait des couches métier, définition Supply corrigée, exemples et choix marché enrichis, glossaire métier de 111 termes. L’édition méthodologique `2026-09-19.2` est explicitement associée à v011 : six repères et Information (MOD012), avec l’exemple proposition/engagement U466. Les quatorze fiches pilotes U465 sont figées comme contexte, sans devenir des nœuds consultables. Les 47 capacités et 76 comportements, leurs parents et les accords à valeurs inchangées sont conservés. [Note figée](release/2026-09-19.4/release-notes.md) ; [rapport et contrôles](../audits/2026-09-19-release-U467/rapport.md). L’index désigne la publication courante ; les paragraphes suivants conservent leur contexte historique.

**Publication U452 : v010 / `2026-09-19.3`.** Les 47 capacités et 76 comportements sont typés dans Atlas. Les dix compléments U449 et les 76 formes U451 sont publiés, avec leurs qualifications proposées conservées. L’édition méthodologique `2026-09-19.1` reste accessible par une association explicite à v010 : six repères et deux glossaires distincts. Noms, définitions, rattachements et anciens snapshots préservés. [Note de release](release/2026-09-19.3/release-notes.md) ; [rapport et vérifications](../audits/2026-09-19-release-U452/rapport.md). L’index reste l’autorité de la publication courante ; les mentions de versions antérieures ci-dessous sont historiques.

**Typage U449 :** 37 valeurs préservées, dix compléments proposés. Icônes par type et décisions en fin de liste, avec séparation visuelle dans Atlas. L’interface utilise les types de la publication sélectionnée, avec une icône spécifique pour les capacités contenues par les référentiels. [Grille](backlog/capability-types-U449.yaml) ; [rapport initial](../audits/2026-09-19-capability-types-U449/rapport.md).

**D03/D15 — U438–U446 :** Fulfillment Optimization et Order Promising sont deux domaines frères sous Supply. Structuring et Archiving sont dans D04 ; Fulfillment Commitment remplace Promise Management (U445). Grouping et Merging sont intégrés comme comportements proposés. [Rapport des modifications](../audits/2026-09-19-d03-U437/modifications.md) ; [portée de l’accord de structure](backlog/d03-domain-review-U437.yaml), [Structuring](backlog/order-structuring-review-U439.yaml) et [engagement / affectation](backlog/promise-assignment-review-U441.yaml).

**Lecture U447 :** référentiels, Order Management, Inventory Management, Process Management, Order Promising, Fulfillment Optimization, Inventory Optimization. [Ordre de présentation](backlog/reading-order-U447.yaml) ; aucune nouvelle hiérarchie.

**Backlog U290 refondu** : Promise Management, mécanismes Protection, trois comportements Planning et convention Supply Assignment à valeur multidimensionnelle. Voir le [bilan de migration](../audits/2026-09-17-refonte-appliquee/rapport.md) et le [registre des identités et questions ouvertes](backlog/refactoring-implementation.yaml). Les publications restent inchangées ; les paragraphes datés ci-dessous conservent leur contexte historique.

## Deux glossaires distincts — U232

- **Glossaire métier** : [backlog/glossary.yaml](backlog/glossary.yaml), vocabulaire des domaines métier, figé dans les publications selon le workflow existant.
- **Glossaire de modélisation** : [backlog/modeling-glossary.yaml](backlog/modeling-glossary.yaml), notions transversales en support à la définition des objets du modèle : Decision, Planning, Management, application transactionnelle. Identifiants MOD distincts ; les portées utilisateur et les formulations proposées sont conservées.

Le second registre est documentaire et séparé : il ne complète pas implicitement le glossaire métier publié ou son résolveur lexical. Les discussions antérieures restent des sources ; les sens courants de ces quatre notions font autorité dans modeling-glossary.yaml. La séparation U232 porte sur les notions discutées U229–U231, sans reclassification globale des notions et verbes historiques.

**Publication U448 : v009 / `2026-09-19.2`.** L’index désigne `urbanisation-v009-2026-09-19-013037.yaml`, puis `2026-09-19.2/model.yaml` : 138 nœuds, six domaines frères, 47 capacités, 76 comportements, 338 relations et 110 termes de glossaire. Référentiels présentés en premier, Order Promising et Fulfillment Optimization séparés, Fulfillment Commitment nommé selon U445 ; Grouping et Merging restent proposés. Accords transcrits à portée constante, anciennes publications préservées et disponibilité Atlas vérifiée. [Note de release](release/2026-09-19.2/release-notes.md) ; [revue des preuves et impacts](../audits/2026-09-19-release-U448/revue.md). L’index reste l’autorité de publication courante ; les mentions de versions courantes ci-dessous sont historiques.

## Format courant — U200/U202

Le backlog vivant et les nouvelles publications du modèle métier sont en **YAML**. L’entrée de travail est `backlog/model.yaml` ; ses annexes courantes sont aussi en YAML. Les captures `legacy-capabilities.json`, `panorama-candidates.json`, `backlog/history/`, les panoramas et les preuves historiques restent dans leur format d’origine. Ne pas créer de copie JSON éditable concurrente.

La prochaine publication produira `<publication>/model.yaml`, un descripteur `urbanisation-vNNN-YYYY-MM-DD-HHMMSS.yaml` et une entrée figée `revisions/<publication>/backlog.yaml`. `index.json`, `manifest.json`, décisions, preuves et rapports restent des métadonnées techniques JSON. Les anciennes releases JSON et leurs empreintes ne sont jamais réécrites. La release active v003 demeure celle publiée avant cette migration.

L’exporteur `scripts/export_atlas.py` charge les publications YAML/JSON avec `scripts/structured_io.py` et vérifie leurs empreintes, puis génère les JSON statiques d’Atlas. Ces sorties ignorées par Git sont des artefacts de lecture, sans autorité concurrente. La release activée actualise les données locales ; le build les régénère pour GitHub Pages. Les valeurs métier et leurs empreintes canoniques ne dépendent pas de la mise en forme YAML ; l’empreinte du fichier publié reste calculée sur ses octets exacts.

Installer la dépendance locale avec `python -m pip install --target .tools/yaml-runtime -r requirements.txt`. Les dates, identifiants et mots comme `on` restent des chaînes ; seules les valeurs booléennes `true`/`false`, nombres JSON et `null` sont typées implicitement. Les clés dupliquées, alias, objets Python et valeurs hors du contrat JSON sont refusés. Un champ multiligne peut utiliser `|` ; `|-` évite d’ajouter une fin de ligne à sa valeur. Les textes balisés du glossaire restent une proposition de syntaxe distincte du présent refactoring.

[Audit sémantique, corrections et preuves de conversion](../audits/2026-09-14-glossaire-yaml/audit.md). Les descriptions initiales ci-dessous restent historiques pour les formats et versions qu’elles citent.


**Fonctionnement courant U117–U123 :** [index.json](release/index.json) désigne un descripteur `urbanisation-vNNN-YYYY-MM-DD-HHMMSS.json`, qui porte version, horodatages UTC, chemin et empreinte du modèle et de sa note de release. Chaque élément et le modèle global ont une révision entière automatique et `last_modified`. Atlas consulte uniquement ces publications, avec sélection des versions ; le backlog reste l’espace de construction. Les descriptions du refactoring initial ci-dessous sont historiques lorsqu’elles mentionnent `current.json`.

État au 13 septembre 2026, après U106–U111. Les fichiers JSON portent le modèle ; les Markdown conservent les récits, les analyses, les décisions argumentées et les restitutions. La règle complète de maintenance est dans [AGENTS.md](../AGENTS.md).

## Trois espaces

| Espace | Rôle | Entrée faisant autorité |
| --- | --- | --- |
| `backlog` | Modèle en réflexion, alternatives, illustrations et points à instruire | [backlog/model.yaml](backlog/model.yaml) |
| `release` | Dernière version publiée, avec le statut de validation de chaque élément | [release/index.json](release/index.json) |
| `panorama-as-is` | Connaissance de l’existant des trois SI ; distincte de la cible | [panorama-as-is/current.json](panorama-as-is/current.json) |

**Publication et validation sont distinctes.** Conformément à U111, la [release 2026-09-13.2](release/2026-09-13.2/model.json) contient les **36 capacités**, dont **9 validées**, **8 portant des validations partielles** et **19 sans validation individuelle enregistrée**. Parmi les 27 dernières, 12 sont en réexamen, dont Reservation qui conserve un nom adopté. Les statuts affichés sont 9 validées, 7 partiellement validées, 8 non validées et 12 en réexamen. Les validations partielles portent parfois sur le nom seul ou sur le principe d’ingestion. Elles ne valident pas automatiquement la définition, la finalité ou le rattachement.

La première extraction restreinte, `2026-09-13.1`, est conservée comme historique. Elle n’est plus désignée par `current.json`. Le backlog et la release peuvent contenir les mêmes identifiants : ce sont des états de travail et de publication du même modèle, pas deux catalogues à enrichir séparément.

**Évolution U116 :** le backlog `2026-09-13.3` utilise les cinq capacités D01 de P82 et contient 35 capacités au total. Inventory Tracking (`D01.e`) regroupe D01.a/D01.b ; Inventory Visibility conserve D01.c à la révision 2. Les autres domaines sont inchangés. La release `.2` reste à 36 capacités jusqu’à une nouvelle publication demandée. Les repères historiques ne sont pas réutilisés. Voir [l’audit Atlas D01](../audits/2026-09-13-atlas-d01.md).

## Organisation physique

Le backlog YAML, ses glossaires et les connaissances marché restent les sources courantes. `release/index.json` désigne la publication active et conserve le catalogue des versions. Seule la version courante garde ses fichiers complets dans l’arbre : modèle publié, snapshot source, décisions et provenance. `git-history.json` associe les chemins historiques retirés à des commits exacts ; le lecteur restitue leurs octets à la demande sans les recopier dans le projet.

`backlog/decision-intents.yaml` ne contient que les accords en attente. Les accords appliqués sont dans `decisions/VERSION.json`. Les états précédents de ces données sont conservés dans Git. `panorama-as-is/current.json` reste l’autorité de l’existant ; ses périmètres SI et son contexte partagé sont inchangés.

## Structure du modèle

Le graphe courant distingue `domain`, `area`, `reference`, `group`, `capability`, `behavior`, `object`, `document` et `event`. U482 place Supply Chain Orchestration au niveau `domain` et ses six périmètres opérationnels au niveau `area` ; les anciens snapshots restent interprétés selon leurs propres types et niveaux. **U455 retire l’axe métier transactionnel/processus** : Domains et Areas coopèrent par des responsabilités et interactions explicites. U458 retire `layer` du backlog courant. Le principe `PRINCIPLE-DOMAIN-INTERACTIONS` interdit sa réintroduction ; les anciens snapshots conservent leurs champs et leur contrôle historique. Le lecteur ne s’en sert plus pour déduire une frontière métier. `space` porte le cycle de publication. Ancien principe, nouveaux principes et impacts : [domain-interactions-U455-U456.yaml](backlog/domain-interactions-U455-U456.yaml).

**U456 : Atlas reste strictement métier.** Structures d’information métier, autorités, documents et faits y ont leur place ; catalogues d’applications/produits logiciels, contrats techniques et liens vers les réalisations restent hors d’Atlas. Les dossiers de solution peuvent citer la référence métier. Cette décision corrige la proposition d’audit ; elle ne réécrit pas les publications ni l’application courante.

Chaque nœud a un identifiant stable, une révision, des champs de contenu, un statut de revue et des sources. `fields` contient notamment `name`, `definition`, `finality` et, quand elles sont établies, `nature`, `scope`, `independence` ou `mastership`. Une valeur absente reste inconnue ; la vue ne la complète pas depuis un autre espace. Les références globales aux fichiers et leurs empreintes sont dans `backlog/model-provenance.yaml`, hors du modèle métier ; une nouvelle publication les fige dans son dossier de révision et les lie par son manifeste.

Les relations ont également leur identifiant, leur type, leurs extrémités et leur statut. `contains` décrit la décomposition et `presents` la présentation. Authoritative Data conserve son type `group` et ses relations de présentation vers les référentiels : son nom adopté n’ajoute pas une Area ni un gestionnaire unique des données maîtresses. Les autres liens décrivent des relations métier, sans convertir automatiquement objets, documents ou événements en sous-capacités. Les préfixes historiques ne déterminent jamais les parents : D02.b et D02.c sont rattachées à D01 ; D02.e à D03. Le même principe conserve l’identifiant `universe-supply` pour le Domain Supply Chain Orchestration.

Une relation peut porter une expression courte dans `fields.label` (ou `fields.verb`), lue de `source_id` vers `target_id`. Cet objet optionnel n’accepte que ces deux chaînes non vides. Le sens complet reste dans `qualification`. Avec le rôle `needs`, la flèche va toujours du consommateur vers le fournisseur du résultat ; le libellé ne change ni cette orientation ni le type du lien. Atlas affiche le libellé commun aux relations regroupées, sinon le libellé de famille et le détail de chaque relation.

Ces champs font partie du contenu révisé et figé de la relation. Leur ajout n’étend pas l’accord sur les extrémités ou la qualification : la portée des preuves de cycle de vie demeure explicite. Leur modification impose une révision et ne peut pas altérer une publication existante.

La hiérarchie peut être approfondie, mais un nouveau niveau ou une nouvelle relation doit avoir un sens défini. Étendre le schéma et les règles de graphe avant d’ajouter un nouveau type. Cette souplesse technique ne valide ni un niveau universel, ni des bounded contexts, ni un modèle processus détaillé.

## Statuts et décisions

| Valeur JSON | Présentation française | Sens |
| --- | --- | --- |
| `accepted` | Validé | Portée présentée explicitement adoptée ; ses limites restent applicables |
| `partial` | Partiellement validé | Certains aspects seulement sont adoptés, ou l’accord est contextuel |
| `proposed` | Non validé en release ; proposé en backlog | Contenu disponible à discuter, sans validation enregistrée |
| `under_review` | En réexamen | Dernier état conservé avec une réserve explicite à instruire |
| `illustration` | Illustration | Exemple pédagogique, conservé dans le backlog |

Dans la release complète, `approved_fields` et `proposed_fields` qualifient séparément les champs d’un nœud. `adoption_ids` renvoie aux décisions `ADOPT-*`, qui transcrivent les accords existants avec auteur, date, source, interprétation explicite ou contextuelle, cible, révision et empreinte de chaque valeur adoptée. Ces repères techniques n’ajoutent aucune nouvelle validation métier. La validation d’un nom ne s’étend pas aux autres champs.

Les rattachements sont qualifiés séparément. Les deux paragraphes suivants conservent les repères historiques U75–U95 et la migration initiale ; les noms, nombres et rattachements courants se lisent dans le YAML. U482 remplace notamment le nom Business References par Authoritative Data sans transformer le groupe en Area.

Reservation conserve notamment le dernier rattachement U75 avec le réexamen U78 ; son nom adopté ne ferme pas cette question de frontière. Le groupe Business References reste un groupe de présentation de cinq modèles distincts. Les neuf capacités d’Order Promising sont validées dans la portée U95 ; aucune autorité logistique supplémentaire n’est attribuée par cette validation.

Le backlog conserve les alternatives P82 et P84 dans `alternatives`. Elles ne remplacent pas silencieusement les 36 fiches publiées. Les quatre objets, document et fait illustratifs sont conservés avec leurs huit relations, sans promotion par la migration.

## Panorama des SI actuels

Les données distinguent composants et mentions (`objects`), flux (`flows`), autorités sur l’information (`information_authorities`) et responsabilités de décision (`decision_responsibilities`). Chaque fiche conserve son texte source, ses champs d’origine, ses sources et corrections, sa qualification de preuve et son intention As Is ou cible.

Les 85 repères des registres initiaux sont affectés une seule fois : 74 dans les panoramas et leur contexte partagé, 11 dans les éléments à instruire du backlog. Les besoins exprimés pour Boardriders et les orientations de plateforme ne deviennent pas des preuves de configuration installée.

Sarenza est `not_assessed`, avec des listes vides. Cela signifie « non traité », et non « aucun composant ». Les anciennes mentions demeurent traçables dans le backlog. Les dates `observed_at` sont nulles tant qu’aucune observation datée n’est établie. Les extrémités de flux non résolues conservent leur libellé source ; aucun rapprochement d’identité n’est inventé.

## Faire évoluer les modèles

Selon U113, l’exploration et la construction se font **dans le backlog par défaut**, y compris dans FLOW Atlas. La publication reste une action distincte pilotée par le skill `release`. Une comparaison seule n’active aucune version.

Le paragraphe U141 suivant est un repère historique : U472 a depuis retiré Business Services / Case et U482 a adopté Domain → Area → Capability → Behavior ainsi que le nom Authoritative Data. Il ne réactive ni l’ancien niveau Universe, ni un périmètre Commerce ou Case à développer.

U112 fixe la priorité : **domaines et capacités**, puis leur épreuve sur les trois SI et FLOW cible. U141 structure désormais **Supply** et **Case** comme univers dans le backlog : groupes `group_role: urbanism_level`, `level_ref: universe`. Les domaines transactionnels et Business References sont rattachés à Supply ; Case réserve l’exploration processus. Business References reste un groupe de présentation. La [feuille de route](backlog/modeling-roadmap.yaml) prépare le lien Case/Order sans instancier leur inventaire détaillé ou leurs cardinalités. L’état avant cette refonte est conservé dans [history/pre-U141.json](backlog/history/pre-U141.json).

Les relations peuvent porter `qualification` : sens (`meaning`), rôle, conditions, effets et périmètre. Le type générique `relates-to` permet capacité → capacité/objet/document/événement avec un sens explicite. Les sources et le statut appartiennent au lien lui-même. Cela prépare la structure ; aucun nouveau lien métier réel n’a été ajouté. Une relation entre capacités n’est pas automatiquement une décomposition ; un objet peut concerner plusieurs capacités sans propriétaire exclusif présumé.

**Convention fait–document U461** : lorsqu’un modèle porte `PRINCIPLE-MANAGEMENT-FACT-DOCUMENT`, chaque fait de gestion (`event`) doit être relié à un document identifié par `records` (document → fait). Le document peut être structuré sans fichier. Le validateur vérifie le lien et la nature des extrémités ; il n’impose ni relation un-à-un, ni version, ni règle de correction. Les publications antérieures sans ce principe conservent leur contrat. Les exemples candidats du lot 3 restent dans `backlog/information-pilots-U458.yaml` ; ils ne sont pas promus automatiquement en nœuds.

Le [registre d’applicabilité](backlog/applicability.yaml) prépare quatre contextes, trois `as_is` et FLOW `target`. Il conserve séparément applicabilité, couverture décrite et responsabilité de réalisation. Les évaluations futures référencent l’espace, la version et l’identifiant du domaine ou de la capacité, leurs preuves et réalisations lorsqu’elles sont connues. Le tableau est vide à ce stade : absence de résultat signifie non évalué. Les récits déjà analysés restent disponibles et leur qualification structurée reste à faire. Les schémas associés sont contrôlés avec les autres modèles.

1. Lire les corrections, le JSON concerné et ses sources. Enregistrer d’abord tout nouvel apport de Laurent ; distinguer proposition et validation.
2. Modifier le backlog JSON, conserver les identifiants et incrémenter la révision des éléments modifiés. Actualiser les liens marché ou signaler leur comparaison restant à faire dans les sources associées. Consigner l’analyse en Markdown.
3. Pour une publication, figer une nouvelle révision JSON dans `revisions/`, les décisions applicables dans `decisions/` et les preuves dans `provenance/`. Une modification d’un champ adopté ne réutilise pas automatiquement la validation de sa valeur antérieure. Les décisions doivent cibler les révisions et empreintes réellement publiées.
4. Utiliser le [skill release](../skills/release/SKILL.md) et [prepare_release.py](../scripts/prepare_release.py) pour comparer le backlog vivant, préparer le candidat et publier sa capture contrôlée. La préparation écrit seulement `modeles/staging/<version>/`. La publication refuse une entrée altérée ou un contexte modifié depuis la préparation, puis active le pointeur local en dernier. U504 : les décisions conservent leur portée. Un report sur une autre révision est automatique uniquement si valeurs et contexte métier restent identiques ; un changement métier exige un réexamen explicite. Le rapport distingue les validations suspendues et conserve leur historique.
5. Exécuter les contrôles, vérifier la publication servie par Atlas. Publier un contenu candidat ne constitue jamais une validation métier. Une publication externe reste une action différente de cette publication locale.

Le parcours courant est `python scripts/release.py --source SOURCE --activate`. Il intègre le backlog vivant sans fabriquer d’accord métier. Les anciens scripts de migration et de publication restent des adaptateurs de compatibilité, pas des étapes supplémentaires à exécuter. `.gitattributes` préserve les octets utilisés pour les empreintes ; Git conserve les versions remplacées.

Pour le panorama, enrichir les données structurées à partir de nouvelles preuves, puis créer une nouvelle version par SI et réviser l’index. Une nouvelle date de consolidation ne doit pas avancer artificiellement `observed_at`. Le fichier partagé reste lui aussi versionné.

## Migration initiale et contrôles

[migrate_urbanism.py](../scripts/migrate_urbanism.py) et [extract_panorama.py](../scripts/extract_panorama.py) sont les extracteurs de migration. Ils ne constituent pas le circuit d’édition courant. Après changement des sources historiques, ne pas réimporter le Markdown sur le JSON vivant. Le premier script exige une destination vierge ; le second refuse l’écrasement différent d’une version gelée. `--check` vérifie la concordance de la capture historique, pas la présence de nouvelles connaissances.

```powershell
python scripts/refresh_sources.py
python scripts/validate_models.py
python -m unittest discover -s scripts -p "test_*.py"
python scripts/extract_panorama.py --check
python scripts/render_models.py
```

Les schémas utilisent un sous-ensemble explicite de [JSON Schema 2020-12](https://json-schema.org/draft/2020-12). Les enveloppes sont fermées avec `additionalProperties: false`, suivant la [définition officielle des objets](https://json-schema.org/understanding-json-schema/reference/object). Le validateur local de bibliothèque standard n’implémente pas tout JSON Schema : il refuse les mots-clés non pris en charge. Les règles complémentaires vérifient identités, sources, types de relations, cycles, empreintes, publications gelées et portée des validations. Les index de pointeurs sont contrôlés sémantiquement ; tous les JSON annexes n’ont pas encore un schéma autonome.

[FLOW Atlas](../app/README.md) est une restitution en lecture seule des trois espaces. Le Markdown des [restitutions](../restitutions/README.md) est généré depuis les JSON. Les analyses de marché MKT/ELM/CMP, le glossaire, les récits et les questions restent dans leurs registres documentaires avec leurs identifiants ; leur indexation comme sources ne vaut pas migration complète en graphe. Les 36 CAP historiques restent distinctes des 36 capacités P81.

Voir l’[audit de structure et d’extraction](../audits/2026-09-13-structure-modeles.md) pour les constats, les limites et les preuves.


## Cycle de vie — U131

Le backlog courant utilise `review` pour la lecture et les décisions ADOPT pour la portée exacte des accords, champ par champ. Il ne maintient plus un second statut `lifecycle` ni les listes `approved_fields`, `proposed_fields` et `adoption_ids` : la préparation calcule ces listes depuis les décisions conservées. Une validation limitée au nom ne valide pas la définition. Les publications historiques gardent leurs métadonnées `lifecycle` et leur ancien contrat ; elles ne sont pas réécrites.
# Glossaire publié et références textuelles — U203

Le vocabulaire courant est dans `backlog/glossary.yaml`. Les identifiants TER/VER sont stables ; `name`, `short_description`, `definition`, `review` et `source_refs` sont obligatoires. Les sens homonymes disposent de repères distincts : TER004 est historique ; TER060 décrit Article comme rôle de Product. Le registre Markdown conserve les récits et preuves, sans seconde autorité à maintenir.

Les chaînes peuvent contenir `[unités physiques](glossary:TER059)` ou `[Inventory Tracking](model:D01.f#definition)`. Le texte affiché peut être traduit ou au pluriel. Seul le lien explicite détermine sa cible, dans le même modèle ; le parseur ne crée aucune relation métier. Préfixer un crochet ouvrant par `\` pour conserver un exemple littéral. La notation est indépendante de YAML et reste une chaîne dans l’API JSON.

La préparation embarque le glossaire dans `glossary` du snapshot et du modèle publié ; elle surveille aussi l’empreinte de son fichier de travail. Une release historique sans ce champ reste sans glossaire. Chaque terme et le catalogue sont versionnés automatiquement, avec UTC `last_modified`. `glossary_changes` et `glossary_reference_impacts` du rapport indiquent les différences et les références à un sens modifié, y compris par un autre terme ; examiner leur portée avant publication, sans déduire une validation depuis une phrase inchangée. Les anciens snapshots restent immuables.

Dans Atlas, la fiche de terme propose sa description courte, sa définition et son contexte ; provenance et validations restent internes depuis U450. Les liens `model` ouvrent les éléments de tout type. `#definition`, `#finality` et `#scope` désignent les sections de fiche correspondantes ; Dans le glossaire, `#definition` désigne la définition ; l’ancien lien `#short-description` y est redirigé depuis U459, sans rubrique « En quelques mots » redondante. L’URL Atlas encode séparément la publication, la cible et la section.

U450 sépare les accès au glossaire métier et au glossaire du méta modèle. Le guide méthodologique versionné porte ses termes MOD et la liste des termes TER du snapshot relevant du méta modèle ; les identités et textes TER ne sont pas réécrits. `modeling-guides/index.yaml` associe précisément l’édition à la publication. La préparation capture l’association de la version de départ, puis la publication la reporte explicitement après contrôle des empreintes, sans choix par tri ni repli vers le backlog. Une modification de l’association après préparation exige un nouveau candidat.


## Comportements — U262 à U264

Le type `behavior` précise une capacité et constitue son dernier niveau descriptif. Une unique relation structurelle `contains` le rattache à un parent de type `capability`. U455/U458 retirent le critère de couche du modèle courant. Les contrôles refusent absence/multiplicité de parent, parent d’un autre type, nom/définition vides et enfants sous un comportement. Une relation métier `relates-to` peut relier un comportement à une capacité, un comportement, un objet, un document ou un événement, avec qualification explicite ; elle ne crée pas un parent.

Identités BHV001–BHV004, quatre comportements ATP ; rattachements explicites, aucun parent déduit des identifiants. Le compteur des capacités reste distinct. Définitions U263 adoptées, noms anglais et compléments proposés ; source et portées : connaissance/34-comportements-atp.md et d03-review.yaml. La publication utilise le mécanisme normal de révisions, décisions et snapshots ; cette évolution ne publie pas le backlog.


## Justifier les comportements — U265

Une capacité décomposée porte `fields.decomposition_rationale`, texte expliquant la complexité ou le bénéfice ciblé. Cette propriété fait partie des champs métier versionnés ; sa présence ne la valide pas. `PRINCIPLE-JUSTIFIED-BEHAVIOR` active le contrôle de présence non vide pour les capacités ayant des enfants de type behavior. Les snapshots antérieurs restent lisibles sans cette exigence rétroactive. Le contrôle ne juge pas la pertinence de la justification : elle reste à examiner métier.

Le niveau reste terminal, les comportements combinables et facultatifs. Les propositions d’audit sont dans `backlog/behavior-audit.yaml`, hors catalogue actif ; les 41 fiches ne sont pas 41 demandes de décomposition. Les justifications sont affichées dans les fiches Atlas et la restitution dérivée lorsqu’elles appartiennent au snapshot consulté.


## Audit des comportements manquants après U290

`backlog/behavior-gap-audit.yaml` porte les propositions U292 ; [rapport et annexes](../audits/2026-09-17-comportements-manquants/rapport.md). Les IDs P/A/C sont locaux à l’audit, pas des nœuds du catalogue. Régénérer et contrôler les vues avec `python -m scripts.render_behavior_gap_audit`. Le contrôle exige l’empreinte du modèle audité ; après évolution de celui-ci, réexaminer l’analyse avant d’actualiser la baseline. Aucun candidat n’est adopté automatiquement.


## Comparaison marché structurée — U311

`fields.market_comparisons` porte les rapprochements sur les nœuds ; `market_comparisons` porte les mêmes informations sur les termes du glossaire métier. Contrat commun : `$defs.marketComparisons` dans le schéma d’urbanisme. Une entrée contient éditeur/produit, libellé/nature externe, relation, points communs, différences, position FLOW, statut et source datée. Les statuts proposés ne deviennent pas validés à la publication. Champ facultatif pour les éléments non étudiés ; lorsqu’un rapprochement est documenté, il doit être renseigné. Les anciennes publications restent valides sans ce champ.

U462 ajoute deux précisions facultatives par rapprochement : `term_choice` explique le choix de vocabulaire et les alternatives écartées ; `definition_choice` explique le périmètre retenu. Elles restent rattachées à la source primaire de la comparaison, avec les décisions internes dans `source_refs`. Un nom repris ne présume pas un effet métier identique chez l’éditeur et dans FLOW.

`fields.examples` conserve les illustrations explicitement structurées : titre, situation, résultat éventuel (`outcome`), leçon métier éventuelle (`lesson`) et provenance interne (`source_refs`). Aucune valeur d’accord n’est déduite d’un exemple. Atlas donne priorité à ce champ ; pour une publication antérieure, il peut mettre en valeur les seuls passages déjà marqués comme exemples dans le périmètre de ce même snapshot. Aucun scénario n’est généré depuis une définition ni récupéré dans le backlog.


## Exécution ciblée et performances

Après une modification, utiliser la matrice de contrôles d’[AGENTS.md](../AGENTS.md). Actualiser la provenance seulement si une source indexée a changé ; valider une fois l’état final du modèle. `render_models.py --space backlog`, `--space release` ou `--space panorama-as-is` limite la restitution à l’espace concerné ; sans option, tous les espaces sont traités. Les restitutions identiques ne sont pas réécrites.

`prepare_release.py report` affiche une synthèse avec le nombre d’erreurs et l’aptitude à préparer une release. `--full` imprime tous les détails ; `--output chemin-nouveau.json` enregistre le rapport complet dans un nouveau fichier, sans écraser un fichier existant. Les vérifications et le rapport figé d’une préparation restent complets.

### Parcours de publication léger

```powershell
python scripts/release.py --source SOURCE --activate
```

Une construction et une validation du candidat, staging temporaire dans `.runtime/publication/VERSION/`, contrôle des empreintes, activation puis contrôle d’Atlas. Sans `--activate`, la commande prépare seulement. Aucun commit, push, build ni audit global n’est implicite. Aucun rapport cumulatif ou copie d’annexes n’est publié.

La publication précédente doit être committée avant son retrait des fichiers actifs. Le backlog peut être modifié : ses octets, les sources et le code sont liés à la préparation. Toute modification après préparation bloque l’activation. Une préparation existante se reprend avec la même version et les mêmes sources, sans nouvelles entrées. Après interruption d’écriture, inspecter les artefacts et le pointeur avant de reprendre.

`--guide CHEMIN_YAML` intègre une nouvelle édition explicite ; sinon l’association figée précédente est conservée. La publication courante est autonome. L’accès historique exige le dépôt Git et ses objets ; il ne requiert aucun téléchargement réseau ni arborescence restaurée.

### Enregistrer un accord explicite avant la release

```powershell
python scripts/record_decision.py --id ADOPT-SOURCE-OBJET --collection nodes --target ID --fields name --source SOURCE --author Laurent --decided-at YYYY-MM-DD --interpretation explicit --reviewer Codex --note "Portée exacte présentée et acceptée"
```

Répéter `--fields` et `--source` au besoin ; `record_intents` enregistre un lot atomiquement. Les valeurs, auteur, sources et empreintes de contexte sont conservés dans le registre des intentions en attente. Après publication, les accords applicables sont portés par les décisions courantes ; Git conserve les captures antérieures. Un report sans changement de sens conserve l’identifiant d’accord et ne rallonge pas sa note.

### Parcours maintenu de réexamen des accords

`needs_review` fournit un dossier ciblé sous `.runtime/release-reviews/VERSION/`. Lire `prepare_release.py inspect DOSSIER --section review --id ID`, renseigner `assessment.yaml` selon la décision explicite, puis reprendre `release.py --review DOSSIER --source SOURCE --activate`. `retain_partial` conserve seulement les champs historiques inchangés explicitement retenus ; les nouvelles valeurs ne sont pas approuvées implicitement.

Les dossiers de revue sont locaux. Les décisions résultantes portent la portée et les sources de l’accord ; aucune copie du dossier n’est ajoutée à chaque publication.

### Mesurer le parcours sans toucher au modèle

`python -m scripts.benchmark_lean_release` mesure une publication éditoriale complète sur copie isolée dotée de son propre Git, à froid puis à chaud. Les résultats sont indicatifs et la vérification HTTP est séparée. `validate_models.py` reste disponible pour un contrôle global explicite ; il ne fait plus partie de chaque publication.

## Améliorations de lecture U458

Atlas indexe les champs métier et le glossaire du snapshot sélectionné, avec priorité au nom exact et à l’identifiant. U459 corrige le retrait des comparaisons : leurs champs de positionnement métier sont affichés et recherchables. Réserves, statuts et sources internes restent hors affichage et hors index de recherche. Les champs autorisés sont explicites dans `app/src/businessContent.ts` ; cette séparation de présentation n’est pas un contrôle d’accès à l’API locale. Les dépendances directes sont montrées par défaut ; les liens entre voisins se demandent explicitement. Les fiches gardent leurs conditions et effets accessibles dans les détails.

`modeling-guides/versions/2026-09-22.2.yaml` conserve une édition historique des six repères, réutilisée par les anciennes références de travail U458 ; la source courante unique est indiquée en tête de ce document. U467 en publie une édition figée `2026-09-19.2`, explicitement associée à v011 ; v010 garde son guide précédent. Les sources de leçons sont embarquées dans le guide ; ses références racines relèvent du registre global. La préparation contrôle cette distinction sans inventer de source globale pour un extrait local. Les cinq cas pilotes sont dans `backlog/information-pilots-U458.yaml`, affinés par `backlog/information-cards-U465.yaml` ; leur suivi et leurs arbitrages restent dans `backlog/v0-readiness.yaml`.


## Pluralité des sources marché — U470/U471

Le contrat historique `market_reference_policy: two_primary_sources` exige au moins deux documents distincts pour chaque nœud non illustratif, relation ou terme comportant des comparaisons. `validate_models.py` et la préparation de publication l’appliquent ; les URL ne deviennent pas distinctes par changement d’ancre ou ajout de paramètres. Les fiches sans comparaison ne reçoivent aucun appui fictif. La qualité primaire et la pertinence sont contrôlées éditorialement. La politique participe à l’empreinte du modèle et laisse les snapshots historiques sans marqueur inchangés.

U470 masque temporairement le catalogue Informations métier dans Atlas sans supprimer ses données du modèle. Aucune extension n’est engagée pendant cette consolidation.


## Métadonnées de demandes — U501

Les champs facultatifs `fields.request_origins` (capacité uniquement) et `fields.behavior_aspect` (comportement uniquement) portent des informations de lecture explicites. `request_origins` accepte une liste non vide et sans doublon de `frontoffice` et/ou `backoffice` ; `behavior_aspect` accepte `trigger` ou `activity`. Ils ne modifient pas `nature` et ne créent pas de niveau de décomposition. L’absence de champ ne permet aucune inférence. Validation, compilation du snapshot, restitution Markdown et Atlas conservent les valeurs de la publication consultée ; aucune valeur n’est ajoutée aux publications historiques.


**Réexamen des intentions inédites — U509.** `record_decision.py --supersedes ID_ANTERIEUR` ajoute une nouvelle preuve explicitement réexaminée sans modifier l’ancienne. Même cible et champs identiques ou réduits ; aucun report automatique du contexte. Les preuves déjà publiées passent par le parcours de réexamen de publication. L’API `record_intents(root, parameters)` enregistre un lot relu sur un seul état final et une seule écriture atomique ; chaque accord garde sa source, ses champs et sa note.


### Catégorie visuelle des capacités (U701)

`fields.category` est facultatif : `id` stable, `display_name` affiché et `order` entier optionnel. Ces métadonnées classent visuellement les capacités à l’intérieur de leur sous-domaine sans modifier leur parent ni créer un niveau métier. Réutiliser les mêmes libellé et ordre pour un identifiant dans un même sous-domaine. Les publications historiques sans ce champ gardent leur présentation ; les nouvelles affectations restent des propositions éditoriales tant qu’elles ne sont pas adoptées.


### Application des accords cumulatifs — U709

Un accord valide la proposition complète construite dans la discussion, avec ses conditions explicites. Le modèle canonique porte son application ; les annexes conservent preuves et correspondances. Une déclaration `publication_delivery` dans l’annexe rend le lot vérifiable : `applied` contrôle les nœuds attendus, leurs champs, parents et retraits ; `pending` reste visible sans être adopté automatiquement. La préparation expose ces lots dans son bilan et bloque une application incomplète. Ce contrôle repose sur des déclarations explicites et ne déduit pas les accords du texte libre des anciennes études.


## Identité persistante et codes de lecture — U783

`identification_rules` dans le glossaire méthodologique définit les règles adoptées ; `PRINCIPLE-DISPLAY-CODES` et `display_policy: typed-tree-v1` les appliquent au backlog. L’identité `id` reste immuable et porte les accords et relations. Les codes visibles suivent une séquence globale par type dans l’ordre de lecture ; un code n’a de sens durable qu’avec sa publication.

`publish_release.compile_snapshot` génère `display_index` après filtrage des illustrations. Il fige les racines, les enfants et les codes à partir du même arbre explicite ; les validateurs contrôlent cohérence, unicité, séquence et identité de politique avec le snapshot source. Le backlog ne maintient pas de seconde liste de codes. Les anciens snapshots sont inchangés. Les règles ne modifient ni les fiches métier ni leur glossaire : celui-ci a été contrôlé, sans terme méthodologique ajouté.


Les nouveaux descripteurs utilisent désormais `urbanisation-vNNN-YYYY-MM-DD.N.yaml` : la version de publication rend le nom unique même si deux publications ont la même révision et le même instant. L’horodatage UTC reste porté par `published_at`. Les descripteurs historiques et leurs noms restent inchangés.

### Contrôle des appuis marché courants — U853

Le contrat `microsoft_sap_or_gap_v1` contrôle les familles Microsoft Dynamics et SAP S/4HANA sur les domaines documentaires primaires. Toute famille manquante exige `market_gaps` : motif précis, URL examinées et sources de provenance. Atlas affiche ces limites dans les comparaisons. La présence d’une lacune autorise une publication transparente ; elle ne certifie pas la couverture du marché. Les rapprochements partiels conservent leurs différences et limites. Le contrôle ne peut pas établir automatiquement la pertinence métier d’un document. Les publications historiques gardent leur contrat et leur contenu.
