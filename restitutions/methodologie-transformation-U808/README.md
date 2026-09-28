# Méthodologie de transformation — refonte U825

La refonte autorisée par Laurent est mise en œuvre dans l’édition candidate
[`atlas-transformation-methodology.yaml`](../../modeles/backlog/atlas-transformation-methodology.yaml).
Ce YAML est la source éditoriale ; les aperçus ci-dessous en sont des rendus.

- [Sommaire et parcours de lecture](methodologie-transformation.html)
- [Commencer par la vue d’ensemble](methodologie/start.html)
- [Vue d’ensemble de la transformation — SVG](parcours-transformation.svg)
- [Gouvernance et préparation des décisions — SVG](gouvernance-decisions.svg)

Les cinq rubriques de travail sont des entrées thématiques, pas des phases.
Le métamodèle, les conventions de cartographie et les références restent distincts.
Le glossaire méthodologique conserve les notions du modèle et accueille les notions
utiles à la démarche sans ajouter de nouveaux objets métier.

Le frontend Atlas sait afficher cette édition et conserve les anciens guides.
L’édition est publiée dans Atlas avec le modèle `2026-09-28.3` (v041).
Les rôles Leader et Board nomment la gouvernance évoquée dans les échanges ;
ils n’ajoutent aucun mandat ou pouvoir. Les exemples ne décrivent pas un existant
Beaumanoir constaté.

Vérifications du 28 septembre 2026 : validation des modèles sans erreur, six tests
de contrat des rubriques, dix-sept tests du lecteur de guide (un autre ignoré),
huit tests frontend ciblés, compilation Atlas, préparation temporaire du guide et
parcours navigateur isolé. Ce dernier contrôle les huit rubriques, les deux SVG,
le glossaire au clavier, la navigation mobile et le retour au guide publié.
Rendus examinés sur grand écran et téléphone. Publication activée le 28 septembre 2026.

Les documents `proposition.md` et `revue-globale.md` conservent la proposition et son
examen antérieurs à U825. À la demande U827, les deux compositions SVG d’origine
sont reprises et adaptées : elles redeviennent les vues d’ensemble de référence.
Les fichiers `dimensions-refonte.svg` et `gouvernance-refonte.svg` conservent les
essais simplifiés, remplacés dans l’aperçu et dans l’édition candidate.
Les SVG complets sont embarqués dans le YAML de l’édition pour figer leur contenu
avec la publication. L’interface les affiche comme images autonomes et propose
un agrandissement défilable au clavier, également disponible sur mobile.
Pour le régénérer après modification : compiler Atlas puis exécuter
`node app/verify-transformation-method.mjs` ; les rendus sont produits dans
`app/.runtime/qa-transformation-method/` avant leur copie ici.

U828 : l’aperçu est découpé en pages sous `methodologie/`, avec sommaire général,
sommaires locaux et parcours de lecture. Les précisions sont repliables. Aucune
durée de cadrage n’est prescrite ; les questions, les preuves et les décisions
guident la progression. Le parcours organise la lecture, pas l’ordre des travaux.
La cadence mensuelle du comité conserve son sens de gouvernance existante.
Copier aussi le dossier `methodologie/` pour partager ou régénérer cet aperçu.
