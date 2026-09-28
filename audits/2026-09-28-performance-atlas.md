# Temps de publication Atlas — analyse et optimisations

Analyse technique du 28 septembre 2026, sur la publication v043 (`2026-09-28.5`, commit `d91ba53`). Aucun contenu métier ni accord n’est modifié par ce travail.

## Mesures disponibles

| Mesure | Durée | Portée |
| --- | ---: | --- |
| Publication locale de v043 après réexamen | 129,9 s | Résultat de `release.py`, export et contrôle Atlas compris. L’instrumentation d’origine ne séparait pas ses phases. |
| Déploiement GitHub complet | 229 s | Du lancement à la fin du [run 36439650637](https://github.com/laurent-sintes/Urbanisation-SCM/actions/runs/36439650637), attente et contrôles compris. |
| Tests Python des scripts / de l’application | 68 s / 6 s | Étapes successives du job build de ce run. |
| Build / installation du navigateur / contrôles navigateur | 32 s / 23 s / 39 s | Étapes successives du même job. |
| Déploiement Pages / vérification des octets servis | 7 s / 3 s | Le transfert distant n’est pas le principal coût. |
| Export avant optimisation, sous cProfile | 57,5 s | Mesure isolée des 46 publications, avec cache de parsing déjà disponible. |
| Export optimisé, sous cProfile, cache chargé | 27,5 s | Même contenu : 93 fichiers, 104 456 865 octets de modèles et guides. |
| Export optimisé, sans cProfile, cache chargé | 25,6 s | Mesure complémentaire ; ne constitue pas une comparaison directe avec le profilage précédent. |

Les mesures locales et GitHub viennent de machines et d’exécutions différentes : elles ne doivent pas être additionnées pour reconstituer une durée exacte de conversation. Le contrôle du lanceur Windows s’exécutait déjà en parallèle, en 34 secondes.

Le premier export profilé après modification du parseur a pris 148 secondes : la signature du code a correctement invalidé son cache de parsing. Le deuxième passage est la mesure comparable au précédent export avec cache chargé. Le coût d’un cache vide reste un sujet distinct ; aucune amélioration de ce cas n’est annoncée.

## Coûts identifiés

1. **Lectures répétées de l’inventaire.** L’ancien export appelait 93 fois la résolution de publication et parcourait 94 fois les descripteurs. Il effectuait 4 650 lectures structurées. Chaque modèle était relu pour son export, puis pour son guide. Le profilage attribue 45,3 secondes cumulées à la résolution de publication ; cette durée recouvre d’autres fonctions et n’est pas additionnable à leurs durées.
2. **Copie et désérialisation inutiles.** Même une lecture servie par le cache recopie les objets pour protéger ses appelants. Les lectures redondantes avaient donc un coût réel.
3. **Réexamen trop global.** L’ajout du scénario intercompany et de TER122 a envoyé 446 accords inchangés en réexamen. `decision_carry.py` traite actuellement le catalogue autonome de scénarios comme un contexte global. Cela a nécessité une vérification supplémentaire et la reconstruction du candidat. Les portées ont été conservées, pas étendues.
4. **Contrôles indépendants exécutés en série dans GitHub.** Les 74 secondes de tests Python précédaient le build et les contrôles navigateur.
5. **Orchestration de l’agent.** Les commandes ponctuelles, lectures de diagnostic et consultations répétées d’état ont ajouté des allers-retours. Tout ce temps n’est pas du calcul Python. Une commande existante et ses résultats doivent être réutilisés ; les opérations d’observation indépendantes peuvent être regroupées.

## Corrections réalisées dans le code

- Un lecteur de publications charge l’inventaire une fois pour l’export groupé. Chaque modèle est lu une fois ; son guide conserve tous ses contrôles propres, sans redemander le même modèle.
- Le contrôle SHA-256 porte sur les octets effectivement parsés, avant toute utilisation du cache. Une empreinte de modèle absente ou invalide est refusée.
- Les descripteurs sont revérifiés avant l’activation ; le catalogue servi reste activé en dernier. Tous les historiques restent exportés.
- L’export retourne des durées par phase ; le parcours de release distingue lecture du courant, candidat et validation, staging, publication, export et contrôle Atlas, y compris lorsqu’un réexamen est demandé.
- `scripts/benchmark_atlas_export.py` produit des mesures isolées, des profils optionnels et une comparaison des fichiers octet par octet. Il ne publie rien et ne modifie pas le site servi.
- Le workflow sépare les contrats Python du job de build. Le déploiement dépend de **build, contracts et launcher**. Toutes les commandes de tests antérieures sont conservées.

**Gain mesuré sur l’export avec cache chargé : environ 52 %.** Les 93 fichiers obtenus sont strictement identiques à la référence. Le nombre de lectures structurées descend de 4 650 à 94 ; les vérifications d’intégrité ne sont pas retirées.

**Gain GitHub attendu, non encore mesuré sur un nouveau run : de l’ordre d’une minute**, en retirant les 74 secondes de tests Python du chemin séquentiel de build, sous réserve du démarrage du job supplémentaire et de la charge des runners. Aucun test n’est supprimé et aucun déploiement ne peut passer si le job de contrats échoue.

## Suites recommandées, par priorité

1. **Cibler les réexamens d’accords.** Distinguer ajout d’un scénario autonome, modification d’un scénario existant, changement de contribution et changement du sens d’une capacité. Conserver les contrôles sur valeurs approuvées, parents, relations, principes et glossaire effectivement référencé. Tester les faux négatifs avant de changer cette règle ; ne pas simplement ignorer le catalogue pour gagner du temps. Cette modification de règles n’est pas incluse dans l’optimisation présente.
2. **Regrouper l’accès à l’historique Git.** Le profil optimisé montre encore 88 appels à `git show`, coûtant environ 11 secondes cumulées sous Windows. Un lecteur `git cat-file --batch` limité à une opération pourrait les remplacer. Il devra conserver les commits exacts, contrôles de chemins, erreurs explicites et vérifications SHA-256.
3. **Évaluer un cache d’export vérifié.** Les anciennes publications ne changent pas. Une clé fondée sur les empreintes du modèle, du guide, de l’association et du code pourrait éviter leur conversion répétée. Vérifier les sources et les sorties avant réutilisation ; ne jamais se fier seulement à la date des fichiers ou au résultat d’un ancien test.
4. **Réduire les installations CI.** L’installation du navigateur a coûté 23 secondes ; évaluer un cache lié à la version de Playwright et au système, sans masquer les dépendances système nécessaires. Le déploiement lui-même est déjà court.

## Reproduction

```powershell
python scripts/benchmark_atlas_export.py --runs 2
python scripts/benchmark_atlas_export.py --runs 2 --profile --compare CHEMIN_EXPORT_REFERENCE
```

Les sorties vont sous `.runtime/atlas-benchmarks/` ; le chemin du rapport est affiché. Comparer des options identiques et indiquer l’état du cache. Les suites de contrats utilisent des publications temporaires, sans fabriquer de nouvelle release métier.

La v043 en ligne reste inchangée. Les optimisations sont des changements logiciels locaux ; leur effet sur le workflow distant sera mesuré après leur prochain push.

## Vérifications du lot

- 351 tests des scripts réussis en 362,7 secondes sur ce poste Windows ; 32 tests de l’application terminés sans échec en 29,9 secondes, dont deux ignorés car non applicables à cet environnement. Cette durée locale des scripts ne doit pas être confondue avec les 68 secondes du run Linux précédent.
- Tests ajoutés sur l’inventaire lu une seule fois, la vérification de chaque modèle, le refus d’un descripteur modifié avant activation, le refus d’une empreinte absente et la détection d’altération malgré un cache de parsing chargé.
- Les deux exports profilés après modification et l’export sans profileur correspondent aux 93 fichiers de référence octet par octet.
- Vérification du workflow : aucune commande de tests supprimée ; les trois jobs sont obligatoires avant déploiement.
- Aucun build frontend requis : le frontend est inchangé. Les données de comparaison sont isolées sous `.runtime`, et la publication active n’a pas été modifiée.

La suite complète locale se justifie ici par le changement transversal du lecteur structuré. Elle ne doit pas devenir un prérequis systématique à chaque commit de contenu : réutiliser les contrôles encore valides et appliquer les tests ciblés prévus par les instructions du projet.

## Allègement des accords

Le registre v043 contient 446 décisions pour 6 717 417 octets sur disque. Les notes représentent 6 361 455 octets et cumulent 7 863 mentions de réexamen ; la plus longue atteint 21 251 caractères. Le nombre d’accords seul n’explique donc pas le volume : le récit des reports successifs est recopié.

Les nouvelles transcriptions conservent seulement le dernier réexamen dans leur note active. La décision antérieure complète, avec ses réserves, sa note et son empreinte, reste dans `review.json`. L’analyse et les liens entre identifiants restent dans `assessment.yaml` et `transcriptions.json`. Aucune fusion des portées, suppression d’accord ou nouvelle validation implicite.

Un défaut du parcours léger a été corrigé : il ne publiait pas ces preuves, alors que les notes annonçaient leur emplacement. Désormais les trois fichiers sont figés dans la préparation, copiés dans la révision publiée et référencés par empreinte dans son manifeste. La lecture du courant vérifie leur intégrité et la préparation inclut leurs empreintes dans son état d’entrée. Les anciens artefacts publiés ne sont pas réécrits ; cette correction ne reconstitue pas rétroactivement les dossiers manquants.

Simulation en lecture seule sur le dossier de réexamen v043 existant : les 446 décisions ont exactement les mêmes champs hors `note`. À sérialisation JSON identique, le registre passe de **6 717 416 à 774 570 octets**, soit **88,5 % de moins**. Son parsing JSON passe d’environ **13,3 à 2,2 ms** sur ce poste (minimum de trois séries de dix lectures mémoire). Ce temps ne couvre ni accès disque, ni parsing YAML, ni traitement complet des accords et ne constitue pas un gain mesuré sur une release entière.

```powershell
python scripts/benchmark_decision_notes.py --decisions modeles/decisions/2026-09-28.5.json --review .runtime/release-reviews/2026-09-28.5
```

Cette commande exige un dossier déjà évalué et vérifie l’identité des décisions et des portées avant comparaison. Elle n’écrit rien. Le dossier temporaire utilisé pour cette mesure doit être présent ; il n’est pas recréé automatiquement.

Les publications actuelles restent inchangées. La réduction s’appliquera aux prochains réexamens explicites ; un report sans réexamen garde sa note. La règle conservatrice qui peut déclencher un réexamen global après ajout d’un scénario reste à traiter séparément. Aucun contexte métier n’est ignoré pour obtenir l’allègement.
