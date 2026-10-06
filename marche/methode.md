# Méthode de comparaison et maintenance

Origine : demande U14. Cette méthode organise le travail documentaire ; elle n'adopte aucun standard comme architecture cible.

## Trois objets distincts

1. **Référence de marché (MKT)** : organisme, modèle, rôle, éditions et conditions d'accès.
2. **Élément externe (ELM)** : concept, règle, capacité, processus, composant ou donnée effectivement localisé dans une source.
3. **Correspondance (CMP)** : relation argumentée entre cet élément et un élément Beaumanoir, avec adaptations et décision.

Une page de présentation peut justifier le rôle d'un modèle. Elle ne suffit pas à attribuer une définition ou une couverture à ses éléments détaillés.

## Informations à conserver

| Objet | Champs obligatoires |
| --- | --- |
| Référence | ID local, nom, organisme, nature, rôle envisagé, source officielle, version ou inconnue, date de consultation, contenu réellement consulté, limites d'accès et de réutilisation connues |
| Élément externe | ID local, référence et édition, identifiant natif s'il existe, libellé natif, nature, définition consultée ou explicitement indisponible, reformulation séparée, localisateur précis, source et date |
| Correspondance | ID local, élément externe, élément Beaumanoir, version/état comparé, relation, contexte, adaptation proposée ou appliquée, justification, limite de preuve, statut, auteur, date ; valideur et date si validation |

Ne jamais fabriquer un identifiant natif, une version ou une définition. Pour une page évolutive sans édition, conserver date, titre et section ; la comparaison reste liée à cet état documentaire. Conserver des synthèses et des liens ; avant toute importation substantielle, relever les conditions de réutilisation du contenu concerné. L'accès public ne suffit pas à établir un droit de redistribution intégrale.

## Nature des relations

- **Équivalence** : résultat, périmètre et maille compatibles, vérifiés sur les définitions.
- **Plus large / plus étroit** : préciser lequel englobe l'autre et sur quelles dimensions.
- **Recouvrement partiel** : décrire intersection et différences.
- **Mobilise** : un processus mobilise une ou plusieurs capacités.
- **Appui sémantique** : un objet ou un terme éclaire le vocabulaire d'une capacité.
- **Appui méthodologique** : un principe éclaire la construction du modèle.
- **Piste lexicale** : ressemblance à examiner ; aucune équivalence établie.
- **Non comparé** : travail non réalisé ou source insuffisante ; ne signifie pas absent du marché.

Une relation peut être plusieurs-à-plusieurs. Ne pas imposer un seul équivalent externe à chaque CAP. Un écart peut révéler une différence de maille, de périmètre, un manque de connaissance ou un choix métier ; le qualifier avant d'en faire une anomalie.

## Niveaux de preuve

Distinguer systématiquement : source identifiée ; présentation consultée ; passage ou élément consulté ; rapprochement proposé ; correspondance validée. La confiance dépend de la définition disponible et du contexte, pas de la notoriété de l'organisme. Une proposition locale reste signalée comme telle, même si la source externe est un standard.

## Choisir éventuellement une structure principale

Comparer les candidats sur les mêmes cas : allocation/protection GBM, allocation B2B Boardriders, SAV Sarenza, réassort IRMA–Storeland et interface C-Log.

| Critère | Preuve attendue |
| --- | --- |
| Adéquation de l'objet | Véritable modèle de capacités ou transformation explicitement justifiée |
| Couverture | Articles, partenaires, achats, commandes, stocks, allocations, SAV ; interfaces et exclusions visibles |
| Lisibilité | Niveaux et granularité compréhensibles par le métier |
| Comparabilité | Variantes retail/B2B et contextes des trois SI représentables |
| Responsabilités | Possibilité de documenter information, décision et exécution sans confondre organisation et capacité |
| Indépendance des produits | Correspondance possible avec l'existant hétérogène et plusieurs réalisations cibles |
| Traçabilité et entretien | Définitions, identifiants, éditions, accès et conditions d'usage identifiés |

