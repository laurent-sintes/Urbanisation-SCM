---
name: push
description: Envoyer et intégrer les changements du projet Beaumanoir Cartographie / Urbanisation SCM via ses PR, puis vérifier le déploiement Atlas. Utiliser pour une demande de push de ce dépôt ; ce n’est ni une release métier ni le workflow FLOW-Program.
---

# Push du projet Urbanisation SCM

Situer le dépôt courant, ou utiliser `C:/Dev/Beaumanoir Cartographie`, puis lire `AGENTS.md`. Le dépôt distant autorisé pour ce workflow est **laurent-sintes/Urbanisation-SCM**, normalement nommé `origin`, en HTTPS ou avec son URL SSH équivalente. Ne pas utiliser le skill `flow-push`, propre à un autre dépôt.

Une demande de push autorise l’envoi des commits dans son périmètre et l’intégration des PR correspondantes après leurs contrôles obligatoires, sans confirmation systématique. Elle n’autorise pas la fusion de PR sans rapport avec ce lot. Une demande de préparation ou de diagnostic seule n’autorise ni envoi ni fusion. La création du skill ne l’invoque pas. Le push n’appelle pas automatiquement le skill `release` et ne valide aucun contenu métier.

À chaque demande de push de ce dépôt, rappeler dans la réponse finale le lien [Atlas distant](https://laurent-sintes.github.io/Urbanisation-SCM/), y compris si aucun commit n’est à envoyer ou si le push est bloqué. Distinguer le résultat du push de celui du déploiement Pages ; ne pas annoncer le site actualisé sans vérification du déploiement.

## Établir ce qui sera envoyé

Vérifier `git rev-parse --show-toplevel`, `git status --short --branch`, `git branch --show-current` et les URL de lecture **et d’envoi** avec `git remote get-url origin` et `git remote get-url --push origin`. Elles doivent désigner exactement le dépôt autorisé. Si elles ciblent un autre dépôt ou plusieurs destinations d’envoi, résoudre l’écart au lieu d’envoyer les données ailleurs. Ne jamais inclure un jeton dans une URL ou afficher les secrets du gestionnaire d’identifiants.

Utiliser la branche courante et son upstream explicite. Ne pas supposer `main` si une autre branche est active. Si HEAD est détachée ou que l’upstream cible un autre dépôt, résoudre le contexte avant l’envoi. Sans upstream, publier la branche courante sous le même nom sur `origin`, puis définir son suivi. Ne pas pousser toutes les branches ou tous les tags.

Par défaut, `$push` envoie les commits locaux existants et mène les PR de ce lot jusqu’à leur intégration. Signaler les modifications non committées sans les inclure silencieusement. Une demande comme « commit et pousse » ou « pousse mes modifications » autorise aussi le commit préalable : suivre alors `skills/commit/SKILL.md` du projet, puis revenir ici. Si aucun commit n’est en attente, vérifier d’abord si une PR déjà poussée de la branche courante ou explicitement désignée attend son intégration ; sinon, donner le constat.

Actualiser les références avec `git fetch origin`, puis examiner les commits locaux à envoyer, leur résumé de fichiers et les différences avec la branche distante. Lors du premier envoi, examiner l’ensemble de l’historique local et les fichiers suivis. Confirmer que les contrôles du commit couvrent ce contenu ; relancer uniquement ceux devenus nécessaires. Les archives et informations de cartographie font partie des fichiers du projet : la destination doit être celle indiquée par Laurent. Au 13 septembre 2026, ce dépôt a été constaté public ; une modification de sa visibilité ne relève pas de ce skill.

## Gérer l’historique et envoyer

Avant un envoi autorisé, utiliser `python scripts/preflight_push.py --run` après le fetch et le commit concernés ; pour une première branche sans upstream, préciser `--base origin/main` si main est bien la base observée. Le programme contrôle destination, divergence, conflits et fraîcheur des preuves de tests. `--working --offline --run` ne prépare que le lot local et n'autorise pas un push. Ne pas contourner un refus ni un contrôle en échec. Le plan de contrôles est commun à la CI ; les reçus ne sont réutilisés qu'à empreintes et environnement identiques.

Lorsque main exige une PR et le statut `Atlas checks`, envoyer la branche de travail puis créer ou actualiser sa PR vers main. Attacher la PR à la conversation après création. Ne pas affaiblir les protections, y compris pour l'administrateur.

Si la branche est uniquement en retard, une avance rapide peut la synchroniser lorsque le répertoire est propre. Si les historiques divergent, ne pas forcer : examiner les changements et intégrer ceux du distant en préservant le travail local. Respecter un choix de merge/rebase explicite et les règles du dépôt ; sans stratégie établie, préférer une fusion qui conserve les commits. Ne pas masquer une perte ou résoudre un conflit métier en inventant un arbitrage. S’il reste un conflit non résolu, signaler ce qui empêche l’envoi.

Avec un upstream correct, pousser explicitement la branche visée :

```powershell
git push origin HEAD:refs/heads/BRANCHE_DISTANTE
```

Au premier envoi de la branche courante :

```powershell
git push -u origin BRANCHE_COURANTE
```

Remplacer les repères par les branches effectivement observées. N’utiliser ni force, ni mirror, ni suppression distante. Si une protection de branche refuse l’envoi, suivre le processus prévu par le dépôt ; ne pas modifier sa protection pour le contourner.

Après succès, vérifier la référence distante avec `git ls-remote origin refs/heads/BRANCHE_DISTANTE`, comparer son hash à `git rev-parse HEAD`, puis vérifier le statut local. En cas de résultat réseau incertain, lire d’abord la référence distante avant de réessayer. Signaler le dépôt, la branche, le commit envoyé et les changements locaux restant hors de cet envoi. Si l’authentification ou une permission manque, identifier précisément le blocage ; ne pas créer un autre dépôt ni changer sa visibilité comme solution de repli.

## Intégrer les PR du lot

Lister les PR ouvertes du dépôt et retenir seulement celles de la branche envoyée, des branches appartenant explicitement au même lot, ou celles désignées par Laurent. Pour chacune, vérifier la base, le commit de tête exact, le diff final, les contrôles requis et la possibilité de fusion. Ne pas fusionner une PR brouillon, conflictuelle, dont le commit a changé pendant la vérification, ou dont les contrôles ou revues obligatoires sont en attente ou en échec. Si plusieurs PR dépendent les unes des autres, les traiter dans leur ordre de dépendance en réévaluant chacune après la fusion précédente ; ne pas toucher aux PR étrangères au lot.

Fusionner la PR autorisée avec la stratégie habituelle du dépôt, sans `--admin`, `--force` ni contournement des protections. Avec `gh pr merge`, utiliser `--match-head-commit SHA` pour refuser une tête modifiée entre la vérification et la fusion. Si GitHub refuse, diagnostiquer le blocage et conserver la PR ouverte. Après fusion, relever le commit réellement créé sur `main` et vérifier la référence distante ; ne pas confondre ce commit avec celui de la branche de PR.

Vérifier systématiquement l’exécution distante après le push : identifier les workflows GitHub attendus pour les chemins modifiés, retrouver le run du commit envoyé et attendre sa conclusion. Pour Atlas Pages, contrôler aussi le `delivery.json` et `data/index.json` réellement servis : leur commit et leur version doivent correspondre au déploiement attendu. Si un workflow attendu ne démarre pas, échoue ou si Pages sert encore l’ancienne version, diagnostiquer le blocage et le signaler ; ne pas assimiler le succès de `git push` à celui du déploiement. Si les chemins poussés ne déclenchent aucun workflow, le constater explicitement.

Après la fusion, attendre le workflow du commit de `main` et vérifier le déploiement Pages avec `python scripts/follow_delivery.py --commit SHA_MAIN --deploy`. Ce script compare le manifeste de confiance du build exact aux fichiers réellement servis. Sans `--deploy`, il suit seulement les contrôles de la PR ; une absence de workflow ou de déploiement reste un résultat explicite. Si le changement fusionné ne déclenche pas le workflow Pages, comparer le contenu déjà servi et signaler qu'aucun nouveau déploiement n'était attendu ; ne pas fabriquer un nouveau commit pour déclencher le site.

## Lecture distante sous sandbox Windows

Si git ls-remote ou gh run list echoue avec getaddrinfo() thread failed to start ou une erreur de connexion API apres un push reussi, relancer la verification avec sandbox_permissions: require_escalated. Le bac a sable peut bloquer la lecture reseau. Ne pas conclure a une panne GitHub ni repeter la meme commande dans ce bac a sable.
