"""Editorial layout for the FLOW SCM dossier (27 pages).

The two preserved pages are the vendor documentation and its bibliography.
All other pages are rebuilt from the accompanying authoring sources.
"""
from __future__ import annotations

import io
import re
from pathlib import Path
from pypdf import PdfReader, PdfWriter
from pypdf.annotations import Link
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle

EDITION = 'director-guide-2026-10-22-v8'
AUTHOR = 'Laurent Sintès'
PEACH = colors.HexColor('#FFD8B2')
ORANGE = colors.HexColor('#D47735')


def setup(api):
    globals().update({k:getattr(api,k) for k in (
        'W','H','M','CW','GREEN','MINT','PAPER','INK','MUTED','LINE','styles',
        'para','header','heading','footer','PDF','TMP')})
    styles['hero']=ParagraphStyle('hero',parent=styles['title'],fontSize=26,leading=30)
    styles['white']=ParagraphStyle('white',parent=styles['body'],textColor=colors.white)
    styles['card']=ParagraphStyle('card',parent=styles['small'],fontSize=9.4,leading=12.5)
    styles['cardhead']=ParagraphStyle('cardhead',parent=styles['head'],fontSize=10.5,leading=13)
    styles['micro']=ParagraphStyle('micro',parent=styles['tiny'],fontSize=8.2,leading=10.8)


def start():
    s=io.BytesIO()
    return s,canvas.Canvas(s,pagesize=A4)


def finish(s,c):
    c.save();s.seek(0)
    return PdfReader(s)


def rect(c,x,top,w,h,fill=MINT if 'MINT' in globals() else None,stroke=None,r=10):
    c.setFillColor(fill or colors.white)
    c.setStrokeColor(stroke or fill or colors.white)
    c.setLineWidth(.6)
    c.roundRect(x,top-h,w,h,r,fill=1,stroke=1 if stroke else 0)


def chip(c,label,x,top,width,fill=None):
    rect(c,x,top,width,22,fill or MINT,r=11)
    para(c,f'<b>{label}</b>',x+10,top-5,width-20,'tiny')


def banner(c,title,body,top,fill=None):
    p=Paragraph(body,styles['small']);_,h=p.wrap(CW-28,H)
    height=h+45
    rect(c,M,top,CW,height,fill or PEACH,r=12)
    para(c,title,M+14,top-11,CW-28,'head')
    p.drawOn(c,M+14,top-32-h)
    return top-height-14


def cover():
    s,c=start();header(c)
    chip(c,'DOSSIER DE DÉCISION ET DE PILOTAGE',M,700,280)
    y=para(c,'Piloter<br/>la supply chain',M,650,style='cover')
    y=para(c,'Tenir la promesse.<br/>Maîtriser le coût et le stock.',M,y-21,style='cover_sub')
    y=para(c,'La supply chain (chaîne d’approvisionnement) relie achats, stocks, ventes, service après-vente (SAV), retours et déstockage. '
           'Le Supply Chain Management (SCM) en pilote les ressources et les flux.',M,y-22,width=450,style='body')
    top=350;w=(CW-24)/3
    for i,(title,body) in enumerate([
        ('PROMETTRE','Vérifier le stock et les ressources avant de confirmer.'),
        ('ARBITRER','Comparer achats, livraisons et destinations des retours.'),
        ('MESURER','Relier chaque décision à son résultat de service et de coût.'),
    ]):
        x=M+i*(w+12)
        rect(c,x,top,w,101,MINT if i==1 else PAPER,LINE)
        c.setFillColor(ORANGE);c.circle(x+15,top-18,4,fill=1,stroke=0)
        para(c,title,x+27,top-12,w-36,'tiny')
        para(c,body,x+12,top-36,w-24,'small')
    para(c,'<b>7 indicateurs clés de performance (KPI)</b> • 6 questions de pilotage<br/>'
         '18 fiches de mesure, 8 cas d’entreprises et un premier pilote proposé.',M,220,style='small')
    para(c,'Quatre illustrations : préparer une vente ; ajuster les achats lointains (offshore) '
         'ou proches (nearshore) ; valoriser un retour ; choisir un conditionnement.',M,165,style='small')
    para(c,f'<b>{AUTHOR}</b>  •  22 octobre 2026',M,111,style='small')
    para(c,'Lecture dirigeant : page 2 • Mesure et calculs : pages 7 à 13 • Impacts sur FLOW : page 22',M,86,style='tiny')
    c.showPage();return finish(s,c)


