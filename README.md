# Cartographie des capacités Beaumanoir

Base de connaissance de travail issue du dossier ChatGPT v0.1, reprise le 9 septembre 2026.

**Publication courante :** [FLOW Atlas](http://127.0.0.1:8765/) suit la version désignée par [l’index de release](modeles/release/index.json). La [restitution générée](restitutions/README.md) porte les compteurs et qualifications du snapshot publié ; le [guide des modèles](modeles/README.md) décrit le parcours. Le YAML fait autorité pour le backlog et les nouvelles publications. Les repères datés ci-dessous restent historiques.

## Objet

Construire progressivement une cartographie des capacités métier du cœur ERP commerce : achats, ventes, SAV, stocks, allocations et référentiels associés. Elle doit permettre de décrire le périmètre historique de Beaumanoir, Boardriders et Sarenza, puis d'explorer leur convergence.

La finance, le contrôle de gestion, la conformité, le design produit et la planification de saison sont exclus comme domaines. Les interfaces avec ces activités restent à expliciter. Le SI C-Log conserve son autonomie. Sources : U01, U07, F001–F016.

**Périmètre FLOW (U58/F158) :** la logistique est hors développement de la plateforme du Programme FLOW et reste en adhérence. La [frontière logistique](connaissance/23-reassort-transferts-et-promesse.md#périmètre-flow-et-adhérence-logistique) doit être décrite, sans confondre modèle fonctionnel Supply et périmètre de réalisation.

La démarche reste exploratoire : les 36 capacités sont publiées avec leurs statuts ; les neuf capacités d’Order Promising sont validées dans leur portée U95. La hiérarchie complète reste à éprouver. Les responsabilités sur l'information et les décisions éclairent les capacités métier. Elles ne remplacent pas la structure métier.

**Portée des modèles (U50) :** la capability map cible la couche transactionnelle. Un autre modèle fonctionnel orienté processus décrira la couche processus, dans l’orientation Case Management. La présence de moteurs dans les deux couches ne fusionne pas ces modèles.

## Modèles courants — 13 septembre 2026

Les modèles font autorité en **JSON**. Les Markdown conservent récits, insights, analyses, décisions argumentées et restitutions.

| Espace | Contenu | Accès |
| --- | --- | --- |
| **Release** | Les 35 capacités publiées, avec leurs validations et réserves explicites | [Version courante](modeles/release/index.json) · [lecture Markdown](restitutions/README.md) |
| **Backlog** | Modèle en réflexion, alternatives et illustrations | [Modèle JSON](modeles/backlog/model.yaml) · [lecture Markdown](restitutions/README.md) |
| **Panorama As Is** | Les trois SI actuels ; Sarenza non traité | [Index JSON](modeles/panorama-as-is/current.json) · [vue de lecture](restitutions/panorama-as-is.md) |

Publier ne vaut pas valider. La [release 2026-09-13.2](modeles/release/2026-09-13.2/model.json) conserve neuf capacités validées, les validations partielles et les capacités non validées ou en réexamen. La définition, la finalité et le rattachement ont des portées de validation distinctes.

Le [guide de structure](modeles/README.md), l’[audit du refactoring](audits/2026-09-13-structure-modeles.md) et [AGENTS.md](AGENTS.md) précisent les autorités, les preuves, la publication et les contrôles. La [feuille de route](modeles/backlog/modeling-roadmap.yaml) prévoit le niveau supérieur à définir et les relations caractérisées. L’[applicabilité aux trois SI et à FLOW cible](modeles/backlog/applicability.yaml) reste à qualifier dans un registre séparé.

Les sections suivantes retracent la progression des analyses ; leurs versions datées ne remplacent pas les pointeurs JSON courants.

## Git et workflows

Le dépôt distant est [laurent-sintes/Urbanisation-SCM](https://github.com/laurent-sintes/Urbanisation-SCM), configuré comme `origin`. Le backlog reste l’espace de travail par défaut.

- [`commit`](skills/commit/SKILL.md) vérifie et enregistre les changements dans Git localement.
- [`push`](skills/push/SKILL.md) envoie les commits vers ce dépôt GitHub et vérifie la branche distante.
- [`release`](skills/release/SKILL.md) publie une version du modèle, avec ses statuts métier distincts.
- [`server-admin`](skills/server-admin/SKILL.md) pilote le serveur local FLOW Atlas.

Les caches, dépendances locales et fichiers du serveur sont ignorés ; les archives, modèles et preuves restent versionnés. Les règles détaillées sont dans [AGENTS.md](AGENTS.md).

## Par où commencer

**Explorer l’urbanisation — U117–U123 :** [FLOW Atlas, application locale](app/README.md), avec navigation évolutive, relations métier, recherche directe et accès aux sources. Lancer [Lancer-FLOW-Atlas.ps1](Lancer-FLOW-Atlas.ps1) depuis PowerShell ; Atlas affiche uniquement **Urbanisation**, depuis les releases publiées. La liste des versions présente la plus récente en premier ; la vue courante se rafraîchit automatiquement après une publication. Les statuts, métadonnées de version et sources restent consultables. Les skills [`release`](skills/release/SKILL.md) et [`server-admin`](skills/server-admin/SKILL.md) servent à publier les évolutions du modèle et à administrer le serveur local. La [proposition et le prototype U104](prototypes/model-explorer/README.md) restent disponibles comme historique de conception.

**Décision U95 — Order Promising :** [neuf capacités validées par Laurent](connaissance/25-domaines-coeur-et-epreuve-recits.md#d03-promesse-de-fourniture), quatre actions et cinq décisions. ATP est associé à la promesse ; CTP reste au glossaire, placement différé.

**Revue domaine par domaine — U68 :** [D01 Inventory Management](connaissance/25-domaines-coeur-et-epreuve-recits.md#d01-stocks), finalité proposée, six aptitudes après U75 et correspondances SAP, Microsoft, TM Forum, ARTS et Guild qualifiées. U69/C50 clarifient positions, mouvements, visibilité et écarts ; la séparation des capacités reste à éprouver. U70 interroge ce rattachement ; U74 place Supply Protection dans Inventory Management ; U75 y ajoute la réservation et rattache l’affectation à Order Promising. D02 reste en réexamen. U78 remet aussi la réservation en discussion avec une [comparaison SAP/Microsoft détaillée](marche/allocation-reservation-sap-microsoft.md#réservation-et-frontière-inventory-management-order-promising-u78). U76 distingue physique, logique et virtuel ; U77 examine leur partage entre Inventory Management et Order Promising.

**Nomenclature et capacités U66/U67 :** noms anglais, avec réemploi du marché, notamment Inventory Management. Supply Protection et Supply Assignment expriment des aptitudes métier ; Allocation Run est un mécanisme de réalisation. La [correction de cette distinction](connaissance/04-corrections.md#c49) conserve séparément le rang natif SAP, lorsqu’il est établi.

**Noms de marché U65 :** [correspondances des dix domaines cœur](marche/correspondances-domaines-coeur.md) avec SAP, Microsoft et TM Forum, et exemples publics Guild ; les types et limites des rapprochements restent visibles.

**Jalon historique U97/U98 (P81 version 0.6) :** [dix domaines cœur, capacités et épreuve par les récits](connaissance/25-domaines-coeur-et-epreuve-recits.md). Cette version recensait 34 capacités, dont les neuf d’Order Promising validées par Laurent, et conserve l’épreuve historique de vingt cas ou mentions, avec manques, adhérences et capacités plausibles explicités. Le registre des 36 CAP historiques conserve sa provenance ; CAP001–CAP003 portent la correction de périmètre U97 ; les deux nombres portent sur des objets documentaires différents.

**Étude préalable disponible :** [comparaison des modèles du marché](marche/etudes/2026-09-09-modeles-marche/etude-comparative.md), avec dix références, matrices de contenu, cas détaillés et annexes de preuves. Demandée en U25 avant de poursuivre la carte.

**Priorité de fond : explorer la couche transactionnelle** (U21). La [première vue des capacités du socle](connaissance/16-capacites-socle-transactionnel.md) propose huit familles à partir des récits Beaumanoir, avec leurs appuis, limites et liens au catalogue global.

L’[exploration courante du bloc stock](connaissance/17-exploration-bloc-stock.md) examine les familles de capacités et les sens possibles du stock virtuel/logique, sans fixer le découpage. Le [complément SAP/Microsoft](marche/allocation-reservation-sap-microsoft.md) précise allocation, réservation, affectation et réexamen, avec les limites de l’avant/après SAP. Les [politiques du périmètre historique de Beaumanoir et de Boardriders, et frontière Order Promising](connaissance/18-politiques-engagement-gbm-brd.md) précisent désormais les comportements nécessaires et le rôle du réexamen des promesses.

1. Lire les [corrections](connaissance/04-corrections.md) avant de réutiliser les formulations historiques.
2. Consulter les [assertions](connaissance/02-assertions.md), puis les [composants](connaissance/07-composants.md) et les [flux](connaissance/08-flux.md).
3. Reprendre les [questions](connaissance/06-questions.md) et les [capacités candidates](connaissance/09-capacites-candidates.md) pour poursuivre l'exploration.

Le [détail des fonctions SAP et Microsoft](marche/detail-fonctions-stock-promesse.md) distingue les opérations, objets et règles documentés des sous-capacités métier à construire.

Le [glossaire métier](connaissance/19-glossaire-metier.md) décrit 50 notions et 25 verbes. La définition de capacité réaffirmée par Laurent en U33 guide la démarche ; OMS et Supply reprennent ses définitions locales U55/U56 ; les distinctions objets/faits/documents conservent la provenance U61/U62. Les définitions proposées sont signalées comme telles. U34/U35 clarifient le mot fonction et mettent tenir en réexamen. U37–U42 ajoutent une [hypothèse sur les natures de capacité et leur finalité](connaissance/19-glossaire-metier.md#hypothèse-sur-les-natures-de-capacité), avec une colonne pour expliciter le pourquoi.

U43/U44 ouvrent le [premier niveau de regroupement](marche/premier-niveau-regroupement-capacites.md) : six références comparées et hypothèse Univers → Domaine → Capacité rapportée par Laurent, avec une option plus compacte. Nature et Finalité restent distinctes. U45/U46 précisent le domaine comme espace de problèmes liés, avec un appui DDD sourcé ; la conception des bounded contexts reste hors de cette étape. La convention et les rattachements restent à discuter.

U47 ouvre une [première liste de domaines à éprouver](connaissance/20-domaines-candidats.md) : six périmètres de travail pour le noyau décrit, des cas existants pour tester leurs frontières et les zones moins documentées à compléter. Méthode et liste proposées, sans validation de rattachement.

U48 complète les achats par [trois cas et une analyse de l’orchestration](connaissance/21-achats-et-orchestration.md) : fabrication complète fournisseur, catalogue de produits finis et fabrication à façon. La note distingue aptitudes, coordination métier et moyen transverse, avec sources SAP/OMG/Microsoft et questions sur les ressources confiées.

U49 précise des [moteurs de décision, détermination et orchestration dans les deux couches](connaissance/15-orientation-deux-couches.md#décision-détermination-et-orchestration-dans-les-deux-couches), avec Case Management dans la couche processus. Le choix d’une même solution ou de solutions distinctes reste ouvert ; C40 corrige le placement trop large de l’orchestration dans la seule couche haute.

U51 compare les [options de découpage des domaines du socle](connaissance/22-options-domaines-socle.md) : référence principale, grandes familles ou domaines de problèmes. Dix périmètres sont proposés pour discussion, avec frontières alternatives et limites de preuve. U52 confirme le travail des frontières par les cas et reconnaît Order Promising comme domaine problématique, tandis que Source to Pay reste une lecture processus ; aucune liste complète adoptée.

U53–U57 précisent le [cœur de Supply et sa frontière avec l’OMS](connaissance/23-reassort-transferts-et-promesse.md). L’OMS est défini comme Case Management préimplémenté de vente ; la Supply comme transactionnel de contrôle, orchestration et optimisation logistiques, avec intelligence propre de rééquilibrage, prévision et gestion des impondérables. Le cas du réassort et les sources SAP éprouvent les frontières de promesse et d’exécution.

U59 examine l’[adéquation de la maille SAP et les alternatives orientées domaines](marche/premier-niveau-regroupement-capacites.md#granularité-sap-et-autres-modèles-orientés-domaines) : Business Areas comme première grille d’épreuve proposée ; BIAN et TM Forum ajoutés en complément d’IBM et de la Guild. Ni catalogue principal ni hiérarchie locale adoptés.

U60 précise les priorités : IBM historique, réserve sur BIAN, intérêt maintenu pour TM Forum. L’[approfondissement BIZBOK](marche/bizbok-capacites-et-domaines.md) examine maintenant des extraits 15.0 ©2026 et le métamodèle 2024 : objet central, aptitude, réalisation et niveaux. Un modèle Retail/Wholesale livré reste non établi.

U61/U62 précisent les [objets métier, faits de gestion et documents](connaissance/24-capacites-objets-et-faits.md), avec une comparaison SAP, BIZBOK et TM Forum. Leur sens peut émerger avec les capacités et les cas, puis être affiné avec la conception. Les objets existent dans les deux couches : Demande de réassort est l’exemple donné pour le modèle processus. L’enrichissement des descriptions reste proposé.

**Référentiels externes — U97/U98 :** [Party / Role, Agreement et Catalog](connaissance/25-domaines-coeur-et-epreuve-recits.md#référentiels-ingérés-u97u98) sont contigus, avec une seule ingestion chacun. La plateforme ne les administre ni ne vérifie leurs données. Les commandes restent distinctes des Agreements ; Order Promising applique les conditions reçues. [Audit de correction](audits/2026-09-11-reference-data-boundaries.md), autorités INF18–INF20 et règle dans AGENTS.

**Audit marché U99 :** [séparation achats/ventes, référentiels, prix et 34 capacités](audits/2026-09-11-modele-marche-achats-ventes-referentiels.md). Les résultats proposent des clarifications et évolutions ; l’audit portait sur dix domaines et 34 capacités à cette date. Les évolutions U100–U103 et la release JSON lui succèdent.

## Registres

- [Métadonnées de la consolidation initiale](connaissance/00-metadonnees.md).
- [Contributions utilisateur](connaissance/01-contributions-utilisateur.md).
- [Assertions et orientations déclarées](connaissance/02-assertions.md).
- [Contributions assistant consolidées](connaissance/03-contributions-assistant.md).
- [Corrections et précautions de lecture](connaissance/04-corrections.md).
- [Propositions à éprouver](connaissance/05-propositions.md).
- [Questions et réponses](connaissance/06-questions.md).
- [Organisations et applications](connaissance/07-composants.md).
- [Flux décrits](connaissance/08-flux.md).
- [Capacités candidates](connaissance/09-capacites-candidates.md).
- [Autorités sur les informations](connaissance/10-autorites-information.md).
- [Responsabilités de décision](connaissance/11-responsabilites-decision.md).
- [Références externes](connaissance/12-references-externes.md).
- [Audit de couverture initial](connaissance/13-audit-couverture.md).
- [Historique de la consolidation initiale](connaissance/14-historique-source.md).

## Orientation d’urbanisation

Laurent précise deux couches avec modèles, objets, persistances et urbanisations propres, reliées par contrats durables : socle ERP opérationnel et processus/organisation/situations. L’[analyse de cette orientation](connaissance/15-orientation-deux-couches.md) conserve les apports U18/U19/U20, les rapprochements aux standards et les frontières restant à définir.

## Comparaison au marché

Le [référentiel de marché](marche/README.md) rassemble les références standard et éditeurs, leur rôle, les contenus examinés et les [correspondances avec Beaumanoir](marche/comparaisons.md). Il permet de comparer notre carte au fil des évolutions, selon une [méthode commune](marche/methode.md).

Le noyau initial comprend TOGAF, ArchiMate, BIZBOK, SAP RBA, Oracle RRM, IBM CBM, APQC Retail et ARTS/OMG. Les références de structure, de processus et de données restent distinctes. Aucune structure principale ni équivalence n'est encore validée.

La [comparaison du stock chez SAP](marche/sap-stock.md), issue de U22/U23, précise le niveau Business Area et distingue modèle de capacités et documentation S/4HANA. Elle ouvre l’exploration des inventaires physiques en Q065.

## Sources conservées

- [Référentiel JSON initial](archive/referentiel.json) : instantané structuré de la consolidation ChatGPT v0.1.
- [Dossier Word initial](archive/Beaumanoir_Dossier_reference_v0.1.docx) : exposé narratif initial.
- [Dossier PDF initial](archive/Beaumanoir_Dossier_reference_v0.1.pdf) : document fourni avec le Word.

Ces trois fichiers sont conservés sans modification dans `archive/`. Les contributions U01–U13 ont été comparées à la conversation d'origine : leurs textes sont identiques après normalisation de la mise en forme. Les deux demandes ultérieures du fil sont importées sous U16–U17, sans renuméroter les apports Codex. Le Word et le PDF restent consultables pour les développements narratifs ; leur équivalence n'a pas été auditée.

## Audit de la conversation originale

Le [rapport du 9 septembre 2026](audits/2026-09-09-conversation-chatgpt.md) décrit la couverture, les omissions retrouvées et les corrections. La [copie de lecture des 30 messages](archive/conversation-chatgpt-2026-09-09.md) et la [capture structurée](archive/conversation-chatgpt-2026-09-09.json) sont conservées dans `archive/`. Le ZIP supplémentaire annoncé par ChatGPT n'a pas été récupéré ; son contenu reste hors audit.

## Mise à jour

Les fichiers de `connaissance/` deviennent les registres de travail. Le JSON, le Word et le PDF initiaux sont des archives et ne sont pas synchronisés automatiquement avec eux. Les évolutions sont décrites dans le [journal](JOURNAL.md), selon l'[objectif et les règles de fonctionnement](AGENTS.md).

## Prochaine étape proposée

Challenger les [frontières de P81](connaissance/25-domaines-coeur-et-epreuve-recits.md#frontières-à-challenger-en-premier), en commençant par stock, disponibilité/protection et promesse, puis les obligations commerciales et l’exécution sur les achats à façon et le réassort entre sociétés. La matrice des récits permet de préciser les manques sans prétendre couvrir tout l’existant ; conditions commerciales et droits après fourniture restent particulièrement peu documentés.

U79 précise les [stocks futurs, du potentiel fournisseur à la réception](connaissance/25-domaines-coeur-et-epreuve-recits.md#stock-futur-potentiel-et-ressources-attendues-u79) : représentation anticipée, fermeté, destination et affectation possible ; frontières encore proposées et précautions de double compte.

U80 confirme le stock futur dans Inventory Management et Order Promising ; la date de promesse dépend aussi de l’approvisionnement et de la disponibilité amont. La [analyse historique de la carte](connaissance/25-domaines-coeur-et-epreuve-recits.md#stock-futur-potentiel-et-ressources-attendues-u79) distingue cette orientation des responsabilités détaillées encore proposées.

U81 clarifie les stocks physiques et logiques dans Inventory Management, et le stock virtuel calculé puis utilisé pour la promesse dans Order Promising. Définitions D01.a/b/c et D03.a explicitées dans la [carte](connaissance/25-domaines-coeur-et-epreuve-recits.md), avec historique en C55 ; ressources futures conservées dans les deux modèles.

U82 ouvre la [revue des noms de connaissance et de comptage du stock](connaissance/25-domaines-coeur-et-epreuve-recits.md#noms-des-capacités-de-stock-revue-u82) : termes SAP/Microsoft vérifiés, propositions locales et finalité d’exactitude distingués. Aucun nouveau libellé définitivement adopté.

U83 propose une [version D01 à cinq capacités](connaissance/25-domaines-coeur-et-epreuve-recits.md#proposition-de-cinq-capacités-d01-u83), P82 : noms courts et réunion de la connaissance du stock avec son évolution. Alternative à discuter ; la carte P81 à 35 aptitudes et ses identifiants restent conservés.

U86 retient **Stocktaking**, en un mot, et Inventory accuracy comme Finalité ; nom appliqué à D01.d et à la [vue D01 proposée](connaissance/25-domaines-coeur-et-epreuve-recits.md#proposition-de-cinq-capacités-d01-u83). Reservation est déjà retenu en U84 ; définitions et repères conservés.

U87/U88 : [audit d’Order Promising](audits/2026-09-11-order-promising.md) et [vue à quatre noms courts](connaissance/25-domaines-coeur-et-epreuve-recits.md#proposition-de-présentation-u87u88). Faisabilité, confirmation, affectation et révision distinguées ; P83 proposée, pas de renumérotation ni retrait de domaine appliqué.

U89 : [comparaison des capacités d’Order Promising au marché](marche/order-promising-comparaison-capacites.md), noms, nature et couverture. Quatre hypothèses locales, cinq feuilles SAP RBA visibles ; écarts d’allocation, d’alternatives et de création de fourniture à éprouver. Aucun nouveau découpage adopté.

U90 : [vue de discussion Order Promising](connaissance/25-domaines-coeur-et-epreuve-recits.md#proposition-de-présentation-u87u88) avec les candidats Promise Verification et Promise Confirmation, puis Supply Assignment et Promise Revision. ATP ajouté au glossaire, appui APICS distinct des éditeurs ; couverture encore à éprouver.

U91/U92 : [capacités de décision et domaines propriétaires proposés](connaissance/25-domaines-coeur-et-epreuve-recits.md#capacités-de-décision-ajoutées-à-lexploration-u91). Promise Verification est rejeté ; Promise Formulation est proposé pour faire naître une promesse. Les ajouts restent à positionner en granularité et à éprouver.

U93 : [Promise Proposal et décision d’acheminement](connaissance/25-domaines-coeur-et-epreuve-recits.md#capacités-de-décision-ajoutées-à-lexploration-u91). Le choix de source est complété par Fulfillment Route Decision ; Promise Formulation est rejeté. Propriétaires et granularité proposés, logistique en adhérence.

U94 : [ATP et CTP chez Microsoft](marche/order-promising-comparaison-capacites.md#atp-et-ctp-chez-microsoft-u94), avec distinction Supply Chain Management / Business Central et application proposée à Promise Proposal. ATP inclut du futur ; CTP ajoute les possibilités de fournir le manque.

U96 : [première revue de Commercial Commitments — D04](connaissance/25-domaines-coeur-et-epreuve-recits.md#première-revue-commercial-commitments-u96). Finalité, quatre noms courts proposés, appuis SAP/Microsoft, cas d’achat et frontières promesse/obligations/retours ; domaine commun achats/ventes à challenger. P84 non validée.

U100 : [Supply orientée documents d’autorisation et référentiel article autonome](connaissance/26-supply-documents-autorisations.md). Les parcours commerciaux restent dans le modèle processus ; D04/D07 sont à reprendre sur autorisation, engagement et faits. La [jalon P81 0.7](connaissance/25-domaines-coeur-et-epreuve-recits.md) compte onze domaines et 35 aptitudes, avec Product Reference Ingestion D08.d et les neuf capacités d’Order Promising toujours validées. Les anciennes administrations article restent retirées.

U101 : [séparer les modèles de référence et regrouper leur présentation](marche/regroupement-referentiels.md). Comparaison SAP MDG, Microsoft, TM Forum et Guild ; proposition Business References avec quatre sujets autonomes, sans fusion ni nouveau niveau adopté.

U102 : [Fulfillment Network](connaissance/25-domaines-coeur-et-epreuve-recits.md#d13-fulfillment-network) rejoint les références de la carte 0.8, avec réception proposée D13.a. Party/lieu distincts confirmés ; contenu et maîtres à préciser. Cinq références, douze repères de domaines et 36 aptitudes ; le regroupement reste ouvert.

U103 : **[Business References](connaissance/25-domaines-coeur-et-epreuve-recits.md#business-references)** est retenu comme groupe de présentation des cinq références. Carte 0.9 réorganisée : sept domaines transactionnels de travail et ce groupe ; modèles, ingestions et repères détaillés conservés. Les maîtres et le contenu détaillé du réseau restent à préciser.
