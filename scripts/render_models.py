"""Render reading views from the current structured models. No business data is edited."""
import json
from collections import Counter
from pathlib import Path
try:
    from .business_scenarios import scenarios_for_node
    from .release_catalog import resolve_release
    from .lifecycle import lifecycle_label
except ImportError:
    from business_scenarios import scenarios_for_node
    from release_catalog import resolve_release
    from lifecycle import lifecycle_label

ROOT = Path(__file__).resolve().parents[1]
LABELS = {'accepted':'Validé','partial':'Partiellement validé','proposed':'Non validé','under_review':'En réexamen','illustration':'Illustration'}
REQUEST_ORIGIN_LABELS = {'frontoffice': 'Frontoffice', 'backoffice': 'Backoffice'}
BEHAVIOR_ASPECT_LABELS = {'trigger': 'Déclenchement', 'activity': 'Activité'}


def status(item):
    label = lifecycle_label(item)
    if label:
        scope = item['lifecycle'].get('validated_fields', [])
        return label + (' — portée : ' + ', '.join(scope) if scope else '')
    return LABELS[item['review']['state']]


try:
    from .structured_io import read, working_path, write_text_if_changed
except ImportError:
    from structured_io import read, working_path, write_text_if_changed


def cell(value):
    return str(value).replace('|','\\|').replace('\n',' ')


def market_lines(entries, heading='###'):
    lines = []
    for entry in entries:
        lines += [f"{heading} {entry['vendor']} — {entry['element_name']}", '',
                  f"{entry['product']} · {entry['element_type']} · {entry['relationship']} · statut : {entry['status']}", '']
        for key, label in [('term_choice', 'Pourquoi ce terme'), ('definition_choice', 'Pourquoi cette définition')]:
            if entry.get(key):
                lines += ['**' + label + '.** ' + entry[key], '']
        lines += ['**Points communs.** ' + entry['similarities'], '',
                  '**Différences.** ' + entry['differences'], '',
                  '**Position FLOW.** ' + entry['flow_position'], '',
                  f"[{entry['source_title']}]({entry['source_url']}) — {entry['source_version']}, consulté le {entry['consulted_on']}.", '',
                  '**Passage.** ' + entry['source_locator'], '',
                  '**Limite de preuve.** ' + entry['evidence_limits'], '',
                  'Références : ' + ', '.join(entry['source_refs']) + '.', '']
    return lines


def inspiration_lines(inspiration, entries, name):
    """Render authored comparisons, with their original supporting detail intact."""
    lines = [inspiration['choice'], '',
             '| Source et nom employé | Périmètre | Approche |',
             '| --- | --- | --- |']
    for entry in entries:
        source = f"[{entry['vendor']}]({entry['source_url']}) — {entry['concept_name']}"
        lines.append('| ' + ' | '.join(cell(v) for v in [source, entry['scope_summary'], entry['approach_summary']]) + ' |')
    lines.append('| ' + ' | '.join(cell(v) for v in ['Notre modèle — ' + name, inspiration['flow_scope'], inspiration['flow_approach']]) + ' |')
    lines += ['', '### Ce que nous en retenons', '']
    lines += ['- ' + value for value in inspiration['synthesis']]
    lines += ['']
    for example in inspiration['examples']:
        lines += ['### ' + example['title'], '', example['situation'], '']
        for key, label in [('outcome', 'Ce qui se passe'), ('lesson', 'Ce que cela illustre dans FLOW')]:
            if example.get(key):
                lines += ['**' + label + '.** ' + example[key], '']
        lines += [f"Source : [{example['source_title']}]({example['source_url']}).", '',
                  'Références : ' + ', '.join(example['source_refs']) + '.', '']
    lines += ['### Détails des références', ''] + market_lines(entries, heading='####')
    return lines


