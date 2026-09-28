# Revue globale de la proposition de méthode de transformation

28 septembre 2026 — demande U817, précision du public U821 — revue par Codex, avant refonte.

Périmètre : [proposition](proposition.md), [schéma d’ensemble](parcours-transformation.svg), [gouvernance](gouvernance-decisions.svg), leurs rendus PNG et les références consultées dans cette conversation. Les échanges comptables parallèles sont hors périmètre.

## Avis

**Le cadre est cohérent dans son intention et ne présente pas de contradiction majeure avec les références consultées. Il reste à compléter et à réorganiser avant de devenir une méthode pédagogique prête à intégrer dans Atlas.** Les lacunes concernent surtout l’organisation et l’adoption, la réalisation des bénéfices et la continuité opérationnelle. Les schémas sont propres et lisibles en grand format, mais ils ne rendent pas encore toutes les distinctions du texte avec la même précision.

La proposition a été enrichie au fil de la discussion. Cela explique les répétitions et la coexistence de plusieurs structures : six dimensions, cinq volets, quatre travaux de cible, trois repères de fondation et une gouvernance à deux rythmes. Chacune est explicable ; leur juxtaposition demande trop de décodage au lecteur.

Cette revue ne vaut ni conformité certifiée à un standard ni approbation des compléments proposés. Les recommandations ci-dessous ne sont pas encore appliquées au document ni aux SVG. Les rendus existants ont été examinés ; aucun build ou audit métier du catalogue n’est requis pour cette revue documentaire.

## Comparaison aux références

Les références sont complémentaires et de natures différentes : corps de connaissances, cadre d’architecture, approche de conception, pratiques produit, principes de travail, langage de représentation ou format documentaire. Leur combinaison FLOW est une adaptation argumentée, pas un standard commun à tous ces auteurs.

| Appui | Ce que la proposition reprend correctement | Écart ou limite à expliciter |
| --- | --- | --- |
| **BIZBOK / Business Architecture Guild** [R1] | La carte des capacités appartient à une architecture métier qui mobilise plusieurs vues. | L’organisation et les informations sont trop discrètes dans le schéma d’ensemble. La hiérarchie FLOW et les comportements restent locaux ; les contenus complets du guide n’ont pas été audités. |
| **TOGAF / The Open Group** [R2, R10] | Architecture d’entreprise transverse, cohérence, cible, transitions et gouvernance. L’itération est compatible avec ce cadre. | Mieux montrer le suivi des exigences et des conséquences des décisions, puis l’entretien de l’architecture. Une fonction de cohérence ne constitue pas à elle seule tout le pilotage de transformation. |
| **DDD / Eric Evans** [R3] | Compréhension du langage, modèles logiciels délimités, conception détaillée lorsqu’elle est utile. | Maintenir la distinction entre domaine FLOW, contexte logiciel, produit, équipe et composant déployé. Aucun passage automatique de la carte au logiciel. |
| **Démarche produit / SVPG** [R4, R5] | Problèmes et résultats, essais, réalisation et apprentissage continus. | Donner davantage de place aux utilisateurs réels, à la responsabilité durable du produit et à la mesure des effets ; les sponsors ne représentent pas tous les usages. |
| **Agile et ADR** [R8, R9] | Collaboration fréquente, options discutées, décisions tracées progressivement. | Une revue doit produire un apprentissage ou préparer un choix. Une multiplication de réunions ou de fiches ne démontre pas l’agilité. L’ADR traite une décision d’architecture ; elle n’absorbe pas tous les arbitrages du programme. |
| **Management de programme / PMI** [R11] | Alignement stratégique et gouvernance cohérents avec les rôles proposés. | Les bénéfices, leur mesure et leur maintien après le programme doivent être plus explicites. Les intitulés Leader et Board restent des choix FLOW, sans équivalence normative établie. |
| **Conduite du changement / Prosci ADKAR** [R12] | L’adoption est bien nommée dans la proposition. | Elle mérite un travail continu sur compréhension, engagement, compétences, capacité effective et maintien du changement. ADKAR est un modèle du changement individuel ; son ajout n’équivaut pas à adopter toute la méthodologie Prosci. |
| **Fondations / Microsoft Well-Architected** [R7] | Expérimentation, collaboration technique et vérification avant mise en service. | Préserver l’équilibre avec les preuves métier, d’usage et d’adoption. Les trois repères F1–F3 sont une construction FLOW, indépendante d’un choix Azure. |
| **ArchiMate et BPMN** [R2, R6] | Appuis de représentation utiles selon la question traitée. | Les placer dans les ressources des chapitres concernés ; ils n’ont pas à occuper le premier plan du récit. Les SVG actuels n’utilisent pas leur notation formelle. |

