# Allocation, protection et réassort — comparaison U794

Consultation : 27 septembre 2026. État comparé : backlog après U793, avant tout renommage lié à U794. Demande conservée dans [U794](../connaissance/01-contributions-utilisateur.md#u794). Suite : U795 valide l’usage qualifié d’allocation de stock par groupe ; U796 conserve explicitement Supply Protection Policy. La piste de renommage du parent est close. L’analyse ci-dessous conserve les constats et recommandations présentés avant ces accords ; ceux-ci ne valent pas approbation globale des comparaisons.

## Conclusion

La définition proposée d’Allocation comme enveloppe pour un usage est attestée chez Microsoft Dynamics 365 Inventory Visibility. Elle n’est pas une définition commune à tout le marché : Oracle NetSuite utilise aussi Supply Allocation pour le matching des ressources aux demandes. L’ambiguïté n’est donc pas propre à SAP.

Chez SAP S/4HANA, distinguer trois effets : Supply Protection protège l’accès de groupes face à d’autres demandes ; Product Allocation plafonne la consommation ou la confirmation par groupe et période ; Supply Assignment (ARun) affecte la ressource à la demande. Un plafond ne garantit pas, à lui seul, qu’un minimum restera disponible pour son bénéficiaire.

Enfin, Min/Max peut désigner soit des bornes de droits d’usage, soit des seuils de renouvellement. La méthode de réassort Min/Max ne rend pas automatiquement le minimum invendable. Le modèle FLOW distingue déjà ces effets.

## Documents primaires effectivement consultés

Les pages évolutives n’affichant pas d’édition restent liées à la date de consultation ci-dessus. Synthèses originales des passages ; aucune importation de catalogue éditeur.

| Référence locale | Produit, document et passage | Constat et limite |
| --- | --- | --- |
| U794-MS-ALLOC | Microsoft Dynamics 365 SCM, [Inventory Visibility inventory allocation](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-allocation), « Business background and purpose », « Allocation definition », « Difference between inventory allocation and soft reservation ». | Enveloppes virtuelles par canal/groupe, protection et maîtrise de surconsommation ; distinctes des réservations associées aux transactions. Usage dans ce composant, pas définition générale d’Allocation. |
| U794-SAP-PAL | SAP S/4HANA for Fashion, [Explaining aATP Product Allocation](https://learning.sap.com/courses/exploring-fashion-functions-and-business-processes-in-sap-s-4hana-for-fashion-and-vertical-business/explaining-aatp-product-allocation-pal-_dd30c229-d63f-4aba-a950-a174280c4a58), « PAL Concept », « Product Allocation — Examples », exemple 1. | Quantités maximales par groupe ; une demande non contrainte peut consommer la ressource disponible avant les autres. PAL ne crée pas automatiquement un droit minimum protégé. |
| U794-SAP-SUP | SAP S/4HANA aATP, [Outlining aATP with Supply Protection](https://learning.sap.com/courses/exploring-aatp-in-sap-s-4hana/outlining-aatp-with-supply-protection-sup-), « Outline », « Prioritized Supply Protection », « Consuming Supply Protection ». | Protection horizontale ou priorisée, consommation des droits ; protection minimale et plafond sont distincts. Une demande prioritaire peut dépasser sa quantité protégée si les autres contraintes le permettent. |
| U794-SAP-ARUN | SAP S/4HANA for Fashion, [Comparing with Legacy SAP Apparel and Footwear Solution](https://learning.sap.com/courses/outlining-sap-s-4hana-for-fashion-and-vertical-business-and-implementing-best-practices/comparing-with-sap-fashion-management-solution-fms), « Comparison of Order Fulfillment Capabilities », « Supply Assignment ». | Affectation aux commandes de vente et transferts, répartition proportionnelle et simulations ; rapprochement avec le matching, sans équivalence avec toute la capacité FLOW. |
| U794-ORACLE-ALLOC | Oracle NetSuite, [Supply Allocation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156424975823.html), introduction, « Allocation Strategies », « Allocation Calculation ». | Matching des ressources actuelles et futures aux demandes, par quantité, lieu et date. Contre-exemple suffisant à l’hypothèse d’une ambiguïté exclusive à SAP ; ne décrit pas une protection par canal. |
| U794-ORACLE-RETAIL | Oracle Retail Merchandising 16.0.027, [Oracle Retail Allocation](https://docs.oracle.com/cd/E79623_01/rms/pdf/160027/html/impl_guide/Alloc.htm), « Information Maintained by Allocation ». | Allocation utilise commandes d’achat, avis d’expédition et stock entrepôt ; contexte de distribution retail. Source ancienne complémentaire, non utilisée pour affirmer le périmètre actuel du produit. |
| U794-MS-MINMAX | Microsoft Dynamics 365 SCM, [Replenishment methods and quantity modification](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/replenishment-methods-quantity-modification), « Coverage codes — Min./Max. ». | Réapprovisionnement vers une cible lorsque le stock prévisionnel passe sous un seuil. Ne définit pas une interdiction de consommer le stock restant. |

Les pages SAP Help « Manage Supply Protection » et « Using Supply Protection and Product Allocation » n’ont renvoyé aucun texte exploitable à l’ouverture. Les conclusions reposent sur les cours SAP Learning ci-dessus, effectivement lus ; aucune consultation complète de ces pages Help n’est revendiquée.

## Correspondance avec le modèle

| Élément canonique | Responsabilité actuelle | Comparaison |
| --- | --- | --- |
| D02.b — Supply Protection Policy | Gouverner et appliquer les paramètres d’usage et de renouvellement de la ressource. | Périmètre FLOW plus large que SAP Supply Protection : il couvre aussi plafonds, sécurité et réassort. Microsoft Allocation n’en représente qu’une partie. |
| BHV017 — Group Supply Protection | Préserver l’accès d’une population face aux concurrents. | Recouvrement partiel avec Microsoft Allocation et SAP SUP ; correspond au cœur de la prémisse de Laurent. |
| BHV018 — Consumption Capping | Plafonner la consommation d’un groupe. | Appui SAP PAL et maîtrise de surconsommation Microsoft ; résultat distinct d’un minimum protégé. |
| BHV019 — Safety Stock Policy | Définir le rôle du tampon et ses conditions d’utilisation. | Autre mécanisme ; aucune nouvelle comparaison détaillée de sécurité réalisée ici. |
| BHV020 — Replenishment Regulation | Gouverner les règles de renouvellement. | Min/Max et revue périodique déjà distingués des droits d’accès. Appui Microsoft sur Min/Max ; pas d’audit SAP du réassort dans cette étude lexicale. |
| D05.d — Group Protection Optimization | Déterminer les quantités protégées et limites d’usage par groupe. | La décision est séparée de la politique active ; les sources de paramétrage ne prouvent pas un calcul optimal identique. |
| D05.a — Inventory Target Optimization | Déterminer cibles et seuils par produit/lieu/période. | Sa définition précise déjà qu’un seuil de réassort ne rend pas le stock restant invendable. |
| D03 — Demand & Supply Matching | Rapprocher demandes et ressources, arbitrer les affectations. | SAP ARun et Oracle NetSuite Supply Allocation confortent le besoin de qualifier les sens ; fonctions produit plus étroites que le sous-domaine. |
| TER018 — Allocation de groupe | Enveloppe attribuée à un usage ou une population ; terme historique qualifié. | Le glossaire reconnaît déjà ce sens. Sa restriction d’emploi relève du choix FLOW U289, pas d’une inexistence du terme chez les éditeurs. |

Les fiches canoniques et leurs comparaisons antérieures ne sont pas renommées par cette étude. La convention courante est localisée dans CONVENTIONS-MODELE.md et assignment-terminology.yaml ; AGENTS.md renvoie à ces règles. Sa justification ne doit pas être résumée à une particularité SAP.

## Recommandation proposée

Autoriser éventuellement **Group Inventory Allocation**, ou « allocation de stock par groupe », comme libellé qualifié d’enveloppe, avec définition explicite des droits et de la consommation. Éviter **Allocation** seul. Conserver séparément affectation aux demandes, réservation, plafond et protection minimale. Un simple alias documenté peut suffire ; aucune nouvelle capacité n’est requise pour rendre ce mécanisme visible.

Ne pas renommer toute la capacité Supply Protection Policy en Allocation. Son périmètre actuel est plus large. Si l’on veut une équivalence plus proche du marché pour le nom du parent, examiner séparément ce périmètre mêlant protection et renouvellement ; ne pas décider sa scission ou son renommage sur la seule question lexicale. Garder Supply plutôt que Stock peut aussi couvrir des ressources futures ; ne pas rétrécir silencieusement le périmètre.

Exemple fictif : sur 1 000 pièces, préserver 200 pour le web est une protection ; limiter un groupe à 500 est un plafond ; affecter 30 à une commande est une décision de matching ; réapprovisionner un magasin sous 60 vers 100 est une règle de renouvellement. Ces nombres ne constituent ni une formule cumulative ni un processus installé.

## Ajustements distincts appliqués au backlog

U794 demande explicitement achats avant ventes et un domaine Plan extérieur à l’orchestration. L’ordre de lecture et le domaine source sont appliqués dans le YAML ; les identités restent stables et les codes seront figés à la prochaine publication. Le classement des domaines est une convention de lecture FLOW, pas un processus universel achats → ventes.

Le domaine Plan et son lien vers Plan Ingestion s’appuient sur [Microsoft Master plans overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/master-plans), « Using master plans », horizons et « Forecast plan », et [SAP S/4HANA Cloud — Outlining Program Planning](https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-public-edition-manufacturing-production-planning/outlining-program-planning_be612648-050c-4353-a60a-808b38c67c5a), « Production Planning Overview » et « Demand Management Overview », consultés le 27 septembre 2026. Les sources étayent la production et la transmission de projections ; elles n’imposent pas l’arbre FLOW ni une frontière universelle APS/orchestration. Les décisions opérationnelles existantes restent dans le Matching.
