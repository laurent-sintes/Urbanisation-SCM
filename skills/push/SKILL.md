---
name: push
description: Envoyer les commits du projet Beaumanoir Cartographie / Urbanisation SCM vers github.com/laurent-sintes/Urbanisation-SCM. Utiliser pour une demande de push de ce dépôt ; ce n’est ni une release métier ni le workflow FLOW-Program.
---

# Push du projet Urbanisation SCM

Situer le dépôt courant, ou utiliser `C:/Dev/Beaumanoir Cartographie`, puis lire `AGENTS.md`. Le dépôt distant autorisé pour ce workflow est **laurent-sintes/Urbanisation-SCM**, normalement nommé `origin`, en HTTPS ou avec son URL SSH équivalente. Ne pas utiliser le skill `flow-push`, propre à un autre dépôt.

Une demande de push autorise l’envoi des commits dans son périmètre, sans confirmation systématique. Une demande de préparation ou de diagnostic seule n’autorise pas l’envoi. La création du skill ne l’invoque pas. Le push n’appelle pas automatiquement le skill `release` et ne valide aucun contenu métier.

À chaque demande de push de ce dépôt, rappeler dans la réponse finale le lien [Atlas distant](https://laurent-sintes.github.io/Urbanisation-SCM/), y compris si aucun commit n’est à envoyer ou si le push est bloqué. Distinguer le résultat du push de celui du déploiement Pages ; ne pas annoncer le site actualisé sans vérification du déploiement.

## Établir ce qui sera envoyé

Vérifier `git rev-parse --show-toplevel`, `git status --short --branch`, `git branch --show-current` et les URL de lecture **et d’envoi** avec `git remote get-url origin` et `git remote get-url --push origin`. Elles doivent désigner exactement le dépôt autorisé. Si elles ciblent un autre dépôt ou plusieurs destinations d’envoi, résoudre l’écart au lieu d’envoyer les données ailleurs. Ne jamais inclure un jeton dans une URL ou afficher les secrets du gestionnaire d’identifiants.

Utiliser la branche courante et son upstream explicite. Ne pas supposer `main` si une autre branche est active. Si HEAD est détachée ou que l’upstream cible un autre dépôt, résoudre le contexte avant l’envoi. Sans upstream, publier la branche courante sous le même nom sur `origin`, puis définir son suivi. Ne pas pousser toutes les branches ou tous les tags.

Par défaut, `$push` envoie les commits locaux existants. Signaler les modifications non committées sans les inclure silencieusement. Une demande comme « commit et pousse » ou « pousse mes modifications » autorise aussi le commit préalable : suivre alors `skills/commit/SKILL.md` du projet, puis revenir ici. Si aucun commit n’est en attente et que la demande n’autorise pas la création d’un commit, donner le constat.

Actualiser les références avec `git fetch origin`, puis examiner les commits locaux à envoyer, leur résumé de fichiers et les différences avec la branche distante. Lors du premier envoi, examiner l’ensemble de l’historique local et les fichiers suivis. Confirmer que les contrôles du commit couvrent ce contenu ; relancer uniquement ceux devenus nécessaires. Les archives et informations de cartographie font partie des fichiers du projet : la destination doit être celle indiquée par Laurent. Au 13 septembre 2026, ce dépôt a été constaté public ; une modification de sa visibilité ne relève pas de ce skill.

## Gérer l’historique et envoyer

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

Vérifier systématiquement l’exécution distante après le push : identifier les workflows GitHub attendus pour les chemins modifiés, retrouver le run du commit envoyé et attendre sa conclusion. Pour Atlas Pages, contrôler aussi le `delivery.json` et `data/index.json` réellement servis : leur commit et leur version doivent correspondre au déploiement attendu. Si un workflow attendu ne démarre pas, échoue ou si Pages sert encore l’ancienne version, diagnostiquer le blocage et le signaler ; ne pas assimiler le succès de `git push` à celui du déploiement. Si les chemins poussés ne déclenchent aucun workflow, le constater explicitement.
