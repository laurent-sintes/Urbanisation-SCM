# Audit éditorial du référentiel et de sa lecture dans Atlas

27 septembre 2026 — audit demandé après l’ajout de la ligne éditoriale dans AGENTS.md. Aucune réécriture des fiches, modification de code ou publication effectuée dans ce lot.

## Conclusion

La base métier peut être conservée. La reprise doit surtout réduire l’effort de lecture : mettre le résultat métier en premier, regrouper les précisions dispersées, relier le jargon et rendre l’accès aux scénarios systématique. Il n’est pas nécessaire de refaire la cartographie ni de multiplier les capacités.

Trois chantiers sont prioritaires : les liens et infobulles du glossaire ; les fiches où les précisions se sont accumulées ; la rubrique scénarios quand aucun lien n’est documenté. Les développements récents Plan et Allocation doivent aussi suivre ces règles.

## Périmètre et méthode

- Backlog courant : **88 fiches**, soit 5 domaines, 9 sous-domaines et 74 capacités ; **135 termes métier**.
- Publication active résolue par index → descripteur → snapshot : **2026-09-27.2**, 87 fiches correspondantes et 134 termes. Plan est encore propre au backlog.
- Mesures exhaustives sur les champs **finality, definition et scope**, après le nettoyage réellement employé par Atlas, puis retrait du balisage des liens. La table en annexe couvre chacune des 88 fiches. Les nombres de mots excluent les URL et identifiants contenus dans les liens.
- Relecture ciblée des textes de Supply Chain Orchestration, Demand & Supply Matching, Replenishment, Plan Application, Order Management, Purchase Order, Promise Selection Decision, Supply Protection Policy, Group Protection Optimization, Inventory Target Optimization, Plan, Plan Visibility, Plan Ingestion et Master Data Ingestion ; contrôle des exemples de scénarios et des définitions courtes signalées.
- Inspection du code de rendu pour les liens, infobulles, scénarios et rubriques. Réutilisation de la fonction de résolution des scénarios de l’application sur les données de chaque espace, sans alimenter Atlas avec le backlog.
- Les seuils de **250 mots par périmètre**, **40 mots par phrase** et **30 mots par définition courte** servent à repérer des candidats à relire. Ce ne sont ni des normes ni des limites proposées au modèle. Une liste longue peut être nécessaire ; un texte court peut rester obscur.
- Audit statique du contenu et du code, sans nouvelle recette visuelle ou test au survol. Les constats d’interface ci-dessous portent sur le comportement implémenté. Les comportements, référentiels, chapitres méthodologiques, comparaisons marché et chaque phrase du catalogue de scénarios ne font pas l’objet d’une revue éditoriale exhaustive dans cet audit.

## Résultats mesurés

| Indicateur | Backlog | Publication active |
| --- | ---: | ---: |
| Fiches examinées | 88 | 87 |
| Aucun lien glossary dans les trois champs principaux | 55 | 56 |
| Périmètre supérieur à 250 mots | 27 | 27 |
| Au moins une phrase supérieure à 40 mots | 4 | 4 |
| Références internes U…, D… ou BHV… subsistant dans le texte affichable | 20 | 20 |
| Fiches sans finalité : Atlas répète alors la définition dans deux rubriques | 4 | 4 |
| Capacités reliées à au moins un scénario | 74 / 74 | 74 / 74 |
| Sous-domaines reliés à au moins un scénario | 9 / 9 | 9 / 9 |
| Domaines sans scénario documenté | 4 / 5 | 3 / 4 |
| Termes avec une définition courte renseignée | 135 / 135 | 134 / 134 |
| Définitions courtes supérieures à 30 mots | 5 | 5 |
| Définitions courtes terminées par une troncature « … » | 1 | 1 |

L’absence de lien glossary ne suffit pas à déclarer une fiche mauvaise : des liens vers d’autres fiches existent et certaines formulations sont simples. En revanche, les sondes lexicales ci-dessous confirment des lacunes concrètes. Une référence interne peut être légitime dans les preuves ; sa présence dans le texte lecteur exige une relecture, pas une suppression automatique.