def executive():
    s,c=start();links=[]
    y=heading(c,'L’ESSENTIEL POUR LE DIRECTEUR SUPPLY CHAIN','Décider sur toute la chaîne',
              'Rôle attendu de FLOW : relier les décisions sur tous les flux, avec une même vue des demandes, du stock et des capacités.')
    y=banner(c,'Des décisions reliées sur tous les flux',
             'Approvisionner, affecter le stock, servir vente et SAV, puis récupérer, réemployer ou déstocker. '
             'FLOW compare les parcours réalisables et suit leurs effets sur le service, le coût et le stock.',y,fill=MINT)
    # Three promise checks, followed by an authorized decision.
    w=(CW-20)/3;top=y
    for i,(title,body) in enumerate([
        ('ATP / Disponible ?', 'Available-to-Promise : stock libre et arrivages déjà prévus.'),
        ('CTP / Réalisable ?', 'Capable-to-Promise : apport ou opération à réaliser à temps, ressources vérifiées.'),
        ('PTP / Quel résultat ?', 'Profitable-to-Promise : comparaison économique des options réalisables.'),
    ]):
        x=M+i*(w+10);rect(c,x,top,w,77,PAPER,LINE)
        para(c,title,x+10,top-10,w-20,'cardhead')
        para(c,body,x+10,top-30,w-20,'micro')
    y=top-87
    para(c,'Information exploitable → décision autorisée → action réalisée : mesurer aussi les attentes entre ces étapes.',M,y,style='tiny')
    y-=34
    # Six questions, seven priority indicators; the full formulas stay in the dossier.
    cards=[
        ('01 / Tenir le service','OTIF (On Time In Full) : complet, à temps','Tester un autre site ou accès au stock.',7),
        ('02 / Prévenir les retards','Commandes à risque','Réaffecter stock ou capacité avant l’échéance.',8),
        ('03 / Maîtriser le parcours','Coût de service / Transferts préalables','Replacer le stock ou regrouper les départs.',9),
        ('04 / Limiter le surplus','Excédent projeté','Réaffecter le stock, ajuster les entrées ou déstocker.',10),
        ('05 / Réduire l’attente','Délai commande-livraison','Agir sur l’étape qui bloque les dossiers.',11),
        ('06 / Récupérer de la valeur','Valeur nette récupérée','Choisir la destination des retours et invendus.',12),
    ]
    w=(CW-14)/2
    for j,(title,kpi,action,dst) in enumerate(cards):
        x=M+(j%2)*(w+14);top=y-(j//2)*83
        rect(c,x,top,w,73,MINT,r=10)
        para(c,title,x+11,top-9,w-22,'cardhead')
        para(c,f'<b>{kpi}</b><br/>{action}',x+11,top-28,w-22,'micro')
        links.append((1,(x,top-73,x+w,top),dst))
    y-=3*83+3
    y=banner(c,'Quatre illustrations, une même démarche',
             'Comparer les options réalisables avant de décider : <b>vente et transferts</b> (page 14), '
             '<b>achats de saison</b> (page 15), <b>retours</b> (page 16), <b>conditionnements</b> (page 17). '
             'Exemples fictifs ; résultats d’entreprises pages 19-20.',y)
    bottom=para(c,'<b>Première étape proposée :</b> cadrer un pilote sur les transferts avant préparation des ventes aux revendeurs '
         '(wholesale). Mesurer ensemble transferts, promesse tenue et coût par livraison. Périmètre, livrables et critères : page 21.',M,y,style='small')
    if bottom<58:raise ValueError(('Executive overflow',bottom))
    links.extend([(1,(M,y-43,W-M,y+2),20)])
    c.showPage();return finish(s,c),links


def contents():
    s,c=start();links=[]
    y=heading(c,'DEUX PARCOURS DE LECTURE','Sommaire',
              'Pour décider : fiche dirigeant, cas concrets et pilote. Pour préparer la mesure : tableau, fiches et catalogue.')
    chip(c,'DÉCIDER : 2 → 14–17 → 21–22',M,y,238)
    chip(c,'MESURER : 6–13 → 23–27',M+253,y,250)
    y-=42
    rows=[
        ('La fiche dirigeant',1,'2',0),
        ('La plomberie : flux, lots et délais de décision',3,'4',0),
        ('Lean et optimisation : du diagnostic à la décision',4,'5',0),
        ('KPI, objectifs et résultats clés (OKR), décisions',5,'6',0),
        ('Sept KPI : objectifs et décisions détaillés',6,'7',0),
    ]
    rows += [(f'{i+1:02d} / {q}',7+i,str(8+i),12) for i,q in enumerate([
        'Le service est-il tenu ?','Quelles promesses sont menacées ?',
        'Combien coûte le service rendu ?','Combien de stock finance-t-on, et quel excédent se prépare ?',
        'Où le temps s’accumule-t-il ?','Quelle valeur récupère-t-on des retours et excédents ?'])]
    rows += [
        ('Illustrations : vente, achats, retours et déstockage',13,'14–16',0),
        ('Conditionnements : le CTP éclaire le choix du grain',16,'17',12),
        ('Ce que montrent les offres du marché',17,'18',0),
        ('Les entreprises reliées aux sept KPI',18,'19–20',0),
        ('Le premier pilote proposé',20,'21',0),
        ('Impacts de l’étude sur FLOW',21,'22',0),
        ('Annexe : sept KPI et onze compléments',22,'23–24',0),
        ('Sources et conventions',24,'25–27',0),
    ]
    for title,dst,label,indent in rows:
        top=y
        y=para(c,title,M+indent,y,width=CW-65-indent,style='small' if indent else 'head')
        c.setFillColor(GREEN);c.setFont('Segoe-Bold',9.5);c.drawRightString(W-M,top-10,label)
        links.append((2,(M,y-5,W-M,top+3),dst))
        y-=11 if indent else 14
    if y<60:raise ValueError(('Contents overflow',y))
    c.showPage();return finish(s,c),links


def wholesale_case():
    s,c=start()
    y=heading(c,'ILLUSTRATIONS / 1 SUR 3 / VENTE ET STOCK','Préparer au bon endroit',
              'Exemple fictif : une commande wholesale de 100 unités, en une ligne, à livrer vendredi.')
    y=banner(c,'La décision à revoir : le site préparateur',
             'Le stock existe dans le réseau. Préparer depuis le site qui le détient peut éviter un transfert, '
             'tout en préservant la promesse client et la protection du service après-vente (SAV).',y,MINT)
    y=para(c,'<b>Situation.</b> A détient 30 unités libres et 10 protégées pour le SAV ; B détient 100 unités libres. '
           'Les deux sites sont habilités à servir ce client. Les créneaux de préparation et de transport permettent une livraison vendredi.<br/>'
           '<b>ATP :</b> identifier le stock réellement accessible, après engagements et protections. '
           '<b>Faisabilité logistique :</b> vérifier préparation et transport pour chaque parcours. '
           '<b>PTP :</b> comparer le coût complet des deux options réalisables. [2-5]',M,y,style='small')-16
    col=(CW-16)/2
    for i,(title,lines) in enumerate([
        ('PRÉPARER DEPUIS A', [('Mouvement préalable','70 unités de B vers A : 140 €'),('Préparation + livraison','60 € + 100 €'),('Coût opérationnel','300 €'),('Coût du parcours comparé','2 000 € de stock + 300 € = 2 300 €'),('Stock restant','30 libres en B + 10 SAV en A')]),
        ('PRÉPARER DEPUIS B', [('Mouvement préalable','Aucun transfert'),('Préparation + livraison','70 € + 150 €'),('Coût opérationnel','220 €'),('Coût du parcours comparé','2 000 € de stock + 220 € = 2 220 €'),('Stock restant','30 libres en A + 10 SAV en A')]),
    ]):
        x=M+i*(col+16);rect(c,x,y,col,220,MINT if i else PAPER,LINE)
        yy=para(c,title,x+14,y-14,col-28,'head')-15
        for lab,val in lines:
            yy=para(c,lab,x+14,yy,col-28,'tiny')-1
            yy=para(c,f'<b>{val}</b>',x+14,yy,col-28,'small')-8
    y-=235
    y=para(c,'<b>Résultat simulé :</b> les transferts passent de 1 à 0 ; le coût de service baisse de <b>80 € par livraison</b>. '
           'La ligne est promise complète et à l’heure dans les deux options ; l’OTIF sera vérifié après livraison.',M,y,style='small')-14
    y=banner(c,'Décision FLOW : affecter la préparation à B',
             'Le transport final est plus cher, mais le parcours complet coûte moins. Conserver les 10 unités protégées pour le SAV ; '
             'vérifier les autres promesses avant de réaffecter le stock. Si ce cas se répète, revoir le placement du stock et les règles de choix du site.',y)
    y=para(c,'<b>Périmètre et limites.</b> Valeur de stock : 20 € par unité, identique dans les deux options ; une seule livraison. '
           'Coûts variables inclus, coûts fixes inchangés exclus ici ; le coût de service reprend en exploitation tous les coûts attribuables du périmètre retenu. '
           'Le stock restant est de même valeur mais change de site : '
           'tester les commandes à risque et l’effet des protections de stock. Un cas simulé ne mesure pas le gain OTIF du réseau.',M,y,style='tiny')
    if y<60:raise ValueError(('Wholesale overflow',y))
    c.showPage();return finish(s,c)


def pilot():
    s,c=start()
    y=heading(c,'DE LA DÉMONSTRATION À L’INVESTISSEMENT','Un premier pilote wholesale',
              'Un point d’entrée pour éprouver FLOW, puis décider de son extension aux autres flux selon les résultats.')
    y=banner(c,'La décision proposée : engager le cadrage',
             'Choisir une famille de produits, des clients revendeurs, les sites concernés et une période représentative. '
             'Comparer placement du stock, site préparateur et répartition des achats en lots.',y,MINT)
    for i,(code,title,body) in enumerate([
        ('TRANSFERTS','RÉDUIRE LES MOUVEMENTS','Mesure principale du pilote'),
        ('OTIF','TENIR LA PROMESSE','Garde-fou de service'),
        ('COÛT DE SERVICE','MAÎTRISER LE COÛT','Garde-fou économique'),
    ]):
        w=(CW-20)/3;x=M+i*(w+10)
        rect(c,x,y,w,65,PAPER,LINE)
        para(c,code,x+10,y-8,w-20,'head')
        para(c,title,x+10,y-28,w-20,'micro')
        para(c,body,x+10,y-43,w-20,'micro')
    y-=80
    y=para(c,'Trois livrables pour décider',M,y,style='head')-10
    for i,(title,body) in enumerate([
        ('Une situation de référence partagée','Formules, périmètre, coûts et qualité des données ; part des livraisons avec transfert, '
         'nombre de transferts par livraison, OTIF et coût.'),
        ('Un comparatif de décisions réalisables','Rejouer les mêmes demandes avec les informations connues à la date de décision. '
         'Documenter ressources, contraintes, options, résultat attendu et autorisation nécessaire.'),
        ('Un bilan pour décider de la suite','Comparer résultats simulés et observés, dépenses évitées ou ajoutées, service et coût du projet. '
         'Isoler les effets attribuables au pilote et éviter les doubles comptes.'),
    ]):
        c.setFillColor(GREEN);c.circle(M+12,y-11,11,fill=1,stroke=0)
        c.setFillColor(colors.white);c.setFont('Segoe-Bold',10);c.drawCentredString(M+12,y-14,str(i+1))
        yy=para(c,title,M+35,y,CW-35,'head')-4
        y=para(c,body,M+35,yy,CW-35,'small')-16
    y=para(c,'Ce qu’il faut réunir',M,y,style='head')-6
    y=para(c,'<b>Données :</b> commandes et promesses initiales, stock utilisable, réceptions, transferts reliés aux livraisons, '
           'capacités, délais et coûts validés.<br/><b>Rôles proposés, à confirmer :</b> un responsable du pilote ; supply, wholesale et logistique ; '
           'achats pour les options fournisseur ; contrôle de gestion pour les coûts ; systèmes d’information et données pour les rapprochements.',M,y,style='small')-14
    y=banner(c,'Poursuivre sur une preuve vérifiable',
             'Fixer avant le test les seuils de service et de coût, les critères de réussite et les conditions d’arrêt ou d’extension. '
             'La poursuite dépend de données traçables, d’options exécutables et d’un bénéfice documenté.',y)
    y=para(c,'Durée, charge, budget et droits de décision sont à établir avant lancement. Examiner les autres KPI lorsqu’une option '
           'modifie leur périmètre. Distinguer marge, dépenses et stock à financer ; comparer les gains aux coûts d’intégration, de changement et d’exploitation.',M,y,style='tiny')
    if y<60:raise ValueError(('Pilot overflow',y))
    c.showPage();return finish(s,c)


def offshore_case():
    s,c=start()
    y=heading(c,'ILLUSTRATIONS / 2 SUR 3 / ACHATS ET PLANIFICATION','Ajuster le socle et le complément',
              'Exemple fictif : le CTP vérifie le complément réalisable ; le PTP éclaire le volume à engager à l’avance.')
    y=para(c,'<b>Situation.</b> Demande de 800 ou 1 200 pièces, chaque cas à 50 %. Vente à 30 €, '
           'fabrication lointaine (<b>offshore</b>) à 10 €, proche du marché (<b>nearshore</b>) à 14 €. '
           'Ces achats rendus incluent l’acheminement. Invendus récupérés à 4 € nets par pièce. '
           'Signal de demande supposé fiable et assez précoce pour déclencher la commande d’appoint (complémentaire).',M,y,style='small')-13
    rows=[
        ['Trois politiques comparées','<b>A</b><br/>1 200 offshore','<b>B</b><br/>800 offshore<br/>+ 400 nearshore max.','<b>C</b><br/>950 offshore<br/>+ 250 nearshore max.'],
        ['<b>Contribution moyenne</b>','<b>18 800 €</b>','<b>19 200 €</b>','<b>19 050 €</b>'],
        ['Volume servi dans la saison','100 %','100 %','100 %'],
        ['Invendus si demande de 800','400 pièces','0','150 pièces'],
        ['Invendus moyens avant déstockage','200 pièces','0','75 pièces'],
        ['Achats engagés au départ','12 000 €','8 000 €','9 500 €'],
        ['Achats totaux moyens','12 000 €','10 800 €','11 250 €'],
    ]
    table=Table([[Paragraph(t.replace(' €','&nbsp;€').replace(' %','&nbsp;%'),styles['table' if j==0 else 'cell'])
                  for j,t in enumerate(row)] for row in rows],colWidths=[215,100,100,CW-415])
    table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
                             ('LINEBELOW',(0,0),(-1,0),.7,GREEN),('LINEBELOW',(0,1),(-1,-1),.35,LINE),('BACKGROUND',(0,1),(-1,1),MINT)]))
    _,h=table.wrap(CW,H);table.drawOn(c,M,y-h);y-=h+10
    y=para(c,'<b>Contribution simplifiée</b> = ventes + récupération nette des invendus - achats rendus. '
           'B donne 16 000 € en demande basse et 22 400 € en demande haute, soit 19 200 € en moyenne. '
           'Les moyennes pondèrent les deux cas à 50/50 ; le complément n’est acheté que si nécessaire.',M,y,style='tiny')-12
    y=banner(c,'Décision FLOW : dimensionner ensemble les deux sources',
             '<b>400 pièces à temps :</b> B permet un socle de 800 et gagne 400 € de contribution moyenne sur A. '
             '<b>250 pièces à temps :</b> C relève le socle à 950 et gagne 250 € sur A. '
             'Garder 800 avec seulement 250 d’appoint laisserait 150 ventes non servies en forte demande : '
             '18 000 € de contribution moyenne et 92,5 % de demande servie, pondérée par les volumes.',y)
    y=para(c,'<b>Mesurer :</b> excédent projeté, commandes à risque et complément réalisable par CTP. '
           'Comparer la contribution des options. Le volume servi dans la saison diffère de l’OTIF à la date promise ; '
           'la contribution saisonnière se distingue du coût de service par livraison.',M,y,style='small')-12
    y=para(c,'Un mode possible : planifier en amont, décider aussi en saison',M,y,style='head')-5
    y=para(c,'Dès <b>Design &amp; Development</b> (conception et développement), préparer le socle avec '
           '<b>Sourcing and Procurement</b> (achats). La SCM vérifie le complément et dimensionne le socle avant engagement ; '
           'en saison, elle peut décider l’appoint selon la politique et les délégations, puis transmettre la commande autorisée. '
           'Le CTP vérifie la faisabilité ; il ne signe pas la commande. La responsabilité d’achat se répartit selon l’objet et l’horizon.<br/>'
           '<b>MAP est un outil de planification.</b> Plans et décisions opérationnelles font partie de la SCM ; '
           'cette intégration métier n’impose pas un logiciel unique.',M,y,style='small')-9
    y=para(c,'<b>Limites.</b> Montants hors taxe sur la valeur ajoutée (TVA), aucun stock initial, autres coûts identiques. '
           '400 € fixes de réservation absorberaient l’avantage de B. Achat engagé ne signifie pas paiement immédiat. '
           'Délais et capacités à confirmer avant engagement puis en saison ; erreurs de demande et concurrence sur les ressources à tester. '
           'Référence théorique : [20]. Ce mode proposé ne prouve aucune réalisation installée.',M,y,style='tiny')
    if y<60:raise ValueError(('Offshore overflow',y))
    c.showPage();return finish(s,c)


