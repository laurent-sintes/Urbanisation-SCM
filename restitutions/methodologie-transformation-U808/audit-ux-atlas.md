# Audit UX du parcours Méthodologie dans Atlas

28 septembre 2026. Audit en lecture seule du frontend compilé, alimenté par le catalogue local publié, puis par la nouvelle édition dans une fixture isolée. Vérification sur ordinateur (1440 px) et mobile (390 px), lecture du code et parcours réels dans un navigateur sans fenêtre. Aucun serveur ni publication modifié.

La publication courante contrôlée est `2026-09-28.2`, associée au guide `2026-09-28.1`. La nouvelle méthode est l’édition candidate `2026-09-28.2` : ces deux numéros identiques désignent des objets différents. Captures et observations reproductibles conservées temporairement sous `app/.runtime/audit-methodology/`.

## Conclusion

La refonte éditoriale et l’aperçu HTML ont avancé plus loin que leur intégration UX dans Atlas. Publier seulement le nouveau guide ne corrigera pas l’accueil, les raccourcis et les repères de navigation. La publication actuelle expose encore l’ancien contenu de cartographie sous une enveloppe déjà renommée « Méthodologie ».

## Problèmes confirmés

| Priorité | Constat et preuve | Conséquence | Correction recommandée |
| --- | --- | --- | --- |
| Haute | L’entrée et le titre principal affichent « Méthodologie ». Le titre `guide.title` n’est pas utilisé pour le titre de page. Le sous-titre de `App.tsx` reste « Comprendre le modèle, ses concepts et la manière de le construire. », même avec le candidat. | La méthodologie de transformation n’est pas clairement identifiable. | Utiliser le titre et le sous-titre de l’édition chargée ; rendre la destination explicite dans la navigation. Préserver une formulation fidèle pour les éditions historiques. |
| Haute | « Pour commencer » dans l’édition publiée explique comment lire le modèle. Le candidat « Comprendre la démarche » entre directement dans un long chapitre. | Il manque un accueil orientant vers l’ensemble de la démarche. | Faire de l’accueil un sommaire court : intention, vue d’ensemble, cinq portes d’entrée, puis ressources. Le parcours proposé concerne la lecture et ne prescrit pas des phases de travail. |
| Haute | Les trois raccourcis d’accueil sont codés séparément des rubriques : cartographie, scénarios, notions. Ils ne donnent accès ni aux rubriques méthodologiques ni aux références ou codes. | L’utilisateur retrouve dans le menu des destinations absentes du bandeau, et les raccourcis l’orientent surtout hors de la méthode. | Construire menu et raccourcis depuis une même liste de destinations. Séparer les rubriques, les ressources et les liens vers les autres espaces Atlas. |
| Moyenne | Sur ordinateur, `.method-chapters` est masqué. Sur mobile, il reprend les chapitres mais omet « Codes et identifiants », ajouté séparément dans la sidebar. | Les deux navigations n’offrent pas les mêmes destinations selon l’écran. | Un même ensemble de destinations, avec une présentation compacte sur mobile et un accès constant aux ressources. |
| Moyenne | La page des codes quitte immédiatement le composant normal : aucun bandeau de rubriques, seulement « Retour à la méthode ». Son bouton de sidebar ne possède pas d’état actif. | Rupture des repères de navigation et absence de localisation. | Garder l’enveloppe de la méthode et marquer la ressource courante comme active. |
| Moyenne | En ouvrant une des six clés du métamodèle, aucune rubrique n’est sélectionnée : la sélection compare uniquement l’identifiant du chapitre à celui de la clé. | On ne sait plus dans quelle rubrique on se trouve. | Rattacher visuellement chaque clé à « Métamodèle FLOW », tout en affichant la clé active. Enrichir le fil d’Ariane avec la rubrique courante. |
| Moyenne | Les sommaires locaux, liens de poursuite et précisions repliables de l’aperçu HTML ne sont pas présents dans `ModelingGuidePage.tsx`. | L’amélioration demandée sur la longueur des pages n’est pas transposée dans Atlas. | Porter ces principes dans le composant Atlas : sommaire local, progression de lecture et détails secondaires repliables, sans masquer l’essentiel. |
| Moyenne | « Comprendre les notions » et « Ouvrir le glossaire méthodologique » ciblent tous deux `MOD015`, donc la définition de Capacité. | Un libellé général ouvre une notion particulière sans l’annoncer. | Ouvrir l’index du glossaire ; réserver le lien vers Capacité à un libellé explicite. |
| Moyenne | Depuis le mode publication courante, « Explorer la cartographie » ajoute explicitement `version=2026-09-28.2` à l’URL. Reproduit au navigateur. | Un simple changement d’espace bascule silencieusement vers une publication fixe. | Préserver le mode courant ou fixe de la route d’origine dans tous les liens transverses. |
| Faible | Le glossaire contient encore « Méthode & métamodèle » et des messages « Glossaire du méta modèle », alors que l’entrée est « Méthodologie » et le titre « Glossaire méthodologique ». | Les variations de vocabulaire donnent l’impression de plusieurs destinations. | Harmoniser les libellés de navigation et les messages d’erreur. |

## Points qui fonctionnent

Les éditions restent liées à la publication consultée ; la nouvelle méthode ne fuit pas dans l’ancien guide. Les SVG d’ensemble sont présents dans le candidat, avec lecture agrandie. L’accès au glossaire par les termes liés, les aides au clavier et la navigation mobile ont été vérifiés lors des contrôles précédents. Aucun débordement horizontal global n’a été observé sur les parcours mobiles contrôlés. Cela ne constitue pas une certification exhaustive d’accessibilité.

## Structure recommandée

Accueil « Méthodologie de transformation » : une courte promesse, une vue d’ensemble, puis cinq entrées correspondant à Comprendre la démarche, Explorer et concevoir, Préparer et prendre les décisions, Organiser et réaliser les changements, Mesurer et faire durer.

Ressources clairement séparées : Métamodèle FLOW, Conventions de cartographie, Glossaire méthodologique, Références, Codes et identifiants. Cartographie et Scénarios métier sont des espaces liés, pas des rubriques de la méthode.

Menu latéral et raccourcis doivent exprimer cette même organisation, avec un état actif cohérent. Chaque rubrique conserve un sommaire local et un retour à l’accueil. La nouvelle présentation ne doit pas attribuer aux guides historiques un contenu de transformation qu’ils ne possèdent pas.

L’audit ne modifie pas le frontend et n’active aucune release. Les corrections UX et l’association explicite de la nouvelle édition sont deux opérations distinctes.

## Mise en œuvre après le Go

Les corrections sont intégrées au frontend : titre et sous-titre issus du guide,
accueil spécifique à l’édition de transformation, navigation partagée entre menu et
bandeau, groupes Parcours de lecture et Ressources, accès à l’index du glossaire,
sommaires locaux, précisions repliables et liens de poursuite. Les codes gardent
l’enveloppe de navigation ; les clés restent rattachées au métamodèle. Le fil
d’Ariane indique la rubrique et les liens conservent le mode courant ou fixe.

Le parcours navigateur isolé contrôle la parité des destinations, les états actifs,
le titre de l’édition candidate, les liens sans sélection de terme imposée, le mode
courant, le mobile et le retour au guide publié. Les anciens contenus restent ceux
de leur publication. L’activation de la nouvelle édition n’est pas effectuée par
ces corrections frontend.