## Constats et actions recommandées

### E01 — La règle du jargon contredit une ancienne consigne — priorité 1

[AGENTS.md](../../AGENTS.md) demande chaque occurrence de jargon reliée au glossaire. [CONVENTIONS-MODELE.md, « Rédaction autoportante »](../../CONVENTIONS-MODELE.md#rédaction-autoportante--u470u471) indique encore « sans liens sur chaque répétition ». La nouvelle instruction prime, mais conserver les deux formulations entretient l’incohérence.

**Action :** aligner la convention ancienne sur la règle récente ; conserver la distinction glossaire métier / méthodologique et interdire les rapprochements automatiques d’homonymes. C’est une correction documentaire, sans arbitrage métier à rouvrir.

### E02 — Les mots spécialisés restent souvent sans lien de glossaire — priorité 1

Dans les trois champs principaux du backlog, les sondes donnent :

| Terme recherché | Occurrences | Sans lien glossary |
| --- | ---: | ---: |
| ATP | 11 | 11 |
| CTP | 13 | 13 |
| PTP | 10 | 10 |
| APS | 14 | 14 |
| Matching | 62 | 60 |
| Ledger | 18 | 18 |
| Supply Assignment | 12 | 12 |

Ce sont des sondes sur des mots choisis, pas une détection exhaustive du jargon ni un score de conformité. Une occurrence reliée à une fiche model est comptée sans lien glossary : elle offre une aide, mais pas celle demandée. Les noms dans les menus et cartes sont hors de ces compteurs.

ATP, CTP, PTP et Ledger ont déjà des entrées métier. Pour APS, BOP, Matching et Min/Max, vérifier le concept exact et les synonymes avant de créer une entrée : aucun remplacement aveugle par proximité de nom. Les derniers ajouts répètent eux aussi des termes non reliés, notamment APS dans Plan Ingestion et Group Inventory Allocation dans Supply Protection Policy.

**Action :** établir les correspondances terme → sens → entrée, puis lier toutes les occurrences concernées dans les textes repris. Compléter les seules entrées nécessaires dans le même lot.

### E03 — Le survol n’utilise pas prioritairement la définition courte — priorité 1

[ModelLinks.tsx:71](../../app/src/components/ModelLinks.tsx#L71) choisit definition avant short_description. Le glossaire possède pourtant une définition plus courte dans **25 cas du backlog** et **24 de la publication**. Exemple : Agreement propose 10 mots dans sa version courte, contre 52 dans sa définition complète. Le survol et le focus clavier sont déjà gérés, de même que la touche Échap ; le mécanisme doit être conservé.

Le lien méthodologique MethodLink mène au bon glossaire mais n’a pas de définition au survol. ModelText ne résout que les liens model et glossary métier ; le raccordement au glossaire méthodologique reste à préciser. Les fiches de flux de valeur affichent plusieurs champs en texte brut, sans ModelText : y ajouter uniquement du balisage de glossaire ne suffirait pas.

**Action :** donner priorité à short_description, avec repli sur definition ; couvrir aussi les termes méthodologiques et les champs concernés des flux. Vérifier survol, focus et publication sélectionnée.

**Contenus courts à reprendre :** Product Catalog (35 mots), Ledger (35), Service Order (37), Transfer Order (31), Task (39). Stock movement contient une phrase coupée : « Les écritures et justificatifs qui le… ». Une définition courte doit être une phrase complète ; les exceptions et frontières détaillées peuvent rester dans l’entrée complète.

### E04 — Les précisions s’accumulent au lieu de former un message — priorité 1

| Fiche | Mots du périmètre | Diagnostic |
| --- | ---: | --- |
| Replenishment | 975 | Seize paragraphes ; l’implantation revient dans l’ouverture puis dans un développement ajouté. Frontières et responsabilités dispersées. La finalité ne parle que des apports continus alors que la définition inclut les apports initiaux : alignement éditorial à rétablir. |
| Plan Application | 683 | Les effets appliqués, partiels ou refusés et leurs autorisations sont réexpliqués à plusieurs endroits. Réunir les cas sans perdre les conditions. |
| Order Management | 622 | Le lecteur doit traverser beaucoup de responsabilités voisines pour identifier le service propre du sous-domaine. |
| Purchase Order | 576 | Définition chargée et périmètre étendu ; faire ressortir commande fournisseur, changements et reste à satisfaire, puis les cas. |
| Promise Selection Decision | 570 | La frontière avec confirmation, Matching et affectation revient dans plusieurs paragraphes. Conserver une seule explication complète, reliée aux responsables. |
| Supply Protection Policy | 401 | Le nom est conservé par U796. Les distinctions sont utiles, mais finalité et définition se répètent ; la convention Allocation a été ajoutée en fin de texte avec sa référence U795. |

Demand & Supply Matching illustre aussi un problème de texte court : « couverture cohérente […] selon une valeur multidimensionnelle » ne dit pas simplement ce que le lecteur obtient. Le bénéfice peut être exprimé avant le détail des critères. Il ne faut pas réduire la valeur au volume ou à la marge.

**Action :** reconstruire chaque fiche autour du résultat, des responsabilités et d’un exemple. Regrouper les frontières en un passage cohérent. Déplacer la provenance dans les preuves, mais garder les conditions métier et les réserves utiles. Ni suppression massive des négations, ni raccourcissement au nombre de mots.

### E05 — Du texte interne et des défauts de présentation restent visibles — priorité 2

Le filtrage publicText laisse notamment « Vocabulaire U795 » dans les ajouts du backlog et « D04 gère les Orders nécessaires, D03 décide […] D06 pilote […] » dans Replenishment. Ces identifiants demandent au lecteur de connaître l’histoire du modèle. Les remplacer dans le texte lecteur par les noms actuels et leurs liens, en conservant les preuves internes.

Replenishment contient des intertitres encadrés par ** dans le YAML. ModelText ne traite pas le Markdown de mise en forme, uniquement les liens : ces marqueurs peuvent être affichés littéralement. Choisir un rendu cohérent ou des paragraphes sans faux balisage.

Quatre capacités n’ont pas de finalité renseignée : Simulation & Analysis, Receiving Order, Transport Plan Decision et Scrapping Order. BusinessSheet affiche alors la même définition sous « À quoi cela sert » et « Définition ». Renseigner un bénéfice distinct ou éviter ce doublon dans le rendu.

### E06 — Les scénarios sont reliés, mais l’espace n’est pas systématique — priorité 1

La résolution actuelle donne des scénarios aux 74 capacités, aux neuf sous-domaines et au domaine Supply Chain Orchestration. La déduplication et la remontée depuis les contributions des capacités sont déjà présentes. Supprimer les anciens liens de migration du calcul d’audit ne change aucun de ces résultats : la mobilisation explicite suffit aujourd’hui.

[BusinessSheet.tsx:106](../../app/src/components/BusinessSheet.tsx#L106) n’affiche le titre et la liste que si au moins un scénario existe. Sales, Sourcing and Procurement et Logistics Execution sont donc sans rubrique explicite dans la publication. Plan s’ajoute à cette liste dans le backlog. Ces domaines n’ont pas de capacités détaillées dans le périmètre actuel : ce constat n’est pas un trou métier démontré.

**Action :** toujours afficher l’espace sur les domaines, sous-domaines et capacités ; à défaut, afficher « Aucun scénario documenté pour ce périmètre ». Distinguer cet espace des illustrations locales et lui donner une entrée claire dans le sommaire. Les liens mènent déjà au scénario où le parcours peut être choisi ; conserver cette navigation et le contexte de publication. Ne pas rattacher artificiellement les scénarios aux domaines externes pour remplir la rubrique.

## Exemples de rédaction proposés, non appliqués

Ces exemples illustrent le style souhaité ; ce ne sont pas des remplacements complets de périmètre ni de nouveaux accords métier. Les termes spécialisés devront recevoir leurs liens dans la version intégrée.

| Fiche ou terme | Proposition courte |
| --- | --- |
| Supply Chain Orchestration — ouverture | « Organiser la satisfaction des demandes : choisir les ressources, faire appliquer les décisions et coordonner les prestations jusqu’au résultat attendu. » Puis développer les responsabilités et frontières en phrases distinctes. |
| Demand & Supply Matching — bénéfice | « Déterminer comment couvrir les commandes et les besoins prévus avec les ressources disponibles ou attendues, en tenant compte du service, des engagements, des coûts et des risques. » Préciser ensuite que les critères dépendent du cas, sans poids universels. |
| Plan Ingestion — définition | « Intégrer les prévisions reçues du domaine Plan et leurs révisions, en conservant leur origine, leur horizon, leur version et leur statut. » Expliquer APS dans le glossaire et la frontière dans le périmètre. |
| Supply Protection Policy — ouverture | « Définir et appliquer les règles d’utilisation et de renouvellement du stock pour limiter les pénuries et les excédents. » Conserver ensuite l’étendue exacte des ressources, les quatre mécanismes et leurs responsables. |
| Ledger — infobulle | « Registre des écritures qui expliquent les mouvements et les états du stock. » |

## Plan de reprise recommandé

1. **Règles et lecture Atlas.** Aligner les conventions, utiliser les définitions courtes, rendre la rubrique scénarios permanente, supprimer les doublons de rendu. Traiter aussi les liens méthodologiques et les champs en texte brut.
2. **Glossaire.** Corriger les six définitions courtes signalées, qualifier les sigles et les sens manquants, préparer les liens. Garder les précisions dans les définitions complètes.
3. **Pilote éditorial.** Reprendre Supply Chain Orchestration, Demand & Supply Matching, Supply Protection Policy, Replenishment, Plan Application et Promise Selection Decision. Inclure Plan / Plan Visibility / Plan Ingestion pour ne pas laisser les derniers ajouts en décalage. Faire une revue comparée du sens avant/après.
4. **Généralisation ciblée.** Reprendre les autres fiches à partir de l’inventaire ci-dessous ; lire également leurs comportements, exemples et sources d’inspiration dans le même lot. La longueur seule ne décide pas du besoin de réécriture.
5. **Recette et publication distincte.** Vérifier préservation des frontières, liens dans le bon glossaire et snapshot, survol/clavier, états vides et scénarios. Une publication ultérieure est nécessaire pour rendre les changements de contenu visibles dans Atlas.

Critère de sortie d’une fiche : le lecteur comprend le résultat métier dès l’ouverture ; chaque distinction n’est expliquée qu’à l’endroit utile ; le jargon a une aide courte ; exemples et scénarios sont accessibles ; aucune responsabilité n’a été ajoutée, retirée ou déplacée au passage. Les noms et périmètres validés, notamment Supply Protection Policy, sont conservés.

## Inventaire des 88 fiches du backlog

Mesures de repérage, pas notes de qualité. « Liens » compte uniquement les liens glossary des trois champs principaux ; « scénarios » compte les identités uniques mobilisant le périmètre. Les identifiants techniques servent ici à retrouver précisément les fiches.

| Identité | Fiche | Mots du périmètre | Liens | Scénarios |
| --- | --- | ---: | ---: | ---: |
| domain-sales | Sales | 60 | 1 | 0 |
| domain-sourcing-procurement | Sourcing and Procurement | 58 | 1 | 0 |
| domain-plan | Plan | 134 | 1 | 0 |
| universe-supply | Supply Chain Orchestration | 193 | 0 | 26 |
| business-references | Master Data | 66 | 0 | 6 |
| D01.f | Inventory Tracking | 259 | 0 | 9 |
| D01.g | Inventory Ledger | 238 | 1 | 9 |
| D01.c | Inventory Visibility | 322 | 1 | 13 |
| D01.d | Stocktaking | 143 | 0 | 1 |
| D02.b | Supply Protection Policy | 401 | 1 | 1 |
| D02.c | Reservation | 203 | 0 | 3 |
| D02.e | Plan Application | 683 | 0 | 6 |
| D03.i | Available-to-Promise (ATP) | 159 | 0 | 6 |
| D03.j | Capable-to-Promise (CTP) | 183 | 0 | 2 |
| D03.k | Profitable-to-Promise (PTP) | 195 | 0 | 4 |
| D03.l | Promise Selection Decision | 570 | 0 | 9 |
| D03.m | Demand Prioritization | 241 | 0 | 2 |
| D04.i | Sales Order | 343 | 1 | 10 |
| D04.j | Purchase Order | 576 | 1 | 4 |
| D04.k | Transfer Order | 366 | 1 | 4 |
| D04.l | Return Order | 442 | 1 | 2 |
| D04.m | Supplier Return Order | 469 | 1 | 1 |
| D04.n | Order Structuring | 301 | 0 | 1 |
| D05.a | Inventory Target Optimization | 190 | 0 | 1 |
| D05.d | Group Protection Optimization | 161 | 0 | 1 |
| D05.e | Replenishment | 975 | 3 | 3 |
| D05.c | Stock Redistribution | 362 | 0 | 1 |
| D05.f | Master Planning | 255 | 3 | 4 |
| D06.b | Service Capacity Visibility | 212 | 0 | 3 |
| D07.a | Service Requirements Decision | 248 | 0 | 2 |
| D07.c | Service Reconciliation | 206 | 0 | 6 |
| D07.d | Operations Tracking | 89 | 0 | 9 |
| D04 | Order Management | 622 | 0 | 16 |
| D01 | Inventory Management | 282 | 0 | 17 |
| D06 | Fulfilment Orchestration | 310 | 0 | 17 |
| D03 | Demand & Supply Matching | 184 | 0 | 10 |
| D06.d | Process Orchestration | 340 | 0 | 16 |
| D06.e | Service Selection Decision | 286 | 0 | 4 |
| D06.f | Process Adaptation Decision | 360 | 0 | 3 |
| BHV006 | Simulation & Analysis | 509 | 0 | 1 |
| D05.h | Reservation Policy Optimization | 352 | 0 | 1 |
| D03.o | Supply Assignment | 202 | 0 | 8 |
| D05.i | Inventory Disposition Decision | 358 | 1 | 4 |
| D04.r | Consignment Fill-up Order | 256 | 0 | 2 |
| D01.h | Inventory Ownership Transfer Decision | 206 | 0 | 2 |
| D08.e | Product Reference Visibility | 128 | 0 | 1 |
| D09.e | Party / Role Visibility | 147 | 2 | 1 |
| D11.b | Agreement Visibility | 166 | 1 | 4 |
| D12.b | Product Catalog Visibility | 176 | 0 | 2 |
| D13.b | Fulfilment Network Visibility | 155 | 0 | 1 |
| D14.b | Service Catalog Visibility | 192 | 1 | 1 |
| D16.b | Assortment Visibility | 128 | 0 | 2 |
| D19.a | Service Provider Policy | 127 | 0 | 1 |
| D19.b | Demand Protection Policy | 134 | 0 | 2 |
| D04.t | Consignment Pick-up Order | 205 | 0 | 1 |
| subdomain-policies | Policies | 59 | 0 | 3 |
| subdomain-plans | Plan Visibility | 102 | 0 | 2 |
| plans-ingestion | Plan Ingestion | 77 | 0 | 2 |
| plans-visibility | Supply Plan Visibility | 87 | 3 | 1 |
| subdomain-service-orders | Service Order Management | 489 | 2 | 12 |
| service-order-picking | Picking Order | 159 | 2 | 3 |
| service-order-packing | Packing Order | 242 | 1 | 4 |
| service-order-cross-docking | Cross-Docking Order | 125 | 2 | 1 |
| service-order-transport | Transport Order | 229 | 2 | 4 |
| service-order-labeling | Labeling Order | 188 | 1 | 1 |
| service-order-kitting | Kitting Order | 72 | 1 | 1 |
| service-order-garment-finishing | Garment Finishing Order | 71 | 1 | 1 |
| service-order-cleaning | Cleaning Order | 67 | 1 | 1 |
| service-order-repair-alteration | Repair & Alteration Order | 71 | 1 | 1 |
| service-order-personalization | Personalization Order | 71 | 1 | 1 |
| service-order-inspection | Inspection Order | 86 | 1 | 3 |
| service-order-transport-booking | Transport Booking Order | 135 | 0 | 2 |
| service-order-document-production | Document Production Order | 118 | 0 | 1 |
| service-order-customs-clearance | Customs Clearance Order | 88 | 0 | 2 |
| service-order-billing | Billing Order | 93 | 0 | 1 |
| service-order-payment-collection | Payment Collection Order | 132 | 0 | 2 |
| demand-plan-visibility | Demand Plan Visibility | 60 | 0 | 2 |
| master-data-ingestion | Master Data Ingestion | 275 | 0 | 2 |
| operations-visibility | Operations Visibility | 100 | 0 | 2 |
| price-book-visibility | Price Book Visibility | 128 | 0 | 2 |
| order-visibility | Order Visibility | 96 | 0 | 1 |
| inventory-ownership-ledger | Inventory Ownership Ledger | 201 | 0 | 2 |
| service-order-release-decision | Service Order Release Decision | 316 | 0 | 4 |
| subdomain-order-promising | Order Promising | 185 | 0 | 9 |
| service-order-receiving | Receiving Order | 198 | 0 | 1 |
| transport-plan-decision | Transport Plan Decision | 217 | 1 | 2 |
| service-order-scrapping | Scrapping Order | 211 | 1 | 1 |
| domain-logistics-execution | Logistics Execution | 60 | 1 | 0 |
# Reprise appliquée — U797

La reprise éditoriale et ergonomique est réalisée. La publication **2026-09-27.3** et son guide sont validés et activés dans Atlas. La publication précédente 2026-09-27.2 est conservée dans le commit local **15e4c0f**, explicitement autorisé avant activation. Aucun push.

- Six fiches pilotes réécrites : Replenishment, Plan Application, Order Management, Purchase Order, Promise Selection Decision et Supply Protection Policy. Leurs périmètres totalisent 2 158 mots contre 3 827 avant reprise, soit environ 44 % de moins.
- Relecture des 88 fiches de domaine, sous-domaine et capacité : liens explicatifs, frontières, phrases longues et références internes corrigés. Aucun changement de nom, de hiérarchie, de décomposition ou de contribution aux scénarios dans ce lot éditorial.
- Aucun passage de plus de 40 mots par phrase ni identifiant interne de décision détecté dans les trois champs principaux après filtrage public. Ce contrôle lexical ne constitue pas une mesure automatique de la qualité du fond.
- Six définitions courtes métier corrigées ; aucune ne dépasse 30 mots. Entrée explicative Demand & Supply Matching ajoutée à partir du périmètre et des comparaisons existants. Les 31 termes méthodologiques disposent d’une définition courte.
- Vingt et un textes du catalogue de scénarios reliés au glossaire. Les références de capacités ouvrent leur fiche ; les liens de notions ouvrent le glossaire. Les correspondances sont inscrites dans les données, sans détection automatique d’homonymes à l’affichage.
- Atlas utilise la définition courte dans les infobulles métier et méthodologiques, accessibles au clavier. La rubrique « Scénarios mobilisant ce périmètre » existe aussi lorsqu’elle est vide. La répétition de la définition en l’absence de finalité est supprimée.

Les 25 périmètres qui restent au-dessus de 250 mots conservent des précisions de responsabilité et des exemples utiles. Leur longueur n’est pas, à elle seule, un défaut à supprimer. Les quatre domaines sans scénario documenté le signalent explicitement ; aucun manque métier n’est déduit de cette absence.

Validation : modèle sans erreur, 122 tests frontend et 15 tests Python réussis, build réussi, recette navigateur bureau/mobile réussie. La recette contrôle les filtres, liens, infobulles, navigation clavier, contexte de version et lecture historique. Les noms, relations et contributions ont aussi été comparés à l’état audité. Les définitions réécrites ne reçoivent pas automatiquement les accords portés par leur ancienne formulation.

Le constat initial ci-dessous reste celui de l’état audité, avant correction.

