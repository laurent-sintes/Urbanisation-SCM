# Alignement de la SPA sur le modèle courant

Audit du 28 septembre 2026, corrigé selon U804. Périmètre : identité technique du domaine Supply Chain Orchestration, références courantes, routes, ancres de fiches, niveaux du graphe et documentation. Aucun changement de responsabilité métier.

## Résultat

L’identité du domaine est désormais `supply-chain-orchestration` dans le backlog. Ses dix relations, les liens du glossaire, les 23 rattachements d’illustrations et les contrôles de livraison concernés utilisent cette identité. L’identifiant de sa relation de présentation a également été aligné. Les accords U804 capturent uniquement les extrémités modifiées des dix relations, sans valider à nouveau les définitions ni les qualifications métier.

Le front utilise directement les identités canoniques pour ses URL. Aucun alias vers `universe-supply` n’a été ajouté. La solution initiale de masquage par les codes DOM/SUB/CAP a été retirée à la demande de Laurent. Les codes restent des repères de lecture et de recherche.

## Autres corrections de l’audit

- Les adresses des niveaux du graphe utilisent `subdomain` dans le découpage courant.
- Ouvrir Relations depuis un système métier choisit le niveau Système métier.
- Le repli de l’aide utilise Logistics ; le nom publié reste prioritaire.
- L’icône générique du bandeau utilise une classe de contexte distincte des univers historiques.
- Le README décrit Business System → Domain → Subdomain → Capability → Behavior.

## Historique et publication

Les publications figées, preuves et audits historiques conservent leurs identifiants d’origine. Les déclarations de livraison encore contrôlées contre le backlog sont alignées sur l’identité courante. U804 constitue une exception explicite à U783 pour cet objet ; l’ancien identifiant ne sera pas réutilisé.

Atlas continue de lire exclusivement les snapshots publiés. Le nouvel identifiant sera visible sur le site après une nouvelle release et un déploiement. Aucune publication, aucun commit ni push n’a été effectué dans ce lot.

## Contrôles

Validation globale des modèles, tests ciblés du renommage et des références, 126 tests frontend et build. La recette navigateur vérifie aussi une copie de test portant l’identité du backlog, sans injecter ce backlog dans Atlas : adresse canonique, rechargement, focus sur une section, relations, retours de scénario et lecture mobile. Résultats de recette conservés dans les artefacts locaux de contrôle.
