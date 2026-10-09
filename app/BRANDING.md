# Identité FLOW — U207/U208

L’identité proposée à partir du template projet FLOW est adoptée par Laurent le 15 septembre 2026 (U208). Elle est intégrée à l’application React : emblème FLOW dans `src/App.tsx`, signature Beaumanoir dans `src/components/Sidebar.tsx`, palette et adaptations d’écran dans `src/brand.css`, chargé après les styles de structure. Aucun chargement de police externe ni contrôle de comparaison n’est embarqué.

## Source des logos

Fichier fourni : `C:/Users/laure/OneDrive/Documents/Beaumanoir/Template PPT projet.pptx`.

SHA-256 du PPTX : `18744eea725ed3f0d65a2bb0bd3bb95766549e23abca81997a2cd9a7728ef0a4`.

Les deux PNG de `public/assets/` sont les médias originaux extraits, sans modification de leurs octets. Vite les copie dans `dist/assets/` ; le serveur Atlas les expose par sa route d’images existante.

| Fichier | Média du PPTX | Dimensions | SHA-256 |
| --- | --- | --- | --- |
| `flow-original.png` | `ppt/media/image2.png` | 1024 × 1024 | `e5c9c7b7bdcca2e1d152ee50365d28d37a9965493a0c12a52a50da2da754fbad` |
| `beaumanoir-original.png` | `ppt/media/image1.png` | 1564 × 605 | `c0c534d79d78e1f582971fa742e05797d2c98261fc6f82e3da4173415135765a` |

L’en-tête cadre uniquement l’emblème FLOW en CSS, près du nom FLOW Atlas. Depuis la revue du 19 septembre 2026, le logo Groupe Beaumanoir reste intégral en petite signature de 76 px dans le pied de la navigation, près des statistiques. Sur mobile, il est accessible dans le volet de navigation. Le logo FLOW intégral sert aussi d’icône de page et de manifeste. Les fichiers sources conservent leurs marges et leur signature d’origine.

La barre haute mesure 52 px. Elle accueille le bouton du panneau latéral ; sur grand écran, elle affiche aussi le fil d’Ariane et les actions. Sur mobile, le fil d’Ariane reste sous cette barre. Les titres, descriptions et onglets demeurent fixes ; le contenu défile.

Repères consultés le 19 septembre 2026 : [Carbon — UI shell header](https://carbondesignsystem.com/components/UI-shell-header/usage/) (identité, navigation persistante et actions) et [Fluent 2 — Layout](https://fluent2.microsoft.design/layout) (proximité, espacement et adaptation aux écrans). Ce sont des guides de design, pas une certification de conformité d’Atlas ; le placement de la signature Beaumanoir est un choix local demandé par Laurent.

Extraction reproductible, sources OOXML et empreintes : [dossier U207](../prototypes/atlas-identite-flow/README.md), [provenance des médias](../prototypes/atlas-identite-flow/assets-provenance.json).

## Palette

| Couleur | Code source | Application |
| --- | --- | --- |
| Vert FLOW | `#236159` | Titres, liens, actions et repères de navigation |
| Menthe | `#D9F2EA` | Sélection et surfaces légères |
| Lavande | `#DAE0F2` | Glossaire et surfaces secondaires |
| Sable | `#EADFCD` | Référentiels et groupes de présentation |
| Pêche | `#FFD8B2` | Accents ponctuels |
| Blanc cassé | `#FCFDFD` | Fond et en-tête |

Ces couleurs viennent des formes des masques, documentées dans [palette.json](../prototypes/atlas-identite-flow/palette.json), et non des accents génériques Office ou des guides d’édition. Les teintes plus légères, les bordures, l’encre de lecture et le trait sous l’en-tête sont des adaptations pour l’application. Les couleurs de statut restent sémantiques et indépendantes de la marque.

Polices demandées : Aptos pour le texte, Aptos Display pour les titres ; repli sur Segoe UI et Arial. Aucune police Office n’est redistribuée.

## Maintenance

Conserver les deux fichiers sources, leurs proportions et leurs couleurs. Pour une évolution, modifier les variables et règles de `src/brand.css`, compiler avec `pnpm --dir app build`, puis recharger Atlas. Les données publiées restent lues à l’exécution ; aucune release métier n’est nécessaire pour cet habillage.
