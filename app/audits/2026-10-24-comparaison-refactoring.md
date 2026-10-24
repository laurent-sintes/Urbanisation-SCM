# Audit comparatif du refactoring des contenus Atlas

**Suivi : les trois corrections P2 ont été appliquées après cet audit.** Leur vérification est détaillée en fin de document ; les constats ci-dessous conservent leur périmètre initial.

Le refactoring préserve les contenus métier et les parcours comparés. Aucune régression fonctionnelle n’a été détectée dans les 348 fiches, les 30 détails de points chauds et les 32 vues desktop/mobile examinés. Les différences visibles correspondent aux corrections demandées. Trois défauts techniques restent à corriger : des constantes CSS rangées parmi les libellés, une détection incomplète des nouveaux textes en dur et un dictionnaire trop largement embarqué dans les workers.

## Comparaison de référence

Comparaison du 24 octobre 2026 entre le dernier commit avant refactoring, `1102b26c2043a5dc50de19ba2054ad818dd1bbec`, et le commit livré, `7656d55042105cbf6de485960a8460d2b0d686c5`.

Le lecteur précédent a été reconstruit depuis Git, dans un dossier temporaire. Les deux lecteurs ont reçu la publication `2026-10-23.6`, pour isoler le changement de code du changement de release. L’export reconstitué avant refactoring correspond exactement à son empreinte conservée : `e29fcd8a678709dc77ac228ba151fa4e493f55d4d6ed5edde2e85ee1fb7c2abc`. Une recompilation isolée du code livré produit les mêmes onze fichiers JavaScript, aux mêmes empreintes, que ceux utilisés pour la comparaison.

La release `2026-10-24.1` et les 119 éditions antérieures ont également fait l’objet d’une comparaison des champs métier et des présentations déclarées avec les anciens traitements textuels. Cette vérification des données ne signifie pas que les 120 interfaces historiques ont été parcourues intégralement.

Les résultats chiffrés et les cas de contrôle sont conservés dans les [preuves comparatives](2026-10-24-comparaison-refactoring/preuves.json). Le [premier audit](2026-10-24-code-libelles.md) décrit l’état de départ.

## Résultats fonctionnels

| Contrôle | Résultat |
| --- | --- |
| Champs métier des 348 nœuds et qualifications des 881 relations de référence | Aucun écart de contenu affiché |
| Parents, enfants, ascendants et descendants des 348 nœuds | Aucun écart |
| Résumés de composition des cartes et des périmètres | Aucun écart |
| Recherche par noms des nœuds et neuf requêtes complémentaires | Même ordre de résultats et mêmes scores |
| Corps des 348 fiches dans le navigateur | Textes visibles, liens, boutons, noms accessibles et icônes identiques |
| 16 vues en desktop et mobile, soit 32 vues par lecteur | Textes, contrôles et mesures de largeur collectés identiques ; aucune erreur JavaScript |
| 30 détails de points chauds | Contenu et contrôles collectés identiques |
| Six leçons méthodologiques | Une seule différence, attendue et détaillée ci-dessous |
| Recherche interactive « stock » | Même contenu utile ; libellés de type alignés sur le guide |
| Tooltip de type du domaine, ouvert au clavier | Définition courte publiée utilisée après refactoring |
| 120 exports actuels | Empreintes vérifiées ; 125 758 valeurs de champs et 57 502 qualifications comparées sans écart |
| 31 838 substitutions déclarées, cumulées sur ces exports | Empreinte du texte source correcte et résultat identique à l’ancien traitement |

Les vues comparées couvrent la carte racine, la carte et les flux SCM, les fiches SCM et Master Plan, les relations, les sources d’inspiration, les principes directeurs, le métamodèle, la méthode, le glossaire, les scénarios, les points chauds, les applications, les documents et l’aide. Les captures de Flux SCM ont aussi été examinées : le cadrage observé est conservé.

Les interactions d’édition de l’atelier n’ont pas été rejouées dans cette comparaison. Les contrats et recettes de livraison restent complémentaires ; la CI du commit livré est réussie.

## Différences attendues

### Le vocabulaire vient de la publication

Les 74 comportements passent de `Behavior · …` à `Capability Behavior · …`. Le second libellé est celui du terme méthodologique associé à cette publication. La nature, le nom métier, les résultats de recherche et les icônes restent identiques. Ce changement est une conséquence du retour à la source publiée.