def returns_case():
    s,c=start()
    y=heading(c,'ILLUSTRATIONS / 3 SUR 3 / RETOURS ET DÉSTOCKAGE','Choisir la valeur et le délai',
              'Exemple fictif : faut-il déstocker rapidement un retour ou le remettre en état pour mieux le revendre ?')
    y=para(c,'<b>Situation.</b> 100 retours reçus au jour 0, tous récupérables après contrôle. '
           'Coût du stock : <b>1 000 €</b>, identique dans les deux options et affiché séparément. '
           'Prix supposés autorisés ; débouchés et ventes restent des hypothèses jusqu’à leur réalisation.',M,y,style='small')-12
    y=para(c,'<b>ATP :</b> ne pas promettre un retour encore inutilisable. '
           '<b>CTP :</b> vérifier contrôle, remise en état, préparation et transport à temps, sans retarder les autres commandes. '
           '<b>PTP :</b> comparer valeur récupérable, délai et risque de revente.',M,y,style='small')-14
    rows=[
        ['Options sur le même lot','<b>A / Déstocker rapidement</b>','<b>B / Remettre en état et revendre</b>'],
        ['Disponibilité après traitement','100 pièces au jour 2','60 pièces au jour 3 ;<br/>40 au jour 6'],
        ['Recettes attendues','100 × 8 € = 800 €<br/>vendus au jour 7','80 × 20 € + 20 × 8 €<br/>= 1 760 € avant le jour 30'],
        ['Frais supplémentaires','Tri et logistique : 100 €','Remise en état : 300 € ;<br/>transport et vente : 140 €'],
        ['<b>Valeur nette récupérée</b>','<b>800 - 100 = 700 €</b>','<b>1 760 - 440 = 1 320 €</b>'],
        ['Délai de disponibilité des retours<br/>médiane / seuil à 90 %','2 / 2 jours','3 / 6 jours'],
        ['Revendus sous 30 jours','100 %','100 %'],
        ['Stock restant au jour 30','0','0'],
    ]
    table=Table([[Paragraph(t,styles['table']) for t in row] for row in rows],colWidths=[205,(CW-205)/2,(CW-205)/2])
    table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),6),
                             ('BOTTOMPADDING',(0,0),(-1,-1),6),('LINEBELOW',(0,0),(-1,0),.7,GREEN),
                             ('LINEBELOW',(0,1),(-1,-1),.35,LINE),('BACKGROUND',(0,4),(-1,4),MINT)]))
    _,h=table.wrap(CW,H);table.drawOn(c,M,y-h);y-=h+15
    y=banner(c,'Décision FLOW : choisir B si le débouché est crédible',
             '<b>340 € de frais supplémentaires permettent ici de récupérer 620 € nets de plus.</b> '
             'Réserver les créneaux et orienter les lots vers les destinations autorisées. '
             'A vend plus vite ; le taux revendu sous 30 jours atteint pourtant 100 % dans les deux cas. Le délai seul ne suffit pas à décider.',y)
    y=para(c,'<b>Le seuil qui peut changer la décision.</b> Avec 440 € de frais fixes et le reste vendu à 8 €, '
           'il faut vendre au moins <b>29 pièces à 20 €</b> pour dépasser les 700 € de A : '
           '360 € + 12 € × 29 = 708 €. FLOW compare les débouchés documentés à ce seuil, puis mesure les recettes et frais réels.',M,y,style='small')-12
    y=para(c,'<b>Mesures et limites.</b> Valeur nette récupérée = recettes ou avoirs obtenus - frais supplémentaires ; '
           'le coût du stock de 1 000 € reste séparé. Les 620 € sont un écart simulé de récupération nette, pas une marge constatée. '
           'Le délai de disponibilité des retours diffère du délai des nouvelles commandes, de l’acceptation à la livraison. '
           'Coûts fixes inchangés exclus, montants hors TVA. Vérifier capacité réelle et risque de non-vente avant de choisir B.',M,y,style='tiny')
    if y<60:raise ValueError(('Returns overflow',y))
    c.showPage();return finish(s,c)


