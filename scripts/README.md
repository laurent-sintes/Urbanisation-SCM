# Outils du modèle courant

Les commandes usuelles partent de la racine du dépôt :

| Besoin | Commande |
| --- | --- |
| Développer Atlas | `pnpm dev` |
| Construire Atlas depuis les sources courantes | `pnpm build` |
| Lancer les tests manuellement | `pnpm test` et ses variantes dans le README racine |
| Inspecter une fiche ou un périmètre | `python scripts/inspect_model.py --help` |
| Contrôler les contrats des modèles | `python scripts/validate_models.py` |
| Actualiser l’index des contributions | `python scripts/refresh_sources.py` |
| Capturer un accord explicite | `python scripts/record_decision.py --help` |

`modeles/project.yaml` désigne les sources utilisées par `current_model.py`. `build_atlas.py` assemble le site ; `export_atlas.py` produit ses données. Aucun de ces outils ne crée un accord métier.

Les scripts ponctuels nommés d’après une ancienne contribution, les trois anciens rendus de refonte et les benchmarks de préparation de release ont été retirés de l’arbre courant. Leurs octets restent accessibles au commit exact indiqué dans `modeles/git-history.json`. Pour étudier ou rejouer une ancienne opération, utiliser son état Git d’origine dans un checkout isolé.

Certains modules gardent un nom historique, notamment `publish_release.py`, `release_catalog.py`, `prepare_release.py` et `decision_review.py`. Ils servent encore à compiler des données de lecture, vérifier les preuves ou tester les contrats historiques. Leur présence ne rétablit pas une étape de release dans le fonctionnement courant.