### Le tooltip reste court

Le tooltip de type du domaine passe d’un paragraphe de définition et de règles de décomposition à sa définition courte : « Grand périmètre de responsabilités métier au sein d’un système métier. » L’accès au clavier fonctionne. L’aide de lecture inclut désormais les préfixes présents dans les données, dont UNI et BA.

### La leçon conserve son texte publié

La leçon `meaningful-links` n’ajoute plus « Les rattachements suivent la publication affichée. » Cette phrase était imposée par l’ancien code et absente de la source figée. Le reste de la leçon et ses contrôles sont identiques.

## Corrections restantes

### P2 Séparer les constantes techniques des libellés

Huit ressources identifiées ne sont pas des textes destinés au lecteur. Elles servent de classes CSS, sélecteurs DOM, transformations géométriques ou expressions de police :

| Usage technique | Ressource |
| --- | --- |
| Classes de mesure des cartes | `mapCardMeasure.graph_canvas_zoom_width` |
| Classes de surbrillance | `reactFlowPane.hotspot_related`, `reactFlowPane.application_related` |
| Deux sélecteurs du navigateur de carte | Préfixe `catalogueNavigator`, ressources `business_card_data_node_id…` et `graph_canvas_map_flow_surface…` |
| Sélecteur des cartes React Flow | `mapPanel.data_testid_react_flow_canvas_react_flow_node_business` |
| Transformation de position et de zoom | `hotspotClusterMotion.translate_px_px_scale` |
| Expression de police pour la mesure des titres | `flowMapPanel.px` |

Exemple : [mapCardMeasure.ts](../src/mapCardMeasure.ts), ligne 18, affecte une classe CSS via `ui()`. Une correction éditoriale de cette ressource peut donc casser la mesure ou le cadrage des cartes. Les valeurs actuelles reproduisent celles d’avant refactoring ; aucun dysfonctionnement courant n’est constaté sur ce point.

**Correction :** remettre ces valeurs dans des constantes techniques du code et adapter le détecteur pour reconnaître leurs usages. La consigne d’externaliser les libellés ne demande pas d’externaliser les sélecteurs ni les expressions CSS.

### P2 Renforcer le contrôle des textes en dur

Le contrôle existant passe sur la production. Il détecte correctement un texte JSX direct ou une variable nommée `label`, mais laisse passer les quatre cas suivants :

```tsx
<p>{ready ? "oui" : "non"}</p>
element.setAttribute("aria-label", "texte accessible");
const value = "bonjour";
const View = () => <p>{value}</p>;
<MyButton help="aide" />
```

Les causes sont visibles dans [check-labels.mjs](../check-labels.mjs), notamment lignes 48, 83 et 101 : reconnaissance partielle des chaînes ordinaires, perte du contexte JSX dans certaines expressions et exemption globale de `setAttribute`. Le contrat des propriétés textuelles des composants personnalisés reste également incomplet.

Ces exemples sont des sondes isolées, pas quatre libellés trouvés dans la production. Ils montrent que la promesse d’empêcher toute réapparition est encore trop forte.

**Correction :** propager le contexte de rendu dans les expressions, traiter les attributs accessibles selon leur nom, déclarer les propriétés textuelles des composants et couvrir les variables locales simples. Ajouter ces cas négatifs au contrôle automatique. Garder les exceptions attachées à des usages techniques précis.

### P2 Réduire le dictionnaire embarqué dans les workers

[ui.ts](../src/ui.ts), ligne 1, importe le fichier complet des 1 632 ressources. Les workers de recherche et de calcul de carte emportent chacun ce dictionnaire, y compris les 58 clés `workshopApi` et les 24 clés `server`, inutiles à leurs calculs.

| JavaScript construit | Avant | Après |
| --- | ---: | ---: |
| Worker de recherche | 15 297 octets | 139 568 octets |
| Worker de carte Flux | 34 615 octets | 163 898 octets |
| Ensemble des fichiers JavaScript actifs | 2 590 270 octets | 2 989 903 octets |
| Même ensemble compressé en gzip, niveau 6 | 787 518 octets | 884 775 octets |

L’augmentation totale est de **399 633 octets bruts**, soit **15,4 %**, et **97 257 octets compressés**, soit **12,3 %**. Il s’agit de la somme des fichiers actifs, y compris les chargements différés ; ce n’est pas une mesure du temps d’ouverture ni du volume nécessaire à chaque visite. Les anciens fichiers résiduels du répertoire local ont été exclus.

