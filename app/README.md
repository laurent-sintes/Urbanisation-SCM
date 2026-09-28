# FLOW Atlas — SPA statique

## Scénarios métier — U793

Le catalogue autonome est figé dans `scenario_catalog` de chaque publication : flux de valeur, scénarios, parcours, contributions et filtres contrôlés. La navigation « Scénarios métier » s’affiche pour les publications qui possèdent le catalogue ; les autres gardent leurs illustrations locales. Les liens directs utilisent `view=scenarios`, `scenario`, `stream` et `path`, avec une version fixe. Les liens depuis les fiches sont dérivés des contributions du même snapshot.

Recette de la publication réelle : `pnpm --dir app verify:content`, incluse dans la chaîne de livraison. La recette `node app/verify-scenario-catalog.mjs` conserve une fixture éditoriale isolée ; elle ne remplace pas le contrôle du contenu effectivement publié. Tests unitaires : `app/test-scenario-catalog.mjs` et `scripts/test_scenario_catalog.py`.

## Publication statique et GitHub Pages

Atlas charge `data/index.json`, puis `data/VERSION/model.json` et le guide `data/VERSION/guide.json`. Le chargement, les erreurs, la relance et le suivi automatique du courant sont conservés. Une sélection historique reste fixe. Les JSON sont téléchargés séparément du JavaScript ; l’historique complet n’est pas chargé à l’ouverture.

`python scripts/export_atlas.py` exporte les publications désignées par `modeles/release/index.json`, vérifie les empreintes des descripteurs, modèles et guides, puis active le catalogue statique en dernier. Les snapshots retirés sont lus dans leurs commits exacts via `modeles/git-history.json`. Le YAML reste l’autorité. Aucun backlog ni corpus documentaire vivant n’est exporté. Les JSON conservent les métadonnées déjà présentes dans les snapshots ; masquer un champ dans l’interface ne le supprime pas des fichiers téléchargés.

Les sorties `app/public/data/` et `app/dist/` sont générées et ignorées par Git. Le build exporte les données avant Vite ; une release activée réexporte les données vers `public/data/` et vers `dist/data/` si l’interface est compilée. Une simple préparation ne les publie pas. En cas d’export interrompu, relancer l’export ; aucun nouveau numéro de release n’est nécessaire.

Publication, export et compilation partagent le verrou système `.runtime/atlas.lock`. Une opération concurrente est refusée : attendre la fin de l’opération en cours puis relancer. Le fichier de verrou peut rester présent ; le verrou est libéré par le système à la fermeture du processus. `scripts/build_atlas.py` protège toute la compilation, contrôle TypeScript avant l’export et appelle Vite. Chaque requête JSON a un délai maximal de 15 secondes, après lequel l’écran propose de réessayer.

Le [workflow Pages](../.github/workflows/atlas-pages.yml) compile et déploie `app/dist/` après un push sur `main` touchant le site ou les publications, ou sur déclenchement manuel. Le checkout récupère l’historique complet nécessaire aux snapshots archivés. Configurer **Settings → Pages → Source → GitHub Actions** avant le premier déploiement. La conversion locale ne réalise ni push, ni activation distante. Les chemins relatifs et les liens `#…` fonctionnent à la racine et sous `/Urbanisation-SCM/`.

