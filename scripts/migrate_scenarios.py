"""U793 migration: preserve source stories, separate identity from presentation.

Run once against the backlog; a second run is a no-op. The report accounts for
every source example. Editorial refinements remain proposed and are traceable.
"""
from copy import deepcopy
from pathlib import Path
from .structured_io import read, dumps
from .element_versions import content_hash

META = {'source_refs': ['U793'], 'review': {'state': 'proposed', 'note': 'Mise en œuvre U793 ; pas d’accord individuel sur le contenu déduit du Go.'}}
STREAMS = [
 ('obtain-products', 'Obtain Ordered Products', 'Obtenir les produits commandés', 'Client destinataire de la commande', 'Produits conformes mis à disposition selon un engagement explicite.', 'Une demande de produits est exprimée ou sa satisfaction est compromise.', 'De la demande à la reconnaissance de sa satisfaction ; vente, facturation et exécution physique restent externes quand non détaillées dans la cartographie.', [('Clarify Demand','Besoin et conditions compris'),('Agree Fulfilment','Proposition et engagement explicites'),('Deliver Products','Produits remis et satisfaction rapprochée')]),
 ('replenish-stock', 'Obtain Available Stock', 'Disposer du stock nécessaire', 'Bénéficiaire du stock à servir, notamment un magasin', 'Stock utilisable au lieu et au moment nécessaires, avec droits et contraintes connus.', 'Un besoin de stock, un apport attendu ou un déséquilibre est identifié.', 'Du besoin reconnu à la disponibilité reconnue ; achat et opérations physiques sont mobilisés sans être assimilés à l’orchestration.', [('Qualify Stock Need','Besoin net et destination explicités'),('Arrange Supply','Apport et conditions retenus'),('Recognize Availability','Quantités reçues et disponibilité reconnues')]),
 ('recover-value', 'Recover Product Value', 'Traiter un produit retourné ou non conforme', 'Détenteur ou bénéficiaire de l’engagement de reprise', 'Issue autorisée et tracée : remise en usage, réparation, remplacement, règlement ou retrait.', 'Un retour, un défaut ou un dommage nécessite une décision de devenir.', 'De la qualification du produit à la reconnaissance de l’issue ; le règlement financier reste externe à sa tenue dans la Supply.', [('Assess Condition','État et droits de reprise établis'),('Agree Disposition','Issue et engagements autorisés'),('Confirm Recovery','Résultats et reliquats reconnus')]),
 ('obtain-service', 'Obtain Confirmed Service', 'Obtenir une prestation conforme', 'Demandeur de la prestation', 'Prestation obtenue avec preuve de résultat et écarts connus.', 'Une prestation ou une adaptation de prestation est nécessaire.', 'De l’attendu de service à la reconnaissance de son résultat ; exécution chez le prestataire distincte du pilotage.', [('Specify Service','Attendu et critères explicités'),('Coordinate Service','Prestation engagée et coordonnée'),('Recognize Result','Résultat reconnu et reste à faire visible')]),
 ('reliable-basis', 'Obtain Reliable Decision Inputs', 'Disposer d’informations fiables pour décider', 'Preneur de décision métier', 'Informations utilisables, cohérentes et assorties de leurs limites de validité.', 'Un écart, une correction ou une alerte remet en cause une information utilisée.', 'De l’information contestée à sa qualification et à la mise à disposition des effets utiles ; ne transfère pas la maîtrise des sources externes à la Supply.', [('Identify Change','Changement et périmètre identifiés'),('Qualify Information','Information reconnue avec ses limites'),('Inform Decisions','Conséquences accessibles aux décisions concernées')]),
]
# Scenario identities are preserved. Each mapping is explicit, never inferred
# from title keywords at runtime.
CLASSIFICATION = {
 'b2b-partial-stock': ('obtain-products obtain-service','shortage','order','exception'),
 'return-fashion-recovery': ('recover-value','return','product','recovery'),
 'consignment-sale-pickup': ('replenish-stock recover-value','demand','stock','nominal'),
 'fashion-launch': ('replenish-stock obtain-service','launch','stock','nominal'),
 'shortage-reassessment': ('obtain-products replenish-stock','shortage','order','exception'),
 'export-remote-services': ('obtain-products obtain-service','demand','service','nominal'),
 'stocktaking-variance': ('reliable-basis obtain-products','discrepancy','stock','exception'),
 'last-item-concurrency': ('obtain-products','demand','order','exception'),
 'substitution-price-service': ('obtain-products','delay','order','exception'),
 'additional-purchase-partial': ('obtain-products replenish-stock','shortage','order','exception'),
 'pickup-or-direct-shipment': ('obtain-products','failure','order','exception'),
 'transport-missed-connection': ('obtain-products obtain-service','delay','service','recovery'),
 'remote-payment-ambiguous': ('obtain-service reliable-basis','discrepancy','service','exception'),
 'reference-plan-correction': ('reliable-basis replenish-stock','correction','information','recovery'),
 'redistribute-protected-stock': ('replenish-stock','imbalance','stock','recovery'),
 'supplier-return-outcomes': ('recover-value obtain-service','return','product','recovery'),
 'gift-kits-crossdock': ('replenish-stock obtain-service','launch','product','nominal'),
 'ownership-transit-deadline': ('reliable-basis replenish-stock','milestone','stock','nominal'),
 'order-structuring-engaged': ('obtain-products replenish-stock','change','order','nominal'),
 'b2b-release-deadline': ('obtain-products obtain-service','delay','service','exception'),
 'trace-accessory-kits': ('reliable-basis recover-value','alert','product','exception'),
 'damaged-stock-disposition': ('recover-value','damage','stock','recovery'),
 'transport-loads-six-stores': ('obtain-service replenish-stock','demand','service','nominal'),
 'transfer-replenishment-order-driven': ('replenish-stock obtain-products','demand','stock','nominal'),
 'consignment-launch-replenishment': ('replenish-stock','launch','stock','nominal'),
 'partial-receiving': ('replenish-stock obtain-service','shortage','stock','exception'),
}
FACETS = {'events': [('shortage','Quantité insuffisante'),('return','Retour'),('demand','Demande'),('launch','Lancement'),('discrepancy','Écart constaté'),('delay','Retard'),('failure','Non-réalisation'),('correction','Correction de données'),('imbalance','Déséquilibre'),('milestone','Jalon contractuel'),('change','Modification'),('alert','Alerte'),('damage','Dommage')], 'objects': [('order','Commande'),('stock','Stock'),('product','Produit'),('service','Prestation'),('information','Information')], 'situations': [('nominal','Nominal'),('exception','Exception'),('recovery','Reprise / adaptation')]}


