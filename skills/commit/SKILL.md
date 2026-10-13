---
name: commit
description: Vérifier et créer un commit local des changements du projet Beaumanoir Cartographie / Urbanisation SCM. Utiliser pour une demande de commit Git de ce projet ; ne publie ni release métier ni commits sur GitHub.
---

# Commit du projet Urbanisation SCM

Travailler dans le dépôt courant s’il correspond au projet, sinon dans `C:/Dev/Beaumanoir Cartographie`. Lire `AGENTS.md`, puis vérifier la racine avec `git rev-parse --show-toplevel`. Parler français et tutoyer Laurent. Le remote attendu est `https://github.com/laurent-sintes/Urbanisation-SCM.git` (l’équivalent SSH sur ce même dépôt est acceptable).

Une demande de commit autorise sa création locale. Ne pas ajouter une confirmation systématique. Une demande de revue seule n’autorise pas le commit. Le backlog reste l’espace métier de travail ; un commit n’est pas une validation de capacité ni une release du modèle.

## Déterminer le contenu

Lire `git status --short --branch` et `git diff --stat`, puis examiner les différences et nouveaux fichiers utiles au périmètre. Réutiliser la revue déjà effectuée dans la tâche tant que le contenu n’a pas changé ; approfondir seulement les écarts nouveaux ou non examinés. Pour les captures historiques et registres volumineux, vérifier le périmètre et l’intégrité sans relancer un audit métier ni reparcourir tout le YAML. Respecter les changements déjà indexés ; ne pas embarquer des changements étrangers ni désindexer le travail de Laurent pour recomposer arbitrairement l’index. Si l’index contient des changements étrangers qui ne peuvent pas être séparés avec certitude, présenter le conflit concret avant de committer.

Vérifier l’identité locale avec `git var GIT_AUTHOR_IDENT`. Utiliser la configuration existante ; ne pas modifier l’identité globale. L’identité GitHub connectée et son adresse GitHub sans réponse peuvent être configurées localement lors de l’initialisation du dépôt. Ne pas inventer une adresse personnelle ni ajouter de coauteur sans demande.

Exclure les fichiers locaux désignés par `.gitignore` : état/logs/captures du serveur, dépendances d’outillage, caches, tests temporaires et candidats de staging. Les sources des skills dans `skills/`, les archives d’origine, les modèles, leurs preuves gelées et leurs restitutions sont versionnés. Respecter `.gitattributes` : aucune conversion de fins de ligne ne doit invalider les empreintes des fichiers figés.

## Vérifier et enregistrer

Pour une intégration destinée à GitHub, sélectionner les contrôles nécessaires d'après les fichiers modifiés et les exécuter une fois. `python scripts/preflight_push.py --working --offline` peut aider à diagnostiquer le contexte Git ; son mode `--run` complet n'est pas systématique. Cette commande ne committe pas et ne remplace pas la revue du diff. Les résultats valables restent réutilisables après le commit ; une capture n'est jamais une validation métier. Le parcours courant publie directement sur `main` après validation locale.

Le commit clôt le travail vérifié. Réutiliser les validations, tests et rendus réussis dans la tâche lorsque leurs entrées, leur code et leur contexte sont inchangés. S’appuyer sur les résultats disponibles, sans créer un nouveau rapport ou checkpoint pour le seul commit. Rejouer uniquement après un changement pertinent, un échec ou un doute restant ; la date d’un rapport seule ne prouve pas sa validité.

Pour les contrôles restant nécessaires, adapter leur portée aux fichiers modifiés :

- Modèles, décisions, provenance ou scripts associés : `python scripts/validate_models.py`. Après nouvelles sources, actualiser l’index courant avec `python scripts/refresh_sources.py` si nécessaire ; après modèle modifié, régénérer uniquement l’espace concerné, par exemple `python scripts/render_models.py --space backlog`.
- Python : exécuter les tests des contrats et parcours touchés. Une attente de test adaptée à une évolution métier ne déclenche pas à elle seule la suite complète ; utiliser le module concerné si son résultat n’est pas déjà acquis. Réserver `python -m unittest discover -s scripts -p "test_*.py"` aux changements transversaux pour lesquels les tests ciblés ne couvrent pas suffisamment les impacts, ou à une demande explicite.
- Lecteur ou application modifiés : `python app/server.py --check`, puis les tests pertinents décrits dans `app/README.md`.
- Skills modifiés : valider leur structure avec le validateur `skill-creator` disponible, et vérifier les instructions et leurs copies personnelles si leur installation est demandée ou fait partie de la modification.
- Documentation seule : vérifier liens et cohérence ; ne pas lancer toutes les suites sans motif.

Indexer les chemins explicites avec `git add -- <chemins>`, puis vérifier avec `git diff --cached --stat` que le contenu indexé correspond au périmètre examiné ; relire seulement les écarts éventuels. `git diff --cached --check` signale notamment les erreurs de conflit et d’espace ; distinguer les contenus historiques conservés à l’identique d’une erreur nouvelle. Ne pas reformater les preuves gelées pour supprimer un avertissement de style. Ne pas utiliser `git add -f` pour contourner les exclusions sans motif autorisé.

Choisir un message concis en français décrivant le changement effectif. Utiliser `git commit -m` pour une ligne ou un fichier UTF-8 avec `git commit -F` pour un message multilignes. Ne pas contourner les hooks ni les contrôles en échec. Ne pas amender ou réécrire un ancien commit sauf demande explicite.

Après création, lire `git log -1 --oneline` et `git status --short --branch`. Signaler le hash, le sujet, les contrôles utiles et les changements restants. S’il n’y a rien à committer, le dire sans créer un commit vide. Ne pas pousser automatiquement : l’envoi relève du skill `push` et de la demande correspondante.