**Correction :** séparer les ressources du serveur, de l’export et de l’interface, puis limiter les dépendances des workers aux données nécessaires à leurs calculs. Conserver des clés typées et le contrôle des paramètres. Mesurer ensuite les mêmes fichiers et une ouverture réelle sur réseau contraint.

## Suite recommandée

Conserver le refactoring livré. Corriger d’abord la séparation des constantes techniques et les lacunes du détecteur dans un même lot, puis alléger les ressources chargées par les workers. Pérenniser une recette comparative ciblée sur une publication figée, avec les changements attendus explicitement nommés : les tests de conformité aux nouvelles sources ne remplacent pas entièrement une comparaison avant/après.

Cet audit ajoute uniquement son rapport et ses preuves. Il ne modifie ni le code de production, ni le modèle, ni une publication.

## Application des trois corrections P2

Les huit valeurs CSS et DOM sont revenues dans le code, au plus près de leur usage. Les classes, sélecteurs, transformations et polices conservent exactement les mêmes valeurs. Elles ne dépendent plus d’une ressource éditoriale.

Le détecteur suit les branches JSX, concaténations, modèles de chaînes et constantes locales immuables, avec prise en compte des portées. Il contrôle la valeur de `setAttribute` selon le nom de l’attribut, et les propriétés textuelles déclarées des composants, dont `help`. Les quatre sondes de l’audit sont désormais rejetées. Huit ressources supplémentaires externalisent les quelques textes encore présents dans le code, sans changement de formulation : état et inventaire d’une application, filtre des flux, présentation d’une révision et désignation d’un nœud dans une erreur. Le contrôle reste une analyse statique bornée ; il ne suit pas toutes les fonctions et mutations.

Les ressources sont réparties entre interface, calculs partagés, serveur, export et HTML initial. Chaque clé garde une seule source et ses paramètres typés. Les modules utilisés par les workers accèdent au petit catalogue de calculs, contenant 78 ressources. Deux tests compilent les workers, refusent les catalogues étrangers à ces calculs et contrôlent un budget de taille.

| Fichier ou ensemble actif | Version livrée `7656d55` | Après corrections |
| --- | ---: | ---: |
| Worker de recherche | 139 568 octets | 17 161 octets |
| Worker de carte Flux | 163 898 octets | 41 499 octets |
| Ensemble des fichiers JavaScript actifs | 2 989 903 octets | 2 734 608 octets |
| Même ensemble en gzip, niveau 6 | 884 775 octets | 817 533 octets |

La réduction est de 87,7 % pour le worker de recherche et de 74,7 % pour celui de Flux. Les onze fichiers JavaScript actifs diminuent de 255 295 octets bruts et de 67 242 octets compressés. Le calcul conserve le moteur et le niveau de compression du premier audit ; les anciens fichiers résiduels sont exclus.

La comparaison navigateur entre `7656d55` et le code corrigé utilise la même publication figée `2026-10-23.6` : aucun écart dans les 348 fiches, les 32 vues desktop/mobile, la recherche interactive et le tooltip ouvert au clavier. Aucune erreur JavaScript. Les textes, contrôles, liens, icônes et mesures de largeur collectés sont identiques. Le tooltip reste court.

Trois ouvertures par lecteur, cache désactivé, compression gzip et réseau limité à 1 Mio/s avec 100 ms de latence, ont également abouti. La médiane jusqu’à la première carte Flux visible est de 8,59 s avant et 8,08 s après ; la première recherche prend respectivement 858 et 850 ms. Ce contrôle local partageait la machine avec les autres recettes : la dispersion des mesures ne permet pas de garantir un gain de temps d’ouverture. La baisse de taille des fichiers, elle, est déterministe.

Les 321 tests JavaScript passent, ainsi que les contrats Python concernés et le build. Les recettes de navigation, Flux, sélection applicative et points chauds sont réussies ; les 382 cas de cadrage du catalogue sont également contrôlés. Les 120 publications sont réutilisées, sans régénération. Le modèle et le pointeur de publication restent inchangés. Les mesures et leurs limites sont conservées dans les [preuves des corrections P2](2026-10-24-comparaison-refactoring/corrections-p2.json).
