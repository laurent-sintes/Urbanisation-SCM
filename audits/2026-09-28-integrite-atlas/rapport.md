# Audit de conservation du contenu et de stabilité d’Atlas

28 septembre 2026 — demande U829. Périmètre : chaîne source → publication → export → lecture → déploiement, puis cohérence et accès aux scénarios et à la méthodologie. Les corrections ne donnent aucun accord métier supplémentaire.

Version contrôlée : **v042 / 2026-09-28.4**, avec le guide **2026-09-28.2 — Méthodologie de transformation**. Les 183 nœuds conservent leurs champs métier et leurs portées d’accord ; le glossaire métier est identique à v041.

## Résultat et causes

L’incident initial réunissait deux causes distinctes : un lien local fixé sur une ancienne publication et un déploiement Pages interrompu par un test devenu obsolète. Le contenu nouveau était présent dans les sources et dans la publication locale, mais cette présence ne démontrait pas sa livraison effective.

L’audit ne constate aucune perte de texte entre le catalogue des scénarios source et son snapshot publié : seules les métadonnées de version différaient. Les chapitres du guide source et du guide publié étaient identiques. Il trouve néanmoins des omissions et des fragilités dans la lecture et dans les contrôles de livraison.

| Constat | Effet | Correction et contrôle |
| --- | --- | --- |
| Publication fixe signalée seulement discrètement | Une ancienne édition paraît être le contenu courant incomplet | Bandeau visible et action « Suivre la version courante » ; reproduction automatisée du lien signalé par Laurent |
| Recettes riches parfois limitées à un candidat injecté, hors chaîne principale | Un test vert ne prouve pas la présence du contenu effectivement publié | Recette exhaustive du build réel intégrée à `pnpm verify`, sans injection de backlog |
| Pas de comparaison des fichiers servis après déploiement | Push ou déploiement réussi confondu avec livraison effective | Manifeste du build testé conservé comme artefact ; comparaison des octets du site après déploiement, avant succès du workflow |
| Empreintes exportées non vérifiées par le navigateur | Un fichier remplacé conservant son numéro de version peut être accepté | Vérification SHA-256 des modèles et guides ; tests de substitution et de relance |
| Compilation directement dans le répertoire servi | Échec de compilation susceptible de laisser un site partiel ; anciens modules supprimés | Compilation isolée, ressources copiées avant activation du catalogue et du HTML ; conservation locale des modules précédents ; tests d’interruption |
| Erreur de rendu ou ancien module différé indisponible | Risque d’écran blanc dans un onglet déjà ouvert | Écran de reprise explicite conservant le lien ; simulation navigateur d’un module indisponible puis rechargement |
| Onglet conservant une ancienne interface après déploiement | Données récentes lues par un ancien logiciel | Détection du changement des ressources chargées et proposition de recharger l’application, sans quitter le lien consulté |
| Description des flux de valeur non rendue | Texte présent dans les données mais absent de l’écran | Description désormais affichée et comparée au texte publié pour les cinq flux |
| Recherche partielle des scénarios | Variantes, résultats et dépendances difficiles à retrouver | Indexation des textes publics des parcours dans les recherches globale et locale ; test « Livraison fractionnée » et absence de fuite des notes de revue |
| Références historiques et identités de filtres insuffisamment contrôlées | Un rattachement devient introuvable ou un filtre ambigu | Rejet des propriétaires historiques absents, liens dupliqués et identités de facettes dupliquées |
| Condition du parcours regroupé portée par tout le scénario B2B | La variante fractionnée hérite d’une condition incompatible | Condition conservée seulement dans le parcours regroupé ; correction du scénario proposé dans une nouvelle publication, test de non-régression |
| Navigation méthodologique très haute sur mobile | Le lecteur atteint tardivement le contenu | Deux rangées de raccourcis défilantes au lieu d’une longue pile, sans suppression d’accès |

## Contrat de conservation

La compilation de publication est testée sur tous les champs métier des nœuds publiables et sur l’intégralité du catalogue de scénarios. Les quatre nœuds d’illustration exclus de la publication restent explicitement déclarés ; leur absence n’est pas une perte silencieuse. Les règles historiques de conservation Git, les empreintes de snapshots, les contrôles des accords et les verrous restent actifs.

Le build ne lit que les snapshots désignés par le catalogue publié. Le guide vient de son association figée ; la navigation historique ne récupère pas un guide plus récent. Les contrôles de contenu ne substituent pas le backlog au snapshot afin de faire passer la recette.

Le test `verify-published-content.mjs` compare les textes publiés avec les textes rendus, y compris les détails dépliés, et vérifie les liens résolus. Il couvre :

