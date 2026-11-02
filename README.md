# Cartographie métier Beaumanoir — FLOW Atlas

**[Ouvrir FLOW Atlas sur GitHub Pages](https://laurent-sintes.github.io/Urbanisation-SCM/)** — Explorer la cartographie métier en ligne.

Ce dépôt réunit le modèle métier cible de Beaumanoir, les sources qui justifient ses choix et l’application FLOW Atlas. La cartographie décrit les capacités métier, leurs relations et les scénarios qui les mobilisent, avec un approfondissement de Supply Chain Management et de ses liens avec les domaines voisins.

## Explorer la cartographie

Atlas permet de naviguer dans la carte, de lire les fiches métier et de suivre les échanges entre périmètres. La recherche, le glossaire, les principes directeurs et les comparaisons avec les logiciels du marché accompagnent la lecture.

La version courante est désignée par l’[index des publications](modeles/release/index.json). Chaque publication conserve son modèle, son vocabulaire et ses qualifications métier. Publier ne vaut pas valider l’ensemble du contenu.

## Se repérer dans le dépôt

| Besoin | Point d’entrée |
| --- | --- |
| Consulter le modèle publié | [FLOW Atlas](https://laurent-sintes.github.io/Urbanisation-SCM/) · [Index des publications](modeles/release/index.json) |
| Faire évoluer le modèle | [Backlog YAML](modeles/backlog/model.yaml) · [Guide des modèles](modeles/README.md) |
| Comprendre les termes | [Glossaire métier](modeles/backlog/glossary.yaml) · [Glossaire méthodologique](modeles/backlog/modeling-glossary.yaml) du backlog |
| Étudier les systèmes existants | [Index du panorama As Is](modeles/panorama-as-is/current.json) |
| Retrouver les preuves et les analyses | [Connaissance métier](connaissance/) · [Références du marché](marche/README.md) · [Audits](audits/) |
| Développer ou administrer Atlas | [Guide de l’application](app/README.md) · [Scripts](scripts/) |

Le YAML fait autorité pour le backlog et les nouvelles publications. Atlas affiche les publications figées ; une modification du backlog devient visible après publication. Les [restitutions Markdown](restitutions/README.md) sont des vues de lecture générées.

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

Le [mode atelier](skills/atlas-workshop/SKILL.md) permet de recueillir des points chauds localement avant leur intégration au backlog.

## Faire évoluer et publier

Les [conventions de modélisation](CONVENTIONS-MODELE.md) et les [instructions de travail](AGENTS.md) encadrent les modifications, la traçabilité et les contrôles.

Trois opérations distinctes composent la livraison :

- **[Commit](skills/commit/SKILL.md)** : vérifier et enregistrer les changements dans Git localement.
- **[Release](skills/release/SKILL.md)** : publier une version du modèle dans Atlas.
- **[Push](skills/push/SKILL.md)** : envoyer les commits vers GitHub, puis vérifier les contrôles et le déploiement attendu sur Pages.

L’administration du serveur local suit la procédure [server-admin](skills/server-admin/SKILL.md).

## Sources et historique

Les [contributions utilisateur](connaissance/01-contributions-utilisateur.md), les [corrections](connaissance/04-corrections.md), le [journal](JOURNAL.md) et les [archives initiales](archive/) conservent les apports et les étapes de construction. Les anciens états du dépôt et des publications restent accessibles dans Git ; les documents datés décrivent le modèle de leur époque.