def migrate(model):
    result = deepcopy(model)
    if 'scenario_catalog' in result:
        return result, None
    catalog = {'schema_version': 1, 'source_refs': ['U791','U792','U793'],
               'facets': {k:[{'id':i,'label':v} for i,v in values] for k,values in FACETS.items()},
               'value_streams': [], 'scenarios': [], 'paths': [], 'legacy_links': []}
    for identifier,name,label,beneficiary,value,trigger,boundary,stages in STREAMS:
        catalog['value_streams'].append({**deepcopy(META), 'id':identifier,'name':name,'label_fr':label,
            'description':value,'beneficiary':beneficiary,'value':value,'trigger':trigger,'boundary':boundary,
            'stages':[{'id':f'{identifier}-{i+1}','name':n,'outcome':v,
                       'entry':trigger if i==0 else stages[i-1][1], 'exit':v} for i,(n,v) in enumerate(stages)],
            'market_position':'Structuration FLOW fondée sur la valeur pour le bénéficiaire (BIZBOK/TOGAF). Les documentations produit éclairent des parties du périmètre ; ni équivalence exacte ni consensus sur ce nom et ces étapes.',
            'market_sources': []})
    report = []
    for node in result['nodes']:
        kept=[]
        for index,e in enumerate(node.get('fields',{}).get('examples',[])):
            entry={'owner_id':node['id'],'index':index,'legacy_id':e.get('id',''),'title':e['title'], 'source_sha256':content_hash(e),'source_refs':e.get('source_refs',[])}
            if not e.get('steps'):
                kept.append(e); report.append({**entry,'action':'retain_illustration','target_ids':[]}); continue
            identifier=e['id']; streams,event,object_id,situation=CLASSIFICATION[identifier]
            scenario={**deepcopy(META),'source_refs':list(dict.fromkeys(e.get('source_refs',[])+['U793'])),
                'id':identifier,'name':identifier.replace('-',' ').title(),'title':e['title'],'situation':e['situation'],
                'trigger':e.get('trigger',e['steps'][0]['description']),
                'objective':e.get('objective',e.get('outcome',e['steps'][-1]['outcome'])),
                'conditions':e.get('constraints',[]),'nature':'illustrative',
                'value_stream_ids':streams.split(),'events':[event],'objects':[object_id],'situations':[situation],
                'validation_points':e.get('validation_points',[])+([e['lesson']] if e.get('lesson') else [])}
            path={**deepcopy(META),'source_refs':scenario['source_refs'],'id':identifier+'-path',
                'name':scenario['name']+' Response','title':'Réponse illustrée','scenario_id':identifier,
                'conditions':e.get('constraints',[]),'outcome':e.get('outcome',e['steps'][-1]['outcome']),
                'steps':[{'id':f'step-{i+1}',**deepcopy(s),'inputs':[]} for i,s in enumerate(e['steps'])],
                'dependencies':[], 'sequence_note':'Ordre de lecture du récit conservé ; les dépendances non explicitées ne sont pas déduites de la position. Les conditions et informations à préciser restent des limites de la description.'}
            catalog['scenarios'].append(scenario); catalog['paths'].append(path)
            catalog['legacy_links'].append({'owner_id':node['id'],'legacy_id':identifier,'scenario_id':identifier})
            report.append({**entry,'action':'migrate_scenario','target_ids':[identifier], 'note':'Récit et contributions conservés ; champs extraits et classement proposés.'})
        if 'examples' in node.get('fields',{}):
            if kept: node['fields']['examples']=kept
            else: node['fields'].pop('examples')
    # Pilot: the original B2B account details the grouped response. The second
    # response is explicitly conditional, based on its existing split option.
    p=next(p for p in catalog['paths'] if p['scenario_id']=='b2b-partial-stock')
    p['title']='Livraison regroupée'; p['conditions'].append('Le client accepte le regroupement et la date résultante.')
    split=deepcopy(p); split['id']='b2b-partial-stock-split-path'; split['name']='Split Delivery Response'; split['title']='Livraison fractionnée'
    split['conditions']=[c for c in split['conditions'] if 'accepte le regroupement' not in c]+['Le client accepte deux livraisons annoncées et leurs dates.']
    split['steps'][-1]['description']='Si le fractionnement est accepté, affecter les ressources aux 60 pièces disponibles puis aux 40 attendues et libérer les prestations de chaque départ lorsque leurs conditions sont réunies.'
    split['steps'][-1]['outcome']='Deux expéditions sont coordonnées selon les engagements acceptés ; aucune palette commune aux deux départs n’est présumée.'
    split['steps'][-1]['contributions'][-1]['role']='Porter les exigences de conditionnement de chaque expédition.'
    split['outcome']=split['steps'][-1]['outcome']; catalog['paths'].append(split)
    # Genuine dependencies documented for the pilot, not inferred for all stories.
    for pilot in [p,split]:
        pilot['dependencies']=[{'from':'step-1','to':'step-2','condition':'Besoin, disponibilités et conditions connus.'}, {'from':'step-2','to':'step-3','condition':'Options réalisables évaluables.'}, {'from':'step-3','to':'step-4','condition':'Proposition acceptée et ressources affectables.'}]
        pilot['sequence_note']='Dépendances conditionnelles du cas illustré ; aucune séquence universelle des capacités.'
        for i,s in enumerate(pilot['steps']): s['inputs']=[pilot['conditions'][0] if i==0 else pilot['steps'][i-1]['outcome']]
    # Shared local illustrations are retained. References to migrated stories
    # become legacy aliases to the autonomous identity, rather than copies.
    migrated={a['legacy_id'] for a in catalog['legacy_links']}
    for node in result['nodes']:
        refs=node.get('fields',{}).get('scenario_refs',[])
        for ref in refs:
            if ref['scenario_id'] in migrated:
                catalog['legacy_links'].append({'owner_id': node['id'], 'legacy_id': ref['scenario_id'],
                                               'scenario_id': ref['scenario_id'],
                                               'contribution': ref.get('contribution', '')})
        node['fields']['scenario_refs']=[r for r in refs if r['scenario_id'] not in migrated] if refs else refs
        if not node['fields'].get('scenario_refs'): node['fields'].pop('scenario_refs',None)
    result['scenario_catalog']=catalog
    return result, {'source_refs':['U793'],'source_model_sha256':content_hash(model),'items':report,
                    'limits':['Les sources historiques sont conservées ; aucune adoption individuelle héritée.', 'Les récits composites sont conservés et signalés pour lecture en branches ; ils ne sont pas arbitrairement scindés.']}


if __name__ == '__main__':
    path=Path('modeles/backlog/model.yaml'); model,report=migrate(read(path))
    if report is not None:
        path.write_text(dumps(model),encoding='utf-8')
        Path('modeles/backlog/scenario-migration-U793.yaml').write_text(dumps(report),encoding='utf-8')
    print('Migrated' if report else 'Already migrated')
