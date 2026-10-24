# Audit du code Atlas et des libellés

Préconisations appliquées le 24 octobre 2026. Les constats ci-dessous décrivent le commit audité ; l’organisation livrée et les commandes de contrôle sont documentées dans [le guide technique Atlas](../README.md#textes-et-vocabulaire-de-lecture).

L’objectif « aucun libellé en dur dans le code » n’est pas atteint. Les textes d’interface sont dispersés dans les composants, des vocabulaires du métamodèle sont recopiés dans des dictionnaires TypeScript et certaines fonctions réécrivent les contenus publiés au moment de leur affichage.

La priorité est de rendre chaque texte à sa source : ressources éditoriales pour l’interface, publication sélectionnée pour le métier et le métamodèle, manifeste pour les documents. Une simple extraction des chaînes ne corrigerait pas les transformations de contenu ni les dépendances à des noms métier.

## Périmètre et preuves

Audit du 24 octobre 2026 sur le commit `1102b26c2043a5dc50de19ba2054ad818dd1bbec`. Il couvre le code de production Atlas : React et TypeScript, textes générés par les CSS, HTML initial et points de passage des messages du serveur local. Il porte sur les libellés et la dépendance du lecteur au contenu métier ; il ne constitue pas un audit complet de sécurité ou de performance.

La publication courante contrôlée est `2026-10-23.6` — v095. Son export a été résolu par `app/dist/data/index.json.current_version`, puis son empreinte a été comparée à l’entrée correspondante de cet index. Aucun complément du backlog n’a servi à interpréter ce snapshot.

| Mesure statique | Résultat | Lecture |
| --- | ---: | --- |
| Fichiers TypeScript et TSX analysés | 118 | Aucune erreur de parsing |
| Fichiers atteignables depuis le point d’entrée | 115 | Imports, exports et URL de workers |
| Fragments de texte directement dans le JSX atteignable | 671 | Un fragment n’est pas nécessairement un libellé complet |
| Attributs lecteur contenant directement une chaîne | 137 | Notamment titres, noms accessibles, textes alternatifs et placeholders |
| Autres emplacements candidats | 958 | Chaînes, gabarits et expressions à qualifier |
| Fichiers atteignables comportant des résultats | 81 | Textes directs et candidats confondus |
| Fichiers CSS examinés | 23 | Un mot généré en CSS : « Suivi » |

Les **808 emplacements directs** ne sont ni 808 libellés distincts, ni 808 anomalies fonctionnelles. Les 958 candidats supplémentaires comprennent des faux positifs techniques. L’atteignabilité d’un fichier ne prouve pas que toutes ses branches apparaissent dans chaque parcours.

Les résultats détaillés sont conservés dans [l’inventaire des emplacements](2026-10-24-code-libelles/inventaire.json), avec les empreintes des fichiers, et dans [les comparaisons de contenus publiés](2026-10-24-code-libelles/contenus-publies.json). Ces fichiers sont des preuves d’audit, sans autorité sur le modèle.

## Constats prioritaires

### 1 Les contenus publiés sont réécrits par le lecteur

**Priorité P1 — fidélité à la publication.**

[modelingGuide.ts](../src/modelingGuide.ts), fonction `lessonForPublication` à partir de la ligne 96, contient des substitutions de titres, deux réécritures de hiérarchie et un paragraphe imposé pour la leçon `meaningful-links`. Les substitutions comportent notamment `Commerce` vers `Sales / Sourcing and Procurement`, des identifiants métier particuliers et des noms de secours.

Un effet est confirmé sur la publication courante : le lecteur ajoute à la frontière de cette leçon la phrase **« Les rattachements suivent la publication affichée. »**, absente de sa valeur publiée. Le snapshot reste intact ; c’est le contenu affiché qui diffère.

[publicText.ts](../src/publicText.ts) contient aussi une liste de phrases éditoriales à supprimer, des substitutions liées à des contributions précises et le remplacement d’une question entière. Cette fonction intervient notamment sur les champs des fiches et les qualifications des relations via [businessContent.ts](../src/businessContent.ts), ainsi que sur des contextes de glossaire. [marketContent.ts](../src/marketContent.ts) ajoute d’autres traitements éditoriaux.

Sur les seuls champs examinés, `publicText` modifie **36 valeurs : 20 champs de nœuds et 16 contextes de termes**, hors simples espaces en bordure. Beaucoup de ces changements retirent des références de contribution ; ce nombre ne signifie donc pas 36 erreurs métier. Il démontre que le rendu dépend de règles rédactionnelles dans le programme.

**Correction proposée.** Séparer les contenus publics des notes de travail dans leurs sources. Si une projection publique est nécessaire, la préparer et la figer avec la publication, avec ses règles et ses empreintes. Le lecteur conserve uniquement les traitements techniques de rendu et de sécurité, sans supprimer ou remplacer des phrases selon leur formulation. Pour les anciennes éditions, conserver leur contenu et traiter explicitement la compatibilité de lecture ; aucune substitution par les textes du backlog courant.

Déplacer les phrases de `publicText` dans un fichier de traduction ne résoudrait pas ce problème d’autorité.

### 2 Le vocabulaire méthodologique est recopié dans le code

**Priorité P1 pour la source de vérité, P2 pour la migration des usages.**

| Emplacement | Texte ou dépendance codé en dur |
| --- | --- |
| [presentation.ts](../src/presentation.ts), `kindLabel` ligne 5 | Types de nœuds et composition des libellés de nature |
| [ModelLinks.tsx](../src/components/ModelLinks.tsx), ligne 242 | Correspondance de types à des noms anglais de termes |
| [capabilityTypes.ts](../src/capabilityTypes.ts), ligne 5 | Dix libellés de nature de capacité et valeur de secours |
| [behaviorTypes.ts](../src/behaviorTypes.ts), ligne 3 | Sept libellés de forme de comportement et valeur de secours |
| [requestMetadata.ts](../src/requestMetadata.ts) | Libellés et explications Frontoffice, Backoffice, déclenchement et activité |
| [BusinessSheet.tsx](../src/components/BusinessSheet.tsx), ligne 41 | Noms affichés des champs et repli possible sur leur clé brute |

La publication fournit déjà `metamodel.node_types`, avec les noms, définitions et références méthodologiques de huit types. Dans `MetaTypeLabel`, la définition peut venir de ce descripteur, mais le libellé continue à venir de `kindLabel`. Le lecteur dispose donc d’une bonne partie de la source sans l’utiliser pour tout le texte.

Les formes courtes et longues peuvent être utiles : `Behavior` et `Capability Behavior` ne sont pas nécessairement contradictoires. Elles doivent cependant être déclarées et reliées à une même clé, plutôt que maintenues séparément dans plusieurs tables.

**Correction proposée.** Résoudre les termes par identifiant ou clé stable dans le métamodèle associé à la publication. Réutiliser les descripteurs déjà exportés, puis compléter le contrat pour les noms courts, libellés de champs et natures manquants. Le glossaire figé expose déjà les valeurs françaises de `Capability Nature`, mais pas une table complète par clé technique ; les formes structurées présentes dans le backlog ne sont pas exposées comme telles dans le terme publié `Capability Behavior`. La migration exige donc aussi un contrat de données, pas seulement un changement d’appel côté React.

Les icônes peuvent rester dans un registre de composants ; leur clé d’association doit être distincte du libellé.

### 3 Une aide de lecture a déjà dérivé du modèle

**Priorité P2 — incohérence actuelle et visible.**

[ReadingHelp.tsx](../src/components/ReadingHelp.tsx), ligne 12, énumère six préfixes : `SYS`, `DOM`, `SUB`, `REF`, `CAP`, `BHV`. La publication courante utilise également **`UNI` et `BA`**, absents de l’explication.

Le `display_index` fournit les codes, mais pas encore une table de définitions des préfixes. Cette aide devrait être construite à partir des règles d’identification publiées et des types présents, avec des libellés issus du métamodèle associé.

La table de préfixes utilisée pour contrôler le format dans [displayCodes.ts](../src/displayCodes.ts) relève, elle, du contrat technique. Le besoin d’externaliser l’aide ne signifie pas supprimer les constantes de validation du protocole.

### 4 Les textes d’interface sont dispersés et parfois dupliqués

**Priorité P2 — maintenabilité et cohérence éditoriale.**

[App.tsx](../src/App.tsx), les composants de navigation, [ModelViewTabs.tsx](../src/components/ModelViewTabs.tsx), [sheetSections.ts](../src/sheetSections.ts) et les fiches contiennent directement titres, menus, actions, messages vides et aides. Les textes des attributs accessibles et des présentations mobiles suivent le même fonctionnement.

L’inventaire repère par exemple « Périmètre » à 14 emplacements, « Comportements » et « Scénarios métier » à 7, « Points chauds » à 6. Ces répétitions ne sont pas toutes des erreurs : un même mot peut désigner plusieurs fonctions et avoir besoin de clés distinctes.

Les statuts des points chauds sont également définis à plusieurs endroits, notamment [HotspotCatalogPage.tsx](../src/components/HotspotCatalogPage.tsx), [HotspotDetail.tsx](../src/components/HotspotDetail.tsx) et [HotspotDisplay.tsx](../src/components/HotspotDisplay.tsx). « Validé » et « Sujet validé » peuvent être des variantes utiles ; leur relation doit devenir explicite.

Enfin, [hotspots.css](../src/components/hotspots.css), ligne 425, génère le mot **« Suivi »**. Un texte sémantique ne doit pas être porté par le CSS : le composant doit fournir ce libellé depuis la même ressource que ses autres présentations.

**Correction proposée.** Créer des ressources françaises par périmètre d’interface, avec clés typées, variantes explicites et paramètres. Extraire les phrases complètes plutôt que des morceaux assemblés autour des nombres. Inclure les noms accessibles et les textes d’aide, sans allonger les tooltips. Cette organisation ne nécessite ni d’ajouter une langue ni d’adopter immédiatement une bibliothèque lourde.

### 5 Le HTML initial et les erreurs restent hors de toute ressource commune

**Priorité P2 — couvrir tous les chemins de lecture.**

[index.html](../index.html) contient le titre, la description, le chargement initial et le message sans JavaScript. Une extraction limitée au JSX laisserait ces textes en dur. Le [manifeste de l’application](../public/manifest.webmanifest) est déjà déclaratif, mais ses informations de marque sont répétées ailleurs.

Dans [server.py](../server.py), `_error` renvoie un texte français dans `error`. [workshop.ts](../src/workshop.ts), ligne 146, reprend ce texte dans l’erreur destinée au lecteur ou construit un message HTTP de secours.

**Correction proposée.** Générer le HTML initial depuis les ressources et la configuration de marque. Pour les échanges applicatifs, renvoyer un code d’erreur stable et ses paramètres, puis résoudre le message dans l’interface. Conserver les diagnostics techniques séparément. Cette évolution doit préserver les contrôles du serveur et prévoir la compatibilité du contrat pendant la transition.

### 6 Des données de contexte et de document sont des constantes TypeScript

**Priorité P2 — données éditoriales et métier mal placées.**

[applicationCatalog.ts](../src/applicationCatalog.ts), ligne 11, associe des identifiants aux quatre noms de SI, dont Boardriders et Sarenza. Le catalogue applicatif publié expose `products` et `selections`, sans descripteurs `contexts`. Il faut donc compléter la donnée versionnée pour faire disparaître cette table ; une clé de traduction ne suffit pas à assurer la fidélité historique des contextes.

[scmStudy.ts](../src/scmStudy.ts) regroupe déjà les informations du dossier SCM, ce qui limite leur dispersion. Mais titre, date, auteur, nombre de pages, description et rattachement métier restent dans du code. Ils peuvent dériver du PDF.

**Correction proposée.** Fournir les contextes depuis le catalogue associé à la publication et placer les métadonnées documentaires dans un manifeste lié à la source unique du PDF. Produire automatiquement les informations vérifiables, comme le nombre de pages. Préserver le statut actuel de l’étude SCM : un document courant, commun aux versions du modèle. Son import d’asset peut rester technique.

### 7 Certains choix de présentation dépendent de noms ou de nœuds particuliers

**Priorité P3 — indépendance du moteur de présentation.**

[icons.tsx](../src/icons.tsx), ligne 61 puis 181, choisit certaines icônes via `namedIcons[node.name]`. Des références sont aussi distinguées par `referenceParentName`. Un renommage peut ainsi modifier leur apparence sans décision explicite de présentation.

[flowMapLayout.ts](../src/flowMapLayout.ts), fonction `supplyNeighborhood` ligne 127, et [flowMapViewport.ts](../src/flowMapViewport.ts), ligne 110, contiennent des identifiants de périmètres SCM pour des dispositions et ancrages particuliers. Le placement prévoit un repli générique et traite volontairement des nœuds historiques : ce constat n’établit pas un défaut de la carte courante.

**Correction proposée.** Déclarer ces exceptions dans des profils de présentation associés aux éditions concernées : jetons d’icône, ordre et groupes de placement. Conserver les algorithmes génériques et le registre d’icônes dans le code. Les identifiants utilisés pour adresser un objet ou parcourir une relation restent parfaitement légitimes ; ce sont les règles particulières fondées sur leur valeur qui demandent une source explicite.

## Organisation cible des textes

La règle proposée est : **aucun texte destiné au lecteur dans les composants ou les fonctions de logique ; chaque texte est résolu depuis une source déclarée**.

| Contenu | Source attendue | Portée |
| --- | --- | --- |
| Noms, définitions, frontières, scénarios, principes et relations métier | Snapshot publié sélectionné | Édition consultée |
| Types, natures et vocabulaire méthodologique | Métamodèle et guide associés à cette édition | Édition consultée |
| Menus, boutons, messages, aides d’usage et accessibilité | Ressources d’interface à clés typées, par exemple `app/locales/fr/` | Version de l’application |
| Marque et métadonnées des documents | Manifestes déclaratifs près des sources | Portée déclarée de chaque document |
| Exceptions de placement et associations d’icônes | Profils de présentation explicites | Éditions concernées |

Les menus de l’application n’ont pas à devenir des objets métier. Les noms anglais canoniques des fiches ne doivent pas être retraduits par le dictionnaire de l’interface. Les clés techniques, routes, identifiants, sélecteurs, composants d’icônes et constantes de validation restent dans le code quand ils portent une fonction technique.

## Ordre de correction proposé

1. **Fidélité des contenus et vocabulaire publié.** Traiter les réécritures de leçons et de prose, exploiter les descripteurs du métamodèle et corriger l’aide aux codes. Qualifier les changements de source qui nécessitent une nouvelle publication.
2. **Ressources communes et parcours principal.** Mettre en place des clés typées et migrer navigation, recherche, onglets, titres et fiches, en conservant les formulations et les interactions existantes.
3. **Couverture des autres parcours.** Migrer points chauds, applications, scénarios, messages d’erreur, attributs accessibles, HTML initial et textes CSS. Ajouter les descripteurs de contextes et le manifeste documentaire.
4. **Profils de présentation et prévention.** Retirer les décisions fondées sur les noms, déclarer les exceptions de carte et empêcher l’introduction de nouveaux textes hors ressources.

L’extraction de textes d’interface seule relève d’une livraison logicielle. Une modification canonique du modèle, du guide ou de leur contrat publié suit le parcours de validation et de publication correspondant. Aucun ancien snapshot ne doit être réécrit pour simplifier la migration.

## Contrôles pour atteindre et conserver la cible

- Contrôle syntaxique en CI : aucune chaîne lecteur dans le JSX, ses attributs ou les tables et messages de production hors sources autorisées ; aucun mot généré dans les CSS. Les constantes techniques sont explicitement distinguées.
- Vérification des ressources : clés typées, paramètres cohérents, formes de nombre et variantes définies. Une clé absente ne doit pas être affichée brute ni remplacée silencieusement par un terme du modèle courant.
- Tests de fidélité : comparer les textes affichés à leurs sources publiées sur l’édition courante et une édition historique. L’attendu doit être indépendant de la fonction de transformation testée.
- Test de renommage sur un jeu isolé : modifier un nom métier dans les données doit actualiser ses usages sans changement du code ni perte d’icône ou de placement non demandée.
- Vérification des parcours : navigation, recherche, fiches, glossaires, erreurs, accessibilité et téléchargement doivent conserver leur fonctionnement. Les tooltips restent courts.

Deux composants ne sont pas importés depuis l’entrée actuelle : [SheetNavigation.tsx](../src/components/SheetNavigation.tsx) et [SystemDataSharingMap.tsx](../src/components/SystemDataSharingMap.tsx). Leur retrait ou leur conservation explicite évitera de maintenir des textes inutilisés. Le fichier `types.ts`, également absent du graphe d’exécution, est un contrat de types légitime.

Le présent lot ajoute uniquement cet audit et ses preuves. Le code applicatif, le modèle et les publications ne sont pas modifiés.
