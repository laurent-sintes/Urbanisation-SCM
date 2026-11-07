---
name: push
description: Pousser Urbanisation-SCM vers le GitHub personnel et le GitHub Beaumanoir, puis vérifier les deux CI et déploiements Atlas. Les tests sont exécutés par GitHub après le push.
---

# Push direct d'Urbanisation SCM

Travailler dans `C:/Dev/Beaumanoir Cartographie` et lire `AGENTS.md`. Deux dépôts sont autorisés : `github.com/laurent-sintes/Urbanisation-SCM` et `beaumanoir.ghe.com/solution-ai/Urbanisation-SCM`. Une demande de push autorise l’envoi du même commit sur les deux branches `main`, sans PR ni confirmation répétée. Si Laurent demande aussi un commit, suivre `skills/commit/SKILL.md` d’abord. Atlas est construit à partir du modèle courant, sans étape de release métier.

`origin` conserve une seule URL de lecture personnelle et exactement deux URL d’envoi, une par dépôt. Le remote `beaumanoir` désigne uniquement le dépôt d’entreprise, pour les lectures et les reprises ciblées. Ne pas remplacer cette configuration par un miroir destructif, un push forcé ou une URL d’envoi inconnue.

## Préparer

Vérifier racine, branche, statut, commits à envoyer et les URL de lecture/envoi des deux remotes. Faire `git fetch origin` puis `git fetch beaumanoir`. Comparer `HEAD` aux deux branches distantes et examiner le diff du lot. Préserver les changements locaux sans rapport. Le travail validé sur une branche de travail rejoint `main` par avance rapide lorsque c’est possible ; ne pas créer de PR pour ce parcours. Si une branche distante a avancé ou divergé, examiner ses changements avant intégration. Ne jamais forcer ni résoudre un conflit métier sans fondement.

Ne lancer aucun test ni build local automatiquement pour une demande de push. Les tests sont exécutés sur GitHub après l’envoi ; les commandes locales restent manuelles. Ne pas employer `preflight_push.py --run` comme précondition au push. La revue du diff, la vérification du distant et la préservation du travail local restent nécessaires.

## Envoyer et vérifier

Pousser explicitement `main` par `git push origin main:refs/heads/main` : Git l’envoie aux deux URL configurées. Ne pousser ni tags, ni autres branches, ni commits non examinés. L’envoi n’est pas atomique entre hébergeurs : vérifier séparément `git ls-remote origin refs/heads/main` et `git ls-remote beaumanoir refs/heads/main`, même après un échec. En cas de succès partiel, annoncer les deux états puis reprendre uniquement le dépôt en retard, après contrôle de sa référence ; ne pas refaire un envoi aveugle.

Identifier et attendre le workflow `atlas-pages.yml` pour ce SHA sur chacun des deux hébergeurs. La CI construit Atlas, exécute les contrôles sélectionnés, puis déploie Pages seulement si tout est vert.

- Personnel : `python scripts/follow_delivery.py --commit SHA_MAIN --deploy` vérifie les octets servis contre l’artefact du build.
- Beaumanoir : `python scripts/follow_delivery.py --target beaumanoir --commit SHA_MAIN --deploy` vérifie le workflow, l’artefact du build et le déploiement Pages authentifié au même SHA et à l’URL attendue. Le site privé exige le SSO : ne pas confondre sa page de connexion avec le contenu d’Atlas, ni prétendre avoir comparé ses octets par HTTP anonyme.

Signaler précisément tout dépôt en retard, workflow absent, contrôle en échec ou déploiement incomplet. Un push réussi sur un seul dépôt ne constitue pas un double push réussi.

Fournir les deux liens dans la réponse finale : [Atlas personnel](https://laurent-sintes.github.io/Urbanisation-SCM/) et [Atlas Beaumanoir](https://solution-ai-urbanisation-scm.pages.beaumanoir.ghe.com/). Distinguer les conclusions des deux CI et le mode de vérification des sites.

Sous Windows, si une lecture réseau Git ou GitHub échoue avec `getaddrinfo() thread failed to start`, relancer cette lecture avec `sandbox_permissions: require_escalated`. Les écritures dans `.git/` peuvent demander cette même permission ; ne pas modifier ses ACL.