def market_cases():
    s,c=start();links=[]
    groups=[[
        ('Electrolux Professional [7]','OTIF par ligne • Commandes à risque',
         'Rapproche prévisions, stock, composants et capacités ; passe de l’ATP au CTP pour annoncer une date réalisable.',
         'Jusqu’à 98 % de service dans les zones déployées',
         '<b>OTIF :</b> vérifier les ressources avant confirmation. <b>Risque :</b> recalculer les promesses ouvertes après un changement de ressource.',
         'Formule du service et valeur initiale non publiées ; l’objectif > 95 % ne prouve pas un gain de 3 points. Aucun taux '
         'de commandes à risque publié. Gains sur ces deux KPI non chiffrés : un seul résultat de service rapporté.',[(7,'M01'),(8,'M04')]),
        ('Veseris [13]','Coût de service par livraison (CTS)',
         'Automatise et regroupe les ordres de transfert avec Dynamics 365 et des solutions de transport.',
         'Fréquence d’expédition et coûts de transport divisés par deux',
         'Regrouper les départs et comparer le coût complet par livraison en conservant la date promise.',
         'Cas Microsoft du 15 novembre 2025. Le transport ne représente pas le coût complet par livraison. Valeur initiale, '
         'durée et nombre de livraisons non publiés : gain de coût de service par livraison non chiffré.',[(9,'M07')]),
        ('Howdens [10-11]','Transferts avant préparation wholesale',
         'Analyse les transferts par région, revoit les assortiments et teste le réapprovisionnement le lendemain dans plus de 20 dépôts.',
         'Moins de transferts, meilleur service : résultats non chiffrés',
         'Comparer placement du stock et site préparateur ; mesurer les transferts nécessaires avant préparation, le service et le coût.',
         'Cas proche du besoin FLOW. Ni part des livraisons avec transfert préalable, ni nombre moyen par livraison, ni gain financier publiés. '
         'Le nombre de dépôts décrit le pilote, pas le gain.',[(9,'M09')]),
    ],[
        ('Europris [17]','Excédent projeté',
         'Centralise le réassort avec RELEX ; rapproche prévisions et stocks et adapte les minimums de présentation à l’espace disponible.',
         'Stock du centre de distribution : plus de 17 % de baisse en 18 semaines',
         'Ajuster réapprovisionnement et stocks cibles ; mesurer l’excédent futur à la même date avec le service comme garde-fou.',
         'Disponibilité magasin : 91 % à plus de 97 % ; transformation engagée en 2015. Il s’agit de stock constaté, pas de l’excédent '
         'projeté. Valorisation et gain financier non publiés ; gain sur l’excédent projeté non chiffré.',[(10,'M11')]),
        ('Prinsel [18]','Délai commande-livraison',
         'Automatise stockage et prélèvement avec Blue Yonder dans deux centres de distribution.',
         'Temps moyen de traitement : 2 heures → 45 minutes',
         'Agir sur l’étape qui concentre l’attente, avec les équipes d’exécution, puis vérifier le délai complet.',
         'Résultat d’une étape logistique lié aussi à l’automatisation. Ce n’est pas le délai acceptation-livraison, ni sa médiane ou son seuil '
         'à 90 %. Bornes précises et période non publiées ; gain sur le délai commande-livraison non chiffré.',[(11,'M13')]),
        ('Tuckernuck [19]','Valeur nette récupérée',
         'Relie données de retour client, points de dépôt et entrepôt avec Optoro pour accélérer traitement et remise en vente.',
         '78 % revendus/réexpédiés sous 30 jours après initiation du retour',
         'Comparer les destinations des retours en reliant délai, recettes et frais ; mesurer la valeur nette réellement récupérée.',
         'Majorité prête à la revente sous 24 h après réception : les deux délais ont des départs différents. Aucune valeur nette ni gain '
         'monétaire publié ; période d’observation non publiée. Résultats sur le délai et l’écoulement des retours.',[(12,'M18')]),
    ]]
    for gi,cases in enumerate(groups):
        y=heading(c,'CAS D’ENTREPRISES / '+str(gi+1)+' SUR 2',
                  'Service, coût et transferts' if gi==0 else 'Stock, délai et récupération',
                  'Résultats déclarés par les entreprises ou leurs partenaires. Chaque cas éclaire un mécanisme à tester dans FLOW.')
        for company,kpis,change,result,action,limit,dests in cases:
            y=para(c,company,M,y,style='head')-3
            top=y;y=para(c,kpis,M,y,style='tiny')-7
            for k,(dst,code) in enumerate(dests):
                x=M+k*195;links.append((18+gi,(x,top-12,x+190,top+2),dst))
            y=para(c,f'<b>Changement.</b> {change}',M,y,style='metric')-6
            p=Paragraph(f'<b>{result}</b>',styles['small']);_,h=p.wrap(CW-20,H)
            rect(c,M,y,CW,h+12,MINT,r=7);p.drawOn(c,M+10,y-6-h);y-=h+18
            y=para(c,f'<b>À tester dans FLOW.</b> {action}',M,y,style='metric')-4
            y=para(c,f'<b>Portée et limites.</b> {limit}',M,y,style='tiny')-9
            c.setStrokeColor(LINE);c.line(M,y,W-M,y);y-=12
        extra=(
            '<b>Éclairage économique : JBS [8-9].</b> Scénarios reliant demande, capacités, prix et transports. '
            'Marge annoncée en hausse de <b>25 %</b> dans le cas publié en 2015 ; base, durée et formule détaillée non publiées. '
            'Ce n’est ni une baisse du coût par livraison ni 25 points de taux de marge.' if gi==0 else
            '<b>Éclairage stock et coûts : JD.com [16].</b> Choix des produits et répartition dans huit entrepôts régionaux. '
            '<b>6,13 millions de dollars par an</b> de coûts de stockage/financement évités ; <b>22,32 millions de dollars</b> de coûts de transfert économisés, '
            'sans période précisée pour ce second montant. Étude de 2025 ; résultat global, sans excédent projeté ni coût par livraison publiés.')
        y=para(c,extra,M,y,style='tiny')-8
        y=para(c,'Un chiffre sur une mesure voisine ne chiffre pas le gain du KPI FLOW. « Non chiffré » décrit la preuve disponible, '
               'pas une absence d’effet. Intitulés cliquables vers les fiches ; sources pages 25-27.',M,y,style='tiny')
        if y<60:raise ValueError(('Market overflow',gi,y))
        c.showPage()
    return finish(s,c),links