Le choix d’examiner les dimensions ensemble n’est donc pas un écart flagrant au marché. Le risque serait de confondre simultanéité de l’instruction avec absence de dépendances : une mise en service exige bien des conditions préalables et certains engagements appellent des preuves plus fortes. La proposition le dit déjà ; la présentation doit préserver cette nuance.

## Compléments prioritaires

### A. Organisation, personnes et adoption dès le cadrage

**Constat :** organisation, pratiques et adoption sont mentionnées dans le texte, surtout dans la cible et la livraison. Elles ne constituent aucun des six blocs du schéma principal. Les acteurs affectés hors de l’équipe de cadrage restent peu visibles.

**Recommandation :** expliciter dès le cadrage les populations concernées, les changements de responsabilités et de pratiques, les compétences nécessaires, les freins et la capacité d’absorption du changement. Prévoir des essais des nouvelles façons de travailler et une mesure d’adoption. Le sponsoring actif et le rôle des managers locaux doivent apparaître, sans nouvelle instance imposée. L’adoption concerne aussi des transformations de pratiques sans nouveau logiciel.

**Effet :** traiter réellement la transformation du fonctionnement de l’entreprise, au-delà de la qualité des solutions. Appuis : BIZBOK sur l’organisation, Prosci sur le changement individuel ; détail opérationnel proposé pour FLOW.

### B. Des bénéfices dont quelqu’un suit la réalisation

**Constat :** résultats, indicateurs et bénéfices sont présents. La proposition n’explique pas suffisamment qui suit chaque bénéfice et comment il est vérifié dans la durée.

**Recommandation :** pour chaque résultat important, préciser un responsable métier, la situation de départ, l’indicateur, la cible, la source de mesure et l’horizon d’observation. Relier les résultats observés aux décisions de poursuite, d’adaptation ou d’arrêt. Une livraison, une utilisation effective et un bénéfice constaté sont trois faits différents.

**Effet :** le Board peut examiner les résultats attendus et obtenus autant que les arbitrages à venir. Appui PMI pour mesure et pérennisation ; les champs exacts restent une recommandation locale.

### C. Une trajectoire soutenable

**Constat :** financement, ressources, dépendances et risques sont cités, mais peu reliés aux choix de trajectoire.

**Recommandation :** expliciter dans les arbitrages la capacité réelle des équipes et des métiers, les initiatives concurrentes, les coûts de transition et de fonctionnement, les contraintes incontournables et les risques résiduels. Le niveau de détail dépend de la décision. Ces éléments peuvent tenir dans les supports existants ; aucun inventaire administratif complet n’est nécessaire pour démarrer.

**Effet :** éviter une feuille de route dont toutes les lignes sont utiles individuellement mais impossibles à mener ensemble. Recommandation de cohérence du modèle FLOW, confortée par les thèmes de ressources et de risques du document PMI consulté.

### D. Un relais explicite vers le fonctionnement durable

**Constat :** le texte prévoit la continuité de l’architecture d’entreprise et la vérification du service. Il précise moins les responsabilités pérennes après le programme.

