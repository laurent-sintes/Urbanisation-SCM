# Granularité des capacités — audit U785

27 septembre 2026 — analyse Codex, non validée par extension. Demande : [U785](../connaissance/01-contributions-utilisateur.md#u785).

## Conclusion

Le backlog comprend 74 capacités dans Supply Chain Orchestration. Le nombre seul ne révèle pas un sur-découpage. Le découpage des décisions est explicable par leurs résultats propres ; les principaux risques de granularité se trouvent plutôt dans l'hétérogénéité des familles de Service Orders et dans la multiplication éventuelle des vues par objet. La conformité statistique à une « moyenne marché » n'est pas établie : les sources accessibles ne fournissent pas de population de cartes normalisées au même périmètre et à la même maille.

Recommandation : conserver le modèle à ce stade ; ne fixer ni quota de capacités ni objectif de réduction. Soumettre les capacités les plus spécialisées à un test d'autonomie de résultat et d'utilité de pilotage, sans réouvrir l'audit historique clos des comportements. Une vue agrégée de comparaison peut être utile sans fusion canonique.

## Périmètre et méthode

Autorité : `modeles/backlog/model.yaml`, lu avec `scripts/structured_io.py` et `scripts/inspect_model.py`. Les 74 noms et définitions ainsi que les rattachements explicites ont été examinés ; les scopes des frontières sensibles ont fait l'objet de lectures ciblées. Lecture de MOD015 et MOD006 dans le glossaire méthodologique. Il s'agit d'un audit structurel complet et d'une revue sémantique ciblée, pas de 74 équivalences marché démontrées fiche par fiche.

Les relations `contains` et `presents` permettent de rattacher chaque capacité à un des neuf sous-domaines. Les huit Reference sous Master Data sont des regroupements de présentation : ils ne constituent pas un sixième niveau métier. Compter les types effectifs, jamais le préfixe historique : BHV006 est aujourd'hui une Capability.

Comparer d'abord : (1) aptitude durable plutôt que processus ou fonctionnalité ; (2) inclusions/exclusions ; (3) résultat attendu ; (4) granularité ; (5) seulement ensuite le nombre de feuilles comparables. Exclure les parents et les comportements de ce dénombrement. Un numéro L3/L4 externe ne garantit aucune équivalence.

Notre niveau 4 signifie Système → Domaine → Sous-domaine → Capacité. Les trois premiers étages ne sont pas trois décompositions successives d'une même capacité TOGAF. Dans une carte qui commence par SCM comme capacité L1, un sous-domaine FLOW peut se rapprocher d'un L2 et une capacité FLOW d'un L3, selon leurs définitions. C'est une correspondance de travail, pas une conversion universelle.

Supply Chain Orchestration n'est pas l'ensemble du SCM : Sales, Sourcing and Procurement et Logistics Execution sont des domaines distincts ; la construction des plans amont est externe, tandis que le Matching construit son plan interne. Les Orders et la coordination de prestations restent inclus. L'absence de capacités détaillées dans les domaines de contexte ne constitue pas une lacune à combler pour obtenir un nombre comparable.

## Mesure locale reproductible

| Sous-domaine courant | Capacités | Lecture de granularité |
| --- | ---: | --- |
| Master Data | 9 | Huit vues de référence et une ingestion commune ; vérifier le résultat propre de chaque vue, pas seulement l'objet consulté. |
| Policies | 3 | Gouverner des ensembles de règles durables ; pas de capacité par seuil. |
| Plan Visibility | 3 | Ingestion commune et deux résultats de visibilité ; ne pas confondre avec la construction des plans. |
| Order Management | 9 | Familles d'engagements distinctes, structuration et visibilité ; maille relativement large. |
| Inventory Management | 7 | Faits intégrés, registres, visibilité, comptage, réservation et décision de propriété ont des effets différents. |
| Order Promising | 4 | Trois évaluations et une sélection ; les profondeurs et variantes restent des comportements. |
| Demand & Supply Matching | 10 | Sept décisions, deux capacités de planning et une application ; responsabilités du plan commun. |
| Service Order Management | 18 | Plus forte concentration et plus forte spécialisation ; priorité de vigilance. |
| Fulfilment Orchestration | 11 | Six décisions et cinq capacités de coordination, connaissance, intégration ou rapprochement. |
| **Total** | **74** | **Médiane 9 par sous-domaine ; minimum 3, maximum 18.** |

Les 77 Behaviors ne sont pas ajoutés aux 74 capacités. Par type : Action 30, Decision 15, Knowledge 14, Integration 4, Policy 3, Evaluation 3, Ledger 2, Planning 2, Orchestration 1.

Decision représente 20,3 % du total ; Decision + Evaluation représente 24,3 %. Les 18 Service Orders représentent eux aussi 24,3 %. Knowledge + Integration représente également 18 capacités, mais ce troisième ensemble traverse les sous-domaines et ne s'ajoute pas aux deux précédents comme un ensemble disjoint.

Retirer arithmétiquement les 15 décisions laisserait 59 capacités, mais supprimerait des responsabilités : ce n'est ni une proposition de carte simplifiée ni une estimation du nombre marché. On ne peut donc pas attribuer un « surplus de 15 » au seul choix décisionnel.

## Références effectivement consultées

Les identifiants MKT-U785-* désignent les références locales de cette étude, ELM-U785-* les passages et CMP-U785-* les rapprochements. Toutes les consultations datent du 27 septembre 2026 ; auteur des rapprochements : Codex ; statut : proposé, aucun valideur. Pages évolutives sans édition sauf indication. Synthèses et liens seulement ; aucun catalogue commercial acquis ni redistribué.

| Référence / élément local | Source, édition et passage | Observation et limite |
| --- | --- | --- |
| MKT-U785-01 / ELM-U785-01 | The Open Group, [Business Capabilities G189](https://governance.foundation/assets/frameworks/togaf/g189%20-%20Business%20Capbility.pdf), 2018, §3.2.2, p. 10 imprimée ; [notice officielle](https://publications.opengroup.org/g189) | Guide original consulté dans une copie tierce. La profondeur dépend du besoin de décision ; trois à six niveaux sont cités comme pratique courante. Aucun quota SCM dans ce passage. La version en ligne récente redirige vers une authentification : pas d'affirmation sur son contenu. |
| MKT-U785-02 / ELM-U785-02 | SAP Learning, [Discovering the Reference Architecture Content](https://learning.sap.com/courses/sap-enterprise-architecture-framework-foundation-introduction/discovering-the-reference-architecture-content), sections Framework et Business Capability Model Example | Business Domain → Business Area → Business Capability ; séparation explicite des Solution Capabilities. Exemple : cinq Business Areas sous Supply Chain Execution, trois capacités sous Dock and Yard Logistics et six sous Transportation Management. Ce sont des exemples partiels, pas le total SCM ni une moyenne. |
| MKT-U785-03 / ELM-U785-03 | CIOPages, [Supply Chain Capabilities Model](https://www.ciopages.com/store/supply-chain-capabilities-model/), Product Description, Deliverables et Why | Annonce 230 capacités et trois niveaux. Le détail des feuilles n'est pas accessible dans la présentation : nombre de feuilles seul non vérifiable. La mention « source-to-pay » au milieu du descriptif SCM ajoute une ambiguïté éditoriale. Le total ne doit pas servir de dénominateur à FLOW. |
| MKT-U785-04 / ELM-U785-04 | Capstera, [Business Architecture for Supply Chain Management](https://capstera.com/store/business-architecture-for-supply-chain-management), What's Inside et Capability Map as a Filter | Extrait indexé de la page primaire : environ 230 capacités sur trois niveaux. Ouverture directe en échec ; contenu détaillé non consulté. Ne pas traiter cette annonce et CIOPages comme deux observations statistiques indépendantes. |
| MKT-U785-05 / ELM-U785-05 | ASCM, [SCOR Digital Standard](https://scor.ascm.org/), présentation des niveaux | Orchestrate au niveau 0 et six processus au niveau 1. Une structure de processus n'est pas un compte de capacités au sens FLOW. |
| MKT-U785-06 / ELM-U785-06 | Microsoft Dynamics 365 SCM, [Inventory Visibility inventory allocation](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-allocation), Business purposes et Difference between inventory allocation and soft reservation | Protection de groupes et réservation d'une demande se distinguent. Fonctionnalités produit ; ne démontre ni une taxonomie de capacités ni une optimisation automatique des seuils. |
| MKT-U785-07 / ELM-U785-07 | SAP Learning, S/4HANA for fashion and vertical business, [Comparing with Legacy SAP Apparel and Footwear Solution](https://learning.sap.com/courses/outlining-sap-s-4hana-for-fashion-and-vertical-business-and-implementing-best-practices/comparing-with-sap-fashion-management-solution-fms), Supply Assignment et Operational Management and Simulation | Affectation, libération découplée, simulation et analyse documentées dans la même solution. Appui aux différences de résultat, pas prescription de la décomposition FLOW. |
| MKT-U785-08 / ELM-U785-08 | Microsoft Dynamics 365 SCM, [Packing work](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/packing-work), introduction | Travail de conditionnement et expéditions partielles. L'objet logiciel d'exécution n'est pas automatiquement une capacité de tenue d'engagements confiés. |
| MKT-U785-09 / ELM-U785-09 | SAP Learning, Basic Customizing in S/4HANA EWM, [Creating Packaging Specifications](https://learning.sap.com/courses/basic-customizing-in-sap-s-4hana-ewm/creating-packaging-specifications), Packaging Specifications | Conditionnement et VAS orders décrits, avec tâches issues des spécifications. Ne justifie pas une capacité FLOW distincte pour chaque prestation fashion. |

Un support historique DCM Deloitte/ASCM, [Release 2 beta](https://beta.ascm.org/globalassets/ascm_website_assets/docs/dcm/dsn-capability-model-release-2-beta.pdf), a aussi été consulté : six ensembles L1 et une décomposition L2, avec Synchronized Planning couvrant notamment l'alignement stratégique, financier et opérationnel. Son orientation numérique et son périmètre élargi empêchent une assimilation directe. Le chiffre 38 trouvé dans une publication secondaire n'est pas retenu comme mesure primaire vérifiée dans cette étude.

**Réponse quantitative défendable :** les exemples publics vont d'un petit nombre de capacités par aire métier à des catalogues détaillés annonçant plusieurs centaines d'éléments. On ne dispose pas ici d'une moyenne SCM normalisée. Calculer une moyenne de ces chiffres, affirmer que 74 est au-dessus ou en dessous, ou proposer une fourchette « normale » de 40–80 serait injustifié.

## Résultats de l'audit et correspondances

### CMP-U785-01 — Définition et niveau

Appui méthodologique : ELM-U785-01, ELM-U785-02 ; cible MOD015 et hiérarchie courante. L'aptitude indépendante des outils est cohérente avec les références. Le rang quatre dans FLOW n'est pas une unité de granularité marché. Bénéfice de notre hiérarchie : lire le contexte sans multiplier les capacités composites. Limite : un même rang peut accueillir des aptitudes plus ou moins spécialisées. Recommandation : juger le résultat et le périmètre, pas le seul rang.

### CMP-U785-02 — Décisions, évaluations et application

Recouvrement partiel : ELM-U785-06 et ELM-U785-07 ; cibles Matching, Promising et leurs frontières avec Policies, Reservation et Orders. Les éditeurs documentent des effets différents tout en les regroupant dans des solutions. FLOW rend ces responsabilités visibles séparément. Cette finesse sert le pilotage et la cartographie des contributions Data/IA ; elle ne prouve pas un sur-découpage.

Les résultats locaux sont distincts : Demand Prioritization produit des priorités ; Supply Assignment des liens ressources-besoins ; Inventory Target Optimization des cibles ; Replenishment des apports ; Group Protection Optimization des quantités protégées. Évaluer une possibilité, retenir une promesse, réserver et confirmer ne produisent pas le même effet. Les références consultées étayent certaines frontières, pas chacun des 15 noms ou scopes. La présence d'une décision dans un algorithme ne suffirait pas à créer une capacité.

Vigilance locale : Process Adaptation Decision doit rester le choix d'une révision cohérente du plan d'exécution. Si une description ne faisait que répéter Service Selection Decision ou Transport Plan Decision en contexte d'incident, l'autonomie serait à réexaminer. Les scopes courants expriment déjà des frontières ; aucun doublon certain ni fusion nécessaire n'est établi par cette revue.

### CMP-U785-03 — Service Orders

Recouvrement partiel : ELM-U785-08 et ELM-U785-09 ; cible Service Order Management, exemple Packing Order. La prestation et son suivi ont des appuis produit, mais une famille de documents ou de services ne devient pas automatiquement une aptitude distincte. FLOW tient la demande, les exigences et les engagements ; les exemples éditeurs traitent aussi l'exécution. Pas d'équivalence terme à terme.

Les 18 capacités couvrent des responsabilités de tailles très différentes : transport, réception, conditionnement, nettoyage, personnalisation, facturation confiée. Sales Order porte un cycle large tandis que Cleaning Order spécialise la tenue d'une prestation. C'est le principal signal d'hétérogénéité de maille, pas une anomalie démontrée.

Pour garder une famille comme capacité, vérifier : résultat métier propre ; contraintes et traitement des écarts spécifiques ; possibilité utile de mesurer sa maturité ou sa couverture séparément. Si seule la nature de prestation change, une variante ou un classement peut suffire. Labeling Order expose déjà la conformité de version d'étiquette ; Cleaning Order a un scope plus court et demande une justification plus forte de son autonomie de pilotage. Cela n'invalide pas les accords existants.

Lacune explicite U772 : les appuis SAP S/4HANA et Dynamics consultés ici concernent surtout le packing ; ils ne démontrent pas les 18 spécialisations, notamment Cleaning Order. La recherche Dynamics sur les VAS n'a pas établi d'appui spécifique à cette famille. Aucune conformité marché fiche par fiche n'est annoncée et aucune fiche n'est modifiée.

Billing Order et Payment Collection Order posent surtout une question de frontière : coordonner une demande réellement confiée peut être justifié ; recevoir simplement un statut financier ne suffit pas. Le scope de Payment Collection Order prévoit déjà cette réserve. Leur réalisation Beaumanoir n'est pas déduite.

### CMP-U785-04 — Connaissance et intégration

Analyse de cohérence interne, comparaison marché individuelle non établie. Inventory Tracking intègre les faits, Inventory Ledger conserve les états reconnus et Inventory Visibility compose la connaissance utilisable. Les scopes permettent de distinguer les résultats ; ce n'est pas nécessairement un découpage technique ingestion/base/écran.

Les huit vues de Master Data sont plus sensibles au découpage par objet. Leur définition doit conserver la composition, la validité et l'autorité locale nécessaires à l'action Supply. Une capacité par écran ou table serait trop fine ; l'autorité locale n'est toutefois pas une copie passive et ne doit pas être supprimée par une simplification. Aucun besoin de fusion n'est démontré.

### CMP-U785-05 — Compte global

Non équivalent : ELM-U785-02 à 05 face aux 74 capacités FLOW. Les sources servent de repères de méthode et d'échelle, sans permettre de normaliser un total exhaustif. L'hypothèse « nous sommes au-dessus de la moyenne parce que nous séparons les décisions » reste non démontrée. L'explication du volume doit aussi considérer les Services Orders, les connaissances et les ingestions, le secteur fashion et la séparation locale de l'orchestration/exécution.

## Décision recommandée

Conserver les 74 capacités pendant cette discussion. Pour chaque éventuelle scission ou fusion future, demander quel résultat durable deviendrait mieux identifiable et quelle décision de pilotage serait améliorée. Deux capacités peuvent être réalisées par le même outil ou la même équipe ; cela ne justifie pas leur fusion. À l'inverse, deux paramètres, deux techniques ou deux documents ne justifient pas deux capacités.

Le diagnostic est donc : définition compatible avec l'intention TOGAF ; finesse décisionnelle argumentable ; hétérogénéité locale à surveiller ; normalité statistique non établie. L'audit n'adopte aucun changement de capacité, de glossaire, d'accord ou de publication.
