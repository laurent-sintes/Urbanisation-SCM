---
name: release
description: Évaluer le backlog Beaumanoir / FLOW, produire la release et la publier dans FLOW Atlas sous Urbanisation, avec actualisation des données. Utiliser pour une release du modèle ou une comparaison backlog/release ; ni release logicielle, ni push Git, ni déploiement distant.
---

# Release du modèle FLOW

Une demande de release autorise la publication locale dans Atlas. Une demande limitée à comparer ou préparer ne l’active pas. Commit, push, build et lancement du serveur restent des opérations distinctes ; ne pas les déclencher implicitement.

Lire les règles applicables d’AGENTS.md. Après les modifications du lot et l’actualisation des sources si elles ont changé :

```powershell
python scripts/release.py --source SOURCE --activate
```

Le parcours léger construit et valide une fois le candidat, prépare dans `.runtime/publication/VERSION/`, vérifie la fraîcheur et les empreintes, active le catalogue, exporte les JSON statiques puis vérifie Atlas. `scripts/export_atlas.py` lit les snapshots vérifiés et régénère `app/public/data/` ainsi que `app/dist/data/` si le build existe. Le courant se met à jour sans redémarrer le serveur. Sans `--activate`, il prépare seulement. Ne pas ajouter systématiquement un rapport préalable ni une validation globale après cette commande.

Les fichiers de la publication remplacée doivent déjà être conservés à l’identique dans Git pour pouvoir quitter l’arbre actif. Si ce contrôle bloque, expliquer le fichier concerné ; ne pas créer un commit sans autorisation. Le backlog peut contenir les modifications à publier : ses empreintes et celles du code garantissent la fraîcheur de la préparation. Les versions historiques canoniques sont lues depuis les commits exacts du catalogue technique. Les copies JSON d’Atlas sont des artefacts générés ignorés par Git.

## Résultats et reprise

- `published` : publication active, avec résultat du contrôle Atlas.
- `prepared` : reprendre la même version et les mêmes sources sans nouvelles entrées.
- `unchanged` : aucune nouvelle publication nécessaire.
- `needs_review` : lire le dossier fourni avec `prepare_release.py inspect DOSSIER --section review --id ID`, renseigner seulement les arbitrages explicitement autorisés dans `assessment.yaml`, puis reprendre avec `--review DOSSIER`.
- `blocked` : corriger les erreurs de la synthèse. Une intention périmée ne devient pas automatiquement un accord.
- `published_checks_failed` : la publication existe ; lire d’abord l’erreur `static_export` ou `atlas`. Si l’export a échoué, corriger sa cause puis relancer `python scripts/export_atlas.py`. Si seule la vérification HTTP d’Atlas a échoué, contrôler l’accès au serveur et son identité dans un environnement autorisé ; une permission refusée par le bac à sable ne prouve pas un défaut de publication. Réparer uniquement l’écart constaté, sans publier une nouvelle version.

Une source, un artefact ou le code modifié après préparation impose une nouvelle préparation. En cas d’interruption pendant les écritures, examiner les fichiers et le pointeur avant une reprise ; ne pas écraser une version existante.

## Accords et guide

Capturer les accords explicites après les éditions du lot avec `record_decision.py` ou `record_intents`. Ne sélectionner que les champs présentés et approuvés. Le registre YAML ne contient que les intentions en attente ; la publication courante porte les accords applicables. Les états antérieurs restent dans Git. Ni publication, ni commit, ni lifecycle ne donnent un accord métier.

`--guide CHEMIN_YAML` publie une édition méthodologique explicitement fournie. Sinon, le guide figé précédent est conservé. Le glossaire métier est publié avec le modèle et les versions historiques ne lisent jamais le glossaire du backlog.

Atlas utilise le port local 8765 et doit correspondre à ce projet. Après un changement de code Python, utiliser le skill server-admin pour redémarrer le serveur autorisé et vérifier son identité ; ne pas ouvrir un navigateur sans demande. Un changement de données seul ne nécessite pas de redémarrage.

Restituer version, changement principal, accords à réexaminer et disponibilité Atlas. Aucun dossier d’audit ni journal narratif supplémentaire n’est requis.