def rebuild(api):
    setup(api)
    from flow_scm_questions import make_questions
    from flow_scm_foundations import make_additions
    source=PdfReader(PDF)
    if len(source.pages)==20:
        vendor=source.pages[15];bibliography=source.pages[19]
    elif len(source.pages)==21 and source.metadata.get('/FLOWMeasurementEdition') in ('director-guide-2026-10-21-v6','director-guide-2026-10-21-v5','director-guide-2026-10-21-v4'):
        vendor=source.pages[14];bibliography=source.pages[20]
    elif len(source.pages)==25 and source.metadata.get('/FLOWMeasurementEdition')=='director-guide-2026-10-22-v7':
        vendor=source.pages[16];bibliography=source.pages[23]
    elif len(source.pages)==27 and source.metadata.get('/FLOWMeasurementEdition')==EDITION:
        vendor=source.pages[17];bibliography=source.pages[24]
    else:raise ValueError('Unexpected source dossier edition')
    # Existing data-rich guide, table and index are regenerated from their source.
    front,oldlinks=api.make_front()
    executive_pdf,links=executive();toc,toclinks=contents();links+=toclinks
    questions,qlinks=make_questions(api)
    markets,mlinks=market_cases();links+=mlinks
    plumbing,lean,packaging,impacts,extra_sources=make_additions(globals())
    writer=PdfWriter()
    ordered=[cover().pages[0],executive_pdf.pages[0],toc.pages[0],plumbing.pages[0],lean.pages[0],front.pages[2],front.pages[5],
             *questions.pages,wholesale_case().pages[0],offshore_case().pages[0],returns_case().pages[0],packaging.pages[0],vendor,
             *markets.pages,pilot().pages[0],impacts.pages[0],front.pages[3],front.pages[4],bibliography,*extra_sources.pages]
    assert len(ordered)==27
    for old in ordered:writer.add_page(old)
    # Old links are generated with the former 20-page layout; retain only table and index.
    for src,rectangle,dst in oldlinks:
        if src in (3,4,5):links.append(({3:22,4:23,5:6}[src],rectangle,dst+1))
    links += [(src+7,rectangle,dst) for src,rectangle,dst in qlinks]
    for i in (5,17,24):
        api.strip_text_blocks(writer.pages[i],writer,api.is_footer)
    sections=['Dossier de pilotage','Fiche dirigeant','Sommaire','Plomberie des flux','Lean et optimisation','KPI, OKR et décisions','Tableau de référence',
              'Question 1 / service','Question 2 / risque','Question 3 / coût','Question 4 / stock','Question 5 / temps','Question 6 / retours',
              'Illustrations / vente','Illustrations / achats','Illustrations / retours','Illustrations / conditionnements',
              'Fonctions du marché','Entreprises / 1','Entreprises / 2',
              'Le premier pilote','Impacts sur FLOW','Catalogue / 1','Catalogue / 2','Sources / 1','Sources / 2','Sources / 3']
    for i,page in enumerate(writer.pages):
        page.merge_page(api.overlay_page(lambda c,i=i: footer(c,i+1,27,sections[i])))
        writer.add_outline_item(sections[i],i)
    for src,rectangle,dst in links:
        a=writer.add_annotation(src,Link(rect=rectangle,target_page_index=dst));a['/Dest'][0]=writer.pages[dst].indirect_reference
    writer.add_metadata({'/Title':'FLOW - Piloter la supply chain : indicateurs, objectifs et décisions',
                         '/Author':AUTHOR,'/Subject':'Plomberie, décision et conditionnements ; sept KPI, six questions de pilotage et impacts sur FLOW',
                         '/FLOWMeasurementEdition':EDITION})
    writer.compress_identical_objects(remove_identicals=True,remove_orphans=True)
    for page in writer.pages:page.compress_content_streams()
    candidate=TMP/'FLOW-scm-redesign-candidate.pdf'
    with candidate.open('wb') as f:writer.write(f)
    check=PdfReader(candidate)
    assert len(check.pages)==27 and len(check.outline)==27
    for i,p in enumerate(check.pages):
        t=p.extract_text()
        assert t.count('Dossier de pilotage  /')==1,(i+1,'footer')
        assert f'{i+1} / 27' in t,(i+1,'pagination')
        assert not re.search(r'\bM\d{2}\b',t),(i+1,'visible internal code')
    assert AUTHOR in check.pages[0].extract_text() and '22 octobre 2026' in check.pages[0].extract_text()
    for label in ('OTIF','Commandes à risque','Coût de service','Transferts','Excédent projeté','Délai commande-livraison','Valeur nette récupérée'):
        assert label in ' '.join(check.pages[6].extract_text().split()),label
    assert sum(len(q['metrics']) for q in __import__('flow_scm_questions').QUESTION_PAGES)==18
    for name in ('Electrolux Professional','Veseris','Howdens','Europris','Prinsel','Tuckernuck','JBS','JD.com'):
        assert name in check.pages[18].extract_text()+check.pages[19].extract_text()
    assert '92,5 %' in check.pages[14].extract_text() and '19 050' in check.pages[14].extract_text()
    assert '80 € par livraison' in check.pages[13].extract_text()
    assert '620 € nets de plus' in check.pages[15].extract_text()
    assert 'MAP est un outil de planification' in check.pages[14].extract_text()
    external=[];internal=[]
    for page in check.pages:
        for ref in page.get('/Annots',[]):
            a=ref.get_object()
            if '/URI' in a.get('/A',{}):external.append(a['/A']['/URI'])
            if '/Dest' in a:internal.append(a['/Dest'])
    assert len(set(external))==40,(len(set(external)),'distinct sources')
    assert len(internal)==len(links),(len(internal),len(links))
    candidate.replace(PDF)
    print(f'Rebuilt: 27 pages; {len(set(external))} distinct source links; {len(internal)} internal links; author {AUTHOR}.')
