# Audit du glossaire du métamodèle — U805

28 septembre 2026. Statut : recommandations, non appliquées. Références inspectées : glossaire méthodologique du backlog, glossaire métier, guide figé 2026-09-27.4 associé à la publication 2026-09-28.1, rendu `GlossaryPage.tsx`, types du front et capacités du modèle. La release en cours au début de l’audit ne contient pas ces propositions.

## Conclusion

Retirer Application transactionnelle du glossaire courant. Cette entrée décrit une réalisation informatique, pas un objet permettant de comprendre la cartographie. La notion utile est plus simple : une décision produit un résultat, une capacité responsable le rend effectif. Cette distinction peut rester dans la méthode, sans notion supplémentaire ni couche transactionnelle.

Le problème dépasse cette entrée : le glossaire rassemble objets, attributs, vocabulaire de comparaison, conventions éditoriales et aide à la maintenance. Atlas présente 40 entrées actives : 30 MOD et 10 TER importées du glossaire métier. Six couples traitent les mêmes notions. La mention de leur provenance ne résout pas le doublon.

## Décisions recommandées

| Entrées | Constat | Recommandation |
| --- | --- | --- |
| MOD004 Application transactionnelle | Définition circulaire utilisant « transactionnellement » ; interfaces et traitements unitaires/en masse ; confusion possible avec une application informatique. | Retirer du glossaire courant, conserver les preuves historiques. Remplacer les renvois actifs par une explication simple de la mise en effet du résultat. Ne pas créer une entrée synonyme. |
| MOD015/TER001, MOD008/TER030, MOD016/TER026, MOD017/TER027, MOD018/TER028, MOD019/TER029 | Deux entrées pour capacité, domaine, réalisation, fonction, fonctionnalité et regroupement. La définition TER030 du domaine ne précise pas sa place dans Business System contrairement à MOD008. | Une définition méthodologique de référence et une seule entrée visible par notion. Migrer les liens courants ; conserver les documents figés. |
| MOD007 Type de capacité ; MOD001/002/003/020/021 ; TER031 | Typologie dispersée et incomplète dans le glossaire. La note backlog annonce sept types alors que le front en reconnaît dix et que neuf sont utilisés actuellement. Gestion n’est pas utilisée par une capacité actuelle, ce qui ne suffit pas à supprimer la notion. | Une liste cohérente des types avec leur définition courte sous Type de capacité. Vérifier les sources de vérité plutôt que maintenir plusieurs listes. Ne pas reclasser les capacités dans ce lot. |
| MOD009 Référentiel métier, MOD014 Gouvernance des données | Définition du référentiel encombrée par CRUD, Projection et Domain-View. Gouvernance des données décrit en réalité une dimension plus étroite de responsabilité locale. | Définir d’abord le référentiel par son utilité métier. Préciser séparément qui tient la donnée ou la vue. Envisager « Responsabilité sur les données » pour l’attribut local, sans redéfinir toute la gouvernance des données. |
| MOD003 Management | « Gestion / gouvernance » fusionne deux mots ; notes encore centrées sur Stock Protection et Supply Protection au lieu du nom courant Supply Protection Policy. | Libellé Gestion, définition par le résultat durable ; enlever l’historique du texte de lecture. Expliquer séparément la frontière avec Policy. |
| MOD002 Planning | La définition englobe construction, analyse, application et adaptation ; des notes du backlog citent Inventory Planning/D05, devenus des repères historiques. | Courte définition de la planification ; convention FLOW sur l’application présentée séparément et à sa portée exacte. Ne pas en déduire que la planification absorbe l’exécution physique. |
| MOD005 Couverture — convention de description | Instruction de rédaction plutôt que définition d’un objet. | Déplacer dans les règles de modélisation. Si une aide reste nécessaire, distinguer couverture d’un scénario par les capacités et couverture d’une capacité par des moyens de réalisation. |
| MOD017 Fonction | La fiche avertit que le mot est ambigu, sans définir une notion du modèle. | Déplacer dans « Termes à ne pas confondre », à côté de Capacité et Fonctionnalité de produit. Ne pas créer un niveau Fonction. |
| MOD018 Fonctionnalité de produit | Définie comme un « comportement », ce qui brouille la distinction avec le Behavior métier. | « Possibilité offerte par un logiciel dans une version et une configuration données. » Utile dans la comparaison avec les solutions, pas comme objet de la hiérarchie métier. |
| MOD019 Regroupement de capacités | Peut être pris pour un niveau supplémentaire alors qu’il décrit un mécanisme de présentation. | Expliquer dans les règles de classement : hiérarchie, catégorie et filtre ont des rôles distincts. |
| MOD023/024/025 Identifiant, code, ordre | Aide de lecture et maintenance mélangée aux notions métier. « Immuable » doit être articulé avec l’exception explicite U804. | Regrouper dans « Lire les codes et les identifiants ». Garder la stabilité comme règle générale ; documenter la migration exceptionnelle sans en faire une nouvelle règle de renommage libre. |
| MOD026 Cas d’usage métier | Déjà retiré ; exclu de la liste active, accessible sur sélection explicite historique. | Ne pas le réintroduire ; aucune nouvelle suppression structurelle nécessaire. |
| MOD006/011 Comportement et type ; MOD008/013/015/022 hiérarchie | Notions utiles et cohérentes avec les objets lus dans Atlas. | Conserver ; raccourcir la définition de Comportement, déplacer la longue énumération de formes vers Type de comportement. |
| MOD010 Relation, MOD012 Information, TER002 Objet métier | Nécessaires pour expliquer les objets et leurs liens ; information et objet doivent garder des frontières lisibles. | Conserver ; exemples courts et distinction entre objet dont on parle, information que l’on connaît, et lien entre objets du modèle. |
| MOD027–031 Scénario, parcours, flux et étapes | Objets distincts utiles ; deux sortes d’étapes peuvent être confondues. | Conserver et montrer un exemple commun. Une étape de valeur décrit la progression vers la valeur ; une étape de mobilisation décrit les contributions dans un parcours donné. |
| TER024 Processus, TER025 Opération, MOD016 Réalisation | Vocabulaire de comparaison utile pour préciser la frontière de la cartographie. | Conserver dans les notions connexes. La seule absence de rôles ou de couloirs BPMN ne suffit pas à distinguer parcours et processus : expliciter l’intention et le contenu de chaque vue. |

