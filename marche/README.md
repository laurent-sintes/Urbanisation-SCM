# Référentiel de marché

Version de travail 0.5 — 10 septembre 2026. Origine : [U14](../connaissance/01-contributions-utilisateur.md#u14) ; compléments U18–U20 sur les deux couches métier.

Objectif : comparer durablement l'urbanisation Beaumanoir aux référentiels du marché, en expliquant les rapprochements, adaptations et écarts. Le marché sert à éprouver nos choix ; aucune structure principale n'est encore adoptée.

## Lire et utiliser le référentiel

- [Indicateurs et décisions pour piloter les flux SCM de bout en bout](etudes/2026-10-21-indicateurs-pilotage-scm.md) : six questions de direction, diagnostics achats, ventes, SAV, retours et déstockage ; données, calculs, décisions et cas d’entreprises avec gains publiés.

- [Étude d’exploration d’Atlas](etudes/2026-09-14-exploration-atlas/etude.md) : U143, recherche du 14 septembre 2026 sur les outils de cartographie, les parcours et la maintenance du code par IA. Comparaison d’outils d’interface, distincte des modèles de capacités ci-dessous.

- [Étude comparative des modèles](etudes/2026-09-09-modeles-marche/etude-comparative.md) : résultat U25, dix références comparées, équivalences de notion, recouvrements, niveaux et matrices commerce ; quatre annexes de preuves.

- [Catalogue des références](catalogue.md) : dix-sept fiches, leurs rôles, versions, accès et limites ; ITIL reste périphérique.
- [Éléments de référence](elements.md) : petit corpus effectivement examiné, avec provenance et localisateurs.
- [Comparaisons Beaumanoir–marché](comparaisons.md) : premiers rapprochements et périmètres encore à instruire.
- [Méthode de comparaison](methode.md) : qualification des sources, correspondances, critères de choix et maintenance.

## Répartition des rôles proposée

| Référence | Rôle dans le travail | État documentaire examiné |
| --- | --- | --- |
| [TOGAF](catalogue.md#mkt01) | Méthode et cadre des capacités | Guide historique G189 lu sur miroir tiers ; version 2 identifiée, non lue |
| [ArchiMate](catalogue.md#mkt02) | Langage et relations du métamodèle | Spécification historique 3.1 lue sur miroir tiers ; 3.2 non consultée |
| [BIZBOK](catalogue.md#mkt03) | Définition et décomposition des capacités | Extraits 15.0 ©2026, métamodèle 2024 et atelier 2019 consultés ; guide complet et modèles membres non lus |
| [SAP RBA](catalogue.md#mkt04) | Candidat pour la structure des capacités | Hiérarchie incluant Enterprise Domain et extrait stock/promesse consultés ; catalogue complet et définitions détaillées non acquis |
| [Oracle RRM](catalogue.md#mkt05) | Contrôle des parcours et interfaces | Guide détaillé 14.1.1 historique consulté ; bibliothèque actuelle non acquise |
| [IBM CBM](catalogue.md#mkt06) | Preuve historique ; non prioritaire après U60 | Exemple retail 2005 conservé ; ne constitue pas une référence actuelle de découpage |
| [APQC PCF Retail](catalogue.md#mkt07) | Contrôle de couverture des processus | Convention générale examinée ; contenu Retail 7.2.1 derrière formulaire |
| [ARTS / OMG](catalogue.md#mkt08) | Contrôle sémantique des objets métier | Introduction/sommaire et narrations 02010/07620 consultés |
| [OASIS SOA-RM](catalogue.md#mkt09) | Services, accès aux capacités et contrats | §§3.1, 3.3.1 et 3.3.2 de la version 1.0 consultés |
| [BPMN / CMMN / DMN](catalogue.md#mkt10) | Processus, dossiers et décisions | Extraits BPMN 2.0.2/CMMN 1.1 et présentation DMN 1.5 consultés |
| [OpenAPI](catalogue.md#mkt11) | Description d'interfaces HTTP | Introduction 3.2.0 consultée |
| [AsyncAPI](catalogue.md#mkt12) | Description d'interfaces à messages | Introduction 3.0.0 consultée |
| [SAP S/4HANA stock et aATP](catalogue.md#mkt13) | Appui fonctionnel de produit | Passages sur stock, inventaire, disponibilité, protection et allocation consultés |
| [Microsoft Dynamics](catalogue.md#mkt14) | Contrôle des processus et de leur réalisation | Structure et pages commerce consultées ; éditions hétérogènes |
| [Evans / DDD](catalogue.md#mkt17) | Sens du domaine, modèle et frontière de modèle | Définitions de la référence 2015 consultées ; aucun catalogue de capacités |
| [SAP ERP Fashion historique](catalogue.md#mkt16) | Qualifier l’évolution d’ARun | Notice ERP EHP8 SPS01 examinée, sans généralisation à tout ECC |
| [Microsoft retail historique](catalogue.md#mkt15) | Autre regroupement de capacités retail | Libellés de la carte 2012 lus ; définitions et emboîtement non établis |

Les faits documentaires et leurs sources sont dans les fiches. Les rôles ci-dessus sont des propositions d'usage. [ITIL](catalogue.md#itil) est conservé comme référence périphérique de gouvernance.

## État de la comparaison

Deux observations initiales portent sur la structure de la carte. Six pistes lexicales IBM concernent 11 capacités. Le complément [SAP-stock](sap-stock.md), CMP013–CMP017, apporte une lecture de structure et des appuis sémantiques à huit capacités, dont quatre déjà citées par IBM. Avec le complément achats U48/CMP030 sur CAP029, 16 des 36 capacités disposent d’un rapprochement proposé ; 20 restent sans comparaison précise. Aucune équivalence validée. Cette mesure décrit l’avancement documentaire, pas la conformité au marché.

Quatre [comparaisons méthodologiques supplémentaires](comparaisons.md#orientation-de-deux-couches-métier), CMP009–CMP012, examinent l'[orientation U18–U20](../connaissance/15-orientation-deux-couches.md) : chaque couche possède son modèle métier, ses objets, sa persistance et son urbanisation, avec des contrats entre elles. CMP009 précise les capacités métier génériques du socle. Les appuis externes éclairent la terminologie et les interfaces ; aucun découpage standard ni format n'est adopté. L’étude U25 ajoute CMP018/CMP019 et ELM019–ELM030 : le référentiel compte désormais 98 éléments examinés et 57 comparaisons, après les compléments jusqu’à U99 ; 21 références MKT sont recensées. Les matrices de l’étude comparent les modèles de marché entre eux. Le complément U48 ajoute un rapprochement partiel pour CAP029 ; le bilan courant est de 16 CAP rapprochées et 20 sans comparaison précise. Ce bilan historique de comparaison ne vaut pas validation de périmètre ; U97 corrige ensuite la portée plateforme de CAP001–CAP003.

Le [complément U59 sur les modèles orientés domaines](premier-niveau-regroupement-capacites.md#granularité-sap-et-autres-modèles-orientés-domaines) recommande la maille SAP comme première grille d’épreuve, sans adoption d’un catalogue principal. BIAN (MKT18) et TM Forum (MKT19) apportent des vues sectorielles complémentaires, avec distinctions entre capacités, fonctions et partitions de services.

L’[approfondissement BIZBOK U60](bizbok-capacites-et-domaines.md) précise aptitude, objet central, réalisation et niveaux. L’accès aux extraits publics a réussi ; la livraison d’un modèle Retail/Wholesale n’est pas établie. IBM reste historique et BIAN périphérique à la définition des capacités ; TM Forum conserve son intérêt. Le compte des rapprochements inclut les preuves historiques IBM, sans les déclarer actuelles.

U61/U62 relient [capacités, objets, faits et documents](../connaissance/24-capacites-objets-et-faits.md), ELM056–ELM061/CMP035 : information métier SAP, métamodèle Guild et SID comparés, avec exemples de documents et notifications qualifiés séparément. Les objets existent dans les deux couches locales ; le rapprochement ne définit ni leurs agrégats ni un modèle de demande unique.

## Priorités proposées

1. Obtenir un extrait SAP RBA versionné sur les stocks, achats, commandes et SAV, avec définitions et identifiants natifs.
2. Approfondir Oracle RRM au-delà du guide historique 2015 et obtenir le fichier APQC Retail pour tester leurs contenus actuels, notamment B2B et retours.
3. Étendre l’examen ARTS au-delà des vues 02010/07620, puis éprouver les frontières GBM / C-Log et les particularités Boardriders / Sarenza.
4. Comparer les options de hiérarchie sur les mêmes cas métier avant de choisir une référence principale.

Les huit références initiales forment le noyau de comparaison du commerce. Quatre ajouts sont des appuis d’architecture et d’interfaces, sans catalogue commerce. SAP S/4HANA stock et aATP apporte un éclairage produit. Les deux références Microsoft ajoutées par U25 distinguent catalogue de processus Dynamics et carte historique de capacités retail ; cette dernière ne remplace pas le PCF APQC.

Mise à jour du 2026-09-09 après audit du fil : CAP036 restaure le candidat de préparation/expédition magasin ; aucun élément marché précis ne lui est encore associé.

## Application au bloc stock

U26/U27 prolongent l’étude par une [exploration du stock et du stock logique](../connaissance/17-exploration-bloc-stock.md). CMP020 confronte les trois familles proposées à SAP, ARTS et Microsoft. Aucun nouveau candidat ni équivalent validé ; le nombre de CAP déjà rapprochées reste inchangé.

U28/U29 ajoutent une [comparaison du vocabulaire SAP/Microsoft](allocation-reservation-sap-microsoft.md), ELM031–ELM033 et CMP021. La clarté des termes et la variété des mécanismes sont distinguées ; Q067 conserve ouverte la transition SAP précise rapportée par Laurent.

U30/U31 enrichissent les [politiques GBM/BRD et le rattachement Order Promising](../connaissance/18-politiques-engagement-gbm-brd.md) : ELM034–ELM036, CMP022/CMP023. Quatre candidats reçoivent des précisions de besoin et de provenance, sans changer leurs résultats ni statuts. Les comptes de couverture 15/21 restent inchangés.

U32 précise le [degré de détail sous les fonctions](detail-fonctions-stock-promesse.md) : ELM037–ELM039 et CMP024. Les objets, opérations et variantes de produit enrichissent les descriptions sans devenir automatiquement des sous-capacités.

U33–U35 ajoutent le [glossaire métier et les verbes](../connaissance/19-glossaire-metier.md). La décomposition reste fondée sur ce que sait faire l’entreprise indépendamment de son organisation et de ses outils, avec C33/P70/CMP024 précisés. ELM040/CMP025 distinguent les mots anglais SAP vérifiés de la proposition française tenir ; aucune nomenclature détaillée ni capacité renommée.

U43 examine le [premier niveau de regroupement](premier-niveau-regroupement-capacites.md) au-delà de SAP : six références réexaminées, CMP026. U44 restitue l’hypothèse Univers → Domaine → Capacité du draft de juin non consulté ; une option Domaine → Capacité reste à comparer. Catégorie et capacité composite sont distinguées ; Nature et Finalité restent transverses. Aucun rattachement CAP ni niveau validé.

U45 donne un sens au domaine par l’espace de problèmes métier. MKT17/ELM041 et CMP027 apportent la [lecture d’Evans et sa distinction de notre adaptation locale](premier-niveau-regroupement-capacites.md#donner-un-sens-au-domaine-avec-ddd). TER030 et C37 précisent l’analyse des problèmes avant le classement des capacités ; aucun niveau ou domaine concret adopté.

U47 articule le marché et le terrain dans une [première liste de domaines à éprouver](../connaissance/20-domaines-candidats.md). CMP028 consigne l’appui méthodologique TOGAF et le contrôle de couverture Microsoft ; ELM019/ELM027 réexaminés le 10 septembre 2026. Les domaines complets restent non comparés à cette maille et proposés.

U48 examine les [achats à façon et l’orchestration](../connaissance/21-achats-et-orchestration.md). ELM042–ELM044 et CMP029/CMP030 distinguent modèle de processus, moyen générique et aptitudes métier, puis comparent des éléments de sous-traitance SAP/Microsoft. Les trois cas enrichissent la liste de domaines sans figer une nouvelle hiérarchie.

U49 précise les moteurs dans les deux couches, avec Case Management dans la couche processus. CMP029 distingue cette orientation locale des constats externes ; C40 corrige la proposition antérieure. Aucune nouvelle lecture de marché ni équivalence ajoutée.

U51 compare les [options de domaines du socle](../connaissance/22-options-domaines-socle.md), avec réexamen SAP/IBM/Microsoft et CMP031. Les dix périmètres de discussion restent une proposition locale ; aucune nouvelle correspondance précise de capacité ni équivalence de domaine complet.

U53–U57 ajoutent les [transferts et le cœur commun de Supply](../connaissance/23-reassort-transferts-et-promesse.md), ELM045–ELM047/CMP032. SAP distingue promesse, stock et exécution tout en confirmant ventes et transferts. Les définitions OMS/Supply de Laurent sont conservées comme choix locaux ; aucun catalogue principal ni domaine commun complet validé.

U63/U64 proposent la [carte des domaines cœur et son épreuve par les récits](../connaissance/25-domaines-coeur-et-epreuve-recits.md), P81/CMP036 et ELM062. La version 0.1 confronte dix domaines et 34 formulations locales aux appuis disponibles ; les définitions non comparées et les comportements de produit sont signalés. Le bilan documentaire 16/20 concerne toujours les 36 CAP historiques.

U65 rapproche les [noms des dix domaines cœur](correspondances-domaines-coeur.md) de SAP, Microsoft, TM Forum et quelques exemples publics historiques Guild. ELM063–ELM066/CMP037 séparent niveaux, composants, objets, API et capacités ; aucun renommage ni équivalence validés.

U66/U67 appliquent la nomenclature anglaise à la [carte courante version 0.2](../connaissance/25-domaines-coeur-et-epreuve-recits.md), désormais 35 formulations avec Supply Assignment explicite. Inventory Management est retenu comme nom ; Supply Protection / Supply Assignment expriment les aptitudes métier, distinctes du mécanisme Allocation Run. ELM067/CMP038 et C49 séparent ce sens du rang natif RBA encore non établi pour les deux derniers noms ; aucune équivalence de catalogue déduite.

U68 commence la revue domaine par domaine avec [D01 Inventory Management](../connaissance/25-domaines-coeur-et-epreuve-recits.md#d01-stocks). ELM068/CMP039 détaillent les rapprochements des quatre aptitudes, sans transformer les noms de produit ou d’API en niveaux de capacités ni valider une équivalence complète.

U74 rattache Supply Protection à Inventory Management dans P81 version 0.3. [CMP040](comparaisons.md#cmp040) actualise les correspondances, avec relecture SAP/Microsoft de ELM017/ELM028. Le rattachement est local et ne prétend pas reproduire le rang natif RBA ; autres frontières inchangées.

U75 poursuit les rattachements : réservation dans D01, affectation dans D03, D02 en réexamen. ELM069/CMP041 reconsultent réservation et mesure de disponibilité Microsoft et articulation de l’affectation SAP avec aATP. Ni formule universelle de disponibilité ni nouveau stock ni équivalence de rang natif déduits.

U78 approfondit [la réservation SAP/Microsoft](allocation-reservation-sap-microsoft.md#réservation-et-frontière-inventory-management-order-promising-u78) : ELM070–ELM072/CMP042 distinguent réservations MM, effet de réservation de Supply Assignment, réservations ERP Microsoft présentes/futures et soft reservations. La frontière locale est réexaminée sans nouveau déplacement.

U79 complète la lecture des ressources futures en [CMP043](comparaisons.md#cmp043) : potentiel contractuel, entrées attendues et affectation, avec ELM073/ELM074 ; aucun reliquat de contrat assimilé automatiquement à une quantité promettable.

U89 : [Order Promising — noms, nature et couverture](order-promising-comparaison-capacites.md). Quatre hypothèses comparées au marché, avec cinq feuilles SAP RBA observées et une grille de dix critères. ELM078–ELM081/CMP047 ; MKT20 ajoute Oracle Fusion GOP 26B, distinct d’Oracle Retail Reference Model.

**État après U97/U98 — 11 septembre 2026 :** 21 références, 86 éléments examinés et 54 comparaisons. [CMP054](comparaisons.md#cmp054) distingue les ingestions locales de la gestion complète des référentiels décrite par les produits. Aucune nouvelle source externe consultée pour cette correction de périmètre.

**Audit U99 — 11 septembre 2026 :** [achats/ventes, référentiels, prix et revue des capacités](../audits/2026-09-11-modele-marche-achats-ventes-referentiels.md). ELM087–ELM098 et CMP055–CMP057 ; état courant : 21 références, 98 éléments, 57 comparaisons. Conclusions proposées, P81 inchangé quant aux capacités.

[Regroupement des référentiels — U101](regroupement-referentiels.md) : séparation sémantique, domaines de données, blocs de composants et niveaux de la carte distingués. P87/CMP059, comparaison du 11 septembre 2026.
## Localisation des Orders — 13 septembre 2026

[Comparaison SAP, Microsoft, Oracle, IBM Sterling et TM Forum](localisation-orders-cartographie.md), U139 / CMP064. Distingue domaines/capacités cités, catalogue de processus, produits et composants ; propose d’éprouver Order Management et sa frontière avec D07, sans adopter un nouveau domaine. Les engagements contractuels restent dans Agreement.


[Panorama To-Promise — U149](to-promise-panorama.md) : ATP, CTP, PTP et variantes, avec limites de transposition à D03.


## Audit des articles, biens et unités logistiques — U176

[Audit SAP / Microsoft / GS1](etudes/2026-09-14-articles-biens-unites-logistiques/audit.md) : référence d’article, SKU, Material/Product, quantité et unité, lot/exemplaire, conditionnement, colis/HU/Container/SSCC. Dix-sept sources avec version et accès, épreuves sur les récits et effets proposés sur le modèle. [Résultats structurés](../modeles/backlog/item-logistic-unit-audit.json). Aucun objet ou capacité adopté par cet audit.


## Microsoft et Univers / Domaine — U185

[Analyse](microsoft-univers-domaines.md) et [correspondances JSON proposées](../modeles/backlog/microsoft-urbanism-fit.json). Distinguer gamme, produits, modules et processus de nos niveaux métier ; pas de nouvelle hiérarchie ou publication.


## Audit de maturité U249 — 16 septembre 2026

[Audit de la v007](../audits/2026-09-16-audit-maturite/rapport.md) : confrontation Microsoft/SAP/Oracle et complément TM Forum, manques, granularité, dépendances et descriptions. Grille des 41 capacités, 29 sources officielles, ELM138–157 et CMP080–085. Recommandations proposées ; modèle et publications inchangés.


## ATP, aATP et couverture — U260

[Étude ATP/aATP](atp-aatp-couverture.md) : définitions officielles, fonctions SAP, comparaison FLOW et quatre frontières à préciser ; ELM158–162, CMP087. Glossaires séparés, catalogue de capacités inchangé.


## Capacités, variantes et niveaux — U261

[Étude de modélisation ATP](capacites-variantes-niveaux-atp.md) : BIZBOK, SAP LeanIX, Ardoq et Microsoft ; dimensions combinables, variantes et niveaux distingués. CMP088 proposé, sans modification du catalogue.


Audit U265/U266 — [Capacités, comportements et niveaux marché](../audits/2026-09-17-audit-comportements/marche.md), avec [matrice des 41 capacités](../audits/2026-09-17-audit-comportements/matrice.md). Les rapprochements CMP089 restent proposés.


## Comportements manquants après refonte — U292

[Audit approfondi](../audits/2026-09-17-comportements-manquants/rapport.md) : revue des 39 capacités et 14 comportements, 28 sources primaires de sept éditeurs, onze mécanismes ciblés, cinq options conditionnelles, sept arbitrages et dix cas d’épreuve. ELM191 / CMP098. Propositions hors catalogue, sans publication ni adoption implicite.