def render(model, label):
    lines = [f'# {label} — {model["version"]}', '', f'Restitution générée depuis le modèle structuré, connaissance au {model["as_of"]}. Ne pas éditer cette vue pour modifier le modèle.', '', 'Publication et validation sont distinctes. Le statut d’un rattachement peut différer de celui de la capacité.', '']
    if any(node['fields'].get('request_origins') for node in model['nodes']):
        lines += ['Origine des demandes : **Frontoffice** désigne une sollicitation externe au Domain ; **Backoffice**, une sollicitation interne. Une famille peut porter les deux origines. La provenance de l’événement déclencheur est distincte.', '']
    nodes = {n['id']:n for n in model['nodes']}
    levels = [n for n in model['nodes'] if n.get('kind') == 'universe' or n.get('group_role') == 'urbanism_level'
              or n.get('kind') == 'business_system'
              or (n.get('kind') == 'domain' and any(
                  r['type'] == 'presents' and r['source_id'] == n['id'] for r in model['relations']))]
    if levels:
        lines += ['## Niveaux d’urbanisation', '', '| Repère | Nom | Niveau | Contenu direct | Statut |', '| --- | --- | --- | --- | --- |']
        for level in levels:
            children = [nodes[r['target_id']]['fields'].get('name', r['target_id']) for r in model['relations'] if r['type'] in ('contains', 'presents') and r['source_id'] == level['id']]
            level_name = level['fields'].get('name', 'Universe') if level['kind'] == 'universe' else level['level_ref'] if level.get('group_role') == 'urbanism_level' else 'Business System' if level['kind'] == 'business_system' else 'Domain'
            lines.append('| ' + ' | '.join(cell(v) for v in [level['id'], level['fields'].get('name', ''), level_name, ', '.join(children) or 'Exploration différée', status(level)]) + ' |')
        lines += ['', 'Les groupes de présentation conservent leur rôle distinct des niveaux de décomposition métier.', '']
    for domain in model['nodes']:
        if domain['kind'] not in ('universe', 'business_system', 'domain', 'area', 'business_area', 'reference'):
            continue
        lines += [f'## {domain["id"]} — {domain["fields"].get("name", "Libellé à préciser")}', '', f'Statut : **{status(domain)}**.', '', domain['fields'].get('definition','Définition à préciser.'), '']
        if domain['fields'].get('data_governance'):
            lines += ['Gouvernance des données : **' + domain['fields']['data_governance'] + '**.', '']
        presented = [nodes[r['target_id']] for r in model['relations']
                     if r['type'] == 'presents' and r['source_id'] == domain['id']]
        if presented:
            hierarchy_principles = {p.get('id') for p in model.get('principles', [])}
            purpose_label = ('Sous-domaine' if 'PRINCIPLE-DOMAIN-SUBDOMAIN' in hierarchy_principles
                             else 'Purpose' if 'PRINCIPLE-DOMAIN-PURPOSE' in hierarchy_principles else 'Area')
            labels = {'domain': 'Domain', 'area': purpose_label, 'business_area': 'Business Area', 'reference': 'Référentiel', 'group': 'Groupe de présentation'}
            lines += ['| Repère | Nom | Type | Statut |', '| --- | --- | --- | --- |']
            for child in presented:
                lines.append('| ' + ' | '.join(cell(v) for v in [child['id'], child['fields'].get('name', child['id']), labels.get(child['kind'], child['kind']), status(child)]) + ' |')
            lines += ['']
        contains = [r for r in model['relations'] if r['type'] == 'contains' and r['source_id'] == domain['id']]
        show_origins = any(nodes[r['target_id']]['fields'].get('request_origins') for r in contains)
        show_governance = any(nodes[r['target_id']]['fields'].get('data_governance') for r in contains)
        if contains or not presented:
            columns = ['Repère', 'Élément', 'Type'] + (['Gouvernance des données'] if show_governance else []) + (['Origine des demandes'] if show_origins else []) + ['Statut', 'Définition', 'Finalité', 'Rattachement']
            lines += ['| ' + ' | '.join(columns) + ' |', '| ' + ' | '.join('---' for _ in columns) + ' |']
        for relation in contains:
            n=nodes[relation['target_id']]; f=n['fields']
            values = [n['id'], f.get('name','Libellé à préciser'), f.get('nature', 'Non renseigné')]
            if show_governance:
                values.append(f.get('data_governance', '—'))
            if show_origins:
                values.append(', '.join(REQUEST_ORIGIN_LABELS[value] for value in f.get('request_origins', [])) or '—')
            values += [status(n), f.get('definition','À préciser'), f.get('finality','À préciser'), status(relation)]
            lines.append('| '+ ' | '.join(cell(v) for v in values)+' |')
        lines += ['']
    for capability in model['nodes']:
        behaviors = [nodes[r['target_id']] for r in model['relations']
                     if r['type'] == 'contains' and r['source_id'] == capability['id']
                     and nodes[r['target_id']]['kind'] == 'behavior']
        if not behaviors:
            continue
        rationale = capability['fields'].get('decomposition_rationale')
        if rationale:
            lines += [f'**Justification de la décomposition — {capability["id"]} :** {rationale}', '']
        show_aspects = any(behavior['fields'].get('behavior_aspect') for behavior in behaviors)
        columns = ['Repère', 'Comportement'] + (['Angle de lecture'] if show_aspects else []) + ['Statut', 'Définition']
        lines += [f'## Comportements — {capability["fields"].get("name", capability["id"])}', '',
                  'Dernier niveau de détail de la capacité ; les comportements ne sont pas des capacités supplémentaires.', '',
                  '| ' + ' | '.join(columns) + ' |', '| ' + ' | '.join('---' for _ in columns) + ' |']
        for behavior in behaviors:
            values = [behavior['id'], behavior['fields']['name']]
            if show_aspects:
                values.append(BEHAVIOR_ASPECT_LABELS.get(behavior['fields'].get('behavior_aspect'), '—'))
            values += [status(behavior), behavior['fields']['definition']]
            lines.append('| ' + ' | '.join(cell(v) for v in values) + ' |')
        lines += ['']
    for node in model['nodes']:
        scenarios = scenarios_for_node(node, nodes)
        if scenarios:
            lines += [f"## Scénarios métier — {node['id']} {node['fields'].get('name', '')}", '']
            for example in scenarios:
                lines += ['### ' + example['title'], '', example['situation'], '']
                for key, label in [('source_node', 'Fiche d’origine'), ('contribution', 'Contribution de cette fiche'),
                                   ('trigger', 'Déclencheur'), ('objective', 'Résultat recherché')]:
                    if example.get(key):
                        lines += ['**' + label + '.** ' + example[key], '']
                for key, label in [('constraints', 'Contraintes'), ('options', 'Options examinées'), ('contributions', 'Contributions métier')]:
                    if example.get(key):
                        lines += ['**' + label + '**', '']
                        for value in example[key]:
                            text = value if isinstance(value, str) else value.get('role') or value['title'] + ' : ' + value['description']
                            lines += ['- ' + text]
                        lines += ['']
                for key, label in [('outcome', 'Ce qui se passe'), ('lesson', 'Ce que cela illustre')]:
                    if example.get(key):
                        lines += ['**' + label + '.** ' + example[key], '']
                for index, step in enumerate(example.get('steps', []), 1):
                    lines += [f"#### {index}. {step['title']}", '', step['description'], '',
                              '| Capacité mobilisée | Contribution |', '| --- | --- |']
                    for contribution in step['contributions']:
                        target = nodes[contribution['node_id']]
                        lines += ['| ' + cell(target['fields']['name'] + ' (' + target['id'] + ')') + ' | ' + cell(contribution['role']) + ' |']
                    lines += ['', '**Résultat attendu.** ' + step['outcome'], '']
                if example.get('validation_points'):
                    lines += ['**Ce que ce cas permet de vérifier**', ''] + ['- ' + point for point in example['validation_points']] + ['']
                lines += ['Références : ' + ', '.join(example['source_refs']) + '.', '']
        entries = node['fields'].get('market_comparisons', [])
        if entries:
            name = node['fields'].get('name', '')
            inspiration = node['fields'].get('market_inspiration')
            lines += [f"## Sources d’inspiration — {node['id']} {name}", '']
            lines += inspiration_lines(inspiration, entries, name) if inspiration else market_lines(entries)
    for term in model.get('glossary', {}).get('terms', []):
        if term.get('market_comparisons'):
            entries = term['market_comparisons']
            inspiration = term.get('market_inspiration')
            lines += [f"## Sources d’inspiration — {term['name']}", '']
            lines += inspiration_lines(inspiration, entries, term['name']) if inspiration else market_lines(entries)
    catalogue = model.get('information_catalog')
    if catalogue:
        lines += ['## Informations métier', '', 'Vue transversale des informations utiles aux capacités ; aucune structure de données implémentable prescrite.', '']
        for item in catalogue['items']:
            lines += [f"### {item['id']} — {item['name']}", '', item['question'], '', item['definition'], '', '**Contexte :** ' + item['context'], '']
            lines += ['- ' + value for value in item['essential_elements']]
            lines += ['', '**Usages par les capacités :**', '']
            lines += ['- ' + nodes[r['capability_ref']]['fields']['name'] + ' — ' + r['role'] + ' : ' + r['meaning'] for r in item['capability_roles']]
            lines += ['', '**Exemples :**', ''] + ['- ' + e['situation'] for e in item['examples']]
            lines += ['', '**Marché et choix :**', ''] + market_lines(item['market_comparisons'])
        lines += ['### Liens entre informations', '', '| Origine | Sens | Destination | Condition | Effet |', '| --- | --- | --- | --- | --- |']
        names = {item['id']:item['name'] for item in catalogue['items']}
        for link in catalogue['links']:
            lines.append('| ' + ' | '.join(cell(x) for x in [names[link['from_ref']], link['meaning'], names[link['to_ref']], link['condition'], link['effect']]) + ' |')
        lines += ['']
    if model.get('scenario_catalog'):
        catalogue = model['scenario_catalog']
        lines += ['## Catalogue des scénarios', '', 'Flux de valeur et scénarios autonomes ; les contenus proposés ne sont pas des preuves de réalisation.', '']
        for stream in catalogue['value_streams']:
            lines += ['### ' + stream['label_fr'], '', stream['value'], '']
            for scenario in catalogue['scenarios']:
                if stream['id'] in scenario['value_stream_ids']:
                    paths = [p for p in catalogue['paths'] if p['scenario_id'] == scenario['id']]
                    lines.append('- ' + scenario['title'] + ' (`' + scenario['id'] + '`) — ' + str(len(paths)) + ' parcours.')
            lines += ['']
    if model['space']=='release':
        lines += ['## Portée des validations', '', '| Repère | Champs adoptés | Champs restant proposés | Décisions |', '| --- | --- | --- | --- |']
        for n in model['nodes']:
            lines.append('| '+ ' | '.join(cell(v) for v in [n['id'],', '.join(n.get('approved_fields',[])) or 'Aucun',', '.join(n.get('proposed_fields',[])) or 'Aucun',', '.join(n.get('adoption_ids',[])) or 'Aucune'])+' |')
        lines += ['', 'Les validations contextuelles et les réserves détaillées restent dans les décisions et les sources JSON.', '']
    return '\n'.join(lines)


