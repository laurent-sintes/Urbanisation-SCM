# Noms des domaines Plan et Logistics — U798

**Décision U801 :** Laurent retient **Demand & Supply Planning** et **Logistics**, à la suite des précisions U799–U800. Noms et références appliqués au backlog et au glossaire dans [le lot U801](../modeles/backlog/domain-names-U801.yaml). Identifiants et ordre conservés ; aucun transfert des décisions du Matching. La lecture 1PL qualifie la réalisation étudiée, sans présumer de fonctionnement installé. Les propositions ci-dessous conservent le contexte de la discussion, sans réactiver les noms remplacés.

Consultation : 27 septembre 2026. Discussion et recommandations ; aucun renommage approuvé ou appliqué. Demande : [U798](../connaissance/01-contributions-utilisateur.md#u798).

## Constat dans FLOW

Le backlog et le display_index de la publication 2026-09-27.3 placent déjà Plan immédiatement avant Supply Chain Orchestration : Sourcing and Procurement, Sales, Plan, Supply Chain Orchestration, Logistics Execution. Aucun changement d’ordre nécessaire.

Plan élabore les plans prévisionnels externes à l’orchestration. Le Matching et ses décisions de planification restent dans l’orchestration. Logistics Execution réalise les prestations et organise les opérations internes des exécutants ; l’orchestration porte notamment coordination des prestations, engagements, choix de services et plan de transport confié. Les termes TER111 et TER110 portent ces mêmes frontières ; aucun désalignement à corriger avant choix de nom.

## Références primaires consultées

| Source | Appui | Limite pour FLOW |
| --- | --- | --- |
| [Microsoft Dynamics 365 SCM — Master planning](https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/master-planning-home-page), sections plans statiques/dynamiques et forecast planning | Planification des besoins de matières et capacités, prévisions et approvisionnements. | Le module contient des calculs que FLOW distribue entre domaine prévisionnel et Matching. Ni équivalence au domaine Plan ni frontière universelle par horizon. |
| [SAP S/4HANA — Execute Supply Chain Planning](https://learning.sap.com/courses/exploring-production-planning-in-sap-s-4hana/execute-supply-chain-planning), séquence et Demand Management / MRP | Usage explicite de Supply Chain Planning ; articulation besoins prévisionnels, demande réelle et planification des besoins. | Contexte industriel plus large ; pas une preuve de décomposition identique aux domaines FLOW. |
| [Microsoft Dynamics 365 SCM — Transportation management overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/transportation/transportation-management-overview), Planning transportation | La gestion du transport comprend de la planification depuis commandes ou expéditions. | Le périmètre produit traverse les frontières FLOW ; un TMS ne se rattache pas automatiquement à un seul domaine. |
| [SAP S/4HANA — Applying Planning and Execution in Transportation Management](https://learning.sap.com/courses/planning-and-execution-in-sap-s-4hana-transportation-management), programme | Planification interactive/automatique, sous-traitance et exécution coexistent. | Exécution ne signifie pas absence de décisions locales ; ce cours n’établit pas le découpage FLOW. |
| [CSCMP — SCM Definitions and Glossary of Terms](https://cscmp.org/CSCMP/Educate/SCM_Definitions_and_Glossary_of_Terms.aspx), définition et frontières de Logistics Management | Logistique au sens large : planifier, mettre en œuvre et contrôler les flux et le stockage ; activités dépassant les gestes physiques. | Une définition professionnelle large, pas une nomenclature de domaines imposée à FLOW. |

L’ancienne URL CSCMP avec /Academia/ n’a pas été accessible ; la page correcte ci-dessus a été retrouvée. SAP Help, page TM sans paramètres, ne restituait pas le corps ; le cours primaire SAP S/4HANA ci-dessus fournit l’appui exploitable. Aucun consensus interéditeurs ou déploiement Beaumanoir déduit.

## Avis proposé

Préférer **Supply Chain Planning** à Plan : nom du savoir-faire et de son objet, plus explicite. Définition courte proposée : « Élaborer et réviser les plans prévisionnels de demande et de ressources qui orientent les décisions opérationnelles. » Demand & Supply Planning constitue une alternative plus descriptive du périmètre courant. Advanced Planning nommerait une sophistication ou une famille de solutions, et Master Planning entrerait en collision avec la capacité existante.

Conserver **Logistics Execution** au périmètre actuel : il distingue les prestations réalisées de leur orchestration. **Logistics** est plus simple et possible comme convention locale, mais son sens courant peut inclure planification, stock, choix des moyens et coordination déjà répartis ailleurs dans FLOW. Le raccourcissement devrait donc expliciter cette limite ; il ne faut pas transférer ces responsabilités tacitement. Les exécutants conservent leurs décisions et leur organisation locales : Execution ne veut pas dire exécution sans intelligence ni sans planification.

Les noms proposés ne sont pas appliqués au modèle ou au glossaire. L’ordre demandé est déjà satisfait.

## Précision U799 — demande et lecture 1PL

Laurent souhaite que le nom rende explicites les deux sorties Demand Plan et Supply Plan. Recommandation révisée : **Demand & Supply Planning**. Supply Chain Planning inclut bien la demande dans les usages documentés ; le changement proposé vise la lisibilité, pas la correction d’une exclusion de la demande. Complément primaire : [SAP — Supply chain planning](https://www.sap.com/products/scm/integrated-business-planning/what-is-supply-chain-planning.html), consulté le 27 septembre 2026. Les appuis Microsoft et SAP S/4HANA ci-dessus restent pertinents et ne prouvent pas une nomenclature universelle.

Pour Logistics, Laurent précise une lecture 1PL uniquement. [DHL — First Party Logistics](https://dhl-freight-connections.com/en/logistics-dictionary/first-party-logistics-1pl/) décrit des opérations assurées par les propres départements de l’entreprise sans externalisation ; [Maersk — 1PL, 2PL, 3PL and 4PL](https://www.maersk.com/de-de/logistics-explained/supply-chain-management/2024/04/24/navigate-the-world-of-party-logistics-with-our-guide-to-1pl-2pl-3pl-4pl-models) distingue également réalisation interne et recours aux prestataires. Pages retrouvées et passages consultés le 27 septembre 2026.

Le nom **Logistics** devient une proposition recevable avec une définition explicite des opérations et de leur pilotage local. Réserve méthodologique : 1PL indique qui réalise, pas une exclusion de la planification ou des décisions. Pour conserver l’indépendance du modèle vis-à-vis de l’organisation, recommander de documenter la lecture 1PL comme périmètre de réalisation étudié ; les capacités restent identifiables en cas d’externalisation. Les prestataires externes ne sont pas assimilés à une réalisation interne ni transférés au domaine sans arbitrage. Aucun fonctionnement 1PL installé chez Beaumanoir n’est déduit.

Discussion conservée sans renommage canonique : Demand & Supply Planning est proposé ; le sens et la frontière de Logistics sont explicités avant application.

## Référence SCOR — U800

[ASCM — SCOR Digital Standard](https://www.ascm.org/corporate-solutions/standards-tools/scor-ds/), rubrique Plan, et [modèle SCOR](https://scor.ascm.org/), consultés le 27 septembre 2026 : Plan est un processus de niveau 1 qui couvre les besoins, les ressources, leur équilibre et les actions face aux écarts pour Order, Source, Transform, Fulfill et Return. Le nom bref s’inscrit dans une nomenclature de processus ; il ne fournit pas à lui seul un nom explicite de domaine de capacités.

Demand & Supply Planning reste la recommandation de lisibilité pour FLOW. Le rapprochement avec SCOR Plan est partiel : le domaine externe alimente les plans prévisionnels, tandis que FLOW conserve certaines décisions de planification et d’arbitrage dans Matching. Supply Chain Planning n’exclut pas la demande ; préférer un nom mentionnant Demand répond à l’intention de lecture de Laurent, sans réinterpréter le vocabulaire du marché.
