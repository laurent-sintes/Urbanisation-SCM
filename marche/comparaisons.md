# Comparaisons Beaumanoir–marché

État : 2026-09-09. Auteur : Codex. Statut global : exploratoire, aucune équivalence ni adoption validée. Sources locales : [capacités candidates](../connaissance/09-capacites-candidates.md), [corrections](../connaissance/04-corrections.md), [questions](../connaissance/06-questions.md). Les éléments externes et leurs versions sont décrits dans [elements.md](elements.md).

## Comparaison de structure

### CMP001

- Élément externe : ELM001, SAP RBA, version du catalogue non établie.
- Élément local : U01 et Q001, proposition Domaine / Capacité / Sous-capacité.
- Relation : comparaison de convention, pas correspondance terme à terme.
- Constat corrigé (U24/C31, 2026-09-09) : l’option locale envisage trois niveaux ; la présentation SAP complète ajoute Enterprise Domain au-dessus de Business Domain, Business Area et Business Capability. Comparer les rôles des niveaux et leur granularité, sans inférer une équivalence du nombre de niveaux.
- Adaptation proposée : préciser pour chaque niveau s'il regroupe ou s'il décrit une capacité, avant d'y rattacher les CAP.
- Justification : éviter qu'une ressemblance de libellés impose une granularité inadaptée.
- Preuve : principe externe consulté ; rapprochement à valider par Laurent. Aucun changement de hiérarchie effectué.

### CMP002

- Élément externe : ELM002, SAP RBA, même état documentaire.
- Éléments locaux : registres CAP, APP/ORG et FL ; orientation U02.
- Relation : appui méthodologique.
- Constat local : les registres séparent déjà capacités, composants et flux. Un flux de données ne décrit pas nécessairement un processus métier.
- Adaptation proposée : relier explicitement les activités d'un parcours aux capacités mobilisées et aux applications qui les soutiennent.
- Justification : faciliter une comparaison indépendante des produits et des chaînes applicatives existantes.
- Preuve : principe externe consulté ; aucune conformité SAP ni équivalence des deux plateformes revendiquée.

## Premiers rapprochements de contenu

Les CMP003–CMP008 utilisent les libellés de l'exemple IBM de 2005. Dans chaque ligne, la relation est une **piste lexicale**, la confiance sémantique est **faible**, la décision est **à instruire** et aucune adaptation n'est appliquée. Il faut une définition plus précise avant de conclure à une équivalence, une inclusion ou un recouvrement.

| ID | Élément externe | Capacités locales | Adaptation envisagée et justification | Écart à instruire |
| --- | --- | --- | --- | --- |
| CMP003 | ELM003 | CAP001 | Garder la maille opérationnelle SKU pour comparer un résultat métier précis. | Inclut-il la création des articles, leur diffusion et les attributs commerciaux ? |
| CMP004 | ELM004 | CAP007, CAP008, CAP009, CAP035 | Conserver les distinctions protection, tenue, révision et arbitrage pour exposer les responsabilités. | Distinguer protection GBM et arbitrage BRD ; ne pas importer de repriorisation Gold dans GBM. |
| CMP005 | ELM005 | CAP011, CAP012, CAP013 | Préserver les responsabilités distinctes d'IRMA et de Storeland. | Paramétrage, application et déclenchement constituent-ils des sous-capacités ou des activités ? |
| CMP006 | ELM006 | CAP014 | Distinguer commande client et demandes d'exécution. | Autorité de commande et périmètre exact du suivi à clarifier. |
| CMP007 | ELM007 | CAP033 | Examiner le SAV de Sarenza comme cas d'épreuve. | Le service client dépasse potentiellement le seul après-vente. |
| CMP008 | ELM008 | CAP034 | Séparer l'autorisation commerciale du retour de son exécution physique. | La logistique des retours ne couvre pas nécessairement l'autorisation ou l'échange ; frontière C-Log à préserver. |

Les justifications sont des analyses Codex à partir des connaissances locales, pas des définitions attribuées à IBM. Elles ne changent aucun statut métier.

## Orientation de deux couches métier

CMP009–CMP012 : auteur Codex, date 2026-09-09, état local U18–U20 et P60–P62 ; voir la [note d'orientation](../connaissance/15-orientation-deux-couches.md). Relation commune : **appui méthodologique**, sans équivalence. Statut : rapprochements à instruire ; aucun standard, format ou choix d'exécution adopté. U19 confirme un modèle métier, des objets, une persistance et une urbanisation propres à chaque couche. U20 précise la généricité du socle par rapport au métier de l'entreprise. Cette analyse ne renomme, ne déplace et ne reclasse aucune CAP, notamment CAP019 et CAP033.

### CMP009

- Élément externe : [ELM009](elements.md#elm009), SAP, état documentaire daté dans MKT04.
- Éléments locaux : F108, qualification du modèle du socle comme *Business Capability* ; F110, généricité par rapport au métier exercé ; U18–U20.
- Adaptation proposée : utiliser « capacités métier génériques du socle » pour préciser ce modèle dans notre périmètre commerce ; relier les deux urbanisations métier à leurs réalisations. La généricité se rapporte au métier de l'entreprise et se distingue du fonctionnement organisationnel.
- Justification : l'indépendance des capacités vis-à-vis des solutions chez SAP appuie cette intention. Son terme *Business Capability* a une portée plus large que le seul transactionnel ; conserver cette différence de périmètre permet la comparaison. La couche haute garde son propre modèle métier ; le socle n'est assimilé ni à un moteur universel ni à du simple CRUD.
- Limite de preuve : rapprochement terminologique proposé ; aucune équivalence entre les deux couches Beaumanoir et les modèles SAP n'est démontrée.

### CMP010

- Élément externe : [ELM010](elements.md#elm010), SOA-RM 1.0.
- Élément local : F107, contrats API/EDA durables entre les couches ; U18/U19.
- Adaptation proposée : préciser capacités accessibles, objets échangés, effets attendus et conditions d'usage de chaque contrat.
- Justification : service, description et contrat permettent de séparer l'accès à une capacité de sa réalisation.
- Limite de preuve : ces concepts ne prouvent ni découplage effectif ni stabilité future ; frontières, garanties et règles d'évolution restent locales et à instruire.

### CMP011

- Élément externe : [ELM011](elements.md#elm011), CMMN 1.1.
- Élément local : F109, modèle, objets, persistance et urbanisation propres à chaque couche ; U19.
- Adaptation proposée : éprouver les concepts de dossier, informations, rôles et tâches sur les situations longues de la couche haute, en les reliant au socle par contrats.
- Justification : ce modèle de dossier fournit un appui pour décrire un ensemble métier propre, au-delà d'un simple enchaînement d'appels.
- Limite de preuve : CMMN ne valide pas à lui seul nos frontières d'urbanisme, le stockage ou les droits d'accès. Aucun choix CMMN ni reclassement de capacités n'est effectué.

### CMP012

- Éléments externes : [ELM012](elements.md#elm012), OpenAPI 3.2.0 ; [ELM013](elements.md#elm013), AsyncAPI 3.0.0.
- Élément local : F107, contrats API/EDA ; U18/U19.
- Adaptation proposée : examiner ces formats pour décrire respectivement les interfaces HTTP et à messages, à partir de contrats métier définis.
- Justification : ils fournissent des représentations documentables indépendantes d'un produit d'exécution.
- Limite de preuve : les introductions seules ne valident ni couverture détaillée ni conformité ; compatibilité, versions, autorisations et garanties sémantiques restent à définir. Aucun format adopté.

## Stock dans SAP

CMP013–CMP017 : auteur Codex, date 2026-09-09, état local U22/U23, CAP inchangées. Statut commun : **rapprochements proposés, à instruire** ; aucune équivalence ou adoption. Les versions et localisateurs externes sont dans ELM014–ELM018 et MKT04/MKT13. Voir la [note SAP-stock](sap-stock.md).

### CMP013

- Élément externe : [ELM014](elements.md#elm014), extrait de hiérarchie SAP RBA, complété après U24/C31 par Enterprise Domain au-dessus du Business Domain (2026-09-09).
- Éléments locaux : P63/P64 et question U23 ; familles stock/disponibilité, protections/engagements et frontière C-Log.
- Relation : appui méthodologique.
- Adaptation proposée : examiner « Gestion des stocks » comme domaine local en documentant qu’il correspond chez SAP à un Business Area ; distinguer gestion des stocks, promesse et entrepôt.
- Justification : ne pas confondre niveau de regroupement, capacité et organisation ; conserver les quatre niveaux visibles de la référence lors du rapprochement.
- Limite : définitions détaillées des feuilles absentes ; cet exemple ne valide ni niveaux locaux ni découpage des deux couches. Aucune CAP C-Log n’est comparée individuellement ici.

### CMP014

- Élément externe : [ELM015](elements.md#elm015), description fonctionnelle des stocks S/4HANA.
- Éléments locaux : CAP004 et CAP005 ; U03/U04, INF01–INF03.
- Relation : appui sémantique ; confiance limitée par le détail local disponible.
- Adaptation proposée : expliciter quantités, états et mouvements tenus par une autorité, puis provenance et fraîcheur des représentations exposées.
- Justification : les états enregistrés éclairent le contenu à distinguer de sa copie ; la documentation produit ne définit pas à elle seule notre capacité de visibilité.
- Limite : CAP004 demeure magasin ; autorité entrepôt inconnue. La finance reste hors domaine. Aucun effet de temps réel ou absence de survente démontré.

### CMP015

- Éléments externes : [ELM014](elements.md#elm014), libellé métier du contrôle de disponibilité ; [ELM016](elements.md#elm016), éclairage fonctionnel aATP.
- Éléments locaux : CAP006 et CAP010 ; Q012/Q018/Q038.
- Relation : appui sémantique partiel, définition locale à compléter.
- Adaptation proposée : distinguer quantité/date confirmable et engagement tenu avec son cycle de modification/libération ; préciser leurs effets réciproques.
- Justification : consulter le stock ne suffit pas à définir la promesse ; une confirmation ne définit pas tout le modèle d’engagement.
- Limite : le produit peut considérer des entrées futures mais la vente GBM nominale sur stock est conservée. Réservation technique, moment d’engagement, invariants de concurrence et garanties locales restent inconnus.

### CMP016

- Éléments externes : [ELM017](elements.md#elm017) et [ELM018](elements.md#elm018), fonctions de protection et allocation S/4HANA.
- Éléments locaux : CAP007/CAP008/CAP009/CAP035 ; U02/U10 ; Q029–Q032/Q049.
- Relation : appui sémantique, sans équivalence de mécanisme.
- Adaptation proposée : distinguer quantité protégée pour un groupe, limite de confirmation, révision des paramètres et arbitrage sur des engagements.
- Justification : le mot allocation recouvre plusieurs résultats et responsabilités possibles.
- Limite : populations, unités, horizons et application MAP à préciser. Objets republiés et effet sur engagements inconnus. Ne pas importer de repriorisation Gold dans GBM ni assimiler ce contrôle à l’ARun utilisé chez Boardriders.

### CMP017

- Éléments externes : [ELM014](elements.md#elm014), feuille d’inventaire physique ; [ELM015](elements.md#elm015), comptage et traitement des différences.
- Éléments locaux : CAP004, P64 et Q065.
- Relation : appui sémantique et recherche d’un manque de description.
- Adaptation proposée : explorer constats de comptage, écarts et corrections, ainsi que leurs effets sur disponibilité et engagements ; distinguer organisation de campagne et enregistrement des faits.
- Justification : états/mouvements ne rendent pas explicite ce contenu ; les écarts de réception d’achat de P08 ne couvrent pas l’inventaire.
- Limite : manque de connaissance, pas capacité déclarée absente chez Beaumanoir. R20 mentionne des fonctions d’inventaire d’un produit sans prouver leur usage GBM. Aucun nouveau candidat ni élargissement à l’autorité C-Log.

## Périmètre restant à comparer

Les groupes ci-dessous orientent les recherches ; ils ne constituent pas des correspondances déjà prouvées.

| Capacités | Recherche prioritaire proposée | État |
| --- | --- | --- |
| CAP002, CAP003 | Définitions des référentiels et conditions dans SAP / ARTS | Élément externe précis non examiné |
| CAP015, CAP016, CAP017, CAP018, CAP019 | Exécution omnicanale et exceptions dans Oracle ; contrôle APQC | Élément externe précis non examiné |
| CAP020, CAP021, CAP022, CAP023, CAP024, CAP025 | Contrats et parcours logistiques dans Oracle / APQC | Élément externe précis non examiné ; C-Log reste une frontière |
| CAP026, CAP027, CAP028 | Interfaces de planification dans SAP / APQC | Élément externe précis non examiné ; maintien des exclusions amont |
| CAP029 | Demande d’achat et sous-traitance SAP | Complément U48 : rapprochement partiel ELM043/CMP030 ; statut ferme et document MAP non assimilés |
| CAP030, CAP031, CAP032 | Achats et suivi fournisseur dans SAP / Oracle / APQC | Fiches non comparées à un élément précis ; la lecture U48 de sous-traitance ne suffit pas à établir ces rapprochements |
| CAP036 | Préparation/expédition magasin dans Oracle / APQC | Candidat restitué à l’audit du fil le 2026-09-09 ; élément externe précis non examiné |

Bilan après U22/U23 : 15 capacités disposent d’au moins un rapprochement documentaire proposé, et 21 restent sans comparaison d’élément précis. Les 11 pistes lexicales IBM sont conservées ; SAP apporte des appuis à huit CAP, dont quatre déjà citées par IBM. Ce décompte mesure le travail documentaire, pas une couverture fonctionnelle démontrée. Zéro équivalence validée. La pertinence pour le B2B Boardriders et le modèle de revente/SAV Sarenza reste à démontrer.

## Vue exploratoire du socle

La [vue P63 du 2026-09-09](../connaissance/16-capacites-socle-transactionnel.md), issue de U21, propose huit familles d’exploration du socle. CMP003–CMP008 restent des pistes lexicales sur les CAP citées, sans équivalence des familles ni validation de leur rattachement. À sa création, 11 capacités avaient une piste lexicale et 25 restaient sans comparaison précise. Le complément SAP U22/U23 ci-dessus porte désormais ce suivi à 15 capacités avec rapprochement et 21 sans comparaison précise. Aucune définition CAP n’est modifiée.

## Reprise lors d'une évolution

Quand une capacité change, réexaminer les CMP qui la citent. Si sa définition, sa maille ou son périmètre évolue, marquer le rapprochement « à revalider » et dater la modification. Une capacité nouvelle doit recevoir une correspondance argumentée ou le statut « non comparée » ; elle ne doit pas être déclarée spécifique à Beaumanoir par défaut.

## Étude comparative des modèles

### CMP018

- Éléments externes : ELM001/ELM014 et ELM019–ELM030 ; références MKT01–MKT08/MKT14/MKT15, éclairage fonctionnel MKT13.
- Élément local : U25 ; [étude comparative](etudes/2026-09-09-modeles-marche/etude-comparative.md) ; Q001.
- Relation : appui méthodologique à la comparaison des structures et contenus.
- Constat : proximité de notion capacité, thèmes récurrents et niveaux de natures différentes. Les matrices comparent des modèles externes ; elles ne constituent pas un nouveau relevé exhaustif de correspondances avec les CAP locales.
- Adaptation proposée : qualifier nature, objet, résultat, périmètre et granularité avant de comparer les positions ; séparer niveaux, catégories, responsabilités et réalisation.
- Justification : les mêmes thèmes sont classés différemment selon l’objectif du modèle ; un chemin ne démontre pas l’équivalence.
- Preuve et limite : sources examinées selon leurs éditions et accès datés dans l’étude ; détails parfois absents ou historiques. Aucune équivalence de catalogue, conformité locale ou hiérarchie principale validée.
- Auteur/date/statut : Codex, 2026-09-09, analyse proposée.

### CMP019

- Éléments externes : ELM021 (frontières/décomposition) ; ELM023 (identité et chemin) ; ELM027 (déplacements documentés du catalogue Microsoft).
- Élément local : P65 ; méthode de maintenance ; Q001.
- Relation : appui méthodologique.
- Adaptation proposée : conserver une identité locale stable, plusieurs correspondances externes typées et versionnées, et un résultat métier explicite ; examiner objet/résultat/périmètre/granularité avant toute équivalence.
- Justification : distinguer une évolution de classement d’une évolution du besoin ; éviter de fusionner données, aptitudes, parcours et fonctions de produit.
- Preuve et limite : règle locale proposée à partir d’exemples sourcés ; ne fixe ni niveaux locaux ni découpage des applications. Les 36 CAP conservent leurs définitions et statuts.
- Auteur/date/statut : Codex, 2026-09-09, proposition à éprouver, aucun valideur métier.

## Exploration du bloc stock et du stock logique

### CMP020

- Éléments externes : ELM014, hiérarchie SAP RBA ; ELM024, ARTS vue 07620 ; ELM028, allocation virtuelle Microsoft Inventory Visibility. Sources reconsultées le 2026-09-09 ; éditions et limites dans MKT04/MKT08/MKT14.
- Éléments locaux : U26/U27 ; F113/F114 ; P66 ; [exploration du bloc stock](../connaissance/17-exploration-bloc-stock.md). CAP004/CAP005/CAP006/CAP007/CAP008/CAP009/CAP010/CAP035 citées dans la vue, sans changement de définition.
- Relation : appui méthodologique et sémantique, sans équivalence des blocs.
- Constat : la gestion des états/mouvements et la promesse sont des aires distinctes chez SAP ; Microsoft distingue allocation virtuelle de groupe et réservation de transaction ; ARTS distingue effets sur physique et disponible.
- Adaptation proposée : rattacher les opérations à leurs objets, définir disponibilité par usage/horizon et distinguer pools logiques des positions physiques. Une vue transverse ne transfère pas les autorités de modification. Le statut de stock virtuel/logique reste à préciser dans Q066.
- Justification : le bloc Inventory local rassemble des responsabilités réparties autrement dans le marché ; la famille Management mélange des effets sur stock et allocation. La présence d’un pool dans un produit ne prouve pas un quatrième domaine standard.
- Limite de preuve : proposition locale ; pas de trois applications/persistances imposées, ni d’extension de l’autorité CAP004 aux entrepôts. Aucun fonctionnement MAP/ARun ni politique de vente sur stock futur déduit. Ces CAP étaient déjà rapprochées : le total demeure 15 CAP avec rapprochement documentaire et 21 sans comparaison précise.
- Auteur/date/statut : Codex, 2026-09-09, proposition à éprouver ; aucune équivalence ou hiérarchie validée.

## Vocabulaire allocation et réservation

### CMP021

- Éléments externes : ELM017/ELM018/ELM028 et ELM031–ELM033 ; MKT13/MKT14/MKT16, états documentaires datés dans la [note comparative](allocation-reservation-sap-microsoft.md).
- Éléments locaux : U28/U29, F115/F116, P67 ; CAP007/CAP008/CAP009/CAP010/CAP035 citées sans modification, Q018/Q030–Q032/Q049/Q066/Q067.
- Relation : appui sémantique et méthodologique, recouvrements partiels de finalité ; aucune équivalence de mécanisme.
- Adaptation proposée : définir séparément enveloppe de groupe, engagement d’une demande, affectation de ressource, promesse quantité/date et révision ; comparer les effets, indépendamment des noms de fonctions et des modes batch/API.
- Justification : la lisibilité du vocabulaire et la variété de mécanismes sont deux critères distincts ; le regroupement dans un traitement ne fixe pas les frontières du socle.
- Limite : pas de supériorité générale d’éditeur démontrée ni de transition unique ECC–S/4 certifiée. Aucun fonctionnement local MAP/ARun importé ; les 15 CAP avec rapprochement et 21 sans comparaison précise restent inchangées.
- Auteur/date/statut : Codex, 2026-09-09 ; proposition à éprouver, aucun valideur métier.

## Politiques GBM/BRD et promesse aux demandes

### CMP022

- Éléments externes : ELM028/ELM031/ELM032 et ELM034/ELM035 ; MKT13/MKT14, versions datées dans la [note de travail](../connaissance/18-politiques-engagement-gbm-brd.md).
- Éléments locaux : U30, F117–F120, P68, CAP006/CAP010/CAP014/CAP035 enrichies de provenance le 2026-09-09, DEC21/DEC22 ; Q018/Q049/Q068.
- Relation : appui sémantique et recouvrement partiel des comportements.
- Adaptation proposée : un modèle de ressources et engagements exprimant politiques sur stock présent, offre future admissible et révision prioritaire ; distinguer commande, confirmation et affectation.
- Justification : le besoin BRD couvre tous les comportements cités par Laurent ; le principe GBM réserve au passage de commande, avec les limites connues de sa politique.
- Limite : pas de comportement exclusif SAP déduit ; Microsoft SCM documente aussi les entrées futures. Besoin BRD explicite, configuration installée inconnue. Les résultats et statuts des CAP ne sont pas modifiés ; aucune nouvelle CAP ni équivalence validée. Ces quatre CAP étaient déjà rapprochées : bilan 15/21 inchangé.
- Auteur/date/statut : Codex, 2026-09-09 ; rapprochement proposé, besoin U30 déclaré par Laurent.

### CMP023

- Éléments externes : ELM014 (aire RBA Order Promising) et ELM036 (BOP dans la documentation de solution), avec conditions ELM035.
- Éléments locaux : U31, F121, P69, CAP010/CAP035 ; regroupement exploratoire P66/P67 ; orientation des deux couches.
- Relation : appui sémantique et méthodologique pour une frontière de responsabilité.
- Adaptation proposée : rattacher la révision des promesses à Order Promising, avec accès aux ressources et contraintes de protection et effets coordonnés sur les engagements. La capacité générique est réexaminer et réviser les promesses aux demandes.
- Justification : le résultat principal porte sur une confirmation à une demande ; mobiliser un stock ou modifier une affectation ne suffit pas à classer toute la responsabilité dans la tenue du stock.
- Limite : rattachement produit BOP corroboré, feuille RBA non vérifiée. SAP peut aussi traiter des demandes de transfert. Aucun niveau, regroupement CAP définitif ou architecture d’applications validé. Aucun nouveau périmètre de CAP comparé, bilan 15/21 conservé.
- Auteur/date/statut : Codex, 2026-09-09 ; proposition issue de l’analyse de Laurent, à éprouver.

## Granularité des fonctions de marché

### CMP024

- Éléments externes : ELM014 et ELM037–ELM039, avec ELM034 pour les politiques de réservation Microsoft ; MKT04/MKT13/MKT14, versions et localisateurs dans la [note détaillée](detail-fonctions-stock-promesse.md).
- Éléments locaux : U32/U33, F122/F123/F124, A21/A22, P70 ; P66/P67/P69 ; précision C33. CAP007/CAP008 cités comme points d’entrée analytiques, sans modification.
- Relation : appui méthodologique et sémantique à la description détaillée.
- Adaptation proposée : typer séparément capacité, objet, opération, état, règle/variante et réalisation ; décomposer la carte selon des aptitudes métier durables indépendantes de l’organisation et des outils, dans le périmètre parent ; responsabilités et contrats viennent ensuite éclairer la réalisation. Ne pas compter les API ou les paramètres.
- Justification : SAP et Microsoft offrent un détail plus fin que les fonctions précédemment présentées, mais ce détail n’est pas un catalogue de sous-capacités homogène.
- Limite : aucun étage de sous-capacités RBA vérifié ; aucun nouveau candidat, transfert de planification ou niveau local adopté. Aucune nouvelle CAP rapprochée : bilan documentaire de 15 avec rapprochement et 21 sans comparaison précise conservé, zéro équivalence validée.
- Auteur/date/statut : Codex, 2026-09-09 ; proposition méthodologique à éprouver.

## Provenance des verbes du glossaire

### CMP025

- Éléments externes : ELM040, MKT13 ; vocabulaire anglais Manage/Maintain, éditions et accès précisés dans la fiche.
- Éléments locaux : U35, F127, A22, C34, P71 et VER002 du [glossaire](../connaissance/19-glossaire-metier.md).
- Relation : appui sémantique et clarification de provenance ; aucune équivalence de capacité.
- Adaptation proposée : mettre tenir en réexamen et choisir un verbe français selon l’aptitude et le résultat visés. Gérer les protections, mettre à jour les quantités protégées et déterminer la protection applicable sont des propositions de portées différentes, pas des traductions officielles ni des synonymes.
- Justification : tenir était une formulation de l’assistant, dont Laurent conteste la clarté ; le vocabulaire éditeur ne suffit pas à fixer nos libellés.
- Limite : aucune nomenclature française SAP vérifiée, aucun remplacement automatique des CAP. Le bilan reste de 15 CAP avec rapprochement documentaire et 21 sans comparaison précise, zéro équivalence validée.
- Auteur/date/statut : Codex, 2026-09-09 ; provenance clarifiée, formulations alternatives proposées.

## Premier niveau de regroupement

### CMP026

- Éléments externes : ELM014 (SAP RBA), ELM019 (TOGAF G189), ELM021 (atelier Guild), ELM025 (IBM CBM), ELM026 (Microsoft), ELM023 (APQC), reconsultés le 2026-09-10. Sources et localisateurs dans la [note comparative](premier-niveau-regroupement-capacites.md).
- Éléments locaux : U43/U44, F134/F135, A25, P73 ; vue du socle et glossaire Nature/Finalité.
- Relation : appui méthodologique et comparaison de structures ; aucune équivalence d’élément ou de niveau.
- Adaptation proposée : éprouver Univers / Domaine / Capacité rapporté par Laurent en U44, ou Domaine / Capacité si l’étage supérieur n’apporte pas de lecture utile ; distinguer catégories, capacités composites et qualifications transverses. Le draft de juin n’a pas été consulté.
- Justification : le marché examiné ne fixe pas un même premier niveau ; capacités, composants et processus obéissent à des structures différentes.
- Limite : supports historiques explicitement datés, catalogues complets non acquis. Stock/Promesse sont des exemples locaux, avec disponibilité et engagements à positionner. Aucun domaine complet comparé par sa seule étiquette, aucune nouvelle CAP rapprochée : bilan 15 avec rapprochement documentaire et 21 sans comparaison précise, zéro équivalence validée.
- Auteur/date/statut : Codex, 2026-09-10 ; proposition à éprouver, aucun classement métier validé.

## Sens du domaine avec DDD

### CMP027

- Élément externe : ELM041, MKT17, définitions d’Evans ©2015, page vi ; consultation du 2026-09-10.
- Éléments locaux : U45/U46, F136–F138, A25/A26/P73, C37/C38 et TER030.
- Relation : appui sémantique et méthodologique ; pas équivalence de hiérarchie ou de capacité.
- Adaptation proposée : partir d’un espace cohérent de problèmes métier liés entre eux, expliciter les liens, concepts et règles, puis déterminer les capacités nécessaires ; classer ensuite ces capacités dans la carte. La conception des bounded contexts est hors de l’étape actuelle selon U46.
- Justification : préciser la cohérence du domaine au-delà d’un simple regroupement de fiches partageant des objets ou des résultats.
- Limite : définition rédactionnelle locale proposée, distincte de la formulation native d’Evans. Univers reste une convention locale à éprouver ; domaine, capacité et frontière de modèle sont distingués. Aucun domaine concret ni découpage de réalisation adopté ; bilan de couverture CAP 15/21 inchangé.
- Auteur/date/statut : Codex, 2026-09-10 ; orientation U45 explicite, définitions détaillées et rattachements proposés.

## Construction itérative des domaines

### CMP028

- Éléments externes : ELM019 (TOGAF G189, juin 2018, §3.1, pages 6–7) et ELM027 (Microsoft Inventory to deliver, page du 2025-01-21, sections précisées dans la fiche), réexaminés le 2026-09-10.
- Éléments locaux : U47/F139, A27/P74 et [première liste de domaines](../connaissance/20-domaines-candidats.md), état du 2026-09-10.
- Relation : appui méthodologique et contrôle de couverture ; aucune équivalence de domaine ou de capacité.
- Adaptation proposée : une première liste de problèmes cohérents éclairée par le marché, immédiatement confrontée aux récits et candidats existants, puis ajustée par les cas difficiles et les lacunes constatées.
- Justification : combinaison des approches de construction documentée dans G189 ; comptage, ajustements et retours présents dans les processus Microsoft utiles comme cas de contrôle. Le terrain existant permet de commencer sans attendre une collecte exhaustive.
- Limites : six domaines proposés pour le noyau décrit, zones complémentaires maintenues visibles ; périmètres complets non comparés à cette maille. Les besoins Boardriders ne prouvent pas une configuration installée. Le marché ne valide ni le nombre de domaines, ni leurs intitulés, ni leurs frontières. Couverture CAP inchangée : 15 rapprochements documentaires, 21 sans comparaison précise, zéro équivalence validée.
- Auteur/date/statut : Codex, 2026-09-10 ; proposition à discuter avec Laurent.

## Achats à façon et orchestration

### CMP029

- Éléments externes : ELM002 (SAP RBA, cours d’édition non précisée) et ELM042 (BPMN 2.0.2 §7.2.1), consultés le 2026-09-10.
- Éléments locaux : U48/U49, F144–F146, A28/A29/P75/C40 et [analyse de l’orchestration](../connaissance/21-achats-et-orchestration.md), état du 2026-09-10 ; orientation U18–U21.
- Relation : appui méthodologique et sémantique.
- Adaptation proposée : distinguer aptitude métier durable, coordination spécifique d’un cas et moyen générique d’orchestration. U49 précise des moteurs dans les deux couches, orientés Case Management pour la couche processus ; même solution ou solutions distinctes restent possibles. Pas de boîte générique ajoutée à la carte du socle du seul fait de ces moyens.
- Justification : séparer les objets de modèle et leurs réalisations ; conserver le métier propre de la couche haute et les règles de validité des engagements dans leurs domaines.
- Limite : les sources externes ne prescrivent pas le placement des moteurs ; leur présence dans les deux couches est l’orientation locale explicite de U49. U50/F147 réaffirme que la capability map cible le socle et qu’un autre modèle fonctionnel orienté processus décrira la couche processus. Les usages plus larges du marché n’étendent pas la carte locale. Aucune plateforme unique ni nouvelle capacité validée.
- Auteur/date/statut : Codex, 2026-09-10 ; proposition à discuter.

### CMP030

- Éléments externes : ELM043 (cours SAP sous-traitance, édition produit inconnue), ELM044 (Microsoft SCM, page du 2025-08-13), consultés le 2026-09-10.
- Éléments locaux : U48/F140–F143, CAP029 précisée sur sa réalisation, P75 et [hypothèses sur les achats à façon](../connaissance/21-achats-et-orchestration.md), état du 2026-09-10.
- Relation : recouvrement partiel entre l’émission d’une demande d’achat de CAP029 et la création de demande décrite dans ELM043 ; contrôle de couverture pour le cas à façon avec ELM043/ELM044.
- Adaptation proposée : conserver la distinction besoin/engagement ferme, examiner les biens et prestations, ressources chez un tiers et liens composants/résultat comme objets et règles de capacités potentielles.
- Justification : U48 dépasse la seule variante d’enchaînement et expose des engagements et ressources à comprendre. Les deux produits fournissent des cas concrets pour approfondir ces questions.
- Limite : aucune équivalence entre Planned Purchase Order et Purchase Requisition/Order établie. La demande SAP citée est spécifique à la sous-traitance ; le document MAP de U48 est déclaré dans le premier cas, pas généralisé aux trois. Propriété et suivi locaux restent ouverts. Aucun rapprochement précis des fiches CAP030–CAP032 réalisé, ni capacité nouvelle créée.
- Bilan : CAP029 rejoint les capacités disposant d’un rapprochement documentaire partiel ; 16 CAP rapprochées, 20 sans comparaison précise, zéro équivalence validée. Ce chiffre mesure la documentation, pas la couverture fonctionnelle.
- Auteur/date/statut : Codex, 2026-09-10 ; rapprochement proposé et questions métier ouvertes.

## Options de découpage des domaines du socle

### CMP031

- Éléments externes : ELM001/ELM014 SAP RBA (cours d’édition non précisée), ELM025 IBM CBM (2005, figure 6), ELM027 Microsoft (vue des scénarios datée 2025-12-16) ; passages reconsultés le 2026-09-10. Les autres matrices de l’étude U25 sont reprises avec leurs limites antérieures.
- Éléments locaux : U51/U52, F148–F150, A31/A32/P76/C42, [options de domaines](../connaissance/22-options-domaines-socle.md), état du 2026-09-10, première liste U47 et cas achats U48 ; périmètre U50.
- Relation : appui méthodologique et comparaison de structures ; pistes de couverture des problèmes.
- Adaptation après U52 : le critère problématique guide les domaines et l’examen des frontières par les cas est confirmé. Source to Pay apporte une lecture processus ; Order Promising est reconnu comme domaine local, indépendamment de son niveau nominal SAP. Référence principale et grandes familles restent des choix d’appui et de présentation distincts de ce critère.
- Justification : les références offrent des mailles et des types distincts ; les récits permettent d’éprouver les frontières stock/disponibilité/promesse, achats/réassort et commande/exécution.
- Limites : les dix périmètres proposés sont locaux, sans nombre cible ni validation. Sites et conditions commerciales restent à délimiter. Domaines complets non comparés précisément ; aucun alignement de niveau, catalogue principal ni déplacement de CAP adopté. La capability map reste limitée au socle transactionnel.
- Auteur/date/statut : Codex, 2026-09-10 ; démarche confirmée par Laurent en U52, frontières détaillées et liste proposées. Couverture CAP conservée à 16 rapprochements documentaires et 20 sans comparaison précise ; zéro équivalence validée.

## Réassort, cœur commun et Order Promising

### CMP032

- Éléments externes : ELM014 (structure RBA), ELM045 (transferts SAP), ELM046 (promesse et réexamen ventes/transferts), ELM047 (retours ARM) ; cours d’éditions non précisées, passages consultés le 2026-09-10.
- Éléments locaux : U53–U58/F151–F158, A33/A34/P77/C43/C44 et [note réassort, transferts et promesse](../connaissance/23-reassort-transferts-et-promesse.md), état du 2026-09-10 ; anciens candidats conservés comme points d’appui.
- Relation : appui sémantique et contrôle des frontières ; pas équivalence de domaine complet.
- Adaptation proposée : examiner des problèmes de supply partagés entre parcours commerciaux, distinguer promesse, stock et exécution, puis qualifier séparément les engagements et effets commerciaux. U54/U55 placent les parcours de l’OMS dans un Case Management de vente ; U56 définit le transactionnel Supply comme contrôle, orchestration et optimisation de la logistique ; U57 lui attribue aussi rééquilibrage, prévision et gestion des impondérables.
- Justification : les transferts intra/intercompany offrent des cas discriminants ; SAP confirme des besoins de vente et transfert sans réunir toute leur vie dans Order Promising. L’opposition entre achat externe et réassort interne est insuffisante pour délimiter les domaines.
- Limites : Supply Decision & Execution est un intitulé local issu de Laurent, sans équivalence native SAP établie. Ni domaine unique ni modèle de demande universel adopté. Finance demeure une interface ; réalisation C-Log autonome. U58 place la logistique hors développement FLOW, en adhérence : les comparaisons métier et exemples de produits n’étendent pas le périmètre de réalisation de la plateforme. Les variantes produit ne prouvent aucun déploiement local ; les nouveaux appuis ne constituent pas une comparaison précise de CAP011–CAP013.
- Auteur/date/statut : Codex, 2026-09-10 ; définitions locales de Laurent appliquées, frontières proposées. Couverture CAP inchangée : 16 rapprochements documentaires, 20 sans comparaison précise, zéro équivalence validée.

## Granularité SAP et alternatives par domaines

### CMP033

- Éléments externes : ELM002/ELM009/ELM014 SAP ; ELM021 Guild ; ELM025 IBM ; ELM048 BIAN ; ELM049–ELM051 TM Forum.
- Éléments locaux : U59/F159, A35/P78, domaines de problèmes U45/U46/U52, [comparaison de granularité](premier-niveau-regroupement-capacites.md#granularité-sap-et-autres-modèles-orientés-domaines), état du 2026-09-10 ; périmètre FLOW U58.
- Relation : appui méthodologique et comparaison de mailles et de natures ; aucune équivalence de domaines ou capacités.
- Adaptation proposée : privilégier les aires SAP documentées comme grille d’épreuve du contenu commerce/stock. Employer IBM pour la contrelecture retail et BIAN/TM Forum pour éprouver regroupements et relations entre vues ; Guild pour la définition des aptitudes.
- Justification : les exemples stock/promesse offrent une maille opérationnelle compatible avec l’examen de problèmes locaux. Les alternatives enrichissent la comparaison tout en poursuivant des objectifs distincts ; domaines, capacités, partitions de services et fonctions SI ne sont pas interchangeables.
- Preuves et limites : cours SAP sans édition de catalogue ; IBM 2005 ; preuve Guild historique conservée, nouvelles ouvertures directes échouées ; guide BIAN 2020 distinct de la version 14.0 annoncée en 2026 ; présentations TM Forum lues, documents membres non consultés. Aucun catalogue retail complet nouvellement acquis ni classement exhaustif de marché.
- Auteur/date/statut : Codex, 2026-09-10 ; recommandation proposée, pas choix de catalogue principal par Laurent. Aucun transfert de réalisation logistique vers FLOW. Les 36 CAP restent inchangées, 16 rapprochements documentaires et 20 sans comparaison précise, zéro équivalence validée.

- Actualisation U60 du 2026-09-10 : les rôles proposés sont précisés par C45/P79/CMP034. IBM non prioritaire pour le découpage actuel ; BIAN périphérique ; TM Forum reste une piste. Les accès publics Guild 15.0 et métamodèle 2024 ont désormais réussi, sans accès au catalogue membre ni preuve d’un modèle retail livré.

## Approfondissement BIZBOK après U60

### CMP034

- Éléments externes : ELM021 atelier 2019 reconsulté ; ELM052 glossaire 15.0 ©2026 ; ELM053 Metamodel Guide 3.0 de septembre 2024 ; ELM054 introduction 15.0 ; ELM055 notices des modèles membres.
- Éléments locaux : U60/F160/F161, A36/P79/C45, définition U33, domaines problématiques U45/U46 et Order Promising U52 ; [étude ciblée](bizbok-capacites-et-domaines.md), état du 2026-09-10.
- Relation : appui sémantique et méthodologique, sans équivalence de capacité ou de domaine.
- Adaptation proposée : vérifier objet(s), résultat, périmètre et cohérence des sous-capacités ; distinguer ces règles de la délimitation des domaines par problèmes liés. Le service, la capacité et sa réalisation contextuelle restent des concepts distincts.
- Justification : la méthode Guild précise la décomposition ; elle ne fournit pas les frontières transactionnelles commerce déjà arrêtées ni une hiérarchie Univers/Domaine. L’exemple appliqué à Order Promising est local.
- Limites : guide intégral, §2.2 et modèles membres non consultés. Retail/Wholesale livré, version et contenu non établis ; version courante du Common Reference Model non affichée sur sa notice. Aucun rapprochement précis nouveau de CAP.
- Auteur/date/statut : Codex, 2026-09-10 ; priorités U60 appliquées, usage de méthode proposé. Portée du socle et adhérence logistique FLOW inchangées ; 16 CAP avec rapprochements documentaires, 20 sans comparaison précise, zéro équivalence validée.

## Capacités, objets, faits et documents

### CMP035

- Éléments externes : ELM056 SAP information métier/solution ; ELM057 Guild information/états/résultats ; ELM058 SID ; ELM059 documents/événements SAP ; ELM060 exemples de contrats TM Forum ; ELM061 agrégat DDD, en appui à l’analogie.
- Éléments locaux : U61/U62, F162–F164, A37/A38/P80, TER002/TER036–TER039 et [note d’articulation](../connaissance/24-capacites-objets-et-faits.md), état du 2026-09-10 ; U33 et orientation des deux couches.
- Relation : appui méthodologique et sémantique ; pas équivalence de catégories ni de capacités.
- Adaptation proposée : expliciter objets, états, faits et documents avec les capacités dans un modèle métier lié ; distinguer leur sens des frontières d’agrégat et des formes techniques d’échange ou de stockage.
- Justification : les trois approches décrivent l’information métier par des vues liées, sans la reporter entièrement à la réalisation. Les exemples de documents et notifications révèlent des différences de vocabulaire utiles.
- Limites : BIZBOK complet et SID détaillé non consultés ; exemples SAP Help obtenus via index ; TMF622 v4.0.0 et schéma Document historiques. Aucun ABE = aggregate root, Outcome = événement ni document = objet absolument immuable imposés. L’exemple de promesse est local ; les CAP ne sont pas décomposées.
- Auteur/date/statut : Codex, 2026-09-10 ; méthode proposée, pas adoption d’un schéma technique ou extension du périmètre. Couverture CAP 16 rapprochements documentaires /20 sans comparaison précise conservée, zéro équivalence validée.

### CMP036

- Éléments externes : ELM014–ELM018, ELM024, ELM028, ELM035/ELM036, ELM043–ELM047 et réexamen ELM062 ; ELM053/ELM057/ELM058 en appui de méthode et d’information.
- Éléments locaux : U63/U64, F165/F166, A39/P81, [carte et épreuve des récits](../connaissance/25-domaines-coeur-et-epreuve-recits.md), version de travail 0.1 du 2026-09-10 ; 34 formulations regroupées sous dix domaines.
- Relation : appuis partiels de structure, de sémantique et de couverture ; pas d’équivalence complète de domaines ni de capacités.
- Adaptation proposée : D01 stocks ; D02 disponibilité/protection/engagements de ressources ; D03 promesse ; D04 obligations commerciales communes à éprouver ; D05 équilibrage ; D06 possibilités d’exécution ; D07 engagements/faits d’exécution ; D08 produits ; D09 parties ; D10 conditions. Les coordonnées natives SAP sont préservées ; le domaine local a le sens problématique défini par Laurent.
- Justification : les cas de stock distribué, protection/réservation, futur et réaffectation, réassort et achat à façon mobilisent plusieurs problèmes stables ; les parcours ne deviennent pas des domaines. Le besoin de capacité de service et les parts restant à satisfaire complètent la lecture initiale.
- Limites et non-comparés : regroupement D04 achat/vente/prestation non comparé précisément ; D05.c redistribution, D06 service/quotas et définitions détaillées D08–D10 non comparés précisément. Les appuis de produit sur D01–D03/D07 sont partiels. Les compléments plausibles restent signalés individuellement ; SAP ne prescrit pas ces dix domaines. Aucun catalogue retail Guild/TM Forum détaillé consulté. IBM reste historique non prioritaire.
- Auteur/date/statut : Codex, 2026-09-10, proposition à challenger par Laurent. Les 36 CAP, leurs définitions et leur couverture documentaire historique 16/20 sont conservées ; cette mesure ne vaut pas couverture des 34 formulations P81 ni des entreprises. Aucun candidat ou arbitrage de réalisation validé.

### CMP037

- Éléments externes : ELM063 SAP, ELM064 Microsoft, ELM065 TM Forum, ELM066 exemples publics Guild ; ELM014/ELM028/ELM031 en continuité des lectures antérieures.
- Éléments locaux : U65/F167, A40, domaines D01–D10 de P81 version 0.1, dans la [table des noms proches](correspondances-domaines-coeur.md), comparaison du 2026-09-11.
- Relation : rapprochements terminologiques et sémantiques partiels ; types et niveaux explicités, aucune équivalence de domaines ou de capacités.
- Adaptation : rapprocher chaque domaine d’un ou plusieurs noms natifs, distinguer absence de nom unique et absence de contenu consulté, conserver les différences entre aire RBA, capacité RBA, aire de processus, fonctionnalité, objet, composant et API.
- Justification : les noms de stock/promesse/produit/partie/pricing fournissent des repères ; D02/D04/D06/D07 croisent plusieurs rubriques des références. Le contraste aide à challenger les frontières sans décider d’un renommage.
- Limites : Service Qualification ne suffit pas à une promesse ferme ; Product Inventory TMF n’est pas notre stock de marchandises ; pricing ne couvre pas tous les droits après fourniture. Les modèles détaillés Guild/TM Forum non consultés ne sont pas reconstitués. Les nouveaux appuis produits/unités et quotas éclairent les thèmes sans comparaison exhaustive des définitions de P81.
- Auteur/date/statut : Codex, 2026-09-11 ; lecture proposée, noms sourcés et adaptations non validées. P81 conserve dix domaines et 34 formulations ; registre des 36 CAP et couverture documentaire historique 16/20 inchangés.

### CMP038

- Éléments externes : ELM067 (distinction RBA/produit), ELM017/ELM032/ELM062 (protection et affectation) ; ELM063–ELM065 pour les noms anglais réemployés.
- Éléments locaux : U66/U67, F168–F171, A41, C48/C49 et P81 version 0.2 du 2026-09-11 ; D01 Inventory Management, D02.b Supply Protection et D02.e Supply Assignment. Voir la [carte courante](../connaissance/25-domaines-coeur-et-epreuve-recits.md) et les [correspondances des domaines](correspondances-domaines-coeur.md).
- Relation : réemploi lexical et appui sémantique pour des capacités métier ; correspondances partielles de contenu, sans équivalence de définitions complètes ni transfert automatique du niveau natif SAP.
- Adaptation : libellés de la carte en anglais selon U66, définitions en français ; Inventory Management adopté comme nom de D01. D02.b réemploie Supply Protection ; D02.e explicite Supply Assignment comme aptitude de couverture des demandes par des ressources présentes ou futures. Les 44 anciens libellés des dix domaines et 34 formulations sont conservés en C48. Les autres traductions locales restent proposées.
- Justification : U67 distingue les aptitudes de l’entreprise du mécanisme Allocation Run. Une documentation peut décrire leur réalisation sans fournir le rang exact de la capacité dans le catalogue RBA. La traduction conserve sens, résultats et limites ; elle ne réduit pas D10 à Pricing.
- Limites : le rattachement D02 et la frontière avec Reservation restent proposés. Affecter une ressource peut déjà l’engager ; affectation et réservation peuvent se révéler deux vues d’une même capacité selon les définitions retenues. Aucun objet, composant ou mécanisme unique imposé. La définition locale de Supply Assignment n’est pas une définition native RBA attestée ; les capacités correspondantes ne sont pas déclarées absentes de SAP.
- Auteur/date/statut : Codex, 2026-09-11. Nomenclature anglaise et nom Inventory Management demandés par Laurent ; nature métier de Supply Protection / Supply Assignment explicitée par Laurent en U67. Définitions détaillées, regroupements et équivalences restent à éprouver. P81 compte dix domaines et 35 formulations proposées ; les 36 CAP et leur couverture documentaire 16/20 restent inchangées.

### CMP039

- Éléments externes : ELM068 ; ELM014/ELM015 SAP, ELM024 ARTS et ELM066 Guild pour les preuves antérieures.
- Éléments locaux : U68/F172, A42, D01.a–d de P81 version 0.2 ; [fiche D01 dans la carte courante](../connaissance/25-domaines-coeur-et-epreuve-recits.md#d01-stocks). État comparé le 2026-09-11.
- Relation : rapprochements sémantiques de contenu ; Inventory Management est un nom commun réemployé, sans équivalence complète des périmètres. Les appuis produit ne sont pas présentés comme rangs natifs de capacités.
- Adaptation : ajout d’une Finalité proposée au domaine et d’une table capacité par capacité. D01.a rapproche quantités/états SAP et mesures/dimensions Microsoft ; D01.b rapproche mouvements et journaux ; D01.c rapproche la vue consolidée de Inventory Visibility, sans déduire une consolidation multisource SAP de simples listes ; D01.d rapproche Physical Inventory, Counting et Inventory adjustment. Aucun libellé ou définition des quatre capacités remplacés.
- Justification : mêmes problèmes de connaissance des stocks, de variation, de visibilité et d’écart, mais regroupements de marché différents. SAP détaille notamment les types de mouvements ; Microsoft expose une réalisation de visibilité multisource. Ces comparaisons ne prescrivent ni séparation en applications ni moteur unique.
- Autres références : TMF687 apporte une représentation du stock et des opérations d’ajustement, avec réservation qui déborde D01. ARTS 7.3 apporte un modèle de données de comptage/ajustement, pas des capacités. Asset Management dans le support Guild de 2019 est trop large pour établir une correspondance précise ; pas de capacité retail native inventée.
- Frontières : disponibilité par usage et engagements restent proposés en D02, promesse en D03 ; approvisionnement attendu distinct d’un stock reçu. D01 peut décrire le transit ou les biens chez un tiers sans prendre en charge leur déplacement. Valorisation financière en interface ; logistique hors développement FLOW, en adhérence.
- Auteur/date/statut : Codex, 2026-09-11 ; proposition de lecture pour revue par Laurent. Finalité et granularité restent à éprouver ; aucune équivalence validée. P81 conserve dix domaines et 35 formulations ; CAP historiques et couverture 16/20 inchangées.

**Précision de CMP039 après U69 — 2026-09-11 :** [C50](../connaissance/04-corrections.md#c50) clarifie la lecture locale sans changer les sources comparées. Physical Inventory / Counting appuient le rapprochement des constats et des positions en D01.d ; ils ne fondent pas une équivalence avec datahub ou golden data. La relation entre les résultats de D01.a et D01.b demeure à éprouver. Aucun libellé natif, nouvelle capacité ou équivalence ajouté ; pas de nouvelle vérification externe.

**Précision de CMP039 après U72 — 2026-09-11 :** la lecture métier de D01.d est explicitée autour de l’inventaire : constat de quantités, comparaison et régularisation des écarts. Physical Inventory est un nom proposé à partir du rapprochement déjà documenté ELM014/ELM068 ; aucune nouvelle équivalence, extension à tout rapprochement de données ou recherche externe.

### CMP040

- Éléments externes : ELM017/ELM028, reconsultés le 2026-09-11 après U74 ; ELM067 pour la distinction rang natif / aptitude métier. ELM068/CMP039 conservent les autres comparaisons de D01.
- Éléments locaux : U74/F178, A48/C51 et P81 version 0.3 ; Supply Protection rattachée à D01, avec repère historique D02.b conservé.
- Relation : appui sémantique pour la protection des ressources ; adaptation du rattachement local, aucune équivalence de hiérarchie externe ni de définition complète.
- Adaptation et justification : Inventory Management élargi à la maîtrise de la protection des stocks, selon l’orientation de Laurent. Protéger des usages sans modifier la quantité physique est un problème métier cohérent avec cette lecture. D02 prend en compte les protections dans disponibilité et engagements ; aucune fusion des domaines.
- Sources relues : [SAP Supply Protection](https://learning.sap.com/courses/exploring-aatp-in-sap-s-4hana/outlining-aatp-with-supply-protection-sup-), Outline / Supply Protection Object / Core Supply Protection / Consuming Supply Protection, édition produit non précisée ; [Microsoft Inventory Visibility inventory allocation](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-allocation), présentation du pool virtuel, groupes et consommation, page évolutive sans release produit homogène établie. Textes ouverts et consultés ; ni activation ni configuration locale prouvées.
- Limites : le placement SAP dans la documentation aATP n’interdit pas le rattachement métier local à Inventory Management ; il ne le démontre pas non plus comme rang natif RBA. Microsoft allocation et SAP protection se recouvrent sans identité de toutes leurs règles. Nature, horizons, priorités et portée des ressources locales restent à préciser. Calcul amont de saison et logistique ne sont pas internalisés.
- Auteur/date/statut : Codex, 2026-09-11 ; rattachement local orienté explicitement par Laurent, autres définitions et frontières proposées. Dix domaines et 35 aptitudes conservés : cinq dans D01, quatre dans D02 ; 36 CAP historiques et couverture 16/20 inchangées.

### CMP041

- Éléments externes : ELM069, avec ELM031/ELM032/ELM067/ELM068 et les comparaisons CMP038–CMP040.
- Éléments locaux : U75/F179, A49/C52, TER016/TER021 et P81 version 0.4 ; réservation repère D02.c désormais en D01, Supply Assignment repère D02.e désormais en D03.
- Relation : adaptation de rattachement local et clarification sémantique ; rapprochements partiels de contenu, sans équivalence native de hiérarchie ni adoption des moyens techniques.
- Adaptation : réservation définie par l’engagement quantitatif pour un besoin et ses effets sur les usages concurrents ; affectation définie par la couverture ressource/demande. Microsoft Inventory Visibility reservations éclaire le premier résultat et le calcul de quantité encore réservable ; SAP Supply Assignment/aATP éclaire le second. La portée exacte du calcul de disponibilité reste en réexamen avec les capacités de visibilité et de faisabilité.
- Justification : Laurent distingue ces aptitudes et leurs domaines. Des représentations différentes du même stock ne créent pas de ressources supplémentaires ; physique, pools et projections doivent être distingués au sein de la proposition de regroupement, sans créer un domaine pour chaque représentation.
- Limites : cycles de réservation/affectation, autorité de modification et cardinalités locales non définis ; aucune partition rigide inventaire/ATP native affirmée. Un produit peut réaliser plusieurs capacités, un calcul peut servir plusieurs usages et une réservation peut accompagner une affectation. La suppression ou fusion de D02 n’est pas décidée.
- Auteur/date/statut : Codex, 2026-09-11 ; rattachements appliqués selon Laurent. Autres reformulations proposées. Dix domaines provisoires et 35 aptitudes conservés, dont D01 six, D02 deux et D03 quatre ; couverture historique CAP 16/20 inchangée.

- Précision U76/U77 du 2026-09-11 : la convention locale physique/logique/virtuel provient de Laurent, pas d’un catalogue externe. C53/TER040–TER042 corrigent la terminologie locale ; les mesures natives Microsoft et leur qualification physical/calculated ne constituent pas automatiquement des équivalents. Projection de promesse en D03 et disponible courant en D01 sont une proposition de partage ; aucun contenu externe nouveau ni nouvelle vérification.

### CMP042

- Éléments externes : ELM070 SAP Reservation/contrôle dynamique ; ELM071 Microsoft réservations ERP et Inventory Visibility ; ELM072 SAP quantités réservées par Supply Assignment.
- Éléments locaux : U78/F182, A52, C54 ; P81 version 0.4 D01 réservation (repère D02.c), D03 Supply Assignment (repère D02.e), TER016/TER017/TER040–TER042. [Analyse détaillée](allocation-reservation-sap-microsoft.md#réservation-et-frontière-inventory-management-order-promising-u78).
- Relation : recouvrements sémantiques et différences de mécanisme ; aucune équivalence complète, native ou de déploiement.
- Adaptation : conserver comme option Inventory Management pour engagement quantitatif et effets sur le stock, Order Promising pour couverture des demandes et promesses. Qualifier la possibilité que réservation et affectation soient deux faces d’un même engagement, sans duplication de quantités ni indépendance automatique de cycle.
- Justification : Microsoft réserve du présent et du commandé non reçu, avec précision progressive possible ; SAP distingue document de mouvement planifié et quantités réservées par Supply Assignment dans aATP. Le présent/futur ne suffit donc pas à placer les capacités. La source du calcul peut se situer dans plusieurs domaines selon le problème traité.
- Limites : il s’agit d’une option d’urbanisation locale, non d’une séparation universelle des éditeurs. Les règles de fermeté, replanification, annulation, consommation et autorités restent à éprouver sur les récits. L’hésitation U78 rouvre la question, sans supprimer l’orientation précédente ni changer les IDs.
- Auteur/date/statut : Codex, 2026-09-11 ; proposition et analyse documentaire. Le rattachement de réservation à D01 reste affiché mais en réexamen. Les dix domaines et 35 aptitudes de P81 ne sont pas promus ; CAP historiques et couverture 16/20 conservées.

### CMP043

- Éléments externes : [ELM073](elements.md#elm073), Microsoft accords, entrées futures/ATP et putaway ; [ELM074](elements.md#elm074), SAP réceptions futures pertinentes pour Supply Assignment.
- Éléments locaux : U79/F183/A53 ; P81 version 0.4, D01.a/D01.c, D03.a et Supply Assignment D02.e, D04.c, D07.d ; TER008/TER042/TER043. [Analyse dans la carte](../connaissance/25-domaines-coeur-et-epreuve-recits.md#stock-futur-potentiel-et-ressources-attendues-u79).
- Relation : appuis partiels sur les comportements ; aucune équivalence de domaines ou sous-capacités.
- Adaptation proposée : représenter séparément les quantités potentielles, planifiées, engagées et déjà physiques, avec destination et date attendues ; calculer ensuite leur contribution à la promesse selon les règles. La visibilité peut exposer ces informations sans prendre autorité sur contrats, achats ou faits logistiques.
- Justification : Microsoft distingue les variations futures du stock présent et décrit le solde d’accord séparément ; SAP cite plusieurs réceptions futures pour l’affectation. Représenter le futur et décider de son utilisation sont deux résultats à qualifier.
- Limites : gestion de tout potentiel contractuel comme stock affectable non démontrée par le marché. Frontière D01/D07 et fermeté du lien à la demande non arbitrées. État logistique, confirmation fournisseur et date utilisable ne sont pas interchangeables ; pas de transformation des étapes en sous-capacités.
- Auteur/date/statut : Codex, 2026-09-11 ; proposition d’analyse. Dix domaines et 35 aptitudes conservés, aucun rattachement modifié ni configuration installée attestée.

**Complément CMP043 — U80, 2026-09-11 :** la présence du stock futur dans D01 et D03 est désormais explicitée par Laurent, avec dépendance amont de la date de promesse. Cela précise le modèle local comparé ; la répartition détaillée connaissance/décision et les autorités demeurent proposées. Pas de nouvelle preuve externe ni équivalence native déduite.

**Complément CMP043 — U81, 2026-09-11 :** les définitions locales D01.a/b/c rendent explicites stock physique, états logiques et ressources futures ; D03.a explicite le calcul du stock virtuel puis la faisabilité quantité/date. C55 conserve les anciennes formulations. Les preuves ELM068 et ELM073/ELM074 servent d’appuis partiels déjà consultés ; la taxonomie physique/logique/virtuel et cette répartition sont locales. Aucun rapprochement complet de ces nouvelles formulations avec un catalogue natif ni nouvelle vérification externe effectué. Ce complément actualise la portée de comparaison, sans élargir les preuves ni valider une équivalence.

### CMP044

- Éléments externes : [ELM075](elements.md#elm075), SAP quantités et stock-taking ; [ELM076](elements.md#elm076), Microsoft on-hand, Maintain inventory levels, Count inventory et Counting.
- Éléments locaux : U82/F186/A56/C56 ; P81 version 0.4 D01.a et D01.d, définitions précisées après U81. [Revue des noms](../connaissance/25-domaines-coeur-et-epreuve-recits.md#noms-des-capacités-de-stock-revue-u82).
- Relation : vocabulaire et recouvrements partiels, sans équivalence de niveaux ni de capacités complètes.
- Adaptation proposée : D01.a Manage inventory quantities, nom local inspiré de Managing Stocks by Quantity ; D01.d Count and reconcile inventory, avec Stocktaking comme forme courte à examiner. Les noms des tables principales sont conservés pendant la revue ; aucune nouvelle capacité créée.
- Justification : quantités et états courants se distinguent du constat de comptage et de l’établissement des corrections. Truth est trop absolu et peu délimité pour le résultat ; Inventory accuracy exprime la finalité. Inventory Accuracy Assurance serait une formulation locale de portée plus large à définir, pas un nom natif établi.
- Limites : le nom de D01.a ne résout pas son chevauchement avec D01.b ; le comptage physique reste en adhérence logistique. Stocktaking ne doit pas masquer le rapprochement et la correction qui sont dans la définition courante. Décompte/constat, rapprochement et ajustement peuvent être réalisés différemment sans changer l’aptitude métier.
- Auteur/date/statut : Codex, 2026-09-11 ; propositions de nomenclature à discuter avec Laurent, pas de renommage adopté. P81 dix domaines/35 aptitudes et CAP36 conservés.

### CMP045

- Éléments locaux : U83/F187/A57 ; [P82](../connaissance/05-propositions.md#p82), alternative de cinq capacités D01 aux six capacités actuelles P81 version 0.4.
- Éléments externes : ELM068/ELM075/ELM076 pour stocks et comptage ; ELM017/ELM028 et CMP040 pour protection ; ELM070/ELM071/ELM072 et CMP042 pour réservation. Preuves déjà consultées, dont recherche U82 du 2026-09-11 ; pas de nouvelle vérification en U83.
- Inventory Tracking : proposition locale réunissant D01.a/b, appui partiel SAP Managing Stocks by Quantity incluant transactions et mises à jour. Microsoft On-hand inventory expose quantités et états actualisés ; aucun libellé natif exact Inventory Tracking ni équivalence de périmètre complet établis.
- Inventory Visibility : réemploi du nom de produit Microsoft pour une aptitude locale de visibilité ; ELM068. Le produit couvre aussi d’autres comportements, donc pas d’équivalence produit/capacité.
- Stocktaking : vocabulaire explicite SAP, rapproché de Count inventory et Counting Microsoft ; ELM075/ELM076. La définition locale inclut qualification des écarts et corrections ; aucune feuille native de ce périmètre exact sous ce nom prouvée.
- Supply Protection : libellé conservé et rapprochement CMP040 ; Inventory Reservation : titre abrégé local éclairé par CMP042, sans séparation absolue vis-à-vis de Supply Assignment.
- Adaptation et justification : fusion proposée de l’état et de son évolution ; titres courts, définitions actives et Finalité distincte. Inventory accuracy reste la finalité du rapprochement, pas une garantie de vérité absolue.
- Limites : aucun catalogue externe ne valide l’ensemble des cinq capacités ni les frontières D01/D03/D07. Les sources de produit éclairent les aptitudes ; on ne transforme pas leurs workflows en capacités ou développements FLOW. Réservation et visibilité gardent leurs limites de frontière.
- Auteur/date/statut : Codex, 2026-09-11 ; alternative proposée, non adoptée. P81 dix domaines/35 aptitudes et CAP36 inchangés ; pas de nouvel identifiant de capacité ni réutilisation.

**Complément CMP045 — U84, 2026-09-11 :** Reservation est le nom local adopté par Laurent ; Counting est proposé à la place de Stocktaking, dont le périmètre de comptage/rapprochement/correction est conservé. Microsoft Counting reconsulté en ELM076. Le changement des titres ne modifie pas les limites des correspondances ni les frontières. La fusion D01.a/b reste proposée ; noms antérieurs conservés en C57.

**Réexamen CMP045 — U85, 2026-09-11 :** le nom Stocktaking est de nouveau envisagé aux côtés de Counting. L’indépendance des outils vaut pour les deux aptitudes ; leur portée évoquée diffère selon A59. Aucune nouvelle preuve externe, changement de périmètre ou équivalence native déduite.

**Décision locale CMP045 — U86, 2026-09-11 :** Laurent adopte Stocktaking pour D01.d et la capacité correspondante P82, avec Inventory accuracy comme Finalité. Noms antérieurs en C58 ; définition de comptage/rapprochement/correction conservée. ELM075/ELM076 et les limites des correspondances restent applicables, sans équivalence supplémentaire ni changement des termes natifs SAP/Microsoft. Pas de nouvelle vérification externe pour appliquer ce choix local.

### CMP046

- Éléments externes : [ELM077](elements.md#elm077), contrôle SAP PAC/BOP et Microsoft promesse/réservations ; ELM014/ELM067 pour les rangs RBA précédemment examinés.
- Éléments locaux : U87/U88, F191/F192/A61 ; P83, D02.a/d et D01/D03 de P81 après U86. [Audit](../audits/2026-09-11-order-promising.md).
- Relation : recouvrement partiel et appui de vocabulaire ; aucune équivalence complète de domaines ou de hiérarchie.
- Adaptation : la disponibilité de promesse rejoint conceptuellement la faisabilité D03 ; réviser/libérer relève des capacités sur les objets concernés. Vue D03 proposée Supply Feasibility, Confirmation, Supply Assignment, Promise Revision ; noms locaux sauf réemploi Supply Assignment, sans rang natif supplémentaire affirmé.
- Justification : SAP lie PAC à la confirmation et réexamine avec BOP après annulation, retard ou priorité ; Microsoft situe ajustement/libération dans le cycle de réservation et combine disponibilité et dates dans Order promising. La séparation locale des résultats n’impose pas des étapes ou composants indépendants.
- Limites : les sources ne démontrent pas qu’un domaine D02 est absent de tous les modèles. Les règles du produit et CTP ne deviennent pas des capacités FLOW par copie. Le périmètre exact des autorités et engagements modifiables reste localement inconnu.
- Auteur/date/statut : Codex, 2026-09-11 ; analyse et proposition, non validées. D02 n’est pas supprimé, D03 n’est pas renuméroté ; CAP historiques inchangées.

### CMP047

- Éléments externes : ELM078–ELM081 ; appuis antérieurs ELM071/ELM072/ELM077 pour réservation/affectation. MKT04/MKT13/MKT14/MKT20, dates et limites détaillées dans ces notices.
- Éléments locaux : U89/F193/A62 ; P83 après U88, quatre capacités D03, et frontières D01/D04/D06/D07/D08 de P81 version 0.4.
- Relation : recouvrements partiels, appuis sémantiques et écarts de précision ; aucune équivalence complète ni même maille présumée. [Comparaison noms, nature et couverture](order-promising-comparaison-capacites.md).
- Adaptation proposée : conserver provisoirement les quatre hypothèses, éprouver leurs définitions par dix critères explicités. Quatre résultats explicites, quatre points partiels, deux non décrits ; pas dix capacités recommandées ni pourcentage de couverture du marché. Examiner prioritairement allocations consommables, lieu, substitution et approvisionnement à créer.
- Justification : les cinq feuilles de l’extrait SAP organisent autrement les problèmes ; Microsoft et Oracle apportent aussi des alternatives. Le corpus public Guild/TM Forum ne permet pas un comptage natif comparable sur ce domaine.
- Limites : nature de contribution proposée, noms locaux non adoptés ; frontières avec D06 et autonomie C-Log conservées. Le produit ne prouve ni besoin local ni réalisation installée. La confirmation autonome et sa séparation avec la révision restent à éprouver.
- Auteur/date/statut : Codex, 2026-09-11 ; comparaison préalable, non validée. Aucun changement de nombre, de définition ou de rattachement appliqué aux capacités.

### CMP048

- Éléments externes : ELM082/MKT21, appui lexical APICS ; ELM077/ELM080 pour l’emploi éditeur d’ATP/CTP. Source APICS vérifiée le 2026-09-11, sources éditeurs déjà examinées en U89.
- Éléments locaux : U90/F194/A63/C59 ; P83 et vue D03 après U90. Relation : appui sémantique, recouvrement partiel, aucun libellé natif identique établi pour les deux nouveaux candidats.
- Adaptation : Promise Verification remplace Supply Feasibility dans la vue proposée ; Promise Confirmation précise Confirmation. Vérification d’une possibilité avant engagement, confirmation de l’engagement, affectation des ressources et révision distinguées. Les premiers noms restent historiques dans l’étude U89.
- Justification : la promesse est le résultat fédérateur ; ATP est un vocabulaire métier attesté au-delà des éditeurs. Les alternatives, contrôles d’allocation et créations de fourniture demeurent à expliciter dans la couverture.
- Limites : ATP seul ne couvre pas toute la faisabilité ; Promise Verification peut évoquer une promesse existante, d’où sa définition nécessaire. Promise Confirmation n’est pas l’équivalent de Product Allocation Check. Aucun objet Promise unique, découpage IT ou ordre obligatoire confirmation/affectation.
- Auteur/date/statut : Codex, 2026-09-11 ; propositions lexicales de Laurent consignées, appréciation favorable de Supply Assignment et Promise Revision ; définitions détaillées et couverture non validées.

### CMP049

- Éléments externes : ELM078/ELM079 SAP RBA et produit ; ELM080 Microsoft, ELM081 Oracle, preuves du 2026-09-11 déjà consultées. Pas de nouvelle vérification externe après U91/U92.
- Éléments locaux : U91/U92/F195/F196/A64/C60 ; P83 après la correction du nom de première capacité.
- Relation : adaptation de noms et recouvrements partiels ; les noms anglais avec Decision sont locaux, pas feuilles SAP natives.
- Adaptation : ajout exploratoire de Allocation Eligibility Decision, Fulfillment Source Decision, Product Substitution Decision et Supply Creation Decision ; D03 proposé comme propriétaire de ces décisions qualifiées pour une promesse, avec fournisseurs de connaissances/contraintes D01/D06/D08 et engagements D04/D07. SAP Product Allocation Check, Fulfillment Location Determination, Product Substitution et Supply Creation Based Confirmation sont les appuis respectifs ; leurs définitions natives détaillées n’étant pas toutes disponibles, les relations demeurent partielles.
- Promise Formulation : nom proposé pour construire une proposition ; ATP peut contribuer à son calcul, sans équivalence de périmètre. Promise Verification rejeté par Laurent ; historique CMP048 conservé.
- Justification/limites : faire naître une promesse et rendre visibles ses décisions, tout en conservant la capacité de confirmation. Une décision à prendre, sa réalisation technique et l’autorité opérationnelle sont distinctes. Propriétaires et maille proposés, pas transfert C-Log ni quatre domaines logiciels supplémentaires. Les écarts U89 ne sont pas clos par de simples noms.
- Auteur/date/statut : Codex, 2026-09-11 ; ajouts à l’exploration demandés par Laurent, rattachements et noms proposés. P81 et CAP historiques inchangés.

### CMP050

- Éléments externes : ELM083 ; SAP Transportation Management pour la chaîne de transport, Microsoft et Oracle pour l’effet des options de transport sur la promesse. Vérification du 2026-09-11 ; éditions et limites dans ELM083.
- Éléments locaux : U93/F197/F198/A65/C61 ; P83, D03 et frontières D06/D07. Relation : recouvrement partiel et adaptation de vocabulaire, pas équivalence de domaines.
- Adaptation : ajouter Fulfillment Route Decision au-delà de Fulfillment Source Decision. D03 proposé pour le choix de la chaîne supportant la promesse ; possibilités qualifiées en D06, engagements utiles en D07. La construction et la planification détaillée de transport, rapprochées de Transportation Management, restent en adhérence avec leurs autorités. Pas de compétence C-Log transférée par le rattachement au domaine.
- Justification : disponibilité à la source et faisabilité d’acheminement ne sont pas synonymes. Une promesse de livraison dépend d’une solution réalisable jusqu’au destinataire ; les décisions peuvent être interdépendantes sans fusion des domaines.
- Nom de la première capacité : Promise Proposal remplace le candidat rejeté Promise Formulation. Adaptation locale proposée par Laurent ; pas de libellé natif équivalent vérifié, ni changement d’objet ou de caractère engageant décidé par le seul nom.
- Auteur/date/statut : Codex, 2026-09-11 ; candidats de nom et de rattachement, granularité à éprouver. Couverture enrichie au niveau du problème, pas audit de réalisation ; P81 historique et CAP36 conservés.

### CMP051

- Éléments externes : ELM084/MKT14, vérification Microsoft du 2026-09-11 ; ELM082/APICS demeure un appui historique distinct.
- Éléments locaux : U94/F199/A66 ; P83, Promise Proposal et Supply Creation Decision, ressources futures U79/U80 et TER044.
- Relation : recouvrement partiel et appui sémantique. ATP soutient la promesse par les ressources présentes/attendues disponibles ; CTP élargit la faisabilité aux moyens de produire ou approvisionner ce qui manque. Leurs réalisations peuvent lier calcul et confirmation ; pas d’équivalence automatique avec nos frontières de capacité.
- Adaptation proposée : documenter ces deux modes de raisonnement dans Promise Proposal ; mobiliser les aptitudes de décision et connaissances nécessaires, sans créer une capacité ATP et une capacité CTP par simple copie d’options produit.
- Limites : ATP comprend du futur ; CTP n’est pas synonyme de réservation future, de Supply Assignment ou de réaffectation prioritaire. Une quantité potentiellement achetable sous contrat ne devient pas promettable sans conditions de fourniture. Calendriers et transport concernent les deux raisonnements. Les capacités au sens ressources de production ne sont pas les Business Capabilities de notre carte.
- Auteur/date/statut : Codex, 2026-09-11 ; analyse non adoptée ; aucune modification du nombre de capacités ou de leur périmètre. C62 précise les variantes techniques et les limites des pages Microsoft.

### CMP052

- Sources externes : ELM077–ELM084 et CMP047–CMP051 déjà examinés ; aucune nouvelle vérification externe pour appliquer U95.
- Éléments locaux : U95/F200/F201/A67/C63 ; P83 validée, P81 version 0.5, neuf capacités d’Order Promising.
- Validation locale : **Laurent, 2026-09-11**, quatre capacités d’action et cinq capacités de décision. Anciennes correspondances de noms préservées ; D03.a Promise Proposal, D03.b Promise Confirmation, D03.c Promise Revision et D02.e Supply Assignment gardent leurs repères.
- Nouveaux repères locaux : D03.d Allocation Eligibility Decision, appui partiel SAP Product Allocation Check ; D03.e Fulfillment Source Decision, SAP Fulfillment Location Determination et alternatives Microsoft/Oracle ; D03.f Fulfillment Route Decision, transport et promesse ELM083 ; D03.g Product Substitution Decision, appuis partiels SAP/Oracle et variantes Microsoft ; D03.h Supply Creation Decision, SAP Supply Creation Based Confirmation et comportements de fourniture nouvelle documentés.
- Relation : adaptations locales et recouvrements partiels, pas équivalences validées. L’accord métier ne transforme pas ces noms en feuilles natives ni ne prouve toutes leurs règles ou une couverture exhaustive.
- ATP/CTP : ATP retenu dans la promesse. CTP reste documenté au glossaire mais son placement local est différé ; hypothèse analytics/planification/protection non adoptée. CMP051 conserve la définition Microsoft, sans imposer son implantation locale. Supply Creation Decision demeure dans la liste validée ; aucun lien CTP obligatoire.
- Limites : autorités opérationnelles et frontières D01/D06/D07 encore à préciser ; pas de transfert C-Log ni extension du périmètre de développement logistique. Aucun retrait D02 ni reclassement du registre CAP36.
- Auteur/date : Codex, 2026-09-11 ; enregistrement d’une validation locale explicite et actualisation des correspondances.

### CMP053

- Éléments externes : ELM085/ELM086, vérification SAP/Microsoft du 2026-09-11 ; ELM043/ELM063/ELM064/ELM065 comme appuis antérieurs de sous-traitance, commandes et composants TM Forum.
- Éléments locaux : U96/F202/A68/P84 ; D04.a–d de P81 version 0.5 ; récits U48/U53, Q034/Q069 et frontière avec D03 validé.
- Relation : recouvrements partiels et adaptations de vocabulaire. Commitment Creation/Revision rapprochés des accords/commandes et versions ; Commitment Reconciliation rapproché du suivi de consommation et reliquat ; Return and Replacement Decision rapproché des droits et suites des retours. Les quatre noms sont locaux et proposés, pas des feuilles SAP ou Microsoft exactes.
- Justification : achats et ventes présentent des problèmes communs d’obligation, de changement et de rapprochement, sans prouver un domaine natif unifié. Le contexte d’une réalisation reste essentiel pour savoir à quelle obligation l’imputer. Création d’une commande, réception, facturation et consommation d’un accord-cadre ne sont pas des événements interchangeables.
- Adaptation proposée : conserver la vue commune comme hypothèse, éprouver sa frontière avec des domaines achats/ventes spécialisés ; garder les quatre aptitudes initiales pour une première revue. Décisions d’acceptation et retours à clarifier, sans multiplication de capacités par défaut.
- Limites : aucune adoption de nom, frontière ou nombre ; dossier OMS et engagement commercial distincts. Le produit décrit des pratiques possibles, pas une configuration locale ni une règle juridique générale. Finance et réalisation logistique exclues des développements de cette vue ; CTP reste différé.
- Auteur/date/statut : Codex, 2026-09-11 ; première proposition D04 non validée, D03 inchangé.

### CMP054

- Éléments locaux : U97/U98, F203–F208, A69/C64/P85 ; P81 version 0.6. Trois domaines contigus, une ingestion chacun : D09 Party / Role, D11 Agreement, D12 Catalog. Commandes distinctes des Agreements ; D04 reste proposé pour leurs engagements.
- Corpus externe déjà consulté : ELM063/ELM064/ELM065/ELM066 et ELM085/ELM086. Aucune nouvelle vérification externe ; correction du périmètre local, pas nouvel arbitrage sur le contenu des catalogues de marché.
- Relation : rapprochements sémantiques partiels avec Business Partner / Party et rôles, accords clients/fournisseurs et catalogues. Les fonctionnalités de gestion complète de ces objets chez les éditeurs sont plus larges que notre consommation de références externes. Party / Role Ingestion, Agreement Ingestion et Catalog Ingestion sont des libellés locaux ; leur équivalence à des feuilles de capacité natives n’est pas établie.
- Correction de CMP053 : les fonctions de création, révision et consommation des Sales/Purchase agreements Microsoft éclairent le contrat de référence. Elles ne justifient pas de créer ou modifier ces contrats dans D04. Sales/Purchase Order Management et retours restent des appuis partiels pour les commandes transactionnelles. Agreement Management TM Forum est rapproché de D11 ; composants et capacités restent distincts.
- Adaptation : retirer D08.a–c, D09.a–c et D10.a–c de la vue plateforme et conserver leur historique. D04.a–d sont recentrées sur les commandes. Les conditions reçues sont appliquées par les domaines consommateurs, dont les neuf capacités validées d’Order Promising ; elles ne créent pas une capacité de vérification des références.
- Limites : Catalog ne désigne pas tout Product Information Management. Origines des caractéristiques, unités et conditionnements encore à préciser. Aucun contrat d’intégration, source logicielle installée, cardinalité détaillée ou équivalence complète n’est déduit. Le domaine commun de commandes D04 reste à éprouver.
- Auteur/date/statut : Codex, 2026-09-11 ; instruction de périmètre et distinction commandes/Agreements explicites de Laurent appliquées. Correspondances marché partielles, à approfondir pour les trois ingestions.

### CMP055

- Objet : Achat/vente selon l’objet.
- Éléments externes : ELM087–ELM090, ELM096/ELM097.
- État local : U99/F209/A70/C65/P86, P81 version 0.6, dix domaines et 34 capacités.
- Relation : Appui sémantique et recouvrements partiels. Identité Party commune, variantes de contrats et commandes spécialisées dans les suites ; ODA Agreement transversal. Les processus/modules ne valent pas domaines de capacités.
- Adaptation proposée : P86 : conserver les trois ingestions avec variantes ; éprouver un ou deux domaines de commandes, sans scission automatique.
- Preuve et limites : [audit complet](../audits/2026-09-11-modele-marche-achats-ventes-referentiels.md). Les notices de composants et documentations produit ne sont pas un catalogue retail homogène ; aucune configuration installée déduite.
- Auteur/date/statut : Codex, 2026-09-11 ; audit et propositions, aucune validation supplémentaire de Laurent.

### CMP056

- Objet : Références produit, catalogue et prix.
- Éléments externes : ELM088, ELM090–ELM097.
- État local : U99/F209/A70/C65/P86, P81 version 0.6, dix domaines et 34 capacités.
- Relation : Tripartition exhaustive non démontrée. Catalogue et produit distincts ; données tarifaires séparables mais pas toujours en domaine autonome. Application du prix, consommé contractuel et information fournisseur/article ne se déduisent pas d’une ingestion.
- Adaptation proposée : P86 AC01–AC08 : préciser réception produit, autorités du prix et du consommé, usages des références. Maîtrise externe conservée ; aucun nouveau domaine ou capacité actif.
- Preuve et limites : [audit complet](../audits/2026-09-11-modele-marche-achats-ventes-referentiels.md). Les notices de composants et documentations produit ne sont pas un catalogue retail homogène ; aucune configuration installée déduite.
- Auteur/date/statut : Codex, 2026-09-11 ; audit et propositions, aucune validation supplémentaire de Laurent.

### CMP057

- Objet : Revue des 34 capacités et doublons.
- Éléments externes : ELM089/ELM091–ELM098 ; corpus antérieur ELM014, ELM063–ELM083 qualifié dans l’audit.
- État local : U99/F209/A70/C65/P86, P81 version 0.6, dix domaines et 34 capacités.
- Relation : 34 repères revus, sans equivalence complète de capacité revendiquée. Recouvrements D02.a/d avec D01/D03 ; fusion D01.a/b proposée ; titres D04 trop génériques, frontières D06/D07 incomplètes.
- Adaptation proposée : P86 : propositions de noms courts et de répartition, neuf pistes AC non additives. D03 reste validé ; détails et autorités ouverts. API, moteurs, onboarding, finance et exécution logistique ne deviennent pas des ajouts FLOW.
- Preuve et limites : [audit complet](../audits/2026-09-11-modele-marche-achats-ventes-referentiels.md). Les notices de composants et documentations produit ne sont pas un catalogue retail homogène ; aucune configuration installée déduite.
- Auteur/date/statut : Codex, 2026-09-11 ; audit et propositions, aucune validation supplémentaire de Laurent.

### CMP058

- Éléments locaux : U100/F210–F212, A71/C66 ; P81 0.7, onze domaines et 35 capacités. Autonomie article confirmée ; nom Product Reference et D08.d Product Reference Ingestion proposés pour l’appliquer.
- Corpus déjà examiné : ELM089/ELM098 pour commandes et retours, ELM087/ELM095 pour parties et lieux, ELM090/ELM091 pour produit et catalogue. Consultation du corpus U99 datée du 2026-09-11 ; pas de nouvelle vérification externe dans cette mise à jour.
- Relation : appui partiel à la distinction produit/catalogue ; Product Reference Ingestion n’est pas une feuille native de capacités attestée. Le périmètre local de réception est plus étroit que la maîtrise produit des solutions.
- Adaptation : réactiver D08 pour le même sujet article avec une nouvelle capacité D08.d, sans restaurer D08.a–c. Lire les variantes Purchase/Sales/Return comme cas de couverture du socle générique, pas comme prescription de domaines locaux séparés.
- Limite majeure : aucune équivalence précise de marché encore établie pour l’ensemble du modèle de documents comme preuves d’autorisation de mouvement. Ne pas présenter les commandes éditeur comme universellement suffisantes pour autoriser la logistique, ni DMN comme modèle de capacités. Autorisation, acceptation d’exécution et fait réel restent distingués dans la proposition locale.
- Auteur/date/statut : Codex, 2026-09-11 ; orientation Laurent appliquée, raffinements et frontières D04/D07 proposés. [Note de référence](../connaissance/26-supply-documents-autorisations.md). D03 validé, CTP différé, logistique hors développement FLOW.

### CMP059

- État local : U101/F213/A72/C67/P87 ; P81 0.7, onze domaines et 35 aptitudes inchangés.
- Sources : ELM099–ELM102, consultation 2026-09-11 ; MKT22 ajouté pour MDG, autres éditions détaillées dans les éléments.
- Relation : appuis structurels et méthodologiques partiels, pas équivalence. Le regroupement de la gestion des données chez SAP, la catégorie Microsoft, les blocs ODA et la décomposition Guild ne décrivent pas le même objet.
- Adaptation proposée : groupe visuel Business References, conservant D09/D11/D08/D12 et leurs quatre ingestions ; modèles et autorités distincts. Alternative de domaine commun explicitée mais non appliquée.
- Justification : le périmètre de la plateforme est la réception des références, avec maîtrise externe. L’autonomie sémantique n’impose ni rang de domaine au premier niveau ni réalisation séparée.
- Limites : nom et regroupement locaux non validés ; aucune hiérarchie RBA vérifiée par MDG, aucun schéma universel de référentiels établi. Capacités de gouvernance produit et processus externes non importés.
- Auteur/date/statut : Codex, 2026-09-11 ; [étude ciblée](regroupement-referentiels.md), décision ouverte Q075.

### CMP060

- État local : U102/F214/A73/C68 ; P81 0.8 ; D13 Fulfillment Network et D13.a Fulfillment Network Ingestion proposés pour expliciter le référentiel demandé. Douze repères de domaines, 36 aptitudes ; rang de regroupement ouvert.
- Corpus déjà consulté : ELM095 pour les sites SAP, ELM098 pour les règles de lieux/charge Microsoft, ELM065/ELM096 pour les repères ODA dont Location Management. Aucune nouvelle consultation externe dans cette mise à jour.
- Relation : appuis partiels sur lieux et contraintes d’exécution. La correspondance précise de Fulfillment Network, incluant les relations entre points et les autorités, reste **non comparée**. Aucun nom ni niveau natif SAP/Microsoft/TM Forum affirmé pour D13 ou son ingestion.
- Adaptation : expliciter la réception des références réseau, distincte des parties ; préserver l’appréciation contextuelle en D06, les décisions D03 et les engagements/faits D07. Les nœuds, liaisons et caractéristiques détaillés sont des propositions locales.
- Limites : recevoir une topologie ne signifie ni concevoir le réseau, ni piloter le transport, ni développer la logistique dans FLOW. Maîtres et attributs ouverts INF22/Q076 ; pas de référentiel universel démontré.
- Auteur/date/statut : Codex, 2026-09-11 ; orientation Laurent appliquée, modèle détaillé et rang proposés. [Vue D13](../connaissance/25-domaines-coeur-et-epreuve-recits.md#d13-fulfillment-network).

### CMP061

- État local : U103/F215/A74/C69 ; P87 retenue sur la présentation ; P81 0.9.
- Corpus : ELM099–ELM102 et CMP059 pour les distinctions de niveaux ; CMP060 pour le réseau encore partiellement comparé. Aucune nouvelle consultation externe.
- Adaptation appliquée : Business References présenté comme groupe de cinq références autonomes ; sept domaines transactionnels de travail visibles à côté. Douze repères détaillés et 36 aptitudes conservés.
- Relation et limites : le regroupement est local, pas un domaine natif SAP, Microsoft, Guild ou TM Forum. L’accord ne valide pas de nouvelles équivalences, les maîtres ni le modèle détaillé du réseau ; il ne fusionne pas les capacités.
- Auteur/date/statut : Codex, 2026-09-11 ; application de l’accord contextuel de Laurent Go en U103, portée explicitée en F215 ; Q075 résolue, Q076 ouverte.


### CMP062

- État local : U125/U126, backlog après séparation de D01.e en D01.f Inventory Tracking et D01.g Inventory Movements ; six capacités D01, 36 au total.
- Éléments externes : ELM103 SAP, ELM104 Microsoft Supply Chain Management, ELM105 Microsoft Business Central ; consultations du 2026-09-13.
- Relation : appui lexical et fonctionnel partiel. Transactions, état résultant et registre sont distinguables ; le marché consulté ne prouve pas notre découpage en capacités autonomes.
- Adaptation : les mouvements sont enregistrés, qualifiés et justifiés en D01.g ; les quantités et états résultants sont établis et actualisés en D01.f. D01.c conserve la restitution d’une vision partagée. Les ressources futures restent distinctes des mouvements réalisés.
- Nom alternatif : Inventory Ledger Management proposé après U126 ; un ledger désigne d’abord un registre. Sa définition de capacité doit exprimer l’aptitude indépendante des outils. Nom non adopté.
- Limites : ne pas assimiler mouvement à déplacement physique ni prendre la réalisation logistique à la charge de FLOW. Documents, autorités, liens détaillés et correspondance native de chaque capacité restent à préciser.
- Auteur/date/statut : Codex, 2026-09-13. Séparation de travail selon Laurent ; formulations proposées, sans nouvelle validation métier ni publication.


### Actualisation CMP062 — U129

13 septembre 2026 : **Record Inventory Movements** devient le nom adopté localement pour D01.g, d’après U127/U129. La capacité et sa définition conservent les appuis partiels ELM103–ELM105 ; aucune nouvelle équivalence native ni nouvelle consultation externe. Le choix du nom ne valide pas la définition ou les frontières. Inventory Movements et Inventory Ledger Management sont historiques.
### CMP063

- État local : U136/C76, D04 Commercial Commitments, D11 Agreement et D07 dans le backlog et la release v002 ; contenu inchangé.
- Éléments externes : ELM106 Microsoft, ELM107 SAP (extraits limités), ELM108 Oracle Order Management 25C ; contrôle du 2026-09-13.
- Relation : appui sémantique à Agreement/Order et recouvrement partiel commande source/réalisation. Commitment est également employé pour les Agreements Microsoft.
- Adaptation proposée : préférer Order pour l’objet commande ; examiner le domaine après clarification des autorités D04/D07. Aucun renommage appliqué ni équivalence de capacité établie.
- Auteur/date/statut : Codex, 2026-09-13, proposé par l’IA. Analyse et limites dans [Orders, Agreements et Commitments](orders-agreements-commitments.md). U134 conserve la maîtrise externe des références ; aucune validation ni publication.
### CMP064

- État local : U138/U139 ; backlog et release v002, D04/D07 en réexamen, Agreement sous maîtrise externe U134. Aucun changement de capacités.
- Éléments externes : ELM109 SAP, ELM110 Microsoft, ELM111 Oracle, ELM112 IBM Sterling, ELM113 TM Forum ; contrôles du 2026-09-13.
- Relation : appuis sémantiques et méthodologiques, recouvrements partiels ; niveaux natifs explicitement différents. Pas d’équivalence globale de domaine.
- Proposition : éprouver Order Management transactionnel comme espace de la demande autorisée, distinct de la promesse et de la réalisation ; alternative de rapprochement avec D07 si leurs résultats ne sont pas distincts. Famille documentaire commune étayée par Sterling, plusieurs représentations par Oracle/TM Forum.
- Limites : pas de séparation achat/vente imposée, pas de domaine générique déclaré standard ; SAP RBA seulement cité par extrait d’article, pas d’export complet ; ODA n’est pas une carte de capacités.
- Auteur/date/statut : Codex, 2026-09-13, proposé par l’IA ; noms et périmètres non adoptés. [Étude et sources](localisation-orders-cartographie.md). Aucune publication.
### CMP065

- État local : U140/C77 ; D04 Order Management dans le backlog, nom retenu, définition/finalité reformulées proposées. Anciennes capacités à revoir.
- Corpus : ELM114, compléments ELM112 et ELM113 ; sources et limites dans [Supply B2B/B2C](supply-b2b-b2c.md), contrôle 2026-09-13.
- Relation : appuis fonctionnels partiels à un socle commun et à des variantes de satisfaction/réalisation. Pas d’équivalence native de domaine, de Case avec Product Order ou d’univers avec ODA.
- Application : Case distinct d’Order, univers Supply prioritaire, Order Management toutes natures dont retours et tous clients/volumes. Les conditions différenciées ne sont pas automatiquement de nouvelles capacités ; vérifier leur couverture.
- Auteur/date/statut : Codex, 2026-09-13. Orientation utilisateur appliquée ; analyse et détails proposés, aucune publication.
### CMP066

- État local : U141/C78 ; univers Supply/Case et quatre capacités D04.e–h, noms et descriptions courtes approuvés ; D07 précisé sans validation nouvelle de ses formulations.
- Corpus déjà examiné : ELM106 Agreements/Orders, ELM108/ELM111 source et réalisation Oracle, ELM112 famille de documents Sterling, ELM113 niveaux ODA, ELM114 variantes de Supply. Pas de nouvelle consultation externe pour cette application du Go.
- Relations : appui partiel à Registration/Revision par ELM108, à Visibility par les vues de situation ELM111 ; famille de toutes natures ELM112. Reconciliation D04.h et la frontière précise D07.c restent des constructions locales à comparer au niveau exact de résultat. Aucun libellé natif ou équivalence exacte affirmé pour les quatre capacités.
- Agreement complet : engagements et périodes selon ELM106, maîtrise externe selon U134. Le regroupement Supply/Case n’est pas une hiérarchie de marché certifiée ; ODA reste une analogie.
- Auteur/date/statut : Codex, 2026-09-13. Application de l’accord Laurent U141, correspondances proposées et réserves préservées. Voir connaissance/27-order-management-et-univers.md et Q077. Aucune publication.


### CMP067

- Cible : D05, backlog après U219–U221, lu le 2026-09-15 ; empreintes conservées dans marche/etudes/2026-09-15-inventory-optimization/verification.yaml.
- Éléments : ELM119, ELM118, ELM120 ; limite ELM116. Relation : Recouvrement partiel et appui méthodologique ; le périmètre local dépasse les seules cibles de stock IBP.
- Contexte, justification, adaptation et limites détaillés dans [l'étude U222](inventory-optimization-comparaison.md#correspondances-avec-le-backlog).
- Auteur/date/statut : Codex, 2026-09-15, proposé ; valideur et date de validation absents. Aucun état installé évalué, aucune équivalence globale ni changement du modèle appliqué.


### CMP068

- Cible : D05.a, backlog après U219–U221, lu le 2026-09-15 ; empreintes conservées dans marche/etudes/2026-09-15-inventory-optimization/verification.yaml.
- Éléments : ELM119, ELM118, ELM115. Relation : Recouvrement partiel et appuis méthodologique/sémantique ; préciser les critères et la révision des objectifs.
- Contexte, justification, adaptation et limites détaillés dans [l'étude U222](inventory-optimization-comparaison.md#correspondances-avec-le-backlog).
- Auteur/date/statut : Codex, 2026-09-15, proposé ; valideur et date de validation absents. Aucun état installé évalué, aucune équivalence globale ni changement du modèle appliqué.


### CMP069

- Cible : D05.b, backlog après U219–U221, lu le 2026-09-15 ; empreintes conservées dans marche/etudes/2026-09-15-inventory-optimization/verification.yaml.
- Éléments : ELM117, ELM120. Relation : Recouvrement partiel ; les fonctions externes englobent aussi des décisions au-delà du calcul net.
- Contexte, justification, adaptation et limites détaillés dans [l'étude U222](inventory-optimization-comparaison.md#correspondances-avec-le-backlog).
- Auteur/date/statut : Codex, 2026-09-15, proposé ; valideur et date de validation absents. Aucun état installé évalué, aucune équivalence globale ni changement du modèle appliqué.


### CMP070

- Cible : D05.c, backlog après U219–U221, lu le 2026-09-15 ; empreintes conservées dans marche/etudes/2026-09-15-inventory-optimization/verification.yaml.
- Éléments : ELM118, ELM119. Relation : Appui partiel ; redistribution opérationnelle d’excédents non démontrée par les seuls transferts ou cibles multi-échelons.
- Contexte, justification, adaptation et limites détaillés dans [l'étude U222](inventory-optimization-comparaison.md#correspondances-avec-le-backlog).
- Auteur/date/statut : Codex, 2026-09-15, proposé ; valideur et date de validation absents. Aucun état installé évalué, aucune équivalence globale ni changement du modèle appliqué.


### CMP071

- Cible : périmètre D05 envisagé en U221, sans nouveau nœud, backlog après U219–U221, lu le 2026-09-15 ; empreintes conservées dans marche/etudes/2026-09-15-inventory-optimization/verification.yaml.
- Éléments : ELM117, ELM120, ELM118 ; limite ELM121. Relation : Recouvrement fonctionnel partiel ; examiner Replenishment Decision indépendamment du mode automatique.
- Contexte, justification, adaptation et limites détaillés dans [l'étude U222](inventory-optimization-comparaison.md#correspondances-avec-le-backlog).
- Auteur/date/statut : Codex, 2026-09-15, proposé ; valideur et date de validation absents. Aucun état installé évalué, aucune équivalence globale ni changement du modèle appliqué.


### CMP072

- État comparé : backlog après U223 et direction U224, 2026-09-15. Cible : D05 et direction analytique U224. Éléments : ELM122 / ELM125.
- Relation / justification : Appui méthodologique à la distinction recommandation / application, sans équivalence des domaines.
- Contexte, adaptations proposées, sources, localisateurs et limites : [étude U225](optimisation-et-application-stock.md). Pas de modification des nœuds, nouvelle hiérarchie, schéma d'objet ni réalisation SI inférée.
- Auteur / date / statut : Codex, 2026-09-15, proposé. Valideur et date de validation absents.


### CMP073

- État comparé : backlog après U223 et direction U224, 2026-09-15. Cible : D02.b Supply Protection et périmètre Stock Protection cité U224. Éléments : ELM124 / ELM126.
- Relation / justification : Recouvrement partiel : allocation/protection de groupes étayée ; seuil de réassort distinct, pas de regroupement universel démontré.
- Contexte, adaptations proposées, sources, localisateurs et limites : [étude U225](optimisation-et-application-stock.md). Pas de modification des nœuds, nouvelle hiérarchie, schéma d'objet ni réalisation SI inférée.
- Auteur / date / statut : Codex, 2026-09-15, proposé. Valideur et date de validation absents.


### CMP074

- État comparé : backlog après U223 et direction U224, 2026-09-15. Cible : Application opérationnelle U224, D04 et exécutants. Éléments : ELM123 / ELM127.
- Relation / justification : Appuis fonctionnel et sémantique : demande, Order et réalisation distincts ; porteur exact du déclenchement local non tranché.
- Contexte, adaptations proposées, sources, localisateurs et limites : [étude U225](optimisation-et-application-stock.md). Pas de modification des nœuds, nouvelle hiérarchie, schéma d'objet ni réalisation SI inférée.
- Auteur / date / statut : Codex, 2026-09-15, proposé. Valideur et date de validation absents.


### CMP075

- Cible : D05.a/c/d/e/f, backlog après U235, 2026-09-16. Définitions et empreintes dans modeles/backlog/d05-refactoring.yaml.
- Éléments : ELM122 et ELM124 revérifiés le 2026-09-16, ELM128 ; compléments datés U225 conservés sans nouvelle consultation SAP/TM Forum.
- Relations : appui partiel aux cibles (D05.a), sémantique aux allocations (D05.d), fonctionnel au réapprovisionnement intégrant le calcul net (D05.e). Équivalence détaillée redistribution (D05.c) non établie ; Planning local (D05.f) appuyé partiellement, sans équivalence native complète.
- Adaptation : noms et responsabilités adoptés localement par U235 ; correspondances proposées, pas validées. Auteur Codex, 2026-09-16, aucun valideur de comparaison ni couverture installée établie. [Étude et limites](optimisation-et-application-stock.md#application-u235--16-septembre-2026).


### CMP076

- Cible : proposition U237/U238 de référentiel des services exécutants et regroupement D06/D07, D05 conservé ; état comparé au 2026-09-16, release v006 inchangée.
- Éléments : ELM129–135 ; appuis sémantiques et fonctionnels partiels au catalogue, qualification, Service Orders, coordination, suivi et engagements.
- Adaptations proposées : préserver faisabilité dynamique, dépendances entre prestations et exceptions ; distinguer contrat métier, accès technique, engagement, estimation et résultat. Un domaine unique reste un choix local.
- Justifications, sources et limites : [étude U239](execution-services-catalog-and-management.md). Aucun schéma, nouveau nom ou découpage adopté ; aucune preuve de réalisation installée.
- Auteur/date/statut : Codex, 2026-09-16, proposé ; aucun valideur ni date de validation.


**CMP076 — suite U240, 16 septembre 2026 :** les principes locaux sont précisés/adoptés : services et SLA configurés, capacité contextuelle D06 utilisée par D03 pour sa promesse, coordination, engagements distincts, tracking logistique et séparation des accès techniques. Cela ne valide pas les équivalences marché ni leurs granularités. Portées dans execution-services-review.yaml ; aucun changement des capacités actives.

### CMP077

- Cibles : principes U240 du référentiel des services, D06 et D03, regroupement D06/D07 encore à détailler ; état au 2026-09-16, nœuds et release v006 inchangés.
- Éléments : ELM129–134, ELM136–137. Relations : appui méthodologique à la séparation configuration/faisabilité/promesse ; recouvrements fonctionnels partiels de coordination et tracking.
- Adaptations, justifications et limites : [comparaison du modèle révisé U241](execution-services-revised-comparison.md). La promesse Supply et l'engagement daté d'une prestation sont distincts. Disponibilité résiduelle, consommation de capacité et retour vers D03 proposés à préciser, sans nouvelle capacité créée.
- Auteur/date/statut : Codex, 2026-09-16, proposé ; aucun valideur ou date de validation. Aucune équivalence globale, conformité ou couverture installée établie.


**CMP077 — suite U242, 16 septembre 2026 :** accord local sur le retour de l'exécution vers le réexamen de la promesse, complété par la responsabilité d'orchestration, tracking et adaptation du plan. Correspondances marché et recommandations sur la capacité restent proposées. Voir user_agreements_U242 dans execution-services-review.yaml ; cet accord n'est pas une validation des équivalences externes.


### CMP078

- État comparé : backlog appliqué U244, D06 regroupé, D14 nouveau référentiel ; nœuds D06.a–d et D07.a–d, D14.a. D05 inchangé.
- Éléments : ELM129–134 et ELM136–137, consultés le 16 septembre 2026 dans les études U239/U241. Actualisation de correspondance depuis ces preuves, sans nouvelle consultation éditeur.
- D14/D14.a : appui sémantique ELM129 au catalogue, aucune équivalence de l’ingestion locale. D06.a : qualification ELM130, adaptation télécom/logistique. D06.b : ELM136/137 soutiennent partiellement capacité vers promesse, sans preuve de l’API logistique envisagée. D06.c : options de réalisation, équivalence détaillée non établie.
- D07.a/b : appuis ELM131/133 aux demandes et engagements, sans cycle universel. D07.d : appuis ELM133/134 aux faits et suivi, extension documentaire et ressources attendues locales. D07.c : rapprochement de prestations versus reliquats Order, équivalence détaillée non établie. D06.d : appui ELM132 à la coordination des dépendances ; latitude d’adaptation locale hors définition du catalogue selon U243.
- Justification, limites et sources : execution-services-revised-comparison.md et connaissance/32-execution-orchestration.md. Noms et granularité d’application proposés ; aucune équivalence globale, conformité ou preuve de couverture installée.
- Auteur/date/statut : Codex, 2026-09-16, proposé ; aucun valideur de comparaison.


### CMP079

- État comparé : catalogue D06 après U247, en remplacement de la maille U244 pour les responsabilités modifiées. Date : 2026-09-16 ; auteur Codex ; statut proposé, aucune validation d'équivalence.
- Sources existantes : études U239/U241 et ELM129–134 / ELM136–137, consultées le 16 septembre 2026 ; aucune nouvelle consultation éditeur dans cette application.
- D07.b Service Order Management : appuis fonctionnels partiels ELM131 et ELM133 aux demandes de service, réponses et évolutions ; pas de cycle universel ni équivalence à un domaine logiciel.
- D06.b Capacity Visibility : recouvrement limité aux informations de capacité utiles à la promesse ; les calculs CTP/PP/DS des ELM136/137 ne sont pas assimilés à cette visibilité. Responsabilité de calcul du disponible non attribuée par ce nom.
- D06.e Service Decision : proposition regroupant qualification et options ; appui partiel ELM130 à l'admissibilité, équivalence du choix de service non établie. D07.a Requirements Decision : définition du besoin, équivalence détaillée non établie.
- D06.d Orchestration : appui ELM132 aux dépendances. D06.f Adaptation Decision : séparation locale demandée U245/U247, aucune capacité native équivalente démontrée. D07.d tracking et D07.c rapprochement conservent les limites CMP078.
- La promesse Supply reste D03 ; les exécutants gardent leurs opérations internes. Description et limites : connaissance/32-execution-orchestration.md et execution-services-review.yaml, application_U247.


### CMP080

- Cible : D01 : D01.f/g/c/d, D02.b/c. État comparé : v007, publication 2026-09-16.2 ; champs identiques au backlog au début de l’audit U249.
- Éléments : ELM138/139/142/144. Relation et adaptation proposées : Recouvrement partiel de visibilité, protections/réservations ; appui méthodologique au rapprochement entre représentations. Stocktaking ne devient pas équivalent à la réconciliation informatique. Préciser gouvernance de Supply Protection et contrats de stock avant création de capacité.
- Justifications, contexte, sources précises et limites : [rapport U249](../audits/2026-09-16-audit-maturite/rapport.md) et ses annexes éditeurs. Aucune équivalence globale, validation de cible ou couverture installée inférée.
- Auteur/date/statut : Codex, 2026-09-16, proposé ; aucun valideur ni date de validation de correspondance. Les accords locaux antérieurs gardent leur portée propre.


### CMP081

- Cible : D03 : D03.a/b/c/i/j/k/l/m et D02.e. État comparé : v007, publication 2026-09-16.2 ; champs identiques au backlog au début de l’audit U249.
- Éléments : ELM136/143/144/145/148/152/155/157. Relation et adaptation proposées : Recouvrements partiels des fonctions de promesse et appuis à leurs dépendances. CTP local volontairement plus large ; maille des actions à éprouver sans fusion adoptée. Priorisation et affectation locales ne sont pas démontrées comme équivalents exacts ; conserver résultat, autorisation et application distincts.
- Justifications, contexte, sources précises et limites : [rapport U249](../audits/2026-09-16-audit-maturite/rapport.md) et ses annexes éditeurs. Aucune équivalence globale, validation de cible ou couverture installée inférée.
- Auteur/date/statut : Codex, 2026-09-16, proposé ; aucun valideur ni date de validation de correspondance. Les accords locaux antérieurs gardent leur portée propre.


### CMP082

- Cible : D04 : D04.i/j/k/l/m/n/o. État comparé : v007, publication 2026-09-16.2 ; champs identiques au backlog au début de l’audit U249.
- Éléments : ELM141/147/153/154. Relation et adaptation proposées : Appuis fonctionnels et sémantiques aux Orders et transitions ; audit détaillé des cinq types non exhaustif chez chaque éditeur. Décision sur le devenir du retour à attribuer. Nature Lifecycle à discuter selon son résultat, pas à reclasser du seul fait de son nom.
- Justifications, contexte, sources précises et limites : [rapport U249](../audits/2026-09-16-audit-maturite/rapport.md) et ses annexes éditeurs. Aucune équivalence globale, validation de cible ou couverture installée inférée.
- Auteur/date/statut : Codex, 2026-09-16, proposé ; aucun valideur ni date de validation de correspondance. Les accords locaux antérieurs gardent leur portée propre.


### CMP083

- Cible : D05 : D05.a/d/e/c/f. État comparé : v007, publication 2026-09-16.2 ; champs identiques au backlog au début de l’audit U249.
- Éléments : ELM139/140/146/149/150/151. Relation et adaptation proposées : Recouvrements partiels de cibles, politiques, réapprovisionnement et rééquilibrage ; appui méthodologique à planification/application. Attribuer mise à jour des paramètres et transformation des apports en Orders. Le cas PAR ne définit pas une architecture universelle ; aucun calcul autonome ni domaine supplémentaire déduit.
- Justifications, contexte, sources précises et limites : [rapport U249](../audits/2026-09-16-audit-maturite/rapport.md) et ses annexes éditeurs. Aucune équivalence globale, validation de cible ou couverture installée inférée.
- Auteur/date/statut : Codex, 2026-09-16, proposé ; aucun valideur ni date de validation de correspondance. Les accords locaux antérieurs gardent leur portée propre.


### CMP084

- Cible : D06 : D07.a/b/c/d, D06.b/d/e/f. État comparé : v007, publication 2026-09-16.2 ; champs identiques au backlog au début de l’audit U249.
- Éléments : ELM132/133/134/142/151/155/156. Relation et adaptation proposées : Appuis partiels à demandes, coordination et suivi ; aucune équivalence native du catalogue complet. Capacité logistique, promesse Supply et SLA distincts. Orchestration/Adaptation est un choix local. Compléter résultats échangés et conditions ; la latitude opérationnelle ne conditionne pas le catalogue.
- Justifications, contexte, sources précises et limites : [rapport U249](../audits/2026-09-16-audit-maturite/rapport.md) et ses annexes éditeurs. Aucune équivalence globale, validation de cible ou couverture installée inférée.
- Auteur/date/statut : Codex, 2026-09-16, proposé ; aucun valideur ni date de validation de correspondance. Les accords locaux antérieurs gardent leur portée propre.


### CMP085

- Cible : Référentiels D08/D09/D11/D12/D13/D14 et leurs ingestions D08.d/D09.d/D11.a/D12.a/D13.a/D14.a. État comparé : v007, publication 2026-09-16.2 ; champs identiques au backlog au début de l’audit U249.
- Éléments : ELM129/133/148/152. Relation et adaptation proposées : Appuis sémantiques et méthodologiques à données de référence et projections. Équivalence détaillée des six ingestions non établie. FLOW ne gère pas les maîtres ; ne pas comparer son ingestion à l’ensemble de l’administration d’un ERP. Entrées économiques, demande et capacité dynamique à contracter dans leurs contextes.
- Justifications, contexte, sources précises et limites : [rapport U249](../audits/2026-09-16-audit-maturite/rapport.md) et ses annexes éditeurs. Aucune équivalence globale, validation de cible ou couverture installée inférée.
- Auteur/date/statut : Codex, 2026-09-16, proposé ; aucun valideur ni date de validation de correspondance. Les accords locaux antérieurs gardent leur portée propre.


### CMP086

- Cible : D03.j CTP après U251, au backlog ; définition resserrée sur faisabilité après adaptation, décisions spécialisées responsables de leurs résultats. Les six relations proposées explicitent des besoins et contributions ; elles ne constituent pas une équivalence marché.
- Éléments : ELM136, ELM143/144/145/148/152/155/157, mêmes passages officiels consultés le 16 septembre 2026 pour CMP081. Aucune nouvelle consultation éditeur revendiquée dans cette application.
- Relation : recouvrements partiels et appuis méthodologiques. L’extension locale de CTP reste explicite ; l’attribution des priorités, de l’échéancier, de l’économie, des politiques et des services est un choix FLOW. Le recours à un apport pour un Order ne devient pas équivalent à Inventory Optimization.
- Adaptation appliquée : définition et frontières adoptées U251, détails proposés dans [frontières CTP](../connaissance/33-frontieres-ctp.md). Contexte et limites des sources : [audit U249](../audits/2026-09-16-audit-maturite/rapport.md). Les constats de v007 restent historiques pour cette définition ; aucune équivalence globale ou couverture installée déduite.
- Auteur/date/statut : Codex, 2026-09-16, correspondance proposée ; aucun valideur ni date de validation de correspondance. L’adoption locale de définition ne valide pas le rapprochement marché.


### CMP087

- Éléments externes : ELM082 (reconsulté), ELM158–162 ; références APICS/ASCM, Microsoft SCM et SAP aATP.
- Cibles : D03.i ATP, D03.j CTP, D03.k/l/m, D02.b Supply Protection, D02.e Supply Assignment, D03.c Promise Revision ; interfaces D04/D06. Vocabulaire TER022/044/077 et convention MOD005.
- État comparé : backlog après U251, discussion U256–U260 ; D03.i inchangé. Aucun remplacement rétrospectif de CMP081/086.
- Relation : appui sémantique et recouvrements partiels plusieurs-à-plusieurs ; aATP couvre des responsabilités au-delà de notre ATP. La protection collective et l’affectation individuelle restent distinctes.
- Adaptations proposées : couverture explicative, situation de référence à expliciter, interfaces décision/application préservées. Voir [étude et tableau](atp-aatp-couverture.md).
- Limites : sources et éditions indiquées dans l’étude ; critères détaillés de couverture FLOW non imposés par APICS ; pas de classement universel ATP/CTP à partir du nom SAP. Aucun produit installé présumé.
- Auteur/date/statut : Codex, 2026-09-16, proposé ; aucun valideur ni date de validation de correspondance. Accord de principe U260 distinct de la correspondance.


### CMP088

- Éléments : ELM052 reconsulté, ELM163–165. Cible : granularité descriptive de D03.i ATP et convention de modélisation envisagée par U261.
- État comparé : backlog après U260 ; catalogue de 41 capacités inchangé. Les données U261 sont consignées dans d03-review.yaml.atp_information_U261.
- Relation : appui méthodologique BIZBOK/LeanIX/Ardoq, illustration fonctionnelle Microsoft ; aucune équivalence globale.
- Proposition : distinguer décomposition, comportement/variante, réalisation et maturité ; documenter les dimensions combinables d’ATP et envisager des profils contextualisés.
- Justification et limites : [étude U261](capacites-variantes-niveaux-atp.md). Profil est une proposition locale ; les quatre dimensions ne sont pas quatre niveaux successifs. Aucun nouveau niveau, schéma, capacité ou interface adopté.
- Auteur/date/statut : Codex, 2026-09-17, proposé ; aucun valideur ni date de validation de correspondance.


Complément U262 à CMP088 — 17 septembre 2026 : Comportement est retenu comme maille complémentaire terminale. Cela remplace la recommandation locale variantes/profils, sans modifier le constat sur les notions de marché. Appui BIZBOK Capability Behavior conservé ; pas de nouvelle consultation ni de validation d’équivalence. La profondeur terminale est un choix FLOW.


## CMP089

- Objet : granularité des 41 capacités et quatre comportements ATP ; audit U265/U266.
- Sources : ELM166–172 ; ELM052 (BIZBOK) et ELM163 (LeanIX) reconsultés le 17 septembre 2026.
- Relation : appui méthodologique et fonctionnel, plusieurs-à-plusieurs ; aucune équivalence par numéro de niveau.
- Résultat proposé : conserver Capacité → Comportement comme profondeur terminale ; décomposer sélectivement Planning, Protection, Lifecycle et Orchestration ; instruire Promise Management et frontière Reservation/Assignment.
- Catalogue local : aucun déplacement de capacité appliqué. La matrice distingue les appuis directs, analogies et éléments non comparés individuellement.
- Sources, passages, périmètre et limites : [marché](../audits/2026-09-17-audit-comportements/marche.md) ; [matrice](../audits/2026-09-17-audit-comportements/matrice.md).
- Auteur/date/statut : Codex, 2026-09-17, proposé ; aucun valideur ni validation d’équivalence.


## CMP090

- Objet : proposition U267, cinq comportements de scénario pour D05.f Inventory Planning ; méthode demandée U268.
- Éléments : ELM173/174, ELM168/169 reconsultés le 17 septembre 2026.
- Relation : appui fonctionnel, pas équivalence normative ; création/simulation/comparaison/approbation/application confrontées aux fonctions SAP IBP, Microsoft SCM et Oracle Supply Planning.
- Recommandation : construire le scénario plutôt que reconfigurer seulement ; distinguer simulation et évaluation ; conserver validation et examiner application via capacités opérationnelles responsables.
- Justification, sources, limites et bénéfices : audits/2026-09-17-audit-comportements/scenario-planning-proposition.md.
- Auteur/date/statut : Codex, 2026-09-17, proposé. Rattachement et mandat de l’application à D05.f à arbitrer ; aucun comportement créé ou adopté.


Complément U269 à CMP090 — 17 septembre 2026 : les cinq noms, descriptions courtes, rattachements à Inventory Planning et bénéfice du découpage sont adoptés. Application via capacités opérationnelles responsables adoptée. Les rapprochements SAP/Microsoft/Oracle restent des appuis fonctionnels proposés, sans adoption d’équivalence normative ; sources déjà consultées U267/U268, aucune nouvelle comparaison nécessaire pour cette transcription.


## CMP091

- Objet : U270, analyse d’impact en indicateurs comme comportement complémentaire d’Inventory Planning.
- Références : ELM175 (SAP IBP) ; ELM174 reconsulté pour Oracle 26B et les indicateurs agrégés.
- Proposition : Scenario Impact Analysis quantifie et explique les effets attendus sur les indicateurs, avec référence, périmètre et horizon. Simulation produit la situation projetée ; Evaluation apprécie le compromis. La simulation peut déjà fournir les indicateurs exploités par l’analyse d’impact.
- Justification : rendre visibles impacts et répartition avant appréciation ; préciser les frontières pour éviter le recouvrement des définitions U269.
- Portée et preuves : audits/2026-09-17-planning-comportements/impact-analysis.md. Appui fonctionnel, aucune équivalence normative adoptée.
- Auteur/date/statut : Codex, 2026-09-17, proposé. U270 reconnaît le comportement complémentaire ; noms et définitions détaillées restent proposés. Catalogue U269 inchangé.


Complément U271 à CMP091 — 17 septembre 2026 : Scenario Impact Analysis, sa définition, son rattachement à Inventory Planning, son bénéfice et les frontières présentées avec Simulation/Evaluation sont adoptés. Les fonctions SAP et Oracle restent des appuis, sans équivalence normative adoptée. Les sources consultées U270 sont réutilisées pour transcrire cet accord ; aucune nouvelle proposition marché.


## CMP092

- Objet : D02.b Supply Protection et BHV011 Allocation, backlog U276/U277.
- Élément : ELM176 ; approfondissement de la source Microsoft déjà utilisée en ELM168.
- Relation : appui fonctionnel proposé, recouvrement partiel ; aucune équivalence normative.
- Choix FLOW : conserver un comportement Allocation terminal avec plusieurs mécanismes combinables décrits dans son périmètre. Ni un comportement par API, ni des sous-comportements.
- Bénéfice : distinguer gouvernance des enveloppes, consommation de droits et affectation de ressources ; rendre visibles les soldes et éviter de bloquer des ressources par des enveloppes devenues inutiles.
- Frontières : D05.d détermine les valeurs ; D02.e affecte aux besoins ; D02.c porte la réservation. Le point d’imputation et les corrections restent à instruire. Le volet surstock U274 dépasse cette documentation.
- Statut : nom et rattachement Allocation issus de U276 ; descriptions et justification éditoriales proposées sous mandat U277. Auteur : Codex, 2026-09-17. Pas de validation d’équivalence marché.


Complément U278 à CMP092 — 17 septembre 2026 : Laurent corrige la maille en cinq comportements pairs sous Supply Protection. La recommandation précédente de les regrouper dans un seul comportement est remplacée. La source ELM176 est reconsultée, sections Use the allocation APIs, Allocate, Reallocate, Unallocate, Consume et Query. Chaque comportement est justifié par un résultat métier distinct : création de droits, changement de bénéficiaire, restitution, imputation d’usage ou visibilité. Cette justification porte sur les effets métier, pas sur le nombre d’API. Noms anglais nouveaux et descriptions complémentaires proposés ; pas d’équivalence normative Microsoft adoptée. Le solde d’enveloppe diffère du stock physique ; les autres risques de Protection ne sont pas intégralement couverts par ces cinq comportements.


## CMP093

- Objet : Supply Protection D02.b, U279–U281 ; compléter les cinq comportements d’enveloppes après la question des seuils de réassort.
- Sources : ELM176 reconsulté ; ELM177–186, neuf éditeurs. Registre détaillé dans modeles/backlog/supply-protection-review.yaml ; rapport marche/supply-protection-comportements.md.
- Relations : appuis fonctionnels partiels et choix de décomposition FLOW ; aucune équivalence normative ni exhaustion de tout le marché revendiquée.
- Résultat proposé : 17 comportements candidats, dont cinq existants, dix compléments de cœur de périmètre et deux conditionnels (mise à jour en masse et surveillance). Détail et bénéfice ciblé par ligne dans l’annexe ; aucun nouveau nœud actif.
- Frontières : configuration de règles versus décision des valeurs, décision des apports, scénarios, affectation aux Orders, réservation et réalisation. Le volet surstock fait apparaître un besoin de vérifier les décisions de réduction/report des apports, non absorbé implicitement.
- Limites : sources spécialistes de présentation ; IBM indexé avec une référence historique 9.5.0 ; Oracle Retail latest non figé. Absence de passage ne signifie pas absence de fonction.
- Auteur/date/statut : Codex, 2026-09-17, proposé. U281 approuve la méthode seulement ; noms, définitions et rattachements nouveaux restent à discuter.


Complément U282 à CMP093 — 17 septembre 2026 : la recommandation de 17 comportements est remise en question. Conserver les preuves fonctionnelles, reprendre la décomposition par mécanismes. Sources S05 SAP SuP, S02 Microsoft méthodes de réassort et S07 Oracle politiques reconsultées : mécanismes/politiques et opérations d’administration sont des lectures distinctes. La cible de mécanismes sera un choix FLOW justifié par risques et effets ; aucune nouvelle équivalence ni liste adoptée.


## CMP094

- Objet : U283 ; critères de comportement et réexamen de Planning, backlog D05.f, BHV005–010 et MOD006.
- Référence : ELM187 / MKT28 ; source primaire Kinaxis effectivement consultée le 17 septembre 2026.
- Relation : appui méthodologique et recouvrement partiel. Les effets sur la coordination et la réaction aux aléas étayent la distinction recherchée par Laurent.
- Choix FLOW : mécanisme, politique, variante ou bénéfice distinguent les comportements ; construction d’alternatives, simulation et adaptation retenues dans le principe. Les quatre autres éléments de Planning sont requalifiés en fonctions de produits selon U283. Kinaxis ne prescrit ni cette terminologie ni cette séparation.
- Limite et recommandation : un bénéfice générique ne suffit pas à différencier deux comportements ; préciser ce qui change concrètement dans la manière d’agir. Un impact humain peut exister même si la réalisation est automatisée. Ces précisions sont une interprétation proposée par Codex, cohérente avec U265 et les frontières existantes.
- Frontière proposée : adapter le scénario de stock via les décisions D05 ; conserver la décision d’adaptation et l’orchestration opérationnelles D06. Noms et définitions détaillés restent à instruire.
- Auteur/date/statut : Codex, 2026-09-17. Direction U283 adoptée dans sa portée ; correspondance marché proposée, aucune équivalence normative validée.


Complément U284 à CMP094 — 17 septembre 2026 : Simulation & analyse retenu comme comportement unique. Kinaxis S&OP (complément ELM187) rapproche simulation, options et impacts. Ce rapprochement soutient le regroupement FLOW ; il ne prescrit ni notre intitulé ni nos trois comportements. Bénéfice : rendre explicite que la projection doit être interprétée pour éclairer les choix, sans réintroduire un comportement autonome d’analyse d’impact. Orientation utilisateur adoptée ; équivalence normative non revendiquée. Auteur : Codex.


Complément U285 à CMP094 — 17 septembre 2026 : réexamen transversal recommandé après U282–U284. Sources primaires reconsultées : Microsoft Inventory Visibility allocation (ELM176, sections Business background and purpose / Use the allocation APIs) et Kinaxis What is concurrent planning? (ELM187). Microsoft distingue finalités de protection et contrôle de surconsommation des opérations API ; Kinaxis relie scénarios, adaptations et coordination. Ces appuis justifient de comparer à des mécanismes et effets, sans recopier des listes de fonctions ni déclarer toutes les capacités actuelles erronées. La nécessité de refonte découle surtout des contradictions constatées entre catalogue FLOW et arbitrages courants. Les anciennes propositions de regroupement/descente en comportement doivent être requalifiées ; pas d’adoption automatique. Diagnostic et plan : behavior-audit.yaml, refactoring_U285. Auteur : Codex ; recommandation proposée.


## CMP095

- Objet : U286, 41 capacités et 15 comportements de la capture audits/2026-09-17-refonte-modele/model-before.yaml ; empreinte dans l’annexe cible.
- Sources : ELM188 et S01–S12 de modeles/backlog/refactoring-target.yaml ; reprend et précise aussi ELM176–179, ELM183 et ELM187.
- Relation : appuis fonctionnels/méthodologiques partiels. Chaque recommandation est justifiée par le marché consulté ou explicitement par la cohérence FLOW.
- Cible proposée : quatre mécanismes Protection ; trois Planning selon accords ; quatre ATP conservés ; fusion candidate Promise Management sans comportements CRUD ; ajustements des apports D05.e ; Stocktaking/Orchestration conditionnels.
- Écarts : Supply Protection FLOW dépasse SAP SuP ; les produits combinent décisions et application que FLOW distingue. Les anciennes listes d’opérations sont matière fonctionnelle.
- Limites : pas de copie des niveaux éditeurs, de complétude Case, ni de preuve d’installation. Fusion et frontières restent des arbitrages FLOW.
- Statut/auteur/date : proposition Codex, 17 septembre 2026. U286 autorise la préparation ; les valeurs nouvelles ne sont pas automatiquement adoptées.


Complément U287 à CMP095 — 17 septembre 2026 : principe d’un mécanisme d’application de scénario/plan dans D04 retenu par Laurent. S13/S14 soutiennent le passage plan → Orders. Proposition Plan-driven Order Application : cohérence d’ensemble, origine et résultat d’application ; règles de reprise et traitement partiel proposées. Parent précis à arbitrer (A8), sans duplication sous les cinq types, sans absorption de la configuration des droits D02.b ni de l’exécution D06. D05 conserve la construction, la simulation/analyse et l’adaptation du scénario. Le total cible de 39 capacités reste conditionnel à Promise Management et exclut une éventuelle capacité transverse supplémentaire.


Complément U288 à CMP095 — 17 septembre 2026 : Laurent adopte le regroupement sous Promise Management et corrige la proposition en trois comportements (Proposal, Confirmation, Revision). L’ancienne recommandation « fonctions seulement » est remplacée. SAP BOP (S10, consulté dans cette passe) appuie le besoin de réexamen des confirmations ; il ne prescrit pas notre hiérarchie. Justification FLOW proposée : possibilités sans engagement, engagement explicite, puis révision autorisée ont des effets métier distincts. Aucun retour au découpage opérationnel d’Allocation ou de Planning n’est déduit.


## CMP096

- Objet : Supply Assignment D02.e, protections D02.b, décision de droits D05.d et plan U287 corrigé U289.
- Sources : ELM189, T1–T4 dans assignment-terminology.yaml, effectivement consultées le 17 septembre 2026.
- Résultat : Supply Assignment / affectation des ressources aux commandes est le terme de travail FLOW, cohérent avec SAP ARun et U275. Allocation est polysémique : PAL SAP, enveloppes Microsoft, distribution aux lieux Oracle Retail.
- Convention : nommer le résultat Supply Assignment Plan / plan d’affectation. Groupes : enveloppes de protection et limites d’usage. Proposer Group Protection Decision en cible pour le nom ambigu Stock Allocation Decision, sans renommer le nœud adopté actif à ce stade.
- Correction : l’exemple magasin ajouté U287 par Codex était une mauvaise interprétation ; l’application d’affectations ne se confond pas avec modifier ou créer des Orders. Frontières exactes encore à instruire.
- Statut/auteur/date : Codex, 17 septembre 2026, convention de travail fixée sous mandat U289, appui lexical partiel. Aucune équivalence normative ni validation détaillée de définitions auto-attribuée.


## CMP097

- Objet : refonte appliquée U290 et finalité de Supply Assignment.
- Sources : ELM188–190 ; cible U286–U289, comparaison CMP095/CMP096 et Microsoft IFO consulté le 17 septembre 2026.
- Rapprochement : la pluralité des objectifs et contraintes de fulfillment soutient la finalité de valeur multidimensionnelle confirmée par Laurent. Les dimensions et poids FLOW sont à définir ; ne pas assimiler valeur à volume promis ou marge seule.
- Choix FLOW : Supply Assignment conserve les liens ressources-commandes ; priorisation, faisabilité, arbitrage économique et échéancier restent leurs décisions spécialisées. Les critères éditoriaux ne deviennent pas des comportements supplémentaires.
- Migration : Promise Management D03.n et trois comportements, trois Planning, quatre mécanismes Protection, ATP conservé. D05.d devient Group Protection Decision. Les anciennes correspondances à D03.a/b/c décrivent les responsabilités maintenant portées par BHV021/022/023 ; les preuves historiques gardent leurs IDs. Voir refactoring-implementation.yaml pour toutes les correspondances.
- Limites : contrats détaillés en instruction ; quatre comportements optionnels non créés ; Reservation/Assignment et parent D04 à instruire. Pas de nouvel alignement exhaustif produit/produit ni de déploiement revendiqué.
- Statut/auteur/date : Codex, 17 septembre 2026 ; refonte demandée U290, comparaison et compléments éditoriaux proposés.


## CMP098

- Objet : audit U292 des comportements manquants après refonte U290. Baseline backlog : 39 capacités, 14 comportements ; empreinte dans modeles/backlog/behavior-gap-audit.yaml.
- Éléments externes : ELM191, S01–S28. Contexte : cible FLOW Supply ; six projections de référentiels examinées, Business Services non décomposé hors conclusion de complétude. Aucune couverture installée des trois SI inférée.
- Relation : appuis fonctionnels et méthodologiques, recouvrements partiels. Les 39 rapprochements et 16 candidats sont explicités individuellement dans l’annexe ; aucune équivalence de hiérarchie éditeur/FLOW.
- Résultat proposé : niveau terminal suffisant pour les mécanismes étudiés ; onze candidats ciblés sur six capacités, cinq candidats conditionnels, sept arbitrages. Les 14 comportements existants sont réexaminés sans retrait ni ajout automatique.
- Adaptation : préserver décision, configuration, application aux Orders et exécution ; critères mécanisme/politique/variante/bénéfice plutôt que CRUD. Contrats et cas fictifs précisent les limites.
- Limites : comparaison documentaire ciblée de sept éditeurs, pas inventaire exhaustif ; pages commerciales moins probantes que guides ; projections MDM non comparées exhaustivement ; Sarenza non évalué.
- Statut/auteur/date : proposé, Codex, 17 septembre 2026 ; aucun valideur ni adoption attribué. U292 autorise l’étude uniquement. [Rapport](../audits/2026-09-17-comportements-manquants/rapport.md).


## CMP099

- Objet : corrections U293 de l’audit U292, sur D07.d, D04.o, D06.d et vocabulaire des excédents.
- Appuis : ELM192, S29–S33 ; S12 pour les excédents et S17 pour la compensation produit. Baseline du catalogue U290 inchangée.
- Résultat : tracking normal et visibilité du transit, complétés par détection d’exceptions ; séparation état métier de l’Order / conduite du processus / coordination des prestations. Retrait de P05 comme comportement autonome ; P11 à clarifier. Proposition Transit Visibility sans création de BHV.
- Limites : compensation n’est pas spécifique au Case Management ; l’Order comme case est le choix du contexte discuté, pas un axiome général. Interruption, compensation et irréversibilité physique restent distinctes. Excédent dépend d’un besoin/cible, lieu et horizon.
- Statut/auteur/date : corrections reçues U293 ; définitions et rattachements supplémentaires proposés par Codex le 17 septembre 2026. Aucun nom de capacité ni domaine renommé.


## CMP100

- Objet : proposition logistique sous D07.d après U294 ; catalogue U290 inchangé.
- Sources : ELM193, S29/S34–S36 de behavior-gap-audit.yaml.
- Relation : appui lexical et recouvrement de périmètre, pas équivalence de produits. SAP/Oracle emploient Track and Trace ; les spécialistes emploient aussi Transportation Visibility.
- Recommandation : abandonner Transit Visibility comme proposition de nom au profit de Track and Trace ; Global Track seul non établi comme terme commun. Rattachement et articulation avec les exceptions restent proposés.
- Statut : règle de méthode reçue U294 ; libellé et définition proposés par Codex, 17 septembre 2026. Aucune innovation FLOW alléguée pour renommer le concept, aucune mutation de catalogue.


## CMP101

- Objet : discussion U295 sur la symétrie avec Inventory Visibility D01.c, conservé dans le backlog U290.
- Sources : S29 SAP/MKT37, S35 project44/MKT38, S36 FourKites/MKT39, effectivement reconsultées pour SAP/project44 le 17 septembre 2026 ; périmètres et limites dans behavior-gap-audit.yaml.
- Relation : appui lexical et recouvrement de périmètre. Transportation Visibility est un terme établi, donc le miroir avec Inventory Visibility n’invente pas un vocabulaire FLOW. Logistics Visibility est également utilisé, notamment par SAP, avec suivi de fulfillment et expéditions.
- Proposition : Transportation Visibility pour le besoin précis d’acheminement ; Logistics Visibility si un suivi logistique plus large est retenu. Cette distinction de travail n’est pas une frontière normalisée entre éditeurs. Track and Trace reste une formulation de marché légitime, pas un nom exclusif.
- Statut : discussion, Codex, 17 septembre 2026. Aucun nom adopté, aucune mutation de catalogue ; rattachement et granularité distincts du choix de libellé.


## CMP102

- Objet : périmètre physique précisé U296, du picking au point final ; comparaison des noms proposés sous Execution Tracking, catalogue actif inchangé.
- Sources : ELM194 / S29, S37–S40 de behavior-gap-audit.yaml. Logistics recouvre entreposage/manutention/transport chez CSCMP ; GTT SAP prévoit des événements de préparation. Fulfillment Visibility a des usages plus centrés sur la satisfaction des Orders, parfois incluant leurs apports.
- Recommandation : Logistics Visibility pour ce parcours physique complet. Transportation Visibility trop restrictif comme signal de périmètre dans notre discussion ; Fulfillment Visibility possible mais moins précis sur l’objet physique suivi. Aucune frontière universelle prétendue entre les termes éditeurs.
- Limites : un nom produit ne garantit pas la collecte de tous les événements. Visibilité des opérations de l’exécutant n’en transfère pas la responsabilité à FLOW ; le stock ne disparaît pas quand le picking commence. Rattachement et granularité restent à valider.
- Statut : périmètre exprimé U296 ; nom et définition proposés par Codex, 17 septembre 2026.


Complément U297 à CMP102 — 17 septembre 2026 : Laurent valide explicitement le nom **Logistics Visibility** pour le parcours physique précisé U296. Accord enregistré avec empreinte du nom dans behavior-gap-audit.yaml, feedback_U297. La comparaison marché étaye le nom ; elle ne valide pas automatiquement le détail éditorial, le niveau ou le rattachement. D01.c Inventory Visibility et D07.d Execution Tracking inchangés dans le catalogue ; aucune publication.


Complément U298 à CMP098/CMP102 — 17 septembre 2026 : le socle de l’audit reste pertinent pour le catalogue U290 inchangé. Consolidation des conclusions après U293–U297 : sept candidats initiaux à instruire, cinq conditionnels, P04/P10/P11 à réexaminer, P05 retiré ; nom Logistics Visibility adopté, rattachement ouvert. Réserves P04/P10 : raisonnement sur les frontières FLOW et les limites des appuis S25/S19/S29/S38, pas nouvelle observation de couverture produit. Pas de recherche exhaustive refaite ni validation collective déduite. Détails dans current_synthesis_U298 de behavior-gap-audit.yaml.


Complément U299 à CMP098/CMP102 — 17 septembre 2026 : validation par Laurent des deux corrections P04/P10 présentées U298. Les appuis S25 (mécanisme de processus) et S29/S38 (visibilité logistique) restent des comparaisons de portée, sans nouvelle preuve produit. Les exceptions logistiques ne sont pas dupliquées ; coordonner les dépendances ne suffit pas à créer un comportement distinct du parent. Les fiches initiales restent à réexaminer selon ces règles validées, sans adoption de nouveaux nœuds.


## CMP103

- Objet : positionnement proposé U300 de Logistics Visibility comme comportement de D07.d Execution Tracking sous D06.
- Sources : ELM195 / S41 GS1 ; S29 SAP GTT reconsulté et S38 pour les événements de préparation. Le marché étaye la continuité physique, le contexte des Orders et les exceptions ; pas une hiérarchie métier native équivalente.
- Justification FLOW : D07.d couvre déjà les prestations physiques et non physiques. Spécialiser le suivi du parcours permet d’expliciter sa complexité et son bénéfice sans créer un second mandat concurrent ni faire disparaître les prestations documentaires.
- Alternatives : capacité autonome possible avec redéfinition explicite du suivi résiduel ; renommage intégral du parent déconseillé ; rattachement sous Inventory Visibility déconseillé. Ces alternatives ne sont pas déclarées impossibles par le marché.
- Statut : proposé par Codex, 17 septembre 2026 ; nom adopté U297, niveau/rattachement et justification de décomposition soumis à arbitrage U300. Aucun nœud nouveau créé.


## CMP104

- Objet : U301–U303, périmètre transversal d’Execution Tracking et granularité de la visibilité logistique. Catalogue U290 inchangé.
- Sources : ELM196, S42–S45 ; S35 pour Transportation Visibility. Relation : appui sémantique et recouvrement partiel des périmètres.
- Analyse : Dataverse/Camunda documentent des audits numériques complémentaires et configurables ; SAP/Oracle couvrent réception, opérations internes et expédition sur les sites. Avant/après transport n’est pas une partition stable des réseaux à plusieurs étapes.
- Proposition Codex : Warehouse Visibility et Transportation Visibility directement sous D07.d ; Logistics Visibility comme notion englobante sans nouveau niveau. Les deux noms/périmètres ne sont pas déclarés taxonomie universelle du marché.
- Statut : périmètre numérique/physique exprimé U301 et accord U302 ; décomposition réouverte U303 et nouvelle proposition non validée. Aucun déploiement Beaumanoir démontré.


Complément U304 à CMP104 : le cas de mise en rayon motive une spécialisation magasin. Store Execution est un usage de marché ; Store Execution Visibility est proposé pour FLOW avec un périmètre logistique limité. Bénéfice : distinguer stock reçu, stock en réserve et marchandise accessible au client. La proposition à deux comportements U303 est réexaminée au profit de trois spécialisations entrepôt/transport/magasin, non adoptées.


Complément U305 à CMP104 — 17 septembre 2026 : Laurent adopte les trois noms, périmètres et rattachement direct présentés après U304. Logistics Visibility reste englobant sans nouveau niveau. Accord métier consigné avec empreintes dans adoption_U305 ; aucune équivalence de produit ni couverture installée validée. Sources S35/S44–S47 déjà consultées dans cette discussion ; pas de nouvelle affirmation marché.


## CMP105

- Objet : visibilité explicite des prestations numériques sous Execution Tracking, U306 ; catalogue U290 inchangé, trois comportements logistiques adoptés dans l’annexe U305.
- Sources : ELM197, S48–S50. Relation : recouvrement partiel et appui sémantique. Microsoft décrit les runs/actions et la corrélation métier ; Camunda une observabilité de processus plus large.
- Proposition : Digital Service Visibility, quatrième comportement direct sous D07.d. Bénéfice : distinguer appel accepté, prestation effectivement achevée et résultat métier, notamment réponses asynchrones et contrôles défavorables. Aucun comportement par type de contrôle.
- Statut : besoin formulé par Laurent ; nom et description proposés par Codex le 17 septembre 2026. Pas de terme universel allégué, pas de moteur imposé ni d’extension à un domaine fraude/identité.


Complément U307/U308 à CMP104 — 18 septembre 2026 : Store Visibility remplace le libellé FLOW Store Execution Visibility, à périmètre et parent constants. Justification : uniformité avec Warehouse Visibility et contexte Execution Tracking déjà explicite. Les sources S46/S47 étayent le périmètre magasin ; aucun des deux noms composés n’est déclaré normalisé. Accord Laurent U308 enregistré séparément de l’accord historique U305, sans modifier ses empreintes. Aucune nouvelle couverture produit alléguée.


## CMP106

- Objet : implantation et réassort U310, termes TER079/TER080 et décomposition à instruire de Replenishment Decision D05.e. Catalogue des capacités inchangé.
- Sources : ELM198 / S51 SAP, S52 RELEX ; S08 Microsoft comme axe distinct des méthodes de calcul.
- Relation : recouvrement des politiques métier ; pas équivalence de hiérarchie, de formule ni de réalisation installée. SAP et RELEX distinguent introduction initiale et alimentation en cours de commercialisation.
- Interprétation : implantation/réassort constitue un axe de décomposition métier pertinent ; besoins nets et cibles peuvent alimenter les deux. Ne pas assimiler implantation à Requirement ni réassort à une formule Min/Max précise sans preuve.
- Convention : Allocation dans Initial Allocation est un terme retail éditeur qualifié, pas une remise en cause de Supply Assignment ni des enveloppes de protection. Noms anglais FLOW à instruire.
- Statut : vocabulaire métier exprimé par Laurent U310 ; interprétation et décomposition proposées par Codex, 18 septembre 2026. Capsules envisagées, pas observées.


Complément U311 à CMP106 — 18 septembre 2026 : les rapprochements SAP/RELEX sont désormais portés par D05.e et les termes TER079/TER080 dans market_comparisons. La règle et le format de restitution sont demandés par Laurent ; le contenu comparatif reste proposé pour discussion client. Sources S51/S52 conservées avec leurs limites ; aucune équivalence validée déduite.


## CMP107

- Objet : D05.e, TER079 Implantation, TER080 Réassort ; backlog du 18 septembre 2026. Sources ELM198/ELM199, U312–U314.
- Relation : appui sémantique et recouvrement partiel. SAP, RELEX et Oracle distinguent implantation initiale et réassort en cours de vie dans les passages consultés. Les solutions peuvent réunir les deux ; le nom d’un moteur ou d’une offre n’est pas une nomenclature de décisions.
- Correction C97 : retirer le rattachement proposé des deux sous Replenishment Decision. U313 exige deux décisions distinctes. Replenishment Decision est cohérent pour le réassort ; Initial Allocation est le terme retail à examiner pour l’implantation, sans assimilation à Supply Assignment ni aux enveloppes de protection.
- Différences : réassort Beaumanoir guidé par des seuils ; sources éditeurs couvrant aussi prévisions et autres méthodes. Le périmètre des scénarios produits dépasse une décision FLOW et peut intégrer planification/traitement. Pas de définition universelle interdisant qu’un moteur de replenishment serve un premier remplissage.
- Statut : séparation demandée par Laurent ; rapprochement et noms anglais proposés par Codex, le 18 septembre 2026. Remplace l’interprétation de décomposition sous un parent unique de CMP106, sans effacer l’historique. Aucune preuve de réalisation installée ni création de nouvelle capacité à ce stade.


## CMP108

- Objet : TER079 Implantation et nom de la décision distincte demandée U313 ; backlog du 18 septembre 2026, sans création de nœud.
- Sources : ELM200 (OASIS UBL 2.4, Logility, Nextail), avec édition, passages et limites sur les fiches marché de TER079.
- Relation : appui sémantique ; Initial Stocking est attesté pour la constitution du stock de départ, y compris saisonnier. Initial Distribution est attesté dans le retail mode chez Logility et dans la description de First Allocation de Nextail.
- Proposition Codex : U315 : proposer Initial Stocking Decision pour la décision d’implantation, avec Initial Stocking comme terme anglais de travail. Le nom met l’accent sur la constitution du stock de départ et évite Allocation. Initial Distribution reste une alternative attestée chez des éditeurs retail. Proposition non adoptée ; garder Implantation comme terme Beaumanoir, Replenishment Decision distincte, et les noms éditeurs dans les comparaisons.
- Justification modèle : exprimer le résultat stock initial, préserver une décision distincte du réassort et des opérations D04/D06. Les choix d’assortiment restent des entrées ; la répartition avec Coverage Target Decision reste à préciser.
- Compromis : Initial Allocation/First Allocation reste courant dans les produits retail étudiés ; Initial Stocking est un terme attesté, mais Initial Stocking Decision est notre composition selon la convention FLOW, pas un intitulé standard universel. Le mot Stocking peut aussi désigner une opération physique ; Decision et sa définition doivent expliciter le résultat attendu.
- Définition proposée : déterminer les quantités à apporter à chaque magasin et leurs dates pour constituer le stock initial nécessaire au lancement d’une saison, d’une collection ou d’une capsule, à partir de l’assortiment retenu, des objectifs et des contraintes applicables. Les capsules sont une extension cible, pas une pratique actuelle déduite.
- Statut : proposition Codex, non validée. Le besoin de deux décisions est acquis U313 ; U315 demande la recherche de nom, sans adopter son résultat.


Complément U316 à CMP108 — 18 septembre 2026 : Initial Stocking / Initial Stocking Decision et la définition présentée sont adoptés. D05.g créée dans le backlog, D05.e conservée pour le réassort continu. Les rapprochements documentaires avec OASIS, Logility, Nextail, SAP et RELEX restent proposés ; aucune équivalence normative ni réalisation installée validée. Les comparaisons de D05.e sont recentrées sur In-Season Fill-In / In-season replenishment ; celles de l’implantation sont portées par D05.g et TER079.


## CMP109

- Objet : D05.c Stock Redistribution Decision, candidats P06/P07 de l’audit ; backlog U316, comparaison du 18 septembre 2026. Sources ELM201 et S12 Oracle reconsultée.
- Recommandation : U317 : examiner sous Stock Redistribution Decision deux familles de mécanismes, rééquilibrage vers les besoins et consolidation intersites de stocks dispersés. Justifier le second par son bénéfice propre (assortiment de tailles, disponibilité concentrée, collecte pour réemploi), sans assimiler ces cas. Noms anglais, périmètres et décomposition restent proposés ; aucun nouveau comportement créé.
- Réexamen : P06 ne doit pas être entendu comme limité à la rupture constatée ; besoins prévus et intérêt économique comptent aussi. P07 Excess Consolidation est trop étroit pour décrire sans examen la consolidation des tailles documentée par Nextail. Ne pas déclarer les deux comportements adoptés ni imposer deux comportements si les cas ne révèlent pas de mécanisme distinct.
- Bénéfices proposés : le rééquilibrage améliore la couverture des lieux receveurs en préservant les donneurs ; la consolidation combat la fragmentation des stocks, éventuellement sans manque immédiat à destination.
- Exemples fictifs : déplacer 20 pièces d’un magasin peu demandeur vers un magasin plus demandeur ; rassembler des tailles dispersées pour proposer un assortiment plus complet ; collecter des reliquats en un lieu de réemploi. Ces cas ne sont pas des faits Beaumanoir.
- Limites : Inventory Rebalancing est un libellé produit large, pas forcément un comportement sous notre capacité. Stock Consolidation SAP EWM est interne à l’entrepôt. Ne pas importer un découpage produit ni renommer le parent adopté automatiquement.
- Frontières : D05 décide des transferts de stock existant, D04 gère les Transfer Orders, D06 pilote leur exécution ; D03 conserve la satisfaction des Orders. Pas de liquidation commerciale, destruction ni remise tarifaire ajoutée.
- Question proposée à Laurent : la consolidation des reliquats et des tailles dispersées est-elle un mécanisme attendu dans FLOW, au-delà de la correction d’un manque ? Statut proposé, pas validation.


Complément U318 à CMP109 — 18 septembre 2026 : deux mécanismes adoptés sous D05.c et intégrés comme BHV024/BHV025. Le rééquilibrage préserve les besoins des donneurs ; la consolidation couvre assortiments de tailles et regroupement de reliquats, au-delà des seuls excédents. Inventory Rebalancing et Stock Consolidation sont des libellés anglais éditoriaux appuyés sur les usages documentés ; le second est explicitement intersites, sans assimilation au Stock Consolidation interne SAP EWM. Comparaisons sur le parent et chaque comportement ; sources consultées U317 toujours applicables. Les équivalences marché restent proposées.


## CMP110

- Objet : D05.e Replenishment Decision et candidats P01–P03 après U316/U318 ; backlog du 18 septembre 2026.
- Sources : ELM202, Microsoft S08/S09 reconsultées. Documentation fonctionnelle, pas catalogue de capacités métier ni preuve installée.
- Proposition Codex : Proposition U323 : distinguer Requirement-based Replenishment (besoins datés, éventuellement regroupés) et Target-based Replenishment (seuil et restauration d’une cible). Les noms sont des formulations FLOW appuyées sur les méthodes Microsoft, pas une nomenclature universelle. Les besoins restent liés à un objectif de stock ; aucune satisfaction d’Order transférée depuis D03. Réduire, augmenter ou décaler les apports prévus reste à ce stade une faculté des deux politiques, sans comportement autonome Supply Adjustment justifié. Proposition à valider ; aucun BHV créé.
- Justification : deux politiques de déclenchement et de dimensionnement ont des conséquences métier différentes ; calcul net, calendrier et contraintes de lot restent dans leurs descriptions. Les politiques ne sont pas exclusives : les prévisions peuvent contribuer à la cible ou aux besoins datés.
- Définition proposée Requirement-based Replenishment : déterminer les apports nécessaires pour couvrir des besoins de stock datés, après prise en compte du stock admissible et des apports déjà attendus.
- Définition proposée Target-based Replenishment : déterminer les apports qui ramènent le stock projeté vers une cible lorsqu’un seuil ou une règle de réassort le demande.
- Exemples fictifs : besoin de 120 à J+7, 70 utilisables et 20 attendues à temps donnent 30 à apporter ; position projetée 45, seuil 50, cible 100 donnent 55 avant contraintes. Ces exemples n’adoptent pas de formule universelle.
- P03 : recommandation de conserver les ajustements comme faculté transverse des deux politiques, pas comme comportement autonome à ce stade. Réexaminer seulement si un mécanisme distinct lié aux engagements, à leur stabilité ou aux impacts est établi. N’efface ni le besoin ni la proposition historique ; aucune opération D04 transférée à D05.
- Statut : deux comportements proposés, aucun adopté. Besoins métier independent du regroupement ou de la dispersion des composants de réalisation ; pas d’architecture de solution déduite.


## CMP111

- Objet : articulation D05.a / D02.b / D05.e ; réexamen de P01/P02 et CMP110, 18 septembre 2026.
- Sources : ELM203 Microsoft et Oracle ; ELM202 reste pertinent pour la distinction native Requirement/Period/Min-Max.
- Analyse et correction : U324/C98 : distinguer détermination des objectifs et seuils (Coverage Target Decision), gouvernance et application de leurs versions opérationnelles (Supply Protection), puis décision des quantités et dates d’apport (Replenishment Decision). Les min/max peuvent dépendre des besoins et varier par période ; la politique Min/Max utilise aussi une position de stock projetée. Requirement/Period et Min/Max restent des méthodes différentes, pas une chaîne où la première calcule les paramètres de la seconde. La création de deux comportements recommandée U323 est suspendue faute de bénéfice supplémentaire établi ; conserver les modalités dans les descriptions. Aucun comportement créé ni retiré.
- Sens des politiques : les besoins datés peuvent conduire directement à des apports, tandis qu’une politique à seuil/cible condense des objectifs de service et de stock dans des paramètres, puis les confronte à la situation projetée. Les deux utilisent la demande ; la différence n’est pas intelligence contre garde-fou fixe. La politique à seuil/cible aide aussi à arbitrer fréquence des apports et immobilisation.
- Précautions : le seuil de déclenchement n’est pas nécessairement un stock intouchable ; la cible haute n’est pas une capacité physique ni une interdiction absolue de dépassement. Ne pas déduire deux fois la même demande dans la cible et dans le stock projeté.
- Proposition : conserver Replenishment Decision sans nouvelle décomposition à ce stade et expliciter ses modalités. Les frontières actuelles suffisent pour cette discussion. Rechercher un comportement seulement si un mécanisme, une politique, une variante ou un bénéfice différenciant pertinent pour FLOW est établi.
- Statut : correction de l’explication Codex et recommandation à discuter ; aucune validation utilisateur supplémentaire. Pas de renommage, nouvelle capacité ou nouvelle architecture de solution.


## CMP112

- Objet : D05.a Coverage Target Decision, nom proposé Inventory Target Decision ; backlog du 18 septembre 2026 ; U328.
- Auteur : Codex. Sources : ELM204 SAP IBP, Microsoft D365 SCM, Oracle Replenishment Planning ; correspondances détaillées sur fields.market_comparisons de D05.a.
- Relation : recouvrements fonctionnels partiels, sans équivalence validée des capacités ou noms.
- Correction de formulation : absence d'intitulé éditeur identique ne signifie pas absence de correspondance marché. Les résultats stock cible, minimum proposé et point de commande sont documentés. Un module peut regrouper plusieurs responsabilités FLOW ; une responsabilité peut mobiliser plusieurs fonctions ou opérateurs.
- Position : conserver les décisions fines à résultat métier identifiable et rechercher les preuves dans les méthodes, propositions et résultats des outils. Ni bouton, ni formule intermédiaire, ni opérateur technique ne devient automatiquement une capacité. Le résultat doit être utilisable par un autre arbitrage ou une action, avec périmètre et finalité propres.
- Bénéfice : rendre visibles les responsabilités susceptibles d'être assistées ou automatisées par règles, optimisation ou IA, sans en faire des capacités technologiques et sans attribuer ces mécanismes à un déploiement client.
- Limite : correspondances proposées ; nom de remplacement non appliqué, aucune formule ni nouvelle capacité adoptée.


Complément U329 à CMP112 — 18 septembre 2026 : Inventory Target Decision et la définition présentée sont adoptés et intégrés sur D05.a. Comparaison à la maille des responsabilités/résultats confirmée. Les correspondances SAP, Microsoft et Oracle restent des recouvrements partiels proposés ; aucun changement de sens natif ni preuve de déploiement supplémentaire.


## CMP113

- Auteur : Codex ; 18 septembre 2026 ; backlog après U329. Sources ELM205 SAP IBP / RELEX, candidates P12/P13 sous D05.a.
- Recouvrement partiel : mécanisme de coordination des cibles et des stocks de sécurité sur plusieurs échelons ; pas simple exécution en masse de calculs indépendants par site.
- Proposition : Multi-Echelon Inventory Optimization sous Inventory Target Decision. Déterminer conjointement les objectifs de stock de plusieurs échelons du réseau, en tenant compte de leurs dépendances, pour atteindre le service recherché au meilleur compromis de stock et de risque.
- Justification de décomposition : dépendances entre protection amont et aval ; éviter la duplication des marges de sécurité et décider où porter le stock. Le nom marché est conservé, son périmètre FLOW est limité aux cibles ; le domaine Inventory Optimization reste plus large.
- Exemple fictif : comparer une protection concentrée à l’entrepôt et une protection davantage portée par les magasins selon les délais et leur fiabilité. Ni centralisation systématique ni réduction garantie du stock.
- Frontières : le résultat est un ensemble cohérent de cibles ; pas l’affectation aux Orders, ni la décision/exécution des transferts. Stock Redistribution Decision conserve les transferts de stock existant et Replenishment Decision les apports continus.
- P12 : risque et niveau de service figurent déjà dans la définition adoptée U329. Recommandation de ne pas créer de comportement autonome pour ce seul critère. Le candidat historique reste conservé en attente d’arbitrage.
- Statut proposé. Question : FLOW doit-il déterminer conjointement les cibles entre échelons, au-delà de cibles locales ? Aucun nœud créé et aucune ambition Beaumanoir présumée.


## CMP114

- Auteur Codex ; 18 septembre 2026 ; D05.a et proposition P13 après U331. Sources ELM206 et ELM205.
- Principe multi-échelon confirmé par Laurent ; examen demandé des contextes magasin et entrepôt.
- Proposition : Store Inventory Optimization, Distribution Center Inventory Optimization et Multi-Echelon Inventory Optimization comme comportements frères de D05.a. Fiches et comparaisons dans modeles/backlog/inventory-target-behaviors-review.yaml.
- Justification : demande client et disponibilité locale, alimentation des besoins aval, puis arbitrage conjoint des cibles interdépendantes. Le nombre de magasins traités en masse ne suffit pas à constituer une optimisation multi-échelons.
- Les noms locaux sont des formulations FLOW sur des notions de marché documentées, pas des noms de capacités prétendument standards. MEIO est une appellation explicite RELEX ; SAP emploie Single-Stage/Multi-Stage.
- Limite : l’opérateur Single-Stage SAP utilise des résultats du Global Multi-Stage ; ne pas présenter la proposition comme sa séquence technique. La maturité de déploiement est distincte de la hiérarchie du modèle.
- Aucun comportement dark store ou autre lieu ajouté par défaut. Aucune capacité de slotting, picking, transport ou affectation absorbée. Les formulations et les trois rattachements détaillés restent proposés.


Complément U332 à CMP114 — 18 septembre 2026 : noms et périmètres présentés des trois comportements adoptés, intégrés BHV026–BHV028 directement sous D05.a. Les formulations locales détaillées et correspondances restent éditoriales ; la définition multi-échelon présentée est conservée. P13 devient BHV028. Registre : audits/2026-09-18-inventory-target-behaviors/implementation.yaml.


## CMP115

- Auteur Codex ; 18 septembre 2026 ; D01.d Stocktaking, P08/P09 ; références ELM207.
- Recommandation à discuter : Periodic Physical Inventory, Cycle Counting et Spot Counting comme politiques/variantes de fiabilisation. Le premier complète les deux pistes initiales de l’audit. Fiches et comparaisons dans modeles/backlog/stocktaking-behaviors-review.yaml.
- Bénéfices : référence complète sur un périmètre, entretien récurrent de la fiabilité, réaction ciblée à une situation. Ne pas réduire le découpage à des boutons ou modalités écran/RFID/mobile.
- Limite : les procédures produit se recouvrent ; Microsoft distingue plans/seuils de création et spot sans travail préexistant. Un signal de quantité basse ne prouve pas une anomalie et n’est pas un seuil de réassort. Le cas de picking impossible est une illustration FLOW, pas un fait de déploiement.
- Frontière à discuter : politique et demande de vérification au niveau du modèle métier, réalisation physique par les exécutants ; pas d’architecture logicielle déduite. Record Inventory Movements conserve les ajustements traçables et Inventory Tracking les états.
- Statut proposé. Aucun comportement créé, aucun transfert de responsabilité adopté. Autres procédures de marché non promues automatiquement.


Complément U334 à CMP115 — 18 septembre 2026 : Periodic Physical Inventory (BHV029), Cycle Counting (BHV030) et Spot Counting (BHV031) adoptés et intégrés sous Stocktaking. La politique de vérification et les demandes de contrôle sont dans son mandat ; écarts/corrections justifiées restent communs et réalisation physique chez les exécutants. P08/P09 intégrés au périmètre réexaminé ; comparaisons marché proposées. Registre : audits/2026-09-18-stocktaking-behaviors/implementation.yaml.


## CMP116

- Auteur Codex ; 18 septembre 2026 ; D02.e Supply Assignment et D02.c Reservation, arbitrage A01 ; ELM208 SAP/Microsoft.
- Proposition : conserver deux responsabilités, lien ressources-commandes et protection de la quantité engagée contre usages concurrents. Une opération peut matérialiser les deux. L’affectation opérationnelle SAP fournit explicitement les deux effets ; ne pas affirmer qu’une affectation est toujours non contraignante.
- Microsoft Inventory Visibility illustre une réservation logique dont la quantité disponible est diminuée sans changer le stock physique ; soft ne signifie pas temporaire ou non opposable. Les règles et consommateurs doivent respecter cette disponibilité.
- Bénéfice FLOW : expliciter engagements, granularité et non-double-décompte sans imposer une architecture logicielle ni une séquence universelle. Les décisions spécialisées conservent leurs arbitrages ; la gestion des liens ne devient pas un optimiseur supplémentaire.
- Contrat, exemple et comparaisons destinées aux fiches : modeles/backlog/assignment-reservation-review.yaml. Rapprochements proposés, aucune nouvelle validation métier ni comportement créé.


## CMP117

- Auteur Codex ; 18 septembre 2026 ; U336, A01, D02.c Reservation ; sources ELM209 et ELM208.
- Appui méthodologique : la réservation maintient l’engagement entre étapes d’une opération métier longue ; distinguer l’effet sur les usages concurrents de la coordination du processus et de ses compensations.
- Microsoft documente des compensations métier, dont annulation de réservations ; AWS les décrit dans une réalisation saga. Ces architectures ne sont pas adoptées comme découpage métier ou logiciel de FLOW.
- Définition et exemple proposés dans modeles/backlog/assignment-reservation-review.yaml, long_transaction_U336. Pas d’expiration automatique imposée, pas de soft assimilé à temporaire, pas de libération systématique lors de la confirmation. Une réalisation physique peut nécessiter d’autres actions que l’annulation d’un engagement.
- Statut proposé ; aucun nom, définition ou nouveau comportement modifié dans le catalogue.


## CMP118

- Auteur Codex ; 18 septembre 2026 ; U337 ; D02.c Reservation ; ELM210 Shopify et Microsoft.
- Appui fonctionnel à la réservation comme engagement au bénéfice du client/besoin et exclusion des usages concurrents. Le lock de traitement protège un acteur/opération, sans suffire à exprimer cet engagement commercial. Le bénéficiaire peut être différent de l’utilisateur et l’engagement survivre à la session.
- Shopify fournit le cas de réservation d’un draft order empêchant d’autres achats ; Microsoft interdit le retrait pour d’autres commandes et inclut aussi production/ressources futures. Ne pas réduire automatiquement le modèle générique au seul client acheteur.
- Interprétation et définition proposées dans assignment-reservation-review.yaml, commercial_commitment_U337. Pas de transfert de propriété immédiat déduit, ni d’interdiction générale des opérations autorisées servant le bénéficiaire. Préserver les frontières affectation/réservation/promesse.
- Statut proposé ; aucun nouveau comportement, nom ou définition appliqué au catalogue.


## CMP119

- Auteur Codex ; 18 septembre 2026 ; U338–U340 ; D02.c Reservation dans le backlog courant ; ELM211.
- Recouvrement partiel : Microsoft illustre la préservation de disponibilité contre les engagements concurrents ; les produits commerce montrent plusieurs jalons de réservation, au panier, à la soumission des informations de paiement ou à la commande. Commande ne signifie pas encaissement.
- Proposition : expliciter Reservation comme sécurisation des ressources au service de la promesse, selon des conditions métier ; les moyens transaction/verrou restent informatiques (clarification utilisateur U339). Aucun délai, jalon universel ou nouveau comportement adopté.
- Limite : préservation de disponibilité ne prouve pas la réussite physique de toute la promesse ; ces fonctions produit ne sont pas des capacités équivalentes terme à terme ni des preuves de déploiement.
- Définition détaillée et correspondances proposées dans assignment-reservation-review.yaml, promise_security_U340. Catalogue actif inchangé.


## CMP120

- Codex ; 18 septembre 2026 ; U341 ; ELM212 ; backlog courant D02.c Reservation et frontière D05/D03.
- Microsoft et commercetools : recouvrement partiel avec politiques de réservation configurées et leviers de variation ; absence de preuve d’un moteur standard choisissant le jalon commercial selon stock et vitesse des sorties.
- IBM stock de sécurité et SAP BOP : appuis sur des adaptations voisines, sans équivalence avec une décision de politique de réservation. Ne pas déplacer ces responsabilités vers Reservation.
- Proposition FLOW : rendre explicite la responsabilité Reservation Policy Decision, nom et rattachement à arbitrer. Politique conditionnelle définie à l’avance, sélection contextuelle et révision de politique sont distinctes ; pas besoin d’IA pour une décision adaptative.
- Bénéfice : arbitrage explicite entre sécurisation du parcours et indisponibilité pour les autres demandes ; pénurie ne signifie pas automatiquement réservation plus précoce. Distinguer vitesse des engagements et sorties physiques. Préserver les conditions des engagements existants.
- Statut proposé ; détaillé dans assignment-reservation-review.yaml, policy_decision_U341. Aucun changement du catalogue actif ni nouveaux comportements.


## CMP121

- Codex ; 18 septembre 2026 ; U342 ; ELM211–ELM213 ; D05.h Reservation Policy Decision, backlog courant.
- Nom et définition de la capacité adoptés ; D05 et BHV032–BHV035 proposés. Quatre mécanismes : jalon métier, fenêtre avant besoin, régime de service différencié, adaptation au risque. La décomposition vise des garanties et des pratiques distinctes ; mécanismes combinables.
- Appuis directs sur les jalons commerce et l’horizon Oracle EBS ; appui partiel Microsoft/IBM aux régimes différenciés. Comportement adaptatif FLOW : moyens configurables et adaptations voisines documentés, moteur standard de choix du jalon selon risque non démontré.
- Les paramètres de durée, les opérations de gestion, les interfaces et l’emploi d’IA ne sont pas des comportements. Modes Fair Share/Percentage, priorités, lots, réservations réseau ou partielles : périmètres examinés et frontières explicités, sans recopier les regroupements produits.
- Registre structuré : modeles/backlog/reservation-policy-review.yaml. Synthèse dérivée : audits/2026-09-18-reservation-policy/README.md. Absence de preuve d’implémentation Beaumanoir ; aucune exhaustivité absolue revendiquée.


Complément U343 à CMP121 — 18 septembre 2026 : Laurent adopte les quatre comportements de Reservation Policy Decision (noms et responsabilités résumées présentées) et le rattachement à D05. Les équivalences marché ne sont pas validées par cet accord ; les limites sur le moteur adaptatif restent explicites. Aucune nouvelle proposition marché ni changement de périmètre motivant une nouvelle recherche.


## CMP122

- Codex ; 18 septembre 2026 ; U344 ; ELM214 ; A03, D04.n/D04.o/D02.e, backlog courant.
- Recouvrement partiel : Microsoft sépare recommandations et mise en action, tout en combinant parfois affermissement et regroupement ; Oracle illustre les ajustements du processus après changement. Aucun produit ne tranche à lui seul la taxonomie FLOW.
- Proposition : préserver application des plans par D04 et liens ressources-commandes par Supply Assignment ; documenter un contrat transversal selon les effets. Ne pas ajouter un comportement unique sous Lifecycle, trop étroit, ni un parent générique non justifié. Case Management garde le mécanisme de compensation discuté U293.
- Portée : discussion, pas adoption ni modification du catalogue. Registre order-plan-application-review.yaml ; les contrats détaillés restent proposés.


## CMP123

- Codex ; 18 septembre 2026 ; U345/C99 ; ELM215 ; D02.e et BHV006, backlog courant.
- SAP combine disponibilités, priorités, affectation et contrôles de libération ; la réalisation intégrée n’impose pas de fusion FLOW et ne prouve pas la mobilisation de toutes les capacités. Le traitement existe aussi hors batch.
- Application de plan sous Supply Assignment établie U345. Propositions : Supply Assignment Plan Application, Incremental Supply Assignment et Assignment Rebalancing ; mécanismes combinables, pas CRUD. SAP Reassignment justifie la différence entre préserver et réexaminer les affectations ; l’import et l’application inchangée d’un plan externe ne sont pas attestés par ces sources.
- Microsoft Action messages éclaire les recommandations dans Simulation & Analysis : propositions explicables, distinctes de décision et application. Compensation Oracle écartée de cette décomposition métier ; l’étude U344 conserve sa valeur historique, pas son autorité courante.
- Formulations et deux mécanismes complémentaires proposés ; aucune nouvelle capacité ou comportement créé, aucune preuve d’installation Beaumanoir.


## CMP124

- Codex ; 18 septembre 2026 ; U346/U347 ; ELM216 ; backlog D02.e, Promise Management et Order Lifecycle Management.
- API, immédiateté, calcul incrémental et préservation métier sont quatre dimensions distinctes. ACL SAP appuie le ciblage des recalculs ; Drools éclaire la réalisation technique, sans équivalence métier.
- Microsoft Firm planned orders transforme un ordre planifié en commande effective. Keep supply for confirmed demand est plus proche de la préservation demandée, avec des limites de configuration du stock reçu ; Freeze suit une fenêtre temporelle. SAP Fixed Date and Quantity protège la confirmation par défaut, avec inclusion explicite possible en BOP. Aucun verrou absolu déduit.
- Proposition : distinguer état de commande, stabilité date/quantité promise et stabilité de l’affectation. Préserver un engagement ne contraint pas nécessairement à garder la même source. Bénéfice : stabilité opérationnelle ; compromis : moins de latitude d’optimisation.
- Statut : discussion, aucun nouveau comportement adopté ou créé. Détails et comparaisons structurées : supply-assignment-mechanisms-review.yaml, clarifications_U346_U347.


## CMP125

- Codex ; 18 septembre 2026 ; U348/U349 ; ELM216 ; D04.o, BHV036, BHV037. Sources Microsoft Firm planned orders, Keep supply for confirmed demand, Master plans — Freeze, et SAP Fixed Date and Quantity consultées de nouveau.
- Affermissement : transition planifié vers ferme. Protection : stabilité d’éléments désignés contre réoptimisation ; recouvre partiellement les protections SAP et Microsoft, sans les unifier artificiellement. Microsoft freeze time fence vise une fenêtre et empêche aussi la création d’ordres planifiés ; ce n’est pas une équivalence exacte avec un gel sélectif d’Order.
- U349 adopte Order Firming et sa définition présentée puis demande le mécanisme de protection. Order Freezing est le libellé éditorial ; périmètres, exceptions, exemples et contrats proposés. Bénéfice : stabilité des engagements et préparation ; compromis : liberté d’optimisation réduite.
- Protéger la date/quantité promise ne fige pas nécessairement la source. D04 gouverne les restrictions, D03 et Supply Assignment les respectent dans leurs responsabilités. Aucun lock technique ni réservation implicite. Pas de preuve de déploiement Beaumanoir.
- Comparaisons structurées sur la capacité et les comportements ; annexe order-lifecycle-behaviors.yaml. P11 non adopté par extension.


Complément U350 à CMP125 : nom Order Freezing adopté. Les sources déjà consultées demeurent pertinentes, périmètre inchangé ; aucun consensus lexical ni équivalence supplémentaire déduit.


## CMP126

- Codex ; 18 septembre 2026 ; U351 ; ELM217 ; D04.o. Firming et Freezing ne couvrent pas tout le cycle de vie. Le périmètre de D04.o décrivait déjà release, hold/reprise, report, annulation et clôture ; leur formalisation en comportements restait incomplète.
- Cinq mécanismes supplémentaires proposés : Order Release, Order Hold & Resume, Order Rescheduling, Order Cancellation, Order Closure. Le bénéfice et les frontières de chacun sont dans order-lifecycle-behaviors.yaml, coverage_review_U351. Aucun nouveau nœud actif adopté.
- Microsoft justifie la distinction autorisation de traitement / blocage / changement d’échéance / annulation du reliquat / fin de traitement ; SAP et Oracle apportent restrictions selon l’avancement et portées de blocage. Chaque produit combine des responsabilités que FLOW sépare.
- Rescheduling porte l’application au besoin de l’Order, pas la décision de promesse ni l’adaptation des prestations. Cancellation retire le besoin restant ; Closure constate et gouverne la terminaison. Hold limite progression, Freezing limite modification. Aucun cycle universel aux cinq types d’Orders.
- Le fait qu’un mécanisme soit exposé comme action produit ne le disqualifie pas : la granularité dépend de l’effet métier et de la complexité, sans décomposition systématique des boutons. P11 reste à instruire.


## CMP127

- Codex ; 18 septembre 2026 ; U352 ; ELM218 ; D04.i–o. Le CRUD doit être couvert explicitement ; C/R/U figurent déjà dans la gestion par type, suppression admissible et archivage à préciser.
- Oracle Fusion distingue suppression d’un brouillon et annulation d’une commande en traitement. Microsoft SCM documente archivage et consultation historique ; Oracle EBS distingue archivage et purge ; Business Central emploie aussi archive pour des versions successives. Aucun alignement automatique des états ou des durées.
- Proposition : documenter C/R/U/D dans les capacités par type, avec contraintes Lifecycle, et ajouter comme candidat Order Archiving sous D04.o. Pas quatre comportements CRUD systématiques, pas de capacité Order Record Management concurrente. Clôture opérationnelle, sortie vers l’historique, restauration de version et réouverture métier restent distinctes.
- Bénéfice : compléter le périmètre sans doublons et préserver l’explication des engagements passés. Noms, rattachements et règles proposés ; aucun nouveau nœud actif ni publication. Registre order-lifecycle-behaviors.yaml, crud_and_archiving_U352.


## CMP128

- Codex ; 18 septembre 2026 ; U353/U354 ; ELM219 ; D04.i–o. Principe du mode brouillon adopté ; rattachement et formulation détaillée proposés dans order-lifecycle-behaviors.yaml.
- Oracle Draft distingue préparation enregistrée et soumission au fulfillment ; ne pas l’assimiler systématiquement à un ordre planifié ou à l’affermissement. Les éventuels effets de réservation suivent leur politique explicite.
- Microsoft Delivery schedules appuie split/spread sous Order Structuring sans exiger plusieurs commandes. Microsoft et Oracle Copy réutilisent un contenu pour une nouvelle commande ou de nouvelles lignes ; proposition de garder la copie simple dans la gestion par type.
- Bénéfice : distinguer préparer, transformer et engager. Split conserve la demande transformée ; clone peut créer une demande supplémentaire. Aucune copie automatique de promesse, de réservation ou de statut ferme. Aucune nouvelle hiérarchie adoptée ni nœud créé.


## CMP129

- Codex ; 18 septembre 2026 ; U355 ; ELM220 ; D04.n/D04.o. Réexamen de la frontière de CMP128, sans changer les capacités adoptées.
- Microsoft illustre une ligne commerciale avec lignes de livraison ; Oracle un split de fulfillment avec quantité conservée. Aucun ne prouve la nécessité d’une capacité autonome Structuring. SAP Order Hierarchy illustre une responsabilité de composition, dans le contexte maintenance/service uniquement.
- Proposition : mutation avec filiation intégrable dans Lifecycle élargi ; capacité Structuring séparée si une composition métier persistante doit être maintenue et gouvernée. L’Order chapeau n’est ni nécessaire comme implémentation ni suffisant comme simple forme de données ; examiner engagement actif, résultats d’ensemble et invariants.
- Catalogue actuel : D04.n est une capacité transactionnelle sœur de D04.o sous D04 ; elle ne définit pas de chapeau. Les frontières restent à arbitrer. Aucun objet, fusion, retrait ou changement de parent appliqué.


## CMP130

- Codex ; 18 septembre 2026 ; U357 ; ELM221 ; cible D04 discutée. Microsoft et SAP parlent de types/catégories pour les variantes de commandes. Cela appuie le découpage par variantes mais ne prouve ni une capacité Role ni quatre capacités de catalogue identiques chez les éditeurs.
- Proposition : Order Handling regroupant les cinq gestions par finalité en comportements, Lifecycle pour mutations internes, Structuring pour composition durable, Archiving pour conservation historique. Les deux dernières séparations suivent la direction utilisateur ; noms et détails de la cible restent proposés.
- Rôle seul est ambigu avec Party/Role ; Order Type Management évoquerait la configuration des types. Order Handling est une proposition de nom justifiée par la responsabilité FLOW, pas un consensus revendiqué.
- Regrouper l’aptitude ne crée pas un Order universel ou un cycle commun obligatoire. Microsoft intercompany conserve des Orders achat/vente liés. Le retour client et le retour fournisseur gardent leurs effets distincts.
- Maintenir les identifiants et preuves si la migration est confirmée ; le catalogue actif reste inchangé. La proposition d’Archiving sous Lifecycle est marquée remplacée par la direction U357 dans l’annexe.


## CMP131

- Codex ; 18 septembre 2026 ; U358–U360 ; ELM222. Type remplace Handling comme préférence lexicale pour la finalité de l’Order ; pas de référentiel des types ni de mutation universelle de type déduits.
- Split est documenté par Oracle sur sites, dates et substituts. Microsoft et SAP représentent l’étalement en delivery schedules/schedule lines. SAP ERP ARun emploie également spread logic pour la répartition proportionnelle de stock entre besoins : sens différent, à préserver.
- Recommandation : Split qualifié par objet/effet ; pas de comportement générique Spread sans axe et ressource précisés. Le choix des quantités reste une décision spécialisée ; mutation, composition persistante et affectation sont trois effets distincts. Aucun catalogue de comportements éditeur transposé automatiquement.
- Comparaisons et exemple conservés dans order-lifecycle-behaviors.yaml, split_spread_U360. Aucune modification du catalogue actif ni adoption nouvelle de noms/définitions.


## CMP132

- Codex ; 18 septembre 2026 ; U361 ; ELM222/ELM223. Spread est bien une logique SAP ARun, sans être synonyme du processus ARun. FIFO est une autre logique. Groupes, quotas et contrôles de libération encadrent le résultat.
- La répartition proportionnelle détermine des parts ; l’affectation établit les liens ressources-commandes. Conserver décision et application dans leurs responsabilités FLOW, sans créer un comportement Structuring par ressemblance lexicale. Le split éventuel est une conséquence séparée. Parent exact de décision à instruire.
- Exemple simplifié 100/200 avec stock 150 donne 50/100 au prorata ; ce n’est pas une garantie du résultat de tout paramétrage SAP. Référence ERP Fashion, pas preuve pour toute édition ou installation Beaumanoir.


Complément U362 à CMP132 : Laurent fixe « Split : coupe des commandes » et « Spread : on répartit entre les commandes ». Distinction adoptée dans le contexte ARun ; SAP confirme la répartition de ressources entre besoins. Le parent précis de la décision et les futurs comportements ne sont pas adoptés par extension. Les formulations historiques de Structuring restent à mettre en cohérence lors de la migration.


## CMP133

- Codex ; 18 septembre 2026 ; U363 ; synthèse des comparaisons CMP125–CMP132 appliquée au backlog. La taxonomie FLOW à quatre capacités n’est pas présentée comme un catalogue éditeur commun.
- Order Type porte les variantes métier ; les identifiants des cinq anciennes capacités sont reclassés en comportements. Lifecycle porte mutations et split, Structuring composition persistante, Archiving conservation historique. Microsoft et SAP documentent les types ; Microsoft/Oracle les transitions, copies et splits. Archivage Microsoft relu : commandes facturées et exclusion des chaînes intersociétés sont des restrictions produit, pas des règles FLOW.
- Spread ARun : décision des parts et affectation distinctes des mutations. Exemple proportionnel simplifié ; aucun nouvel algorithme ni parent de décision introduit. Split/Spread ajoutés au glossaire métier avec limites de preuve.
- Accord U363 appliqué aux principes et rattachements ; descriptions développées, nouveaux libellés Drafting/Splitting et contrats proposés. Marché exposé dans les fiches, pas preuve de réalisation Beaumanoir.


## CMP134

- Codex ; 18 septembre 2026 ; U345/U364 ; ELM215/ELM216 ; backlog D02.e et BHV045–BHV047.
- SAP S/4HANA aATP 2025 FPS01, Backorder Processing, section Reassignment : passage primaire indexé relu pendant la discussion. Sans Reassignment, conserver les affectations et traiter le reliquat ; avec Reassignment, remettre en jeu les affectations du périmètre sélectionné. Source : https://help.sap.com/docs/PRODUCT_ID/f132c385e0234fe68ae9ff35b2da178c/6b8eb017a1d1431abde00056a249f72b.html
- Microsoft Dynamics 365 SCM, Keep supply for confirmed demand, sections What data is preserved et Control how on-hand inventory is pegged, page primaire relue pendant la discussion : conservation d’une chaîne et du pegging entre planifications, avec conditions particulières pour le stock reçu. Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/keep-supply-for-confirmed-demand
- Recouvrement partiel : SAP associe décisions et application ; FLOW les sépare. Reassignment est un terme SAP établi ; Incremental Supply Assignment reste un libellé descriptif FLOW, sans consensus de nommage démontré. Microsoft protège une chaîne plus large, sans équivalence exacte avec le complément d’affectation FLOW. Pas de preuve d’import d’un plan externe arbitraire chez SAP, ni de réalisation Beaumanoir.
- U364 adopte la distinction stabilité/adaptation et sa représentation. Compléter sans remettre en jeu l’existant n’est ni un gel permanent, ni RETE, ni une promesse de recalcul partiel. Correspondances et noms restent proposés dans leur portée ; descriptions et limites exposées dans les fiches.


## CMP135

- Codex ; 18 septembre 2026 ; U365 ; ELM224 ; D03.i/j/k/m et D02.e ; proposition dans modeles/backlog/fulfillment-strategy-review.yaml.
- Le besoin exprimé est le cadre d’application de l’ATP : la proposition précédente de calcul autonome du plan est réexaminée au profit de Fulfillment Strategy Decision. Résultat proposé : stratégie applicable, distincte du plan et de son application.
- SAP Supply Assignment Rule éclaire les contrôles d’ARun ; Microsoft Fulfillment strategies éclaire objectifs, contraintes, sources et sélection contextuelle. Recouvrements partiels, pas équivalence de niveaux ni preuve d’une décision autonome éditeur.
- Fulfillment porte la finalité de satisfaction ; Assignment décrit les liens ressources-commandes. Fulfillment Optimization dépasse le cadrage et ne remplace pas le nom de la capacité d’action. Le suffixe Decision et la frontière exacte sont proposés pour FLOW.
- ATP/aATP documente possibilités de confirmation, quantités et dates sous restrictions. La maximisation multidimensionnelle est une ambition FLOW à préciser, pas une définition universelle démontrée ; PTP et CTP conservent leurs responsabilités.
- Aucun changement de catalogue ou de glossaire adopté ; comparaisons, différences, sources et portée disponibles dans l’annexe pour la discussion client.


## CMP136

- Codex ; 18 septembre 2026 ; U366/U367 ; ELM225 ; audit du backlog et du glossaire, sans renommage du catalogue.
- Supply, Supply Chain et Fulfillment sont distingués dans TER083–085 ; TER035 conserve la convention locale et sa définition antérieure. Appuis marché et limites dans les fiches.
- D03 vers Fulfillment Optimization est un candidat de nommage orienté finalité, à valider avec ses frontières. D02.e applique déjà les affectations sous D03 : ne pas déplacer sa responsabilité par confusion entre optimisation et application. Supply Protection et Future Supply Projection restent orientés ressources. Supply Order est un faux ami potentiel par rapport aux ordres d’apport Microsoft.
- Inventaire et décisions proposées : modeles/backlog/supply-fulfillment-audit.yaml ; restitution audits/2026-09-18-supply-fulfillment/rapport.md. Correspondances qualifiées par élément, sans consensus universel inventé.
- Aucune nouvelle définition n’étend automatiquement FLOW à toute la Supply Chain, ni Fulfillment à tous les types d’Orders et services. Comparaisons proposées ; demande d’audit et de glossaire ne vaut pas accord sur les renommages.


## CMP137

- Codex ; 18 septembre 2026 ; U368 ; ELM226 ; D13, D13.a, TER054 ; proposition de révision de SF-A06.
- Supply Network recommandé pour la topologie de référence partagée, Supply Network Ingestion pour sa réception. L’usage SAP fournit un appui lexical et fonctionnel ; Microsoft distingue réseau d’ensemble et sources de satisfaction sans exclure les fournisseurs de ces dernières.
- La recommandation précédente de conserver Fulfillment Network reposait trop sur le libellé déjà adopté et sa compatibilité avec la finalité, sans comparer assez directement le périmètre structurel. Elle est révisée ; capture conservée dans l’audit. Pas de nouveau réseau séparé par finalité, pas d’assimilation des lieux aux Party.
- Formulation étendue des flux et choix des attributs proposés ; Q076 reste ouverte. Les références de stock, capacité effective, parcours retenu et catalogue de services ne sont pas absorbées. Aucun renommage de catalogue appliqué sans adoption.


## CMP138

- Codex ; 18 septembre 2026 ; U369 ; ELM227 ; universe-supply ; renommage Supply Chain Management proposé, pas adopté par la question.
- Appui CSCMP sur le pilotage d’un système amont-aval et la coordination ; Microsoft atteste un usage englobant pour un produit. Ce dernier n’est pas notre catalogue normatif.
- Le niveau univers peut porter SCM tout en exposant le périmètre cartographié FLOW, plus limité. Aucun ajout automatique de production, sourcing stratégique, finance ou autres domaines exclus ; pas de reprise des opérations internes des exécutants.
- Supply Network désigne la structure, Fulfillment Optimization une finalité de domaine, SCM leur pilotage d’ensemble. Les noms D13 et D03 sont adoptés dans U369, sans validation globale des nouvelles descriptions. Application de ces noms au catalogue à réaliser.


## CMP139

- Codex ; 18 septembre 2026 ; U375/U376 ; ELM228 ; proposition Fulfillment Strategy Decision dans D03, non créée, après choix du nom de domaine Fulfillment Optimization U369.
- Le marché distingue des configurations et leur détermination contextuelle, puis les calculs qui les utilisent. Appui fonctionnel à la proposition ; aucune capacité native au même nom ni équivalence de périmètre démontrée.
- Recommandation : préciser la réponse métier comme cadre applicable, sans absorber priorités, protections, réservation, arbitrage économique ou calcul des affectations. La présence de règles déterministes ne disqualifie pas une décision ; leur administration ne la justifie pas à elle seule.
- Proposition affinée, sources et limites conservées dans modeles/backlog/fulfillment-strategy-review.yaml, market_review_U376 ; proposition U365 gardée pour provenance. Statut proposé, aucun accord ni ajout de catalogue.


### Réexamen CMP139 — U377

La responsabilité demandée produit un scénario de plan d’affectation global ; elle ne se limite pas à sélectionner un cadre. Le rapprochement pertinent est le service Microsoft Intelligent Fulfillment Optimization et son résultat fulfillment plan. La sélection de stratégie U376 reste un mécanisme d’entrée, pas le résultat recherché. Nom Fulfillment Plan Decision proposé selon la convention FLOW, sans intitulé natif équivalent revendiqué. Aucune capacité créée. Source principale ELM228 relue ; complément : https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/fulfillment-returns-optimization, introduction consultée le 18 septembre 2026. Analyse détaillée : global_plan_review_U377 dans l’annexe.


### Intégration CMP139 — U378

Nom, définition et nature de Fulfillment Plan Decision adoptés et intégrés sous D03.o ; D03 renommé Fulfillment Optimization selon l’accord U369. Les correspondances Microsoft et leurs limites sont présentes dans la fiche, avec statut proposé distinct de l’accord sur la capacité. Relations détaillées éditoriales ; aucun niveau supplémentaire ni comportement créé. A02 résolue sur la responsabilité de décision collective. Preuve : audits/2026-09-18-fulfillment-plan-U378/implementation.yaml.


## CMP140

Codex ; 18 septembre 2026 ; U379 ; ELM229 ; A04 et D04.l/D04.m/D05.c/D06.f dans le backlog après U378.

La gestion des Orders de retour est explicite ; la décision de devenir reste ouverte. Proposition Return Disposition Decision sous D05, fondée sur le résultat logistique et la récupération de valeur, distincte des suites commerciales et financières. Microsoft fournit le terme Disposition ; SAP documente des orientations après inspection. Les produits combinent choix, traitement et effets ; FLOW les distingue. Aucun code de disposition ne devient automatiquement comportement. Statut proposé ; aucune capacité créée. Détail : modeles/backlog/return-disposition-review.yaml.


### Intégration CMP140 — U380

Return Disposition Decision intégrée sous D05.i : nom, définition, nature et parent D05 adoptés. Aucun comportement ; contrats et comparaisons proposés. Preuve : audits/2026-09-18-return-disposition-U380/implementation.yaml. Les contrôles passent, dont préservation de 125 fichiers figés.

## CMP141

Codex ; 18 septembre 2026 ; U381/U382 ; ELM229/ELM230 ; D05.i et D04.l après U380. Recouvrement partiel et appui sémantique, statut proposé.

Laurent distingue prises en charge par la gestion des retours et stratégies de décision. Proposition de deux mécanismes combinables : Policy-based Disposition et Value Recovery Optimization. La standardisation des cas connus et l’arbitrage contextuel justifient une décomposition à discuter. Les noms sont des formulations FLOW, pas un catalogue éditeur commun. Les sources produit combinent souvent choix et réalisation, ainsi que des effets commerciaux hors D05.i. Aucun comportement par code, objectif, canal ou opération automatique.

D04.l est déjà un comportement d’Order Type : la gestion des Orders n’est pas la gestion complète du devenir des produits. Le porteur des prises en charge reste à instruire sans quatrième niveau, transfert implicite de D01/D06 ni création automatique. Aucun changement au catalogue dans cette discussion ; pas de validation attribuée aux deux candidats éditoriaux. Analyse : behavior_review_U382 dans modeles/backlog/return-disposition-review.yaml.


## CMP142

Codex ; 18 septembre 2026 ; U383 ; ELM229–ELM231 ; backlog D04.i–m et D05.i/BHV048–049. Statut : correspondances proposées ; structure et stratégies adoptées séparément.

Une capacité par type d’Order est justifiée par la maille terminale FLOW : chaque responsabilité peut décrire ses mécanismes sans sous-comportement. Microsoft documente des processus propres aux achats et aux retours, mais traite le retour fournisseur comme type d’achat ; les cinq capacités FLOW ne sont donc pas un découpage universel des produits. Les correspondances héritées des cinq variantes sont marquées à réexaminer après changement de maille. Order Type D04.p est retiré, identifiant non réutilisable ; Lifecycle, Structuring et Archiving restent transverses.

Policy-based Disposition et Value Recovery Optimization sont intégrés sous D05.i. Blue Yonder documente règles, orientation contextuelle et récupération de valeur ; Microsoft fournit le vocabulaire de disposition. Nos noms et la séparation décision/application ne sont pas un catalogue natif partagé. Les limites commerciales et financières des offres, ainsi que l’absence de preuve algorithmique ou de réalisation Beaumanoir, restent explicites dans les fiches. Direction remise en stock/réparation/renvoi conservée pour l’instruction des comportements d’action, sans les importer comme codes produit ni modifier implicitement D01/D06.


## CMP143

Codex ; 18 septembre 2026 ; U384 ; ELM232. Noms courts des cinq capacités D04.i–m appliqués sur demande ; aucune nouvelle équivalence avec les objets documentaires du même nom. Microsoft emploie Sales returns pour le processus et Purchase order pour le document ; la convention FLOW conserve le type capacité et une définition verbale explicite.

Cinq comportements Customer Return proposés dans modeles/backlog/customer-return-behaviors.yaml : Return to Stock, Repair and Refurbishment, Return to Supplier, Return to Customer et Scrapping. Rapprochement partiel aux suites logistiques SAP et dispositions Microsoft. Les contreparties et preuves justifient la distinction des renvois ; Supplier Return reste la capacité qui porte la commande fournisseur. FLOW sépare les décisions D05.i, les suites D04, les prestations D06 et les stocks D01, là où les fonctions produit peuvent les associer avec des effets financiers.

Les parcours sont combinables ; réparation puis restitution ou stock. Remplacement client et règlement sans retour sont d’autres axes, à instruire avec les frontières commerciales. Donation, revente secondaire et recyclage ne sont pas assimilés au rebut. Noms, descriptions et élargissement proposé de Customer Return restent à discuter ; seul le retrait de Management est appliqué au catalogue dans U384.


### Intégration CMP143 — U385

La définition élargie de Customer Return et les cinq parcours proposés U384 sont adoptés et intégrés sous BHV050–BHV054. Les correspondances SAP/Microsoft, leurs écarts et limites sont portés par la capacité et chaque comportement, avec statut proposé distinct de l’accord métier. Return to Supplier mobilise Supplier Return sans dupliquer sa responsabilité. Les nouvelles descriptions détaillées et le contrat formalisé de relais restent éditoriaux. Les autres axes commerciaux ou filières ne sont pas intégrés par extension. Preuve : audits/2026-09-18-customer-return-U385/implementation.yaml.


## CMP144

Codex ; 18 septembre 2026 ; U386 ; ELM233 ; D04.m Supplier Return après U385. Recouvrement partiel ; statut proposé, aucun comportement créé.

Proposition de deux parcours : Return for Credit sans remplacement attendu, et Return for Replacement avec maintien d’un apport de remplacement. Oracle explicite l’effet sur les réceptions futures ; SAP ByDesign distingue avoir, remplacement et mélange par quantité ; Microsoft Business Central produit une commande de remplacement liée. FLOW conserve cette différence d’attendu Supply, sans imposer l’objet technique, la réouverture d’un statut ou reprendre le règlement comptable. Motifs, opérations et interfaces ne deviennent pas des comportements.

Return for Repair demeure conditionnel : une reprise au titre de l’obligation du fournisseur et un achat de prestation à un réparateur ne sont pas automatiquement la même responsabilité. Oracle EBS documente la réparation externe via achat et mouvements, sans prouver son rattachement à un Supplier Return FLOW. Proposition et exemples : modeles/backlog/supplier-return-behaviors.yaml. Aucun accord implicite sur la définition élargie, les noms ou les contrats.


### Intégration CMP144 — U387

Return for Credit (BHV055) et Return for Replacement (BHV056) sont adoptés sous Supplier Return. La distinction porte sur l’apport de remplacement attendu ; finance, négociation, exécution et stock restent distincts. Les comparaisons Microsoft Business Central, SAP ByDesign et Oracle Fusion Cloud sont présentes dans les fiches avec leurs versions, différences et limites. Correspondances proposées, sans assimilation des produits ou des niveaux. La formalisation de la dépendance à Purchase Order est proposée ; la responsabilité de l’apport est acquise. Return for Repair demeure conditionnel et non créé. Définition élargie du parent éditoriale. Preuve : audits/2026-09-18-supplier-return-U387/implementation.yaml.


### Complément CMP144 — U388

Return for Repair ajouté sous Supplier Return (BHV057) à la demande explicite de Laurent. Le point de rattachement laissé conditionnel U386 est tranché ; les frontières d’achat de prestation, d’orchestration et de stock restent distinctes. La page primaire Oracle EBS 12.1 est ouverte de nouveau : Repair Return (Pull), délais de transfert/réparation/réception et achat au réparateur sont documentés. Le passage n’établit pas une traçabilité sérialisée identique à notre exigence. Comparaison proposée, sans assimilation au catalogue Oracle Fusion ni preuve de déploiement. Nom, principe et parent acquis ; détails éditoriaux non adoptés globalement. Preuve : audits/2026-09-18-supplier-repair-U388/implementation.yaml.


### CMP145

U389 — Codex, 18 septembre 2026 ; appui méthodologique proposé pour MOD006 et la typologie issue du backlog courant (empreinte dans modeles/backlog/behavior-typology.yaml).

ELM052/BIZBOK éclaire la manière d’agir contextualisée, distincte du niveau de décomposition et du processus comme suite d’activités. ELM234/Microsoft fournit un exemple de régimes de comptage aux effets métier différents. Points communs : circonstances, politiques et pratiques peuvent différencier la réalisation d’une capacité. Adaptation FLOW : une grille de sept formes, déduite de ses 48 comportements sous 13 capacités et enrichie des scopes de visibilité arbitrés en annexe ; pas de correspondance exclusive par nature.

Écart et limite : ni la liste de sept formes ni le niveau terminal Capacité → Comportement ne sont une norme universelle démontrée. Microsoft expose des processus, modalités et fonctions que FLOW sélectionne à sa maille ; tous ne sont pas des comportements. Bénéfice : rendre le critère opérant sans nouveau niveau ni catalogue produit. La règle de documentation est demandée par Laurent ; formulation et rapprochement restent éditoriaux, sans validation globale ni publication.


### CMP146

U390 — Codex, 18 septembre 2026 ; Purchase Order D04.j au backlog courant, empreinte dans modeles/backlog/purchase-order-behaviors.yaml. ELM235 : recouvrement partiel avec les processus achat Microsoft et SAP.

Proposition de Stock Procurement, Direct Delivery et Service Procurement : attentes et preuves distinctes, coordination achat/vente pour le direct, réalisation d’une prestation pour le service. La définition actuelle limitée aux biens est à élargir explicitement si la proposition est adoptée. L’achat relève de D04 ; la sollicitation et le suivi opérationnel relèvent de D06, sans imposer un achat pour tout appel de service. Stock et finance gardent leurs responsabilités.

Consignment Procurement reste un candidat : la documentation Microsoft distingue acquisition et détention physique, mais ne justifie pas d’attribuer toute la consignation à D04. Les libellés, définitions et rattachements proposés restent à valider ; aucun catalogue modifié. Périmètre limité à ce prochain sujet, aucune exhaustivité de tous les modes d’achat revendiquée.


### Intégration CMP146 — U391

Stock Procurement, Direct Delivery et Service Procurement intégrés sous Purchase Order (BHV058–060), avec responsabilités présentées et rattachements adoptés. Principe d’extension aux prestations acquis ; définition développée du parent éditoriale. Achat, sollicitation opérationnelle, stock et finance demeurent distincts. Consignment Procurement retiré des candidats achat : C102 et CMP147 instruisent la responsabilité de gestion du stock demandée. Comparaisons marché dans les fiches, sans validation automatique ni publication.


### CMP147

U391 — Codex, 18 septembre 2026, proposition pour D01 Inventory Management au backlog. ELM236 : rapprochement partiel et appui lexical à Consigned Inventory Management. Microsoft rattache le suivi à un parcours Inventory to deliver relié aux achats ; SAP gère les stocks spéciaux dans Inventory Management mais expose aussi une variante de Procure to Receipt. Oracle Fusion traite le cycle accord/stock/consommation/règlement et NetSuite nomme explicitement Consigned Inventory Management.

Recommandation FLOW : une responsabilité de gestion du régime de stock, proposée sous D01 ; les capacités existantes conservent états, mouvements et visibilité. Le retrait de Consignment Procurement des comportements Purchase Order suit U391/C102. L’acte d’achat/transfert de propriété peut intervenir dans le cycle sans en devenir l’unique finalité.

Le besoin de Laurent porte aussi conditions de responsabilité et devenirs après saison. Les conserver comme exigence FLOW, sans prétendre qu’un unique intitulé de marché les couvre. Finance, assurance, négociation, décisions et exécution restent liées, non absorbées. L’offre au fournisseur assemble plusieurs aptitudes ; pas d’équivalence offre=capacité. Nom et définition candidats à valider ; aucune nouvelle capacité créée.


### CMP148

U392 — Codex, 18 septembre 2026 ; nouveau type d’Order à instruire sous D04, en lien avec la gestion de stock proposée CMP147. ELM237 soutient un besoin de demande d’apport consigné distinct de l’achat, mais les réalisations divergent : Consignment Replenishment Order Microsoft, Purchase Order avec catégorie Consignment SAP, Consignment Order dans le parcours Oracle.

Recommandation de nom ciblé Microsoft pour FLOW ; pas de Procurement Order générique sans autres cas qui justifient ce périmètre. L’objet Supply Order Oracle est plus large et orchestre achat, fabrication et transfert : ne pas le recopier comme simple type d’Order. D01 conserve le régime de stock et D06 l’exécution. Aucun nouveau nœud créé, noms et rattachements à valider.


### CMP149

U393 — Codex, 18 septembre 2026 ; appui méthodologique et comparaison partielle du principe de demande par intention. ELM238 : séparation documentaire Microsoft directement lisible pour les intentions d’apport/acquisition ; SAP porte des distinctions métier dans une structure documentaire commune et propose aussi une alimentation selon les besoins.

Retenir pour FLOW les intentions, relations et engagements comme point de départ. La préférence Microsoft porte sur cette adéquation sémantique précise ; aucune supériorité globale, ancienneté explicative ou réalisation Case Management déduite du seul nombre de types de documents. La cible décrite assemble stockage pour le fournisseur, régime de propriété et réassort tiré par les ventes ; rémunération/location est une condition de l’offre à préciser, pas la définition générale de consignation. Pas de création de capacité, changement de nom ou décomposition acquis par extension.


### Clarification CMP149 — U394 / C103

Le critère de Laurent est la visibilité du métier dans les objets, données et transactions. Le rappel de la couverture SAP en réponse à U393 était hors du point discuté. La séparation Microsoft donne, sur le cas étudié, une expression plus directe des intentions apport/acquisition ; c’est une appréciation architecturale argumentée par ELM238, pas une preuve de fonction absente chez SAP. FLOW retient ce critère explicite de design. L’opinion « Microsoft, arrivé après, a corrigé le problème » est conservée comme telle, sans causalité historique documentée.


### CMP150

U398 — ELM239, appui méthodologique. La distinction des sens Flow/Triggering/Serving conforte la qualification des interactions et l’attention au sens des flèches. FLOW retient des expressions métier lisibles et l’explication des comportements selon le contexte. Notre niveau terminal et la différenciation des comportements restent des conventions FLOW, sans assimilation aux éléments ArchiMate. U399 réserve leur mise en œuvre aux travaux futurs : aucun nouvel audit ni remaniement des liens. Convention : modeles/backlog/business-interactions.yaml.


### CMP151

U400 — proposition groupée, auteur Codex, 18 septembre 2026. Douze comportements proposés : trois sous Consigned Inventory Management, quatre sous Sales Order, cinq sous Transfer Order. ELM240 apporte des appuis fonctionnels ou sémantiques, avec différences de périmètre explicites. Consignment Exit reprend les issues métier U391 au-delà des retours documentés ; Intercompany est combinable avec les modes de livraison ; le découpage des transferts exprime les intentions FLOW tout en conservant décisions et suivi des Orders distincts. Aucun nouveau comportement adopté ni créé à ce stade. Détail et justification de chaque proposition : modeles/backlog/consignment-sales-transfer-review.yaml.


### Intégration CMP151 — U401

Douze comportements intégrés : BHV063–065 sous Consigned Inventory Management, BHV066–069 sous Sales Order, BHV070–074 sous Transfer Order. Noms, responsabilités présentées et parents validés ; comparaisons qualifiées séparément. Les sources spécifiques remplacent les anciennes correspondances génériques des trois parents, conservées dans la capture antérieure. Limites SAP indexé, IOM preview, Nextail témoignage et périmètre FLOW de Consignment Exit préservées. Pas de nouvelle recherche générale, nouvelle capacité ni modification des liens métier existants.


### CMP152

U402 — Codex, 18 septembre 2026. ELM241 comparé à D03.j et BHV075–077 du backlog. Noms et responsabilités présentées des trois comportements adoptés par Laurent ; correspondances marché éditoriales qualifiées séparément. Microsoft CTP apporte un appui partiel à la faisabilité de ressources supplémentaires, notamment fabrication ; FLOW couvre plus largement les adaptations supply. SAP ABC apporte un appui aux alternatives, mais une option déjà admissible reste dans ATP FLOW. SAP BOP traverse CTP, décision collective, priorités, révision de promesse et application des affectations ; ce n’est pas un synonyme du troisième comportement.

Le bénéfice est de rendre lisibles trois leviers combinables aux conditions et conséquences distinctes. CTP établit les possibilités et impacts, Fulfillment Plan Decision choisit le scénario collectif ; Supply Assignment et Promise Management appliquent leurs effets respectifs. Intitulés FLOW, pas labels de taxonomie CTP revendiqués au marché. L’exemple express est une illustration FLOW, non une fonctionnalité ABC établie par la source. Aucun engagement ou gel levé par hypothèse.


### CMP153

U403 — Codex, 19 septembre 2026. ELM242 rapproché de Purchase Order D04.j et Supplier Confirmation BHV078 : recouvrement partiel des échanges et du suivi de l’engagement fournisseur ; appui lexical SAP. Le comportement couvre établissement et révision, combinables avec les parcours achat ; son bénéfice est la lisibilité de la demande, de la réponse, de l’engagement accepté et du risque opérationnel. Noms, responsabilité, parent et principes exposés adoptés ; comparaisons et compléments rédactionnels qualifiés séparément.

Vendor collaboration Microsoft est plus large que ce comportement. L’analyse Microsoft consultée couvre les impacts directs, pas tous les effets indirects. FLOW sépare contenu de l’engagement, étude des possibilités/impacts, mutations d’Order et promesse client. Refuser une modification ne rétablit pas la capacité physique du fournisseur ; accepter son engagement ne modifie pas automatiquement le nôtre. Ces frontières expriment le modèle FLOW ; aucun comportement logiciel, taxonomie universelle ou preuve installée prétendu. La négociation générale des accords reste distincte.


### CMP154

U404–U406 — Codex, 19 septembre 2026. ELM243 comparé à Execution Tracking D07.d et BHV079–082. Trois visibilités physiques déjà adoptées U305/U308 matérialisées ; Business Process Tracking adopté sous le même parent. Appui Microsoft au nom et à la corrélation d’étapes métier ; extension explicite FLOW jusqu’aux prestations et appels contribuant aux Tasks, sans imposer de cardinalité. Camunda Process Observability a un périmètre produit plus large, incluant intervention et analyse ; FLOW conserve suivi, orchestration et adaptation distincts.

SAP EWM étaye le périmètre entrepôt ; project44 le vocabulaire et périmètre Transportation Visibility ; Blue Yonder les opérations magasin et le bénéfice de disponibilité en rayon. Les visibilités sont des perspectives combinables, pas une taxonomie éditeur reprise intégralement. Logistics Visibility ne crée pas de niveau intermédiaire. Digital Service Visibility reste une proposition historique remplacée, dont le besoin est conservé. Noms et périmètres adoptés selon leurs accords ; descriptions développées et rapprochements restent qualifiés séparément.


### CMP155

U407–U409 — Le Process orchestre des Services. Process Orchestration possède un appui lexical Camunda ; Microsoft conforte la distinction entre progression du parcours et contributions des providers. FLOW sépare décision d’adaptation, coordination et suivi. Process Management, Operations Tracking et les noms centrés sur Service expriment la cohérence du modèle FLOW, pas un consensus de taxonomie éditeur. Business est supprimé du nom FLOW Process Tracking, sans renommer le produit Azure Business Process Tracking dans les sources. Accord limité aux noms présentés et au principe ; les deux intitulés dérivés D14.a/D07.c et les comparaisons restent proposés. Responsabilités et couches conservées.


### CMP156

U410 — P11 rapproché du comportement Order Release BHV039. Le marché documente la cohérence collective préalable au lancement, mais ne justifie pas à lui seul une capacité ou un comportement autonome. FLOW enrichit le comportement existant : complétude, éléments indispensables et traitement partiel. SAP Release Check et Oracle Shipment Sets constituent des recouvrements partiels, pas des équivalences à tous les types d’Orders FLOW. L’affectation prépare les ressources ; Order Release autorise ; Process Orchestration coordonne les services. Autorisation collective distincte de simultanéité physique et d’atomicité technique. Définition adoptée, comparaisons éditoriales.


### CMP157

U411–U413 : Order Backlog Management nomme D03 et sa responsabilité collective. Oracle étaye le nom et la priorisation/replanification du carnet ; Microsoft apporte la pratique de travail des Planned Orders. FLOW distingue demande selon son intention (D04), travail collectif et engagement du carnet (D03), orchestration de services (D06). Oracle Release Planning Results transmet au système de gestion de commandes ; la release vers les processus est la convention FLOW. Le périmètre achat/vente/transfert/retour ne se déduit pas des seuls produits consultés. Renommage et mandat adoptés, placements détaillés en réexamen ciblé ; les anciens accords ne sont pas effacés.


### CMP158

U414 — Order Backlog Planning D03.p mobilise les décisions pour travailler les scénarios et préparer la part engagée. Appui lexical Oracle Backlog Planning, appui pratique Microsoft sur les Planned Orders. Oracle transmet des résultats à Order Management ; FLOW rattache son autorisation de prise en charge Order Release à Planning sans assimiler les deux opérations. Le comportement BHV039 est déplacé, pas dupliqué ; sa définition U410 reste inchangée. Supply Assignment applique les affectations, Promise Management gère les engagements, Process Orchestration coordonne les services. Aucun transfert automatique de Split ou Structuring, ni liste de comportements Planning déduite du produit.


### CMP159

U416/U417 — Structuring couvre découpage et composition ; Split est son comportement. Les mutations d’état ne déterminent pas à elles seules un domaine : Lifecycle gouverne les engagements et la progression du carnet dans D03. Oracle documente scission par sites/dates et progression différenciée ; Microsoft documente préparation et approbation des Planned Orders. Le rattachement FLOW est un choix de responsabilité métier, pas une arborescence éditeur reproduite. Planning prépare les scénarios, Lifecycle autorise via Release, Process Orchestration coordonne les services. Gel, affermissement et suspension restent combinables, sans séquence universelle de statuts. U417 révise explicitement U414 ; aucune duplication.


### CMP160

U421/U422 — Réexamen proposé de Lifecycle : Order Change Management en D04 (préparation et changements du besoin), Order Backlog Control en D03 (affermissement, gel, autorisation et suspension). Huit comportements tracés sans changement de catalogue. Appuis Microsoft ELM249 ; noms transverses FLOW proposés, pas consensus ni catalogue éditeur. Amendment justifié par les effets d’une révision sur une demande déjà engagée. Rescheduling actuel concerne la date du besoin, non la date promise ; Cancellation retire le besoin, non sa seule affectation. La séparation des dimensions n’impose pas leur indépendance ni une architecture de versions particulière. Rapprochement proposé, non validé.


### CMP161

U423 — Une capacité Lifecycle unique peut gouverner plusieurs dimensions métier par ses comportements. Appui méthodologique Microsoft ELM250 ; aucune taxonomie équivalente revendiquée. Préserver le parent D04 dans cette piste et rendre explicite la mobilisation par D03 ; D06 conserve les réalisations. Le tableau des dimensions est exploratoire, sans fusion ni création de comportement. La scission CMP160 reste une alternative non adoptée. Proposition Codex, non validée.


### CMP162

U424 — Lifecycle unique en D04, six dimensions documentées par des états à portée explicite. Appui Microsoft ELM249–251 ; séparation états d’approbation, réalisation et documents, affermissement et suspension. FLOW regroupe préparation/révision et fin de la demande, sans assimiler annulation à clôture ni autorisation à réalisation. BHV041 intégré à BHV038, BHV042 à BHV043. Les nouveaux noms anglais, valeurs d’état et règles détaillées sont éditoriaux ; l’accord porte sur principe, définition présentée et dimensions. Aucune preuve installée Beaumanoir. Relation D03 Planning → Lifecycle explicite la mobilisation sans mutualisation logicielle présumée.


### CMP163

U425 — P01, P02 et P03 clos comme couverts par Replenishment Decision, sans comportements supplémentaires. Les méthodes Microsoft Per requirement/Per period/Min-Max et les Action messages étayent les politiques et ajustements décrits, sans imposer un nœud par méthode. Min/max peut dépendre des besoins par période ; la détermination des cibles reste dans Inventory Target Decision. D04 applique les changements autorisés ; D06 réalise via ses services. Clôture adoptée ; descriptions et rapprochements éditoriaux. Aucun constat d’exhaustivité du marché.


### CMP164

U427 adopte Requirement-based Replenishment, Target-based Replenishment et Replenishment Adjustment sous D05.e. Appui ELM253 : Per requirement/Per period, Min/Max et Action messages. Le bénéfice métier différencie deux politiques et un mécanisme combinable ; la cadence et les paramètres ne justifient pas des nœuds supplémentaires. FLOW conserve calcul des cibles dans D05.a, modifications autorisées dans D04 et orchestration dans D06. Noms/definitions présentés et parent adoptés ; comparaisons détaillées éditoriales. Aucun code Cancel Microsoft déduit de la liste consultée.

### CMP165

U428, 19 septembre 2026, Codex — frontière proposée pour A04, backlog courant après U427. Appui ELM254 ; recouvrement partiel avec les processus de retour des éditeurs. Microsoft combine suites logistiques et financières dans ses actions ; SAP distingue suites logistiques et compensation dans un parcours intégré ; Oracle explicite l’orchestration de services de facturation réalisés par les composants financiers.

Recommandation FLOW : facturation, avoirs, encaissement et remboursement relèvent de responsabilités externes à Supply Chain Orchestration, avec répartition Commerce/Finance à définir ailleurs. Autorisation commerciale et droit au remplacement externes ; faisabilité, demande et réalisation logistiques internes. Customer Return porte le retour physique, Return Disposition Decision le devenir du bien ; un remplacement mobilise un Sales Order lié. Un règlement sans retour ni remplacement ne justifie pas un comportement logistique fictif. Process Orchestration peut solliciter ou attendre un service externe nécessaire au processus Supply, et Process Tracking en suivre le résultat, sans s’approprier la responsabilité commerciale/financière ni la totalité du cycle Order-to-Cash.

Conserver les faits et préconditions aux frontières : quantités reçues/expédiées, inspection, autorisation commerciale ou financière, références et résultats des services. Encaissement préalable et remboursement après inspection sont des exemples de politiques possibles, pas des règles imposées. Une recommandation Supply de ne pas rapatrier un bien peut informer une décision commerciale sans autoriser elle-même un remboursement. Proposition de clarification compatible avec les exclusions existantes ; statut proposé, aucun arbitrage A04 clos ni catalogue modifié.

### CMP166

U429 — Codex, 19 septembre 2026. Complément CMP165 pour la frontière externe au backlog Supply. ELM255 montre le paiement opérationnel dans Microsoft Commerce et Sales Billing chez SAP, articulé à Finance. Le périmètre d’un produit ne prescrit ni domaine d’entreprise ni équipe responsable. Distinguer établissement du document commercial et comptabilisation de créance ; paiement au point de vente/autorisation/capture et rapprochement bancaire/lettrage. Encaissement peut recouvrir plusieurs de ces responsabilités selon le contexte ; aucune affectation unique n’est justifiée par le seul mot.

Exclusion Supply validée U429 ; attribution Commerce/Finance laissée ouverte. Recommandation : conserver ces responsabilités comme externes, sans imposer maintenant un nouvel univers ni des capacités de finance ou de commerce. Le rattachement et la décomposition proposés ici restent non validés ; aucun catalogue modifié.


### CMP167

U439/U440/U442 — Codex, 19 septembre 2026. Rapprochement proposé d’Order Grouping BHV086, sous Order Structuring D04.n, avec ELM256 et ELM257. Recouvrement partiel : préserver des demandes identifiables et des conditions communes ; portée multi-Orders persistante FLOW à instruire. L’accord ne valide pas les définitions ni les règles détaillées. Pas de comportement par opération d’ajout/retrait d’un membre ; décisions, autorisation de prise en charge et réservation distinctes.

### CMP168

U439/U440/U442 — Codex, 19 septembre 2026. Rapprochement proposé d’Order Merging BHV087, sous Order Structuring D04.n, avec ELM258. Mécanisme de remplacement de plusieurs demandes actives par une demande résultante avec traçabilité. Appui documenté pour les achats avant approbation ; autres intentions, engagements, prix et réalisations à examiner. Microsoft Firm planned orders (ELM251) éclaire une frontière différente : création d’un Order depuis des propositions. Ni regroupement d’expéditions ni généralisation automatique des règles produit.

### CMP169

U449 — Codex, 19 septembre 2026. Appui méthodologique proposé entre ELM259 et le principe de typage des capacités FLOW dans le backlog courant après U448. Point commun : responsabilité de décision distincte de la coordination et de l’application. Différence : les six natures action, management, knowledge, orchestration, planning et decision sont déjà présentes dans FLOW ; ni leur liste ni les icônes ne sont prescrites par DMN. Les conserver évite de reclasser les accords et clarifie la lecture sans changer les frontières.

Dix absences sont complétées par analogie de responsabilité avec les capacités déjà typées, avec justification individuelle dans audits/2026-09-19-capability-types-U449/changes.yaml. Qualifications proposées dans la portée U435 ; U449 adopte le besoin de typage et les règles de présentation, sans validation globale des classements. Le résultat dominant détermine le type ; aucune inférence depuis le nom ou le préfixe d’identifiant. Aucune preuve installée ni conformité DMN revendiquée. Grille et comparaison : modeles/backlog/capability-types-U449.yaml ; convention méthodologique MOD007.

### CMP170

U450/U451 — Codex, 19 septembre 2026. Appui méthodologique ELM052 et illustration produit ELM234 reconsultés pour le typage des 76 comportements du backlog courant. Point commun : distinguer les façons d’agir et leurs effets selon les circonstances. Différence : la forme principale et les sept catégories sont une convention FLOW issue de MOD006, choisie U451 ; aucune taxonomie BIZBOK/Microsoft équivalente revendiquée.

Les qualifications individuelles sont proposées sur la base des définitions existantes, sans modifier les comportements ni leur parent. Une forme principale fournit l’icône ; les formes complémentaires restent combinables. La granularité Capacité → Comportement demeure terminale. Détail : modeles/backlog/behavior-types-U451.yaml. Aucun nouvel audit des lacunes, accord global ou constat installé.

### CMP171

U453 — Codex, 19 septembre 2026, **proposition d’audit**. ELM260/261/264–270/274/275 rapprochés du méta modèle FLOW et de la publication v010 / 2026-09-19.3, notamment Purchase Order D04.j, les six référentiels D08/D09/D11/D12/D13/D14, TER002/TER036/TER037 et le guide méthodologique. Relation : appui méthodologique ou sémantique, sans équivalence de catalogue.

Point commun : relier responsabilités et informations aide à expliciter usages, autorités et frontières. Différences : entité d’intégration Dynamics, information métier et objet d’un outil EA ne sont pas des synonymes ; les contrats ERP vont au-delà du cadrage Supply. Adaptation recommandée : petit catalogue transversal d’informations métier, projections qualifiées et structures essentielles, relié aux capacités ; modèles de données approfondis et contrats techniques référencés à leur niveau. Conserver Univers/Domaine/Capacité et la décomposition terminale existante.

Bénéfice : cadrage PO et analyse du découplage sans imposer des composants. Limites : aucune source maîtresse réelle, cardinalité, réalisation installée ou convention de faits/documents n’est validée ; besoin ancien identifié dans connaissance/24-capacites-objets-et-faits.md. Aucune modification du modèle ni validation implicite. Détails et alternatives : [rapport U453/U454](../audits/2026-09-19-atlas-ux-ui-U453/rapport.md), §§6–9.

### CMP172

U453 — Codex, 19 septembre 2026, **proposition d’audit**. ELM262/263/271–273 rapprochés des parcours de l’Atlas servant v010. Relation : appui méthodologique et analogie de fonctions de présentation, pas équivalence UX démontrée.

Adaptation recommandée : synthèse avant détails, recherche pertinente aux mots du métier, dépendances directes lisibles et accents de couleur limités. Alternative : monochromie mieux composée ; couleurs par domaine réservées à une vue dédiée. Conserver les icônes par type, les décisions en fin de liste, les glossaires distincts et les liens de version. Les validations et réserves internes restent hors interface.

Justification : mesures locales documentées, principes de lisibilité et de présentation progressive. Limites : comparaison documentaire des produits, aucun test utilisateur comparatif ni certification WCAG. Maquette illustrative sans modification d’Atlas ; résultats, captures et alternatives dans le [rapport](../audits/2026-09-19-atlas-ux-ui-U453/rapport.md), §§5 et 10–11.

### CMP173

U454 — Codex, 19 septembre 2026, **complément proposé** à CMP171. ELM276/277 rapprochés du même méta modèle FLOW v010 pour éprouver la recommandation indépendamment de SAP. Relation : appui méthodologique.

Adaptation : distinguer information métier, architecture des données et contrats de solution ; ne pas réduire toutes les données au niveau d’implémentation. Le modèle conceptuel ou logique peut être partagé entre solutions. Ce rapprochement n’impose ni une notation ni la conformité TOGAF à Atlas. Les limites d’édition et d’accès demeurent explicites : guide 2019 et standard 9.2 consultés, ressources actuelles vérifiées, contenu détaillé de la 10e édition non contrôlé. Voir le [rapport](../audits/2026-09-19-atlas-ux-ui-U453/rapport.md), §3, et son [registre de sources](../audits/2026-09-19-atlas-ux-ui-U453/sources.md).

### CMP174

U455/U456 — Codex, 19 septembre 2026. ELM278/279 rapprochés des principes FLOW et de l’exemple Commerce → Supply → logistique. Relation : appui méthodologique TOGAF et recouvrement partiel avec un produit Microsoft. **Principes locaux adoptés par Laurent** : retrait des couches transactionnelle/processus ; univers/domaines en interaction ; Atlas strictement métier. Les reformulations détaillées, interactions illustratives et nouveaux découpages ne sont pas adoptés par extension.

Point commun : responsabilités et parcours se lisent par leurs relations. Différences : TOGAF propose plusieurs vues sans prescrire la partition FLOW ; Microsoft décrit un produit et ses intégrations, pas trois univers d’entreprise. Bénéfice : rendre lisibles intentions, engagements et faits, sans assimiler processus à couche ni capacité à composant. La frontière Atlas n’interdit pas les structures d’information métier ; elle exclut les vues de solutions et les liens vers leur réalisation.

**Correction de CMP171–173 et du rapport initial** : abandonner la recommandation de conserver les couches, l’alternative du catalogue technique relié depuis Atlas et la fiche « réalisation liée ». Les comparaisons produits servent au travail interne. Aucun nouveau maître, flux installé ou origine historique SAP déduit. État comparé : backlog issu de v010, principes corrigés ; nœuds, relations, application et publication conservés. Détails et ancien principe archivé : [domain-interactions-U455-U456.yaml](../modeles/backlog/domain-interactions-U455-U456.yaml). Migration du champ layer identifiée, pas présentée comme appliquée.

### CMP175

U460 — Codex, 19 septembre 2026, **rapprochement proposé**. ELM280 → D08 Product Reference, backlog après U459, révision 4. Recouvrement partiel : références et variantes sont des notions documentées ; le périmètre Microsoft inclut aussi les maîtres. Adaptation FLOW : projection uniquement, conformément à U134. Bénéfice : rendre la frontière d’autorité explicite. Comparaison ajoutée dans la fiche, visible lors d’une publication future. Aucune équivalence complète, innovation ou réalisation installée affirmée ; pas de valideur métier.

### CMP176

U460 — Codex, 19 septembre 2026, **rapprochement proposé**. ELM281 → D08.d Product Reference Ingestion, backlog après U459, révision 4. Recouvrement partiel avec la réception de références. Adaptation : séparer autorité métier, source d’alimentation et projection. Bénéfice : éviter qu’un émetteur soit implicitement considéré comme maître. Limite : le paramétrage d’un produit ne renseigne pas les acteurs réels FLOW. Comparaison portée par la fiche ; aucun choix d’application ou flux installé ; pas de valideur métier.

### CMP177

U460 — Codex, 19 septembre 2026, **rapprochement proposé**. ELM282 → TER059 Product Unit, glossaire du backlog, révision 2. Appui sémantique GS1 sur la distinction référence/instance. Adaptation : conserver l’identité métier sans imposer son support ou sa codification. Bénéfice : ne pas confondre variante partagée et exemplaire. Limite : pas de certification ni d’équivalence complète entre Product Unit et toutes les catégories GS1. Comparaison portée par le terme ; pas de valideur métier.

### CMP178

U461 — Codex, 19 septembre 2026, **rapprochement proposé**. ELM285 → TER036 et pilote Purchase Order, glossaire du backlog révision 2. Appui sémantique par un exemple de document de réception. Le lien obligatoire fait–document est adopté par Laurent en U461 ; **la comparaison et les structures candidates ne le sont pas par extension**. Bénéfice : illustrer le choix local par un usage documenté. Limite : aucun standard universel, nombre exact de documents ou mécanisme de correction déduit. Comparaison portée par TER036 ; aucun valideur de la correspondance marché.

### CMP179

U462 — Codex, 19 septembre 2026, **rapprochement proposé**. ELM286 → D03.n, backlog révision 8. Appui lexical partiel pour expliquer l’alternative Order Confirmation. Le nom Fulfillment Commitment adopté U445 désigne une responsabilité plus large que confirmer un document. Les raisons de vocabulaire et de définition sont désormais dans la fiche ; elles explicitent U441/U443/U444 sans adopter un consensus de marché. Bénéfice : rendre la frontière de la promesse lisible. Aucun nouveau valideur, périmètre ou effet de réservation.

### CMP180

U462 — Codex, 19 septembre 2026, **rapprochement proposé**. ELM287 → D02.e, backlog courant capturé dans l’audit U462. Appui lexical et recouvrement partiel : même lien ressource–commande, mais effet de blocage différent. FLOW conserve son choix U436 ; SAP ARun ne sert pas de preuve que l’affectation FLOW réserve. Bénéfice : sourcer explicitement la différence derrière un terme commun. La convention Allocation/Assignment U289/U290 reste inchangée ; aucune équivalence complète ou réalisation installée, aucun valideur de la comparaison.

### CMP181

U462 — Codex, 19 septembre 2026, **rapprochement proposé**. ELM288 → D04.j, backlog courant capturé dans l’audit U462. Appui au nom Purchase Order et à la couverture biens/prestations ; distinction explicite entre objet documentaire du produit et capacité FLOW. Noms courts U384 et parcours U391 conservés. Bénéfice : expliquer le choix de terme sans réduire la responsabilité à un document. Les formulations pédagogiques restent proposées ; aucun état ERP importé, aucun valideur de la correspondance.

Les raisons lexicales et de périmètre sont également explicitées sur D03, D15, D02.c, D04.n, D05.a, D08 et D08.d à partir des arbitrages cités dans leurs fiches. Relectures primaires du 19 septembre : Microsoft DOM (introduction), Order promising (méthodes de contrôle des dates), Safety stock journals (Calculate a proposal), Inventory Visibility reservations (cas de réservation souple), Oracle 26B What's a Split Order Line (introduction, disponibilité et statut). Les URL et limites restent dans chaque comparaison. Product Reference et son ingestion reprennent les appuis ELM280/281 consultés lors de U460 ; leur périmètre ne change pas. Cette mise en valeur ne valide pas les comparaisons par extension.

### CMP182

U463 — Codex, 19 septembre 2026, **rapprochements proposés**. ELM019/ELM279 → universe-supply, backlog révision 4 ; cohérence de vocabulaire avec TER034/TER035. Appui méthodologique TOGAF pour décrire les responsabilités et recouvrement partiel Microsoft pour l’orchestration métier. Les points communs, différences, éditions, localisateurs et limites sont dans les deux comparaisons de la fiche.

La définition retirée décrivait une orientation technique et une priorité de travail, sans expliquer ce métier. La nouvelle rédaction synthétise les six domaines existants. U373 garde son nom et U455 sa coopération sans couches ; aucun domaine ou produit n’est ajouté. Bénéfice : comprendre le périmètre depuis l’univers sans supposer un ERP. Compromis : le nom et le périmètre restent des choix FLOW, sans équivalence complète avec une catégorie OMS ou une nomenclature TOGAF. U463 demande la correction ; la formulation éditoriale et les comparaisons n’ont pas de nouveau valideur. Les sources ont été reconsultées, aucune supériorité globale d’un éditeur n’est affirmée.

### CMP183

U464 — Codex, 19 septembre 2026, **proposition méthodologique**. ELM269/276/289/290/291 → MOD012 Information, nouveau terme proposé du glossaire méthodologique ; aucun changement du catalogue métier ou de son schéma. Comparaison de concepts, pas de fonctions produits.

Points communs : sens en contexte, explicitation des capacités et possibilité de décrire le métier indépendamment des formats informatiques. Différence décisive : Information Concept ne garantit pas l’élémentarité logique ; Data element porte aussi une problématique de représentation. Le regroupement cohérent n’est donc pas, à lui seul, une preuve de fait élémentaire.

Choix proposé : garder Information, avec définition FLOW et critère explicite de minimum utile au sens étudié. Bénéfice : décrire les engagements, références et résultats nécessaires aux capacités sans fabriquer un schéma implémentable. Compromis : critère contextuel à éprouver sur les pilotes, pas une unité universelle normée. Aucune équivalence de tous ces concepts, nouvelle validation ou bijection Information/capacité/table ; le fait élémentaire n’est pas assimilé au fait de gestion U461. Raisons, alternatives et limites dans [l’analyse](../modeles/backlog/information-definition-U464.yaml) et [la recherche](../audits/2026-09-19-information-U464/recherche.md).

### CMP184

U465/U466 — Codex, 19 septembre 2026, **rapprochements proposés**. ELM242/280/282/283/284/285/220/248 et appuis méthodologiques ELM269/276/CMP183 → quatorze fiches pilotes PINFO-001 à PINFO-014 de [information-cards-U465.yaml](../modeles/backlog/information-cards-U465.yaml), état du 19 septembre. Relations : appuis sémantiques et méthodologiques, pas équivalences de catalogue.

Microsoft éclaire demande, réponse fournisseur et confirmation, produit/variante et propriétés, maintien de liens de couverture et réservation souple. GS1 borne la différence référence/instance. Microsoft et Oracle illustrent les associations quantité–date. Les sources primaires, passages, dates, points communs, différences et raisons de chaque terme et définition sont portés par les fiches et leurs huit groupes de comparaison. ELM285 et les appuis d’architecture reprennent les consultations U461/U464 du même jour ; aucune nouvelle lecture intégrale revendiquée. Une tentative supplémentaire d’ouverture de la page ELM285 n’a pas abouti ; aucun constat nouveau n’en est tiré.

Adaptation proposée : séparer les sens utiles aux capacités, décrire leurs conditions et leurs liens, sans importer lignes, états, tables, autorités ou automatismes des produits. Bénéfice : expliquer ce qui est demandé, proposé, engagé, réalisé, connu, affecté ou réservé. Compromis : noms descriptifs FLOW lorsque la maille n’a pas d’équivalent exact établi ; absence d’équivalence ne prouve aucune innovation.

U466 adopte seulement la distinction et le lien entre proposition et engagement de satisfaction, avec coexistence possible. Les sources éditeurs n’en font pas une norme universelle et cet accord ne valide pas les autres fiches, comparaisons ou règles d’achat. Aucun valideur des rapprochements, aucune source maîtresse Beaumanoir ni réalisation installée déduite.


### CMP185

U470 — Codex, 19 septembre 2026, rapprochements proposés : CSCMP, Microsoft SCM et Oracle Supply Chain Orchestration → universe-supply ; CSCMP et Oracle → TER031. Backlog courant capturé avant correction dans l’audit U470. Comparaison du nom et du périmètre de l’univers, pas synthèse des capacités. Le SCM large sert de contraste de périmètre ; le nom Oracle atteste un usage sans équivalence de maille. Le choix FLOW concentre l’orchestration, garde les maîtres externes et leurs projections ingérées, et distingue les exécutants. Bénéfice : expliquer la frontière au lecteur novice. U373 conserve son nom adopté ; aucun nouveau valideur des rédactions ou correspondances. Sources, passages et limites dans les fiches et sources.yaml de l’audit.

### CMP186

U471 — Codex, 19 septembre 2026, rapprochements proposés sur les 47 fiches identifiées dans single-references.json de l’audit U470. Une seconde source primaire pertinente est ajoutée à chacune ; les comparaisons préexistantes et les définitions sont préservées. [Correspondances détaillées](../audits/2026-09-19-base-U470/additions.yaml) : élément externe, cible, relation, points communs, différences, choix du terme et de définition, édition, passage, date et limites. État comparé : backlog du 19 septembre avant ces ajouts, conservé dans before/. Les sources d’un même éditeur sont signalées comme telles ; deux documents ne prouvent pas un consensus. Les recouvrements partiels restent partiels, notamment comportements plus larges que leurs exemples. Bénéfice : permettre une revue argumentée sans importer les frontières des produits. Aucun valideur des rapprochements, changement de responsabilité, réouverture de U431 ou publication implicite.


### CMP187

U472 — Codex, 19 septembre 2026. Cibles : retrait de universe-case et TER067, correction de TER064 et PRINCIPLE-CASE-SUPPLY-ORDERS ; état avant modification dans [l’audit U472](../audits/2026-09-19-business-services-U472/before/).

Constats : ELM323 (MKT02) décrit la notion de service exposé ; ELM324 (MKT14) décrit le dossier de traitement client. Interprétation : ni un service ni un dossier ne justifient à eux seuls un univers réunissant les grands processus transverses de l’entreprise. Les deux sources éclairent des concepts différents, pas deux taxonomies concordantes. Appuis méthodologique et sémantique partiels ; aucune équivalence Business Services/Commerce.

Choix local demandé par Laurent : retirer l’univers vide et différer le commerce après la Supply Chain. Le terme Case est conservé sans rattachement à cet univers ; son périmètre générique dépasse l’exemple Microsoft. Bénéfice : supprimer une structure sans contenu et concentrer la revue. Compromis : les autres responsabilités de l’entreprise restent hors du périmètre étudié. Le retrait est adopté par U472 ; les reformulations et rapprochements restent éditoriaux, sans validation globale ni publication.

### CMP188

U474/U475 — Codex, 19 septembre 2026. Cible : `universe-supply`, backlog courant comparé à la publication 2026-09-19.6 ; état antérieur du modèle couvert par Git avant ce lot. Appuis ELM292/ELM293/ELM294 (CSCMP, Microsoft, Oracle), ELM325 (recherche, MKT55) et ELM326 (SCOR, MKT56).

Constats : les sources documentent une discipline, une suite logicielle, un module, un rôle de prestataire et un processus de référence. Interprétation : elles éclairent une idée de coordination avec des frontières différentes. CSCMP et Microsoft couvrent un ensemble large ; SCOR et la recherche éclairent l’organisation entre acteurs ; le module Oracle partage le nom FLOW sans reprendre son regroupement de responsabilités.

Recommandation retenue par Laurent en U475 : format C, choix FLOW en deux phrases, tableau nom/périmètre/approche, synthèse entre sources et avec FLOW, puis exemple Oracle des 75 pièces livrables sur 100 attendues avec lecture FLOW distincte. Bénéfice : compréhension immédiate pour métiers et PO ; compromis : synthèse courte et références détaillées consultables. Le champ `market_inspiration` et les résumés de lecture portent le contenu présenté. L’accord reste borné à celui-ci ; les qualifications bibliographiques et descriptions détaillées non présentées restent proposées. Aucun consensus, conformité, changement de responsabilité ou déploiement déduit ; aucune extension aux autres fiches. [Discussion et passages consultés](sources-inspiration-universe-supply-U474.md).


### CMP189

U477 — Codex, 19 septembre 2026. Lot orders, 65 fiches du backlog courant ; état avant intervention conservé dans [before/](../audits/2026-09-19-sources-inspiration-U477/before/). Les [correspondances détaillées](../audits/2026-09-19-sources-inspiration-U477/orders-output.yaml) donnent pour chaque cible le nom natif, la relation, les similitudes, différences, choix FLOW, éditions, passages et limites. Le [relevé de consultation](../audits/2026-09-19-sources-inspiration-U477/orders-sources.yaml) distingue constats et exemples attribués des illustrations FLOW.

Interprétation et adaptation éditoriale proposées : choix d’ouverture, tableau nom/périmètre/approche, comparaison entre sources et avec FLOW, cas concret. Bénéfice : permettre aux métiers et PO de comprendre le choix sans connaître les produits. Compromis : synthèse courte, détails et limites de preuve accessibles dans les références. Aucun changement de nom, de responsabilité, de parent, de réalisation installée ou d’accord antérieur ; aucune nouvelle validation de ces correspondances. U477 autorise leur rédaction, pas leur adoption globale. Les anciennes valeurs sont préservées dans la capture antérieure.


### CMP190

U477 — Codex, 19 septembre 2026. Lot inventory, 70 fiches du backlog courant ; état avant intervention conservé dans [before/](../audits/2026-09-19-sources-inspiration-U477/before/). Les [correspondances détaillées](../audits/2026-09-19-sources-inspiration-U477/inventory-output.yaml) donnent pour chaque cible le nom natif, la relation, les similitudes, différences, choix FLOW, éditions, passages et limites. Le [relevé de consultation](../audits/2026-09-19-sources-inspiration-U477/inventory-sources.yaml) distingue constats et exemples attribués des illustrations FLOW.

Interprétation et adaptation éditoriale proposées : choix d’ouverture, tableau nom/périmètre/approche, comparaison entre sources et avec FLOW, cas concret. Bénéfice : permettre aux métiers et PO de comprendre le choix sans connaître les produits. Compromis : synthèse courte, détails et limites de preuve accessibles dans les références. Aucun changement de nom, de responsabilité, de parent, de réalisation installée ou d’accord antérieur ; aucune nouvelle validation de ces correspondances. U477 autorise leur rédaction, pas leur adoption globale. Les anciennes valeurs sont préservées dans la capture antérieure.


### CMP191

U477 — Codex, 19 septembre 2026. Lot promising, 40 fiches du backlog courant ; état avant intervention conservé dans [before/](../audits/2026-09-19-sources-inspiration-U477/before/). Les [correspondances détaillées](../audits/2026-09-19-sources-inspiration-U477/promising-output.yaml) donnent pour chaque cible le nom natif, la relation, les similitudes, différences, choix FLOW, éditions, passages et limites. Le [relevé de consultation](../audits/2026-09-19-sources-inspiration-U477/promising-sources.yaml) distingue constats et exemples attribués des illustrations FLOW.

Interprétation et adaptation éditoriale proposées : choix d’ouverture, tableau nom/périmètre/approche, comparaison entre sources et avec FLOW, cas concret. Bénéfice : permettre aux métiers et PO de comprendre le choix sans connaître les produits. Compromis : synthèse courte, détails et limites de preuve accessibles dans les références. Aucun changement de nom, de responsabilité, de parent, de réalisation installée ou d’accord antérieur ; aucune nouvelle validation de ces correspondances. U477 autorise leur rédaction, pas leur adoption globale. Les anciennes valeurs sont préservées dans la capture antérieure.


### CMP192

U477 — Codex, 19 septembre 2026. Lot foundations, 13 fiches du backlog courant ; état avant intervention conservé dans [before/](../audits/2026-09-19-sources-inspiration-U477/before/). Les [correspondances détaillées](../audits/2026-09-19-sources-inspiration-U477/foundations-output.yaml) donnent pour chaque cible le nom natif, la relation, les similitudes, différences, choix FLOW, éditions, passages et limites. Le [relevé de consultation](../audits/2026-09-19-sources-inspiration-U477/foundations-sources.yaml) distingue constats et exemples attribués des illustrations FLOW.

Interprétation et adaptation éditoriale proposées : choix d’ouverture, tableau nom/périmètre/approche, comparaison entre sources et avec FLOW, cas concret. Bénéfice : permettre aux métiers et PO de comprendre le choix sans connaître les produits. Compromis : synthèse courte, détails et limites de preuve accessibles dans les références. Aucun changement de nom, de responsabilité, de parent, de réalisation installée ou d’accord antérieur ; aucune nouvelle validation de ces correspondances. U477 autorise leur rédaction, pas leur adoption globale. Les anciennes valeurs sont préservées dans la capture antérieure.


### CMP193

U477 — Codex, 19 septembre 2026. Lot references, 58 fiches du backlog courant ; état avant intervention conservé dans [before/](../audits/2026-09-19-sources-inspiration-U477/before/). Les [correspondances détaillées](../audits/2026-09-19-sources-inspiration-U477/references-output.yaml) donnent pour chaque cible le nom natif, la relation, les similitudes, différences, choix FLOW, éditions, passages et limites. Le [relevé de consultation](../audits/2026-09-19-sources-inspiration-U477/references-sources.yaml) distingue constats et exemples attribués des illustrations FLOW.

Interprétation et adaptation éditoriale proposées : choix d’ouverture, tableau nom/périmètre/approche, comparaison entre sources et avec FLOW, cas concret. Bénéfice : permettre aux métiers et PO de comprendre le choix sans connaître les produits. Compromis : synthèse courte, détails et limites de preuve accessibles dans les références. Aucun changement de nom, de responsabilité, de parent, de réalisation installée ou d’accord antérieur ; aucune nouvelle validation de ces correspondances. U477 autorise leur rédaction, pas leur adoption globale. Les anciennes valeurs sont préservées dans la capture antérieure.

### CMP194

U478/U479 — Codex, 19 septembre 2026. `business-references`, backlog courant : ELM483–485 apportent un appui sémantique et de gouvernance au nom proposé Authoritative Data Domain. [Proposition structurée](../modeles/backlog/authoritative-data-review-U478.yaml) : recommandation, alternatives, frontière et exemple du seuil de réassort. Trois comparaisons consignées sur la fiche ; [état précédent](../audits/2026-09-19-authoritative-data-U478/before-business-references.yaml) conservé.

U479 précise la responsabilité locale : les sources d’entreprise restent externes et les référentiels portent ce qui fait foi dans l’univers. Le bénéfice du nom proposé est d’exprimer cette utilité sans classer uniquement les données par nature. Compromis : expliquer Authoritative et préciser l’exclusion des transactions courantes. Le nom n’est pas encore adopté ; nature de groupe, références distinctes, capacités, rattachements et accords inchangés. Porter un paramètre applicable et décider de sa valeur restent deux responsabilités différentes ; l’exemple du seuil propose une frontière sans déplacer sa gestion. Aucun consensus de découpage ni conformité aux référentiels cités affirmé. Les comparaisons antérieures GS1/Microsoft restent documentées dans CMP193 et la capture, mais les inspirations présentées privilégient désormais l’autorité locale.


### CMP195

U481 — Codex, 19 septembre 2026. Cibles : noms des niveaux du modèle courant, MOD008 Universe, MOD006 Capability Behavior et exemple universe-supply → D05 → D05.e → BHV084. ELM486–490 : appuis méthodologiques distincts, sans équivalence globale de catalogue. [Proposition YAML](../modeles/backlog/model-level-naming-U481.yaml) : Domain → Area → Capability → Behavior recommandé ; Domain → Subdomain comme alternative principale, puis Capability Group / Capability Area et limites de Space / Zone.

Bénéfice : nommer les périmètres selon leur responsabilité et rendre les niveaux lisibles. Compromis : Area exige une définition locale ; un comportement n’est pas une sous-capacité automatique. Le nom propre Authoritative Data peut être séparé de son type. Proposition uniquement : aucun nom canonique, identifiant, rattachement, responsabilité, accord ou publication modifié. Groupes de présentation et périmètres de responsabilité restent distingués ; la discussion ne rouvre pas l’audit U431.

Complément U482 — Laurent adopte Authoritative Data et Domain → Area → Capability → Behavior. La montée de Domain et le passage des six anciens domaines en Areas sont appliqués à responsabilités constantes. Cet accord adopte le vocabulaire proposé en CMP195, pas l’ensemble des correspondances externes ni toutes les définitions explicatives. Historique du choix et valeurs antérieures conservés dans [la réalisation U482](../audits/2026-09-19-domain-area-U482/rapport.md).


## CMP196

**Objet :** Order Management D04 comme responsabilité de prise en charge des demandes, distincte des parcours qui les satisfont ; discussion U485, 19 septembre 2026. **Éléments :** ELM011 (MKT10), ELM491–492 (MKT19), ELM493 (MKT71), ELM494 (MKT72). **Relations :** recouvrement partiel TM Forum ; appuis conceptuels CMMN, artifacts et processus centrés sur les objets.

TMFC002/TMFC003 documentent une séparation proche entre capture/validation et orchestration ; elle réfute une absence générale de distinction dans le marché sans démontrer un équivalent exact à D04. CMMN éclaire le dossier mais inclut son plan de traitement. Les business artifacts éclairent données et cycle de vie ; l’approche object-centric explique les correspondances multiples entre dossiers et parcours. Catalogues, types de demandes et dossiers concrets restent distincts.

**Recommandation proposée par Codex :** conserver l’Area pour la responsabilité métier de tenir le sens, les règles d’évolution et le reste à satisfaire des demandes. La liste des familles d’Orders donne une lecture des prises en charge offertes, pas la liste exhaustive des processus ou de tous les services. D07.b reste dans D06 ; D14 décrit l’offre des exécutants. **Limites :** références télécom, notation et travaux scientifiques ; aucune équivalence globale, conformité, adoption de moteur ou couverture installée déduite. Aucune absence de marché ou innovation revendiquée.

[Proposition structurée, différences et sources](../modeles/backlog/order-management-positioning-U485.yaml). Statut proposé ; aucun changement du nom, des parents, des capacités ni de la publication courante.


**Précision U486 de CMP196 :** Laurent met l’accent sur la fonction d’activation du domaine : les familles d’Orders expriment ce que l’on peut lui demander, donc une lecture de son offre de services. TMFC007, décrit comme point d’entrée du domaine Production, constitue un appui direct à cette intuition. L’interprétation proposée distingue type de prise en charge, demande concrète et parcours de réalisation ; elle conserve le sens de l’offre rendu par le Domain, distinct des prestations d’exécutants D14. Ce point enrichit la recommandation U485 sans adopter les frontières télécom ni modifier D04.


## CMP197

**Objet :** nom de D04 après objection U487 au terme Management et clarification U488 des Backing Services. **Sources :** ELM364/MKT20 (lecture complémentaire Oracle 25C) et ELM491/MKT19 (TMFC002 relu) ; URL, éditions et localisateurs dans [la proposition](../modeles/backlog/order-management-positioning-U485.yaml). Consultation : 19 septembre 2026. Auteur : Codex. Statut : proposé.

**Comparaison :** Supply Request nomme chez Oracle une sollicitation de création d’approvisionnement ; D04 couvre un ensemble plus large de demandes, dont ventes et retours. TMFC002 distingue la responsabilité de capture/validation de la livraison, mais conserve aussi une clôture commerciale : un titre de composant ne décrit pas toute sa frontière. Ces appuis lexicaux et fonctionnels ne prouvent aucun nom de marché exactement équivalent aux neuf capacités de D04.

**Recommandation :** nommer l’Area par les demandes qu’elle porte. Supply Requests privilégie leur fonction d’activation ; Orders conserve plus simplement le vocabulaire courant. Book évoque surtout le carnet ; Intake/Capture met trop l’accent sur l’entrée. Lifecycle/Governance ne résout pas complètement l’intention recherchée. L’emploi proposé de Supply Requests pour cette Area reste un choix local explicité, sans revendication de standard ou d’innovation. Aucun renommage appliqué. U488 confirme séparément Service Catalog comme catalogue des Backing Services mobilisés par l’orchestration.


**Précision U489 de CMP197 :** préférence utilisateur pour Service Order inspiré de TM Forum, sans Management. Service Orders au pluriel devient la recommandation de nom pour D04. Le rôle d’entrée du domaine TMFC007 et la notion de demande de service TMF641 sont proches de l’intention FLOW, tandis que l’orchestration incluse dans TMFC007 reste distincte dans notre modèle. TER066 et D07.b utilisent déjà Service Order pour les demandes aux exécutants ; Backing Service Orders est proposé pour qualifier ce second usage, sans assimilation à une appellation TM Forum. Aucun renommage, transfert de responsabilité ni objet universel adopté. D14 conserve le rôle de catalogue des Backing Services confirmé U488.


## CMP198

**Objet :** U490, demandes internes de pilotage et parcours d’optimisation Supply ; hypothèse d’extension de la piste Service Orders. Auteur : Codex, 19 septembre 2026 ; statut proposé. **Sources primaires reconsultées :** ELM287/MKT13, [SAP Explaining Supply Assignment](https://learning.sap.com/courses/exploring-fashion-functions-and-business-processes-in-sap-s-4hana-for-fashion-and-vertical-business/explaining-supply-assignment_af05618d-4954-4f22-9857-3dd12e3940c4), scénarios, statuts, modes Normal/Preview/Simulation ; ELM357/MKT20, [Oracle Key Actions on Orders 25D](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faubm/key-actions-on-orders.html), Plan Run, Review, Simulation, Release Actions. SAP Help Compare Supply Assignment Runs a aussi été trouvé par index, mais son ouverture directe ne renvoie aucun texte ; la preuve principale SAP reste le cours ouvert.

**Points communs :** analyser la situation, comparer des résultats et distinguer simulation et mise en application. **Différences :** fonctions produit et modes d’exécution ; aucune preuve qu’un dossier universel de demande interne soit imposé. Les effets de blocage de l’ARun SAP ne sont pas transférés à Supply Assignment FLOW (U436) ; la release Oracle transmet des résultats à Order Management, sans identité avec l’activation d’affectations.

**Interprétation proposée :** une opération d’optimisation durable peut justifier sa propre demande traçable : objectif, périmètre, alternatives, autorisation et résultat. Dans FLOW, Order Backlog Planning construit les scénarios, Fulfillment Plan Decision arbitre et Supply Assignment matérialise. Origine interne/externe et intention métier restent deux axes. Le dossier, son rattachement et la coordination éventuelle sont à définir ; aucun déplacement dans D04/D06 ni quatre comportements créés automatiquement. [Portée, exemple, options et limites](../modeles/backlog/order-management-positioning-U485.yaml).


**Correction de lecture U491 de CMP198 :** l’optimisation du carnet évoquée par Laurent est une réaction à son état ou à un événement de promesse non tenable, pas une sollicitation du commerce. Le déclencheur doit rester distinct du dossier éventuel de traitement. SAP/Oracle étayent les parcours d’analyse, simulation et mise en application ; ils ne sont pas invoqués comme preuve d’un Order interne obligatoire ni d’un mécanisme universel événement → Case. La distinction métier sollicitations explicites / réactions du domaine est consignée comme direction locale, sans changement canonique.


## CMP199

U492–U495 — Codex, 19 septembre 2026. Cibles : proposition de périmètre de D04 et parcours d’optimisation D03.p / D03.o / D02.e, backlog courant non modifié. Éléments ELM495–498 ; appuis fonctionnels et sémantiques, recouvrements partiels. Statut proposé ; aucun accord global ou rattachement adopté.

**Constats consultés :** SAP/Oracle réévaluent des engagements ou affectations lorsque la disponibilité change ; l’événementiel est explicite dans SAP APO EDQA, à distinguer des modes manuels/planifiés aATP et Backlog Management. Oracle documente une réaction automatique back-to-back, avec exception et arbitrage manuel si nécessaire. Salesforce documente des demandes internes suivies, et distingue la demande de son traitement. Le parcours backoffice du changement d’adresse n’est pas la preuve du cas exact de fraude.

**Correction de l’interprétation CMP198 :** U494/U495 montrent qu’une réaction peut donner naissance à une demande interne. Une demande ne suppose ni client ni commerce initiateur. L’exemple détection de fraude → vérification d’identité est attribué à Laurent. Origine, déclencheur, finalité, dossier et traitement restent distincts ; l’absence d’Order obligatoire dans un produit n’interdit pas une prise en charge structurée dans FLOW.

**Recommandation :** étudier une Area portant les familles de demandes de travail du Domain, y compris celles issues de réactions internes ; ne pas la découper selon l’organisation frontoffice/backoffice. Bénéfice : rendre visibles offre, résultat attendu et progression. Compromis : justifier les types supplémentaires, leur cycle propre et leurs liens, sans déplacer les responsabilités d’optimisation ni imposer un dossier pour chaque calcul. Service Orders reste la préférence U489 à éprouver ; Service Requests est une alternative de marché, pas un renommage décidé. [Sources, éditions, limites et analogie Supply](../modeles/backlog/order-management-positioning-U485.yaml).


## CMP200

U496/U497 — Codex, 19 septembre 2026. Cibles : D04, D14, D14.a, D07.b, TER066 et TER075 du backlog courant. Accord sur Service Requests et les demandes internes réactives, complété explicitement par le volet Backing Services. Les comparaisons gardent leur statut proposé ; l’accord porte sur le vocabulaire et l’intention présentés.

D04 expose Salesforce Service Request (ELM498), TM Forum Service Order (ELM131) et Oracle Backlog Management (ELM496) : appui lexical, fonction d’activation et parcours de traitement distincts. Ces sources ne constituent pas un découpage commun obligatoire. Les anciennes inspirations limitées aux familles de commandes sont conservées dans la capture antérieure et remplacées sur la fiche par la comparaison au nouveau périmètre.

D14 et D14.a gardent Service Catalog et Service Catalog Ingestion et explicitent l’offre de Backing Services. D07.b devient Backing Service Orders, TER066 Backing Service Order et TER075 Backing Service ; le qualificatif Backing est un choix local pour préciser le rôle auprès de l’orchestration, sans l’attribuer à TM Forum, Microsoft ou Camunda. Les sources métier déjà consultées restent pertinentes pour le périmètre de prestation, inchangé ; noms natifs, limites et distinction catalogue/demande/réalisation sont conservés.

Bénéfice : distinguer le travail pris en charge par le Domain des prestations nécessaires à sa réalisation, y compris lorsqu’il réagit à une situation interne. Compromis : définir ultérieurement les types supplémentaires de demandes internes et leurs règles propres, sans inventer un cycle universel. [Accord et limites](../modeles/backlog/order-management-positioning-U485.yaml), [état précédent](../audits/2026-09-19-service-requests-U496/before-records.yaml).


## CMP201

U499/U500 — Codex, 19 septembre 2026. Proposition de capacité Order Backlog Optimization Request sous Service Requests, avec comportements de déclenchement et d’activité, et indicateurs d’origine. Comparaison fonctionnelle partielle aux éléments ELM246/495/496 ; appui des demandes internes Salesforce ELM498 déjà consulté. Cible : proposition uniquement ; modèle canonique et publication inchangés.

Oracle distingue le lancement manuel ou programmé et les activités de planification, examen, simulation puis publication. SAP APO EDQA documente une réaction événementielle avec sélection et règles métier. Ces textes étayent les deux angles proposés, sans prescrire une demande universelle, une taxonomie de comportements ou une approbation humaine systématique. Le nom Order Backlog Optimization Request reste une construction locale à partir du vocabulaire du domaine.

U397/U398 imposent de rendre les comportements métier de la demande lisibles même lorsqu’ils mobilisent d’autres capacités : ne pas les rejeter pour cause de mutualisation. Les candidats distinguent réexamen réactif, récurrent ou demandé ; simulation et analyse ; autorisation ; activation suivie. Ils restent à arbitrer au regard de MOD006/U265, au même niveau terminal, avec justification individuelle ; aucune étape ou opération ne devient automatiquement un comportement. Planning, décision et application des affectations conservent leurs responsabilités.

U500 définit Frontoffice par rapport à l’extérieur du Domain et Backoffice par rapport à son intérieur. Proposition de deux indicateurs non exclusifs, conformément à U492 sur Transfer Order ; distinguer origine de la demande, provenance de l’événement, mode de déclenchement et activité. Une demande interne peut être créée en réponse à un événement fournisseur externe. Bénéfice : lire l’offre de prise en charge sans la confondre avec l’organisation ou l’interface ; limite : qualification famille par famille, sans inventer les origines non étudiées.

[Proposition, justifications, exemples et sources](../modeles/backlog/internal-service-requests-U499.yaml). Aucun nouvel identifiant canonique, comportement, type ou classement global adopté par cette étude.


## CMP202

U501 — Codex, 19 septembre 2026. Accord appliqué : D04.s Order Backlog Optimization Request, Backoffice, sous Service Requests ; six comportements terminaux BHV088–093 avec angles de lecture Déclenchement et Activité. Transfer Order D04.k porte Frontoffice et Backoffice conformément à U492/U501. Les origines ne reclassent pas la nature des capacités et ne se déduisent pas de l’origine de l’événement.

Les inspirations de chaque nouvelle fiche sont exposées dans le modèle avec deux documents primaires distincts. ELM498/496 étayent la demande interne et le réexamen du carnet ; ELM495/496 la réaction à une situation Supply ; ELM246/496 les revues programmées ; ELM246/357 les études demandées ; ELM357/287 la simulation et son examen ; ELM498/496 l’autorisation et la séparation proposition/application ; ELM357/497 la mise en application et son suivi. Les rapprochements restent partiels et proposés, même lorsque le sens du comportement est adopté.

Le bénéfice du découpage est de rendre visibles le motif de prise en charge, l’exploration, l’autorisation et le résultat. Les modes Oracle, les effets SAP et les parcours Salesforce éclairent ces choix, sans fournir une taxonomie universelle ni une preuve de réalisation Beaumanoir. Les exemples construits sont attribués à FLOW. L’autorisation ne présume pas de décision humaine obligatoire ; la release Oracle n’équivaut pas à une affectation ni à une réservation. Les noms anglais non présentés et les descriptions développées gardent une qualification éditoriale.

Trois relations racontent les coopérations avec Order Backlog Planning, Fulfillment Plan Decision et Supply Assignment ; leurs extrémités sont adoptées U501, leurs conditions et effets détaillés sont rédigés comme compléments. [Portée de l’accord](../modeles/backlog/internal-service-requests-U499.yaml), [capture et changements](../audits/2026-09-19-internal-request-U501/changes.yaml). Aucun autre type de demande créé, aucune classification globale, publication ou réouverture de l’audit U431.


## CMP203

U505/U506 — Party / Role D09, ingestion D09.d et termes Party/Role TER046/047. Rédaction et correspondances proposées, noms et accords antérieurs conservés. Sources ELM499–507, MKT13/57/67/74/75 ; Oracle Customer Import 25D ELM344 reconsulté pour l’ingestion. Éditions, passages et limites : [relevé U505](../audits/2026-09-19-party-reference-U505/consulted-documents.yaml).

SAP Business Partner et ses rôles client/fournisseur donnent un appui métier direct. Informatica documente historiquement Party Role puis Party, personne ou organisation : passages primaires indexés, pas affirmation du schéma SaaS actuel. OMG Party/PartyRole et FIBO ContractParty expliquent identité, rôle et contexte contractuel. Fowler confirme le patron, mais Party y inclut aussi des équipes informelles. Le périmètre FLOW des personnes physiques et morales est donc une frontière locale explicite, pas le sens universel du mot Party. LegalPerson chez FIBO n’équivaut pas automatiquement à personne morale.

La fiche commence par le service rendu : savoir qui participe aux accords et opérations et à quel titre. Agreement conserve conditions et engagements ; les maîtres externes portent l’identité d’entreprise. GS1 Party/Location est retiré des inspirations actives de D09 et TER046, conformément à U505 ; preuves et comparaisons historiques conservées. Pas de contrôle juridique, IAM ou maîtrise MDM ajouté. La lecture des rôles de référence reste distincte de leur attribution à un accord particulier.

Nom recommandé à ce stade : conserver Party / Role ; Party est une alternative plus courte, Business Partner un terme SAP établi, Person seul ambigu en anglais. Aucun renommage adopté. Le passage d’Authoritative Data de groupe à Area est proposé pour exprimer sa responsabilité locale, sans fusion des six sujets ni modification structurelle appliquée. [Analyse et options](../modeles/backlog/party-reference-review-U505.yaml).


## CMP204

U505, dans la continuité d’U134 — six propositions de capacités de connaissance : D08.e Product Reference Visibility, D09.e Party / Role Visibility, D11.b Agreement Visibility, D12.b Catalog Visibility, D13.b Fulfillment Network Visibility, D14.b Service Catalog Visibility. Statut ai_proposed, aucun champ adopté ; chaque capacité est reliée explicitement à son référentiel actuel.

La responsabilité commune est de rendre la référence locale retrouvable et compréhensible. La recherche, les filtres et la navigation sont des modalités de consultation, pas des comportements créés mécaniquement. Visibility est un nom FLOW cohérent avec ses capacités de connaissance existantes ; les éditeurs emploient surtout Search, Display, Profile ou accès au catalogue. Leur fonction de consultation soutient la proposition, sans imposer un catalogue de capacités.

Paires primaires : ELM423/508 pour les produits ; ELM499/507 pour les personnes et rôles ; ELM426/509 pour les accords ; ELM391/510 pour les catalogues ; ELM511/512 pour les lieux et structures ; ELM513/514 pour les services. Deux documents Microsoft ne constituent pas un consensus pour Catalog. Les sources de lieux ne prouvent pas la couverture de toutes les liaisons Supply : celle-ci est une adaptation à D13. ServiceNow ne fournit qu’une analogie de consultation ; le périmètre Backing Services est rapproché de TM Forum et reste distinct des Service Requests.

L’ingestion intègre les évolutions ; Visibility permet de connaître la référence disponible. Origine et validité ne sont exposées que lorsqu’elles sont connues ; aucune disponibilité temps réel ni administration du maître n’est ajoutée. Lecture des contrats distincte du calcul de consommation, lecture du réseau distincte du stock et de la charge, lecture des services distincte de la disponibilité ou de la promesse individuelle. Aucun nouveau comportement, flux métier, système maître ni donnée installée inventé.

[Sources et limites](../audits/2026-09-19-party-reference-U505/consulted-documents.yaml), [proposition et portée](../modeles/backlog/party-reference-review-U505.yaml).


**Adoption U507 de la proposition CMP203/CMP204 — 19 septembre 2026 :** Laurent confirme Party / Role et sa définition restituée, les six capacités Visibility de connaissance ainsi qu’Authoritative Data comme Area de Supply Chain Orchestration. L’Area présente les six référentiels distincts, dont les capacités gardent leur parent. Les sources et différences documentées restent les appuis de la proposition ; l’accord n’en fait pas un consensus ni une équivalence de taxonomies. Les descriptions détaillées et comparaisons non présentées restent éditoriales. Les accords de champs sont enregistrés dans decision-intents.yaml ; kind group → area est tracé dans l’annexe U505, adoption_U507, sans champ artificiel ni mutation des preuves historiques.


## CMP205

U508 — Codex, 19 septembre 2026. Clarification proposée de Catalog D12, Agreement D11 et de la notion Assortment ; pas de modification canonique. Sources primaires SAP ELM515 (complément d’ELM094), Microsoft ELM516/391 et Oracle ELM345, effectivement consultées ; [éditions, passages et limites](../modeles/backlog/catalog-assortment-review-U508.yaml).

D12 porte aujourd’hui une offre de produits, distincte de l’identité produit D08 et des Backing Services D14 ; Product Catalog est une piste de nom plus explicite, non adoptée. SAP et Microsoft définissent l’assortiment par la sélection de produits, ses destinataires et sa validité. Microsoft distingue catalogue et assortiment, tout en ciblant aussi les catalogues B2B par clientèle et période : leur frontière ne repose pas sur un seul attribut.

L’intuition de Laurent convient à un assortiment négocié : Agreement peut en conserver la référence ou la version convenue avec les conditions contractuelles. Elle ne justifie pas de composer tout Agreement par Contract et Assortment. Les accords Oracle peuvent détailler les articles ou porter seulement des conditions ; leurs lignes ne sont pas pour autant un Assortment natif. L’assortiment interne de magasins peut avoir une existence indépendante.

Recommandation : notion Assortment distincte dans Authoritative Data si le besoin porte aussi sur les sélections par réseau/canal ; rattachement à Agreement pour le périmètre effectivement convenu. Alternative compacte Catalog and Assortment à discuter, sans fusion implicite. Bénéfice : préserver l’applicabilité et les évolutions de la sélection sans inventer de contrat pour chaque choix interne. Compromis : identité, version et responsabilité exactes à décider. Supply reçoit et consulte la référence externe ; ni conception commerciale, ni disponibilité physique, ni entité Information ou capacité ajoutées.


## CMP206

U509 — Codex, 19 septembre 2026. Accord appliqué sur Product Catalog (D12), Assortment distinct (D16, TER087) dans Authoritative Data et relation qualifiée Agreement → Assortment quand la sélection est convenue. Aucun lien de composition, contrat automatique ou promesse de disponibilité déduit. Les identifiants D12/D12.a/D12.b sont conservés ; le qualificatif Product est répercuté dans les intitulés et TER049.

D16 est rapproché de SAP ELM515 et Microsoft ELM516 : sélection, destinataires et périodes. D16.a, proposition d’ingestion, s’appuie sur la diffusion complète/différentielle SAP ELM517 et la préparation/réplication Microsoft ELM516 ; les mécanismes natifs et l’administration restent exclus. D16.b, proposition de visibilité, s’appuie sur l’affichage des articles listés SAP ELM515 et des versions de listes ELM517 ; même éditeur, pas consensus revendiqué. L’exemple 100/30/12 reste une illustration FLOW.

Agreement ajoute la frontière éclairée par Oracle ELM345 : accord avec ou sans détail des produits ; aucun Assortment natif Oracle déduit des lignes contractuelles. Les sources de D12 sur l’offre demeurent pertinentes ; son nom devient explicite sans devenir un référentiel maître produit. Relation et sélection conservées distinctes dans le glossaire. Les capacités et détails nouveaux non présentés restent proposés ; pas d’extension au Domain Commerce ni au catalogue Information. [Portée de l’accord et sources](../modeles/backlog/catalog-assortment-review-U508.yaml).


## CMP207

U511–U513 — Codex, 21 septembre 2026. Audit landscape de l’Area Authoritative Data `business-references`, sept sujets et quatorze capacités du backlog au commit 5957a17756d7def41be9a599e7de293245cceebc. [Rapport](../audits/2026-09-21-authoritative-data-landscape-U512/rapport.md), [options](../modeles/backlog/authoritative-data-landscape-U512.yaml), relevés ELM518–527 et relectures ELM484/485/259/515/391/513.

Recouvrements partiels avec Microsoft IOM, Fluent Order Management et IBM Sterling : références reçues et données d’orchestration distinguées, avec des possibilités d’administration locale. Microsoft étaye certains parcours sans catalogue maître local obligatoire. Les sources ne prescrivent pas sept référentiels ni quatorze capacités. Catalogue produit d’un OMS, offre commerciale FLOW et assortiment ne sont pas automatiquement équivalents. Les exemples de services transporteurs ne démontrent pas un catalogue générique de Backing Services.

Interprétation FLOW : préserver les différences de sens ; justifier la granularité par résultat métier et responsabilité, pas seulement cycle de vie amont ou format de données. Deux responsabilités communes et sept sujets constituent une option de lecture landscape, sans fusion ni déplacement adopté. Les 28 liens ciblant les Ingestion demandent une requalification de leur service rendu avant modification.

Authoritative Data reste étayé par Oracle/EDM Council ; U513 questionne sa lisibilité client. Supply Reference Data est une alternative éditoriale contextualisée, non un standard OMS établi ; le sens étroit de Reference Data reste une réserve. Backing Service Catalog précise FLOW, sans antériorité d’adoption retrouvée ni consensus de marché inventé. DMN sépare entrées et logique de décision ; il ne dicte ni stockage ni taxonomie. Aucun nouvel accord, choix logiciel, extension au catalogue Information ou publication.


## CMP208

U514 — Codex, 21 septembre 2026. Proposition de trois capacités Ingestion, Visibility et Core Data, avec décomposition par datasource/vue/storage. [Analyse](../modeles/backlog/authoritative-data-structure-U514.yaml). Appuis méthodologiques ELM528 (Microsoft CQRS, lecture/écriture indépendantes du nombre de stockages) et ELM484 (Oracle Consolidated Hub, sources amont conservant leur maîtrise). Ni carte de capacités ni nom Core Data standard déduits.

Interprétation FLOW : trois résultats distincts peuvent justifier trois capacités. Une source métier peut différencier la réception ; une vue peut différencier la connaissance fournie. Les Behaviors exigent un bénéfice ou une complexité propre U265/MOD006, pas une application, un écran ou une base par défaut. Core Data a un sens métier s’il maintient la référence locale applicable ; son chevauchement avec les Ingestion actuelles doit être résolu. Une vue peut croiser les sept sujets, sans symétrie 7 × 3. Options, exemples et noms restent proposés ; aucune restructuration, administration des maîtres ou adoption de mécanisme de qualité.


## CMP209

U515 — Codex, 21 septembre 2026. Précision de la structure Ingestion / Core Data / Visibility : domaines sources, stockage, besoins des capacités consommatrices Supply. C110 corrige l’élargissement antérieur des axes. [Analyse actualisée](../modeles/backlog/authoritative-data-structure-U514.yaml).

ELM529 (Microsoft Materialized View) étaye la combinaison de données de plusieurs stockages selon les besoins de requête ; ELM528 (Microsoft CQRS) étaye la séparation logique de lecture/écriture indépendamment des stockages physiques. Deux documents du même organisme, pas consensus interéditeurs. Ces patrons n’imposent ni la tripartition métier FLOW ni des vues matérialisées.

Lecture proposée : sources, ensembles stockés et vues peuvent avoir des correspondances plusieurs-à-plusieurs ; les sept sujets actuels ne fixent aucun nombre par axe. Core Data conserve le sens de stockage donné par Laurent ; son assimilation à des Behaviors métier reste une question de représentation, sans lui ajouter une gouvernance ou un cycle de vie maître.


## CMP210

U516 — Codex, 21 septembre 2026. [Analyse Core Data, Price Book et domaines sources](../modeles/backlog/core-data-price-books-sources-U516.yaml). Les sept sujets actuels constituent un point de départ plausible pour les ensembles conservés par Core Data ; aucun déplacement canonique ni stockage physique imposé.

Salesforce B2C Commerce ELM530 distingue Price Books et prix applicable ; Microsoft Sales ELM531/532 distingue Price Lists, leurs lignes et le calcul transactionnel. Price Book / Price List : noms attestés de produits, sans terme universel imposé. Proposition FLOW : sujet tarifaire autonome si identité et réutilisation propres ; préciser les prix déjà portés par D12/TER049 et les conditions D11/TER048. Offre, tarif, accord et prix appliqué demeurent distincts ; Q072 reste ouverte. Aucune administration de promotions, hiérarchie de tarifs ou obligation d’une liste dans tous les parcours déduite.

Oracle Product Development ELM533 étaye Design comme source de caractéristiques de conception, sans maître produit exclusif. SAP ELM534 et Microsoft ELM535 étayent une responsabilité Procurement/Sourcing pour références fournisseurs et conditions d’achat, si elle est externe et distincte de Commerce dans le découpage retenu. Les trois sources proposées par Laurent (Commerce, Design, Logistics) ne sont pas assimilées aux produits qui les réalisent. Party/Role, points du réseau et services peuvent recevoir des apports de plusieurs domaines ; sources exactes ouvertes. Finance demeure une piste conditionnelle sans preuve de besoin supplémentaire ni création d’un sujet de données. Aucun flux Beaumanoir, Domain Commerce, Behavior ou nouvelle capacité créé.


## CMP211

U517 — Codex, 21 septembre 2026. Contrôle de gestion ajouté aux sources possibles indiquées par Laurent, pour des règles de blacklist client/fournisseur. [Analyse](../modeles/backlog/core-data-price-books-sources-U516.yaml), complément U517. L’apport identifie une responsabilité possible ; il ne prouve pas un flux existant ni une propriété organisationnelle universelle.

Microsoft Finance ELM536 distingue règles/exclusions et mise en attente d’une commande ; Microsoft SCM ELM537 distingue les restrictions fournisseur par opérations. Recouvrements partiels : ces mécanismes éclairent la portée d’une restriction, sans ramener toute blacklist au crédit ni importer leurs effets dans FLOW. Deux documents du même éditeur ne démontrent pas de consensus.

Proposition Core Data ciblée : restrictions associées aux tiers, reliées à Party / Role et distinctes de l’identité. Règle reçue, liste/statut déjà évalué et application par les capacités Supply restent séparés. Visibilité de la portée reçue ; autorité d’évaluation et conséquences à préciser. Aucun catalogue général de politiques, moteur de décision ou Behavior ajouté automatiquement.


**Accord U518 — 21 septembre 2026 :** Party Restrictions est retenu comme ressource de Core Data dans la structure de travail. Le nom et le rattachement sont tracés champ par champ dans adoption_U518 de l’annexe, avec empreintes. Les rapprochements ELM536/537 restent proposés à leur portée ; leurs règles et effets natifs ne sont pas adoptés. Définition détaillée, stockage, application Supply et autres ressources ne reçoivent pas de validation globale.


## CMP212

U519–U520 — Codex, 21 septembre 2026. [Analyse marché de Visibility au niveau capacité](../audits/2026-09-21-authoritative-views-U519/rapport.md) ; [proposition](../modeles/backlog/authoritative-data-views-U519.yaml). État comparé : backlog inchangé, empreinte dans l’annexe. Analyse proposée, aucun accord canonique nouveau.

Dix-huit documents primaires de cinq éditeurs consultés ; dix nouveaux éléments et huit éléments réexaminés, détaillés dans [l’index](../audits/2026-09-21-authoritative-views-U519/source-index.yaml). Fluent, Microsoft IOM, IBM Sterling, Oracle et SAP documentent des consommations croisant plusieurs sujets de référence pour l’orchestration, la promesse, l’approvisionnement, la planification et les retours. Recouvrement partiel de besoins consommateurs ; aucune taxonomie de vues commune ni équivalence de capacités démontrée.

Proposition FLOW : Visibility rend les références consultables sous une forme adaptée aux capacités Supply. Elle est distincte d’Ingestion par domaines sources et de Core Data par ensembles conservés. Elle peut rapprocher plusieurs sujets ; les états opérationnels, décisions et actions restent portés par les capacités responsables. Bénéfice : indépendance entre sources, stockage et lectures utiles. Compromis : expliciter les besoins consommateurs sans faire de chaque donnée ou fonction produit une capacité.

U520 recentre la restitution sur le service rendu, les frontières et les grands besoins des Areas consommatrices. Les regroupements exploratoires de vues restent des matériaux internes, sans catalogue détaillé, nouveaux Behaviors, champs ou règles à adopter. Les preuves logistiques sont plus complètes que celles des services humains/numériques ; aucune installation Beaumanoir inférée. Modèle canonique, catalogue Information et accord U518 préservés.


**Complément U521 :** la synthèse au niveau capacité et les appuis ELM538/ELM542 sont portés sur la fiche canonique Authoritative Data, dans market_inspiration et market_comparisons. Les liens, versions, passages, similarités et différences sont ainsi embarquables dans une prochaine publication. Aucun découpage ou accord supplémentaire adopté.


## CMP213

U522–U524 — Codex, 21 septembre 2026. [Comparaison Oracle/Fluent portée par Visibility](../audits/2026-09-21-authoritative-views-U519/comparaison-oracle-fluent-U522.md), [preuves et matrice](../modeles/backlog/visibility-oracle-fluent-U522.yaml). Les correspondances sont proposées à la maille du besoin consommateur ; fonctions natives et vues FLOW ne sont pas équivalentes.

Oracle Order Management et Global Order Promising 26B étayent les contextes de demande, approvisionnement, réseau, retour et bases économiques. ELM548–550 complètent les preuves. Fluent ELM541/542/543/545 étaye demande, réseau/fulfillment et qualification du retour ; un contexte de coûts comparable n’est pas établi. Cela ne prouve pas l’absence de fonction du produit.

U523 exige le rattachement à la capacité Visibility : sa fiche de travail porte market_inspiration, market_comparisons et la matrice de lecture. U524 retient Fluent Sourcing → FLOW Network. La couverture ERP complète d’Oracle explique des vues supplémentaires ; PLAN est exclu. Inventory Planning Context est retiré de la proposition active et ELM371 ne sert plus à le justifier. Ancienne matrice conservée en historique ; C111 précise la correction. La portée sur les capacités canoniques de planification et décisions de réassort reste à clarifier.

Aucun nouveau Behavior, détail de règle, nom de vue ou refonte adopté. Consignation champ par champ du rattachement et du cadrage U523/U524 dans l’annexe ; aucun identifiant canonique artificiel. Modèle canonique inchangé à cette étape, aucune publication.


**Précision U525 / Q078 :** Laurent laisse la frontière PLAN/orchestration ouverte. Inventory Planning Context demeure en attente, sans exclusion définitive ni suppression de capacités. Les correspondances Fluent Sourcing → Network FLOW, cible Visibility et couverture ERP plus large d’Oracle restent conservées ; les champs de périmètre U524 sont qualifiés par cette réserve, avec historique intact.


## CMP214

U526–U527 — Codex, 21 septembre 2026. [Area Supply Planning et nom du Domain](../modeles/backlog/supply-planning-area-review-U526.yaml). État comparé : backlog dont l'empreinte est conservée dans l'annexe ; proposition landscape, non adoptée. Cibles : proposition d'Area et nom/périmètre de Supply Chain Orchestration, pas refonte automatique des capacités.

SAP ELM552 étaye construction de plans, scénarios et réponse aux impondérables ; Oracle ELM294 distingue un émetteur Supply Planning et un composant d'orchestration gérant les changements. Recouvrements partiels et appuis méthodologiques : distinguer responsabilités sans isoler la planification des faits opérationnels. ASCM ELM326/465 apporte un appui de processus à Plan ; extraits indexés seulement, et hiérarchie propre à SCOR conservée.

Kinaxis ELM551 emploie orchestration de la planification stratégique à l'exécution, tandis qu'Oracle ELM294 nomme ainsi un composant plus étroit. Appuis sémantiques au niveau du Domain : le nom Supply Chain Orchestration reste défendable avec une portée explicitée, sans consensus universel de périmètre ni importation du périmètre complet des offres.

Recommandation Codex : examiner une Area Supply Planning pour la cohérence des plans et conserver adaptation, décisions et engagements dans les Areas opérationnelles responsables. La planification adapte également ses plans si les équilibres changent. Inventory Planning est un candidat ; Order Backlog Planning reste à arbitrer. Aucun transfert fondé sur le seul mot Planning/Plan, aucun regroupement systématique de l'analytics. Bénéfice : responsabilité lisible des plans ; compromis : éviter doublons de décisions et centralisation des ajustements.

U527 demande le terme impondérable pour la formulation FLOW. Q078 reste ouverte ; Inventory Planning Context dans Visibility demeure en attente. La proposition conserve des market_comparisons distinctes aux niveaux Area et Domain pour une éventuelle intégration après arbitrage. Aucun changement canonique, adoption globale ou publication.


**Précision U528 à CMP214 :** Order Backlog Planning est clairement opérationnel selon Laurent ; cette capacité reste dans Fulfillment Optimization et sort des candidates à Supply Planning. Inventory Planning demeure à examiner. L'hypothèse antérieure est conservée dans l'annexe sans rester une alternative active pour Order Backlog Planning. Les appuis SAP/Oracle conservent leur portée : plans, scénarios et adaptation ne définissent pas à eux seuls une frontière d'Area. Aucun éditeur n'est invoqué pour imposer un déplacement ; contenu de l'Area envisagée et nom du Domain restent proposés.


**Précision U529 à CMP214 :** Laurent retient l'approche du plan d'ensemble régulièrement mis à jour, sans le définir par le début de saison, et propose le réassort dans l'opérationnel. SAP ELM552 étaye une planification liée aux faits et changements à court terme ; Oracle ELM294 illustre l'adaptation des approvisionnements en cours. Ces sources soutiennent la coopération, sans prescrire le rattachement FLOW de Replenishment Decision. Cohérence interne : Inventory Target Decision détermine les objectifs ; Replenishment Decision détermine les apports et leurs ajustements ; Planning les mobilise. La portée du résultat, plutôt que la cadence, constitue le critère proposé. Inventory Planning reste à examiner et l'Area n'est pas créée.


## CMP215

U530 — Codex, 21 septembre 2026. Laurent retient la planification comme Area dans Supply Chain Orchestration et qualifie l'émission de demandes d'achat planifiées par MAP de plan d'ensemble. Cibles comparées : Domain universe-supply, nouvelle Area D17 au libellé de travail Supply Planning, et hypothèses Camunda/PLM. [Analyse et état antérieur](../modeles/backlog/supply-planning-area-review-U526.yaml). Accord structurel limité à la relation, descriptions et rapprochements proposés.

SAP ELM552 et Oracle ELM294 étayent planification adaptable et coopération avec les opérations ; comparaisons portées sur D17. Kinaxis ELM551 et Oracle ELM294 éclairent le nom et les différences de portée au niveau du Domain. Nom du Domain conservé. Reprise de CMP214 avec le nouveau périmètre, sans déplacement de capacités ni intégration de tous les processus de planification des éditeurs.

Camunda ELM553/554 : appui de réalisation à une orchestration événementielle mobilisant des décisions ; la logique métier doit être fournie pour planifier et replanifier. Aucune preuve d'un optimiseur Supply natif ou d'un recalcul permanent automatique, aucune équivalence avec une Area métier. Proposition FLOW : plans régulièrement révisés et adaptation opérationnelle aux impondérables coopèrent.

Oracle ELM555 distingue innovation/conception, développement et référentiel produit dans une offre plus large. Recouvrement partiel avec la piste PLM : examiner les responsabilités utiles aux lancements et approvisionnements, sans absorber automatiquement conception et cycle de vie produit. La piste n'est pas adoptée. MAP reste une preuve utilisateur U530 ; aucun usage Camunda, PLM précis ou déploiement des offres étudiées n'est inféré chez Beaumanoir.

Order Backlog Planning reste opérationnel selon U528 ; Inventory Planning reste à examiner ; réassort opérationnel proposé selon U529. Les besoins de Visibility liés à l'Area de planification restent à préciser. Aucun détail de Behavior, micro-règle ou extension du catalogue Information.


## CMP216

U531 — Codex, 21 septembre 2026. Cible : étude des responsabilités de D17 et qualification de l'exemple MAP, sans changement des capacités canoniques. [Analyse](../modeles/backlog/supply-planning-area-review-U526.yaml). État : Area de planification retenue U530, capacités à préciser ; statut du rapprochement proposé, pas réalisation éditeur démontrée.

Fait utilisateur : MAP produit des indicateurs de prévision des ventes pour la saison et les saisons à venir, s'alimente des ventes et prépare des demandes d'achat planifiées. Les autres responsabilités U10 ne sont pas retirées. SAP ELM556/ELM552 distingue prévision de demande et plans Supply, avec coopération et signaux opérationnels. Recouvrement partiel : distinguer les résultats prévision, plan et demande d'achat. Limite : l'ajustement court terme SAP ne démontre ni les méthodes ni les horizons de MAP.

Proposition : étudier ces responsabilités dans la planification sans découper les Areas selon les outils. Bénéfice : rendre lisible le passage des ventes observées aux besoins anticipés puis à la préparation des apports. Ce schéma explique les responsabilités, sans inventer une chaîne d'interfaces ou une application automatique chez Beaumanoir. Les prévisions ne deviennent pas des référentiels Core Data. Aucun Behavior, capacité, donnée détaillée ou rattachement PLM adopté.


## CMP217

U532 — Codex, 21 septembre 2026. [Comparaison des deux structures Planning](../modeles/backlog/planning-options-U532.yaml). État comparé : D17 Supply Planning sous Supply Chain Orchestration, empreinte dans l'annexe ; analyse et recommandation proposées, aucun changement canonique ni nouvel accord.

Oracle ELM557 distingue Demand Plan, Supply Plan et plan intégré ; SAP ELM556/552 distingue également les deux responsabilités dans IBP. Appui fonctionnel à une Area Planning avec deux capacités candidates, sans déduire une hiérarchie métier d'une nomenclature produit. Deux capacités constituent une base de travail, pas une couverture exhaustive. Bénéfice : cohérence du plan d'ensemble et coopération des besoins anticipés avec leur couverture ; compromis : préciser responsabilités et décisions mobilisées sans dupliquer les capacités existantes.

SAP ELM559 décrit un S&OP intégrant équilibres demande/Supply et plans financiers avec plusieurs métiers. Appui à l'option d'un pilotage transverse si sa finalité est visée ; ne démontre pas un Domain PLAN standard hébergeant seulement Demand Planning. La participation du commerce ou de la finance à une prévision ne suffit pas à déplacer la capacité hors de Supply. La seconde option exige une responsabilité de plan d'entreprise explicitement définie ; ne pas l'ouvrir automatiquement dans la consolidation Supply actuelle.

Fait U532 : MAP utilise les précommandes B2B reçues tôt dans le processus d'allocation. Oracle ELM558 documente un rapprochement prévisions/commandes ouvertes dans le traitement destiné à Supply Planning. Appui partiel à la cohérence entre anticipation et demandes connues, sans assimiler les précommandes MAP à des commandes fermes ni adopter une règle de consommation. Le terme allocation dans ce fait utilisateur n'est pas requalifié automatiquement en Supply Assignment.

Recommandation Codex : option A à ce stade ; nom d'Area Planning, capacités Demand Planning et Supply Planning proposés uniquement. Order Backlog Planning reste opérationnel, Inventory Planning reste ouvert, aucune capacité ou décision spécialisée transférée. Comparaisons portées dans l'annexe sur les options pertinentes, à reprendre dans les fiches canoniques après arbitrage.


## CMP218

U533 — Codex, 21 septembre 2026. [Audit du modèle avec Planning](../audits/2026-09-21-planning-U533/rapport.md), [matrice et conclusions](../modeles/backlog/planning-model-audit-U533.yaml). Baseline : 56 capacités, dont 16 décisions, 367 relations ; intégration de Planning et de ses deux capacités validée par Laurent. Les recommandations d’audit restent proposées.

Oracle ELM557 et SAP ELM552/556 soutiennent les responsabilités Demand Planning et Supply Planning et leur coopération. Comparaisons consignées dans D17, D17.a et D17.b. Les niveaux Area/Capability ne sont pas déduits des espaces de travail des produits ; l’accord U533 porte sur noms, responsabilités courtes et composition présentés, pas sur les sources ou descriptions développées.

SAP ELM560 étaye des cibles de stock spécialisées utilisées par Supply Planning. Cela soutient la coopération avec Inventory Optimization ; un transfert des décisions vers Planning n’en découle pas. Le cas Inventory Planning demande une frontière explicite entre scénario de stock et plan d’ensemble. Oracle ELM562 distingue entrées, méthodes et résultat de prévision : la responsabilité du choix de demande à retenir reste à expliciter dans FLOW, sans créer une capacité par algorithme.

Oracle ELM561 illustre l’utilisation de ressources planifiées par Promising et leur passage vers des Orders. FLOW n’adopte pas son hypothèse d’admissibilité automatique : scénario, demande planifiée, engagement et ressource réalisée restent distincts. ELM558 rappelle la cohérence entre prévisions et demandes connues, sans fixer les règles des précommandes MAP.

Recommandation : conserver les 16 décisions existantes dans leurs Areas spécialisées ; qualifier les décisions propres au plan de demande et à la couverture d’ensemble avant une éventuelle création dans Planning. Portée du plan, responsabilité du résultat et réutilisation guident le parent ; nom, horizon, cadence ou outil ne suffisent pas. Aucune décision déplacée, pas de réouverture de l’audit des comportements U431, pas de réalisation Beaumanoir inférée.


## CMP219

U534–U536 — Codex, 21 septembre 2026. Complément à [l’audit Planning](../audits/2026-09-21-planning-U533/rapport.md). Cibles : D17.b en réexamen nominal/de périmètre ; rapprochement Assignment Planning avec D03.p/D03.o/D02.e ; aucun déplacement adopté.

ELM564 confirme le sens large de Supply Planning : achats, production et distribution dans SAP. ELM565 atteste Procurement Planning avec une portée propre aux activités et investissements d’achat ; ELM561 documente les planned buy orders Oracle. Cela justifie d’examiner un nom plus ciblé si la responsabilité FLOW se limite aux apports fournisseurs, sans adopter un intitulé sur sa seule ressemblance.

Oracle ELM496/ELM563 documente planification du carnet, simulation avant release et mesures de dates/marges. SAP ELM381 décrit priorisation des ressources limitées et comparaison de simulations d’affectation. Recouvrement fonctionnel fort avec la proposition Assignment Planning ; le libellé exact n’est pas établi comme nom commun du marché. D03.p prépare les scénarios, D03.o détermine le plan collectif, D02.e applique les affectations. Recommandation : clarifier ou éventuellement renommer D03.p après arbitrage, sans créer un doublon ni déplacer ce planning hors de l’opérationnel confirmé U528. U535 vise les ventes, le périmètre actuel couvre le carnet d’Orders ; aucune restriction silencieuse.

Promesse, marge et optimisation du stock ont des appuis partiels (ELM563/381/560). Les sources ne démontrent pas leur optimisation conjointe complète. FLOW porte déjà une valeur multidimensionnelle ; rendre les critères et responsabilités explicites, sans pondération implicite ni revendication d’innovation non prouvée. U536 exige cette qualification pour tous les choix ; la matrice de justification distingue usages établis, adaptations FLOW et points non démontrés. Les noms des décisions propres à Planning restent des propositions méthodologiques à instruire, pas des équivalents éditeurs affirmés.


## CMP220

U537–U538 — Codex, 21 septembre 2026. [Réexamen du principe Planning](../modeles/backlog/plan-application-review-U537.yaml). État comparé : backlog après U533–U536, empreinte dans l’annexe. Principes utilisateur enregistrés ; correspondance proposée et application structurelle ciblée à instruire.

ELM496 relu en 26B et ELM566 documentent la release des résultats dans le parcours de planification Oracle. ELM567 documente configuration des protections et nouvelle planification après leur modification. Appui fonctionnel à la distinction entre application du résultat et configuration consommée. Ni une capacité de configuration indépendante du module Oracle ni une hiérarchie Capability/Behavior ne sont prescrites par ces pages.

Adaptation FLOW : application du plan comme comportement du Planning selon U537 ; Supply Protection extérieure selon U538. Bénéfice : conserver une responsabilité complète du résultat du plan, sans absorber la gouvernance des règles utilisées par plusieurs consommateurs. Compromis : expliciter les coopérations et réexaminer Supply Assignment si sa seule finalité est l’application du plan. Aucun reparentage, renommage ou retrait automatique, aucun consensus interéditeurs ni innovation revendiqué. La généralisation à tous les comportements reste à qualifier. Cette précision remplace toute lecture de CMP219 imposant trois capacités par principe.


## CMP221

U539–U541 — Codex, 21 septembre 2026. [Audit du principe](../modeles/backlog/planning-principle-audit-U540.yaml). État antérieur figé dans la baseline U540 ; changement D02.e capability → behavior, parent D03 → D03.p, et consolidation descriptive de BHV045–047. Niveau comportement demandé U539, parent interprété dans la clarification U541 ; correspondances et détails éditoriaux proposés.

ELM496/566 Oracle documentent planning, simulation et mise en application ; ELM452 SAP étaye le terme Supply Assignment et l’affectation aux ressources présentes ou futures. Recouvrement fonctionnel, pas identité de catalogue : SAP combine notamment des effets sur les usages concurrents que FLOW réserve à Reservation. FLOW place la mise en effet des affectations sous le planning du carnet tout en maintenant décisions, configuration et engagements partenaires. Bénéfice : un responsable lisible du plan et de son application, sans troisième capacité imposée par un triptyque abstrait. Compromis : les trois mécanismes historiques deviennent des modalités descriptives d’un comportement terminal ; preuves et identifiants retirés conservés, sans sous-comportements.

ELM567 distingue protection configurée et calcul ; ELM411 la réservation ; ELM353, relu en 26B, les états d’Order ; ELM330 la coordination continue. Ces appuis justifient de ne pas absorber toute gestion ou orchestration dans Planning. La séparation en capacités FLOW reste une interprétation métier, ni consensus universel ni innovation revendiquée. Les autres Plannings demandent un résultat applicable propre ; aucune décomposition automatique ni requalification générale adoptée.


## CMP222

U542 — Codex, 21 septembre 2026. [Application propre aux autres Plannings](../modeles/backlog/planning-application-options-U542.yaml). État comparé : backlog après U541, empreinte dans l’annexe. Responsabilités et libellés candidats proposés ; aucun comportement créé ni accord déduit de « Premier point ».

Demand Planning : ELM568 documente l’export des données de plan et ELM569 leur consommation comme demande dans un plan Supply. Appui partiel à une publication du résultat. FLOW propose de distinguer demande applicable et scénarios exploratoires ; cette autorité métier ne résulte pas automatiquement d’un export CSV. Demand Plan Publication est un nom proposé, pas un standard prouvé.

Inventory Planning et capacité de couverture : ELM566/570 documentent mise en application manuelle/automatique, nouvelles demandes et révisions. FLOW propose de porter la cohérence de la mise en effet et ses écarts sous le Planning concerné, en laissant la gestion des Orders, la configuration Supply Protection et la coordination aux partenaires. Inventory Plan Application et Supply Plan Application sont des libellés descriptifs proposés. L’application du plan ne prouve ni engagement ferme ni réalisation physique.

Bénéfice : rendre explicite le résultat applicable propre à chaque plan. Compromis : les deux plans de stock/couverture peuvent mobiliser les mêmes Orders ; préciser qui porte chaque action, sans découpage par horizon, fournisseur ou interface ni double demande. Tous les documents sont Oracle : aucun consensus interéditeurs ou innovation revendiqué. Les correspondances sont portées dans l’annexe de proposition et devront accompagner toute intégration dans les fiches canoniques.


## CMP223

U543 — Codex, 21 septembre 2026. [Réexamen d’Inventory Planning par intentions](../modeles/backlog/inventory-planning-intentions-U543.yaml). État comparé : D05.f et décisions D05.a/c/e/g après U542 ; fiche antérieure conservée dans l’annexe. Réserve utilisateur sur nom et agrégation, propositions de remplacement non adoptées.

ELM375 Nextail distingue First Allocation, Replenishment et Store Transfers. ELM450 SAP décrit le planning de réassort ; ELM451 illustre implantation, distributions et rappel de reliquats. ELM369 Oracle documente Inventory Rebalancing, mais l’intègre dans Replenishment Planning. Ces sources étayent plusieurs intentions et leurs interactions ; elles ne donnent pas une hiérarchie commune de capacités.

Proposition : Replenishment Planning, Inventory Rebalancing qualifié Planning, et Initial Stocking Planning comme candidats à examiner à la place de l’agrégat. Le dernier libellé est FLOW, cohérent avec la décision existante ; First/Initial Allocation est le vocabulaire de distribution magasin des sources, distinct de Supply Assignment. Consolidation : appuis seulement partiels, autonomie de Planning à éprouver. Aucun parent, nombre de capacités ou descendants adopté par extension.

Bénéfice : rendre lisible l’intention, le résultat du plan et son application. Compromis : rééquilibrage et réassort peuvent couvrir le même manque ; maintenir leur coordination et éviter deux demandes. Décisions existantes réutilisées, configuration extérieure, pas de capacité générique de coordination recréée sans justification. Ni consensus structurel ni innovation revendiqué. Les comparaisons des candidats sont conservées dans l’annexe pour accompagner une éventuelle intégration.


## CMP224

U544 — Codex, 21 septembre 2026. [Alternative Inventory Optimization Planning](../modeles/backlog/inventory-optimization-planning-option-U544.yaml). D05.f reste en réexamen ; nom et définition candidats non adoptés.

ELM560 SAP et ELM479 RELEX, textes primaires relus, étayent l’équilibre entre service, niveau/positionnement du stock, incertitude et coûts/capital. Cela soutient l’intention d’un stock adapté, sans objectif systématique de remplissage ou de vidage. Le stock peut augmenter ou diminuer selon les choix ; aucune cible constante ou pondération implicite.

Limite : SAP insiste sur les cibles alimentant la planification opérationnelle, déjà couvertes en partie par Inventory Target Decision. Le Planning FLOW proposé coordonne les scénarios et leur application en mobilisant les décisions, sans absorber leurs résultats ou Supply Protection. Inventory Optimization est attesté ; le libellé complet Inventory Optimization Planning n’est pas établi comme standard par ces sources.

Recommandation : retenir cette piste si le résultat est un plan cohérent arbitrant plusieurs ajustements, et non une simple juxtaposition de tâches. Bénéfice : rendre le compromis commun explicite et coordonner réassort et redistribution. Compromis : clarifier ses frontières avec le plan de couverture et les décisions. L’option de capacités par intentions U543 reste pertinente si leurs plans sont autonomes. Aucun renommage, fusion, nouveau parent ou comportement adopté ; ni innovation revendiquée.


**Suite CMP224 — U545 :** nom et définition présentés d’Inventory Optimization Planning intégrés dans D05.f. Comparaisons SAP/RELEX portées dans sa fiche avec les différences et limites ; les appuis Oracle/Microsoft à la pratique des scénarios sont conservés. L’accord contextuel ne transforme pas les rapprochements en équivalences validées ni le libellé complet en standard du marché.


## CMP225

U546 — Codex, 21 septembre 2026. [Frontière demande / Planning](../modeles/backlog/backlog-request-planning-boundary-U546.yaml), état comparé après U545, empreinte dans l’annexe. Relecture U501, D04.s/D03.p et six comportements de la demande ; propositions éditoriales non adoptées.

Oracle ELM496 réunit planification, revue, simulation et mise en application dans Backlog Management. Salesforce ELM498 distingue demande, qualification et suivi, autorisations et activités de résolution. Appui fonctionnel au Planning et analogie de gestion de demande ; cette dernière source concerne les services IT, pas une capacité standard Supply d’optimisation du carnet. Aucune absence universelle ni innovation déduite.

Recommandation : préserver les deux responsabilités retenues U501 et préciser les définitions courtes. D04.s cadre et suit le travail ; D03.p construit et applique le plan, D03.o détermine les arbitrages, D02.e applique les affectations comme comportement de Planning. L’autorisation de suites dans la demande demeure distincte de la décision de plan et d’Order Release. Bénéfice : supprimer l’impression de double simulation ou application. Compromis : référencer un même résultat sans multiplier les autorités ni imposer un dossier manuel par recalcul. Aucun nom, parent, comportement ou accord modifié.


## CMP226

U547 — Codex, 21 septembre 2026. [Gestion de demande comme comportement du Planning](../modeles/backlog/planning-request-behavior-option-U547.yaml). Sources ELM496 Oracle 26B et ELM498 Salesforce directement relues, titres/localisateurs conservés dans l’annexe. Niveau comportement, nom et redistribution détaillée restent proposés ; aucun accord de migration déduit de « pourrait ».

Oracle situe étude, simulation et mise en application dans le parcours de backlog. Salesforce distingue le besoin et son suivi des activités de résolution, dans un contexte ITSM. Ces appuis ne prescrivent ni une capacité Request indépendante ni son rattachement à Planning. L’option FLOW conserve une demande suivie comme les Orders et place sa gestion au sein du Planning responsable du travail.

Bénéfice : une responsabilité de Planning lisible, depuis le travail demandé jusqu’à son résultat, avec demande et plan toujours distincts. Compromis : réexaminer les six comportements U501 pour éviter des sous-comportements et une double simulation/application ; préserver les modes de sollicitation et l’origine Backoffice. Le premier comportement n’impose pas une séquence linéaire ou manuelle. Ni standard de marché ni innovation revendiqué. Cette recommandation fait évoluer celle de CMP225 sans modifier les preuves ou accords historiques.


## CMP227

U548 — Codex, 21 septembre 2026. [Frontière offre de service / sollicitations internes](../modeles/backlog/service-requests-offer-boundary-U548.yaml). D04 et ses dix capacités relus ; proposition non intégrée au catalogue. Sources primaires ELM131 TMF641 v4.2 et ELM369 Oracle 26B directement reconsultées, titres et localisateurs dans l’annexe.

TM Forum décrit la prise en charge de commandes de service ; Oracle produit des planned orders depuis un plan de rééquilibrage. Aucun ne prescrit une Area limitée aux seules demandes d’origine externe. Les planned orders Oracle ne prouvent pas ici la création de Transfer Orders exécutoires.

Recommandation FLOW : offre de service comme principe de lecture de D04, demande propre au Planning gérée par celui-ci ; une famille de services exposée peut aussi être mobilisée par le Domain. Cette nuance préserve Transfer Order Frontoffice/Backoffice acquis U501 et évite deux cycles de vie pour la même finalité. Une restriction stricte aux seules occurrences externes exigerait un arbitrage supplémentaire sur les Orders internes. Les capacités communes de structuration, cycle de vie et archivage ne sont pas automatiquement des services exposés autonomes. Service Catalog des Backing Services reste distinct. Aucun consensus ni innovation revendiqué.


## CMP228

U550 — Codex, 21 septembre 2026. [Décisions de redistribution : définitions courtes](../modeles/backlog/stock-redistribution-wording-U550.yaml). BHV024/025, leur parent D05.c et les variantes distinctes de Transfer Order BHV072/073 relus. Oracle ELM369 (26B) et Nextail ELM462 reconsultés directement ; localisateurs et limites dans l’annexe. Oracle recommande des déplacements et permet la collecte d’excédents ; Nextail rapporte des scénarios de rééquilibrage et un bénéfice de consolidation des tailles chez Merkal. Appuis fonctionnels partiels, sans prescription de la hiérarchie FLOW. Recommandation : remplacer les verbes Déplacer/Regrouper par Déterminer les transferts/regroupements pour expliciter la décision, déjà définie par les scopes. Conserver noms et parents, distinguer Planning et gestion des Orders. Proposition seulement ; aucun consensus structurel ni innovation revendiqué.


**Suite CMP228 — U551 :** les deux définitions décisionnelles présentées sont explicitement adoptées et intégrées. Les noms et parents restent inchangés ; correspondances et limites de preuve restent qualifiées séparément.


## CMP229

U552 — Codex, 21 septembre 2026. [Refacto des Plannings](../modeles/backlog/planning-refactor-U552.yaml). État antérieur ciblé conservé ; sources ELM496/357 (Oracle backlog), ELM498 (Salesforce demandes), ELM566/570 (Oracle release), ELM568/569 (Oracle publication/consommation de demande) directement reconsultées le 21 septembre. Localisateurs, versions et limites conservés dans le manifest et comparaisons portées dans les fiches concernées.

Oracle relie étude, simulation et transmission des résultats ; Salesforce illustre qualification, suivi et autorisations de demandes IT. FLOW rattache la gestion du travail de réoptimisation au Planning et conserve simulation, autorisation et application comme résultats distincts. Les modes de déclenchement deviennent des modalités ; aucune demande manuelle universelle, aucun cycle imposé. La séparation Capability/Behavior et les noms composés sont des choix FLOW, pas un consensus éditeur ou une innovation démontrée.

La release manuelle/automatique Oracle étaye l’application des ajustements de stock, distincte de la gestion des Orders et de l’exécution physique. Publish Plan décrit un export technique ; Demand Schedules montre la consommation d’un plan de demande. Leur rapprochement soutient partiellement la publication métier FLOW sans prouver son autorisation universelle. Deux documents Oracle ne prouvent pas un consensus interéditeurs. D17.b reste réservé : aucun nom ou périmètre de couverture arbitré par ces références.

Bénéfice : éliminer les doubles responsabilités de simulation et d’application et rendre visibles les résultats effectivement pris en compte. Compromis : préserver les modes de sollicitation, l’origine Backoffice et les responsabilités des partenaires ; ne pas appliquer une décomposition identique à tous les Plannings. Refacto autorisé U552, descriptions et comparaisons détaillées proposées.


## CMP230

U553 — Codex, 21 septembre 2026. D17 renommé Supply Planning à la suite de la correction explicite de Laurent. [État antérieur](../audits/2026-09-21-planning-refactor-U552/area-before-U553.yaml). Sources ELM557 Oracle Overview of Supply Chain Planning Plan Types (26B, tableau des plans) et ELM552 SAP Response and supply planning (page évolutive, sections scénarios, contraintes et capacités voisines) directement reconsultées le 21 septembre.

Oracle distingue demande, Supply et plan intégré ; SAP présente Demand planning séparément de Response and supply planning. L’articulation du plan d’ensemble est étayée ; le nom Supply Planning couvrant la demande ET sa couverture est le choix FLOW de Laurent, pas une équivalence stricte ou un consensus revendiqué. Bénéfice : nommer la finalité Supply de l’Area. Compromis : expliquer son périmètre plus large que certaines fonctions produit homonymes et distinguer la capacité de couverture, encore à nommer. Aucun déplacement des Plannings opérationnels. Comparaisons au niveau de l’Area réécrites dans sa fiche ; nom seul adopté.


**Suite CMP230 — U554 :** D17.b est mise en attente, sans suppression : les scopes de D17.a, D05.f, D03.p et D04.j ne reprennent pas explicitement toute la couverture d’ensemble des besoins futurs. Oracle/SAP étayent l’existence fonctionnelle de ce travail, pas son autonomie comme capacité FLOW. La décision de maintien provisoire repose sur ce reste de responsabilité et sur le fait MAP U530, sans attribuer à un outil un périmètre non constaté.


**Correction de portée CMP230 — U555 :** Laurent attribue explicitement à MAP le planning qui produit les Planned Orders. D17.b est donc retirée pour éviter une seconde responsabilité ; U554 devient historique. La séparation entre planification amont et prise en charge des suites est compatible avec les documents Oracle de planification et release (ELM557/566), sans que le marché décide de la frontière FLOW ou du déploiement MAP. L’Area Supply Planning conserve Demand Planning ; sa fiche explicite désormais ce périmètre local plus restreint que les modules éditeurs. Aucun ajout de capacité ou de contrat d’intégration.


**Restitution U556 — CMP229/CMP230 :** les frontières sont maintenant décrites dans les périmètres des quatre Areas concernées, sans citer la solution installée. Sources Oracle/SAP/Salesforce déjà consultées conservées ; positions FLOW actualisées. La réception ou l’émission d’un Planned Order ne démontre ni fermeté, ni réservation, ni reconstruction du plan amont. Aucun élargissement de couverture marché revendiqué.


## CMP231

U557 — Codex, 21 septembre 2026. [Audit du modèle hors référentiels](../audits/2026-09-21-model-coherence-U557/rapport.md) et [annexe structurée](../modeles/backlog/model-coherence-audit-U557.yaml). État comparé : backlog d’empreinte 95967519172f1946b23bd371f877df127d22b6a591ddbaa5ad509b133e9e6f46 ; publication 2026-09-19.11 et baselines de refactoring pour les retraits.

Dix documents primaires directement consultés : ELM419/566 (plan et Orders), ELM568/569 (publication et consommation de demande), ELM334/412 (politiques et réservation), ELM372/393 (compromis de satisfaction), ELM452/496 (affectation et carnet). Titres, éditions, URLs, passages et limites conservés dans l’annexe. Recouvrements fonctionnels partiels et appuis de frontière ; aucune équivalence de taxonomie ou preuve de réalisation installée. Deux documents Oracle ne prouvent pas un consensus interéditeurs. Les fonctions natives firm/release, publication technique et affectation SAP ne remplacent pas les distinctions FLOW.

Recommandation : préciser les responsabilités existantes à la réception des Planned Orders, les relations de Demand Planning, le porteur de mise en vigueur des politiques de réservation, l’autorité des décisions de satisfaction et le périmètre résiduel d’affectation aux besoins sans commande. Bénéfice : rendre les coopérations lisibles sans recréer de capacités. Compromis : conserver les responsabilités des partenaires, le retrait volontaire U555 et les réserves non arbitrées. Diagnostic proposé, sans adoption ni modification du catalogue ; aucune innovation revendiquée.


## CMP232

U558 — Codex, 21 septembre 2026. [Audit des inspirations hors référentiels](../audits/2026-09-21-model-coherence-U557/inspirations-U558.md) ; [inventaire, filiation et constats](../modeles/backlog/market-inspiration-audit-U558.yaml). Même état du backlog que CMP231. Contrôle documentaire sur 128 fiches, relecture ciblée des 21 fiches modifiées et des inspirations des sept comportements regroupés depuis la publication 2026-09-19.11.

ELM556 (SAP Demand planning, page évolutive) et ELM557 (Oracle Plan Types 26B, ligne Demand Plan) directement relus : ils étayent prévisions, collaboration, signaux de demande et consommation des prévisions. La confrontation aux apports planifiés et les distinctions d’engagement FLOW doivent être séparées de l’approche attribuée à ces sources. ELM452 reconsulté ; tentatives directes SAP Reassignment/EDQA sans texte exploitable, limites conservées. Les lectures primaires de CMP231 restent utilisables dans ce complément sans les présenter comme un audit complet de 131 URLs.

Quatre constats proposés : transmission incomplète de certains appuis/exemples aux successeurs, deux synthèses d’inspiration manquantes malgré les comparaisons présentes, attribution et synthèse de Demand Planning à reprendre, répétitions d’éditions et de colonnes. Aucune source supprimée des fiches conservées ; cinq URLs propres à des comportements retirés absentes des comparaisons courantes, sans destruction des preuves ni assimilation automatique à cinq fonctions non étayées. Recommandation de consolidation éditoriale, aucune nouvelle capacité ou innovation revendiquée, aucune correction appliquée ou adoptée.


## CMP233

U559 — Codex, 21 septembre 2026. [Plan de consolidation après audits U557/U558](../modeles/backlog/model-consolidation-plan-U559.yaml). Quatre lots couvrent les dix constats, sans modification du catalogue. Les appuis et limites de CMP231/CMP232 sont repris ; ELM412 (politiques de réservation Microsoft), ELM496 (backlog Oracle 26B) et ELM566 (release des recommandations Oracle 26B) directement reconsultés. URLs et passages dans le plan.

Recommandations de cohérence FLOW : mise en vigueur des politiques dans Supply Protection ; compatibilité collective portée par Fulfillment Plan Decision lorsqu’un plan collectif est construit ; affectation aux commandes identifiées avec qualification des besoins prévisionnels historiques ; prise en charge des demandes planifiées par famille d’Order avec cycle de vie transverse. Les références étayent les distinctions fonctionnelles mais ne prescrivent pas ces propriétaires. Compromis : pas de parcours collectif obligatoire pour toute promesse, pas de forecast automatiquement converti en Order, pas de plan amont dupliqué. Bénéfice : responsabilités explicites et maintien de leurs inspirations. Arbitrages proposés, aucun accord ou innovation inféré.


## CMP234

U560 — Codex, 21 septembre 2026. [Consolidation autonome du modèle et des inspirations](../modeles/backlog/model-consolidation-U560.yaml), réalisation du plan U559 hors référentiels. Baseline complète conservée dans audits/2026-09-21-model-consolidation-U560/model-before.yaml. Les attributions sont des choix de travail explicites de Codex, pas des accords champ par champ attribués à Laurent.

Appuis de CMP231–233 réutilisés à périmètre contrôlé ; ELM419 (Microsoft Firm planned orders) et ELM334 (commercetools Inventory overview) directement reconsultés dans cette mise en œuvre. ELM412/496/566 relus lors du plan dans la même session, ELM556/557 lors du complément d’audit. La planification amont, les propositions reçues, les Orders et leurs engagements gardent leurs frontières. Supply Protection met en vigueur les politiques dont Reservation Policy Decision détermine les conditions ; les décisions de satisfaction restent spécialisées et composées lorsqu’un plan collectif est nécessaire. Les produits étayent les mécanismes, pas les propriétaires du modèle FLOW.

Les appuis des sept comportements retirés sont repris sur D02.e/D04.s avec leurs exemples et limites. Les passages SAP Reassignment/EDQA restent issus des lectures historiques : ouvertures sans texte et nouvelle recherche primaire ciblée sans résultat exploitable, aucune fraîcheur inventée. Quatorze occurrences documentaires ont une destination explicite ; les éditions antérieures restent dans la baseline et le manifest de consolidation. La conservation n’est pas une équivalence de périmètre : complément, réaffectation, traitement du carnet et demandes IT gardent leurs différences.

Les deux synthèses d’application/publication sont complétées ; Demand Planning distingue approche des sources et choix FLOW ; éditions et colonnes répétitives sont consolidées. Bénéfice : responsabilités et coopérations lisibles, appuis transmis sans multiplier les capacités. Compromis : besoins prévisionnels historiques non identifiés maintenus ouverts ; aucune transformation automatique en Order ni déclaration de réalisation installée. Aucune innovation ou taxonomie universelle revendiquée.


## CMP235

U562–U564 — Codex, 21 septembre 2026. [Cas et responsabilités de Supply Assignment](../modeles/backlog/supply-assignment-cases-U562.yaml). Backlog courant après U560 ; état antérieur ciblé conservé dans audits/2026-09-21-supply-assignment-U562/model-before.yaml. ELM571 Oracle 26B, directement consulté, et ELM572 SAP PP/DS, texte primaire indexé consulté avec limite d’ouverture consignée, étayent le lien entre ressources et besoins avant commande. ELM496 Oracle backlog reconsulté pour la frontière aux commandes.

Recouvrement partiel : le pegging Oracle relie ressources, commandes et prévisions ; SAP relie les besoins aux stocks et réceptions, avec un mécanisme dynamique de calcul. FLOW sépare décision et application et ne déduit aucune réservation d’une affectation. Ces appuis ne justifient pas une équivalence avec ARun, un parent unique nommé Order Backlog Planning ou une réalisation installée. Le mécanisme général est documenté ; aucune innovation ou taxonomie commune revendiquée.

U562 valide l’attribution du cas sans commande à Supply Assignment. La restriction U560 est corrigée ; les développements rédactionnels et les comparaisons restent proposés. Sept exemples distinguent demande, protection, affectation aux prévisions, carnet, réassort, redistribution et réservation. Le bénéfice est de qualifier le résultat attendu avant de choisir un parent. Le compromis restant : Supply Assignment couvre désormais explicitement plus que le seul carnet, alors que son parent actuel conserve ce périmètre. Le Planning et la décision qui préparent l’affectation avant commande restent à qualifier ; aucun renommage, duplication ou déplacement automatique.


## CMP236

U565/U566 — Codex, 21 septembre 2026. [Cas concrets actualisés](../modeles/backlog/supply-assignment-cases-U562.yaml) et [comparaison Microsoft](../audits/2026-09-21-supply-assignment-U562/comparaison-microsoft.md). ELM573 et ELM574 directement consultés, ELM403 directement relu ; titres, versions, passages et limites enregistrés. Correspondances de D03, D03.o, D03.p, D02.e et TER078 actualisées ; conséquences éditoriales sur les comportements du Planning explicitées comme adaptations FLOW.

Constat : Microsoft documente la coexistence de commandes et prévisions dans le master planning SCM et dans le profil de demande Business Central. La consommation des prévisions permet de ne pas additionner deux représentations du même besoin. IFO documente en revanche l’optimisation de commandes reçues ; son extension aux forecasts n’est pas établie. Business Central distingue les liens de calcul des liens contraignants order-to-order et ne donne donc pas une équivalence automatique à l’application FLOW.

Choix FLOW : U565 confirme un Planning commun pour affecter des ressources présentes ou attendues aux commandes et prévisions restantes. D03.p porte ce périmètre, mobilise Fulfillment Plan Decision et applique avec Supply Assignment ; les autres comportements suivent le même périmètre. Le plan amont producteur de Planned Orders n’est pas dupliqué. Bénéfice : un arbitrage cohérent des demandes concurrentes ; compromis : nom Order Backlog Planning devenu trop étroit, à qualifier séparément. La prise en compte conjointe est étayée par le marché ; aucune préférence universelle SAP/Microsoft ni innovation du mécanisme général revendiquée. Descriptions développées, lien de coopération et comparaisons proposés ; aucune priorité automatique commandes/prévisions.


## CMP237

U567 — Codex, 21 septembre 2026. [Vérification CTP, ARun et plan Supply intégré](../modeles/backlog/integrated-supply-plan-U567.yaml). État antérieur conservé dans audits/2026-09-21-integrated-supply-plan-U567/model-before.yaml. Neuf documents primaires retenus, passages et limites d’accès détaillés ; cinq inspirations du modèle actualisées à leur niveau.

Microsoft : Batch CTP est déclenché par le plan dynamique ; le master planning peut affecter un apport existant et proposer un nouvel achat dans le même scénario, avec prise en compte du stock de sécurité. SAP : ARun/BOP réaffecte les ressources et considère les protections configurées, mais la matrice SBC 2025 FPS01 précise que BOP ne déclenche pas la création d’apports. SBC/PP/DS produit ces apports dans un autre parcours ; IBP documente l’optimisation conjointe achats, mouvements, production et stock. L’optimiseur IBP reste distinct d’ARun et de l’affectation transactionnelle aux commandes.

La faisabilité d’un plan intégré est étayée ; l’hypothèse « ARun fait tout » n’est pas confirmée. Le choix de Laurent d’un plan Supply de référence unique est retenu comme direction métier, avec des scénarios, révisions et décisions spécialisés possibles. Un seul batch ne garantit pas un optimum global ; les politiques consommées ne sont pas automatiquement recalculées. Bénéfice : limiter les arbitrages locaux incompatibles. Compromis : expliciter le périmètre commun, les ressources partagées, les objectifs et les modalités de convergence.

Le cadrage U555 doit être réexaminé : éviter de dupliquer un plan amont reste juste, mais l’existence d’un outil produisant les Planned Orders ne retire pas cette responsabilité du modèle métier. Aucun nom, parent ou fusion adopté automatiquement ; la structure D03.p/D05.f et le scénario D03.o restent à refondre concrètement. Les définitions, relations et publications restent intactes dans cette vérification ; les correspondances sont des propositions argumentées, pas des réalisations installées.


## CMP238

U568–U570 — Codex, 21 septembre 2026. [Structure proposée de Master Planning](../modeles/backlog/master-planning-structure-U568.yaml) et [restitution](../audits/2026-09-21-integrated-supply-plan-U567/proposition-master-planning.md). ELM303/579 réutilisés à leur portée, ELM580/581 directement consultés et ELM413/496 directement relus le 21 septembre.

Le nom Master Planning est établi chez Microsoft pour un périmètre de planification intégrant aussi achats et réassort retail. SAP IBP étaye l’intégration sous un autre nom : pas de consensus sur une Area homonyme. Les fonctions de lancement, comparaison et transmission sont documentées ; la proposition Master Plan Management les regroupe comme une responsabilité durable avec comportements terminaux. Bénéfice : gouverner un plan commun sans recréer de petits plannings par objectif ou bouton. Compromis : conserver explicitement construction des scénarios, adaptation aux impondérables et application des ajustements issus des capacités consolidées.

Les décisions peuvent contribuer à un plan commun en restant distribuées ; leur regroupement dans l’Area fait l’objet d’une clarification à Laurent. Supply Protection configure et maintient les politiques, alors que des décisions peuvent en proposer une évolution. Les Orders et leurs engagements gardent leur gestion propre ; l’annulation proposée ne vaut pas annulation effective. Proposition de noms, décomposition et placements, sans migration ou adoption de champs non présentés.


**Recommandation de placement U571 — CMP238 :** regrouper les décisions qui déterminent le contenu du plan dans Master Planning ; garder faisabilités réutilisables, politiques en vigueur et engagements à leurs responsables. Microsoft regroupe la couverture et ses recommandations dans Master Planning ; SAP IBP intègre les choix de réseau. Ces périmètres étayent la cohérence du regroupement, sans prescrire les Areas FLOW. Examen des responsabilités résiduelles D03/D05 nécessaire avant migration. Avis Codex, aucun placement adopté par la demande d’avis.


**Accord U572 — CMP238 :** Laurent valide le regroupement des décisions de construction du plan dans Master Planning et le maintien des responsabilités propres de faisabilité, politiques et engagements. Les listes de déplacement, noms détaillés et successions des comportements restent proposés. Cet accord ne change pas les limites documentaires concernant ARun, SBC, CTP ou l’optimum global.

## CMP239

U573 — Codex, 21 septembre 2026. [Étude structurée](../modeles/backlog/master-plan-management-market-study-U573.yaml), [restitution](../audits/2026-09-21-master-plan-management-U573/rapport.md). Backlog courant après U572 ; proposition non migrée. ELM582–587, ELM416, ELM566/570 et appuis complémentaires documentent le contrôle des calculs, les variantes, l’autorisation, la transmission et le suivi. Microsoft et Oracle directement consultés ; SAP IBP 2605 consulté par texte primaire indexé, avec limite d’ouverture directe conservée.

Relation : recouvrement partiel et appui méthodologique. Les mécanismes convergent, mais ne démontrent ni taxonomie exhaustive universelle, ni workflow humain obligatoire, ni pause/reprise ou retour arrière global. La promotion SAP, l’approbation d’un Planned Order Microsoft et la release Oracle ne sont pas équivalentes à un engagement effectif.

Proposition : une capacité Master Plan Management, de nature Planning, avec cinq comportements de gestion et six d’application, tous terminaux. Lancer, arrêter et relancer sont des modalités du pilotage de la demande de planification ; Simulation & Analysis reste combiné. Les versions, résultats partiels et adaptations sont explicites. Bénéfice : continuité du plan commun ; compromis : capacité large, décomposée selon ses pratiques et effets métier. Aucune adoption de détail ni réalisation installée déduite.

## CMP240

U574 — Codex, 21 septembre 2026. Même [étude](../modeles/backlog/master-plan-management-market-study-U573.yaml), onze catégories d’action examinées avec les capacités existantes. ELM588–592 complètent ELM363/369/371/410/413/418/421/435/496/566/570, directement consultés ; ELM571/574 sont réutilisés à partir des lectures du même jour. Chaque comportement proposé porte au moins deux documents primaires pertinents, avec limites explicites. Les appuis fonctionnels n’imposent pas leur maille Capability/Behavior.

Microsoft distingue liens ressources-besoins, propositions de changements et transformation des Planned Orders. Oracle documente révision du carnet, fractionnement, transmission des recommandations, rééquilibrage et calcul de paramètres. Un seuil produit-lieu et un quota protégé de canal sont distincts ; le calcul optimal conjoint des protections de groupes n’est pas démontré par ces sources.

Proposition de noms : Order Allocation & Reallocation pour la couverture des commandes ; Forecast Supply Allocation pour ne pas perdre l’affectation avant commande. Ce sont des intitulés descriptifs FLOW, pas des synonymes universels. Inventory Allocation seul reste ambigu avec les enveloppes Microsoft ; une affectation FLOW ne vaut pas réservation. Les autres suites sont portées par Fulfillment Scheduling, Planned Order Release, Supply Order Adjustment et Supply Policy Adjustment, mobilisant les responsables existants.

Supply Procurement Decision est proposée pour expliciter les choix d’achats du plan commun, au-delà de la tenue des Purchase Orders et de l’entretien de disponibilité en cours de commercialisation. La définition actuelle de D03.o doit être réexaminée pour la cohérence de toutes les contributions ; aucun optimiseur local indépendant ajouté. Bénéfice : rendre lisibles les actions et leurs propriétaires ; compromis : qualifier les frontières achat/réassort et les successions avant refacto. Noms, création, fusion et déplacements restent proposés ; accord U572 préservé dans sa portée.


## CMP241

U575 — Codex, 21 septembre 2026. [Application du Master Plan](../modeles/backlog/master-plan-application-U575.yaml), [restitution](../audits/2026-09-21-master-plan-management-U573/revision-U575.md). Backlog canonique inchangé ; structure proposée U573/U574 révisée. ELM566 Oracle 26B et ELM588 Microsoft directement relus : transmission des recommandations avec suivi des exceptions, transformation des Planned Orders et historique. Recouvrement partiel : aucun des documents ne démontre l’application de toutes les catégories FLOW dans un mécanisme unique.

Planning Management est le nom explicitement demandé. Proposition Codex : un comportement Master Plan Application regroupe les effets sur affectations, échéanciers, Orders et politiques ; leurs responsables et les décisions restent distincts. Les catégories restent descriptives, sans sous-comportements. Bénéfice : une frontière claire entre résultat autorisé et effets appliqués, à la maille landscape. Compromis : garder les catégories, coopérations et limites dans la description pour éviter un comportement opaque. Les termes Allocation proposés sont abandonnés dans cette décomposition ; couverture des prévisions et onze cas préservés. Seul le nom Planning Management est adopté ; regroupement, définition et six comportements détaillés restent proposés.


## CMP242

U576 — Codex, 21 septembre 2026. [Proposition de nom](../modeles/backlog/master-plan-application-U575.yaml), section naming_review_U576. Laurent accepte le regroupement sous réserve du nom, retire Master de celui-ci et refuse Application pour éviter une lecture informatique. Plan Implementation, mise en œuvre du plan, est proposé. ELM593 apporte un appui lexical historique Oracle ; ELM594 un rapprochement fonctionnel Microsoft. Aucun des deux ne prouve un consensus sur cet intitulé de capacité. ELM566 conserve l’appui fonctionnel à la transmission et au suivi des recommandations.

Bénéfice : expliciter le passage des recommandations autorisées aux effets pris en compte. Plan Execution pourrait englober les opérations physiques ; Plan Release pourrait être lu comme la seule transmission. Ces comparaisons sémantiques sont une appréciation FLOW. Périmètre et familles d’effets conservés ; aucun changement canonique, nouveau nom adopté ou validation étendue aux autres champs.


**Accord U577 — CMP242 :** Laurent valide le nom Plan Implementation, dans le périmètre du comportement de mise en œuvre discuté. Les rapprochements documentaires gardent leurs limites ; l’accord de nom ne crée ni consensus marché ni validation globale des champs.


## CMP243

U578 — Codex, 22 septembre 2026. Révision de la [proposition Master Plan Management](../modeles/backlog/master-plan-application-U575.yaml), section revision_U578 ; modèle canonique inchangé. ELM585 Oracle Batch Run Plan 26B et ELM582 Microsoft Cancel a planning job relus : cadrage, programmation, lancement, arrêt et nouveau calcul documentés à maille fonctionnelle. ELM595 apporte les filtres de périmètre et les calculs immédiats, récurrents ou successifs Microsoft. ELM566 Oracle et ELM413 Microsoft relus : observation des suites non prises en compte et recommandations face aux changements ; recouvrement partiel avec suivi et ajustement métier. Les sources ne prouvent pas une reprise au point exact d’interruption.

Choix FLOW : remplacer le comportement agrégé Planning Management par cinq comportements directs, sur instruction explicite de Laurent. Bénéfice : distinguer leurs résultats et frontières ; compromis : pilotage plus fin au niveau landscape. La règle générale contre un comportement par bouton subsiste ; cette décomposition locale ne constitue pas une taxonomie marché. Monitor Plan observe ; Adjust Plan prépare une révision ; Rerun Planning démarre un nouveau calcul. L’ajustement conserve autorisation et application distinctes.

Plan Version Management sort de la liste des comportements par instruction U578 ; gestion des variantes et historique restent fonctionnels. Apply Plan remplace le nom Plan Implementation par instruction explicite. Ces choix de granularité et de nom ne sont ni un standard universel ni une innovation revendiquée. Les nouvelles traductions anglaises et définitions restent proposées ; le nom Apply Plan et le retrait ont leur portée explicite. Les onze familles d’effets et les responsables opérationnels sont conservés.


## CMP244

U579 — Codex, 22 septembre 2026. [Contenu des décisions de Master Planning](../modeles/backlog/master-planning-structure-U568.yaml), section decision_content_U579. Proposition de décomposition de Fulfillment Plan Decision D03.o ; aucune mutation canonique. La précédente synthèse développait surtout la gestion du plan ; les responsabilités décisionnelles existaient mais leur lecture détaillée restait insuffisante.

ELM458 SAP Exploring Backorder Processing et ELM363 Oracle Start Backlog Planning 26B directement relus : réexamen du carnet, disponibilités et priorités. BOP modifie aussi les confirmations ; son périmètre traverse décision, application et engagement FLOW. ELM222 Allocation et ELM223 Steps in Order Allocation Run relus dans le texte primaire indexé SAP ERP Fashion ; ouverture directe sans texte exploitable. Spread répartit les ressources entre besoins ; FIFO est une autre politique, ARun le processus plus large. Ne pas confondre ce sens avec le fractionnement d’Orders ou la redistribution physique entre sites.

Proposition : Demand Coverage, Scarce Supply Distribution et Backlog Reconciliation, trois comportements combinables sous D03.o. Le premier établit la couverture, le second traite le partage en cas de rareté, le troisième réexamine les couvertures du carnet. Appuis fonctionnels partiels, libellés et maille FLOW proposés ; le fait d’avoir deux documents SAP sur spread ne démontre pas un consensus. Les prévisions restent dans le plan selon U565, sans leur attribuer une prise en charge dans le BOP cité.

Les autres capacités contribuent au même plan : priorités, cibles, protections proposées, implantation, réassort, redistribution, achats (décision proposée U573/U574). Bénéfice : montrer les arbitrages concrets sans recréer des plans autonomes. Compromis : comportements combinables plutôt que phases exclusives ; conserver leur articulation. Apply Plan fait appliquer les résultats autorisés ; son regroupement ne retire pas les décisions de répartition. Aucun nouveau nom ou placement adopté par extension.


## CMP245

U580 — Codex, 22 septembre 2026. [Comparaison des noms d’Area](../modeles/backlog/master-planning-structure-U568.yaml), section area_naming_review_U580. Comparaison au niveau du périmètre métier entier, sans déduire le nom de la somme des comportements de gestion. ELM596–599 et relecture ELM552 : Microsoft Master Planning, SAP Response and supply planning, Oracle Supply Planning et Demand and Supply Plan. Ces intitulés couvrent déjà la construction et l’adaptation de réponses demande-ressources, au-delà de l’administration d’un plan.

ELM597 situe Plan review and reconciliation dans le processus S&OP ; interprétation FLOW : Reconciliation peut évoquer une étape de convergence plus qu’un ensemble d’arbitrages opérationnels. ELM552/598 étayent les arbitrages sous contraintes et les objectifs de service, stock et économie ; le nom exact Demand & Supply Optimization n’est pas établi comme catégorie commune dans ce corpus. Recommandation Codex entre les deux options de Laurent : Demand & Supply Optimization, pour exprimer la finalité multidimensionnelle. Demand & Supply Planning reste une alternative lexicalement plus directement étayée, notamment chez Oracle.

Bénéfice : distinguer finalité de l’Area et capacité de gestion du plan. Compromis : intitulé FLOW assumé ; définition excluant garantie d’optimum et extension implicite au pilotage commercial de la demande. Demand Planning, configurations et responsabilités opérationnelles ne changent pas par le nom. Demande exploratoire, aucun renommage adopté ni modification canonique ; marché et recommandation distingués.


## CMP246

U581 — Codex, 22 septembre 2026. [CTP et achats du plan commun](../modeles/backlog/master-planning-structure-U568.yaml), section ctp_and_procurement_U581. ELM417/588 Microsoft et ELM566 Oracle relus directement. Batch CTP s’appuie sur le plan dynamique pour les dates ; master planning produit des Planned Orders, transformés en Orders par firming. Oracle transmet les recommandations nouvelles ou révisées et expose les exceptions aval. Aucun de ces documents ne garantit de rendre toutes les promesses existantes réalisables.

Interprétation FLOW : autoriser au cadrage les adaptations prévues par les politiques externes, mobiliser CTP pour leur faisabilité, puis coordonner leur choix dans le plan commun. La décision d’achat proposée reste distincte de CTP ; Apply Plan mobilise les responsables des Orders et engagements. Les achats pour prévisions ou stocks ne nécessitent pas chacun un contrôle CTP de commande client. Limites : délais et ressources peuvent rendre une date intenable ; proposition d’achat, engagement fournisseur et couverture effective distincts. Recommandation de fonctionnement proposée, pas activation logicielle ni adoption globale.

## CMP247

U583/U584 — Codex, 22 septembre 2026. [Examen des six Areas du cœur d'orchestration](../modeles/backlog/orchestration-areas-review-U584.yaml). Neuf documents primaires consultés : ELM600–603 et relectures ELM363/406/411/415/596. Périmètre comparé : proposition de Laurent et responsabilités du backlog courant ; aucune modification canonique.

Microsoft distingue prévision de demande, apports et projection de stock ; réservation et consignation étayent les distinctions entre besoin, engagement, présence et propriété. Oracle Transfer Orders 25C porte demande et apport dans une même opération. Recouvrements fonctionnels, sans preuve d'une taxonomie commune à six Areas. Le regroupement FLOW proposé conserve une tenue unique des Orders et une position de stock sans double compte.

Microsoft Master Planning comprend la proposition d'apports ; Oracle Backlog Planning réarbitre la couverture du carnet. Matching serait trop restrictif s'il désignait seulement le partage des ressources données. Recommandation Codex : expliciter la couverture et les ajustements, en gardant le nom cible Demand & Supply Optimization U581 comme option préférée. U584 rouvre le vocabulaire sans adopter automatiquement un remplacement.

Fluent distingue gestion des profils et utilisation en sourcing ; Source Order Items combine choix de sites, limites de fractionnement et réaffectation après manque. Deux documents du même éditeur ne prouvent pas un consensus. Interprétation FLOW : Fulfillment coordonne et adapte la réalisation dans ses marges ; les effets sur la couverture ou la promesse mobilisent leurs responsables. Une fonction éditeur ne détermine pas à elle seule un parent métier.

Bénéfice des six axes : besoins, apports, état du stock, arbitrages et réalisation mieux distingués. Compromis à traiter : les exemples mêlent objets et capacités ; promesse, prévisions, capacités de prestations et responsabilités communes des Orders doivent rester explicites. Toutes les propositions de frontières et de placements sont en examen ; aucun accord, fusion, suppression ni couverture installée déduit.

## CMP248

U585/U586 — Codex, 22 septembre 2026. [Policy et projections de référence](../modeles/backlog/orchestration-areas-review-U584.yaml), [grille des types](../modeles/backlog/capability-types-U449.yaml). Relecture ELM410 Microsoft, Business background and purpose / Difference between inventory allocation and soft reservation, et réutilisation de la consultation ELM603 Fluent du même jour. Microsoft expose protections par groupe/canal et événements promotionnels ; Fluent maintient les configurations utilisées par l'orchestration.

Appui fonctionnel à un cadre de règles applicable, distinct du calcul d'une réponse. Le type de capacité Policy est demandé U586 ; ces sources n'en font pas un standard taxonomique. Définition proposée : définir, maintenir et rendre applicables les règles maîtrisées par le Domain. Bénéfice : séparer projections externes et règles internes, puis distinguer leur gouvernance des décisions et plans consommateurs. Compromis : préciser les propriétaires et les délégations de modification, sans une capacité par paramètre. Protéger les Backing Services signifie encadrer leur charge et leur sollicitation dans cette proposition, pas administrer techniquement WMS/TMS ni inventer leur capacité. Aucun reclassement automatique de Supply Protection, aucune perte d'autorité locale U479.

## CMP249

U585 — Codex, 22 septembre 2026. [Effets du plan](../modeles/backlog/orchestration-areas-review-U584.yaml). ELM434 Microsoft Order promising relu (méthodes, ATP calculations, CTP calculations) et ELM604 Oracle 26A consulté. Microsoft distingue disponibilité et capacité mobilisée ; Oracle fractionne la couverture entre lieux, dates et substitutions autorisées. Ce sont des distinctions fonctionnelles utiles, pas une obligation d'urbaniser en trois capacités ATP/CTP/PTP.

Recommandation FLOW : rendre les capacités lisibles par leurs résultats métier, conserver couverture réalisable, adaptations et arbitrage économique dans les décisions mobilisées par le plan, sans supprimer leurs différences. Achats, révisions des demandes et des protections deviennent des effets explicitement étudiés. Le cas B2B/eCommerce est cohérent avec les protections ELM410, mais un calcul conjoint universel des quotas n'est pas démontré. Proposition, quantité couverte, obligation de vente et engagement restent distincts. Aucun nom détaillé, déplacement ou fusion canonique adopté.

## CMP250

U585 — Codex, 22 septembre 2026. Rapprochement de Fulfillment Orchestration avec le case management. ELM011 / MKT10 : [OMG CMMN 1.1](https://www.omg.org/spec/CMMN/1.1/PDF), décembre 2016, formal/2016-12-01, §4.1 pages imprimées 5–6 et §5.4.9.2 page 41, relus ; ELM605 Flowable consulté. Dossier orienté résultat, contexte et évolution des activités selon événements, tâches prévues et discrétionnaires ; Flowable illustre l'articulation humain, service, décision et processus.

Appui méthodologique aux principes établis du case management pour l'adaptation des prestations ; le dossier ne se limite pas aux seules exceptions. Interprétation FLOW : conduire la réalisation selon son contexte, mobiliser décisions et activités utiles, réexaminer couverture ou engagement quand l'effet l'exige. Bénéfice : adaptation lisible sans workflow figé. Limites : toute orchestration n'est pas automatiquement du case management ; ni conformité CMMN, ni moteur, ni supériorité universelle ou couverture installée démontrée. Le Domain courant et U472 sont conservés.

## CMP251

U587 — Codex, 22 septembre 2026. [Backing Service Policy dans la proposition courante](../modeles/backlog/orchestration-areas-review-U584.yaml), capacité de type Policy sous l'Area proposée Policy Management. D14 et TER075 décrivent déjà une offre physique, humaine ou numérique ; Laurent précise que ses fournisseurs sont principalement logistiques, sans exclusivité, et demande des règles propres à Supply d'exclusion et de limitation des commandes face aux difficultés.

ELM606 Oracle OTM 24A étaye l'exclusion de prestataires inactifs des choix de planification concernés, selon une option explicite de cette édition. ELM607 Oracle OTM 26B étaye les plafonds d'expéditions par prestataire, équipement, trajet et période. Deux documents primaires distincts du même éditeur : recouvrements partiels du cas transport, sans consensus de nom ou de type de capacité. Le déclenchement par difficultés observées est l'intention FLOW ; les sources n'établissent pas une décision automatique depuis des KPI ni la suppression d'engagements existants.

Bénéfice : séparer l'offre disponible au catalogue et notre autorisation de l'utiliser. La politique gouverne le recours, la visibilité expose les faits, la décision de sélection applique les restrictions et les Backing Service Orders tiennent les engagements. Exemple proposé : plafond Supply de 200 préparations malgré une capacité annoncée de 1 000, après difficultés constatées. Compromis : expliciter portée, période, unité de limitation et règle de révision ; ne pas confondre capacité physique, capacité restante et plafond local. Aucun prestataire réel, incident Beaumanoir, nouveau niveau hiérarchique ou reclassement canonique inventé.

## CMP252

U588 — Codex, 22 septembre 2026. [Réexamen lexical](../modeles/backlog/orchestration-areas-review-U584.yaml), section naming_review_U588. ELM608/609 attestent Backing Service en architecture applicative Twelve-Factor, repris par Microsoft .NET. Sa portée FLOW physique, humaine ou numérique est une adaptation ; les comparaisons actuelles TER075 avec Field Service/Camunda étayent des responsabilités, pas ce nom exact comme vocabulaire logistique.

ELM606/607/610 OTM étayent exclusions, plafonds et terme Service Provider. Ils n'attestent pas le composé Backing Service Policy ; ce constat borné n'établit pas une absence sur tout le marché. Recommandation Codex : Service pour la prestation, Service Provider pour le fournisseur, Service Catalog pour le référentiel et Service Provider Policy pour les règles de recours. Le dernier nom est une composition FLOW proposée, pas un intitulé standard démontré.

Bénéfice : vocabulaire plus directement métier et moindre ambiguïté IT. Compromis : Service demeure générique ; la définition doit conserver prestation, résultat et engagements. La politique doit couvrir fournisseur et prestations contextualisées, sans se réduire au blocage global du fournisseur. Aucun remplacement des noms courants, nouvelle maîtrise d'entreprise ou nouvelle capacité canonique déduit de la question.

Suite U590 — Laurent adopte les noms présentés : Service, Service Provider, Service Catalog et Service Provider Policy. Application au backlog et à la proposition de politique le 22 septembre 2026 ; aucune extension de l'accord aux descriptions ou aux rapprochements marché. ELM606 et ELM610 Oracle relus, ainsi que ELM397 Microsoft : fournisseur et prestation restent distincts ; Service Provider Policy demeure une composition FLOW. Service Provider est explicité comme rôle dans le glossaire, sans nouvelle capacité ni changement de maîtrise. La commande de prestation conserve son nom antérieur, absent de la table soumise. Le constat U588 ci-dessus reste historique.

## CMP253

U589 — Codex, 22 septembre 2026. [Diagnostic ciblé des frontières](../modeles/backlog/orchestration-areas-review-U584.yaml), boundary_assessment_U589. ELM601 Oracle Transfer Orders 25C relu directement : demande et apport sont portés par le même document. ELM602 Fluent Source Order Items réutilisé depuis le texte primaire indexé consulté dans cette discussion ; nouvelle ouverture directe en échec. La fonction produit combine sourcing et réaffectation après manque au prélèvement. Ces constats justifient d'examiner les interactions, sans adopter les frontières des modules logiciels.

Interprétation FLOW : la finalité du Domain reste claire, mais les maîtres externes ne couvrent pas ses politiques propres U585. Les axes d'Areas sont cohérents ; propriétaires des Orders à plusieurs effets, décisions de couverture/réalisation, promesse et réservation restent à préciser. Références/Policy et apports/position de stock disposent d'une distinction de principe lisible. La fréquence et l'ordre temporel ne déterminent pas à eux seuls le parent d'une décision réutilisée.

Bénéfice recommandé : attribuer chaque résultat à une responsabilité unique et décrire les coopérations. Compromis : des Areas interdépendantes, sans prétendre supprimer leurs interactions ou les isoler techniquement. Aucune hiérarchie en sept Areas imposée par les sources ; aucune migration ni réouverture de l'audit des comportements. La proposition et le catalogue canonique conservent des maturités différentes, explicitement signalées.

## CMP254

U591/U592, C114 — Codex, 22 septembre 2026. [Frontière courante plan / Fulfillment](../modeles/backlog/orchestration-areas-review-U584.yaml), plan_fulfillment_boundary_U592. Laurent fixe le début d'exécution comme limite de la modification du contenu par l'arbitrage ; la fermeté n'empêche pas une révision, voire un désaffermissement. U591 demeure pour l'adaptation du plan d'exécution, le split de la Logistic Order et le suivi des deux suites par la demande initiale.

ELM602 Fluent Source Order Items : texte primaire indexé relu, édition modifiée le 17 juin 2026, How it Works / Short-Pick Reallocation ; ouverture directe en échec. Appui fonctionnel à la reprise des articles manquants depuis un autre lieu et aux limites de split. ELM604 Oracle Split or Substitute Fulfillment Lines, 26A, directement relu : Introduction, Split a Warehouse, Consider Dates. Appui au fractionnement avant réalisation dans Promising, selon permissions. Deux documents primaires distincts : le même mécanisme de split peut servir plusieurs responsabilités ; il ne détermine pas seul l'Area.

Interprétation FLOW : distinguer retouche du contenu de la demande et adaptation de sa réalisation. Bénéfice : un manque partiel ne renvoie pas systématiquement tout le dossier à l'arbitrage ; une demande ferme non exécutée reste révisable. Compromis : définir le début d'exécution, la maille en cas de réalisation partielle, les marges et conséquences d'une révision. Les sources ne démontrent ni une règle universelle de désaffermissement, ni le nom Logistic Order, ni une filiation documentaire imposée. Le critère de frontière vient de Laurent ; les rédactions et modalités détaillées restent proposées. Aucune nouvelle capacité, réalisation installée ou migration canonique déduite.

Suite U593 — Laurent adopte le terme Re-sourcing présenté pour la reprise depuis une autre source. ELM602 Fluent documente la réaffectation après manque et mentionne Partial Fulfillments and Re-Sourcing dans son cadre fonctionnel ; ELM604 Oracle reste un appui au split, sans équivalence de nom revendiquée. Bénéfice lexical : rendre lisible la recherche d'une source de remplacement, distincte du fractionnement et du suivi. Accord consigné dans terminology_adoption_U593 de l'annexe ; aucune nouvelle capacité ou maille de comportement déduite du nom.

## CMP255

U594 — Codex, 22 septembre 2026. Diagnostic actualisé après U590–U593 dans [remaining_boundaries_U594](../modeles/backlog/orchestration-areas-review-U584.yaml). ELM601 Oracle Transfer Orders 25C relu : Introduction, document unique représentant demande et apport. ELM410 Microsoft Inventory Visibility inventory allocation relu : Business background and purpose, Difference between inventory allocation and soft reservation. Ce dernier distingue protection par groupe et réservation liée à une transaction ; il ne détermine pas une Area FLOW.

Les deux documents primaires étayent des interactions différentes, sans fournir un découpage commun de capacités. Interprétation : la frontière de principe plan / Fulfillment est clarifiée ; restent à attribuer les Orders à plusieurs effets, la tenue des engagements et la responsabilité détaillée de Logistic Order. La réservation a déjà Inventory Management pour parent canonique (D02.c → D01) ; recommander de le conserver, avec coopérations explicites, au lieu de présenter ce placement comme absent. Service Capacity Visibility conserve aussi un ancrage existant D06.b dans Process Management, candidat à préserver dans Fulfillment.

Bénéfice : réduire le diagnostic aux responsabilités réellement non attribuées dans la proposition ; séparer critères opérationnels et choix de structure. Compromis : préciser les effets partagés sans dupliquer les cycles de vie. Demand pour la tenue d'engagement et Fulfillment pour la mission logistique restent des recommandations FLOW, non des conventions imposées par les sources ou des accords nouveaux. Aucun changement canonique ni migration déduit de la demande.

## CMP256

U595/U596 — Codex, 22 septembre 2026. [Étude des Orders de consignation](../modeles/backlog/consignment-orders-market-review-U595.yaml). Laurent clarifie que Transfer Order et retours sont des demandes ; elles portent besoins, exigences et promesse indépendamment de leur origine. Le point de responsabilité est résolu dans la proposition, sans migration canonique. L'étude porte sur les types et périmètres des demandes.

ELM611/615 SAP distinguent fill-up, issue, pick-up et return de consignation client. ELM406 Microsoft et ELM612 Oracle décrivent l'appel de stock fournisseur consigné, distinct d'un transfert immédiat de propriété. ELM613 Oracle Retail et ELM617 Fashion montrent que le régime consigné peut coexister avec des transferts : ni lieu externe ni propriété tierce ne suffisent à imposer un nouveau type de mouvement. Éditions et limites d'accès sont consignées dans l'étude ; aucun consensus documentaire unique déduit.

U596 vise prioritairement le stock du client donneur d'ordre détenu chez nous. Les pages de consignation fournisseur ne suffisent pas à assimiler ce client à notre fournisseur de marchandises. Interprétation proposée : séparer demande de prise en charge/livraison/restitution, régime de stock et prestations de réalisation. D04.r/D01.h couvrent aujourd'hui fournisseur propriétaire et distributeur détenteur ; leur extension serait un changement de périmètre. Recommandation : garder Transfer Order pour son intention de déplacement et examiner les obligations propres de consignation ou de garde ; ni Order universel ni quatre capacités copiées des types SAP. Noms et maille restent à décider ; aucun nouveau Domain Commerce.

Précision U598 — Relecture canonique : Transfer Order porte déjà Initial Stocking, Continuous Replenishment, Inventory Rebalancing, Stock Consolidation et Order-Driven Transfer. Rééquilibrage n'est donc pas son unique intention décrite. Le régime consigné peut accompagner un déplacement (ELM613/617) sans transformer le transfert en demande universelle. D04.r couvre l'apport fournisseur consigné entrant, pas toute mise en consignation dans les deux sens ; ELM406/612 étayent ce point de vue. BHV065 Consignment Exit mobilise déjà Supplier Return, Sales Order ou Transfer Order selon l'issue ; les suites ne sont pas entièrement absentes, mais la demande spécifique de restitution du stock client U596 n'est pas explicitement établie. ELM611/615 distinguent reprise des invendus et retour après consommation ; ils ne justifient pas deux Orders pour « reprise » et « restitution » lorsqu'il s'agit de la même obligation vue par deux parties. Clarification de lecture et recommandation de cohérence, sans nouvelle adoption.

## CMP257

U597 — Codex, 22 septembre 2026. Comparaison AFS/Fashion dans [l'étude U595](../modeles/backlog/consignment-orders-market-review-U595.yaml). ELM614 AFS 6.5 atteste déjà la prise en compte de la consignation fournisseur dans ATP, ARun et les livraisons. ELM619 complète par un contrat d'interface AFS identifiant le stock consigné client. ELM616/617 Fashion documentent saisons, segmentation, affectation et circulation multisite du stock fournisseur consigné. Constat : continuité de la possibilité de mobiliser ce stock ; enrichissements Fashion documentés, sans déduire l'absence de leurs équivalents dans AFS.

Différence explicite entre éditions : ELM615 FMS 1.0 SP13 décrit l'usage d'ARun dans fill-up, issue et pick-up selon pertinence article/règles, tandis qu'ELM618 S/4HANA aATP 2025 FPS01 réserve Supply Assignment au fill-up KB. KE, KA et KR en sont exclus dans ce dernier passage. Cet écart exige une qualification de produit/version ; il ne prouve ni impossibilité d'exécuter les autres parcours ni règle universelle de migration.

Interprétation pour FLOW : conserver les intentions et effets de propriété indépendamment du produit ; appliquer les règles d'admissibilité et d'affectation selon contexte. Pour le stock du client chez nous, qualifier la relation de prestation et les droits sur le stock avant de choisir une famille d'Order. Aucune différence de stratégie commerciale universelle AFS/Fashion ni couverture installée Beaumanoir établie. Recommandations de modèle en attente de décision ; aucune création automatique de capacité.

## CMP258

U599 — Codex, 22 septembre 2026. Noms d'Orders de consignation, proposition dans naming_proposal_U599 de [l'étude U595](../modeles/backlog/consignment-orders-market-review-U595.yaml). ELM612 Oracle Consigned Inventory 26A relu directement, section Consignment Order : nom court pour la demande de livraison sous accord, distinct de l'accord et de la consommation. ELM615 FMS Consignment Orders 1.0 SP13 relu par texte primaire indexé : fill-up, issue, pick-up et return ont des résultats distincts. Aucun vocabulaire unique interéditeurs démontré.

Recommandation de nommage : Consignment Order pour l'apport/mise en consignation (nom Oracle, correspondant à l'intention fill-up SAP), Consignment Pick-up Order pour la reprise du stock resté consigné, Consignment Issue Order pour la consommation/cession, Consignment Return Order pour le retour après issue. La liste est une sélection FLOW de termes attestés dans deux contextes ; ce n'est ni une taxonomie commune ni une équivalence complète entre les processus fournisseur Oracle et client SAP. Consignment Order ne doit pas devenir le nom d'un Order universel portant les quatre intentions.

Bénéfice : retirer Replenishment évite de suggérer uniquement le réassort, alors que D04.r couvre aussi l'implantation ; conserver Pick-up distinct de Return préserve l'effet de propriété. Compromis : Issue doit être expliqué en français, et les perspectives fournisseur/client contextualisées. Pour la seule détention du stock d'un client, consommation/cession et retour après cession ne sont pas obligatoires. L'élargissement de D04.r au-delà de son périmètre fournisseur reste une décision distincte du nom. Aucun renommage canonique ni création de quatre capacités.


## CMP259

U600/U601 — Codex, 22 septembre 2026. Comparaison étendue dans competitor_review_U600 de [l’étude U595](../modeles/backlog/consignment-orders-market-review-U595.yaml). État comparé : D04.r conserve son nom et son périmètre fournisseur entrant ; les noms U599 sont des propositions. Relation : appui sémantique et recouvrement partiel, aucune équivalence globale de capacités. ELM406/612/615 relus ; ELM620–624 ajoutés, éditions et localisateurs conservés.

Constat : le vocabulaire de mise en consignation varie entre SAP, Oracle, Microsoft, Infor M3 et IFS. Le nom actuel est attesté chez deux éditeurs. Les mots Return et Pick-up ne partagent pas partout la frontière SAP entre avant et après consommation. Les perspectives client et fournisseur sont explicites dans l’étude ; leur rapprochement n’en fait pas des processus identiques.

Recommandation : Consignment Fill-up Order pour préciser l’intention d’alimentation, Consignment Pick-up Order pour la reprise des biens restés consignés ; Issue et Return demeurent candidats pour les autres intentions. Bénéfice : noms qualifiés et distinction d’effets ; compromis : vocabulaire SAP à expliquer, sans consensus interéditeurs. U601 corrige le mot d’U600, sans adopter la famille ni créer quatre capacités. La garde du stock client reste un périmètre à traiter explicitement. Aucune mutation canonique ; validation des noms encore attendue après comparaison.


## CMP260

U602 — Codex, 22 septembre 2026. Mandat de vente et importance d’Issue dans [l’étude U595](../modeles/backlog/consignment-orders-market-review-U595.yaml), sales_mandate_U602. État comparé : proposition des Orders et cas client propriétaire U596 ; aucune mutation de D04.r. Appui sémantique et recouvrement partiel, pas équivalence documentaire.

ELM615 SAP FMS 1.0 SP13, Consignment Orders, section Consignment issue, texte primaire indexé relu : Issue documente le prélèvement du stock consigné dans le processus de vente. ELM613 Oracle Retail 21.0, Item Types, section Consignment and Concession Items, page primaire relue : vente de biens tiers selon des régimes aux effets distincts de propriété et de facturation. Cela appuie la distinction entre vente, possession et acquisition ; aucun régime Oracle n’est attribué au mandat de Laurent.

U602 établit le mandat de vente ; la réserve de simple garde ne décrit plus son exemple. Recommandation FLOW : inclure Issue dans le périmètre, l’articuler avec Sales Order et appliquer ses effets via Inventory ; Fulfillment porte l’exécution. Bénéfice : suivre la vente du stock confié et les obligations envers le propriétaire sans confondre expédition et sortie du régime consigné. Limite : fait générateur et organisation des documents encore à définir ; définition proposée non réputée adoptée. Pas de chantier Commerce anticipé ni de quatre capacités automatiques.


## CMP261

U603 — Codex, 22 septembre 2026. Vérification SAP du cas U596/U602 ; [étude U595](../modeles/backlog/consignment-orders-market-review-U595.yaml), sap_use_case_U603. État comparé : proposition de famille et mandat de vente confirmé, aucun changement canonique. Relation : recouvrement partiel et appui sémantique ; pas équivalence de capacité ni validation contractuelle.

ELM625 décrit la consignation client standard avec transfert de propriété au détenteur lors d’Issue. ELM626 documente un agent externe livrant pour compte du propriétaire, avec document ED qualifié d’Issue. ELM627 confirme une génération depuis l’avis de livraison dans un scénario automobile. Versions et limites restent propres à chaque document ; aucune extension à AFS/Fashion installés.

Le mandat de vendre justifie la pertinence d’Issue mais ne suffit pas à choisir le montage : acquisition par nous versus vente pour compte sans acquisition. Le scénario agent éclaire la séparation propriétaire/détenteur/acheteur ; il ne démontre pas la délégation commerciale complète. Recommandation : retenir l’intention d’Issue et qualifier ses effets et sa filiation à la demande commerciale. Bénéfice : préserver le sens métier sans assimiler Issue à une expédition ni créer un deuxième besoin. Limite : une génération documentaire après exécution ne justifie pas automatiquement une capacité de demande autonome. Correspondance proposée, non validée.


## CMP262

U604/U606 — Codex, 22 septembre 2026. [Étude U595](../modeles/backlog/consignment-orders-market-review-U595.yaml), sales_order_issue_review_U606. État comparé : Sales Order D04.i existant et Consignment Issue Order proposé ; relation d’appui sémantique, pas équivalence documentaire/capacité.

ELM628 situe Issue dans les types de Sales Order ; ELM629 montre ses suites de livraison, stock et facturation ; ELM630 sa création sur déclaration de ventes/consommations. Versions et passages propres conservés. Le document ne se limite pas au juridique, et la vente finale ne se confond pas avec l’obligation entre consignateur et détenteur.

Recommandation : garder l’intention de vente sous Sales Order, distinguer ses variantes de consignation et faire appliquer les effets de propriété par Inventory. Un document Issue peut matérialiser une obligation sans justifier une deuxième capacité de demande. Bénéfice : éviter le doublon de besoin et préserver les responsabilités ; compromis : parties, faits générateurs et liens documentaires doivent être explicites. Deux variantes U604 conservées sans sous-comportements ni noms automatiquement validés. C117 corrige la conclusion antérieure ; recommandation en attente de décision, aucun changement canonique.


Précision CMP262 — U607 adopte Consignment Issue comme comportement de Sales Order. BHV096 et REL-BEHAVIOR-BHV096 portent le nom, la nature et le parent ; les descriptions et comparaisons restent proposées. ELM628/629 effectivement relus lors d’U606 sont exposés sur la fiche. Deux documents SAP étayent ce choix sans consensus interéditeurs présumé. Les modalités acquisition pour revente et vente pour compte restent décrites sans sous-comportements.


Précision U608 — Le critère FLOW part de l’intention de l’acteur déclencheur et du résultat attendu. ELM628/629 montrent pourquoi catégorie/type documentaire et capacité métier ne se confondent pas. Cette règle de modélisation ne prétend pas être une prescription SAP ; elle justifie le comportement U607 sans générer une seconde demande à partir d’un effet juridique.


## CMP263

U611 — Codex, 22 septembre 2026. [Étude des Orders](../modeles/backlog/consignment-orders-market-review-U595.yaml), goods_return_review_U611. État comparé : D04.l Customer Return et ses cinq comportements ; D04.m Supplier Return distinct. Proposition Goods Return avec Customer Return / Consignment Return, Pick-up distinct. Relation : appui sémantique et recouvrement partiel ; pas équivalence de taxonomie.

ELM615/625 SAP FMS/S/4 distinguent retour après Issue et reprise sans Issue. ELM631 SAP Business One emploie Goods Return côté fournisseur. ELM632 Microsoft rattache les retours après vente aux RMA avec plusieurs parcours ; ELM622 IFS atteste une RMA de consignation avant consommation pour défaut. Éditions et passages conservés ; aucune nomenclature universelle démontrée.

Recommandation : regroupement par intention de retour après vente défendable ; qualifier Goods Return pour éviter son extension implicite aux fournisseurs. Consignment Return est aussi un retour client au sens large : préciser les variantes plutôt que présumer leur exclusivité. Pick-up reste une reprise de biens restés consignés, quel que soit l’acteur qui la demande. Bénéfice : intention commune et effets distincts ; compromis : nom général et réorganisation des cinq comportements existants, sans sous-comportements. Aucun renommage, suppression de comportement ni fusion de Supplier Return effectué. Proposition en attente de décision après comparaison.


## CMP264

U612 — Codex, 22 septembre 2026. D04.l renommé Return Order, comportements BHV050–054 conservés. ELM632 Microsoft Sales returns directement relu : demande initiale, suites possibles et distinctions entre autorisation, crédit et traitement. Les appuis SAP ELM455 et Microsoft ELM438 de la fiche restent conservés ; nouvelle correspondance Microsoft ajoutée sur la fiche. Relation : appui sémantique, pas équivalence de modèle de capacités.

La préférence pour Microsoft exprime le choix FLOW de partir de l’intention, non une supériorité universelle prouvée. Return Order évite l’évocation B2C ressentie par Laurent, bien que Customer ne soit pas limité au B2C chez les éditeurs. Bénéfice : stabilité des comportements dans les contextes B2C, wholesale et consignation. Contrat et autorisations déterminent les suites applicables, dont réparation pour compte du fournisseur ; aucune règle ni déploiement inféré. U611 est dépassé : pas de subdivision Customer Return / Consignment Return. Pas de fusion implicite de Supplier Return. Nom retenu U612 ; prose détaillée éditoriale.


## CMP265

U620/U621 — Codex, 22 septembre 2026. État comparé : MOD013 et hiérarchie Domain → Area → Capability → Behavior du backlog courant. ELM633–642 : SAP RBA, DDD (Nick Tune et Microsoft), TOGAF, Guild, BIAN, APQC, IBM CBM, LeanIX et Ardoq. Relation : appuis méthodologiques et recouvrements partiels, sans équivalence des niveaux.

Le regroupement intermédiaire répond selon les méthodes à une présentation, une décomposition de capacité ou une partition de responsabilités. Proposition FLOW : conserver Area comme périmètre cohérent de responsabilités, avec finalité, exclusions et échanges explicites. Bénéfice : éprouver la répartition avant les capacités. Compromis : définition locale à maintenir ; aucun bounded context, objet unique, processus, organe ou module imposé. U618 sur l’Area unique référentiels/policies reste acquis. Recommandation non adoptée, aucune modification canonique. [Sources, comparaison et tests](etudes/2026-09-22-area-level.md) ; [annexe structurée](../modeles/backlog/area-level-market-study-U620.yaml).


## CMP266

U634–U636 — Codex, 23 septembre 2026. État comparé : Apply Plan D02.e, comportement du Planning commun D05.f, et proposition d’élargissement U635. Relation : recouvrements fonctionnels partiels ; aucune équivalence de taxonomie. [Étude et passages](../modeles/backlog/apply-plan-market-review-U636.yaml).

Huit documents principaux : ELM566, ELM419, ELM416, ELM413, ELM643, ELM644, ELM645 et ELM551. Les sources étayent passage du plan aux changements opérationnels, autorisations distinctes, suites et limites d’application. Les notifications sont documentées côté gestion des commandes ; leur déclenchement par Apply Plan est une articulation FLOW proposée, sans intégration native démontrée entre produits. Kinaxis apporte un positionnement général ; la recherche ASCM n’a pas établi d’équivalent détaillé.

Recommandation proposée : faire appliquer les changements autorisés d’une version préparée, coordonner les conséquences et constater la prise en compte. Bénéfice : préserver effets partiels et refus ; compromis : coopération transverse avec les responsables des commandes et engagements. Aucun renommage, changement de définition, promotion en capacité ou accord nouveau appliqué au catalogue. Compléments documentaires de D02.e proposés ; anciennes preuves et accords conservés.


Précision U637/U638 — Laurent situe la progressivité et l’échéancier des mises à jour dans le plan et retient la possibilité d’en pousser une partie. ELM419 appuie sélection et temporalité du firming ; porter l’échéancier dans le plan reste le choix métier FLOW, sans équivalence universelle revendiquée. L’application sélective volontaire se distingue des refus partiels. Modalité à instruire dans Apply Plan ; aucun sous-comportement ajouté.


U639 adopte la modalité progressive et sélective dans Apply Plan et la distinction appliqué/en attente/refusé, avec échéancier porté par le plan. Précision appliquée sans nouveau comportement ; la comparaison CMP266 et les autres compléments restent proposés.


## CMP267

U642 — Codex, 23 septembre 2026. Apply Plan D02.e, Planning D05.f, Order Lifecycle Management D04.o et Fulfillment D06 : apprécier la révision sur la partie concernée selon les faits, engagements et dépendances. ELM646 Microsoft étaye une modification partielle avec ajustements associés ; ELM644 Oracle montre un refus après expédition. Recouvrements partiels ; aucun seuil universel ni réalisation installée déduit. Règle adoptée U642, compléments éditoriaux proposés. Bénéfice : ne pas figer toute la commande ni ignorer les liens entre parties ; compromis : les faits opérationnels et conditions de réversibilité doivent être disponibles. [Portée](../modeles/backlog/partial-order-revision-U642.yaml).


## CMP268

U644–U646 — Codex, 23 septembre 2026. Domain universe-supply renommé Demand & Supply Orchestration. ELM647 et ELM551 (deux documents Kinaxis distincts) étayent le sens large d’orchestration reliant planification et réalisation ; ils ne prouvent pas un consensus interéditeurs. Les autres appuis de la fiche sont conservés avec leurs limites propres. Nom et définition adoptés U646, rapprochement Kinaxis retenu dans la portée présentée.

Matching & Balancing et orchestration de la réalisation constituent deux dimensions, sans nouvelle hiérarchie. Bénéfice : rendre visibles demande et ressources, choix et effets. Compromis : libellé exact FLOW et métaphore biologique à expliquer, sans centralisation ou IA obligatoire. Pas d’extension des responsabilités commerciales ou physiques. [Portée et renvois](../modeles/backlog/domain-regulation-U646.yaml).


Actualisation CMP268 — U650 : le nom courant est Supply Chain Orchestration. La définition adoptée précise arbitrages, application des changements aux commandes et engagements, coordination des prestations et suivi des résultats. Les deux documents Kinaxis ELM551 et ELM647 restent pertinents pour le lien planification/réalisation ; pas de consensus interéditeurs déduit. Le libellé Demand & Supply Orchestration cité ci-dessus reste historique (U646, rejet U647).


## CMP269

U655–U660 — Codex, 23 septembre 2026. État comparé : huit sous-domaines du document de Laurent, plans APS externes U656 et plan de supply construit par Matching U657, puis piste Order Management U659/U660. [Étude structurée](../modeles/backlog/subdomains-market-review-U658.yaml). Avis demandé U658 ; aucune adoption globale, migration ou publication.

Dix-neuf documents primaires sont localisés dans l’étude, dont au moins deux distincts et pertinents pour chacun des huit sous-domaines. SAP, Oracle, Microsoft et IBM : ELM112, ELM352, ELM393–394, ELM405, ELM408, ELM415, ELM449, ELM452, ELM522 et ELM648–654 ; ELM634–635 éclairent le terme Subdomain. Les consultations antérieures valables de la session sont réutilisées. Relation : recouvrements fonctionnels partiels, appuis sémantiques et méthodologiques ; aucune équivalence de taxonomie ou de frontières produit.

Avis : découpage défendable par les responsabilités ; conserver le plan de supply au cœur de Matching. Master Data / Policies / Plans sépare des responsabilités de contexte sans prouver trois sous-domaines standards. Inventory et Fulfilment ont des appuis directs. Les offres ATP/aATP/DOM combinent toutefois choix de sources, dates, fractionnements et affectations : la frontière Availability / Matching / Fulfilment exige un partage explicite de ces décisions. Bénéfice de la proposition : rendre les responsabilités visibles ; compromis : entretenir leurs échanges et les limites de leurs choix.

Demand Management présente le principal écart terminologique : ELM648 et ELM649 le rattachent à la prévision ou aux besoins planifiés. U659/U660 distingue la demande face à l’offre et l’objet individuel. Recommandation Codex : Order Management pour gérer l’objet opérationnel durable ; conserver Demand dans les notions d’offre/demande, plans et Matching. ELM112 étaye la famille vente/achat/transfert/retour ; ELM652 montre un Order en brouillon avant soumission ; ELM522 confirme des entités Order dans l’orchestration. Ce choix conserve intention, cycle de vie et engagements ; il ne prouve ni un objet universel unique ni une architecture centrée sur les documents. Si retenu, l’engagement devient une dimension de l’Order et la formule du PDF Order = état doit être actualisée. Proposition de nom, pas accord acquis.


## CMP270

U667–U668 — Codex, 23 septembre 2026. Audit de rattachement des 58 capacités du backlog aux huit sous-domaines convenus. Proposition non appliquée : [annexe YAML](../modeles/backlog/capability-subdomain-audit-U667.yaml), [vue dérivée](../audits/2026-09-23-capacites-sous-domaines-U667.md). Les comparaisons de frontières de CMP269 sont réutilisées ; les correspondances détaillées des fiches existantes ne sont pas déclarées toutes revalidées. Aucune réalisation installée ni exhaustivité marché déduite.

Correction U668 applicable aussi aux formulations antérieures de CMP269 : **Supply Plan** désigne les prévisions d’entrées ou de sorties de stock hors achats. Le **master plan de matching** est le plan d’affectation construit et géré dans Matching. Les appellations produit Supply Planning / Master Planning ne démontrent aucune équivalence à ces deux objets FLOW. Les projections d’achat APS évoquées U656 ne sont pas assimilées à Supply Plan.

Proposition ciblée D05.i : rattacher Return Disposition Decision à Fulfilment Orchestration pour choisir le traitement logistique du bien retourné, en mobilisant Matching lorsque les conséquences affectent les ressources partagées. Recouvrement partiel avec ELM438 Microsoft (devenir du bien et actions) et ELM328 Blue Yonder (état, destination, valeur récupérable), deux documents primaires reconsultés le 23 septembre 2026. Différence : leurs offres portent aussi des effets commerciaux ou financiers hors de cette capacité FLOW. Elles ne prescrivent pas son sous-domaine. Bénéfice : ne pas attribuer au Matching toute décision économique ; compromis : transmettre les effets sur disponibilité et ressources. Statut : recommandation de Codex non adoptée.

Les deux nouvelles capacités proposées de Plans couvrent réception et visibilité des données prévisionnelles, avec les natures Demand Plan / Supply Plan distinguées. ELM415/ELM649 et ELM352 éclairent la circulation et la consommation des plans, sans établir le libellé exact ni le périmètre hors achats de Supply Plan FLOW. Celui-ci provient de U668. Aucun calcul du master plan de matching n’est transféré à l’APS.


## CMP271

U670 — Codex, 23 septembre 2026. État comparé : proposition de huit sous-domaines U667–U669 ; discussion ATP/CTP/PTP et double consommation de Supply Availability. Sources primaires relues : ELM352 Oracle GOP 25C, ELM653 SAP aATP, ELM411 Microsoft reservations ; ELM655 IBM, texte primaire indexé seulement. Recouvrements partiels : contrôle de disponibilité et alternatives pendant la commande, recommandation de dates/quantités, articulation des réservations. Oracle combine PTP avec les règles de disponibilité ; SAP recherche des sites alternatifs dans aATP. Ni trois cases exclusives ni attribution automatique de toute adaptation à CTP.

Recommandation : Availability sert directement Order Management et Matching ; Matching reste propriétaire des arbitrages et du master plan, Order Management de ses engagements. Availability respecte les affectations et contraintes déjà retenues. Avantage : réponse interactive possible sans recalcul collectif obligatoire. Compromis : rendre les engagements concurrents opposables au moment de leur sécurisation ; une consultation ne réserve pas. Les 200 ms sont un objectif envisagé, non une performance prouvée ; l’annonce sub-seconde IBM ne suffit pas à le garantir. Pas de nouvelle capacité par temps de réponse. Statut : proposition non adoptée ; aucun changement canonique de capacité. [Analyse structurée](../modeles/backlog/capability-subdomain-audit-U667.yaml), section availability_discussion_U670.


## CMP272

U671 — Codex, 23 septembre 2026. Comparaison de nom et périmètre du sous-domaine actuellement proposé Supply Availability, après U670. Deux documents primaires relus : Oracle Global Order Promising 25C (ELM352, introduction et échanges avec Order Management) et Microsoft Order promising (ELM434, mise à jour affichée 2026-04-21, introduction et calculs ATP/CTP). Appui lexical et recouvrement partiel : déterminer des réponses de fourniture en quantités/dates, avec des méthodes de disponibilité. Recommandation **Order Promising**, abrégé Promising dans la discussion. Avantage : nommer le résultat rendu au lieu de suggérer la seule connaissance du disponible. Compromis : expliciter l’usage avant création d’une commande et par Matching ; les périmètres éditeurs peuvent inclure réservation ou confirmation, que FLOW attribue séparément. SAP conserve aussi aATP (ELM653) : pas de vocabulaire universel. Proposition non adoptée, aucun renommage exécuté. [Discussion structurée](../modeles/backlog/subdomains-market-review-U658.yaml), naming_discussion_U671.


Actualisation CMP272 — U672, 23 septembre 2026 : Laurent adopte Order Promising, le raccourci Promising, sa responsabilité de déterminer et recommander la promesse, les frontières avec Matching et Order Management et l’usage avant commande ou depuis Matching présentés en réponse à U671. Appuis Oracle ELM352 et Microsoft ELM434 conservés, sans nouvelle recherche nécessaire. Nom et frontières actualisés dans l’audit ; pas d’adoption globale des placements de capacités ou de la maille ATP/CTP/PTP. Aucun changement du modèle canonique ni publication.


## CMP273

U674/U675 — Codex, 23 septembre 2026. Audit proposé, non adopté. État comparé : backlog au commit 8816726, release 2026-09-23.3 ; empreinte exacte dans [l’audit structuré](../modeles/backlog/logistics-execution-audit-U674.yaml). Cibles D04, D06, D07.a–d, D14, D03 et TER066. Sources ELM129, ELM133, ELM492, ELM656–661 : documents natifs et processus logistiques, plus analogie ODA. Correspondances ciblées, différences et adaptations dans la section comparisons de l’annexe ; aucune équivalence globale ni couverture installée déduite.

Recommandation : rendre explicite la gestion des ordres d’exécution dans Fulfilment Orchestration en clarifiant D07.b, enrichir Service Catalog et les descriptions de pilotage avec picking, packing, VAS (light touch précisé par U675) et cross-docking. Le catalogue seul ne tient pas les instances ; un neuvième sous-domaine n’est pas justifié par les seuls types de documents. Conserver les responsabilités existantes d’orchestration, adaptation, tracking et rapprochement ; éviter leur duplication par famille logistique. Les critères de séparation des ordres sont proposés, sans obligation d’un ordre par opération. Execution Order Management est un nom candidat FLOW, pas un consensus attesté. Bénéfice : lisibilité de la prestation confiée et de son résultat ; compromis : articulation explicite avec les tâches internes de l’exécutant. Aucun valideur ni date d’adoption ; modèle canonique inchangé.


Complément CMP273 — U676 : comparaison lexicale et de périmètre du regroupement D06 avec ELM662/664 (Logistics Execution SAP) et ELM663 (Supply Chain Execution, brochure Oracle historique 2009), ainsi qu’ELM492/129 (Service Order Management et catalogue TM Forum). Ces preuves attestent des noms voisins, pas un sous-domaine standard Execution Services. Recommandation conservée : distinguer réalisation logistique et pilotage des prestations ; un renommage ou une séparation nécessite un choix de périmètre explicite. Aucun nom adopté.


Réexamen CMP273 — U677/U678 et accord U679, 23 septembre 2026 : la recommandation de conserver tous les ordres sous Fulfilment est remplacée. Service Order Management est adopté comme sous-domaine distinct pour les exigences, engagements propres et évolutions des prestations confiées ; Fulfilment Orchestration conserve leur composition, coordination, dépendances et adaptation. Les familles sont au niveau capacité et sans suffixe Management, en cohérence avec Purchase Order et les autres Orders entrants. Les noms présentés sont Picking Order, Packing Order, Value-Added Service Order et Cross-Docking Order, sans liste exhaustive adoptée. Appuis ELM492/129 (nom et distinction catalogue/ordres), ELM133/659 (demande amont/prestation confiée) réutilisés ; ils ne prescrivent pas le découpage FLOW. Bénéfice : même maille pour des responsabilités comparables ; compromis : expliciter les coopérations entre gestion d’engagements et orchestration. Les rattachements détaillés existants restent à instruire. Accord et empreinte dans agreement_U679 de l’annexe ; modèle canonique inchangé.


Complément CMP273 — U680/U681 : décomposition descriptive de Value-Added Service Order en variantes de gestion Labeling / Relabeling, Repacking et Kitting / Dekitting, ce dernier conditionné au périmètre retenu. ELM658 (SAP VAS) et ELM661 (Oracle repackaging/kitting) réutilisés comme appuis sémantiques des prestations ; pas preuve de cette maille descriptive ni du détail dekitting. Bénéfice FLOW : distinguer exigences de version, conditionnement et composition, avec leurs écarts. Gestes physiques exclus ; paramètres simples au catalogue. Accord limité aux noms, angles et condition présentés ; nouvelles définitions et exemples proposés dans vas_behaviors_U681, sans application canonique.


Application CMP273 — U682, 24 septembre 2026 : Service Order Management et les quatre familles sont introduits dans le backlog ; D07.b conserve le cycle commun sous le nom proposé Service Order Lifecycle. Labeling / Relabeling et Repacking sont rattachés directement à Value-Added Service Order ; Kitting / Dekitting demeure conditionnel en annexe. Les preuves U674–U676 sont réutilisées, sans revendication de nouvelle consultation ; deux documents primaires au moins figurent sur chaque nouvelle fiche. Les comparaisons distinguent les tâches opérateur et les commandes confiées, et qualifient le découpage FLOW comme adaptation. Les placements détaillés de mise en œuvre, définitions et exemples ne sont pas globalement adoptés. La comparaison est maintenant portée dans les fiches ; aucun produit installé déduit et aucune publication déclenchée.


Complément CMP273 — U685 : ELM665 Advanced Supply Chain (Box to Hang) et ELM666 Berry Services (Mise sur cintre, extrait indexé) attestent la prestation et apportent un appui sémantique à Value-Added Service Order / Repacking. Le passage à un conditionnement suspendu est une transformation de présentation, pas la constitution d’un ensemble de composants au sens Kitting discuté. Placement comme exemple de Repacking proposé par Codex, non adopté ; prestations composites des fournisseurs, pas taxonomie de comportements FLOW. Aucune modification canonique.


## CMP274

**Objet :** opérations VAS et frontières de Value-Added Service Order, Repacking, Labeling / Relabeling, Service Catalog et Service Order Management. **État comparé :** backlog après U682, lu le 24 septembre 2026 ; publication inchangée. **Preuves :** ELM667–682, complétées par ELM665/666 et les appuis WMS ELM658/661. **Relation :** recouvrement partiel et appui sémantique, pas équivalence entre catalogue d’exécutant et capacité FLOW.

**Commun :** prestations spécifiées sur des produits, conditionnements et compositions ; besoin de résultats conformes. **Différences :** les prestataires regroupent parfois aussi transport, conseil, photographie ou fin de vie sous VAS ; FLOW distingue demande de prestation, coordination et réalisation physique. Reconditioning est souvent plus large que Repacking. **Proposition et bénéfice :** conserver les familles existantes, examiner finition, nettoyage, réparation, personnalisation et inspection à partir de résultats distincts, plutôt qu’un comportement par geste. **Compromis :** visibilité métier sans recopier un catalogue WMS ; quelques frontières restent à arbitrer.

**Statut :** recherche et recommandations proposées par Codex le 24 septembre 2026, non validées. U686 accepte seulement la mise sur cintre comme exemple conditionnel de Repacking et commande l’étude. Deux sources primaires distinctes sont associées à chaque recommandation dans [l’annexe](../modeles/backlog/value-added-logistics-review-U686.yaml) ; certaines opérations spécialisées ont une preuve unique, explicitée. Ni couverture universelle ni réalisation Beaumanoir. [Rapport](../audits/2026-09-24-operations-logistiques-valeur-ajoutee-U686.md).


**CMP274 — réexamen ciblé U687, 24 septembre 2026.** Sources U686 réutilisées, passages et périmètres toujours pertinents. Filtre fashion et proposition de familles Order documentés dans la section `fashion_refinement_U687` de l’annexe. Deux sources par famille, sans prétendre que chaque variante est attestée par les deux. Le marché étaye les prestations ; la promotion de familles au niveau capacité, l’intégration de Repacking dans Packing Order et le retrait éventuel de Value-Added Service Order sont des recommandations FLOW non adoptées. Le Service Catalog conserve le détail et Fulfilment Orchestration les compositions.


**CMP273 — précision U692, 24 septembre 2026.** Appuis ELM492 (TM Forum Service Order Management) et ELM659 (Oracle demandes et confirmations logistiques) réutilisés : ils étayent gestion des demandes et fourniture de prestations, sans établir un standard de commande composée de listes ordonnées. La conservation des exigences d’enchaînement par Service Order Management et le pilotage par Fulfilment Orchestration constituent un choix FLOW validé U692, décrit dans la fiche du sous-domaine. Ni nouvelle famille ni nouveau niveau de modèle induit.


## CMP275

**Objet FLOW :** Transport Order (`service-order-transport`), backlog du 24 septembre 2026. **Sources :** ELM683 (SAP S/4HANA 2025 FPS01, Maintain Generic Transportation Order) et ELM684 (Oracle OTM 25C, Order Release), passages consultés le 24 septembre 2026. **Relation :** recouvrement partiel. **Commun :** demande de déplacement, biens concernés et contraintes ; SAP documente création, modification et annulation, Oracle lieux et fenêtres temporelles. **Différences :** catégories de documents SAP et demande/expéditions Oracle ne sont pas une taxonomie de capacités ; aucun engagement de transporteur déduit du seul Order Release. **Position FLOW :** une famille de prestation confiée dans Service Order Management ; Fulfilment coordonne, le transporteur organise ses opérations, les modes restent variantes. **Bénéfice :** visibilité du transport à la même maille que les prestations d’entrepôt. **Compromis :** ne détaille pas toutes les responsabilités internes d’un TMS. **Statut :** famille et frontière adoptées par Laurent U698 le 24 septembre 2026 ; comparaison détaillée proposée par Codex, aucune preuve installée Beaumanoir. **Nom :** Transport Order adopté, voisin de Transportation Order ; pas de traduction universelle d’Order Release. **Définition :** gestion des exigences et engagements du déplacement, pas planification complète ou opération du transporteur.


## CMP276

**État comparé :** backlog du 24 septembre 2026, Transport Order adopté U698. **Question U699/U700 :** variantes de gestion ou plusieurs capacités ? **Sources :** ELM685–697 ; documents primaires SAP, Oracle, DHL, UPS et DCSA, passages et accès consignés. **Relation :** recouvrement partiel et appui sémantique. **Commun :** multi-arrêts, étapes, services programmés, rendez-vous, changements de remise et booking. **Différence :** les sources mêlent demande, planification, documents et services commerciaux ; FLOW décrit la tenue de l’engagement de prestation, la coordination restant dans Fulfilment.

**Proposition Codex :** cinq comportements terminaux combinables sous Transport Order ; Transport Booking Order distinct seulement pour un engagement autonome de capacité. Deux documents primaires par proposition, avec portée de chacun précisée dans [l’annexe du backlog](../modeles/backlog/transport-order-behavior-proposals-U699.yaml). Scheduled Transport repose sur deux documents SAP, sans consensus interéditeurs revendiqué. Une demande transport peut avoir plusieurs étapes sans devenir plusieurs intentions ; inversement réserver de la capacité peut avoir une finalité propre. **Bénéfice :** clarifier les résultats attendus sans copier les écrans TMS. **Compromis :** aucune famille supplémentaire imposée par mode ; couverture du booking dans FLOW reste à qualifier. **Statut :** proposé le 24 septembre 2026, non validé ; auteur Codex. Pas de réalisation Beaumanoir déduite. [Synthèse de recherche](transport-orders-et-variantes-U699.md).


## CMP277

**État comparé :** backlog du 24 septembre 2026, D14 Service Catalog, D07.b Service Order Lifecycle, Service Order Management et Fulfilment Orchestration. **Sources :** ELM698–705, ASCM, SAP, Oracle et DHL. **Relation :** recouvrement partiel et appui sémantique. **Commun :** documents logistiques, procédures douanières et orchestration de la facturation/paiement contribuent au processus SCM. **Différence :** SCOR décrit le processus de bout en bout ; les éditeurs séparent traitement financier et orchestration. Aucune taxonomie universelle des Orders établie.

**Proposition Codex :** étendre les services orchestrés aux documents, au dédouanement et à la facturation ; encaissement seulement pour une demande active confiée à FLOW. Deux documents primaires distincts au moins par proposition, portées et limites dans [l’annexe du backlog unique](../modeles/backlog/document-financial-services-U702.yaml). **Bénéfice :** rendre explicites résultats, engagements et dépendances au-delà des seuls mouvements physiques. **Compromis :** distinguer production documentaire, procédure et effet financier ; pas d’absorption de toute la Finance ni de création systématique d’Order pour une sortie automatique. **Statut :** proposé, non adopté ; Codex, 2026-09-24 ; aucune preuve de réalisation Beaumanoir. U703 autorise l’étude de l’élargissement, pas son adoption.


## CMP278

Backlog corrigé U707/C118 le 24 septembre 2026 par Codex : dix familles fashion dans Service Order Management ; VAS retiré, Repacking sous Packing. Appuis primaires déjà consultés ELM667–680, deux documents pertinents par nouvelle fiche. Les sources décrivent les prestations ; les noms composés Order et la responsabilité de tenue de demandes sont une adaptation FLOW, pas un standard interéditeurs. Résultats distincts : conditionnement, composition, information appliquée, aspect, propreté, réparation, personnalisation et constat. Bénéfice : rendre les engagements visibles sans fourre-tout. Compromis : aucune capacité par technique opérateur ; pas de preuve installée Beaumanoir. Familles confirmées U707 ; descriptions et comparaisons proposées.


## CMP279

U710, backlog du 24 septembre 2026, proposition Codex. ELM706/707 étayent séparation entre attribut de classement, regroupement visuel et structure ; ni la taxonomie de rôles ni la règle zéro-ou-deux ne sont un standard marché. ELM708/709 documentent les interactions entre commandes, processus et services exécutants ; supprimer Service Order Lifecycle est un choix de cohérence FLOW, en conservant la tenue des engagements dans chaque famille et la coordination dans Fulfilment. Supply Protection Policy précise le rôle déjà décrit ; comparaisons primaires existantes de D02.b conservées, sans changement de périmètre. Bénéfice : moins de redondance et meilleur repérage. Compromis : rôle dominant simplificateur, catégories limitées aux sous-domaines chargés ; migration structurelle proposée dans model-readability-U710.yaml, non appliquée automatiquement.


## CMP280

U712, étude Codex du 24 septembre 2026. SAP MDI (ELM710) documente producteurs, consommateurs et objets ; Microsoft (ELM711/712) les frontières sémantiques et contrats de domaines. Appui au type Integration et à l’axe de provenance, pas preuve d’une taxonomie universelle de capacités. Oracle ELM713/714 distingue réception d’événements, corrélation et exploitation ; deux documents du même éditeur ne valent pas consensus. Proposer Integration pour les ingestions ; conserver la distinction avec les états métier produits par Inventory Tracking et Operations Tracking. Regrouper Master Data Ingestion par domaines sources est cohérent avec U514/U515, en conservant les sept sujets et sans inventer les fournisseurs. Échanges est une catégorie visuelle locale. Bénéfice : rendre les frontières et contrats visibles ; compromis : ne pas déplacer toutes les responsabilités alimentées par événements vers un type technique. Proposition dans integration-type-U712.yaml ; non appliquée.


## CMP281

U719 — Codex, 24 septembre 2026. Réexamen de U516/CMP210 sur le backlog courant. ELM530 Salesforce ProductPriceModel reconsulté : prix contextualisé selon site, client, date, devise et quantité ; ELM715/716 Microsoft distinguent tarification et assortiment. Le couple assortiment/tarif contribue au calcul sans suffire universellement. ELM717 Oracle Fusion étaye la substitution en pénurie ; ELM718 JD Edwards World illustre historiquement le choix du prix original ou substitut, sans extrapolation à Fusion. Deux documents par comparaison : ELM530/715 pour Price Book et calcul, ELM716/715 pour assortiment/prix, ELM717/718 pour substitution (un seul éditeur, pas consensus).

Recommandation : référentiel Price Book et capacité Price Book Visibility dans Master Data, alimentation via l’ingestion commune depuis Commerce sous réserve du contrat réel ; séparer les tarifs des prix actuellement mélangés dans Product Catalog. L’autorité de pricing commercial reste extérieure ; Supply obtient une évaluation pour ses alternatives, arbitre les effets économiques et Order Management porte les changements autorisés des engagements. Prix payé, prix de référence, coût et marge restent distincts. Pas de nouvelle capacité Pricing générique ni de Policy autonome sans instruction complémentaire. Proposition, aucune modification canonique. [Proposition structurée](../modeles/backlog/price-book-boundary-U719.yaml).


Complément CMP281 — U720 : Oracle Rate Inquiry (ELM719) expose itinéraires et coûts, Microsoft Landed Cost (ELM720) estime et affecte les coûts aux marchandises. Recouvrement partiel : évaluer économiquement les alternatives Supply. Limite : aucun de ces documents ne prouve qu’un surcoût de trajet augmente automatiquement le prix engagé avec le client. Recommandation : articuler tarifs produits et tarifs de prestations distincts, évaluation des options et autorité commerciale externe. Pas de Price Book unique imposé pour produits et transport.


Complément CMP281 — U721 : ELM721 Salesforce et ELM531 Microsoft étayent un même concept de tarif pour produits et services. Réviser la proposition : Price Book est un sujet tarifaire commun, avec des livres distincts selon contexte et autorité ; Product Catalog et Service Catalog décrivent leurs offres respectives et référencent les tarifs. Distinguer tarifs produits/services reste utile, mais ne justifie pas automatiquement deux types de référentiels. Prix fixe, unité, tranche et contexte d’application ne constituent pas à eux seuls le prix final de la commande. Proposition non encore appliquée.


## CMP282

U722 — Codex, 24 septembre 2026. Comparaison des noms du backlog et du Price Book proposé U719–U721. ELM722 Microsoft et ELM723 Salesforce distinguent catalogue et composantes tarifaires ; ELM716 conserve Assortment, ELM721/531 attestent Price Book / Price List pour produits et services. Les vocabulaires se recouvrent parfois : Salesforce décrit aussi le Price Book comme un catalogue de produits et services tarifés. On ne peut en déduire une norme « toute offre doit porter Catalog ».

Recommandation FLOW : Catalog nomme une collection structurée de produits ou services proposés, consultable pour identifier ce qui peut être demandé ; conserver Product Catalog et Service Catalog. Assortment nomme la sélection affectée à un périmètre ; Price Book nomme l’ensemble tarifaire. Ne pas ajouter Catalog à tous les référentiels ni employer Price Book Catalog pour un livre tarifaire : cela pourrait désigner une collection de livres, autre objet. Bénéfice : préciser le rôle sans uniformisation artificielle ; compromis : frontière offre/sélection/tarif à expliciter malgré les recouvrements éditeurs. Deux documents primaires pour catalogue/tarif ; appuis antérieurs pour les notions conservées. Proposition non appliquée.


## CMP283

U724 — Codex, 24 septembre 2026. Audit des onze capacités et trente-six Behaviors d’Order Management, backlog après U723. [Proposition et couverture des fiches](../modeles/backlog/order-management-review-U724.yaml). Les preuves des sept familles sont conservées ; recherches ciblées ELM724–733 sur les frontières remises en cause. Cycle de vie : Oracle actions d’Orders et Microsoft approbation/confirmation ; promesse : Oracle Check Availability et Microsoft Order promising ; consignation : Microsoft et SAP Business ByDesign ; structuration : Microsoft échéanciers et Oracle shipment sets ; archivage : Microsoft SCM et Business Central. Aucun document ne prescrit la taxonomie Action/Management de FLOW ni la suppression de ces capacités.

Recommandation : sept familles Action, Order Structuring et Order Visibility Knowledge. Absorber Lifecycle, Fulfillment Commitment et Archiving en préservant leurs responsabilités explicites ; ne pas déplacer l’engagement dans le calcul Promising. Supplier Return devient Supplier Return Order. Corriger les liens obsolètes vers D15 et Apply Plan décrit comme Supply Assignment. Bénéfice : cohérence avec Service Order Management, ownership lisible et moins de doublons ; compromis : maintenir le contrat commun sans perdre les dimensions et contraintes spécifiques. Audit analytique terminé, proposition non appliquée ; la liste d’actions reste dans le backlog unique.


## CMP284

U726/U727 — Codex, 24 septembre 2026. Audit des six capacités et six comportements d’Inventory Management dans le backlog après U725 ; proposition détaillée et deux documents primaires par fiche dans [l’analyse](../modeles/backlog/inventory-management-review-U726.yaml). ELM734–745 consultés ; ELM726/727 relus pour Promising. Microsoft regroupe états, intégration, réservations et ATP dans Inventory Visibility ; Oracle distingue également transactions, vues et Promising. Les regroupements produits ne sont pas un consensus de capacités. Ledger est étayé par Oracle Item Ledger et Microsoft Item Ledger Entries ; le type Knowledge est un choix FLOW, qui inclut établir et actualiser des faits.

Recommandation : distinguer Tracking, Ledger et Visibility ; conserver Stocktaking et Reservation ; remplacer le regroupement Consigned Inventory Management par Inventory Ownership Transfer avec ses deux déclencheurs contractuels existants. Répartir les autres suites dans les responsabilités déjà présentes. Inventory Visibility expose une position actuelle ou projetée, Supply Visibility les apports qualifiés, Promising une réponse calculée à une commande. Maintenir Promising autonome compte tenu des capacités, transports et contraintes économiques. Bénéfice : supprimer les doubles responsabilités et corriger les dépendances inversées ; compromis : documenter précisément l’autorisation des écritures et la provenance des projections. Propositions non appliquées, aucune équivalence de taxonomie ni réalisation Beaumanoir présumée.


**Réexamen U728 de CMP284 :** le calcul ne suffit pas à classer Promising en Decision. Microsoft Inventory Visibility inclut ATP (ELM734), et Order promising décrit ATP/CTP comme calculs de quantités, dates et capacités (ELM727) ; Oracle Check Availability sépare exploration et mise en effet (ELM726). Le modèle actuel décrit ATP et CTP comme établissement de possibilités : Knowledge est recommandé. PTP dit explicitement sélectionner : il ne devient Knowledge qu’en limitant son périmètre à l’évaluation économique et en réattribuant la sélection. La séparation du sous-domaine repose sur l’étendue des ressources et le résultat rendu, non sur le seul type Decision. Hypothèses non appliquées ; ces sources ne prescrivent aucune taxonomie universelle des trois capacités.


**Réexamen U730–U732 de CMP284 :** Laurent demande la réintégration de Promising dans Inventory Management. Deux catégories proposées : Inventory Foundation (tenue et fiabilité de la référence) et Availability & Promising (vues et possibilités de satisfaction). Relecture des documents ELM734 Microsoft Inventory Visibility, ELM727 Microsoft Order promising et ELM726 Oracle Check Availability le 24 septembre 2026 : Microsoft rassemble états/réservations/ATP ; CTP est documenté dans Order promising, pas prouvé comme fonctionnalité du produit Inventory Visibility. Oracle conserve un périmètre Global Order Promising pour explorer les possibilités. La séparation référence/exploitation est pertinente pour FLOW, pas une nomenclature standard du marché. Inventory Foundation est notre libellé ; Availability et Promising sont attestés, leur association en catégorie est locale. Le regroupement ne fusionne ni les capacités ni les responsabilités d’arbitrage et d’engagement. Répartition PTP et Delivery Schedule à finaliser ; ne pas perpétuer la recommandation précédente de D18 autonome.


## CMP285

U735 — Codex, 24 septembre 2026. ELM746–748 : Microsoft relie CTP au calcul de dates tenant compte des matériaux et capacités, avec variantes immédiate et batch ; le planning génère/ajuste des commandes planifiées. Oracle Database Promising couvre make/buy en CTP selon paramètres. La présence de nouveaux achats dans un scénario CTP est donc attestée ; leur exclusion universelle serait infondée. Pour FLOW, recommandation de distinguer faisabilité Knowledge, proposition/arbitrage opérationnel Matching et tenue de Purchase Order. BHV075 reste un calcul conditionnel ; BHV077 de rééquilibrage des engagements mérite reprise par Matching. Bénéfice : éviter un second moteur d’arbitrage dans Inventory ; compromis : conserver dans CTP les hypothèses d’apports nouveaux et coopérer avec les autorités externes sans recréer un APS. Frontière non appliquée. Promise Selection remplace le nom Delivery Schedule Decision selon accord U735 ; terme FLOW, responsabilité de sélection appuyée par les sources existantes de la fiche, sans standard lexical revendiqué.


**Application U736 de CMP285 :** frontière CTP / Matching appliquée ; BHV077 devient Order Rescheduling sous Demand & Supply Optimization Planning. Le terme simplifié est une proposition FLOW, éclairée par les actions de rescheduling Oracle (ELM726), sans prétendre que leur portée produit correspond exactement à l’étude de décalages entre commandes. L’accord porte sur le déplacement et la frontière, pas sur une adoption lexicale préalable du nom nouveau.


## CMP286

U737 — Codex, 24 septembre 2026. ELM749/750, deux cours SAP primaires, rapprochés du BHV077 Order Rescheduling sous D05.f. Point commun : réexamen des commandes en concurrence et de leurs dates/quantités selon offre et priorités. BOP SAP est plus large : stratégies de confirmation, contrôles ATP, redistribution, simulation et mise à jour des documents. FLOW répartit ces responsabilités ; BHV077 seul ne représente pas tout BOP. Order Rescheduling est plus simple mais peut sous-représenter la dimension quantité ; Backorder Processing serait un nom de processus pertinent si sa portée est explicitée, sans le limiter aux retards ni déplacer tout BOP dans ce Behavior. Comparaison seulement, pas de nouveau renommage. SAP Help Portal a fourni un extrait de recherche mais son ouverture n’a pas renvoyé de corps ; les cours constituent la preuve effectivement lue.


## CMP287

U738 — Codex, 24 septembre 2026. ELM748 relu, ELM751/752 consultés, ELM746 réutilisé. Microsoft intègre au master planning la couverture et les ajustements de dates/quantités des ordres d’approvisionnement ; CTP articule calcul des dates et planning selon sa modalité. SAP BOP (ELM749/750) met l’accent sur la redistribution des confirmations des besoins : recouvrement fonctionnel, pas équivalence complète. Pour FLOW, D05.f construit et ajuste déjà le master plan de matching ; BHV006 Simulation & Analysis étudie alternatives/impacts, BHV016 Adjust Plan prépare une révision cohérente. Recommandation : absorber l’étude des décalages BHV077 dans ces Behaviors existants plutôt que chercher un nom autonome ; conserver priorités, protections, quantités, dates et autorisations. Ne pas importer tout le MRP Microsoft ni absorber l’APS externe. Proposition seulement, aucun retrait appliqué.


## CMP288

U739 — Codex, 24 septembre 2026. ELM748/751 réutilisés et ELM753–755 consultés. Intuition d’un calcul commun gouverné par des règles étayée : choix du master plan, horizons et filtres, groupes de couverture et exceptions article, modèles de priorité. La configuration est distribuée, pas un unique paramètre policy attesté qui sélectionnerait un mode BOP. Priority-based planning n’émet pas d’action messages pour ses codes de couverture : ne pas déduire une combinabilité illimitée. SAP BOP est lui-même configurable par segments, variantes et stratégies (ELM749/750), donc aucune supériorité de souplesse Microsoft démontrée. Pour FLOW, recommander un calcul/réexamen du master plan de matching avec périmètre, objectifs, politiques et contraintes explicites ; cas de pénurie, réaffectation et réapprovisionnement décrits comme usages et règles, sans capacité autonome par scénario. Cela n’impose ni moteur logiciel unique ni API, et n’absorbe pas le planning APS externe. Proposition non appliquée.


## CMP289

U740 — Codex, 24 septembre 2026. Clarification utilisateur : BOP répond à quantité/date de confirmation ; ARun à l’affectation supply/demand. ELM749/750 et ELM756 montrent des résultats distincts et une intégration : une variante BOP peut utiliser ATP ou Supply Assignment comme méthode de contrôle. Les mêmes fonctions de lancement/configuration ne suppriment pas la frontière métier. Pour FLOW : calcul/sélection de réponse dans Availability & Promising, confirmation dans Orders, choix et application des affectations dans Matching. Corrige la recommandation trop générale d’absorption du réexamen dans le master plan : seuls les arbitrages et changements d’affectation collectifs y relèvent ; réexaminer une promesse ne requiert pas systématiquement un nouvel arbitrage global. Aucune modification du modèle appliquée dans cette clarification.


## CMP290

U741–U744 — Codex, 24 septembre 2026. Relecture Microsoft : ELM734/743 (Inventory Visibility/réservation), ELM727 (Order promising), ELM746 (CTP), ELM748/751/753–755 (master planning, actions et paramètres), ELM757–760 (pegging, marking, séquence, protection des confirmations et pools). Microsoft articule disponibilité, calcul de dates de commande et planification de couverture ; CTP mobilise le planning, sans absorber ATP dans le master plan. Pegging rapproche les apports et les besoins ; marking stabilise certains liens ; les réservations restent explicitement prises en compte. Le master plan porte aussi la génération de nouveaux approvisionnements : il dépasse donc le master plan de matching FLOW. Des règles de séquencement et de préservation des confirmations gouvernent les recalculs, mais ces documents ne démontrent pas un mode universel policy=BOP ni un équivalent complet de SAP BOP. Pour FLOW, conserver la distinction réexamen de promesses (Availability & Promising), affectation/réaffectation (Matching) et tenue de la confirmation (Orders). Une priorisation collective ou une mise en attente peut résulter des deux premières responsabilités : ce seul effet ne suffit pas à les fusionner. Correction explicite de la portée trop large de CMP287/288 et de la formulation contrôle pour ARun. Analyse documentée, catalogue non modifié.


## CMP291

U745 — Codex, 24 septembre 2026. Proposition de simplification des capacités Decision du Matching, comparée aux sources Microsoft déjà consultées ELM748/753/754/758/759 : calcul commun, règles de couverture, priorités, séquences de mobilisation et protection de la couverture confirmée. Ces fonctions justifient la distinction résultat du plan / stratégie de calcul / politique gouvernée, sans imposer une taxonomie de capacités FLOW. Fulfillment Plan Decision paraît redondant avec la production du master plan D05.f ; Order Prioritization peut devenir un mécanisme de ce calcul. Initial Stocking, Replenishment et Redistribution décrivent plutôt des finalités ou familles de décisions ; les variantes BHV083/084 (besoins datés/cible), BHV024/025 (rééquilibrage/consolidation) fournissent des points de départ concrets pour les comportements du calcul. Ne pas simplement renommer chaque Decision en Strategy. Les cibles calculées, protections recommandées et conditions de réservation restent des résultats distincts de leurs politiques actives : simplifier leur présentation ne doit pas supprimer leur calcul ni attribuer automatiquement à Policies les arbitrages contextuels. Proposition : une capacité responsable du calcul du plan avec des comportements de stratégie combinables, gouvernance/pilotage et application explicités ; aucune nouvelle hiérarchie ni fusion canonique appliquée. Bénéfice : supprimer les pseudo-autonomies décisionnelles ; compromis : rendre les résultats et contraintes de chaque stratégie lisibles et testables. Stratégies détaillées et répartition finale à valider.


## CMP292

U747 — Codex, 24 septembre 2026. Proposition Matching dans modeles/backlog/matching-refactoring-U747.yaml, comparée à ELM748/751/753/754/757–760, ELM421/412 relus et correspondances existantes des 9 capacités/22 comportements. Microsoft devient la référence principale de conception, conformément à Laurent. Recommandation de 3 capacités : Master Planning (pilotage du plan, appuis Master plans et Action messages), Matching Optimization (affectations et apports sous stratégies, appuis Coverage settings, pegging et séquence de couverture) et Supply Policy Optimization (recommandations de paramètres, appuis Safety stock journal, Coverage settings, allocation et réservation). Les deux derniers noms et leur regroupement sont des propositions FLOW, pas des modules Microsoft attestés. Microsoft ne démontre pas dans ces sources un optimiseur complet de protections/réservations ni une couverture fashion équivalente de consolidation ; les responsabilités existantes conservent leurs preuves complémentaires. La proposition maintient explicitement les cibles APS, la promesse et son réexamen, la tenue des Orders, la réservation et l’exécution dans leurs périmètres respectifs. Le master plan Microsoft demeure plus large que le périmètre FLOW. 31 successions explicites et 98 relations inventoriées ; aucune fusion canonique appliquée. La validation doit porter sur la cible complète et les frontières, non sur le dernier nom discuté seulement.


## CMP293

U748/U749 — Codex, 24 septembre 2026. Correction validée de la cible CMP292 : les trois ensembles deviennent des catégories, avec dix capacités autonomes et un master plan commun. Réutilisation des sources Microsoft ELM748/751/753/757/758/759 et des comparaisons existantes. La documentation décrit les mécanismes de calcul, le pegging, les recommandations et le paramétrage ; elle ne prescrit pas une taxonomie métier à trois ni à dix capacités. FLOW retient la maille des responsabilités et place les stratégies en comportements. Master Plan Management regroupe Master Planning, Simulation & Analysis et Plan Application ; Supply Matching regroupe Demand Prioritization, Supply Assignment, Replenishment et Stock Redistribution ; Policy Optimization regroupe Inventory Target Optimization, Group Protection Optimization et Reservation Policy Optimization. Les preuves fashion complémentaires restent utiles. Accord U749 enregistré sur la structure et les familles de stratégies effectivement présentées ; descriptions, types et migrations non présentés restent proposés. La réduction à trois capacités de CMP292 est remplacée, sans rétablir une fragmentation par paramètre. Le modèle canonique n’est pas modifié par cet enregistrement de validation.


## CMP294

U749/U750 — Codex, 25 septembre 2026. Application canonique de CMP293 : trois catégories et dix capacités, sans adopter la cible abandonnée à trois capacités. Sources Microsoft déjà consultées ELM748/751/753/754/757/758/759 réutilisées, avec sources complémentaires des fiches existantes. Supply Assignment distingue préservation et réaffectation ; le pegging Microsoft éclaire le choix de liens tandis que Plan Application matérialise les changements autorisés et Reservation bloque les usages concurrents. Simulation & Analysis et Plan Application deviennent des capacités locales au Matching, exception explicitée au principe historique, sans généralisation. Initial Stocking est intégré à Replenishment avec ses descriptions et preuves fashion ; BHV077 est intégré dans simulation, révision et réaffectation sans absorber BOP. Les comparaisons de produit ne valident pas automatiquement le type ou les nouvelles descriptions FLOW. U750 autorise l’application de la succession préparée ; aucune release implicite.


## CMP295

U751 — Codex, 25 septembre 2026. Audit Inventory sur le critère de responsabilité indépendante de l’organisation et des outils. Relecture de Microsoft consignment (ELM739) et Oracle aging (ELM740) : transfert de propriété métier réel, mais transaction de consignation ne prouvant pas une capacité autonome. Proposer sa répartition entre conditions Agreement, actes autorisés des Orders, intégration des résultats, tenue du Ledger et visibilité ; conserver déclencheurs consommation/échéance et preuves. Microsoft Inventory Visibility (ELM734) et calendrier/ATP (ELM761) appuient une visibilité stock et apports réunie, en distinguant projection et quantité promettable. Microsoft Order promising et CTP (ELM727/746), Oracle Database Promising (ELM747), établissent des calculs : le nom d’un produit Visibility ne justifie pas Knowledge. Proposition de type Calculation pour une réponse dérivée sans choix, Decision pour la sélection ; exception à formaliser au cadre méthodologique actuel, sans séparation de chaque calcul interne d’une décision. Oracle PTP (ELM762/763) sélectionne selon les coûts : notre PTP limité à l’évaluation est plus étroit. Proposer Promise Cost Evaluation pour cette évaluation et conserver le choix économique dans Promise Selection Decision, sans revendiquer ce nom comme standard marché. Ledger (ELM736/737 relus) tient les faits : Action recommandé pour sa responsabilité active, Knowledge pour la vue. Les mécanismes Stocktaking, Reservation et Tracking gardent leurs responsabilités ; leurs appuis antérieurs restent valables. Modèle canonique non modifié ; recommandations non encore approuvées.


## CMP296

U752 — Codex, 25 septembre 2026. Réutilisation des documents primaires effectivement consultés : Microsoft Inventory posting (ELM737) distingue écritures de quantité et valeur, Oracle Item Ledger (ELM736) expose l’historique, Microsoft consignment (ELM739) décrit un journal de changements de propriété et Oracle aging (ELM740) les conditions de transfert. Ces registres sont des actifs métier reconnaissables hors informatique. Proposition FLOW : Ledger qualifie la responsabilité de tenir un registre durable, daté et justifié ; le nom du registre est une convention courte pour cette capacité, comme les Orders. Ce type n’est pas une taxonomie Microsoft attestée. Proposer Inventory Ledger pour mouvements/états de stock et Inventory Ownership Ledger pour les changements de propriétaire, sous Inventory Foundation. Un même événement peut porter deux effets reliés sans compter deux fois le stock. Tracking recueille les faits, Ledger les reconnaît et les conserve, Visibility compose la situation. Le registre ne constitue pas seul l’acte d’acquisition ni la comptabilité financière. Cette proposition remplace le retypage Action et le retrait simple de D01.h envisagés dans CMP295 ; aucune refonte du catalogue appliquée à ce stade.


## CMP297

U754 — Codex, 25 septembre 2026. Documents primaires Microsoft effectivement relus : Set up consignment (ELM739), section Inventory ownership change journal, et Change the ownership of consignment inventory based on production demand (ELM764). Recouvrement partiel : une demande de production prépare des changements de propriété ; un journal enregistre les changements lors de sa comptabilisation. FLOW propose de séparer réception des faits (Inventory Tracking, alimenté notamment par Operations Tracking), détermination métier du transfert selon accord (Inventory Ownership Transfer Decision), tenue du registre (Inventory Ownership Ledger), puis restitution du propriétaire dans Inventory Visibility. La décision détermine nécessité/admissibilité, quantité, parties et date ; elle ne déduit pas un transfert universel de toute réception ou consommation. Si un transfert est déjà établi par une source autorisée, l’intégrer sans redécider ni réexécuter. Une décision de transfert à réaliser ne vaut pas transfert réalisé : Order/Fulfilment porte l’acte et son résultat quand une exécution distincte est nécessaire. L’intégration réactive et le découpage Decision/Ledger sont des recommandations FLOW, pas une taxonomie Microsoft ni une automatisation native démontrée ; la procédure indique explicitement l’absence de traitement automatique du journal. Le cas d’échéance conserve son appui Oracle ELM740, sans l’attribuer à Microsoft. Noms anglais proposés locaux ; Ledger plus étendu que le journal de consignation entrante Microsoft. Bénéfice : distinguer preuve reçue, conséquence déterminée et fait reconnu sans multiplier les Tracking ni déplacer l’orchestration. Proposition non appliquée au catalogue.


## CMP298

U755 — Codex, 25 septembre 2026. ELM765/ELM766 Microsoft Landed cost effectivement consultés complètent la consignation ELM739/ELM764 : propriété reconnue avant réception physique dans le parcours goods-in-transit. Appui fonctionnel à une responsabilité transversale dépassant la consignation, pas équivalence à un moteur général de détermination de propriété. Proposition FLOW : Inventory Ownership Transfer Decision croise les faits et jalons pertinents avec les conditions applicables de l’accord ; Inventory Ownership Ledger conserve changement reconnu, date, quantités, parties, fait et fondement. Élargir les cas aux achats/ventes ordinaires et biens en transit ; intégrer les faits douaniers pertinents comme éléments à qualifier, sans déduire automatiquement un transfert d’un changement de statut douanier. Propriété, détention, disponibilité et statut douanier doivent rester distincts dans le modèle. Les deux comportements consommation/échéance proposés en U754 ne constituent plus une couverture exhaustive ; réexaminer les variantes de la décision sans créer une capacité ou un comportement par événement. Cette précision enrichit la proposition existante ; catalogue canonique inchangé.


## CMP299

U756 — Codex, 25 septembre 2026. Application du lot cumulatif U752–U755 sur les sources déjà consultées CMP296/CMP297/CMP298 : Inventory Ledger devient Ledger ; Inventory Ownership Ledger distinct ; D01.h devient Inventory Ownership Transfer Decision. Consommation et échéance sont conservées avec leur responsabilité de détermination ; un comportement de jalons contractuels couvre les autres cas, son nom anglais et sa rédaction restant proposés. Sources Microsoft ELM739/ELM764/ELM765/ELM766 portées aux fiches ; preuves antérieures Oracle conservées. Typologie Ledger et présentation Atlas mises en cohérence. Deux registres reliés, réception des faits et transfert déjà établi, décision, acte éventuel et résultat sont distingués ; statut douanier sans conséquence automatique sur la propriété. Les autres pistes U751 ne sont pas étendues à cet accord.


## CMP300

U758 — Codex, 25 septembre 2026. Microsoft ELM767/ELM768/ELM769 et IBM ELM770/ELM771 étayent la libération groupée, la consolidation pilotée par client et la rétention économique dans une fenêtre de délai autorisée. Comparaison du backlog : Process Orchestration D06.d coordonne les activations et dépendances, mais ne détermine pas explicitement les ensembles et moments de libération ; Process Adaptation Decision D06.f répond aux aléas et ne couvre pas naturellement la rétention anticipée en fonctionnement normal. Proposition : Service Order Release Decision dans Fulfilment Orchestration, type Decision, catégorie existante coordinate-adapt. Déterminer quels ordres éligibles retenir/libérer ensemble et quand, selon complétude, compatibilités, charge communiquée, bénéfice logistique et échéances. Deux comportements : Batch Release (fenêtres/lots de transmission pour organiser la charge) et Consolidated Release (complétude ou regroupement client/commande/destination pour traitement commun). Process Orchestration applique ; les familles de Service Orders conservent identité et engagements. Le besoin de préparation/palettisation commune doit être porté explicitement par Picking/Packing Order : transmettre simultanément ne garantit ni une préparation commune ni une seule palette. Le WMS conserve vagues, trajets, tâches et palettisation détaillée ; consolidation de release, shipment et palette restent distinctes. Order Management porte les exigences client ; Matching conserve les affectations ; aucun délai de rétention ne modifie silencieusement la promesse. Les fenêtres et seuils sont des règles, pas des capacités. Le nom FLOW est une adaptation des notions Order Release/Release to warehouse et consolidation, pas une appellation de capacité consensuelle attestée. Proposition uniquement, aucun catalogue modifié ni réouverture d’un audit clos.


## CMP301

U760 — Codex, 25 septembre 2026. Clarification sans nouvelle étude : réutiliser les sources Oracle ELM762/ELM763 déjà consultées. Oracle PTP peut sélectionner la solution la moins coûteuse parmi des possibilités à date compatible ; FLOW conserve le nom PTP pour l’évaluation économique et place le choix dans Promise Selection Decision. Recouvrement partiel explicitement assumé, pas équivalence complète. Retirer le renommage Promise Cost Evaluation et la recommandation Codex de classer les évaluations comme Decision ; proposer Evaluation pour la responsabilité distincte de calcul/qualification des possibilités. Type non encore appliqué ; aucun élargissement du périmètre ni validation globale de l’audit.


## CMP302

U761 — Codex, 25 septembre 2026. Scan ciblé Microsoft, Oracle et SAP, avec lecture primaire Microsoft Order promising et CTP (ELM727/ELM746), Oracle supply-chain search/alternative cost (ELM762/ELM763), et compléments ELM772–ELM777. Les passages SAP sont indexés, pages ouvertes sans corps exploitable ; limites conservées. Recommandation par profondeur, pas catalogue de boutons : ATP On-Hand / Projected ; CTP Supply-Based / Capacity-Constrained ; PTP Fulfillment Cost / Margin. Réservations, protections, réseau, calendriers, complétude, fractionnement, alternatives autorisées et qualité des données traversent les niveaux ; ne pas les perdre en absorbant BHV001/BHV003. Un CTP plus profond teste des capacités existantes, sans exiger leur augmentation : corriger le mot supplémentaires s’il exclut cette situation. Calcul par seuls délais et disponibilité infinie sont des estimations sans contrôle de ressources, pas une preuve d’ATP/CTP ; les documenter comme hypothèses ou repli explicite, sans nouveau comportement automatique. Les fabrications et nomenclatures multiniveaux sont couvertes par les faisabilités matière/capacité, potentiellement calculées ailleurs ; aucun sous-domaine APS créé. PTP Oracle mêle évaluation et sélection ; FLOW conserve l’évaluation et Promise Selection Decision choisit (U760). L’évaluation de marge au-delà des coûts est une proposition complémentaire appuyée par deux fonctions analytiques Oracle, pas un mode PTP standard attesté ni une décision tarifaire. Coûts amont, composants, ressources, transport, fractionnement et consolidation alimentent une évaluation de coût cohérente, sans comportement par poste de coût. Exhaustivité recherchée au niveau des familles de mécanismes dans le périmètre FLOW ; aucune liste universelle ni consensus sur les six noms proposés revendiqués. Aucun changement canonique appliqué.


### Précision CMP302 — U762

Le second niveau PTP proposé comme Margin Evaluation était trop restrictif. Laurent réaffirme un micro dossier local et contextuel des avantages/inconvénients économiques des options. Les scénarios comparés et coûts détaillés d’Oracle ELM762/ELM763, déjà consultés, étayent le chiffrage comparatif ; FLOW exclut explicitement la sélection portée dans certaines fonctions produit. Contextual Economic Impact Evaluation remplace le nom de comportement proposé ; marge/revenus seulement si utiles et étayés. Aucun nouveau scan requis pour cette clarification, aucune décision ni optimisation globale transférée à PTP.


## CMP303

U765 — Frontière Inventory Management / Order Promising. État comparé : backlog du 25 septembre 2026, après U764 ; ATP/CTP/PTP et Promise Selection encore sous Inventory Management. Auteur : Codex, 25 septembre 2026. Statut : proposition à valider, aucun déplacement canonique.

Références : Oracle ELM778 (26B, orchestration qui interroge GOP) et ELM779 (26C, consultations et options alternatives exposées), Microsoft ELM780 (ATP réutilisable dans Inventory Visibility) et ELM727 (Order promising, page relue le 25 septembre 2026 : dates ATP/CTP et réévaluation liée aux modifications d’une commande). Relations : recouvrement partiel des responsabilités ; appui lexical pour Order Promising ; contre-exemple à un découpage produit universellement autonome. Oracle distingue une responsabilité sollicitée par l’orchestration ; Microsoft confirme la réutilisation mais rattache aussi ATP à Inventory Visibility. Ces deux éditeurs ne prescrivent pas le métamodèle FLOW.

Recommandation : sous-domaine Order Promising autonome par finalité — évaluer les possibilités d’engagement et sélectionner une proposition — et non par seule mutualisation logicielle. Son nom exprime l’objet de la promesse et reste applicable avant création, pendant révision ou durant orchestration. Promising est une abréviation possible mais moins précise comme libellé canonique ; aucun élargissement au-delà de la satisfaction des demandes n’est établi.

Périmètre proposé : ATP, CTP, PTP (évaluations indépendamment mobilisables) et Promise Selection Decision (choix de proposition). Inventory Management reste responsable des stocks et engagements de quantité ; Supply Visibility y reste une connaissance amont, sans déplacement automatique. Plan Visibility fournit les plans ; Matching conserve le master plan et les affectations ; Fulfilment coordonne les prestations en cherchant à préserver la promesse ; les Orders portent la confirmation et les révisions d’engagement. Le BOP éventuel relève de la réévaluation et sélection de promesses dans cette frontière, sans création automatique d’une capacité ni transfert de l’affectation des ressources. Limites : usage dans Matching et Fulfilment recommandé pour FLOW, pas affirmation de tous les parcours natifs des produits ; aucune invocation systématique des trois évaluations, aucun recalcul à chaque changement d’état imposé.


## CMP304

U768 — Codex, 25 septembre 2026. Audit courant des comportements et scénarios, distinct de U431. Relecture primaire Microsoft ELM404 (motifs de transfert), ELM739 (parcours de consignation), ELM438 (dispositions de retour) et Oracle ELM364 (flux back-to-back). Microsoft cite plusieurs raisons de transférer avec un même ordre ; cela appuie le diagnostic des cinq motifs de Transfer Order, sans démontrer à lui seul leur classement méthodologique. Le parcours de consignation distingue apport, réception et propriété ; lancement et réapprovisionnement continu ne démontrent pas ici deux engagements d’ordre différents. Les dispositions de retour peuvent modifier obligations et résultat attendu : conserver les cinq variantes en attendant clarification de leur responsabilité propre. Oracle décrit des parcours stock, achat lié, transfert et livraison directe, avec étapes et coopération entre responsabilités : appui au récit transverse, pas importation de sa taxonomie applicative ni de son choix intégré au promising. FLOW garde évaluation, sélection de promesse, master plan, application et exécution distincts. Les sept récits pilotes sont fictifs, proposés pour confrontation ; ni observation Beaumanoir ni accord implicite. Treize familles de cas complémentaires sont enregistrées dans l’annexe U768. Aucun comportement supprimé ; sept candidats à reclassification, cinq frontières à préciser et quatre granularités à réexaminer séparément.


## CMP305

U770 — Codex, 25 septembre 2026. Audit du modèle courant après la release 2026-09-25.3, sans modification canonique. ELM739/ELM781 corrigent l’attribution du libellé Microsoft : Consignment replenishment order, et non Consignment Fill-up Order. ELM372/ELM393 confirment que les produits combinent évaluation économique et sélection/optimisation ; FLOW conserve sa séparation PTP / Promise Selection Decision, à répercuter dans TER068 et dans les commentaires de type Evaluation. ELM746 étaye matières/capacités du CTP, sans prouver une taxonomie native Supply-Based / Capacity-Constrained ni assimiler toute alternative ABC ou tout BOP au CTP. ELM748/ELM782 montrent que le master plan et la prévision de supply Microsoft sont plus larges que le découpage externe/interne et hors achats retenu dans FLOW ; maintenir l’écart explicite, pas importer une frontière produit. ELM507/ELM445 soutiennent la distinction entre référence maintenue, apports intégrés et exploitation, sans prescrire une projection Supply passive. ELM445 et ELM364 éclairent demandes de réception, faits d’exécution et responsabilité de l’ordre ; une Receiving Order serait un arbitrage local de couverture, pas une capacité universelle déduite de ces documents. Recommandations et critères de clôture : modeles/backlog/vocabulary-boundary-audit-U770.yaml. Les 22 constats comprennent contradictions, clarifications, qualité de preuve et écarts volontaires ; ils ne valent ni accord métier ni réalisation Beaumanoir. Aucun renommage automatique, aucune fusion générale recommandée.


## CMP306

U771 — Application autonome de l’audit U770, Codex, 25 septembre 2026. État comparé : backlog après publication 2026-09-25.3. Les contradictions lexicales et les frontières signalées sont corrigées ; les écarts intentionnels avec les produits sont conservés. Les arguments des comparaisons existantes sont reformulés à partir de leurs rapprochements et limites documentés, sans prétendre à une nouvelle consultation de toutes leurs sources ni à un consensus.

Receiving Order est ajouté dans Service Order Management. Microsoft ELM133 et ELM445, relus le 25 septembre 2026, distinguent la demande entrante de prestation d’entrepôt, la commande commerciale source et les retours de réception. Recouvrement partiel : FLOW porte la demande, les engagements et le résultat attendu ; l’exécutant réalise, Inventory reconnaît les faits de stock, Fulfilment coordonne. Le nom Receiving Order et sa maille de capacité sont des choix FLOW, pas une appellation universelle démontrée par deux documents du même éditeur. Le scénario fictif de réception partielle expose ces responsabilités sans preuve de réalisation Beaumanoir. Application autorisée par délégation U771 ; aucune validation mot à mot des nouvelles rédactions ni publication implicite.


## CMP307

U774 — Codex, 25 septembre 2026. Recherche primaire conduite à partir des responsabilités du backlog pour vérifier U772 : Microsoft Dynamics et SAP S/4HANA sur chaque fiche comparée. Les rapprochements sont appliqués dans les comparaisons du modèle et du glossaire, avec limites, dates et sources. Aucune modification des frontières ni validation implicite des nouveaux textes.

Convergences documentées : stock et journal des mouvements, engagements commerciaux, prestations confiées, kitting, transport, données maîtres, orchestration et promesse. Écarts conservés : ARun affecte tandis que BOP revoit la confirmation ; le MRP ne représente pas tout le master plan FLOW ; une vague WMS ne suffit pas à démontrer la décision de rétention amont ; les coûts calculés ne sont pas un PTP économique complet ; les interfaces ne définissent pas les domaines sources Commerce, Finance et Design. Les documents de service SAP et Dynamics ont souvent un périmètre vendu ou exécuté, distinct de la demande de prestation FLOW.

Encaissement : SAP Digital Payments documente l’appel à un prestataire et le retour de résultat ; le document Microsoft sur les autorisations indique une limite sur le résultat asynchrone de capture. Douane : la délégation S/4HANA vers GTS appuie la frontière ; la source Dynamics consultée est une localisation Russie, pas une preuve de couverture française. Les spécialités textiles ne sont pas couvertes par une simple documentation générique de services.

La présence de deux familles produit ne certifie pas une équivalence de périmètre. Les lacunes, sources inaccessibles et appuis partiels restent dans le contrôle courant U773, enrichi par cette recherche ; aucune seconde backlog ni publication.


## CMP308

U775 — Codex, 25 septembre 2026. Confrontation de couverture des neuf sous-domaines, 72 capacités et 75 comportements à Dynamics et S/4HANA. Réemploi de l’étude U774 et sources ciblées sur interdiction d’usage, traçabilité, transport, mise au rebut et protocoles d’inspection. Les fonctions éditeur mêlent fréquemment décision, enregistrement et exécution ; la proposition FLOW les distingue sans imposer leur implantation.

Quatre capacités candidates : Inventory Usage Decision, Inventory Traceability, Transport Plan Decision et Scrapping Order. Extension proposée de Return Disposition Decision hors retours ; deux variantes contractuelles d’Inspection Order ; provenance des alternatives à préciser. Stocktaking Order reste conditionnel à une prestation autonome ; pas de nouvelle capacité de cycle de vie, de comptage par seuil ni de promising par option. Le rappel produit est d’abord un scénario transverse ; le rangement interne ne devient pas automatiquement un ordre.

Les appuis de chaque proposition, leur frontière, les écarts et limites sont enregistrés dans l’annexe du backlog modeles/backlog/market-coverage-audit-U775.yaml. Les termes et décompositions sont des recommandations, non une nomenclature native commune ni un consensus. Absence documentaire n’est pas absence fonctionnelle. Aucun changement canonique ni accord déduit de la demande d’audit.


## CMP309

U778–U780 — Codex, 26 septembre 2026. Comparaison de la vue d’ensemble et des frontières de domaine aux périmètres SAP S/4HANA 2025 et aux processus Microsoft Dynamics 365, ELM840–ELM846. Recouvrement partiel : les noms Sales et Sourcing and Procurement ont un appui SAP direct ; les trois Business Systems et l’autonomie de l’orchestration sont des conventions FLOW. Aucun consensus ni équivalence exacte de système n’est établi. Chaque nouvelle fiche et son terme associé portent leurs deux appuis primaires et leurs limites.

Le découpage distingue responsabilité commerciale, satisfaction opérationnelle et réalisation. Les processus éditeur traversent aussi Finance ; leurs frontières ne sont pas reprises automatiquement. La douane reste partiellement documentée par les appuis logistiques généraux, et la gouvernance de conformité dépasse les appuis Finance. U780 autorise le cadrage, les noms et les rattachements ; les comparaisons et rédactions nouvelles restent proposées. Sources, justification et contrôles de livraison : [lot canonique](../modeles/backlog/business-systems-U780.yaml).
## CMP310

U813 — Codex, 28 septembre 2026. Statut : rapprochement proposé, sans validation. État comparé : backlog YAML courant lu à cette date, version déclarée 2026-09-13.3. ELM847–ELM852 confrontés aux périmètres Inventory Tracking (D01.f), Inventory Ledger (D01.g), Inventory Ownership Ledger (inventory-ownership-ledger), Operations Tracking (D07.d), Billing Order (service-order-billing), Payment Collection Order (service-order-payment-collection) et Finance Ingestion (master-data-ingestion-finance).

Relation : recouvrement partiel pour la tenue et l’intégration des faits ; appui fonctionnel à une responsabilité candidate de fourniture des faits à la comptabilité. Dynamics et S/4HANA distinguent pertinence et traduction comptables ; les mécanismes documentés mêlent souvent ces responsabilités dans une réalisation intégrée. Axway complète par une plateforme spécialisée. Aucune équivalence exacte ni consensus de nommage.

Adaptation recommandée : expliciter préparation, sélection selon contrat convenu avec Finance et suivi des faits transmis, sans absorber interprétation ni comptabilisation. Bénéfice : responsabilité de complétude et traitement des corrections identifiable. Compromis : éviter une duplication des règles comptables ; parent et maille restent à discuter. Le nom de travail Accounting Event Provisioning est local ; aucun nœud ajouté. Les registres existants fournissent les faits, Billing Order ne couvre pas toutes leurs familles et Finance Ingestion concerne le sens entrant depuis Finance. Aucun flux Beaumanoir déduit. [Étude, preuves et limites](faits-gestion-comptabilite-U813.md).

## CMP311

U822 — Codex, 28 septembre 2026. Statut proposé, aucun valideur. État comparé : backlog courant, frontières D04, D01, D06, domain-plan et system-design-development, et capacités comptables adoptées en principe U818 mais non encore rattachées. ELM853–ELM857 complètent ELM847–ELM852. Recouvrement partiel avec les alimentations planning et les retours produit documentés dans Dynamics et S/4HANA ; appui technique à la diffusion externe, aucune équivalence native de sous-domaine.

Recommandation : Operational Data Sharing pourrait regrouper Accounting Data Provision, Planning Data Provision et Product Feedback, selon leurs finalités et contrats propres. Bénéfice : responsabilité commune de fourniture des données sans élargir Order Management. Compromis : éviter doublon des registres, plateforme technique déguisée et découpage par logiciel ; les consommateurs conservent interprétation, calcul des plans et décision produit. Product Feedback reste à qualifier sur les faits attendus du PLM. Adaptation proposée uniquement ; aucun flux installé ni nouvelle capacité canonique déduits. [Analyse et preuves](diffusion-donnees-operationnelles-U822.md).