**Recommandation :** identifier au moment utile qui porte le produit ou le service, les pratiques métier, l’exploitation, le suivi des bénéfices et l’entretien de l’architecture après la transformation. Définir les conditions de transfert et de stabilisation ainsi que le traitement des difficultés restantes.

**Effet :** la cohérence durable est soutenue par des personnes et des pratiques identifiables. Appui PMI sur la transition vers les opérations ; articulation des responsabilités proposée pour FLOW.

Ces quatre compléments demandent surtout de rendre opératoires des intentions déjà présentes. Le mandat imparfait reste un contexte accepté par Laurent, pas un motif de bloquer la rédaction ou d’inventer une délégation. Pour chaque décision réelle, l’autorité compétente doit être identifiable.

## Cohérence éditoriale et récit

### Le public cible change la priorité pédagogique — U821

Laurent demande de se placer face à une équipe habituée au delivery et à la cascade, peu familière du cadrage de transformation et de l’agile. Le guide doit donc rendre le travail concret avant d’introduire les cadres et leur vocabulaire. **La priorité est d’apprendre à préparer une décision quand le problème, la solution et les conséquences restent partiellement inconnus.**

Les acquis de réalisation restent utiles : échéances, engagements, dépendances, responsabilités, vérification et suivi. La méthode doit montrer comment les employer dans un travail où certaines hypothèses peuvent encore évoluer. Une fenêtre de cadrage limitée, des rendez-vous et des critères explicites de décision donnent un cadre sans prétendre que tout est connu dès le départ.

| Repère familier | Traduction proposée pour un cycle de cadrage |
| --- | --- |
| Un objectif de travail | Une question à éclaircir ou une décision à préparer, reliée à un résultat métier. |
| Des tâches et des responsables | Des investigations métier, produit, organisation et technologie coordonnées ; chaque question a un porteur. |
| Un livrable | Une représentation ou une preuve utile : scénario, comparaison d’options, observation d’usage, essai technique, impacts organisationnels. |
| Une revue d’avancement | Ce qui a été appris, les options écartées ou conservées, les inconnues restantes et la décision demandée. |
| Un jalon | Une date utile d’arbitrage et les preuves nécessaires ; une décision peut être limitée, conditionnelle ou reportée avec une raison. |
| Un suivi des changements | Une hypothèse révisée et ses conséquences tracées ; les décisions réellement engagées restent soumises à leur gouvernance. |

**Exemple pédagogique, sans fait Beaumanoir ni cible adoptée : réduire une double saisie.** Un premier cycle court pourrait confronter le récit de l’utilisateur, l’origine et la qualité des informations, les responsabilités des équipes et les possibilités d’échange entre outils. Une observation du travail et un essai ciblé permettraient de comparer une modification de pratique, une configuration et une intégration. La revue présenterait ce qui a été démontré, les impacts des options, les risques ouverts et le choix à instruire ensuite. Le cycle suivant traiterait la question prioritaire issue de cette revue ; ce ne serait pas une phase réservée à une seule expertise.

Une cadence d’une ou deux semaines peut servir d’illustration, sans devenir une prescription Scrum. Le résultat attendu d’un cycle est une progression vérifiable de la compréhension ou de la décision. Selon le sujet, cette progression peut nécessiter un essai logiciel, une simulation, un atelier ou une observation ; la production de code n’est pas un critère universel du cadrage.

Le guide devrait montrer **un cycle complet sur ce même exemple**, avec un support de départ et son résultat : question → travaux conjoints → preuve → revue → décision ou prochaine question. Les répétitions affinent le même dossier. Un encart préciserait ce qui est déjà décidé, ce qui reste ouvert et ce qui doit être vérifié avant un engagement.

Pour ce public, quatre aides légères suffisent au départ : une fiche de question, une comparaison d’options, un support de revue et une fiche de décision. Les ADR deviennent une spécialisation de cette dernière pour les décisions d’architecture. Les références externes, la grille complète de rôles et les détails des fondations arrivent au moment où ils répondent à une question rencontrée dans l’exemple.