Ne pas calculer de classement global avant d'avoir ces preuves. SAP est un candidat à éprouver, pas un gagnant désigné. Les modèles de processus et de données complètent le contrôle sans être notés comme s'ils étaient des catalogues de capacités.

## Décrire une capacité avant sa réalisation

La définition réaffirmée par Laurent en U33 est le critère de construction : **ce que sait faire l’entreprise indépendamment de son organisation et de ses outils**. Depuis U262, la décomposition descriptive FLOW est Capacité → Comportement, terminale. U265 exige une complexité ou un bénéfice ciblé pour justifier cette décomposition ; elle n’est pas systématique. Objets, opérations, règles et fonctionnalités de produit permettent de l’expliquer et de l’éprouver ; ils ne deviennent pas automatiquement des capacités ou des comportements. Responsabilités et contrats éclairent ensuite sa réalisation. Les niveaux natifs d’une référence restent documentés sans leur imposer cette convention FLOW.

Le [glossaire métier courant](../modeles/backlog/glossary.yaml) fait autorité pour les notions métier ; le [glossaire méthodologique](../modeles/backlog/modeling-glossary.yaml) porte les conventions de modélisation. Le registre `connaissance/19-glossaire-metier.md` conserve l’historique. Distinguer les termes natifs de marché de nos formulations françaises ; une proximité lexicale ne vaut ni traduction officielle ni équivalence métier. Voir C33/C34 et CMP024/CMP025.

## Cycle de travail

### Comparaison portée par la fiche — U311

Les rapprochements utiles à la discussion client ne restent pas uniquement dans les études : les exposer dans `fields.market_comparisons` sur les éléments du modèle et `market_comparisons` sur les termes métier. Le contrat se trouve dans `$defs.marketComparisons` du schéma d’urbanisme. Chaque entrée conserve points communs, différences, position FLOW et sources datées, avec statut propre. Les registres ELM/CMP portent la provenance et l’argumentation approfondie ; leurs identifiants sont référencés par la fiche. Une absence de différence établie doit être écrite comme telle, sans transformer l’incertitude en équivalence. Ne pas rendre obligatoires des comparaisons inventées sur les éléments encore non étudiés.

U268 impose une comparaison aux références pertinentes pour chaque proposition de Laurent et une justification de chaque recommandation de Codex par le marché ou par le modèle FLOW. Présenter les appuis, écarts, limites de preuve et raisons du choix ; une simple proximité de nom ne suffit pas. Cette exigence s’applique dès la discussion, avant une éventuelle modification du catalogue. Une comparaison non établie reste signalée comme telle.

À chaque création, fusion, scission ou changement de définition d'une capacité, consulter les éléments marché pertinents et actualiser ses correspondances ou son statut « non comparé ». À chaque nouvelle version d'une référence, conserver l'ancienne provenance, qualifier les changements et signaler les correspondances à revalider. Vérifier de nouveau les sources utilisées avant un arbitrage ou une publication ; consigner les contrôles dans le journal.

Une source inaccessible n'arrête pas les autres comparaisons. Enregistrer la limite, exploiter les passages réellement disponibles et laisser la conclusion ouverte. Aucune surveillance automatique n'est configurée ; l'entretien s'effectue au fil des itérations du projet.


## Nommage et alignement — U294

À notion et périmètre équivalents, reprendre le vocabulaire établi du marché. Une déviation doit correspondre à une innovation explicitée, pas à une préférence rédactionnelle. Vérifier les usages et leur portée dans plusieurs sources lorsque possible ; ne pas confondre un nom commercial de produit, une catégorie d’offres et un concept métier. En l’absence de terme unique, signaler la pluralité et justifier le terme retenu. Cette règle ne déclenche pas un renommage automatique des noms adoptés.


## Comparer les décisions à leur maille — U328

