# Éléments de référence examinés

État : 2026-09-09. Les identifiants ELM sont des clés locales de traçabilité, jamais des identifiants attribués par les organismes. Les six libellés IBM ci-dessous constituent une sélection, pas la reproduction de sa carte.

## ELM001

- Référence : [MKT04](catalogue.md#mkt04), SAP RBA.
- Élément : trois niveaux de décomposition (Business Domain, Business Area, Business Capability), regroupés au niveau supérieur Enterprise Domain ; libellés et sources dans MKT04. Correction U24/C31 du 2026-09-09.
- Localisateur : leçon Defining Business Architecture, passage sur les niveaux de granularité ; complément Discovering the Reference Architecture Content, sections Reference Architecture Content Example et Business Capability Model Example, pour Enterprise Domain.
- Version : cours public consulté le 2026-09-09, édition du catalogue non établie.
- Nature : convention de structuration ; identifiant natif non fourni dans la leçon.
- Reformulation : rattacher une capacité à une aire métier, puis à un domaine métier, lui-même regroupé dans un domaine d’entreprise. La chaîne complète comporte quatre niveaux visibles.
- Limite : aucune correspondance automatique avec les trois niveaux proposés pour Beaumanoir.

## ELM002

- Référence : [MKT04](catalogue.md#mkt04), même leçon.
- Élément : séparation entre capacités, activités de processus et capacités de solution.
- Localisateur : passages décrivant les architectures métier et de solution.
- Version : même état documentaire que ELM001.
- Nature : règle de métamodèle ; identifiant natif non fourni.
- Reformulation : distinguer le besoin métier, son déroulement et son support logiciel.
- Limite : les liens locaux doivent encore être définis et validés.
- Réexamen U48 du 2026-09-10 : [Defining Business Architecture](https://learning.sap.com/courses/intelligent-enterprise-architecture-fundamentals/defining-business-architecture), passages sur les modèles de capacités, de processus et de solution consultés. Édition non précisée. Appui de CMP029 ; aucune exclusion universelle de la coordination des cartes métier déduite.

## Sélection IBM

Source commune : [MKT06](catalogue.md#mkt06), publication G510-6163-00, 2005, figure 6, page PDF 11 (page imprimée 9). Consultation du texte de la figure le 2026-09-09. Nature : composants d'un exemple retail. Identifiants natifs non fournis ; définitions détaillées absentes de l'extrait. Les reformulations françaises servent uniquement au repérage.

| Identifiant local | Libellé natif | Reformulation de repérage |
| --- | --- | --- |
| ELM003 | Item management | Gestion des articles |
| ELM004 | Allocation | Allocation |
| ELM005 | Replenishment | Réassort |
| ELM006 | Order management | Gestion des commandes |
| ELM007 | Customer service | Service client |
| ELM008 | Reverse logistics | Logistique des retours |

La définition native demeure « non disponible dans le passage consulté » pour ELM003–ELM008. Les correspondances sont donc limitées à des pistes lexicales. La sélection ne fixe ni leur place dans notre hiérarchie ni leur responsabilité organisationnelle.

## Appuis pour les deux couches

Examen du 2026-09-09 par Codex, à partir de U18/U19. Les définitions ci-dessous sont reformulées, sans citation normative littérale. Les sources officielles, éditions et limites d'accès sont centralisées dans les fiches MKT indiquées ; aucun identifiant natif distinct du localisateur n'est attribué à ces concepts.

### ELM009

- Référence : [MKT04](catalogue.md#mkt04), leçons SAP publiques, édition inconnue ; approfondissement de ELM002.
- Libellés natifs : *Business Capability Model*, *Business Process Model*, *Solution Capability*, *Solution Process*. Nature : distinction de métamodèle.
- Localisateur : *Discovering the Reference Architecture Content*, sections *Linking Business and Solution* et *RBA Link to RSA* ; *Designing Application Architecture*, *Product Map* et *Solution Process*.
- Définition reformulée : capacités et processus sont deux modèles métier indépendants des solutions ; leurs réalisations sont décrites séparément et reliées aux composants.
- Limite : ne prescrit pas que les capacités appartiennent exclusivement au socle transactionnel, ni que les processus seraient dépourvus de modèle métier propre.

### ELM010

- Référence : [MKT09](catalogue.md#mkt09), SOA-RM 1.0, 12 octobre 2006.
- Libellés natifs : *Service*, *Service Description*, *Policies and Contracts*. Nature : concepts d'architecture de services.
- Localisateur : §§3.1, 3.3.1 et 3.3.2.
- Définition reformulée : le service ouvre l'accès à des capacités ; sa description et ses politiques/contrats précisent les conditions d'interaction.
- Limite : ne constitue ni notre contrat métier complet, ni un choix HTTP, événementiel ou de plateforme.

### ELM011

- Référence : [MKT10](catalogue.md#mkt10), CMMN 1.1, décembre 2016.
- Libellés natifs : *Case*, *Case File*, *Case Plan Model*, *Case Roles*, *Tasks*. Nature : concepts de modélisation de dossiers.
- Localisateur : §§4.1, 4.3 et 5.2.2.
- Définition reformulée : un dossier articule informations, plan de traitement, rôles et tâches ; c'est un appui pour décrire les objets et comportements de la couche haute.
- Limite : la persistance durable et l'urbanisation propres demandées par U19 restent des exigences locales ; CMMN n'impose ici ni schéma de stockage ni modèle RBAC complet.

### ELM012

- Référence : [MKT11](catalogue.md#mkt11), OpenAPI Specification 3.2.0, introduction.
- Libellé natif : *OpenAPI Specification*. Nature : format de description d'interfaces.
- Définition reformulée : description d'API HTTP indépendante du langage de programmation.
- Limite : candidat pour la représentation d'un contrat ; sa sémantique et sa politique de compatibilité restent à définir.

### ELM013

- Référence : [MKT12](catalogue.md#mkt12), AsyncAPI Specification 3.0.0, introduction.
- Libellé natif : *AsyncAPI Specification*. Nature : format de description d'interfaces à messages.
- Définition reformulée : description des interfaces d'applications qui échangent des messages.
- Limite : ne détermine ni les faits métier publiés, ni les garanties de livraison ou d'évolution du contrat.

## Stock SAP

Examen sélectif du 2026-09-09 par Codex en réponse à U22/U23. Versions de catalogue/produit inconnues, limites dans MKT04/MKT13 ; aucun identifiant natif fourni par les passages consultés. ELM015–ELM018 sont des fonctions de solution, pas des feuilles RBA nouvellement découvertes. Reformulations françaises distinctes des libellés natifs.

### ELM014

- Référence : [MKT04](catalogue.md#mkt04), [cours RBA](https://learning.sap.com/courses/sap-enterprise-architecture-framework-foundation-introduction/discovering-the-reference-architecture-content), section *Business Capability Model Example*, première image, lue visuellement.
- Nature : extrait de hiérarchie métier et sélection de capacités.
- Libellés natifs sélectionnés : *Inventory Management*, *Order Promising*, *Warehouse Management* (Business Areas) ; *Goods Receipt Processing*, *Physical Inventory*, *Product Availability Check*, *Product Allocation Check* (Business Capabilities).
- Rattachement : les trois aires relèvent du Business Domain *Supply Chain Execution*, lui-même regroupé sous l’Enterprise Domain *Supply – Fulfill Demand* (complément U24/C31, 2026-09-09). Les deux premières capacités citées relèvent de la gestion des stocks ; les deux suivantes de la promesse de commande.
- Définition détaillée : non fournie dans l’image. Reformulation : distinguer tenue/mouvements/comptage du stock, promesse et exécution en entrepôt.
- Limite : extrait pédagogique, sans export exhaustif ni correspondance automatique avec nos niveaux ou organisations. La [note](sap-stock.md) décrit les autres feuilles observées en français.
- Réexamen U43 du 2026-09-10 : S1, sections sur Enterprise Domains, structure et exemple du modèle ; texte consulté pour les premiers regroupements. [Analyse et limites](premier-niveau-regroupement-capacites.md), CMP026 ; ancienne provenance conservée.
- Réexamen U51 du 2026-09-10 : même cours SAP, sections Reference Architecture Content Example/Framework/Business Capability Model Example consultées ; hiérarchie et exemple stock/promesse confirmés, Sourcing and Procurement repéré comme domaine. Édition du catalogue toujours inconnue. CMP031 compare des options locales, sans équivalence de domaines complets.
- Réexamen U53 du 2026-09-10 : Business Capability Model Example reconsulté ; Order Promising, Inventory Management, Warehouse Management et Transportation Management demeurent distingués sous Supply Chain Execution. Leur regroupement supérieur ne vaut pas adoption du périmètre Supply – Fulfill Demand ; CMP032.

- Réexamen U59 du 2026-09-10 : même cours, sections Framework et Business Capability Model Example ; la maille Business Area est proposée comme point de comparaison pour les domaines locaux. La hiérarchie complète est conservée ; CMP033/P78 ne valident ni chaque aire comme espace problématique local ni le catalogue principal.

- Précision U66/U67, 2026-09-11 : [ELM067](#elm067) sépare niveau natif RBA et nature de l’aptitude métier. La présentation de Supply Protection / Supply Assignment comme fonctionnalités de produit ne disqualifie pas les capacités correspondantes ; C49/CMP038.

### ELM015

- Référence : [MKT13](catalogue.md#mkt13), [cours stocks et inventaires](https://learning.sap.com/courses/inventory-management-and-physical-inventory-in-sap-s-4hana/defining-inventory-management-and-physical-inventory-1), sections *Managing Stocks by Quantity*, *Planning, Entry, and Documentation of Goods Movements* et *Carrying Out the Physical Inventory*.
- Libellé natif : *Inventory Management and Physical Inventory*. Nature : responsabilités fonctionnelles S/4HANA.
- Définition reformulée : tenir les quantités et changements de stock avec leur documentation ; confronter un comptage au stock enregistré et enregistrer les différences.
- Limite : effets en valeur traités par SAP mais finance exclue de notre domaine. Ne détermine ni autorité Beaumanoir ni organisation de l’inventaire.

### ELM016

- Référence : [MKT13](catalogue.md#mkt13), [cours disponibilité](https://learning.sap.com/courses/optimizing-advanced-logistics-and-analytics-in-sap-s-4hana-cloud-public-edition/explaining-product-availability-check_c1ca2960-2d3c-40a6-a839-ff2ad9595f08), introduction, facteurs et résultats du contrôle.
- Libellé natif : *Product Availability Check*. Nature : fonction de solution aATP, distincte de la seule observation du libellé RBA dans ELM014.
- Définition reformulée : calculer les quantités et dates confirmables selon le stock, les demandes et les approvisionnements retenus par le contrôle.
- Limite : les ressources futures dépendent du périmètre de contrôle ; notre vente nominale GBM sur stock est conservée. Confirmation, réservation technique et cycle complet d’engagement ne sont pas déclarés équivalents.

### ELM017

- Référence : [MKT13](catalogue.md#mkt13), [cours protection](https://learning.sap.com/courses/exploring-aatp-in-sap-s-4hana/outlining-aatp-with-supply-protection-sup-), section d’introduction à la protection d’approvisionnement.
- Libellé natif : *Supply Protection*. Nature : fonction de solution aATP.
- Définition reformulée : protéger une quantité pour un groupe vis-à-vis d’autres groupes suivant des critères et un horizon ; des priorités peuvent exister dans la solution.
- Limite : appui pour comparer protection et consommation ; aucune preuve d’équivalence avec MAP et aucune priorité SAP importée dans GBM.

- Complément U63/U64, 2026-09-10 : sections Supported and Affected Document Types / Stock Transport Orders reconsultées ; le cours traite ventes et transferts et relie consommation de protection aux quantités confirmées. Provenance complète et limites dans ELM062 ; aucun regroupement de domaines locaux déduit automatiquement.

- Précision U66/U67, 2026-09-11 : [ELM067](#elm067) sépare niveau natif RBA et nature de l’aptitude métier. La présentation de Supply Protection / Supply Assignment comme fonctionnalités de produit ne disqualifie pas les capacités correspondantes ; C49/CMP038.

- Réexamen U74 du 2026-09-11 : contenu de protection/allocation reconsulté pour le rattachement local à D01 ; passages et limites dans [CMP040](comparaisons.md#cmp040). Aucune équivalence de rang natif ni configuration Beaumanoir déduites.

### ELM018

- Référence : [MKT13](catalogue.md#mkt13), [cours allocation](https://learning.sap.com/courses/exploring-aatp-in-sap-s-4hana/outlining-aatp-with-check-against-allocation), présentation de l’allocation et de son contrôle.
- Libellé natif : *Product Allocation*. Nature : fonction de solution aATP.
- Définition reformulée : limiter les quantités confirmables selon périodes et caractéristiques ; articuler le contrôle avec celui de disponibilité.
- Limite : un plafond de confirmation n’est ni la protection d’un minimum pour un groupe ni la réservation d’une quantité pour une demande. Fonctionnement ARun local non établi.

## Éléments de l’étude comparative U25

Contrôle Codex du 2026-09-09. Les identifiants ELM restent locaux. Les sources originales, éditions et localisateurs sont dans les fiches MKT et annexes liées ; les définitions françaises sont des reformulations. Hors codes de vues ARTS, aucun identifiant natif d’élément n’est fourni ici. Aucune correspondance métier validée.

### ELM019

- Référence : [MKT01](catalogue.md#mkt01).
- Libellés natifs / repères : Business Capabilities ; stratification / leveling.
- Nature : Méthode.
- Édition et localisateur : G189, juin 2018, §§2.1/3/3.2, pages imprimées 2–3 et 6–10, copie du document primaire sur miroir tiers.
- Définition reformulée : Distinguer classement transversal et profondeur de décomposition, adaptée au besoin.
- Limite : G211/version 2 non lu ; aucune profondeur obligatoire ni nomenclature retail déduite.
- Sources et accès : [annexe de preuves](etudes/2026-09-09-modeles-marche/notes-cadres-capacites.md).
- Réexamen U43 du 2026-09-10 : S2, G189 §3.2.1–3.2.2 ; texte consulté pour les premiers regroupements. [Analyse et limites](premier-niveau-regroupement-capacites.md), CMP026 ; ancienne provenance conservée.
- Réexamen U47 du 2026-09-10 : G189 §3.1, pages imprimées 6–7, distingue les approches descendante et ascendante et propose leur combinaison pour affiner la carte. [Document primaire sur miroir tiers](https://governance.foundation/assets/frameworks/togaf/g189%20-%20Business%20Capbility.pdf), texte consulté ; appui méthodologique en CMP028, sans nomenclature commerce déduite.

### ELM020

- Référence : [MKT02](catalogue.md#mkt02).
- Libellés natifs / repères : Capability ; composition, aggregation, specialization.
- Nature : Métamodèle.
- Édition et localisateur : ArchiMate 3.1/C197, novembre 2019, §§7.1/7.3/7.6, copie externe ; tutoriel communautaire en complément.
- Définition reformulée : Représenter aptitude et relations sans imposer un catalogue sectoriel ni confondre décomposition et variante.
- Limite : Norme 3.2 non examinée ; aucune notation adoptée.
- Sources et accès : [annexe de preuves](etudes/2026-09-09-modeles-marche/notes-cadres-capacites.md).

### ELM021

- Référence : [MKT03](catalogue.md#mkt03).
- Libellés natifs / repères : Tier ; Level ; Business Object.
- Nature : Pratiques de construction.
- Édition et localisateur : Atelier Guild du 20/06/2019, pages PDF 15–21 ; position paper octobre 2014, pages PDF 12–19.
- Définition reformulée : Séparer catégories et niveaux ; construire autour des objets/actions ; rapprocher capacités et processus plusieurs-à-plusieurs.
- Limite : Atelier et papier historiques ; pas guide BIZBOK 15 ni catalogue retail complet.
- Sources et accès : [annexe de preuves](etudes/2026-09-09-modeles-marche/notes-cadres-capacites.md).
- Réexamen U43 du 2026-09-10 : S3, atelier 2019 pages PDF 17–21 ; texte consulté pour les premiers regroupements. [Analyse et limites](premier-niveau-regroupement-capacites.md), CMP026 ; ancienne provenance conservée.

- Réexamen U60 du 2026-09-10 : [atelier sur le CDN officiel](https://cdn.ymaws.com/www.businessarchitectureguild.org/resource/resmgr/public_resources/baguild_ref_model_workshop_a.pdf), pages 15–21, texte relu avec succès. Motifs de définition, information et rapprochement examinés ; un rapprochement d’objets garde un objet directeur. Sources 15.0 et métamodèle 2024 qualifiées séparément en ELM052–ELM054 ; pas de catalogue actuel déduit de l’atelier.

### ELM022

- Référence : [MKT05](catalogue.md#mkt05).
- Libellés natifs / repères : Retail Industry ; Business Process Areas ; Organizational Business Process Flows ; Business/System Process Flows.
- Nature : Niveaux et exemples de processus.
- Édition et localisateur : Guide Oracle RRM 14.1.1, juin 2015, pages imprimées 5–7, 12–21 et 26.
- Définition reformulée : Niveaux d’information L0–L3 avec liens non strictement hiérarchiques ; exemples achats, stock, allocation, réassort, B2B et retours.
- Limite : L2.5/3 ne crée pas un cinquième étage homogène. Bibliothèque actuelle non acquise ; fiche actuelle avec mentions divergentes.
- Sources et accès : [annexe de preuves](etudes/2026-09-09-modeles-marche/notes-oracle-apqc-arts.md).

### ELM023

- Référence : [MKT07](catalogue.md#mkt07).
- Libellés natifs / repères : Category ; Process Group ; Process ; Activity ; Task.
- Nature : Classification de processus.
- Édition et localisateur : Introduction générale PCF ©2018, figure 1/pages PDF 1–2.
- Définition reformulée : Cinq niveaux nominaux ; identifiant distinct du chemin ; profondeur et granularité variables.
- Limite : Taxonomie, pas enchaînement de travail. Contenu Retail 7.2.1 non consulté.
- Sources et accès : [annexe de preuves](etudes/2026-09-09-modeles-marche/notes-oracle-apqc-arts.md).
- Réexamen U43 du 2026-09-10 : S6, introduction générale et figure 1 ; texte consulté pour les premiers regroupements. [Analyse et limites](premier-niveau-regroupement-capacites.md), CMP026 ; ancienne provenance conservée.

### ELM024

- Référence : [MKT08](catalogue.md#mkt08).
- Libellés natifs / repères : 02010 ; 07620.
- Nature : Vues de données.
- Édition et localisateur : ARTS ODM 7.3, introduction, sommaire et narrations des deux vues.
- Définition reformulée : 02010 décrit comptage et ajustements ; 07620 distingue effets commande/disponibilité et expédition/stock physique.
- Limite : Identifiants natifs de vues, pas de capacités. Autres vues surtout repérées ; aucune règle GBM présumée.
- Sources et accès : [annexe de preuves](etudes/2026-09-09-modeles-marche/notes-oracle-apqc-arts.md).

### ELM025

- Référence : [MKT06](catalogue.md#mkt06).
- Libellés natifs / repères : Direct ; Control ; Execute.
- Nature : Matrice de composants métier.
- Édition et localisateur : IBM G510-6163-00, 2005, pages PDF 7–11, figure 6 page PDF 11/imprimée 9, lecture visuelle.
- Définition reformulée : Croiser compétences et responsabilités ; examiner les répétitions de libellés dans leur contexte.
- Limite : Les trois lignes ne sont pas trois profondeurs ; définitions des cases absentes.
- Sources et accès : [annexe de preuves](etudes/2026-09-09-modeles-marche/notes-sap-ibm.md).
- Réexamen U43 du 2026-09-10 : S4, cadre et exemple retail pages PDF 9–11 ; texte consulté pour les premiers regroupements. [Analyse et limites](premier-niveau-regroupement-capacites.md), CMP026 ; ancienne provenance conservée.
- Réexamen U51 du 2026-09-10 : document IBM G510-6163-00, 2005, figure 6 page imprimée 9 / PDF 11 relue pour les axes et thèmes retail. Les composants restent distincts de capacités métier ; CMP031.

- Réexamen U59 du 2026-09-10 : texte des pages PDF 9–11 et repères de la figure 6 relus. L’exemple retail offre une autre lecture par compétences et responsabilités ; les cases restent des composants. CMP033 n’assimile pas Direct/Control/Execute aux deux couches ni aux natures locales.

### ELM026

- Référence : [MKT14](catalogue.md#mkt14).
- Libellés natifs / repères : End-to-end processes ; Business process areas ; Business processes ; Scenarios ; System processes ; Test cases.
- Nature : Structure de catalogue.
- Édition et localisateur : Microsoft Learn About, sections niveaux/IDs, mise à jour 08/01/2026.
- Définition reformulée : Six niveaux du parcours métier à la configuration et au test ; certaines aires reflètent fonctions ou départements.
- Limite : Pas six profondeurs de capacités ; export complet non examiné.
- Sources et accès : [annexe de preuves](etudes/2026-09-09-modeles-marche/notes-microsoft.md).
- Réexamen U43 du 2026-09-10 : S5, section des six niveaux, page du 08/01/2026 ; texte consulté pour les premiers regroupements. [Analyse et limites](premier-niveau-regroupement-capacites.md), CMP026 ; ancienne provenance conservée.

### ELM027

- Référence : [MKT14](catalogue.md#mkt14).
- Libellés natifs / repères : Inventory to deliver ; Order to cash ; Source to pay ; Design to retire ; Case to resolution.
- Nature : Contenus de processus et évolution.
- Édition et localisateur : Pages de présentation et aires, 2024–2026 ; changelog février 2025.
- Définition reformulée : Décrire les thèmes commerce et leurs réalisations ; retours déplacés du traitement des dossiers vers commande/encaissement en 2025.
- Limite : Dates hétérogènes ; certaines mentions sont des fonctions produit. Un déplacement ne prouve pas un nouveau besoin métier.
- Sources et accès : [annexe de preuves](etudes/2026-09-09-modeles-marche/notes-microsoft.md).
- Réexamen U47 du 2026-09-10 : [Inventory to deliver — business process areas](https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/inventory-to-deliver-areas), date affichée 2025-01-21. Sections Maintain inventory levels (comptage et ajustements), Process inbound goods (retours clients), Process outbound goods (retours fournisseurs) consultées. Contrôle de couverture proposé en CMP028 ; ni capacités ni domaines locaux déduits automatiquement de ces processus.
- Réexamen U51 du 2026-09-10 : [vue des scénarios](https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/overview), tableau central et date affichée 2025-12-16 consultés. Source to pay, Order to cash et Inventory to deliver restent des parcours de contrôle, sans conversion automatique en domaines du socle ; CMP031. Les dates des autres pages et observations antérieures sont conservées séparément.

### ELM028

- Référence : [MKT14](catalogue.md#mkt14).
- Libellés natifs / repères : Inventory Visibility inventory allocation.
- Nature : Fonction de produit.
- Édition et localisateur : Page allocation, sections finalité/allocation virtuelle/réservation, mise à jour 13/08/2025.
- Définition reformulée : Préallouer une quantité à des groupes et suivre sa consommation, en distinguant réservation de transaction.
- Limite : Recouvrement de finalité avec protection SAP proposé ; mécanismes détaillés et usages locaux non établis.
- Sources et accès : [annexe de preuves](etudes/2026-09-09-modeles-marche/notes-microsoft.md).

- Réexamen U74 du 2026-09-11 : contenu de protection/allocation reconsulté pour le rattachement local à D01 ; passages et limites dans [CMP040](comparaisons.md#cmp040). Aucune équivalence de rang natif ni configuration Beaumanoir déduites.

### ELM029

- Référence : [MKT04](catalogue.md#mkt04).
- Libellés natifs / repères : Sales Order Management ; Service Request Management ; Sourcing Process.
- Nature : Compléments éditoriaux.
- Édition et localisateur : SAP EA Knowledge Base,articles 2024–2026, extraits indexés des besoins métier.
- Définition reformulée : Éclairer commandes et support par des définitions RBA citées ; parcours de sourcing pour le contexte achats.
- Limite : Ouvertures directes 403 : extraits seulement. Pas export versionné ni rattachement complet reconstitué.
- Sources et accès : [annexe de preuves](etudes/2026-09-09-modeles-marche/notes-sap-ibm.md).

### ELM030

- Référence : [MKT15](catalogue.md#mkt15).
- Libellés natifs / repères : Business Capability Reference Model.
- Nature : Carte retail historique.
- Édition et localisateur : Microsoft/APQC, carte V1 du 15/09/2012, pages PDF 15–16, texte extrait.
- Définition reformulée : Repérer produits, achats, stocks, allocation, réassort, exécution et service client comme thèmes de comparaison.
- Limite : Définitions absentes, emboîtement visuel non certifié ; distinct du PCF Retail et de Dynamics actuel.
- Sources et accès : [annexe de preuves](etudes/2026-09-09-modeles-marche/notes-oracle-apqc-arts.md).

### ELM031

- Référence : [MKT14](catalogue.md#mkt14), complément produit distinct du catalogue de processus.
- Libellé natif : Inventory Visibility reservations ; soft reservation / offset.
- Nature : Fonction de produit.
- Édition et localisateur : Microsoft Learn, mise à jour 27/07/2026, sections cas d’usage et intégration des réservations/compensations ; consultation 2026-09-09.
- Définition reformulée : Tenir une quantité réservée dans Inventory Visibility et l’articuler avec les changements de statut de la commande dans l’ERP.
- Limite : Paramétrage et versions conditionnent les contrôles ; pas de garantie ni de modèle de réservation universels.
- Source et accès : [page officielle](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-reservations), texte consulté ; analyse et localisateurs dans la [note comparative](allocation-reservation-sap-microsoft.md).

### ELM032

- Référence : [MKT13](catalogue.md#mkt13).
- Libellés natifs / identifiant : Supply Assignment (ARun), Backorder Processing ; SUPPLY_ASSIGNMENT_01.
- Nature : Fonctions de produit et articulation.
- Édition et localisateur : Cours SAP actuels sans édition précisée, sections PAC/BOP et Configure BOP Variant ; fiche de business function, Technical Data/Features, borne de disponibilité S/4HANA 1709. Consultation 2026-09-09.
- Définition reformulée : Distinguer confirmation et affectation, avec exécution de Supply Assignment possible dans BOP.
- Limite : Borne de business function, pas date de chacune des fonctions actuelles ; aucune scission historique globale démontrée ni usage Boardriders établi.
- Sources et accès : S5/S6/S8 dans la [note comparative](allocation-reservation-sap-microsoft.md), cours consultés et passage indexé de la fiche Help Portal.

- Précision U66/U67, 2026-09-11 : [ELM067](#elm067) sépare niveau natif RBA et nature de l’aptitude métier. La présentation de Supply Protection / Supply Assignment comme fonctionnalités de produit ne disqualifie pas les capacités correspondantes ; C49/CMP038.

### ELM033

- Référence : [MKT16](catalogue.md#mkt16).
- Libellés natifs / identifiants : Order Allocation Run ; FASHION_20_ARUN ; FASHION_03 ; FSH_BADI_ARUN_STOCK_PROTECTION.
- Nature : Documentation historique de produit.
- Édition et localisateur : SAP ERP 6.0 EHP8 SPS01, EA-RETAIL 618 SP1 ; Order Allocation Run (New), sections Technical Details, Features, Customizing ; consultation 2026-09-09.
- Définition reformulée : Ensemble Fashion associant sélection, affectation, libération et extension pour la protection de segments.
- Limite : Pas tout ECC, pas preuve d’un unique batch ni équivalence de l’ancien ARun avec tous les mécanismes actuels.
- Sources et accès : S7 et complément S9 (règle de réallocation, édition non affichée) dans la [note comparative](allocation-reservation-sap-microsoft.md) ; passage indexé consulté.

### ELM034

- Référence : [MKT14](catalogue.md#mkt14), complément produit SCM distinct du catalogue de processus.
- Libellé natif : Reserve inventory quantities ; Reserve ordered items.
- Nature : Fonction de produit.
- Édition et localisateur : Microsoft Learn, page mise à jour 29/08/2025, introduction et Policies on the Inventory and warehouse management parameters page ; consultation 2026-09-09.
- Définition reformulée : La réservation peut porter sur du physique présent ou sur du stock commandé non encore reçu, selon la politique configurée.
- Limite : Ne prouve ni une équivalence BOP/ARun ni une réalisation GBM/BRD. Version produit précise non affichée.
- Source et accès : [page officielle](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/reserve-inventory-quantities), texte consulté ; [analyse U30](../connaissance/18-politiques-engagement-gbm-brd.md).

### ELM035

- Référence : [MKT13](catalogue.md#mkt13).
- Libellés natifs : Product Availability Check ; Backorder Processing — Supply Assignment ; Reassignment ; Configuration Options for Exception Handling.
- Nature : Conditions fonctionnelles de produit.
- Édition et localisateurs : S/4HANA 2025 FPS01, février 2026 ; PAC Use ; BOP Supply Selection, Reason Codes, Reassignment ; exceptions Use/Options. Consultation 2026-09-09.
- Définition reformulée : Distinguer confirmation et affectation ; futures réceptions et reprises selon règles ; révisions prioritaires avec possibilités d’exception.
- Limite : Une demande non confirmée n’est pas automatiquement affectable ; une priorité ne crée pas d’offre. Conditions et version, pas fonctionnement BRD prouvé.
- Sources et accès : S1/S2 de la [note GBM/BRD](../connaissance/18-politiques-engagement-gbm-brd.md), passages Help indexés consultés.

### ELM036

- Référence : [MKT13](catalogue.md#mkt13), distincte du modèle métier RBA MKT04.
- Libellés natifs / repères : Order Promising (2LN) ; Backorder Processing (BOP) ; Advanced Order Promising ; CA-ATP-BOP.
- Nature : Rattachement fonctionnel dans la documentation de solution.
- Édition et localisateur : page Cloud Public Edition affichée 2608 Latest, liste des fonctions PAC/BOP ; nouveautés S/4HANA 2023, OData API: Advanced Backorder Processing Run, tableau Solution Area/Capability. Consultation 2026-09-09.
- Définition reformulée : SAP présente BOP parmi les fonctions d’Order Promising ; l’API de réexamen est classée sous Advanced Order Promising / Advanced Available to Promise.
- Limite : Éditions distinctes ; classification de produit, aucune feuille native BOP ni profondeur établie dans le catalogue RBA complet. Aucun niveau local adopté.
- Sources et accès : S4 de la [note GBM/BRD et promesse](../connaissance/18-politiques-engagement-gbm-brd.md), passages indexés consultés.

### ELM037

- Référence : [MKT14](catalogue.md#mkt14), complément produit Inventory Visibility.
- Libellés natifs / repères : Allocate, Unallocate, Reallocate, Consume, Query ; soft reservation, offset.
- Nature : Opérations, objets et mesures d’un produit ; pas sous-capacités natives.
- Éditions et localisateurs : allocation, page du 13/08/2025, Terminology et Use the allocation APIs ; réservations, page du 27/07/2026, création, intégration/offset et annulation. Consultation 2026-09-09.
- Définition reformulée : Les fonctions disposent d’opérations et de règles détaillées, documentées dans leur contexte d’intégration.
- Limite : Hiérarchie de groupes et mesures ne donnent ni profondeur de carte ni capacités locales automatiques. Aucun usage Beaumanoir ou Boardriders démontré.
- Sources et accès : S2/S3 dans la [note de granularité](detail-fonctions-stock-promesse.md), textes Microsoft Learn consultés ; compléments ELM028/ELM031.

### ELM038

- Référence : [MKT13](catalogue.md#mkt13), distincte du modèle de capacités RBA.
- Libellés natifs / repères : Supply Protection Object / Group ; Core / Prioritized Supply Protection ; Product Allocation Characteristics / Sequences.
- Nature : Objets, états, variantes et règles de fonctions de produit.
- Éditions et localisateurs : cours SUP, sections objet/activation/groupes/variantes ; cours PAL, restrictions/périodes, sans édition précisée. Help 2025 FPS01, Characteristics Use et Product Allocation Sequences, Context/étapes 4–8. Consultation 2026-09-09.
- Définition reformulée : SUP et PAL détaillent les groupes, critères et horizons, avec cycle d’application ou composition de contrôles selon la fonction.
- Limite : Composition d’objets ou variante de règle, pas étage natif de sous-capacités vérifié. Préserver la distinction SUP/PAL et leurs versions.
- Sources et accès : S5/S6 dans la [note de granularité](detail-fonctions-stock-promesse.md), cours consultés et passages Help indexés ; compléments ELM017/ELM018.

### ELM039

- Référence : [MKT13](catalogue.md#mkt13).
- Libellés natifs / repères : Supply Assignment Rule ; BOP segment / variant / confirmation strategy / fallback variant / run.
- Nature : Règles d’affectation et objets de configuration/exécution du réexamen.
- Éditions et localisateurs : Supply Assignment Rule, General Settings/Supply Configuration/Assignment Configuration/Release Check Settings, 2025 FPS01 ; Key Concepts in Backorder Processing, définitions, 2023 Latest. Consultation 2026-09-09.
- Définition reformulée : Les fonctions ARun et BOP distinguent les règles de décision, paramètres de sélection et modes d’exécution.
- Limite : Éditions distinctes ; pas hiérarchie de capacités, pas transfert automatique du calcul métier dans la couche processus/organisation.
- Sources et accès : S7/S8 dans la [note de granularité](detail-fonctions-stock-promesse.md), passages Help indexés ; compléments ELM032/ELM035.

### ELM040

- Référence : [MKT13](catalogue.md#mkt13).
- Libellés natifs / repères : Manage Supply Protection ; maintain protected quantities ; Maintaining Material Master Data / Maintain the material master record.
- Nature : vocabulaire anglais de documentation de produit et de formation ; pas libellés français de capacités.
- Éditions et localisateurs : Apps for Supply Protection (SUP), 2608 Latest, sections Use et Business Roles ; cours Maintaining Material Master Data, titre et objectif, édition produit non précisée. Consultation 2026-09-09.
- Constat reformulé : SAP emploie Manage pour l’application de gestion des protections et Maintain pour les quantités protégées ou les données de référence.
- Limite : ces exemples ne prouvent ni une traduction canonique par tenir, ni l’absence de ce mot dans toute la documentation SAP. Aucun niveau de capacité déduit de ces verbes.
- Sources et accès : [Apps for Supply Protection](https://help.sap.com/docs/SAP_S4HANA_CLOUD/32da8359c8ee4e8b8e8c5e15cacba5aa/d308d458b5794b1cbf647aca23de4d9d.html), passage indexé consulté ; [Maintaining Material Master Data](https://learning.sap.com/courses/business-processes-in-sap-s-4hana-sourcing-procurement/maintaining-material-master-data), titre et objectif consultés via extrait indexé. Analyse et propositions françaises dans le [glossaire](../connaissance/19-glossaire-metier.md#provenance-de-tenir-et-choix-de-formulations).

### ELM041

- Référence : [MKT17](catalogue.md#mkt17).
- Libellés natifs : domain ; model ; bounded context.
- Nature : définitions conceptuelles.
- Édition et localisateur : Evans, référence DDD ©2015, page imprimée vi/page PDF 6, Definitions. Consultation du 2026-09-10.
- Constat reformulé : le domaine est le champ étudié ; le modèle en représente des aspects utiles à la résolution de problèmes ; le contexte délimité indique où un modèle particulier est défini et applicable.
- Limite : espace problématique est la lecture de travail exprimée en U45, pas une citation de cette définition native. Aucune hiérarchie de capacités ni correspondance un-à-un entre domaine local et contexte délimité déduite.
- Source et accès : [document primaire de l’auteur](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf), passage textuel consulté ; [analyse](premier-niveau-regroupement-capacites.md#donner-un-sens-au-domaine-avec-ddd).

- Précision U46 du 2026-09-10 : ELM041 atteste le passage du mémento de 2015, pas la formulation du livre complet. Recherche ciblée dans l’extrait éditeur du livre décrite sous MKT17 ; passage exact évoqué non localisé, sans preuve d’absence. La limite de travail actuelle exclut la conception des bounded contexts.

### ELM042

- Référence : [MKT10](catalogue.md#mkt10), OMG BPMN.
- Libellés natifs : Processes (Orchestration) ; Private non-executable / executable Business Processes.
- Nature : concepts de modélisation de processus, pas catalogue de capacités.
- Édition/localisateur : BPMN 2.0.2, janvier 2014, §7.2.1, page imprimée 21 / page PDF 51 ; consulté le 2026-09-10.
- Reformulation : l’orchestration décrit des processus, qui peuvent être modélisés sans être exécutables.
- Limite : ne fixe ni une liste de capacités métier ni le choix d’un moteur.
- Source : [spécification primaire](https://www.omg.org/spec/BPMN/2.0.2/PDF), texte du passage consulté ; CMP029.

### ELM043

- Référence : [MKT13](catalogue.md#mkt13), SAP S/4HANA Cloud.
- Libellés natifs : Subcontracting ; subcontract purchase requisition ; subcontract purchase order ; stock of material provided to supplier.
- Nature : description fonctionnelle de produit et processus.
- Édition/localisateur : cours Outlining Subcontracting, introduction et Applicable Process Steps ; édition produit non précisée, consulté le 2026-09-10.
- Reformulation : demande et commande de sous-traitance, composants fournis au prestataire et consommation reliée à la réception du résultat.
- Limite : aucune équivalence du Planned Purchase Order local avec le document SAP ; aucune propriété ou configuration Beaumanoir prouvée.
- Source : [cours primaire SAP](https://learning.sap.com/courses/detailing-subcontracting-and-supplier-consignment/outlining-subcontracting_af403e3e-188d-4dbb-bde1-632253739fa6), texte consulté ; CMP030.

### ELM044

- Référence : [MKT14](catalogue.md#mkt14), complément produit Dynamics 365 SCM, distinct du catalogue de processus.
- Libellés natifs : subcontracting ; service product ; vendor-managed warehouse.
- Nature : documentation de réalisation de la sous-traitance.
- Édition/localisateur : Manage subcontracting work in production, page du 2025-08-13, introduction, Subcontracting of route operations et paragraphes sur le stock au site fournisseur ; consulté le 2026-09-10.
- Reformulation : achat de service et mise à disposition des matières sont articulés dans plusieurs variantes de production, avec des représentations distinctes.
- Limite : aucune correspondance générale un-à-un avec SAP, aucune organisation de production ni modèle de stock imposé à Beaumanoir.
- Source : [documentation primaire Microsoft](https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/manage-subcontract-work-production), passages textuels consultés ; CMP030.

### ELM045

- Référence : [MKT13](catalogue.md#mkt13), SAP S/4HANA / Cloud Public Edition.
- Libellés natifs : Stock Transport Order ; Intra-Company Stock Transfer ; Intercompany Stock Transfer (1P9) ; Advanced Intercompany Stock Transfer (5HP).
- Nature : variantes de processus et objets de réalisation de transfert.
- Édition/localisateurs : cours d’éditions non précisées, consultés le 2026-09-10 ; S1 sections STO/One-Step Versus Two-Step, S2 scénarios 1P9/5HP, S3 Cross-Plant Stock Transfer.
- Reformulation : des mouvements comparables s’articulent avec des engagements et effets comptables différents. Dans 5HP, commande de vente et changement de propriété en transit sont explicités séparément.
- Limite : pas de règle fiscale universelle, ni d’identité de tous les scénarios SAP ou de preuve locale. Une facture et une écriture comptable sont distinguées.
- Sources primaires et accès : S1–S3 de la [note réassort](../connaissance/23-reassort-transferts-et-promesse.md#sources-et-limites-de-consultation), textes consultés ; page Help supplémentaire sans texte exploitable non retenue comme preuve.

### ELM046

- Référence : [MKT13](catalogue.md#mkt13), SAP S/4HANA et Cloud Public Edition.
- Libellés natifs : Available-to-Promise ; Product Availability Check ; Backorder Processing ; sales order ; stock transport order.
- Nature : périmètre fonctionnel de confirmation et réexamen.
- Édition/localisateurs : cours d’éditions non précisées, consultés le 2026-09-10 ; S4 Introduction to Available-to-Promise, S5 introduction et Back Order Processing.
- Reformulation : quantité/date peuvent être confirmées pour un client ou un site receveur ; le réexamen peut concerner des commandes clients et ordres de transfert.
- Limite : ne couvre pas toute la gestion d’un achat ou retour ; ne prouve aucune configuration locale. Libellé 2LN du cours distinct de la page versionnée ELM036 ; aucune harmonisation de version ou licence déduite.
- Sources primaires et accès : S4/S5 de la [note réassort](../connaissance/23-reassort-transferts-et-promesse.md#sources-et-limites-de-consultation), textes consultés.

- Réexamen U63/U64, 2026-09-10 : la leçon S5 renvoie actuellement surtout à l’activation ; Basic ATP et le cours BOP ciblé en ELM062 fournissent les preuves directes retenues pour la nouvelle carte. Cette observation ne réattribue pas la lecture historique à une nouvelle édition.

### ELM047

- Référence : [MKT13](catalogue.md#mkt13), SAP S/4HANA Advanced Returns Management.
- Libellés natifs : Materials Received ; Advanced Notice ; Inspection at Customer ; Direct Return to Vendor.
- Nature : description de scénarios de retour, distincte d’une capacité native RBA.
- Édition/localisateur : édition non précisée, consultation 2026-09-10 ; Outlining Customer Returns in SAP S/4HANA, Standard Scenarios for Customer Returns.
- Reformulation : réception, inspection, suites et effets commerciaux peuvent varier, notamment pour un retour direct au fournisseur.
- Limite : ne démontre ni une ressource immédiatement disponible ni un fonctionnement Sarenza ; aucun retour complet assimilé à Order Promising.
- Source et accès : S7 de la [note réassort](../connaissance/23-reassort-transferts-et-promesse.md#sources-et-limites-de-consultation), texte primaire consulté ; autre leçon BKP en 404 non utilisée.

### ELM048

- Référence : [MKT18](catalogue.md#mkt18), BIAN ; guide V8.1 daté juillet 2020.
- Libellés natifs : Business Area ; Business Domain ; Service Domain.
- Nature : classification de partitions fonctionnelles bancaires.
- Reformulation : les deux premiers regroupent les Service Domains ; différents layouts classent les mêmes partitions. Ces partitions sont définies par des besoins métier tout en guidant une conception de services autonomes.
- Source, localisateurs et accès : [guide officiel](https://bian.org/wp-content/uploads/2024/12/BIAN-Semantic-API-Pactitioner-Guide-V8.1-FINAL.pdf), §§2.1, 3.1, 4.2.1, pages 12–13, 26–27, 78–79 ; passages consultés le 2026-09-10.
- Limite : distinction avec la business capability ; ni hiérarchie SAP inversée par erreur ni catalogue retail. Pas de définition locale dérivée automatiquement ; état 14.0 non comparé en détail.

### ELM049

- Référence : [MKT19](catalogue.md#mkt19), TM Forum Functional Framework.
- Libellés natifs : domain ; sub-domain ; function.
- Nature : classification de fonctions du point de vue SI.
- Reformulation : domaines et sous-domaines regroupent les fonctions ; les sous-domaines ont un rôle taxonomique et les fonctions élémentaires sont au même niveau.
- Source/localisateurs : [présentation officielle](https://www.tmforum.org/open-digital-architecture/functional-framework/), Fundamental units / Recognizing functions ; consultée le 2026-09-10.
- Version/limite : GB1033 v26.0 identifié dans une notice, document détaillé non consulté. Une fonction SI n’est pas automatiquement notre capacité indépendante des outils.

### ELM050

- Référence : [MKT19](catalogue.md#mkt19), TM Forum Functional Architecture.
- Libellés natifs : Core Commerce Management ; Production ; Engagement Management ; Party Management ; Intelligence Management.
- Nature : blocs d’architecture fonctionnelle, distincts du catalogue des capacités.
- Reformulation : la présentation sépare commerce et fourniture du service. Cette séparation peut éclairer une étude de frontière sans fournir le découpage Beaumanoir.
- Source/localisateurs : [présentation officielle](https://www.tmforum.org/open-digital-architecture/functional-architecture/), Why is this important? / What has been accomplished so far? ; consultée le 2026-09-10.
- Version/limite : notices 2021 identifiées en MKT19, documents détaillés non consultés. Production télécom n’est pas déclarée équivalente à Supply ou à la logistique ; aucune prescription locale de cinq blocs.

### ELM051

- Référence : [MKT19](catalogue.md#mkt19), TM Forum Capability Framework.
- Libellé natif : Business Capability Framework.
- Nature : modèle de capacités lié à d’autres vues métier.
- Reformulation : le modèle de capacités est distinct des modèles de processus et d’architecture fonctionnelle de l’ODA.
- Source/localisateur : [présentation officielle](https://www.tmforum.org/open-digital-architecture/capability-framework/), Overview ; consultée le 2026-09-10.
- Version/limite : GB1029C v4.0.0 identifié dans une notice de mars 2026 ; catalogue détaillé membre non consulté. Structure fine et couverture de capacités non comparées.

### ELM052

- Référence : [MKT03](catalogue.md#mkt03), BIZBOK Guide 15.0, ©2026.
- Nature : définitions du glossaire ; libellés natifs Capability, Business Service, Capability Instance, Capability Level, Capability Tier.
- Reformulation : distinguer aptitude, service SOA, réalisation contextuelle, profondeur et catégorie. La capacité vise une finalité ou un résultat.
- Source/localisateurs : [Appendix A](https://cdn.ymaws.com/www.businessarchitectureguild.org/resource/resmgr/bizbok15/BIZBOKv15_glossary.pdf), pages imprimées 456–457 / PDF 4–5 ; consultées le 2026-09-10.
- Limite : définitions externes distinctes de la convention locale impérative U33 ; aucun remplacement automatique du glossaire Beaumanoir.

### ELM053

- Référence : [MKT03](catalogue.md#mkt03), Business Architecture Metamodel Guide v3.0, septembre 2024.
- Nature : métamodèle ; objet central et décomposition des capacités.
- Reformulation : les enfants conservent l’objet métier du parent ; capacité et réalisation contextuelle sont distinguées. Domain désigne ici une perspective d’architecture, notamment capacité ou information.
- Source/localisateurs : [guide officiel](https://cdn.ymaws.com/www.businessarchitectureguild.org/resource/resmgr/whitepapers/Business_Architecture_Metamo.pdf), §§3, 5 et 5.2, pages PDF/imprimées 7, 12 et 17–19 ; texte consulté le 2026-09-10.
- Limite : ce document ne remplace pas le guide BIZBOK complet ; la tentative de capture de la page 19 échoue, aucune conclusion nouvelle tirée de sa figure. Ni domaine problématique local ni allocation logicielle déduits automatiquement.

### ELM054

- Référence : [MKT03](catalogue.md#mkt03), BIZBOK Guide 15.0, ©2026.
- Nature : introduction et présentation du contenu du guide.
- Reformulation : architecture métier et modèle opératoire sont reliés et distingués ; les parties annoncées couvrent capacité, Common Reference Model et articulation avec processus/Case Management.
- Source/localisateurs : [Part 1](https://cdn.ymaws.com/www.businessarchitectureguild.org/resource/resmgr/bizbok15/BIZBOKv15_introduction.pdf), pages 3, 6, 12 et 15–17 ; consultées le 2026-09-10.
- Limite : présentation du §2.2, du §8.6 et des autres sections, pas lecture de ces sections détaillées. La portée entreprise de la Guild n’étend pas notre capability map au-delà du socle.

### ELM055

- Référence : [MKT03](catalogue.md#mkt03), notices publiques des modèles Guild, état du 2026-09-10.
- Nature : disponibilité de livrables ; aucun contenu détaillé de capacités.
- Constat : Common Reference Model proposé ; version non affichée sur sa notice. Companion Guide v3.0 identifié séparément. Aucun Retail/Wholesale dans la liste publique examinée, malgré une équipe identifiée dans l’index.
- Sources/localisateurs : [liste officielle](https://learning.businessarchitectureguild.org/indref), introduction et conditions ; [Common Reference Model](https://learning.businessarchitectureguild.org/products/common-reference-model), Overview ; [Companion Guide v3.0](https://learning.businessarchitectureguild.org/products/business-architecture-common-reference-model-companion-guide-v30), titre/Contents ; pages consultées.
- Limites : téléchargement membre et licence, ressources non acquises ; absence de listing ne prouve pas inexistence. [Équipe Retail](https://www.businessarchitectureguild.org/members/group_select.asp?type=19895) : index consulté, ouverture directe en 403. L’annonce historique v7.0 dans le [webinar](https://learning.businessarchitectureguild.org/products/webinar-common-reference-model-companion-guide-walkthrough) n’établit pas la version distribuée aujourd’hui ; vidéo non consultée.

### ELM056

- Référence : [MKT04](catalogue.md#mkt04), SAP EA/RBA ; cours sans édition indiquée.
- Nature : modèle métier de l’information lié aux capacités, distinct du modèle de solution.
- Libellés natifs : Business Data Catalog ; Business Data Mapping ; Business Data Object ; Solution Data Object.
- Reformulation : identifier les concepts d’information à partir notamment des capacités et processus ; relier objets et capacités. Les objets métier sont distingués de leur représentation dans la solution.
- Sources/localisateurs : [Defining Business Architecture](https://learning.sap.com/courses/intelligent-enterprise-architecture-fundamentals/defining-business-architecture), Business Data Catalog / Business Data Mapping ; [Investigating the SAP Enterprise Architecture Methodology](https://learning.sap.com/courses/sap-enterprise-architecture-framework-foundation-introduction/investigating-the-sap-enterprise-architecture-methodology), Enterprise Architecture Concepts. Passages consultés le 2026-09-10.
- Limite : pas de dérivation exhaustive de schémas ou agrégats depuis les libellés de capacités ; catalogue détaillé versionné non acquis.

### ELM057

- Référence : [MKT03](catalogue.md#mkt03), Guild Metamodel Guide 3.0 de septembre 2024 et glossaire BIZBOK 15.0 ©2026.
- Nature : relations entre aptitude, information, états et résultats.
- Libellés natifs : Information Concept ; Business Object ; Outcome ; Event.
- Reformulation : une capacité utilise/modifie de l’information ; les concepts représentent les objets et leurs états. Le résultat et l’occurrence sont des notions distinctes.
- Sources/localisateurs : [métamodèle](https://cdn.ymaws.com/www.businessarchitectureguild.org/resource/resmgr/whitepapers/Business_Architecture_Metamo.pdf), §§5.1.2, 5.2, 5.3, pages 15, 17–21, texte ; [glossaire](https://cdn.ymaws.com/www.businessarchitectureguild.org/resource/resmgr/bizbok15/BIZBOKv15_glossary.pdf), Event/Outcome, pages 459/461. Consultés le 2026-09-10.
- Limite : aucune identité Outcome = événement publié = document ; pas de prescription d’immutabilité, de racine d’agrégat ou de persistance. Capture du schéma page 21 échouée ; conclusion fondée sur les paragraphes textuels.

### ELM058

- Référence : [MKT19](catalogue.md#mkt19), TM Forum Information Framework SID et Capability Framework.
- Nature : modèle d’information métier et regroupements sémantiques.
- Libellés natifs : Business Entity ; Aggregate Business Entity (ABE).
- Reformulation : le SID décrit concepts, attributs et relations indépendamment des plateformes/langages/protocoles. Les ABEs regroupent des entités ou d’autres ABEs ; leurs noms ne fixent pas une frontière transactionnelle.
- Sources/localisateurs : [SID](https://www.tmforum.org/open-digital-architecture/information-framework-sid/), Overview / SID Domains / Business Entities ; [Capability Framework](https://www.tmforum.org/open-digital-architecture/capability-framework/), Overview. Pages publiques consultées le 2026-09-10.
- Limite : notices SID 26.0 et GB1029C v4.0.0 identifiées, catalogues complets et correspondances détaillées non consultés. Aucun ABE assimilé à une racine d’agrégat DDD.

### ELM059

- Référence : [MKT13](catalogue.md#mkt13), SAP S/4HANA Cloud, inventaire.
- Nature : documents de réalisation et notifications ; pas modèle de capacités.
- Libellés natifs : Material Document ; Created ; Canceled.
- Reformulation : le mouvement comptabilisé produit un document ; ses notifications le référencent. Mouvement/quantité se corrigent par annulation et nouvelle comptabilisation, mais certains compléments restent possibles.
- Sources/localisateurs : [The Document Concept](https://help.sap.com/docs/SAP_S4HANA_CLOUD/32da8359c8ee4e8b8e8c5e15cacba5aa/b19bce0a4e5f4256b101ed2be62fa94b.html?ai=true&q=BATCH+NUMBER), Document Types/note, version non exposée ; [Material Document Events](https://help.sap.com/docs/SAP_S4HANA_CLOUD/3f57e7df4a114edabffe8b2d581a59ed/40783449115e4b53a9da6e513caf8f50.html), APIs for Inventory 2608, tableau Created/Canceled et payloads. Extractions indexées consultées le 2026-09-10 ; ouvertures directes sans texte exploitable.
- Limite : SAP appelle le document lui-même business object. Pas d’immutabilité absolue, de preuve locale ou d’équivalence de l’événement publié avec le fait métier U61.

### ELM060

- Référence : [MKT19](catalogue.md#mkt19), TM Forum, exemples documentés de ressources et notifications.
- Nature : schémas et contrats d’échange, distincts de la carte des capacités.
- Libellés natifs : ProductOrder ; ProductOrderStateChangeEvent ; Document.
- Reformulation : une ressource possède son cycle d’état et des notifications distinctes ; le schéma Document comporte état, version et date de mise à jour.
- Sources/localisateurs : [TMF622 v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF622_Product_Ordering/4.0.0/user_guides/TMF622_Product_Ordering_Management_API_v4.0.0_specification.pdf), ©2019, Lifecycle p.13 et Notification Resource Models pp.37–40 ; [Document](https://datamodel.tmforum.org/en/latest/Common/Document/), Description / Data model, repère snapshot 04/02/2020 pour les correspondances API. Consultés le 2026-09-10.
- Limite : exemples historiques examinés, pas dernières versions présumées ; ces ressources ne prouvent ni immutabilité de tous les documents ni Event Sourcing ni identité notification/fait de gestion.

### ELM061

- Référence : [MKT17](catalogue.md#mkt17), Eric Evans, DDD Reference ©2015, licence CC BY 4.0.
- Nature : précision d’un motif de conception invoqué par analogie dans U61.
- Libellé natif : Aggregate / root.
- Reformulation : l’agrégat délimite des invariants et une responsabilité de cohérence ; ses limites gouvernent aussi les transactions.
- Source/localisateur : [référence de l’auteur](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf), Aggregates, page imprimée 16 / PDF 23 ; passage textuel sur invariants/racine/transactions consulté le 2026-09-10.
- Limite : pas de conception d’agrégats ni de bounded contexts engagée ; l’objet métier de la carte n’est pas automatiquement une racine d’agrégat. Le mémento 2015 reste distinct du livre initial.

### ELM062

- Références : MKT04 SAP RBA ; MKT13 SAP S/4HANA ; MKT14 pour le complément Microsoft déjà associé à ELM028.
- Nature : réexamen ciblé des appuis de structure et de comportements de produit pour P81 ; nouveau passage BOP et compléments à des éléments déjà examinés.
- Libellés natifs : Business Capability Model ; Supply Protection ; Available-to-Promise ; Backorder Processing ; Subcontracting ; Inventory Visibility allocation.
- Consultation : 2026-09-10, textes primaires ouverts et lus avec contribution indépendante. Cours SAP sans édition exposée ; Microsoft conserve sa provenance datée en ELM028, sans déduire une version de livraison homogène.
- Sources et localisateurs : [SAP RBA](https://learning.sap.com/courses/sap-enterprise-architecture-framework-foundation-introduction/discovering-the-reference-architecture-content), Framework / Business Capability Model Example ; [Supply Protection](https://learning.sap.com/courses/exploring-aatp-in-sap-s-4hana/outlining-aatp-with-supply-protection-sup-), protection des groupes / Supported and Affected Document Types / Stock Transport Orders ; [Basic ATP](https://learning.sap.com/courses/configuring-supply-chain-business-scenarios-in-sap-s4hana-cloud-public-edition/introducing-basic-available-to-promise_ee3a33eb-4a91-4f85-a8b6-9bc1189e9540), Introduction to Available-to-Promise ; [BOP ciblé](https://learning.sap.com/courses/exploring-aatp-in-sap-s-4hana/outlining-backorder-processing-for-advanced-atp-in-sap-s-4hana), General Restrictions / Configure BOP Segments / Configure BOP Variant ; [Subcontracting](https://learning.sap.com/courses/detailing-subcontracting-and-supplier-consignment/outlining-subcontracting_af403e3e-188d-4dbb-bde1-632253739fa6), introduction / Applicable Process Steps ; [Microsoft allocation](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-allocation), Difference between inventory allocation and soft reservation / Allocation virtual pool.
- Reformulation du complément : les aires de stock/promesse/exécution logistique sont distinctes dans l’exemple SAP, avec quatre niveaux natifs ; protection et promesse peuvent concerner ventes et transferts. Le BOP réexamine les confirmations selon les priorités ; les variantes décrites peuvent mobiliser ATP ou Supply Assignment. Allocation de groupe et réservation de transaction restent distinctes chez Microsoft. La sous-traitance relie composants fournis et résultat reçu.
- Limites : les domaines P81 sont locaux et non équivalents à ces catégories. Sourcing and Procurement est un Business Domain SAP, Inventory Management un Business Area. Sources de produits distinctes du catalogue de capacités ; aucune configuration Beaumanoir ni inclusion logistique dans FLOW prouvées. Le texte actuel de l’ancienne leçon S5 citée par ELM046 est surtout consacré à l’activation ; le réexamen présent s’appuie sur Basic ATP et le cours BOP ciblé ci-dessus, sans supprimer la lecture historique.

### ELM063

- Références : MKT04 SAP RBA ; MKT13 documentation fonctionnelle SAP, complétée par Retail, référentiels et pricing.
- Nature : libellés natifs de niveaux et de contenus différents, destinés à un rapprochement terminologique de P81.
- Consultation : 2026-09-11, contrôle ciblé avec contribution indépendante ; éditions de catalogue et de release non exposées dans les cours. La preuve antérieure des feuilles RBA est conservée en ELM014.
- Libellés : Inventory Management / Order Promising (Business Areas RBA), Product Availability Check / Product Allocation Check (Business Capabilities RBA) ; Supply Protection / Supply Assignment ; Sales Order Management / Purchase Order Management ; Replenishment Planning ; Plant Determination / Alternative-Based Confirmation ; Delivery Processing / Inbound Delivery / Outbound Delivery ; Product Master / Material Master / Retail Article Master ; Business Partner / Business Partner Roles ; Pricing / Condition Records / Condition Contract Management.
- Sources ouvertes : [RBA](https://learning.sap.com/courses/sap-enterprise-architecture-framework-foundation-introduction/discovering-the-reference-architecture-content), Framework / Business Capability Model Example ; [Sales Order Management](https://learning.sap.com/courses/exploring-end-to-end-business-processes-in-sap-business-suite/describing-sales-order-management_ca7b816e-af6f-4a03-bd88-1a5bb42cef84), Overview / Processing / Pricing ; [Replenishment Planning](https://learning.sap.com/courses/discovering-retail-functions-and-business-processes-in-sap-s-4hana-retail/running-replenishment-planning_e456b0ed-3094-4056-9ba8-aa56cf6833ed), Replenishment in General / Perform Replenishment Planning ; [ATP](https://learning.sap.com/courses/performing-the-availability-check/acquiring-a-basic-understanding-of-available-to-promise-atp-_ae470c8e-1483-46ce-b5cc-e80647e8a32b), Level of the ATP Check ; [Business Partners](https://learning.sap.com/courses/exploring-business-processes-for-supply-chain-execution-in-sap-s-4hana-cloud-private-edition/maintaining-materials-and-business-partners), Business Partner Master Records.
- Sources examinées par extraits indexés : [Fashion](https://learning.sap.com/courses/outlining-sap-s-4hana-for-fashion-and-vertical-business-and-implementing-best-practices/comparing-with-sap-fashion-management-solution-fms-1), Order Fulfillment / Supply Protection ; [Procurement for Retail 5FM](https://learning.sap.com/courses/exploring-sap-s-4hana-cloud-public-edition-retail/ordering-merchandise-with-procurement-for-retail-5fm-_fe298f93-84ad-47ff-98ff-658e887e020d), objectif Set Up Purchase Order Management ; [Delivery Processing](https://help.sap.com/docs/SAP_SUPPLY_CHAIN_MANAGEMENT/f41048b9ca054326bb9774db1d46e866/13cccb53ad377114e10000000a174cb4.html), présentation EWM ; [Retail Article Master](https://learning.sap.com/courses/discovering-retail-functions-and-business-processes-in-sap-s-4hana-retail/introducing-the-retail-article-master_bd2d9df6-bf54-4612-8fa0-b35c63fbb0d8), Article Master — General / Conversion / Manage Product Master Data ; [Pricing](https://learning.sap.com/courses/configuring-pricing-in-sap-s-4hana-sales), description et titres d’unités Working with Condition Records / Getting to Know Condition Contract Management, sans lecture de toutes les leçons sous-jacentes.
- Reformulation et adaptation : plusieurs libellés correspondent à une seule ligne locale ; les rapprochements sont détaillés dans la note U65. Replenishment éclaire le réassort, ABC les origines alternatives, les masters les référentiels et Pricing les conditions de prix.
- Limites : seuls les niveaux RBA indiqués sont attestés comme tels ; les autres noms ne sont pas transformés en Business Areas. Pas de domaine SAP unique démontré pour D02/D04/D06/D07 ; quota magasin, totalité des droits après fourniture et exécution générique non couverts par ces seuls noms. Aucune équivalence ni configuration Beaumanoir établie.

### ELM064

- Référence : MKT14, avec distinction du catalogue de processus et des documentations de produit Dynamics 365 utilisées pour le compléter.
- Nature : intitulés d’aires de processus, de modules, de fonctionnalités et de concepts de référentiel.
- Consultation : 2026-09-11, pages publiques ouvertes et texte disponible malgré le bandeau générique de connexion Learn ; aucune connexion utilisée. Pas d’édition homogène de catalogue ou de release déduite des pages.
- Sources processus : [Inventory to deliver areas](https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/inventory-to-deliver-areas), titres Maintain inventory levels / Process inbound goods / Process outbound goods / Manage warehouse operations, date 2025-01-21 ; [Order to cash areas](https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/order-to-cash-areas-overview), Develop sales policies / Manage sales orders et liste Order promising, état reconsulté ; [Source to pay areas](https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/source-to-pay-areas), Manage supplier relationships / Source and contract goods and services / Procure goods and services, date 2025-05-20.
- Sources stock : [Inventory management](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-home-page), titre et présentation ; [Inventory Visibility allocation](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-allocation) et [Reservations](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-reservations), titres et distinction déjà détaillée en ELM028/ELM031, pas nouvelle comparaison de toutes leurs règles.
- Sources exécution : [Distributed order management](https://learn.microsoft.com/en-us/dynamics365/commerce/dom), présentation, date 2026-06-03 ; [DOM rules](https://learn.microsoft.com/en-us/dynamics365/commerce/dom-rules), Fulfillment location priority / Offline fulfillment location / Maximum orders, date 2026-01-22 ; [Store order fulfillment](https://learn.microsoft.com/en-us/dynamics365/commerce/order-fulfillment-overview), titre et résumé public indexé consultés, pas toute la page lue.
- Sources référentiels et conditions : [Product information](https://learn.microsoft.com/en-us/dynamics365/supply-chain/pim/product-information), introduction Product information management / Product definition, date 2026-07-01 ; [Global address book](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/organization-administration/overview-global-address-book), présentation / Party roles, date 2026-03-18 ; [Unified pricing management](https://learn.microsoft.com/en-us/dynamics365/supply-chain/unified-pricing-management/upm-pricing-management-overview), introduction / Pricing components, date 2026-04-21. Trade agreements est aussi attesté dans les pages achats et pricing.
- Reformulation et adaptation : les aires servent de repères de parcours ; DOM éclaire les choix et limites des possibilités d’exécution ; produit, parties et pricing fournissent des noms de périmètres de solution proches des thèmes locaux.
- Limites : ces noms ne définissent pas une hiérarchie de capacités équivalente à P81. DOM mélange décisions, affectations et suivi ; sa présence dans la colonne D06 ne classe pas l’OMS local dans une seule couche. La règle Maximum orders ne prouve pas l’équivalence aux quotas quotidiens/hebdomadaires locaux. Les droits après fourniture dépassent Pricing.

### ELM065

- Référence : MKT19, TM Forum ODA et Open APIs.
- Nature : noms de composants ODA, notices d’API et descriptions publiques, distingués des capacités métier et du SID.
- Consultation : 2026-09-11, avec contribution indépendante ; annuaire public sans version globale affichée. Les versions suivantes sont celles des notices consultées, pas un ensemble de dernières versions homogènes.
- Source d’inventaire : [Component Directory](https://www.tmforum.org/oda/directory/components-map), noms et blocs. TMFC002 Product Order Capture & Validation, TMFC033 Purchase Management, TMFC032 Supply Chain Management, TMFC014 Location Management et TMFC012 Resource Inventory sont retenus ici comme noms repérés, sans détail complet analysé.
- Pages ouvertes et lues : [TMFC009 Service Qualification Management](https://www.tmforum.org/oda/directory/components-map/production/TMFC009), v1.1.0, 2023-08-18 ; [TMFC005 Product Inventory](https://www.tmforum.org/oda/directory/components-map/core-commerce-management/TMFC005), v1.0.4, 2024-06-27 ; [TMFC039 Agreement Management](https://www.tmforum.org/oda/directory/components-map/party-management/TMFC039), v1.1.0, 2024-08-19 ; [TMFC007 Service Order Management](https://www.tmforum.org/oda/directory/components-map/production/TMFC007), v2.0.0, 2024-02-23 ; [TMFC011 Resource Order Management](https://www.tmforum.org/oda/directory/components-map/production/TMFC011), v1.2.0, 2026-06-12, statut Pre-production.
- Notices indexées examinées : [TMFC001 Product Catalog Management](https://www.tmforum.org/oda/directory/components-map/core-commerce-management/TMFC001), v2.1.2, 2025-11-12 ; [TMFC010 Resource Catalog Management](https://www.tmforum.org/oda/directory/components-map/production/TMFC010), v1.3.2, 2024-12-03 ; [TMFC028 Party Management](https://www.tmforum.org/oda/directory/components-map/party-management/TMFC028), v2.1.0, 2024-10-14, avec TMF669 Party Role Management ; [TMFC027 Product Configurator](https://www.tmforum.org/oda/directory/components-map/production/TMFC027), v2.1.1, 2023-11-27, bloc affiché Core Commerce Management malgré le chemin de l’URL.
- Stock/réservation, notices indexées : [TMF687 Stock Management v4.0](https://www.tmforum.org/open-digital-architecture/open-apis/stock-management-api-TMF687/v4.0), date 2026-05-15 relative à une mise à jour CTK ; [guide v4.0.0](https://www.tmforum.org/resources/specification/tmf687-stock-management-api-user-guide-v4-0-0/), approuvé 2021-01-18, extraits indexés examinés, ouverture directe 403 et guide intégral non lu ; [TMF716 Resource Reservation v4.0](https://www.tmforum.org/open-digital-architecture/open-apis/resource-reservation-TMF716/v4.0), notice de l’API.
- Reformulation : Stock Management décrit quantités, seuils, consultation et réservation du stock. Service Qualification apprécie faisabilité et date sans allocation de ressource. Agreement rapproche les accords et conditions. Les composants d’ordres, de catalogues et de parties fournissent des voisins sémantiques des domaines locaux.
- Limites : Product Inventory concerne des produits attribués/utilisés par des parties et n’est pas assimilé au stock retail. Les analogies de D03/D05/D06/D07/D10 sont partielles ; ni promesse ferme complète, ni redistribution, quota magasin, faits génériques ou droits après fourniture démontrés. Les API ne sont pas des capacités par leur seule existence ; aucun modèle télécom importé comme cible FLOW.

### ELM066

- Référence : MKT03, Business Architecture Guild ; atelier public Government Reference Model Workshop.
- Nature : exemples historiques de noms de capacités et de modèles de référence, distincts d’un catalogue retail actuel.
- Version et consultation : support daté du 21 mars 2019, PDF ouvert et texte lu le 2026-09-11 avec contribution indépendante. Les dates récentes proposées par l’index ne remplacent pas celle de la couverture.
- Source et localisateurs : [atelier public](https://cdn.ymaws.com/www.businessarchitectureguild.org/resource/resmgr/baguild_gov_ref_model_worksh.pdf), page PDF 10 Customer Management / Product Management / Agreement Management et exemple Agreement Structuring ; pages 11–12 illustration Partner Management attribuée à Business Architecture Associates ; page 17 Asset Management parmi les capacités supporting du Common Reference Model.
- Adaptation : repères partiels pour D04, D08, D09 ; Asset Management est trop large pour servir d’équivalent à D01. Pas de nom précis démontré ici pour D02/D03/D05/D06/D07 ou pour tout D10.
- Limites : ne vaut ni consultation du guide BIZBOK complet ni catalogue retail livré ou actuel ; les exemples et attributions sont conservés. Aucune absence de capacité dans BIZBOK déduite d’une correspondance non trouvée dans ce support.

### ELM067

- Références : [MKT04](catalogue.md#mkt04) SAP RBA et [MKT13](catalogue.md#mkt13) documentation SAP S/4HANA ; contrôle ciblé U66/U67 du 2026-09-11, avec recherche indépendante.
- Nature : distinction entre classement dans un modèle d’architecture et présentation des moyens de réalisation dans une documentation de produit. Une même expression peut désigner une aptitude métier et une fonctionnalité qui la réalise.
- RBA : [Discovering the Reference Architecture Content](https://learning.sap.com/courses/sap-enterprise-architecture-framework-foundation-introduction/discovering-the-reference-architecture-content), sections Linking Business and Solution et Business Capability Model Example, texte reconsulté. Inventory Management et Order Promising sont présentés comme Business Areas ; ELM014 conserve la lecture visuelle des feuilles Product Availability Check et Product Allocation Check. Business Capability et Solution Capability sont distinctes. Édition du catalogue non exposée.
- Supply Protection : [Introducing Basic Available-to-Promise](https://learning.sap.com/courses/configuring-supply-chain-business-scenarios-in-sap-s4hana-cloud-public-edition/introducing-basic-available-to-promise_ee3a33eb-4a91-4f85-a8b6-9bc1189e9540), section Introduction to Available-to-Promise, texte ouvert et lu. Advanced Available-to-Promise (1JW) est présenté comme un solution process et Supply Protection parmi ses fonctionnalités supplémentaires. Cours Public Edition sans version affichée ; définition de protection de groupes conservée en ELM017/ELM062.
- Supply Assignment : [fiche SAP Help](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/77c07c8d30664260a0b3ff864e6b5e78/8f5e14e242b74d42bada1c39c57fe291.html), Technical Data / Use / Features, extrait indexé examiné ; ouverture directe sans texte exploitable. Enterprise Business Function SUPPLY_ASSIGNMENT_01, disponible à partir de S/4HANA 1709. Cette borne ne date pas chacune des fonctionnalités décrites et ne donne pas l’édition courante de la page. Une fonction logicielle activable n’est pas un niveau Business Capability du catalogue RBA.
- Articulation produit : [Comparing with SAP Fashion Management Solution](https://learning.sap.com/courses/outlining-sap-s-4hana-for-fashion-and-vertical-business-and-implementing-best-practices/comparing-with-sap-fashion-management-solution-fms-1), section Order Fulfillment, texte consulté, édition non affichée ; intégration des fonctionnalités d’affectation à aATP. ELM032 conserve les lectures antérieures et la distinction affectation/confirmation.
- Reformulation et adaptation : protéger des ressources pour des usages ou groupes et couvrir des demandes par des ressources admissibles sont des aptitudes métier. Leurs définitions locales détaillées restent proposées. Allocation Run relève des mécanismes de réalisation ; une fonctionnalité ou un traitement peut contribuer à plusieurs capacités, sans équivalence un-à-un.
- Limite de preuve : aucun classement natif exact Supply Protection ou Supply Assignment comme Business Area, Business Capability RBA ou Solution Capability RSA n’est établi dans ce corpus. Ce résultat ne prouve ni leur absence des catalogues ni l’absence d’aptitudes métier correspondantes. Aucune configuration Beaumanoir ou Boardriders démontrée. Voir C49 et CMP038.

### ELM068

- Références : MKT04/MKT13 SAP, MKT14 Microsoft Dynamics 365, MKT19 TM Forum. Contrôle ciblé D01 du 2026-09-11 ; pages publiques ouvertes et texte lu. Les bandeaux de connexion Microsoft n’empêchaient pas la lecture du contenu ; aucune connexion utilisée.
- SAP RBA : [Discovering the Reference Architecture Content](https://learning.sap.com/courses/sap-enterprise-architecture-framework-foundation-introduction/discovering-the-reference-architecture-content), Business Capability Model Example : Inventory Management est une Business Area sous Supply Chain Execution et Supply – Fulfill Demand. Édition du catalogue non exposée ; ELM014 conserve la preuve visuelle antérieure des feuilles, dont Physical Inventory. Pas de nouvelle lecture visuelle des feuilles dans ce contrôle.
- SAP produit : [Defining Inventory Management and Physical Inventory](https://learning.sap.com/courses/inventory-management-and-physical-inventory-in-sap-s-4hana/defining-inventory-management-and-physical-inventory-1), Managing Stocks by Quantity / Planning, Entry, and Documentation of Goods Movements / Carrying Out the Physical Inventory ; édition non affichée. Quantités et états, lots et stocks spéciaux ; Goods Receipt, Goods Issue, Stock Transfer et Transfer Posting ; comparaison au comptage et ajustement. Les Transfer Postings peuvent changer la qualification sans déplacement physique. La source traite aussi quantités commandées, réservations et valeur ; ne pas assimiler son périmètre complet à D01. Sommaire Analyses : listes de stock et documents repérées, sans lecture de la leçon détaillée.
- Microsoft périmètre : [Inventory management overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-home-page), présentation, page datée 2025-08-29 ; module incluant opérations entrantes/sortantes et contrôle, périmètre de solution plus large que D01.
- Microsoft visibilité : [Inventory Visibility Add-in overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility), présentation / Get a global view of real-time inventory / Central inventory adjustment / Inventory Visibility terminology ; page datée 2025-08-14. Vision de quantités et états multisources et multilieux, mises à jour et dimensions. Réservations, ATP et allocation également décrits ; leur présence dans le produit ne les rattache pas à D01. La mention temps réel n’établit pas une garantie locale de fraîcheur ou de non-double-comptage.
- Microsoft faits et écarts : [Inventory journals](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-journals), introduction / Types of inventory journals / Transfer / Counting / Inventory adjustment ; version de produit non établie. Transactions, comptage et corrections de quantités. Un Transfer journal ne suit pas le stock en transit ; la documentation renvoie à Transfer order pour ce besoin. Ne pas généraliser le comportement d’un journal à tous les transferts.
- TM Forum : [Stock Management API TMF687 v4.0](https://www.tmforum.org/open-digital-architecture/open-apis/stock-management-api-TMF687/v4.0), Overview et Release history. Représentation du stock, consultation, modification, ajustement, réservation et notifications. La date 15 mai 2026 correspond à une mise à jour CTK ; pas une nouvelle version homogène de modèle métier. Notice lue, guide complet non lu. Une notification ne prouve pas un historique de faits de gestion ni un rapprochement physique.
- Adaptation : appuis sémantiques séparés pour les quatre aptitudes D01.a–d, avec rapprochement particulièrement lisible de la consolidation à Inventory Visibility. Les termes de produit éclairent les capacités sans les réduire à leurs réalisations (C49).
- Limites : aucune équivalence complète de domaine ou de capacité, aucune exhaustivité du marché et aucune configuration Beaumanoir prouvées. BIZBOK/Guild et ARTS sont repris à partir de ELM066/ELM024, sans nouvelle consultation dans ce contrôle.

### ELM069

- Références : MKT14 Microsoft Dynamics 365 et MKT13 SAP S/4HANA ; examen ciblé du 2026-09-11 après U75, textes publics ouverts et consultés.
- Microsoft réservation : [Inventory Visibility reservations](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-reservations), introduction / Sample use case for soft reservation / Configure reservation mappings and dimensions / Example available-for-reservation calculation. La soft reservation modifie la quantité réservée et la quantité disponible à réserver, sans mouvement physique immédiat ; création, ajustement, annulation et compensation à la consommation sont décrits. Une mesure calculée détermine la disponibilité pour réservation selon les mesures retenues. Borne 10.0.33 pour la fonctionnalité citée de réservation depuis les commandes de vente, pas version homogène de toute la page. Aucun cycle installé Beaumanoir déduit.
- Microsoft représentations : [Inventory Visibility Add-in overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility), introduction / Feature highlights / Inventory Visibility terminology, date affichée 2025-08-14. Mesures et dimensions, visibilité multisource, quantités réservées et calculées ; physique dans le vocabulaire des mesures produit ne signifie pas nécessairement stock matériellement présent. Le produit réunit ces comportements sans imposer nos domaines.
- SAP affectation : [Comparing with SAP Fashion Management Solution](https://learning.sap.com/courses/outlining-sap-s-4hana-for-fashion-and-vertical-business-and-implementing-best-practices/comparing-with-sap-fashion-management-solution-fms-1), Order Fulfillment ; cours sans édition affichée, texte reconsulté. Intégration des fonctionnalités de Supply Assignment à aATP ; prolongement de ELM032/ELM067. Cet appui ne fournit pas une feuille RBA exacte ni une équivalence complète avec l’aptitude locale.
- Reformulation : réservation et disponibilité calculée sont reliées, sans changement physique nécessaire ; la disponibilité dépend des mesures et règles de l’usage. L’affectation relie couverture de demande et ressources. Ces lectures confortent la distinction des résultats métier sans imposer des applications ou des objets distincts.
- Limites : la formule illustrative de Microsoft n’est pas transposée comme formule universelle. Pool logique, vue et ressource future restent distincts ; aucun calcul de priorité ou garantie d’absence de survente locale déduits. Les autres comparaisons D01 restent celles de ELM068/CMP039/CMP040.

### ELM070

- Référence : MKT13, SAP Inventory Management ; examen du 2026-09-11, textes SAP Learning ouverts et lus.
- Sources : [Outlining Reservations in SAP S/4HANA](https://learning.sap.com/courses/inventory-management-in-sap-cloud-erp/outlining-reservations-in-sap-s-4hana-1), Function and Origin of a Reservation / Structure of a Reservation / Goods Movement with Reference to a Reservation ; [Checking Availability](https://learning.sap.com/courses/inventory-management-in-sap-cloud-erp/checking-availability-1), Dynamic Availability Check / Customizing – Set up Availability Check. Cours sans édition produit exposée.
- Nature : documentation de capacités de réalisation et d’objets de produit ; pas nouveau rang RBA attesté.
- Reformulation : Reservation planifie une mise à disposition de marchandises pour un mouvement, une date et un usage. Sorties et transferts notamment ; document avec lignes article/quantité/date/lieu. Origines manuelles, besoins d’ordres/projets et transferts de réassort décrits. Ne pas assimiler automatiquement toute commande client à ce document.
- Disponibilité : le contrôle dynamique peut considérer stocks, entrées prévues et sorties/réservations ; il est utilisé notamment à la réservation et à la sortie de marchandises. L’exemple SAP 100 en stock, 30 et 20 réservées ne laisse que 50 disponibles ; une tentative de retrait de 60 déclenche avertissement ou erreur selon configuration.
- Limites : ne conclure ni que la réservation MM bloque toujours absolument le stock ni qu’elle ne le protège jamais. Effet du contrôle et comportement en cas d’insuffisance dépendent des règles documentées. Aucun paramétrage ni cycle local Beaumanoir démontrés.

### ELM071

- Référence : MKT14, Microsoft Dynamics 365 Supply Chain Management ; examen du 2026-09-11, pages publiques ouvertes et textes lus malgré les bandeaux génériques de connexion.
- Source principale : [Reserve inventory quantities](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/reserve-inventory-quantities), introduction / Inventory reservation policies / Policies on the Inventory and warehouse management parameters page ; date affichée 2025-08-29, pas release homogène déduite. La réservation pour une commande empêche le prélèvement pour d’autres commandes sauf annulation totale ou partielle. Elle peut porter sur le stock présent et, selon configuration, sur des articles commandés mais pas encore reçus ; Reserve ordered items est explicité. Ventes, production et transferts sont documentés.
- Source de granularité : [Reservations in Warehouse management](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/reservations-in-warehouse-management), Reservation hierarchies / Making reservations on different levels / On-hand representation and calculations, version globale non établie. Reserved physical et Reserved ordered sont distingués. Pour les articles et entrepôts concernés, les dimensions peuvent être précisées progressivement : réserver à une maille site/entrepôt/état sans fixer immédiatement l’emplacement ou l’unité logistique. Un reserved physical n’est donc pas nécessairement une pièce individuelle déjà sélectionnée.
- Source de soft reservation : [Inventory Visibility reservations](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-reservations), Sample use case / Integrate soft reservations and offsets with Supply Chain Management ; page évolutive, conditions de version détaillées selon fonction, dont 10.0.33 pour la réservation depuis les commandes. Quantité encore réservable diminuée sans mouvement physique ; compensation lors du passage à une réservation ERP ou de la consommation, selon les règles d’intégration. Ne pas déduire une expiration automatique de soft, ni un caractère non engageant du seul adjectif.
- Adaptation : appui pour engagement de quantité présent/futur, précision de la ressource et cohérence entre représentations d’un même engagement. Réservation Microsoft peut inclure une liaison ressource/demande proche de ce que le modèle local appelle affectation.
- Limites : ces mécanismes sont des réalisations, pas une taxonomie de capacités locales imposée. Aucun FIFO, lot, source de vérité centralisée, configuration ou garantie d’absence de survente attribués à Beaumanoir. Les détails WMS n’entrent pas dans les développements FLOW par cette comparaison.

### ELM072

- Référence : MKT13, SAP S/4HANA Advanced Available-to-Promise ; examen du 2026-09-11.
- Sources et accès : [Quantities Reserved by Supply Assignment (ARun) in aATP](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f132c385e0234fe68ae9ff35b2da178c/e11ff055aa2a6d55e10000000a4450e5.html), Use / Features / Example ; [Quantities Reserved by Supply Assignment (ARun) in MRP](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f132c385e0234fe68ae9ff35b2da178c/f04ff9550e5d7e43e10000000a4450e5.html), Use / Features. Extraits indexés détaillés examinés, ouvertures directes sans texte exploitable. Version affichée dans l’index : 2025 FPS01 (Feb 2026) ; exemples portant des dates anciennes conservés comme illustrations de la source, pas datation de la fonctionnalité.
- Nature : effet des résultats de Supply Assignment sur calculs ATP/MRP, documentation de produit.
- Reformulation : SAP nomme explicitement les quantités réservées par Supply Assignment. Les stocks ou entrées futures déjà affectés à des besoins sont pris en compte comme engagés ; aATP ne peut promettre que la part restant disponible. Le besoin et la ressource affectés sont considérés ensemble.
- Adaptation : l’affectation peut produire un effet de réservation ; il n’est pas établi qu’il faille toujours deux engagements indépendants ou deux capacités entièrement disjointes. Cette observation est cohérente avec les précautions ELM032/ELM067, désormais mieux documentées.
- Limites : ne pas confondre cet effet avec le document Reservation de MM-IM. Les pages ne prouvent ni configuration Boardriders ni feuille RBA sous ces noms ; traitement MRP comporte des conditions/exceptions et n’est pas généralisé. Aucun lien natif un-à-un avec nos objets ou contrats.

### ELM073

- Référence : MKT14, Microsoft Dynamics 365 Supply Chain Management ; descriptions de produit, pas catalogue de capacités.
- Consultation : 2026-09-11, textes publics ouverts et lus. Version produit globale non précisée dans les passages utilisés.
- Source : [Purchase agreements](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-agreements), page mise à jour le 2026-09-08 ; introduction, Policies for purchase agreements et Fulfillment calculations. Accords avec période de validité, engagements en quantité ou valeur, suivi du restant et option Max is enforced plafonnant le cumul des lignes de commande. Le reliquat est présenté comme engagement à satisfaire ; il ne démontre pas seul une quantité livrable à une date.
- Source : [Inventory Visibility on-hand change schedules and ATP](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-available-to-promise), page du 2025-06-17 ; How the on-hand change schedule and ATP calculations work. Dates et quantités attendues distinctes des quantités présentes ; scheduled supply et calcul ATP par horizon. À réception, l’exemple actualise la quantité présente et compense la variation prévue. Uncommitted qualifie ici la variation non encore appliquée au stock, pas nécessairement une commande non engagée chez un fournisseur.
- Source : [Set up a location directive for purchase order putaway](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/tasks/set-up-location-directive-purchase-order-put-away), titre et introduction ; putaway désigne le rangement des articles reçus vers leurs emplacements. Édition non relevée ; appui terminologique uniquement.
- Adaptation proposée : séparer potentiel contractuel, ressource attendue et résultat de disponibilité ; relier les transitions pour éviter les doubles comptes. Ces notions éclairent U79, sans imposer objets logiciels ni formule Microsoft.
- Limites : pas de preuve qu’un reliquat de contrat soit une entrée ATP native, ni que tout achat planifié soit réservable. Autorités et règles locales non établies.

### ELM074

- Référence : MKT13, SAP S/4HANA aATP ; description de produit.
- Libellé natif : Backorder Processing, passage relatif à Supply Assignment ; identifiant de page 6b8eb017a1d1431abde00056a249f72b.
- Source : [SAP Help — Backorder Processing](https://help.sap.com/docs/PRODUCT_ID/f132c385e0234fe68ae9ff35b2da178c/6b8eb017a1d1431abde00056a249f72b.html).
- Consultation : 2026-09-11, extrait indexé examiné ; ouverture directe sans texte exploitable. Version non affichée dans l’extrait, guide intégral non lu.
- Contenu consulté : stock physique et réceptions futures sont pertinents pour Supply Assignment ; l’extrait cite purchase orders, production order header, shipping notifications, planned orders et purchase requisitions. Il mentionne aussi la configuration du périmètre de contrôle de disponibilité.
- Reformulation : l’affectation peut considérer plusieurs origines de ressources futures, y compris des éléments planifiés selon les règles du produit.
- Adaptation : appui partiel à l’aptitude D02.e située en D03 et à U79 ; conserver nature, date, fermeté et admissibilité de chaque ressource.
- Limites : ne prouve ni admissibilité inconditionnelle de tous les éléments, ni utilisation directe d’un reliquat contractuel fournisseur, ni configuration Boardriders. Les planned orders SAP ne sont pas assimilés aux Planned Purchase Orders du récit ; aucun classement RBA déduit.

### ELM075

- Référence : MKT13 SAP S/4HANA ; vocabulaire de documentation produit, distinct du rang natif RBA déjà examiné en ELM014.
- Consultation : 2026-09-11, texte public ouvert et lu ; cours sans version de produit affichée.
- Source et localisateurs : [Defining Inventory Management and Physical Inventory](https://learning.sap.com/courses/inventory-management-and-physical-inventory-in-sap-s-4hana/defining-inventory-management-and-physical-inventory-1), The Tasks of Inventory Management / Managing Stocks by Quantity et Carrying Out the Physical Inventory.
- Libellés et contenu : Managing Stocks by Quantity désigne l’enregistrement des variations et la mise à jour des quantités ; le texte distingue libre utilisation, contrôle qualité, commandé non reçu et réservé. Physical Inventory est expliqué par un comptage physique, une comparaison aux quantités enregistrées et la régularisation des différences. Le terme stock-taking est employé dans cette explication.
- Source historique complémentaire : [physical inventory document (MM-IM)](https://help.sap.com/saphelp_snc70/helpdata/EN/35/26c065afab52b9e10000009b38f974/content.htm?no_cache=true), SAP Library Glossary, chemin snc70 ; édition exacte/date non affichées. Texte consulté : document de préparation, enregistrement des comptages et différences ; rapprochement explicite avec stocktaking process. Source historique uniquement, pas preuve de nouveauté S/4HANA.
- Adaptation : Manage inventory quantities est une proposition locale simplifiant le libellé SAP, avec états physiques/logiques et futur explicités dans la définition. Count and reconcile inventory propose de nommer le résultat de comptage et rapprochement ; Stocktaking est un intitulé court possible.
- Limites : aucun de ces deux libellés locaux n’est présenté comme une feuille SAP native. La mise à jour des stocks rapproche D01.a et D01.b ; pas de preuve de leur séparation obligatoire. La valorisation décrite par SAP ne rejoint pas le périmètre FLOW.

### ELM076

- Référence : MKT14 Microsoft Dynamics 365 ; distinguer notions et fonctions de produit, business process area et processus. Consultation : 2026-09-11, pages anglaises publiques ouvertes et lues ; version produit globale non précisée.
- [Inventory on-hand list](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-on-hand-list), introduction et Query your on-hand inventory : vue des biens, disponibilités, attentes et réservations, actualisée par les transactions. Date de page non relevée. On-hand inventory est ici une notion/vocabulaire de vue, pas une capacité nommée ; ne pas réduire automatiquement tout le contenu aux seules quantités physiquement présentes.
- [Maintain inventory levels](https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/inventory-to-deliver-maintain-inventory-levels-overview), page anglaise du 2026-07-15 : introduction et process flow. Business process area dans Inventory to deliver, avec mouvements, comptages et ajustements. Count inventory est un processus listé. Périmètre plus large que D01.a ; la copie linguistique indexée datée de 2025 ne remplace pas la page anglaise consultée.
- [Inventory journals](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-journals), page du 2025-08-29, section Counting : enregistrement du comptage et ajustements pour rapprocher les différences. Counting est un type de journal de produit, pas un niveau natif de capacité. Cycle counting est cité comme variante ; aucune organisation de comptage importée dans la capability map.
- Reformulation et adaptation : le vocabulaire distingue connaissance des quantités, comptage et corrections. Inventory accuracy apparaît comme bénéfice/finalité dans Maintain inventory levels. Proposer Manage inventory quantities et Count and reconcile inventory pour les aptitudes locales, sans affirmer qu’il s’agit de noms Microsoft exacts.
- Limites : aucune paire de feuilles natives équivalentes à D01.a/D01.d prouvée. On-hand et Maintain inventory levels ne couvrent pas exactement la même maille ; ni fiabilité absolue, ni cible de moteur, ni configuration Beaumanoir démontrée.

**Complément ELM076 — U84, 2026-09-11 :** page anglaise Inventory journals ouverte et section Counting relue ; date affichée 2025-08-29. Le même passage associe comptage physique et ajustements de rapprochement. Appui à la proposition locale Counting, sans statut de Business Capability natif affirmé ni nouvelle fonctionnalité ajoutée.

### ELM077

- Références : MKT13 SAP S/4HANA, MKT14 Microsoft Dynamics 365. Audit U87, textes publics ouverts et lus le 2026-09-11 ; éditions globales non exposées dans les passages utilisés.
- SAP : [Using Advanced Available-To-Promise](https://learning.sap.com/courses/functions-innovations-in-sap-s-4hana-sales/using-advanced-available-to-promise-aatp-in-sap-s-4hana_ef38afd2-4730-433f-854a-613b8e4afec5), Product Availability Check, Backorder Processing et Confirmation Strategies. PAC détermine quantité/date et produit une confirmation ; BOP réexamine les confirmations après changement d’offre ou demande. Exemples : annulation, client prioritaire, fabrication en retard. Supply Assignment peut intervenir comme méthode de contrôle dans BOP. Ces réalisations peuvent combiner plusieurs résultats locaux ; pas de séparation logicielle imposée entre calcul, confirmation et affectation.
- Microsoft : [Order promising](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/delivery-dates-available-promise-calculations), introduction, ATP calculations, CTP calculations. ATP prend en compte quantités non engagées, délais, entrées prévues et sorties ; ATP + Issue margin ajoute la préparation. CTP considère aussi les capacités. La formule, les moteurs et le périmètre de planification du produit ne sont pas adoptés pour FLOW ; aucune équivalence CTP avec D03 seul ou besoin de Manufacturing déduits. Date de page non relevée.
- Microsoft : [Inventory Visibility reservations](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-reservations), introduction et Sample use case. Le cycle documenté comprend création, ajustement, annulation/libération et compensation ; il reste associé à la réservation. La configuration peut autoriser une poursuite en survente ; pas de garantie inconditionnelle déduite. Les fonctionnalités par version ne sont pas généralisées.
- Adaptation proposée : inclure la disponibilité de promesse dans D03 ; rattacher les révisions à l’objet engagé plutôt qu’à une aptitude générique sans objet défini. Les titres Supply Feasibility, Confirmation et Promise Revision sont locaux ; Supply Assignment conserve le nom déjà retenu pour l’aptitude.
- Limites : descriptions de produit, pas export exhaustif de capacités ni preuve de déploiement. La non-nécessité de D02 est une conclusion locale, pas une absence démontrée dans tous les référentiels. ELM014/ELM067 restent les preuves de rang RBA ; les réserves BIZBOK/TM Forum antérieures demeurent.

### ELM078

- Référence : MKT04, SAP Reference Business Architecture. Nouvelle lecture visuelle le 2026-09-11 du [schéma de cours](https://learning.sap.com/service/media/topic/a5b46f7b-c642-4fb7-8db0-b521946e9469/EAF00_10_en-US_media/EAF00_10_en-US_images/1BusCapabModel_Ex_image.png), colonne Order Promising ; complément de ELM014, pas remplacement d’édition.
- Source de contexte : [Discovering the Reference Architecture Content](https://learning.sap.com/courses/sap-enterprise-architecture-framework-foundation-introduction/discovering-the-reference-architecture-content), section Business Capability Model. Édition de l’exemple inconnue.
- Nature : cinq éléments visibles au rang Business Capability dans une Business Area. Libellés transcrits et correspondances dans la [comparaison U89](order-promising-comparaison-capacites.md#2-ce-que-lon-peut-compter).
- Définition consultée : rangs et libellés du schéma ; définitions détaillées des cinq feuilles non disponibles dans l’image. Pas d’identifiant natif exposé. Le nombre cinq porte seulement sur cet extrait ; pas de preuve d’exhaustivité ni d’absence des capacités documentées ailleurs.

### ELM079

- Référence : MKT13 SAP S/4HANA. Textes publics lus le 2026-09-11, éditions globales non affichées.
- Sources : [Using Advanced Available-To-Promise](https://learning.sap.com/courses/functions-innovations-in-sap-s-4hana-sales/using-advanced-available-to-promise-aatp-in-sap-s-4hana_ef38afd2-4730-433f-854a-613b8e4afec5), sections PAL, ABC et Release for Delivery, complément PAC/BOP de ELM077 ; [Acquiring a Basic Understanding of ATP](https://learning.sap.com/courses/performing-the-availability-check/acquiring-a-basic-understanding-of-available-to-promise-atp-_ae470c8e-1483-46ce-b5cc-e80647e8a32b), passage SBC, extrait indexé détaillé consulté.
- Nature : comportements de produit, pas nouveaux rangs RBA déduits. Reformulation : contrôler les allocations ; chercher des alternatives ; provoquer un approvisionnement pour confirmer. SBC documente notamment la création de propositions d’approvisionnement et leur date, avec PP/DS en édition privée/on-premise.
- Adaptation et limite : [critères U89](order-promising-comparaison-capacites.md#3-couverture-éprouvée-sur-dix-critères-explicites), sans import de réalisation logistique ou de Manufacturing. PAL et SUP ne sont pas assimilés ; l’extrait RBA et ces produits ne constituent pas une édition homogène.

### ELM080

- Référence : MKT14 Microsoft Dynamics 365 Supply Chain Management. Textes publics lus le 2026-09-11 ; version globale non établie.
- Sources : [Order promising](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/delivery-dates-available-promise-calculations), introduction, cinq méthodes de contrôle des dates, note de recalcul et CTP calculations ; date affichée 2026-04-21. [Delivery alternatives](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/delivery-alternatives), introduction, Delivery alternatives FastTab et Impact of selected alternative ; date affichée 2021-09-29.
- Nature : fonctionnalités et variantes de calcul. Reformulation : ATP/CTP éclairent la faisabilité ; alternatives de lieu, de variantes produit et de quantité partielle détaillées dans la seconde page. Les limites diffèrent selon les méthodes.
- Adaptation : ne pas réduire Microsoft au calcul de date, ni compter les cinq méthodes comme cinq capacités. La note de recalcul ne démontre pas une préemption globale de ressources entre commandes. Substitution générale et changement de variante ne sont pas équivalents. CMP047.

### ELM081

- Référence : MKT20 Oracle Fusion Cloud, édition 26B. Textes publics lus le 2026-09-11.
- Sources/localisateurs : [Overview of Global Order Promising](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fascp/overview-of-global-order-promising.html), introduction et Principles of Promising ; [Manage Supply Allocation Rules](https://docs.oracle.com/en/cloud/saas/readiness/scm/26b/order26b/26B-order-mgmt-wn-f42969.htm), introduction, allocation nodes, partage des règles avec Backlog Management.
- Nature : principes et comportements de produit. Reformulation : choix de ressources présentes/futures ou à créer, d’origines, de substitutions et de réponses fractionnées ; critères économiques possibles. Les allocations peuvent suivre des groupes de demandes et des priorités.
- Adaptation : contrôle de couverture P83, pas transposition du produit en capacités. Les sept principes ne sont pas sept capacités natives ; assignment sets ne prouve pas une équivalence avec Supply Assignment. Réexamen global du backlog et cycle d’affectation non établis par ces seuls passages. Aucun fonctionnement local déduit ; CMP047.

### ELM082

- Référence : MKT21 APICS CPIM ; [extrait officiel diffusé par ASCM](https://learningsystem.ascm.org/wp-content/uploads/2018/11/APICS_CPIM_2019_Excerpt.pdf), texte lu le 2026-09-11.
- Version/localisateurs : CPIM 6.1, édition 2019, PDF pages 1 et 3, pages imprimées 1-207 et 1-209, Master Scheduling and Sales et définition ATP ; PDF page 5, imprimée 1-211, Capable-to-Promise. Extrait citant le dictionnaire APICS 15e édition, pas dictionnaire complet examiné.
- Nature et reformulation : ATP, développé **Available-to-Promise**, désigne dans ce contexte la part non engagée du stock et de la production planifiée qui soutient la promesse client. CTP est distingué avec contraintes de capacité. Order promising est présenté comme la prise d’un engagement de livraison.
- Adaptation : appui au vocabulaire transverse proposé en U90 ; le calcul ou contrôle de l’ATP peut contribuer à une capacité locale de vérification. Aucun libellé natif Promise Verification ni hiérarchie en quatre capacités attestés. Pas de méthode de calcul universelle, d’architecture imposée ou d’extension FLOW à la planification de saison.

### ELM083

- Références : MKT13 SAP S/4HANA, complément Transportation Management ; MKT14 Microsoft et MKT20 Oracle pour promesse et transport. Contrôle le 2026-09-11.
- SAP : [Defining Planning Processes](https://learning.sap.com/courses/business-processes-in-sap-s-4hana-transportation-management/defining-planning-processes_c47bf785-22c2-4136-8ffd-83b8a22718d6), The Planning Processes et International Transportation, texte public ouvert et lu ; édition globale non affichée. Reformulation : planifier des acheminements peut combiner des modes, des étapes, des contraintes de capacité et des choix de transporteur. Nature : description de produit et processus, pas nouvelle feuille RBA attestée.
- Microsoft : [Delivery alternatives](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/delivery-alternatives), introduction, Delivery date control methods et Delivery alternatives FastTab, texte relu ; date affichée 2021-09-29. Mode, calendriers et délais de transport influencent les solutions et dates proposées. Cela ne prouve pas à lui seul une conception complète de chaînes multimodales dans cette fonction.
- Oracle : [Overview of Global Order Promising](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fascp/overview-of-global-order-promising.html), 26B, Supply Chain et Principles of Promising, texte relu ; modes et coûts de transit interviennent dans le choix des solutions. Ne pas assimiler ce comportement à tout Transportation Management.
- Adaptation : Fulfillment Route Decision est un nom local pour choisir l’acheminement qui soutient la promesse ; son autonomie et son domaine propriétaire restent proposés. Source et route peuvent être choisis conjointement ; aucun processus obligatoire ni périmètre de réalisation FLOW supplémentaire. CMP050.

### ELM084

- Référence : MKT14 Microsoft Dynamics 365, produits Supply Chain Management et Business Central explicitement distingués. Textes publics lus le 2026-09-11.
- [Order promising — Supply Chain Management](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/delivery-dates-available-promise-calculations), ATP calculations et CTP calculations, date affichée 2026-04-21 : ATP inclut les ressources non engagées et les réceptions prévues ; CTP ajoute les capacités.
- [Calculate sales order delivery dates using CTP — Supply Chain Management](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/calculate-delivery-dates-using-ctp), How CTP compares to ATP, Near real-time CTP et comparaison des moteurs, date de page non relevée : la disponibilité des composants et des ressources de fabrication peut fonder une réponse lorsque le produit fini manque. Modalités de calcul dépendantes de version et configuration ; Near real-time CTP et Batch CTP sont des réalisations, pas deux capacités métier. C62 conserve la divergence avec la page générale ; conditions de version 10.0.41 et activation précisées dans la page détaillée.
- [Calculate order promising dates — Business Central](https://learn.microsoft.com/en-us/dynamics365/business-central/sales-how-to-calculate-order-promising-dates), About order promising, Available to promise, Capable to promise et Calculations, version globale/date de page non relevées : CTP raisonne sur le manque et la possibilité de produire, acheter ou transférer ; acceptation des dates peut créer des lignes de planification/réservation. Ne pas attribuer ce cycle tel quel à Supply Chain Management.
- Nature : concepts et comportements de produit ; adaptation locale ATP/CTP comme contributions possibles à Promise Proposal, CTP lié partiellement à Supply Creation Decision. Pas d’équivalence avec deux capacités locales, ni de promesse engageante déduite d’un calcul seul. CMP051.

### ELM085

- Référence : MKT13, SAP, lecture du 2026-09-11. [Describing Sales Order Management](https://learning.sap.com/courses/exploring-end-to-end-business-processes-in-sap-business-suite/describing-sales-order-management_ca7b816e-af6f-4a03-bd88-1a5bb42cef84), Sales Order Overview et Sales Order Processing ; texte public ouvert, édition globale inconnue. Complément à ELM063.
- Nature : description de produit et processus, pas nouveau rang RBA. Reformulation : la commande de vente rassemble parties, produits, conditions et résultats de contrôles, dont disponibilité et prix. Le cours présente aussi des rubriques séparées pour achats et contrats, sans analyse nouvelle complète de ces leçons.
- Adaptation : appui à la connaissance d’un engagement commercial et à ses relations avec la promesse/pricing. Ne pas copier les fonctions entourant l’objet Sales Order comme autant de capacités D04 ; ne pas fusionner les objets ou reprendre les rôles organisationnels du produit.
- Limites : les appuis Purchase Order Management de ELM063 et sous-traitance ELM043 restent antérieurs ; aucun domaine natif Commercial Commitments ni équivalence globale démontrés. CMP053.

### ELM086

- Référence : MKT14 Microsoft Dynamics 365 Supply Chain Management ; textes publics lus le 2026-09-11, pas édition produit globale établie.
- [Purchase agreements](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-agreements), Commitment types, Fulfillment calculations, Confirmations and version history et Purchase agreements and intercompany trade ; date de page non relevée. Engagements, consommation/reliquat et historique illustrent le rapprochement D04, sans formule locale importée.
- [Sales agreements overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/sales-agreements), mêmes sections et Returning an item ordered from a sales agreement ; date affichée 2026-04-27. Accord et commandes liées sont distingués. Une confirmation dans ce produit peut historiser une version sans être une condition de création de commande ; ne pas l’assimiler automatiquement à Promise Confirmation ou à l’entrée en vigueur d’une obligation.
- [Sales returns](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/sales-returns), Return order process et Return material authorization ; date/version non relevées. Autoriser le renvoi ne vaut pas acceptation des biens ou attribution d’un crédit ; inspection et décisions ultérieures sont distinguées.
- Nature : documents, fonctionnalités et processus de produit ; reformulation et appui partiel à P84, pas quatre capacités natives équivalentes. Le modèle commun achats/ventes demeure local ; aucune règle de déploiement Beaumanoir, obligation juridique universelle ou import des capacités financières/logistiques. CMP053.

### ELM087

- Référence : MKT13 SAP MDG et MKT14 Microsoft Dynamics 365.
- Objet : Identité commune et spécialisations client/fournisseur.
- Consultation : 2026-09-11 ; passages textuels publics ouverts et lus, sans connexion. Des bandeaux génériques de connexion Microsoft n’empêchaient pas la lecture du texte.
- Nature : documentation de produit/composant, sauf ELM097 méthodologique ; les titres ne valent pas rangs natifs de capacités.
- Source : [SAP Business Partner](https://learning.sap.com/courses/sap-master-data-governance-on-sap-s-4hana/explaining-the-integrated-object-model-for-the-business-partner), Integrated Object Model, données générales et dépendantes du rôle ; édition/date de publication non affichées.
- Source : [Microsoft Global address book](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/organization-administration/overview-global-address-book), introduction, Party roles et adresses ; page datée 2026-03-18.
- Reformulation : SAP relie Customer et Supplier au même Business Partner ; Microsoft permet plusieurs rôles sur une Party. Les données communes ne suppriment pas les attributs propres à la relation commerciale.
- Adaptation et limites : Modèles et fonctionnalités de produit. Appui à D09 partagé, pas à l’administration locale ni à une définition de Party limitée aux personnes morales. Aucun déploiement prouvé.
- Rapprochement : audit U99, CMP055–CMP057 ; pas de validation métier déduite.

### ELM088

- Référence : MKT13 SAP S/4HANA et MKT14 Dynamics 365.
- Objet : Contrats achats et ventes, distincts des commandes.
- Consultation : 2026-09-11 ; passages textuels publics ouverts et lus, sans connexion. Des bandeaux génériques de connexion Microsoft n’empêchaient pas la lecture du texte.
- Nature : documentation de produit/composant, sauf ELM097 méthodologique ; les titres ne valent pas rangs natifs de capacités.
- Source : [SAP accords achats](https://learning.sap.com/courses/sap-s-4hana-contract-management/outlining-purchasing-agreements-in-sap-s-4hana), Purchasing Agreements et Key Features ; édition non affichée.
- Source : [SAP contrats ventes](https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-public-edition-sales-fundamental-business-processes/executing-solution-process-sales-contract-management-i9i-_cfe682c7-61d0-41a7-b730-e62c7d63dc55), Business Process Overview, périmètre I9I ; édition non affichée.
- Source : [Microsoft accords achats](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-agreements), Commitment types, Fulfillment calculations et Apply purchase agreements ; date non relevée.
- Source : [Microsoft accords ventes](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/sales-agreements), Commitment types, Pricing terms, Policies, Fulfillment ; contrôle du contenu, date antérieure 2026-04-27 consignée en ELM086.
- Reformulation : Les deux suites distinguent les contrats d’achat et de vente. SAP distingue aussi contrats et scheduling agreements. Microsoft expose plafonds et consommation par des commandes liées. Les contrats examinés peuvent viser des articles, catégories, quantités ou valeurs ; un lien à un catalogue nommé n’est pas une structure universelle démontrée.
- Adaptation et limites : Objets/processus produit, sans règle juridique générale. Le reliquat de contrat n’est ni un stock reçu ni un futur certain. D11 peut recevoir les deux variantes sans dupliquer sa capacité d’ingestion ; autorité des consommations à instruire.
- Rapprochement : audit U99, CMP055–CMP057 ; pas de validation métier déduite.

### ELM089

- Référence : MKT13 SAP S/4HANA et MKT14 Dynamics 365.
- Objet : Commandes achats et ventes spécialisées et reliées.
- Consultation : 2026-09-11 ; passages textuels publics ouverts et lus, sans connexion. Des bandeaux génériques de connexion Microsoft n’empêchaient pas la lecture du texte.
- Nature : documentation de produit/composant, sauf ELM097 méthodologique ; les titres ne valent pas rangs natifs de capacités.
- Source : [SAP commande achat](https://learning.sap.com/courses/exploring-end-to-end-business-processes-in-sap-business-suite/managing-purchase-orders_dda0b0d0-7da6-43ec-b162-4faa1a6f339b), Purchase Order Overview, Sending Purchase Order, Document Structure ; édition inconnue.
- Source : [SAP commande vente](https://learning.sap.com/courses/exploring-end-to-end-business-processes-in-sap-business-suite/describing-sales-order-management_ca7b816e-af6f-4a03-bd88-1a5bb42cef84), Sales Order Overview et Processing ; édition inconnue, complément ELM085.
- Source : [Microsoft intercompany](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/intercompany-orders-and-return-orders), About intercompany orders, exemples commandes/retours/accords ; page 2026-05-29.
- Reformulation : La commande d’achat demande une fourniture au fournisseur ; la commande de vente porte la demande client et ses confirmations. SAP distingue les deux traitements. Microsoft relie deux commandes achat/vente en intercompany sans les fondre en un seul document.
- Adaptation et limites : Cette spécialisation produit motive une épreuve de D04 ; elle ne prescrit pas deux domaines de capacités ni une architecture OMS. Une commande d’achat peut exister sans document précédent. Les processus complets incluent des fonctions hors FLOW.
- Rapprochement : audit U99, CMP055–CMP057 ; pas de validation métier déduite.

### ELM090

- Référence : MKT13 SAP S/4HANA et MKT14 Dynamics 365 Commerce/SCM.
- Objet : Catalogues d’approvisionnement et de vente.
- Consultation : 2026-09-11 ; passages textuels publics ouverts et lus, sans connexion. Des bandeaux génériques de connexion Microsoft n’empêchaient pas la lecture du texte.
- Nature : documentation de produit/composant, sauf ELM097 méthodologique ; les titres ne valent pas rangs natifs de capacités.
- Source : [SAP catalogues achats](https://learning.sap.com/courses/describing-requisitioning/managing-catalog-items_ed8d8ea7-25c0-46ab-a4c2-533e135916f4), Catalogs in Sourcing and Procurement, Internal/External Catalog ; édition non affichée.
- Source : [Microsoft catalogues achats](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/procurement-catalogs), introduction et Prerequisites ; page 2026-07-01.
- Source : [Microsoft catalogues B2B](https://learn.microsoft.com/en-us/dynamics365/commerce/catalogs-b2b-sites), introduction, Price groups, catalogues/canaux/assortiments ; versions 10.0.27+, page 2026-01-21.
- Reformulation : Les catalogues achats des pages SAP/Microsoft servent la sélection dans les demandes d’achat ; les catalogues Commerce B2B organisent les offres aux clients et se relient à des groupes de prix. Microsoft distingue ces parcours et contenus.
- Adaptation et limites : Les deux pages achats concernent surtout les besoins internes/achats indirects : elles ne prouvent pas le découpage de l’achat de marchandises à revendre. Ne pas confondre catalogue du fournisseur vu par un acheteur et tout le référentiel produit. Aucune capacité de publication ou validation locale proposée.
- Rapprochement : audit U99, CMP055–CMP057 ; pas de validation métier déduite.

### ELM091

- Référence : MKT14 Microsoft Dynamics 365 SCM.
- Objet : Définition produit commune et données importables.
- Consultation : 2026-09-11 ; passages textuels publics ouverts et lus, sans connexion. Des bandeaux génériques de connexion Microsoft n’empêchaient pas la lecture du texte.
- Nature : documentation de produit/composant, sauf ELM097 méthodologique ; les titres ne valent pas rangs natifs de capacités.
- Source : [Microsoft Product information](https://learn.microsoft.com/en-us/dynamics365/supply-chain/pim/product-information), Product definition, Distribution/export/import, Product masters/variants ; page 2026-07-01.
- Reformulation : La définition produit partagée comprend identifiants, variantes, unités et conversions. Elle peut être importée de PLM/PDM/PIM. Le catalogue commercial seul ne démontre donc pas la couverture des références articles opérationnelles.
- Adaptation et limites : Description de produit et de distribution d’information. Appui à un besoin de Product Reference Ingestion, pas au rétablissement de D08.a–c en administration locale.
- Rapprochement : audit U99, CMP055–CMP057 ; pas de validation métier déduite.

### ELM092

- Référence : MKT13 SAP Retail, MKT14 Dynamics 365, MKT19 TM Forum.
- Objet : Données de prix et application de règles distinctes du catalogue.
- Consultation : 2026-09-11 ; passages textuels publics ouverts et lus, sans connexion. Des bandeaux génériques de connexion Microsoft n’empêchaient pas la lecture du texte.
- Nature : documentation de produit/composant, sauf ELM097 méthodologique ; les titres ne valent pas rangs natifs de capacités.
- Source : [SAP prix Retail](https://learning.sap.com/courses/exploring-sap-s-4hana-cloud-public-edition-retail/performing-sales-pricing-for-retail-3i4-), Sales Pricing for Retail, niveaux de prix, validité et application des conditions ; périmètre 3I4, édition inconnue.
- Source : [Microsoft Unified pricing](https://learn.microsoft.com/en-us/dynamics365/supply-chain/unified-pricing-management/upm-pricing-management-overview), Pricing components, Architecture overview ; page 2026-04-21.
- Source : [TM Forum configurateur](https://www.tmforum.org/resources/specifications/tmfc027-product-configurator-v2-2-0/), notice publique, description et General Information ; 2.2.0 Team Approved 2026-03-24, publiée 2026-03-31, signalée Pre-production.
- Reformulation : SAP distingue conditions tarifaires, niveaux et périodes puis leur application. Microsoft calcule les prix de vente selon attributs et règles, consommables par d’autres applications. La notice TM Forum distingue les prix du catalogue de l’application des règles par le configurateur.
- Adaptation et limites : Ne pas affirmer un référentiel Pricing séparé universel : TM Forum conserve les prix au catalogue. La notice 2.2.0 n’est pas la Production ; lien annoncé 2.1.2 en échec à l’ouverture, spécification membre non lue. Unified pricing ne prouve pas unification achat/vente ni équivalence entre Vendor list price et prix d’achat engagé.
- Rapprochement : audit U99, CMP055–CMP057 ; pas de validation métier déduite.

### ELM093

- Référence : MKT13 SAP S/4HANA et Retail.
- Objet : Relations fournisseur/article et décision de source d’approvisionnement.
- Consultation : 2026-09-11 ; passages textuels publics ouverts et lus, sans connexion. Des bandeaux génériques de connexion Microsoft n’empêchaient pas la lecture du texte.
- Nature : documentation de produit/composant, sauf ELM097 méthodologique ; les titres ne valent pas rangs natifs de capacités.
- Source : [SAP Purchasing Info Records](https://learning.sap.com/courses/sourcing-in-sap-s4hana/working-with-purchasing-info-records), Sources of Supply, Purchasing Info Record, Purchase Order Default Price ; édition inconnue.
- Source : [SAP procurement Retail](https://learning.sap.com/courses/exploring-sap-s-4hana-cloud-public-edition-retail/ordering-merchandise-with-procurement-for-retail-5fm-_fe298f93-84ad-47ff-98ff-658e887e020d), Procurement for Retail, Supply source determination, Retail-specific source determination ; périmètre 5FM.
- Reformulation : L’info record associe fournisseur et article avec conditions et délai. Le choix de source utilise des informations distinctes, dont contrats et listes de sources ; le cas Retail permet sources internes et externes. Le prix de référence et celui appliqué à une quantité commandée peuvent différer.
- Adaptation et limites : Les priorités de sélection sont propres aux variantes de produit et ne sont pas importées. Un quota fournisseur répartit l’approvisionnement ; il n’est pas automatiquement la protection de stock D01. Le choix opérationnel de fournisseur est à éprouver hors de la seule promesse client.
- Rapprochement : audit U99, CMP055–CMP057 ; pas de validation métier déduite.

### ELM094

- Référence : MKT13 SAP Retail.
- Objet : Assortiment et listing temporel.
- Consultation : 2026-09-11 ; passages textuels publics ouverts et lus, sans connexion. Des bandeaux génériques de connexion Microsoft n’empêchaient pas la lecture du texte.
- Nature : documentation de produit/composant, sauf ELM097 méthodologique ; les titres ne valent pas rangs natifs de capacités.
- Source : [SAP assortiments](https://learning.sap.com/courses/exploring-sap-s-4hana-cloud-public-edition-retail/managing-assortments-3i5-), Assortments 3I5, association article/site et périodes de listing ; édition inconnue.
- Reformulation : Le listing associe articles et sites sur une période pour les opérations d’approvisionnement ; la leçon distingue ces périodes de la période de vente portée par l’article.
- Adaptation et limites : Différence de données à recevoir et de règles à appliquer ; ne pas créer un domaine de planification saisonnière ou de conception d’assortiment dans FLOW. La présence d’un article au catalogue ne suffit pas à prouver son admissibilité dans chaque lieu/date.
- Rapprochement : audit U99, CMP055–CMP057 ; pas de validation métier déduite.

### ELM095

- Référence : MKT13 SAP Retail.
- Objet : Sites et lieux opérationnels.
- Consultation : 2026-09-11 ; passages textuels publics ouverts et lus, sans connexion. Des bandeaux génériques de connexion Microsoft n’empêchaient pas la lecture du texte.
- Nature : documentation de produit/composant, sauf ELM097 méthodologique ; les titres ne valent pas rangs natifs de capacités.
- Source : [SAP sites](https://learning.sap.com/courses/exploring-sap-s-4hana-cloud-public-edition-retail/maintaining-sites-for-retail-3i3-), Sites for Retail, Site and Organizational Assignments, site/storage location ; périmètre 3I3.
- Reformulation : SAP distingue magasins, centres de distribution et emplacements, reliés aux structures de l’entreprise. Le lieu opérationnel n’est pas réductible à l’identité d’un fournisseur ou client.
- Adaptation et limites : Ne pas reproduire les structures organisationnelles SAP dans la carte générique. D06 contient déjà des connaissances de lieux ; séparer réception des références et appréciation des possibilités d’exécution, sans choisir de maître ni créer automatiquement un domaine.
- Rapprochement : audit U99, CMP055–CMP057 ; pas de validation métier déduite.

### ELM096

- Référence : MKT19 TM Forum ODA.
- Objet : Parties, accords, catalogues et ordres : composants distincts.
- Consultation : 2026-09-11 ; passages textuels publics ouverts et lus, sans connexion. Des bandeaux génériques de connexion Microsoft n’empêchaient pas la lecture du texte.
- Nature : documentation de produit/composant, sauf ELM097 méthodologique ; les titres ne valent pas rangs natifs de capacités.
- Source : [TMFC028 Party](https://www.tmforum.org/oda/directory/components-map/party-management/TMFC028), description, APIs dépendantes ; 2.1.0, publiée 2024-10-14.
- Source : [TMFC039 Agreement](https://www.tmforum.org/oda/directory/components-map/party-management/TMFC039), description, APIs exposées/dépendantes ; 1.1.0, publiée 2024-08-19.
- Source : [TMFC001 Catalog](https://www.tmforum.org/oda/directory/components-map/core-commerce-management/TMFC001), description et APIs ; 2.1.2, publiée 2025-11-12.
- Source : [TMFC002 Product Order](https://www.tmforum.org/oda/directory/components-map/core-commerce-management/TMFC002), description ; 2.1.0, publiée 2024-11-12.
- Source : [TMFC033 Purchase](https://www.tmforum.org/oda/directory/components-map/core-commerce-management/TMFC033), notice : Planned, sans version ni publication ; spécification annoncée non publiée.
- Reformulation : Party, Agreement et Catalog sont distingués, mais l’ODA contient aussi rôles, adresses/sites, catalogues de services et ressources. Agreement a une portée transversale entre parties. Product Order est orienté client ; Purchase Management est identifié séparément mais reste Planned dans la notice.
- Adaptation et limites : Ces notices de composants et API ne sont ni le SID intégral ni une carte de capacités retail. La seule notice Purchase ne démontre pas une symétrie complète achat/vente. Spécifications détaillées membres non consultées ; versions de notices non homogènes.
- Rapprochement : audit U99, CMP055–CMP057 ; pas de validation métier déduite.

### ELM097

- Référence : MKT03 Business Architecture Guild.
- Objet : Frontière de capacité et objet métier.
- Consultation : 2026-09-11 ; passages textuels publics ouverts et lus, sans connexion. Des bandeaux génériques de connexion Microsoft n’empêchaient pas la lecture du texte.
- Nature : documentation de produit/composant, sauf ELM097 méthodologique ; les titres ne valent pas rangs natifs de capacités.
- Source : [Metamodel Guide](https://cdn.ymaws.com/www.businessarchitectureguild.org/resource/resmgr/whitepapers/Business_Architecture_Metamo.pdf), v3.0 septembre 2024, §5.2, pages PDF 17–18, imprimées 17–18 ; passage textuel relu.
- Reformulation : Les décompositions conservent l’objet du parent : l’exemple Customer ne gère pas les accords ni les produits. Le guide distingue capacité et réalisation contextuelle.
- Adaptation et limites : Appui méthodologique, pas prescription Party/Agreement/Catalog en trois domaines, pas preuve d’une scission achats/ventes dans un catalogue retail. Guide BIZBOK complet et modèles membres non lus ; aucun schéma ou tableau graphique utilisé comme preuve nouvelle.
- Rapprochement : audit U99, CMP055–CMP057 ; pas de validation métier déduite.

### ELM098

- Référence : MKT14 Microsoft Dynamics 365.
- Objet : Réexamen ciblé des cycles, contraintes et retours.
- Consultation : 2026-09-11 ; passages textuels publics ouverts et lus, sans connexion. Des bandeaux génériques de connexion Microsoft n’empêchaient pas la lecture du texte.
- Nature : documentation de produit/composant, sauf ELM097 méthodologique ; les titres ne valent pas rangs natifs de capacités.
- Source : [Réservations](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-reservations), introduction : créer, ajuster, libérer et compenser à la consommation ; variantes produit conservées, date non relevée.
- Source : [DOM rules](https://learn.microsoft.com/en-us/dynamics365/commerce/dom-rules), Partial orders, Offline location, Maximum rejects/orders ; page 2026-01-22.
- Source : [Retours ventes](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/sales-returns), Return order process et RMA ; édition/date non relevées.
- Reformulation : Le cycle de réservation comprend ses ajustements/libérations ; les règles DOM distinguent possibilités du lieu, fractionnement et charge. Un retour autorisé ne vaut pas acceptation physique ni décision de remède.
- Adaptation et limites : Appuis partiels à la révision du D02 résiduel, à D06 et à la maille D04.d. Ne pas importer le processus DOM complet, l’exécution entrepôt ou la finance ; aucune capacité ajoutée par opération produit.
- Rapprochement : audit U99, CMP055–CMP057 ; pas de validation métier déduite.

### ELM099

- Référence : MKT22 SAP Master Data Governance on SAP S/4HANA ; édition précise inconnue, leçon évolutive.
- Libellé natif : Out-of-the-Box Domain Models ; nature : domaines de données d’une solution, pas Business Areas RBA.
- Source et localisateur : [leçon SAP](https://learning.sap.com/courses/introducing-sap-master-data-governance/describing-data-domains-and-extensibility-options), section du même nom, liste textuelle et Extensibility Options ; consultée le 2026-09-11.
- Sens consulté, reformulé : une même solution accueille des modèles spécialisés, notamment client, fournisseur, produit et finance, avec des possibilités d’extension.
- Adaptation et limite : appui à la coexistence regroupement/séparation sémantique. N’établit pas notre trio ou quartet ni un domaine unique de capacités ; la couverture native diffère des extensions et des éditions cloud. Administration et qualité des maîtres non ajoutées à FLOW.

### ELM100

- Référence : MKT14 Microsoft Dynamics 365 ; guide évolutif d’architecture et documentation Supply Chain Management, pas catalogue de capacités.
- Sources et localisateurs : [Data architecture](https://learn.microsoft.com/en-us/dynamics365/guidance/implementation-guide/data-management-architecture), Data architecture et Types of enterprise data, date affichée 2024-01-23 ; [Product information overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/pim/product-information), introduction et Distribution, export, and import of product data, date affichée 2026-07-01.
- Consultation : textes publics lus le 2026-09-11 malgré bandeau générique d’authentification ; pas de version globale unique. Une tentative d’ouverture d’une page Global address book a échoué ; elle n’est pas utilisée comme preuve nouvelle.
- Sens consulté, reformulé : Microsoft réunit plusieurs sujets sous la catégorie master data, distingue celle-ci des données de configuration et transactionnelles, et documente séparément l’information produit partagée et sa réception depuis un maître externe.
- Adaptation et limite : catégorie commune compatible avec objets spécialisés ; aucune hiérarchie native Domain/Capability ni modèle de réception unique établi. ELM091 conservé comme lecture précédente du sujet produit.

### ELM101

- Référence : MKT19 TM Forum ODA ; composants et Function Blocks, pas niveaux de business capabilities.
- Sources/localisateurs : [Agreement Management](https://www.tmforum.org/oda/directory/components-map/party-management/TMFC039), description et ODA Function Block, version 1.1.0 publiée 2024-08-19 ; [Product Catalog Management](https://www.tmforum.org/oda/directory/components-map/core-commerce-management/TMFC001), mêmes champs, version 2.1.2 publiée 2025-11-12 ; [annuaire](https://www.tmforum.org/oda/directory/components-map), rubriques Party Management et Core Commerce Management.
- Consultation : notices publiques relues le 2026-09-11 ; spécifications membres non lues.
- Sens consulté, reformulé : Agreement Management et le composant Party Management sont dans le bloc Party Management ; Product Catalog Management est dans Core Commerce Management. Un bloc peut donc regrouper plusieurs sujets distincts, sans bloc unique de tous les référentiels.
- Adaptation et limite : exemple d’agrégation utile, pas prescription de rattacher Agreement à Party localement. Product Catalog englobe spécifications produit et offre ; aucune correspondance automatique au SKU retail autonome. Complète ELM096 sur le rang de regroupement.

### ELM102

- Référence : MKT03 Business Architecture Guild ; The Business Architecture Metamodel Guide v3.0, septembre 2024.
- Source/localisateur : [guide public](https://cdn.ymaws.com/www.businessarchitectureguild.org/resource/resmgr/whitepapers/Business_Architecture_Metamo.pdf), §5.2, page PDF 17 (index 16), continuation page 18 ; texte relu le 2026-09-11. Complément de ELM097, pas lecture du guide BIZBOK complet.
- Nature : principe de définition et décomposition des capacités.
- Sens consulté, reformulé : l’objet focal d’une capacité reste celui de ses sous-capacités ; l’exemple Customer ne prend pas en charge les accords ni les produits.
- Adaptation et limite : préserver les sens sous un regroupement de présentation. Ce passage ne prescrit ni un domaine par référentiel ni la hiérarchie locale Univers/Domaine/Capacité ; ne pas présenter notre conteneur comme capacité parente certifiée Guild. Aucun modèle retail réservé aux membres consulté.


### ELM103

- Référence : MKT13 SAP S/4HANA ; leçon évolutive, édition exacte non précisée.
- Libellés natifs : Goods Movements ; Managing Stocks by Quantity.
- Nature : vocabulaire et description fonctionnelle de produit, pas rang RBA établi.
- Source : [Defining Inventory Management and Physical Inventory](https://learning.sap.com/courses/inventory-management-and-physical-inventory-in-sap-s-4hana/defining-inventory-management-and-physical-inventory-1), sections Managing Stocks by Quantity, Planning, Entry, and Documentation of Goods Movements et Documents for Goods Movements ; texte consulté le 2026-09-13.
- Sens consulté, reformulé : SAP distingue les transactions modifiant le stock, les quantités mises à jour et les documents justificatifs. Les réceptions, sorties, transferts et changements de qualification illustrent les mouvements ; ces derniers peuvent exister sans déplacement physique.
- Adaptation : appui partiel à la séparation locale mouvements/état. La documentation inclut valorisation et effets comptables, hors périmètre des capacités proposées ici. Ne prescrit pas deux capacités autonomes ni deux composants.

### ELM104

- Référence : MKT14 Microsoft Dynamics 365 Supply Chain Management ; documentation évolutive, mise à jour affichée 2025-08-29.
- Libellés natifs : Inventory transactions, Inventory movements, Inventory journals.
- Nature : transactions et journaux de produit ; aucune hiérarchie de capacités établie.
- Source : [Inventory journals](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-journals), introduction et Types of inventory journals ; texte consulté le 2026-09-13, malgré le bandeau générique de connexion.
- Sens consulté, reformulé : les journaux enregistrent des transactions de stock de plusieurs types. Movement désigne aussi un type particulier de journal, avec traitement comptable spécifique ; ne pas assimiler ce type à l’ensemble des mouvements locaux.
- Adaptation : Inventory Movements est un nom local proposé pour la capacité à enregistrer et qualifier les mouvements. Les journaux et leur workflow ne deviennent pas des capacités supplémentaires.

### ELM105

- Référence : MKT14, produit Microsoft Dynamics 365 Business Central, distinct de Supply Chain Management ; documentation évolutive, édition exacte inconnue.
- Libellé natif : Item Ledger Entry.
- Nature : écriture dans un modèle de produit ; pas une Business Capability.
- Source : [Design Details: Inventory Posting](https://learn.microsoft.com/en-us/dynamics365/business-central/design-details-inventory-posting), introduction et distinction quantity/value postings ; texte consulté le 2026-09-13.
- Sens consulté, reformulé : les variations de quantités sont enregistrées dans les item ledger entries, les variations de valeur dans les value entries. Les écritures d’application relient entrées et sorties.
- Adaptation : Ledger peut éclairer le registre métier des mouvements. Inventory Ledger Management reste un nom de capacité proposé localement, pas un libellé Microsoft attesté. Aucune importation des règles de valorisation ou du schéma technique.
### ELM106

- Référence : MKT14 Microsoft Dynamics 365 Supply Chain Management ; documentation évolutive sans édition figée. Contrôle 2026-09-13.
- Libellés : Sales Agreement, Purchase Agreement, Commitment types, Sales Order, Purchase Order. Nature : objets et règles de produit.
- Sources et localisateurs : [Sales agreements](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/sales-agreements) et [Purchase agreements](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-agreements), introduction, Commitment types et application aux commandes ; textes lus.
- Sens reformulé : les Agreements portent des engagements de quantité ou valeur que consomment les commandes liées. Commitment ne signifie pas exclusivement Order.
- Adaptation : appui sémantique à la distinction Agreement/Order, correction C76 ; aucun rang de capacité ni responsabilité FLOW déduit.

### ELM107

- Référence : MKT13 SAP S/4HANA ; Manage Sales Contracts (édition exacte non obtenue) et Purchase Orders, version affichée 2025 FPS01. Contrôle 2026-09-13.
- Nature : objets et fonctionnalités de produit. Libellés Sales Contract, Sales Order, Purchase Order.
- Sources, liens et localisateurs : [note comparative](orders-agreements-commitments.md), section Sources consultées et limites. Extraits indexés seulement ; ouvertures directes sans texte exploitable.
- Sens reformulé : Sales Order créée à partir d’un Sales Contract ; Purchase Order comme instruction de fourniture. Appui lexical limité, aucune équivalence de domaine ou rang RBA établi.

### ELM108

- Référence : Oracle Fusion Cloud Order Management, édition 25C ; complément produit au corpus Oracle Fusion MKT20, distinct de GOP et de MKT05 Retail Reference Model.
- Source : [How Order Management Transforms Source Orders Into Sales Orders](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fauom/how-order-management-transforms-source-orders-into-sales-orders.html), transformation et Parts of Sales Orders You Can Use After Transformation ; texte lu le 2026-09-13.
- Nature : objets et orchestration de produit. Libellés Source Order, Order line, Orchestration process.
- Sens reformulé : la commande reçue ou saisie est transformée pour sa réalisation ; structure source et structure opérationnelle peuvent différer.
- Adaptation : appui partiel à la distinction commande source/réalisation ; pas d’équivalence globale à notre architecture, pas d’unification achat/vente démontrée.
### ELM109

- Références : MKT04 SAP RBA cité par un article d’architecture ; MKT13 S/4HANA vue produit. Sources S1–S3, liens et localisateurs dans [la localisation des Orders](localisation-orders-cartographie.md). Contrôle du 2026-09-13.
- Libellés : Customer → Sales → Customer Order and Contract Management ; Sales order management ; Sourcing and Procurement → Operational Procurement → Purchase Order Processing.
- Nature et accès : premier chemin dans un extrait indexé, article 403, édition RBA inconnue ; deuxième dans la page produit Sales lue ; troisième dans un extrait de navigation de configuration, ouverture sans texte. Ne pas assimiler leurs niveaux.
- Adaptation : appui au placement distinct des commandes client et achat ; aucun domaine générique Orders ni rang uniforme établi.

### ELM110

- Référence : MKT14 Microsoft Dynamics 365, documentation évolutive. Sources S4–S6, liens dans [la comparaison](localisation-orders-cartographie.md), textes lus le 2026-09-13.
- Libellés : Order to cash / Manage sales orders ; Source to pay / Procure goods and services ; Transfer orders.
- Nature : les deux premiers sont des positions dans le catalogue de processus ; le troisième est un objet et un paramétrage de produit. Les commandes d’achat sont traitées dans Procure goods and services ; les transferts d’entrepôts mobilisent Inventory management et Master planning.
- Adaptation : correspondance de couverture, pas domaines métier équivalents. Aucun retour automatique à une structure locale Source to Pay.

### ELM111

- Référence : MKT20, complément Oracle Fusion Order Management et Procurement 25C. Sources S7–S8 de [la comparaison](localisation-orders-cartographie.md), textes lus le 2026-09-13.
- Libellés et nature : Source Order, Order Management, Purchase Orders ; objets et espaces de produits.
- Sens : représentation de commande transformée pour sa réalisation, ELM108 ; espace distinct des commandes d’achat dans Procurement.
- Adaptation : distinguer origine et réalisation ; ne pas attribuer toutes les commandes de l’entreprise au produit Order Management ni identifier ce produit au domaine D04.

### ELM112

- Référence : MKT23 IBM Sterling OMS, édition précise non indiquée. [Document types](https://www.ibm.com/docs/en/order-management?topic=configuration-document-types), table Order, texte lu le 2026-09-13.
- Libellés : Sales Order 0001, Planned Order 0002, Return Order 0003, Template Order 0004, Purchase Order 0005, Transfer Order 0006, Master Order 0007.
- Nature : types documentaires natifs de produit. Adaptation : appui à la famille générique locale des Orders, pas preuve d’un domaine autonome, d’un objet universel ou d’une carte de capacités. Distinct d’IBM CBM.

### ELM113

- Référence : MKT19 TM Forum ODA ; [Component Directory](https://www.tmforum.org/oda/directory/components-map), sections Core Commerce Management, Production, Party Management ; carte lue le 2026-09-13, édition globale non affichée.
- Libellés : TMFC002 Product Order Capture & Validation et TMFC003 Product Order Delivery Orch & Mgt dans Core Commerce Management ; TMFC007 Service Order Management et TMFC011 Resource Order Management dans Production ; TMFC039 Agreement Management dans Party Management.
- Nature : composants ODA, pas sous-capacités attestées. Page détaillée TMFC007 v1.2.2 inaccessible 403, ne pas revendiquer sa lecture complète.
- Adaptation : appui à la séparation demande commerciale/demandes de réalisation ; aucune équivalence Product/Service/Resource avec nos objets de commerce et de logistique.
### ELM114

- Références : MKT13 SAP S/4HANA for Fashion and Vertical Business, cours évolutif sans édition figée ; MKT14 Microsoft Dynamics 365 Supply Chain Management, Delivery schedules mis à jour 2025-05-07 ; MKT23 IBM Sterling OMS, édition inconnue.
- Sources et localisateurs : [Supply B2B/B2C](supply-b2b-b2c.md), section Constats du marché, liens officiels. Contrôle 2026-09-13 ; SAP et Microsoft textes lus, IBM aperçu indexé et lecture précédente, ouverture directe 403.
- Nature : fonctions et portée de produits, pas rangs de capacités. Libellés : wholesale/retail, delivery schedules, B2B/B2C.
- Sens reformulé : socle SAP intégré et segmentation ; échelonnement de quantités sur plusieurs livraisons Microsoft ; portée multi-clients IBM.
- Adaptation : appui partiel au domaine Order Management commun U140 ; contraintes de satisfaction et échelles différentes à éprouver. Ne prouve ni toutes capacités couvertes ni performances illimitées.


### ELM115

- Référence : MKT19. Libellé natif : Product Stock et opérations associées. Identifiant natif : TMF687.
- Nature : modèle et opérations d’API. Édition, source officielle, localisateur, accès et limites : S1 dans [l'étude U222](inventory-optimization-comparaison.md).
- Passage examiné le 2026-09-15 ; synthèse française séparée de la formulation native dans la table « Éléments effectivement consultés ». Définition formelle de capacité métier non fournie par ce corpus.
- Rapprochements proposés, sans équivalence ou validation locale déduite de la présence dans le produit.


### ELM116

- Référence : MKT19. Libellé natif : Supply Chain Management. Identifiant natif : TMFC032.
- Nature : composant ODA. Édition, source officielle, localisateur, accès et limites : S2 dans [l'étude U222](inventory-optimization-comparaison.md).
- Passage examiné le 2026-09-15 ; synthèse française séparée de la formulation native dans la table « Éléments effectivement consultés ». Définition formelle de capacité métier non fournie par ce corpus.
- Rapprochements proposés, sans équivalence ou validation locale déduite de la présence dans le produit.


### ELM117

- Référence : MKT14. Libellé natif : Coverage settings. Identifiant natif : non indiqué dans le passage consulté.
- Nature : fonctions de produit. Édition, source officielle, localisateur, accès et limites : S3 dans [l'étude U222](inventory-optimization-comparaison.md).
- Passage examiné le 2026-09-15 ; synthèse française séparée de la formulation native dans la table « Éléments effectivement consultés ». Définition formelle de capacité métier non fournie par ce corpus.
- Rapprochements proposés, sans équivalence ou validation locale déduite de la présence dans le produit.


### ELM118

- Référence : MKT14. Libellé natif : DDMRP. Identifiant natif : non indiqué dans le passage consulté.
- Nature : méthode mise en œuvre dans un produit. Édition, source officielle, localisateur, accès et limites : S4 dans [l'étude U222](inventory-optimization-comparaison.md).
- Passage examiné le 2026-09-15 ; synthèse française séparée de la formulation native dans la table « Éléments effectivement consultés ». Définition formelle de capacité métier non fournie par ce corpus.
- Rapprochements proposés, sans équivalence ou validation locale déduite de la présence dans le produit.


### ELM119

- Référence : MKT24. Libellé natif : Inventory Optimization. Identifiant natif : non indiqué dans le passage consulté.
- Nature : fonctions de produit. Édition, source officielle, localisateur, accès et limites : S5 dans [l'étude U222](inventory-optimization-comparaison.md).
- Passage examiné le 2026-09-15 ; synthèse française séparée de la formulation native dans la table « Éléments effectivement consultés ». Définition formelle de capacité métier non fournie par ce corpus.
- Rapprochements proposés, sans équivalence ou validation locale déduite de la présence dans le produit.


### ELM120

- Référence : MKT13. Libellé natif : Replenishment Planning / Forecasting and Replenishment. Identifiant natif : non indiqué dans le passage consulté.
- Nature : fonctions et processus présentés dans un cours produit. Édition, source officielle, localisateur, accès et limites : S6 dans [l'étude U222](inventory-optimization-comparaison.md).
- Passage examiné le 2026-09-15 ; synthèse française séparée de la formulation native dans la table « Éléments effectivement consultés ». Définition formelle de capacité métier non fournie par ce corpus.
- Rapprochements proposés, sans équivalence ou validation locale déduite de la présence dans le produit.


### ELM121

- Référence : MKT14. Libellé natif : Warehouse replenishment. Identifiant natif : non indiqué dans le passage consulté.
- Nature : fonctions WMS. Édition, source officielle, localisateur, accès et limites : S7 dans [l'étude U222](inventory-optimization-comparaison.md).
- Passage examiné le 2026-09-15 ; synthèse française séparée de la formulation native dans la table « Éléments effectivement consultés ». Définition formelle de capacité métier non fournie par ce corpus.
- Rapprochements proposés, sans équivalence ou validation locale déduite de la présence dans le produit.


### ELM122

- Référence : MKT14. Libellé natif : Buffer profile and levels. Nature : fonction de calcul et application de paramètres. Identifiant natif : non indiqué dans le passage consulté.
- Source officielle, édition, date (2026-09-15), localisateur et limites : [table des sources U225](optimisation-et-application-stock.md#sources-et-limites). Reformulation distincte dans la table des constats ; aucune définition native de capacité locale revendiquée.
- Rôle : examiner la direction U224 ; rapprochement proposé, pas validation de modèle ou de couverture installée.


### ELM123

- Référence : MKT14. Libellé natif : Firm planned orders. Nature : fonction de transformation des ordres planifiés. Identifiant natif : non indiqué dans le passage consulté.
- Source officielle, édition, date (2026-09-15), localisateur et limites : [table des sources U225](optimisation-et-application-stock.md#sources-et-limites). Reformulation distincte dans la table des constats ; aucune définition native de capacité locale revendiquée.
- Rôle : examiner la direction U224 ; rapprochement proposé, pas validation de modèle ou de couverture installée.


### ELM124

- Référence : MKT14. Libellé natif : Inventory Visibility inventory allocation. Nature : fonction opérationnelle d’allocation et protection. Identifiant natif : non indiqué dans le passage consulté.
- Source officielle, édition, date (2026-09-15), localisateur et limites : [table des sources U225](optimisation-et-application-stock.md#sources-et-limites). Reformulation distincte dans la table des constats ; aucune définition native de capacité locale revendiquée.
- Rôle : examiner la direction U224 ; rapprochement proposé, pas validation de modèle ou de couverture installée.


### ELM125

- Référence : MKT24. Libellé natif : Example: Integrated Planning Process with Unified Planning Area. Nature : exemple de processus de planification SAPIBP1. Identifiant natif : non indiqué dans le passage consulté.
- Source officielle, édition, date (2026-09-15), localisateur et limites : [table des sources U225](optimisation-et-application-stock.md#sources-et-limites). Reformulation distincte dans la table des constats ; aucune définition native de capacité locale revendiquée.
- Rôle : examiner la direction U224 ; rapprochement proposé, pas validation de modèle ou de couverture installée.


### ELM126

- Référence : MKT13. Libellé natif : Supply Protection / Product Allocation. Nature : fonctions aATP et leur articulation. Identifiant natif : SUP / PAL.
- Source officielle, édition, date (2026-09-15), localisateur et limites : [table des sources U225](optimisation-et-application-stock.md#sources-et-limites). Reformulation distincte dans la table des constats ; aucune définition native de capacité locale revendiquée.
- Rôle : examiner la direction U224 ; rapprochement proposé, pas validation de modèle ou de couverture installée.


### ELM127

- Référence : MKT19. Libellé natif : StockLocation / StockItemRequestReplenishment. Nature : illustrations du modèle d’information SID v22.0. Identifiant natif : SI.02-I01 / SI.04-I03.
- Source officielle, édition, date (2026-09-15), localisateur et limites : [table des sources U225](optimisation-et-application-stock.md#sources-et-limites). Reformulation distincte dans la table des constats ; aucune définition native de capacité locale revendiquée.
- Rôle : examiner la direction U224 ; rapprochement proposé, pas validation de modèle ou de couverture installée.


### ELM128

- Référence : MKT14 Microsoft Dynamics 365 SCM, documentation évolutive, version logicielle précise non indiquée.
- Libellé natif : Demand-driven planning, section Net flow and qualified demand. Identifiant natif de capacité : non indiqué. Nature : méthode et fonctions de planification du produit.
- Source : [Demand-driven planning](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/ddmrp-planning), texte indexé officiel lu le 2026-09-16. Reformulation : position nette tenant compte du stock, des apports engagés et de la demande qualifiée, utilisée pour déterminer l’apport planifié.
- Limites : pas de définition native de notre Replenishment Decision ni méthode rendue obligatoire. Synthèse et lien seulement. CMP075 et registre d05-refactoring.yaml.


### ELM129

- Référence : MKT19. Libellé natif : TMF633 Service Catalog Management. Nature : API de catalogue. Édition : v4.0.
- Passages consultés, reformulation, identifiant natif lorsqu’indiqué, URL officielles, localisateurs et limites : [étude U239](execution-services-catalog-and-management.md#sources-versions-et-limites-daccès). Consultation : 2026-09-16.
- Appui à la discussion D06/D07 ; aucune équivalence de capacité ou couverture SI déduite. Synthèse proposée par Codex, sans validation utilisateur.


### ELM130

- Référence : MKT19. Libellé natif : TMF645 Service Qualification Management. Nature : API de qualification avant commande. Édition : v5.0.
- Passages consultés, reformulation, identifiant natif lorsqu’indiqué, URL officielles, localisateurs et limites : [étude U239](execution-services-catalog-and-management.md#sources-versions-et-limites-daccès). Consultation : 2026-09-16.
- Appui à la discussion D06/D07 ; aucune équivalence de capacité ou couverture SI déduite. Synthèse proposée par Codex, sans validation utilisateur.


### ELM131

- Référence : MKT19. Libellé natif : TMF641 Service Ordering Management. Nature : API de commande de service et notifications. Édition : v4.2.
- Passages consultés, reformulation, identifiant natif lorsqu’indiqué, URL officielles, localisateurs et limites : [étude U239](execution-services-catalog-and-management.md#sources-versions-et-limites-daccès). Consultation : 2026-09-16.
- Appui à la discussion D06/D07 ; aucune équivalence de capacité ou couverture SI déduite. Synthèse proposée par Codex, sans validation utilisateur.


### ELM132

- Référence : MKT19. Libellé natif : TMFC007 Service Order Management. Nature : Composant ODA et fonctions de réalisation. Édition : v1.2.1, approuvé le 2 juillet 2024.
- Passages consultés, reformulation, identifiant natif lorsqu’indiqué, URL officielles, localisateurs et limites : [étude U239](execution-services-catalog-and-management.md#sources-versions-et-limites-daccès). Consultation : 2026-09-16.
- Appui à la discussion D06/D07 ; aucune équivalence de capacité ou couverture SI déduite. Synthèse proposée par Codex, sans validation utilisateur.


### ELM133

- Référence : MKT14. Libellé natif : Carrier Services ; Inbound/Outbound Shipment Orders. Nature : Configuration et documents/fonctions de Dynamics 365 SCM. Édition : documentation en ligne, édition produit non figée.
- Passages consultés, reformulation, identifiant natif lorsqu’indiqué, URL officielles, localisateurs et limites : [étude U239](execution-services-catalog-and-management.md#sources-versions-et-limites-daccès). Consultation : 2026-09-16.
- Appui à la discussion D06/D07 ; aucune équivalence de capacité ou couverture SI déduite. Synthèse proposée par Codex, sans validation utilisateur.


### ELM134

- Référence : MKT13. Libellé natif : Freight Order Statuses ; Freight Order Execution Detailed View. Nature : Statuts et suivi de produit SAP S/4HANA TM. Édition : 2025 FPS01 pour Last Mile ; édition inconnue pour le texte F2750.
- Passages consultés, reformulation, identifiant natif lorsqu’indiqué, URL officielles, localisateurs et limites : [étude U239](execution-services-catalog-and-management.md#sources-versions-et-limites-daccès). Consultation : 2026-09-16.
- Appui à la discussion D06/D07 ; aucune équivalence de capacité ou couverture SI déduite. Synthèse proposée par Codex, sans validation utilisateur.


### ELM135

- Référence : MKT19. Libellé natif : TMF623 SLA Management. Nature : API, appui historique seulement. Édition : R14.5.1.
- Passages consultés, reformulation, identifiant natif lorsqu’indiqué, URL officielles, localisateurs et limites : [étude U239](execution-services-catalog-and-management.md#sources-versions-et-limites-daccès). Consultation : 2026-09-16.
- Appui à la discussion D06/D07 ; aucune équivalence de capacité ou couverture SI déduite. Synthèse proposée par Codex, sans validation utilisateur.

### ELM136

- Référence : MKT14. Libellé natif : Calculate sales order delivery dates using CTP. Nature : fonctionnalité Dynamics 365 SCM ; identifiant natif distinct non établi. Édition : documentation en ligne, produit non figé.
- Passage consulté : introduction et options de contrôle des dates ; stock, capacité de production, temps de transport et marge de préparation. Reformulation, URL, adaptation et limites : [étude U241](execution-services-revised-comparison.md).
- Consultation : 2026-09-16. Page Microsoft Learn ouverte ; aucune preuve d'une API native de capacité de préparation. Synthèse Codex proposée, aucune équivalence ou couverture installée validée.

### ELM137

- Référence : MKT13. Libellé natif : Supply Creation-Based Confirmation (SBC) in PP/DS. Nature : processus d'intégration PP/DS et aATP ; identifiant natif distinct non établi. Édition : S/4HANA 2025 FPS01, février 2026.
- Passage consulté : Use, évaluation ressources/composants et transfert des dates vers aATP. Reformulation, URL, adaptation et limites : [étude U241](execution-services-revised-comparison.md).
- Consultation : 2026-09-16. Texte officiel indexé lu, ouverture directe sans corps exploitable ; pas de test produit ni de reprise implicite des créations d'approvisionnement SAP. Synthèse Codex proposée, aucune équivalence ou couverture installée validée.


## Audit de maturité U249 — consultation du 16 septembre 2026

Les éléments suivants consignent les passages consultés pour la v007, sans remplacer leurs états historiques. Les tableaux de sources liés donnent les URL officielles, sections, éditions, accès et limites. Les définitions ne sont pas importées intégralement ; les reformulations sont proposées par Codex. Aucun identifiant natif supplémentaire n’est inventé.

### ELM138

- Référence : MKT14. Libellé natif : Inventory Visibility Add-in. Nature : fonctionnalités de visibilité et actualisation de stock. Édition : documentation évolutive ; date affichée 2025-08-14.
- Passage consulté et localisateur : clés MS01, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/microsoft.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Vue globale, variations et dimensions de stock ; lecture multi-source, sans équivalence avec trois capacités FLOW distinctes.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM139

- Référence : MKT14. Libellé natif : Inventory allocation ; Inventory Visibility reservations. Nature : deux familles de fonctionnalités produit. Édition : documentation évolutive ; dates affichées 2025-08-13 et 2026-07-27.
- Passage consulté et localisateur : clés MS02/MS03, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/microsoft.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Allocation à des groupes et réservation pour une demande sont distinguées ; annulation et consommation de réservation documentées. Aucun optimum de quotas démontré.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM140

- Référence : MKT14. Libellé natif : Master plans. Nature : fonctionnalités de planification. Édition : documentation évolutive ; date affichée 2026-03-25.
- Passage consulté et localisateur : clés MS05, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/microsoft.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Scénarios et propositions de quantités/dates, avec affermissement distinct ; appui à la frontière décision/application, pas au découpage exact de D05.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM141

- Référence : MKT14. Libellé natif : Sales returns. Nature : processus et fonctionnalités de retours. Édition : documentation évolutive ; date affichée 2026-04-20.
- Passage consulté et localisateur : clés MS06, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/microsoft.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Motif, disposition, réception et remplacement ; périmètre produit plus large que D04.l, notamment pour les conséquences financières exclues de FLOW.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM142

- Référence : MKT14. Libellé natif : Warehouse management only mode with external ERP systems. Nature : guide d’intégration et documents métier. Édition : documentation évolutive ; date affichée 2026-05-22.
- Passage consulté et localisateur : clés MS07, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/microsoft.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Shipment Orders, retours d’exécution et rapprochement des représentations de stock ; appui aux frontières et à la cohérence, aucune installation C-Log prouvée.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM143

- Référence : MKT14. Libellé natif : Fulfillment and Returns Optimization provider. Nature : fonctions d’optimisation de réalisation. Édition : documentation évolutive ; date affichée 2026-01-28.
- Passage consulté et localisateur : clés MS10, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/microsoft.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Sources et contraintes d’un plan de fulfillment ; appui partiel à la solution Supply et au choix de service, pas équivalence à Inventory Optimization.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM144

- Référence : MKT13. Libellé natif : Integration into Other Processes — aATP. Nature : fonctions produit articulées. Édition : S/4HANA 2025 FPS01, février 2026.
- Passage consulté et localisateur : clés SAP01, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/sap-oracle.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : PAC/PAL/BOP/SUP/ARun/ABC : articulation de disponibilité, protection et allocation. Les identifiants natifs sont ceux des fonctions mentionnées, pas des capacités FLOW.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM145

- Référence : MKT13. Libellé natif : Backorder Processing. Nature : fonction produit. Édition : édition non établie dans le passage consulté.
- Passage consulté et localisateur : clés SAP02, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/sap-oracle.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Réexamen des confirmations après changements ; identifiant natif CA-ATP-BOP. Aucun processus local de validation imposé.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM146

- Référence : MKT24. Libellé natif : Inventory Optimization ; Supply Planning. Nature : fonctions et processus SAP IBP. Édition : SAP IBP 2605.
- Passage consulté et localisateur : clés SAP04/SAP05, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/sap-oracle.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Cibles sous incertitudes et transfert de résultats de planification vers l’exécution ; appui au domaine D05, sans reprendre toute la maille IBP.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM147

- Référence : MKT13. Libellé natif : Customer Returns Processing. Nature : processus produit. Édition : S/4HANA 2025 FPS01.
- Passage consulté et localisateur : clés SAP07, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/sap-oracle.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Ordre, inspection, suite logistique et compensation distingués ; la responsabilité de disposition dans FLOW reste à attribuer, contrôle physique et finance exclus.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM148

- Référence : MKT20. Libellé natif : Database Promising. Nature : fonctions de promesse. Édition : Oracle Fusion SCM 26B.
- Passage consulté et localisateur : clés OR02, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/sap-oracle.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Bill of Resources, Profitable to Promise et capacité fournisseur ; contraintes et effets économiques, sans preuve de disponibilité logistique générique.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM149

- Référence : MKT20. Libellé natif : PAR Policies. Nature : politiques et processus produit. Édition : Oracle Fusion SCM 26C.
- Passage consulté et localisateur : clés OR04, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/sap-oracle.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Politiques calculées/simulées puis publiées vers Inventory Management. Cas particulier PAR sans suivi des quantités ; ne pas généraliser aux magasins FLOW.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM150

- Référence : MKT20. Libellé natif : Inventory Rebalancing Options for Replenishment Plans. Nature : fonction de rééquilibrage. Édition : Oracle Fusion SCM 26B.
- Passage consulté et localisateur : clés OR05, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/sap-oracle.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Définition des excédents/manques et périmètres de rééquilibrage ; appui partiel à D05.c sans imposer une séquence avec Replenishment Decision.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM151

- Référence : MKT20. Libellé natif : Supply Chain Orchestration. Nature : module et processus. Édition : Oracle Fusion SCM 26C.
- Passage consulté et localisateur : clés OR06, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/sap-oracle.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Relie demandes, suggestions et documents ; gère changements et exceptions. Recouvrement plusieurs-à-plusieurs D03/D04/D06, pas équivalence du seul domaine D06.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM152

- Référence : MKT20. Libellé natif : Keep Global Order Promising and Inventory Management Synchronized. Nature : guide d’intégration. Édition : Oracle Fusion SCM 26A.
- Passage consulté et localisateur : clés OR07, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/sap-oracle.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Décalages possibles, réservations et données à collecter ; appui aux contrats d’information et à la fraîcheur, pas aux six ingestions comme capacités natives.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM153

- Référence : MKT20. Libellé natif : Hold Your Sales Orders. Nature : fonction de gestion de commande. Édition : Oracle Fusion SCM 26A.
- Passage consulté et localisateur : clés OR03, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/sap-oracle.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Blocages de portée ciblée et levée selon leur origine ; aucun cycle identique pour tous les types d’Orders FLOW.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM154

- Référence : MKT14. Libellé natif : Create purchase orders. Nature : fonction et documents de commande. Édition : documentation évolutive ; date affichée 2025-08-13.
- Passage consulté et localisateur : clés MS11, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/microsoft.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Origines et types des achats, lignes et actions ; pas d’audit exhaustif des ventes/transferts ni modèle de capacités natif.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM155

- Référence : MKT13. Libellé natif : Scenarios and Supported Features of PPAC and PAC with Supply Creation. Nature : comparaison de fonctions. Édition : S/4HANA 2025 FPS01.
- Passage consulté et localisateur : clés SAP03, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/sap-oracle.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Scénarios PPAC/PAC/SBC et limites d’intégration ; ressource de production et création de supply, sans équivalence à Capacity Visibility logistique.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM156

- Référence : MKT14. Libellé natif : Intelligent Order Management — Components. Nature : composants de produit. Édition : documentation évolutive ; date affichée 2026-01-30.
- Passage consulté et localisateur : clés MS09, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/microsoft.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : Orchestration, providers, optimisation et insights ; composition logicielle et coopération, pas catalogue homogène de capacités métier.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.

### ELM157

- Référence : MKT20. Libellé natif : Overview of Global Order Promising. Nature : application et fonctions. Édition : Oracle Fusion SCM 25C.
- Passage consulté et localisateur : clés OR01, tableau des sources et rapprochements de [l’annexe U249](../audits/2026-09-16-audit-maturite/sap-oracle.md). Consultation : 2026-09-16. Identifiant natif distinct non établi, sauf indication explicite ci-dessous.
- Reformulation séparée : ATP/CTP, alternatives, split, sourcing et coûts. Consultation 25C distincte de l’édition 26B d’ELM081 ; aucun comportement 26C extrapolé.
- Limites : fonctions/processus et non capacités natives équivalentes ; limites propres aux passages conservées dans l’annexe. Synthèse Codex proposée, sans validation d’équivalence ni couverture installée.


### ELM158

- Référence : MKT14. Libellé natif : Order promising — ATP / CTP. Nature : documentation de fonctions produit. Identifiant natif distinct non établi.
- Édition : Documentation Microsoft Dynamics 365 SCM, mise à jour affichée 2026-04-21. Consultation : 2026-09-16.
- Source et passages : S2, liens et localisateurs dans [étude U260](atp-aatp-couverture.md). Passage consulté, paraphrase séparée du texte natif.
- Reformulation : Appui sémantique pour ATP comme quantité et capacité ; ressources futures incluses selon le périmètre.
- Limites : ni équivalence globale, ni capacité native FLOW, ni preuve de couverture installée. Restrictions par édition non auditées exhaustivement.


### ELM159

- Référence : MKT13. Libellé natif : Advanced Available-to-Promise (aATP). Nature : documentation de fonctions produit. Identifiant natif distinct non établi.
- Édition : SAP Learning S/4HANA, cours évolutif sans édition unique affichée. Consultation : 2026-09-16.
- Source et passages : S3, liens et localisateurs dans [étude U260](atp-aatp-couverture.md). Passage consulté, paraphrase séparée du texte natif.
- Reformulation : Ensemble fonctionnel plus large que D03.i ; PAC, consultation du résultat et Release for Delivery.
- Limites : ni équivalence globale, ni capacité native FLOW, ni preuve de couverture installée. Restrictions par édition non auditées exhaustivement.


### ELM160

- Référence : MKT13. Libellé natif : PAL / BOP / ABC / ARun. Nature : documentation de fonctions produit. Identifiant natif distinct non établi.
- Édition : SAP Learning S/4HANA, cours évolutif sans édition unique affichée. Consultation : 2026-09-16.
- Source et passages : S4, liens et localisateurs dans [étude U260](atp-aatp-couverture.md). Passage consulté, paraphrase séparée du texte natif.
- Reformulation : Fonctions de protection, alternatives, réexamen et affectation ; correspondances plusieurs-à-plusieurs.
- Limites : ni équivalence globale, ni capacité native FLOW, ni preuve de couverture installée. Restrictions par édition non auditées exhaustivement.


### ELM161

- Référence : MKT13. Libellé natif : Supply Protection (SUP). Nature : documentation de fonctions produit. Identifiant natif distinct non établi.
- Édition : SAP Learning S/4HANA, cours évolutif sans édition unique affichée. Consultation : 2026-09-16.
- Source et passages : S5, liens et localisateurs dans [étude U260](atp-aatp-couverture.md). Passage consulté, paraphrase séparée du texte natif.
- Reformulation : Protection de groupes et priorités, distincte de l’affectation à une demande identifiée.
- Limites : ni équivalence globale, ni capacité native FLOW, ni preuve de couverture installée. Restrictions par édition non auditées exhaustivement.


### ELM162

- Référence : MKT13. Libellé natif : Supply Creation-Based Confirmation (SBC). Nature : documentation de fonctions produit. Identifiant natif distinct non établi.
- Édition : SAP Learning S/4HANA, cours évolutif mentionnant 2022. Consultation : 2026-09-16.
- Source et passages : S6, liens et localisateurs dans [étude U260](atp-aatp-couverture.md). Passage consulté, paraphrase séparée du texte natif.
- Reformulation : Intégration aATP–PP/DS ; appui partiel à la frontière ATP/CTP locale.
- Limites : ni équivalence globale, ni capacité native FLOW, ni preuve de couverture installée. Restrictions par édition non auditées exhaustivement.


### ELM163

- Référence : MKT25. Libellé natif : Business capability levels. Nature : documentation de pratique ou de fonction produit ; identifiant natif distinct non établi.
- Édition : documentation évolutive sans version unique affichée. Consultation : 2026-09-17.
- Source et passages consultés : S2 dans [étude U261](capacites-variantes-niveaux-atp.md), URL et localisateurs explicites.
- Reformulation : Profondeur limitée recommandée ; les enfants restent des capacités.
- Limites : appui ciblé, pas équivalence de capacité ni adoption d’un découpage FLOW.


### ELM164

- Référence : MKT26. Libellé natif : Atomic and Instance Capabilities / Shared Capabilities. Nature : documentation de pratique ou de fonction produit ; identifiant natif distinct non établi.
- Édition : documentation évolutive sans version unique affichée. Consultation : 2026-09-17.
- Source et passages consultés : S3 dans [étude U261](capacites-variantes-niveaux-atp.md), URL et localisateurs explicites.
- Reformulation : Capacité abstraite et réalisations contextualisées ; maturité évaluée séparément.
- Limites : appui ciblé, pas équivalence de capacité ni adoption d’un découpage FLOW.


### ELM165

- Référence : MKT14. Libellé natif : Inventory Visibility on-hand change schedules and ATP. Nature : documentation de pratique ou de fonction produit ; identifiant natif distinct non établi.
- Édition : documentation évolutive sans version unique affichée. Consultation : 2026-09-17.
- Source et passages consultés : S4 dans [étude U261](capacites-variantes-niveaux-atp.md), URL et localisateurs explicites.
- Reformulation : Calcul configuré, dimensions et ressources temporelles ; distinction du métamodèle de capacités.
- Limites : appui ciblé, pas équivalence de capacité ni adoption d’un découpage FLOW.


### ELM166

- Référence : MKT14. Libellé natif ou famille : Business Process Catalog, six niveaux.
- Source : S1 dans [étude U265](../audits/2026-09-17-audit-comportements/marche.md), liens et sections explicites.
- Édition : Documentation évolutive ; page datée du 8 janvier 2026. Consultation : 2026-09-17.
- Nature / limite : Métamodèle de contenus/processus, pas six niveaux de capacités. Identifiant de capacité native non établi sauf repères documentaires indiqués ; aucun rang FLOW déduit.
- Usage : CMP089, correspondance proposée par Codex.


### ELM167

- Référence : MKT04. Libellé natif ou famille : Reference Architecture Content.
- Source : S2 dans [étude U265](../audits/2026-09-17-audit-comportements/marche.md), liens et sections explicites.
- Édition : Cours public, édition non précisée. Consultation : 2026-09-17.
- Nature / limite : Hiérarchie métier et liens de réalisation distingués. Identifiant de capacité native non établi sauf repères documentaires indiqués ; aucun rang FLOW déduit.
- Usage : CMP089, correspondance proposée par Codex.


### ELM168

- Référence : MKT14. Libellé natif ou famille : Allocation, plans, firming, holds, batch transfer release, returns.
- Source : S6–S8/S11–S13 dans [étude U265](../audits/2026-09-17-audit-comportements/marche.md), liens et sections explicites.
- Édition : Dynamics 365 Supply Chain Management, documentation évolutive. Consultation : 2026-09-17.
- Nature / limite : Fonctionnalités de produit utilisées pour éprouver les comportements ; pas de couverture complète. Identifiant de capacité native non établi sauf repères documentaires indiqués ; aucun rang FLOW déduit.
- Usage : CMP089, correspondance proposée par Codex.


### ELM169

- Référence : MKT24. Libellé natif ou famille : Versions and Scenarios.
- Source : S9 dans [étude U265](../audits/2026-09-17-audit-comportements/marche.md), liens et sections explicites.
- Édition : Cours public SAP IBP order-based planning, édition non précisée. Consultation : 2026-09-17.
- Nature / limite : Simulation et scénarios comme appui à Inventory Planning. Identifiant de capacité native non établi sauf repères documentaires indiqués ; aucun rang FLOW déduit.
- Usage : CMP089, correspondance proposée par Codex.


### ELM170

- Référence : MKT13. Libellé natif ou famille : aATP PAC/PAL/BOP/ABC.
- Source : S10 dans [étude U265](../audits/2026-09-17-audit-comportements/marche.md), liens et sections explicites.
- Édition : Cours public SAP S/4HANA, édition non précisée. Consultation : 2026-09-17.
- Nature / limite : Fonctions de produit réparties entre plusieurs capacités FLOW. Identifiant de capacité native non établi sauf repères documentaires indiqués ; aucun rang FLOW déduit.
- Usage : CMP089, correspondance proposée par Codex.


### ELM171

- Référence : MKT20. Libellé natif ou famille : Supply Chain Orchestration et change management.
- Source : S14/S15 dans [étude U265](../audits/2026-09-17-audit-comportements/marche.md), liens et sections explicites.
- Édition : Oracle Cloud SCM 26A et Order Management 25C consultés. Consultation : 2026-09-17.
- Nature / limite : Appui à orchestration/adaptation ; périmètre produit plus large que D06. Identifiant de capacité native non établi sauf repères documentaires indiqués ; aucun rang FLOW déduit.
- Usage : CMP089, correspondance proposée par Codex.


### ELM172

- Référence : MKT19. Libellé natif ou famille : TMFC007 Service Order Management ; TMF633.
- Source : S4/S16 dans [étude U265](../audits/2026-09-17-audit-comportements/marche.md), liens et sections explicites.
- Édition : TMFC007 v1.2.1 / TMF633 v4.0. Consultation : 2026-09-17.
- Nature / limite : Composant et API distincts de capacités ; contexte télécom. Identifiant de capacité native non établi sauf repères documentaires indiqués ; aucun rang FLOW déduit.
- Usage : CMP089, correspondance proposée par Codex.


### ELM173

- Référence : MKT24, SAP IBP. Libellé natif : Creating and Comparing Versions and Scenarios.
- Nature : fonctions produit ; cours public sans édition précise affichée, consulté le 17 septembre 2026.
- Source et passages : S1 de la comparaison U267/U268, audits/2026-09-17-audit-comportements/scenario-planning-proposition.md ; Simulation and Scenario Concept / Version Planning and Simulation.
- Appui : création, simulation, comparaison et promotion de données de scénario. Promotion de données et réalisation opérationnelle restent distinguées. Correspondance proposée CMP090.

### ELM174

- Référence : MKT20, Oracle Supply Chain Planning. Libellés natifs : Actions to Manage Your Plans ; How You Compare Supply Plans and Orders.
- Nature : fonctions produit ; éditions 25D et 26B respectivement, consultées le 17 septembre 2026.
- Sources et passages : S4/S5 de la comparaison U267/U268, audits/2026-09-17-audit-comportements/scenario-planning-proposition.md ; Plan Comparison / Order Comparison et tableau des actions.
- Appui : comparaison, approbation et transmission aux systèmes exécutants. Disponibilité des actions selon le type de plan ; aucune hiérarchie de comportements ni workflow universel FLOW adopté. CMP090 proposé.


### ELM175

- Référence : MKT24, SAP IBP. Éléments : Simulations ; Inventory Analysis / Scenario Scorecard ; Service Level Prediction.
- Nature : fonctionnalités produit, pas catalogue normatif de comportements. Consultation : 2026-09-17 ; Simulations annonce IBP 2605, éditions des cours non précisées.
- Sources, sections et accès : S1–S4 dans audits/2026-09-17-planning-comportements/impact-analysis.md. S1/S2/S3 lus via texte indexé, ouvertures directes sans contenu ou en erreur ; S4 ouvert et lu directement.
- Appui : indicateurs dépendants recalculés, comparaison par KPI, impact estimé d’un ajustement du plan sur le niveau de service. Ne prouve pas un comportement métier autonome SAP nommé Scenario Impact Analysis ni une explication causale exhaustive.
- Correspondance : CMP091 proposée ; aucune réalisation Beaumanoir déduite.


### ELM176

- Référence : MKT14, Microsoft Dynamics 365 Supply Chain Management / Inventory Visibility.
- Libellé natif : Inventory Visibility inventory allocation ; fonctionnalités produit et API.
- Source primaire : https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-allocation ; page évolutive, édition non précisée, mise à jour affichée 2025-08-13, consultée le 2026-09-17.
- Passages lus : Business background and purpose ; Allocation definition ; Tips for using allocation ; Use the allocation APIs (Allocate, Unallocate, Reallocate, Consume, Consume as a soft reservation, Query).
- Reformulation : enveloppes par groupes, transfert et restitution de quantités, imputation de consommation et consultation du solde. Allocation logique ; couplage possible avec une réservation, sans identité des deux notions.
- Limites : la source décrit un produit et ses interfaces, pas une hiérarchie de capacités. Elle ne suffit pas à couvrir la prévention du surstock ou les périodes de validité FLOW. Pas de copie des contraintes techniques Microsoft dans le contrat métier.
- Rapprochement proposé : CMP092 ; aucun déploiement Beaumanoir déduit.


### ELM177

- Référence : MKT14. Libellés natifs : Replenishment methods and quantity modification ; Safety stock fulfillment for items ; Use the safety stock journal to update minimum coverage for items.
- Nature : documentation produit ; fonctions ou présentations produit, pas capacités FLOW.
- Éditions, URL primaires, passages et limites d’accès : S02 / S03 / S04 dans modeles/backlog/supply-protection-review.yaml. Consultation 2026-09-17.
- Reformulation et rapprochement : matrice de mécanismes dans marche/supply-protection-comportements.md ; CMP093 proposé.
- Limite : l’étendue fonctionnelle documentée ne prouve pas une décomposition normative ni une réalisation installée. Les règles de synthèse FLOW restent proposées.


### ELM178

- Référence : MKT13. Libellés natifs : Outlining aATP with Supply Protection (SuP) ; Executing Demand-Driven Replenishment in SAP S/4HANA.
- Nature : formation produit ; fonctions ou présentations produit, pas capacités FLOW.
- Éditions, URL primaires, passages et limites d’accès : S05 / S06 dans modeles/backlog/supply-protection-review.yaml. Consultation 2026-09-17.
- Reformulation et rapprochement : matrice de mécanismes dans marche/supply-protection-comportements.md ; CMP093 proposé.
- Limite : l’étendue fonctionnelle documentée ne prouve pas une décomposition normative ni une réalisation installée. Les règles de synthèse FLOW restent proposées.


### ELM179

- Référence : MKT20. Libellés natifs : Policy Assignment Sets.
- Nature : documentation produit ; fonctions ou présentations produit, pas capacités FLOW.
- Éditions, URL primaires, passages et limites d’accès : S07 dans modeles/backlog/supply-protection-review.yaml. Consultation 2026-09-17.
- Reformulation et rapprochement : matrice de mécanismes dans marche/supply-protection-comportements.md ; CMP093 proposé.
- Limite : l’étendue fonctionnelle documentée ne prouve pas une décomposition normative ni une réalisation installée. Les règles de synthèse FLOW restent proposées.


### ELM180

- Référence : MKT32. Libellés natifs : Activating Items on Replenishment ; Manage Scheduled Updates.
- Nature : documentation produit ; fonctions ou présentations produit, pas capacités FLOW.
- Éditions, URL primaires, passages et limites d’accès : S08 / S09 dans modeles/backlog/supply-protection-review.yaml. Consultation 2026-09-17.
- Reformulation et rapprochement : matrice de mécanismes dans marche/supply-protection-comportements.md ; CMP093 proposé.
- Limite : l’étendue fonctionnelle documentée ne prouve pas une décomposition normative ni une réalisation installée. Les règles de synthèse FLOW restent proposées.


### ELM181

- Référence : MKT27. Libellés natifs : Inventory Optimization.
- Nature : présentation produit ; fonctions ou présentations produit, pas capacités FLOW.
- Éditions, URL primaires, passages et limites d’accès : S12 dans modeles/backlog/supply-protection-review.yaml. Consultation 2026-09-17.
- Reformulation et rapprochement : matrice de mécanismes dans marche/supply-protection-comportements.md ; CMP093 proposé.
- Limite : l’étendue fonctionnelle documentée ne prouve pas une décomposition normative ni une réalisation installée. Les règles de synthèse FLOW restent proposées.


### ELM182

- Référence : MKT28. Libellés natifs : What is Inventory Optimization.
- Nature : article éditeur ; fonctions ou présentations produit, pas capacités FLOW.
- Éditions, URL primaires, passages et limites d’accès : S13 dans modeles/backlog/supply-protection-review.yaml. Consultation 2026-09-17.
- Reformulation et rapprochement : matrice de mécanismes dans marche/supply-protection-comportements.md ; CMP093 proposé.
- Limite : l’étendue fonctionnelle documentée ne prouve pas une décomposition normative ni une réalisation installée. Les règles de synthèse FLOW restent proposées.


### ELM183

- Référence : MKT29. Libellés natifs : Replenishment and allocation ; Inventory Planning Software.
- Nature : présentation produit ; fonctions ou présentations produit, pas capacités FLOW.
- Éditions, URL primaires, passages et limites d’accès : S10 / S11 dans modeles/backlog/supply-protection-review.yaml. Consultation 2026-09-17.
- Reformulation et rapprochement : matrice de mécanismes dans marche/supply-protection-comportements.md ; CMP093 proposé.
- Limite : l’étendue fonctionnelle documentée ne prouve pas une décomposition normative ni une réalisation installée. Les règles de synthèse FLOW restent proposées.


### ELM184

- Référence : MKT30. Libellés natifs : Inventory Management Software — Slim4.
- Nature : présentation produit ; fonctions ou présentations produit, pas capacités FLOW.
- Éditions, URL primaires, passages et limites d’accès : S14 dans modeles/backlog/supply-protection-review.yaml. Consultation 2026-09-17.
- Reformulation et rapprochement : matrice de mécanismes dans marche/supply-protection-comportements.md ; CMP093 proposé.
- Limite : l’étendue fonctionnelle documentée ne prouve pas une décomposition normative ni une réalisation installée. Les règles de synthèse FLOW restent proposées.


### ELM185

- Référence : MKT31. Libellés natifs : Allocation & Replenishment.
- Nature : présentation produit ; fonctions ou présentations produit, pas capacités FLOW.
- Éditions, URL primaires, passages et limites d’accès : S15 dans modeles/backlog/supply-protection-review.yaml. Consultation 2026-09-17.
- Reformulation et rapprochement : matrice de mécanismes dans marche/supply-protection-comportements.md ; CMP093 proposé.
- Limite : l’étendue fonctionnelle documentée ne prouve pas une décomposition normative ni une réalisation installée. Les règles de synthèse FLOW restent proposées.


### ELM186

- Référence : MKT23. Libellés natifs : Safety stock rules ; Inventory monitor.
- Nature : documentation produit ; fonctions ou présentations produit, pas capacités FLOW.
- Éditions, URL primaires, passages et limites d’accès : S16 / S17 dans modeles/backlog/supply-protection-review.yaml. Consultation 2026-09-17.
- Reformulation et rapprochement : matrice de mécanismes dans marche/supply-protection-comportements.md ; CMP093 proposé.
- Limite : l’étendue fonctionnelle documentée ne prouve pas une décomposition normative ni une réalisation installée. Les règles de synthèse FLOW restent proposées.


### ELM187

- Référence : MKT28, Kinaxis. Libellé natif : What is concurrent planning? Nature : présentation de méthode et de produit, pas norme de décomposition.
- Source : https://www.kinaxis.com/en/what-concurrent-planning ; sections How does concurrent planning work?, Improving agility, Planning proactively, Eliminating functional silos. Page évolutive sans édition logicielle ; texte consulté le 17 septembre 2026.
- Reformulation : les alternatives simulées aident les équipes à anticiper ; les changements et leurs impacts partagés permettent d’adapter les plans et de coordonner les acteurs.
- Limites : appui aux effets sur les pratiques et processus ; aucun catalogue normatif Capacité/Comportement, aucun déploiement Beaumanoir démontré. Synthèse sans import substantiel ; droits de republication non établis.


Complément U284 à ELM187 — 17 septembre 2026 : page officielle Kinaxis S&OP, section Advanced scenarios, https://www.kinaxis.com/en/solutions/sales-and-operations-planning, texte indexé consulté. Les simulations what-if sont présentées avec l’examen des options et de leurs impacts. Présentation produit évolutive sans édition ; appui fonctionnel, pas norme de découpage ni preuve de déploiement. Aucune importation substantielle.


### ELM188

- Ensemble documentaire U286 : sources S01–S12 distinguées dans modeles/backlog/refactoring-target.yaml ; Microsoft MKT14, SAP MKT13, Oracle MKT20, Kinaxis MKT28, RELEX MKT29.
- Éléments natifs : politiques d’allocation/réassort, comptages, recommandations, réservation, BOP, compensation et scénarios. Nature : fonctions, politiques ou processus de produits ; pas automatiquement des capacités.
- URL, édition, passage, synthèse et limite sont conservés source par source dans l’annexe ; consultation 17 septembre 2026. S10 extrait officiel indexé ; autres pages ouvertes ou passages indexés détaillés. Oracle 25C historique explicite.
- Appui à la différenciation des mécanismes et effets ; pas de preuve de déploiement Beaumanoir. Synthèses sélectives sans import substantiel ni droit de republication intégrale présumé.


Complément U287 à ELM188 — 17 septembre 2026 : S13 Microsoft Firm planned orders et S14 Oracle Release Plan 26B ajoutés à la cible structurée. URL, passages, natures, synthèses et limites dans l’annexe. Textes primaires indexés consultés. Appui à la matérialisation de décisions de planification en Orders ; aucun comportement, atomicité ni parent FLOW imposé par les produits.


### ELM189

- Objet : vocabulaire Assignment/Allocation, U289. Sources T1–T4 dans modeles/backlog/assignment-terminology.yaml : SAP Supply Assignment et PAL (MKT13), Microsoft Inventory Visibility allocation (MKT14), Oracle Retail Allocation.
- Libellés, URL, éditions, passages, synthèses et limites sont distingués dans l’annexe. Oracle Retail Allocation est ici un produit documenté, pas le modèle Oracle Retail RBA ni Merchandising. Consultation 17 septembre 2026.
- Nature : concepts et fonctions produits ; aucun terme universel de marché revendiqué. Supply Assignment est le rapprochement le plus précis du sens donné par Laurent.
- Réutilisation : liens et synthèses sélectives ; pas d’import de catalogue ou de preuve de déploiement.


### ELM190

- Objet : objectifs d’optimisation de fulfillment, précision U290.
- Source primaire : [Microsoft Intelligent Fulfillment Optimization architecture](https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/ifo-arch), documentation évolutive sans version produit figée ; introduction et Fulfillment sources, consultées le 17 septembre 2026.
- Nature : description fonctionnelle d’un service produit. Microsoft décrit la satisfaction des commandes selon des contraintes et objectifs métier, notamment la minimisation des coûts et la proximité des sources.
- Limite : n’impose pas un modèle universel de valeur multidimensionnelle, ses pondérations, ni les frontières entre capacités FLOW ; aucune preuve d’installation Beaumanoir.


### ELM191

- Ensemble documentaire U292 : 28 éléments sources S01–S28 distingués dans modeles/backlog/behavior-gap-audit.yaml ; [registre lisible](../audits/2026-09-17-comportements-manquants/sources.md).
- Références : Microsoft MKT14, SAP S/4HANA MKT13, Oracle SCM MKT20, Blue Yonder MKT27, Kinaxis MKT28, RELEX MKT29, Manhattan MKT34, SAP Event Management historique MKT35.
- Natures : politiques et fonctions documentées, processus produit, présentations commerciales. Chaque source conserve libellé natif, édition ou inconnue, URL, passage, fait observé, limite, date et accès. Identifiants natifs non disponibles : non inventés.
- Contenu : réassort, ajustement d’apports, redistribution, engagements et révision, coordination et compensation, fiabilisation, retours et achats fournisseurs. Aucun de ces éléments n’est automatiquement une capacité ou un comportement FLOW.
- Consultation : 17 septembre 2026. S19 extrait indexé limité ; guides et cours lus pour les autres sources documentaires ; S13–S16 pages produit sans garanties fonctionnelles détaillées. Réutilisation : synthèses sélectives et liens, pas d’importation substantielle ni de preuve installée.


### ELM192

- Éléments S29–S33 de modeles/backlog/behavior-gap-audit.yaml : SAP Global Track and Trace MKT37, Microsoft Landed Cost et états des achats MKT14, Camunda compensation/workflow patterns MKT36.
- Consultation : 17 septembre 2026 ; faits, URL, passages, éditions et limites source par source dans l’annexe. SAP : présentation produit ; Microsoft et Camunda : guides documentaires.
- Nature : visibilité logistique, règles de cycle de vie et mécanismes de processus ; aucune décomposition de capacités native ni adoption de moteur. CMP099 proposé.


### ELM193

- Sources S34–S36 de behavior-gap-audit.yaml : Oracle OTM MKT40, project44 MKT38, FourKites MKT39 ; relecture SAP MKT37/S29.
- Éléments : Track and Trace, Order/Shipment Visibility, Transportation Visibility ; noms de produit, de fonctions ou de catégories distingués.
- Consultation : 17 septembre 2026 ; éditions, passages, URL et accès dans l’annexe. Appuis lexicaux et périmètres ; pas de terme universel ni d’équivalence de produit complète établis. CMP100 proposé.


### ELM194

- Sources S37–S40 dans behavior-gap-audit.yaml : CSCMP MKT41, intégration SAP GTT MKT37, Manhattan MKT34, Oracle SCM MKT20 ; S29 SAP relu comme appui lexical.
- Éléments : périmètre de Logistics Management, événements Picking/Packing/Load_Begin de GTT, usages Fulfillment Visibility en magasin/entrepôt et pour apports à une commande.
- Consultation : 17 septembre 2026. S38 extrait officiel indexé, ouverture sans corps ; autres textes primaires consultés. Éditions et limites distinguées dans l’annexe ; pas de garantie universelle de couverture.
- Nature : définition professionnelle, événements d’intégration et usages produit ; rapprochement proposé CMP102.


### ELM195

- Source S41, GS1 MKT42 : EPCIS & CBV, introduction à la visibilité fondée sur les faits d’objets, lieux, dates, contexte et prise en charge.
- URL/édition/accès : https://www.gs1.org/standards/epcis ; présentation officielle, texte indexé consulté le 17 septembre 2026, sans adoption d’édition normative.
- Nature : standard de partage d’événements présenté par son organisme ; appui au mécanisme de continuité proposé pour Logistics Visibility, pas preuve de sa place dans la hiérarchie FLOW. CMP103 proposé.


### ELM196

- Sources S42–S45 de behavior-gap-audit.yaml : Microsoft Dataverse (distinct de Dynamics Supply Chain), Camunda 8.9, SAP EWM, Oracle Warehouse Management. Consultation : 17 septembre 2026.
- URL, éditions, passages, faits et limites conservés individuellement dans l’annexe. Documentation produit et présentation commerciale distinguées ; aucun identifiant natif de capacité inventé.
- Appuis : audit numérique des données/processus ; distinction des opérations sur site et des acheminements. Aucun produit ne démontre ici un audit universel du SI ni une hiérarchie native équivalente à FLOW.


Complément U304 à ELM196 : S46 Blue Yonder Store Execution (MKT27), S47 RELEX direct-to-shelf replenishment (MKT29). Présentations officielles consultées le 17 septembre 2026 ; sources, passages et limites dans l’annexe. Aucun nouveau nom normalisé de comportement prétendu.


### ELM197

- Sources S48–S50 de behavior-gap-audit.yaml : Microsoft Azure Logic Apps / Business Process Tracking (distinct de Dynamics 365 Supply Chain), Camunda Process Observability MKT36. Consultation : 17 septembre 2026.
- Nature : suivi d’exécutions, corrélation métier et observabilité de processus ; fonctionnalités et présentation produit. URL, édition ou absence d’édition, passages, synthèses et limites dans l’annexe.
- Appui à la visibilité des prestations numériques U306 ; aucun libellé normalisé de comportement ni déploiement Beaumanoir démontré.


### ELM198

- Sources S51/S52 de behavior-gap-audit.yaml : SAP Allocation Management (référence SAP MKT13, produit explicitement distinct), RELEX MKT29. Consultation 18 septembre 2026.
- Libellés natifs : Initial Allocation, In-Season Fill-In, initial allocation, in-season replenishment. URL, versions, passages, nature et limites dans l’annexe. SAP consulté par texte indexé, ouverture sans corps ; RELEX page produit consultée.
- Scénarios produit et fonctions, pas capacités FLOW automatiquement équivalentes. Aucun déploiement Beaumanoir déduit.


### ELM199

- Oracle Retail Inventory Planning Optimization Cloud Service, Lifecycle Allocation and Replenishment, documentation 26.1.201.0. Consultation du texte primaire indexé le 18 septembre 2026.
- Source : https://docs.oracle.com/en/industries/retail/retail-inventory-planning-optimization-cloud/26.1.201.0/ipodl/ch-Introduction.htm
- Passage : Introduction, Lifecycle Overview. Libellés natifs : Initial Allocation (Product Introduction), Replenishment (Product Growth and Maturity), Final Allocation (Product End of Life/Decline).
- Nature : phases et processus pris en charge par un produit. Appui sémantique à la distinction implantation/réassort ; aucun identifiant natif de capacité ni équivalence hiérarchique déduit. Synthèse sélective, pas de reproduction substantielle.
- Complément ELM198 : SAP Allocation Management 5.0, Business Scenarios, texte primaire indexé reconsulté : https://help.sap.com/docs/CARAB/410a12785a4945dca77e6afba0970c93/5ad109a630034a4b9b079abbe00be418.html?locale=en-US&state=PRODUCTION&version=5.0 ; Initial Allocation distinct d’In-Season Fill-In. RELEX page produit évolutive reconsultée : https://www.relexsolutions.com/solutions/automatic-replenishment-system/ ; sections Manage the full cycle for your seasonal items / Manage seasons effectively : initial allocation distinct d’automatic in-season replenishment dans une offre commune. Aucune preuve de déploiement Beaumanoir.


### ELM200

- Objet : alternatives anglaises à Implantation, recherche du 18 septembre 2026. Aucun identifiant natif de capacité attribué.

- OASIS — Universal Business Language Version 2.4 (2.4).
  Source : https://docs.oasis-open.org/ubl/UBL-2.4.html
  Passage : 2.3.3.5.3.3 Initial Stocking of the Area by Retailer ; 2.3.3.5.3.4 Periodic (Weekly) Replenishment.
  Nature : Processus métier documenté dans un standard d’échanges. Constat : Constitution d’un stock de départ au début d’une relation commerciale ou d’une saison ; le processus Initial Stocking est distingué du réassort périodique.
  Limites : Texte primaire consulté. Attestation du terme Initial Stocking dans un contexte saisonnier ; pas une normalisation du nom Initial Stocking Decision ni un consensus des logiciels de mode.

- Logility — Retail Optimization Gives Groupe Dynamite an Edge (Page de présentation sans édition figée ni date affichée).
  Source : https://www.logility.com/webcast/retail-optimization-gives-groupe-dynamite-an-edge/
  Passage : Présentation textuelle du webcast, initial distribution as well as replenishment.
  Nature : Terme descriptif employé dans une présentation client. Constat : Distribution initiale distinguée du réassort dans un contexte de mode, de magasins et de déclinaisons style/couleur/taille.
  Limites : Texte primaire de présentation consulté ; vidéo non visionnée. Usage descriptif attesté, pas nom de module ou taxonomie standard démontré.

- Nextail — Nextail — Solution specifications (Documentation en ligne non versionnée).
  Source : https://help.nextail.co/en/solution-specifications
  Passage : First Allocation ; Replenishment ; Store Transfers.
  Nature : Nom d’une solution et formulation descriptive de sa finalité. Constat : La solution First Allocation vise la distribution initiale de nouveaux produits aux magasins ; Replenishment et Store Transfers sont présentés séparément.
  Limites : Documentation primaire consultée. Confirme le sens d’initial distribution mais pas son adoption comme libellé officiel de capacité.

- Synthèses sélectives et liens vers les sources ; pas de reproduction substantielle. Aucun déploiement Beaumanoir déduit.


### ELM201

Recherche U317, consultation le 18 septembre 2026. Sources primaires, synthèses sélectives ; aucun identifiant natif de capacité inventé.

- Oracle — Overview of Inventory Rebalancing (Fusion Cloud SCM 26B).
  URL : https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faurp/overview-of-inventory-rebalancing.html
  Passage : Salient Features ; Additional Points About Inventory Rebalancing.
  Nature : Fonctionnalité de planification. Constat : Transferts de lieux en excédent vers des lieux en manque et possibilité de diriger des excédents vers un lieu de collecte. Le calcul tient compte des demandes, apports et protections du donneur.
  Limites : Documentation primaire consultée ; ne démontre ni un optimum universel, ni la décomposition FLOW, ni un déploiement Beaumanoir.

- Nextail — Merkal implements AI to centralize and streamline inventory planning across all channels (Page de cas client évolutive sans édition figée).
  URL : https://nextail.co/customer/merkal-footwear-inventory-planning/
  Passage : Sharper store transfers and deeper insights for additional revenue ; témoignage Alberto Garcia sur size availability / consolidation.
  Nature : Usage produit et témoignage client publié par l’éditeur. Constat : Rééquilibrage de fin de saison entre magasins et amélioration de la disponibilité des tailles par consolidation. La valeur recherchée dépasse le simple comblement d’un manque global en unités.
  Limites : Texte primaire de la page consulté ; étude téléchargeable non consultée. Aucune métrique commerciale reprise ni applicabilité Beaumanoir présumée.

- SAP — Stock Consolidation (EWM 2025 FPS01 — février 2026).
  URL : https://help.sap.com/docs/PRODUCT_ID/9832125c23154a179bfa1784cdc9577a/d0b4ebf54dda4179b68e334607e7fb5b.html
  Passage : Définition de Stock Consolidation et deux stratégies.
  Nature : Opération interne d’entrepôt. Constat : Le terme consolidation désigne un regroupement de stock avec un bénéfice de quantité ou d’espace.
  Limites : Texte primaire indexé consulté ; ouverture directe sans corps exploitable. Contre-exemple de périmètre, pas preuve de couverture de redistribution intersites.


### ELM202

- Microsoft D365 SCM ; relecture ciblée des sources S08/S09 le 18 septembre 2026. Aucun nouvel identifiant natif de capacité.

- Replenishment methods and quantity modification (Documentation D365 SCM, mise à jour affichée 2026-07-01).
  https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/replenishment-methods-quantity-modification
  Passage : Coverage codes ; Impact of the order quantity from default order settings.
  Constat : Requirement traite les besoins identifiés, Period les regroupe sur une fenêtre, Min./Max. restaure un niveau cible lorsque le stock prévisionnel passe sous un seuil. Ces règles éclairent deux façons de décider les apports, par besoins datés ou par seuil/cible.
  Limites : Texte primaire consulté le 18 septembre 2026. Pas de preuve de politique Requirement installée chez Beaumanoir ; ni correspondance univoque entre méthode logicielle et comportement métier.

- Action messages (Documentation D365 SCM, mise à jour affichée 2026-03-26).
  https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/action-messages
  Passage : Introduction ; Select action messages ; Action messages for orders related to safety stock.
  Constat : La planification recommande de modifier dates et quantités d’apports existants après évolution des besoins, pour limiter manques et excédents.
  Limites : Texte primaire consulté. Les règles Microsoft de période de gel et de stock de sécurité ne sont pas adoptées pour FLOW ; aucun engagement ferme déclaré librement modifiable.


### ELM203

- Clarification U324, sources primaires consultées le 18 septembre 2026 ; synthèses sélectives.

- Microsoft — Safety stock fulfillment for items (Documentation D365 SCM, mise à jour affichée 2026-03-26).
  https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/safety-stock-replenishment
  Passage : Example: Minimum key ; Example: Min/max coverage code.
  Constat : Les niveaux minimum et maximum peuvent être différenciés selon les périodes saisonnières. La logique Min/Max réagit au stock disponible projeté ; une configuration n’est donc pas nécessairement fixe ni indépendante de la demande.
  Limites : Texte primaire consulté le 18 septembre 2026. Variation saisonnière documentée ; pas preuve d’une réoptimisation automatique à chaque événement ni d’une configuration Beaumanoir installée.

- Oracle — Policy Assignment Sets (Fusion Cloud SCM 26B).
  https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faurp/policy-assignment-sets.html
  Passage : Policy Parameters, table Policy Type / Method for Calculation of Quantities / How the Policy Type Is Used, Min-max planning.
  Constat : Le minimum est calculé à partir de la demande pendant le délai et du stock de sécurité. La politique utilise ensuite une position de stock pour déterminer le déclenchement et la quantité de réapprovisionnement.
  Limites : Documentation primaire consultée. Appui à la dépendance des seuils aux besoins/délais ; pas d’équivalence de hiérarchie FLOW ni de preuve d’installation Beaumanoir.


### ELM204

- Sources primaires approfondies le 18 septembre 2026 pour U328 ; responsabilité métier recherchée dans les résultats documentés, pas identité des noms.

- SAP — Calculate Target Inventory Components (2608).
  URL : https://help.sap.com/docs/SAP_INTEGRATED_BUSINESS_PLANNING/c1fb60cb1e9c49d99ada277ae57e9e6c/ab7b2b5a7bc24b86b949ee10d3275053.html?MDT_Attr_Appl_Models-BMforMDT=PDS+Activity&locale=en-US&version=LATEST
  Passage : Description et fonctionnalités de l’opérateur.
  Nature : Opérateur de planification. Constat : Détermine les cibles de stock et leurs composantes, ainsi que le point de commande ; résultats concrets correspondant à une partie importante de la responsabilité D05.a.
  Limites : Opérateur produit qui dépend de Global (Multi-Stage) Inventory Optimization ; produit aussi des indicateurs et conversions. Ni unité logicielle ni séquence SAP ne dictent la capacité FLOW. Les contraintes et politiques détaillées ne sont pas déclarées équivalentes. Source primaire consultée (SAP : texte indexé détaillé ; Microsoft et Oracle : page ouverte). Aucun déploiement Beaumanoir ni usage obligatoire d’IA démontré.

- Microsoft — Use the safety stock journal to update minimum coverage for items (Mise à jour affichée 2025-08-22).
  URL : https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/safety-stock-journal
  Passage : Calculate minimum coverage based on historical usage ; Calculate a proposal ; Post the new minimum quantity.
  Nature : Fonctionnalité et processus produit. Constat : Détermine un minimum proposé selon les consommations historiques, délais et service ; montre son impact sur la valeur du stock. Le résultat proposé est distinct de sa mise à jour effective.
  Limites : Appui partiel : ne documente pas à lui seul tous les objectifs et seuils de FLOW. Le même journal regroupe proposition, révision et application ; FLOW distingue les responsabilités métier sans imposer plusieurs logiciels. Le rôle du minimum dépend de la méthode de réapprovisionnement. Source primaire consultée (SAP : texte indexé détaillé ; Microsoft et Oracle : page ouverte). Aucun déploiement Beaumanoir ni usage obligatoire d’IA démontré.

- Oracle — Policy Assignment Sets (26B).
  URL : https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faurp/policy-assignment-sets.html
  Passage : Policy Parameters — Method for Calculation of Quantities / How the Policy Type Is Used.
  Nature : Règles de détermination des paramètres de stock. Constat : Calcule des valeurs de politique par article et lieu ; documente distinctement les méthodes de calcul des quantités et leur utilisation pour le réapprovisionnement.
  Limites : Ensemble fonctionnel plus large comprenant configuration, valeurs par défaut et surcharges ; ne constitue pas une capacité nommée Inventory Target Decision. Les politiques et formules Oracle restent des références, pas des règles FLOW adoptées. Source primaire consultée (SAP : texte indexé détaillé ; Microsoft et Oracle : page ouverte). Aucun déploiement Beaumanoir ni usage obligatoire d’IA démontré.


### ELM205

Sources primaires consultées le 18 septembre 2026 pour P13.

- SAP — Minimum and Maximum Safety Stock (Documentation évolutive, édition non identifiée sur cet extrait).
  URL : https://help.sap.com/docs/SAP_INTEGRATED_BUSINESS_PLANNING/feae3cea3cc549aaa9d9de7d363a83e6/c94e89301b884790b30fbd82a687bcc1.html
  Passage : How to Use — Target Service Level.
  Nature : Mécanisme d’optimisation documenté. Constat : Les opérateurs multi-stage peuvent ajuster les stocks de sécurité amont et aval pour respecter le service et les contraintes de sécurité.
  Limites : Texte primaire indexé consulté le 18 septembre 2026. Le mécanisme documenté porte sur les stocks de sécurité ; ne prouve pas toutes les cibles, un optimum garanti ou une réalisation Beaumanoir.

- RELEX — Multi-echelon inventory optimization (Article évolutif, sans version produit figée).
  URL : https://www.relexsolutions.com/resources/inventory-optimization/
  Passage : Multi-echelon inventory optimization.
  Nature : Mécanisme d’optimisation documenté. Constat : Positionne les stocks de sécurité en considérant les dépendances du réseau, délais, variabilité et service ; oppose cette approche aux dimensionnements isolés.
  Limites : Texte primaire indexé consulté le 18 septembre 2026. Présentation éditeur et scénario illustratif ; bénéfices annoncés non mesurés pour FLOW, algorithme non audité.


### ELM206

Sources primaires consultées le 18 septembre 2026, appuis fonctionnels à U331.

- SAP — Decomposed (Single-Stage) Inventory Optimization (2605).
  URL : https://help.sap.com/docs/SAP_INTEGRATED_BUSINESS_PLANNING/feae3cea3cc549aaa9d9de7d363a83e6/a46e510f47e94abebb61afb1cda2f65d.html
  Passage : Présentation ; Inputs and Outputs.
  Constat : Détermine localement stock de sécurité et position cible par produit-lieu, avec des dépendances distinctes de la topologie complète du réseau.
  Limites : SAP exige ici des résultats du Global Multi-Stage en entrée ; ce n’est pas une preuve de trajectoire obligatoire local puis global. Ne définit pas deux capacités nommées magasin et entrepôt.

- RELEX — Inventory optimization: Keys to a successful strategy (Article évolutif sans version produit figée).
  URL : https://www.relexsolutions.com/resources/inventory-optimization/
  Passage : Storage and space optimization capabilities ; Multi-echelon inventory optimization.
  Constat : Considère disponibilité en rayon et contraintes de réserves/DC ; oppose dimensionnement par lieu et positionnement coordonné des stocks de sécurité du réseau.
  Limites : Présentation fonctionnelle et scénario illustratif ; pas catalogue de capacités ni preuve de formule ou de déploiement Beaumanoir.

- RELEX — The best inventory planning software: AI-powered, planner-driven (Article évolutif sans version produit figée).
  URL : https://www.relexsolutions.com/resources/inventory-planning-software/
  Passage : DC forecasts from projected store orders.
  Constat : La demande d’un centre de distribution peut provenir des commandes magasins projetées ; elle ne se réduit pas à une prévision indépendante de ventes consommateur.
  Limites : Appui à la différence de contexte ; ne définit pas un comportement nommé Distribution Center Inventory Optimization et ne transfère pas la prévision dans D05.a.


### ELM207

Sources primaires consultées le 18 septembre 2026.

- Microsoft — Cycle counting (Documentation évolutive).
  URL : https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/cycle-counting
  Passage : Automatically create cycle counting work ; Spot cycle counting ; Resolve cycle counting differences.
  Constat : Plans récurrents, seuils déclenchant un comptage et comptage ponctuel sans travail préexistant ; traitement des différences constatées.
  Limites : Spot ne signifie pas exclusivement déclenché par anomalie. Un seuil de comptage ne prouve pas une incohérence ; ce n’est pas un seuil de réassort. Les modalités produit se combinent et ne forment pas trois capacités universelles.

- SAP — Physical Inventory (2608).
  URL : https://help.sap.com/docs/SAP_S4HANA_CLOUD/87f9b54f9c4f4e75aff0061860a6589a/ae735d9f76024645ad4f5b1a0e6e3387.html
  Passage : Physical inventory procedures.
  Constat : Distingue inventaire périodique, procédures continues et cycle counting ; confronte quantités physiques et enregistrées.
  Limites : Périmètre produit Warehouse Management ; aucune attribution automatique à FLOW des opérations WMS, ni obligation comptable ajoutée.

- Oracle — Counting — full physical inventory / cycle counting (12.2).
  URL : https://docs.oracle.com/cd/E26401_01/doc.122/e48826/T256582T257763.htm
  Passage : Counting ; Cycle Counting.
  Constat : Oppose le comptage périodique de sélections d’articles au comptage physique complet pour rapprocher les quantités.
  Limites : Référence EBS, pas Fusion Cloud ; les contraintes de blocage transactionnel du produit ne sont pas imposées à FLOW.


### ELM208

Sources primaires reconsultées le 18 septembre 2026 pour A01.

- SAP — Explaining Supply Assignment (documentation évolutive).
  URL : https://learning.sap.com/courses/exploring-fashion-functions-and-business-processes-in-sap-s-4hana-for-fashion-and-vertical-business/explaining-supply-assignment_af05618d-4954-4f22-9857-3dd12e3940c4
  Passage : Supply Assignment Scenarios ; Copying Assignments ; Normal, Preview and Simulation.
  Constat : En mode opérationnel décrit, le lien ressource-demande empêche l’usage de cette ressource par une autre demande ; peut porter sur des ressources futures comme les achats.
  Limites : L’affectation SAP porte donc déjà un effet de réservation. FLOW sépare les responsabilités sans présumer deux opérations, objets techniques ou applications. Les modes preview/simulation ne sont pas assimilés à l’engagement opérationnel.

- Microsoft — Inventory Visibility reservations (documentation évolutive).
  URL : https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-reservations
  Passage : Sample use case for soft reservation ; Configure reservation mappings and dimensions.
  Constat : Une soft reservation réduit la quantité disponible pour réservation sans changer le stock physique ; l’offset accompagne la consommation physique pour éviter de maintenir la même retenue deux fois.
  Limites : Soft ne signifie pas nécessairement temporaire, faible ou dépourvu d’effet. L’effet dépend des dimensions, de la configuration et du respect des contrôles par les consommateurs ; la page autorise des choix de poursuite en survente. Ce n’est pas une garantie de réalisation physique.


### ELM209

Sources primaires consultées le 18 septembre 2026 ; patrons de réalisation, pas catalogues de capacités.

- Microsoft — Compensating Transaction pattern (Mise à jour affichée 2026-04-20).
  URL : https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction
  Passage : Context and problem ; When to use this pattern ; Problems and considerations.
  Constat : Opérations longues à plusieurs étapes, avec compensation métier possible, notamment annulation de réservations.
  Limites : Appui de réalisation, pas définition d’une capacité Supply. La compensation tient compte des effets déjà produits ; elle ne restaure pas nécessairement un état antérieur et peut être impossible pour certains effets.

- AWS — Saga orchestration pattern (Documentation évolutive).
  URL : https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-orchestration.html
  Passage : Intent ; Issues and considerations.
  Constat : Coordination d’étapes transactionnelles et compensation dans une opération répartie ; l’isolation n’est pas celle d’une transaction globale atomique.
  Limites : Architecture de réalisation, pas obligation de microservices ou moteur d’orchestration FLOW. Ne constitue pas à elle seule une politique de réservation métier.


### ELM210

Sources primaires consultées le 18 septembre 2026 pour U337.

- Shopify — Creating draft orders.
  URL : https://help.shopify.com/en/manual/fulfillment/managing-orders/create-orders/create-draft
  Passage : Reserve item inventory in a draft order.
  Constat : Les quantités réservées sont dédiées au draft order et ne peuvent pas être achetées par les autres clients ; une expiration peut être définie.
  Limites : Appui direct à l’engagement commercial conditionnel et à l’exclusion concurrente, pas preuve de transfert immédiat de propriété ou de garantie physique absolue ; les durées Shopify ne deviennent pas une politique FLOW.

- Microsoft — Reserve inventory quantities.
  URL : https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/reserve-inventory-quantities
  Passage : Introduction ; reasons for reserving inventory.
  Constat : Les quantités réservées pour un Sales Order ne peuvent pas être retirées pour d’autres Orders sans annulation de la réservation ; prise en compte de clients prioritaires, ressources présentes ou futures.
  Limites : Le périmètre Microsoft inclut aussi des besoins de production. La réservation n’est donc pas limitée dans le marché au seul client acheteur ; aucune identité entre utilisateur du système et bénéficiaire n’est requise.


### ELM211

Sources primaires consultées le 18 septembre 2026 pour U338–U340. Éléments fonctionnels produits ; éditions évolutives, identifiants natifs indiqués lorsque disponibles.

- Microsoft — Dynamics 365 Inventory Visibility — Soft reservations.
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-reservations
  Passage : Sample use case for soft reservation.
  Synthèse du constat : La réservation réduit la quantité disponible à réserver sans réduire le stock physique ; vise à éviter les engagements concurrents.
  Limites : Les contrôles et consommateurs doivent respecter la réservation ; la survente peut être autorisée. Ne garantit pas à elle seule la livraison.

- commercetools — Composable Commerce API — ReserveOnCart / ReserveOnOrder.
  Source : https://docs.commercetools.com/api/inventory-overview
  Passage : Inventory modes ; Reservations.
  Synthèse du constat : Réservation au panier avec expiration ou à la création de commande ; déclenchement également possible sur une ligne existante.
  Limites : Paramètres de produit, pas un catalogue de capacités ni une politique unique adoptée pour FLOW.

- Shopify — Checkout — Inventory hold during checkout.
  Source : https://help.shopify.com/en/manual/checkout-settings
  Passage : Introduction, contrôle du stock dans checkout.
  Synthèse du constat : Stock retenu à la soumission des informations de paiement ; libération en cas d’échec du paiement.
  Limites : Ne pas assimiler ce jalon à la simple ouverture de la page paiement ou à un encaissement réalisé.

- Adobe — Commerce Inventory Management — Order status and reservations.
  Source : https://experienceleague.adobe.com/en/docs/commerce-admin/inventory/basics/order-status
  Passage : Status and reservations.
  Synthèse du constat : Réservation à la soumission de la commande ; maintien possible en attente de paiement.
  Limites : Création de commande et encaissement sont des événements distincts ; aucun déploiement Beaumanoir démontré.


### ELM212

Sources primaires consultées le 18 septembre 2026 pour U341. Synthèses de mécanismes produit, aucune importation de catalogue. Éditions évolutives sauf SAP 2608 ; identifiants natifs non établis au-delà des libellés.

- Microsoft — Dynamics 365 SCM — Inventory reservation policies.
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/reserve-inventory-quantities
  Passage : Inventory reservation policies ; Item sales reservation ; Production parameters.
  Constat reformulé : Politiques configurées : réservation automatique à la création des lignes de commande ou manuelle ; jalon de réservation configurable en production.
  Limites : Pas de preuve dans ce passage d’un choix automatique du jalon de vente selon le stock et la vitesse de sortie. Texte primaire indexé consulté ; ouverture directe en erreur 503.

- commercetools — Composable Commerce — Inventory modes and expiration.
  Source : https://docs.commercetools.com/api/inventory-overview
  Passage : Inventory modes ; Set the default expiration ; Reserve individual Line Items.
  Constat reformulé : Réservation au panier ou à la commande, mode par panier ou ligne ; durée configurable par défaut et par entrée de stock, changement de mode possible sur ligne existante.
  Limites : Ces leviers permettent une intégration adaptative ; ils ne prouvent pas un moteur fourni qui arbitre le jalon selon le risque de pénurie.

- IBM — Sterling Intelligent Promising — Rules-based safety stock.
  Source : https://www.ibm.com/docs/en/sip?topic=stock-rules-based-safety
  Passage : Benefits ; Network and node level safety stock ; Safety stock and total availability.
  Constat reformulé : Règles de stock de sécurité évaluées en temps réel ; valeurs fixes ou pourcentage au niveau réseau, validité temporelle et critères de contexte.
  Limites : Mécanisme voisin de protection des quantités vendables, pas décision du jalon de réservation pour un client. Texte primaire indexé consulté ; ouverture directe indisponible.

- SAP — S/4HANA Cloud 2608 — Availability Change Log Events in Backorder Processing.
  Source : https://help.sap.com/docs/SAP_S4HANA_CLOUD/32da8359c8ee4e8b8e8c5e15cacba5aa/62d58baf16434bf1a6ad16e55e4cd0f4.html
  Passage : Capturing Changes Caused by Backorder Processing (BOP) Run.
  Constat reformulé : BOP réévalue la disponibilité et le réalisme des confirmations lorsque la situation de demande ou d’offre change.
  Limites : Révision des confirmations, pas preuve d’une adaptation du jalon de réservation panier/paiement. Texte primaire indexé consulté ; page ouverte sans texte exploitable.


### ELM213

Sources primaires consultées le 18 septembre 2026 pour U342 ; compléments à ELM211/ELM212. Nature : règles et mécanismes produit, pas catalogues de capacités.

- Oracle — E-Business Suite Order Management — Reservation Time Fence (12.2).
  Source : https://docs.oracle.com/cd/E26401_01/doc.122/e48842/T373258T377249.htm
  Passage : Reservation Time Fence ; Reserve Orders Concurrent Program ; Reservation Modes.
  Constat reformulé : Une fenêtre avant la date planifiée conditionne la réservation automatique. Le programme Reserve Orders peut reprendre les lignes concernées.
  Limites : Référence EBS, pas Fusion Cloud. Les modes Fair Share/Percentage/Partial du même chapitre mêlent arbitrage des quantités et réservation ; FLOW conserve leurs frontières. Texte primaire ouvert.

- IBM — Sterling Order Management — Handling inventory reservation (Documentation évolutive).
  Source : https://www.ibm.com/docs/en/order-management?topic=2-handling-inventory-reservation
  Passage : Introduction ; Creating reservations.
  Constat reformulé : La réservation peut servir des clients prioritaires ou un ordre premier arrivé, premier servi.
  Limites : Appui à des politiques différenciées ; ne prouve pas une optimisation automatique de la durée par catégorie. Texte primaire indexé consulté.

- IBM — Sterling Intelligent Promising — Reservations (Documentation évolutive).
  Source : https://www.ibm.com/docs/en/sip?topic=data-reservations
  Passage : Creating reservation for node or network ; Updating reservation quantity ; Defining expiration times.
  Constat reformulé : Réservations par site ou réseau, expiration configurable et réservation partielle documentées.
  Limites : Options de réalisation ; le réseau est décomposé en sites selon les priorités IBM. Ne prouve pas une réservation sans affectation sous-jacente. Texte indexé consulté ; ouverture directe indisponible.

- Shopify — Checkout — Shopify Checkout (Documentation évolutive).
  Source : https://help.shopify.com/en/manual/checkout-settings
  Passage : Introduction, contrôle du stock au checkout.
  Constat reformulé : Stock retenu à la soumission des informations de paiement, avec libération en cas d’échec.
  Limites : Jalon produit spécifique, distinct de l’ouverture de page et de l’encaissement effectif ; aucun déclencheur FLOW imposé.


### ELM214

Sources primaires ouvertes le 18 septembre 2026 pour U344 ; fonctions produit et processus, pas taxonomie normative de capacités.

- Microsoft — Action messages (Documentation évolutive ; mise à jour affichée 2026-03-26).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/action-messages
  Passage : Introduction ; Select action messages.
  Synthèse : La planification émet des suggestions de changement de dates ou de quantités sur des Orders existants ; leur application reste distincte.
  Limites : Produit intégré ; les verbes Advance/Postpone/Increase/Decrease ne constituent pas quatre capacités FLOW.

- Microsoft — Firm planned orders (Documentation évolutive).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/planned-order-firming
  Passage : Introduction ; Manually firm planned orders, paramètres de regroupement.
  Synthèse : L’affermissement transforme des ordres planifiés en commandes effectives ; il peut aussi regrouper des lignes.
  Limites : Même fonction produit couvrant plusieurs effets métier. Microsoft rapproche firm/release dans cette page ; FLOW conserve ses distinctions. Ne prouve pas un parent unique de comportement.

- Oracle — Compensate Sales Orders That Change (26B).
  Source : https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faiom/compensate-sales-orders-that-change.html
  Passage : Introduction et exemple de changement d’entrepôt.
  Synthèse : Une modification de commande peut déclencher l’annulation puis la recréation d’une demande d’expédition par des règles d’orchestration.
  Limites : Mécanisme de réalisation du processus, compatible avec l’approche Case Management discutée ; ni comportement Supply Compensation ni garantie d’annulation physique.


### ELM215

Sources primaires consultées le 18 septembre 2026 pour U345.

- SAP — Supply Assignment (ARun) (2025 FPS01).
  Source : https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f132c385e0234fe68ae9ff35b2da178c/d335e3418f4348ffbae9f11888a62cc7.html
  Passage : Introduction et modes d’accès.
  Constat : Affectation des ressources aux besoins ; accès par BOP, ITA, affectation immédiate et API.
  Limites : Fonctionnalité intégrée ; ni couverture de toutes les capacités FLOW ni réalisation exclusivement batch démontrées.

- SAP — Backorder Processing — Reassignment (2025 FPS01).
  Source : https://help.sap.com/docs/PRODUCT_ID/f132c385e0234fe68ae9ff35b2da178c/6b8eb017a1d1431abde00056a249f72b.html
  Passage : Reassignment ; Requirement Sorting ; Supply Selection ; Release Check.
  Constat : Le traitement peut conserver les affectations et compléter le reliquat, ou les réexaminer. Le mode preview ne produit pas d’effets logistiques.
  Limites : Regroupement produit de décisions et d’action ; pas preuve qu’un plan externe arbitraire est importable ou qu’une simulation est appliquée sans recontrôle.

- Microsoft — Action messages (Mise à jour 2026-03-26).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/action-messages
  Passage : Introduction ; Select action messages.
  Constat : Recommandations de changement de quantités ou dates, distinctes de leur application.
  Limites : Appui à la notion de recommandation ; ne démontre pas que toute recommandation résulte d’une simulation ni ne valide notre hiérarchie de capacités.


### ELM216

Sources primaires consultées le 18 septembre 2026, U346/U347. Nature : fonctions produit et mécanismes techniques, pas capacités par défaut.

- SAP — Availability Change Log Events in Product Allocation (2608 Latest).
  Source : https://help.sap.com/docs/SAP_S4HANA_CLOUD/32da8359c8ee4e8b8e8c5e15cacba5aa/8e4093334e244479b1bc8f85125dbd30.html
  Passage : Finding the Material-Plant Combinations to be Rechecked.
  Constat : Des changements de Product Allocation identifient des couples article-site horodatés afin de limiter un traitement BOP ultérieur.
  Limites : Ne prouve ni périmètre minimal de commandes, ni optimalité globale, ni emploi de RETE.

- Drools — Phreak rule algorithm (8.44.0.Final).
  Source : https://docs.drools.org/latest/drools-docs/drools/rule-engine/index.html
  Passage : Phreak rule algorithm in the Drools rule engine.
  Constat : Rapprochement technique : mémoires et propagation de modifications pour évaluer les conditions des règles ; PHREAK prolonge RETE.
  Limites : Pas un optimiseur global de ressources ; aucune équivalence avec un comportement métier FLOW.

- SAP — Handling Requirements with Fixed Date and Quantity (2025 FPS01 (Feb 2026)).
  Source : https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f132c385e0234fe68ae9ff35b2da178c/413e5cf1373142a784f6c04b2caf3fc0.html
  Passage : Page entière.
  Constat : Par défaut BOP conserve les confirmations marquées Fixed Date and Quantity et leur attribue Skip.
  Limites : Un segment peut explicitement les inclure dans le contrôle ; ne prouve pas une immutabilité absolue ni le comportement de toute API ARun.

- Microsoft — Firm planned orders (Documentation évolutive).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/planned-order-firming
  Passage : Introduction.
  Constat : Affermir transforme des ordres planifiés en commandes effectives achat, transfert ou production.
  Limites : Transition de cycle de vie, pas synonyme de fixation de toutes les données d’une commande client.

- Microsoft — Keep supply for confirmed demand (Prérequis documenté : 10.0.48 build 10.0.2645.33 ou ultérieur).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/keep-supply-for-confirmed-demand
  Passage : What data is preserved ; Control how on-hand inventory is pegged ; Interaction with approved planned orders.
  Constat : Préserve une chaîne liée à une demande confirmée, notamment ordres planifiés et liens de pegging, entre les passages de planification.
  Limites : Comportement paramétré ; la conservation du stock reçu hors positive days exige un paramètre complémentaire. Ne prouve aucun déploiement Beaumanoir.

- Microsoft — Master plans — Freeze (Documentation évolutive).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/master-plans
  Passage : Freeze ; Firming.
  Constat : Le gel temporel conserve les ordres planifiés dans une fenêtre.
  Limites : Le gel empêche aussi la création de nouveaux ordres planifiés dans cette fenêtre ; différent de protéger une commande individuelle.


### ELM217

Sources primaires consultées le 18 septembre 2026 pour U351 ; fonctions et processus produits, pas catalogue de capacités par défaut.

- Microsoft — Release to warehouse (Documentation évolutive).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/release-to-warehouse-process
  Passage : Release to warehouse process.
  Constat : La libération de ventes et transferts vers l’entrepôt prépare les objets logistiques nécessaires au traitement.
  Limites : Mise en œuvre WMS spécifique ; FLOW distingue autorisation métier et orchestration/réalisation des prestations.

- Microsoft — Manage order holds (Documentation évolutive).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/tasks/manage-order-holds
  Passage : Introduction ; Set up order hold codes ; Manage orders on hold.
  Constat : Mise en attente avec motifs, conditions de levée et effet configurable sur les réservations ; progression logistique bloquée.
  Limites : Le checkout du hold est un verrou logiciel distinct. Les effets de réservation sont paramétrés, pas une conséquence universelle du Hold.

- Microsoft — Action messages (Documentation évolutive).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/action-messages
  Passage : Introduction ; Select action messages.
  Constat : Suggestions Advance/Postpone de changement d’échéances sur des ordres existants.
  Limites : Suggestion et application distinctes. Ne prouve pas une capacité autonome de calcul d’échéancier sous Lifecycle.

- Microsoft — Approve and confirm purchase orders (Documentation évolutive).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-order-approval-confirmation
  Passage : Canceling purchase orders ; modification après confirmation.
  Constat : Annulation encadrée des quantités restantes et Finalize pour empêcher de nouveaux traitements.
  Limites : Achat, pas cycle universel. Clôture opérationnelle FLOW ne reprend pas toute la finalisation financière du produit.

- SAP — Functional Details: Manage Sales Orders - Version 2 (Édition non relevée dans le passage indexé).
  Source : https://help.sap.com/docs/SAP_S4HANA_CLOUD/a376cd9ea00d476b96f18dea1247e6a5/e7f14402cf5846b4b3d0d677c15414b1.html?locale=en-US
  Passage : Delivery Block and Billing Block ; Rejection of all Items.
  Constat : Blocages par objet et rejet des lignes ; le rejet de toutes les lignes peut terminer le document sous conditions.
  Limites : Restrictions si déjà livré ou achat lié. Rejection produit n’est pas équivalent à toute annulation ou clôture FLOW ; facturation hors périmètre métier étudié.

- Oracle — Cancel Sales Orders (26B).
  Source : https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fauom/cancel-sales-orders.html
  Passage : Cancel Remaining Quantity.
  Constat : Annulation des quantités non expédiées selon états et conditions ; les quantités déjà réalisées ne sont pas effacées.
  Limites : Cycle de commande de vente propre au produit ; compensation du processus reste dans la couche processus, pas nouveau comportement de Lifecycle.

- Oracle — Hold Your Sales Orders (26B).
  Source : https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fauom/sales-order-hold.html
  Passage : Introduction ; How Holds Work.
  Constat : Un hold peut viser une étape de traitement : les autres étapes peuvent avancer jusqu’au point bloqué.
  Limites : Le modèle FLOW décrit portée et effets métier ; il ne copie pas les tâches d’orchestration Oracle.


### ELM218

Sources primaires consultées le 18 septembre 2026 pour U352.

- Microsoft — Archive Dynamics 365 Supply Chain Management Sales orders data (2026-01-14).
  Source : https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/sysadmin/archive-so
  Passage : Set up an archival job ; View historical data.
  Constat : Archivage des commandes avec consultation ultérieure des en-têtes, lignes et informations liées.
  Limites : Documentation de réalisation technique via Dataverse ; FLOW retient le résultat de conservation et de consultation, sans imposer cette architecture.

- Oracle — Cancel Sales Orders (26B).
  Source : https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fauom/cancel-sales-orders.html
  Passage : Restrictions par statut Draft et Processing.
  Constat : Le produit distingue suppression d’un brouillon et annulation d’une commande en traitement.
  Limites : Conditions propres au produit ; ne pas prescrire automatiquement les mêmes règles aux cinq types FLOW.

- Oracle — Order Purge and Archive (12.2).
  Source : https://docs.oracle.com/cd/E26401_01/doc.122/e48843/T335476T430137.htm
  Passage : Eligible Orders ; Purge Archive Program.
  Constat : Archivage sous conditions d’éligibilité et purge définitive des archives sont distincts.
  Limites : Référence EBS, pas Fusion ; aucune durée de conservation ou obligation légale FLOW déduite.

- Microsoft — Archive documents (2025-10-15).
  Source : https://learn.microsoft.com/en-us/dynamics365/business-central/across-how-to-archive-documents
  Passage : Introduction ; Restore ; Delete archived versions.
  Constat : Archive peut désigner des versions successives consultables, certaines restaurables sous conditions.
  Limites : Ne pas assimiler cette notion produit à la seule sortie des commandes du stock opérationnel ; restauration de version ne signifie pas réouverture métier.


### ELM219

Sources primaires consultées le 18 septembre 2026 pour U353/U354.

- Microsoft — Delivery schedules (2025-05-07).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/delivery-schedules
  Passage : Introduction et lignes commerciales/de livraison.
  Constat : Décomposition d’une quantité en lignes de livraison avec dates et quantités distinctes.
  Limites : Appui à split/spread ; une ligne commerciale et plusieurs livraisons ne créent pas nécessairement plusieurs commandes.

- Microsoft — Copy lines between sales orders (2025-04-03).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/copy-lines-between-sales-orders
  Passage : Introduction et paramètres de copie.
  Constat : Réutiliser des lignes et éventuellement l’en-tête pour alimenter une commande nouvelle ou existante.
  Limites : Copie sélective avec recalculs possibles ; ni conservation globale de la demande ni copie des engagements déduite.

- Oracle — Copy Sales Orders (26B).
  Source : https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fauom/copy-sales-orders.html
  Passage : Order Details ; Order Line Details.
  Constat : Création d’une nouvelle commande par copie avec choix des données reprises.
  Limites : Fonction produit ; pas preuve d’un comportement transversal Order Cloning ni de duplication des réservations.

- Oracle — Order Management Statuses (25C).
  Source : https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fauom/order-management-statuses.html
  Passage : Draft.
  Constat : Une commande enregistrée mais non soumise au fulfillment reste Draft et peut être modifiée.
  Limites : Référence 25C ; distinction brouillon/soumission, pas équivalence automatique avec ordre planifié/affermissement Microsoft.


### ELM220

Sources primaires consultées le 18 septembre 2026 pour U355.

- Microsoft — Delivery schedules (2025-05-07).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/delivery-schedules
  Passage : Commercial line et delivery lines.
  Constat : Une ligne commerciale demeure comme en-tête de lignes de livraison ; sa quantité agrège celles des livraisons.
  Limites : Hiérarchie de lignes dans une commande, pas preuve d’un nouvel Order chapeau ni d’une capacité autonome.

- Oracle — Split Order Lines (25D).
  Source : https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/fauom/split-fulfillment-lines.html
  Passage : Exemple Seattle/Denver et effets du split.
  Constat : Une ligne de 50 peut être scindée en 30 et 20 selon l’entrepôt ; le produit conserve la quantité globale et adapte les processus associés.
  Limites : Division de lignes/fulfillment et réalisation logicielle ; ni deux Orders commerciaux autonomes ni placement sous une capacité FLOW démontrés.

- SAP — Order Hierarchy (6.0 EHP8 Latest).
  Source : https://help.sap.com/docs/SAP_ERP/b4174aff4a234ed5be928a10c60997fb/45c8b65334e6b54ce10000000a174cb4.html
  Passage : Definition ; Structure.
  Constat : Hiérarchie d’ordres et sous-ordres avec responsabilité du leading order sur l’exécution des ordres inférieurs.
  Limites : Contexte maintenance/service, pas commandes Supply de vente/achat/transfert ; analogie de responsabilité seulement, aucun objet FLOW prescrit.


### ELM221

Sources primaires consultées le 18 septembre 2026 pour U357.

- Microsoft — Create purchase orders (Documentation évolutive).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-order-creation
  Passage : Creating a purchase order header.
  Constat : Le type Purchase order est distingué du type Returned order ; le contenu conserve les particularités du fournisseur.
  Limites : Taxonomie produit ; ne prouve pas une capacité nommée Role ni l’unification des modèles de vente et achat.

- Microsoft — Sales returns (Documentation évolutive).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/sales-returns
  Passage : Introduction et types de commandes.
  Constat : Un retour est représenté comme une commande de vente du type Returned order.
  Limites : FLOW distingue retours client et fournisseur par responsabilités ; aucune équivalence niveau par niveau.

- SAP — Sales Document Types (2025 FPS01 (Feb 2026)).
  Source : https://help.sap.com/docs/PRODUCT_ID/7b24a64d9d0941bda1afa753263d9e39/c564b65334e6b54ce10000000a174cb4.html
  Passage : Types of Processing ; Control Elements in Sales Document Types.
  Constat : Les catégories/types de documents caractérisent traitements et règles, avec des variantes de vente et retour.
  Limites : Catalogue de documents commerciaux mêlant contrats et commandes ; ne pas l’importer comme catalogue FLOW.

- Microsoft — Intercompany orders and return orders (Documentation évolutive).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/intercompany-orders-and-return-orders
  Passage : Commandes de vente et achat correspondantes.
  Constat : Une commande de vente intersociétés peut créer une commande d’achat correspondante.
  Limites : Deux commandes liées et des perspectives distinctes ; pas preuve qu’un même enregistrement change librement de rôle.


### ELM222

Sources primaires consultées le 18 septembre 2026 pour U360.

- Oracle — What’s a Split Order Line (26B).
  Source : https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fauom/fulfillment-line-splits.html
  Passage : How Order Management Determines Availability.
  Constat : Split couvre plusieurs entrepôts, dates ou articles substituts, et peut créer plusieurs lignes et tâches de fulfillment.
  Limites : Ne signifie pas toujours création de plusieurs commandes autonomes ; la fonction produit combine décisions et effets que FLOW sépare.

- Microsoft — Delivery schedules (2025-05-07).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/delivery-schedules
  Passage : Create delivery schedules ; Manage delivery lines.
  Constat : Quantité d’une ligne répartie sur plusieurs lignes de livraison, avec dates et quantités distinctes.
  Limites : Échelonnement de la demande : pas synonyme de répartition d’un stock contraint entre commandes.

- SAP — Maintaining a Delivery Schedule for a PO (6.0 EHP8 SP25).
  Source : https://help.sap.com/docs/SAP_ERP_SPV/967e1c2a6a8c4183b7e07d28e7574445/c77eb65334e6b54ce10000000a174cb4.html
  Passage : Introduction et schedule lines.
  Constat : Spread out décrit l’étalement temporel de la quantité dans des échéances de livraison.
  Limites : Verbe descriptif ; pas preuve d’une fonction ou capacité autonome nommée Spread.

- SAP — Allocation (Édition non relevée ; contexte ERP Fashion Management).
  Source : https://help.sap.com/docs/SAP_ERP/f48e74ad3b3740bc8c9eaade394a3c1e/f6a6f15562e37b43e10000000a4450e5.html
  Passage : Use ; Allocation Logic.
  Constat : Spread logic distribue proportionnellement les stocks existants entre les besoins selon des règles, en alternative à FIFO.
  Limites : Référence ERP, pas preuve d’identité avec toutes les éditions aATP récentes. Ce sens concerne arbitrage et affectation ressources-demandes, pas nécessairement mutation des Orders.


### ELM223

SAP ERP Fashion Management — Steps in Order Allocation Run. Consulté le 18 septembre 2026 ; édition non relevée dans le passage indexé.

- Source : https://help.sap.com/docs/SAP_ERP_SPV/f48e74ad3b3740bc8c9eaade394a3c1e/3d1df055aa2a6d55e10000000a4450e5.html
- Passage : Requirement Grouping ; Allocation ; Release Rules.
- Constat : ARun peut affecter le stock selon FIFO ou une répartition proportionnelle fondée sur les quantités demandées (spread logic). Le regroupement des besoins est un prérequis au Spread.
- Limites : Référence ERP Fashion, sans garantie pour toute édition aATP. ARun est le processus intégré ; Spread une de ses stratégies. La répartition ne nécessite pas la création de nouvelles commandes.


### ELM224

Sources primaires consultées le 18 septembre 2026 pour U365. Nature native : configuration de stratégie et fonctions produit.

- SAP — Supply Assignment Rule (Édition non affichée dans le passage consulté).
  Source : https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/9905622a5c1f49ba84e9076fc83a9c2c/8835cf8d77174b798327a4c3d14484e0.html
  Passage : Definition ; Supply Configuration ; Assignment Strategies ; Reassignment.
  Constat : Cadre comprenant choix et tri des ressources, horizon, stratégie séquentielle ou proportionnelle et réaffectation.
  Limites : Objet de configuration d’ARun ; ne prouve ni une capacité autonome de choix de politique ni que tout ATP maximise une valeur multidimensionnelle.

- Microsoft — Intelligent Fulfillment Optimization — Fulfillment strategies (Documentation évolutive ; aucune version produit figée).
  Source : https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/ifo-arch
  Passage : Fulfillment strategies ; Business constraints ; Multiple fulfillment strategies.
  Constat : Stratégies combinant objectifs, contraintes et sources ; choix selon contexte et optimisation de commandes groupées.
  Limites : Service d’optimisation plus large que le seul cadrage ; proximité des sources comme objectif prédéfini documenté. Pas preuve d’un solveur générique multiobjectif ni d’un catalogue de capacités équivalent.

- SAP — Advanced Available-to-Promise (aATP) (2025 FPS01 (Feb 2026)).
  Source : https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f132c385e0234fe68ae9ff35b2da178c/443bc939-7992-4666-afc1-d33d841deb5b.html
  Passage : Use.
  Constat : Propositions de quantités et dates tenant compte des stocks, réceptions futures, demandes concurrentes et restrictions.
  Limites : La description ne définit pas ATP comme une maximisation universelle de valeur ; aATP regroupe plusieurs fonctions.


### ELM225

Audit terminologique local U366/U367 ; sources primaires consultées le 18 septembre 2026. Définitions métier, présentations et fonctions produit : ne pas aligner automatiquement leur maille.

- SF01 — Microsoft / Balancing supply and demand (Documentation évolutive).
  Source : https://learn.microsoft.com/en-us/dynamics365/business-central/design-details-balancing-demand-and-supply
  Passage : Supply and demand ; Process orders ; Priorities on the supply side.
  Constat : Supply désigne le côté ressources : stock et apports entrants, notamment achats, production, transferts entrants et retours clients. Supply orders alimente ce côté du bilan.
  Limite : Sémantique de planification Business Central, pas définition d’un périmètre organisationnel FLOW.

- SF02 — CSCMP / SCM Definitions and Glossary of Terms (Page de référence sans édition affichée).
  Source : https://cscmp.org/CSCMP/Educate/SCM_Definitions_and_Glossary_of_Terms.aspx
  Passage : Definitions of Supply Chain Management ; Logistics Management.
  Constat : SCM couvre approvisionnement, transformation, logistique et coordination entre partenaires. Le fulfillment figure parmi les activités logistiques.
  Limite : Définition de Supply Chain Management, utilisée pour délimiter le périmètre ; ce n’est pas une taxonomie de capacités FLOW.

- SF03 — ASCM / What is supply chain logistics? (Page évolutive).
  Source : https://www.ascm.org/topics/logistics/
  Passage : Supply chain vs logistics ; Order processing and fulfillment.
  Constat : La supply chain est décrite comme un réseau amont-aval ; le fulfillment est orienté vers la réalisation des commandes.
  Limite : Présentation pédagogique centrée sur les biens ; ne tranche pas tous les cas de retours ou services numériques FLOW.

- SF04 — Microsoft / Intelligent Fulfillment Optimization (Documentation évolutive).
  Source : https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/ifo-arch
  Passage : Fulfillment sources ; Business constraints ; Fulfillment strategies.
  Constat : Stratégies de satisfaction associant sources, objectifs et contraintes ; optimisation possible de commandes groupées et restitution d’un plan.
  Limite : Service logiciel, plus large qu’une décision de cadre. Objectif de proximité documenté ; aucune équivalence complète à D03 ni solveur universel multiobjectif démontré.

- SF05 — Microsoft / Store order fulfillment (Documentation évolutive).
  Source : https://learn.microsoft.com/en-us/dynamics365/commerce/order-fulfillment-overview
  Passage : Introduction ; Pick ; Pack ; Pick up ; Shipping.
  Constat : Fulfillment inclut des opérations effectives de préparation et remise ou expédition des commandes.
  Limite : Le produit décrit l’exécution magasin ; FLOW distingue pilotage et opérations internes des exécutants.

- SF06 — SAP / Backorder Processing — Supply Assignment (2025 FPS01 (Feb 2026)).
  Source : https://help.sap.com/docs/PRODUCT_ID/f132c385e0234fe68ae9ff35b2da178c/6b8eb017a1d1431abde00056a249f72b.html
  Passage : Supply Selection ; Assignment ; Reassignment.
  Constat : Supply Assignment relie besoins, stocks et réceptions futures ; réaffectation paramétrable.
  Limite : Fonction intégrée SAP ; FLOW sépare décision, affectation, réservation et promesse.

- SF07 — SAP / Supply Protection (SUP) (2602, version URL 2602.500).
  Source : https://help.sap.com/docs/PRODUCT_ID/32da8359c8ee4e8b8e8c5e15cacba5aa/c4b704762cbd4611a3ee2dc00c7a7277.html?locale=en-US&state=PRODUCTION&version=2602.500
  Passage : Use.
  Constat : Protection de quantités pour des groupes face aux demandes concurrentes.
  Limite : Plus étroit que Supply Protection FLOW qui inclut aussi tampon et régulation des apports.

- SF08 — Microsoft / Inventory allocation (Documentation évolutive).
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-allocation
  Passage : Business background ; Allocation definition.
  Constat : Droits de groupes et contrôle de surconsommation avant les commandes ; distincts de la réservation liée aux ventes.
  Limite : Appui à deux mécanismes de protection, pas équivalence avec toute la capacité FLOW.


### ELM226

18 septembre 2026 ; U368 ; réexamen du nom de D13.

- SAP Forecasting and Replenishment — Supply Network, 7.0 EHP4. Passage primaire indexé : Definition, Use et Integration. Réseau de liaisons entre lieux et admissibilité des produits ; sources internes et fournisseurs externes. Référence historique, pas preuve d’une topologie FLOW complète ni de tous les flux retours.
  Source : https://help.sap.com/docs/SAP_SUPPLY_CHAIN_MANAGEMENT/35d41850ef1d4618a0ce6ffa921e8d6d/01b4c7ac10a64d7791560ac37235fe46.html?locale=en-US&state=PRODUCTION&version=7.0.4
- Microsoft Intelligent Fulfillment Optimization, documentation évolutive : introduction et Fulfillment sources relues. La même page parle de supply network et de sources de fulfillment ; celles-ci comprennent entrepôts, magasins, fournisseurs en dropship et sites virtuels. Deux angles de lecture du réseau, pas frontière universelle entre amont et aval.
  Source : https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/ifo-arch


### ELM227

18 septembre 2026 ; U369 ; sources primaires ouvertes.

- CSCMP — SCM Definitions and Glossary of Terms.
  Source : https://cscmp.org/CSCMP/Educate/SCM_Definitions_and_Glossary_of_Terms.aspx
  Passage : Definition of Supply Chain Management ; Boundaries and Relationships.
  Constat : SCM couvre planification, approvisionnement, transformation, logistique et coordination entre partenaires.
  Limite : Périmètre professionnel plus large que le catalogue FLOW ; les fonctions coordonnées ne deviennent pas automatiquement des domaines FLOW.

- Microsoft — Welcome to Dynamics 365 Supply Chain Management.
  Source : https://learn.microsoft.com/en-us/dynamics365/supply-chain/supply-chain-management-welcome
  Passage : Core concepts and tasks.
  Constat : Le produit regroupe notamment stocks, planification, achats, production, entrepôt et transport.
  Limite : Catalogue produit et non modèle normatif de capacités ; aucune importation des modules ni équivalence complète avec FLOW.


### ELM228

18 septembre 2026 ; U376 ; stratégies de fulfillment. Nature : configurations et sélection de règles produit, pas catalogue de capacités. Références Microsoft MKT14 et SAP MKT03 ; documentation Oracle Fusion Cloud Global Order Promising 26B.

- Microsoft, Intelligent Fulfillment Optimization : sections Fulfillment strategies et Multiple fulfillment strategies in order orchestration flows. Source primaire ouverte : https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/ifo-arch ; mise à jour 30 janvier 2026.
- SAP, Supply Assignment Rule : Definition, Supply Configuration, Assignment Configuration. Texte primaire indexé consulté, édition non affichée ; ouverture directe vide : https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/9905622a5c1f49ba84e9076fc83a9c2c/8835cf8d77174b798327a4c3d14484e0.html
- Oracle 26B, Assignments and Rules et Consider Your Sourcing Hierarchy and Assignment Set Hierarchy : pages primaires ouvertes. https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fascp/how-order-promising-rules-work-together.html ; https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fascp/sourcing-assignment-levels.html

Faits, rapprochements, limites et proposition FLOW : modeles/backlog/fulfillment-strategy-review.yaml, market_review_U376. Synthèses sélectives, sans copie intégrale ; aucune réalisation Beaumanoir déduite.


### ELM229

18 septembre 2026 ; U379 ; A04. Sources primaires de traitement des retours :

- Microsoft Dynamics 365 SCM, Specify how to dispose of returned items, documentation évolutive ; passage sur disposition code/action, page ouverte : https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/specify-how-to-dispose-of-returned-items
- Microsoft, Set up disposition codes, mise à jour affichée 1 juillet 2026, passage primaire indexé : https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/set-up-disposition-codes ; exemple de code Repair and return.
- SAP S/4HANA Cloud Public Edition, Logistical Follow-Up Activities, table des suites logistiques après inspection ; texte primaire indexé, édition exacte du passage non établie : https://help.sap.com/docs/SAP_S4HANA_CLOUD/a376cd9ea00d476b96f18dea1247e6a5/aad8417242c84d70a64b2742fe818c90.html

Nature : configurations, actions et processus produit. Synthèse et limites dans modeles/backlog/return-disposition-review.yaml. Aucune équivalence de niveau ou couverture Beaumanoir déduite.


### ELM230

18 septembre 2026 ; U381/U382. Pages primaires ouvertes, synthèses sélectives ; édition produit non affichée.

- Blue Yonder, Smart Disposition : Intelligent routing, Customizable reason codes and rules, Key Benefits. https://blueyonder.com/solutions/returns-management/smart-disposition . Nature : présentation produit, règles et optimisation du devenir/destination. Périmètre également commercial, aucune preuve d’algorithme ou de réalisation Beaumanoir.
- Blue Yonder, Returns decisioning: The secret hack to higher recovery and improved margins, 18 février 2026 : Decisioning at any touchpoint is key. https://blueyonder.com/blog/2026/returns-decisioning-the-secret-hack-to-higher-recovery-and-improved-margins . Nature : article éditeur. État, saisonnalité, valeur, coûts et stock éclairent les orientations ; les points du parcours ne sont pas automatiquement des comportements.
- Manhattan, Returns Management : Returns Done Right et Maximize Returns Profitability. https://www.manh.com/solutions/omnichannel-software-solutions/order-management-system/returns-management . Nature : page commerciale. Orientation dynamique vers le lieu favorisant la remise en vente ; ne prouve pas un catalogue complet de stratégies de disposition.
- Microsoft ELM229 relu : table des codes et actions, mise à jour affichée 7 mai 2025. Configuration des suites physiques et financières, pas preuve de sélection automatisée.

Interprétation, limites et propositions dans modeles/backlog/return-disposition-review.yaml, behavior_review_U382.


### ELM231

18 septembre 2026 ; U383. Microsoft Dynamics 365 SCM, Purchase order overview, documentation évolutive : introduction et Types of purchase orders, page primaire ouverte. https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-order-overview . Gestion propre aux achats, suivi des réceptions ; retour fournisseur représenté comme type de commande d’achat dans le produit. Nature : document et processus produit, pas catalogue normatif de capacités.

Microsoft Disposition codes/action et Blue Yonder Smart Disposition, ELM229/ELM230, relus sur pages primaires. Configuration des orientations et optimisation du devenir ; limites et différences dans les fiches. Aucune réalisation Beaumanoir déduite.


### ELM232

18 septembre 2026 ; U384. Sources primaires consultées pour Customer Return :

- SAP S/4HANA Cloud, Warehouse Management, Logistical Follow-Up Activities, version 2602 affichée dans le texte indexé. Table 0011 stock disponible, 0012 rebut, 0005 fournisseur, 0021 client et 0026 réparation. https://help.sap.com/docs/SAP_S4HANA_CLOUD/87f9b54f9c4f4e75aff0061860a6589a/aeb252c114df4dac9abf1626ccb04233.html . Portail direct partiellement inaccessible ; texte primaire indexé effectivement consulté.
- Microsoft Dynamics 365 SCM, Specify how to dispose of returned items, page ouverte, mise à jour affichée 7 mai 2025 ; tables des codes et actions. https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/specify-how-to-dispose-of-returned-items .
- Microsoft Dynamics 365 SCM, Sales returns, page évolutive ouverte ; Return order process, RMA et Disposition codes and actions. https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/sales-returns . Retours physiques et credit only ; remplacement porté par commande de vente liée.

Nature : processus, configurations et activités produit ; aucune équivalence automatique avec des comportements métier, aucune preuve de réalisation Beaumanoir. Synthèses sélectives, sans reproduction intégrale.


### ELM233

18 septembre 2026 ; U386 ; Supplier Return. Sources primaires et périmètres distincts :

- Microsoft Dynamics 365 Business Central, Process purchase returns or cancellations, page évolutive ouverte : introduction et Create a replacement purchase order from a purchase return order. https://learn.microsoft.com/en-us/dynamics365/business-central/purchasing-how-process-purchase-returns-cancellations .
- SAP Business ByDesign, Create a New Return to Supplier, édition May 2026 affichée dans le passage indexé : Overview et Create a Return to Supplier in Purchasing. https://help.sap.com/docs/SAP_BUSINESS_BYDESIGN/2754875d2d2a403f95e58a41a9c7d6de/2d9b97f7722d1014a974a1fa1d11fd10.html . Texte primaire indexé consulté, portail direct vide ; avoir, remplacement et combinaison partielle.
- Oracle Fusion Cloud SCM Receiving 25A, Return to Supplier for Credit Only, présentation ouverte. https://docs.oracle.com/en/cloud/saas/readiness/scm/25a/inv25a/25A-inventory-wn-f35542.htm . Ne pas rouvrir l’achat aux réceptions lorsqu’aucun remplacement n’est attendu.
- Oracle EBS Service Parts Planning 12.1, Repair at sourcing / Repair-Return : passage primaire indexé consulté. https://docs.oracle.com/cd/E18727-01/doc.121/e13338/T515331T515340.htm . Réparation externe avec achat et mouvements ; référence historique, pas Oracle Fusion ni un périmètre retail démontré.

Nature : configurations, processus et effets produit ; synthèses sélectives, aucune preuve de déploiement Beaumanoir. Détails et limites dans modeles/backlog/supplier-return-behaviors.yaml.


### ELM234

U389 — consulté le 18 septembre 2026. Microsoft Dynamics 365 Supply Chain Management (MKT14), **Cycle counting**, page évolutive mise à jour le 20 novembre 2025 : introduction, Automatically create cycle counting work et Perform a cycle count by using a mobile device. Source primaire : https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/cycle-counting .

Nature : processus et fonctions produit WMS. Le texte distingue comptage selon plan récurrent, déclenchement par seuil et comptage ponctuel. Rapprochement avec des politiques de contrôle métier, sans reprendre les écrans ou étapes comme comportements. Ne couvre pas tout Stocktaking ni une taxonomie de capacités ; aucune preuve Beaumanoir. Synthèse, sans reproduction intégrale.

ELM052 reconsulté pour U389 : glossaire BIZBOK 15.0, ©2026, page imprimée 456 (PDF page 4), entrées Business Process, Capability, Capability Behavior ; page 457 (PDF page 5), Capability Instance / Level. Source primaire : https://cdn.ymaws.com/www.businessarchitectureguild.org/resource/resmgr/bizbok15/BIZBOKv15_glossary.pdf . La définition de Behavior traite de la manière d’agir selon les circonstances. Extrait public seulement ; aucune prescription des sept formes FLOW trouvée dans ces entrées.


### ELM235

U390 — 18 septembre 2026. Microsoft Dynamics 365 SCM : Create purchase orders (Adding purchase order lines), Direct deliveries (introduction, dates, adresses et entrepôt), Set up consignment (Inventory ownership change journal), pages primaires ouvertes. SAP S/4HANA on-premise : Manage Service Entry Sheets - Lean Services et Planned and Unplanned Services, passages primaires indexés consultés ; édition 2025 FPS01 (Feb 2026) affichée sur cette dernière, ouvertures directes sans texte exploitable.

Sources, URL, localisateurs et limites conservés dans modeles/backlog/purchase-order-behaviors.yaml, PO-S1 à PO-S4. Nature : processus, documents et fonctions produit. Distinctions biens/prestations, livraison directe et acquisition de stock consigné. Aucune taxonomie de capacités équivalente ni preuve Beaumanoir ; synthèses sans reproduction intégrale.


### ELM236

U391 — 18 septembre 2026. Consignation et positionnement du marché. Sources primaires CI-S1–7 dans modeles/backlog/consignment-inventory-review.yaml : Microsoft Inventory to deliver (cartographie de processus, mise à jour July 2026 partielle) et Set up consignment ; SAP Special Stocks (2608, passage indexé) et guide Enterprise Architecture Procure to Receipt (2025, texte indexé, figures non inspectées) ; Oracle Fusion 25D Consigned Inventory, fonctionnalité Redwood 25A et NetSuite Consigned Inventory Management (documentation évolutive).

Localisateurs, URL, constats et limites conservés dans l’annexe. Les formes de preuve diffèrent : sous-processus, variante de parcours, type de stock, cycle fonctionnel et fonctionnalité produit. Aucune feuille de RBA non lue revendiquée, aucune responsabilité juridique ou assurantielle uniforme déduite ; pas de preuve de réalisation Beaumanoir.


### ELM237

U392 — 18 septembre 2026. Sources primaires NP-S1–4 dans modeles/backlog/nonpurchase-supply-order-review.yaml : Microsoft Consignment replenishment orders (page Set up consignment ouverte), SAP S/4HANA Item Category / Consignment (passage indexé, portail sans texte), Oracle Fusion 25D Consignment Order et 26A Supply Order orchestration (pages ouvertes).

Nature : document de demande, catégorie de ligne et objet d’orchestration. Distinction entre apport physique, propriété et acquisition ; aucun consensus sur un Procurement Order générique démontré. Les noms et localisateurs natifs, limites et dates sont conservés dans l’annexe.


### ELM238

U393 — 18 septembre 2026. Microsoft Dynamics 365 SCM, Set up consignment (page mise à jour 2026-05-06, ouverte) ; SAP Learning S/4HANA Cloud Public Edition, Exploring the Supplier Consignment (2LG) Scenario (formation évolutive ouverte) ; SAP Business Network, Supplier-Managed Inventory (passage primaire indexé, portail sans texte exploitable). URL, passages et limites dans modeles/backlog/order-intent-principles.yaml, OI-S1–3.

Constats : Microsoft sépare demande d’apport et achat lors du transfert ; SAP réutilise une catégorie de ligne en conservant les effets de propriété et peut générer les demandes selon les besoins MRP. L’acteur du réassort et le signal de demande sont deux axes distincts. Aucune motivation historique exclusive de SAP ni maturité Case Management globale démontrée ; la location d’espace rémunérée est l’intention FLOW décrite par Laurent, pas une propriété universelle tirée des sources.


### Relecture ELM238 — U394

18 septembre 2026 : Microsoft Set up consignment et SAP Learning Exploring the Supplier Consignment (2LG) Scenario ouverts de nouveau, mêmes URL que OI-S1/OI-S2 dans order-intent-principles.yaml. Les passages décrivent respectivement une demande d’apport distincte du Purchase Order et une catégorie de ligne Consignment au sein du Purchase Order. Ils permettent de comparer la représentation explicite des intentions ; ils ne prouvent ni incapacité fonctionnelle SAP ni causalité historique de la conception Microsoft.


### ELM239

18 septembre 2026 — The Open Group, ArchiMate Community : [ArchiMate 101](https://archimate-community.pages.opengroup.org/workgroups/archimate-101/), tutoriel évolutif ouvert, sections Relationships between systems. Flow distingue les échanges, Triggering la précédence temporelle/causale, Serving la fourniture de comportement utile. Les directions ne sont pas nécessairement identiques. Appui méthodologique, pas catalogue de capacités FLOW ni prescription de notre niveau Comportement.


### ELM240

U400 — 18 septembre 2026. Sources primaires Microsoft SCM/Commerce/IOM, Oracle Fusion 25D/26A/26B, SAP ERP Retail 6.17 et étude client Nextail/Merkal consultées pour les trois capacités regroupées. Titres, URL, éditions, passages, constats et limites dans modeles/backlog/consignment-sales-transfer-review.yaml, G01–G11. SAP : passage indexé uniquement, portail sans texte ; IOM : avertissement preview. Aucun déploiement Beaumanoir ni taxonomie native de douze comportements déduit.


### ELM241

18 septembre 2026 — relecture ciblée avant U402 de trois textes primaires : Microsoft Dynamics 365 SCM, Calculate sales order delivery dates using CTP (page mise à jour 2026-07-27, How CTP compares to ATP) ; SAP Learning S/4HANA, Using Advanced Available-To-Promise (aATP), section Alternative-Based Confirmation ; SAP Learning S/4HANA Cloud Public Edition, Exploring Backorder Processing, sections Overview et Confirmation Strategies. URL, éditions, constats, passages et limites dans modeles/backlog/d03-review.yaml, ctp_behaviors_U402.sources (S07, S05, S06).

Nature : mécanismes et processus produit. Appuis à la faisabilité par apports supplémentaires, alternatives de satisfaction et réexamen d’engagements. Les frontières éditeurs diffèrent de FLOW ; aucune taxonomie universelle de trois comportements CTP ni déploiement Beaumanoir démontré. Synthèses sélectives, aucune reproduction intégrale.


### ELM242

19 septembre 2026 — textes primaires Microsoft Dynamics 365 SCM ouverts avant U403 : Vendor collaboration with external vendors (mise à jour 2025-07-21), sections échanges sur PO, réponses et versions ; Review and accept changes to confirmed purchase orders (mise à jour 2026-07-01), modifications et impacts aval directs. SAP S/4HANA Cloud Best Practices, Create Supplier Confirmation (Optional) : passage primaire indexé sur référence au Purchase Order, date et quantité confirmées ; portail ouvert sans texte exploitable, édition non établie.

Nature : processus, fonctions et objet produit. URL, localisateurs, constats et limites dans modeles/backlog/purchase-order-behaviors.yaml, supplier_confirmation_U403.source_comparisons. La source SAP appuie le nom et les données, sans prouver tout le comportement. Aucune taxonomie de capacités ou réalisation Beaumanoir déduite. Synthèses sélectives uniquement.


### ELM243

19 septembre 2026 — sources primaires consultées : Microsoft Azure Business Process Tracking (conception, identifiant métier et mapping d’étapes), Logic Apps Run History (statuts/actions/résultats), Camunda Process Observability (instances et contexte métier). Relecture ciblée SAP EWM (flux entrants, internes, sortants et monitor), project44 (article du 22 août 2023, Transportation Visibility et ETA multimodal) et Blue Yonder Store Execution (réception directe en rayon et disponibilité).

URL, éditions, passages, constats et limites dans modeles/backlog/execution-services-review.yaml, tracking_U406.sources. Documentation ou présentation éditeur, sans preuve Beaumanoir. Microsoft apporte le nom et un mécanisme de corrélation ; FLOW explicite Task/appels sans correspondance un pour un ni contrainte Azure. Les pages commerciales n’établissent pas une collecte exhaustive. Synthèse sélective, pas de reproduction intégrale.


### ELM244

Process Orchestration — Camunda ; orchestration et providers — Microsoft Dynamics 365 IOM. Sources primaires consultées le 19 septembre 2026, passages, URL, éditions et limites dans modeles/backlog/execution-services-review.yaml, process_services_U409.market_comparisons. Coordination de tâches humaines et automatisées chez Camunda ; actions, événements et providers côté Microsoft. Aucun catalogue de capacités universel ni existant Beaumanoir déduit.


### ELM245

SAP S/4HANA Fashion, Supply Assignment / Release checks ; Oracle Fusion Cloud SCM 26A, Guidelines for Managing Shipment Sets. Sources primaires ouvertes le 19 septembre 2026, URL, passages, éditions et limites dans modeles/backlog/order-lifecycle-behaviors.yaml, order_release_U410.market_comparisons. SAP distingue affectation et autorisation de livraison ; Oracle documente les contraintes collectives des shipment sets. Pas de preuve installée Beaumanoir.


### ELM246

Oracle Backlog Planning 26B et Key Actions on Orders 25D ; Microsoft Dynamics 365 SCM Planned Orders, page mise à jour le 2 septembre 2026. Sources primaires ouvertes le 19 septembre 2026 ; URL, passages et limites dans modeles/backlog/order-backlog-review.yaml. Vision collective du carnet chez Oracle ; préparation et approbation des propositions d’approvisionnement chez Microsoft. Pas de taxonomie métier universelle ni de preuve installée.


### ELM247

Oracle Backlog Planning 26B / Key Actions on Orders 25D et Microsoft Planned Orders simplified (mise à jour 3 octobre 2025), pages primaires consultées le 19 septembre 2026. URL et passages dans modeles/backlog/order-backlog-review.yaml, planning_U414.market_comparisons. Travail sur les scénarios et propositions distinct de leur calcul ; aucune taxonomie universelle ni preuve installée Beaumanoir.


### ELM248

Oracle Split Order Lines 26B ; Microsoft Planned Orders, page mise à jour le 2 septembre 2026. Sources primaires consultées le 19 septembre 2026 ; passages, URL et limites dans modeles/backlog/order-backlog-review.yaml, structure_lifecycle_U417.market_comparisons. Split organise les parties de satisfaction ; statuts et approbation pilotent la préparation des ordres planifiés. Aucune preuve installée ni taxonomie universelle.


### ELM249

Microsoft Dynamics 365 SCM — change management des Purchase Orders, examen des modifications confirmées, Firm planned orders, Manage order holds, Release to warehouse et gel temporel des Master plans. Documentation évolutive, passages primaires consultés le 19 septembre 2026. URL, localisateurs, synthèses et limites dans modeles/backlog/order-backlog-review.yaml, lifecycle_redesign_U422.market_comparisons. Nature : mécanismes et processus produit ; aucune taxonomie de capacités ni preuve installée Beaumanoir.


### ELM250

Microsoft — Purchase order overview (Dynamics 365 SCM, 8 septembre 2026, Purchase order statuses) et State framework architecture (Intelligent Order Management, 30 janvier 2026, colonnes d’état et transitions, réserve de préversion). Pages primaires consultées le 19 septembre 2026. URL et limites dans modeles/backlog/order-backlog-review.yaml, lifecycle_dimensions_U423.market_comparisons. Plusieurs dimensions sur un Order et gouvernance des transitions ; éléments de données/framework, pas capacités d’entreprise.


### ELM251

Microsoft Dynamics 365 SCM — Purchase order overview (Purchase order statuses), Approve and confirm purchase orders (Approval, Changing, Canceling), Firm planned orders (Introduction), Manage order holds (motifs et levée). Pages primaires ouvertes le 19 septembre 2026. URL et rapprochements sur D04.o et comportements, complétés par ELM249/250. Plusieurs statuts métier coexistants ; mécanismes produit, pas catalogue normatif FLOW. Les listes FLOW n’affirment pas une équivalence exacte avec les codes Microsoft.


### ELM252

Microsoft Dynamics 365 SCM — Coverage settings (25 mars 2026, Coverage codes) et Action messages (26 mars 2026, Introduction et Select action messages). Pages primaires consultées le 19 septembre 2026. Méthodes de réapprovisionnement et de lotissement ; recommandations Advance/Postpone/Increase/Decrease. URLs et limites sur D05.e. Pas de taxonomie de capacités ni preuve installée Beaumanoir.


### ELM253

Microsoft Dynamics 365 SCM — Coverage settings (25 mars 2026, Coverage codes) et Action messages (26 mars 2026, Introduction et Select action messages). Sources primaires reconsultées le 19 septembre 2026 pour U427. URLs et synthèses dans les fiches BHV083–085. Deux méthodes de détermination des apports et recommandations d’ajustement ; pas de preuve de réalisation Beaumanoir.

### ELM254

Sources primaires consultées le 19 septembre 2026 pour U428. Nature : processus et responsabilités de composants produits, pas taxonomie de capacités d’entreprise ni preuve de déploiement Beaumanoir.

- Microsoft Dynamics 365 SCM, documentation évolutive, [Sales returns](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/sales-returns), sections Return order process, Return material authorization et Disposition codes and disposition actions : parcours physique et Credit only, remplacement par Sales Order lié, effets logistiques et financiers combinés. Texte primaire consulté. [Accounts receivable](https://learn.microsoft.com/en-us/dynamics365/finance/accounts-receivable/accounts-receivable) situe les factures et règlements dans Dynamics 365 Finance ; passage primaire indexé consulté.
- SAP S/4HANA Cloud Public Edition, page produit 2602, [Customer Compensation](https://help.sap.com/docs/SAP_S4HANA_CLOUD/a376cd9ea00d476b96f18dea1247e6a5/436368e8646443988837608bb121e92d.html), remboursement non pertinent, demande d’avoir et livraison gratuite ; [Customer Returns Processing](https://help.sap.com/docs/SAP_S4HANA_CLOUD/a376cd9ea00d476b96f18dea1247e6a5/ef17554b70b946e588cf4fb378fa4622.html), suites logistiques et documents de compensation. Passages primaires indexés consultés ; portail direct sans texte exploitable. Ne pas en déduire une séparation logicielle totale ni un remboursement monétaire à chaque avoir.
- Oracle Fusion Cloud SCM 26A, [How Order-to-Cash Works in Order Management](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/faiom/how-order-to-cash-works-in-order-management.html), étapes 3 à 5 : appels Create Billing Lines/Wait for Billing vers Receivables ; Financials réalise facturation et paiements. Page ouverte et texte consulté. Exemple configurable de processus, pas attribution universelle des domaines d’entreprise.

### ELM255

U429 — Sources primaires consultées le 19 septembre 2026 : Microsoft Dynamics 365 Commerce, [Omnichannel payments overview](https://learn.microsoft.com/en-us/dynamics365/commerce/omni-channel-payments), Key terms, Overview et Basic principle : autorisation, capture et références de remboursement intégrées aux parcours Commerce. Page évolutive ouverte ; aucune assimilation de capture à crédit bancaire définitif.

SAP Learning, [Executing the Billing Process and the Integration to SAP S/4HANA Finance](https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-the-billing-process-and-the-integration-to-sap-s-4hana-finance_e2dd5db3-73c3-4cda-8ad5-1e7f39f04fba), page ouverte, cours Sales Essentials : création du document de facturation dans Sales et intégration à Finance. Complément primaire indexé SAP Help, [Sales Billing](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/7b24a64d9d0941bda1afa753263d9e39/4c74c957b7018809e10000000a4450e5.html), création/gestion de documents de facturation et transfert à la comptabilité financière. Version précise du cours non affichée dans les passages consultés. Nature : responsabilités produit et processus, pas attribution universelle des capacités ni preuve d’organisation Beaumanoir.


### ELM256

Oracle E-Business Suite Order Management 12.2 — Line Sets / Fulfillment Sets. Source primaire ouverte le 19 septembre 2026 : https://docs.oracle.com/cd/E26401_01/doc.122/e48843/T335476T336783.htm ; sections Line (Ship or Arrival) Sets, Set Function Details, Fulfillment Sets. Mécanisme produit reliant des lignes d’une même commande sous conditions communes. La portée multi-commandes n’est pas démontrée ; aucun identifiant natif de capacité ni définition normative d’entreprise. Synthèse et limites : modeles/backlog/order-structuring-review-U439.yaml. Aucune réalisation Beaumanoir déduite.

### ELM257

SAP Fashion Management, ERP 6.0 EHP8 SP24 — General Requirements Grouping. Passages primaires indexés consultés le 19 septembre 2026 : https://help.sap.com/docs/SAP_ERP_SPV/f48e74ad3b3740bc8c9eaade394a3c1e/c617f055aa2a6d55e10000000a4450e5.html?locale=en-US&state=PRODUCTION&version=6.18.24 ; Use, Grouping Rule and Grouping Criteria, Individual Group Release Rules. Fonction produit de regroupement de besoins ; ne prouve pas un ensemble transactionnel persistant. Synthèse originale sans reproduction ; limites détaillées dans l’annexe U439.

### ELM258

Infor LN 10.7 Procurement — Commingling purchase orders. Texte primaire ouvert le 19 septembre 2026 : https://docs.infor.com/ln/10.7/en-us/lnolh/help/td/onlinemanual/000321.html ; Header level commingling, Line level commingling, Approval. Fonction produit de fusion de commandes d’achat avant approbation, distincte du seul regroupement logistique. Les règles techniques de suppression et de calcul des prix ne sont pas adoptées dans FLOW. Aucun constat installé ni équivalence universelle aux autres Orders. Synthèse originale ; détails dans l’annexe U439.

### ELM259

OMG DMN — MKT43, présentation officielle https://www.omg.org/dmn/, paragraphes sur la spécification des décisions/règles et la complémentarité DMN/BPMN/CMMN. Texte primaire consulté le 19 septembre 2026 ; page évolutive sans édition précise de spécification étudiée. Concept méthodologique, sans identifiant natif de capacité. Reformulation : une décision peut être décrite distinctement du processus ou du cas qui la mobilise. Aucun classement individuel FLOW ni taxonomie en six catégories n’est prescrit ; synthèse originale, sans reproduction substantielle.

### Relecture U451 — ELM052 et ELM234

19 septembre 2026 : textes primaires rouverts. [BIZBOK Guide 15.0, Appendix A](https://cdn.ymaws.com/www.businessarchitectureguild.org/resource/resmgr/bizbok15/BIZBOKv15_glossary.pdf), page imprimée 456, entrées Capability et Capability Behavior ; [Microsoft Cycle counting](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/cycle-counting), présentation et modes de déclenchement. Le premier éclaire la façon d’agir selon les circonstances ; le second illustre des politiques de comptage. Les sept formes FLOW et leurs affectations ne sont prescrites par aucune de ces sources. Synthèse originale, sans reproduction intégrale ni preuve de réalisation Beaumanoir.

### ELM260

### Audit U453/U454 — convention documentaire des entrées suivantes

ELM260–277 : consultation du 19 septembre 2026. Les libellés ci-dessous sont natifs ; les identifiants ELM sont locaux, aucun identifiant natif de capacité n’est prétendu. Les définitions sont résumées dans nos mots, sans citation intégrale ni importation des modèles. Le [registre de sources](../audits/2026-09-19-atlas-ux-ui-U453/sources.md) fournit pour chaque repère S l’URL, la section, l’édition connue et l’accès réellement obtenu. Aucune réalisation Beaumanoir n’est démontrée par ces sources.

MKT25 — LeanIX, Meta Model / Data Object Modeling Guidelines, métamodèle v4 et documentation évolutive. S03–S04, Data Object / Modeling scope : concepts et relations d’un référentiel d’architecture. Reformulation : objets de données reliés aux autres catalogues, sans profondeur d’un dictionnaire technique exhaustif. Textes primaires indexés ; ne pas assimiler Data Object à toute structure physique.

### ELM261

MKT26 — Ardoq, Data Lineage Metamodel / Business Capability Modeling, documentation évolutive. S05–S06, Data Entity / Accesses / Owns / Perspectives : concepts et vues d’un outil EA. Reformulation : entités, responsabilités et usages peuvent se lire selon plusieurs questions. Texte primaire indexé, accès direct partiellement bloqué ; modèles détaillés des messages hors du périmètre décrit.

### ELM262

MKT44 — Horizzon, Color views / Highlight views / Combining filters. S07, documentation évolutive : fonctions de présentation. Reformulation : filtres et légende rendent une propriété lisible dans une vue. Aucun essai de performance, d’ergonomie ou de partage effectué.

### ELM263

MKT45 — OrbusInfinity, Views / Recent Views / Configurable Dashboards & Sites. S08, documentation et présentation évolutives : fonctions et positionnement produit. Reformulation : plusieurs vues peuvent servir différents destinataires. Aucun gain chiffré repris ni essai utilisateur du produit.

### ELM264

MKT04 — SAP Reference Business Architecture / Business Data Catalog. S01–S02, cours SAP Learning sans édition applicative établie : concepts méthodologiques. Reformulation : contenu métier et contenu de solution sont distingués, les informations métier sont reliées aux capacités. Cette pratique SAP est comparée aux cadres indépendants, sans lui donner autorité sur FLOW.

### ELM265

MKT14 — Dynamics 365 Finance & Operations, Data entities overview / Categories of entities. S11, documentation évolutive : abstraction de données de produit. Reformulation : des entités d’intégration regroupent des données physiques selon des concepts fonctionnels ; leurs catégories ne définissent pas les capacités d’entreprise FLOW.

### ELM266

MKT14 — Dynamics 365, Business events overview / Business event catalog / Idempotency. S12, page du 22 janvier 2026 : mécanisme de notification produit. Reformulation : une notification métier et un export de données répondent à des usages différents. Aucun choix d’event sourcing ni contrat de message FLOW déduit.

### ELM267

MKT13 — SAP S/4HANA, Purchase Order (OData V4) / Create Material Documents. S13–S14, Header / Item et création, éditions applicatives non établies : API et structures produit. Reformulation : commande et document ERP ont des représentations structurées. Textes primaires indexés ; aucun schéma, champ ou statut importé dans FLOW.

### ELM268

MKT42 — GS1, Electronic Product Code Information Services (EPCIS). S15, présentation du 30 mai 2025 et introduction du standard : modèle d’échange d’événements de traçabilité. Reformulation : documenter un fait et son contexte est utile aux échanges interentreprises. Pas un modèle de tous les faits de gestion ; aucune édition normative ni adoption de format.

### ELM269

MKT03 — Guild, Information Concept, Metamodel Guide v3.0, septembre 2024, §§5.2–5.3.1. S09 : concept d’architecture métier et relations. Reformulation : les capacités utilisent ou modifient des informations métier. Le rapprochement FLOW ne reprend pas toute la taxonomie du guide.

### ELM270

MKT02 — ArchiMate 4, C260, 27 avril 2026. S10, notice Details / Main changes : évolution d’un langage de modélisation. Reformulation : la version importe pour les concepts et relations disponibles. Notice officielle consultée ; norme complète non lue, aucune conformité FLOW déduite.

### ELM271

MKT48 / MKT49 — Fluent 2 Color et Fiori Colors v1-145. S17–S18, palettes et usages : principes de design. Reformulation : neutralité, marque et sens de la couleur remplissent des rôles distincts. Proposition de palette FLOW, pas application obligatoire d’une charte éditeur.

### ELM272

MKT47 — Progressive Disclosure, Jakob Nielsen, 4 décembre 2006. S19 : principe UX. Reformulation : donner accès aux développements depuis l’essentiel. Principe consulté, bénéfice de la maquette Atlas encore à éprouver par des tâches utilisateurs.

### ELM273

MKT46 — WCAG 2.2, Understanding 1.4.3 / 1.4.1 / 2.5.8. S20a–c : critères et explications officielles sur contraste, couleur et cibles. Reformulation : lisibilité et signification ne reposent pas sur la couleur seule ; tailles et exceptions doivent être évaluées dans leur contexte. Les observations Atlas ne constituent pas un audit de conformité exhaustif.

### ELM274

MKT50 — Domain analysis / Bounded contexts, page du 25 février 2026. S16 : méthode de conception contextualisée. Reformulation : la cohésion métier et les dépendances éclairent le découplage ; une carte de capacités ne fournit pas seule les limites d’un service logiciel. Aucun style d’architecture imposé.

### ELM275

MKT20 — Oracle Fusion Cloud Procurement 26C, Purchase Orders / Lines / Schedules / Distributions. S21 : ressources REST et structure d’intégration. Reformulation : le détail du contrat produit inclut des préoccupations plus larges que le périmètre Supply FLOW. Aucun niveau ou champ comptable ajouté à la cartographie.

### ELM276

MKT01 — TOGAF Series Guide G190, Information Mapping, avril 2019, chapitres 4–6. S22–S23 : méthode d’architecture ; carte d’information et modèle de données distingués. Document primaire lu sur hébergement tiers, présence de G190 confirmée dans les ressources officielles actuelles ; identité avec la distribution actuelle non contrôlée.

### ELM277

MKT01 — TOGAF 9.2, 2018, Phase C: Data Architecture / Data Entity–Business Function Matrix, chapitres 9 et 31. S24 : méthode et artefacts. Reformulation : données, fonctions et applications peuvent être rapprochées par des vues distinctes. Copie primaire historique consultée ; édition 10 détaillée inaccessible, aucun report automatique de ses paragraphes à cette édition.

### ELM278

U455/U456 — MKT01, TOGAF 9.2, 2018, chapitre 7, §§7.3.1 et 7.5.3–7.5.6, pages imprimées 81 et 89–91. [Document primaire](https://governance.foundation/assets/frameworks/togaf/c182e%20-%20TOGAF%209.2.pdf) lu le 19 septembre 2026 sur hébergement tiers, copie d’évaluation non redistribuée. Libellés natifs : Business Capability Mapping, Value Stream Mapping, Process Modeling ; concepts et techniques, pas identifiants de capacités. Reformulation : plusieurs vues complémentaires décrivent le métier. Ce passage ne prescrit pas les anciennes couches FLOW ; édition historique, pas vérification de la 10e édition. La distinction de périmètre Atlas est une décision locale, non une obligation TOGAF.

### ELM279

U455/U456 — MKT14, Microsoft Dynamics 365 Intelligent Order Management, [Overview](https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/overview), sections Components / Intelligent Order Management app / Providers / Orchestration. Texte primaire ouvert le 19 septembre 2026, documentation évolutive, édition produit non fixée. Fonctions et intégrations d’un produit, sans identifiant natif de capacité métier. Reformulation : capture de commandes, orchestration et partenaires de fulfillment coopèrent via des informations. Recouvrement partiel de l’exemple de Laurent ; ni preuve d’un déploiement Beaumanoir ni prescription de trois domaines ou de couches. Synthèse sélective et lien seulement.

### ELM280

U460 — MKT14, Microsoft Dynamics 365 Supply Chain Management, [Product information overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/pim/product-information). Source primaire consultée le 19 septembre 2026 ; page évolutive mise à jour le 1er juillet 2026. Passages : Product definition ; Distribution, export, and import of product data ; Product masters and product variants. Nature : concepts et fonctions produit, sans identifiant natif de capacité. Reformulation : références, variantes et import de données produit ; la création des maîtres est aussi couverte. Limite : aucune dimension obligatoire FLOW ni équivalence de catalogue. Synthèse sélective, pas de reproduction.

### ELM281

U460 — MKT14, Microsoft Dynamics 365 Supply Chain Management, [Exchange data between systems](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/wms-only-mode-exchange-data), section Master and reference data. Source primaire consultée le 19 septembre 2026 ; documentation évolutive du mode Warehouse management only, édition non figée. Nature : import et maintien de données produit, sans identifiant natif de capacité. Reformulation : une origine de maintien est configurée pour une référence dans ce contexte produit. Limite : ne prouve ni l’autorité métier FLOW ni un maître unique d’entreprise ; contrats techniques non transposés. Synthèse et lien seulement.

### ELM282

U460 — MKT42, GS1 GO, [How does serialisation differ from unique identification in the GS1 System?](https://support.gs1.org/support/solutions/articles/43000734238-how-does-serialisation-differ-from-unique-identification-in-the-gs1-system-). FAQ officielle consultée le 19 septembre 2026 ; page évolutive, pas une édition des spécifications normatives. Nature : explication d’identification ; pas d’identifiant natif de capacité. Reformulation : GTIN et numéro de série distinguent une instance. Limite : pas de conformité globale GS1 déduite ni sérialisation imposée à toutes les Product Units FLOW. Synthèse sélective seulement.

### ELM283

U460 — MKT14, Microsoft Dynamics 365 Supply Chain Management, [Inventory Visibility reservations](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-reservations), section Sample use case for soft reservation. Source primaire relue le 19 septembre 2026 ; documentation évolutive, édition non figée. Nature : fonction produit, aucun identifiant natif de capacité. Reformulation : une réservation souple réduit la disponibilité à réserver sans mouvement physique. Le respect effectif du refus dépend des règles des applications participantes. Limite : les types Microsoft ne deviennent pas les types FLOW ; aucune réalisation installée déduite. Appui au pilote Reservation, sans nouvelle équivalence.

### ELM284

U460 — MKT14, Microsoft Dynamics 365 Supply Chain Management, [Keep supply for confirmed demand in Planning Optimization](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/keep-supply-for-confirmed-demand). Source primaire relue le 19 septembre 2026 ; mise à jour affichée le 27 juillet 2026, contexte Dynamics 10.0.48 ou ultérieur. Sections : What data is preserved ; Control how on-hand inventory is pegged to confirmed demand. Nature : fonction produit, sans identifiant natif de capacité. Reformulation : la préservation des liens de ressource dépend de réglages distincts de la date confirmée. Limite : ce mécanisme recouvre plusieurs responsabilités FLOW ; pas d’identité avec Supply Assignment seule. Appui au pilote, pas nouvelle règle FLOW.

### ELM285

U461 — MKT14, Microsoft Dynamics 365 Supply Chain Management, [Record the receipt of goods on the purchase order](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/tasks/record-receipt-goods-purchase-order), section Record receipt of goods, étapes 4–7. Source primaire consultée le 19 septembre 2026 ; page évolutive mise à jour le 1er juillet 2026. Nature : exemple produit, sans identifiant natif de capacité. Reformulation : un document identifié rend compte de la réception enregistrée. Limite : cet exemple n’établit pas une convention universelle fait–document, ni ses règles de correction. Synthèse et lien seulement.

### ELM286

U462 — MKT14, Microsoft Dynamics 365 Supply Chain Management, [Confirm sales orders](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/tasks/confirm-sales-orders), sections Confirm a single sales order / Confirm multiple sales orders. Consulté le 19 septembre 2026 ; page évolutive mise à jour le 1er juillet 2026. Fonction produit sans identifiant natif de capacité. Reformulation : confirmation documentaire et état documentaire sont explicités. Limite : cet usage n’établit pas un équivalent lexical complet de Fulfillment Commitment. Appui à l’alternative discutée U444 ; synthèse sélective, pas de reproduction.

### ELM287

U462 — MKT13, SAP S/4HANA Fashion, [Explaining Supply Assignment](https://learning.sap.com/courses/exploring-fashion-functions-and-business-processes-in-sap-s-4hana-for-fashion-and-vertical-business/explaining-supply-assignment_af05618d-4954-4f22-9857-3dd12e3940c4), sections Supply Assignment (ARun) / Supply Assignment Scenarios. Consulté le 19 septembre 2026 ; cours évolutif sans édition unique affichée. Fonction produit sans identifiant natif de capacité. Reformulation : le scénario ARun crée un lien ressource–demande qui empêche l’usage par une autre demande. Écart explicite avec FLOW U436, qui attribue ce dernier effet à Reservation. Le vocabulaire repris ne vaut donc pas équivalence complète. Synthèse et lien seulement.

### ELM288

U462 — MKT14, Microsoft Dynamics 365 Supply Chain Management, [Purchase order overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-order-overview), introduction et Purchase order status. Consulté le 19 septembre 2026 ; documentation évolutive, édition produit non figée. Concept documentaire, pas identifiant natif de capacité. Reformulation : achat de biens ou services, suivi de la réception et progression documentaire. Limite : FLOW reprend le nom métier pour une capacité d’action distincte de l’objet ; pas de transposition des états ERP ni de périmètre financier. Synthèse et lien seulement.

### Relecture U463 — ELM019 et ELM279

19 septembre 2026 : textes primaires reconsultés pour la définition de universe-supply. ELM019, TOGAF G189 (juin 2018), §2 et §2.1.2, pages imprimées 2–3 : distinction entre aptitudes métier et moyens de réalisation. Document primaire sur le [miroir tiers déjà référencé](https://governance.foundation/assets/frameworks/togaf/g189%20-%20Business%20Capbility.pdf), sans copie ni redistribution ; le portail officiel TOGAF 9.2 redirige vers une authentification. Appui méthodologique, pas définition de l’univers Supply ni examen de la 10e édition.

ELM279, Microsoft [Intelligent Order Management overview](https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/overview), mise à jour affichée le 30 janvier 2026 : Introduction, Components, Orchestration, Inventory visibility service et Fulfillment optimization. Réexamen à périmètre FLOW inchangé ; le rapprochement demeure partiel. Les composants techniques ne deviennent pas des domaines. Raisons du choix et limites dans la fiche universe-supply ; CMP182. Aucune réalisation Beaumanoir ni origine SAP des anciennes couches déduite.

### ELM289

U464 — MKT51 : Information, Data, Data element. ISO/IEC 15944-1:2025 et ISO 20691:2022, extraits officiels consultés le 19 septembre 2026. Sens en contexte, représentation, indivisibilité contextuelle ; aucune définition de bloc minimal Atlas. URL, localisateurs et renvois normatifs dans [l’analyse structurée](../modeles/backlog/information-definition-U464.yaml). Pas d’identifiant natif de capacité ; synthèse originale, modèles sectoriels non adoptés.

### ELM290

U464 — MKT52 : Elementary fact / fact type is elementary in conceptual schema. SBVR 1.5, octobre 2019, §24.2.1 p.222 et §24.2.2.1 p.255, texte primaire consulté le 19 septembre 2026. Critère logique d’irréductibilité dans un schéma ; sens plus strict que le minimum utile à une fiche. URL et limites dans [l’analyse](../modeles/backlog/information-definition-U464.yaml). Aucun fait de gestion FLOW ou document déduit d’un fait logique.

### ELM291

U464 — MKT53 : What Is An Elementary Fact?, Terry Halpin, 1993, réédition sur orm.net. Pages 2–3 et 6–8 consultées le 19 septembre 2026 : les contraintes peuvent changer la décomposition pertinente. Appui théorique, pas adoption d’ORM ni preuve que nos exemples sont logiquement irréductibles. Localisateurs dans [l’analyse](../modeles/backlog/information-definition-U464.yaml).

### Relecture U464 — ELM269 et ELM276

19 septembre 2026 : Guild, Metamodel Guide v3.0, §§5.3–5.3.1 ; TOGAF G190, chapitres 1–2 et 4–6, éditions et accès déjà référencés. Leur concept d’information éclaire la relation aux capacités ; il ne garantit pas une maille indivisible. Pas de reprise automatique des correspondances objets/capacités de la Guild. Sources détaillées dans l’analyse U464 ; CMP183.


### ELM292

U470/U471 — MKT41, CSCMP, Définitions professionnelles. [SCM Definitions and Glossary of Terms](https://cscmp.org/CSCMP/Educate/SCM_Definitions_and_Glossary_of_Terms.aspx). Page sans édition affichée. Nature : Définition professionnelle. Passage consulté le 19 septembre 2026 : Definition of Supply Chain Management ; Boundaries and Relationships. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour universe-supply, TER031 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM293

U470/U471 — MKT14, Microsoft, Dynamics 365 Supply Chain Management. [Welcome to Dynamics 365 Supply Chain Management](https://learn.microsoft.com/en-us/dynamics365/supply-chain/supply-chain-management-welcome). Page mise à jour le 10 septembre 2025. Nature : Périmètre de produit. Passage consulté le 19 septembre 2026 : Core concepts and tasks. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour universe-supply ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM294

U470/U471 — MKT20, Oracle, Fusion Cloud Supply Chain Orchestration. [Overview of Supply Chain Orchestration](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fauco/overview-of-supply-orchestration.html). 26B. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Introduction ; receive requests, create supply orders, manage changes ; drop shipment. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour BHV059, BHV068, universe-supply, TER031 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM295

U470/U471 — MKT20, Oracle, Fusion Cloud Product Hub. [Overview of Item Batches](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/fapim/overview-of-item-batches.html). 26A. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Introduction et options des lots d’import. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour D08, D08.d ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM296

U470/U471 — MKT14, Microsoft, Dynamics 365 Supply Chain Management. [Inventory journals](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-journals). Page mise à jour le 29 août 2025. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Types of inventory journals : Transfer, Item arrival, Counting. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour D01.f ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM297

U470/U471 — MKT20, Oracle, Fusion Cloud Inventory Management. [How You Review Item Supply and Demand](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/famml/how-you-review-item-supply-and-demand.html). 25D. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Supply and demand ; quantities and dates ; ATP/nettable filters. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour D01.c ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM298

U470/U471 — MKT13, SAP, S/4HANA aATP. [Explaining aATP Product Allocation (PAL)](https://learning.sap.com/courses/exploring-fashion-functions-and-business-processes-in-sap-s-4hana-for-fashion-and-vertical-business/explaining-aatp-product-allocation-pal-_dd30c229-d63f-4aba-a950-a174280c4a58). Cours évolutif sans édition affichée. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : aATP: PAL Concept ; scénario ; restrictions par groupes de demande. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour D02.b, D05.d ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM299

U470/U471 — MKT20, Oracle, Fusion Cloud Inventory Management. [Reservations](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/famml/reservations.html). 25C. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Introduction ; supply and demand documents ; restriction des prélèvements concurrents. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour D02.c ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM300

U470/U471 — MKT20, Oracle, PeopleSoft Inventory. [Promising and Reserving Inventory](https://docs.oracle.com/cd/E13228_01/fscm9pbr0/eng/psbooks/sinv/htm/sinv18.htm). PeopleSoft FSCM 9.0, édition historique. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Reservation lead days ; ATP ; inventory priority rules ; shortage workbench. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour D03.i, D03.m, BHV033, BHV077 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM301

U470/U471 — MKT20, Oracle, Fusion Cloud Global Order Promising. [Database Promising](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fascp/overview-of-database-centric-order-promising.html). 25C. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Profitable to Promise. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour D03.k ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM302

U470/U471 — MKT14, Microsoft, Dynamics 365 Supply Chain Management. [Delivery schedules](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/delivery-schedules). Documentation évolutive ; état consulté le 19 septembre 2026. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Create delivery schedules ; Manage delivery lines. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour D03.l, BHV044, TER081 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM303

U470/U471 — MKT14, Microsoft, Dynamics 365 Supply Chain Management. [Master plans overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/master-plans). Documentation évolutive ; état consulté le 19 septembre 2026. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Master plans ; Firming time fence ; Action message time fence. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour D05.f, BHV006, BHV036, BHV085 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM304

U470/U471 — MKT14, Microsoft, Dynamics 365 Supply Chain Management. [Schedule workload capacity](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/schedule-workload-capacity). Documentation évolutive ; état consulté le 19 septembre 2026. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Warehouse workload capacity ; volume, weight, inbound/outbound workload. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour D06.b ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM305

U470/U471 — MKT19, TM Forum, Service Ordering. [TMF641 Service Ordering API REST Specification R18.5.1](https://www.tmforum.org/resources/specification/tmf641-service-ordering-api-rest-specification-r18-5-0/). R18.5.1 ; document 4.0.1, 2019 ; version archivée. Nature : Concept documenté par un contrat sectoriel. Passage consulté le 19 septembre 2026 : Présentation publique : create, update, retrieve ; service order items. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour D07.b ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM306

U470/U471 — MKT14, Microsoft, Dynamics AX Transportation Management. [Transportation scenario – Manual rating](https://www.microsoft.com/en-us/dynamics-365/blog/business-leader/2016/02/16/transportation-charges-scenario-manual-rating-2/). Publication officielle du 16 février 2016 ; exemple historique. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Load planning workbench : Shipping carrier et Carrier service ; Manual rating. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour D06.e ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM307

U470/U471 — MKT20, Oracle, E-Business Suite Warehouse Management. [Oracle Warehouse Management User’s Guide](https://docs.oracle.com/cd/E26401_01/doc.122/e48830/T211976T430466.htm). EBS 12.2. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Opportunistic Cycle Counting. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour BHV031 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM308

U470/U471 — MKT14, Microsoft, Dynamics 365 Supply Chain Management. [Keep supply for confirmed demand in Planning Optimization](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/keep-supply-for-confirmed-demand). SCM 10.0.48 build 10.0.2645.33+ selon la page. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : What data is preserved ; Control how on-hand inventory is pegged to confirmed demand. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour BHV047, TER082 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM309

U470/U471 — MKT14, Microsoft, Dynamics GP Returns Management. [Returns Management](https://learn.microsoft.com/en-us/dynamics-gp/distribution/returnsmanagement). Guide Dynamics GP ; édition produit non précisée dans le passage. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : RTV types : Repair and Return ; Enter a repair and return RTV ; Receive an RTV. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour BHV057 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM310

U470/U471 — MKT20, Oracle, E-Business Suite Purchasing. [Oracle Purchasing User’s Guide](https://docs.oracle.com/cd/E26401_01/doc.122/e48931/T446883T443953.htm). EBS 12.2. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Standard Purchase Orders ; quantités et échéances de livraison. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour BHV058 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM311

U470/U471 — MKT54, OASIS, Universal Business Language. [Universal Business Language Version 2.4](https://docs.oasis-open.org/ubl/UBL-2.4.html). OASIS Standard 2.4, 2024. Nature : Scénarios métier illustrant un standard documentaire. Passage consulté le 19 septembre 2026 : §2.3.3.5 VMI ; §2.3.5.1 Fulfilment ; §2.3.5.4 Freight Status Reporting. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour BHV061, BHV062, BHV065, BHV070, BHV080, TER036 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM312

U470/U471 — MKT20, Oracle, E-Business Suite Consigned Inventory. [Consuming Material](https://docs.oracle.com/cd/E26401_01/doc.122/e48822/T260819T260824.htm). EBS 12.2. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Aging Based Ownership Transfer. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour BHV064 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM313

U470/U471 — MKT14, Microsoft, Dynamics 365 Commerce. [Store order fulfillment](https://learn.microsoft.com/en-us/dynamics365/commerce/order-fulfillment-overview). Page mise à jour le 28 janvier 2026. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Pick up ; Shipping ; Line quantity tracking. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour BHV066, BHV067 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM314

U470/U471 — MKT14, Microsoft, Dynamics 365 Supply Chain Management. [Intercompany orders and return orders](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/intercompany-orders-and-return-orders). Documentation évolutive ; état consulté le 19 septembre 2026. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Introduction : création correspondante des commandes intersociétés. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour BHV069 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM315

U470/U471 — MKT20, Oracle, Fusion Cloud Supply Chain Orchestration. [Use Supply Chain Orchestration in Your Back-to-Back Flows](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fauco/how-orchestration-processes-back-to-back-flows.html). 26B. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Back-to-back flows ; buy, make, transfer ; demand and supply link. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour BHV074 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM316

U470/U471 — MKT20, Oracle, Fusion Cloud Global Order Promising. [Overview of Global Order Promising](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fascp/overview-of-global-order-promising.html). 25C. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Supply chain search ; capable-to-promise. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour BHV075 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM317

U470/U471 — MKT14, Microsoft, Dynamics 365 Intelligent Order Management. [Intelligent fulfillment optimization architecture](https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/ifo-arch). Documentation évolutive ; état consulté le 19 septembre 2026. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Fulfillment strategies ; source priority ; distance ; partial orders. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour BHV076 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM318

U470/U471 — MKT14, Microsoft, Dynamics 365 Supply Chain Management. [Outbound workload visualization](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/outbound-workload-visualization). Documentation évolutive ; état consulté le 19 septembre 2026. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Introduction : suivi du travail en cours et restant. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour BHV079 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM319

U470/U471 — MKT14, Microsoft, Dynamics 365 Commerce. [Store inventory management](https://learn.microsoft.com/en-us/dynamics365/commerce/work-with-store-inventory). Documentation évolutive ; état consulté le 19 septembre 2026. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Store inventory management operations ; inventory dimensions. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour BHV081 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM320

U470/U471 — MKT14, Microsoft, Dynamics 365 Supply Chain Management. [Replenishment methods and quantity modification](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/replenishment-methods-quantity-modification). Page mise à jour le 1er juillet 2026. Nature : Fonction produit documentée. Passage consulté le 19 septembre 2026 : Coverage codes : Requirement, Min./Max.. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour BHV083, BHV084 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM321

U470/U471 — MKT42, GS1, Global Traceability Standard. [GS1 Global Traceability Standard](https://www.gs1.org/standards/gs1-global-traceability-standard/current-standard). Version en ligne ; édition non figée par cette consultation. Nature : Standard d’identification et de traçabilité. Passage consulté le 19 septembre 2026 : Identification : Class-level, Batch/Lot-level, Instance-level. Libellé natif : titre indiqué ; aucun identifiant natif de capacité déduit. Appuis pour TER059 ; reformulations, différences et limites dans leurs comparaisons et dans [le relevé U471](../audits/2026-09-19-base-U470/additions.yaml). Synthèse sélective et liens, sans reprise intégrale ni réalisation installée déduite.


### ELM322

U471 — MKT13, SAP S/4HANA Sales, [Executing the Advanced Intercompany Sales and Stock Transfer Process](https://learning.sap.com/courses/functions-innovations-in-sap-s-4hana-sales/executing-the-advanced-intercompany-sales-and-stock-transfer-process_c5f8e409-c8e3-4e0a-b736-6d1d93d0f2bc). Cours évolutif ; parcours avancé introduit en S/4HANA 2022. Passage primaire consulté le 19 septembre 2026 : Advanced Intercompany Sales Processing : commandes SO2, PO3 et SO4 ; propagation des changements. Libellé natif : Advanced Intercompany Sales Processing ; processus produit, pas capacité native. Second appui distinct pour BHV069 (CMP186), à la place du doublon documentaire détecté lors du contrôle. ELM314 conserve la relecture de la première source Microsoft ; il ne compte pas comme un deuxième document. Reformulation et limites dans additions.yaml ; aucune règle comptable ou automatisation importée.


### ELM323

U472 — MKT02, communauté ArchiMate hébergée par The Open Group, [ArchiMate 101: A Practical Introduction](https://archimate-community.pages.opengroup.org/workgroups/archimate-101/), sections External behavior: Service et Business Layer Elements, consultées le 19 septembre 2026. Tutoriel communautaire sans édition indiquée, non spécification normative. Il présente le service comme un comportement exposé. Aucun univers FLOW ni regroupement Commerce prescrit. Synthèse sélective ; chapitre normatif tenté mais inaccessible derrière authentification.

### ELM324

U472 — MKT14, Microsoft Dynamics 365 Customer Service, [Overview of case management](https://learn.microsoft.com/en-gb/dynamics365/customer-service/administer/overview-cases), introduction et composant Cases, page mise à jour le 8 mai 2026, consultée le 19 septembre 2026. Le Case suit le traitement d’une situation client jusqu’à sa résolution. Objet produit, pas taxonomie d’univers. Appui partiel pour TER064, dont le sens FLOW demeure plus large que le service client ; aucune solution adoptée. Synthèse originale et lien.

### ELM325

U474/U475 — MKT55, Zacharia, Sanders et Nix, *The Emerging Role of the Third-Party Logistics Provider (3PL) as an Orchestrator*, 2011, Journal of Business Logistics 32(1), 40–54, DOI 10.1111/j.2158-1592.2011.01004.x. [Article primaire](https://bpb-us-w2.wpmucdn.com/wordpress.lehigh.edu/dist/e/653/files/2018/01/Zacharia-JBL-3PL-Orchestrator-Role-2011-27dqkbl.pdf), introduction p. 40, modèle p. 45, exemples p. 48–49 et limites p. 50 consultés le 19 septembre 2026. Libellé natif : Orchestrator ; nature : rôle étudié d’un prestataire logistique. Reformulation : faciliter la coopération d’entreprises par la coordination et l’information partagée. L’étude empirique concerne un seul prestataire spécialisé transport ; aucune définition scientifique universelle ni équivalence à l’univers FLOW déduite. CMP188.

### ELM326

U474/U475 — MKT56, ASCM, [SCOR Digital Standard](https://www.ascm.org/corporate-solutions/standards-tools/scor-ds/), page sans numéro d’édition affiché, définition Orchestrate et contexte des autres processus, texte primaire restitué par l’index de recherche le 19 septembre 2026. Libellé natif : Orchestrate ; nature : processus de référence. Reformulation : intégrer la stratégie Supply, les règles, risques, ressources et performance de la chaîne. L’ouverture directe renvoie 403 ; constat limité aux définitions restituées, sans audit du standard complet ni conformité revendiquée. Ce périmètre diffère de la coordination des commandes, stocks, engagements et prestations dans FLOW. CMP188.

Complément documentaire U475 à ELM294 (MKT20) : [Oracle 26B — Overview of Supply Chain Orchestration](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fauco/overview-of-supply-orchestration.html), passage Automate Change Management consulté le 19 septembre 2026. L’exemple réduit de 100 à 75 unités la quantité que le fournisseur peut livrer ; recherche d’une autre source pour 25, puis signalement d’un écart en l’absence de solution. Reformulation attribuée dans l’exemple de Sources d’inspiration, distincte de sa lecture FLOW et de tout constat Beaumanoir.


### ELM327

U477 — MKT61. [Extensions to the Guaranteed Service Model for Industrial Applications of Multi-Echelon Inventory Optimization](https://arxiv.org/abs/2306.10961). Édition(s) consultée(s) : Prépublication du 19 juin 2023. Consultation du 19 septembre 2026. Éléments natifs : Multi-echelon inventory optimization. Passages : Résumé des auteurs.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Résumé primaire seul consulté ; aucune reproduction de l’algorithme ni transférabilité quantitative au textile affirmée.


### ELM328

U477 — MKT27. [Smart Disposition](https://blueyonder.com/solutions/returns-management/smart-disposition). Édition(s) consultée(s) : Page solution sans édition affichée. Consultation du 19 septembre 2026. Éléments natifs : Smart Disposition. Passages : Intelligent routing ; Configure and enforce policy ; Recover revenue.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Page commerciale de l’éditeur ; ne livre pas l’algorithme et inclut aussi remboursement et admissibilité hors périmètre FLOW.


### ELM329

U477 — MKT36. [Process Observability & AI Agent Monitoring](https://camunda.com/platform/observability/). Édition(s) consultée(s) : Page web évolutive. Consultation du 19 septembre 2026. Éléments natifs : Process observability. Passages : Observability for orchestration ; Real-time runtime visibility.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Présentation produit ; capacités de reprise et fonctions IA ne sont pas importées dans le comportement de suivi FLOW.


### ELM330

U477 — MKT36. [The Process Orchestration Handbook](https://camunda.com/process-orchestration/). Édition(s) consultée(s) : Guide web évolutif. Consultation du 19 septembre 2026. Éléments natifs : Exception handling ; Process orchestration ; Service task / Human task ; Task execution. Passages : What is process orchestration? ; Processes with diverse endpoints ; Complexity.

Reformulations, relations et limites à la maille des 6 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM331

U477 — MKT41. [SCM Definitions and Glossary of Terms](https://cscmp.org/CSCMP/Educate/SCM_Definitions_and_Glossary_of_Terms.aspx). Édition(s) consultée(s) : Page web sans édition affichée. Consultation du 19 septembre 2026. Éléments natifs : Supply Chain Management. Passages : Definitions ; Boundaries and Relationships.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM332

U477 — MKT64. [Fulfillment by Amazon (FBA) Reports](https://developer-docs.amazon/sp-api/docs/report-type-values-fba). Édition(s) consultée(s) : Documentation en ligne consultée le 2026-09-19. Consultation du 19 septembre 2026. Éléments natifs : Inventory Ledger Report. Passages : Inventory Ledger Report — Summary View / Detailed View.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Rapports du réseau Amazon ; ne définit ni une capacité FLOW ni un registre comptable universel.


### ELM333

U477 — MKT58. [Business capabilities](https://dns.govt.nz/standards-and-guidance/technology-and-architecture/government-enterprise-architecture/gea-nz-framework/business-capabilities). Édition(s) consultée(s) : Page institutionnelle évolutive, édition non indiquée. Consultation du 19 septembre 2026. Éléments natifs : Business / organisational capability ; Capability implementation ; Categorised capabilities. Passages : Definition ; Principles 1–4 ; exemple Pay staff.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP192). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Cadre propre aux administrations néo-zélandaises ; le vocabulaire organisationnel et les taxonomies ne sont pas transposés à FLOW.


### ELM334

U477 — MKT62. [Inventory overview](https://docs.commercetools.com/api/inventory-overview). Édition(s) consultée(s) : Documentation en ligne sans édition affichée. Consultation du 19 septembre 2026. Éléments natifs : ReserveOnCart / ReserveOnOrder. Passages : Inventory modes ; Reservations ; expiration ; Release a reservation.

Reformulations, relations et limites à la maille des 5 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Modes d’un moteur de commerce ; ne démontre pas un calcul autonome de politique selon le risque.


### ELM335

U477 — MKT65. [Commingling purchase orders](https://docs.infor.com/ln/10.7/en-us/lnolh/help/td/onlinemanual/000321.html). Édition(s) consultée(s) : Infor LN 10.7. Consultation du 19 septembre 2026. Éléments natifs : Commingling. Passages : Commingling purchase orders ; Conditions ; Results.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM336

U477 — MKT54. [Universal Business Language Version 2.4](https://docs.oasis-open.org/ubl/UBL-2.4.html). Édition(s) consultée(s) : OASIS Standard 2.4, 2024 ; UBL 2.4. Consultation du 19 septembre 2026. Éléments natifs : Despatch Advice / Receipt Advice ; Order ; Order / response ; Order Response ; Order document ; Receipt Advice. Passages : 3.2.47 Order ; 3.2.48 Order Cancellation ; 3.2.49 Order Change ; 3.2.50 Order Response ; §2.3.5.1.1–2.3.5.1.4 Fulfilment ; surtout Receipt Advice Business Rules.

Reformulations, relations et limites à la maille des 6 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP192, CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Standard de documents d’échange ; les exemples ne définissent ni tous les documents ni la convention obligatoire fait-document de FLOW. ; Standard d’échange documentaire ; ne normalise ni toutes les responsabilités FLOW ni les termes français locaux.


### ELM337

U477 — MKT20. [Promising and Reserving Inventory](https://docs.oracle.com/cd/E13228_01/fscm9pbr0/eng/psbooks/sinv/htm/sinv18.htm). Édition(s) consultée(s) : PeopleSoft Enterprise Inventory 9.0 ; PeopleSoft FSCM 9.0. Consultation du 19 septembre 2026. Éléments natifs : Cumulative ATP ; Cumulative ATP demand ; Inventory priority rank ; Priority rank ; Promise stock ; Soft reservation / Reservation lead days. Passages : Soft Reserve Items ; reservation lead days ; pegged supply ; Understanding Inventory Reservations ; Understanding the Order Line Processing Sequence ; Calculating ATP.

Reformulations, relations et limites à la maille des 11 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190, CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation d’une version historique de PeopleSoft ; les termes ATP reservation et Release ont des sens propres au produit. ; Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM338

U477 — MKT20. [Service Planning Concepts](https://docs.oracle.com/cd/E18727-01/doc.121/e13338/T515331T515340.htm). Édition(s) consultée(s) : Oracle E-Business Suite 12.1. Consultation du 19 septembre 2026. Éléments natifs : Repair return. Passages : Repair Return Pull ; Repair Return Push ; Repair delays.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Source de planification des pièces ; ne démontre pas à elle seule le suivi opérationnel de chaque bien sérialisé.


### ELM339

U477 — MKT20. [Consuming Material](https://docs.oracle.com/cd/E26401_01/doc.122/e48822/T260819T260824.htm). Édition(s) consultée(s) : E-Business Suite 12.2. Consultation du 19 septembre 2026. Éléments natifs : Consumption / Aging Based Ownership Transfer. Passages : Transferring Ownership ; Aging Based Ownership Transfer.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM340

U477 — MKT20. [Mobile Materials Management](https://docs.oracle.com/cd/E26401_01/doc.122/e48826/T256582T257763.htm). Édition(s) consultée(s) : E-Business Suite 12.2. Consultation du 19 septembre 2026. Éléments natifs : Physical inventory / Cycle counting. Passages : Counting ; Cycle Counting ; Physical Inventory.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM341

U477 — MKT20. [Task Management — Opportunistic Cycle Counting](https://docs.oracle.com/cd/E26401_01/doc.122/e48830/T211976T430466.htm). Édition(s) consultée(s) : E-Business Suite 12.2. Consultation du 19 septembre 2026. Éléments natifs : Opportunistic cycle counting. Passages : Opportunistic Cycle Counting.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM342

U477 — MKT20. [Order Management Implementation Manual — Scheduling](https://docs.oracle.com/cd/E26401_01/doc.122/e48842/T373258T377249.htm). Édition(s) consultée(s) : E-Business Suite 12.2. Consultation du 19 septembre 2026. Éléments natifs : Reservation Time Fence. Passages : Reservation Time Fence ; Reserve Orders ; Unreserving.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM343

U477 — MKT20. [Purchase Orders](https://docs.oracle.com/cd/E26401_01/doc.122/e48931/T446883T443953.htm). Édition(s) consultée(s) : Oracle E-Business Suite 12.2. Consultation du 19 septembre 2026. Éléments natifs : Planned Purchase Order ; Standard purchase order. Passages : Standard Purchase Orders ; Planned Purchase Orders ; Scheduled Releases ; Shipments.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM344

U477 — MKT20. [Customer Import](https://docs.oracle.com/en/cloud/saas/financials/25d/oefbf/customerimport-3032.html). Édition(s) consultée(s) : 25D. Consultation du 19 septembre 2026. Éléments natifs : Trading Community Data Import. Passages : File Links ; Import Trading Community Data in Bulk.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM345

U477 — MKT20. [What’s the difference between a purchase order, a purchase agreement, and a contract agreement?](https://docs.oracle.com/en/cloud/saas/procurement/26a/oaprc/Chunk145966296.html). Édition(s) consultée(s) : Oracle Fusion Cloud Procurement 26A. Consultation du 19 septembre 2026. Éléments natifs : Purchase order. Passages : Purchase Order ; Blanket Purchase Agreement ; Contract Purchase Agreement.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM346

U477 — MKT20. [Return to Supplier for Credit Only](https://docs.oracle.com/en/cloud/saas/readiness/scm/25a/inv25a/25A-inventory-wn-f35542.htm). Édition(s) consultée(s) : Oracle Cloud Readiness 25A. Consultation du 19 septembre 2026. Éléments natifs : Return for credit only. Passages : Business Benefits ; Steps to Enable ; Tips and Considerations.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM347

U477 — MKT20. [Create and Monitor Agreements in Oracle Fusion Purchasing](https://docs.oracle.com/en/cloud/saas/sales/fasca/create-and-monitor-agreements-in-oracle-fusion-purchasing.html). Édition(s) consultée(s) : Documentation évolutive sans édition affichée. Consultation du 19 septembre 2026. Éléments natifs : Contract / Purchasing agreement ; Import Purchasing Agreements. Passages : Track Purchasing Activity ; Import Blanket Agreements ; Import Contract Agreements.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM348

U477 — MKT20. [Manage Repair Orders from the Depot Repair Page](https://docs.oracle.com/en/cloud/saas/service-logistics/26b/fasul/manage-repair-orders-from-the-depot-repair-page.html). Édition(s) consultée(s) : Oracle Fusion Cloud Service Logistics 26B. Consultation du 19 septembre 2026. Éléments natifs : Depot repair. Passages : Create repair work orders ; Return to customer ; Serialized assets.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM349

U477 — MKT20. [Reservations](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/famml/reservations.html). Édition(s) consultée(s) : 25C. Consultation du 19 septembre 2026. Éléments natifs : Reservation. Passages : Reservation types ; Supply and demand source types.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM350

U477 — MKT20. [Check Availability](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fascp/check-availability.html). Édition(s) consultée(s) : Oracle Fusion Cloud SCM 25C. Consultation du 19 septembre 2026. Éléments natifs : Availability result ; Check Availability ; Commit a promising result ; Promising result ; Schedule an availability result ; Schedule the order line ; Scheduled ship and arrival dates. Passages : Examine the Attributes ; Schedule the Order Line.

Reformulations, relations et limites à la maille des 8 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Passage primaire consulté ; périmètre du produit documenté, sans preuve d’installation chez Beaumanoir.


### ELM351

U477 — MKT20. [Database Promising](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fascp/overview-of-database-centric-order-promising.html). Édition(s) consultée(s) : Oracle Fusion Cloud SCM 25C. Consultation du 19 septembre 2026. Éléments natifs : Postprocessing lead time. Passages : Back-to-Back ; Bill of Resources ; Profitable to Promise ; Consume Transfers at the Same Time.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM352

U477 — MKT20. [Overview of Global Order Promising](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fascp/overview-of-global-order-promising.html). Édition(s) consultée(s) : 25C ; Oracle Fusion Cloud SCM 25C. Consultation du 19 septembre 2026. Éléments natifs : Create new supply with CTP ; Fulfillment locations ; Global Order Promising ; Split order line ; Supply sources. Passages : Introduction ; Principles 2 and 6 ; Introduction ; Principles of Promising ; Examples.

Reformulations, relations et limites à la maille des 5 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191, CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir. ; Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM353

U477 — MKT20. [Order Management Statuses](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fauom/order-management-statuses.html). Édition(s) consultée(s) : Oracle Fusion Cloud SCM 25C. Consultation du 19 septembre 2026. Éléments natifs : Order management status. Passages : Order ; Order line ; Fulfillment line ; Task ; Orchestration process.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM354

U477 — MKT20. [Consigned Inventory](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faims/consigned-inventory.html). Édition(s) consultée(s) : Oracle Fusion Cloud SCM 25D. Consultation du 19 septembre 2026. Éléments natifs : Consignment order. Passages : Consignment agreements ; Orders ; Consumption advice.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM355

U477 — MKT20. [Examples of Consigned Inventory Returns](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/famml/examples-of-consigned-inventory-returns.html). Édition(s) consultée(s) : 25D. Consultation du 19 septembre 2026. Éléments natifs : Consigned inventory return. Passages : Material received ; Material consumed ; Transfer to Consigned.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM356

U477 — MKT20. [How You Review Item Supply and Demand](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/famml/how-you-review-item-supply-and-demand.html). Édition(s) consultée(s) : 25D. Consultation du 19 septembre 2026. Éléments natifs : Item supply and demand. Passages : Quantities to Include ; Supply Types ; Demand Types.

Reformulations, relations et limites à la maille des 6 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM357

U477 — MKT20. [Key Actions on Orders](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faubm/key-actions-on-orders.html). Édition(s) consultée(s) : Oracle Fusion Cloud SCM 25D. Consultation du 19 septembre 2026. Éléments natifs : Current commit ; Enforce Current Commit simulation ; Interactive backlog planning ; Planned values. Passages : Plan Run Actions ; Review Actions ; Attribute Data Simulation Actions ; Release Actions.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM358

U477 — MKT20. [Guidelines for Managing Shipment Sets](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/faiom/guidelines-for-managing-shipment-sets.html). Édition(s) consultée(s) : Oracle Fusion Cloud SCM 26A. Consultation du 19 septembre 2026. Éléments natifs : Shipment set. Passages : Shipment set attributes ; Shippable and nonshippable lines.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM359

U477 — MKT20. [Consigned Inventory Aging](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/famml/consigned-inventory-aging.html). Édition(s) consultée(s) : 26A. Consultation du 19 septembre 2026. Éléments natifs : Consigned inventory aging. Passages : Aging Process ; Aging period ; Transfer to Owned.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM360

U477 — MKT20. [Overview of Item Batches](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/fapim/overview-of-item-batches.html). Édition(s) consultée(s) : 26A. Consultation du 19 septembre 2026. Éléments natifs : Item / Item batch ; Item batch ; Item import ; Item master data. Passages : Overview of Item Batches.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM361

U477 — MKT20. [Keep Global Order Promising and Inventory Management Synchronized](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/fascp/keep-availability-in-global-order-promising-and-inventory-management-synchronized.html). Édition(s) consultée(s) : Oracle Fusion Cloud SCM 26A. Consultation du 19 septembre 2026. Éléments natifs : Future available-to-promise supply ; Item availability / on-hand availability. Passages : Back-to-Back Orders ; Set up Your Material Status and Subinventory.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Passage primaire consulté ; périmètre du produit documenté, sans preuve d’installation chez Beaumanoir.


### ELM362

U477 — MKT20. [Ship Order Lines in Shipment Sets](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/fauom/ship-order-lines-in-shipment-sets.html#s20054853). Édition(s) consultée(s) : Oracle Fusion Cloud SCM 26A. Consultation du 19 septembre 2026. Éléments natifs : Shipment set. Passages : Shipment sets ; Examples ; Guidelines.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM363

U477 — MKT20. [Start Backlog Planning](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faspc/start-backlog-planning.html). Édition(s) consultée(s) : Oracle Fusion Cloud SCM 26B. Consultation du 19 septembre 2026. Éléments natifs : Backlog Management ; Backlog plan. Passages : Introduction ; When to Use.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM364

U477 — MKT20. [Use Supply Chain Orchestration in Your Back-to-Back Flows](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fauco/how-orchestration-processes-back-to-back-flows.html). Édition(s) consultée(s) : Oracle Fusion Cloud SCM 26B. Consultation du 19 septembre 2026. Éléments natifs : Back-to-back flow ; Contract manufacturing ; Returned stock. Passages : Buy ; Transfer ; Return Sales Orders ; Contract Manufacturing.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM365

U477 — MKT20. [Overview of Supply Chain Orchestration](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fauco/overview-of-supply-orchestration.html). Édition(s) consultée(s) : Oracle Fusion Cloud SCM 26B. Consultation du 19 septembre 2026. Éléments natifs : Drop ship sales fulfillment ; Drop ship supply ; Supply order ; Supply request. Passages : Supply requests ; Supply orders ; Drop Ship ; Changes.

Reformulations, relations et limites à la maille des 6 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM366

U477 — MKT20. [Cancel Sales Orders](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fauom/cancel-sales-orders.html). Édition(s) consultée(s) : Oracle Fusion Cloud SCM 26B. Consultation du 19 septembre 2026. Éléments natifs : Order cancellation. Passages : Cancel an order ; Partially shipped lines ; Closed orders.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM367

U477 — MKT20. [Fulfillment Line Splits](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fauom/fulfillment-line-splits.html). Édition(s) consultée(s) : Oracle Fusion Cloud SCM 26B. Consultation du 19 septembre 2026. Éléments natifs : Fulfillment line split. Passages : Split manually ; Split automatically ; Examples.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM368

U477 — MKT20. [Hold Your Sales Orders](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fauom/sales-order-hold.html). Édition(s) consultée(s) : Oracle Fusion Cloud SCM 26B. Consultation du 19 septembre 2026. Éléments natifs : Task hold. Passages : Hold tasks ; Multiple holds ; Release a hold.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM369

U477 — MKT20. [Overview of Inventory Rebalancing](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faurp/overview-of-inventory-rebalancing.html). Édition(s) consultée(s) : 26B ; Oracle Fusion Cloud SCM 26B. Consultation du 19 septembre 2026. Éléments natifs : Inventory rebalancing. Passages : Introduction ; Planned orders ; Release ; Salient Features ; sweep location ; Additional Points.

Reformulations, relations et limites à la maille des 5 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190, CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir. ; Recommandations Oracle calculées à la date initiale du plan ; aucune évaluation temporelle continue n’est revendiquée.


### ELM370

U477 — MKT20. [Overview of Simulations for Replenishment Plans](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faurp/overview-of-simulations-for-replenishment-plans.html). Édition(s) consultée(s) : 26B. Consultation du 19 septembre 2026. Éléments natifs : What-if simulation. Passages : Types of simulations ; policy values ; supply and demand.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM371

U477 — MKT20. [Policy Assignment Sets](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faurp/policy-assignment-sets.html). Édition(s) consultée(s) : 26B. Consultation du 19 septembre 2026. Éléments natifs : Replenishment policy. Passages : Policy Parameters — fixed cycle, min-max, ROP/EOQ, PAR.

Reformulations, relations et limites à la maille des 6 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM372

U477 — MKT20. [Create Alternative Fulfillment Scenarios to Reduce Cost](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26c/fascp/create-alternative-fulfillment-scenarios-to-reduce-cost.html). Édition(s) consultée(s) : Oracle Fusion Cloud SCM 26C. Consultation du 19 septembre 2026. Éléments natifs : Profitable to Promise ; Profitable to promise ; Select an alternative fulfillment scenario. Passages : Prioritize ; Promise According to Arrival Date ; exemple Denver/Seattle.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM373

U477 — MKT59. [CloudEvents Specification](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md). Édition(s) consultée(s) : Version 1.0.2. Consultation du 19 septembre 2026. Éléments natifs : Event / Occurrence. Passages : Terminology : Occurrence, Event, Producer, Consumer.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP192). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Spécification d’interopérabilité des messages ; ni contrat métier exhaustif ni protocole imposé pour FLOW.


### ELM374

U477 — MKT01. [Business Capabilities](https://governance.foundation/assets/frameworks/togaf/g189%20-%20Business%20Capbility.pdf). Édition(s) consultée(s) : Guide G189, 2018. Consultation du 19 septembre 2026. Éléments natifs : Business capability ; Capability components ; Organizational function ; Processes enabling a capability ; Stratification / leveling. Passages : §2.1–2.3 ; §3.1.1 ; §3.2 ; §4.2.1.

Reformulations, relations et limites à la maille des 5 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP192). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Publication originale The Open Group consultée dans une copie hébergée par Governance Foundation, couverture et copyright vérifiés. Guide de méthode de 2018 ; aucune adoption de toute sa hiérarchie par FLOW.


### ELM375

U477 — MKT60. [Solution specifications](https://help.nextail.co/en/solution-specifications). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026 ; Page en ligne sans édition affichée. Consultation du 19 septembre 2026. Éléments natifs : First Allocation ; First Allocation / Replenishment / Store Transfers ; Replenishment ; Store Transfers. Passages : First Allocation ; Replenishment ; Store Transfers.

Reformulations, relations et limites à la maille des 7 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190, CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Description fonctionnelle de l’éditeur ; ne donne pas les algorithmes ni les gains d’un déploiement FLOW. ; Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM376

U477 — MKT24. [Using Order-Based Planning with Flexible Master Data](https://help.sap.com/doc/99c15843d16f46beba19fb8ed09169ab/2505/en-US/0adce9e356974d9790cae131bbedee30.pdf). Édition(s) consultée(s) : SAP IBP 2505 ; document 1.4, 2025-07-04. Consultation du 19 septembre 2026. Éléments natifs : Days of Supply / Target Days of Supply. Passages : Pages 58–60 ; Stock and Buffer Stock Key Figures ; Days of Supply.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Passages ciblés du guide consultés ; les conventions SAP de calendrier et de demande ne sont pas une formule universelle FLOW.


### ELM377

U477 — MKT13. [Business Overview](https://help.sap.com/docs/CARAB/00197153997746b4bec2020d00e66ea9/e99798c39a3f4956bd5ce509b39382f7.html?locale=en-US&state=PRODUCTION&version=5.0.2). Édition(s) consultée(s) : 5.0 FPS02. Consultation du 19 septembre 2026. Éléments natifs : In-Season Fill-In. Passages : Business Scenarios : Initial Allocation ; In-Season Fill-In.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Passage primaire indexé consulté ; ouverture SAP Help non exploitable. Aucune formule de seuil Beaumanoir déduite.


### ELM378

U477 — MKT13. [Backorder Processing — Reassignment](https://help.sap.com/docs/PRODUCT_ID/f132c385e0234fe68ae9ff35b2da178c/6b8eb017a1d1431abde00056a249f72b.html). Édition(s) consultée(s) : SAP S/4HANA 2025 FPS01 (février 2026). Consultation du 19 septembre 2026. Éléments natifs : Assignment without Reassignment ; Reassignment. Passages : Reassignment ; Handling of BOP Confirmation Strategies.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM379

U477 — MKT16. [Steps in Order Allocation Run](https://help.sap.com/docs/SAP_ERP_SPV/f48e74ad3b3740bc8c9eaade394a3c1e/3d1df055aa2a6d55e10000000a4450e5.html). Édition(s) consultée(s) : 6.0 EHP8 SP25. Consultation du 19 septembre 2026. Éléments natifs : Spread logic. Passages : Requirement Grouping ; Allocation ; Release Rules.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Passage primaire indexé consulté par le lot Promising ; page directe sans texte exploitable. Pas de généralisation à toute édition aATP.


### ELM380

U477 — MKT16. [Requirement Grouping](https://help.sap.com/docs/SAP_FASHION_MANAGEMENT/3d09d3032a1649f4abf6eea0a8f3ed11/b9262a5341b1e578e10000000a441470.html). Édition(s) consultée(s) : 1.0 SP13. Consultation du 19 septembre 2026. Éléments natifs : Requirement grouping. Passages : Requirement Grouping ; exemple sold-to party.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Passage primaire indexé consulté par le lot Promising ; deux documents SAP ne prouvent pas un consensus interéditeurs.


### ELM381

U477 — MKT13. [Supply Assignment Run Workflow using Apps](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f132c385e0234fe68ae9ff35b2da178c/863bbfb47d384f6aafff5347fb7e3dba.html). Édition(s) consultée(s) : SAP S/4HANA 2025 FPS01 (février 2026). Consultation du 19 septembre 2026. Éléments natifs : Compare simulated assignment runs ; Executed and simulated assignment runs. Passages : Monitor Supply Assignment Runs ; Compare Supply Assignment Simulated Runs.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Passage primaire consulté ; périmètre du produit documenté, sans preuve d’installation chez Beaumanoir.


### ELM382

U477 — MKT13. [Supply Assignment (ARun)](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f132c385e0234fe68ae9ff35b2da178c/d335e3418f4348ffbae9f11888a62cc7.html). Édition(s) consultée(s) : SAP S/4HANA 2025 FPS01 (février 2026). Consultation du 19 septembre 2026. Éléments natifs : Supply Assignment. Passages : Supply Assignment (ARun), introduction et accès.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM383

U477 — MKT13. [Integration into Other Processes](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f132c385e0234fe68ae9ff35b2da178c/e541e617043545a0bb60e5067d037046.html). Édition(s) consultée(s) : SAP S/4HANA 2025 FPS01 (février 2026). Consultation du 19 septembre 2026. Éléments natifs : Supply Protection in Product Availability Check. Passages : Product Availability Check ; Alternative-Based Confirmation.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Passage primaire consulté ; périmètre du produit documenté, sans preuve d’installation chez Beaumanoir.


### ELM384

U477 — MKT63. [Shopify Checkout](https://help.shopify.com/en/manual/checkout-settings). Édition(s) consultée(s) : Aide en ligne sans édition affichée. Consultation du 19 septembre 2026. Éléments natifs : Inventory hold at payment. Passages : Introduction — inventory checks and payment information.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM385

U477 — MKT27. [What is Blue Yonder Store Execution Inventory Management?](https://info.blueyonder.com/order-management-commerce/what-is-blue-yonder-store-execution-inventory-management). Édition(s) consultée(s) : Page web sans édition figée. Consultation du 19 septembre 2026. Éléments natifs : Store Execution Inventory Management. Passages : Mobile-Led Workflows ; Accuracy Gap.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Présentation commerciale primaire ; pas de garantie d’exactitude ou de temps réel retenue comme fait établi.


### ELM386

U477 — MKT14. [What is Azure Business Process Tracking?](https://learn.microsoft.com/en-us/azure/business-process-tracking/overview). Édition(s) consultée(s) : Mise à jour du 11 septembre 2025. Consultation du 19 septembre 2026. Éléments natifs : Business Process Tracking. Passages : Business process design and tracking ; exemple du ticket de panne électrique.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Appui sur la corrélation métier ; produit limité aux ressources Azure décrites, sans exigence d’architecture pour FLOW.


### ELM387

U477 — MKT14. [Returns Management](https://learn.microsoft.com/en-us/dynamics-gp/distribution/returnsmanagement). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : RMA scrap ; Return Material Authorization ; Return to Vendor ; Return to Vendor from customer return ; Return to Vendor — Repair and Return ; Return to Vendor — Replacement. Passages : RMA types ; RTV types ; Repair and return ; Creating an RTV from an RMA.

Reformulations, relations et limites à la maille des 7 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation d’un produit différent de Dynamics 365 ; nommage et mécanismes propres, sans équivalence de couverture supposée.


### ELM388

U477 — MKT14. [Archive documents](https://learn.microsoft.com/en-us/dynamics365/business-central/across-how-to-archive-documents). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Document archive. Passages : Archive sales and purchase documents ; Restore ; Retention policies.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM389

U477 — MKT14. [Design details — Balancing supply and demand](https://learn.microsoft.com/en-us/dynamics365/business-central/design-details-balancing-demand-and-supply). Édition(s) consultée(s) : Documentation évolutive. Consultation du 19 septembre 2026. Éléments natifs : Supply. Passages : Supply and demand ; Priorities on the supply side.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM390

U477 — MKT14. [Process purchase returns or cancellations](https://learn.microsoft.com/en-us/dynamics365/business-central/purchasing-how-process-purchase-returns-cancellations). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Purchase return order. Passages : Purchase return orders ; Create a replacement purchase order ; Credit memos.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM391

U477 — MKT14. [Create Commerce catalogs for B2B sites](https://learn.microsoft.com/en-us/dynamics365/commerce/catalogs-b2b-sites). Édition(s) consultée(s) : Mise à jour du 21 janvier 2026. Consultation du 19 septembre 2026. Éléments natifs : Catalog publication ; Commerce catalog. Passages : Catalog configuration ; customer hierarchies ; price groups.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM392

U477 — MKT14. [Customer orders in point of sale (POS)](https://learn.microsoft.com/en-us/dynamics365/commerce/customer-orders-overview). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Customer order. Passages : Typical scenarios ; Order fulfillment ; Editing customer orders.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM393

U477 — MKT14. [Distributed order management (DOM)](https://learn.microsoft.com/en-us/dynamics365/commerce/dom). Édition(s) consultée(s) : Documentation évolutive, mise à jour affichée le 3 juin 2026. Consultation du 19 septembre 2026. Éléments natifs : Balance conflicting fulfillment needs ; Cost-based fulfillment optimization ; Fulfillment cost objectives ; Fulfillment optimization. Passages : Introduction, objectifs et contraintes.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM394

U477 — MKT14. [DOM rules](https://learn.microsoft.com/en-us/dynamics365/commerce/dom-rules). Édition(s) consultée(s) : Documentation évolutive, mise à jour du 22 janvier 2026. Consultation du 19 septembre 2026. Éléments natifs : DOM rule ; Partial orders rule. Passages : Common attributes ; Minimum inventory rule ; Partial orders rule.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP192). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Comportements propres à DOM et à ses versions ; ils illustrent des règles, sans imposer ce solveur ni ses priorités à FLOW.


### ELM395

U477 — MKT14. [Store order fulfillment](https://learn.microsoft.com/en-us/dynamics365/commerce/order-fulfillment-overview). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Order fulfillment. Passages : Accepting orders ; Shipping orders ; Picking up orders.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM396

U477 — MKT14. [Commerce inventory management](https://learn.microsoft.com/en-us/dynamics365/commerce/work-with-store-inventory). Édition(s) consultée(s) : Mise à jour du 30 janvier 2026. Consultation du 19 septembre 2026. Éléments natifs : Store inventory operations. Passages : Purchase orders ; Transfer orders ; Stock counts ; Inventory lookup.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM397

U477 — MKT14. [Work order architecture](https://learn.microsoft.com/en-us/dynamics365/field-service/field-service-architecture). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Perform the work order ; Product Catalog / Work Order ; Product catalog / Service ; Resource requirement / Scheduling ; Service / Work performed ; Work Order ; Work Order / Resource Requirement. Passages : A work order is created ; scheduled ; performed ; reviewed and completed.

Reformulations, relations et limites à la maille des 8 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM398

U477 — MKT14. [Define service-level agreements (SLAs) for work orders](https://learn.microsoft.com/en-us/dynamics365/field-service/sla-work-orders). Édition(s) consultée(s) : Mise à jour du 30 mars 2026. Consultation du 19 septembre 2026. Éléments natifs : Service-level agreement. Passages : Introduction ; Create an SLA ; Schedule a work order to meet an SLA.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM399

U477 — MKT14. [Case management overview](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/organization-administration/cases). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Case management. Passages : Examples: City Power & Light ; Fabrikam employees.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM400

U477 — MKT14. [Global address book overview](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/organization-administration/overview-global-address-book). Édition(s) consultée(s) : Mise à jour du 18 mars 2026. Consultation du 19 septembre 2026. Éléments natifs : Party ; Party / Party role ; Party role. Passages : Party roles ; Example.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM401

U477 — MKT14. [Archive sales orders](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/sysadmin/archive-so). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Sales order archive. Passages : Prerequisites ; Long term retention ; History.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM402

U477 — MKT14. [Fulfillment and Returns Optimization provider overview](https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/fulfillment-returns-optimization). Édition(s) consultée(s) : Documentation évolutive ; édition non précisée. Consultation du 19 septembre 2026. Éléments natifs : Respect warehouse timings. Passages : Sources ; Respect warehouse timings ; Restrict partial fulfillment ; Limit number of warehouses.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM403

U477 — MKT14. [Intelligent Fulfillment Optimization architecture](https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/ifo-arch). Édition(s) consultée(s) : Documentation évolutive, mise à jour affichée le 30 janvier 2026. Consultation du 19 septembre 2026. Éléments natifs : Fulfillment plan ; Fulfillment sources. Passages : Fulfillment sources ; Business constraints ; Fulfillment strategies ; Fulfillment optimization in order orchestration flows.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM404

U477 — MKT14. [Integrate transfer orders](https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/integrate-transfer-orders). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Transfer order. Passages : Transfer order information ; Inbound and outbound transfer orders.

Reformulations, relations et limites à la maille des 5 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM405

U477 — MKT14. [Intelligent Order Management overview](https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/overview). Édition(s) consultée(s) : Mise à jour du 30 janvier 2026. Consultation du 19 septembre 2026. Éléments natifs : Fulfillment network ; Intelligent Order Management ; Orchestration ; Order fulfillment orchestration ; Order orchestration. Passages : Orchestration ; Providers ; Fulfillment optimization.

Reformulations, relations et limites à la maille des 6 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM406

U477 — MKT14. [Set up consignment](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/consignment). Édition(s) consultée(s) : 2026-05-06 ; Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Consignment inventory ; Consignment replenishment order. Passages : Consignment replenishment orders ; Ownership change journals ; Overview ; Inventory ownership change journal.

Reformulations, relations et limites à la maille des 8 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190, CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir. ; Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM407

U477 — MKT14. [Inventory journals](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-journals). Édition(s) consultée(s) : 2025-08-29. Consultation du 19 septembre 2026. Éléments natifs : Inventory journals. Passages : Types of inventory journals ; Transfer ; Counting.

Reformulations, relations et limites à la maille des 5 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM408

U477 — MKT14. [Inventory on-hand list](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-on-hand-list). Édition(s) consultée(s) : 2026-06-15. Consultation du 19 septembre 2026. Éléments natifs : On-hand inventory. Passages : Query your on-hand inventory ; tableau des quantités ; Examples.

Reformulations, relations et limites à la maille des 7 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM409

U477 — MKT14. [Inventory statuses](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-statuses). Édition(s) consultée(s) : 2026-07-01. Consultation du 19 septembre 2026. Éléments natifs : Inventory status. Passages : Set up and use inventory statuses.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM410

U477 — MKT14. [Inventory Visibility inventory allocation](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-allocation). Édition(s) consultée(s) : Documentation en ligne sans édition affichée. Consultation du 19 septembre 2026. Éléments natifs : Inventory allocation. Passages : Business background and purpose ; virtual pool ; Terminology.

Reformulations, relations et limites à la maille des 11 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM411

U477 — MKT14. [Inventory Visibility reservations](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-reservations). Édition(s) consultée(s) : Documentation en ligne ; SCM 10.0.33+ pour les sales orders. Consultation du 19 septembre 2026. Éléments natifs : Soft reservation. Passages : Sample use case for soft reservation ; offsets.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM412

U477 — MKT14. [Reserve inventory quantities](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/reserve-inventory-quantities). Édition(s) consultée(s) : 2025-08-29. Consultation du 19 septembre 2026. Éléments natifs : Inventory reservation policies. Passages : Reasons for reserving ; reservation policies ; production parameters.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM413

U477 — MKT14. [Action messages](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/action-messages). Édition(s) consultée(s) : Documentation en ligne consultée le 2026-09-19. Consultation du 19 septembre 2026. Éléments natifs : Action messages. Passages : Action types ; Increase and decrease ; safety stock.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM414

U477 — MKT14. [Coverage settings](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/coverage-settings). Édition(s) consultée(s) : 2026-03-25. Consultation du 19 septembre 2026. Éléments natifs : Requirement / Period / Min-Max. Passages : Coverage codes.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM415

U477 — MKT14. [Master plans](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/master-plans). Édition(s) consultée(s) : Documentation en ligne consultée le 2026-09-19 ; Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Freeze / firming time fence ; Master plan ; Time fence settings. Passages : Freeze time fence ; Firming time fence ; Using master plans ; Freeze ; Action message ; positive and negative days.

Reformulations, relations et limites à la maille des 9 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190, CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir. ; Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM416

U477 — MKT14. [Approve planned orders](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/approved-planned-order). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026 ; Documentation évolutive, mise à jour affichée le 2 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Approved for firming ; Approved planned order. Passages : View and edit status ; Approve planned orders ; View and edit the status of planned orders ; Approve planned orders.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189, CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit. ; Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM417

U477 — MKT14. [Calculate delivery dates using CTP](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/calculate-delivery-dates-using-ctp). Édition(s) consultée(s) : Documentation évolutive, mise à jour affichée le 27 juillet 2026. Consultation du 19 septembre 2026. Éléments natifs : CTP material and capacity check ; Capable-to-promise. Passages : How CTP compares to ATP ; exemple Item A composé de B et C ; View confirmed delivery dates.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM418

U477 — MKT14. [Keep supply for confirmed demand](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/keep-supply-for-confirmed-demand). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026 ; Prérequis documenté : 10.0.48 build 10.0.2645.33 ou ultérieur. Consultation du 19 septembre 2026. Éléments natifs : Customer commitments ; Keep supply for confirmed demand ; Peg demand to supply ; Pegging for confirmed demand ; Pegging information ; Preservation of pegged supply ; Reallocate received inventory. Passages : What data is preserved ; Confirmed demand ; Examples ; What data is preserved ; Control how on-hand inventory is pegged ; Example scenario 1.

Reformulations, relations et limites à la maille des 8 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189, CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit. ; Fonction conditionnée à la version et à la configuration documentées ; n’établit pas un gel universel de tous les champs.


### ELM419

U477 — MKT14. [Firm planned orders](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/planned-order-firming). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Planned order firming ; Planned purchase order. Passages : Manual firming ; Automatic firming ; Grouping.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM420

U477 — MKT14. [Replenishment methods and quantity modification](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/replenishment-methods-quantity-modification). Édition(s) consultée(s) : 2026-07-01. Consultation du 19 septembre 2026. Éléments natifs : Replenishment methods. Passages : Coverage codes ; order quantity ; examples 1–3.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM421

U477 — MKT14. [Use the safety stock journal to update minimum coverage for items](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/safety-stock-journal). Édition(s) consultée(s) : 2025-08-22. Consultation du 19 septembre 2026. Éléments natifs : Safety stock calculation. Passages : Calculate minimum coverage ; Calculate a proposal ; Update minimum.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM422

U477 — MKT14. [Safety stock fulfillment for items](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/safety-stock-replenishment). Édition(s) consultée(s) : 2026-03-26 ; Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Safety stock ; Safety stock level ; Safety stock requirement. Passages : Introduction ; Example Safety stock ; Min/max coverage code ; Safety stock ; strict safety stock pegging ; minimum keys.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190, CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir. ; Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM423

U477 — MKT14. [Product information overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/pim/product-information). Édition(s) consultée(s) : Mise à jour du 1er juillet 2026. Consultation du 19 septembre 2026. Éléments natifs : Item ; Product / Product variant ; Product information ; Product master ; Product master / Product variant ; Product variant. Passages : Product definition ; Distribution, export, and import ; Product masters and product variants.

Reformulations, relations et limites à la maille des 6 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM424

U477 — MKT14. [Procurement catalogs overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/procurement-catalogs). Édition(s) consultée(s) : Mise à jour du 1er juillet 2026. Consultation du 19 septembre 2026. Éléments natifs : Catalog updates ; Procurement catalog. Passages : Set up a catalog ; publication and updates.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM425

U477 — MKT14. [Product receipt against purchase orders](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/product-receipt-against-purchase-orders). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Cancel product receipt ; Record product receipt. Passages : Preregistration ; Registration ; Product receipt ; Correction.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM426

U477 — MKT14. [Purchase agreements](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-agreements). Édition(s) consultée(s) : Mise à jour du 8 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Purchase agreement. Passages : Commitment types ; Purchase agreement fulfillment.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM427

U477 — MKT14. [Approve and confirm purchase orders](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-order-approval-confirmation). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Approval / confirmation ; Purchase order confirmation ; Request change. Passages : Approval statuses ; Confirming ; Changes ; Finalized.

Reformulations, relations et limites à la maille des 5 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM428

U477 — MKT14. [Review and accept changes to confirmed purchase orders](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-order-changes-after-confirmation). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Confirmed purchase order changes ; Review purchase order changes. Passages : Assess changes ; Review impacted demand ; Accept changes.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM429

U477 — MKT14. [Create purchase orders](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-order-creation). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Purchase order. Passages : Create a purchase order ; Purchase order lines.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM430

U477 — MKT14. [Purchase order overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-order-overview). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Purchase order. Passages : Purchase order types ; Purchase order statuses.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM431

U477 — MKT14. [Record the receipt of goods on the purchase order](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/tasks/record-receipt-goods-purchase-order). Édition(s) consultée(s) : Documentation évolutive, mise à jour du 1er juillet 2026. Consultation du 19 septembre 2026. Éléments natifs : Product receipt and receipt journal ; Product receipt journal ; Record receipt of goods. Passages : Record receipt of goods, étapes 4–7 ; Review the product receipt journal.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP192). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Exemple de réception de biens ; aucune universalité fait-document, immutabilité ou règle de correction n’en est déduite.


### ELM432

U477 — MKT14. [Vendor collaboration with external vendors](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/vendor-collaboration-work-external-vendors). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Vendor purchase order response. Passages : Purchase order responses ; Accept with changes ; Confirmation.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM433

U477 — MKT14. [Delivery alternatives](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/delivery-alternatives). Édition(s) consultée(s) : Documentation évolutive ; édition non précisée. Consultation du 19 septembre 2026. Éléments natifs : Available today / Future availability ; Delivery alternatives. Passages : Delivery date control methods ; Delivery alternatives ; Availability information.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Passage primaire consulté ; périmètre du produit documenté, sans preuve d’installation chez Beaumanoir.


### ELM434

U477 — MKT14. [Order promising](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/delivery-dates-available-promise-calculations). Édition(s) consultée(s) : Documentation évolutive, mise à jour affichée le 21 avril 2026. Consultation du 19 septembre 2026. Éléments natifs : Available-to-promise ; Available-to-promise quantity ; Order promising ; Order promising update ; Planned receipts in ATP. Passages : Order promising ; ATP calculations ; Example ; CTP calculations.

Reformulations, relations et limites à la maille des 6 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM435

U477 — MKT14. [Delivery schedules](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/delivery-schedules). Édition(s) consultée(s) : Documentation évolutive ; édition non précisée ; Documentation évolutive consultée le 19 septembre 2026 ; Mise à jour du 7 mai 2025. Consultation du 19 septembre 2026. Éléments natifs : Delivery schedule ; Delivery schedule / Delivery line ; Delivery schedules. Passages : Create delivery schedules ; Manage delivery lines ; Example ; Create delivery schedules ; exemple 600 chairs ; Introduction ; Create delivery schedules ; Manage delivery lines.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189, CMP191, CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir. ; Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit. ; Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM436

U477 — MKT14. [Direct deliveries](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/direct-deliveries). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Direct delivery. Passages : Introduction ; Deliver a sales order directly ; Update delivery dates.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM437

U477 — MKT14. [Intercompany orders and return orders](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/intercompany-orders-and-return-orders). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Intercompany order. Passages : Introduction ; two-legged and three-legged intercompany order chains.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM438

U477 — MKT14. [Specify how to dispose of returned items](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/specify-how-to-dispose-of-returned-items). Édition(s) consultée(s) : Documentation en ligne consultée le 2026-09-19 ; Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Disposition ; Return disposition ; Return to customer ; Scrap. Passages : Disposition codes ; Disposition actions ; Disposition codes and actions.

Reformulations, relations et limites à la maille des 8 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190, CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir. ; Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM439

U477 — MKT14. [Confirm sales orders](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/tasks/confirm-sales-orders). Édition(s) consultée(s) : Documentation évolutive, mise à jour affichée le 1er juillet 2026. Consultation du 19 septembre 2026. Éléments natifs : Sales order confirmation. Passages : Confirm a single sales order, étapes 5 à 15.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM440

U477 — MKT14. [Manage order holds](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/tasks/manage-order-holds). Édition(s) consultée(s) : Documentation évolutive ; Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Order hold ; Order hold / Release hold. Passages : Apply and remove order holds ; Create a hold code ; Apply ; Remove.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189, CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté par le lot Orders ; lever un empêchement ne suffit pas à prouver une autorisation de tout mouvement. ; Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM441

U477 — MKT14. [Cycle counting](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/cycle-counting). Édition(s) consultée(s) : 2025-11-20. Consultation du 19 septembre 2026. Éléments natifs : Cycle counting / Spot cycle counting. Passages : Create cycle counting work ; Spot cycle counting ; Resolve differences.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM442

U477 — MKT14. [Release to warehouse process](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/release-to-warehouse-process). Édition(s) consultée(s) : Documentation évolutive ; Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Release to warehouse. Passages : Introduction ; Manual and automatic release ; Partial release ; Release orders to warehouse.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189, CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté par le lot Orders ; appui limité au lancement logistique, sans autorisation universelle de mouvement. ; Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM443

U477 — MKT14. [Schedule workload capacity](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/schedule-workload-capacity). Édition(s) consultée(s) : Mise à jour du 7 mai 2025. Consultation du 19 septembre 2026. Éléments natifs : Workload capacity. Passages : Warehouse workload capacity ; seasonal workforce example.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM444

U477 — MKT14. [Set up warehouses for transfer orders](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/transfer-orders-warehouse). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Planned transfer order. Passages : Plan replenishment for warehouses ; Transport days.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM445

U477 — MKT14. [Exchange data between systems](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/wms-only-mode-exchange-data). Édition(s) consultée(s) : Mise à jour du 27 juillet 2026. Consultation du 19 septembre 2026. Éléments natifs : Inbound / Outbound shipment order ; Master and reference data ; Order and receipt feedback ; Product master data ; Progress data and business events ; Shipment order ; Shipment order / Receiving and shipping feedback ; Site / Warehouse ; Site / Warehouse / Location. Passages : Master and reference data ; Shipment orders ; Progress data and business events.

Reformulations, relations et limites à la maille des 11 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM446

U477 — MKT13. [Processing a Service Entry Sheet](https://learning.sap.com/courses/business-processes-in-sap-s-4hana-sourcing-and-procurement/processing-a-service-entry-sheet_e42ab0b6-291a-4dad-9f5c-7f508d21ae5c). Édition(s) consultée(s) : Cours SAP Learning ; édition non indiquée dans le passage. Consultation du 19 septembre 2026. Éléments natifs : Service entry ; Service entry approval ; Service entry sheet. Passages : Service Entry and Approval ; Create and Approve a Service Entry Sheet.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM447

U477 — MKT13. [Outlining Subcontracting](https://learning.sap.com/courses/detailing-subcontracting-and-supplier-consignment/outlining-subcontracting_af403e3e-188d-4dbb-bde1-632253739fa6). Édition(s) consultée(s) : Cours SAP Learning ; édition non indiquée dans le passage. Consultation du 19 septembre 2026. Éléments natifs : Subcontracting. Passages : Subcontracting process ; Components ; Ownership.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM448

U477 — MKT13. [Explaining aATP Product Allocation (PAL)](https://learning.sap.com/courses/exploring-fashion-functions-and-business-processes-in-sap-s-4hana-for-fashion-and-vertical-business/explaining-aatp-product-allocation-pal-_dd30c229-d63f-4aba-a950-a174280c4a58). Édition(s) consultée(s) : Cours en ligne sans édition affichée. Consultation du 19 septembre 2026. Éléments natifs : Product Allocation (PAL). Passages : PAL Concept ; Product Allocation Examples ; time series.

Reformulations, relations et limites à la maille des 9 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM449

U477 — MKT13. [Explaining Inventory Management](https://learning.sap.com/courses/exploring-fashion-functions-and-business-processes-in-sap-s-4hana-for-fashion-and-vertical-business/explaining-inventory-management_d2aad6e6-a57e-4f64-9ac0-3b27f613776a). Édition(s) consultée(s) : Cours en ligne sans édition affichée. Consultation du 19 septembre 2026. Éléments natifs : Inventory Management. Passages : Scenario ; Stock Overview ; Special stock types.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM450

U477 — MKT13. [Explaining Replenishment](https://learning.sap.com/courses/exploring-fashion-functions-and-business-processes-in-sap-s-4hana-for-fashion-and-vertical-business/explaining-replenishment_e87c10d4-3590-45a7-ad87-b04ed6e34bd7). Édition(s) consultée(s) : Cours en ligne sans édition affichée. Consultation du 19 septembre 2026. Éléments natifs : Replenishment. Passages : Scenario ; Re-Order Point and Target Stock Settings.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM451

U477 — MKT13. [Explaining Retail Allocation Management](https://learning.sap.com/courses/exploring-fashion-functions-and-business-processes-in-sap-s-4hana-for-fashion-and-vertical-business/explaining-retail-allocation-management_b6824f5b-1ad5-401c-b3f9-f32fecd254ca). Édition(s) consultée(s) : Cours en ligne sans édition affichée. Consultation du 19 septembre 2026. Éléments natifs : Retail allocation. Passages : Merchandise Distribution Concept — Scenario.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM452

U477 — MKT16. [Explaining Supply Assignment](https://learning.sap.com/courses/exploring-fashion-functions-and-business-processes-in-sap-s-4hana-for-fashion-and-vertical-business/explaining-supply-assignment_af05618d-4954-4f22-9857-3dd12e3940c4). Édition(s) consultée(s) : Cours SAP S/4HANA for Fashion and Vertical Business ; édition non précisée. Consultation du 19 septembre 2026. Éléments natifs : Assign ; Manual release ; Release check ; Supply Assignment (ARun) ; Supply-demand assignment. Passages : Supply Assignment Scenarios ; ARun Statuses ; Online Features ; Cross Settings.

Reformulations, relations et limites à la maille des 5 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM453

U477 — MKT13. [Executing a Standard Sales from Stock Process](https://learning.sap.com/courses/functions-innovations-in-sap-s-4hana-sales/executing-a-standard-sales-from-stock-process_f4aacaf6-1a5c-4f30-8d32-fd3e8e691252). Édition(s) consultée(s) : Cours SAP Learning ; édition non indiquée dans le passage. Consultation du 19 septembre 2026. Éléments natifs : Sales from stock. Passages : Sales order ; Outbound delivery ; Goods issue ; Billing.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM454

U477 — MKT13. [Executing the Advanced Intercompany Sales and Stock Transfer Process](https://learning.sap.com/courses/functions-innovations-in-sap-s-4hana-sales/executing-the-advanced-intercompany-sales-and-stock-transfer-process_c5f8e409-c8e3-4e0a-b736-6d1d93d0f2bc). Édition(s) consultée(s) : Cours SAP Learning ; édition non indiquée dans le passage. Consultation du 19 septembre 2026. Éléments natifs : Advanced intercompany sales. Passages : Classic versus advanced intercompany sales ; Process.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM455

U477 — MKT13. [Managing Customer Returns](https://learning.sap.com/courses/functions-innovations-in-sap-s-4hana-sales/managing-customer-returns_f224d287-07ad-41fe-9897-2eb2ee4b33dc). Édition(s) consultée(s) : Cours SAP Learning ; édition non indiquée dans le passage. Consultation du 19 septembre 2026. Éléments natifs : Customer returns. Passages : Customer Returns ; Refund ; In-house Repair ; Send back to customer.

Reformulations, relations et limites à la maille des 4 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM456

U477 — MKT13. [Alternative-Based Confirmation](https://learning.sap.com/courses/functions-innovations-in-sap-s-4hana-sales/using-advanced-available-to-promise-aatp-in-sap-s-4hana_ef38afd2-4730-433f-854a-613b8e4afec5). Édition(s) consultée(s) : Cours SAP S/4HANA, édition non précisée dans le passage ; Cours en ligne, édition non précisée. Consultation du 19 septembre 2026. Éléments natifs : Alternative-Based Confirmation ; aATP functions. Passages : Advanced ATP Scenario: Alternative-Based Confirmation ; Release for Delivery ; Alternative-Based Confirmation ; Backorder Processing ; Release for Delivery.

Reformulations, relations et limites à la maille des 5 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP192, CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Description de fonctions produit ; leur regroupement commercial ne définit pas une capacité FLOW ni une couverture installée. ; Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM457

U477 — MKT24. [Global (Multi-stage) Inventory Optimization](https://learning.sap.com/courses/mastering-sap-ibp-for-inventory-planning-and-optimization/global-multi-stage-inventory-optimization_c360cea7-b52e-45cb-9436-5ea0c79451a9). Édition(s) consultée(s) : Cours SAP IBP en ligne sans édition affichée. Consultation du 19 septembre 2026. Éléments natifs : Multi-stage inventory optimization. Passages : Global operator ; Multi-stage dilemma ; Interactions between stages.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités.


### ELM458

U477 — MKT13. [Exploring Backorder Processing](https://learning.sap.com/courses/optimizing-advanced-logistics-and-analytics-in-sap-s-4hana-cloud-public-edition/exploring-backorder-processing_fed6ddd5-39be-41ab-a977-e41a1c3715fe). Édition(s) consultée(s) : Cours SAP S/4HANA Cloud Public Edition ; édition non précisée. Consultation du 19 septembre 2026. Éléments natifs : Backorder Processing ; Order confirmations ; Reconfirmation ; Redistribution of confirmations ; Reprioritization ; Reprioritize requirements. Passages : Backorder Processing — Introduction, Reprioritization & Reallocation, Order Confirmations.

Reformulations, relations et limites à la maille des 8 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP191). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; aucun choix de produit ni déploiement Beaumanoir déduit.


### ELM459

U477 — MKT57. [What do you mean by Event-Driven?](https://martinfowler.com/articles/201701-event-driven.html). Édition(s) consultée(s) : 7 février 2017. Consultation du 19 septembre 2026. Éléments natifs : Event Notification. Passages : Event Notification.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP192). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Article de clarification par son auteur ; décrit plusieurs styles, sans faire de la notification un stockage du fait ni garantir sa livraison.


### ELM460

U477 — MKT57. [Bounded Context](https://martinfowler.com/bliki/BoundedContext.html). Édition(s) consultée(s) : 15 janvier 2014. Consultation du 19 septembre 2026. Éléments natifs : Bounded Context. Passages : Paragraphes sur le vocabulaire et l’exemple meter.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP192). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Retour d’auteur sur les modèles logiciels dans l’approche DDD ; document distinct d’Evans mais même école de pensée, pas preuve de consensus entre cadres.


### ELM461

U477 — MKT57. [Domain Model](https://martinfowler.com/eaaCatalog/domainModel.html). Édition(s) consultée(s) : 5 mars 2003. Consultation du 19 septembre 2026. Éléments natifs : Domain Model object. Passages : Définition et paragraphe explicatif de la fiche.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP192). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Fiche courte du patron par son auteur, pas consultation du chapitre complet ni définition normative de tout objet métier.


### ELM462

U477 — MKT60. [Merkal footwear inventory planning](https://nextail.co/customer/merkal-footwear-inventory-planning/). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026 ; Étude de cas en ligne sans édition affichée. Consultation du 19 septembre 2026. Éléments natifs : Inventory rebalancing / Consolidation ; Store transfers. Passages : End-of-season transfers ; consolidation and size availability ; Impact — store transfers ; size availability through consolidation.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190, CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Cas client publié par Nextail ; résultat rapporté, sans garantie de gain ni preuve Beaumanoir. ; Témoignage publié par le fournisseur ; mécanisme illustré, aucun résultat chiffré ni causalité indépendante retenus.


### ELM463

U477 — MKT42. [EPCIS and CBV Implementation Guideline](https://ref.gs1.org/guidelines/epcis-cbv/2.0.0/). Édition(s) consultée(s) : Release 2.0, mars 2023. Consultation du 19 septembre 2026. Éléments natifs : Visibility event. Passages : 3.3 dimensions de visibilité ; 5.9 erreurs et corrections.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Guide de standard de visibilité ; ne calcule ni position de stock ni disponibilité FLOW et n’impose aucune architecture.


### ELM464

U477 — MKT19. [TMF641 Service Ordering Management API REST Specification](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/Historic/TMF641_Service_Ordering/3.0.0/user_guides/TMF641_Service_Ordering_Management_API_user_guides_18.5.1.pdf). Édition(s) consultée(s) : Version 3.0.0, Release 18.5.0, janvier 2019. Consultation du 19 septembre 2026. Éléments natifs : RelatedParty role ; Requested / Expected / Completion date ; Requested service / Requested date ; Service Order ; Service Order Management ; Service order dependency ; Service order item / Action. Passages : Pages 5, 8–15 : Service Order ; dates ; dépendances ; états.

Reformulations, relations et limites à la maille des 8 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : PDF primaire consulté ; référence télécom historique. Les états et cardinalités TMF ne sont pas adoptés par FLOW.


### ELM465

U477 — MKT56. [SCOR DS Quick Reference Guide](https://www.ascm.org/globalassets/documents--files/corporate-transformation/scor-ds-digital-guide_final.pdf). Édition(s) consultée(s) : Guide public SCOR DS ; édition non relevée. Consultation du 19 septembre 2026. Éléments natifs : SCOR DS processes. Passages : SCOR Processes ; Level 0 and Level 1.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Extrait primaire indexé consulté ; aucune transposition de hiérarchie processus vers capacités.


### ELM466

U477 — MKT56. [What Is Logistics?](https://www.ascm.org/topics/logistics/). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Order processing and fulfillment. Passages : Order processing and fulfillment ; Outbound ; Reverse logistics.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Texte primaire indexé consulté après erreur à l’ouverture ; page logistique générale, pas définition universelle de toutes les commandes FLOW.


### ELM467

U477 — MKT17. [Domain-Driven Design Reference: Definitions and Pattern Summaries](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf). Édition(s) consultée(s) : Mars 2015. Consultation du 19 septembre 2026. Éléments natifs : Domain ; Entity / Value Object. Passages : Definitions ; Entities p.11 ; Value Objects p.12 ; Domain Events p.13 ; Services p.14.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP192). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Résumé de patrons par leur auteur, orienté conception logicielle. Les concepts éclairent le sens métier sans imposer objets de code, services ni bounded contexts au modèle FLOW.


### ELM468

U477 — MKT42. [GS1 GLN Allocation Rules Standard](https://www.gs1.org/standards/gs1-gln-allocation-rules-standard/current-standard). Édition(s) consultée(s) : Release 3.0.2, août 2022. Consultation du 19 septembre 2026. Éléments natifs : Location ; Location / Party ; Location identification ; Locations and parties ; Party ; Party / Location. Passages : §2.1 Use of GLN ; parties and locations ; exemple Dal Giardino.

Reformulations, relations et limites à la maille des 6 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Passages primaires indexés consultés ; ouverture directe bloquée (403). Pas de conformité GS1 déduite pour FLOW.


### ELM469

U477 — MKT42. [GS1 Global Traceability Standard](https://www.gs1.org/standards/gs1-global-traceability-standard/current-standard). Édition(s) consultée(s) : Release 2.0, 2017. Consultation du 19 septembre 2026. Éléments natifs : Critical Tracking Events ; Despatch advice / Receiving advice ; Instance-level identification ; Receiving / Packing / Shipping events ; Transporting / Shipping / Receiving events. Passages : Identification levels ; Data recording and sharing ; R21.

Reformulations, relations et limites à la maille des 7 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Passages primaires indexés consultés ; ouverture directe non exploitable. Les exigences GS1 ne sont pas imposées au modèle.


### ELM470

U477 — MKT42. [GS1 Logistic Label Guideline](https://www.gs1.org/standards/gs1-logistic-label-guideline/1-3). Édition(s) consultée(s) : 1.3. Consultation du 19 septembre 2026. Éléments natifs : GTIN / SSCC ; Logistic unit ; Trade item. Passages : §1.2 ; §3 ; §4.1 ; §10.5.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Passages primaires indexés consultés ; ouverture directe bloquée. Les règles d’étiquetage ne définissent pas à elles seules les objets FLOW.


### ELM471

U477 — MKT42. [GS1 System Architecture Document](https://www.gs1.org/standards/gs1-system-architecture-document/current-standard). Édition(s) consultée(s) : Page courante ; édition non vérifiée dans le passage disponible. Consultation du 19 septembre 2026. Éléments natifs : GTIN ; Logistic unit / Asset ; Master data ; Serial number / GTIN + serial ; Trade item ; Trade item / Trade item instance ; Trade item class ; Trade item instance. Passages : Table 4-1 ; Identification of objects ; Communication of business data.

Reformulations, relations et limites à la maille des 8 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Passages primaires indexés consultés ; ouverture directe bloquée (403). Pas de reprise exhaustive du standard.


### ELM472

U477 — MKT23. [What is order management?](https://www.ibm.com/think/topics/order-management). Édition(s) consultée(s) : Page web évolutive. Consultation du 19 septembre 2026. Éléments natifs : Order Management System ; Order management. Passages : What is an order management system? ; Distributed order management.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Document primaire consulté ; rapprochement de concepts, sans preuve de réalisation Beaumanoir.


### ELM473

U477 — MKT66. [Retail Optimization Gives Groupe Dynamite an Edge](https://www.logility.com/webcast/retail-optimization-gives-groupe-dynamite-an-edge/). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Initial distribution. Passages : Présentation écrite du webcast ; initial distribution and replenishment.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Présentation écrite primaire consultée ; vidéo non visionnée. Témoignage fournisseur, sans gains chiffrés ni preuve locale.


### ELM474

U477 — MKT14. [Transportation scenario – Manual rating](https://www.microsoft.com/en-us/dynamics-365/blog/business-leader/2016/02/16/transportation-charges-scenario-manual-rating-2/). Édition(s) consultée(s) : 16 février 2016. Consultation du 19 septembre 2026. Éléments natifs : Carrier and carrier service selection. Passages : Scenario ; Walkthrough étapes 1–3.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Exemple éditeur historique, limité au transport et au tarif ; pas une recommandation de produit actuel.


### ELM475

U477 — MKT10. [Case Management Model and Notation](https://www.omg.org/cmmn/). Édition(s) consultée(s) : Page de présentation CMMN consultée le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Case. Passages : What is case management ; Case file ; Human judgment.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP189). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire consultée ; périmètre du produit, sans preuve de déploiement Beaumanoir.


### ELM476

U477 — MKT10. [Business Process Model and Notation, Version 2.0.2](https://www.omg.org/spec/BPMN/2.0.2/PDF). Édition(s) consultée(s) : BPMN 2.0.2, décembre 2013. Consultation du 19 septembre 2026. Éléments natifs : Process ; Task. Passages : §10.1 Process, p.143 ; §10.3.3 Tasks, p.154 ; Manual Task p.161–163.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP192). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Standard de notation et de déroulement ; ni carte de capacités ni règle d’équivalence entre une tâche et une opération FLOW.


### ELM477

U477 — MKT52. [Semantics of Business Vocabulary and Business Rules, Version 1.5](https://www.omg.org/spec/SBVR/1.5/PDF). Édition(s) consultée(s) : SBVR 1.5, mai 2019. Consultation du 19 septembre 2026. Éléments natifs : Business rule. Passages : §16.1.2–16.1.3 p.98–100 ; §18.1.2 exemple EU-Rent p.118.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP192). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : La juridiction métier et les catégories de SBVR sont plus précises que le terme générique FLOW ; pas d’importation de son métamodèle.


### ELM478

U477 — MKT38. [Enhancing Automotive Finished Vehicle Logistics with Real Time Visibility](https://www.project44.com/blog/enhancing-automotive-finished-vehicle-logistics-with-real-time-visibility/). Édition(s) consultée(s) : 22 août 2023. Consultation du 19 septembre 2026. Éléments natifs : Transportation visibility / ETA. Passages : The Complexities of Outbound Finished Vehicle Logistics.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Présentation commerciale primaire ; bénéfices annoncés non évalués, pas de précision ou couverture uniforme déduite.


### ELM479

U477 — MKT29. [Inventory optimization: Keys to a successful strategy](https://www.relexsolutions.com/resources/inventory-optimization/). Édition(s) consultée(s) : Article daté du 12 avril 2024, état consulté le 19 septembre 2026. Consultation du 19 septembre 2026. Éléments natifs : Inventory optimization. Passages : Inventory management vs optimization ; Multi-echelon inventory optimization.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Présentation pédagogique et commerciale ; Tori est explicitement fictive et les résultats ne sont pas garantis.


### ELM480

U477 — MKT29. [The best inventory planning software: AI-powered, planner-driven](https://www.relexsolutions.com/resources/inventory-planning-software/). Édition(s) consultée(s) : Article en ligne sans édition affichée. Consultation du 19 septembre 2026. Éléments natifs : Distribution center inventory planning. Passages : Distribution center forecasts ; safety stocks ; Diagnostics.

Reformulations, relations et limites à la maille des 1 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Présentation de fonctionnalités RELEX ; pas de modèle de capacités ni méthode intégralement exposée.


### ELM481

U477 — MKT29. [Automatic Replenishment System](https://www.relexsolutions.com/solutions/automatic-replenishment-system/). Édition(s) consultée(s) : Documentation évolutive consultée le 19 septembre 2026 ; Page solution sans édition affichée ; Page web évolutive. Consultation du 19 septembre 2026. Éléments natifs : Automatic replenishment ; In-season replenishment ; Initial allocation. Passages : Manage seasons ; Sync with store space ; DC replenishment ; Manage the full cycle for seasonal items ; Manage seasons effectively ; Manage the full cycle for your seasonal items ; Manage seasons effectively.

Reformulations, relations et limites à la maille des 3 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP190, CMP189, CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Documentation primaire de produit ; aucune preuve de réalisation Beaumanoir ni équivalence de catalogue de capacités. ; Présentation commerciale consultée ; ni résultats annoncés ni mécanisme identique aux seuils FLOW établis. ; Présentation commerciale primaire ; aucune performance chiffrée ni installation locale déduite.


### ELM482

U477 — MKT19. [TMF633 Service Catalog API REST Specification R18.5.1](https://www.tmforum.org/resources/specification/tmf633-service-catalog-api-rest-specification-r18-5-0/). Édition(s) consultée(s) : Archive R18.5.1 ; notice version 4.0.1, modifiée le 8 avril 2019. Consultation du 19 septembre 2026. Éléments natifs : Service Catalog ; Service catalog. Passages : Description de la spécification.

Reformulations, relations et limites à la maille des 2 fiche(s) dans [le relevé U477](../audits/2026-09-19-sources-inspiration-U477/consulted-documents.yaml) et les deltas de lot associés (CMP193). Définition mobilisée par synthèse sélective du passage ; aucune citation intégrale ni identifiant natif inventé. Limites d’accès et de portée : Notice primaire indexée consultée ; corps de spécification non consulté. Archive historique, pas édition courante ni norme Supply.

### ELM483

MKT67 — EDM Council, *Prioritizing Data Based on Criticality*, novembre 2018 vF1.1, pages 19, 28–29 et 37. Éléments natifs : Authoritative Data Domain, Authoritative Provisioning Point, Data Domain. Le premier est employé dans la définition du deuxième ; sa définition autonome détaillée n’est pas fournie dans ce passage. Un producteur peut fournir des données appartenant à un propriétaire amont dans les conditions convenues. Consultation : 19 septembre 2026. Appui sémantique proposé pour `business-references`, sans assimilation à un domaine métier Supply. [Document primaire](https://ortecha.com/wp-content/uploads/2023/07/EDM-Council-Prioritizing-Data-Based-on-Criticality-Critical-Data-Elements-CDEs-in-Context.pdf), [comparaison et limites](../modeles/backlog/authoritative-data-review-U478.yaml), CMP194. Aucun identifiant natif de concept disponible.

### ELM484

MKT68 — Oracle, *ORA Information Management*, Release 3.1, juillet 2013, §2.3.4 et §6.3.3.4.3. Éléments natifs : Authoritative Data Domain, Consolidated Hub. Appui lexical exact et exemple d’articulation entre consolidation et sources gardant la maîtrise de leurs données. Consultation : 19 septembre 2026. Adaptation FLOW proposée à l’échelle de l’univers, pas équivalence du groupe courant avec une architecture de hub. [Document primaire](https://www.oracle.com/technetwork/topics/entarch/oracle-ra-info-mgmt-r3-1-1980395.pdf), [comparaison et limites](../modeles/backlog/authoritative-data-review-U478.yaml), CMP194. Aucun identifiant natif distinct des sections.

### ELM485

MKT67 — EDM Council, *CDMC Information Model: Controls, Tests and Mappings*, version 1.1, octobre 2022, contrôle 3, pages 13–14. Éléments natifs : Authoritative Data Source, Authoritative Provisioning Point, Authority. L’autorité est une qualification explicite de l’actif. Consultation : 19 septembre 2026. Appui méthodologique à l’autorité locale U479 ; aucune prescription de périmètre Supply ni conformité déduite. [Document primaire](https://edmcouncil.org/wp-content/uploads/2023/02/CDMC-Information-Model-Controls-Tests-Mappings-V1.1.pdf), [comparaison et limites](../modeles/backlog/authoritative-data-review-U478.yaml), CMP194. Aucun identifiant natif distinct du contrôle.


### ELM486

MKT04 — [Discovering the Reference Architecture Content](https://learning.sap.com/courses/sap-enterprise-architecture-framework-foundation-introduction/discovering-the-reference-architecture-content). Page évolutive sans date affichée. Passage : Reference Architecture Content Framework ; Business Capability Model Example. Consultation : 19 septembre 2026. Termes natifs : Enterprise Domain, Business Domain, Business Area, Business Capability.

SAP place Inventory Management et Order Promising parmi les Business Areas de Supply Chain Execution. Un Enterprise Domain regroupe les Business Domains. Page primaire consultée ; rapprochement de vocabulaire et de fonction, aucune équivalence exhaustive de périmètre ni adoption des niveaux de solution. Correspondance proposée CMP195 ; [détail et adaptation FLOW](../modeles/backlog/model-level-naming-U481.yaml). Aucun identifiant natif de concept ajouté.


### ELM487

MKT69 — [Use Domain Analysis to Model Microservices](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis). Documentation Azure Architecture Center évolutive. Passage : Domain analysis ; Analyze the domain ; Define bounded contexts. Consultation : 19 septembre 2026. Termes natifs : Domain, Subdomain, Bounded context.

L’analyse distingue le domaine de ses sous-domaines, puis les frontières dans lesquelles un modèle est applicable. Article primaire consulté ; Domain → Subdomain fournit une analogie sémantique, pas une obligation de conception. Correspondance proposée CMP195 ; [détail et adaptation FLOW](../modeles/backlog/model-level-naming-U481.yaml). Aucun identifiant natif de concept ajouté.


### ELM488

MKT70 — [Capability Modeling Guidelines: Capability Hierarchy](https://enterprise.design/wiki/Capability_Modeling_Guidelines:_Capability_Hierarchy). Page modifiée le 2 mars 2026. Passage : Capability Hierarchy. Consultation : 19 septembre 2026. Termes natifs : Capability Area, Capability Family, Capability Group, Specific Capabilities.

Le guide propose des regroupements successifs de capacités, avec une profondeur adaptée au besoin. Guide public de méthode consulté ; pas une nomenclature universelle ni un modèle Supply. Correspondance proposée CMP195 ; [détail et adaptation FLOW](../modeles/backlog/model-level-naming-U481.yaml). Aucun identifiant natif de concept ajouté.


### ELM489

MKT03 — [BIZBOK Guide — Appendix A: Business Architecture Glossary](https://cdn.ymaws.com/www.businessarchitectureguild.org/resource/resmgr/bizbok15/BIZBOKv15_glossary.pdf). Version 15.0, copyright 2026. Passage : Pages imprimées 456–457 : Capability, Capability Behavior, Capability Level, Capability Tier. Consultation : 19 septembre 2026. Termes natifs : Capability, Capability Behavior, Capability Level, Capability Tier.

Capability Behavior qualifie la manière d’agir selon les circonstances. Capability Level indique la profondeur de décomposition. Glossaire primaire public consulté, déjà référencé en ELM052 ; pas le guide complet réservé aux membres. Nouveau relevé ciblé U481, pas nouveau concept. Correspondance proposée CMP195 ; [détail et adaptation FLOW](../modeles/backlog/model-level-naming-U481.yaml). Aucun identifiant natif de concept ajouté.


### ELM490

MKT14 — [About the business process catalog](https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/about). Documentation Dynamics 365 évolutive. Passage : What’s in the catalog?. Consultation : 19 septembre 2026. Termes natifs : End-to-end process, Business process area, Business process, Scenario, System process, Test case.

Area est un regroupement de processus dans une hiérarchie qui descend ensuite vers les scénarios et tests. Article primaire consulté ; ne pas convertir les capacités en processus ni les comportements en scénarios de test. Correspondance proposée CMP195 ; [détail et adaptation FLOW](../modeles/backlog/model-level-naming-U481.yaml). Aucun identifiant natif de concept ajouté.


### ELM491

MKT19 — TM Forum ODA, TMFC002 Product Order Capture And Validation (2.1.0 affichée) et TMFC003 Product Order Delivery Orchestration And Management (1.1.1 affichée). Notices publiques, paragraphes de présentation, consultés le 19 septembre 2026 : [TMFC002](https://www.tmforum.org/oda/directory/components-map/core-commerce-management/TMFC002), [TMFC003](https://www.tmforum.org/oda/directory/components-map/core-commerce-management/TMFC003). Capture/validation/clôture commerciale distinguées de l’orchestration de livraison. Composants télécom ; pas d’équivalence directe avec une Area métier Supply, ni lecture intégrale des spécifications. CMP196 ; éditions, localisateurs et limites dans [U485](../modeles/backlog/order-management-positioning-U485.yaml).

### ELM492

MKT19 — TM Forum ODA, TMFC006 Service Catalog Management (1.2.0 affichée) et TMFC007 Service Order Management (2.0.0 affichée). Présentations publiques consultées le 19 septembre 2026 : [TMFC006](https://www.tmforum.org/oda/directory/components-map/production/TMFC006), [TMFC007](https://www.tmforum.org/oda/directory/components-map/production/TMFC007). Spécifications des services distinguées des demandes de fourniture ; SOM décrit comme point d’entrée du domaine Production et doté d’orchestration. Analogie sélective de l’offre et des prises en charge ; pas un alignement D04/D06/D14. CMP196 / U485.

### ELM493

MKT71 — Business artifacts, entités métier décrites par leurs informations et leur cycle de vie. [Résumé primaire IBM Research](https://research.ibm.com/publications/automatic-verification-of-data-centric-business-processes), ICDT 2009, Abstract, consulté le 19 septembre 2026. Appui conceptuel à la continuité d’une demande pendant son traitement ; aucune prescription d’Area ni résultat de vérification formelle importé. CMP196 / U485.

### ELM494

MKT72 — Object-centric process mining, divergence et convergence entre événements et objets. [Copie auteur](https://www.vdaalst.com/publications/p1056.pdf), introduction et §3 pp.8–10, consultés le 19 septembre 2026. Plusieurs types d’objets et interactions rendent insuffisant un unique identifiant de case pour toute analyse. Appui à des correspondances multiples entre dossiers et parcours ; pas une architecture métier prescrite. CMP196 / U485.

**Réexamen U485 d’ELM011 — 19 septembre 2026 :** CMMN 1.1 relu (§4.1, §5.2, §5.3.1, §5.4.10.5). Le Case associe CaseFile et CasePlanModel ; il ne se réduit pas à un objet de données. Le repère historique « couche haute » n’est pas réactivé après U455. Appui limité à l’intention, aux informations et au résultat d’un dossier ; aucun Case universel ni renommage de D04 adopté. CMP196.


**Complément lexical U487 d’ELM364 — 19 septembre 2026 :** la [documentation Oracle 25C des flux back-to-back](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fauco/how-orchestration-processes-back-to-back-flows.html), section Supply Chain Orchestration and Order Orchestration, distingue Supply Request, Supply Order et documents d’achat, fabrication ou transfert. Cette lecture complémentaire ne remplace pas la preuve 26B antérieure. Supply Requests est un appui lexical à la sollicitation du domaine ; son usage proposé pour D04 serait plus large que ce périmètre Oracle, notamment pour ventes et retours. CMP197.


**Réexamen U489 d’ELM131 et ELM492 — 19 septembre 2026 :** les notices [TMF641 v4.2](https://www.tmforum.org/open-digital-architecture/open-apis/service-ordering-management-api-TMF641/v4.2) (Overview, paramètres de la demande et suivi ; page affichant publication stable au 14 août 2026) et [TMFC007 2.0.0](https://www.tmforum.org/oda/directory/components-map/production/TMFC007) (point d’entrée Production et orchestration) sont relues. Le nom Service Order étaye la préférence U489 ; sa transposition en Area Service Orders est proposée, sans reprendre tout le périmètre du composant TM Forum. Backing Service Orders demeure une qualification locale proposée pour distinguer les demandes aux exécutants. Les preuves et éditions précédentes restent conservées ; guides complets non relus. CMP197.


### ELM495

MKT13 — SAP S/4HANA Backorder Processing, 2025 FPS01 ; SAP APO Event-Driven Quantity Assignment, 7.0 EHP4. Fonctions produit distinctes : réévaluer les confirmations après modification de disponibilité ; déclencher des affectations sur événements dans APO. Passages indexés primaires consultés le 19 septembre 2026, accès direct dynamique limité. URLs et localisateurs dans [l’annexe U485, complément U493–U495](../modeles/backlog/order-management-positioning-U485.yaml). Ne pas transférer l’automatisation APO à aATP ni les règles de réservation SAP à FLOW. CMP199.

### ELM496

MKT20 — Oracle Supply Chain Orchestration 25D, Change Management in Back-to-Back Fulfillment 25C et Overview of Backlog Management Processes 25C. Sources primaires lues le 19 septembre 2026 : réaction à changement Supply, exception si absence d’alternative, réexamen et simulation du carnet, application distincte. Complète ELM365 et ELM357 sans effacer leurs éditions. URLs, sections, exemple 100→75 et limites dans [l’annexe U485](../modeles/backlog/order-management-positioning-U485.yaml). Ni optimisation globale automatique prouvée par le cas back-to-back, ni nouvel Order obligatoire. CMP199.

### ELM497

MKT73 — Salesforce Service Process Studio : Service Catalog Request, Case, Fulfillment Flow. Documentation évolutive, pas d’édition précisée ; définition et exemple Address Update lus le 19 septembre 2026. Demande et traitement distingués ; vérification de justificatifs par un agent backoffice puis mise à jour bancaire. L’exemple ne prouve pas une nouvelle demande interne ou une détection de fraude. [Source primaire](https://help.salesforce.com/s/articleView?id=ind.spd_fulfillment_flows.htm&language=en_US&type=5). CMP199.

### ELM498

MKT73 — Salesforce Agentforce IT Service, Service Request / Case / Incident ; Salesforce Case Fields. [Cours primaire](https://trailhead.salesforce.com/content/learn/modules/request-management-for-agentforce-it-service/explore-service-requests-and-resolutions), Service Requests, Request Tracking, Resolving Requests ; [Case Fields](https://help.salesforce.com/s/articleView?id=service.cases_fields.htm&language=en_US&type=5), Case Record Type, Origin, Reason, Type, Parent Case. Pages évolutives consultées le 19 septembre 2026, édition non précisée. Demandes internes avec suivi, approbation éventuelle et clôture ; nature et origine qualifiées séparément. Périmètre service aux employés, pas preuve du scénario fraude de Laurent ni d’une taxonomie imposée frontoffice/backoffice. CMP199.


**Complément U499 aux éléments ELM246, ELM495 et ELM496 — 19 septembre 2026 :** relecture primaire d’Oracle Start Backlog Planning 26B (lancement à la demande ou programmé), Overview of Backlog Management Processes 25D (planification, examen, simulation et publication), et SAP APO EDQA Event-Driven Quantity Assignment, page Support Content sans édition précisée (changements de stock et documents déclenchant un traitement). Les lectures 25C et APO 7.0 EHP4 précédentes restent conservées. Les passages lus par l’index du portail SAP ne sont pas présentés comme lecture intégrale d’une spécification. URLs, localisateurs et limites dans [la proposition U499](../modeles/backlog/internal-service-requests-U499.yaml). Le découpage en comportements et la qualification Frontoffice/Backoffice sont des propositions FLOW ; aucun consensus d’éditeur attribué.


**Complément U501 à ELM496 — 19 septembre 2026 :** [Why You Use Backlog Management](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faubm/why-you-use-backlog-management.html), Oracle Fusion Cloud SCM 25D, Pain Points et How Backlog Management Helps, lu intégralement. Les changements de disponibilité peuvent rendre les dates antérieures irréalistes ; le produit permet de comparer des résultats et de simuler avant leur publication. Appui au réexamen du carnet, sans imposer un dossier portant notre nom. Key Actions on Orders 25D (ELM357), sections Plan Run, Review, Simulation et Release, reconsulté pour les comportements. Les autres documents de CMP201 et les demandes internes Salesforce ELM498 restent les appuis consultés dans la même discussion. Les sept fiches U501 ont chacune deux documents primaires distincts ; les paires Oracle ne sont pas qualifiées de consensus interéditeurs.


### ELM499

MKT13 — [Creating Business Partners](https://learning.sap.com/courses/purchasing-in-sap-s-4hana/creating-business-partners). Cours web ; numéro de release non affiché. Passage : Business Partner Concept ; Category ; Relationships ; Transactions and Apps. Consulté le 19 septembre 2026.

Identité commune, catégories Person/Organization/Group, relation de contact datable ; fonctions de recherche et de consultation. Une Organization peut aussi être un département. Texte primaire consulté ; appui sélectif, sans conformité ni réalisation Beaumanoir déduite. CMP203 / U505–U506 ; ELM499/507 étayent également la consultation, CMP204.


### ELM500

MKT13 — [Managing Business Partners](https://learning.sap.com/courses/customizing-core-settings-in-financial-accounting-in-sap-s4hana/managing-business-partners). Cours web ; numéro de release non affiché. Passage : Business Partner Categories ; Business Partner Roles ; Customer/Vendor Integration. Consulté le 19 septembre 2026.

Le rôle correspond au contexte métier. Un même Business Partner peut être Customer et Supplier ; les données centrales d’identité sont partagées. Texte primaire consulté ; appui sélectif, sans conformité ni réalisation Beaumanoir déduite. CMP203 / U505–U506 ; ELM499/507 étayent également la consultation, CMP204.


### ELM501

MKT74 — [Customer 360 10.4 HotFix 1 — Release Guide](https://docs.informatica.com/content/dam/source/GUID-A/GUID-A22D277C-F828-4A24-BB5F-1B1E45148FCB/6/en/C360_104HF1_ReleaseGuide_en.pdf). 10.4 HotFix 1 ; changement décrit pour 10.2 HotFix 2. Passage : Chapitre 5, Changes / Data Model, p. 18. Consulté le 19 septembre 2026.

Les nouvelles installations à partir de 10.2 HotFix 2 utilisent Party, pour personne ou organisation ; les installations antérieures peuvent conserver le modèle Party Role. Passage primaire indexé consulté ; ouverture directe du PDF en erreur. Référence historique, pas preuve d’une métaclasse Party Role dans le SaaS actuel ni de disparition des rôles métier. CMP203 / U505–U506 ; ELM499/507 étayent également la consultation, CMP204.


### ELM502

MKT74 — [Customer 360 10.3 HotFix 2 — Installation and Configuration Guide](https://docs.informatica.com/content/dam/source/GUID-0/GUID-07D6D3B1-8A97-4018-8B8E-B173622F08B8/5-1-1/en/C360_103HF2_InstallationAndConfigurationGuide_en.pdf). 10.3 HotFix 2. Passage : Before You Upgrade / Migrating to the Data Model Based on the Party Table, p. 71. Consulté le 19 septembre 2026.

La migration du modèle fondé sur Party Role vers Party est documentée ; les installations antérieures peuvent conserver leur modèle. Passage primaire indexé seulement ; guide intégral non consulté. Ne permet pas de conclure à la disparition des rôles métier. CMP203 / U505–U506 ; ELM499/507 étayent également la consultation, CMP204.


### ELM503

MKT75 — [Commons Ontology Library 1.2](https://www.omg.org/spec/Commons/1.2/PDF). 1.2, février 2025, formal/25-02-03. Passage : §8.14 tableau 8.28, pp. 80–82 ; §8.13 tableau 8.26, pp. 71–72 (pagination imprimée). Consulté le 19 septembre 2026.

Party désigne une personne ou une organisation ; PartyRole qualifie sa participation contextuelle, éventuellement temporaire. Party n’exige pas partout une personnalité juridique autonome. Texte primaire consulté ; appui sélectif, sans conformité ni réalisation Beaumanoir déduite. CMP203 / U505–U506 ; ELM499/507 étayent également la consultation, CMP204.


### ELM504

MKT67 — [Contracts Ontology](https://raw.githubusercontent.com/edmcouncil/fibo/master/FND/Agreements/Contracts.rdf). versionIRI FND/20260601. Passage : Contract ; ContractParty ; ContractThirdParty ; hasContractParty. Consulté le 19 septembre 2026.

ContractParty est un PartyRole joué par une LegalPerson dans un accord contraignant ; ContractThirdParty distingue une implication indirecte. Ontologie primaire consultée ; vocabulaire contractuel financier. Rapprochement sémantique sélectif, pas qualification juridique automatique ni import du modèle financier. CMP203 / U505–U506 ; ELM499/507 étayent également la consultation, CMP204.


### ELM505

MKT67 — [Legal Persons Ontology](https://raw.githubusercontent.com/edmcouncil/fibo/master/BE/LegalEntities/LegalPersons.rdf). versionIRI BE/20251201. Passage : LegallyCompetentNaturalPerson. Consulté le 19 septembre 2026.

Une personne physique juridiquement capable est à la fois Person et LegalPerson ; LegalPerson ne se traduit donc pas automatiquement par personne morale. Texte primaire consulté ; appui sélectif, sans conformité ni réalisation Beaumanoir déduite. CMP203 / U505–U506 ; ELM499/507 étayent également la consultation, CMP204.


### ELM506

MKT57 — [Organization Structures — Party](https://martinfowler.com/apsupp/accountability.pdf). Extrait auteur ; édition non explicitée. Passage : Party, pp. 5–6. Consulté le 19 septembre 2026.

Party généralise Person et Organization ; les exemples comprennent départements et équipes informelles. Patron de modélisation plus large que les personnes juridiquement autonomes. Texte primaire consulté ; appui sélectif, sans conformité ni réalisation Beaumanoir déduite. CMP203 / U505–U506 ; ELM499/507 étayent également la consultation, CMP204.


### ELM507

MKT74 — [Connecting Master Data to Agentforce](https://www.informatica.com/content/dam/informatica-cxp/techtuesdays-slides-pdf/Connecting%20Master%20Data%20to%20Agentforce.pdf). Présentation du 10 mars 2026. Passage : Diapositives 16–17 : Agentforce Actions ; CAI Processes and MDM APIs. Consulté le 19 septembre 2026.

Identify Customer recherche Person et Organization ; Get Customer Profile et Get Customer Relationships consultent profil et relations. Présentation officielle consultée ; fonctions exposées par une extension. Appui à la consultation, sans reprendre l’IA, les données familiales ou la maîtrise centrale dans FLOW. CMP203 / U505–U506 ; ELM499/507 étayent également la consultation, CMP204.


**Complément U505 à ELM423 :** [Product information overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/pim/product-information), Mise à jour du 1er juillet 2026, relu le 19 septembre 2026 : Product masters and product variants ; Product variant model definition workspace ; Released product maintenance workspace. Les dimensions aident à rechercher et identifier les variantes ; les espaces présentent les références et ouvrent leur détail. Texte primaire relu. Le produit inclut création et maintenance ; seule la lecture est rapprochée de FLOW. CMP204.


### ELM508

MKT20 — [How You Use the Product Information Management Work Area](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fapim/how-you-use-the-product-information-management-work-area.html). 26B. Passage : Quick Search and Manage Items. Consulté le 19 septembre 2026.

Recherche d’articles et de catalogues, ouverture d’un résultat pour consulter ses attributs. Texte primaire consulté ; espace produit plus large que la seule consultation, sans réalisation locale déduite. CMP204 / U505.


**Complément U505 à ELM426 :** [Purchase agreements](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-agreements), Mise à jour du 8 septembre 2026, relu le 19 septembre 2026 : Introduction ; Commitment types ; Confirmations and version history for purchase agreements. Durées et engagements en quantité ou valeur ; consultation et impression des versions d’accord. Texte primaire relu. Les calculs de consommation et reliquat décrits ailleurs sur la page ne sont pas repris dans Visibility. CMP204.


### ELM509

MKT20 — [Contracts Search Options](https://docs.oracle.com/en/cloud/saas/sales/facup/contracts-search-options.html). Documentation évolutive ; édition non affichée. Passage : Search by Enterprise Contract Attributes ; Search Contracts by Text ; Search Contracts with Global Search. Consulté le 19 septembre 2026.

Recherche par numéro, partie, attributs ou texte, puis ouverture des contrats et documents. Texte primaire consulté. La recherche textuelle dépend de la configuration et des habilitations ; aucun choix de moteur ou d’interface imposé. CMP204 / U505.


**Complément U505 à ELM391 :** [Create Commerce catalogs for B2B sites](https://learn.microsoft.com/en-us/dynamics365/commerce/catalogs-b2b-sites), Mise à jour du 21 janvier 2026 ; 10.0.27 et versions ultérieures, relu le 19 septembre 2026 : Catalog configuration ; Set attribute metadata ; dates ; customer hierarchies ; price groups. Attributs visibles, recherchables et filtrables ; contenu et conditions d’applicabilité du catalogue. Texte primaire relu ; consultation seule retenue, pas administration commerciale ni ouverture du chantier Domain Commerce. CMP204.


### ELM510

MKT14 — [Catalog picker module](https://learn.microsoft.com/en-us/dynamics365/commerce/catalog-picker). Mise à jour du 21 janvier 2026. Passage : Introduction ; accès depuis le compte client. Consulté le 19 septembre 2026.

Liste des catalogues accessibles à l’utilisateur B2B et navigation vers leur contenu. Texte primaire consulté. Illustration de consultation ; ne prescrit pas une interface ni une capacité par composant. Deux documents Microsoft ne prouvent pas un consensus interéditeurs. CMP204 / U505.


### ELM511

MKT42 — [Location View/Use Instructions](https://www.help.gs1us.org/location-view-use). Documentation évolutive ; édition non affichée. Passage : View Shared GLNs ; filtres de recherche ; Search for Multiple GLNs at Once. Consulté le 19 septembre 2026.

Recherche et consultation de lieux partagés par GLN ou nom, attributs et filtres. Texte primaire consulté ; accès soumis au partage et parfois à une option. Appui limité aux lieux, sans identification GLN imposée ni topologie Supply complète démontrée. CMP204 / U505.


### ELM512

MKT14 — [Inventory locations](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-locations). Mise à jour du 1er juillet 2026. Passage : Location properties ; Tree structure. Consulté le 19 septembre 2026.

Caractéristiques des emplacements et consultation de leur organisation arborescente. Texte primaire consulté ; module Inventory Management sans Warehouse Management. Échelle intrentrepôt plus fine que le réseau FLOW ; aucune couverture complète de ses liaisons déduite. CMP204 / U505.


### ELM513

MKT19 — [Service Catalog Management v1.2.0](https://oda-production.s3.eu-west-2.amazonaws.com/v1.0.0/TMFC006_Service_Catalog_Management_v1.2.0.pdf). 1.2.0, approuvé le 26 novembre 2024, Production/GA. Passage : §1 Overview, p. 5. Consulté le 19 septembre 2026.

Recherche de services et accès organisé aux spécifications ; distinction de vues client et technique. PDF primaire consulté. Composant télécom comprenant aussi conception et cycle de vie ; ces responsabilités ne sont pas importées dans la consultation FLOW. CMP204 / U505.


### ELM514

MKT76 — [Catalog Homepage Search widget](https://www.servicenow.com/docs/r/platform-user-interface/service-portal/cat-homepage-search-widget.html). Australia ; mise à jour du 12 mars 2026. Passage : Using the widget. Consulté le 19 septembre 2026.

Recherche par mots-clés et parcours des catégories d’un catalogue. Texte primaire consulté ; analogie de consultation uniquement. Le catalogue de demandes ServiceNow n’est pas assimilé aux Backing Services de FLOW, ni au périmètre de D14. CMP204 / U505.


### ELM515

MKT13 — [SAP Assortment](https://learning.sap.com/courses/configuring-master-data-in-sap-s-4hana-cloud-private-edition-retail/assortment-1-1), cours S/4HANA Cloud Private Edition Retail, release non affichée. Sections Assortment Management and Maintenance, Local/General Assortments et Assortment Management, texte primaire consulté le 19 septembre 2026. Articles, magasins/centres de distribution/clients et périodes d’applicabilité. La référence peut être utilisée pour les commandes ; sa conception reste hors FLOW. Complète ELM094, sans remplacer la preuve précédente ni importer les cardinalités SAP. CMP205 ; [analyse U508](../modeles/backlog/catalog-assortment-review-U508.yaml).

### ELM516

MKT14 — [Assortment management](https://learn.microsoft.com/en-us/dynamics365/commerce/assortments), Dynamics 365 Commerce, page du 16 janvier 2026. Introduction, Basic assortment setup, Dynamic and static assortments et Date effectivity, texte primaire lu le 19 septembre 2026. Produits/catégories associés à des canaux sur une période ; plusieurs assortiments peuvent contribuer au contenu d’un canal. Disponibilité dans l’offre distincte du stock et d’une promesse Supply. CMP205 ; rédaction sélective, aucune capacité de conception commerciale ajoutée.

**Complément U508 à ELM391/345 — 19 septembre 2026 :** Microsoft Create Commerce catalogs for B2B sites, page du 21 janvier 2026, Configure the catalog, relu : le catalogue utilise des produits des assortiments des canaux concernés et porte sa propre présentation commerciale. Oracle Procurement 26A, What’s the difference between a purchase order, a purchase agreement, and a contract agreement?, sections Blanket/Contract Purchase Agreement, relu : périmètre produit détaillé dans un cas, conditions sans liste de produits dans l’autre. Ni ordre universel catalogue → assortiment ni synonymie entre lignes d’accord et Assortment déduits. URLs, différences et limites dans [U508](../modeles/backlog/catalog-assortment-review-U508.yaml).


### ELM517

MKT13 — [SAP Assortment List](https://learning.sap.com/courses/configuring-master-data-in-sap-s-4hana-cloud-private-edition-retail/assortment-list-1-1), cours S/4HANA Cloud Private Edition Retail, numéro de release non affiché. Attributes of the Assortment List ; Full/Change/Mixed Version ; affichage et diffusion électronique, texte primaire lu le 19 septembre 2026. Appui à la transmission des évolutions et à la consultation des sélections applicables. Les formats, fréquences et enrichissements transactionnels SAP ne sont pas adoptés. Complète ELM515 pour D16.a/D16.b ; deux documents SAP ne constituent pas un consensus interéditeurs. CMP206.


### ELM518

MKT77 — [Order Workflow Templates Overview](https://docs.fluentcommerce.com/essential-knowledge/order-workflow-templates-overview), Fluent Order Management. Non indiquée dans le document consulté. ; consulté le 21 septembre 2026. La préparation des workflows distingue lieux et réseaux, catalogues virtuels, catalogues de stock et catalogue produit. Elle interroge explicitement une origine PIM, ERP ou Commerce pour les données du catalogue produit, ainsi que les réseaux et catalogues utilisés pour le sourcing. Localisation, différences et limites dans [le relevé primaire](../audits/2026-09-21-authoritative-data-landscape-U512/fluent-documents.yaml). Appui partiel CMP207 ; aucun découpage FLOW ni déploiement adopté.

### ELM519

MKT77 — [Product Sync - Adobe Commerce Connector](https://docs.fluentcommerce.com/essential-knowledge/product-sync-adobe-commerce-connector), Fluent Order Management — Adobe Commerce Connector. Non indiquée dans le document consulté. ; consulté le 21 septembre 2026. Le connecteur transmet les données produit d’Adobe Commerce vers Fluent OMS. Il prévoit un chargement initial complet, un export manuel depuis une date et des deltas automatiques ; seuls les types Simple et Configurable sont pris en charge dans ce parcours. Localisation, différences et limites dans [le relevé primaire](../audits/2026-09-21-authoritative-data-landscape-U512/fluent-documents.yaml). Appui partiel CMP207 ; aucun découpage FLOW ni déploiement adopté.

### ELM520

MKT77 — [Manage Locations via UI](https://docs.fluentcommerce.com/by-type/manage-locations-via-ui), Fluent Order Management ; Fluent Big Inventory. Non indiquée dans le document consulté. ; consulté le 21 septembre 2026. Fluent OMS et Fluent Big Inventory permettent de créer et modifier des lieux directement dans leur interface, sous réserve des permissions requises. Le système contrôle les valeurs soumises. Localisation, différences et limites dans [le relevé primaire](../audits/2026-09-21-authoritative-data-landscape-U512/fluent-documents.yaml). Appui partiel CMP207 ; aucun découpage FLOW ni déploiement adopté.

### ELM521

MKT77 — [Creating and Editing Product Catalogues](https://docs.fluentcommerce.com/by-type/creating-and-editing-product-catalogues), Fluent Order Management. Non indiquée dans le document consulté. ; consulté le 21 septembre 2026. L’interface permet la création et la modification de catalogues produit, avec attributs facultatifs. Les opérations correspondantes doivent être activées dans le manifeste et accessibles au rôle de l’utilisateur. Localisation, différences et limites dans [le relevé primaire](../audits/2026-09-21-authoritative-data-landscape-U512/fluent-documents.yaml). Appui partiel CMP207 ; aucun découpage FLOW ni déploiement adopté.

### ELM522

MKT14 — [Data management](https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/data-management), Dynamics 365 Intelligent Order Management. Documentation en ligne ; version produit non précisée ; consulté le 21 septembre 2026. IOM peut fonctionner avec ou sans master data locale. Un ERP peut être maître des produits ou comptes ; certaines commandes portent assez d'informations client et peuvent utiliser des produits saisis dans les lignes sans catalogue local. Des écrans et imports permettent aussi d'administrer ces données. Localisation, différences et limites dans [le relevé primaire](../audits/2026-09-21-authoritative-data-landscape-U512/oms-documents.yaml). Appui partiel CMP207 ; aucun découpage FLOW ni déploiement adopté.

### ELM523

MKT14 — [Fulfillment and Returns Optimization provider overview](https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/fulfillment-returns-optimization), Dynamics 365 Intelligent Order Management — Fulfillment and Returns Optimization. Documentation en ligne ; version produit non précisée ; consulté le 21 septembre 2026. Le moteur lit dans Dataverse des sources de fulfillment, listes, contraintes et stratégies. Les sources représentent notamment entrepôts, magasins, fournisseurs livrant directement et sites virtuels ; elles peuvent être créées, modifiées, enrichies d'horaires et activées ou désactivées localement. Localisation, différences et limites dans [le relevé primaire](../audits/2026-09-21-authoritative-data-landscape-U512/oms-documents.yaml). Appui partiel CMP207 ; aucun découpage FLOW ni déploiement adopté.

### ELM524

MKT14 — [Call the Intelligent Order Management Fulfillment optimization engine (DOM) via API](https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/calling-intelligent-fulfillmen-optimization-engine), Dynamics 365 Intelligent Order Management — fulfillment optimization engine. Fonction annoncée depuis avril 2023 ; prérequis de la page : version 1.0.0.6035 ; consulté le 21 septembre 2026. Une application externe peut appeler le moteur avec adresse, produits et quantités pour obtenir un plan de fulfillment. Les options de transport associent paramètres locaux, calendriers et ramasses, données produit et appel à l'API FedEx. Localisation, différences et limites dans [le relevé primaire](../audits/2026-09-21-authoritative-data-landscape-U512/oms-documents.yaml). Appui partiel CMP207 ; aucun découpage FLOW ni déploiement adopté.

### ELM525

MKT23 — [External system integration overview](https://www.ibm.com/docs/en/order-management-sw/10.0.0?topic=systems-external-system-integration-overview), Sterling Order Management System Software. 10.0.0 ; consulté le 21 septembre 2026. Sterling échange avec les systèmes externes des informations de commandes, disponibilités, produits et clients. La synchronisation peut être quasi immédiate, à la demande ou par lot. Localisation, différences et limites dans [le relevé primaire](../audits/2026-09-21-authoritative-data-landscape-U512/oms-documents.yaml). Appui partiel CMP207 ; aucun découpage FLOW ni déploiement adopté.

### ELM526

MKT23 — [The organization's roles and participant associations](https://www.ibm.com/docs/en/order-management-sw/10.0.0?topic=organization-organizations-roles-participant-associations), Sterling Order Management System Software. 10.0.0 ; consulté le 21 septembre 2026. Une organisation peut porter plusieurs rôles ; les nœuds représentent des lieux physiques. Les transporteurs configurent leurs services ; les entreprises configurent règles et préférences de fulfillment ; les vendeurs configurent notamment paiement et prix. Localisation, différences et limites dans [le relevé primaire](../audits/2026-09-21-authoritative-data-landscape-U512/oms-documents.yaml). Appui partiel CMP207 ; aucun découpage FLOW ni déploiement adopté.

### ELM527

MKT36 — [Decision requirements graph](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/), Camunda 8. Version 8.9 affichée ; consulté le 21 septembre 2026. Le graphe distingue décisions, données d’entrée et sources de connaissance ; la logique est portée par la décision. Localisation, différences et limites dans [le relevé primaire](../audits/2026-09-21-authoritative-data-landscape-U512/concept-documents.yaml). Appui partiel CMP207 ; aucun découpage FLOW ni déploiement adopté.

**Réexamen U511–U513, 21 septembre 2026 :** ELM484/485/259/515/391/513 reconsultés ; passages et limites dans [concept-documents.yaml](../audits/2026-09-21-authoritative-data-landscape-U512/concept-documents.yaml). Les preuves et dates antérieures demeurent historiques.


### ELM528

MKT69 — [Command Query Responsibility Segregation (CQRS) pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs), Azure Architecture Center, mise à jour du 21 février 2025. Sections Solution et Separate read models and write models, texte consulté le 21 septembre 2026. La séparation des modèles de lecture/écriture ne prescrit pas des stockages séparés. Appui architectural CMP208, aucune capacité métier ni technologie adoptée. [Passages et limites](../modeles/backlog/authoritative-data-structure-U514.yaml).


### ELM529

MKT69 — [Materialized View pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view), Azure Architecture Center, page évolutive sans date affichée dans le texte consulté le 21 septembre 2026. Sections Context and problem, Solution, Issues and considerations et When to use this pattern. Une vue peut combiner plusieurs stockages selon les besoins de lecture. Appui architectural à U515, sans imposer de matérialisation ni de Behavior métier. [Localisateurs et limites](../modeles/backlog/authoritative-data-structure-U514.yaml), CMP209.


### ELM530

MKT73 — [Script API — Class ProductPriceModel](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-script-api/dw.catalog.ProductPriceModel.html), B2C Commerce. Documentation en ligne ; version et date de mise à jour non affichées. Consulté le 21 septembre 2026. Définitions tarifaires regroupées en Price Books ; prix applicables selon contexte, activité, période, devise et quantité. [Passages, rapprochements et limites](../modeles/backlog/core-data-price-books-sources-U516.yaml), CMP210 ; aucune responsabilité installée ni fonction FLOW déduite automatiquement.


### ELM531

MKT14 — [Define product pricing with price lists and price list items](https://learn.microsoft.com/en-us/dynamics365/sales/create-price-lists-price-list-items-define-pricing-products), Dynamics 365 Sales. Page mise à jour le 8 août 2025. Consulté le 21 septembre 2026. Price Lists par contexte avec devise et dates ; lignes produit/unité portant montant ou méthode tarifaire et lien vers des remises. [Passages, rapprochements et limites](../modeles/backlog/core-data-price-books-sources-U516.yaml), CMP210 ; aucune responsabilité installée ni fonction FLOW déduite automatiquement.


### ELM532

MKT14 — [Price calculation for opportunity, quote, order, and invoice records](https://learn.microsoft.com/en-us/dynamics365/sales/price-calculation-opportunity-quote-order-invoice-records), Dynamics 365 Sales. Page mise à jour le 22 août 2025. Consulté le 21 septembre 2026. Le calcul transactionnel utilise les lignes tarifaires, méthodes, arrondis et remises de volume ; liste obligatoire ou optionnelle selon configuration. [Passages, rapprochements et limites](../modeles/backlog/core-data-price-books-sources-U516.yaml), CMP210 ; aucune responsabilité installée ni fonction FLOW déduite automatiquement.


### ELM533

MKT20 — [Overview of Product Development Business Objects](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faupd/overview-of-product-development-business-objects.html), Fusion Cloud Product Development. 26B. Consulté le 21 septembre 2026. Objets produit, documents, structures et changements portent notamment les informations techniques et de conception. [Passages, rapprochements et limites](../modeles/backlog/core-data-price-books-sources-U516.yaml), CMP210 ; aucune responsabilité installée ni fonction FLOW déduite automatiquement.


### ELM534

MKT13 — [Working With Purchasing Info Records](https://learning.sap.com/courses/sourcing-in-sap-s4hana/working-with-purchasing-info-records), S/4HANA Sourcing. Cours public ; numéro de release et date de mise à jour non affichés. Consulté le 21 septembre 2026. Référence fournisseur/article avec conditions, prix et délais au niveau achats ; prix de référence distinct du prix de commande. [Passages, rapprochements et limites](../modeles/backlog/core-data-price-books-sources-U516.yaml), CMP210 ; aucune responsabilité installée ni fonction FLOW déduite automatiquement.


### ELM535

MKT14 — [Purchase agreements](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-agreements), Dynamics 365 Supply Chain Management. Documentation en ligne ; édition produit et date non relevées. Consulté le 21 septembre 2026. Accords fournisseurs avec engagements de quantité ou valeur, conditions tarifaires et période de validité. [Passages, rapprochements et limites](../modeles/backlog/core-data-price-books-sources-U516.yaml), CMP210 ; aucune responsabilité installée ni fonction FLOW déduite automatiquement.


### ELM536

MKT14 — [Credit holds for sales orders](https://learn.microsoft.com/en-us/dynamics365/finance/accounts-receivable/cm-sales-order-credit-holds), Dynamics 365 Finance. Texte primaire consulté le 21 septembre 2026, sections Introduction ; Set up blocking rules and exclusion rules ; Account status. Des règles et exclusions par client ou groupe conduisent à mettre des commandes en attente selon leur contexte. [Versions, rapprochements et limites](../modeles/backlog/core-data-price-books-sources-U516.yaml), complément U517 / CMP211.


### ELM537

MKT14 — [Set up vendor accounts](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/set-up-vendor-accounts), Dynamics 365 Supply Chain Management. Texte primaire consulté le 21 septembre 2026, sections Vendors in different legal entities ; Putting a vendor on hold. Restrictions fournisseur par type de transaction, avec motif et fin éventuelle ; bloquer de nouvelles commandes peut laisser factures et paiements ouverts. [Versions, rapprochements et limites](../modeles/backlog/core-data-price-books-sources-U516.yaml), complément U517 / CMP211.


### ELM538

MKT20 — [How the Order Orchestration and Order Promising Processes Use the Collected Planning Data](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faubm/how-the-order-orchestration-and-order-promising-processes-use.html). Fusion Cloud SCM — Order Management / Global Order Promising. Édition : 26B Consultation primaire le 21 septembre 2026. Passage : Data Collections ; Order Orchestration ; Order Promising, lignes 4–15.

Le dépôt reçoit des données Oracle ou externes ; orchestration et moteur de promesse les utilisent selon des accès différents. Limite : Architecture de produit documentée pour ce parcours ; pas exigence de mémoire séparée, matérialisation ou unique mode de fonctionnement FLOW. [Relevé primaire](../audits/2026-09-21-authoritative-views-U519/oracle-sap-planning-evidence.yaml), U519/CMP212. Restitution au niveau capacité selon U520 ; aucun détail produit adopté.


### ELM539

MKT20 — [Collect Data for Global Order Promising](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fascp/refresh-the-global-order-promising-server.html). Fusion Cloud SCM — Global Order Promising. Édition : 26B Consultation primaire le 21 septembre 2026. Passage : Collect Data ; liste d’entités, lignes 4–26.

La collecte distingue paramètres, supply et demand ; elle mobilise notamment articles, structures, organisations, ressources, méthodes d’expédition et fournisseurs. Limite : Les nomenclatures et gammes de fabrication ne sont pas ajoutées au périmètre FLOW par cette comparaison. [Relevé primaire](../audits/2026-09-21-authoritative-views-U519/oracle-sap-planning-evidence.yaml), U519/CMP212. Restitution au niveau capacité selon U520 ; aucun détail produit adopté.


### ELM540

MKT13 — [Outlining Alternative-based Confirmation](https://learning.sap.com/courses/exploring-aatp-in-sap-s-4hana/outlining-alternative-based-confirmation). S/4HANA — aATP. Édition : Cours sans édition globale affichée ; historique explicite 1809, 1909, 2020 et 2021. Consultation primaire le 21 septembre 2026. Passage : Alternative-based Confirmation ; Configure Alternative Control ; résultats ; caractéristiques et substitutions, lignes 70–104 et 130–138.

Des caractéristiques de la commande et des données maîtres, notamment client et produit, déterminent la stratégie de substitution de lieux. Limite : Cours mêlant versions historiques ; ne démontre ni couverture actuelle exhaustive ni service de vue séparé ; paramètres de priorité natifs non adoptés. [Relevé primaire](../audits/2026-09-21-authoritative-views-U519/oracle-sap-planning-evidence.yaml), U519/CMP212. Restitution au niveau capacité selon U520 ; aucun détail produit adopté.


### ELM541

MKT77 — [Getting Started with Reference Sourcing Criteria](https://docs.fluentcommerce.com/by-type/getting-started-with-reference-sourcing-criteria). Fluent Order Management — Responsive Sourcing. Édition : Version générale non indiquée ; une limite mentionne Order Reference Module v2.2.0. Consultation primaire le 21 septembre 2026. Passage : Reference Sourcing Criterion Functions ; Core Concept ; FAQ distance ; lignes 51–130 et 245–247 de la consultation.

Les critères combinent caractéristiques des lieux, disponibilité, demande et historique de rejet pour classer ou exclure des candidats. Limite : Critères configurables et extensibles ; aucune vue universelle imposée. [Relevé primaire](../audits/2026-09-21-authoritative-views-U519/fluent-evidence.yaml), U519/CMP212. Restitution au niveau capacité selon U520 ; aucun détail produit adopté.


### ELM542

MKT77 — [Getting Started with Reference Sourcing Conditions](https://docs.fluentcommerce.com/by-type/getting-started-with-reference-sourcing-conditions). Fluent Order Management — Responsive Sourcing. Édition : Non indiquée. Consultation primaire le 21 septembre 2026. Passage : Core Concept ; Applying Path Conditions to Real Scenarios ; Practical Examples ; exemple allProductSizeIn ; lignes 54–109 et 413–424.

Les conditions évaluent un contexte de sourcing comportant notamment niveau client, références ou propriétés produit, destination et date de commande. Limite : Exemples extensibles, sans inventaire exhaustif des données ni prescription de stockage. [Relevé primaire](../audits/2026-09-21-authoritative-views-U519/fluent-evidence.yaml), U519/CMP212. Restitution au niveau capacité selon U520 ; aucun détail produit adopté.


### ELM543

MKT77 — [Tailor Fulfilment Plans to Any Scenario - Fulfilment Options Orchestration](https://docs.fluentcommerce.com/release-notes/tailor-fulfilment-plans-to-any-scenario-fulfilment-options-orchestration). Fluent Order Management — Fulfilment Options. Édition : Numéro non indiqué ; note Initial Release, statut Released. Consultation primaire le 21 septembre 2026. Passage : Description — Use case scenarios ; lignes 38–45.

Les exemples adaptent les options aux attributs produit, au panier, à la destination et à la proximité des lieux, puis aux changements de disponibilité ou de délai de préparation estimé. Limite : Note ancienne illustrative ; ne décrit pas un catalogue exhaustif de services ni les contrats actuels de calcul des délais. [Relevé primaire](../audits/2026-09-21-authoritative-views-U519/fluent-evidence.yaml), U519/CMP212. Restitution au niveau capacité selon U520 ; aucun détail produit adopté.


### ELM544

MKT77 — [Future Inventory - Data Model and API Overview](https://docs.fluentcommerce.com/essential-knowledge/future-inventory-data-model-and-api-overview). Fluent Commerce — Inventory / Virtual Catalog / Future Inventory. Édition : Non indiquée. Consultation primaire le 21 septembre 2026. Passage : Entities ; Relationship Details ; Queries ; Key Insights ; lignes 64–85, 155–225 et 294–316.

Le document sépare quantités opérationnelles et disponibilité calculée ; les requêtes temporelles de disponibilité servent notamment le sourcing et la promesse. Limite : Arrivages attendus avec dates, pas prévisions. Ne justifie pas seul une vue de références dédiée à la promesse. [Relevé primaire](../audits/2026-09-21-authoritative-views-U519/fluent-evidence.yaml), U519/CMP212. Restitution au niveau capacité selon U520 ; aucun détail produit adopté.


### ELM545

MKT77 — [Returns Component](https://docs.fluentcommerce.com/building-blocks/returns-component). Fluent Order Management / Fluent Store — Returns Component. Édition : Historique : v1.0.0 ; date du changelog non exploitable (0000-00-00). Consultation primaire le 21 septembre 2026. Passage : Return Item Details ; Data Dictionary ; Configuring columns using the orderItem state ; Customizing the summary ; lignes 50–100 et 134–170.

Le composant de retour associe données produit, vente initiale et saisie du retour. Les listes de motifs et d’états de l’article sont configurables. Limite : Composant de saisie : ne démontre ni inspection physique, ni décision d’acceptation, ni politique complète, destination ou prestataire de retour. [Relevé primaire](../audits/2026-09-21-authoritative-views-U519/fluent-evidence.yaml), U519/CMP212. Restitution au niveau capacité selon U520 ; aucun détail produit adopté.


### ELM546

MKT23 — [Defining a node's sourcing and scheduling](https://www.ibm.com/docs/en/order-management-sw/10.0.0?topic=attributes-defining-nodes-sourcing-scheduling). Sterling Order Management System Software. Édition : 10.0.0 Consultation primaire le 21 septembre 2026. Passage : Table 1. Node sourcing/scheduling tab

Le paramétrage associe lieux, relations organisationnelles, possibilités d'approvisionnement/transfert, services, calendriers et temps de traitement. Une acceptation de transfert peut confirmer la disponibilité avant poursuite de la commande. Limite : Paramètres d'un produit, pas catalogue de vues standard. Calendrier configuré et disponibilité effectivement confirmée restent différents ; un délai de référence n'est pas une promesse. [Relevé primaire](../audits/2026-09-21-authoritative-views-U519/oms-evidence.yaml), U519/CMP212. Restitution au niveau capacité selon U520 ; aucun détail produit adopté.


### ELM547

MKT14 — [Master planning with purchase trade agreements](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/purchase-trade-agreement). Dynamics 365 Supply Chain Management — Planning Optimization. Édition : Documentation en ligne ; version produit non précisée Consultation primaire le 21 septembre 2026. Passage : Prepare your system... ; Prepare a released product... ; Examples of how master planning finds vendor and lead times

La sélection mobilise produit, fournisseur, prix et délai des purchase trade agreements, paramètres par défaut et dérogations. Les prix peuvent être comparés entre devises lorsque le taux nécessaire existe. Limite : Purchase trade agreement est le terme produit ; ce document ne prouve pas un Agreement FLOW complet ni un engagement fournisseur vivant. La priorité mono-critère du produit n'est pas adoptée pour FLOW. [Relevé primaire](../audits/2026-09-21-authoritative-views-U519/oms-evidence.yaml), U519/CMP212. Restitution au niveau capacité selon U520 ; aucun détail produit adopté.


### ELM548

MKT20 — [Guidelines for Processing Return Orders](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faiom/guidelines-for-processing-return-orders.html). Fusion Cloud SCM — Order Management, 26B. Consulté le 21 septembre 2026. Passage : Manually Reference the Original Order ; Set Up the Item So It's Returnable ; Specify the Return-to Location, lignes 9–30 et 59–61.

Le traitement des retours mobilise une qualification de référence du produit, une destination de retour et, selon le parcours, la commande d’origine. Limite : La fonction produit gère aussi la transaction et l’orchestration ; elle n’est pas une vue de références autonome. Retours fournisseurs et disposition complète non démontrés par cette page. [Relevé U522](../modeles/backlog/visibility-oracle-fluent-U522.yaml), CMP213.


### ELM549

MKT20 — [Set Attributes on Your Supply Chain Search](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fascp/promising-attributes-for-supply-chain-availability-searches.html). Fusion Cloud SCM — Global Order Promising, 26B. Consulté le 21 septembre 2026. Passage : Profitable to Promise, lignes 13–46 ; Search Components and Resources, lignes 5–12.

Profitable to Promise utilise des coûts de référence pour comparer les possibilités de satisfaction ; le moteur produit ensuite le choix. Limite : Calcul et choix font partie du moteur Oracle, pas d’une vue Economic Context distincte. Sa logique de coût sous contrainte de date n’est pas adoptée dans FLOW ; ni prix de vente ni comptabilité complète. [Relevé U522](../modeles/backlog/visibility-oracle-fluent-U522.yaml), CMP213.


### ELM550

MKT20 — [Source Your Supply Chain](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fascp/overview-of-sourcing-rules-and-bills-of-distribution.html). Fusion Cloud SCM — Global Order Promising, 26B. Consulté le 21 septembre 2026. Passage : Introduction et Source Type ; Global Rule ; Local Rule, lignes 3–17 et 44–60.

Le sourcing Oracle couvre des sources d’achat, de fabrication et de transfert, à une portée globale ou locale. Limite : Règles et choix opérationnels plus larges qu’une vue de références ; périmètre de fabrication non ajouté à FLOW. Le seul mot sourcing ne vaut pas équivalence avec Responsive Sourcing de Fluent. [Relevé U522](../modeles/backlog/visibility-oracle-fluent-U522.yaml), CMP213.


### ELM551

MKT28 — [Supply Chain Orchestration](https://www.kinaxis.com/en/solutions/supply-chain-orchestration), Kinaxis Maestro. Page évolutive, édition et date de mise à jour non indiquées ; consultée le 21 septembre 2026. Nature : positionnement d'offre ; identifiant natif non indiqué. Passages : périmètre de la planification pluriannuelle à la livraison ; The value of orchestration.

Reformulation : Kinaxis emploie orchestration pour relier planification, décisions et exécution, avec scénarios et coordination opérationnelle. Appui sémantique au nom du Domain FLOW incluant éventuellement une Area Supply Planning. Limites : positionnement commercial, pas taxonomie normative, preuve de performance ou réalisation Beaumanoir ; périmètre Kinaxis plus large que FLOW. [Analyse U526](../modeles/backlog/supply-planning-area-review-U526.yaml), CMP214.

### ELM552

MKT24 — [Response and supply planning](https://www.sap.com/sea/products/scm/integrated-business-planning/features/response-and-supply-planning.html), SAP Integrated Business Planning. Page évolutive, édition non indiquée ; consultée le 21 septembre 2026. Nature : présentation fonctionnelle de produit ; identifiant natif non indiqué. Passages : Supply planning ; Empower planners with collaboration and simulations ; Empower planners with executional alignment ; Synchronised planning.

Reformulation : plans Supply sous contraintes, comparaison de scénarios, réponse aux changements à court terme et coordination avec l'exécution via S/4HANA. Appui à une planification elle-même adaptable, en coopération avec les opérations. Limites : pas contrat détaillé d'intégration ni carte de capacités FLOW ; aucune performance ou réalisation locale inférée. [Analyse U526](../modeles/backlog/supply-planning-area-review-U526.yaml), CMP214. Dans la formulation FLOW, U527 retient impondérable ; les titres natifs SAP restent conservés.

**Réexamen U526 — ELM294, ELM326, ELM465 :** Oracle Overview of Supply Chain Orchestration, 26B, reconsulté le 21 septembre 2026 dans les passages sur les demandes de Supply Planning et le change management. ASCM SCOR DS : extraits primaires indexés de la page de présentation et du Quick Reference Guide consultés pour Plan et la hiérarchie Orchestrate niveau 0 / processus niveau 1 ; accès direct page/PDF indisponible, aucune lecture intégrale revendiquée. URLs, passages et limites dans l'annexe U526. Le modèle de processus SCOR n'est pas assimilé à une carte de capacités ni au Domain FLOW.


### ELM553

MKT36 — [Event subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/), Camunda 8.9. Consulté le 21 septembre 2026. Passages : Introduction ; événements de démarrage ; interrupting/non-interrupting ; Variables. Identifiant natif non indiqué.

Reformulation : Un sous-processus peut être déclenché par événement ; un déclenchement non interruptif peut se répéter. Limite : Mécanisme de processus, pas calcul métier natif de plan Supply. [Étude U530](../modeles/backlog/supply-planning-area-review-U526.yaml), CMP215. Synthèse sélective, aucune réalisation Beaumanoir inférée.


### ELM554

MKT36 — [Business rule tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/), Camunda 8.9. Consulté le 21 septembre 2026. Passages : Introduction ; Defining a called decision ; Variable mappings. Identifiant natif non indiqué.

Reformulation : Une tâche évalue une décision DMN et le processus poursuit son exécution ; une implémentation spécifique par worker est aussi possible. Limite : La logique appelée doit être définie ; aucune replanification métier permanente garantie par le moteur seul. [Étude U530](../modeles/backlog/supply-planning-area-review-U526.yaml), CMP215. Synthèse sélective, aucune réalisation Beaumanoir inférée.


### ELM555

MKT20 — [Overview of Product Lifecycle Management and Product Hub](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faipr/overview-of-product-lifecycle-management-and-product-hub.html), 26B. Consulté le 21 septembre 2026. Passages : Introduction ; Innovation Management ; Product Development ; Product Hub. Identifiant natif non indiqué.

Reformulation : Le périmètre distingue innovation/conception, données et modifications produit, et centralisation des données produit pour les processus aval. Limite : Suite Oracle plus large que FLOW ; regroupement commercial ne vaut pas adoption de la conception produit dans le Domain Supply. [Étude U530](../modeles/backlog/supply-planning-area-review-U526.yaml), CMP215. Synthèse sélective, aucune réalisation Beaumanoir inférée.


### ELM556

MKT24 — [Demand planning](https://www.sap.com/products/scm/integrated-business-planning/features/demand-planning.html), SAP Integrated Business Planning. Page évolutive sans édition indiquée, consultée le 21 septembre 2026. Passages : Increase forecast accuracy through collaboration ; Refine short-term forecasts ; Explore all capabilities — Response and supply planning. Identifiant natif non indiqué.

Reformulation : SAP décrit la prévision de demande et ses liens avec la Supply ; les signaux de commandes et de ventes peuvent ajuster les prévisions à court terme. Limites : présentation fonctionnelle ; le demand sensing court terme ne vaut pas équivalence avec les indicateurs saisonniers de MAP. Aucune méthode, cadence ou réalisation locale déduite. [Analyse U531](../modeles/backlog/supply-planning-area-review-U526.yaml), CMP216. Synthèse sélective et lien.


### ELM557

MKT20 — [Overview of Supply Chain Planning Plan Types](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faupc/overview-of-supply-chain-planning-plan-types.html), 26B. Consulté le 21 septembre 2026. Passages : Tableau des types de plans : Demand Plan, Supply Plan, Demand and Supply Plan, Sales and Operations Plan, Backlog Plan, Replenishment Plan. Identifiant natif non indiqué.

Reformulation : Oracle distingue prévision collaborative/statistique, plan Supply et plan intégré demande/Supply. Des plans de backlog et de réassort sont aussi distingués. Limite : Types de plans et espaces fonctionnels du produit, pas hiérarchie de capacités ou de Domains FLOW. Ne prescrit ni le nombre de capacités ni leurs parents. [Comparaison U532](../modeles/backlog/planning-options-U532.yaml), CMP217. Synthèse sélective et lien, aucune réalisation locale inférée.


### ELM558

MKT20 — [Forecast Processing](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faupc/forecast-processing.html), 26B. Consulté le 21 septembre 2026. Passages : Introduction ; étape Forecast Consumption ; configuration dans Supply tab. Identifiant natif non indiqué.

Reformulation : Le traitement destiné au plan Supply rapproche les prévisions et les quantités de commandes de vente ouvertes pour produire une prévision nette. Limite : Dans cette page Oracle, ce traitement relève de la préparation pour Supply Planning. Ni équivalence avec les précommandes B2B MAP ni mécanisme identique chez Beaumanoir ; ne fixe pas le placement de la responsabilité FLOW. [Comparaison U532](../modeles/backlog/planning-options-U532.yaml), CMP217. Synthèse sélective et lien, aucune réalisation locale inférée.


### ELM559

MKT24 — [Sales and operations planning](https://www.sap.com/products/scm/integrated-business-planning/features/sales-and-operations-planning.html), Page évolutive ; édition non indiquée. Consulté le 21 septembre 2026. Passages : Process orchestration ; Improved internal and external collaboration ; Planning for disruptions ; Explore all capabilities. Identifiant natif non indiqué.

Reformulation : SAP relie demande, Supply et plans financiers, avec contributions commerciales, marketing, développement, fabrication et finance, et comparaison de scénarios. Limite : Présentation fonctionnelle S&OP, pas preuve d’un Domain PLAN standard séparant Demand Planning et Supply Planning ; n’établit aucune responsabilité installée chez Beaumanoir. [Comparaison U532](../modeles/backlog/planning-options-U532.yaml), CMP217. Synthèse sélective et lien, aucune réalisation locale inférée.


### ELM560

MKT24 — [Inventory optimisation](https://www.sap.com/uk/products/scm/integrated-business-planning/features/inventory-optimization.html), Page évolutive ; édition non indiquée. Consulté le 21 septembre 2026. Passages : Develop item-level inventory targets ; Monitor all types of variabilities ; Multistage optimisation ; Response and supply planning. Identifiant natif non indiqué.

Reformulation : SAP distingue le calcul de cibles de stock dans le réseau et leur utilisation par Supply Planning ; les horizons couvrent court, moyen et long terme. Limite : Fonctions d’une offre intégrée, pas prescription du parent FLOW d’Inventory Target Decision ou d’Inventory Planning. [Audit U533](../audits/2026-09-21-planning-U533/rapport.md), CMP218. Synthèse sélective et lien ; aucune réalisation installée inférée.


### ELM561

MKT20 — [Import Planned Orders](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fascp/import-planned-orders.html), 26B. Consulté le 21 septembre 2026. Passages : Introduction ; utilisation par Promising ; planned buy/make/transfer orders ; avertissement sur import de plusieurs plans. Identifiant natif non indiqué.

Reformulation : Oracle décrit des recommandations de plans utilisées par Promising avant la création effective de certains approvisionnements, puis leur articulation avec commandes et demandes d’achat. Limite : Oracle suppose certaines ressources planifiées admissibles à la promesse ; cette convention n’est pas adoptée pour FLOW. Planifié, engagé, attendu et réalisé doivent être qualifiés séparément. [Audit U533](../audits/2026-09-21-planning-U533/rapport.md), CMP218. Synthèse sélective et lien ; aucune réalisation installée inférée.


### ELM562

MKT20 — [Create a Forecasting Profile](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faurp/create-a-forecasting-profile.html), 26B. Consulté le 21 septembre 2026. Passages : Introduction ; Predefined Forecasting Profiles ; Input Measure et Output Measure. Identifiant natif non indiqué.

Reformulation : Les profils distinguent données historiques d’entrée, méthodes et résultats de prévision, avec des usages de bookings et de shipments. Limite : Configuration de produit et génération de prévisions ; ne prouve ni une capacité nommée Demand Plan Decision ni une méthode installée dans MAP. [Audit U533](../audits/2026-09-21-planning-U533/rapport.md), CMP218. Synthèse sélective et lien ; aucune réalisation installée inférée.


### ELM563

MKT20 — [Key Order Attributes](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faubm/key-order-attributes.html), 26B. Consulté le 21 septembre 2026. Passages : Planned Attributes ; Calculated Attributes ; Backlog Planning Control Attributes.

Reformulation : Backlog Management compare notamment dates prévues, retards, revenus et marges ; les dates planifiées se distinguent des dates programmées. Limite : Mesures disponibles et paramètres de planification ; ne démontre pas un solveur optimisant conjointement promesse, profit et équilibre de stock. [Audit U533–U536](../modeles/backlog/planning-model-audit-U533.yaml), CMP219. Synthèse sélective et lien.


### ELM564

MKT24 — [Supply Planning](https://help.sap.com/docs/SAP_INTEGRATED_BUSINESS_PLANNING/c1fb60cb1e9c49d99ada277ae57e9e6c/66a038fcf40f4f779c6b4696aede83a6.html), SAP IBP ; édition non restituée. Consulté le 21 septembre 2026. Passages : Présentation du supply planning order-based : purchasing, production and distribution plan.

Reformulation : SAP attribue à Supply Planning la construction d’un plan réalisable d’achats, de production et de distribution. Limite : Passage primaire indexé consulté ; ouverture directe sans texte exploitable. Périmètre produit, pas définition universelle d’une capacité. [Audit U533–U536](../modeles/backlog/planning-model-audit-U533.yaml), CMP219. Synthèse sélective et lien.


### ELM565

MKT13 — [Overview — SAP Ariba Procurement Planning](https://help.sap.com/docs/SAP_PROCUREMENT_PLANNING/aad8ff6e4e0c404591864a751c877d34/a728566dc02e4f4b91745878c3a40e05.html), Page évolutive ; édition non restituée. Consulté le 21 septembre 2026. Passages : About SAP Ariba Procurement Planning.

Reformulation : L’offre prépare les activités de procurement et leurs échéances, ainsi que les investissements à partir d’une nomenclature. Limite : Passage primaire indexé consulté ; ouverture directe sans texte exploitable. Atteste le terme Procurement Planning, avec un périmètre plus large et différent d’un simple plan de quantités d’achat textile ; pas équivalence FLOW. [Audit U533–U536](../modeles/backlog/planning-model-audit-U533.yaml), CMP219. Synthèse sélective et lien.


**Réexamen U535 — ELM496/ELM381 :** Oracle Overview of Backlog Management Processes 26B relu directement pour planification, revue, simulation et release ; édition antérieure conservée. SAP Supply Assignment Run Workflow using Apps, 2025 FPS01 (Feb 2026), passage primaire indexé consulté sur distribution sous contrainte et comparaison de simulations ; ouverture directe initiale sans texte exploitable. URLs et limites dans l’audit U533–U536. Pas de preuve d’un optimum conjoint promesse/profit/stock.


### ELM566

MKT20 — [Manually Release Plan Recommendations](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faupc/manually-release-plan-recommendations.html), Oracle 26B. Consulté directement le 21 septembre 2026. Nature : Processus ou fonction produit documenté. Identifiant natif non indiqué. Passage : Introduction ; release process ; submission to Supply Chain Orchestration.

Reformulation : Le plan peut donner lieu à de nouveaux Orders ou à leur replanification ; les demandes transmises et exceptions sont suivies. Limite : fonction produit, pas prescription de la hiérarchie de capacités FLOW ni preuve de réalisation Beaumanoir. Synthèse sélective et lien ; aucune reproduction substantielle. [Réexamen U537–U538](../modeles/backlog/plan-application-review-U537.yaml), CMP220.


### ELM567

MKT20 — [Overview of Supply Allocation Rules](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faubm/overview-of-supply-allocation-rules.html), Oracle 26B. Consulté directement le 21 septembre 2026. Nature : Processus ou fonction produit documenté. Identifiant natif non indiqué. Passage : Rules ; stealing protection ; Refresh and Plan after rule changes.

Reformulation : Des règles de priorité et de protection sont configurées et utilisées par le calcul du backlog ; les modifications requièrent une nouvelle planification. Limite : fonction produit, pas prescription de la hiérarchie de capacités FLOW ni preuve de réalisation Beaumanoir. Synthèse sélective et lien ; aucune reproduction substantielle. [Réexamen U537–U538](../modeles/backlog/plan-application-review-U537.yaml), CMP220.


**Réexamen U539–U541 :** ELM452 SAP Explaining Supply Assignment (Basics, Scenarios, Copying Assignments), ELM330 Camunda The Process Orchestration Handbook (coordination et dépendances), ELM411 Microsoft Inventory Visibility reservations (soft reservation et offsets) et ELM353 Oracle Order Management Statuses relu en **26B** ; éditions antérieures préservées. Sources primaires directement consultées le 21 septembre 2026. [Localisateurs, synthèses et limites](../modeles/backlog/planning-principle-audit-U540.yaml). CMP221 ; aucune preuve de réalisation installée ni hiérarchie FLOW déduite des produits.


### ELM568

MKT20 — [Publish Plan](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faspc/publish-plan-data.html), Oracle 26B. Source primaire directement consultée le 21 septembre 2026. Nature : fonction/processus produit ; identifiant natif non indiqué. Passage : When to Use ; Specifications.

Reformulation : Oracle permet de publier des données de plusieurs types de plans, dont Demand Management, vers des applications consommatrices. Limite : Le mécanisme documenté est un export technique. Il ne démontre pas, à lui seul, une autorisation métier ou la mise en vigueur d’une demande retenue. Synthèse sélective et lien. [Analyse U542](../modeles/backlog/planning-application-options-U542.yaml), CMP222.


### ELM569

MKT20 — [Supply Plan Options for Organizations and Schedules](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faspf/supply-plan-options-for-organizations-and-schedules.html), Oracle 26B. Source primaire directement consultée le 21 septembre 2026. Nature : fonction/processus produit ; identifiant natif non indiqué. Passage : Demand Schedules.

Reformulation : Un plan Supply peut utiliser un demand plan ou une prévision externe comme demande à couvrir. Limite : Le choix d’une entrée de plan étaye sa consommation, sans prouver un processus universel de publication ou une capacité séparée de gouvernance du forecast. Synthèse sélective et lien. [Analyse U542](../modeles/backlog/planning-application-options-U542.yaml), CMP222.


### ELM570

MKT20 — [Automatic Release Options](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fausp/automatic-release-options.html), Oracle 26B. Source primaire directement consultée le 21 septembre 2026. Nature : fonction/processus produit ; identifiant natif non indiqué. Passage : Release Planned Orders Automatically ; Include Rescheduled Supplies.

Reformulation : La mise en application peut suivre automatiquement le calcul ; le plan de réassort peut transmettre des révisions de commandes d’achat et de transfert non fermes. Limite : Les options diffèrent selon le type de plan ; leur paramétrage et leurs règles ne sont pas importés dans FLOW. Une copie de simulation n’hérite pas de la mise en application automatique. Synthèse sélective et lien. [Analyse U542](../modeles/backlog/planning-application-options-U542.yaml), CMP222.


**Réexamen U543 :** ELM375 Nextail Solution specifications (First Allocation, Replenishment, Store Transfers), ELM369 Oracle Overview of Inventory Rebalancing relu en 26B, ELM450 SAP Explaining Replenishment, ELM451 SAP Explaining Retail Allocation Management. Textes primaires directement consultés le 21 septembre 2026 ; éditions antérieures conservées. [Passages, synthèses et limites](../modeles/backlog/inventory-planning-intentions-U543.yaml), CMP223. Distinction des intentions documentée ; séparation en capacités Planning et consolidation autonome non déduites des produits.


**Réexamen U544 — ELM560/ELM479 :** SAP Inventory optimisation et RELEX Inventory optimization, sources primaires directement relues le 21 septembre 2026 sur équilibre service/stock/capital/coûts et cibles de réseau. Le titre RELEX actuellement affiché est « Inventory optimization: The key to improving your bottom line » ; date affichée 12 avril 2024, titre historique du registre conservé. [Passages et limites](../modeles/backlog/inventory-optimization-planning-option-U544.yaml), CMP224.


**Réexamen U546 — ELM496/ELM498 :** Oracle Overview of Backlog Management Processes 26B et Salesforce Explore Service Requests and Resolutions, cours évolutif Agentforce IT Service, directement relus le 21 septembre 2026. Passages : quatre activités de backlog ; Service Requests, Request Tracking, Resolving Requests. [Synthèses et limites](../modeles/backlog/backlog-request-planning-boundary-U546.yaml), CMP225. L’appui Salesforce reste une analogie ITSM, pas une preuve de taxonomie Supply.


**Réexamen U547 — ELM496/ELM498 :** mêmes documents Oracle 26B et Salesforce Agentforce IT Service directement relus sur parcours de Planning et gestion/suivi de demande. [Nouvelle option de rattachement et limites](../modeles/backlog/planning-request-behavior-option-U547.yaml), CMP226. Les sources étayent les fonctions métier, pas la hiérarchie Capability/Behavior proposée.


**Réexamen U557 — ELM419/566, ELM568/569, ELM334/412, ELM372/393 et ELM452/496 :** dix documents primaires directement consultés le 21 septembre 2026 pour l’audit de cohérence hors référentiels. Les éditions Oracle utilisées sont 26B, sauf ELM372 en 26C ; Microsoft, SAP Learning et commercetools sont des pages évolutives. Titres, localisateurs, URLs et synthèses sélectives dans [l’annexe U557](../modeles/backlog/model-coherence-audit-U557.yaml), CMP231. Les notices et consultations antérieures sont conservées. Comparaison ciblée des frontières et responsabilités, pas benchmark exhaustif du marché ni preuve de déploiement Beaumanoir.


**Réexamen U558 — ELM556/557 et ELM452 :** SAP Demand planning, Oracle Overview of Supply Chain Planning Plan Types 26B et SAP Learning Explaining Supply Assignment directement reconsultés le 21 septembre 2026. CMP232 distingue les apports des sources et les frontières FLOW. Les ouvertures directes de SAP Backorder Processing — Reassignment (ELM378) et EDQA (ELM495) ne fournissent pas de texte exploitable ; la preuve antérieure est conservée, sans nouvelle vérification intégrale revendiquée. [Constats et limites](../modeles/backlog/market-inspiration-audit-U558.yaml).


**Réexamen U560 — ELM419/334 ; reprise des appuis des comportements regroupés :** Microsoft Firm planned orders et commercetools Inventory overview directement reconsultés le 21 septembre 2026 pour distinguer proposition, engagement, politique configurée et réservation. Appuis antérieurs de CMP231–233 conservés. Recherche officielle complémentaire SAP sur les identifiants Reassignment (ELM378) et EDQA (ELM495) sans résultat exploitable ; les lectures historiques demeurent qualifiées comme telles. [Filiation des quatorze occurrences documentaires et éditions consolidées](../modeles/backlog/model-consolidation-U560.yaml), CMP234. Les sources, exemples et limites des anciens comportements BHV045–047/BHV088–090/BHV093 sont repris par leurs successeurs, sans recréer de comportements.


### ELM571

MKT20 — [Review Supplies and Demands with Project Pegging](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fausp/review-supplies-and-demands-with-project-pegging.html), Oracle 26B. Document primaire directement consulté le 21 septembre 2026. Nature : mécanisme de planification ; identifiant natif non indiqué. Passage : Review Plan Details, Pegging relationships between supplies and demands of the item.

Reformulation : les ressources du plan peuvent être reliées aux commandes et aux prévisions ; les quantités ainsi reliées sont consultables. Limite : planification par projet ; ce passage ne prouve ni une application transactionnelle séparée, ni le processus retail FLOW, ni le parent d’un comportement. Synthèse sélective et lien ; CMP235.

### ELM572

MKT13 — [Dynamic Pegging](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f899ce30af9044299d573ea30b533f1c/862ac95360267614e10000000a174cb4.html), SAP S/4HANA PP/DS. Page évolutive ; édition non établie pour le passage. Texte primaire indexé consulté le 21 septembre 2026 ; ouverture directe sans texte exploitable. Nature : mécanisme de planification ; identifiant natif non indiqué. Passages : Use, PP/DS heuristics et Features.

Reformulation : les besoins sont reliés aux stocks et réceptions du produit-lieu ; des besoins indépendants sans commande sont également traités. Limite : liens dynamiques de calcul, généralement non durables et sans précision propre au lot. Pas équivalence avec l’application d’une affectation retenue dans FLOW. Synthèse sélective et lien ; CMP235.

**Réexamen U562–U564 :** ELM496, Oracle Overview of Backlog Management Processes 26B, directement relu le 21 septembre 2026 : les activités documentées portent sur les commandes. La couverture de prévisions par un autre document de Supply Planning n’élargit pas automatiquement Backlog Management.


### ELM573

MKT14 — [Master planning with demand forecasts](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/demand-forecast), Microsoft Dynamics 365 Supply Chain Management. Documentation évolutive, mise à jour affichée 27 juillet 2026. Document primaire directement consulté le 21 septembre 2026 ; contenu accessible malgré un bandeau générique de connexion. Nature : processus de planification ; identifiant natif non indiqué. Passages : Introduction ; Set up a master plan to include a demand forecast ; Methods to reduce forecast requirements.

Reformulation : un master plan peut inclure les commandes et la prévision ; des méthodes permettent de consommer celle-ci par la demande réelle. Planning Optimization ne prend pas en charge un forecast planning séparé, ce qui ne supprime pas la responsabilité distincte de production des prévisions. Limite : master planning ERP produisant aussi des Planned Orders ; ne démontre ni le même optimiseur économique que FLOW ni la hiérarchie Planning/Decision/Behavior. Synthèse sélective et lien, CMP236.

### ELM574

MKT14 — [Design details - Balancing supply and demand](https://learn.microsoft.com/en-us/dynamics365/business-central/design-details-balancing-demand-and-supply), Microsoft Dynamics 365 Business Central. Documentation évolutive, édition produit non fixée ; document primaire directement consulté le 21 septembre 2026. Nature : mécanismes de planification, identifiant natif non indiqué. Passages : Order-to-order links ; Forecast demand is reduced by sales orders ; Priorities on the demand side.

Reformulation : commandes et prévisions restantes participent au profil de demande. Les ventes consomment les quantités prévisionnelles utilisées par le calcul, sans modifier nécessairement la prévision source. Limite : Business Central écarte des prévisions la création de liens contraignants order-to-order ; calcul commun ne signifie pas affectation persistante identique à FLOW. Les priorités documentées sont propres au produit et ne sont pas importées. Synthèse sélective et lien, CMP236.

**Réexamen U566 — ELM403 :** Microsoft Intelligent Fulfillment Optimization architecture, page mise à jour le 30 janvier 2026, directement relue le 21 septembre. Passages Fulfillment strategies et Fulfillment optimization in order orchestration flows : optimisation par lots de commandes et résultat par ligne. Aucun traitement des forecasts comme demandes dans ce même optimiseur démontré par ce document. La page Forecast reduction keys a également été consultée comme contexte, sans compter son contenu repris dans ELM573 comme une seconde preuve indépendante.


### ELM575

MKT14 — [Dynamic positive days for last-minute orders](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/dynamic-positive-days). Documentation évolutive ; mise à jour affichée 17 juin 2025. Consultation : 2026-09-21. Document primaire directement consulté. Nature : mécanisme ou processus produit ; identifiant natif non indiqué. Passage : Introduction ; Example scenario 2.

Reformulation : Dans un même scénario, SO1 est liée à PO1 existant et SO2 à un nouvel achat planifié créé par le calcul. Limite : Politique de couverture fondée sur délais et paramètres ; ne prouve pas un optimum conjoint service-profit-stock. Synthèse sélective et lien ; CMP237.


### ELM576

MKT13 — [Supply Creation-Based Confirmation (SBC) in PP/DS](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f899ce30af9044299d573ea30b533f1c/4c56297de7c33a0de10000000a42189c.html). 2025 FPS01 (Feb 2026). Consultation : 2026-09-21. Texte primaire indexé consulté ; ouverture directe sans texte exploitable. Nature : mécanisme ou processus produit ; identifiant natif non indiqué. Passage : Use ; Features ; Implementation Hints.

Reformulation : SBC peut déclencher PP/DS pour créer planned orders, purchase requisitions ou stock transfer requisitions pour le manque. Limite : Le processus décrit traite le besoin reçu ; ce n’est pas la preuve d’un recalcul global du carnet ni d’un appel SBC depuis ARun. Synthèse sélective et lien ; CMP237.


### ELM577

MKT13 — [Scenarios and Supported Features of PPAC and PAC with Supply Creation](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f132c385e0234fe68ae9ff35b2da178c/95cbb18b60da470cac8d340f0c6f5251.html). 2025 FPS01 (Feb 2026). Consultation : 2026-09-21. Texte primaire indexé consulté ; ouverture directe sans texte exploitable. Nature : mécanisme ou processus produit ; identifiant natif non indiqué. Passage : Scenarios and Supported Features — Supported features in aATP.

Reformulation : Pour PAC avec supply creation, BOP ne déclenche pas la création d’apports ; seul PAC est exécuté. Limite : Restriction de la version et du parcours documentés ; aucune exclusion universelle de toute intégration ou extension SAP. Synthèse sélective et lien ; CMP237.


### ELM578

MKT13 — [Supply Protection during Supply Assignment Run](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f132c385e0234fe68ae9ff35b2da178c/0d49c4e5eb7e41c5b0f41e769728ddef.html?locale=en-US&state=PRODUCTION&version=2025.001). 2025 FPS01 (Feb 2026). Consultation : 2026-09-21. Texte primaire indexé consulté ; ouverture directe sans texte exploitable. Nature : mécanisme ou processus produit ; identifiant natif non indiqué. Passage : Introduction ; Execution Modes and example.

Reformulation : Le run peut tenir compte des quantités de protection non consommées selon son mode configuré. Limite : Le document ne démontre pas que le run recalcule les seuils ou optimise automatiquement la politique de protection. Synthèse sélective et lien ; CMP237.


### ELM579

MKT13 — [Time-Series-Based Supply Planning Optimizer](https://help.sap.com/docs/SAP_INTEGRATED_BUSINESS_PLANNING/c1fb60cb1e9c49d99ada277ae57e9e6c/deb28978d5ba4c64bad78edcab913228.html). IBP 2605 — I_SAPIBP2. Consultation : 2026-09-21. Texte primaire indexé consulté ; ouverture directe sans texte exploitable. Nature : mécanisme ou processus produit ; identifiant natif non indiqué. Passage : Introduction ; Supply distribution ; Optimization ; Planning constraints.

Reformulation : Optimisation conjointe de production, distribution, achats et stock, sous contraintes et coûts du réseau modélisé. Limite : Planification par périodes, pas ARun ni preuve d’affectation transactionnelle à chaque commande. Les coûts du modèle ne valent pas toutes les dimensions de valeur FLOW. Synthèse sélective et lien ; CMP237.


**Réexamen U567 — ELM417, ELM303, ELM422, ELM378 :** CTP Microsoft, master plans et safety stock directement relus le 21 septembre 2026 ; documentation SAP BOP 2025 FPS01 consultée sous forme de texte primaire indexé, ouverture directe sans texte exploitable. Batch CTP, apports nouveaux, protection et modes preview sont distingués. Les anciennes éditions et preuves restent conservées. Les pages historiques SAP APO CTP ont servi de contexte ; leurs restrictions ne sont pas généralisées à S/4HANA. Détails dans modeles/backlog/integrated-supply-plan-U567.yaml.


### ELM580

MKT14 — [Master planning setup wizard](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/master-planning-setup-wizard), Microsoft Dynamics 365 Supply Chain Management. Documentation évolutive ; édition produit non fixée. Document primaire directement consulté le 21 septembre 2026. Nature : périmètre et exemple produit ; identifiant natif non indiqué. Passage : Example 2, Contoso Retailer.

Reformulation : un distributeur de mode utilise le master planning pour préparer ses achats selon les prévisions et les réassorts magasins. Limite : exemple fictif éditeur, pas déploiement Beaumanoir ni obligation d’affermissement automatique. Appui au nom Master Planning au-delà de la production, sans prescrire une Area FLOW. Synthèse sélective et lien ; CMP238.

### ELM581

MKT14 — [Design details: central concepts of the planning system](https://learn.microsoft.com/en-us/dynamics365/business-central/design-details-central-concepts-of-the-planning-system), Microsoft Dynamics 365 Business Central. Documentation évolutive ; édition produit non fixée. Document primaire directement consulté le 21 septembre 2026. Nature : processus et mécanismes de planification ; identifiant natif non indiqué. Passages : Introduction ; Dynamic order tracking versus the planning system ; Sequence and priority in planning.

Reformulation : le planning rapproche demandes et ressources et propose création, révision ou annulation d’apports. Il reprend les liens locaux pour traiter les besoins du périmètre ensemble. Limite : calcul avec sous-systèmes et ordre de traitement ; ordonnancement fin séparé, aucun optimum global universel ou fonctionnement en un seul calcul atomique démontré. Synthèse sélective et lien ; CMP238.

**Réexamen U568–U570 — ELM413/496 :** Microsoft Action messages, page mise à jour le 26 mars 2026, directement relue pour les propositions d’avancement, report et variation de quantité. Oracle Overview of Backlog Management Processes 26B directement relu pour étude, simulation et transmission des résultats. Les propositions ne sont pas confondues avec l’autorisation ou l’application ; la maille Capability/Behavior reste propre à FLOW.


### ELM582

MKT14 — [Cancel a planning job](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/cancel-planning-job). Documentation évolutive ; 2025-12-30. Consultation : 21 septembre 2026. Document primaire directement consulté. Nature : fonction ou processus produit ; identifiant natif non indiqué. Passage : Cancel an active planning job.

Reformulation : Annulation d’un calcul actif, avec état intermédiaire avant confirmation de l’arrêt. Limite : Fermer ou annuler le dialogue initial ne suffit pas. Aucune preuve de pause/reprise du calcul à son point d’arrêt. Synthèse sélective et lien ; CMP239/CMP240, [étude U573/U574](../modeles/backlog/master-plan-management-market-study-U573.yaml).


### ELM583

MKT14 — [View plan history and planning logs](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/plan-history-logs). Documentation évolutive ; 2026-02-26. Consultation : 21 septembre 2026. Document primaire directement consulté. Nature : fonction ou processus produit ; identifiant natif non indiqué. Passage : History ; logs ; auto-firming errors.

Reformulation : Historique des calculs, états et messages ; les erreurs de transformation automatique en Orders ont un journal distinct. Limite : Historique de traitements et durée de conservation des logs ne valent pas archivage métier complet des versions. Synthèse sélective et lien ; CMP239/CMP240, [étude U573/U574](../modeles/backlog/master-plan-management-market-study-U573.yaml).


### ELM584

MKT20 — [Actions to Manage Your Plans](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faspf/actions-to-manage-your-plans.html). 26B. Consultation : 21 septembre 2026. Document primaire directement consulté. Nature : fonction ou processus produit ; identifiant natif non indiqué. Passage : Create ; Duplicate ; Compare ; Approve ; Archive ; Release ; View Status Details.

Reformulation : Gestion des plans, variantes, comparaison, archivage et transmission des recommandations. Limite : Actions variables selon le type de plan ; Request Approval est propre au S&OP. Publication de données et application sont distinctes. Synthèse sélective et lien ; CMP239/CMP240, [étude U573/U574](../modeles/backlog/master-plan-management-market-study-U573.yaml).


### ELM585

MKT20 — [Batch Run Plan](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faspc/batch-run-plan.html). 26B. Consultation : 21 septembre 2026. Document primaire directement consulté. Nature : fonction ou processus produit ; identifiant natif non indiqué. Passage : Specifications ; Parameters for Supply Plan ; Troubleshooting Information.

Reformulation : Calcul ponctuel ou programmé, rafraîchissement choisi, contrôle du traitement, annulation et relance ; messages d’échec consultables. Limite : Fonctions de traitement ; ni arrêt des engagements déjà pris ni atomicité du plan. Approve Plan concerne la prévision dans le cas documenté. Synthèse sélective et lien ; CMP239/CMP240, [étude U573/U574](../modeles/backlog/master-plan-management-market-study-U573.yaml).


### ELM586

MKT13 — [Managing Your Scenarios](https://help.sap.com/docs/SAP_INTEGRATED_BUSINESS_PLANNING/b28ffdd739bf45678ef36c44e64652d7/3b510369251041b9a3c888854bd60195.html). IBP 2605, édition affichée par le texte indexé. Consultation : 21 septembre 2026. Texte primaire indexé consulté ; ouverture directe sans texte exploitable. Nature : fonction ou processus produit ; identifiant natif non indiqué. Passage : Manage Scenarios ; Copy ; Sync ; Reset ; Delete ; Share.

Reformulation : Scénarios copiables, partageables, synchronisables et supprimables ; réinitialisation depuis la référence. Limite : La synchronisation peut invalider des modifications. Reset du scénario ne défait pas des engagements externes. Synthèse sélective et lien ; CMP239/CMP240, [étude U573/U574](../modeles/backlog/master-plan-management-market-study-U573.yaml).


### ELM587

MKT13 — [Enhancements to Scenario Management](https://help.sap.com/docs/SAP_INTEGRATED_BUSINESS_PLANNING/a1759a7d2a544eecbfeb4bc6887211c5/2873fce3d74b4224a69bd20accd12551.html). IBP 2605 ; Excel add-in 2605.2.0 ; publication 2026-04-30. Consultation : 21 septembre 2026. Texte primaire indexé consulté ; ouverture directe sans texte exploitable. Nature : fonction ou processus produit ; identifiant natif non indiqué. Passage : Scenario Promotion ; OBP Planning Runs ; Change Summary.

Reformulation : Calculs OBP et simulations dans les scénarios harmonisés ; promotion de changements vers la référence avec suivi et justification possibles. Limite : Promotion conditionnée par la concurrence des calculs ; pas une preuve d’approbation humaine obligatoire ni de réalisation dans les systèmes d’exécution. Synthèse sélective et lien ; CMP239/CMP240, [étude U573/U574](../modeles/backlog/master-plan-management-market-study-U573.yaml).


### ELM588

MKT14 — [Maintain planned orders](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/maintain-planned-orders). Documentation évolutive ; 2025-08-05. Consultation : 21 septembre 2026. Document primaire directement consulté. Nature : fonction ou processus produit ; identifiant natif non indiqué. Passage : Planned order status ; Firming planned orders.

Reformulation : La transformation de Planned Orders crée de vrais Orders ; historique de cette transformation disponible. Limite : Le statut d’une proposition ne suffit pas à prouver un engagement fournisseur ni sa réalisation. Synthèse sélective et lien ; CMP239/CMP240, [étude U573/U574](../modeles/backlog/master-plan-management-market-study-U573.yaml).


### ELM589

MKT14 — [Make-to-order supply automation](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/make-to-order-supply-automation). Documentation évolutive ; édition produit non fixée. Consultation : 21 septembre 2026. Document primaire directement consulté. Nature : fonction ou processus produit ; identifiant natif non indiqué. Passage : Apply a single level of marking ; Control the pegging sequence.

Reformulation : Pegging décrit comment le calcul couvre les besoins ; marking établit un lien plus durable. La séquence peut garder les ressources proches pour les demandes tardives. Limite : Marking a des effets propres au produit ; aucune équivalence générale avec réservation FLOW. Pas un nom lisible unique couvrant toutes les actions du plan. Synthèse sélective et lien ; CMP239/CMP240, [étude U573/U574](../modeles/backlog/master-plan-management-market-study-U573.yaml).


### ELM590

MKT20 — [Split Order Lines Based on Date](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faubm/split-order-lines-based-on-date.html). 26B. Consultation : 21 septembre 2026. Document primaire directement consulté. Nature : fonction ou processus produit ; identifiant natif non indiqué. Passage : Exemple 100 unités en deux disponibilités ; restrictions.

Reformulation : Backlog Management peut prévoir une première livraison partielle, puis le complément à disponibilité. Limite : Sous conditions de fractionnement et de date acceptable ; découpage planifié ne prouve ni réservation ni livraison physique. Synthèse sélective et lien ; CMP239/CMP240, [étude U573/U574](../modeles/backlog/master-plan-management-market-study-U573.yaml).


### ELM591

MKT20 — [Source Items from Different Warehouses](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fauom/source-items-from-different-warehouses.html). 26B. Consultation : 21 septembre 2026. Document primaire directement consulté. Nature : fonction ou processus produit ; identifiant natif non indiqué. Passage : Choose a Warehouse ; Split the Fulfillment Line.

Reformulation : Changement d’entrepôt et découpage d’une ligne pour satisfaire la demande depuis plusieurs sites. Limite : Parcours Order Management documenté ; pas preuve d’une optimisation automatique de ces choix par tout master plan. Synthèse sélective et lien ; CMP239/CMP240, [étude U573/U574](../modeles/backlog/master-plan-management-market-study-U573.yaml).


### ELM592

MKT20 — [Define a Supply Allocation Rule](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faubm/define-a-supply-allocation-rule.html). 26B. Consultation : 21 septembre 2026. Document primaire directement consulté. Nature : fonction ou processus produit ; identifiant natif non indiqué. Passage : Allocation targets ; stealing protection ; Upload Quantity-Based Supply Allocations.

Reformulation : Quotas par groupes et périodes, rangs et protection contre la reprise de quantités ; prise en compte dans le backlog. Limite : Paramètres saisis/importés et consommation documentés ; optimisation automatique des seuils de groupe non démontrée. Synthèse sélective et lien ; CMP239/CMP240, [étude U573/U574](../modeles/backlog/master-plan-management-market-study-U573.yaml).


**Réexamen U573/U574 :** ELM416/418/435/421/371/410/369/363/496/566/570/413 directement relus le 21 septembre 2026. ELM303/571/574 réutilisés à partir des lectures directes documentées le même jour en U562–U567, sans nouvelle consultation revendiquée. Versions, passages et limites dans [l’annexe](../modeles/backlog/master-plan-management-market-study-U573.yaml). Le pegging, la réservation, les quotas de groupe, la promesse et la transmission de recommandations restent distincts.


**Réexamen U575 — ELM566/ELM588 :** Oracle Manually Release Plan Recommendations 26B et Microsoft Maintain planned orders (mise à jour 5 août 2025) directement relus le 21 septembre 2026. Passages : transmission et suivi des recommandations, firming et historique. Appuis partiels au regroupement Master Plan Application ; aucun des deux ne couvre à lui seul toutes les familles FLOW. CMP241, modeles/backlog/master-plan-application-U575.yaml.


### ELM593

MKT20 — [Understanding Oracle Value Chain Planning Integration Base Pack](https://docs.oracle.com/cd/E26401_01/doc.122/e96000/T669624T669627.htm). Documentation historique Oracle AIA / Value Chain Planning, contexte AIA 11.3 ; archive EBS 12.2. Document primaire directement consulté le 21 septembre 2026. Passage : Business Processes > Revise and Implement Plan Recommendations. Nature : Libellé de processus métier documenté dans un guide produit ; identifiant natif non indiqué.

Reformulation : Le processus métier nomme la mise en œuvre des recommandations du plan ; les suites comprennent la transmission de plans de production et distribution. Limite : Appui lexical historique, pas preuve du nom exact Plan Implementation ni de couverture Fusion actuelle ou de taxonomie universelle. Synthèse sélective et lien ; CMP242.


### ELM594

MKT14 — [About planning functionality](https://learn.microsoft.com/en-us/dynamics365/business-central/production-about-planning-functionality). Documentation évolutive ; mise à jour 2026-06-03. Document primaire directement consulté le 21 septembre 2026. Passage : Planning worksheets and requisition worksheets > Requisition worksheet ; Working with multilevel orders. Nature : Mécanisme produit de mise en œuvre des propositions ; identifiant natif non indiqué.

Reformulation : Les propositions de planification sont prises en charge par Carry Out Action Message, avec suites de création ou transmission selon le type de demande. Limite : Appui fonctionnel ; Microsoft ne nomme pas cette fonction Plan Implementation et le périmètre ne couvre pas toutes les familles FLOW. Synthèse sélective et lien ; CMP242.


### ELM595

MKT14 — [Run planning for a subset of items](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/plan-filters). Microsoft Dynamics 365 SCM, Planning Optimization ; documentation évolutive, mise à jour affichée 2023-09-29. Document primaire indexé consulté le 22 septembre 2026. Passages : Apply a plan filter ; Apply a runtime filter and set the BOM levels to include ; Combine plan filters and runtime filters. Identifiant natif non indiqué.

Reformulation : filtre de périmètre, calcul immédiat ou récurrent et exemples de calculs successifs. Limite : fonctions produit ; ni décomposition métier identique ni reprise au point d’arrêt démontrées. Synthèse et lien ; CMP243.


### ELM596

MKT14 — [Master planning home page](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/master-planning-home-page). Microsoft ; Documentation évolutive ; mise à jour affichée 2026-03-26. Consulté le 22 septembre 2026. Passage : Introduction ; main planning processes. Nature : définition de processus ou présentation de périmètre produit ; identifiant natif non indiqué.

Reformulation : Master Planning détermine les besoins nets et les apports à préparer ; sa portée dépasse le pilotage du calcul. Limite : Vocabulaire de module ERP, avec contexte industriel ; pas une équivalence exacte de périmètre FLOW. Synthèse et lien ; CMP245.


### ELM597

MKT24 — [What is sales and operations planning (S&OP)?](https://www.sap.com/india/resources/sop-sales-and-operations-planning). SAP ; Page évolutive ; édition non indiquée. Consulté le 22 septembre 2026. Passage : How does the S&OP process work? ; Plan review and reconciliation. Nature : définition de processus ou présentation de périmètre produit ; identifiant natif non indiqué.

Reformulation : Reconciliation apparaît dans une étape de revue, simulation et convergence entre plans de demande et de supply. Limite : Contexte S&OP ; ne démontre pas un intitulé transversal unique pour BOP, répartition et achats. Synthèse et lien ; CMP245.


### ELM598

MKT20 — [Oracle Supply Planning](https://www.oracle.com/scm/supply-chain-planning/supply-planning/). Oracle ; Page produit évolutive ; édition non indiquée. Consulté le 22 septembre 2026. Passage : Balance global demand and supply ; Honor customer commitments ; Respond to changing business conditions. Nature : définition de processus ou présentation de périmètre produit ; identifiant natif non indiqué.

Reformulation : Supply Planning couvre équilibre demande-ressources, arbitrages du carnet, scénarios et recommandations d’approvisionnement. Limite : Périmètre produit plus large, incluant production et capacité ; pas une taxonomie de capacités FLOW. Synthèse et lien ; CMP245.


### ELM599

MKT20 — [Run a Supply Plan or an Integrated Plan](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fausp/run-a-supply-plan-or-an-integrated-plan.html). Oracle ; 26B. Consulté le 22 septembre 2026. Passage : Introduction ; Scope Options. Nature : définition de processus ou présentation de périmètre produit ; identifiant natif non indiqué.

Reformulation : Demand and Supply Plan désigne un plan intégré combinant prévisions et planification de supply. Limite : Appui au terme Planning et à un périmètre intégré, pas au nom exact Demand & Supply Optimization. Synthèse et lien ; CMP245.

### ELM600

MKT14 — [Inventory forecasts](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/inventory-forecast). Microsoft Dynamics 365 SCM ; documentation évolutive, édition non indiquée. Consulté le 22 septembre 2026. Passages : introduction, Supply forecast lines, Demand forecast lines, Inventory forecast. Nature : fonctions produit ; identifiant natif non indiqué.

Reformulation : distinguer besoins prévisionnels, apports prévisionnels et position de stock résultante. Appui partiel aux frontières Demand/Supply/Inventory ; aucun découpage métier universel ni ajout canonique. CMP247 ; localisateurs et limites dans l'annexe U584.

### ELM601

MKT20 — [Setup of Interorganization Parameters for Transfer Orders](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/faims/setup-of-interorganization-parameters-for-transfer-orders.html). Oracle Fusion Cloud SCM 25C ; consulté le 22 septembre 2026. Passages : introduction et paramètres interorganisations. Nature : document métier dans un produit ; identifiant natif non indiqué.

Reformulation : un Transfer Order porte demande et apport dans un même document entre origine et destination. Appui à deux lectures liées d'une opération ; aucune duplication de capacité ni organisation logicielle imposée. Version consultée sans prétention de dernière édition. CMP247.

### ELM602

MKT77 — [Source Order Items](https://docs.fluentcommerce.com/by-type/source-order-items). Fluent Commerce ; documentation évolutive, Changed on 17 June 2026. Texte primaire indexé consulté le 22 septembre 2026 ; ouverture directe échouée. Passages : Overview, How it Works, Multi-Location Sourcing, Split Limit Constraints, Short-Pick Reallocation. Nature : fonctionnalité de produit ; identifiant natif non indiqué.

Reformulation : sélectionner des lieux, limiter le fractionnement et réaffecter après manque au prélèvement. La fonction combine choix et adaptation ; elle ne prescrit pas le parent FLOW de chaque décision. CMP247.

### ELM603

MKT77 — [Manage Sourcing Profiles](https://docs.fluentcommerce.com/by-type/manage-sourcing-profiles). Fluent Commerce ; documentation évolutive, Changed on 17 June 2026. Texte primaire directement consulté le 22 septembre 2026. Passages : Overview, How it Works, Default Parameter Controls, Workflow Automation Integration. Nature : configuration produit ; identifiant natif non indiqué.

Reformulation : maintenir et activer les configurations de réseaux, catalogues et limites utilisées par l'orchestration. Appui partiel à la distinction politique/décision ; aucune preuve d'un regroupement universel avec tous les référentiels. CMP247.

### ELM604

MKT20 — [Split or Substitute Fulfillment Lines](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/fascp/fulfillment-line-splits-and-substitutions.html), Oracle Fusion Cloud SCM 26A, consulté le 22 septembre 2026. Passages : introduction, Split a Warehouse, Substitute the Item, Consider Dates. Nature : fonction produit ; identifiant natif non indiqué.

Reformulation : fractionner la couverture entre lieux, articles ou dates selon les permissions applicables à la ligne. Appui aux effets métier présentés U585 ; ne démontre pas une réduction de l'obligation de vente initiale ni une capacité autonome par fonction. CMP249.

### ELM605

MKT78 — [CMMN 1.1](https://www.flowable.com/open-source/docs/cmmn/ch06-cmmn), Flowable open source documentation, consulté le 22 septembre 2026 ; version du moteur non fixée par la page. Passages : Human task, Java Service task, Decision task, Process task, Criteria, Sentry evaluation. Nature : langage et mécanismes d'un moteur ; identifiant natif de capacité non indiqué.

Reformulation : les tâches humaines, automatiques, décisionnelles et processus appelés sont mobilisés selon critères et événements du cas. Limite : constructions CMMN et extensions Flowable distinguées ; ni technologie imposée ni preuve d'état de l'art global. CMP250.

### ELM606

MKT40 — [Active/Inactive Flag Added to Service Provider](https://docs.oracle.com/en/cloud/saas/readiness/logistics/24a/otm24a/24A-otm-wn-f29771.htm), Oracle Transportation Management 24A. Consulté le 22 septembre 2026, introduction, Business Benefit, Steps to Enable. Nature : règle de recours à un prestataire dans un produit ; identifiant natif non indiqué.

Reformulation : exclure les prestataires inactifs des opérations de planification et recherche/recalcul tarifaire concernées, avec l'option FIND RATES OF ACTIVE SERVPROV ONLY en 24A. Limites : ni automatisme depuis des difficultés observées, ni annulation d'engagements établis démontrés. Appui partiel à Backing Service Policy, CMP251.

### ELM607

MKT40 — [Capacity Limit](https://docs.oracle.com/en/cloud/saas/transportation/26b/otmol/planning/capacity_manager/create_new_limit_data.htm), Oracle Transportation Management 26B. Consulté le 22 septembre 2026, Using A Capacity Limit, Recurring Capacity. Nature : contrainte de planification transport ; identifiant natif non indiqué.

Reformulation : limiter les expéditions pour un prestataire, un type d'équipement, éventuellement un trajet et une période. L'exemple limite à cinq expéditions et empêche la sixième faute de capacité. Limites : ne démontre pas la maîtrise Supply d'une politique ni la dérivation automatique d'un plafond depuis des incidents. CMP251.

### ELM608

MKT79 — [The Twelve-Factor App — IV. Backing services](https://www.12factor.net/backing-services), Adam Wiggins ; page affichant Last updated 2017. Consulté le 22 septembre 2026, définition, exemples et ressources attachées. Nature : concept d'architecture applicative ; identifiant natif IV.

Reformulation : service consommé par une application sur le réseau ; exemples de stockage, files de messages et caches. Limite : ne définit pas les prestations logistiques physiques du Domain. Appui lexical et différence de portée, CMP252.

### ELM609

MKT79 — [What is Cloud Native?](https://learn.microsoft.com/en-us/dotnet/architecture/cloud-native/definition), Microsoft .NET, documentation évolutive. Consulté le 22 septembre 2026, The Twelve-Factor Application, table facteurs 4 et 6. Nature : reprise documentaire d'une méthode ; identifiant natif non indiqué.

Reformulation : Backing Services désigne des ressources applicatives externes et adressables. Limite : reprise explicite de Twelve-Factor, sans preuve indépendante d'un sens métier logistique ni nomenclature de Policy. CMP252.

### ELM610

MKT40 — [Service Provider Assignment and Resource Management](https://docs.oracle.com/en/cloud/saas/transportation/25c/otmol/planning/capacity_manager/carrier_assignment_and_resource_management.htm), Oracle Transportation Management 25C. Consulté le 22 septembre 2026, Assigning Carrier and Equipment, Service Provider Assignment, Capacity Limits. Nature : décision et contraintes de planification transport ; identifiant natif non indiqué.

Reformulation : choix de prestataire et d'équipement selon contraintes de coût, délais, disponibilité et engagements ; noms Service Provider, Capacity Limits et Carrier Commitment attestés. Limite : la source ne nomme pas la capacité Service Provider Policy ; ce composé reste une adaptation FLOW proposée. CMP252.


### ELM611

MKT13 — [Customer Consignment](https://help.sap.com/docs/s4hana-cloud-best-practices/extended-intercompany-processes-for-sales-1wo-qa/customer-consignment). SAP S/4HANA Best Practices ; Scope item 1WO_QA ; édition non affichée dans le texte indexé. Consulté le 22 septembre 2026. Passages : Customer Consignment. Accès : Texte primaire indexé lu ; ouverture directe du portail sans corps de texte.

Reformulation : Distingue fill-up sans transfert de propriété, issue à la consommation/vente, pick-up des invendus et return après issue. Limites : Consignation de nos marchandises chez un client ; ne décrit pas la détention du stock de notre client dans notre entrepôt. Étude `modeles/backlog/consignment-orders-market-review-U595.yaml`, CMP256/CMP257 ; synthèse sélective et lien.


### ELM612

MKT20 — [Consigned Inventory](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/faims/consigned-inventory.html). Oracle Fusion Cloud SCM ; 26A. Consulté le 22 septembre 2026. Passages : Consignment Agreement ; Consignment Order ; Ship and Receive Items ; Consumption Advice. Accès : Page primaire directement lue.

Reformulation : Le demandeur appelle les marchandises sous accord de consignation ; réception et propriété fournisseur restent distinctes, puis avis de consommation et règlement. Limites : Point de vue acheteur/fournisseur ; ne démontre pas une prestation de garde du stock d’un client. Étude `modeles/backlog/consignment-orders-market-review-U595.yaml`, CMP256/CMP257 ; synthèse sélective et lien.


### ELM613

MKT32 — [Item Types](https://docs.oracle.com/en/industries/retail/retail-merchandising-foundation-cloud/21.0/rmsim/item-types.htm). Oracle Retail Merchandising Foundation Cloud Service ; 21.0, édition historique consultée. Consulté le 22 septembre 2026. Passages : Consignment and Concession Items. Accès : Page primaire directement lue.

Reformulation : Les articles consignés peuvent participer aux achats et transferts ; le régime de propriété est distinct de la transaction de déplacement. Consignation et concession sont également différenciées. Limites : Ne prouve ni une stratégie unique actuelle ni qu’un Transfer Order doit porter toute demande B2B. Étude `modeles/backlog/consignment-orders-market-review-U595.yaml`, CMP256/CMP257 ; synthèse sélective et lien.


### ELM614

MKT80 — [Release Notes for SAP Apparel and Footwear 6.5](https://help.sap.com/doc/29d6d66f79a142b18a2014c7e54ff392/6.5/en-US/Release_Notes_SAP_AFS_65E.PDF). SAP Apparel and Footwear Solution ; AFS 6.5 / ECC 6.0 EHP5 ; copyright 2011. Consulté le 22 septembre 2026. Passages : §4.5.4, page imprimée 18, page PDF 22 (index 21). Accès : PDF primaire directement lu, passage textuel ciblé.

Reformulation : À partir d’AFS 6.5, le stock en consignation fournisseur peut être vendu directement et pris en compte par AFS ATP, Allocation Run et les livraisons sortantes. Limites : Ne décrit pas le paramétrage installé ni l’ensemble des parcours de consignation client. Pas de reproduction du document, protégé par copyright. Étude `modeles/backlog/consignment-orders-market-review-U595.yaml`, CMP256/CMP257 ; synthèse sélective et lien.


### ELM615

MKT81 — [Consignment Orders](https://help.sap.com/docs/SAP_FASHION_MANAGEMENT/3d09d3032a1649f4abf6eea0a8f3ed11/a620215320ce9254e10000000a4450e5.html). SAP Fashion Management ; 1.0 SP13. Consulté le 22 septembre 2026. Passages : Use ; Process ; Consignment fill-up / issue / pick-up / return. Accès : Texte primaire indexé lu ; ouverture directe du portail sans corps de texte.

Reformulation : Les articles pertinents pour ARun mobilisent l’affectation dans la consignation client. Fill-up, issue et pick-up sont documentés ; return ne nécessite pas ARun. Le choix des stocks admissibles et le lancement immédiat dépendent du paramétrage. Limites : Fonctions FMS 1.0 SP13 ; ne pas les attribuer automatiquement à S/4HANA ni déduire quatre capacités de quatre documents. Étude `modeles/backlog/consignment-orders-market-review-U595.yaml`, CMP256/CMP257 ; synthèse sélective et lien.


### ELM616

MKT81 — [Vendor Consignment](https://help.sap.com/docs/SAP_ERP/f48e74ad3b3740bc8c9eaade394a3c1e/3daaa256c9006f15e10000000a441470.html?version=6.18.latest). SAP Fashion Management sur ERP ; ERP 6.0 EHP8, pointeur 6.18.latest ; prérequis FASHION_04. Consulté le 22 septembre 2026. Passages : Use ; Prerequisites ; Features. Accès : Texte primaire indexé lu.

Reformulation : Consignation fournisseur enrichie par saisons, segmentation et ARun ; affectation possible aux ventes/transferts et désaffectation automatique lors des retours de consignation fournisseur. Limites : Enrichissements attestés de Fashion ; le document ne prouve pas que toutes les dimensions étaient absentes d’AFS. Étude `modeles/backlog/consignment-orders-market-review-U595.yaml`, CMP256/CMP257 ; synthèse sélective et lien.


### ELM617

MKT81 — [Vendor Consignment and Order Allocation Run](https://help.sap.com/docs/SAP_ERP/39615c43587c4405aba2de8ebf33cd66/3d06ece43a61456db4b9bcd2ca1b167e.html). SAP Fashion / Retail sur ERP ; ERP 6.0 EHP8 SPS02 ; EA-RETAIL 618 SP2 ; FASHION_04. Consulté le 22 septembre 2026. Passages : Use ; Technical Details ; Additional Details. Accès : Texte primaire indexé lu ; ouverture directe du portail sans corps de texte.

Reformulation : Le stock consigné est mobilisable pour l’affectation ; des déplacements entre sites et sociétés peuvent conserver la catégorie consignée et la propriété fournisseur jusqu’à la vente. Limites : Scénario de consignation fournisseur Retail ; ni toute circulation entre sociétés ni tout contrat de consignation ne suit nécessairement ce paramétrage. Étude `modeles/backlog/consignment-orders-market-review-U595.yaml`, CMP256/CMP257 ; synthèse sélective et lien.


### ELM618

MKT13 — [Customer Consignment Process](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f132c385e0234fe68ae9ff35b2da178c/02084c34785749309d9dd5368b6a613a.html?locale=en-US). SAP S/4HANA aATP Supply Assignment ; 2025 FPS01, février 2026. Consulté le 22 septembre 2026. Passages : Customer Consignment Process with Supply Assignment (ARun) Relevant Materials. Accès : Texte primaire indexé lu ; ouverture directe du portail sans corps de texte.

Reformulation : Pour les articles concernés, seul le document de fill-up KB entre dans Supply Assignment ; KE, KA et KR en sont exclus dans cette documentation. Limites : Différence documentaire avec FMS 1.0 SP13 ; ne démontre pas seule toutes les règles de migration ni une incapacité à exécuter les autres parcours. Étude `modeles/backlog/consignment-orders-market-review-U595.yaml`, CMP256/CMP257 ; synthèse sélective et lien.


### ELM619

MKT80 — [Check Material Supply And Demand Allocation Creation](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/1dad2180e6f34b75ac77afce5cb5eda1/626fd75a5f8811dc2b8d000f20fcb6a9.html). SAP AFS Enterprise Services, IS-AFS-ARUN ; Composant P3A V605 ; documentation hébergée dans Enterprise Services 2025 FPS01. Consulté le 22 septembre 2026. Passages : Technical Data ; SupplyReference ; InventorySpecialStockTypeCode. Accès : Texte primaire indexé lu.

Reformulation : L’interface AFS d’affectation simulée distingue notamment le stock consigné chez le client et les catégories de stock/besoins. Limites : Contrat d’interface AFS identifié par composant et namespace ; son hébergement documentaire S/4HANA ne prouve pas un moteur AFS version 2025 ni le comportement complet de chaque Order. Étude `modeles/backlog/consignment-orders-market-review-U595.yaml`, CMP256/CMP257 ; synthèse sélective et lien.


### ELM620

MKT82 — [Consignment Stock](https://docs.infor.com/m3udi/16.x/en-us/m3beud/scexechs/mws020.html). M3 Business Engine, 16.x. Consulté le 22 septembre 2026. Passages : Terms used ; Replenishment ; Consumption ; Sell-back ; Claim of consignment goods. Accès : Page primaire directement lue. Nature : documents et opérations produit ; libellés natifs dans le passage cité, aucun identifiant natif supplémentaire relevé.

Reformulation : Consignment replenishment order : apport fournisseur sans acquisition. Usage PO : achat à la consommation. Sell-back order : retour de propriété de notre stock au fournisseur ; ne pas confondre avec une reprise physique de biens non consommés. Limites : Consignation fournisseur entrante ; aucun processus complet de consignation client établi par cette page. Étude `modeles/backlog/consignment-orders-market-review-U595.yaml`, CMP259 ; synthèse sélective et lien.


### ELM621

MKT83 — [Create Refill Order](https://docs.ifs.com/ifsclouddocs/25r2/Sales/ActivityCreateRefillOrder.htm). IFS Cloud, 25R2. Consulté le 22 septembre 2026. Passages : Explanation ; System Effects. Accès : Page primaire directement lue. Nature : documents et opérations produit ; libellés natifs dans le passage cité, aucun identifiant natif supplémentaire relevé.

Reformulation : Refill Order désigne une Customer Order alimentant le stock consigné chez le client. Limites : Documente le réapprovisionnement ; ne prouve pas que la première mise en place porte le même libellé. Étude `modeles/backlog/consignment-orders-market-review-U595.yaml`, CMP259 ; synthèse sélective et lien.


### ELM622

MKT83 — [Return or Scrap Customer Consignment Stock](https://docs.ifs.com/ifsclouddocs/25r2/Sales/ActivityReturnorScrapCustomerConsignmentStock.htm). IFS Cloud, 25R2. Consulté le 22 septembre 2026. Passages : Explanation ; Prerequisites ; System Effects. Accès : Page primaire directement lue. Nature : documents et opérations produit ; libellés natifs dans le passage cité, aucun identifiant natif supplémentaire relevé.

Reformulation : RMA de consignation pour retour de biens défectueux avant consommation ; crédit désactivé. Return peut donc désigner un retour de biens encore consignés. Limites : Cas documenté de défaut avant consommation, pas preuve de toutes les reprises commerciales. Titre retenu : H1 réel ; la métadonnée de page affiche Report Quantity Consumed. Étude `modeles/backlog/consignment-orders-market-review-U595.yaml`, CMP259 ; synthèse sélective et lien.


### ELM623

MKT83 — [Create Purchase Order from Arrival](https://docs.ifs.com/ifsclouddocs/25r2/Receipt/ActivityPOArrivalCreate.htm). IFS Cloud, 25R2. Consulté le 22 septembre 2026. Passages : Explanation ; note customer-owned parts. Accès : Page primaire directement lue. Nature : documents et opérations produit ; libellés natifs dans le passage cité, aucun identifiant natif supplémentaire relevé.

Reformulation : Une Purchase Order peut enregistrer après arrivée des biens appartenant au client ; le propriétaire est porté sur la ligne. Limites : Réemploi documentaire produit, sans assimilation de la détention pour compte client à un achat effectif. Ne définit pas une famille universelle d’Orders de garde. Étude `modeles/backlog/consignment-orders-market-review-U595.yaml`, CMP259 ; synthèse sélective et lien.


### ELM624

MKT20 — [Examples of Consigned Inventory Returns](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/famml/examples-of-consigned-inventory-returns.html). Fusion Cloud SCM, 25D. Consulté le 22 septembre 2026. Passages : Material Received and Put Away ; Material Consumed, advice generated or not. Accès : Page primaire directement lue. Nature : documents et opérations produit ; libellés natifs dans le passage cité, aucun identifiant natif supplémentaire relevé.

Reformulation : Return to supplier couvre des situations avant et après consommation ; état de propriété et avis de consommation déterminent les opérations et suites financières. Limites : Consignation fournisseur ; la page ne définit pas les quatre types d’Orders SAP. Édition 25D distincte de la présentation Oracle 26A ELM612. Étude `modeles/backlog/consignment-orders-market-review-U595.yaml`, CMP259 ; synthèse sélective et lien.


### ELM625

MKT13 — [Consignment Stock Processing](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/7b24a64d9d0941bda1afa753263d9e39/da65b65334e6b54ce10000000a174cb4.html). S/4HANA Sales 2025 FPS01 (février 2026). Consulté le 22 septembre 2026. Passages : Use ; Consignment Issue. Accès : Texte primaire indexé consulté. Nature : processus et documents produit, identifiants natifs conservés lorsqu’indiqués.

Reformulation : Le client détenteur peut utiliser ou revendre les biens. Issue lui en transfère la propriété et devient facturable. Limite : Point de vue du propriétaire fournisseur ; le client SAP correspond ici au détenteur, pas au client propriétaire décrit par Laurent. CMP261 et étude U595 ; synthèse sélective et lien.


### ELM626

MKT13 — [Special Features for Consignment Processing](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/7b24a64d9d0941bda1afa753263d9e39/c020bf53d25ab64ce10000000a174cb4.html). S/4HANA Sales 2025 FPS01 (février 2026). Consulté le 22 septembre 2026. Passages : Introduction ; sales document type ED. Accès : Texte primaire indexé consulté. Nature : processus et documents produit, identifiants natifs conservés lorsqu’indiqués.

Reformulation : Des agents déclarent les livraisons réalisées au client pour le compte du propriétaire ; ED est nommé Delivery by external agent (consignment issue). Limite : Livraison pour compte documentée ; pas preuve d’un mandat commercial complet ni de sa réalisation dans le SI du mandataire. CMP261 et étude U595 ; synthèse sélective et lien.


### ELM627

MKT13 — [Create Consignment Issue Order with Reference to Scheduling Agreement Manually (non-JIT)](https://help.sap.com/docs/s4hana-cloud-best-practices/automotive-supply-to-customer-inventory-management-55f-ro/create-consignment-issue-order-with-reference-to-scheduling-agreement-manually-non-jit?locale=en-US&state=PRODUCTION&version=2608). S/4HANA Cloud Best Practices 2608 ; Automotive Supply to Customer – Inventory Management 55F_RO. Consulté le 22 septembre 2026. Passages : Note ; Purpose. Accès : Texte primaire indexé consulté. Nature : processus et documents produit, identifiants natifs conservés lorsqu’indiqués.

Reformulation : Issue est normalement généré depuis un avis de livraison de l’agent ou du client ; la création manuelle présentée sert aux tests. Limite : Scénario automobile à accord de livraison ; ne prouve ni processus Fashion identique ni demande indépendante émise avant exécution. CMP261 et étude U595 ; synthèse sélective et lien.


### ELM628

MKT13 — [Sales Documents](https://help.sap.com/docs/SAP_S4HANA_CLOUD/a376cd9ea00d476b96f18dea1247e6a5/aa64b65334e6b54ce10000000a174cb4.html). S/4HANA Cloud Public Edition, Sales 2608 Latest. Consulté le 22 septembre 2026. Passage : Concepts / Sales Document Types. Texte primaire indexé lu. Nature : document et processus produit. Identifiant natif lorsqu’indiqué dans le constat.

Reformulation : Consignment Issue et Fill-up sont des exemples de types de Sales Order ; le type détermine données, contrôles et suites. Limite : Taxonomie documentaire SAP ; ne détermine pas la maille des capacités FLOW. CMP262 ; synthèse sélective et lien.


### ELM629

MKT13 — [Creating a Consignment Issue](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/7b24a64d9d0941bda1afa753263d9e39/e665b65334e6b54ce10000000a174cb4.html). S/4HANA Sales 2025 FPS01 (février 2026). Consulté le 22 septembre 2026. Passage : Étapes 1, 4–6. Texte primaire indexé lu. Nature : document et processus produit. Identifiant natif lorsqu’indiqué dans le constat.

Reformulation : Création d’une Sales Order de consignation, suivie d’une livraison, d’une sortie de stock puis d’une facturation. Limite : Pas uniquement un document juridique ; ne prescrit pas deux demandes initiales concurrentes. CMP262 ; synthèse sélective et lien.


### ELM630

MKT13 — [Create Consignment Issue Order](https://help.sap.com/docs/SAP_S4HANA_CLOUD_BEST_PRACTICES/9f5a580825ded5ac1ab823cac86b9f51/01da39ad1a084dd4939b361dacd11006.html?locale=en-US&state=PRODUCTION&version=2608). S/4HANA Cloud Best Practices 2608, Sales from Distribution Center 3HS_HU. Consulté le 22 septembre 2026. Passage : Purpose ; Procedure 2–7. Texte primaire indexé lu. Nature : document et processus produit. Identifiant natif lorsqu’indiqué dans le constat.

Reformulation : Après déclaration périodique des quantités vendues ou consommées, création d’une Sales Order de type CCIS pour documenter Issue et permettre la facturation. Limite : Perspective du consignateur ; la vente au client final et la relation consignateur/détenteur restent distinctes. CCIS propre à cette édition/scénario, pas renommage universel de KE. CMP262 ; synthèse sélective et lien.


### ELM631

MKT84 — [Goods Return Request: Contents Tab](https://help.sap.com/docs/PRODUCT_ID/68a2e87fb29941b5bf959a184d9c6727/b3b60a16edfc4bafacc0fc7a1fd0766a.html). Business One, 10.0. Consulté le 22 septembre 2026. Passages : Introduction ; Quantity ; Return Reason. Texte primaire indexé lu. Nature : documents et processus produit ; aucun identifiant natif supplémentaire relevé.

Reformulation : Goods Return Request concerne les articles achetés et retournés au fournisseur. Limite : Usage lexical SAP Business One, pas SAP S/4HANA ni une taxonomie générale de capacités. CMP263 ; synthèse sélective et lien.


### ELM632

MKT14 — [Sales returns](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/sales-returns). Dynamics 365 SCM, Documentation évolutive consultée le 22 septembre 2026. Consulté le 22 septembre 2026. Passages : Return order process ; Return material authorization. Texte primaire indexé lu. Nature : documents et processus produit ; aucun identifiant natif supplémentaire relevé.

Reformulation : La demande de retour client déclenche une Return Order/RMA. Les parcours physiques et Credit only sont distingués ; retour autorisé ne signifie pas acceptation ou crédit acquis. Limite : Appui à l’intention de retour après vente ; ne documente pas la famille exacte Goods Return / Customer Return / Consignment Return. CMP263 ; synthèse sélective et lien.


### ELM633

MKT04 — [SAP Reference Business Architecture: Business Domain → Business Area → Business Capability](https://learning.sap.com/courses/intelligent-enterprise-architecture-fundamentals/defining-business-architecture). Cours évolutif ; consulté le 22 septembre 2026. Consulté le 22 septembre 2026. Passage : Business Capability Model, niveaux 1–3 ; distinction avec Business Process Segment. Texte primaire ouvert.

Area regroupe les capacités ; chaque capacité appartient à une Area puis à un Domain. SAP fixe trois niveaux de granularité. Limite : La structure est explicite ; elle ne fournit pas un test universel pour décider où couper une Area. Le Business Process Segment est un objet différent, même si son nom peut coïncider. Correspondance proposée CMP265 ; U620/U621. [Étude](etudes/2026-09-22-area-level.md).


### ELM634

MKT85 — [DDD — Nick Tune: Domain et Subdomain](https://nick-tune.me/blog/2020-11-25-domain-subdomain-bounded-context-problem-solution-space-in-d/). Article du 25 novembre 2020. Consulté le 22 septembre 2026. Passage : Subdomains ; Subdomains vs Bounded Contexts ; Problem Space vs Solution Space. Texte original de l’auteur ouvert.

Subdomain est relatif : un domaine est qualifié de sous-domaine par rapport à son parent. Plusieurs découpages restent possibles. Limite : Point de vue argumenté d’un praticien, pas norme DDD. L’auteur conteste lui-même la séparation trop simple entre espaces du problème et de la solution. Correspondance proposée CMP265 ; U620/U621. [Étude](etudes/2026-09-22-area-level.md).


### ELM635

MKT69 — [Microsoft — analyse DDD: Subdomain / Bounded Context](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis). Documentation évolutive. Consulté le 22 septembre 2026. Passage : Analyze the domain ; Define bounded contexts. Texte primaire ouvert.

Identifier fonctions proches et dépendances pour dégager les sous-domaines. Le bounded context délimite l’application d’un modèle particulier. Limite : Guide orienté conception de microservices ; aucune obligation de convertir une Area FLOW en service logiciel. Core/supporting/generic qualifie l’importance stratégique, pas la profondeur. Correspondance proposée CMP265 ; U620/U621. [Étude](etudes/2026-09-22-area-level.md).


### ELM636

MKT01 — [The Open Group — TOGAF: Stratification / Leveling](https://governance.foundation/assets/frameworks/togaf/g189%20-%20Business%20Capbility.pdf). G189, juin 2018. Consulté le 22 septembre 2026. Passage : §§3.2.1–3.2.2, pages imprimées 9–10. Document primaire historique ouvert sur hébergement tiers.

Sépare classement en catégories et décomposition des capacités. La profondeur répond aux besoins des lecteurs et des décisions. Limite : Guide V2 sur le site officiel inaccessible pendant cette étude. Aucun détail de 2018 attribué automatiquement à une édition actuelle ; aucune classe Area imposée par ces passages. Correspondance proposée CMP265 ; U620/U621. [Étude](etudes/2026-09-22-area-level.md).


### ELM637

MKT03 — [Business Architecture Guild: Capability decomposes into capability](https://cdn.ymaws.com/www.businessarchitectureguild.org/resource/resmgr/whitepapers/Business_Architecture_Metamo.pdf). Metamodel Guide v3.0, septembre 2024. Consulté le 22 septembre 2026. Passage : §5.2, pages imprimées 17–18 ; §6.3, page 45. PDF primaire ouvert.

Décomposition récursive de capacités centrées sur un objet métier. Les enfants restent dans le périmètre de l’objet parent. Limite : Livre blanc public, pas lecture intégrale du BIZBOK. FLOW distingue déjà Area et Capability ; une Area réunissant plusieurs objets ne doit pas être déclarée équivalente à cette décomposition. Correspondance proposée CMP265 ; U620/U621. [Étude](etudes/2026-09-22-area-level.md).


### ELM638

MKT18 — [BIAN / Van Haren: Business Area → Business Domain → Service Domain](https://www.vanharen.net/wp-content/uploads/2026/02/syllabus-BIAN-Foundation-v3.8.pdf). Syllabus BIAN Foundation v3.8. Consulté le 22 septembre 2026. Passage : Key terms and concepts, pages imprimées 24–26. Syllabus primaire de certification ouvert.

Area et Domain organisent la présentation du Service Landscape. Le Service Domain porte une responsabilité fonctionnelle élémentaire. Limite : Ordre Area/Domain inverse de SAP ; cadre bancaire. La structure de présentation ne suffit pas à attribuer une responsabilité opérationnelle au regroupement. Correspondance proposée CMP265 ; U620/U621. [Étude](etudes/2026-09-22-area-level.md).


### ELM639

MKT07 — [APQC: Category → Process group → Process → Activity → Task](https://www.apqc.org/How-Can-Organizations-Classify-and-Organize-Their-Processes-Using-a-Common-Framework). Page créée septembre 2026 ; PCF 8.0 cité. Consulté le 22 septembre 2026. Passage : Common hierarchy ; paragraphes sur management, accountability, measurement et improvement. Texte primaire ouvert.

La catégorie regroupe les processus au plus haut niveau ; le groupe de processus contribue à cette catégorie. Le détail sert pilotage, mesure et amélioration. Limite : Taxonomie de processus ; Process Group ne devient pas automatiquement une Area de capacités. La page générale ne constitue pas une lecture du catalogue Retail complet. Correspondance proposée CMP265 ; U620/U621. [Étude](etudes/2026-09-22-area-level.md).


### ELM640

MKT06 — [IBM Component Business Model: Business Competency × Accountability Level](https://public.dhe.ibm.com/software/emea/dk/frontlines/g510-6163-component-business-models.pdf). Publication historique, ©2005. Consulté le 22 septembre 2026. Passage : The CBM framework ; figure 5, page imprimée 7. Passage primaire indexé consulté ; ouverture directe en échec 502.

Les compétences regroupent l’activité ; un axe distinct distingue Direct, Control et Execute. Les composants coopèrent selon des niveaux de service convenus. Limite : Matrice de conception et réalisation métier ; pas une hiérarchie Domain/Area/Capability. N’impose pas de réintroduire des couches dans FLOW. Correspondance proposée CMP265 ; U620/U621. [Étude](etudes/2026-09-22-area-level.md).


### ELM641

MKT25 — [SAP LeanIX: Business Capability L1 / L2 / L3](https://help.sap.com/docs/leanix/ea/business-capability-modeling-guidelines?locale=en-US). Métamodèle v4 ; documentation évolutive. Consulté le 22 septembre 2026. Passage : Guidelines and Best Practices ; Antipatterns. Texte primaire indexé détaillé ; ouverture directe vide.

Hiérarchie de capacités ; recommande généralement trois niveaux au plus et une affectation non ambiguë des enfants. Distingue organisation, processus et technologie. Limite : Conseil d’usage produit, pas contrainte ontologique universelle. Même groupe SAP que RBA, donc pas une preuve indépendante de consensus. Correspondance proposée CMP265 ; U620/U621. [Étude](etudes/2026-09-22-area-level.md).


### ELM642

MKT26 — [Ardoq: Business Capability récursive](https://help.ardoq.com/en/articles/44050-business-capability-modeling-and-realization-metamodel). Article du 19 novembre 2025. Consulté le 22 septembre 2026. Passage : Business Capability Workspace ; Component Level. Texte primaire indexé détaillé ; ouverture directe 401.

Un même type Business Capability se décline en hiérarchie à profondeur libre ; le niveau sert notamment aux vues et filtres. Limite : Métamodèle d’outil ; la flexibilité ne prouve pas la pertinence métier d’un découpage. Contenu conservé après intégration de l’ancien bundle dans Foundation. Correspondance proposée CMP265 ; U620/U621. [Étude](etudes/2026-09-22-area-level.md).


### ELM643

MKT13 — [Describing Deployment Planning and Reasoning behind Execution](https://learning.sap.com/courses/mastering-sap-ibp-for-response-and-supply-order-based-planning/describing-deployment-planning-and-reasoning-behind-execution_ed054de6-f7e2-4928-89be-2dab21e6a043). Cours SAP Learning évolutif, sans édition affichée dans le passage. Consulté directement le 23 septembre 2026. Nature : Documentation fonctionnelle ou formation produit. Identifiant natif non indiqué. Passage : Deployment Plan in SAP S/4HANA ; Deployment Status.

Reformulation : Intégrer les demandes de transfert du plan dans S/4HANA, puis les convertir en ordres de transfert avec statuts cohérents. Limite : Appui spécialisé au déploiement de stock ; conversion et intégration ne prouvent ni transfert physique ni cycle complet des notifications client. Synthèse sélective et lien ; aucune reproduction substantielle. CMP266, U636 ; [étude](../modeles/backlog/apply-plan-market-review-U636.yaml).


### ELM644

MKT20 — [Examine Error Messages for Sales Orders](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/fauom/examine-error-messages-for-sales-orders.html). 26A. Consulté directement le 23 septembre 2026. Nature : Documentation fonctionnelle ou formation produit. Identifiant natif non indiqué. Passage : Order Management Rejects a Change Order.

Reformulation : Refuser et tracer une modification de commande lorsque l’expédition a déjà eu lieu. Limite : Exemple de changement demandé par le client, pas de déclenchement démontré par Planning ; appui à la frontière de l’application. Synthèse sélective et lien ; aucune reproduction substantielle. CMP266, U636 ; [étude](../modeles/backlog/apply-plan-market-review-U636.yaml).


### ELM645

MKT20 — [Working with E-Mail Notification Templates (WEMT)](https://docs.oracle.com/en/industries/retail/retail-oms-suite-cloud/25.2.301.0/romoh/WEMT.htm). Oracle Retail OMS Suite Cloud 25.2.301.0. Consulté directement le 23 septembre 2026. Nature : Documentation fonctionnelle ou formation produit. Identifiant natif non indiqué. Passage : Summary of Customer Correspondence ; Backorder Notification Email Sample and Contents.

Reformulation : Générer des notifications client pour attentes de livraison, annulations et autres événements de commande. Limite : Fonction Order Administration distincte de Fusion Planning ; aucun lien natif automatique entre release du plan et mail n’est démontré. Synthèse sélective et lien ; aucune reproduction substantielle. CMP266, U636 ; [étude](../modeles/backlog/apply-plan-market-review-U636.yaml).


### ELM646

MKT14 — [Work line details](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/work-line-details). Documentation évolutive Microsoft Dynamics 365 Supply Chain Management ; mise à jour affichée 2025-10-03. Texte primaire consulté le 23 septembre 2026. Passage : Part 3, Change the quantity of a work line or cancel a work line.

Reformulation : réduction partielle du travail de préparation et ajustement du chargement associé. Limite : fonction opérationnelle, pas droit général de modifier une commande ; aucune réalisation installée démontrée. Synthèse sélective, sans reproduction substantielle ni identifiant natif inventé. CMP267 ; [portée U642](../modeles/backlog/partial-order-revision-U642.yaml).


### ELM647

MKT28 — [What is transportation management?](https://www.kinaxis.com/en/transportation-management). Page Kinaxis évolutive, édition non affichée. Texte primaire consulté le 23 septembre 2026 ; passage : From integration to end-to-end supply chain orchestration.

Reformulation : planification et exécution dans une même boucle de décision, en conservant le lien avec les engagements. Appui au sens large d’Orchestration ; pas de preuve du nom exact FLOW ni d’un déploiement. Synthèse sélective sans reproduction substantielle ; identifiant natif non indiqué. CMP268, U646.


### ELM648

MKT20 — [Overview of Demand Management](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fasdm/overview-of-demand-management.html). Fusion Cloud SCM 25C. Texte primaire consulté le 23 septembre 2026. Passage : Introduction et liste des fonctions.

Reformulation : Demand Management couvre prévision, signaux et plans de demande. Limite : Ce sens diffère de la gestion d’une intention opérationnelle durable dans FLOW ; le titre commercial ne définit pas tous les usages du terme. Synthèse sélective et lien ; aucun identifiant natif inventé ni déploiement déduit. CMP269, U658 ; [comparaison des sous-domaines](../modeles/backlog/subdomains-market-review-U658.yaml).


### ELM649

MKT13 — [Outlining Program Planning](https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-public-edition-manufacturing-production-planning/outlining-program-planning_be612648-050c-4353-a60a-808b38c67c5a). Cours S/4HANA Cloud Public Edition, édition non affichée. Texte primaire consulté le 23 septembre 2026. Passage : Production Planning Overview ; Demand Management Overview.

Reformulation : Les prévisions IBP alimentent des besoins indépendants planifiés, consommés par des commandes selon la stratégie. Demand Management gère leur interaction pour alimenter MRP. Limite : Exemple de production, pas modèle universel de retail ; ne démontre pas l’externalisation de toute décision de couverture. Synthèse sélective et lien ; aucun identifiant natif inventé ni déploiement déduit. CMP269, U658 ; [comparaison des sous-domaines](../modeles/backlog/subdomains-market-review-U658.yaml).


### ELM650

MKT20 — [Overview of Backlog Management Processes](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faubm/overview-of-backlog-management-processes.html). Fusion Cloud SCM 26B. Texte primaire consulté le 23 septembre 2026. Passage : Quatre activités : planning, review, simulation, release.

Reformulation : Prioriser un portefeuille, construire un plan, tester des ajustements et libérer les résultats vers Order Management ; les simulations ne modifient pas seules les commandes. Limite : Le portefeuille de commandes ne représente pas toutes les formes de demande FLOW ; pas de plan technique unique imposé. Synthèse sélective et lien ; aucun identifiant natif inventé ni déploiement déduit. CMP269, U658 ; [comparaison des sous-domaines](../modeles/backlog/subdomains-market-review-U658.yaml).


### ELM651

MKT20 — [Overview of Orchestration Processes](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faiom/orchestration-processes.html). Fusion Cloud SCM 26B. Texte primaire consulté le 23 septembre 2026. Passage : Introduction ; Set up Steps ; Set Up Statuses.

Reformulation : Des tâches appellent les services des systèmes exécutants ; dépendances, suivi, changements et fin des prestations sont paramétrés. Limite : Exemple Sales Order incluant réservation et facturation ; ni périmètre identique FLOW ni workflow unique obligatoire. Synthèse sélective et lien ; aucun identifiant natif inventé ni déploiement déduit. CMP269, U658 ; [comparaison des sous-domaines](../modeles/backlog/subdomains-market-review-U658.yaml).


### ELM652

MKT20 — [How Order-to-Cash Works in Order Management](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/faiom/how-order-to-cash-works-in-order-management.html). Fusion Cloud SCM 26A. Texte primaire consulté le 23 septembre 2026. Passage : Étapes 1 à 4 : données produit, règles, promesse et interfaces.

Reformulation : Order Management utilise Product Management et Supply Chain Planning puis sollicite les systèmes de réalisation et reçoit leur progression. Limite : Parcours de vente plus large que FLOW, avec prix et finance ; ne généralise pas Sales Order à tous les besoins. Synthèse sélective et lien ; aucun identifiant natif inventé ni déploiement déduit. CMP269, U658 ; [comparaison des sous-domaines](../modeles/backlog/subdomains-market-review-U658.yaml).


### ELM653

MKT13 — [Explaining aATP](https://learning.sap.com/courses/exploring-fashion-functions-and-business-processes-in-sap-s-4hana-for-fashion-and-vertical-business/explaining-aatp_a1595e13-8923-4514-b889-ec4f63ef1ad5). Cours S/4HANA Fashion, édition non affichée. Texte primaire consulté le 23 septembre 2026. Passage : Product Availability Check ; ATP Concept ; Alternative-Based Confirmation.

Reformulation : Vérifier quantités et dates selon éléments de supply et promesses existantes ; examiner et choisir des sites alternatifs. Limite : aATP traverse les frontières Availability / Matching / Fulfilment proposées ; ce cours ne prouve pas une correspondance complète de CTP et PTP. Synthèse sélective et lien ; aucun identifiant natif inventé ni déploiement déduit. CMP269, U658 ; [comparaison des sous-domaines](../modeles/backlog/subdomains-market-review-U658.yaml).


### ELM654

MKT14 — [Results of DOM runs](https://learn.microsoft.com/en-us/dynamics365/commerce/dom-runs-results). Documentation évolutive, mise à jour affichée le 23 janvier 2026. Texte primaire consulté le 23 septembre 2026. Passage : Fulfillment plans ; Order line statuses.

Reformulation : Le résultat est un plan indiquant quantités et lieux affectés ; il peut être examiné ou appliqué, avec traitement explicite de conflits et de parties non affectées. Limite : Plan de fulfillment Commerce ; ne couvre pas à lui seul tout le plan de supply FLOW. Synthèse sélective et lien ; aucun identifiant natif inventé ni déploiement déduit. CMP269, U658 ; [comparaison des sous-domaines](../modeles/backlog/subdomains-market-review-U658.yaml).


Actualisation de consultation ELM438 / ELM328 — 23 septembre 2026, U667–U668, CMP270 : les pages Microsoft [Specify how to dispose of returned items](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/specify-how-to-dispose-of-returned-items) (mise à jour affichée 2025-05-07, dispositions et actions) et Blue Yonder [Smart Disposition](https://blueyonder.com/solutions/returns-management/smart-disposition) (sans édition affichée, Overview, Intelligent routing, Configure and enforce policy) ont été relues. Elles éclairent la décision sur le devenir, pas son rattachement aux sous-domaines FLOW. Synthèses et limites dans la comparaison ciblée de [l’audit U667](../modeles/backlog/capability-subdomain-audit-U667.yaml) ; aucune importation substantielle ni nouvelle équivalence adoptée.


### ELM655

IBM — [Promising service](https://www.ibm.com/docs/en/sip?topic=overview-promising-service), documentation évolutive, édition exacte non affichée. Consultation le 23 septembre 2026 : passage primaire indexé, ouverture directe refusée HTTP 403. Nature : service produit ; identifiant natif non relevé. Localisateur : présentation du service, données inventory/capacity et delivery timelines. Reformulation : le service consomme stocks et capacités pour déterminer une réponse de promesse et annonce des calculs sous la seconde. Limite : aucune preuve d’un seuil de 200 ms, d’un percentile sous charge ou d’une performance FLOW ; frontières produit non équivalentes aux sous-domaines. Synthèse sélective sans reproduction substantielle. U670, CMP271.

Actualisation ELM352 / ELM653 / ELM411 — U670, 23 septembre 2026 : relecture des pages Oracle GOP 25C (échanges avec Order Management, ATP/CTP et coût), SAP Explaining aATP (PAC et alternatives), Microsoft Inventory Visibility reservations (Sample use case for soft reservation). Comparaison ciblée CMP271, sans revalidation globale des fiches.


### ELM656

MKT14 — [Packing work for packing outbound containers and processing shipments](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/packing-work). Documentation évolutive, version globale non figée. Nature : Travail interne WMS. Terme natif : Packing work ; identifiant natif non établi. Consultation le 23 septembre 2026 : Texte primaire lu. Passage : Introduction ; Set up a location for packing work.

Reformulation : Travail de packing distinct, créé en fonction des emplacements, lié aux contenants et aux expéditions partielles. Limite : Work order type interne au WMS ; pas preuve d’un Packing Order autonome à la frontière Supply. Synthèse sélective et lien, sans importation substantielle. CMP273, U674/U675 ; [audit structuré](../modeles/backlog/logistics-execution-audit-U674.yaml).


### ELM657

MKT14 — [Planned cross docking](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/planned-cross-docking). Documentation évolutive, version globale non figée. Nature : Processus et travail WMS. Terme natif : Cross docking ; identifiant natif non établi. Consultation le 23 septembre 2026 : Texte primaire lu. Passage : Introduction ; Process the cross-docking ; note finale WMS only mode.

Reformulation : Lien entre arrivées et sorties ; création du travail de passage vers la sortie. Des demandes cross-dock sont portées par les lignes des Shipment Orders en mode WMS autonome. Limite : Le produit combine marquage, affectation et exécution ; ne détermine pas la frontière Matching/Fulfilment de FLOW. Synthèse sélective et lien, sans importation substantielle. CMP273, U674/U675 ; [audit structuré](../modeles/backlog/logistics-execution-audit-U674.yaml).


### ELM658

MKT13 — [Value-Added Services (VAS)](https://help.sap.com/docs/SAP_EXTENDED_WAREHOUSE_MANAGEMENT/3d97bec9bf1649099384bb8167df3cf2/4cb48fea25d1664ce10000000a15822b.html). SAP EWM 9.5 FPS02. Nature : Ordre et activités WMS. Terme natif : VAS order ; identifiant natif non établi. Consultation le 23 septembre 2026 : Texte primaire indexé lu ; corps direct inaccessible. Passage : Use.

Reformulation : Un ordre VAS porte des activités telles que assemblage, packing, étiquetage et kitting. Limite : Texte primaire indexé consulté ; ouverture directe sans corps. Ordre interne EWM, pas objet universel FLOW. Synthèse sélective et lien, sans importation substantielle. CMP273, U674/U675 ; [audit structuré](../modeles/backlog/logistics-execution-audit-U674.yaml).


### ELM659

MKT20 — [Shipment Request and Shipment Confirmation Processes for External Systems Integration](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faims/shipment-request-and-shipment-confirmation-processes-for.html). Fusion Cloud SCM 25D. Nature : Échanges amont-exécutant. Terme natif : Shipment Request / Shipment Confirmation ; identifiant natif non établi. Consultation le 23 septembre 2026 : Texte primaire lu. Passage : Explanation of callouts, étapes 1 à 3.

Reformulation : Une demande au WMS ou 3PL est suivie du pick, pack et ship, puis d’une confirmation de réalisation. Limite : Contexte sortant ; ne décrit pas un ordre individuel obligatoire par opération ni tout le cycle d’annulation. Synthèse sélective et lien, sans importation substantielle. CMP273, U674/U675 ; [audit structuré](../modeles/backlog/logistics-execution-audit-U674.yaml).


### ELM660

MKT13 — [Warehouse Order](https://help.sap.com/saphelp_ewm700_ehp02/helpdata/en/65/cccb53ad377114e10000000a174cb4/content.htm?no_cache=true). Documentation EWM 7.0 EHP2 ; preuve historique de sémantique. Nature : Lot de travail interne. Terme natif : Warehouse Order ; identifiant natif non établi. Consultation le 23 septembre 2026 : Texte primaire lu. Passage : Definition ; Use ; Example.

Reformulation : Regroupe des tâches d’entrepôt ou postes d’inventaire dans un travail exécutable par un opérateur. Limite : Maille interne WMS ; faux équivalent d’un ordre de prestation confié par FLOW. Pas de revendication de dernière version. Synthèse sélective et lien, sans importation substantielle. CMP273, U674/U675 ; [audit structuré](../modeles/backlog/logistics-execution-audit-U674.yaml).


### ELM661

MKT20 — [Oracle Warehouse Management Outbound Logistics](https://docs.oracle.com/cd/E26401_01/doc.122/e48830/T211976T317987.htm). E-Business Suite 12.2. Nature : Processus et tâches WMS. Terme natif : Picking ; Bulk Picking ; Value Added Services ; identifiant natif non établi. Consultation le 23 septembre 2026 : Texte primaire lu. Passage : Overview of the Material Picking Process ; Bulk Picking / Value Added Services.

Reformulation : Le travail de picking est affecté aux opérateurs et peut être groupé ; les VAS incluent repackaging et kitting. Limite : Documentation EBS, distincte du produit Fusion Cloud ; ni équivalence générale de tous les light touch ni découpage Supply imposé. Synthèse sélective et lien, sans importation substantielle. CMP273, U674/U675 ; [audit structuré](../modeles/backlog/logistics-execution-audit-U674.yaml).


Actualisation U674 — 23 septembre 2026 : ELM133 (WMS only mode, introduction et restrictions), ELM129 (TMF633 v4.0, Overview) et ELM492 (TMFC007 2.0.0, présentation et dépendances) reconsultés. Métadonnées, passages et limites dans [l’audit](../modeles/backlog/logistics-execution-audit-U674.yaml). CMP273 ; aucun accord nouveau ni transposition des composants en sous-domaines.


### ELM662

MKT13 — [Logistics Execution](https://help.sap.com/doc/a6a8c7536e8e2a4be10000000a174cb4/700_SFIN3E%20006/en-US/2f9cc7536e8e2a4be10000000a174cb4.html). Documentation historique, version produit précise non affichée dans le passage. Nature : Périmètre fonctionnel SAP. Libellé natif : Logistics Execution. Identifiant natif non établi. Consultation le 23 septembre 2026 : Texte primaire ouvert et lu, passage Use. Reformulation : Couvre livraisons, picking, packing, sortie de stock et planification/suivi du transport. Limite : Appui de nom et de périmètre ; ne prouve ni consensus interéditeurs ni sous-domaine limité à la gestion des prestations confiées. Synthèse sélective et lien. CMP273 / U676 ; [audit structuré](../modeles/backlog/logistics-execution-audit-U674.yaml).


### ELM663

MKT20 — [Oracle Value Chain Execution](https://www.oracle.com/us/products/applications/ebusiness/logistics/value-chain-execution-brief-068424.pdf). Brochure portant copyright 2009 ; preuve historique, pas présentation de l’offre actuelle. Nature : Suite logicielle. Libellé natif : Supply Chain Execution / Value Chain Execution. Identifiant natif non établi. Consultation le 23 septembre 2026 : Texte primaire ouvert et lu, passage Page 1, introduction et liste des applications. Reformulation : Regroupe notamment entrepôt, transport, conformité du commerce international et coûts associés. Limite : Catégorie plus large que Fulfilment FLOW ; dénomination commerciale historique, pas taxonomie actuelle de sous-domaines. Synthèse sélective et lien. CMP273 / U676 ; [audit structuré](../modeles/backlog/logistics-execution-audit-U674.yaml).


### ELM664

MKT13 — [VAS Execution](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/9609b5f9e9304ef6850945b359a1f5d4/3771b65334e6b54ce10000000a174cb4.html?locale=en-US&state=PRODUCTION&version=2025.001). S/4HANA 2025 FPS01 (Feb 2026). Nature : Activité d’exécution dans un périmètre produit. Libellé natif : VAS Execution. Identifiant natif non établi. Consultation le 23 septembre 2026 : Texte primaire indexé, passage En-tête Logistics Execution (LE) ; Purpose ; Process Flow. Reformulation : L’exécution des VAS Orders est documentée sous Logistics Execution, avec travail aux postes et VAS supplémentaires pendant picking/putaway. Limite : Texte primaire indexé consulté. Confirme le rattachement documentaire actuel SAP, sans importer ses frontières dans FLOW. Synthèse sélective et lien. CMP273 / U676 ; [audit structuré](../modeles/backlog/logistics-execution-audit-U674.yaml).


### ELM665

Advanced Supply Chain — [Box to Hang](https://advancedsupplychain.com/value-added-services/packing/box-to-hang/). Prestation logistique commercialisée ; édition et date de publication non établies, identifiant natif non établi. Consulté le 24 septembre 2026 : Texte primaire ouvert ; introduction et Our Meticulous Box to Hang Process. Reformulation : Offre de passage de vêtements conditionnés à plat vers des vêtements suspendus ; pose du cintre conforme aux spécifications, avec prestations complémentaires possibles. Limite : Offre composite d’un prestataire ; ne rend ni toutes ses étapes obligatoires ni une nouvelle capacité FLOW nécessaire. Synthèse sélective et lien, sans reproduction substantielle. U685, CMP273.


### ELM666

Berry Services — [Mise sur cintre](https://www.berryservices.fr/component/spsimpleportfolio/item/357-mise-sur-cintre). Prestation logistique commercialisée ; édition et date de publication non établies, identifiant natif non établi. Consulté le 24 septembre 2026 : Extrait primaire indexé consulté ; ouverture directe en échec. Reformulation : Le prestataire décrit notamment déballage, pose d’un cintre avec indicateur de taille et préparation selon les consignes des acheteurs. Limite : Exemple commercial composite ; corps complet inaccessible, aucune preuve de réalisation Beaumanoir. Synthèse sélective et lien, sans reproduction substantielle. U685, CMP273.


### ELM667

MKT86 — [Logistics solutions for online returns](https://www.cevalogistics.com/en/your-industry/e-commerce/logistics-solutions-for-online-returns). Page évolutive ; édition non indiquée. Identifiant natif non établi. Nature : Publication primaire de prestataire. Consulté le 24 septembre 2026 ; accès direct. Passage : OUR SERVICES; WHAT MAKES US DIFFERENT. Reformulation : Grading, remise en état, réparation et préparation des retours. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM668

MKT87 — [Value Added Services in Logistics & Warehousing](https://advancedsupplychain.com/latest/value-added-services-in-logistics-warehousing/). Page évolutive ; édition non indiquée. Identifiant natif non établi. Nature : Publication primaire de prestataire. Consulté le 24 septembre 2026 ; accès direct. Passage : Garment Finishing; Packing; Labelling; Quality Control; Returns and Repairs. Reformulation : Finition textile, recomposition des assortiments, contrôles et retouches. Publication du 31 juillet 2025. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM669

MKT88 — [E-Commerce Services — Value Added Services](https://www.ryder.com/en-us/e-commerce/value-added-services). Page évolutive ; édition non indiquée. Identifiant natif non établi. Nature : Publication primaire de prestataire. Consulté le 24 septembre 2026 ; accès indexed_and_direct. Passage : E-commerce Value-Added Services; Apparel Value-Added Services. Reformulation : Liste détaillée des préparations textile et prestations e-commerce. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM670

MKT89 — [Value Added Services](https://www.bleckmann.com/solutions/logistics-fulfilment/value-added-services). Page évolutive ; édition non indiquée. Identifiant natif non établi. Nature : Publication primaire de prestataire. Consulté le 24 septembre 2026 ; accès indexed_and_direct. Passage : A complete range; Reconditioning; Personalisation; In-house photo studio. Reformulation : Contrôle, remise en état, personnalisation et photographie aux côtés du packing. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM671

MKT90 — [Fashion and apparel](https://gxo.com/industries/fashion-apparel/). Page évolutive ; édition non indiquée. Identifiant natif non établi. Nature : Publication primaire de prestataire. Consulté le 24 septembre 2026 ; accès indexed. Passage : Value-added services; We make it personal. Reformulation : Broderie, cadeaux, kits et présentation de marque. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM672

MKT90 — [Value-added services](https://gxo.com/supply-chain-mgmt/logistics-services/). Page évolutive ; édition non indiquée. Identifiant natif non établi. Nature : Publication primaire de prestataire. Consulté le 24 septembre 2026 ; accès indexed. Passage : Value-added services include; Case study. Reformulation : Co-packing, montage promotionnel et réparation ; offre aussi des prestations de gestion. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM673

MKT91 — [Packaging Solutions for Large Businesses](https://www.dhl.com/us-en/home/supply-chain/solutions/packaging.html). Page évolutive ; édition non indiquée. Identifiant natif non établi. Nature : Publication primaire de prestataire. Consulté le 24 septembre 2026 ; accès indexed_and_direct. Passage : Packaging Execution. Reformulation : Personnalisation tardive, assemblage et kitting associés au packaging. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM674

MKT92 — [Supporting core warehouse services](https://www.dsv.com/en-gb/our-solutions/modes-of-transport/value-added-services/warehouse-resources). Page évolutive ; édition non indiquée. Identifiant natif non établi. Nature : Publication primaire de prestataire. Consulté le 24 septembre 2026 ; accès indexed_and_direct. Passage : Assembly and kitting; Configuration test; Quality inspection and testing; Reworking and co-packing. Reformulation : Assemblage, tests, configuration de matériels et emballages adaptés aux marchés. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM675

MKT87 — [Garment Cleaning](https://www.advancedsupplychain.com/value-added-services/garment-cleaning/). Page évolutive ; édition non indiquée. Identifiant natif non établi. Nature : Publication primaire de prestataire. Consulté le 24 septembre 2026 ; accès indexed_and_direct. Passage : Spot Cleaning; Garment Finishing; Ozone Cleaning. Reformulation : Nettoyage ciblé, défroissage et traitement des odeurs proposés par le prestataire. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM676

MKT87 — [RFID](https://advancedsupplychain.com/rfid/). Page évolutive ; édition non indiquée. Identifiant natif non établi. Nature : Publication primaire de prestataire. Consulté le 24 septembre 2026 ; accès indexed. Passage : Our Comprehensive RFID Labelling Solutions. Reformulation : Pose, encodage, association des données et vérification de lecture des étiquettes. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM677

MKT89 — [RESCUE: Circular Fashion Made Simple & Profitable](https://www.bleckmann.com/resources/maximising-the-value-of-apparel-with-rescue-programme). Page évolutive ; édition non indiquée. Identifiant natif non établi. Nature : Publication primaire de prestataire. Consulté le 24 septembre 2026 ; accès indexed. Passage : So, how does the process work in practice?. Reformulation : Réparations de couture, boutons et fermetures ; tri préalable selon réparabilité. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM678

MKT86 — [Device Lifecycle Supply Chain Solutions](https://www.cevalogistics.com/en/your-industry/technology/device-lifecycle-solutions). Page évolutive ; édition non indiquée. Identifiant natif non établi. Nature : Publication primaire de prestataire. Consulté le 24 septembre 2026 ; accès indexed. Passage : In-Life Replacement & Repair; End-of-Contract Management. Reformulation : Configuration, nettoyage des données, réparation, classement et recyclage des appareils. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM679

MKT91 — [Data center logistics](https://lot.dhl.com/glossary/data-center-logistics/). Page évolutive ; édition non indiquée. Identifiant natif non établi. Nature : Publication primaire de prestataire. Consulté le 24 septembre 2026 ; accès indexed. Passage : How does data center logistics handle upgrades and equipment lifecycle management?. Reformulation : Effacement des données et recyclage ou élimination en fin de vie. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM680

MKT20 — [Oracle Warehouse Management User’s Guide — Overview](https://docs.oracle.com/cd/E26401_01/doc.122/e48830/T211976T317761.htm). EBS 12.2. Identifiant natif non établi. Nature : Documentation WMS. Consulté le 24 septembre 2026 ; accès direct. Passage : Oracle Warehouse Management Value Added Services; Reverse Logistics. Reformulation : EBS 12.2 : kitting/dekitting et étiquetage ; reverse logistics séparée incluant remise en état et recyclage. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM681

MKT92 — [Contract logistics](https://www.dsv.com/en-ae/our-solutions/contract-logistics). Page évolutive ; édition non indiquée. Identifiant natif non établi. Nature : Publication primaire de prestataire. Consulté le 24 septembre 2026 ; accès indexed. Passage : Value-added services; Distribution services. Reformulation : Tests, réparation, assemblage ; installation et white glove dans les prestations à livraison. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM682

MKT87 — [Metal Detection](https://www.advancedsupplychain.com/metal-detection/). Page évolutive ; édition non indiquée. Identifiant natif non établi. Nature : Publication primaire de prestataire. Consulté le 24 septembre 2026 ; accès direct. Passage : Présentation Metal Detection. Reformulation : Prestation de détection de contaminants métalliques, également décrite dans le panorama ELM668. Limites : Offre ou documentation du fournisseur ; pas une nomenclature normative, ni une preuve de réalisation Beaumanoir. Synthèse et lien uniquement. CMP274 ; détails de couverture dans [la revue U686](../modeles/backlog/value-added-logistics-review-U686.yaml).


### ELM683

MKT13 — [Maintain Generic Transportation Order](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/733c8b37b3f546a1b08750e8aeabb887/9740cb5147dd9d55e10000000a423f68.html). 2025 FPS01 (février 2026). Terme natif : Transportation Order. Nature : objet/interface de produit TMS. Passage : Definition ; Business Context and Use. Reformulation : Une demande crée, modifie ou annule un ordre de transport de différentes catégories, notamment freight order et freight booking. Limites : Texte primaire indexé consulté le 24 septembre 2026 ; ouverture directe sans corps. Opération de service et catégories SAP, pas équivalence de capacité ni découpage FLOW. Synthèse sélective et lien ; aucune reproduction substantielle. CMP275 / U698.


### ELM684

MKT20 — [Order Release](https://docs.oracle.com/en/cloud/saas/transportation/25c/otmol/planning/order_manager/or_edit.htm). 25C. Terme natif : Order Release. Nature : objet/interface de produit TMS. Passage : Introduction ; Adding Order Releases, fenêtres de collecte/livraison et origine/destination. Reformulation : La demande contient des unités ou lignes à transporter, les lieux et dates, ainsi que des contraintes utilisées pour planifier les expéditions. Limites : Texte primaire ouvert et lu le 24 septembre 2026. L’Order Release exprime la demande de transport ; ne prouve pas à lui seul un engagement de transporteur ni une correspondance un pour un avec les shipments. Synthèse sélective et lien ; aucune reproduction substantielle. CMP275 / U698.


### ELM685

MKT20 — [Order Release: Order Stops](https://docs.oracle.com/en/cloud/saas/transportation/26a/otmol/planning/order_manager/or_stops.htm). 26A. Consultation le 24 septembre 2026, accès direct. Passage : Creating a Shipment Stop. Identifiant natif non établi ; titre natif conservé. Reformulation : Arrêts intermédiaires, séquence, lieux et services associés à chaque arrêt. Limite : Documentation produit ou offre publiée ; pas de preuve Beaumanoir ni de taxonomie universelle des capacités. Extraits/synthèses et liens, pas de reproduction substantielle. CMP276, U699/U700.


### ELM686

MKT13 — [Multi-Pickup, Multi-Drop](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e3dc5400c1cc41d1bc0ae0e7fd9aa5a2/7194e95ee2e447b9954dc449d3a06971.html). Version non établie dans le passage indexé. Consultation le 24 septembre 2026, accès indexed. Passage : Canceling Freight Orders, Canceling Stops. Identifiant natif non établi ; titre natif conservé. Reformulation : Un ordre routier peut comporter plusieurs arrêts ; modification et annulation dépendent de leur avancement. Limite : Documentation produit ou offre publiée ; pas de preuve Beaumanoir ni de taxonomie universelle des capacités. Extraits/synthèses et liens, pas de reproduction substantielle. CMP276, U699/U700.


### ELM687

MKT13 — [Transportation Stages and Dates/Times in the Freight Unit](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e3dc5400c1cc41d1bc0ae0e7fd9aa5a2/9c8fdae3f57b48bc9cf4d5cfae3f130c.html). 2025 FPS01. Consultation le 24 septembre 2026, accès indexed. Passage : Transportation Stages. Identifiant natif non établi ; titre natif conservé. Reformulation : Étapes prédéfinies dans la demande distinguées des transbordements ajoutés par la planification. Limite : Documentation produit ou offre publiée ; pas de preuve Beaumanoir ni de taxonomie universelle des capacités. Extraits/synthèses et liens, pas de reproduction substantielle. CMP276, U699/U700.


### ELM688

MKT20 — [Order Movement](https://docs.oracle.com/en/cloud/saas/transportation/25c/otmol/planning/order_manager/order_movement/order_movement.htm). 25C. Consultation le 24 septembre 2026, accès indexed. Passage : Creating an order movement. Identifiant natif non établi ; titre natif conservé. Reformulation : Un déplacement demandé peut être réparti entre plusieurs expéditions sans scinder la demande initiale. Limite : Documentation produit ou offre publiée ; pas de preuve Beaumanoir ni de taxonomie universelle des capacités. Extraits/synthèses et liens, pas de reproduction substantielle. CMP276, U699/U700.


### ELM689

MKT13 — [Use of Schedules](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e3dc5400c1cc41d1bc0ae0e7fd9aa5a2/65978154f98b46c2b77906547c880936.html). Version non établie dans le passage indexé. Consultation le 24 septembre 2026, accès indexed. Passage : Features. Identifiant natif non établi ; titre natif conservé. Reformulation : Ordres associés à un départ programmé ; données et capacités reprises, changements du programme signalés. Limite : Documentation produit ou offre publiée ; pas de preuve Beaumanoir ni de taxonomie universelle des capacités. Extraits/synthèses et liens, pas de reproduction substantielle. CMP276, U699/U700.


### ELM690

MKT13 — [Ad Hoc Loading](https://help.sap.com/docs/PRODUCTS/f5d3e1005efd4e86acf9a65abf428082/df9df83274d04a79b186c38eb69e8d5b.html). 2025 FPS01. Consultation le 24 septembre 2026, accès indexed. Passage : Business Details. Identifiant natif non établi ; titre natif conservé. Reformulation : Des ordres routiers peuvent être préparés avant l’affectation des marchandises, avec reprise des arrêts d’un programme. Limite : Documentation produit ou offre publiée ; pas de preuve Beaumanoir ni de taxonomie universelle des capacités. Extraits/synthèses et liens, pas de reproduction substantielle. CMP276, U699/U700.


### ELM691

MKT20 — [Set Appointments](https://docs.oracle.com/en/cloud/saas/transportation/25c/otmol/general/appointments.htm). 25C. Consultation le 24 septembre 2026, accès direct. Passage : Introduction ; Order Appointments ; Shipment Stop Appointments. Identifiant natif non établi ; titre natif conservé. Reformulation : Le rendez-vous convenu avec le prestataire se distingue de l’horaire calculé ; vérification de compatibilité entre arrêts. Limite : Documentation produit ou offre publiée ; pas de preuve Beaumanoir ni de taxonomie universelle des capacités. Extraits/synthèses et liens, pas de reproduction substantielle. CMP276, U699/U700.


### ELM692

MKT91 — [NZ Exporter’s Guide to Last Mile Delivery](https://www.dhl.com/discover/en-nz/logistics-advice/logistics-insights/last-mile-delivery-solutions). Page évolutive, édition non indiquée. Consultation le 24 septembre 2026, accès indexed. Passage : Can customers choose their delivery time? ; What happens if the customer isn’t home?. Identifiant natif non établi ; titre natif conservé. Reformulation : Choix de fenêtres, report ou redirection et solutions après absence du destinataire. Limite : Documentation produit ou offre publiée ; pas de preuve Beaumanoir ni de taxonomie universelle des capacités. Extraits/synthèses et liens, pas de reproduction substantielle. CMP276, U699/U700.


### ELM693

MKT94 — [Help and Support Center](https://www.ups.com/us/en/business-solutions/grow-your-business-solutions). Page évolutive, édition non indiquée. Consultation le 24 septembre 2026, accès indexed. Passage : How do I change a delivery I’m receiving?. Identifiant natif non établi ; titre natif conservé. Reformulation : Demande de changement de date ou lieu ; options pouvant être restreintes par l’expéditeur. Limite : Documentation produit ou offre publiée ; pas de preuve Beaumanoir ni de taxonomie universelle des capacités. Extraits/synthèses et liens, pas de reproduction substantielle. CMP276, U699/U700.


### ELM694

MKT13 — [Sample Ocean Freight Process for Shippers (Outbound)](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e3dc5400c1cc41d1bc0ae0e7fd9aa5a2/ca69ceb75dad454bad9bbeb25613b198.html?version=latest). Version non établie dans le passage indexé. Consultation le 24 septembre 2026, accès indexed_direct_empty. Passage : Introduction du processus chargeur. Identifiant natif non établi ; titre natif conservé. Reformulation : Le chargeur commence par une pré-réservation de capacité via un ocean freight booking. Limite : Documentation produit ou offre publiée ; pas de preuve Beaumanoir ni de taxonomie universelle des capacités. Extraits/synthèses et liens, pas de reproduction substantielle. CMP276, U699/U700.


### ELM695

MKT93 — [Booking standard](https://dcsa.org/standards/booking). Présentation publique évolutive ; version du standard non établie. Consultation le 24 septembre 2026, accès direct. Passage : The problem ; The solution. Identifiant natif non établi ; titre natif conservé. Reformulation : Échanges de données et suivi du booking d’espace maritime ; distinction avec les Shipping Instructions. Limite : Documentation produit ou offre publiée ; pas de preuve Beaumanoir ni de taxonomie universelle des capacités. Extraits/synthèses et liens, pas de reproduction substantielle. CMP276, U699/U700.


### ELM696

MKT13 — [Freight Booking – Confirm](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/2f36056ae9a044bba55bcbad204b7bc5/2ef80c370bc645c19fc266b746d3094f.html). Version non établie dans le passage indexé. Consultation le 24 septembre 2026, accès indexed. Passage : Service Nodes : TransportationOrderBooking ; BookingCapacity. Identifiant natif non établi ; titre natif conservé. Reformulation : Confirmation de capacité et de service dans les périodes convenues sous condition de remise à temps des marchandises. Limite : Documentation produit ou offre publiée ; pas de preuve Beaumanoir ni de taxonomie universelle des capacités. Extraits/synthèses et liens, pas de reproduction substantielle. CMP276, U699/U700.


### ELM697

MKT91 — [LTL Shipment Solutions](https://www.dhl.com/gb-en/home/ship/ltl-shipping.html). Page évolutive, édition non indiquée. Consultation le 24 septembre 2026, accès indexed. Passage : What’s the difference between LTL, PTL and FTL?. Identifiant natif non établi ; titre natif conservé. Reformulation : Offres distinguant mutualisation de chargement, charge partielle et véhicule complet ; différences de manutentions et délais. Limite : Documentation produit ou offre publiée ; pas de preuve Beaumanoir ni de taxonomie universelle des capacités. Extraits/synthèses et liens, pas de reproduction substantielle. CMP276, U699/U700.


### ELM698

MKT56 — [Your Comprehensive Guide to Supply Chain Solutions for Improved Operations](https://www.ascm.org/ascm-insights/supply-chain-solutions-for-improved-operations/). Édition : 2026-07-10. Consultation : 2026-09-24 ; accès indexed_direct_error. Passage : What is SCOR?. Identifiant natif non établi. Reformulation : SCOR couvre les interactions depuis la commande jusqu’à la facture payée. Cadre de processus de bout en bout, sans prescription de frontières de domaines. Limites : Synthèse et lien uniquement. Documentation primaire de processus, produit ou offre ; ne démontre ni taxonomie universelle des Orders ni déploiement Beaumanoir. CMP277, U702/U703.


### ELM699

MKT20 — [Overview of Executing Shipping Documents](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/famlo/overview-of-executing-shipping-documents.html). Édition : 25D. Consultation : 2026-09-24 ; accès direct. Passage : Overview. Identifiant natif non établi. Reformulation : Shipping génère des documents, dont packing slip et commercial invoice, liés à l’expédition. Limites : Synthèse et lien uniquement. Documentation primaire de processus, produit ou offre ; ne démontre ni taxonomie universelle des Orders ni déploiement Beaumanoir. CMP277, U702/U703.


### ELM700

MKT13 — [Goods Receipt Slip (WE_SCHEINVERS2)](https://help.sap.com/docs/SAP_ERP/36ce973bca7242118fba2bee0511f4d6/8edae4535dd4414de10000000a174cb4.html). Édition : ERP 6.0 EHP8. Consultation : 2026-09-24 ; accès indexed. Passage : Purpose. Identifiant natif non établi. Reformulation : Le bon de réception est imprimable lors de la comptabilisation du mouvement de réception ; il en constitue un justificatif. Limites : Synthèse et lien uniquement. Documentation primaire de processus, produit ou offre ; ne démontre ni taxonomie universelle des Orders ni déploiement Beaumanoir. CMP277, U702/U703.


### ELM701

MKT20 — [How Order-to-Cash Works in Order Management](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/faiom/how-order-to-cash-works-in-order-management.html). Édition : 26A. Consultation : 2026-09-24 ; accès direct. Passage : Steps 3–5. Identifiant natif non établi. Reformulation : L’orchestration demande la facturation à Receivables et attend sa réponse ; Financials crée la facture et traite les paiements. Le processus traverse les responsabilités. Limites : Synthèse et lien uniquement. Documentation primaire de processus, produit ou offre ; ne démontre ni taxonomie universelle des Orders ni déploiement Beaumanoir. CMP277, U702/U703.


### ELM702

MKT13 — [Manual Incoming Payments](https://help.sap.com/docs/SAP_BUSINESS_BYDESIGN/2754875d2d2a403f95e58a41a9c7d6de/2c25dd46722d1014880ed85ecdf0cc88.html?locale=en-US). Édition : August 2026. Consultation : 2026-09-24 ; accès indexed. Passage : Overview. Identifiant natif non établi. Reformulation : Les encaissements relèvent des comptes clients, de la gestion des paiements et de la liquidité ; le rapprochement avec les créances fait partie du traitement financier. Limites : Synthèse et lien uniquement. Documentation primaire de processus, produit ou offre ; ne démontre ni taxonomie universelle des Orders ni déploiement Beaumanoir. CMP277, U702/U703.


### ELM703

MKT91 — [Customs Services](https://www.dhl.com/us-en/home/global-forwarding/products-and-solutions/customs-services.html). Édition : Page évolutive sans édition. Consultation : 2026-09-24 ; accès indexed. Passage : FAQ: customs services and customs broker. Identifiant natif non établi. Reformulation : Le service douanier couvre dédouanement, documentation et conformité. Il dépasse la seule production documentaire ; les autorités décident du dédouanement. Limites : Synthèse et lien uniquement. Documentation primaire de processus, produit ou offre ; ne démontre ni taxonomie universelle des Orders ni déploiement Beaumanoir. CMP277, U702/U703.


### ELM704

MKT13 — [Creating Documents — Customs Management](https://help.sap.com/docs/SAP_GLOBAL_TRADE_SERVICES/bdb1d2fb216941a69f6300006343e977/4c9ab10f125a0780e10000000a42189b.html). Édition : Version non établie. Consultation : 2026-09-24 ; accès indexed_direct_empty. Passage : Creating customs declarations and customs shipments. Identifiant natif non établi. Reformulation : Customs Management utilise les données logistiques du système source pour construire les documents des procédures douanières. Limites : Synthèse et lien uniquement. Documentation primaire de processus, produit ou offre ; ne démontre ni taxonomie universelle des Orders ni déploiement Beaumanoir. CMP277, U702/U703.


### ELM705

MKT20 — [Overview of Setting Up Credit Cards](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faiom/overview-of-setting-up-credit-cards.html). Édition : 26B. Consultation : 2026-09-24 ; accès direct. Passage : Overview and integration. Identifiant natif non établi. Reformulation : Order Management mobilise Oracle Payments pour le traitement carte ; l’autorisation peut venir du système amont avec Financials. Intégration explicite, pas propriété de toute la finance dans Order Management. Limites : Synthèse et lien uniquement. Documentation primaire de processus, produit ou offre ; ne démontre ni taxonomie universelle des Orders ni déploiement Beaumanoir. CMP277, U702/U703.


### ELM706

MKT13 — SAP LeanIX, [Landscape Report](https://help.sap.com/docs/leanix/ea/landscape-report). Documentation évolutive sans édition affichée. Consultation 2026-09-24, accès indexé, passage : Introduction. Identifiant natif non établi. Reformulation : Regroupements selon différentes dimensions et vues colorées. Exemple de visualisation, pas taxonomie de finalités Supply. Limites : Synthèse primaire ; aucun consensus de découpage en capacités FLOW déduit. CMP279, U710.


### ELM707

MKT13 — SAP LeanIX, [Matrix Report](https://help.sap.com/docs/leanix/ea/matrix-report). Documentation évolutive sans édition affichée. Consultation 2026-09-24, accès indexé, passage : Views. Identifiant natif non établi. Reformulation : Les vues portent des attributs ou relations visualisés par couleur ; distinguer classification et hiérarchie. Limites : Synthèse primaire ; aucun consensus de découpage en capacités FLOW déduit. CMP279, U710.


### ELM708

MKT20 — Oracle, [Overview of Orchestration Processes](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faiom/orchestration-processes.html). 26B. Consultation 2026-09-24, accès indexé, passage : Overview and task services. Identifiant natif non établi. Reformulation : Un processus orchestre des services qui exécutent les tâches ; ne prescrit pas une capacité de cycle de vie sœur de chaque famille. Limites : Synthèse primaire ; aucun consensus de découpage en capacités FLOW déduit. CMP279, U710.


### ELM709

MKT20 — Oracle, [How Supply Chain Orchestration Works](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fauco/how-supply-orchestration-works.html). 25C. Consultation 2026-09-24, accès indexé, passage : Orchestrate supply order. Identifiant natif non établi. Reformulation : Demande, création/modification de commandes distantes et traitement des changements sont articulés ; le retrait d’une capacité générique ne doit pas retirer ces responsabilités. Limites : Synthèse primaire ; aucun consensus de découpage en capacités FLOW déduit. CMP279, U710.


### ELM710

MKT13 — SAP, [SAP Master Data Integration with SAP Field Service and Asset Management](https://help.sap.com/docs/SAP_FIELD_SERVICE_MANAGEMENT/703cab4eaf67401293a27fa1b63f4edb/mdi-introduction.html). Page évolutive, édition non indiquée. Consulté le 2026-09-24, passage indexé : Overview / providers and consumers. Identifiant natif non établi. Reformulation : Représentation des objets maîtres de différentes origines et distribution vers différents consommateurs. Ne prescrit pas un Behavior FLOW par fournisseur. Limites : Synthèse de documentation primaire ; nomenclature FLOW proposée, aucune preuve Beaumanoir. CMP280, U712.


### ELM711

MKT50 — Microsoft, [Use domain analysis to model microservices](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis). Page évolutive, édition non indiquée. Consulté le 2026-09-24, passage indexé : Context maps and integration patterns. Identifiant natif non établi. Reformulation : Les domaines négocient des contrats ; une carte de contextes explicite les points d’intégration et les responsabilités. Limites : Synthèse de documentation primaire ; nomenclature FLOW proposée, aucune preuve Beaumanoir. CMP280, U712.


### ELM712

MKT50 — Microsoft, [Anti-corruption Layer pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer). Page évolutive, édition non indiquée. Consulté le 2026-09-24, passage indexé : Context / solution / when to use. Identifiant natif non établi. Reformulation : Adapter les sémantiques à la frontière protège le modèle consommateur. Pattern logiciel, appui à la frontière, pas preuve d’un type universel de capacité métier. Limites : Synthèse de documentation primaire ; nomenclature FLOW proposée, aucune preuve Beaumanoir. CMP280, U712.


### ELM713

MKT20 — Oracle, [Tracking Event Manager: Detail](https://docs.oracle.com/en/cloud/saas/transportation/26b/otmol/asset_mgt/tracking/tracking_event_manager_detail.htm). 26B. Consulté le 2026-09-24, passage indexé : Introduction / adding manually. Identifiant natif non établi. Reformulation : Les événements sont principalement reçus par intégration ; la consultation sert au diagnostic et à l’analyse. Distinguer réception et exploitation des faits. Limites : Synthèse de documentation primaire ; nomenclature FLOW proposée, aucune preuve Beaumanoir. CMP280, U712.


### ELM714

MKT20 — Oracle, [Tracking Event Manager: Identification](https://docs.oracle.com/en/cloud/saas/transportation/26c/otmol/asset_mgt/tracking/tracking_event_manager.htm). 26C. Consulté le 2026-09-24, passage indexé : Introduction. Identifiant natif non établi. Reformulation : Les événements saisis ou intégrés sont corrélés aux actifs et expéditions ; captation et rapprochement sémantique sont distincts d’un simple transport technique. Limites : Synthèse de documentation primaire ; nomenclature FLOW proposée, aucune preuve Beaumanoir. CMP280, U712.


### ELM715

MKT14 — Microsoft, [Retail sales price management](https://learn.microsoft.com/en-us/dynamics365/commerce/price-management). Page évolutive. Consulté le 24 septembre 2026, texte primaire accessible. Passage : Price groups ; Catalogs ; Differences between Commerce pricing and non-Commerce pricing. Reformulation : Groupes de prix associés notamment aux canaux, catalogues et clientèles ; moteur de tarification Commerce et tarification SCM existent. Les frontières produit ne définissent pas les responsabilités FLOW. Aucune preuve de réalisation Beaumanoir. CMP281, U719.


### ELM716

MKT14 — Microsoft, [Assortment management](https://learn.microsoft.com/en-us/dynamics365/commerce/assortments). Page évolutive. Consulté le 24 septembre 2026, texte primaire accessible. Passage : Assortment overview. Reformulation : Un assortiment détermine les produits proposés par canaux. Ne démontre pas une association un-à-un obligatoire avec un tarif. Aucune preuve de réalisation Beaumanoir. CMP281, U719.


### ELM717

MKT20 — Oracle, [Set Up Item Substitution in Order Management](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faiom/set-up-item-substitution-in-order-management.html). 26B. Consulté le 24 septembre 2026, texte primaire accessible. Passage : Introduction ; Guidelines. Reformulation : Global Order Promising peut recommander un substitut disponible en rupture si la commande autorise la substitution. La page ne définit pas la règle tarifaire du remplacement. Aucune preuve de réalisation Beaumanoir. CMP281, U719.


### ELM718

MKT20 — Oracle, [Work with Detail Information](https://docs.oracle.com/html/E21562_01/ww_detail_info.htm). Documentation historique JD Edwards World, édition non établie sur la page. Consulté le 24 septembre 2026, texte primaire accessible. Passage : 4.4.1 Before You Begin, processing option 42. Reformulation : La configuration détermine si le prix provient de l’article original ou du substitut. Illustration historique des politiques possibles, pas preuve du comportement Fusion 26B. Aucune preuve de réalisation Beaumanoir. CMP281, U719.


### ELM719

MKT20 — Oracle, [Rate Inquiry](https://docs.oracle.com/en/cloud/saas/transportation/26c/otmol/askglog/rate_inquiry.htm). 26C. Consulté le 24 septembre 2026. Texte primaire ; passage : Rate and route inquiry. Reformulation : Comparer des itinéraires valides et leurs coûts ; appui à l’évaluation économique des alternatives de trajet. Ne démontre ni refacturation automatique ni responsabilité universelle de pricing commercial. CMP281, U720.


### ELM720

MKT14 — Microsoft, [Landed cost module overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/landed-cost/landed-cost-overview). Page évolutive. Consulté le 24 septembre 2026. Texte primaire ; passage : Overview / cost estimation. Reformulation : Estimer les coûts logistiques et les affecter aux marchandises importées ; coût rendu ne signifie pas prix de vente au client. Ne démontre ni refacturation automatique ni responsabilité universelle de pricing commercial. CMP281, U720.


### ELM721

MKT73 — Salesforce, [Define Prices in Price Books](https://help.salesforce.com/s/articleView?id=ind.pricing_define_prices_in_price_books.htm&language=en_US&type=5). Page évolutive Revenue Management, consultée le 24 septembre 2026, introduction. Le Price Book porte des prix de vente de produits et services. Ne démontre pas la couverture de toutes les règles complexes de transport par une ligne de tarif simple. ELM531 Microsoft Define product pricing reconsulté le même jour : tarifs de produits et services, unités et méthodes. CMP281, U721.


### ELM722

MKT14 — Microsoft, [Create Commerce catalogs for B2B sites](https://learn.microsoft.com/en-us/dynamics365/commerce/catalogs-b2b-sites). Dynamics 365 Commerce 10.0.27 et suivantes, page mise à jour le 21 janvier 2026, consultée le 24 septembre 2026. Introduction et configuration : catalogue de produits proposés, merchandising, canaux et clients ; groupes tarifaires associés ; produits issus des assortiments des canaux. Limite : frontières d’un produit logiciel, pas règle universelle de suffixe. CMP282, U722.

### ELM723

MKT73 — Salesforce, [Product Catalog Management Set Up](https://help.salesforce.com/s/articleView?id=sf.product_catalog_set_up_product_catalog_management.htm&language=en_US&type=5). Page évolutive, consultée le 24 septembre 2026. Price book filtering : catalogue et price book peuvent se recouper partiellement ; le filtre retient les produits associés au price book choisi. Appui à la distinction entre organisation de l’offre et tarifs. Aucun modèle universel ni équivalence stricte avec FLOW. CMP282, U722.


### ELM724

MKT20 — Oracle, [Create, Search, and Apply Actions on Sales Orders](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faiom/search-and-apply-actions-on-sales-orders.html). 26B. Consulté le 24 septembre 2026, texte primaire accessible ; passage : Apply actions / Holds / Cancel / Schedule. Reformulation : Les actions de révision, annulation, suspension et planification portent les Orders ou leurs lignes ; une demande acceptée ne prouve pas son achèvement. Limite : fonction ou objet produit, pas taxonomie universelle de capacités ni réalisation Beaumanoir. CMP283, U724.


### ELM725

MKT14 — Microsoft, [Approve and confirm purchase orders](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-order-approval-confirmation). Page évolutive. Consulté le 24 septembre 2026, texte primaire accessible ; passage : Approval and confirmation. Reformulation : Approbation et confirmation sont distinguées dans la prise en charge des achats ; les états ne se réduisent pas à un statut universel. Limite : fonction ou objet produit, pas taxonomie universelle de capacités ni réalisation Beaumanoir. CMP283, U724.


### ELM726

MKT20 — Oracle, [Check Availability](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fascp/check-availability.html). 25C. Consulté le 24 septembre 2026, texte primaire accessible ; passage : Introduction. Reformulation : La disponibilité permet de déterminer les possibilités de satisfaction ; appui à la distinction entre calcul et engagement porté par la commande. Limite : fonction ou objet produit, pas taxonomie universelle de capacités ni réalisation Beaumanoir. CMP283, U724.


### ELM727

MKT14 — Microsoft, [Order promising](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/delivery-dates-available-promise-calculations). Page évolutive. Consulté le 24 septembre 2026, texte primaire accessible ; passage : Order promising and delivery date calculations. Reformulation : Les méthodes de calcul de dates alimentent les dates de la commande ; ne prescrivent pas une capacité FLOW distincte Fulfillment Commitment. Limite : fonction ou objet produit, pas taxonomie universelle de capacités ni réalisation Beaumanoir. CMP283, U724.


### ELM728

MKT14 — Microsoft, [Set up consignment](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/consignment). Page évolutive. Consulté le 24 septembre 2026, texte primaire accessible ; passage : Consignment replenishment orders. Reformulation : La demande d’apport et son suivi sont distincts du changement de propriété et du stock détenu ; perspective fournisseur entrant. Limite : fonction ou objet produit, pas taxonomie universelle de capacités ni réalisation Beaumanoir. CMP283, U724.


### ELM729

MKT13 — SAP, [Customer Consignment](https://help.sap.com/doc/6f9449d2ad114d39bc708ea88f5d1aea/2405/en-US/Customer_Consignment_EN.pdf). Business ByDesign 2405. Consulté le 24 septembre 2026, texte primaire accessible ; passage : Customer consignment / fill-up / pick-up. Reformulation : L’apport, la consommation et la reprise sont distingués dans la consignation client ; les types documentaires ne prescrivent pas les natures FLOW. Limite : fonction ou objet produit, pas taxonomie universelle de capacités ni réalisation Beaumanoir. CMP283, U724.


### ELM730

MKT14 — Microsoft, [Delivery schedules](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/delivery-schedules). Page évolutive. Consulté le 24 septembre 2026, texte primaire accessible ; passage : Introduction. Reformulation : Quantités de lignes réparties en plusieurs livraisons ; scission de réalisation et nombre de commandes commerciales ne sont pas équivalents. Limite : fonction ou objet produit, pas taxonomie universelle de capacités ni réalisation Beaumanoir. CMP283, U724.


### ELM731

MKT20 — Oracle, [Ship Order Lines in Shipment Sets](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/fauom/ship-order-lines-in-shipment-sets.html). 26A. Consulté le 24 septembre 2026, texte primaire accessible ; passage : Shipment sets. Reformulation : Des ensembles de lignes portent des contraintes de livraison commune. Ne prouve pas une fusion générique de commandes. Limite : fonction ou objet produit, pas taxonomie universelle de capacités ni réalisation Beaumanoir. CMP283, U724.


### ELM732

MKT14 — Microsoft, [Archive Dynamics 365 Supply Chain Management Sales orders data](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/sysadmin/archive-so). Page mise à jour le 14 janvier 2026. Consulté le 24 septembre 2026, texte primaire accessible ; passage : Prerequisites / View historical data. Reformulation : L’archivage conserve des commandes et données liées pour consultation ; fonctions de plateforme sans prescription de capacité métier autonome. Limite : fonction ou objet produit, pas taxonomie universelle de capacités ni réalisation Beaumanoir. CMP283, U724.


### ELM733

MKT14 — Microsoft, [Archive documents](https://learn.microsoft.com/en-us/dynamics365/business-central/across-how-to-archive-documents). Page mise à jour le 15 octobre 2025. Consulté le 24 septembre 2026, texte primaire accessible ; passage : Introduction / Archive / Restore. Reformulation : Versions archivées, consultation et restauration conditionnelle sont distinctes ; ne pas confondre archivage, clôture et réouverture. Limite : fonction ou objet produit, pas taxonomie universelle de capacités ni réalisation Beaumanoir. CMP283, U724.


### ELM734

MKT14 — Microsoft, [Inventory Visibility Add-in overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility). Page évolutive, 2025-08-14. Consulté le 24 septembre 2026 ; passages : Global view / Central adjustment / Soft reservation / ATP. Reformulation : Le produit réunit ingestion, états, réservations et ATP ; ce regroupement logiciel ne prescrit pas les frontières FLOW. Limite : Documentation primaire consultée ; appui partiel, sans équivalence de capacité ni preuve de réalisation Beaumanoir. Synthèse sélective sans copie du document. CMP284, U726/U727.


### ELM735

MKT14 — Microsoft, [Inventory journals](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-journals). Page évolutive. Consulté le 24 septembre 2026 ; passages : Movement / Transfer / Counting. Reformulation : Les journaux enregistrent des effets de stock ; les ajustements de comptage suivent une instruction métier. Limite : Documentation primaire consultée ; appui partiel, sans équivalence de capacité ni preuve de réalisation Beaumanoir. Synthèse sélective sans copie du document. CMP284, U726/U727.


### ELM736

MKT20 — Oracle, [Item Ledger Information](https://docs.oracle.com/en/applications/jd-edwards/supply-chain-manufacturing/9.2/eoash/item-ledger-information.html). JD Edwards EnterpriseOne 9.2. Consulté le 24 septembre 2026 ; passages : Item Ledger CARDEX. Reformulation : Historique détaillé des transactions par article, distinct de leur simple réception technique. Limite : Documentation primaire consultée ; appui partiel, sans équivalence de capacité ni preuve de réalisation Beaumanoir. Synthèse sélective sans copie du document. CMP284, U726/U727.


### ELM737

MKT14 — Microsoft, [Design details: Inventory posting](https://learn.microsoft.com/en-us/dynamics365/business-central/design-details-inventory-posting). Business Central, page évolutive. Consulté le 24 septembre 2026 ; passages : Entry types. Reformulation : Les item ledger entries portent les variations de quantité ; les value entries et la comptabilité générale ont des responsabilités distinctes. Limite : Documentation primaire consultée ; appui partiel, sans équivalence de capacité ni preuve de réalisation Beaumanoir. Synthèse sélective sans copie du document. CMP284, U726/U727.


### ELM738

MKT42 — GS1, [EPCIS and CBV Implementation Guideline](https://ref.gs1.org/guidelines/epcis-cbv/2.0.0/). 2.0 ratifiée mars 2023. Consulté le 24 septembre 2026 ; passages : 5.2 / 5.9. Reformulation : Propriété et possession distinguées dans les événements ; erreurs et corrections explicites. Standard de partage de faits, pas catalogue de capacités. Limite : Documentation primaire consultée ; appui partiel, sans équivalence de capacité ni preuve de réalisation Beaumanoir. Synthèse sélective sans copie du document. CMP284, U726/U727.


### ELM739

MKT14 — Microsoft, [Set up consignment](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/consignment). Page évolutive, 2026-05-06. Consulté le 24 septembre 2026 ; passages : Ownership change journal / Owner dimension. Reformulation : Détention fournisseur séparée de propriété ; changement de propriétaire enregistré séparément. Scénario entrant de production, pas toutes les consignations fashion. Limite : Documentation primaire consultée ; appui partiel, sans équivalence de capacité ni preuve de réalisation Beaumanoir. Synthèse sélective sans copie du document. CMP284, U726/U727.


### ELM740

MKT20 — Oracle, [Consigned Inventory Aging](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/famml/consigned-inventory-aging.html). Fusion 25C. Consulté le 24 septembre 2026 ; passages : Aging process / Transfer to Owned. Reformulation : Échéance convenue et transfert de propriété distinct du mouvement ; la page décrit un transfert manuel, sans automatisme universel. Limite : Documentation primaire consultée ; appui partiel, sans équivalence de capacité ni preuve de réalisation Beaumanoir. Synthèse sélective sans copie du document. CMP284, U726/U727.


### ELM741

MKT14 — Microsoft, [Cycle counting](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/cycle-counting). Page évolutive. Consulté le 24 septembre 2026 ; passages : Create / Spot counting / Resolve differences. Reformulation : Demande de comptage, résultat et revue des écarts distingués. Limite : Documentation primaire consultée ; appui partiel, sans équivalence de capacité ni preuve de réalisation Beaumanoir. Synthèse sélective sans copie du document. CMP284, U726/U727.


### ELM742

MKT20 — Oracle, [Mobile Supply Chain Applications User’s Guide](https://docs.oracle.com/cd/E26401_01/doc.122/e48826/T256582T257763.htm). EBS 12.2. Consulté le 24 septembre 2026 ; passages : Cycle Counting / Physical Inventory. Reformulation : Comptages cycliques et inventaire physique rapprochent quantités enregistrées et constatées ; réalisation produit distincte de la responsabilité FLOW. Limite : Documentation primaire consultée ; appui partiel, sans équivalence de capacité ni preuve de réalisation Beaumanoir. Synthèse sélective sans copie du document. CMP284, U726/U727.


### ELM743

MKT14 — Microsoft, [Inventory Visibility reservations](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-reservations). Page évolutive. Consulté le 24 septembre 2026 ; passages : Sample use case / offsets. Reformulation : Réservation réduit les quantités disponibles pour réservation sans sortie physique ; consommation et libération évitent le double compte. Limite : Documentation primaire consultée ; appui partiel, sans équivalence de capacité ni preuve de réalisation Beaumanoir. Synthèse sélective sans copie du document. CMP284, U726/U727.


### ELM744

MKT20 — Oracle, [Reservations](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/famml/reservations.html). Fusion 25C. Consulté le 24 septembre 2026 ; passages : Reservation types / Supply source types. Reformulation : Réservations à maille haute ou détaillée, pouvant porter sur stock ou apports attendus ; aucun blocage physique universel. Limite : Documentation primaire consultée ; appui partiel, sans équivalence de capacité ni preuve de réalisation Beaumanoir. Synthèse sélective sans copie du document. CMP284, U726/U727.


### ELM745

MKT20 — Oracle, [How You Review Item Supply and Demand](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/famml/how-you-review-item-supply-and-demand.html). Fusion 25D. Consulté le 24 septembre 2026 ; passages : Summary / Quantities / Supply and Demand types. Reformulation : Vue temporelle du stock, des apports et des besoins ; règles de non-double compte. Pas de taxonomie universelle séparant les deux Visibility. Limite : Documentation primaire consultée ; appui partiel, sans équivalence de capacité ni preuve de réalisation Beaumanoir. Synthèse sélective sans copie du document. CMP284, U726/U727.


### ELM746

MKT14 — Microsoft, [Calculate sales order delivery dates using CTP](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/calculate-delivery-dates-using-ctp). Page évolutive. Consulté le 24 septembre 2026 ; passages : Near real-time CTP / Comparison / Batch CTP. Reformulation : CTP prend en compte matériaux et capacités ; variantes immédiate et batch, celle-ci liée au plan dynamique. Ne pas assimiler dates confirmées du produit à l’autorité de confirmation FLOW. Limite : documentation produit, sans équivalence de capacités ni preuve de réalisation Beaumanoir. CMP285, U735.


### ELM747

MKT20 — Oracle, [Database Promising](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/fascp/overview-of-database-centric-order-promising.html). Fusion 26A. Consulté le 24 septembre 2026 ; passages : Product Management / Create Supply. Reformulation : Le flux CTP peut utiliser des règles make/buy selon les paramètres ; appui à la possibilité d’approvisionnement nouveau, pas obligation de regrouper décision et connaissance. Limite : documentation produit, sans équivalence de capacités ni preuve de réalisation Beaumanoir. CMP285, U735.


### ELM748

MKT14 — Microsoft, [Master plans overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/master-plans). Page évolutive. Consulté le 24 septembre 2026 ; passages : Master plans / Positive and negative days. Reformulation : Le planning peut générer ou ajuster des planned purchase orders pour couvrir les besoins ; ne pas confondre proposition planifiée et achat ferme. Limite : documentation produit, sans équivalence de capacités ni preuve de réalisation Beaumanoir. CMP285, U735.


### ELM749

MKT13 — SAP, [Outlining Backorder Processing for Advanced ATP in SAP S/4HANA](https://learning.sap.com/courses/exploring-aatp-in-sap-s-4hana/outlining-backorder-processing-for-advanced-atp-in-sap-s-4hana). Cours évolutif, édition précise non indiquée ; consulté le 24 septembre 2026. Passages Configure BOP Segments, Confirmation Strategies, Configure BOP Variant. Reformulation : prioriser et redistribuer les confirmations de quantités et dates, avec stratégies et simulation ; fonctions ATP ou Supply Assignment selon configuration. Limite : périmètre produit SAP, pas équivalence de capacité FLOW ni preuve installée. CMP286, U737.

### ELM750

MKT13 — SAP, [Using Advanced Available-To-Promise (aATP) in SAP S/4HANA](https://learning.sap.com/courses/functions-innovations-in-sap-s-4hana-sales/using-advanced-available-to-promise-aatp-in-sap-s-4hana_ef38afd2-4730-433f-854a-613b8e4afec5). Cours évolutif, édition précise non indiquée ; consulté le 24 septembre 2026. Passage Backorder Processing / Confirmation strategies. Reformulation : les stratégies peuvent améliorer, dégrader ou retirer des confirmations en quantité/date. Limite : second document primaire SAP, sans constituer un consensus multiéditeur. CMP286, U737.


### ELM751

MKT14 — Microsoft, [Action messages](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/action-messages). Page mise à jour le 26 mars 2026, consultée le 24 septembre 2026 ; introduction et Select action messages. Reformulation : master planning propose avance, report, augmentation ou diminution d’ordres existants planifiés, approuvés ou affermis, notamment d’approvisionnement. L’utilisateur décide d’appliquer les changements. Limite : ne prouve pas une redistribution des confirmations de commandes clients équivalente à SAP BOP. CMP287, U738.

### ELM752

MKT14 — Microsoft, [Delays](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/delays). Page mise à jour le 25 août 2025, consultée le 24 septembre 2026 ; introduction et Limited delays. Reformulation : master planning calcule des dates réalisables selon délais, matériaux et capacités ; liens avec les ajustements d’ordres et limites de propagation. Limite : date calculée distincte de la confirmation commerciale FLOW ; fonction produit, pas capacité imposée. CMP287, U738.


### ELM753

MKT14 — Microsoft, [Coverage settings](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/coverage-settings). Documentation évolutive consultée le 24 septembre 2026 ; passages : Coverage groups / Item coverage. Reformulation : Règles de couverture par groupe et article, avec valeurs par défaut et dérogations. Limite : configuration Dynamics 365 SCM, pas taxonomie FLOW ni preuve d’équivalence complète au BOP SAP. CMP288, U739.


### ELM754

MKT14 — Microsoft, [Priority-based planning](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/priority-based-planning). Documentation évolutive consultée le 24 septembre 2026 ; passages : Planning priority models / Coverage group / Action messages. Reformulation : Modèles de priorité affectés aux groupes de couverture ; les codes de couverture en priority-based planning ne génèrent pas d’action messages. Limite : configuration Dynamics 365 SCM, pas taxonomie FLOW ni preuve d’équivalence complète au BOP SAP. CMP288, U739.


### ELM755

MKT14 — Microsoft, [Run planning for a subset of items](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/plan-filters). Documentation évolutive consultée le 24 septembre 2026 ; passages : Plan filters / Runtime filters. Reformulation : Le périmètre du calcul est restreint par filtres de plan et de lancement ; pas preuve d’un paramètre universel policy. Limite : configuration Dynamics 365 SCM, pas taxonomie FLOW ni preuve d’équivalence complète au BOP SAP. CMP288, U739.


### ELM756

MKT13 — SAP, [Explaining Supply Assignment](https://learning.sap.com/courses/exploring-fashion-functions-and-business-processes-in-sap-s-4hana-for-fashion-and-vertical-business/explaining-supply-assignment_af05618d-4954-4f22-9857-3dd12e3940c4). Cours S/4HANA Fashion évolutif, édition précise non indiquée ; consulté le 24 septembre 2026. Reformulation : Supply Assignment affecte les apports aux besoins ; les contrôles de release examinent les quantités affectées face aux exigences. Limite : périmètre fonctionnel SAP, pas équivalence des protections ou réservations FLOW. CMP289, U740.


### ELM757

MKT14 — Microsoft, [Inventory marking](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/marking). Documentation Dynamics 365 SCM évolutive consultée le 24 septembre 2026 ; passages : Introduction et options de marquage. Reformulation : Le pegging est le lien de couverture recalculable par master planning ; le marking est plus durable, reste révocable et est respecté par le calcul. Les réservations existantes sont prises en compte. Ne pas assimiler tout lien de planification à une réservation. Limites : fonctions produit selon configuration et version ; aucune équivalence intégrale avec SAP BOP/ARun ni taxonomie FLOW imposée. CMP290, U744.


### ELM758

MKT14 — Microsoft, [Make-to-order supply automation](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/make-to-order-supply-automation). Documentation Dynamics 365 SCM évolutive consultée le 24 septembre 2026 ; passages : Control the pegging sequence used during master planning. Reformulation : La séquence de couverture peut privilégier des réceptions futures compatibles afin de préserver le stock pour les commandes proches. Paramètres au niveau plan, article ou groupe ; pas un unique argument universel policy. Limites : fonctions produit selon configuration et version ; aucune équivalence intégrale avec SAP BOP/ARun ni taxonomie FLOW imposée. CMP290, U744.


### ELM759

MKT14 — Microsoft, [Keep supply for confirmed demand in Planning Optimization](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/keep-supply-for-confirmed-demand). Documentation Dynamics 365 SCM évolutive consultée le 24 septembre 2026 ; passages : Introduction, configuration et Interaction with approved planned orders and the freezing time fence. Reformulation : Une fonctionnalité paramétrable protège les besoins, ordres planifiés et liens de couverture associés aux lignes confirmées entre calculs, jusqu’aux niveaux de nomenclature. Protection liée aux confirmations, distincte des seuls horizons de gel. Limites : fonctions produit selon configuration et version ; aucune équivalence intégrale avec SAP BOP/ARun ni taxonomie FLOW imposée. CMP290, U744.


### ELM760

MKT14 — Microsoft, [Inventory Visibility inventory allocation](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-allocation). Documentation Dynamics 365 SCM évolutive consultée le 24 septembre 2026 ; passages : Introduction et concepts d’allocation. Reformulation : Protection de quantités pour des groupes, canaux ou clients, avec consommation du pool. Allocation ne signifie pas ici automatiquement affectation d’une réception identifiée à une ligne de commande. Limites : fonctions produit selon configuration et version ; aucune équivalence intégrale avec SAP BOP/ARun ni taxonomie FLOW imposée. CMP290, U744.


### ELM761

MKT14 — [Inventory Visibility on-hand change schedules and ATP](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-available-to-promise). Documentation primaire consultée le 25 septembre 2026 ; passage : How the on-hand change schedule and ATP calculations work. Reformulation : Microsoft rapproche stock présent, entrées/sorties planifiées et calcul ATP. Une attente ne devient un fait qu’après reconnaissance ; éviter le double compte. Le produit Inventory Visibility inclut un calcul sans imposer son type métier. Limites : fonction produit, pas taxonomie de capacités ni preuve de réalisation Beaumanoir. CMP295, U751.


### ELM762

MKT20 — [Set Attributes on Your Supply Chain Search](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/fascp/promising-attributes-for-supply-chain-availability-searches.html). Documentation primaire consultée le 25 septembre 2026 ; passage : Profitable to Promise. Reformulation : Oracle 25D calcule les coûts et choisit l’option la moins coûteuse parmi les possibilités pour une même date ; la priorité de sourcing peut être remplacée. Le coût ne justifie pas automatiquement de retarder la date demandée. Limites : fonction produit, pas taxonomie de capacités ni preuve de réalisation Beaumanoir. CMP295, U751.


### ELM763

MKT20 — [Create Alternative Fulfillment Scenarios to Reduce Cost](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/fascp/create-alternative-fulfillment-scenarios-to-reduce-cost.html). Documentation primaire consultée le 25 septembre 2026 ; passage : Introduction et Check Availability. Reformulation : Oracle 25D distingue les options, leurs coûts, dates et lieux ; le parcours permet de conserver l’option ou de choisir une alternative. Calcul économique et sélection peuvent être distingués dans FLOW même si le produit les compose. Limites : fonction produit, pas taxonomie de capacités ni preuve de réalisation Beaumanoir. CMP295, U751.


### ELM764

MKT14 — Microsoft, [Change the ownership of consignment inventory based on production demand](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/tasks/change-ownership-consignment). Dynamics 365 SCM, documentation mise à jour le 10 avril 2025, consultée le 25 septembre 2026 ; introduction, Create an inventory ownership journal, Post the inventory ownership change journal. Identifiant natif : aucun identifié. Nature : procédure produit. Reformulation : les lignes du journal peuvent être créées manuellement ou depuis les besoins des ordres de production, filtrés par statut et date. La comptabilisation du journal constate la sortie fournisseur et la réception par l’entité acheteuse. La page précise que la consignation sortante et le traitement automatique du journal ne sont pas pris en charge nativement. Limites : périmètre consignation entrante et scénario production ; ne prouve ni moteur événementiel automatique ni capacité de décision générale chez Microsoft. Comparaison CMP297, U754. Synthèse seulement, aucun contenu substantiel reproduit.


### ELM765

MKT14 — Microsoft, [Landed cost module overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/landed-cost/landed-cost-overview). Documentation Dynamics 365 SCM évolutive consultée le 25 septembre 2026. Nature : fonction produit ; identifiant natif non identifié. Reformulation : Sections Item ownership et Setup and configuration : gestion de biens acquis avant réception physique ; paramétrage goods-in-transit associé aux conditions de livraison de la commande. Limites : mécanismes produit et reconnaissance financière ; aucune règle juridique universelle de transfert ni causalité douane/propriété démontrée. Synthèse sans reproduction substantielle. U755, CMP298.


### ELM766

MKT14 — Microsoft, [Goods-in-transit processing and receiving](https://learn.microsoft.com/en-us/dynamics365/supply-chain/landed-cost/in-transit-processing). Documentation Dynamics 365 SCM évolutive consultée le 25 septembre 2026. Nature : fonction produit ; identifiant natif non identifié. Reformulation : Introduction : facturation avant réception et représentation des biens en transit ; leur acquisition et leur disponibilité physique à destination sont distinctes. Limites : mécanismes produit et reconnaissance financière ; aucune règle juridique universelle de transfert ni causalité douane/propriété démontrée. Synthèse sans reproduction substantielle. U755, CMP298.


### ELM767

MKT14 — Microsoft, [Release to warehouse](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/release-to-warehouse-process). Documentation produit évolutive, édition précise non indiquée ; consultée le 25 septembre 2026. Passage : Automatic release to the warehouse. Nature : fonction/processus produit. Reformulation : Libération de plusieurs ordres, traitement récurrent, sélection des quantités et regroupement par client. La création de vagues et de travail dépend du paramétrage. Limites : Page primaire ouverte ; mécanisme produit, pas taxonomie FLOW ni garantie d’optimisation. Synthèse sans reproduction substantielle. U758, CMP300.


### ELM768

MKT14 — Microsoft, [Configure shipment consolidation policies](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/configure-shipment-consolidation-policies). Documentation produit évolutive, édition précise non indiquée ; consultée le 25 septembre 2026. Passage : Scenario 3, Order pool, client-driven consolidation. Nature : fonction/processus produit. Reformulation : Regrouper des lignes de plusieurs commandes pour un même compte, entrepôt et mode de livraison selon un pool ; la documentation distingue explicitement le besoin piloté par le client. Limites : Page primaire ouverte ; consolidation d’expéditions, pas garantie d’une seule palette. Synthèse sans reproduction substantielle. U758, CMP300.


### ELM769

MKT14 — Microsoft, [Wave creation and processing](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/wave-processing). Documentation produit évolutive, édition précise non indiquée ; consultée le 25 septembre 2026. Passage : Wave processing ; release to picking and packing. Nature : fonction/processus produit. Reformulation : La constitution, le traitement et la libération des vagues organisent le travail de préparation dans l’entrepôt. Limites : Page primaire consultée ; responsabilité WMS plus détaillée que la libération des ordres par FLOW. Synthèse sans reproduction substantielle. U758, CMP300.


### ELM770

MKT23 — IBM, [Using economic shipping parameters](https://www.ibm.com/docs/en/order-management?topic=features-using-economic-shipping-parameters). Documentation produit évolutive, édition précise non indiquée ; consultée le 25 septembre 2026. Passage : Scenarios ; Allow shipment delay ; shipping window. Nature : fonction/processus produit. Reformulation : Un ordre ou une expédition peut être retenu en anticipation d’un autre pour consolidation ; délai autorisé et fenêtre d’expédition limitent les regroupements. Limites : Passages primaires indexés consultés ; ouverture directe refusée HTTP 403. Rétention économique documentée, pas preuve d’optimisation de toutes les charges WMS. Synthèse sans reproduction substantielle. U758, CMP300.


### ELM771

MKT23 — IBM, [Consolidate to shipment](https://www.ibm.com/docs/en/order-management?topic=transactions-consolidate-shipment). Documentation produit évolutive, édition précise non indiquée ; consultée le 25 septembre 2026. Passage : Transaction CONSOLIDATE_TO_SHIPMENT ; conditions de compatibilité. Nature : fonction/processus produit. Reformulation : La transaction du pipeline Order Fulfillment cherche une expédition compatible avec la release, selon site, destination, vendeur, transporteur et statuts modifiables. Limites : Texte primaire indexé consulté ; ouverture directe en erreur. Consolidation logique d’expédition, pas algorithme de palettisation. Synthèse sans reproduction substantielle. U758, CMP300.


### ELM772

MKT13 — SAP, [Defining the Product Availability Check](https://help.sap.com/docs/SAP_S4HANA_CLOUD/32da8359c8ee4e8b8e8c5e15cacba5aa/741d645473c50d4ee10000000a423f68.html). Consulté le 25 septembre 2026. Nature : fonction ou option produit ; aucun identifiant natif autonome identifié. Reformulation : Disponibilité selon stock ou éléments de réception ; certains modes limités au stock excluent les commandes et demandes d’achat. Limites : Passages primaires indexés consultés ; page ouverte sans corps exploitable. Options de produit, pas taxonomie FLOW. Synthèse sans copie substantielle. U761, CMP302.


### ELM773

MKT13 — SAP, [Determining Alternatives](https://help.sap.com/docs/SAP_S4HANA_CLOUD/32da8359c8ee4e8b8e8c5e15cacba5aa/21afef7a7724417daa91a26b6d071e5e.html). Consulté le 25 septembre 2026. Nature : fonction ou option produit ; aucun identifiant natif autonome identifié. Reformulation : Alternative-Based Confirmation recherche des sites, emplacements ou produits alternatifs ; la sélection suit une stratégie. Limites : Texte primaire indexé consulté. Une alternative ne prouve pas une création de supply ni un contrôle capacitaire ; sélection séparée dans FLOW. Synthèse sans copie substantielle. U761, CMP302.


### ELM774

MKT20 — Oracle, [See How Promising Estimates Availability](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fascp/determine-how-order-promising-gets-and-estimates-availability.html). Consulté le 25 septembre 2026. Nature : fonction ou option produit ; aucun identifiant natif autonome identifié. Reformulation : Distingue recherche de supply, estimation par lead times et disponibilité infinie sans examen des ressources. Limites : Page primaire ouverte, 25C ; modes du moteur GOP, pas trois capacités métier ni garantie de disponibilité. Synthèse sans copie substantielle. U761, CMP302.


### ELM775

MKT20 — Oracle, [Overview of the Order Promising Work Area](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fascp/overview-of-the-order-promising-work-area.html). Consulté le 25 septembre 2026. Nature : fonction ou option produit ; aucun identifiant natif autonome identifié. Reformulation : Financial Performance expose revenus, fulfillment costs et pourcentage de marge selon les dates. Limites : Page primaire ouverte et passage indexé consulté, 25C. Vue analytique, pas preuve d’un mode PTP natif distinct de sélection. Synthèse sans copie substantielle. U761, CMP302.


### ELM776

MKT20 — Oracle, [AI Agent: Gross Margin Analyst](https://docs.oracle.com/en/cloud/saas/readiness/scm/26b/inv26b/26B-inventory-wn-f42401.htm). Consulté le 25 septembre 2026. Nature : fonction ou option produit ; aucun identifiant natif autonome identifié. Reformulation : Évaluer marge par commande et article et éclairer les options de sourcing sensibles à la marge. Limites : Page primaire ouverte, annonce 26B. Fonction d’analyse adjacente au promising ; ne pas confondre annonce, installation et taxonomie. Aucun agent IA requis dans FLOW. Synthèse sans copie substantielle. U761, CMP302.


### ELM777

MKT13 — SAP, [Scenarios and Supported Features of PPAC and PAC with Supply Creation](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f132c385e0234fe68ae9ff35b2da178c/95cbb18b60da470cac8d340f0c6f5251.html). Consulté le 25 septembre 2026. Nature : fonction ou option produit ; aucun identifiant natif autonome identifié. Reformulation : Création de supply avec planification multiniveau, capacités finies/infinies et sources alternatives selon les scénarios PP/DS. Limites : Passage primaire indexé consulté ; page ouverte sans corps exploitable, édition non affichée. Création/confirmation intégrées au produit, séparées de l’évaluation FLOW. Synthèse sans copie substantielle. U761, CMP302.


### ELM778

MKT20 — Oracle, [How the Order Orchestration and Order Promising Processes Use the Collected Planning Data](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faubm/how-the-order-orchestration-and-order-promising-processes-use.html). Consulté le 25 septembre 2026, page primaire ouverte et passages lus. Nature : fonction/processus ou contrat de produit, pas capacité métier native ; identifiant natif distinct non identifié. Localisateur : 26B, sections Data Collections, Order Orchestration et Order Promising. Reformulation : L’orchestration transmet à Global Order Promising des demandes de scheduling ou de vérification de disponibilité ; Promising construit sa réponse à partir des données collectées. Planning, orchestration et promising utilisent des informations communes sans constituer un processus unique. Limites : Organisation fonctionnelle et technique d’Oracle ; ne prouve ni invocation à chaque état ni taxonomie universelle de sous-domaines. Synthèse sans reproduction substantielle. U765, CMP303.


### ELM779

MKT20 — Oracle, [Order Promises REST Endpoints](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26c/fasrp/api-order-management-order-promises.html). Consulté le 25 septembre 2026, page primaire ouverte et passages lus. Nature : fonction/processus ou contrat de produit, pas capacité métier native ; identifiant natif distinct non identifié. Localisateur : 26C, Order Management/Order Promises. Reformulation : La ressource fournit les résultats de consultation et les options alternatives de disponibilité ; elle couvre aussi des mises à jour et annulations de commandes dans GOP. Limites : Cette interface rassemble lectures et mutations ; FLOW conserve la séparation évaluation, sélection de proposition et engagement dans les Orders. Aucune garantie de temps de réponse ni périmètre métier déduit de la seule API. Synthèse sans reproduction substantielle. U765, CMP303.


### ELM780

MKT14 — Microsoft, [Track time-series inventory in Inventory Visibility](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-track-atp). Consulté le 25 septembre 2026, page primaire ouverte et passages lus. Nature : fonction/processus ou contrat de produit, pas capacité métier native ; identifiant natif distinct non identifié. Localisateur : Documentation évolutive, mise à jour affichée 27 juillet 2026 ; introduction et Query and post ATP data using the Inventory Visibility API. Reformulation : Inventory Visibility rapproche les entrées et sorties attendues, calcule un ATP omnicanal et permet aux systèmes externes d’interroger les disponibilités futures par API, en quasi temps réel. Limites : Réutilisabilité documentée malgré le rattachement à Inventory Visibility ; contre-exemple au caractère systématiquement autonome de Promising dans les produits. Ne prescrit pas de sous-domaine FLOW. Synthèse sans reproduction substantielle. U765, CMP303.


Actualisation de consultation U768 / CMP304 — 25 septembre 2026 : ELM404 Microsoft Integrate transfer orders (motifs usuels et cycle shipped/received), ELM739 Set up consignment (apport, réception fournisseur propriétaire, changement de propriété), ELM438 Specify how to dispose of returned items (disposition code/action) et ELM364 Oracle 26B Use Supply Chain Orchestration in Your Back-to-Back Flows (flux stock, achat, transfert, livraison directe ; séquences et notifications) ont été ouverts. Les motifs et séquences de produit ne prescrivent pas la distinction FLOW entre comportement et scénario. Réemploi des identifiants existants ; synthèse sélective, sans preuve de réalisation installée.


### ELM781

MKT14 — Microsoft, [Create a consignment replenishment order](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/tasks/create-consignment-replenishment-order). Documentation évolutive, mise à jour affichée 2025-04-10 ; consultée le 25 septembre 2026, texte primaire lu. Localisateur : titre, Create a consignment replenishment order, Receive items. Nature : document transactionnel et parcours produit, pas capacité normative. Reformulation : demander l’apport fournisseur en consignation et enregistrer une réception partielle en conservant la propriété fournisseur. Le libellé natif est Consignment replenishment order, sans Fill-up. Limite : parcours entrant spécifique, pas preuve de tous les régimes ni de la terminologie SAP. Synthèse sélective sans reproduction substantielle. U770, CMP305.

### ELM782

MKT14 — Microsoft, [Master planning with supply forecasts](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/supply-forecast). Documentation évolutive ; consultée le 25 septembre 2026, texte primaire lu. Localisateur : Plan for an item with supply forecast lines ; réduction des prévisions ; exemples d’achats planifiés. Nature : fonction produit. Reformulation : les supply forecasts entrent dans le calcul de couverture et peuvent conduire à des achats planifiés ; les transactions pertinentes réduisent les prévisions selon les règles configurées. Limite : ce sens produit ne correspond pas exactement au Supply Plan FLOW volontairement limité aux mouvements prévus hors achats ; il ne prescrit aucun renommage du modèle. Édition globale non précisée ; certains mécanismes de la page indiquent 10.0.49 ou ultérieur. Synthèse sélective. U770, CMP305.

Actualisation U770 / CMP305 — 25 septembre 2026 : relecture primaire de ELM739 (consignation Microsoft), ELM372 (Oracle 26C PTP, sélection au moindre coût), ELM748 (master plans Microsoft), ELM746 (CTP et capacités), ELM393 (DOM et optimisation des sources), ELM507 (définition, maintenance et échange produit), ELM445 (données maîtres, demandes d’entrepôt et retours d’exécution), ELM364 (Oracle 26B, supply order distinct de sales order). Ces huit documents et ELM781/ELM782 soutiennent le réexamen ciblé. Les écarts FLOW déjà assumés restent distincts des erreurs d’attribution et des textes périmés. Les 218 URL normalisées présentes dans les comparaisons n’ont pas toutes été relues ; aucune certification globale de fraîcheur ou de pertinence.


Actualisation U771 / CMP306 — 25 septembre 2026 : ELM133, Microsoft [Warehouse management only mode overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/wms-only-mode-overview), introduction et inbound/outbound shipment orders ; ELM445, Microsoft [Exchange data between systems](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/wms-only-mode-exchange-data), demandes entrantes et données de progression/réception. Pages primaires ouvertes et passages lus. Ces documents étayent la séparation entre commande source, demande logistique et retours d’exécution. Ils ne prescrivent ni le nom Receiving Order ni la taxonomie des capacités FLOW. Réemploi des identifiants existants, sans modification de leurs preuves antérieures.


### ELM783

MKT13 — SAP, [Running an Available-to-Promise (ATP) Check in SAP S/4HANA Sales](https://learning.sap.com/courses/performing-the-availability-check/running-an-available-to-promise-atp-check-in-sap-s-4hana-sales_a2b4c5e3-1618-418d-a4f6-efe5ff43f7f1). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Running an Available-to-Promise (ATP) Check in SAP S/4HANA Sales, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : L’ATP confronte quantité et date demandées aux disponibilités, puis propose des échéances confirmables. Limites : Le produit enchaîne calcul et confirmation ; FLOW sépare évaluation, sélection de proposition et engagement de la commande. Les stocks futurs restent dans le périmètre ATP de référence. U774, CMP307.


### ELM784

MKT13 — SAP, [Running Materials Requirements Planning](https://learning.sap.com/courses/business-processes-in-sap-s-4hana-sourcing-procurement/running-materials-requirements-planning). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Running Materials Requirements Planning, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Le MRP couvre les besoins nets et produit des propositions de réapprovisionnement selon les règles de lotissement. Limites : Les propositions d’approvisionnement sont un appui partiel ; le master plan FLOW porte aussi les affectations, et son optimisation ne se réduit pas au MRP. U774, CMP307.


### ELM785

MKT13 — SAP, [Using Wave Management in Warehousing](https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-public-edition-warehouse-management/using-wave-management-in-warehousing_f5d66de1-603e-40a0-b6f8-a671760c84ce). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Using Wave Management in Warehousing, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Les vagues regroupent des besoins d’entrepôt pour une libération et un traitement coordonnés. Limites : Mécanisme aval WMS : ne démontre pas à lui seul la rétention amont orchestrée par FLOW ni l’optimisation économique d’une palette client complète. U774, CMP307.


### ELM786

MKT13 — SAP, [Introducing Goods Movements](https://learning.sap.com/courses/managing-inventory-movements-and-stock-transfers-in-sap-s-4hana-cloud-public-edition/introducing-goods-movements_ba906e87-54e8-4f56-837e-bde4d82599de). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Introducing Goods Movements, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Les mouvements de stock sont enregistrés avec des documents matériels permettant leur traçabilité. Limites : Le document matériel est une réalisation du journal métier, pas sa définition universelle ; le journal comptable reste distinct. U774, CMP307.


### ELM787

MKT13 — SAP, [Conducting Physical Inventory](https://learning.sap.com/courses/inventory-management-and-physical-inventory-in-sap-s-4hana/conducting-physical-inventory). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Conducting Physical Inventory, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Le comptage physique est comparé au stock enregistré et les écarts sont rapprochés avant correction. Limites : Le parcours d’inventaire documenté ne justifie pas toutes les méthodes de comptage ni un comportement par écran. U774, CMP307.


### ELM788

MKT13 — SAP, [Setting up a Stock Transfer Process for an Intra-Company Stock Tr](https://learning.sap.com/courses/configuring-cross-application-processes-in-sap-s-4hana-sales-and-procurement/setting-up-a-stock-transfer-process-for-an-intra-company-stock-transfer_ad0e9a99-4f15-42d1-9ba5-8eecac49d235). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Setting up a Stock Transfer Process for an Intra-Company Stock Tr, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Le stock transport order organise un transfert avec expédition, transit et réception. Limites : Un ordre de transfert ne prouve pas une décision d’optimisation du rééquilibrage des stocks. U774, CMP307.


### ELM789

MKT13 — SAP, [Executing Sales Order Management](https://learning.sap.com/courses/executing-basic-erp-processes-with-sap-s-4hana/executing-sales-order-management). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Executing Sales Order Management, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Le sales order porte les articles, quantités, dates et conditions convenus ; la livraison et la facturation poursuivent son exécution. Limites : La structure du document SAP éclaire l’engagement, sans imposer le cycle applicatif ou l’organisation ERP à FLOW. U774, CMP307.


### ELM790

MKT13 — SAP, [Executing Purchase Order Management](https://learning.sap.com/courses/executing-basic-erp-processes-with-sap-s-4hana/executing-purchase-order-management). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Executing Purchase Order Management, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Le purchase order formalise les articles, quantités et conditions de l’achat, éventuellement à partir de documents de référence. Limites : Le document d’achat ne se confond pas avec la prestation logistique confiée pour exécuter cet achat. U774, CMP307.


### ELM791

MKT13 — SAP, [Exploring the Return to Supplier (BMK) Scenario](https://learning.sap.com/courses/establishing-core-supply-chain-processes-in-sap-s-4hana-cloud-public-edition/exploring-the-return-to-supplier-bmk-scenario_c73e0390-45fc-4929-95d1-8af0a467f0a9). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Exploring the Return to Supplier (BMK) Scenario, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Le retour fournisseur peut donner lieu à crédit ou à remplacement avec une nouvelle commande d’achat. Limites : Une annulation immédiate de réception est distincte ; la réparation fournisseur n’est pas démontrée par ce seul parcours. U774, CMP307.


### ELM792

MKT13 — SAP, [Managing Freight Orders and Freight Bookings](https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-public-edition-transportation-management/managing-freight-orders-and-freight-bookings_a83a6371-2f56-4fa2-8e12-ae0aab3c74c2). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Managing Freight Orders and Freight Bookings, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Freight orders et bookings portent étapes, transporteurs, dates, échanges de statut et documents de transport. Limites : Les documents de transport étayent seulement une partie de Document Production ; aucun catalogue universel d’ordres FLOW n’est natif de ce produit. U774, CMP307.


### ELM793

MKT13 — SAP, [Selecting Carriers and Tendering](https://learning.sap.com/courses/business-processes-in-sap-s-4hana-transportation-management/selecting-carriers-and-tendering_d66f6116-ed5d-491f-b91b-e958fdedf2a5). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Selecting Carriers and Tendering, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : La sélection du transporteur rapproche coûts, contraintes et capacités disponibles avant sollicitation. Limites : Le périmètre documenté est le transport ; il ne prouve pas la visibilité de capacité de toutes les prestations. U774, CMP307.


### ELM794

MKT13 — SAP, [Configuring Charge Management and Explaining the Charge Calculati](https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-public-edition-transportation-management/configuring-charge-management-and-explaining-the-charge-calculation-process_d2c3b050-5874-4439-a88e-8dcfa231311c). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Configuring Charge Management and Explaining the Charge Calculati, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Les accords et barèmes permettent de calculer des charges de transport selon les étapes, distances et conditions. Limites : Appui à la composante coût, pas preuve d’un PTP natif SAP couvrant le dossier économique contextuel FLOW ; ni choix de promesse ni marge globale déduits. U774, CMP307.


### ELM795

MKT13 — SAP, [Performing Value-Added Services (VAS)](https://learning.sap.com/courses/exploring-business-processes-for-supply-chain-execution-in-sap-s-4hana-cloud-private-edition/performing-value-added-services-vas-). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Performing Value-Added Services (VAS), parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Les VAS orders encadrent le kitting et les consommations de composants associées. Limites : Appui au kitting ; le dekitting n’est pas démontré ici. FLOW garde ses familles spécialisées, sans réintroduire une capacité générique Value-Added Service Order. U774, CMP307.


### ELM796

MKT13 — SAP, [Processing a Goods Receipt in SAP EWM](https://learning.sap.com/courses/exploring-business-processes-in-sap-ewm-for-sap-s-4hana-cloud-private-edition/processing-a-goods-receipt-in-sap-ewm). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Processing a Goods Receipt in SAP EWM, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : La livraison entrante encadre la réception EWM et l’enregistrement de son résultat. Limites : FLOW distingue demande de prestation, réalisation physique et reconnaissance du stock ; la maille Receiving Order est un choix métier local. U774, CMP307.


### ELM797

MKT13 — SAP, [Introducing Service Order Management and Monitoring](https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-public-edition-service-management/introducing-service-order-management-and-monitoring_c75846f1-6c1c-4ae4-b1a7-12f560575119). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Introducing Service Order Management and Monitoring, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Le service product et les transactions de service décrivent des prestations et leurs conditions. Limites : Les services vendus dans SAP ne se confondent pas avec toutes les prestations achetées ou pilotées par FLOW ; appui partiel au Service Catalog. U774, CMP307.


### ELM798

MKT13 — SAP, [Configuring Pricing for Service Transactions](https://learning.sap.com/courses/performing-basic-customizing-for-service-in-sap-s-4hana-and-sap-s-4hana-cloud-private-edition/configuring-pricing-for-service-transactions_c9d5bd5a-5032-410b-8632-579a947eedcc). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Configuring Pricing for Service Transactions, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Les conditions de prix s’appliquent aux produits et services des transactions de service. Limites : Le calcul de prix SAP ne définit pas une frontière de domaine FLOW ; le Price Book porte les conditions, les capacités utilisatrices les évaluent. U774, CMP307.


### ELM799

MKT13 — SAP, [Introducing Common Features of Consolidation and Mass Processing](https://learning.sap.com/courses/sap-master-data-governance-on-sap-s-4hana/introducing-common-features-of-consolidation-and-mass-processing). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Introducing Common Features of Consolidation and Mass Processing, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : La consolidation MDG rapproche et contrôle les données maîtres de plusieurs origines. Limites : La gouvernance d’entreprise du produit est plus large que l’autorité locale du référentiel Supply FLOW. U774, CMP307.


### ELM800

MKT13 — SAP, [Analyzing SAP S/4HANA Cloud Public Edition, Warehouse Management](https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-public-edition-warehouse-management/understanding-sap-s-4hana-cloud-public-edition-warehouse-management_ff02ecf3-9fe0-499d-b96d-8cc0f7f66900). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Analyzing SAP S/4HANA Cloud Public Edition, Warehouse Management, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : L’intégration WMS échange données maîtres, demandes entrantes et sortantes et retours de réalisation ; le monitoring expose l’activité. Limites : FLOW sépare captation Integration, connaissance Visibility et ordres de prestation ; la documentation WMS ne prescrit pas ces capacités comme taxonomie native. U774, CMP307.


### ELM801

MKT14 — Microsoft, [Create orchestration flows | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/orchestration-flows). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Create orchestration flows | Microsoft Learn, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Les flows relient événements reçus, règles et actions d’orchestration. Limites : Les étapes techniques ne sont pas automatiquement des capacités ou comportements ; FLOW exprime les responsabilités et résultats métier. U774, CMP307.


### ELM802

MKT14 — Microsoft, [Quality management for warehouse processes - Supply Chain Management | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/quality-management-for-warehouses-processes). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Quality management for warehouse processes - Supply Chain Management | Dynamics 365 | Microsoft Learn, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Les quality orders organisent contrôles et suites logistiques selon leurs résultats. Limites : Le produit exécute les contrôles ; FLOW porte la demande, les critères attendus et le résultat de la prestation. U774, CMP307.


### ELM803

MKT14 — Microsoft, [Process kit assembly and disassembly orders - Commerce | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/commerce/process-kit-assembly-and-disassembly-orders). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Process kit assembly and disassembly orders - Commerce | Dynamics 365 | Microsoft Learn, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Des ordres distincts encadrent l’assemblage et le désassemblage de kits et mettent à jour les quantités. Limites : FLOW réunit kitting et dekitting dans une famille ; il ne reprend pas automatiquement la décomposition des écrans Commerce. U774, CMP307.


### ELM804

MKT14 — Microsoft, [Global address book overview - Finance & Operations | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/sv-se/dynamics365/fin-ops-core/fin-ops/organization-administration/overview-global-address-book). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Global address book overview - Finance & Operations | Dynamics 365 | Microsoft Learn, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Le carnet d’adresses identifie personnes et organisations avec plusieurs rôles et adresses. Limites : Appui à l’identité commune et aux rôles ; la gouvernance locale Supply n’est pas la maîtrise globale du carnet d’adresses de l’entreprise. U774, CMP307.


### ELM805

MKT14 — Microsoft, [Plan freight transportation routes with multiple stops - Supply Chain Management | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/supply-chain/transportation/plan-freight-transportation-routes-multiple-stops). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Plan freight transportation routes with multiple stops - Supply Chain Management | Dynamics 365 | Microsoft Learn, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Les routes de transport comportent arrêts, segments, hubs, transporteurs et horaires. Limites : Une route planifiée n’est pas une preuve de booking confirmé ; plusieurs variantes FLOW peuvent coopérer dans un même trajet. U774, CMP307.


### ELM806

MKT13 — SAP, [Explaining Customer Consignment (Wholesale)](https://learning.sap.com/courses/exploring-fashion-functions-and-business-processes-in-sap-s-4hana-for-fashion-and-vertical-business/explaining-customer-consignment-wholesale-_fb6f5f03-ab73-4df3-a15a-d5a253d0d2f6). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Explaining Customer Consignment (Wholesale), parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : La consignation client distingue mise à disposition, consommation facturable, retour et reprise. Limites : Le vocabulaire SAP ne doit pas être attribué à Microsoft ; ces opérations ne justifient pas une capacité générique de gestion du stock consigné. U774, CMP307.


### ELM807

MKT13 — SAP, [Performing the Process of Vendor Consignment](https://learning.sap.com/courses/inventory-management-and-physical-inventory-in-sap-s-4hana/performing-the-process-of-vendor-consignment). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Performing the Process of Vendor Consignment, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : La consommation ou le transfert du stock fournisseur consigné produit le changement de propriété pertinent. Limites : Appui à un événement de propriété ; le ledger FLOW rassemble plusieurs régimes contractuels, pas seulement la consignation fournisseur. U774, CMP307.


### ELM808

MKT13 — SAP, [Describing Omnichannel Convergent Billing (1MC)](https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-public-edition-sales-automation-and-analytics/describing-omnichannel-convergent-billing-1mc-_e8281711-58ac-4058-93e3-f9fb65eb4537). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Describing Omnichannel Convergent Billing (1MC), parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Des demandes de facturation externes sont intégrées puis regroupées ou traitées pour produire les factures. Limites : Le pilotage FLOW reste distinct du moteur de facturation, de la comptabilisation et du recouvrement. U774, CMP307.


### ELM809

MKT14 — Microsoft, [Overview of the Service to deliver business process areas - Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/service-to-cash-areas-overview). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Overview of the Service to deliver business process areas - Dynamics 365 | Microsoft Learn, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Le processus de service formalise les travaux demandés, les ressources et la progression de leur réalisation. Limites : Appui transversal au service demandé ; ne démontre pas chaque prestation textile comme fonction native Dynamics. U774, CMP307.


### ELM810

MKT14 — Microsoft, [Set up an appointment for a load - Supply Chain Management | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/supply-chain/transportation/tasks/set-up-appointment-load). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Set up an appointment for a load - Supply Chain Management | Dynamics 365 | Microsoft Learn, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Un rendez-vous fixe les créneaux d’enlèvement ou de livraison et les contraintes du quai. Limites : Ce rendez-vous logistique ne prouve pas à lui seul une capacité de réservation de transport auprès d’un transporteur. U774, CMP307.


### ELM811

MKT14 — Microsoft, [Manage payment authorizations - Commerce | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/manage-payment-authorizations). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Manage payment authorizations - Commerce | Dynamics 365 | Microsoft Learn, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : La documentation distingue autorisation et capture du paiement, avec un statut retourné par le prestataire. Limites : Limite explicite : un accusé de capture n’est pas toujours le résultat final asynchrone. Ce document ne prouve pas une notification complète de fin ; FLOW doit suivre ce résultat distant. U774, CMP307.


### ELM812

MKT13 — SAP, [Explaining Digital Payments](https://learning.sap.com/courses/configuring-additional-settings-in-financial-accounting-in-sap-s-4hana/explaining-digital-payments). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Explaining Digital Payments, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : S/4HANA sollicite un prestataire de paiement via Digital Payments et reçoit les résultats pour actualiser le statut. Limites : Le prestataire réalise le paiement ; FLOW orchestre sa demande et son résultat sans absorber les responsabilités financières. U774, CMP307.


### ELM813

MKT13 — SAP, [Describing the Integration into SAP Global Trade Services](https://learning.sap.com/courses/introducing-the-sap-s-4hana-for-international-trade/describing-the-integration-into-sap-global-trade-services_a4529c6b-0cb6-4361-944a-a5c0b540745b). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Describing the Integration into SAP Global Trade Services, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : S/4HANA transmet des données et documents à GTS pour la prise en charge des opérations de commerce international. Limites : Appui à la délégation depuis S/4HANA ; GTS demeure un exécutant distinct. Aucun Customs Clearance Order FLOW natif ni maîtrise douanière interne n’est déduit. U774, CMP307.


### ELM814

MKT13 — SAP, [Working with Service Order Management: External Service Processin](https://learning.sap.com/courses/identifying-business-processes-in-sap-s4hana-service/working-with-service-order-management-external-service-processing_ca8699f0-3870-43c2-bb6e-4c68bddda055). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Working with Service Order Management: External Service Processin, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Un service externe est demandé, acheté, puis rapproché d’une entrée de service acceptée. Limites : FLOW distingue exigence de prestation, engagement d’achat et rapprochement opérationnel ; l’entrée de service SAP ne couvre pas tous les faits attendus d’une prestation logistique. U774, CMP307.


### ELM815

MKT13 — SAP, [Setting Up Cross-Docking](https://learning.sap.com/courses/advanced-customizing-in-sap-s-4hana-ewm/setting-up-cross-docking). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Setting Up Cross-Docking, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Le cross-docking relie besoins entrants et sortants pour un transit sans stockage intermédiaire normal. Limites : Le mécanisme d’exécution EWM étaye la prestation, pas l’existence native d’un ordre autonome portant toutes les exigences FLOW. U774, CMP307.


### ELM816

MKT13 — SAP, [Using the Planning Run in SAP S/4HANA](https://learning.sap.com/courses/exploring-business-processes-in-sap-s-4hana-production-planning/using-the-planning-run-in-sap-s-4hana_df4a8fa8-cfc9-44cf-adb0-a1e5d4129180). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Using the Planning Run in SAP S/4HANA, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Le run de planification choisit son périmètre et exécute le calcul des besoins. Limites : Appui à la conduite de planification ; le master plan FLOW rassemble aussi affectations et arbitrages absents de ce seul exemple MRP. U774, CMP307.


### ELM817

MKT13 — SAP, [Running Material Requirements Planning](https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-public-edition-sourcing-and-procurement/running-material-requirements-planning_c1d3cbe3-3fad-495a-a3ec-afede9d83ab4). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Running Material Requirements Planning, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Les exécutions MRP peuvent être programmées et leurs résultats suivis par les responsables de l’approvisionnement. Limites : La programmation d’un job éclaire le déclenchement ; elle ne suffit pas à justifier la maille métier de toutes les opérations de conduite du plan. U774, CMP307.


### ELM818

MKT14 — Microsoft, [Repair management - Supply Chain Management | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/supply-chain/service-management/repair-management). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Repair management - Supply Chain Management | Dynamics 365 | Microsoft Learn, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Les lignes de réparation décrivent symptômes, diagnostic et résultat de remise en état. Limites : Le parcours de réparation ne prouve pas toutes les retouches fashion ; aucune spécialisation vêtement native n’est affirmée. U774, CMP307.


### ELM819

MKT14 — Microsoft, [Develop and establish service agreements overview - Supply Chain Management | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/supply-chain/service-management/service-agreements). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Develop and establish service agreements overview - Supply Chain Management | Dynamics 365 | Microsoft Learn, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Les accords de service définissent travaux, période de validité et modalités de déclenchement. Limites : Les SLA et accords FLOW couvrent plusieurs prestations ; les paramètres d’un service agreement ne démontrent pas tous les engagements de performance. U774, CMP307.


### ELM820

MKT14 — Microsoft, [Service templates - Supply Chain Management | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/supply-chain/service-management/service-template). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Service templates - Supply Chain Management | Dynamics 365 | Microsoft Learn, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Les modèles de service conservent des lignes réutilisables pour établir accords et ordres de service. Limites : Appui partiel à une offre structurée ; un modèle de service n’est pas à lui seul un catalogue multi-prestataire. U774, CMP307.


### ELM821

MKT14 — Microsoft, [Work with customs clearance - Finance | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/finance/localizations/russia/rus-work-with-customs-clearance). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Work with customs clearance - Finance | Dynamics 365 | Microsoft Learn, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Le parcours douanier rattache déclaration et intervenants au traitement des importations. Limites : Localisation Russie : appui documentaire limité, pas preuve d’un processus générique ni d’une réalisation douanière française. U774, CMP307.


### ELM822

MKT13 — SAP, [Exploring SAP Fiori Apps for Inventory Reporting and Optimization](https://learning.sap.com/courses/exploring-foundations-of-physical-inventory-in-sap-s-4hana-cloud-private-edition/using-overview-apps-in-physical-inventory). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Exploring SAP Fiori Apps for Inventory Reporting and Optimization, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Les vues de stock et de traitement rapprochent inventaire, livraisons, commandes et faits de mouvement. Limites : La connaissance restituée est distincte de l’ingestion ; le périmètre entrepôt ne démontre pas la visibilité de toutes les opérations FLOW. U774, CMP307.


### ELM823

MKT14 — Microsoft, [Control warehouse work by using work templates and location directives - Supply Chain Management | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/control-warehouse-location-directives). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Control warehouse work by using work templates and location directives - Supply Chain Management | Dynamics 365 | Microsoft Learn, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Le travail d’entrepôt distingue instructions de prélèvement et de dépôt, avec quantités et lieux concernés. Limites : FLOW porte une demande et un résultat de prestation ; les lignes de travail exécutables ne définissent pas seules la capacité métier. U774, CMP307.


Actualisation U774 / CMP307 — 25 septembre 2026 : réemploi des documents déjà identifiés ELM018, ELM063, ELM070, ELM095, ELM208, ELM279, ELM281, ELM322, ELM455, ELM458, ELM516, ELM517, ELM600, ELM656, ELM720, ELM754. Passages réexaminés pour les correspondances et limites enregistrées dans les fiches ; aucune altération des preuves antérieures.


### ELM824

MKT14 — Microsoft, [Transportation management statuses - Supply Chain Management | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/supply-chain/transportation/transportation-management-status). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Transportation management statuses - Supply Chain Management | Dynamics 365 | Microsoft Learn, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Les statuts reçus des transporteurs sont interprétés pour suivre chargements, expéditions et conteneurs. Limites : La donnée vient de l’intégration ; sa lecture relève de Visibility. Un code reçu ne constitue pas à lui seul une preuve physique de livraison. U774, CMP307.


### ELM825

MKT13 — SAP, [Performing a Physical Inventory](https://learning.sap.com/courses/processes-in-sap-s-4hana-ewm-br/performing-a-physical-inventory). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Performing a Physical Inventory, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : EWM distingue le comptage tournant par intervalles et le comptage ad hoc sur produits ou emplacements. Limites : Les procédures d’exécution étayent ces variantes métier sans imposer les écrans ou rôles SAP au modèle. U774, CMP307.


### ELM826

MKT13 — SAP, [Performing In-Store Inventory Management (3HR)](https://learning.sap.com/courses/exploring-sap-s-4hana-cloud-public-edition-retail/performing-in-store-inventory-management-3hr-). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Performing In-Store Inventory Management (3HR), parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : Les opérations magasin rapprochent quantités enregistrées, comptages et écarts. Limites : Appui à la visibilité du stock et des opérations de magasin ; ne démontre pas une vision exhaustive de tous les processus retail. U774, CMP307.


### ELM827

MKT13 — SAP, [Integrating into Warehouse Processes](https://learning.sap.com/courses/business-processes-in-sap-s-4hana-transportation-management/integrating-into-warehouse-processes_a60ea8b3-d0d8-4c89-be2f-7a4a912240c4). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Integrating into Warehouse Processes, parties correspondant au mécanisme ci-dessous. Édition : périmètre du cours ou de l’application cité ; documentation évolutive, pas de version globale présumée. Nature : mécanisme ou objet de produit, pas capacité normative. Reformulation : L’intégration TM-EWM transmet les exigences aux opérations de picking, packing et chargement et remonte progression et écarts. Limites : Le processus produit associe orchestration et exécution ; FLOW garde les ordres de prestation et leur coordination distincts des gestes physiques. Les limites multi-arrêts du scénario natif sont conservées. U774, CMP307.


Actualisation U774 / CMP307 — 25 septembre 2026 : réemploi des documents déjà identifiés ELM018, ELM063, ELM070, ELM095, ELM208, ELM279, ELM281, ELM322, ELM455, ELM458, ELM516, ELM517, ELM600, ELM656, ELM720, ELM754. Passages réexaminés pour les correspondances et limites enregistrées dans les fiches ; aucune altération des preuves antérieures.


### ELM828

MKT14 — Microsoft Dynamics 365, [Inventory blocking - Supply Chain Management | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-blocking). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Inventory blocking ; blocking manually, quality orders and inventory status. Documentation évolutive ; édition du cours/application cité, version globale non présumée. Nature : mécanisme produit. Reformulation : Bloquer un stock interdit son traitement ou sa consommation ; quantité inspectée et quantité bloquée peuvent différer. Limites : Le produit combine règles, décisions et écritures ; ne pas assimiler le blocage qualité à une réservation pour une demande. U775, CMP308.


### ELM829

MKT13 — SAP S/4HANA, [Performing Internal Inspections in the Warehouse](https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-public-edition-warehouse-management/performing-internal-inspections-in-the-warehouse_a8dd0fcf-85c3-47d5-9da2-0058a81ebed5). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Warehouse Internal Inspections ; usage decision and follow-up actions. Documentation évolutive ; édition du cours/application cité, version globale non présumée. Nature : mécanisme produit. Reformulation : Un contrôle de biens déjà stockés aboutit à un usage autorisé, un maintien bloqué ou une sortie au rebut. Limites : Le parcours comprend réalisation et écritures ; FLOW peut recevoir les résultats et décisions de responsables externes. U775, CMP308.


### ELM830

MKT14 — Microsoft Dynamics 365, [Item and raw material tracing in inventory, production, and sales - Supply Chain Management | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/trace-items-raw-materials-inventory-production-sales). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : What is item tracing? ; limitations ; trace direction. Documentation évolutive ; édition du cours/application cité, version globale non présumée. Nature : mécanisme produit. Reformulation : La recherche reconstitue provenance, transformations, destinataires et commandes concernées à partir des transactions et identifiants de suivi. Limites : La traçabilité dépend des données captées ; restrictions natives par entité juridique et profondeur. Aucun historique externe inventé. U775, CMP308.


### ELM831

MKT13 — SAP S/4HANA, [Batch Management & Traceability in SAP S/4HANA Cloud](https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-public-edition-manufacturing-execution/batch-management-traceability-in-sap-s-4hana-cloud_d396525c-87eb-4af9-a718-041af5cba51c). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : End-to-End Visibility: The Batch Information Cockpit. Documentation évolutive ; édition du cours/application cité, version globale non présumée. Nature : mécanisme produit. Reformulation : Le suivi de lots permet de remonter aux composants et fournisseurs ou de retrouver produits, livraisons et destinataires affectés. Limites : Exemple de production par lots ; ne prouve pas des données de généalogie disponibles dans la fashion ni une réalisation Beaumanoir. U775, CMP308.


### ELM832

MKT14 — Microsoft Dynamics 365, [Load building workbench - Supply Chain Management | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/supply-chain/transportation/tasks/load-building-workbench). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Create a load building strategy ; use a load building strategy. Documentation évolutive ; édition du cours/application cité, version globale non présumée. Nature : mécanisme produit. Reformulation : La constitution de chargements rapproche les marchandises et les contraintes de poids et de volume des moyens de transport. Limites : La stratégie standard documentée est fondée sur le volume ; pas de preuve d’un optimiseur universel ni d’une maille métier imposée. U775, CMP308.


### ELM833

MKT13 — SAP S/4HANA, [Carrying out Warehouse Ad Hoc Goods Issue](https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-public-edition-warehouse-management/carrying-out-warehouse-ad-hoc-goods-issue_e15b00c8-2b28-4341-9cdc-7da58ded5b89). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Warehouse Ad Hoc Goods Issue ; scrapping. Documentation évolutive ; édition du cours/application cité, version globale non présumée. Nature : mécanisme produit. Reformulation : La mise au rebut mobilise une demande de changement, un travail de déplacement vers la zone prévue, puis une sortie reconnue. Limites : Une écriture de sortie ne prouve pas une destruction ; le document ne définit pas un ordre de service externe universel. U775, CMP308.


### ELM834

MKT13 — SAP S/4HANA, [Planning Loads](https://learning.sap.com/courses/business-processes-in-sap-s-4hana-transportation-management/planning-loads_e752a3f5-f4a9-4957-9f4d-e6e550c15409). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Load Planning as Part of the Planning Process ; Load Consolidation. Documentation évolutive ; édition du cours/application cité, version globale non présumée. Nature : mécanisme produit. Reformulation : La consolidation répartit les marchandises entre ressources de transport, avec contraintes de capacité et de compatibilité. Limites : Le produit descend aussi au placement physique 3D ; cette partie reste hors proposition FLOW. Le plan d’acheminement n’est pas le master plan Supply. U775, CMP308.


### ELM835

MKT14 — Microsoft Dynamics 365, [Quarantine orders - Supply Chain Management | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/quarantine-orders). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Quarantine order scrap ; quarantine order statuses. Documentation évolutive ; édition du cours/application cité, version globale non présumée. Nature : mécanisme produit. Reformulation : Le parcours de quarantaine permet une sortie au rebut distincte de la remise en stock. Limites : Avec les processus WMS, la page limite ce parcours de quarantine order aux retours de vente ; ne pas généraliser sa disponibilité native. U775, CMP308.


### ELM836

MKT14 — Microsoft Dynamics 365, [Manual order orchestration in Intelligent Order Management | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/manual-order-orchestration). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Simple substitution ; determine when an account is on credit hold. Documentation évolutive ; édition du cours/application cité, version globale non présumée. Nature : mécanisme produit. Reformulation : Les relations entre produits permettent une substitution, et des contraintes de compte sont visibles dans la prise de commande. Limites : Page signalée preview ; substitution simple à la création, première correspondance retenue, sans réexécution lors des modifications. FLOW ne reprend pas cet algorithme. U775, CMP308.


### ELM837

MKT13 — SAP S/4HANA, [Setting up Sample Determination](https://learning.sap.com/courses/implementing-sap-s-4hana-quality-management/setting-up-sample-determination_c29dda80-ff64-443e-bead-dc36904a7463). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Sampling Procedure ; sample types ; valuation modes. Documentation évolutive ; édition du cours/application cité, version globale non présumée. Nature : mécanisme produit. Reformulation : La procédure distingue contrôle exhaustif et échantillonnage, avec règles d’évaluation des résultats. Limites : SAP présente aussi ces choix comme paramètres ; des comportements FLOW ne se justifient que par des obligations et preuves de service différentes. U775, CMP308.


### ELM838

MKT14 — Microsoft Dynamics 365, [Acceptance sampling - Supply Chain Management | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/quality-acceptance-sampling). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Single sampling strategy ; quality orders ; prerequisites. Documentation évolutive ; édition du cours/application cité, version globale non présumée. Nature : mécanisme produit. Reformulation : L’échantillonnage d’acceptation utilise une preuve sur échantillon pour apprécier un lot selon des seuils. Limites : Dynamics 365 SCM 10.0.45 ou ultérieur ; la page ne documente que le plan simple. Ne pas confondre ce contrôle qualité avec un inventaire statistique. U775, CMP308.


### ELM839

MKT14 — Microsoft Dynamics 365, [Quality management item sampling - Supply Chain Management | Dynamics 365 | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/quality-item-sampling). Consulté le 25 septembre 2026 ; passages primaires lus. Localisateur : Set up item sampling ; sampling quantity ; full blocking. Documentation évolutive ; édition du cours/application cité, version globale non présumée. Nature : mécanisme produit. Reformulation : L’étendue du contrôle peut être une quantité, un pourcentage ou une unité logistique complète ; elle diffère du périmètre éventuellement bloqué. Limites : Un pourcentage ou une technique de prélèvement ne justifie pas à lui seul un comportement métier. U775, CMP308.


Actualisation U775 / CMP308 : réemploi ciblé des sources existantes ELM207, ELM540, ELM805, ELM825. Périmètres et limites de consultation dans market-coverage-audit-U775.yaml ; aucune modification des preuves historiques.


### ELM840

MKT13 — SAP S/4HANA 2025. [SAP S/4HANA 2025 — Feature Scope Description](https://help.sap.com/doc/e2048712f0ab45e791e6d15ba5e20c68). SAP S/4HANA 2025 ; document 1.0 du 2025-10-08. Consulté le 2026-09-26. Nature : documentation primaire produit ou processus. Passage : Sommaire §2 : Finance, R&D / Engineering, Sales, Sourcing and Procurement, Supply Chain ; §2.11 et §2.11.3. Reformulation : SAP distingue ventes, achats, chaîne logistique, conception et finance ; les achats couvrent biens et services. Limites : Catalogue de périmètres produit ; aucun Business System commun aux trois ensembles FLOW ni équivalence exacte avec leurs frontières. Réutilisation : Synthèse originale et lien ; pas de redistribution du document source. U780, CMP309.


### ELM841

MKT14 — Microsoft Dynamics 365. [What are the end-to-end scenarios and business processes in Dynamics 365?](https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/overview). Page évolutive ; catalogue juillet 2026 mentionné. Consulté le 2026-09-26. Nature : documentation primaire produit ou processus. Passage : End-to-end scenarios. Reformulation : Le catalogue distingue les parcours de conception, achats, vente, logistique et restitution financière. Limites : Scénarios de bout en bout ; ne prescrit pas une hiérarchie de domaines ou de systèmes métier. Réutilisation : Synthèse originale et lien ; pas de redistribution du document source. U780, CMP309.


### ELM842

MKT14 — Microsoft Dynamics 365 Supply Chain Management et Commerce. [Design to retire end-to-end overview](https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/design-to-retire-overview). Page évolutive ; version globale non précisée. Consulté le 2026-09-26. Nature : documentation primaire produit ou processus. Passage : Design to retire process relationship ; business process areas. Reformulation : Conception produit, introduction et cycle de vie ; les relations amont et aval varient selon les stratégies. Limites : Parcours produit tangible ; ne couvre pas toutes les études ou transformations de l’entreprise. Réutilisation : Synthèse originale et lien ; pas de redistribution du document source. U780, CMP309.


### ELM843

MKT14 — Microsoft Dynamics 365 Sales, Commerce, Supply Chain Management et Finance. [Order to cash business process flow overview and relationships to other business processes](https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/order-to-cash-overview). Page évolutive ; catalogue juillet 2026 mentionné. Consulté le 2026-09-26. Nature : documentation primaire produit ou processus. Passage : Order to cash business process flow. Reformulation : Le parcours de vente traverse prise de commande, réalisation et traitement financier. Limites : Processus plus large que Sales ; ne décide pas du rattachement des capacités FLOW. Réutilisation : Synthèse originale et lien ; pas de redistribution du document source. U780, CMP309.


### ELM844

MKT14 — Microsoft Dynamics 365 Supply Chain Management et Finance. [Help organizations manage and optimize the source to pay business processes](https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/source-to-pay-introduction). Page évolutive ; mise à jour affichée 2024-05-28. Consulté le 2026-09-26. Nature : documentation primaire produit ou processus. Passage : Source to pay overview ; steps 1–8. Reformulation : Sélection fournisseur, contrats et achats de biens ou prestations ; le parcours inclut factures et paiement, et renvoie la réception à Inventory to deliver. Limites : Processus transverse plus large que le domaine achats FLOW ; paiement et exécution physique ne sont pas absorbés. Réutilisation : Synthèse originale et lien ; pas de redistribution du document source. U780, CMP309.


### ELM845

MKT14 — Microsoft Dynamics 365. [Introduction to inventory to deliver business process](https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/inventory-to-deliver-introduction). Page évolutive ; version globale non précisée. Consulté le 2026-09-26. Nature : documentation primaire produit ou processus. Passage : Inventory to deliver overview. Reformulation : Gestion des stocks et réalisation des mouvements et livraisons. Limites : Recouvrement partiel ; la référence ne suffit pas à établir toutes les formalités douanières ni leur réalisation Beaumanoir. Réutilisation : Synthèse originale et lien ; pas de redistribution du document source. U780, CMP309.


### ELM846

MKT14 — Microsoft Dynamics 365 Finance. [Record to report end-to-end overview](https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/record-to-report-overview). Page évolutive ; version globale non précisée. Consulté le 2026-09-26. Nature : documentation primaire produit ou processus. Passage : Record to report process relationship ; Forecast to plan. Reformulation : La restitution financière coopère avec planification et budgets. Limites : Appui partiel pour Finance et contrôle ; ne définit pas tout Enterprise Management & Control, notamment sa gouvernance de conformité. Réutilisation : Synthèse originale et lien ; pas de redistribution du document source. U780, CMP309.
### ELM847

MKT14 — Dynamics 365 Finance. [Inventory posting](https://learn.microsoft.com/en-us/dynamics365/finance/general-ledger/inventory-posting), tableau, Transfer (journal). Page évolutive, édition unique inconnue ; consultée le 28 septembre 2026. Nature : documentation produit. Reformulation : certains transferts internes ne produisent pas de pièce comptable selon les dimensions suivies financièrement. Limite : aucune capacité autonome d’export démontrée. U813, CMP310.

### ELM848

MKT14 — Dynamics 365 Finance. [Accounting distributions](https://learn.microsoft.com/en-us/dynamics365/finance/accounts-payable/accounting-distributions), introduction et Distribute amounts. Page évolutive, mise à jour 2026-04-03 ; consultée le 28 septembre 2026. Nature : documentation produit. Reformulation : répartition des montants des documents sources sur les comptes et corrections par annulation puis nouvelles distributions. Limite : traitement déjà comptable, pas seule sélection des faits. U813, CMP310.

### ELM849

MKT14 — Dynamics 365 Finance. [Subledger transfer to the general ledger](https://learn.microsoft.com/en-us/dynamics365/finance/general-ledger/subledger-transfer), options de transfert. Page évolutive, mise à jour 2026-06-16 ; consultée le 28 septembre 2026. Nature : documentation produit. Reformulation : transfert asynchrone ou planifié d’écritures vers le grand livre. Limite : écritures déjà constituées, pas alimentation initiale en faits. U813, CMP310.

### ELM850

MKT13 — SAP S/4HANA Cloud Public Edition. [Introducing Goods Movements](https://learning.sap.com/courses/managing-inventory-movements-and-stock-transfers-in-sap-s-4hana-cloud-public-edition/introducing-goods-movements_ba906e87-54e8-4f56-837e-bde4d82599de), Document Flow in Goods Movements. Leçon évolutive, édition numérotée inconnue ; consultée le 28 septembre 2026. Nature : formation primaire produit. Reformulation : document de mouvement, complété d’un document comptable en cas d’impact financier. Limite : réalisation intégrée, pas service indépendant de publication. U813, CMP310.

### ELM851

MKT13 — SAP S/4HANA Materials Management. [Describing Automatic Account Determination](https://learning.sap.com/courses/cross-functional-customizing-in-sap-s-4hana-materials-management/describing-automatic-account-determination), Automatic Account Determination. Leçon évolutive, édition numérotée inconnue ; consultée le 28 septembre 2026. Nature : formation primaire produit. Reformulation : détermination des comptes pour les transactions pertinentes comptablement. Limite : fonction d’interprétation, pas définition de capacité FLOW. U813, CMP310.

### ELM852

MKT95 — Axway Financial Accounting Hub. [Présentation du produit](https://www.axway.com/en/products/afah), AFAH core functions et Data reliability. Page évolutive, version produit inconnue ; consultée le 28 septembre 2026. Nature : présentation commerciale primaire. Reformulation : connexion producteurs/consommateurs, transformation par règles comptables, piste d’audit et reprise. Limite : déclarations éditeur, pas détail des règles de sélection ni preuve installée. U813, CMP310.

Pour ELM847–ELM852 : titres et sections ci-dessus sont les localisateurs ; aucun identifiant natif de capacité établi. Reformulations distinctes des libellés natifs, sans citation de définition universelle. Synthèses et liens uniquement, pas de reproduction intégrale. Analyse et limites d’accès : [étude U813](faits-gestion-comptabilite-U813.md).

### ELM853

MKT14 — [Dynamics 365 Demand planning home page](https://learn.microsoft.com/en-us/dynamics365/supply-chain/demand-planning/demand-planning-home-page). Documentation primaire consultée le 28 septembre 2026. Localisateur et édition : The demand planning process ; page évolutive, mise à jour 2026-07-01. Reformulation et limite : Import de données historiques et références puis calcul et export de prévisions. Appui côté consommateur, pas sous-domaine sortant. Aucun identifiant natif de capacité établi. Synthèse et lien, sans reproduction intégrale. U822, CMP311 ; détails d’accès dans [l’étude](diffusion-donnees-operationnelles-U822.md).

### ELM854

MKT13 — [SAP S/4HANA Supply Chain Integration Add-On for SAP IBP — Administrator’s Guide](https://help.sap.com/doc/227fcaf7918e45378f8cb20a45ffe6a2/1.0%20SP19/en-US/loioc5148f2152294904ac379b94cb902e59.pdf). Documentation primaire consultée le 28 septembre 2026. Localisateur et édition : 1.0 SP19 ; Configuration for Order-Based Planning Integration, p.33–35. Reformulation et limite : Commandes et stocks intégrés avec chargements initiaux et modifications. Édition précise, pas architecture de capacités FLOW. Aucun identifiant natif de capacité établi. Synthèse et lien, sans reproduction intégrale. U822, CMP311 ; détails d’accès dans [l’étude](diffusion-donnees-operationnelles-U822.md).

### ELM855

MKT14 — [Manage changes to engineering products](https://learn.microsoft.com/en-us/dynamics365/supply-chain/engineering-change-management/engineering-change-management). Documentation primaire consultée le 28 septembre 2026. Localisateur et édition : Engineering change requests ; page évolutive, édition globale inconnue. Reformulation et limite : Signalements et demandes de changement depuis les services opérationnels. Ne prouve pas un export vers un PLM externe. Aucun identifiant natif de capacité établi. Synthèse et lien, sans reproduction intégrale. U822, CMP311 ; détails d’accès dans [l’étude](diffusion-donnees-operationnelles-U822.md).

### ELM856

MKT13 — [Administration Guide for PLM System Integration for SAP S/4HANA](https://help.sap.com/doc/6f4e849a041c4bc59c4b9d6882053532/2.0%20FP03/en-US/Administration_Guide_TC.pdf). Documentation primaire consultée le 28 septembre 2026. Localisateur et édition : 2.0 FP03 ; document 1.0 du 2022-12-05 ; §7.3 p.60, §9.3.1.3 p.82. Reformulation et limite : Problème issu de fabrication/logistique transmis au PLM pour examen et changement éventuel. Exemple industriel, aucune implantation Beaumanoir présumée. Aucun identifiant natif de capacité établi. Synthèse et lien, sans reproduction intégrale. U822, CMP311 ; détails d’accès dans [l’étude](diffusion-donnees-operationnelles-U822.md).

### ELM857

MKT14 — [Dynamics 365 Business events overview](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/business-events/home-page). Documentation primaire consultée le 28 septembre 2026. Localisateur et édition : Introduction et Important ; documentation évolutive, édition globale inconnue. Reformulation et limite : Notifications vers systèmes externes distinctes des exports volumineux. Appui technique ; pas définition d’un sous-domaine métier. Aucun identifiant natif de capacité établi. Synthèse et lien, sans reproduction intégrale. U822, CMP311 ; détails d’accès dans [l’étude](diffusion-donnees-operationnelles-U822.md).

### ELM858

MKT14 — Dynamics 365 Finance. [Introduction to the record to report end-to-end business process](https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/record-to-report-introduction). Documentation primaire consultée le 2026-09-28. Passage : Record to report overview ; mise à jour 2026-07-31. Page évolutive, édition globale inconnue. Reformulation : Collecte des données financières, enregistrement, rapprochement et restitution des comptes. Limite : contexte financier, sans preuve de réalisation Beaumanoir ni équivalence de découpage FLOW. Synthèse et lien uniquement. U826, CMP310, CMP311.


### ELM859

MKT13 — SAP S/4HANA. [Identifying the Basics of Financial and Management Accounting](https://learning.sap.com/courses/exploring-end-to-end-business-processes-in-sap-business-suite/identifying-the-areas-of-financial-and-management-accounting_e3512e3e-753c-4fc0-8e21-4391145368ef). Documentation primaire consultée le 2026-09-28. Passage : Financial Accounting et Management Accounting. Page évolutive, édition globale inconnue. Reformulation : La comptabilité financière enregistre les transactions et alimente les comptes ; elle est distinguée du contrôle de gestion. Limite : contexte financier, sans preuve de réalisation Beaumanoir ni équivalence de découpage FLOW. Synthèse et lien uniquement. U826, CMP310, CMP311.