**Conséquence pour les SVG :** la vue d’ensemble doit d’abord rendre compréhensible ce cycle concret et ses échanges multidisciplinaires. Les six dimensions servent de questions à se poser ; elles ne doivent pas ressembler à six lots à confier séparément. Éviter que les repères F1–F3 soient lus comme trois validations globales ouvrant des phases successives. Montrer leur portée par décision ou incrément avec des exemples de preuve.

Cette adaptation est une recommandation pédagogique FLOW fondée sur le public décrit par Laurent. Elle prolonge les appuis Agile, produit et ADR déjà consultés, sans affirmer qu’un cadre agile particulier serait universellement supérieur ni que le delivery serait nécessairement séquentiel.

### Le récit à conserver

« Une ambition devient une transformation effective quand une équipe confronte les dimensions du problème, éprouve des options, prépare des décisions, réalise les changements et observe leurs effets. L’architecture d’entreprise entretient la cohérence ; la gouvernance permet de décider au bon niveau. »

Cette formulation fournit le fil conducteur. Le lecteur peut ensuite distinguer quatre catégories : **ce qu’on examine ; comment on travaille ; qui contribue et décide ; quelles preuves permettent d’avancer.** Les cadres externes viennent expliquer les choix après cette compréhension initiale.

### Structure proposée pour Atlas

| Entrée de lecture | Question du lecteur | Contenu |
| --- | --- | --- |
| **Comprendre la démarche** | Comment transforme-t-on ensemble ? | Récit court, schéma d’ensemble, dimensions et collaboration. |
| **Explorer et concevoir** | Comment comprendre le métier et éprouver les options ? | Cartographie, scénarios, flux de valeur, informations, existant et cible, démarche produit et DDD. |
| **Préparer et prendre les décisions** | Qui décide, sur quoi et quand ? | Leader, Board, sponsors, architecture d’entreprise, revues, décisions locales, ADR et anticipation des COPIL. |
| **Organiser et réaliser les changements** | Comment avancer par incréments soutenables ? | Trajectoire, dépendances, fondations, moyens, migration, organisation et accompagnement. |
| **Mesurer et faire durer** | Comment sait-on que la transformation produit ses effets ? | Adoption, bénéfices, fonctionnement en service, ajustements et responsabilités pérennes. |

Ce sont des portes d’entrée, sans numérotation de phase ni obligation de lecture séquentielle. Chaque chapitre conserve la même forme : question concrète, travaux utiles, résultat ou preuve attendu, contributions, exemple et références. Un cas illustratif continu ferait mieux comprendre les liens entre carte, choix produit, contrainte technique et arbitrage que plusieurs exemples sans rapport.

Déplacer les nombreuses réserves, références U et précisions de provenance vers les détails de contribution. Maintenir visibles les limites qui aident vraiment le lecteur : proposition ou règle adoptée, portée de l’exemple, existence d’une preuve. Fusionner les deux tableaux de gouvernance qui décrivent aujourd’hui presque les mêmes fonctions.

### Dimensions : une mise au même niveau nécessaire

Les six blocs actuels mélangent des angles d’analyse avec un travail : « Existant et écarts » s’applique en réalité à toutes les dimensions. « Architecture des solutions » et « Fondations technologiques » sont fortement développées, tandis qu’organisation et informations ont moins de visibilité.

Une grille plus homogène pourrait être : **stratégie et valeur ; métier et capacités ; usages et produit ; organisation et compétences ; informations et données ; solutions et technologie.** Existant, cible, écarts et transitions deviennent des lectures transversales de chacune. Les applications, intégrations et fondations gardent leurs distinctions dans le détail du dernier volet. Cette grille est une recommandation éditoriale FLOW, pas une taxonomie imposée par BIZBOK ou TOGAF.