def main(space='all'):
    destination = ROOT/'restitutions'
    destination.mkdir(exist_ok=True)
    generated = []
    if space in ('all', 'release'):
        pointer = resolve_release(ROOT/'modeles/release')
        release = read(ROOT/'modeles/release'/pointer['path'])
        write_text_if_changed(destination/'release.md', render(release, 'Release'))
        generated.append('release')
    if space in ('all', 'backlog'):
        backlog = read(working_path(ROOT/'modeles/backlog'))
        backlog['glossary'] = read(working_path(ROOT/'modeles/backlog', 'glossary'))
        write_text_if_changed(destination/'backlog.md', render(backlog, 'Backlog'))
        generated.append('backlog')
    if space in ('all', 'panorama-as-is'):
        render_panorama(destination)
        generated.append('panorama-as-is')
    print('Views checked/generated: ' + ', '.join(generated))


def render_panorama(destination):
    index=read(ROOT/'modeles/panorama-as-is/current.json')
    lines=['# Panorama As Is', '', 'Restitution générée depuis les JSON. La consolidation ne prouve pas une observation récente du déploiement.', '', '| SI | Évaluation | Composants et mentions | Flux | Autorités d’information | Responsabilités de décision |', '| --- | --- | --- | --- | --- | --- |']
    for p in index['panoramas']:
        data=read(ROOT/p['path'])
        name=data.get('name') or data.get('canonical_name') or {'beaumanoir-historique-si':'Périmètre historique de Beaumanoir','boardriders-si':'Boardriders','sarenza-si':'Sarenza'}[data['model_id']]
        counts=[len(data[k]) for k in ['objects','flows','information_authorities','decision_responsibilities']]
        lines.append('| '+' | '.join(map(str,[name,'Non traité' if data['assessment_status']=='not_assessed' else 'Partiellement documenté']+counts))+' |')
    lines += ['', 'Le contexte partagé, notamment C-Log, reste dans son fichier distinct. Les besoins et orientations non établis comme existant sont conservés dans le backlog.', '']
    write_text_if_changed(destination/'panorama-as-is.md', '\n'.join(lines))


if __name__=='__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--space', choices=['all', 'backlog', 'release', 'panorama-as-is'], default='all')
    main(parser.parse_args().space)