Le contenu exporté est intégralement lisible par les visiteurs autorisés du site : choisir la visibilité Pages en conséquence. Un dépôt privé ne rend pas automatiquement son site privé. [Configuration des workflows GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Vue d’ensemble des systèmes métier — U780

Une publication portant des nœuds `business_system` présente ses systèmes à l’accueil. Les domaines explicitement reliés par `presents` sont visibles dans leurs cartes ; les vues de contexte restent compactes. Le champ `modeling_depth` indique la profondeur choisie : contexte, domaines, ou capacités et comportements. Le niveau Systèmes métier est également disponible dans Relations. Arbre, fiches, infobulles et liens directs restent liés au snapshot sélectionné. Une publication historique conserve sa structure ; aucun complément backlog n’est injecté. Voir le [lot U780](../modeles/backlog/business-systems-U780.yaml).

## Niveaux Domain / Area — U482/U507

La hiérarchie courante est **Business System → Domain → Subdomain → Capability → Behavior**. Les référentiels conservent leur rattachement explicite. Le type technique `area` porte les sous-domaines ; le lecteur utilise le vocabulaire déclaré par chaque snapshot. Les anciens termes Univers, Area et Purpose sont réservés aux publications qui les portent.

Les liens utilisent l’identité canonique de chaque objet et peuvent fixer une publication. U804 remplace l’identité technique du domaine Supply Chain Orchestration par `supply-chain-orchestration` dans le modèle courant, sans alias de navigation. Les codes SYS/DOM/SUB/REF/CAP/BHV restent des repères de lecture et de recherche, pas des substituts d’identité dans les adresses. Les publications historiques conservent leurs propres objets et identifiants. Copier le lien fige la version consultée.

Relations propose les niveaux de la publication, dont Systèmes métier. Le lien courant `level=subdomain` désigne les sous-domaines et référentiels ; l’ancien `level=area` reste accepté. Un ancien `level=universe` rejoint le niveau Domaine du modèle courant ; il garde son sens dans les publications historiques.

Tests : `node --test --test-isolation=none app/test-dependency-graph.mjs app/test-navigation.mjs app/test-model.mjs`.

## Bandeau permanent et défilement

Le fil d’Ariane, le titre, la description et les onglets **Carte / Fiche / Relations / Sources d’inspiration** restent visibles. Seule la zone de contenu sous ce bandeau défile ; l’arbre conserve son propre défilement. Cette règle est commune à l’accueil, aux systèmes métier, domaines, sous-domaines, capacités et comportements, ainsi qu’aux glossaires et au guide du méta modèle. Sur les écrans de faible hauteur, le bandeau est plus compact.

Sur grand écran, le fil d’Ariane et la copie du lien occupent la barre FLOW de 52 px : ils ne consomment plus une rangée au-dessus du titre. Sur mobile, le bouton d’ouverture de l’arbre rejoint FLOW, tandis que le fil d’Ariane garde sa propre ligne. Beaumanoir devient une signature de 76 px dans le pied de l’arbre, près des statistiques. Les noms longs du fil d’Ariane restent nommés intégralement pour les lecteurs d’écran ; sur grand écran, l’ellipse visuelle conserve leur accès et le titre au survol. [Identité et repères de design](BRANDING.md).

Une nouvelle navigation vers une vue ou un périmètre remet le contenu en haut ; le retour et l’avance du navigateur restaurent la position de lecture dans leur entrée de navigation, sans historique de visites applicatif ; un lien vers une section affiche directement cette section. La sélection d’une carte dans un même périmètre conserve la position de lecture. L’onglet **Fiche** permanent remplace le bouton « Ouvrir la fiche » en bas de la carte. L’ouverture de la fiche d’un autre élément depuis l’inspecteur de relations reste disponible.

Les accès aux deux glossaires et au guide du méta modèle sont alignés à gauche dans la navigation. La recherche porte sur tous les types et propose un filtre de lecture local par type ; les anciens paramètres `type` restent ignorés. Les préfixes de code sont acceptés et les définitions sont prioritaires sur les mentions dans les scénarios et les sources. La version du modèle complet apparaît une seule fois, sous la forme **Modèle · vNNN**, dans le pied de la navigation près des statistiques et du logo Beaumanoir. Son survol précise l’identifiant de publication et le suivi courant ou fixe ; elle n’est plus affichée dans le bandeau de chaque objet.

Les contrôles navigateur courants sont décrits dans « Données statiques et contrôles » ci-dessous. Les recettes historiques du bandeau restent conservées dans `legacy/qa-before-static-repair/`.

L’ancienne recette `verify-shell.mjs` et son option `--baseline` documentent les contrôles de la précédente interface ; l’entrée actuelle lance la suite consolidée.

## Informations métier — réalisation U468, masquée depuis U470

**État courant :** le catalogue est masqué dans Atlas à la demande de Laurent. Les paragraphes ci-dessous décrivent le fonctionnement conservé en interne et la recette antérieure ; les règles actuelles figurent dans « Allègement de la revue — U470 » en fin de document.

La navigation propose **Informations métier**, avec index filtrable et fiche de lecture. Chaque fiche expose sa question, sa définition, un exemple, sa composition sémantique, ses limites, ses usages par les capacités et les informations liées. L’onglet **Sources d’inspiration** donne les raisons du terme et du périmètre, les différences et les liens directs vers les sources consultées. Les qualifications de travail et identifiants de preuve ne sont pas affichés ni indexés.

Les fiches de capacités et de leurs périmètres parents proposent les informations qui concernent leurs capacités explicitement rattachées. Aucun rôle n’est déduit pour un comportement ni propagé par une dépendance. La recherche générale inclut les informations, avec un filtre dédié. Les liens `#version=…&view=information&information=PINFO-…` conservent la publication ; `node=…` ajoute un périmètre de lecture facultatif. Une information absente ou une ancienne publication sans catalogue est signalée sans repli.

Sur écran large, liste et fiche défilent indépendamment ; changer d’information remet la fiche en haut. Sur petit écran, la liste reste compacte et la fiche suit le défilement de la page. Les onglets acceptent les flèches, Home et End. Les références viennent exclusivement de `information_catalog` dans le snapshot métier.

Les 14 fiches U468 sont publiées dans v012 / `2026-09-19.5` ; v011 reste sans catalogue. U469 met l’extension data/information en attente et donne priorité à la revue de la base. Tests : `app/test-information.mjs`, `scripts/test_information_catalog.py` et le parcours de préparation dans `scripts/test_prepare_release.py`. Recette de la publication réelle : `node audits/2026-09-19-release-U469/verify-browser.mjs`. La [recette initiale U468](../audits/2026-09-19-informations-atlas-U468/rapport.md) reste une preuve isolée ; [rapport de publication](../audits/2026-09-19-release-U469/rapport.md).

## Présentation et historique

14 septembre 2026 — application React avec React Flow et interface sur mesure, selon le choix [U150](../connaissance/01-contributions-utilisateur.md#u150). La première réalisation U105 et l’essai comparatif U146 restent conservés dans les historiques.

FLOW Atlas permet de parcourir la cartographie publiée, de comprendre une capacité dans son contexte et d’explorer ses liens. L’arbre gauche, la fiche centrale et la recherche accompagnent les cartes React Flow. Les modèles publiés en YAML, ou en JSON pour les versions historiques, sont l’autorité de cette consultation ; le Markdown conserve les récits, analyses, décisions et restitutions. Une publication ne vaut pas validation métier.

## Exploration des dépendances — U415/U419

Le 19 septembre 2026, Laurent a [validé Cytoscape.js](../connaissance/01-contributions-utilisateur.md#u415), puis [autorisé son intégration](../connaissance/01-contributions-utilisateur.md#u419). L’onglet **Relations**, disponible dès l’accueil ou depuis une fiche, utilise Cytoscape pour explorer les liens aux niveaux capacité, sous-domaine, domaine et système métier selon la publication. Les cartes de structure conservent React Flow.

Le prototype comparatif utilisait une capture figée du backlog de 46 capacités et 186 relations. L’application lit exclusivement la publication consultée, sans cette capture ni complément depuis le backlog. La profondeur propose un, deux ou trois pas, ou toute la publication. Les filtres portent sur le sens du parcours et le rôle explicitement publié ; une qualification en texte libre ne devient pas automatiquement « a besoin de ». Les changements de niveau regroupent les extrémités selon les rattachements explicites, avec les liens internes et les relations d’origine accessibles dans l’inspecteur. Les comportements sont projetés sur leur capacité parente ; les objets, documents et événements restent distincts. Le parcours ne crée aucune relation transitive.

Les réglages de niveau, profondeur, parcours, qualification, disposition et libellés figurent dans les liens partageables et sont restaurés au retour ou au rechargement. Une sélection de nœud permet de recentrer l’exploration ou d’ouvrir sa fiche ; une sélection de lien ouvre les qualifications, conditions, effets, sources et portées de validation d’origine. Une liste et des contrôles natifs permettent le même parcours au clavier. Les dispositions fCoSE et Dagre sont des réglages d’interface ; les groupes repliables natifs et les performances à grande échelle restent à évaluer. Le moteur graphique ne prescrit aucun découpage logiciel du modèle métier.

## Compiler l’interface

Depuis PowerShell, à la racine du projet, avec Node.js et pnpm disponibles :

```powershell
pnpm --dir app install --frozen-lockfile
pnpm --dir app build
```

La compilation exporte les publications, vérifie TypeScript puis produit `app/dist/index.html` et ses ressources dans `app/dist/assets/`. Le fichier de verrouillage pnpm fixe les dépendances. Après une modification du code React, recompiler puis recharger la page. La compilation de l’interface ne publie aucun modèle métier et ne copie pas le modèle dans le bundle.

Node.js et pnpm servent à la compilation et au développement. L’application compilée utilise un hébergement HTTP statique. Le serveur Python local emploie uniquement la bibliothèque standard, sans PyYAML ni serveur Node permanent. PyYAML sert uniquement à la génération des exports. Installer le lecteur YAML depuis la racine avec `python -m pip install --target .tools/yaml-runtime -r requirements.txt`. Un dossier `dist` absent produit un diagnostic explicite ; aucune ancienne interface n’est servie en remplacement.

## Lancer l’application

Depuis PowerShell, à la racine du projet :

```powershell
.\Lancer-FLOW-Atlas.ps1
```

Le lanceur vérifie la présence de l’interface compilée et cherche un Python 3.10 ou supérieur fonctionnel dans `PATH`, puis dans le runtime Codex de l’utilisateur. Il démarre le serveur local en arrière-plan et ouvre une fenêtre d’application Edge si Edge est disponible, sinon le navigateur par défaut. Le Python fourni par Codex peut être utilisé sans installation globale.

L’adresse par défaut est [http://127.0.0.1:8765/](http://127.0.0.1:8765/). Un second lancement réutilise le serveur seulement si son identité et la racine du projet correspondent. Si le port est déjà utilisé par un autre service, choisir un autre port :

```powershell
.\Lancer-FLOW-Atlas.ps1 -Port 8766
```

L’option `-Browser` ouvre un onglet classique et `-NoBrowser` démarre ou vérifie le serveur sans ouvrir de fenêtre. Pour arrêter le serveur suivi par le lanceur :

```powershell
.\Lancer-FLOW-Atlas.ps1 -Stop
```

Reprendre `-Port 8766` si ce port a servi au lancement. L’arrêt vérifie l’identité FLOW Atlas, la racine du projet, le port, le PID enregistré et la date de démarrage du processus. Un serveur indisponible ou différent n’est pas arrêté sur la seule base d’un ancien PID. Fermer la fenêtre de l’application laisse le serveur local disponible.

Les journaux et le fichier de suivi du processus sont enregistrés dans `app/.runtime/`. Un échec au démarrage indique le journal à consulter. Si PowerShell interdit l’exécution des scripts selon la politique du poste, le serveur peut aussi être lancé directement depuis un terminal avec un Python disponible :

```powershell
python app/server.py --port 8765
```

Ouvrir ensuite l’adresse locale ci-dessus ; `Ctrl+C` arrête ce serveur exécuté au premier plan. Ce lancement direct ne modifie aucune politique PowerShell.

## Développer l’interface

`pnpm --dir app dev` exporte les publications puis lance Vite sur [http://127.0.0.1:5173/](http://127.0.0.1:5173/), sans proxy API ni serveur Python parallèle. Après une nouvelle publication, la release actualise les JSON servis par Vite. Pour vérifier la livraison locale, recompiler puis consulter le serveur statique sur 8765.

## Cartographie publiée

Atlas affiche uniquement les modèles publiés, sous le nom **Cartographie**, sans sélecteur de release. Par défaut, la vue suit la publication courante désignée par l’index. Les liens directs contenant une version restent fixes sur cette publication. Les anciens liens contenant un espace backlog ou panorama reviennent à la cartographie publiée.

Le serveur lit directement [l’index des publications](../modeles/release/index.json), le descripteur daté qu’il désigne, puis le modèle YAML (ou JSON historique) de cette publication. Atlas n’a pas de référentiel parallèle. Le backlog et le panorama As Is restent des fichiers de travail dans le projet et ne sont pas exposés dans cette interface.

Le modèle et ses éléments portent une révision entière et `last_modified` en UTC. La section **Sources, révision et portée détaillée**, ouvrable dans chaque fiche, présente ces métadonnées et les preuves. Les versions historiques sans horodatage précis le signalent. Les notes de release et les détails de changements sont conservés avec chaque nouvelle publication. Les statuts métier restent distincts de la publication.

L’application vérifie automatiquement la révision toutes les cinq secondes quand elle est visible et à son retour au premier plan. Elle recharge les nouvelles données sans action manuelle lorsque la consultation suit la publication courante. Elle conserve le domaine ou la capacité consulté si son identifiant existe encore. Une version ouverte par lien direct ne bascule pas vers la nouvelle. Après changement du code de l’interface, recharger une fois la page ; les publications de données ultérieures sont automatiques.

## Explorer et lire

L’arbre gauche suit les relations explicites de la publication. Déplier une branche et ouvrir sa fiche sont deux actions distinctes. Les groupes de présentation restent signalés ; les relations vers objets métier, documents et événements ne deviennent pas des enfants hiérarchiques. La sélection et les branches ouvertes sont conservées ; recherche, liens directs et retours révèlent les ancêtres de la fiche. Les visites récentes ont été supprimées.

Les icônes des capacités correspondent à leur `fields.nature` publié : action, gestion, connaissance/visibilité, orchestration, planification ou décision. Les décisions suivent les autres capacités de chaque domaine, avec une ligne légère entre les deux groupes lorsqu’ils existent, dans l’arbre, les cartes et les fiches. L’ordre relatif est conservé dans chaque groupe. Les comportements gardent leur ordre ; une ancienne publication sans type reste explicitement non renseignée, sans déduction du nom ni lecture du backlog.

La séparation entre l’arbre et la fiche se déplace à la souris ou avec les flèches gauche/droite lorsqu’elle a le focus. La largeur choisie et les branches ouvertes sont mémorisées localement, sans enregistrer un historique de visites. Sous 1000 px, le bouton **Arbre** ouvre un tiroir ; Échap le ferme et restitue le focus. Dans l’arbre : flèches pour parcourir et déplier, Home/End pour atteindre le premier/dernier élément visible, Entrée pour ouvrir une fiche. Le focus clavier reste distinct de la sélection.

La fiche présente la Finalité, la Définition, les comportements, le Périmètre et les types renseignés. La vue Relations conserve les qualifications, conditions et effets métier. Depuis U450, les réserves, validations, métadonnées éditoriales et liens vers les sources internes ne sont plus affichés. Ils restent conservés dans les fichiers et preuves internes ; cette présentation ne modifie aucun accord.

Les cartes React Flow permettent de déplacer et cadrer la vue, puis d’ouvrir les éléments dans leur contexte. Les cartes hiérarchiques utilisent les enfants explicites ; la vue Relations utilise Cytoscape et conserve le sens et la qualification des liens publiés. Un placement visuel ou un cadre de contexte ne crée aucun domaine ni rattachement supplémentaire. Les contrôles de navigation et de carte emploient la même bibliothèque d’icônes.

Dans la carte d’un domaine, chaque sous-domaine liste ses capacités avec leurs icônes. Le survol ou le focus d’un lien affiche son aperçu ; le clic ou Entrée ouvre directement sa fiche dans la même publication. Le retour du navigateur retrouve la carte d’origine. Les listes suivent les rattachements publiés, y compris lorsqu’un identifiant conserve le préfixe d’un autre domaine. La hauteur des cartes suit leur contenu, sur une grille de une à trois colonnes ; la molette fait défiler la page et les boutons de zoom restent disponibles.

La carte **Authoritative Data**, anciennement Business References, offre le même parcours : chaque référentiel affiche les liens de ses capacités, avec les mêmes icônes, infobulles et accès direct aux fiches. Son libellé Area ou groupe de présentation suit le type publié ; ses référentiels restent distincts.

La recherche porte sur les noms, identifiants et textes publiés, avec un filtre par type d’élément. Ctrl+K place le focus dans la recherche ; flèche bas entre dans les résultats, Entrée ouvre le résultat ciblé. Les synonymes français non présents dans la publication ne sont pas inventés. Les anciens paramètres d’URL relatifs au statut ou aux sources internes ne réactivent pas leur affichage.

## Données statiques et contrôles

- `data/index.json` : catalogue et pointeur courant explicites, empreintes des exports.
- `data/VERSION/model.json` : modèle et glossaire figés dans la même publication.
- `data/VERSION/guide.json` : guide associé et ses extraits figés, ou état indisponible explicite.
- `/__atlas__/identity.json` : identité du serveur local pour le lanceur ; absent de GitHub Pages et inutilisé par la SPA.

Les anciennes routes `/api/*` ne sont plus servies. Le navigateur refuse une identité de modèle différente de la sélection. Un historique manquant affiche une erreur, sans repli. Les empreintes canoniques sont vérifiées lors de chaque export, avant activation du catalogue.

```powershell
python app/server.py --check
python -m unittest discover -s scripts -p "test_*.py"
python -m unittest discover -s app -p "test_*.py"
pnpm --dir app install --frozen-lockfile
pnpm --dir app test
pnpm --dir app build
pnpm --dir app exec playwright install chromium
pnpm --dir app verify
```

`pnpm test` découvre tous les fichiers `test-*.mjs`, y compris catégories et rôles de sous-domaines. Les suites Python distinguent les invariants courants des décisions historiques, éprouvées sur leurs snapshots figés. Elles couvrent aussi le serveur statique, les guides, les archives Git, les exports interrompus et le verrou entre processus. Le test du lanceur Windows utilise une copie temporaire et un port libre ; il contrôle l’absence de doublon et les refus d’arrêt pour identité, PID ou date de démarrage incohérents.

`pnpm verify` exécute quatre recettes maintenues sur les fichiers compilés : `verify-browser.mjs` (cartes et parents explicites, fiches, comportements, recherche, clavier, glossaire, marché, graphe et mobile), `verify-static.mjs` (sous-chemin Pages, attente, erreur, relance et historique) et `verify-modeling-guide.mjs` (guide associé, exercices, liens et réponse obsolète après sélection) et `verify-display-codes.mjs` (politique de codes dans une fixture isolée). Leurs réponses HTTP sont servies dans le contexte isolé du navigateur, sans serveur utilisateur et sans modifier de publication. Les résultats courants vont uniquement dans `app/.runtime/`.

Playwright est une dépendance de développement verrouillée. Chromium est le navigateur par défaut ; `ATLAS_BROWSER_CHANNEL=msedge` permet de tester Edge déjà installé. Aucun chemin de module personnel n’est nécessaire. La CI Linux installe Chromium avec ses dépendances système et exécute ces contrôles avant déploiement ; un job Windows teste le lanceur. La présence de tests ne garantit pas une couverture exhaustive.

Les anciennes recettes spécifiques sont archivées dans `legacy/qa-before-static-repair/`. Leurs entrées de commande historiques, notamment `verify:behaviors`, `verify:market`, `verify:dependencies` et `verify:presentation`, lancent désormais la recette consolidée ; elles ne rejouent pas tous les scénarios historiques. Les archives et preuves datées ne sont jamais réécrites par les tests courants.

Le serveur de production sert exclusivement l’entrée et les ressources autorisées dans `app/dist/`. Le serveur expose les JSON générés sous `data/`, mais pas les sources TypeScript, les dépendances, les source maps ni les fichiers du dépôt. Il conserve la vérification de l’hôte et de l’origine, l’absence de cache et les types de contenu explicites. La politique CSP limite scripts et feuilles de style aux fichiers locaux ; seuls les attributs de style nécessaires au placement React Flow sont autorisés en ligne. Elle n’autorise ni scripts en ligne ni évaluation dynamique.

## Structure du frontend

- `src/brand.css`, `public/assets/` : identité FLOW adoptée en U208, logos originaux et palette du template ; sources et maintenance dans [BRANDING.md](BRANDING.md).
- `src/App.tsx` : composition des vues et navigation ; `navigation.ts` encode les liens et les préférences locales.
- `src/model.ts`, `types.ts` : projection immuable et parcours des relations explicites.
- `src/publication.ts`, `usePublication.ts` : fichiers JSON, catalogue, annulation des requêtes et suivi courant/historique.
- `src/components/Sidebar.tsx` : arbre accessible, recherche et filtres de la publication.
- `src/components/BusinessSheet.tsx` : lecture métier. Les sources internes restent masquées ; le guide dispose de ses propres extraits figés.
- `src/ReactFlowPane.tsx` : cartes de structure et listes de capacités ; placement en grille.
- `src/dependencyGraph.ts` : projection pure des relations publiées et de leurs regroupements, conservant les liens originaux.
- `src/DependenciesPane.tsx`, `CytoscapeCanvas.tsx`, `dependencies.css` : contrôles, inspecteur accessible et rendu Cytoscape avec fCoSE/Dagre.
- `src/icons.tsx` : pictogrammes [Lucide React](https://lucide.dev/guide/react), importés individuellement. Les noms connus ont un pictogramme ; les nouveaux éléments utilisent celui de leur type. Cette table décrit uniquement la présentation.

Les anciennes sources `app.js`, `model.js` et `styles.css` ont été remplacées par ces modules. `exploration.json`, `model-metadata.json` et `legacy/` restent des archives de présentation non chargées par la nouvelle interface. Le prototype comparatif dans `prototypes/atlas-exploration/` reste séparé ; aucune dépendance LikeC4 n’est embarquée dans Atlas.

Les cartes et leurs styles sont chargés à la demande. Cytoscape et ses dispositions ne sont chargés que pour la vue Relations ; les dépendances sont intégrées au build et verrouillées dans pnpm, sans CDN ni changement de CSP. L’ancien moteur ELK n’est plus nécessaire. Le chunk Cytoscape reste volumineux et déclenche l’avertissement de taille de Vite ; les calculs de placement s’exécutent sur le fil principal. Aucune promesse de performance sur des milliers d’éléments n’est déduite du modèle actuel.

Contrôles des dépendances : `pnpm --dir app test` vérifie projections, sens, qualifications et agrégations ; la recette consolidée vérifie le rendu Cytoscape et les préférences de disposition. Le [bilan historique](../audits/2026-09-19-atlas-dependencies/README.md) conserve les preuves antérieures.

## Lecture YAML — U202

Installer `requirements.txt` depuis la racine : `python -m pip install --target .tools/yaml-runtime -r requirements.txt`. Le lecteur commun sert aux outils de validation et de génération, jamais au serveur statique. Après modification du lecteur, régénérer les JSON avec le build ou l’export ; aucun redémarrage HTTP nécessaire. Les outils Node lisant les fichiers publiés utilisent ce lecteur via `scripts/load-publication.mjs` ; `ATLAS_PYTHON` peut préciser l’interpréteur.
## Glossaire et infobulles — U203

Deux accès sont placés hors de l’arbre métier : **Glossaire métier** et **Glossaire du méta modèle**. Le premier lit les termes métier du snapshot ; le second combine les termes méthodologiques figés du guide explicitement associé et les termes TER classés comme méthodologiques par ce guide. Les anciens liens TER gardent leur identité et ouvrent le bon glossaire. Une publication sans guide associé ne récupère aucun complément du backlog. La liste et la définition disposent de panneaux de défilement indépendants ; sélectionner un terme remet sa définition en haut. Sur mobile, les panneaux sont empilés et bornés.

Les chaînes `[libellé](glossary:TER059)` et `[libellé](model:D01.f#definition)` sont rendues par `ModelText`. Elles restent des chaînes YAML/JSON ; aucun HTML ni liaison automatique par mot. `ReferenceLink` ajoute une vraie URL, un aperçu au survol/focus et le passage à la fiche. Échap ferme l’aperçu, le pointeur peut passer sur celui-ci ; Entrée, clic, ouverture dans un nouvel onglet et rechargement d’un lien profond conservent la publication. Une cible absente produit un repère explicite, sans redirection vers un autre sens. Les liens de fiches existants utilisent aussi ce composant.

Compiler avec `pnpm --dir app build`, puis recharger la page. Le glossaire est vérifié par `app/test-glossary.mjs`, la recette consolidée et la recette du guide. Les captures initiales U203 restent conservées dans `audits/2026-09-14-glossaire-atlas/`.


## Comportements de capacités — U264

Atlas reconnaît les nœuds `behavior` et leur rattachement explicite à une capacité. Arbre terminal et navigation clavier, filtre Comportement et recherche par contenu/ascendance, icône distincte, liste des descriptions dans la fiche de capacité, fiche individuelle avec retour au parent, liens sur les cartes de capacités. Les nombres de comportements et de capacités restent distincts. L’adaptateur refuse les comportements orphelins, rattachés à un autre type ou possédant des enfants. Le champ historique layer n’est plus un critère de parenté depuis U455/U458.

`pnpm --dir app verify:behaviors` lance la recette consolidée sur les comportements de la publication courante, sans injection de backlog. La recette précédente et ses preuves restent historiques.


## Comparaison par rapport au marché — U311

Les fiches métier et du glossaire affichent les comparaisons structurées du snapshot sélectionné : points communs, différences et références externes consultables. Les statuts, réserves et sources internes restent dans les données. Les termes éditeurs sont recherchables. Les publications historiques sans comparaison ne récupèrent aucune donnée du backlog. La compilation active l’affichage ; la présence de nouvelles données demande une publication métier distincte.

## Comprendre le méta modèle — U319–U322, U450

L’entrée **Comprendre le méta modèle**, à côté des deux glossaires et hors de l’arbre métier, présente six repères visuels. Chaque repère associe un principe, un exemple, deux choix avec explication et un volet **Pour contribuer** : critères et frontières. Les preuves éditoriales restent internes. Le modèle métier ne prescrit aucun découpage de solution ni correspondance un pour un (U322).

Les réponses et les variantes restent éphémères, sans score ni historique de parcours. Le lien direct `#view=principles&principle=ID&version=PUBLICATION` conserve la clé et la publication ; le bouton Copier le lien fixe la publication affichée. Les liens de fiches sont résolus uniquement dans son snapshot.

Le contenu pédagogique est distinct du glossaire métier et du catalogue de capacités. `modeles/modeling-guides/index.yaml` associe explicitement une publication à une version de guide et à son empreinte. `app/modeling_guide.py` lit uniquement cette association et le document YAML figé via `structured_io.py`. `data/VERSION/guide.json` contient le guide associé ou un état d’absence ; il ne complète jamais une ancienne publication depuis le backlog ni depuis un autre guide. La disponibilité du guide n’altère pas `data/VERSION/model.json`.

Le premier guide du 18 septembre est associé rétrospectivement à v007 (publication du 16 septembre). Sa date et sa portée sont indiquées ; les principes adoptés plus tard et les illustrations sont distingués du contenu du snapshot. L’accord de réalisation U321 ne transforme pas les formulations pédagogiques ou les généralisations proposées en nouveaux accords métier. Les extraits de sources sont figés avec le guide, sans ouvrir une version courante différente à leur place.

Pour une évolution, créer une nouvelle version de guide puis actualiser volontairement les associations et empreintes ; ne pas réécrire une version déjà livrée. U450 associe l’édition méthodologique `2026-09-19.1` à v009, en conservant v007 et son guide. La préparation d’une release capture désormais l’association explicite de sa publication de départ. La publication vérifie son intégrité et la reporte explicitement vers la nouvelle version. Un changement d’index ou de guide après préparation bloque cette reprise ; une base sans association n’en invente aucune. Ce circuit ne complète jamais le modèle métier depuis le backlog.

Depuis U451, les comportements portent une forme principale dans `fields.nature` : politique/stratégie, variante de parcours, mécanisme, périmètre métier, dimension de raisonnement, effet métier ou pratique de planification. Chaque forme possède son pictogramme ; les types inconnus restent neutres. Les capacités contenues par les référentiels conservent une icône propre au référentiel, déterminée par leur parent explicite. Les décisions restent en fin de liste avec leur séparation légère.

La recette U450 antérieure reste conservée dans `legacy/qa-before-static-repair/verify-atlas-presentation.mjs`. Le guide est désormais contrôlé par la recette maintenue `verify-modeling-guide.mjs`.

Contrôles : `python -m unittest discover -s app -p test_modeling_guide.py`, `pnpm --dir app test`, `pnpm --dir app build`, puis `pnpm --dir app verify:principles`. La vérification navigateur sert les fichiers compilés dans son contexte de test et utilise les publications réelles en lecture seule ; elle ne nécessite pas de démarrer le serveur utilisateur.


## Lectures et actualisation

Les documents structurés déjà analysés sont réutilisés via le cache borné de `scripts/structured_io.py`. Les octets et signatures sont revérifiés à chaque lecture, et les résultats sont copiés pour isoler les requêtes. Le cache disparaît au redémarrage ; une modification de contenu l’invalide même si la date et la taille sont conservées. Il n’existe aucun repli vers le backlog.

La surveillance des publications conserve l’état React lorsque le catalogue et la publication n’ont pas changé. Les changements de publication, erreurs et reprises de connexion restent notifiés. Après modification Python, redémarrer le serveur avec le lanceur et ses contrôles d’identité. Après modification du frontend, reconstruire `app/dist` puis actualiser la page.


### Consultation U458

La recherche classe noms exacts et identifiants en tête, puis les expressions du contenu métier et les termes du glossaire du snapshot. Les champs internes ne sont pas indexés. U459 rétablit les comparaisons visibles et la recherche sur leurs informations métier ; les statuts et sources internes restent exclus. Les résultats indiquent leur nature et un extrait ; les termes ouvrent leur glossaire puis leurs liens métier. Un terme absent du snapshot ne peut être trouvé par repli vers le backlog.

Les fiches présentent finalité, définition, parent et périmètre avant les interactions et comportements repliables ; leurs conditions et effets restent consultables. Les graphes partent des relations directes à la maille choisie ; les relations des comportements sont regroupées avec leur capacité. Les liens entre voisins sont une option avancée conservée dans le lien partagé. Les noms métier restent visibles au dézoom.

Le guide conserve son association versionnée ; le simulateur de réalisations logicielles est retiré. U467 publie la révision pédagogique issue de U458, enrichie jusqu’à U466, comme édition `2026-09-19.2` associée à v011. Aucun repli de lecture vers le brouillon. Recette de la release réelle : `node audits/2026-09-19-release-U467/verify-browser.mjs` ; Information et son exemple, deux glossaires, guide, définition Supply, marché et maintien de v010. La recette initiale `node audits/2026-09-19-plan-U458/verify-reader.mjs` reste celle du brouillon testé en fixture, sans publication.


### Vue d’ensemble et repères marché U459

Les liens de capacités des cartes affichent leur définition et la liste à puces de leurs comportements explicites, au survol comme au focus clavier. Le glossaire n’affiche plus de résumé redondant ; le champ historique reste dans les données et les anciens liens conduisent à la définition.

Les fiches proposent un accès « Sources d’inspiration » et des comparaisons dépliables : nature du rapprochement, appui externe, points communs, différences, choix FLOW et source primaire. Les fiches sans comparaison indiquent un positionnement non documenté ; aucun badge standard ou innovation n’est inventé. Les limites de portée de la preuve restent utiles à la comparaison, distinctes des statuts de revue et réserves internes.

### Marché, choix de vocabulaire et exemples U462

L’onglet **Sources d’inspiration** est voisin de Carte, Fiche et Relations sur chaque élément sélectionné. Il affiche directement la position FLOW et la source primaire datée ; les explications de terme/définition passent en tête lorsqu’elles sont documentées. Les différences, passages et limites documentaires se déplient. Le glossaire utilise la même présentation. Les liens `view=market` sont partageables avec leur publication ; les anciens liens de fiche vers `market_comparisons` sont redirigés.

La fiche place **Exemples concrets** après la définition. `fields.examples` permet situation, résultat et leçon métier. Les anciens périmètres restent lisibles par extraction des passages explicitement signalés comme exemples, y compris les exemples discutés et les marqueurs Markdown historiques. Sources internes et statuts restent privés. La recherche indexe seulement le contenu public des exemples et des raisons de vocabulaire.

Contrôle courant : `pnpm --dir app verify` vérifie les sources d’inspiration de la publication sélectionnée. Les tests de présentation et de recherche complètent ce parcours ; aucune mutation de publication.

### Sources d’inspiration — lecture métier U475

Lorsqu’une fiche ou un terme publié contient `market_inspiration`, l’onglet commence par le choix FLOW, puis compare les sources et FLOW dans un tableau **Source / Nom du concept / Périmètre / Approche**. La synthèse explique leurs similitudes et différences ; les exemples citent leur source externe et distinguent la lecture FLOW. Les liens vers les documents restent visibles, avec les précisions bibliographiques et les limites dans des détails dépliables.

Le tableau reçoit les champs `concept_name`, `scope_summary` et `approach_summary` des comparaisons publiées. L’objet `market_inspiration` porte `choice`, `flow_scope`, `flow_approach`, `synthesis` et les `examples` avec `source_title` / `source_url`. La ligne FLOW prend le nom du nœud ou du terme consulté. La recherche indexe ces textes publics, sans les références internes ni les qualifications de travail. Cet objet n’est pas exposé comme un bloc brut dans la fiche.

Les publications sans cet objet conservent la présentation par référence ; aucun complément ni résumé n’est récupéré dans le backlog. Sur petit écran, le tableau garde ses en-têtes et défile horizontalement dans une région accessible au clavier.


## Allègement de la revue — U470

Le catalogue Informations métier reste masqué : pas de bouton de navigation, de section dans les fiches, de résultat ni de filtre de recherche. Un ancien lien `view=information` revient à la fiche de son nœud, ou à la carte, dans la même version. Les données publiées et le travail interne sont conservés ; ce masquage ne retire pas les champs des JSON exportés. Le composant sans consommateur et ses styles ont été retirés lors du nettoyage technique.

Les mots clés explicitement reliés au glossaire ouvrent une infobulle au survol et au focus clavier. Elle donne priorité à la définition complète, plutôt qu’au résumé court. U470 ajoute ces liens dans l’univers Supply ; leur disponibilité publique dépend du snapshot publié, sans repli backlog.


## Origines des demandes et comportements — U501

Les fiches affichent Frontoffice et Backoffice à partir des seules valeurs publiées de `fields.request_origins`, avec leur sens relatif au Domain. Les deux indicateurs peuvent coexister. Les comportements dotés de `fields.behavior_aspect` se lisent sous Déclenchement ou Activité ; ce regroupement est visuel et ne change pas leurs parents. Les fiches historiques sans ces métadonnées gardent leur lecture habituelle. Les libellés visibles sont recherchables dans le même snapshot. Tests ciblés : `node --test --test-isolation=none app/test-request-metadata.mjs app/test-reader-search.mjs app/test-behavior-types.mjs`.


## Catégories de présentation — U701

Les capacités peuvent porter `fields.category: { id, display_name, order? }`. Atlas regroupe les enfants d’un sous-domaine par catégorie, puis conserve le classement par nature dans chaque section. Les bandeaux apparaissent dans la carte du sous-domaine et dans ses listes de capacités sur les cartes d’ensemble. Les capacités non classées restent visibles sous « Autres capacités » lorsqu’un classement existe. Sans catégorie publiée, le rendu historique est conservé. Aucun nœud métier, parent, lien ou fil d’Ariane supplémentaire n’est créé ; les libellés sont lus exclusivement dans le snapshot affiché. `order` est un ordre visuel facultatif ; aucune priorité métier induite. Test : `node --test app/test-categories.mjs`.


U711 : les sous-domaines peuvent porter `fields.dominant_role` (id et display_name). Atlas affiche un badge textuel avec accent coloré et un filtre de finalité sur les vues comportant des sous-domaines. Aucun rôle n’est inféré des noms dans les publications historiques. Les catégories de capacités restent un classement distinct, applicable aussi à Matching et Fulfilment.


## Codes de lecture — U783

Les nouvelles publications portant `display_policy: typed-tree-v1` contiennent un `display_index` figé : codes SYS/DOM/SUB/REF/CAP/BHV et ordre de l’arbre. Atlas les affiche dans l’arbre, les cartes, les fiches et les sélecteurs de relations. La recherche accepte code ou identité persistante ; les liens gardent `node=ID` et la version. Recherche, filtres et repli ne renumérotent rien. Les historiques sans cette politique conservent leurs identifiants affichés. La page du méta modèle explique ces règles à partir de la politique du snapshot, même sans guide associé.

`pnpm --dir app verify:codes` vérifie ce parcours sur une publication de test isolée, fabriquée avec le générateur Python à partir des données publiées. Aucun catalogue utilisateur n’est modifié. Une compilation seule n’ajoute pas de codes aux publications existantes : leur activation nécessite une nouvelle release.

## Lecture après audit UX

L’accueil des publications à systèmes métier présente les trois contextes et les domaines opérationnels dans une overview compacte, suivant les relations et l’ordre publiés. Les niveaux suivants conservent React Flow. L’arbre privilégie les noms ; les codes restent dans les fiches, la recherche et les infobulles accessibles de l’arbre.

Les fiches présentent définition et exemples, puis périmètre, comportements, scénarios et responsabilités liées. Les comportements et le sens des interactions sont directement lisibles ; les relations sont regroupées par partenaire sans perte de leurs qualifications. Les conditions et entrées/sorties des parcours sont visibles. Seuls les exemples longs, les exercices et les références détaillées restent repliables. Les comparaisons affichent leur synthèse avant le tableau ; sur mobile chaque source forme un bloc lisible. Les relations disposent de réglages repliés et d’un graphe activable, avec la liste ouverte par défaut sur petit écran. Le sommaire de fiche contient uniquement des sections ; les sources conservent leur onglet.

Les liens internes conservent le suivi courant ou la version fixe déjà choisie. La copie du lien et l’ouverture d’un lien de référence dans un autre onglet restent figées sur la publication. Le chargement JSON et ses messages restent actifs au démarrage, au changement réel de publication et pour les vues chargées à la demande.

L’aide adapte les libellés de hiérarchie aux systèmes présents dans le snapshot et explique la politique de codes seulement lorsqu’elle y est publiée. Cette aide d’interface ne crée pas de termes canoniques ni ne modifie les guides ou glossaires historiques. Les homonymes du glossaire méthodologique sont distingués dans la liste.


## Méthodologie de transformation

L’entrée permanente regroupe le guide et l’accès au glossaire méthodologique. Depuis v041, le guide « Méthodologie de transformation » propose un accueil, cinq angles de lecture (comprendre, explorer, décider, réaliser, mesurer) et trois ressources (métamodèle, conventions, références). Les huit rubriques, les six repères pédagogiques et les deux schémas proviennent du guide figé. La barre de raccourcis et le menu utilisent la même navigation. Les anciennes publications conservent leur propre guide, dont l’ancienne organisation en quatre rubriques. Les anciens liens vers les six repères et le glossaire restent valides ; une édition historique sans rubriques conserve ses repères.

Les liens contextuels depuis les capacités, comportements et scénarios conservent la publication et l’origine de la consultation. Les paramètres `returnTo` et `catalogReturn` portent seulement ce contexte de retour ; ils ne constituent pas un historique de visites. Le retour retrouve filtres, parcours et position de lecture. Un sélecteur de parcours n’est affiché qu’en présence d’alternatives. L’édition méthodologique affichée provient exclusivement de l’association figée à la publication, sans repli backlog. La source de travail actuelle est `modeles/backlog/atlas-transformation-methodology.yaml` ; son activation nécessite une publication avec `release.py --guide`.

Les quatre espaces principaux sont Cartographie, Scénarios métier, Glossaires et Méthodologie de transformation. La navigation locale affiche l’arbre, les flux ou les rubriques appropriées. La recherche globale comprend les notions actives et les chapitres du guide associé à la publication. Les liens `[libellé](method:MOD015)` affichent la définition courte du glossaire méthodologique au survol et au focus. Le toucher ouvre directement la définition et son retour contextuel. Les notes de maintenance du guide restent dans `editorial_notes`, séparées de la lecture courante. Les notions retirées restent accessibles par leurs anciens liens avec un avertissement explicite.

Contrôles : `python -m unittest discover -s app -p test_modeling_guide.py`, tests frontend, build puis `node app/verify-modeling-guide.mjs` (navigateur isolé sans ouverture de fenêtre ni serveur supplémentaire).

`pnpm --dir app verify:ux` vérifie la lecture directe, les liens méthodologiques, la recherche, les relations conservées, les retours avec filtres et position, le parcours choisi après rechargement, le clavier et quatre vues mobiles. Le nouveau guide est injecté uniquement dans cette fixture ; il n’est jamais servi par Atlas avant publication. Ce contrôle fait aussi partie de `pnpm --dir app verify`.

Dans la navigation, Cartographie désigne l’objet consulté ; Urbanisation désigne la démarche dans les contenus de méthode. Le fil d’Ariane affiche Cartographie sans lien à l’accueil et permet d’y revenir depuis une fiche. Le bandeau du menu indique Parcourir ; l’entrée Cartographie est l’unique accès à cet espace dans le menu.

Le guide préparé [U806](../modeles/modeling-guides/versions/2026-09-28.1.yaml) simplifie le glossaire méthodologique : 21 entrées en trois groupes (objets et liens, qualificatifs, notions connexes). Ses renvois explicites réunissent les doublons, les types sont consultables dans une seule fiche, et les conventions rejoignent la méthode ou l’aide sur les codes. L’index et la recherche suivent ces métadonnées de la publication sélectionnée ; les anciennes éditions gardent leur présentation. Cette édition U806 reste une référence historique de simplification. Le guide de transformation actuel prolonge ce travail et est associé aux publications depuis v041 ; le front ne lit jamais le backlog. La recette UX lit directement l’édition figée U806 et l’injecte dans une fixture isolée ; aucune copie de travail U806 n’est maintenue.


## Conservation du contenu et contrôle de livraison

Une publication fixée dans l’URL affiche un bandeau explicite et un bouton « Suivre la version courante ». Ce choix est volontaire : actualiser conserve l’édition historique ; suivre le courant retire la version du lien. Copier le lien continue à figer l’édition consultée.

Le lecteur vérifie les empreintes SHA-256 du modèle et du guide annoncées dans le catalogue. Un fichier altéré ne devient pas un contenu apparemment vide : le chargement échoue avec une possibilité de relance. Les erreurs de rendu et les anciens modules indisponibles affichent une action « Recharger Atlas », en conservant l’adresse consultée. Un onglet resté ouvert détecte aussi une nouvelle interface déployée et propose « Recharger l’application » ; une simple nouvelle publication métier ne déclenche pas ce message.

Le build compile dans un répertoire temporaire sous `app/.runtime/`, puis copie les ressources et active le catalogue et enfin le HTML. Une compilation interrompue ne vide plus `dist`. Les ressources compilées précédentes restent localement disponibles pour les onglets déjà ouverts. Un déploiement Pages peut remplacer ces anciennes ressources ; le dispositif de reprise du lecteur couvre ce cas.

`pnpm --dir app verify:content` parcourt le contenu réellement compilé, sans injection de backlog : flux, scénarios, tous leurs parcours, contributions dans les fiches, huit chapitres, six repères, glossaire méthodologique et schémas. Le contrôle compare les textes attendus aux textes rendus, ouvre les détails, vérifie les références, les chemins courants et fixes et les vues mobile/ordinateur. Il fait partie de `pnpm --dir app verify` et bloque la livraison en cas d’omission. `--url URL` permet de rejouer cette recette sur un site servi avec les données du build local comme référence.

Le build produit `delivery.json`, une empreinte des fichiers nécessaires au lecteur et au contenu courant. Le workflow conserve ce manifeste comme artefact distinct. Après le déploiement, `scripts/atlas_delivery.py` compare les octets réellement servis avec cet artefact vérifié. Un déploiement techniquement réussi avec un ancien catalogue, un guide tronqué ou un module différent est donc en échec. Le vert de la chaîne inclut ce contrôle après mise en ligne.

Avant de livrer une modification transversale : tests Python concernés (suite complète pour l’audit transversal), tests frontend, build, `pnpm --dir app verify`, puis contrôle du workflow complet et du site effectivement servi. Une recette de candidat isolé ne remplace jamais la recette de la publication réelle.

## Mesurer le temps de publication

`scripts/release.py` expose les durées de lecture du courant, construction et validation du candidat, préparation, publication, export statique et contrôle Atlas dans `timings_seconds`. L’export détaille aussi lecture du catalogue, modèles, guides, sérialisation et écriture. Ces mesures distinguent le travail local de l’attente du déploiement GitHub.

Pour mesurer l’export sans modifier le site servi ni créer de publication :

```powershell
python scripts/benchmark_atlas_export.py --runs 2
```

Les données et mesures vont dans un répertoire unique sous `.runtime/atlas-benchmarks/`. `--profile` ajoute un profil Python, avec son coût de mesure ; `--compare CHEMIN` impose une égalité octet par octet avec un export de référence. Comparer les mêmes options et distinguer un premier passage sans cache de parsing d’un passage avec cache déjà chargé.

L’export vérifie une fois l’inventaire des descripteurs, puis chaque modèle et chaque guide. Il contrôle de nouveau les empreintes des descripteurs avant activation. Il conserve tous les historiques, les contrôles de contenu et l’activation atomique ; il ne réutilise pas un ancien succès de validation. Le workflow exécute les contrats Python et les contrôles du lecteur dans des jobs parallèles ; le déploiement dépend de leur réussite ainsi que du contrôle du lanceur Windows.