Laurent confirme la maille fine des responsabilités de décision, notamment pour cartographier les apports possibles de la Data, de l'IA et des systèmes experts. L'absence d'un intitulé identique dans un catalogue éditeur ne prouve pas l'absence de correspondance métier. Rechercher les résultats effectivement déterminés dans les méthodes de planification, règles, recommandations et fonctions documentées, au-delà du module commercial.

Application éditoriale : comparer question métier, informations mobilisées, critères/contraintes, résultat et utilisation de ce résultat. Qualifier séparément proximité de nom et correspondance fonctionnelle ; conserver la nature native de la preuve. Plusieurs fonctions éditeur peuvent contribuer à une décision FLOW et une fonction peut mêler décision, simulation et application. Ne pas importer ce découpage logiciel dans le modèle, ni transformer chaque calcul intermédiaire en capacité. La finesse se justifie par une responsabilité métier identifiable, pas par la présence d'un algorithme ou d'une technologie IA. Exemple documenté : ELM204/CMP112 et D05.a.

U329 valide cette méthode de comparaison et le nom Inventory Target Decision pour D05.a. Cet accord ne valide pas automatiquement les correspondances fonctionnelles ni les réalisations techniques citées.


## Références minimales par fiche — U470/U471, renforcées par U772

Dès qu’une fiche comporte des références marché, présenter au moins deux documents primaires distincts effectivement consultés. Deux ancres, traductions ou liens de suivi vers le même document ne constituent pas deux références. U772 impose désormais, dans chaque fiche comparée, au moins un document primaire pertinent Microsoft Dynamics et un document primaire pertinent SAP S/4HANA, effectivement consultés. Deux documents d’un seul éditeur ne satisfont plus ce minimum ; les autres éditeurs restent complémentaires. Distinguer les produits et éditions : une source SAP générique, SAP ECC ou SAP autonome ne prouve pas une couverture S/4HANA, et une source Microsoft générique ne prouve pas une couverture Dynamics. Deux éditeurs ne constituent pas à eux seuls un consensus. Conserver titre, édition ou absence d’édition, passage, date, proximité et différences pour chaque appui. Un exemple partiel doit être nommé comme tel ; ne pas ajouter un lien générique pour atteindre le nombre.

Le nom et le périmètre d’un univers se comparent à des définitions et périmètres de même portée, pas à une addition d’exemples de ses capacités. Distinguer la terminologie établie, un usage propre à un produit et l’adaptation FLOW. L’absence d’équivalent exact ne démontre aucune innovation.

Le marqueur courant `market_reference_policy: microsoft_sap_or_gap_v1` exige un appui primaire Microsoft Dynamics et SAP S/4HANA, ou une lacune explicite pour chaque famille manquante. Une lacune indique son motif, les documents examinés et sa provenance ; Atlas la présente au lecteur. Tous les nœuds non illustratifs sont contrôlés, ainsi que les relations et termes comparés. Le contrôle vérifie le domaine primaire et la famille produit, pas la pertinence sémantique : celle-ci reste une responsabilité éditoriale. Les snapshots historiques conservent leur contrat `two_primary_sources`. Le catalogue Informations métier, conservé en interne et masqué par U470, n’est pas étendu par ce lot.


### Application de U772

Rechercher les deux familles de produits pour chaque fiche créée ou réexaminée, à sa propre maille métier. Si aucun appui pertinent n’est établi, documenter le fournisseur manquant, la recherche et sa limite dans le backlog ; la fiche reste incomplète au regard de la règle. Ne pas remplacer une preuve par une page commerciale générique, inventer une correspondance, ni importer un découpage produit pour satisfaire le minimum. Un document indisponible n’est pas réputé consulté.

Cette exigence s’applique aux références courantes ; les publications historiques restent figées. L’enregistrement de la règle ne certifie pas rétroactivement la conformité des fiches existantes. Le contrôle courant distingue une paire d’appuis et une couverture documentaire incomplète mais explicitement qualifiée. Une validation technique réussie avec des lacunes ne certifie pas la conformité documentaire complète ni l’équivalence fonctionnelle.
