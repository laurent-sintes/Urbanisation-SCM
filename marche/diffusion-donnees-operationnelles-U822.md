# Diffusion des données opérationnelles — U822

Analyse Codex du 28 septembre 2026. Hypothèse proposée, sans modification canonique ni extension de l’accord U818. Contribution : [U822](../connaissance/01-contributions-utilisateur.md#u822). Correspondance CMP311, sources ELM853–ELM857 ; réemploi des appuis comptables ELM847–ELM852 de l’étude U813.

## Résultat de l’analyse

La proposition de Laurent donne au regroupement une finalité plus large et plus cohérente que le seul hébergement d’Accounting Data Provision : fournir aux autres domaines une information opérationnelle utilisable, selon leurs besoins et les engagements convenus. Elle résout la difficulté du rattachement aux commandes, car stock, propriété et résultats de prestations peuvent tous contribuer.

Recommandation : envisager un sous-domaine **Operational Data Sharing**, « Partage des données opérationnelles », sous Supply Chain Orchestration. Le nom est une proposition FLOW, sans équivalence ni consensus de marché démontré. **Outbound Integration** reste possible si FLOW souhaite un libellé architectural ; il décrit surtout une direction technique et peut être confondu avec la logistique sortante. Data Sharing couvre transmission et mise à disposition pour consultation, sans imposer un mécanisme de diffusion.

Définition proposée : « Fournir aux autres domaines les données opérationnelles dont ils ont besoin, avec leur sens, leur provenance, leurs dates, leurs corrections et les engagements de mise à disposition convenus. »

La présence de trois destinataires ne prouve pas à elle seule trois capacités. Les distinguer par résultat métier, règles de sélection, granularité, fraîcheur et traitement des corrections, pas par interface ou logiciel. Le regroupement est justifié si l’entreprise assume ces engagements comme une responsabilité durable. Une simple mutualisation de transports de messages relèverait de l’architecture technique.

## Ce que le marché étaye

Toutes les sources ont été consultées le 28 septembre 2026. Les formulations suivantes sont des synthèses originales. Aucun identifiant natif de capacité n’est établi. Conservation de liens et synthèses, sans reproduction intégrale ni licence de réutilisation supposée.

| Élément | Source primaire et passage | Appui et limite |
| --- | --- | --- |
| ELM853 / MKT14 | [Dynamics 365 Demand planning home page](https://learn.microsoft.com/en-us/dynamics365/supply-chain/demand-planning/demand-planning-home-page), The demand planning process ; page évolutive, mise à jour 2026-07-01 | Données historiques et références importées, transformations puis prévisions exportées. Appui à la boucle opérations / planification ; lecture côté destinataire, pas sous-domaine sortant indépendant. |
| ELM854 / MKT13 | [SAP S/4HANA Supply Chain Integration Add-On for SAP IBP — Administrator’s Guide](https://help.sap.com/doc/227fcaf7918e45378f8cb20a45ffe6a2/1.0%20SP19/en-US/loioc5148f2152294904ac379b94cb902e59.pdf), édition 1.0 SP19, Configuration for Order-Based Planning Integration, pages 33–35, SAVE_ORDER / SAVE_STOCK | Intégration de commandes et stocks, charges initiales et modifications. Appui S/4HANA explicite ; guide d’une édition déterminée, sans affirmation de nouveauté ni prescription FLOW. |
| ELM855 / MKT14 | [Dynamics 365 — Manage changes to engineering products](https://learn.microsoft.com/en-us/dynamics365/supply-chain/engineering-change-management/engineering-change-management), Engineering change requests ; documentation évolutive, édition globale inconnue | Les services opérationnels peuvent signaler un problème ou demander une amélioration produit. Appui à la remontée de retour terrain, pas preuve d’un export automatique vers un PLM externe. |
| ELM856 / MKT13 | [Administration Guide for PLM System Integration for SAP S/4HANA](https://help.sap.com/doc/6f4e849a041c4bc59c4b9d6882053532/2.0%20FP03/en-US/Administration_Guide_TC.pdf), 2.0 FP03, document 1.0 du 2022-12-05, §7.3 p.60 et §9.3.1.3 p.82 | Un problème issu de fabrication/logistique est transmis au PLM, qui l’examine et peut engager un changement. Appui explicite au sens opérations vers développement ; périmètre industriel, pas couverture démontrée du PLM textile Beaumanoir. |
| ELM857 / MKT14 | [Dynamics 365 — Business events overview](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/business-events/home-page), introduction et Important ; documentation évolutive | Les notifications vers d’autres systèmes sont distinguées de l’export de données volumineuses. Appui technique à la pluralité des réalisations ; ne définit pas un sous-domaine métier. |

Les responsabilités comptables restent appuyées par Dynamics Accounting distributions et Inventory posting, SAP Goods Movements et Automatic Account Determination, complétés par Axway : [étude U813](faits-gestion-comptabilite-U813.md). Les frontières produit ne sont pas copiées dans FLOW.

Accès : les pages SAP Help HTML identifiées sur l’intégration IBP et les processus PLM n’ont pas livré de corps en lecture directe ; des extraits indexés ont orienté la recherche, puis les guides PDF officiels ont fourni les passages. Le rendu image de la page PLM a échoué ; son texte §7.3 a été lu, aucun détail graphique n’est utilisé. Les pages Microsoft restaient lisibles malgré un bandeau d’autorisation. Aucune démonstration connectée ni implantation locale vérifiée.

Le marché étaye donc les trois familles de coopération. Les sources ne prouvent pas une taxonomie native réunissant ces familles dans un même sous-domaine Outbound Integration. Ce regroupement est une recommandation motivée par la cohérence FLOW, pas une conformité proclamée au marché.

## Trois capacités candidates par finalité

| Capacité | Données et résultat attendus, à qualifier | Responsabilité conservée chez le destinataire |
| --- | --- | --- |
| **Accounting Data Provision** — nom et principe déjà validés U818 | Fournir faits sélectionnés, références et corrections nécessaires à la comptabilité ; suivre leur prise en charge | Accounting Interpretation reçoit et traduit en écritures dans Finance ; enregistrement comptable distinct |
| **Planning Data Provision** — nouvelle proposition | Fournir historiques, positions de stock, commandes ouvertes et réalisations utiles au calcul des plans ; distinguer données constatées et engagements | Demand & Supply Planning élabore ses plans ; leur retour est reçu par Plan Ingestion |
| **Product Feedback** — nouvelle proposition | Fournir constats terrain documentés sur les produits, avec contexte et preuves, pour instruire leur amélioration | Le domaine de conception instruit et décide les modifications ; le PLM peut le servir |

Les noms nouveaux sont locaux. Product Feedback convient au retour terrain ; si le besoin est plutôt l’échange de nomenclatures, fournisseurs, coûts ou données industrielles, son périmètre et son nom devront être revus. Ne pas lui attribuer tous les échanges PLM. Les historiques de ventes, qualité et autres données ne sont diffusés que si Supply en possède une connaissance légitime : ne pas aspirer toutes les données d’entreprise sous prétexte qu’un consommateur les attend.

Le critère de séparation est métier : pièce justifiée et correction suivie pour Finance ; données datées exploitables en calcul de plan ; signalement contextualisé pour amélioration produit. Si les contrats réels ne montrent aucune différence substantielle, une capacité commune et des variantes peuvent suffire. Aucun comportement supplémentaire ni découpage automatique par application n’est proposé.

## Responsabilités et frontières

Les registres, commandes et capacités d’intégration existants restent responsables des faits reconnus. Le partage sélectionne, assemble et restitue les données utiles, en conservant le sens et l’autorité des sources. Il ne tient pas un second registre de stock ou de propriété. Il peut préparer des agrégats convenus, à condition de conserver période, granularité et origine.

Le contrat à convenir avec chaque destinataire décrit le contenu, la population couverte, la date du fait et de connaissance, la fraîcheur, les corrections et annulations, les conditions d’accès et le résultat attendu de la mise à disposition. Une correction de 100 à 80 doit rester identifiable pour tous les consommateurs concernés ; chacun applique ensuite ses propres règles. « Publié », « reçu » et « exploité avec succès » sont distincts. Un acquittement de comptabilisation n’est pas exigé d’un simple lecteur d’historique.

Exemple fictif : une réception corrigée de 100 à 80 alimente Finance par un fait correctif et la planification par une position révisée. Un défaut constaté sur certaines pièces peut en outre alimenter un dossier d’amélioration produit, s’il existe un besoin documenté. Le même fait n’est pas envoyé indistinctement à tous les destinataires ; son utilisation dépend du contrat.

L’interprétation comptable, le calcul des prévisions et la décision de modification produit restent externes. Les commandes adressées aux exécutants et l’orchestration de prestations restent hors de ce sous-domaine : toute sortie technique n’est pas un partage de données. Les référentiels entrants restent dans Master Data Ingestion ; les plans entrants dans Plan Ingestion. Aucune symétrie artificielle Inbound/Outbound ni déplacement général des Tracking n’est nécessaire.

## Effet sur les choix précédents

U822 élargit le problème au-delà du seul cas comptable. L’objection à un regroupement créé pour une unique capacité ne s’applique plus de la même manière : les trois finalités peuvent justifier une responsabilité commune. Cela ne constitue pas encore l’adoption du sous-domaine ni des deux capacités supplémentaires.

Le backlog reste canonique et inchangé par cette analyse. Reference Ingestion from Finance a été renommé sous U818 ; les ajouts Accounting Data Provision et Accounting Interpretation attendent toujours leurs parents définitifs dans l’annexe U818. Leur rattachement au sous-domaine proposé pourra être appliqué après arbitrage ; aucune extension automatique de l’accord.

Dans le modèle courant, Design & Development est un Business System de contexte. Le PLM est une famille de solutions au service du développement produit, pas un Domain. Le retour proposé doit viser la responsabilité métier correspondante sans décomposer maintenant toute cette vue. Finance et Demand & Supply Planning ne reçoivent pas non plus de nouvelles capacités détaillées par cette seule étude.
## Extension U823 — Integration, catégories Inbound et Outbound

Proposition de Laurent, examinée le 28 septembre 2026, sans déplacement canonique. Le périmètre devient l’échange métier à la frontière de Supply Chain Orchestration dans les deux sens. Inbound et Outbound sont des catégories de présentation, pas des sous-domaines ni des parents de capacités.

L’inspection du YAML courant identifie exactement quatre capacités portant nature: integration : Master Data Ingestion (master-data-ingestion) dans Master Data ; Plan Ingestion (plans-ingestion) dans Plan Visibility ; Inventory Tracking (D01.f) dans Inventory Management ; Operations Tracking (D07.d) dans Fulfilment Orchestration. Leurs définitions couvrent réception, reconnaissance et rapprochement des apports, à distinguer des registres et de la restitution. Les Tracking sont donc des candidats à Inbound malgré leur nom, sous réserve d’adoption explicite du déplacement.

Recommandation : un sous-domaine **Integration**, défini par « Recevoir et rendre utilisables les apports des autres domaines, et leur fournir les données opérationnelles attendues, selon des contrats métier explicites. » Catégorie Inbound : les quatre capacités existantes, conservant leurs identités et noms ; catégorie Outbound : Accounting Data Provision, Planning Data Provision et Product Feedback, avec les réserves et portées U818/U822. Les comportements actuels de Master Data Ingestion restent sous leur capacité. Accounting Interpretation appartient à Finance ; il n’entre pas dans Inbound de Supply.

Les catégories sont relatives à Supply Chain Orchestration. Un même échange est sortant pour Supply et entrant pour Finance. Les relations internes qui alimentent un registre ou une vue ne changent pas de domaine ; elles deviennent des coopérations explicites entre sous-domaines. Les sorties vers exécutants qui demandent une action continuent à relever des ordres et de l’orchestration. Le mot Broadcast n’est pas recommandé comme libellé commun : il présume une diffusion, alors que les besoins incluent une fourniture ciblée ou une consultation. Aucun mécanisme technique n’est imposé.

Master Data conserve ses références locales et leurs vues ; Inventory Management conserve les registres de stock et de propriété, ainsi que les décisions et restitutions ; Fulfilment Orchestration conserve coordination, décisions et visibilité des opérations ; Plan Visibility conserve les vues de plans. Le déplacement d’une capacité d’intégration ne transfère ni l’autorité des sources ni les décisions métier aux intégrateurs.

Bénéfice : rendre visibles les engagements d’échange, la sélection, les contrôles, la provenance, les corrections et les rejets ; éviter de répéter cette responsabilité sous chaque sujet. Compromis : la chaîne de compréhension ingestion → registre → vue traverse plusieurs sous-domaines et doit rester lisible par les relations et scénarios. Le regroupement est pertinent comme responsabilité métier durable, pas seulement pour alléger l’arbre ou centraliser une équipe ou une plateforme technique.

Réemploi des sources ELM847–ELM857 consultées dans cette session. Dynamics Demand planning documente entrée de données et sortie de prévisions ; SAP documente les échanges S/4HANA–IBP et opérations–PLM ; Microsoft distingue notifications et export. Les approches attestent des échanges et de contrats spécifiques, pas d’une taxonomie métier unique Integration → Inbound/Outbound. Le nom et la structure sont des choix FLOW proposés ; leur défense repose sur la cohérence du modèle et la responsabilité commune. Aucun nouveau consensus allégué ni équivalence de capacités.

Si ce regroupement est adopté, appliquer les quatre déplacements et les catégories, aligner descriptions et glossaire, et réexaminer les accords affectés par le changement de contexte. Conserver les accords historiques ; ne pas transposer automatiquement leur contexte. Les nouveaux parents des capacités comptables restent à appliquer dans le lot U818, sans considérer U823 comme une validation implicite.

## Frontière est-ouest — U824

Laurent précise qu’Integration porte les échanges entre Supply Chain Orchestration et les autres domaines. Les interactions nord-sud avec les exécutants restent dans les capacités qui les pilotent. Cette précision corrige la recommandation précédente de déplacer les quatre capacités typées Integration sans examen de leurs flux : Master Data Ingestion et Plan Ingestion sont des candidats directs ; Inventory Tracking et Operations Tracking doivent être examinés selon leur responsabilité effective. Un retour de réception ou de réalisation lié à une prestation ne devient pas est-ouest parce qu’il entre dans une application ou traverse une interface. Les noms de logiciels et leur séparation physique ne décident pas de la frontière. Les accords de périmètre sont conservés ; aucun déplacement canonique réalisé.

## Application U826

Le lot est appliqué au backlog : Integration dans Supply Chain Orchestration, deux ingestions dans Inbound, Accounting Data Provision, Planning Data Provision et Product Feedback dans Outbound. Les Tracking conservent leurs parents. Accounting Interpretation figure dans Finance / Financial Accounting, contexte ciblé dont les compléments restent proposés. Les glossaires et descriptions concernées sont alignés ; les étapes exploratoires ci-dessus ne constituent plus l’état courant. Aucun snapshot publié modifié. Déclaration de livraison : `modeles/backlog/integration-review-U823.yaml`.
