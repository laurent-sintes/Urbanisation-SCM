# FLOW — instructions de travail

## Priorités et sources d’autorité

Échanger en français et tutoyer Laurent. Lire les éléments concernés avant de les modifier. Préserver le travail existant. Une instruction récente prime dans sa portée ; un historique ne réactive pas une règle remplacée.

| Besoin | Autorité |
| --- | --- |
| Construire ou discuter le modèle | `modeles/backlog/model.yaml` ; annexes YAML pour propositions et arbitrages |
| Modèle publié / Atlas | `modeles/release/index.json` → descripteur → snapshot ; aucun choix par tri ni complément backlog |
| Vocabulaire métier | `modeles/backlog/glossary.yaml` |
| Vocabulaire méthodologique, dont comportement | `modeles/backlog/modeling-glossary.yaml` ; distinct du glossaire métier |
| Existant | `modeles/panorama-as-is/current.json` ; trois SI et contexte partagé |
| Preuves et corrections | `connaissance/01-contributions-utilisateur.md`, `connaissance/04-corrections.md`, décisions et provenance |
| Contrats et publication | `modeles/README.md`, `modeles/schemas/`, `scripts/validate_models.py` |

Le YAML fait autorité pour le backlog et les nouvelles publications. Utiliser `scripts/structured_io.py` ; aucun modèle JSON concurrent. Index et fichiers techniques JSON restent légitimes. Le Markdown explique sans devenir un deuxième catalogue.

## Parcours court par défaut

1. Lire uniquement les éléments concernés et les règles applicables. Utiliser `inspect_model.py` avec des champs ciblés ; ne demander les relations que si elles sont nécessaires.
2. Pour un apport métier, enregistrer le verbatim et sa portée avant interprétation. Pour une intervention technique ou documentaire seule, ne pas créer de dossier métier ni lancer de recherche marché.
3. Finaliser le lot avant les opérations coûteuses : champs requis, références, comparaisons et contexte des accords compris. Un renommage ne déclenche pas une réécriture générale des fiches ou annexes.
4. Si les sources indexées ont changé, actualiser leur index ; capturer ensuite les accords en une seule écriture sur l’état final, sans écriture concurrente ni modification pendant la capture.
5. Appliquer une fois les contrôles du tableau ci-dessous, puis restituer le résultat. Rejouer seulement après échec, modification pertinente ou doute restant. Ne pas confondre accord métier, modification du backlog et publication.

Réutiliser les lectures, sources marché et contrôles déjà valables dans la session tant que leur contenu et leur périmètre restent pertinents. Un acquiescement ou une précision rédactionnelle n’impose pas une nouvelle étude. Conserver les preuves existantes ; capturer seulement les éléments modifiés si Git ne représente pas exactement l’état antérieur.

## Modélisation et cohérence

