# Faits de gestion vers la comptabilité — U813

Analyse Codex du 28 septembre 2026, à la demande de Laurent. Statut : étude et recommandation à discuter, sans modification du modèle, du glossaire ni publication. Contribution : [U813](../connaissance/01-contributions-utilisateur.md#u813). Correspondance : CMP310 ; éléments externes ELM847–ELM852.

## Conclusion

Le marché documente une distinction entre faits opérationnels, pertinence comptable, traduction en écritures et transfert vers le grand livre. Il étaye le besoin décrit par Laurent, mais ne démontre pas une capacité autonome portant un nom commun aux éditeurs. Une responsabilité de préparation et transmission des faits pour la comptabilité mérite d’être explicitée dans FLOW. Sa création et son rattachement restent à arbitrer.

Un interpréteur comptable est ici le composant qui transforme des données métier en écritures selon des règles comptables. Sa position technique avant un logiciel comptable ne le place pas nécessairement hors du domaine métier Finance.

## Sources primaires et rapprochement

Toutes les sources ci-dessous ont été consultées le 28 septembre 2026. Il s’agit de pages évolutives, sans édition logicielle unique établie, sauf produit explicitement nommé. Les libellés anglais sont les termes natifs des sources ; les explications françaises sont des reformulations. Aucun identifiant natif de capacité n’est fourni. Synthèses originales et liens uniquement ; aucun droit de redistribution intégrale présumé.

| Élément | Produit, document et passage consulté | Constat et portée |
| --- | --- | --- |
| ELM847 / MKT14 | Dynamics 365 Finance, [Inventory posting](https://learn.microsoft.com/en-us/dynamics365/finance/general-ledger/inventory-posting), tableau, ligne Transfer (journal) | Un transfert interne peut ne pas créer de pièce comptable lorsque les dimensions modifiées ne sont pas suivies financièrement. Appui direct à la distinction mouvement / effet comptable ; ne décrit pas un service externe de sélection. |
| ELM848 / MKT14 | Dynamics 365 Finance, [Accounting distributions](https://learn.microsoft.com/en-us/dynamics365/finance/accounts-payable/accounting-distributions), introduction et Distribute amounts ; mise à jour affichée 2026-04-03 | Les montants des documents sources sont répartis sur des comptes. Les corrections prises en charge produisent des distributions d’annulation puis corrigées. Appui à l’interprétation et aux corrections ; périmètre déjà comptable, plus large que l’alimentation recherchée. |
| ELM849 / MKT14 | Dynamics 365 Finance, [Subledger transfer to the general ledger](https://learn.microsoft.com/en-us/dynamics365/finance/general-ledger/subledger-transfer), options de transfert ; mise à jour affichée 2026-06-16 | Le transfert asynchrone ou planifié porte sur des écritures déjà constituées. Ce mécanisme aval ne suffit pas à prouver la sélection amont des faits. |
| ELM850 / MKT13 | SAP S/4HANA Cloud Public Edition, [Introducing Goods Movements](https://learning.sap.com/courses/managing-inventory-movements-and-stock-transfers-in-sap-s-4hana-cloud-public-edition/introducing-goods-movements_ba906e87-54e8-4f56-837e-bde4d82599de), Document Flow in Goods Movements | Le mouvement est documenté ; un document comptable est produit s’il a un impact financier. Appui direct à la pertinence comptable ; réalisation intégrée, sans preuve d’une capacité indépendante d’export. |
| ELM851 / MKT13 | SAP S/4HANA Materials Management, [Describing Automatic Account Determination](https://learning.sap.com/courses/cross-functional-customizing-in-sap-s-4hana-materials-management/describing-automatic-account-determination), Automatic Account Determination | Le système détermine les comptes pour les transactions pertinentes. Appui à la frontière entre sélection des faits et détermination comptable ; ne prescrit pas le découpage FLOW. |
| ELM852 / MKT95 | Axway Financial Accounting Hub, [présentation du produit](https://www.axway.com/en/products/afah), AFAH core functions et Data reliability | L’offre annonce connexion producteurs/consommateurs, transformation par règles comptables, traçabilité, reprise et rapprochement. Appui à la famille des interpréteurs et plateformes comptables ; présentation commerciale primaire, sans vérification des performances ni des algorithmes de sélection. |

Limite d’accès : SAP Help Portal, page « The Document Concept », n’a pas livré de corps exploitable en lecture directe. Ses extraits indexés ont orienté la recherche ; les conclusions SAP reposent sur les leçons SAP Learning effectivement consultées ci-dessus. Les pages Microsoft comportaient un bandeau d’autorisation mais leur texte documentaire était accessible et a été lu. Aucun contenu connecté ni démonstration vidéo n’a été consulté.

Les deux familles Dynamics et S/4HANA documentent la pertinence et la traduction comptables. Axway complète ce socle par une offre spécialisée d’intégration. Trois produits ne prouvent ni consensus de nommage ni nécessité d’installer un interpréteur externe.

## Frontière recommandée pour FLOW

Cette décomposition est une recommandation de modélisation, pas une taxonomie native des sources :

1. Reconnaître le fait opérationnel et conserver sa preuve : responsabilité de son domaine source.
2. Préparer les faits attendus par la comptabilité : appliquer le contrat convenu avec Finance, vérifier leur complétude, conserver identité, dates, origine et corrections, puis les transmettre et suivre leur prise en charge.
3. Interpréter les faits : déterminer leur traitement, les comptes et les écritures selon les règles de Finance.
4. Enregistrer les écritures et assurer les contrôles comptables dans Finance.

La sélection amont applique un contrat métier défini avec Finance. Elle ne doit pas devenir une seconde autorité sur les règles comptables. Un fait sans écriture immédiate peut rester utile aux rapprochements ou à un traitement ultérieur : « transmis à Finance » et « comptabilisé » sont deux états distincts.

La traçabilité recommandée distingue au minimum fait retenu, fait hors contrat avec motif, fait incomplet, transmission, acceptation ou rejet et correction. L’accusé technique ne prouve pas la comptabilisation. La reprise d’un message ne doit pas créer un second fait ; une correction conserve son lien avec le fait initial. Ces exigences sont proposées pour FLOW ; elles ne sont pas toutes démontrées individuellement dans chaque produit étudié.

Nom de travail : **Accounting Event Provisioning**, fourniture des faits pour la comptabilité. Définition candidate : « Préparer et transmettre les faits de gestion attendus par la comptabilité, selon un contrat convenu avec Finance, avec leurs justificatifs, corrections et suivi de prise en charge. » Le nom est une proposition locale, sans consensus lexical démontré. « Accounting Event Selection » ne couvrirait que la sélection ; « Accounting Interpretation » porterait une autre responsabilité, celle de traduire en écritures.

## Couverture du modèle courant

État comparé : YAML du backlog lu le 28 septembre 2026, version déclarée 2026-09-13.3 ; cette valeur ne remplace pas la date d’inspection. Champs name, definition et scope consultés pour les objets ci-dessous.

| Objet existant | Ce qu’il couvre | Frontière constatée |
| --- | --- | --- |
| Inventory Tracking — D01.f | Intégration des faits de stock et corrections | Entrée opérationnelle, pas préparation vers Finance explicitée |
| Inventory Ledger — D01.g | Registre des mouvements et états reconnus | Exclut valorisation et comptabilité générale ; fournit des faits possibles |
| Inventory Ownership Ledger — inventory-ownership-ledger | Changements de propriétaire reconnus | Source utile même sans mouvement physique ; ne constitue pas un registre financier |
| Operations Tracking — D07.d | Faits et résultats de prestations | Intègre les résultats ; ne porte pas explicitement leur alimentation comptable |
| Billing Order — service-order-billing | Demande et suivi de facturation | Ne couvre pas l’ensemble des faits de stock ou de propriété |
| Payment Collection Order — service-order-payment-collection | Demande et suivi d’encaissement | Ne couvre pas l’ensemble des faits comptabilisables |
| Finance Ingestion — master-data-ingestion-finance | Références reçues depuis Finance | Sens inverse de l’alimentation envisagée |

Constat : une responsabilité de sortie vers la comptabilité n’est pas explicite dans les périmètres examinés. Il s’agit d’un manque de couverture descriptive possible, pas d’une preuve d’absence dans les SI installés. Finance reste une vue de contexte dans Enterprise Management & Control ; sa décomposition n’est pas présumée.

Le glossaire métier a été examiné sur les occurrences comptables et les noms apparentés : il distingue le registre de stock du grand livre financier, sans entrée dédiée identifiée pour l’interpréteur ou l’alimentation comptable. Aucun sens canonique n’est changé par cette étude. Une adoption devra définir et aligner ces notions dans le modèle et le glossaire au sein du même lot.

## Cas pour éprouver le besoin et choix restant

Cas fictifs proposés, sans constat Beaumanoir ni règle comptable locale présumée :

- Déplacer 20 pièces d’un emplacement à un autre : fait opérationnel certain ; effet comptable dépendant du périmètre financier, comme l’illustre ELM847. Leur éventuelle transmission à des fins de rapprochement reste à convenir.
- Reconnaître un transfert de propriété de 20 pièces sans déplacement : fournir le fait de propriété et ses conditions, sans fabriquer une sortie physique. Finance décide du traitement applicable.
- Corriger une réception de 100 à 80 : transmettre une correction reliée au fait initial ; ne pas renvoyer 80 comme réception supplémentaire. Finance reste responsable des écritures correctives.
- Recevoir deux fois le même résultat de prestation : conserver un seul fait, rendre les reprises techniques identifiables.

Recommandation : retenir le besoin comme candidat sérieux, d’abord à la frontière de Supply Chain Orchestration et Finance. Le résultat attendu dépasse un simple transport de messages si sélection, complétude et preuve de prise en charge forment un engagement métier propre. S’il ne s’agit que d’un filtre technique sans responsabilité autonome, un contrat d’échange et les capacités existantes peuvent suffire.

Le parent précis reste à décider après qualification des faits : Inventory Management serait trop étroit si prestations, facturation ou encaissement sont inclus ; Service Order Management ne convient que si une prestation explicitement demandée est effectivement portée. Ne pas créer un sous-domaine générique d’intégration pour résoudre ce seul placement.

Point déterminant pour la suite : quels faits attend Finance, de quel domaine chacun fait-il autorité, et jusqu’à quel résultat le domaine émetteur s’engage-t-il ? La valorisation, les référentiels comptables, les délais de prise en charge et les règles de correction restent à préciser avec Finance. Aucune création, décomposition en comportements ni publication à ce stade.
## Précision U816 — alimentation et interprétation

Le 28 septembre 2026, Laurent propose explicitement une capacité de réception et transformation des faits dans Finance et conteste le mot Event. Accounting Event Provisioning reste la piste historique U813 ; elle n’est plus le nom recommandé. Aucun changement canonique effectué.

Finance Ingestion est actuellement un **Behavior de Master Data Ingestion**, dans Master Data du domaine Supply Chain Orchestration. Il distingue les références fournies par Finance : identité, validité et corrections. Il ne reçoit pas les faits de gestion pour la comptabilité. Les références réellement fournies et leurs contrats demeurent à qualifier ; aucun exemple de flux installé ne peut être affirmé. Son nom isolé est ambigu ; « Reference Ingestion from Finance » serait une clarification descriptive à discuter, sans renommage appliqué.

Proposition lexicale révisée : **Accounting Data Provision**, en français « Alimentation comptable », côté domaine opérationnel ; **Accounting Interpretation**, « Interprétation comptable », côté Finance. Le premier fournit les faits nécessaires selon le contrat convenu ; le second reçoit et contrôle ces faits, les met en forme si nécessaire et les traduit en écritures proposées selon les règles comptables. L’enregistrement effectif des écritures demeure une responsabilité distincte. Ici Data désigne les faits de gestion et leurs justificatifs, pas un flux de référentiels ni des écritures nécessairement préconstituées.

Ces noms anglais sont des propositions FLOW, sans nomenclature commune démontrée. Les sources ELM847–ELM852 restent applicables : Dynamics distingue les distributions comptables et le transfert ultérieur, SAP documente la détermination des comptes, Axway annonce transformation par règles et maîtrise des flux. Elles soutiennent les responsabilités, sans imposer deux capacités autonomes ni leur implantation technique. L’ingestion et la normalisation peuvent faire partie de la capacité Finance sans créer un nœud pour chaque étape. La capacité doit conserver les rejets, corrections et liens entre faits et écritures ; ce périmètre détaillé reste recommandé, non adopté.

Exemple fictif : le domaine opérationnel fournit une réception reconnue de 80 pièces avec commande, entité, date et justificatif ; Finance contrôle les données, détermine le traitement et produit les écritures selon ses règles. Une insuffisance de données conduit à une attente ou un rejet motivé, pas à l’invention d’un montant. Cet exemple ne présume ni valorisation disponible ni règle comptable Beaumanoir.

La frontière est la responsabilité des faits d’un côté, celle de leur traduction comptable de l’autre. L’interpréteur appartient fonctionnellement à Finance même s’il est installé hors du progiciel comptable. Les glossaires et le modèle restent inchangés pendant cette discussion ; leur alignement sera requis dans le lot d’adoption.

## Application U826

Le lot est appliqué au backlog : Integration dans Supply Chain Orchestration, deux ingestions dans Inbound, Accounting Data Provision, Planning Data Provision et Product Feedback dans Outbound. Les Tracking conservent leurs parents. Accounting Interpretation figure dans Finance / Financial Accounting, contexte ciblé dont les compléments restent proposés. Les glossaires et descriptions concernées sont alignés ; les étapes exploratoires ci-dessus ne constituent plus l’état courant. Aucun snapshot publié modifié. Déclaration de livraison : `modeles/backlog/integration-review-U823.yaml`.