## Structure proposée dans Atlas

1. Objets et liens : système, domaine, sous-domaine, capacité, comportement, référentiel, objet/information, relation ; scénario, parcours, flux de valeur et leurs étapes.
2. Qualificatifs : type de capacité, type de comportement, responsabilité sur les données. Définitions courtes et une seule liste de valeurs par attribut.
3. Notions connexes : processus, opération, réalisation, fonctionnalité. Elles expliquent les frontières sans devenir des niveaux de la carte.

Codes, identifiants, ordre de lecture, couverture et précautions sur « fonction » rejoignent les pages d’aide ou les règles de méthode. Ces rubriques sont des regroupements de lecture, pas des niveaux supplémentaires du modèle.

## Impact concret du retrait de MOD004

La simple suppression de sa ligne laisserait des renvois incohérents. Le guide comporte encore un renvoi dans MOD003 et une note dans MOD001. La fiche Supply Protection Policy décrit l’application transactionnelle et ses interfaces. Deux comparaisons de marché du modèle emploient aussi l’expression : vérifier leur sens avant de les reformuler, sans modifier leurs preuves. Les sources historiques U231/U232 restent intactes.

La suppression doit porter sur le glossaire méthodologique courant, les liens/notes actifs et une nouvelle édition figée du guide. Le guide publié ne se modifie pas sur place. Le glossaire métier doit être contrôlé en même temps pour éviter les doublons et liens orphelins.

## Repères externes et limites

La [Business Architecture Guild, programme de référence](https://learning.businessarchitectureguild.org/self-study), consultée le 28 septembre 2026, distingue les cartes de capacités, de valeur, d’organisation et d’information, leurs interactions, ainsi que les disciplines connexes. Cela appuie une séparation entre objets, vues et réalisation ; ce document ne prescrit ni notre hiérarchie à cinq niveaux ni les types FLOW.

La [présentation Guild sur flux de valeur et processus](https://learning.businessarchitectureguild.org/products/webinar-value-streams-business-processes-the-business-architecture-perspective), consultée le même jour, traite explicitement leur articulation avec les capacités. La distinction est utile ici ; seul le résumé public a été consulté, pas l’enregistrement réservé.

Les tentatives d’accès au PDF public BIZBOK 9 partie 1 et à la page historique TOGAF Business Scenarios ont renvoyé 403. Aucune conformité ni absence de notion dans l’ensemble de ces référentiels n’est donc affirmée. Le retrait de MOD004 est recommandé sur la cohérence interne et l’utilité pour le lecteur, pas sur un prétendu interdit BIZBOK/TOGAF. Cet audit ne modifie aucune fiche métier et ne constitue pas une comparaison de fonctions SAP/Microsoft.

## Ordre de mise en œuvre proposé

Retirer MOD004 et traiter ses renvois ; dédoublonner les six couples ; réunir les types et corriger les formulations trop techniques ; ranger les conventions dans la méthode ; préparer un nouveau guide et vérifier recherche, liens et infobulles dans la même publication. Les définitions métier et classifications des capacités ne sont pas approuvées automatiquement par cet audit.