- 5 flux de valeur : description, bénéficiaire, valeur, déclencheur, frontières, étapes, entrées/sorties et appuis publiés ;
- 26 scénarios et leurs 27 parcours, dont les deux variantes B2B ; 84 étapes, contributions, conditions, dépendances, résultats et points de vérification ;
- 95 fiches de capacité, sous-domaine et domaine : présence des scénarios associés ou mention explicite d’absence documentée ;
- 8 rubriques méthodologiques et 42 sections, textes, exemples, précisions, liens de référence et 2 schémas SVG ;
- 6 repères pédagogiques, scènes, questions et réponses interactives ;
- 28 entrées visibles du glossaire méthodologique : définitions, exemples et valeurs publiées ;
- navigation courante/historique, recherche de variante, erreurs de référence et vues ordinateur/mobile.

Les notes de maintenance, statuts d’accord, identifiants de provenance et anciennes notions retirées ne sont pas assimilés à des contenus destinés au lecteur. Leur non-affichage reste intentionnel et ne supprime pas les preuves sources.

## Audit du contenu des scénarios

Les 26 scénarios sont des illustrations, pas des preuves de réalisation installée. Les cinq flux classent des résultats attendus ; leurs étapes sont distinctes des étapes de mobilisation. Un scénario peut appartenir à plusieurs flux tout en restant unique. Les parcours préservent les distinctions importantes : évaluer, promettre, réserver, affecter, appliquer, libérer et constater ; propriété et détention ; commande et prestation ; quantité demandée et quantité reconnue.

La revue des 27 parcours a identifié une incohérence précise dans les conditions communes du scénario B2B. La correction retire uniquement l’acceptation du regroupement des conditions communes. Cette acceptation reste dans « Livraison regroupée » ; « Livraison fractionnée » conserve l’acceptation de deux livraisons et de leurs dates. Le glossaire métier et les définitions méthodologiques de scénario/parcours restent cohérents et ne nécessitent pas de modification. Aucun périmètre de capacité, flux installé ni accord n’est ajouté.

74 des 78 capacités publiées contribuent explicitement à un parcours. Quatre capacités récentes n’ont pas de contribution documentée : Accounting Data Provision, Planning Data Provision, Product Feedback et Accounting Interpretation. Cette limite est restituée, sans créer artificiellement de liens pour atteindre 100 %. Elle appelle de futurs exemples et arbitrages métier, pas une correction du logiciel. Les sources, réserves et qualifications des récits restent conservées.

## Audit du contenu méthodologique

Le parcours est cohérent avec les demandes exprimées : cadrage multidimensionnel et itératif ; équipe pluridisciplinaire ; démarche produit et DDD dès l’exploration ; technologie dès le cadrage avec preuves progressives ; décisions instruites au fil de l’eau ; direction de programme et comité mensuel existants ; architecture d’entreprise contribuant durablement à la gouvernance ; adoption, bénéfices et continuité après programme.

Les noms Transformation Leader et Transformation Board sont explicitement des conventions de présentation FLOW, sans création implicite de pouvoirs. Le mandat incertain ne bloque pas les investigations réversibles, mais ne donne pas le droit d’engager sans décideur compétent. Les ADR ne remplacent pas toutes les décisions du programme. Le parcours de lecture n’est pas présenté comme une succession obligatoire des travaux.

Le métamodèle FLOW est une ressource distincte de la démarche complète. La cartographie de domaines/capacités est un point d’entrée de cette démarche, sans prétendre représenter toute la transformation. Les références BIZBOK, TOGAF, DDD, produit, agile, ADR, programme, technologie et conduite du changement restent accessibles dans la rubrique dédiée ; cet audit vérifie leur conservation et leur positionnement éditorial, sans prétendre refaire une étude de marché indépendante.

Point d’attention de lecture : le développement détaillé des fondations technologiques figure dans « Organiser et réaliser les changements ». Le texte indique explicitement qu’elles sont examinées dès le cadrage, en parallèle du produit ; le schéma à six dimensions porte cette transversalité. Ce classement est un accès documentaire, pas un ordre d’exécution.

## Vérification et limites

La validation des modèles ne relève aucune erreur. Les tests frontend, Python de publication/lecture et les parcours navigateur ont été exécutés, avec des cas d’échec injectés : contenu substitué, mauvaise empreinte, compilation interrompue, référence supprimée, module différé indisponible et reprise. Les contrôles du site après déploiement sont désormais obligatoires dans la chaîne.

La recette exhaustive porte sur la publication courante ; les fichiers historiques sont vérifiés à l’export et plusieurs parcours historiques sont testés, sans prétendre parcourir tous les écrans de chaque ancienne édition. La recette visuelle utilise Chromium sur ordinateur et viewport mobile. La couverture illustrative de 74 capacités ne démontre ni exhaustivité métier ni déploiement dans les SI. Les fichiers et images détaillés des contrôles restent dans les répertoires temporaires `.runtime`, sans catalogue de contenu concurrent.

La publication corrigeant le scénario conserve les valeurs et portées des 446 accords antérieurs après réexamen du contexte. Elle ne valide pas le scénario ni les quatre capacités sans scénario. La stabilité logicielle et la validation métier restent deux constats distincts.
