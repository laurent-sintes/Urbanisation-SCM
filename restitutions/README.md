# Restitutions des modèles

Les vues Markdown du backlog et de la release sont générées localement depuis le YAML canonique et la publication explicitement sélectionnée. `backlog.md` et `release.md` ne sont plus versionnés : ils ne constituent pas une deuxième source à maintenir. Leurs anciens états restent dans Git. Le [panorama As Is](panorama-as-is.md), les propositions et les illustrations sont conservés.

Exécuter `python scripts/render_models.py --space backlog` ou `--space release` pour créer la vue souhaitée. Sans filtre, la commande conserve la génération complète. Les analyses et insights restent dans `connaissance/` et `marche/`. L’exploration interactive est disponible dans [FLOW Atlas](../app/README.md).
