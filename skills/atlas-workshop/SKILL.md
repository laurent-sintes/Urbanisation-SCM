---
name: atlas-workshop
description: Recueillir des points chauds dans Atlas local, puis préparer et intégrer le staging au backlog avec contrôle des conflits et des sources. Utiliser pour une séance d’atelier, un post-it ou sa reprise après séance ; la release reste distincte.
---

# Atelier local FLOW Atlas

Travailler dans `C:/Dev/Beaumanoir Cartographie` après lecture des règles applicables d’`AGENTS.md`. Parler français et tutoyer Laurent. Le staging `.runtime/atlas-atelier/staging.json` est local, ignoré par Git et distinct du backlog comme des publications. Ce skill n’accorde aucune validation métier et ne déclenche ni release, ni commit, ni push.

## Pendant la séance

Le serveur local lit le staging toutes les deux secondes, sans recevoir d’écriture HTTP. Vérifier que l’Atlas ouvert correspond au dépôt et à la publication de base ; le lanceur et `skills/server-admin/SKILL.md` servent aux demandes de démarrage ou de redémarrage. Le nouveau code serveur doit être redémarré une fois avant la première séance. Si la publication courante change pendant l’atelier, conserver le staging et traiter le conflit ; ne pas le rebaser silencieusement.

Lire l’état avec `python scripts/atlas_workshop.py status`. Démarrer si nécessaire avec `python scripts/atlas_workshop.py start`. La première édition peut aussi créer la séance, mais démarrer explicitement fixe sa base et permet de la montrer à Laurent. Les opérations portent un type d’objet ; seul `hotspot` est implémenté pour l’instant.

Pour chaque demande, retrouver les identifiants exacts des ancrages dans la publication servie. Préparer un petit fichier JSON de requête dans `.runtime/atlas-atelier/`, puis appeler `python scripts/atlas_workshop.py apply --input CHEMIN`. La requête doit contenir `expected_revision`, lu dans le staging courant, `entity: "hotspot"`, `action: "add"`, `"update"` ou `"remove"`, et `verbatim` : les mots exacts de la demande reçue par Codex. `note` peut porter une interprétation distincte. Ne pas attribuer automatiquement à Laurent les propos d’un autre participant ni inventer difficulté, décision ou accord ; les valeurs absentes restent non évaluées ou à confirmer.

Exemple d’ajout :

```json
{
  "expected_revision": 0,
  "entity": "hotspot",
  "action": "add",
  "fields": {
    "title": "Interface C-LOG",
    "kind": "integration",
    "location": {"node_ids": ["supply-chain-orchestration", "domain-logistics-execution"]},
    "problem": "Clarifier qui décide du site d’expédition."
  },
  "verbatim": "Ajoute un point chaud entre Logistics et Supply Chain Orchestration : qui décide du site d’expédition ?",
  "note": "Question transmise à Codex pendant l’atelier ; auteur initial à confirmer."
}
```

Pour modifier, fournir l’`id` et les seuls champs concernés dans `fields` ; pour retirer, fournir l’`id` sans `fields`. Le retrait d’un point chaud publié est un masquage dans l’atelier, jamais une modification de la publication. Les nouveaux identifiants `AT-HS-*` sont provisoires. Relire le résultat et vérifier que la révision du staging a augmenté. Un échec ne justifie pas une nouvelle opération concurrente : examiner l’erreur, relire la révision et corriger la requête. Le panneau « Mode atelier » et le menu « Télécharger » donnent accès au staging et au modèle de travail complet. Après sauvegarde, `python scripts/atlas_workshop.py close --expected-revision N` archive la séance localement et retire sa superposition ; `start` pourra ensuite créer une nouvelle séance. Ne pas clôturer sans demande explicite.

## Après la séance

Conserver le staging téléchargé ou son archive locale. Sur demande de reprise, exécuter `python scripts/atlas_workshop_import.py preview --staging CHEMIN --output .runtime/atlas-atelier/import-plan.json`. Pour retenir une partie seulement, ajouter `--include AT-HS-001` ou `--include HS-002` pour chaque objet ; l’aperçu doit être régénéré. Lire les actions, les champs, les verbatims et les conflits. Un conflit impose un examen métier des valeurs avant une nouvelle tentative ; ne jamais forcer l’écriture. Un retrait publié exige l’examen de ses références et de son historique.

Enregistrer ensuite l’identifiant `session_id` et les verbatims exacts des opérations retenues dans un nouveau bloc `U…` de `connaissance/01-contributions-utilisateur.md`, avec la portée « propositions recueillies en atelier, sans validation ». Décrire la transmission à Codex et laisser l’attribution des participants inconnue si nécessaire. Ne pas enregistrer de nouveau les verbatims déjà capturés sous un identifiant U valable : le lot doit renvoyer à sa source réelle. Actualiser l’index avec `python scripts/refresh_sources.py`.

Une fois la source indexée, lancer `python scripts/atlas_workshop_import.py apply --plan .runtime/atlas-atelier/import-plan.json --source-ref Uxxx`. Le script contrôle la publication de base, la révision du staging, le hash du backlog, les conflits par champ et le modèle candidat, puis remplace uniquement le bloc YAML `hotspot_catalog` et la date `as_of`. Il convertit les identifiants provisoires en identifiants canoniques et marque les fiches proposées, sans accord implicite. Si l’aperçu est périmé, le refaire. Ensuite exécuter `python scripts/validate_models.py` et `python scripts/render_models.py --space backlog` puisque la vue des points chauds change ; vérifier l’alignement du glossaire selon `AGENTS.md`. Le JSON de travail téléchargé est un export de lecture, pas l’entrée de l’import. La release reste une opération séparée et explicitement demandée.
