# Données de lecture Atlas

Ces fichiers décrivent la présentation. Ils ne sont pas un modèle métier concurrent et ne donnent aucun accord métier.

- `legacy-reader-projections.json` conserve la présentation publique des annotations déjà présentes dans 119 éditions exportées avant ce refactoring. Chaque texte source est identifié par SHA-256 ; les emplacements et les profils sont rattachés à une version explicite. L’export refuse une source différente. Aucune règle de substitution de phrases n’est exécutée par le lecteur. Les leçons restent intégralement celles du guide associé, sans les anciennes substitutions.
- `legacy-vocabulary.json` conserve les libellés de lecture des seules éditions listées. Pour une nouvelle édition, le vocabulaire vient de son guide figé. Aucun accès au backlog depuis Atlas.
- `presentation-profiles.json` porte les associations d’icônes par identité et par édition, ainsi que le placement spécialisé de la carte Flux. Les noms des objets ne déterminent plus leurs icônes. Une nouvelle exception de présentation doit être déclarée dans ces données.
- `metamodel-export.json` décrit le format technique de l’export et ses aides de lecture. Les définitions méthodologiques présentes dans un guide associé restent prioritaires.

Les projections historiques et leur vocabulaire sont figés, avec un contrôle d’empreinte indépendant dans les tests. Ils ne doivent pas servir à corriger une définition métier publiée. Une telle correction relève d’une nouvelle publication canonique. Les éditions non listées ne reçoivent pas automatiquement une projection historique.

Le fichier de travail `modeles/backlog/atlas-reader-content.yaml` contient seulement des références à ces présentations déjà figées. Il n’autorise pas de nouveau texte alternatif. La préparation vérifie le champ canonique par identité et SHA-256, puis incorpore les textes résolus au guide préparé avec les empreintes de toutes ses dépendances. L’export d’une nouvelle édition lit uniquement ce guide publié. Un champ modifié rend sa référence historique invalide : il faut la retirer et utiliser sa nouvelle rédaction canonique publique.

`SheetNavigation.tsx` et `SystemDataSharingMap.tsx` restent conservés hors du point d’entrée actuel. Leurs textes suivent les mêmes ressources ; aucun parcours actif ne dépend de ces composants.

Les JSON exportés conservent les valeurs du snapshot et portent séparément `reader_projection`, `presentation` et les descripteurs du métamodèle. L’adaptateur construit une copie de présentation immuable ; son attribut `raw` comprend cette projection. Il ne modifie ni la réponse d’origine ni le snapshot sur disque.

Les ressources d’interface sont dans `../locales/fr/ui.json`. Les informations du dossier SCM sont dans `../../output/pdf/scm-study.json`, près de sa source PDF unique. Le document reste courant et commun aux versions du modèle.
