---
name: server-admin
description: Vérifier, démarrer, arrêter ou redémarrer le serveur local FLOW Atlas du projet Beaumanoir Cartographie. Utiliser pour les demandes d’administration de ce serveur ; ne pilote pas d’autres services ni un déploiement distant.
---

# Administration du serveur FLOW Atlas

Intervenir sur le projet Beaumanoir Cartographie, en français et en tutoyant Laurent. Prendre comme racine le projet courant s’il contient `AGENTS.md` et `Lancer-FLOW-Atlas.ps1` ; sinon utiliser `C:/Dev/Beaumanoir Cartographie`. Lire les règles courantes dans `AGENTS.md` et la section de lancement de `app/README.md`.

## Choisir et exécuter l’action

La demande indique l’action : état, démarrage, arrêt ou redémarrage. Si elle demande seulement un diagnostic, ne pas modifier le service. Si elle invoque seulement le skill sans action ni contexte, lire l’état puis demander l’action souhaitée. Utiliser le port demandé, sinon 8765. Garder ce même port pour toute l’opération.

Pour un démarrage ordinaire, réutiliser les instructions déjà lues et encore applicables. Sinon, regrouper les lectures nécessaires en un appel. Exécuter ensuite le lancement et le contrôle léger dans **un seul appel d’exécution**, sans appel HTTP préalable séparé. Dans l’environnement Codex Windows où le lancement et le HTTP local nécessitent une élévation, demander directement cette permission technique pour l’appel groupé ; ne pas répéter une tentative déjà connue pour échouer dans le bac à sable. La demande de démarrage autorise l’opération, sans nouvelle confirmation fonctionnelle.

Le lanceur existant assure le suivi du processus et les contrôles d’identité, y compris lorsqu’il réutilise un serveur actif. Son succès dispense de répéter la requête d’identité. Exécuter depuis la racine du projet, dans PowerShell :

```powershell
# Démarrer sans ouvrir une fenêtre de navigateur
$ErrorActionPreference = 'Stop'
.\Lancer-FLOW-Atlas.ps1 -Port 8765 -NoBrowser
$atlasCatalog = Invoke-RestMethod -Uri 'http://127.0.0.1:8765/data/index.json' -TimeoutSec 3
$atlasBuiltCatalog = Get-Content -LiteralPath 'app/dist/data/index.json' -Raw | ConvertFrom-Json
if (-not $atlasCatalog.current_version -or $atlasCatalog.current_version -ne $atlasBuiltCatalog.current_version) {
    throw 'Le catalogue servi ne correspond pas au build local.'
}
Write-Output ("Publication servie : " + $atlasCatalog.current_version)

# Arrêter le serveur suivi
.\Lancer-FLOW-Atlas.ps1 -Port 8765 -Stop
```

Pour **redémarrer**, exécuter l’arrêt puis le démarrage séquentiellement ; ne pas lancer le démarrage si l’arrêt échoue. Si aucun serveur n’est actif et que le port est libre, un redémarrage revient à démarrer. Un démarrage répété réutilise le serveur correspondant, sans créer de second processus. N’ouvrir le navigateur que si demandé.

Pour une demande d’état seule, ou un diagnostic après échec du lanceur, lire l’identité avec une requête bornée dans le temps :

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8765/__atlas__/identity.json' -TimeoutSec 3
```

Le résultat attendu identifie `appName: FLOW Atlas`, `repositoryRoot` égal à la racine du projet, un PID et `mode: static`. Avant un arrêt, le lanceur vérifie également le fichier `app/.runtime/server-<port>.json` et la date de démarrage, afin de ne pas arrêter un PID réutilisé. Ne pas remplacer ces contrôles par un arrêt global des processus Python ou par un arrêt fondé seulement sur le numéro du port.

## Vérifier le résultat et traiter les échecs

Après démarrage ou redémarrage réussi, le contrôle groupé ci-dessus suffit : identité confirmée par le lanceur et version servie conforme au catalogue du build local. Ne pas télécharger le modèle complet, lancer Python/PyYAML, reconstruire, exporter ou auditer les publications pour une simple demande de démarrage. La conformité du build aux sources publiées relève des contrôles de build/release ; ne pas annoncer qu’elle a été revérifiée ici. En cas d’écart ou de demande explicite de contrôle du contenu, effectuer alors le diagnostic ciblé du catalogue publié, de son descripteur et du modèle servi. Le backlog et le panorama ne sont plus exposés par Atlas selon U117.

Après arrêt, vérifier que le processus suivi a disparu et que le point d’identité de ce serveur ne répond plus, dans le même appel que l’arrêt si possible. Une panne HTTP seule ne prouve pas l’arrêt du processus : en cas de doute, lire le suivi et les journaux. Pour un redémarrage, regrouper arrêt, démarrage et contrôle léger dans un appel, avec arrêt immédiat sur erreur.

Les journaux sont `app/.runtime/server-<port>.stdout.log` et `server-<port>.stderr.log`. En cas de port occupé, d’identité incohérente ou de suivi périmé, diagnostiquer avant toute nouvelle action ; conserver les services non identifiés comme ceux du projet. Si une permission système empêche l’action autorisée, demander uniquement l’élévation nécessaire à la commande ciblée, sans modifier les politiques PowerShell ni contourner les contrôles du lanceur.

L’administration seule ne modifie ni le modèle ni le pointeur de release. Les JSON réexportés par la release se lisent après actualisation ; une modification du code Python exige un redémarrage. Terminer par l’état vérifié, l’URL et le port, ou l’erreur concrète qui empêche d’atteindre l’état demandé.

Le serveur ne lit aucun YAML et n’a besoin que de Python standard. `pnpm --dir app build` prépare interface et données ; `python scripts/export_atlas.py` actualise seulement les JSON après contrôle des publications. PyYAML, épinglé dans `requirements.txt`, est requis pour cet export uniquement. Le lanceur accepte l’ancien `/api/status` seulement lors d’un arrêt de migration, afin de vérifier et arrêter l’ancien serveur avant le premier démarrage statique.
