# Cartographie métier Beaumanoir — FLOW Atlas

## Développer, tester et déployer

Atlas affiche un modèle courant unique, généré directement depuis les sources désignées par [modeles/project.yaml](modeles/project.yaml). Une modification du modèle ou des glossaires devient visible après `pnpm build` ou au lancement de `pnpm dev`, sans commande de release métier. Le dossier historique `modeles/backlog/` conserve son nom pour préserver les références ; les anciennes publications restent des preuves et ne sont plus proposées dans Atlas.

Depuis la racine, installer les dépendances avec `python -m pip install -r requirements.txt` et `pnpm --dir app install --frozen-lockfile`. Les commandes suivantes sont manuelles :

| Commande | Usage |
| --- | --- |
| `pnpm dev` | Générer les données courantes et lancer le développement |
| `pnpm build` | Générer Atlas avec le modèle courant |
| `pnpm test:python` | Tests Python des contrats et parcours |
| `pnpm test:frontend` | Contrôles de code et tests de l’interface |
| `pnpm test:browser` | Build puis recettes navigateur essentielles |
| `pnpm test` | Contrats, interface et recettes essentielles |
| `pnpm test:full` | Toutes les suites et la matrice navigateur complète |

Les recettes navigateur demandent Chromium : `pnpm --dir app exec playwright install chromium`. Sous Windows, le lanceur de tests sélectionne un Python fonctionnel et utilise les temporaires du projet.

Un commit local ne lance aucun test automatiquement. Chaque push sur GitHub déclenche le workflow **FLOW Atlas — GitHub Pages** ; les contrôles sont sélectionnés selon les fichiers modifiés. Sur `main`, le déploiement suit leur réussite. Les mêmes tests restent accessibles dans GitHub Actions via **Run workflow**. Aucun test local n’est imposé par une simple demande de commit ou de push.

Les descriptions plus anciennes de Backlog/Release ci-dessous conservent leur contexte historique ; ce parcours courant les remplace.

## Deux dépôts et deux sites Atlas

`origin` conserve le dépôt personnel en lecture et deux URL d’envoi : `https://github.com/laurent-sintes/Urbanisation-SCM.git` et `https://beaumanoir.ghe.com/solution-ai/Urbanisation-SCM.git`. `git push origin main:refs/heads/main` envoie donc le même commit aux deux dépôts. Le remote `beaumanoir` sert à vérifier ou reprendre séparément l’envoi vers l’entreprise. Après un envoi partiel, contrôler les deux références avant de reprendre uniquement celle en retard.

Chaque dépôt lance sa CI au push puis déploie son Atlas sur `main` après réussite des contrôles : [Atlas personnel](https://laurent-sintes.github.io/Urbanisation-SCM/) et [Atlas Beaumanoir](https://solution-ai-urbanisation-scm.pages.beaumanoir.ghe.com/). Le dépôt et le site Beaumanoir sont privés. Le site requiert l’authentification d’entreprise ; sa vérification de déploiement repose sur les API authentifiées et l’artefact du build, sans requête HTTP anonyme au contenu protégé.

Le parcours agent est décrit dans le [skill push](skills/push/SKILL.md). Les commandes de suivi sont `python scripts/follow_delivery.py --commit SHA --deploy` pour le personnel et la même commande avec `--target beaumanoir` pour l’entreprise. Aucun test local n’est déclenché par ces commandes.

**[Ouvrir FLOW Atlas sur GitHub Pages](https://laurent-sintes.github.io/Urbanisation-SCM/)** — Explorer la cartographie métier en ligne.

Ce dépôt réunit le modèle métier cible de Beaumanoir, les sources qui justifient ses choix et l’application FLOW Atlas. La cartographie décrit les capacités métier, leurs relations et les scénarios qui les mobilisent, avec un approfondissement de Supply Chain Management et de ses liens avec les domaines voisins.

## Explorer la cartographie

Atlas permet de naviguer dans la carte, de lire les fiches métier et de suivre les échanges entre périmètres. La recherche, le glossaire, les principes directeurs et les comparaisons avec les logiciels du marché accompagnent la lecture.

Les sources du modèle courant sont désignées par [modeles/project.yaml](modeles/project.yaml). Le build assemble le modèle, son vocabulaire et ses qualifications métier. Construire ou déployer Atlas ne vaut pas accord sur son contenu.

## Se repérer dans le dépôt

| Besoin | Point d’entrée |
| --- | --- |
| Consulter le modèle courant | [FLOW Atlas](https://laurent-sintes.github.io/Urbanisation-SCM/) · [Sources du modèle](modeles/project.yaml) |
| Faire évoluer le modèle | [Modèle YAML](modeles/backlog/model.yaml) · [Guide des modèles](modeles/README.md) |
| Comprendre les termes | [Glossaire métier](modeles/backlog/glossary.yaml) · [Glossaire méthodologique](modeles/backlog/modeling-glossary.yaml) |
| Étudier les systèmes existants | [Index du panorama As Is](modeles/panorama-as-is/current.json) |
| Retrouver les preuves et les analyses | [Connaissance métier](connaissance/) · [Références du marché](marche/README.md) · [Archives dans Git](modeles/git-history.json) |
| Développer ou administrer Atlas | [Guide de l’application](app/README.md) · [Guide des scripts](scripts/README.md) |

Le YAML fait autorité pour le modèle courant. Une modification devient visible après génération d’Atlas. Les [restitutions Markdown](restitutions/README.md) sont des vues de lecture générées. Les anciens scripts ponctuels et anciennes recettes navigateur sont conservés dans Git, hors de l’arbre de travail ; leur commit exact figure dans l’index des archives.

## Lancer Atlas localement

Le lancement nécessite Python 3.10 ou supérieur et une interface déjà compilée. La préparation de l’environnement et la compilation sont décrites dans le [guide technique](app/README.md).

Depuis PowerShell, à la racine du dépôt :

```powershell
.\Lancer-FLOW-Atlas.ps1 -NoBrowser
```

Ouvrir ensuite [Atlas local](http://127.0.0.1:8765/). Pour arrêter le serveur :

```powershell
.\Lancer-FLOW-Atlas.ps1 -Stop
```

Le [mode atelier](skills/atlas-workshop/SKILL.md) permet de recueillir des points chauds localement avant leur intégration au modèle courant.

## Faire évoluer et publier

Les [conventions de modélisation](CONVENTIONS-MODELE.md) et les [instructions de travail](AGENTS.md) encadrent les modifications, la traçabilité et les contrôles.

La livraison suit deux opérations Git :

- **[Commit](skills/commit/SKILL.md)** : vérifier et enregistrer les changements dans Git localement.
- **[Push](skills/push/SKILL.md)** : envoyer les commits vers GitHub, puis vérifier les contrôles et le déploiement attendu sur Pages.

Le build génère directement Atlas depuis le modèle courant. Aucune release métier intermédiaire n’est nécessaire.

L’administration du serveur local suit la procédure [server-admin](skills/server-admin/SKILL.md).

## Sources et historique

Les [contributions utilisateur](connaissance/01-contributions-utilisateur.md), les [corrections](connaissance/04-corrections.md), le [journal](JOURNAL.md) et les [archives initiales](archive/) conservent les apports et les étapes de construction. Les anciens états du dépôt et des publications restent accessibles dans Git ; les documents datés décrivent le modèle de leur époque.
