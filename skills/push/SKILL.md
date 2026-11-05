---
name: push
description: Pousser directement les commits validés du projet Beaumanoir Cartographie sur main et vérifier la CI ainsi que le déploiement Atlas. À utiliser pour une demande de push de ce dépôt ; les tests sont exécutés par GitHub après le push.
---

# Push direct d'Urbanisation SCM

Travailler dans `C:/Dev/Beaumanoir Cartographie` et lire `AGENTS.md`. Le seul distant autorisé est `laurent-sintes/Urbanisation-SCM` (HTTPS ou SSH), avec une seule URL d'envoi. Une demande de push autorise l'envoi des commits du lot sur `main` sans PR ni confirmation répétée. Si Laurent demande aussi un commit, suivre `skills/commit/SKILL.md` d'abord. Atlas est construit à partir du modèle courant, sans étape de release métier.

## Préparer

Vérifier racine, branche, statut, commits à envoyer et URL de lecture/envoi d'`origin`. Faire `git fetch origin`, comparer `HEAD` à `origin/main`, puis examiner le diff du lot. Préserver les changements locaux sans rapport. Le travail validé sur une branche de travail rejoint `main` par avance rapide lorsque c'est possible ; ne pas créer de PR pour ce parcours. Si `main` a avancé, examiner ses changements avant intégration. Ne jamais forcer, écraser un historique ou résoudre un conflit métier sans fondement.

Ne lancer aucun test ni build local automatiquement pour une demande de push. Les tests sont exécutés sur GitHub après l’envoi ; les commandes locales restent manuelles. Ne pas employer `preflight_push.py --run` comme précondition au push. La revue du diff, la vérification du distant et la préservation du travail local restent nécessaires.

## Envoyer et vérifier

Pousser explicitement `main` par `git push origin main:refs/heads/main`. Ne pousser ni tags, ni autres branches, ni commits non examinés. En cas de résultat réseau incertain, lire d'abord `git ls-remote origin refs/heads/main` avant tout nouvel essai. Vérifier ensuite que cette référence correspond au commit local.

Identifier le workflow GitHub attendu pour ce commit et attendre son résultat. La CI construit Atlas, exécute les contrôles sélectionnés, puis déploie Pages seulement si tout est vert. Vérifier le `delivery.json` et le `data/index.json` réellement servis avec `python scripts/follow_delivery.py --commit SHA_MAIN --deploy`. Signaler précisément un workflow absent, un contrôle en échec ou un site encore ancien ; un push Git réussi ne prouve pas le déploiement.

Toujours fournir dans la réponse finale le lien [Atlas distant](https://laurent-sintes.github.io/Urbanisation-SCM/), même si rien n'a été envoyé.

Sous Windows, si une lecture réseau Git ou GitHub échoue avec `getaddrinfo() thread failed to start`, relancer cette lecture avec `sandbox_permissions: require_escalated`. Les écritures dans `.git/` peuvent demander cette même permission ; ne pas modifier ses ACL.
