# Piloter les flux SCM : indicateurs reconnus, Lean et optimisation

Étude documentaire du 22 octobre 2026 — demandes [U1138 à U1140](../../connaissance/01-contributions-utilisateur.md#u1138).

Statut : étude intégrée le 22 octobre 2026 au [dossier de pilotage SCM](../../output/pdf/FLOW-Piloter-la-supply-chain-indicateurs-et-decisions.pdf), avec une introduction plomberie, Lean et optimisation, des intitulés lisibles et un chapitre sur les impacts pour FLOW. Cette intégration documentaire ne modifie pas le modèle ni les glossaires canoniques. Les rapprochements ci-dessous ne prouvent aucune réalisation installée chez Beaumanoir.

## 1. Conclusions

1. **La métaphore hydraulique a un appui universitaire explicite.** Bartholdi et Hackman, Georgia Tech, décrivent un modèle de circulation des produits par des tuyaux et réservoirs. Les six images de Laurent constituent une adaptation pédagogique ; aucune méthode normalisée réunissant exactement ces six images n'a été établie par cette recherche.
2. **Le Lean fournit une démarche pour examiner la chaîne entière.** La cartographie des flux de valeur, ou Value Stream Mapping (VSM), s'applique aux flux physiques et d'information. Des travaux l'étendent aux relations entre fournisseurs, distributeurs et clients.
3. **La recherche opérationnelle permet de comparer les décisions.** Les modèles de réseau, d'affectation, de stocks et de files d'attente donnent un contenu quantitatif aux choix de parcours, de lots, de protections et de capacités. L'optimum dépend de l'objectif, du périmètre et des hypothèses choisis.
4. **Les indicateurs vérifient les effets de ces décisions.** OTIF, Cost-to-Serve, délai commande-livraison ou couverture de stock sont des noms connus. Certains indicateurs utiles à FLOW, notamment les transferts avant préparation wholesale, méritent un nom explicite même sans sigle consacré.

L'articulation proposée pour FLOW est donc : **observer le flux → comprendre les attentes et contraintes → comparer des options → décider selon les règles autorisées → mesurer le résultat**. C'est notre proposition d'usage des références, pas une architecture prescrite par les auteurs.

## 2. La plomberie : un précédent précis et ses limites

### L'appui principal : Georgia Tech

Dans *Warehouse & Distribution Science*, version 0.98.1 de 2019, John J. Bartholdi III et Steven T. Hackman consacrent le chapitre 2 au mouvement des produits. La section 2.1, « The fluid model of product flow », compare les entrepôts à des réservoirs reliés par des conduites. La section 2.2 rappelle que les produits circulent en unités distinctes, parfois volumineuses : le liquide n'est donc qu'une analogie. [Ouvrage des auteurs, p.11–12 imprimées](https://www2.isye.gatech.edu/~jjb/wh/book/editions/wh-sci-0.98.1.pdf).

**Précaution de dessin :** chez ces auteurs, une section plus large peut représenter davantage d'encours pour un même débit. Dans une illustration FLOW, si le diamètre signifie plutôt la capacité de traitement, il faut l'annoncer dans la légende. Ne pas mélanger ces deux conventions.

Deux autres appuis complètent cette lecture :

- Kingston University emploie une analogie de plomberie pour expliquer qu'une amélioration en amont ne résout pas un étranglement en aval. C'est un support pédagogique de management, pas un standard SCM. [Melanie Roberts, 26 septembre 2023](https://kingstonuniversitybusinesstraining.com/identifying-where-value-flow-is-blocked-in-your-business/).
- Le Supply Chain Resource Cooperative de NC State présente les travaux de Robert Handfield et Tom Linton sur la visibilité, les décisions rapides et les frictions qui ralentissent les flux. Ce texte appuie le lien entre information et circulation physique ; il n'appelle pas les défauts d'information des « fuites ». [Article SCRC, 29 juillet 2017](https://scm.ncsu.edu/scm-articles/article/managerial-practice-will-need-to-catch-up-with-the-emergence-of-real-time-supply-chains).

### Les six leviers de Laurent : traduction proposée pour FLOW

Les mesures et décisions de ce tableau sont des propositions locales, éclairées par les références. Ce ne sont pas les six étapes d'une méthode attribuée à Georgia Tech.

| Image | Problème de gestion à examiner | Mesures utiles | Décision possible et limite |
| --- | --- | --- | --- |
| **Éviter les fuites** | Une réception, un retour, une annulation ou une capacité modifiée est absent, tardif, erroné ou non exploité par le système qui décide. | Délai entre événement et utilisation dans la décision ; part des événements critiques utilisables avant l'échéance ; écarts de stock. | Corriger l'échange, rapprocher les données, recalculer les engagements concernés. Un message reçu techniquement n'est pas forcément une information utilisable. |
| **Agir sur le débit** | Une étape limite les sorties utiles ; les dossiers s'accumulent avant elle. | Débit réellement servi, encours, délai de traversée, âge des attentes, charge/capacité au point limitant. | Régler les lancements, affecter une capacité ou changer de parcours. Accroître l'activité d'un autre site peut seulement déplacer le stock. |
| **Faire des dérivations** | Une demande manque de stock accessible alors qu'une protection conserve des quantités pour un autre flux. | Demandes servies ou mises à risque par groupe ; consommation des protections ; OTIF et coût après décision. | Réallouer une quantité ou ajuster une protection dans le cadre autorisé. Cela modifie un droit d'usage et ne nécessite pas toujours un transfert physique ; cela ne crée pas de stock. |
| **Casser les grumeaux** | Une ligne manquante bloque une commande, ou un lot crée une longue attente. | Délai des lignes prêtes, taille des lots, nombre d'expéditions et transferts, coût de service. | Séparer les lots de préparation ou autoriser une livraison partielle si le client l'accepte. Comparer les coûts supplémentaires et conserver la promesse initiale comme référence de service. |
| **Empêcher les grumeaux** | Seuils, tailles de lots ou lancements produisent des arrivées irrégulières et dépassent les capacités utiles. | Encours et attente par étape, variabilité des arrivées, couverture, charge future, ruptures. | Réviser seuils et lots, lisser les arrivées, limiter les lancements ou réapprovisionner selon la consommation. Une zone de préparation, un stock de sécurité et une protection commerciale demandent des règles distinctes. |
| **Vidanger en fin de saison** | Des quantités restent sans débouché alors que les entrées continuent. | Excédent projeté, taux d'écoulement, valeur nette récupérée, achats encore engagés, retours attendus. | Réduire les entrées encore modifiables, réaffecter ou orienter vers les destinations de déstockage autorisées. Viser le bon reliquat, avec les engagements, le SAV et les retours futurs. |

Pour les échanges d'information, **EPCIS**, standard GS1 de données de visibilité, documente le partage d'événements sur les objets, lieux, moments et contextes métier. Cela fournit un appui à la visibilité ; cela ne garantit ni la qualité des données, ni leur prise en compte par un moteur de décision. [Présentation officielle GS1, mise à jour du 30 mai 2025](https://support.gs1.org/support/solutions/articles/43000755325-what-is-electronic-product-code-information-services-epcis-).

Pour la dérivation, les mécanismes sont concrets : Microsoft Dynamics 365 documente allocation, désallocation et réallocation entre groupes ; SAP S/4HANA aATP documente des protections par groupe, priorité et période. Ce sont des appuis fonctionnels, sans équivalence complète entre les produits ni preuve d'installation FLOW. [Microsoft, Inventory Visibility allocation](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-visibility-allocation) ; [SAP S/4HANA Cloud Public Edition 2608, Key Concepts in Supply Protection](https://help.sap.com/docs/SAP_S4HANA_CLOUD/32da8359c8ee4e8b8e8c5e15cacba5aa/18546eaaa35249ffb5d29afe9a151bee.html?locale=en-US&version=LATEST).

## 3. Lean et Value Stream Mapping : une application établie à la SCM

### Le vocabulaire à retenir

Le terme retrouvé pour la piste « Lean Stream Value » est **Value Stream Mapping (VSM)** : cartographie des flux de valeur. Le Lean Enterprise Institute décrit une lecture commune des flux de matières et d'information, de la commande à la livraison, puis la conception d'un état futur. La gestion continue de ces flux relève plus largement du *Value Stream Management*. [LEI, Value Stream Mapping](https://www.lean.org/lexicon-terms/value-stream-mapping/).

### Trois preuves qui dépassent l'atelier

- **Hines et Rich, 1997**, chercheurs du Lean Enterprise Research Centre de Cardiff : *The seven value stream mapping tools*, IJOPM 17(1), p.46–64. Le résumé définit explicitement une typologie de cartographie des flux de valeur ou des supply chains, choisie selon les gaspillages à traiter et au-delà des frontières fonctionnelles. Résumé éditeur consulté ; texte intégral payant non consulté. [Article, DOI 10.1108/01443579710157989](https://doi.org/10.1108/01443579710157989).
- **Jones et Womack, avec Brunt et Lovejoy, 2011** : la deuxième édition de *Seeing the Whole Value Stream* étend la lecture aux relations entre entreprises. L'annonce officielle présente des exemples de distribution, de service automobile et de collaboration fournisseurs, dont Tesco et Acme Alliance. Nous avons consulté l'annonce et des extraits, pas le livre complet. [Annonce LEI du 1er décembre 2011](https://www.lean.org/about-lei/press-releases/lean-enterprise-institute-publishes-2nd-edition-of-seeing-the-whole-value-stream-with-new-examples-of-lean-supply-chain-analysis/).
- **John Shook, avant-propos de cette édition** : il confronte explicitement les achats offshore au prix unitaire faible à la compréhension du coût et du fonctionnement de la chaîne entière. Ce passage rejoint l'arbitrage offshore/nearshore discuté pour FLOW, sans prescrire une politique de sourcing. [Avant-propos publié par le LEI](https://www.lean.org/wp-content/uploads/2021/01/seeing-the-whole-foreward.pdf).

**Ce que cela apporte au dossier :** poser la question « qu'arrive-t-il au produit et à l'engagement client sur tout le parcours ? », puis distinguer traitement utile, attente, stock et mouvement supplémentaire. Pour FLOW, l'extension aux remplacements SAV, retours et déstockage est une proposition d'application à leurs parcours propres ; elle ne doit pas être présentée comme une couverture explicitement démontrée par chacun des ouvrages cités.

La VSM ne constitue pas, à elle seule, un solveur ou un moteur CTP. Elle aide à formuler le problème réel et à concevoir le fonctionnement cible. Les chiffres spectaculaires d'un exemple pédagogique de l'ouvrage ne sont ni un benchmark universel ni un gain démontré chez Tesco.

### Méthodes voisines utiles

| Référence | Apport concret | Précaution pour FLOW |
| --- | --- | --- |
| **Théorie des contraintes — TOC**, Goldratt | Chercher ce qui limite le résultat d'ensemble ; une règle peut être aussi contraignante qu'une ressource physique. | Ne pas fixer l'utilisation maximale de chaque site comme objectif isolé. [Lettre originale nº 9, décembre 1999](https://www.toc-goldratt.com/index.php?cont=791). |
| **Flux tirés / Kanban** | Les besoins aval autorisent les opérations et réapprovisionnements amont. | Adapter les seuils au délai de réaction, aux références et à la variabilité. [LEI, Pull Production](https://www.lean.org/lexicon-terms/pull-production/). |
| **Effet coup de fouet — bullwhip effect** | Les variations de commandes peuvent s'amplifier vers l'amont, notamment avec les regroupements de commandes et les réactions au signal de demande. | Tout défaut de données ne relève pas de ce phénomène. [Lee, Padmanabhan et Whang, 1997, résumé de l'article original](https://pubsonline.informs.org/doi/10.1287/mnsc.43.4.546). |
| **S&OP — Sales and Operations Planning** | Mettre en cohérence demande, ressources et conséquences financières par un travail transversal. | Une démarche de décision et de planification, pas un KPI ni la preuve qu'un logiciel unique est requis. [ASCM, S&OP](https://www.ascm.org/topics/sales-and-operations-planning/). |

## 4. Les mathématiques : passer du diagnostic au choix d'une décision

### Un lien simple et puissant : la loi de Little

**Encours moyen = débit moyen × temps moyen de traversée.**

Exemple purement illustratif : un périmètre stable contient en moyenne 2 500 pièces et sert 500 pièces par jour. Le temps moyen dans ce périmètre est alors de 5 jours. À débit inchangé, une cible de 3 jours correspond à 1 500 pièces d'encours moyen. La formule ne démontre pas comment atteindre cette cible : il faut agir sur les attentes, la variabilité et les contraintes.

Employer la même population, les mêmes bornes et des moyennes cohérentes. Une photographie du stock de fin de saison, ou une mesure qui oublie les dossiers encore ouverts, ne peut pas être substituée sans précaution à ces moyennes. [Little et Graves, *Little's Law*, 2008, chapitre signé](https://web.eng.ucsd.edu/~massimo/ECE158A/Handouts_files/Little.pdf).

### Quatre familles de modèles

| Famille | Décisions qu'elle peut éclairer | Hypothèses et limites |
| --- | --- | --- |
| **Optimisation de réseau** | Répartir les quantités entre sources, sites et destinations en respectant coûts, disponibilités et capacités. | Un modèle de flux élémentaire doit être enrichi pour représenter calendriers, protections et contraintes de service. [OR-Tools, Minimum Cost Flows](https://developers.google.com/optimization/flow/mincostflow). |
| **Programmation entière / par contraintes** | Choisir des lots, affecter une ressource, ouvrir un parcours, fractionner ou maintenir une livraison complète. | Les décisions indivisibles et coûts fixes doivent être explicites ; une solution réalisable n'est pas toujours prouvée optimale dans le temps de calcul accordé. [OR-Tools, Integer Optimization](https://developers.google.com/optimization/mip). |
| **Files d'attente et simulation** | Évaluer l'effet des arrivées irrégulières, des lancements et de la saturation sur les délais. | Une capacité moyenne suffisante ne garantit pas une promesse ; la simulation compare des scénarios mais ne choisit pas automatiquement le meilleur. [Charles R. Standridge, *How Factory Physics Helps Simulation*, 2004](https://www.informs-sim.org/wsc04papers/141.pdf). |
| **Optimisation stochastique ou robuste** | Régler une politique de stock ou de sourcing face à plusieurs demandes possibles ; comparer socle offshore et appoint nearshore. | Probabilités, scénarios ou bornes d'incertitude doivent être justifiés. Une solution robuste ne protège pas contre tout événement. [Bertsimas et Thiele, recherche MIT](https://dspace.mit.edu/entities/publication/079b92e1-0abf-4f38-b81a-e8b8b421b3ff). |

### Rôle proposé pour FLOW

1. **Décrire l'état et les règles** : stock utilisable, engagements, capacités, dates, protections et délégations.
2. **Évaluer la disponibilité (ATP, Available-to-Promise)** et la **faisabilité (CTP, Capable-to-Promise)**. Microsoft documente notamment l'ajout des capacités dans le CTP. Le terme CTP ne garantit pas, par lui-même, une recherche de l'optimum global. [Microsoft Dynamics 365, Order promising](https://learn.microsoft.com/en-us/dynamics365/supply-chain/sales-marketing/delivery-dates-available-promise-calculations).
3. **Comparer les conséquences économiques des options réalisables** : lecture PTP (*Profitable-to-Promise*) dans le dossier. Oracle documente ce terme pour le choix d'options de fourniture selon leurs coûts et dates ; cela ne suffit pas à couvrir un optimum économique de saison incluant tous les risques et débouchés. [Oracle, Alternative Fulfillment Scenarios](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/fascp/create-alternative-fulfillment-scenarios-to-reduce-cost.html).
4. **Exécuter la décision autorisée, puis mesurer** service, coût, transferts, stock résiduel et valeur récupérée.

Il faut préciser l'objectif avant le calcul. Par exemple : maintenir les engagements admissibles, respecter les protections SAV, puis réduire le coût du parcours et les mouvements évitables. Minimiser seulement le nombre de transferts peut dégrader le service ; maximiser seulement l'OTIF peut produire un excédent coûteux.

Le bénéfice attendu d'un moteur unifié est de rendre les dépendances et conséquences calculables sur un même état de référence. Cela reste une proposition de valeur à éprouver, pas un gain garanti par le seul choix d'un algorithme ou par la centralisation des données.

## 5. Indicateurs : reprendre les noms connus sans créer de fausses équivalences

### Les sept priorités du dossier

| Mesure actuelle | Nom conseillé pour une future rédaction | Reconnaissance et frontière |
| --- | --- | --- |
| Promesse initiale tenue | **OTIF — On Time In Full**, « livré complet et à temps » | Terme reconnu. Conserver la précision : par ligne, à la date promise initiale, au point de livraison défini. |
| Engagements ouverts à risque | **Commandes à risque** ou **promesses à risque** | Nom explicite ; pas de sigle universel établi dans cette recherche. Le risque futur n'est pas le résultat OTIF observé. |
| Coût du parcours par livraison | **Coût de service par livraison — Cost-to-Serve (CTS)**, après validation du périmètre | CTS est utilisé dans le marché, mais peut désigner une analyse plus large par client, produit ou canal. Distinguer coût d'acquisition, exécution, retours et coûts attribuables. |
| Transferts préalables wholesale | **Transferts avant préparation** | Conserver cette mesure spécifique : moyenne par livraison et part des livraisons concernées. Aucun sigle consacré trouvé. |
| Excédent projeté | **Excédent projeté en fin de saison** ou à une autre date explicite | Les mesures de stock excédentaire existent ; distinguer excédent actuel et projection après demande, entrées et stock cible. |
| Délai de bout en bout | **Délai commande-livraison — Order Fulfillment Cycle Time** pour ce parcours | Nom reconnu ; d'autres flux demandent d'autres bornes. Garder médiane, 90e percentile et attentes par étape. |
| Valeur nette récupérée | **Valeur nette récupérée** | Conserver recettes/avoirs moins frais de récupération, avec convention de valorisation explicitée. Aucun sigle commun confirmé ; le taux de retour ou d'écoulement ne mesure pas la même chose. |

**OTIF est connu, mais sa convention de calcul doit être écrite.** Une étude TPA/McKinsey de 2019 documente les écarts de maille, date demandée ou promise et fenêtre admissible. Elle propose une convention pour son secteur ; elle ne prouve pas une formule universelle applicable à FLOW. [Étude originale](https://www.mckinsey.com/capabilities/operations/our-insights/defining-on-time-in-full-in-the-consumer-sector).

Le **Perfect Customer Order Fulfillment** de SCOR inclut aussi des critères documentaires et de condition du produit. C'est plus large que l'OTIF du dossier. Les codes techniques SCOR restent des références de catalogue ; les afficher à la place des codes M recréerait la difficulté de lecture. [ASCM, définition SCOR](https://scor.ascm.org/performance/reliability/RL.1.1).

Pour **CTS**, Gartner emploie explicitement le sigle et recommande une lecture des coûts par produits et clients. C'est un appui à l'intitulé, pas une formule automatiquement équivalente au coût actuel du dossier. [Gartner, 22 avril 2025](https://www.gartner.com/en/newsroom/2025-04-22-gartner-says-supply-chain-leaders-should-implement-a-cost-to-serve-model-to-better-assess-customer-and-product-profitability).

Pour les **transferts**, APQC répertorie historiquement la part des commandes servies entièrement depuis le site principal, mesure 102586. C'est voisin mais différent : un site secondaire peut livrer directement sans transfert ; le site principal peut recevoir un transfert avant de préparer. Cet indicateur ne remplace donc pas le besoin FLOW. [Catalogue APQC 2013, p.163](https://www.apqc.org/sites/default/files/APQC%20Benchmarking%20Measures%20List.pdf).

### Compléments mémorisables

| Terme reconnu | Calcul ou usage possible | Point à fixer |
| --- | --- | --- |
| **Fill rate — taux de satisfaction** | Part des unités ou lignes demandées effectivement servies selon une fenêtre convenue. | Fixer maille, échéance et dénominateur. APQC rapporte ici les unités expédiées sous 24 heures au total des unités expédiées ; cela diffère d'un taux calculé sur la demande totale. [APQC](https://www.apqc.org/what-we-do/benchmarking/open-standards-benchmarking/measures/unit-fill-rate). |
| **Days of Supply — couverture de stock** ; **Inventory Turns — rotation** | Lecture comptable : stock moyen / coût des ventes journalier ; rotation = coût des ventes annuel / stock moyen. | Distinguer l'historique comptable d'une couverture future calculée sur les prévisions saisonnières. [APQC, explication du cycle de trésorerie](https://www.apqc.org/What-Is-Cash-to-Cash-Cycle-Time). |
| **C2C — Cash-to-Cash Cycle Time** | Jours de stock + délai d'encaissement client − délai de paiement fournisseur. | KPI transversal avec Finance, sensible aux conditions de règlement autant qu'aux flux. [APQC, mesure C2C](https://www.apqc.org/resources/benchmarking/open-standards-benchmarking/measures/cash-cash-cycle-time-days). |
| **Sell-through — taux d'écoulement** | Part d'un stock de référence vendue sur la période ; utile pour la fin de saison. | Fixer cohorte, réceptions, transferts et retours. La convention Shopify vendu/(vendu + stock final) n'est pas universelle. [Shopify, Inventory reports](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/inventory-reports). |
| **WIP — Work in Process, encours** | Produits ou travaux engagés mais non terminés ; suivre quantité, âge et délai. | Une commande ouverte n'est pas toujours un produit physiquement en cours. Ne pas mélanger les populations dans la loi de Little. [LEI, Inventory](https://www.lean.org/lexicon-terms/inventory/). |

SCOR est un référentiel ; Lean, TOC et S&OP sont des démarches ; ATP/CTP/PTP désignent des logiques de disponibilité, faisabilité et choix de promesse. Aucun de ces termes ne devient automatiquement un KPI. Un taux de couverture ATP ou de faisabilité CTP demande sa propre définition.

## 6. Recommandations pour la suite, sans application au PDF

- Garder les **sept priorités** et les six questions de pilotage. Les mesures complémentaires servent à expliquer les causes et vérifier les effets secondaires.
- Afficher le **nom métier en premier**, avec le sigle lorsqu'il est utile : OTIF, éventuellement CTS ; éviter de créer un sigle pour chaque ligne.
- Introduire le pilotage par la métaphore de Laurent, avec attribution précise à Georgia Tech pour le modèle de flux. Relier immédiatement chaque image à une décision et une mesure.
- Ajouter l'ancrage **Lean / VSM étendue** pour montrer que la performance se joue sur le parcours complet, puis expliquer l'apport possible des calculs d'optimisation.
- Examiner un complément concernant la **qualité et la fraîcheur des informations utilisées pour décider**. Il couvre le levier des « fuites », moins explicite dans les sept priorités. Son dénominateur doit inclure les événements attendus mais absents, à rapprocher d'une source indépendante des messages reçus.
- Pour le fractionnement des commandes, conserver la **demande et la promesse initiales** comme référence : changer les découpages techniques ne doit pas améliorer artificiellement le taux de service.

### Proposition d'introduction à discuter

> Piloter la supply chain, c'est régler un réseau de circulation : disposer de l'information au bon moment, ouvrir l'accès au stock, adapter les lots, traiter les points de blocage et préparer la sortie des excédents. La métaphore hydraulique rend ces décisions visibles. La cartographie Lean aide à comprendre l'ensemble du parcours ; les modèles mathématiques permettent de comparer les options ; les indicateurs vérifient les résultats sur le service, les coûts et le stock restant.

Ce paragraphe est une rédaction proposée pour FLOW, pas une citation d'un auteur.

## 7. Traçabilité et limites de la recherche

Sources consultées le **22 octobre 2026**. Les liens accompagnent les constats qu'ils soutiennent. Les éditions datées sont précisées ci-dessus ; les documentations produit et lexiques en ligne sont liés à leur état consulté. Aucune formule ni cible n'est adoptée comme politique Beaumanoir.

- **Georgia Tech** : PDF 2019, chapitre 2, sections 2.1–2.2 effectivement consultées ; source principale de l'analogie.
- **Kingston** : contenu indexé consulté ; ouverture directe indisponible. Source secondaire dans l'argumentation, bien qu'émise par l'université.
- **NC State** : article institutionnel consulté, consacré à Handfield et Linton ; ne pas leur attribuer une signature personnelle absente de la page.
- **Lean** : lexique, annonce d'édition, avant-propos et résumé scientifique consultés. Ni le livre complet de Jones/Womack ni le texte intégral payant Hines/Rich ne sont réputés lus.
- **Little** : chapitre signé de Little et Graves consulté. **Standridge** : article de conférence signé consulté, mobilisant Factory Physics ; ne pas l'attribuer directement à Hopp et Spearman.
- **ASCM / APQC** : définitions et extraits publics consultés ; bases complètes de benchmarking non acquises. Aucun taux cible n'est déduit des populations de benchmark.
- **Microsoft** : documentation publique consultée. **SAP** : contenu de la page spécifique consulté par l'extraction du moteur de recherche ; ouverture directe sans texte. **Oracle** : contenu indexé de la page spécifique consulté ; ouverture directe en échec. Ces modes d'accès limitent la profondeur de vérification mais n'autorisent pas à inventer une couverture.
- Les rapprochements FLOW sont des recommandations locales explicitement séparées des faits documentaires. L'absence de sigle commun dans le corpus ne prouve pas qu'aucune organisation n'en utilise.
