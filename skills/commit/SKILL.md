---
name: commit
description: Vérifier et créer un commit local des changements du projet Beaumanoir Cartographie / Urbanisation SCM. Utiliser pour une demande de commit Git de ce projet ; ne publie ni release métier ni commits sur GitHub.
---

# Commit du projet Urbanisation SCM

Travailler dans le dépôt courant s’il correspond au projet, sinon dans `C:/Dev/Beaumanoir Cartographie`. Lire `AGENTS.md`, puis vérifier la racine avec `git rev-parse --show-toplevel`. Parler français et tutoyer Laurent. Le remote attendu est `https://github.com/laurent-sintes/Urbanisation-SCM.git` (l’équivalent SSH sur ce même dépôt est acceptable).

Une demande de commit autorise sa création locale. Ne pas ajouter une confirmation systématique. Une demande de revue seule n’autorise pas le commit. Le modèle courant est défini par `modeles/project.yaml` ; un commit ne constitue pas un accord métier.

## Déterminer le contenu

Lire `git status --short --branch` et `git diff --stat`, puis examiner les différences et nouveaux fichiers utiles au périmètre. Réutiliser la revue déjà effectuée dans la tâche tant que le contenu n’a pas changé ; approfondir seulement les écarts nouveaux ou non examinés. Pour les captures historiques et registres volumineux, vérifier le périmètre et l’intégrité sans relancer un audit métier ni reparcourir tout le YAML. Respecter les changements déjà indexés ; ne pas embarquer des changements étrangers ni désindexer le travail de Laurent pour recomposer arbitrairement l’index. Si l’index contient des changements étrangers qui ne peuvent pas être séparés avec certitude, présenter le conflit concret avant de committer.

Vérifier l’identité locale avec `git var GIT_AUTHOR_IDENT`. Utiliser la configuration existante ; ne pas modifier l’identité globale. L’identité GitHub connectée et son adresse GitHub sans réponse peuvent être configurées localement lors de l’initialisation du dépôt. Ne pas inventer une adresse personnelle ni ajouter de coauteur sans demande.

Exclure les fichiers locaux désignés par `.gitignore` : état/logs/captures du serveur, dépendances d’outillage, caches, tests temporaires et candidats de staging. Les sources des skills dans `skills/`, les archives d’origine, les modèles, leurs preuves gelées et leurs restitutions sont versionnés. Respecter `.gitattributes` : aucune conversion de fins de ligne ne doit invalider les empreintes des fichiers figés.

## Vérifier et enregistrer

Le commit ne déclenche aucun test ni build et n’impose aucun précontrôle de tests local. Les tests automatiques s’exécutent sur GitHub après le push. Ne pas lancer `preflight_push.py --run` lors d’une simple demande de commit. Relire le diff et les liens concernés ; les résultats de développement déjà disponibles peuvent être signalés sans être rejoués. Les tests locaux restent accessibles manuellement avec `pnpm test` et ses variantes décrites dans `README.md`.

Indexer les chemins explicites avec `git add -- <chemins>`, puis vérifier avec `git diff --cached --stat` que le contenu indexé correspond au périmètre examiné ; relire seulement les écarts éventuels. `git diff --cached --check` signale notamment les erreurs de conflit et d’espace ; distinguer les contenus historiques conservés à l’identique d’une erreur nouvelle. Ne pas reformater les preuves gelées pour supprimer un avertissement de style. Ne pas utiliser `git add -f` pour contourner les exclusions sans motif autorisé.

Choisir un message concis en français décrivant le changement effectif. Utiliser `git commit -m` pour une ligne ou un fichier UTF-8 avec `git commit -F` pour un message multilignes. Ne pas contourner les hooks ni les contrôles en échec. Ne pas amender ou réécrire un ancien commit sauf demande explicite.

Après création, lire `git log -1 --oneline` et `git status --short --branch`. Signaler le hash, le sujet, les contrôles utiles et les changements restants. S’il n’y a rien à committer, le dire sans créer un commit vide. Ne pas pousser automatiquement : l’envoi relève du skill `push` et de la demande correspondante.