Pour toute modification métier, lire les [invariants détaillés](CONVENTIONS-MODELE.md#invariants-de-travail-u772) et les sections de `CONVENTIONS-MODELE.md` concernées. Ces règles restent obligatoires ; les noms et parents du YAML courant priment sur les repères historiques.

- Hiérarchie : **Enterprise Architecture → Business System → Domain → Subdomain → Business Area → Capability → Behavior** (U915 renomme la racine U912). Enterprise Architecture représente le SI Beaumanoir cible et possède sa fiche ; elle contient les trois systèmes métier. Business Operations présente Sourcing and Procurement avant Sales (U794), puis Demand & Supply Planning, Supply Chain Orchestration et Logistics (U801). Demand & Supply Planning est extérieur à Supply Chain Orchestration et alimente Plan Ingestion ; sa décomposition reste hors périmètre. Logistics porte les opérations logistiques et leur pilotage local, sans présumer de réalisation installée. Les domaines opérationnels sont précis ; seule Supply Chain Orchestration est approfondie jusqu’aux capacités et comportements. Design & Development et Enterprise Management & Control restent des vues de contexte, avec référentiels sources des ingestions à documenter à terme sur preuve. Une capacité décrit un savoir-faire durable, indépendant de l’organisation et des outils ; une fonction produit ne suffit pas.
- Zéro ou au moins deux comportements différenciants, un parent explicite, aucun sous-comportement ; justifier la décomposition. U848 : Business Area est un périmètre de responsabilité obligatoire entre sous-domaine et capacité avec une ou plusieurs capacités, sans minimum de deux. Les rôles restent des attributs ; les catégories sont réservées aux publications historiques.
- Arbre par relations explicites ; distinguer décomposition, dépendance, décision, application, réalisation, proposition et engagement. Ne jamais réutiliser un identifiant retiré.
- U783 : identité `id` persistante distincte des codes de lecture UNI/SYS/DOM/SUB/BA/REF/CAP/BHV. Règles dans `modeling-glossary.yaml` (`identification_rules`) ; codes et ordre figés à la préparation de chaque nouvelle publication, jamais renumérotés par filtre ou recherche. Voir `CONVENTIONS-MODELE.md`, « Identité et codes de lecture ».
- Noms anglais, définitions françaises, cas concrets, jargon expliqué et relié au glossaire. Préférer les termes établis à périmètre équivalent, sans consensus inventé ni renommage automatique.
- **À chaque changement métier, aligner modèle et glossaire dans le même lot**, dans les deux sens : noms, sens, frontières, résumés, exemples, liens et commentaires marché concernés. Contrôler l’autre référentiel même s’il ne nécessite aucune modification. Aucun désalignement reporté à un audit ; aucun accord étendu automatiquement. Voir [la règle complète](CONVENTIONS-MODELE.md#alignement-du-modèle-et-du-glossaire-u772).

## Accords, marché et traçabilité

Enregistrer d’abord les apports métier de Laurent, puis les interpréter. Préserver verbatims, sources, réserves, archives et corrections. Employer les noms canoniques dans le texte rédigé, notamment Boardriders.

U709 : « je valide » ou un Go porte sur la proposition complète construite au fil de la discussion, avec ses corrections et conditions, pas seulement sur le dernier échange. Reconstituer le lot cohérent avant capture ; exclure les pistes abandonnées et les compléments rédigés ensuite. Appliquer le lot dans model.yaml avant d’annoncer son intégration ; une annexe de preuves ne remplace pas l’application canonique. Les lots suivis portent publication_delivery dans leur annexe : identifiants, champs et rattachements attendus, retraits explicites ; le parcours release vérifie ces déclarations et expose les lots encore pending. Publier ne vaut pas valider ; ne pas étendre un accord aux compléments, descendants ou nouvelles valeurs. Préserver empreintes et accords historiques. `lifecycle`, `review` et décisions ADOPT ne remplacent pas la qualification champ par champ.

À chaque discussion métier (U268), comparer les propositions aux références pertinentes effectivement consultées : points communs, différences, limites. Justifier les choix de Codex par le marché ou la cohérence du modèle, avec bénéfice, frontières et compromis. Distinguer constat, interprétation et recommandation ; ne qualifier standard ou innovant que sur preuve explicite. Absence de comparaison signifie non documenté. Suivre `marche/methode.md` ; conserver les correspondances dans les fiches et les réexaminer si le périmètre change. Chaque fiche comparée exige au minimum un appui primaire pertinent **Microsoft Dynamics** et un appui primaire pertinent **SAP S/4HANA** (U772), effectivement consultés ; les autres éditeurs complètent ce socle. Deux documents d’un seul éditeur ne suffisent plus. Une source manquante ou inaccessible reste une lacune explicite à traiter : ni lien générique, ni équivalence inventée, ni conformité annoncée. Deux éditeurs ne prouvent pas un consensus. Justifier nom et périmètre au niveau de la fiche, sans résumer un Domain par ses capacités. Atlas expose positionnement et appuis marché (U311/U459), mais garde statuts de revue, réserves et liens backlog internes.

Distinguer cible, applicabilité, couverture documentée et preuve de réalisation installée. Sarenza reste non évalué sans étude. Ne pas inventer de flux, maîtres, observations ni déploiements Beaumanoir. U479 : les référentiels Supply gèrent et portent la source de vérité locale du Domain Supply Chain Orchestration ; les sources de vérité à l’échelle de l’entreprise restent externes. L’autorité locale ne se réduit pas à une copie passive et ne transfère pas implicitement la maîtrise d’entreprise.

L’audit des comportements est clos U431 : `modeles/backlog/behavior-gap-audit.yaml`. P04/P10/P12 sont couverts ; `closure_U431.future_work` conserve les précisions futures. Les nouvelles règles enrichissent les prochaines améliorations, sans réouvrir ni lancer automatiquement un audit. Aucun accord global implicite sur les descriptions ou la réalisation installée.

## Ligne éditoriale et lecture des fiches

- **Écrire simplement et aller droit au but.** Chaque phrase doit transmettre une information précise et utile. Éviter les accumulations d’abstractions, les formulations vagues et les répétitions. Commencer par le service concret rendu, puis expliquer le périmètre et les distinctions nécessaires avec un exemple. Se placer du côté du lecteur : il doit apprendre quelque chose avec un minimum d’effort, sans devoir décoder ou relire le texte. La concision ne doit pas effacer une frontière métier utile.
- **Relier chaque occurrence de jargon au glossaire.** Tout terme spécialisé ou sigle employé dans une fiche doit être un lien vers son entrée dans le glossaire approprié, métier ou méthodologique. Dans Atlas, son survol affiche une définition courte, claire et compréhensible sans autre recherche ; cette aide doit aussi être accessible au clavier. Utiliser la définition du glossaire de la publication consultée. Si l’entrée ou sa définition courte manque, la compléter dans le même lot ; ne pas remplacer l’explication par un autre jargon.
- **Afficher les scénarios impliqués dans chaque fiche de capacité, sous-domaine et domaine.** Prévoir un espace dédié « Scénarios mobilisant ce périmètre », avec une liste sans doublons et des liens vers les scénarios et leurs parcours de mobilisation. Pour une capacité, partir de ses contributions explicites aux parcours ; pour un sous-domaine ou un domaine, remonter les scénarios mobilisant ses capacités. Respecter la publication sélectionnée. Les scénarios restent des objets autonomes : cette liste ne crée pas une appartenance à la hiérarchie métier. Si aucun lien n’est documenté, afficher « Aucun scénario documenté pour ce périmètre », sans conclure à une absence d’usage ou inventer un scénario.

Ces règles s’appliquent aux nouvelles rédactions et aux fiches modifiées. Les règles détaillées restent dans `CONVENTIONS-MODELE.md` ; elles ne déclenchent pas à elles seules une réécriture générale du référentiel.

## Contrôles proportionnés

Choisir les contrôles selon les fichiers effectivement modifiés ; les lignes applicables se cumulent, sans audit historique automatique.

Sous Windows, avant les commandes `python` ou les tests qui lancent Python en sous-processus, vérifier `python --version`. Si `python` pointe d’abord vers un alias WindowsApps inaccessible, sélectionner un interpréteur installé avec `Get-Command python -All` et placer son dossier en tête du `PATH` du processus courant. Vérifier à nouveau `python --version` ; ne pas modifier le `PATH` système.

| Changement | Vérification et restitution |
| --- | --- |
| Documentation / instructions seules | Relire les liens et la cohérence ; pas de build ni d’audit métier |
| Contributions ou sources indexées | `python scripts/refresh_sources.py` |
| Backlog, glossaires, schémas ou validation | `python scripts/validate_models.py` + tests concernés ; `python scripts/render_models.py --space backlog` si la vue change |
| Panorama As Is | Validation concernée et `python scripts/render_models.py --space panorama-as-is` |
| Audit des comportements ou ses preuves | `python -m scripts.render_behavior_gap_audit` lit le résultat clos dans Git ; tout rejeu historique exige un checkout isolé de son ancien état |
| Code Python / publication / lecture structurée | Tests des contrats et parcours touchés ; vérifier l’intégrité, pas publier |
| Frontend | Tests concernés puis `pnpm --dir app build` |
| Release demandée | Skill release ; `python scripts/release.py --source SOURCE --activate`, réexamen ciblé si demandé par le parcours |

Le checkpoint local d’audit vérifie les empreintes des fichiers et du code avant réutilisation ; il ne donne aucun accord et ne remplace aucun contrôle de publication. `render_models.py` sans filtre conserve la génération complète. Ne pas réimporter le Markdown historique avec les scripts de migration.

## Atlas et opérations

Release, commit, push et administration serveur sont distincts : utiliser leurs skills seulement pour la demande correspondante. Pas de déclenchement implicite ni confirmation répétée pour une action autorisée. `push` cible Urbanisation-SCM ; `flow-push` concerne FLOW-Program. Ne pas changer l’identité Git globale.

Préserver le contenu des publications et les portées d’accord. Git conserve leurs états historiques ; les copies retirées de l’arbre sont référencées dans `modeles/git-history.json`. Une correction métier publiée exige une nouvelle version. Une release part d’une préparation figée contrôlée du backlog courant. Les caches ne dispensent jamais des contrôles d’intégrité.

Atlas présente les publications sous Urbanisation : historique sélectionné fixe, courant suivi automatiquement, glossaire et liens du même snapshot. Le mode atelier local peut superposer explicitement son staging à la seule publication de base ; cette vue de travail est signalée et ne modifie pas le snapshot. Aucun repli backlog ni glossaire méthodologique présenté comme métier. React/TypeScript, structure React Flow, relations Cytoscape ; conserver les relations publiées et leurs qualifications. Arbre gauche, fiche centrale, recherche, comportements et liens directs ; aucun historique de visites. Identité : `app/BRANDING.md`.

Atlas est une SPA statique : `scripts/export_atlas.py` produit les JSON depuis le catalogue publié et les snapshots vérifiés, sans backlog. Build et release activée actualisent ces artefacts ignorés par Git. Python sert `app/dist/` et, localement, le seul staging de l’atelier sous `.runtime/atlas-atelier/`, avec sa bibliothèque standard, sans Node permanent ni écriture HTTP. Ce staging n’est ni un modèle canonique, ni une publication, ni un accord. Le lanceur vérifie `/__atlas__/identity.json`. GitHub Pages sert le dossier compilé sans staging ; push et déploiement restent distincts de la release locale. Serveur local en lecture seule, port 8765, lanceur `Lancer-FLOW-Atlas.ps1` : vérifier l’identité avant arrêt/redémarrage, redémarrer après modification Python si nécessaire, pas après simple changement de données. Aucun navigateur sans demande. Les procédures détaillées sont dans `app/README.md`, `modeles/README.md` et les skills ; répercuter une modification de skill dans sa copie personnelle sans écraser un skill tiers.

## Procédures ciblées

Lire les [procédures de l’agent](modeles/AGENT-OPERATIONS.md) pour l’inspection, la capture d’accords, la publication, le réexamen ou l’historique. Elles conservent les commandes, empreintes, règles de cache et de conservation ; ce renvoi ne les rend pas facultatives.

Utiliser `inspect_model.py` avec des champs ciblés ; une omission de champ ne prouve pas son absence. Limiter les sorties, réutiliser les lectures valables et attendre une écriture en cours sans en lancer une seconde. Capturer les accords sur le lot final avec `record_decision.py` / `record_intents`. Ne pas créer de copie « avant » ni de journal cumulatif ; caches et préparations restent temporaires et ignorés.


U880 : Chaque capacité possède exactement un parent métier Business Area par relation contains. Cette Business Area appartient à un sous-domaine. Le rattachement direct d’une capacité à un sous-domaine est interdit dans le modèle courant. Une Business Area peut contenir une seule capacité ; les références restent documentaires et les publications historiques conservent leur contrat.


U885 : Process Management porte la définition, la conduite, la supervision, le travail humain et l’analyse des parcours Supply. Reactive Workflow Management y est rattaché ; Order Management conserve identité, engagements et validité des transitions. Fulfilment Coordination (D06.d) et Fulfilment Adaptation Decision (D06.f) gardent leur mandat local. Process Visibility (BHV082) est une capacité de Process Supervision ; son préfixe historique ne détermine pas sa nature. Operations Visibility conserve les trois perspectives physiques. Les processus mobilisent les capacités sans devenir leur parent dans la hiérarchie. Cible et preuves : `modeles/backlog/operational-work-audit-U881.yaml`.