Métier, produit et organisation restent des vues qui se recouvrent ; elles ne forment ni une partition de l’entreprise ni une liste de chantiers indépendants. Sécurité, contraintes et risques traversent également les dimensions selon leur pertinence.

## Revue des SVG

### Schéma d’ensemble

**Réussites :** équipe centrale, doubles flèches, retour du terrain, technologie présente dès le cadrage, DDD positionné et texte accessible. Aucun chevauchement manifeste dans le rendu examiné.

**Corrections recommandées :**

1. **Redonner une place explicite à l’organisation et aux informations.** Le texte promet une cohérence métier–organisation–technologie que les six blocs ne montrent pas complètement.
2. **Alléger l’image principale.** Elle superpose dimensions, détail de cible, livraison, fondations, décisions et références. À une largeur d’environ 750 pixels, les textes de 18 à 25 pixels du SVG de 1600 pixels deviennent approximativement des caractères de 8 à 12 pixels : le grand format propre ne garantit pas la lecture dans une fiche Atlas.
3. **Retirer les codes 4A–4D de la vue d’accueil.** Sans le document, « volet 4 » n’a pas de contexte. Les quatre activités peuvent être conservées dans un zoom relié à des questions, avec des retours explicites, sans apparence de pipeline universel.
4. **Mettre les fondations au bon niveau de zoom.** Leur validation en trois portées est utile ; leur présence dominante sur la vue générale donne moins de poids à l’adoption, aux résultats métier et à leurs propres preuves.
5. **Montrer le périmètre transverse de l’architecture d’entreprise.** Son ajout dans le sous-titre est trop discret pour exprimer cette responsabilité ; une enveloppe ou un repère continu peut la relier aux dimensions sans représenter une autorité hiérarchique.
6. **Limiter les noms de cadres en première lecture.** Une légende courte et des références dans les explications suffisent. Les cadres ne sont pas affectés exclusivement à un bloc.

### Gouvernance

**Réussites :** rapprochement explicite Leader/direction de programme et Board/COPIL ; décisions locales préservées ; trois horizons de préparation simultanés ; anticipation liée à l’échéance utile ; architecture d’entreprise transverse.

**Corrections recommandées :**

1. La chaîne visuelle **équipe ↔ Leader ↔ Board** peut laisser croire que le Leader est le passage obligé de tous les échanges. Montrer aussi les échanges préparatoires des experts et du métier avec les sponsors, tout en gardant la coordination du Leader et l’autorité formelle d’arbitrage.
2. Le bandeau d’architecture d’entreprise placé au-dessus doit rester explicitement une contribution de cohérence, sans suggérer un niveau d’approbation supérieur au Board.
3. Préciser qu’un Board mensuel peut aussi examiner les résultats, les risques, les bénéfices et les réorientations. Le schéma actuel met surtout en avant les décisions structurantes à prendre.
4. Garder « trois COPIL » comme horizon proposé, ajustable. Ce n’est ni une prescription marché ni une obligation de faire passer chaque décision par trois séances.
5. Harmoniser les noms dans les deux vues : premier libellé bilingue ou accompagné de son équivalent existant, puis usage constant de Leader et Board. Le schéma général conserve encore seulement « direction de programme ».

### Découpage visuel conseillé

Conserver **deux SVG de synthèse**, plus un **zoom facultatif** :

- **Vue d’ensemble :** dimensions, équipe, produit continu, architecture d’entreprise, boucle d’apprentissage et effets attendus.
- **Gouvernance :** collaboration, décisions locales et structurantes, rythme du Board, anticipation des arbitrages et retours.
- **Zoom de travail :** cible, options, preuves, trajectoire et conditions de mise en service ; les fondations y trouvent leur détail.

Chaque vue doit pouvoir se comprendre seule. Les liens entre elles assurent le passage au détail. Pour l’interface, fournir une alternative textuelle, des liens accessibles au clavier et un format lisible à la largeur réelle du panneau ; le SVG doit rester une aide à la lecture.

## Limites et décisions de conception à préserver

- Transformation Leader et Transformation Board sont des intitulés proposés, pas des rôles officiellement équivalents à tous les référentiels de marché. Le rapprochement actuel avec les instances décrites par Laurent est cohérent à ce stade.
- Une architecture métier n’impose pas le découpage logiciel ; DDD, produit, organisation et capacité n’ont pas de correspondance un pour un.
- Les activités de compréhension, de conception et d’arbitrage sont itératives. Les dépendances opérationnelles et les conditions de mise en service demeurent réelles.
- Le glossaire méthodologique peut expliquer davantage de notions que le métamodèle n’en structure. Le guide doit rendre visible ce qui est effectivement représenté dans Atlas et ce qui relève encore de l’explication ou d’outils externes.
- Une extension pédagogique de la méthode ne publie pas de nouveaux objets, applications, personnes ou instances dans le catalogue métier. Les versions historiques conservent leurs définitions associées.
- L’absence de Scrum, SAFe ou d’un nouvel organe d’approbation ne constitue pas une lacune démontrée. Une petite sélection de références bien utilisées est suffisante pour le périmètre pédagogique visé.

## Recommandation de suite

Préparer une rédaction consolidée intégrant les quatre compléments, la structure par questions et les corrections visuelles. Réutiliser les contenus de cartographie existants. Maintenir distincts le texte explicatif, le vocabulaire et les objets du métamodèle. La refonte peut alors être instruite sur un contenu stabilisé, sans rouvrir le modèle métier ni attendre une définition exhaustive du mandat.

## Sources et portée de preuve

Les références R1–R9 et leurs passages déjà consultés le 28 septembre 2026 sont réutilisés depuis la section « Sources et périmètre de consultation » de [la proposition](proposition.md#sources-et-périmètre-de-consultation). Leurs limites restent valables : présentations publiques BIZBOK, sans lecture complète du guide ; articles explicatifs TOGAF, sans audit intégral du standard ; spécification BPMN seulement identifiée. Aucun label global de conformité n’est attribué.

Compléments consultés le 28 septembre 2026 :

- **R10 — The Open Group, [TOGAF Enterprise Architecture – Foundation vs. Practitioner Competency Comparison](https://help.opengroup.org/hc/en-us/articles/32127597178258-TOGAF-Enterprise-Architecture-Foundation-vs-Practitioner-Competency-Comparison).** Article mis à jour le 27 décembre 2025. Tableau : itération, architectures, migration, gestion du changement, exigences et gouvernance. Appui primaire sur les compétences et l’articulation du cadre, sans vérification exhaustive des prescriptions normatives.
- **R11 — PMI, [PgMP Examination Content Outline, March 2024](https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/pgmp-exam-content-outline.pdf?rev=67166f23d2794860865edbaeff922a59).** Publication PMI de mars 2024 ; alignement stratégique p. 7, cycle de programme p. 11–12, bénéfices et transition p. 13 examinés. Document public de certification, distinct du texte intégral du Standard for Program Management ; sert de repère de couverture, sans assimilation entre notre méthode et le standard. Résumés locaux, aucune table reproduite.
- **R12 — Prosci, [The Prosci ADKAR Model](https://www.prosci.com/methodology/adkar).** Page publique évolutive sans numéro d’édition ; FAQ sur les cinq éléments, changement individuel, distinction avec la méthodologie complète et pérennisation consultée. Appui primaire de l’auteur du modèle ; ne démontre ni supériorité universelle ni adoption de ses outils propriétaires par FLOW.

Les constats sur les fichiers et leur représentation sont issus de leur lecture et de l’inspection visuelle des rendus. Les propositions de six dimensions, de structure éditoriale et de responsabilités de suivi sont des recommandations de Codex, à discuter. La présente revue est documentaire et méthodologique ; aucune fiche métier comparée aux ERP n’est créée ou modifiée.
