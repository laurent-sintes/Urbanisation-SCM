"""Author the front matter and offshore/nearshore case of the FLOW dossier.

This durable authoring source preserves the other pages of the dossier. It can
be rerun on the delivered PDF: cover, contents, measurement guide, case pages,
bibliography additions, footers and outline are replaced rather than duplicated. Requires
ReportLab and pypdf. Run from any working directory; no historical PDF copy is
created. New editorial content lives here, not in a second business catalogue.
"""
from __future__ import annotations

import io
import re
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from pypdf.annotations import Link
from pypdf.generic import ContentStream, TextStringObject
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Table, TableStyle

ROOT = Path(__file__).resolve().parents[2]
PDF = Path(__file__).with_suffix('.pdf')
TMP = ROOT / 'tmp' / 'pdfs'
LOGO = ROOT / 'app' / 'public' / 'assets' / 'flow-original.png'
VERSION = 'offshore-nearshore-2026-10-21-v1'
PREVIOUS_EDITION = 'kpi-okr-measurement-guide-2026-10-21-v2'
EDITION = 'kpi-okr-measurement-guide-2026-10-21-v3'
ACADEMIC = 'https://transportation.northwestern.edu/docs/research/core-topics/logistics-and-supply-chain-management/VanMieghem_GlobalDualSourcing.pdf'
OKR_SOURCE = 'https://learn.microsoft.com/en-us/viva/goals/viva-goals-healthy-okr-program/write-okrs-overview?app=1'
W, H = A4
M, CW = 40, W - 80
GREEN = colors.HexColor('#236159')
MINT = colors.HexColor('#D9F2EA')
PAPER = colors.HexColor('#FCFDFD')
INK = colors.HexColor('#203C39')
MUTED = colors.HexColor('#516C62')
LINE = colors.HexColor('#DDE6E3')

pdfmetrics.registerFont(TTFont('Segoe', 'C:/Windows/Fonts/segoeui.ttf'))
pdfmetrics.registerFont(TTFont('Segoe-Bold', 'C:/Windows/Fonts/segoeuib.ttf'))
pdfmetrics.registerFontFamily('Segoe', normal='Segoe', bold='Segoe-Bold', italic='Segoe', boldItalic='Segoe-Bold')

styles = {
    'title': ParagraphStyle('title', fontName='Segoe-Bold', fontSize=24, leading=28, textColor=GREEN),
    'sub': ParagraphStyle('sub', fontName='Segoe', fontSize=10.5, leading=14.5, textColor=MUTED),
    'body': ParagraphStyle('body', fontName='Segoe', fontSize=10.2, leading=14, textColor=INK),
    'small': ParagraphStyle('small', fontName='Segoe', fontSize=9.5, leading=13.1, textColor=INK),
    'metric': ParagraphStyle('metric', fontName='Segoe', fontSize=9.1, leading=12.1, textColor=INK),
    'head': ParagraphStyle('head', fontName='Segoe-Bold', fontSize=11.5, leading=14.5, textColor=GREEN),
    'tiny': ParagraphStyle('tiny', fontName='Segoe', fontSize=8.4, leading=11.4, textColor=MUTED),
    'table': ParagraphStyle('table', fontName='Segoe', fontSize=9, leading=11.6, textColor=INK),
    'cell': ParagraphStyle('cell', fontName='Segoe', fontSize=9, leading=11.6, textColor=INK, alignment=TA_CENTER),
    'source': ParagraphStyle('source', fontName='Segoe', fontSize=9, leading=12.1, textColor=INK),
    'cover': ParagraphStyle('cover', fontName='Segoe-Bold', fontSize=38, leading=44, textColor=GREEN),
    'cover_sub': ParagraphStyle('cover_sub', fontName='Segoe', fontSize=21, leading=28, textColor=INK),
}


def para(c, text, x, top, width=CW, style='small'):
    p = Paragraph(text, styles[style])
    _, height = p.wrap(width, H)
    p.drawOn(c, x, top - height)
    return top - height


def header(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.rect(0, H-3, W, 3, fill=1, stroke=0)
    c.saveState()
    clip = c.beginPath()
    clip.rect(40, 781, 52, 25)
    c.clipPath(clip, stroke=0)
    c.drawImage(str(LOGO), 5, 724, 120, 120, mask='auto')
    c.restoreState()
    c.setFont('Segoe-Bold', 16)
    c.setFillColor(GREEN)
    c.drawString(102, 787, 'FLOW Atlas')
    c.setFont('Segoe-Bold', 8)
    c.setFillColor(MUTED)
    c.drawRightString(W-M, 790, 'PILOTAGE DE LA SUPPLY CHAIN')
    c.setStrokeColor(LINE)
    c.line(M, 762, W-M, 762)


def heading(c, eyebrow, title, subtitle):
    header(c)
    c.setFont('Segoe-Bold', 8.5)
    c.setFillColor(GREEN)
    c.drawString(M, 733, eyebrow)
    y = para(c, title, M, 716, style='title')
    return para(c, subtitle, M, y-9, style='sub') - 18


def footer(c, page, total, section):
    c.setStrokeColor(LINE)
    c.line(M, 47, W-M, 47)
    c.setFillColor(MUTED)
    c.setFont('Segoe', 7.4)
    c.drawString(M, 31, 'FLOW  /  Dossier de pilotage  /  21 octobre 2026')
    c.drawRightString(W-M, 31, f'{section}  |  {page} / {total}')


def make_case():
    stream = io.BytesIO()
    c = canvas.Canvas(stream, pagesize=A4)
    y = heading(c, 'EXEMPLE FICTIF / ACHATS DE SAISON', 'Combien engager en offshore ?',
                'Le CTP vérifie le complément réellement possible. Le PTP compare les conséquences économiques des politiques d’achat.')
    y = para(c, '<b>Hypothèses.</b> La demande vaut 800 ou 1 200 pièces, avec une probabilité de 50 % pour chaque cas. '
             'Vente à 30 €, achat offshore à 10 €, achat nearshore à 14 € : ces coûts rendus incluent achat et acheminement jusqu’au site. '
             'Récupération nette des invendus : 4 € par pièce. '
             'Le signal de demande est supposé fiable et assez précoce pour déclencher l’appoint.', M, y)
    y -= 12
    rows = [
        ['Trois politiques comparées', '<b>A</b><br/>1 200 offshore', '<b>B</b><br/>800 offshore<br/>+ jusqu’à 400 nearshore', '<b>C</b><br/>950 offshore<br/>+ jusqu’à 250 nearshore'],
        ['Contribution si demande de 800', '13 600 €', '16 000 €', '15 100 €'],
        ['Contribution si demande de 1 200', '24 000 €', '22 400 €', '23 000 €'],
        ['<b>Contribution moyenne</b>', '<b>18 800 €</b>', '<b>19 200 €</b>', '<b>19 050 €</b>'],
        ['Demande servie dans la saison', '100 %', '100 %', '100 %'],
        ['Invendus si demande de 800', '400 pièces', '0', '150 pièces'],
        ['Invendus moyens avant déstockage', '200 pièces', '0', '75 pièces'],
        ['Achats engagés au départ', '12 000 €', '8 000 €', '9 500 €'],
        ['Achats totaux moyens', '12 000 €', '10 800 €', '11 250 €'],
    ]
    data = [[Paragraph(cell, styles['table' if j==0 else 'cell']) for j,cell in enumerate(row)] for row in rows]
    table = Table(data, colWidths=[199, 97, 110, CW-406])
    table.setStyle(TableStyle([
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('TOPPADDING',(0,0),(-1,0),7), ('BOTTOMPADDING',(0,0),(-1,0),8),
        ('TOPPADDING',(0,1),(-1,-1),6), ('BOTTOMPADDING',(0,1),(-1,-1),6),
        ('LEFTPADDING',(0,0),(-1,-1),7), ('RIGHTPADDING',(0,0),(-1,-1),7),
        ('LINEBELOW',(0,0),(-1,0),0.8,GREEN),
        ('LINEBELOW',(0,1),(-1,-1),0.35,LINE),
        ('BACKGROUND',(0,3),(-1,3),MINT),
    ]))
    _, th = table.wrap(CW, H)
    table.drawOn(c, M, y-th)
    y -= th + 9
    y = para(c, '<b>Contribution simplifiée</b> = ventes + récupération nette des invendus - achats rendus. '
             'Pour B en forte demande : 1 200 × 30 - 800 × 10 - 400 × 14 = <b>22 400 €</b>. '
             'Les moyennes pondèrent les deux cas à 50/50 ; elles ne décrivent pas une saison observée.', M, y, style='tiny')
    y -= 15
    y = para(c, 'Ce que le CTP change avant la commande initiale', M, y, style='head') - 6
    y = para(c, '<b>400 pièces d’appoint réalisables à temps :</b> B réduit le risque d’invendus. Sa contribution moyenne dépasse A de '
             '<b>400 €</b>, malgré un prix nearshore plus élevé. Une réservation fixe de capacité à 400 € absorberait tout cet avantage.', M, y)
    y -= 8
    y = para(c, '<b>Seulement 250 pièces réalisables :</b> C relève le socle offshore à 950 et préserve le service, avec un avantage moyen de '
             '<b>250&nbsp;€</b> sur A. Garder 800 malgré cette limite laisserait 150 ventes non servies en forte demande : contribution moyenne '
             '<b>18&nbsp;000&nbsp;€</b> et demande servie <b>92,5&nbsp;%</b> en pondérant les volumes.', M, y)
    y -= 10
    y = para(c, 'Montants hors taxe sur la valeur ajoutée (TVA). Aucun stock initial ; coûts supplémentaires de réservation exclus ; autres coûts identiques. '
             'Les délais, prix et capacités sont illustratifs, sans attribution à un pays. La capacité doit être confirmée pour la fenêtre de vente. '
             'Le modèle de double approvisionnement est documenté dans la littérature [20] ; les chiffres de cette page sont fictifs.', M, y, style='tiny')
    if y < 60:
        raise ValueError(f'Case page overflow: {y}')
    c.showPage()

    y = heading(c, 'CAS OFFSHORE / NEARSHORE : RELIER SCÉNARIO ET PILOTAGE', 'Du scénario à la commande d’appoint',
                'Variables et résultats du scénario, distincts des sept KPI. Ils éclairent les six questions de pilotage, par produit, taille, date et fournisseur.')
    metrics = [
        ('1. Complément réalisable avant la date utile', 'Questions 2 / promesse et 5 / délais · Volume CTP, complément de M05',
         'Besoin daté, fournisseur qualifié, matières, capacités confirmées, lots, transport et contrôle.',
         'Quantité que le CTP peut rendre utilisable avant la dernière date permettant la vente : 400 ou 250 ici.',
         'Fixer le socle offshore à 800 ou 950 ; réserver les ressources nécessaires, puis revérifier avant l’appoint.'),
        ('2. Demande servie pendant la période de vente', 'Question 1 / service · Volume servi ; distinct de l’OTIF par ligne M01',
         'Demande des scénarios, probabilités et quantités servies à temps ; demande perdue estimée séparément.',
         'Somme(probabilité × quantité servie) / somme(probabilité × demande). Sans adaptation : (800 + 1 050) / 2 000 = 92,5 %.',
         'Relever le socle, avancer l’appoint ou répartir la capacité rare selon les priorités autorisées.'),
        ('3. Contribution économique de la saison', 'Question 3 / coût et valeur · Comparaison M08 ; distincte du coût par livraison M07',
         'Prix nets, achats rendus, coût de réservation, autres coûts modifiés et récupération nette des invendus.',
         'Moyenne des contributions par scénario : 19 200 € pour B contre 18 800 € pour A, avant frais de réservation.',
         'Choisir les achats et le surcoût accepté ; autoriser l’appoint après comparaison économique PTP.'),
        ('4. Excédent projeté avant déstockage', 'Questions 4 / stock et 6 / récupération · M11 avec cible de stock final nulle',
         'Stock initial, entrées attendues et sorties prévues, par article et taille, avec date de fin de saison.',
         'max(0, stock initial + entrées - sorties), puis moyenne des scénarios : A = 200, B = 0, C = 75 pièces.',
         'Réduire ou fractionner le volume ferme ; réaffecter les excédents et préparer leur débouché.'),
        ('5. Montant des achats engagés', 'Question 4 / financement · Engagement futur ; distinct du stock détenu M10',
         'Quantités et prix fermes, clauses irrévocables, réservations ; échéances de paiement pour la trésorerie.',
         'Montant initial séparé des engagements futurs par scénario : B engage 8 000 € au départ, 10 800 € en moyenne.',
         'Fixer un plafond d’engagement initial et une enveloppe d’appoint. Un achat engagé ne vaut pas paiement immédiat.'),
    ]
    for title, questions, data, calculation, decision in metrics:
        y = para(c, title, M, y, style='head')
        y = para(c, questions, M, y-2, style='tiny') - 3
        y = para(c, f'<b>Données.</b> {data} <b>Calcul.</b> {calculation}<br/><b>Décision dans FLOW.</b> {decision}', M, y, style='metric') - 7
        c.setStrokeColor(LINE)
        c.line(M, y, W-M, y)
        y -= 9
    y = para(c, 'Un mode de fonctionnement possible dans FLOW', M, y, style='head') - 5
    y = para(c, '<b>En amont :</b> dès Design &amp; Development (conception et développement), préparer le socle offshore avec '
             'Sourcing and Procurement (recherche de fournisseurs et achats). <b>Avant l’engagement :</b> Supply Chain Management teste le '
             'complément par CTP et dimensionne le socle. <b>Pendant la saison :</b> il peut décider l’appoint selon la politique, les délégations '
             'et l’analyse économique. Purchase Order (commande d’achat) porte la commande autorisée. Le CTP vérifie la faisabilité ; '
             'il ne signe pas la commande. La responsabilité d’achat se répartit selon l’objet et l’horizon.', M, y, style='metric')
    y -= 6
    y = para(c, '<b>Planification et décisions opérationnelles forment un même ensemble métier SCM.</b> '
             'MAP est l’outillage actuel de planification ; il ne fixe pas la frontière du modèle cible. '
             'Cette intégration métier n’impose pas un logiciel unique.', M, y, style='metric')
    y -= 8
    y = para(c, 'Le signal fiable simplifie l’exemple. Le pilote doit intégrer erreurs de demande, délais incertains et concurrence sur les capacités. '
             'Ce mode cible ne prouve aucune installation. Fonctions de promesse documentées : Microsoft et SAP [2-3].', M, y, style='tiny')
    if y < 60:
        raise ValueError(f'Metric page overflow: {y}')
    c.save()
    stream.seek(0)
    return PdfReader(stream)


QUESTIONS = [
    'Le service est-il tenu ?',
    'Quelles promesses sont menacées ?',
    'Combien coûte le service rendu ?',
    'Combien de stock finance-t-on, et quel excédent se prépare ?',
    'Où le temps s’accumule-t-il ?',
    'Quelle valeur récupère-t-on des retours et excédents ?',
]

PRIORITY_CODES = ('M01', 'M04', 'M07', 'M09', 'M11', 'M13', 'M18')
QUESTION_PRIORITIES = (('M01',), ('M04',), ('M07', 'M09'), ('M11',), ('M13',), ('M18',))

MEASURES = [
    ('M01', 'OTIF par ligne', 'Résultat', True, 'Part des lignes livrées en totalité dans la promesse initiale.'),
    ('M02', 'Service à la date souhaitée par le client', 'Résultat', False, 'Part livrée à temps par rapport au besoin exprimé par le client.'),
    ('M03', 'Achats utilisables à temps', 'Résultat', False, 'Part des lignes d’achat reçues et utilisables à la date confirmée initiale.'),
    ('M04', 'Engagements ouverts à risque', 'Anticipation', True, 'Part du carnet (lignes restant à servir) dont la date promise est menacée ; inconnus à part.'),
    ('M05', 'Couverture ATP et manques résolus par CTP', 'Anticipation', False, 'Deux taux : couverture prévue et manques résolus par un apport vérifié.'),
    ('M06', 'Effet d’une protection de stock', 'Arbitrage', False, 'Lignes aidées et pénalisées par groupe, entre deux règles de protection.'),
    ('M07', 'Coût du parcours par livraison', 'Résultat', True, 'Coût attribué aux unités servies, rapporté aux livraisons servies.'),
    ('M08', 'Écart économique entre options : lecture PTP', 'Arbitrage', False, 'Gain attendu entre deux options, à même demande et même date future d’évaluation (horizon).'),
    ('M09', 'Transferts préalables à la préparation wholesale', 'Diagnostic', True, 'Transferts inter-entrepôts : part des livraisons concernées et nombre moyen par livraison.'),
    ('M10', 'Valeur du stock détenu', 'Résultat', False, 'Valeur détenue, en distinguant disponible, bloqué et transit.'),
    ('M11', 'Excédent projeté à l’horizon', 'Anticipation', True, 'À une date future fixée (l’horizon), stock prévu au-delà du niveau souhaité (la cible), puis valorisé.'),
    ('M12', 'Erreur et biais de prévision', 'Diagnostic', False, 'Écart absolu ; le biais indique si la prévision surestime ou sous-estime la demande.'),
    ('M13', 'Délai de bout en bout et attente par étape', 'Résultat', True, 'Médiane : délai atteint par 50 % des dossiers terminés. Suivre aussi celui atteint par 90 %.'),
    ('M14', 'Nombre et âge des dossiers encore ouverts', 'Diagnostic', False, 'Volume en attente, âge des dossiers et dépassements d’un seuil défini.'),
    ('M15', 'Charge rapportée à la capacité disponible', 'Anticipation', False, 'Heures requises rapportées aux heures disponibles par opération et créneau.'),
    ('M16', 'Délai de remise à disposition des retours', 'Diagnostic', False, 'De la réception au stock utilisable ; compléter par les retours encore ouverts.'),
    ('M17', 'Part revendue dans un délai donné', 'Résultat', False, 'Part revendue sous 30 jours d’une cohorte : un même groupe de retours reçus sur une période fixée.'),
    ('M18', 'Valeur nette récupérée par destination', 'Résultat', True, 'Recettes ou avoirs moins frais de récupération ; coût du stock séparé.'),
]


def make_front():
    """Six opening pages and their internal navigation rectangles."""
    stream = io.BytesIO()
    c = canvas.Canvas(stream, pagesize=A4)
    links = []

    # Cover: a quiet visual hierarchy, with the colour reserved for emphasis.
    header(c)
    c.setFillColor(GREEN)
    c.setFont('Segoe-Bold', 9.5)
    c.drawString(M, 650, 'DOSSIER DE PILOTAGE')
    y = para(c, 'Piloter<br/>la supply chain', M, 620, style='cover')
    y = para(c, 'Indicateurs, objectifs<br/>et décisions dans FLOW', M, y-24, style='cover_sub')
    para(c, 'La supply chain est la chaîne d’approvisionnement, des achats aux ventes, aux retours et au déstockage. '
         'Le Supply Chain Management (SCM) en pilote les ressources et les flux. '
         'Ce dossier relie les mesures aux choix de règles et à la vérification des résultats.', M, y-30, width=450, style='body')
    c.setStrokeColor(GREEN)
    c.setLineWidth(1.3)
    c.line(M, 290, W-M, 290)
    for x, n, label in [(M,'7','indicateurs clés de performance<br/>(KPI) prioritaires'),(M+178,'6','questions de pilotage'),(M+356,'11','fiches complémentaires')]:
        c.setFont('Segoe-Bold',24)
        c.setFillColor(GREEN)
        c.drawString(x, 251, n)
        para(c,label,x,237,width=155,style='small')
    para(c, '18 fiches pratiques, 8 cas d’entreprises et deux exemples chiffrés :<br/>'
         'achat local et choix entre fabrication dans un pays lointain (offshore)<br/>'
         'ou proche du marché servi (nearshore).<br/>'
         'Sources marché, calculs et décisions à tester dans FLOW.', M, 171, style='small')
    para(c, 'Édition du 21 octobre 2026', M, 105, style='tiny')
    c.showPage()

    # Contents: every row is a real PDF internal destination.
    y = heading(c, 'REPÈRES DE LECTURE', 'Sommaire',
                'Commencer par les mesures, puis utiliser les exemples et les références pour préparer les décisions.')

    def toc(label, destination, page_text=None, indent=0, detail=None):
        nonlocal y
        top = y
        x = M + indent
        y = para(c, label, x, y, width=CW-55-indent, style='head' if indent==0 else 'small')
        c.setFont('Segoe-Bold' if indent==0 else 'Segoe',10)
        c.setFillColor(GREEN)
        c.drawRightString(W-M, top-11, page_text or str(destination+1))
        if detail:
            y = para(c, detail, x, y-4, width=CW-55-indent, style='tiny')
        links.append((1,(M,y-5,W-M,top+3),destination))
        y -= 13 if indent else 17

    toc('Comprendre KPI, objectifs et résultats clés (OKR)',2,detail='Mesurer une situation, fixer un progrès, choisir une action.')
    toc('KPI prioritaires et indicateurs complémentaires',3,'4-5',detail='Sept KPI prioritaires et onze fiches complémentaires, regroupés en six questions.')
    toc('Sept KPI prioritaires : OKR et décisions FLOW',5,'6')
    y = para(c,'Les six questions de pilotage',M,y,style='head')-10
    for i,q in enumerate(QUESTIONS):
        toc(f'{i+1:02d} / {q}',6+i,indent=12)
    y -= 2
    toc('Exemple : que peut-on promettre au client ?',12,'13',detail='Faut-il acheter local plus cher ? Disponibilité, faisabilité et intérêt économique.')
    toc('Exemple : offshore et nearshore',13,'14-15',detail='Quel volume commander à l’avance, puis compléter, avec quel résultat économique ?')
    toc('Références et résultats du marché',15,'16-18',detail='Mécanismes, puis cas reliés aux sept KPI : changements, résultats et limites.')
    toc('Le pilote FLOW : vérifier les sept KPI prioritaires',18,'19')
    toc('Sources et conventions',19,'20')
    if y < 60:
        raise ValueError(f'Contents overflow: {y}')
    c.showPage()

    # Explain the vocabulary before showing the catalogue of measures.
    y = heading(c,'COMPRENDRE LE RÔLE DES MESURES','KPI, OKR et décisions',
                'Un KPI suit une situation. Un OKR fixe un progrès à atteindre. Une décision choisit comment agir.')
    for title, body in [
        ('KPI : une mesure suivie dans le temps',
         'Un <b>Key Performance Indicator</b> est un indicateur clé de performance. '
         'Exemple : <b>OTIF</b> (<b>On Time In Full</b>), part des lignes de commande (article ou variante) livrées à l’heure et en totalité. '
         'Sa formule, son périmètre, sa source et sa fréquence doivent rester comparables. Un indicateur utile permet de constater, anticiper ou expliquer un résultat.'),
        ('OKR : un objectif et plusieurs résultats clés',
         '<b>Objectives and Key Results</b> associe un objectif qualitatif à des résultats clés chiffrés, avec une échéance. '
         'Un résultat clé (<b>KR, Key Result</b>) précise la valeur de départ et la cible. Un OKR peut mobiliser plusieurs KPI. [21]'),
        ('Décision : l’action ou la règle à changer',
         'Changer le site préparateur, le lot d’achat ou la protection de stock (quantité préservée pour un usage ou un groupe) constitue une décision. '
         'Vérifier ensuite son effet. Un seuil d’alerte ne constitue pas automatiquement la cible d’un KR.'),
    ]:
        y=para(c,title,M,y,style='head')-5
        y=para(c,body,M,y,style='small')-13
    c.setStrokeColor(LINE)
    c.line(M,y+2,W-M,y+2)
    y-=13
    y=para(c,'Exemple d’OKR wholesale - entièrement fictif',M,y,style='head')-7
    y=para(c,'<b>Wholesale :</b> vente à des revendeurs professionnels.',M,y,style='small')-5
    y=para(c,'<b>Objectif :</b> servir le wholesale avec moins de transferts et une promesse fiable.<br/>'
           '<b>Échéance des trois résultats clés :</b> 31 mars 2027.',M,y,style='small')-8
    for text in [
        '<b>KR1.</b> Réduire de 30 % à 20 % la part des livraisons nécessitant un transfert préalable.',
        '<b>KR2.</b> Faire passer l’OTIF par ligne de 94 % à 97 %.',
        '<b>KR3 / garde-fou économique.</b> Maintenir le coût par livraison à 100 € ou moins, contre 100 € au départ, à périmètre comparable.',
    ]:
        y=para(c,text,M+10,y,width=CW-10,style='small')-5
    y-=3
    y=para(c,'<b>Actions à tester dans FLOW :</b> mieux placer le stock, changer de site préparateur ou fractionner certains achats. '
           'Suivre ensuite les trois KPI ensemble : une baisse des transferts ne suffit pas si le service ou le coût se dégrade.',M,y,style='small')-11
    y=para(c,'Ces valeurs et cette échéance illustrent la méthode ; ce ne sont pas des cibles Beaumanoir. '
           'Les objectifs réels se fixent après mesure de la situation initiale.',M,y,style='tiny')-14
    y=para(c,'Trois vérifications avant de promettre au client',M,y,style='head')-5
    for text in [
        '<b>ATP — Available-to-Promise :</b> quantité promettable à une date, avec le stock libre et les arrivages déjà prévus.',
        '<b>CTP - Capable-to-Promise :</b> option réalisable à temps après vérification des ressources et des délais, y compris un complément à créer.',
        '<b>PTP — Profitable-to-Promise :</b> comparaison économique des options réalisables pour servir la demande. Exemple page 12. [2-5]',
    ]:
        y=para(c,text,M,y,style='small')-4
    if y<60:
        raise ValueError(f'Introduction overflow: {y}')
    c.showPage()

    # Explicit catalogue: M is a reading reference, not a claim that every row
    # is one homogeneous observed KPI.
    for half in range(2):
        y=heading(c,'CATALOGUE DE MESURE / '+('1 SUR 2' if half==0 else '2 SUR 2'),'Les indicateurs à suivre',
                  'Sept KPI prioritaires et onze fiches complémentaires, organisés en six questions. '
                  'Chaque ligne mène aux données, au calcul et à la décision associés.')
        for qi in range(half*3,half*3+3):
            y=para(c,f'{qi+1:02d} / {QUESTIONS[qi]}',M,y,style='head')-6
            for code,title,nature,main,description in MEASURES[qi*3:qi*3+3]:
                top=y
                label=f'<b>{code} / {title}</b>' if main else f'{code} / {title}'
                y=para(c,label,M,y,width=385,style='small')
                c.setFillColor(GREEN if main else MUTED)
                c.setFont('Segoe-Bold' if main else 'Segoe',8.5)
                c.drawRightString(W-M,top-10,nature)
                c.setFont('Segoe-Bold' if main else 'Segoe',7.1)
                c.drawRightString(W-M,top-21,'KPI PRIORITAIRE' if main else 'COMPLÉMENT')
                y=para(c,description,M,y-3,width=419,style='tiny')-7
                links.append((3+half,(M,y,W-M,top+2),6+qi))
                c.setStrokeColor(LINE)
                c.line(M,y,W-M,y)
                y-=9
            y-=9
        y=para(c,'<b>Résultat :</b> ce qui est mesuré sur les opérations. <b>Anticipation :</b> ce que les données actuelles annoncent. '
               '<b>Diagnostic :</b> ce qui aide à comprendre. <b>Arbitrage :</b> comparaison de scénarios, avec les mêmes hypothèses.',M,y,style='tiny')-8
        y=para(c,'Les codes M01 à M18 sont des repères de lecture. Certaines fiches regroupent plusieurs mesures. '
               'M06 et M08 comparent des options ; leurs résultats simulés sont distingués des résultats observés.',M,y,style='tiny')
        if y<60:
            raise ValueError(f'Catalogue {half} overflow: {y}')
        c.showPage()
    make_summary(c, links)
    c.save()
    stream.seek(0)
    return PdfReader(stream),links


def make_summary(c, links):
    y = heading(c, 'TABLEAU DE RÉFÉRENCE / CIBLES ILLUSTRATIVES', 'Sept KPI : objectifs et décisions',
                'Sept indicateurs prioritaires. Les exemples ci-dessous servent à préparer les objectifs du pilote.')
    y = para(c, '<b>Exemples entièrement fictifs.</b> Tous les résultats clés ci-dessous sont à atteindre '
             '<b>au 31 mars 2027</b>. Les valeurs de départ et les cibles illustrent la méthode ; '
             'elles ne constituent ni des objectifs Beaumanoir ni des gains promis par FLOW.', M, y, style='small') - 12
    rows = [
        ['<b>KPI à suivre</b>', '<b>Exemple d’OKR au 31/03/2027</b><br/>Objectif + résultats clés (KR)',
         '<b>Décision concrète dans FLOW</b>'],
        ['<b>M01 / OTIF par ligne</b><br/>Promesse initiale tenue',
         '<b>Tenir les promesses clients.</b><br/>KR : OTIF de <b>94 % à 97 %</b> ; service à la date souhaitée de <b>90 % à 94 %</b> (M02).',
         'Choisir un autre site préparateur ou réaffecter le stock après vérification ATP/CTP, pour tenir la date initiale.'],
        ['<b>M04 / Engagements ouverts à risque</b><br/>Lignes évaluables dues sous 4 semaines',
         '<b>Prévenir les retards.</b><br/>KR : lignes à risque de <b>15 % à 5 %</b> ; lignes non calculables de <b>10 % à 2 %</b>, suivies séparément.',
         'Réaffecter du stock, changer de parcours ou vérifier un complément par CTP ; décider selon le coût et les délégations.'],
        ['<b>M07 / Coût du parcours par livraison</b>',
         '<b>Réduire le coût du service.</b><br/>KR : de <b>100 € à 95 €</b> par livraison ; porter l’OTIF de <b>94 % à au moins 97 %</b>.',
         'Regrouper des départs ou changer de site préparateur si la simulation réduit le coût complet en tenant les promesses.'],
        ['<b>M09 / Transferts inter-entrepôts avant préparation wholesale</b>',
         '<b>Simplifier les flux wholesale.</b><br/>KR : livraisons avec au moins un transfert de <b>30 % à 20 %</b> ; OTIF de <b>94 % à 97 %</b> ; coût plafonné à <b>100 €</b> par livraison (100 € au départ).',
         'Simuler le placement du stock et le site préparateur ; ajuster l’affectation ou la répartition des achats en lots pour éviter le transfert, à service et coût maîtrisés.'],
        ['<b>M11 / Excédent projeté</b><br/>À fin juin 2027',
         '<b>Réduire le surplus prévu.</b><br/>KR : projection de <b>300 000 à 180 000 €</b> ; risque M04 de <b>15 % à 5 %</b>. Évaluation au 31 mars ; horizon (date future étudiée) au 30 juin.',
         'Réaffecter l’excédent, ajuster les achats ou préparer le déstockage ; comparer service, transferts et valeur récupérable.'],
        ['<b>M13 / Délai de bout en bout</b><br/>Ventes : acceptation à livraison',
         '<b>Fluidifier les livraisons.</b><br/>KR : délai couvrant 50 % des ventes terminées de <b>10 à 7 jours</b> ; celui couvrant 90 % de <b>18 à 12 jours</b> ; dossiers ouverts âgés de plus de 14 jours : <b>8 % à 5 %</b> (M14).',
         'Réduire les lots ou déplacer un créneau sur l’étape qui concentre l’attente, après contrôle de la capacité aval.'],
        ['<b>M18 / Valeur nette récupérée</b><br/>Rapportée à la valeur du stock',
         '<b>Mieux valoriser le stock restant.</b><br/>KR : de <b>35 à 45 € nets</b> pour 100 € de stock de référence ; unités en attente de destination de <b>20 % à 5 %</b> de la cohorte.',
         'Comparer revente, remise en état, retour fournisseur et déstockage, avec les prix et conditions autorisés.'],
    ]
    data = [[Paragraph(cell.replace(' %','&nbsp;%').replace(' €','&nbsp;€').replace(' k€','&nbsp;k€'),
                       styles['table']) for cell in row] for row in rows]
    table = Table(data, colWidths=[118, 218, CW-336])
    table.setStyle(TableStyle([
        ('VALIGN',(0,0),(-1,-1),'TOP'),
        ('BACKGROUND',(0,0),(-1,0),MINT),
        ('LINEBELOW',(0,0),(-1,0),.7,GREEN),
        ('LINEBELOW',(0,1),(-1,-1),.4,LINE),
        ('LEFTPADDING',(0,0),(-1,-1),7), ('RIGHTPADDING',(0,0),(-1,-1),7),
        ('TOPPADDING',(0,0),(-1,-1),6), ('BOTTOMPADDING',(0,0),(-1,-1),6),
    ]))
    _, h = table.wrap(CW,H)
    table.drawOn(c,M,y-h)
    top = y-table._rowHeights[0]
    for question_index,height in zip((0,1,2,2,3,4,5),table._rowHeights[1:]):
        links.append((5,(M,top-height,M+118,top),6+question_index))
        top -= height
    y -= h + 12
    y = para(c, '<b>Périmètres comparables.</b> Conserver périodes, produits, canaux et calculs comparables. '
             'M04 rapporte les inconnues à toutes les lignes. M09 suit toutes les livraisons wholesale, y compris sans transfert ; '
             'son OTIF et son coût portent sur ce même périmètre. Le plafond de 100 € ne remplace pas la cible M07 si les périmètres sont identiques. '
             'M11 garde stock cible et valorisation constants. M18 rapporte les sommes nettes aux valeurs de référence figées '
             'de cohortes complètes (groupes reçus sur une même période), avec le même recul et les unités en attente ; frais déjà déduits.',
             M,y,style='tiny') - 8
    y = para(c, 'Les codes KPI sont cliquables vers les fiches de calcul. Les décisions restent soumises aux politiques et '
             'délégations applicables ; leur effet est ensuite vérifié dans les mêmes indicateurs.', M,y,style='tiny')
    if y < 60:
        raise ValueError(f'Summary table overflow: {y}')
    c.showPage()


def make_pilot():
    stream = io.BytesIO()
    c = canvas.Canvas(stream,pagesize=A4)
    y = heading(c,'DES MESURES À LA PREUVE DE VALEUR','Ce qu’un pilote FLOW doit démontrer',
                'Commencer par les transferts wholesale (M09), l’un des sept KPI prioritaires. '
                'Élargir aux achats, aux protections et aux retours selon les causes observées.')
    sections = [
        ('1. Mesurer le problème et relier les données', [
            'Établir la situation initiale des sept KPI : promesse tenue (M01), engagements à risque (M04), coût (M07), '
            'transferts wholesale (M09), excédent (M11), délai (M13) et valeur récupérée (M18). '
            'Les onze fiches complémentaires expliquent les écarts ; les six questions organisent la lecture.',
            'Relier achats, réceptions utilisables, demandes, promesses, mouvements et capacités par des identifiants stables. '
            'Pour chaque mesure, fixer unité, périmètre, période, exclusions, source et responsable. '
            'Afficher numérateur et dénominateur des taux ; séparer données observées, estimées et manquantes.',
        ]),
        ('2. Comparer des décisions réellement applicables', [
            'Rejouer des situations historiques avec les seules informations connues à la date de décision. '
            'Comparer autre site, protection, fournisseur ou lot d’achat avec les mêmes demandes, dates et contraintes.',
            'Conserver les résultats de chaque option : service, coûts modifiés, stock final, ressources et effets sur les autres groupes. '
            'Le moteur doit expliquer pourquoi une option est impossible ou préférable.',
        ]),
        ('3. Appliquer, puis vérifier le résultat', [
            'Sur un périmètre limité, journaliser proposition, décision retenue, autorisation, exécution et résultat. '
            'Vérifier les données absentes et les raisons de refus avec les équipes qui prennent la décision.',
            'Suivre les sept KPI prioritaires ensemble, avec leurs compléments utiles. Comparer produits, canaux, volumes et saisons similaires. '
            'Un simple avant/après ne suffit pas à attribuer tout le gain à FLOW. Présenter séparément résultats simulés et observés.',
        ]),
        ('4. Construire le dossier d’investissement', [
            'Chiffrer séparément dépenses évitées ou ajoutées, marge sur ventes réellement sauvées, stock à financer et valeur récupérée. '
            'Éviter les doubles comptes : une vente avancée n’est pas automatiquement une vente supplémentaire.',
            'Comparer les gains observés au coût de mise en œuvre, d’intégration, de qualité des données, de changement et d’exploitation. '
            'Extrapoler seulement à des volumes et contextes comparables.',
        ]),
    ]
    for title,paragraphs in sections:
        y=para(c,title,M,y,style='head')-7
        for text in paragraphs:
            y=para(c,text,M,y,style='small')-8
        c.setStrokeColor(LINE)
        c.line(M,y,W-M,y)
        y-=15
    y=para(c,'<b>La preuve recherchée :</b> quelles décisions FLOW améliore, dans quelles situations et avec quel bénéfice vérifié. '
           'Les références marché rendent les leviers crédibles ; les données du pilote fondent le montant à investir.',M,y,style='small')
    if y<60:
        raise ValueError(f'Pilot page overflow: {y}')
    c.showPage()
    c.save()
    stream.seek(0)
    return PdfReader(stream)


def make_market_cases():
    stream=io.BytesIO()
    c=canvas.Canvas(stream,pagesize=A4)
    links=[]
    groups=[
        [
            ('M01 / Promesse tenue (OTIF) - Electrolux Professional [7]',6,
             'Rapproche prévisions, stocks, composants et capacités de production ; passe de l’ATP au CTP pour annoncer une date réalisable.',
             'Niveau de service allant <b>jusqu’à 98 %</b> dans les zones déployées.',
             'La formule du service et la valeur initiale ne sont pas publiées. <b>Gain sur l’OTIF FLOW non chiffré.</b> '
             'L’objectif supérieur à 95 % ne prouve pas un gain de trois points.'),
            ('M04 / Engagements à risque - Electrolux Professional [7]',7,
             'Vérifie les ressources avant de confirmer la date. Ce contrôle éclaire le traitement des promesses que les ressources ne permettent pas de tenir.',
             'Le même cas rapporte le service jusqu’à 98 % décrit pour M01 ; <b>aucun taux d’engagements à risque n’est publié</b>.',
             'Le cas illustre le levier CTP, sans mesurer les lignes ouvertes à risque sur un horizon donné. '
             '<b>Gain sur M04 non chiffré.</b> Le résultat de service ne se compte pas une seconde fois.'),
            ('M07 / Coût par livraison - Veseris [13]',8,
             'Automatise et regroupe les ordres de transfert avec Dynamics 365 et des solutions de transport.',
             'Fréquence d’expédition et coûts de transport <b>divisés par deux</b>, selon le cas Microsoft du 15 novembre 2025.',
             'Le coût du transport ne représente pas le coût complet par livraison. Valeur initiale, durée et nombre de livraisons non publiés : '
             '<b>gain sur M07 non chiffré</b>.'),
            ('M09 / Transferts préalables wholesale - Howdens [10-11]',8,
             'Analyse les transferts par région, revoit les assortiments et teste un réassort le lendemain dans plus de 20 dépôts.',
             'Baisse des transferts inter-dépôts et amélioration du service, <b>non chiffrées</b>. Le nombre de dépôts décrit le pilote, pas le gain.',
             'Cas proche du besoin FLOW, mais ni part des livraisons dépendant d’un transfert avant préparation, ni nombre moyen par livraison, '
             'ni gain financier publiés.'),
        ],
        [
            ('M11 / Excédent projeté - Europris [17]',9,
             'Centralise le réassort avec RELEX, rapproche prévisions et stocks et adapte les minimums de présentation à l’espace disponible.',
             'Stock du centre de distribution réduit de <b>plus de 17 % en 18 semaines</b> ; disponibilité magasin de <b>91 % à plus de 97 %</b>. '
             'Transformation engagée en 2015.',
             'Il s’agit de stock constaté, pas de l’excédent projeté à un horizon fixe de M11. Valorisation du stock et gain financier non publiés ; '
             '<b>gain sur M11 non chiffré</b>.'),
            ('M13 / Délai de bout en bout - Prinsel [18]',10,
             'Automatise stockage et prélèvement avec la gestion d’entrepôt Blue Yonder, pour fluidifier les opérations de deux centres de distribution.',
             'Temps moyen de traitement ramené de <b>2 heures à 45 minutes</b>.',
             'Mesure d’une étape logistique, pas du délai complet acceptation-livraison ; moyenne, pas médiane ou délai couvrant 90 % des dossiers. '
             'Bornes précises et période non publiées. <b>Gain sur M13 non chiffré.</b>'),
            ('M18 / Valeur nette récupérée - Tuckernuck [19]',11,
             'Relie données de retour client, points de dépôt et entrepôt avec Optoro pour accélérer le traitement et la remise en vente.',
             'Majorité prête à la revente <b>sous 24 h après réception</b> ; <b>78 % revendus/réexpédiés sous 30 jours après initiation</b> du retour.',
             '<b>Aucune valeur nette récupérée ni gain monétaire publié.</b> Les deux délais partent d’événements différents. '
             'Ces résultats éclairent surtout M16/M17 ; leur période d’observation n’est pas publiée.'),
        ],
    ]
    for group_index,cases in enumerate(groups):
        page_index=16+group_index
        title='Service, risque, coût et transferts' if group_index==0 else 'Stock, délais et valeur récupérée'
        y=heading(c,'LES ENTREPRISES ÉCLAIRENT LES KPI / '+str(group_index+1)+' SUR 2',title,
                  'Pour chaque KPI : changement réalisé, résultat publié et limite de comparaison. '
                  'Les gains sont déclarés par les entreprises ou leurs partenaires.')
        for title,destination,change,result,limits in cases:
            top=y
            y=para(c,title,M,y,style='head')-5
            links.append((page_index,(M,y,W-M,top+2),destination))
            for label,text in [('Changement.',change),('Résultat publié.',result),('Limite pour FLOW.',limits)]:
                text=text.replace(' %','&nbsp;%')
                y=para(c,f'<b>{label}</b> {text}',M,y,style='metric')-4
            c.setStrokeColor(LINE)
            c.line(M,y,W-M,y)
            y-=10
        if group_index==0:
            extra=('<b>Autre éclairage économique : JBS [8-9], M07 via l’analyse M08.</b> '
                   'Des scénarios rapprochent demande, capacités, prix et transports. Marge annoncée en hausse de <b>25 %</b> '
                   'dans le cas publié en 2015 ; ni base initiale, ni durée, ni formule détaillée. '
                   'Ce n’est ni une baisse du coût par livraison ni un gain de 25 points de taux de marge.')
        else:
            extra=('<b>Autre éclairage sur le stock et les coûts : JD.com [16], M11/M07.</b> '
                   'Combine choix des produits et répartition du stock dans huit entrepôts régionaux. Les auteurs rapportent <b>6,13 millions de dollars par an</b> '
                   'de coûts de stockage et de financement du stock évités et <b>22,32 millions de dollars</b> de transferts économisés, sans période précisée pour ce second montant. '
                   'Étude de 2025 : résultat global en e-commerce, sans excédent projeté ni coût par livraison publiés.')
        y=para(c,extra,M,y,style='tiny')-10
        y=para(c,'<b>À retenir.</b> Un résultat chiffré sur une mesure voisine ne donne pas un gain chiffré sur le KPI FLOW. '
               '« Non chiffré » décrit la preuve disponible, pas une absence d’effet. Titres cliquables vers les fiches ; sources page 20.',
               M,y,style='tiny')
        if y<60:
            raise ValueError(f'Market mapping page {group_index+1} overflow: {y}')
        c.showPage()
    c.save()
    stream.seek(0)
    return PdfReader(stream),links


def mark_question_priority(page,writer,question_index,links):
    strip_text_blocks(page,writer,lambda block: 'KPI PRIORITAIRE' in text_of(block) or 'entreprises : page' in text_of(block))
    if '/Annots' in page:
        page['/Annots'][:]=[a for a in page['/Annots'] if '/Dest' not in a.get_object()]
    codes=QUESTION_PRIORITIES[question_index]
    label=('KPI PRIORITAIRES : ' if len(codes)>1 else 'KPI PRIORITAIRE : ')+' / '.join(codes)
    market_page=17 if question_index<3 else 18
    def draw(c):
        c.setFillColor(GREEN)
        c.setFont('Segoe-Bold',7.5)
        c.drawRightString(W-M,733,label)
        c.setFont('Segoe',7.3)
        c.drawRightString(W-M,722,f'Cas d’entreprises : page {market_page}')
    page.merge_page(overlay_page(draw))
    links.append((6+question_index,(W-M-140,719,W-M,730),market_page-1))


def clarify_question_vocabulary(page,writer,question_index):
    replacements = {
        0: ('Constater le r',679,'sub',
            'Constater le résultat par canal, priorité et flux. Les ventes et les remplacements du service après-vente (SAV) '
            'sont suivis séparément ; une réparation a son propre engagement de fin.'),
        2: ('Un transfert partag',233.7,'tiny',
            '<b>Éviter le double compte.</b> Un transfert partagé compte comme dépendance pour chaque livraison concernée ; '
            'son mouvement physique et son coût ne sont enregistrés qu’une fois, puis répartis. '
            'Le réassort (réapprovisionnement) anticipé est suivi séparément. Une baisse de transferts doit rester '
            'compatible avec le service et le coût complet. Cas Howdens et Veseris : page 17 ; JD.com : page 18.'),
        3: ('Stock physiquement',447.4,'small',
            '<b>Données.</b> Stock physiquement présent, entrées et sorties prévues, commandes et prévisions rapprochées sans double compte, '
            'cible par article-site et coût unitaire. Compter le transit une fois, à réception ; le stock bloqué '
            'ne couvre une sortie qu’après sa libération prévue.'),
    }
    if question_index in replacements:
        marker,top,style,text=replacements[question_index]
        strip_text_blocks(page,writer,lambda b: marker in text_of(b))
        page.merge_page(overlay_page(lambda c: para(c,text,M,top,style=style)))


def strip_text_blocks(page, writer, predicate):
    stream = ContentStream(page.get_contents(), writer)
    result = []
    block = []
    in_text = False
    for operands, op in stream.operations:
        if op == b'BT':
            block = [(operands, op)]
            in_text = True
        elif in_text:
            block.append((operands, op))
            if op == b'ET':
                if not predicate(block):
                    result.extend(block)
                block = []
                in_text = False
        else:
            result.append((operands, op))
    result.extend(block)
    stream.operations = result
    page.replace_contents(stream)


def text_of(block):
    return ''.join(str(a[0]) for a,op in block if op == b'Tj')


def is_footer(block):
    return any(op == b'Tm' and abs(float(a[-1])-31) < .01 for a,op in block)


def replace_crossrefs(page, writer, mapping):
    stream = ContentStream(page.get_contents(), writer)
    for operands, op in stream.operations:
        if op != b'Tj':
            continue
        original = str(operands[0])
        def renumber(match):
            first = int(match.group(2))
            result = f'{match.group(1)} {mapping.get(first,first)}'
            if match.group(3):
                last = int(match.group(3))
                result += f'-{mapping.get(last,last)}'
            return result
        text = re.sub(r'\b(page|pages) (\d+)(?:-(\d+))?\b', renumber, original)
        if text != original:
            operands[0] = TextStringObject(text)
    page.replace_contents(stream)


def add_measure_codes(page, writer, question_index):
    patterns=[
        'Promesse initiale tenue', 'Service ', 'Achats utilisables',
        'Engagements ouverts', 'Couverture ATP', 'Effet ',
        'du parcours par livraison', 'conomique entre options', 'Transferts ',
        'Valeur du stock', 'dent projet', 'Erreur et biais',
        'lai de bout en bout', 'Nombre et', 'Charge rapport',
        'lai de remise', 'Part revendue', 'Valeur nette r',
    ]
    stream=ContentStream(page.get_contents(),writer)
    found=[]
    for operands,op in stream.operations:
        if op!=b'Tj':
            continue
        s=str(operands[0])
        for mi in range(question_index*3,question_index*3+3):
            if patterns[mi] in s and len(s)<95:
                prefix=f'M{mi+1:02d} / '
                if not s.startswith(prefix):
                    operands[0]=TextStringObject(prefix+s)
                found.append(mi)
    if len(found)!=3:
        raise ValueError(f'Measure titles not uniquely found on question {question_index+1}: {found}')
    page.replace_contents(stream)


def overlay_page(draw):
    stream = io.BytesIO()
    c = canvas.Canvas(stream, pagesize=A4)
    draw(c)
    c.save()
    stream.seek(0)
    return PdfReader(stream).pages[0]


def update():
    TMP.mkdir(parents=True, exist_ok=True)
    assert tuple(row[0] for row in MEASURES if row[3]) == PRIORITY_CODES
    assert len(MEASURES)-len(PRIORITY_CODES) == 11
    reader = PdfReader(PDF)
    already=reader.metadata.get('/FLOWMeasurementEdition')==EDITION
    if len(reader.pages)==15 and not already:
        original=reader.pages
        questions=list(original[4:10])
        local=original[1]
        market=list(original[10:13])
        pilot=original[13]
        sources=original[14]
        crossrefs={2:13,10:12,12:17,13:18}
    elif len(reader.pages)==19 and reader.metadata.get('/FLOWMeasurementEdition')==PREVIOUS_EDITION:
        original=reader.pages
        questions=list(original[5:11])
        local=original[11]
        market=list(original[14:17])
        pilot=original[17]
        sources=original[18]
        crossrefs={11:12,12:13,16:17,17:18}
    elif len(reader.pages)==20 and already:
        original=reader.pages
        questions=list(original[6:12])
        local=original[12]
        market=list(original[15:18])
        pilot=original[18]
        sources=original[19]
        crossrefs={}
    else:
        raise ValueError('Expected the 15-page dossier, the 19-page guide, or this 20-page edition.')
    case = make_case()
    front,links=make_front()
    writer = PdfWriter()
    for page in front.pages:
        writer.add_page(page)
    for qi,old in enumerate(questions):
        page=writer.add_page(old)
        strip_text_blocks(page,writer,is_footer)
        if crossrefs:
            replace_crossrefs(page,writer,crossrefs)
        add_measure_codes(page,writer,qi)
        clarify_question_vocabulary(page,writer,qi)
        mark_question_priority(page,writer,qi,links)
    page=writer.add_page(local)
    strip_text_blocks(page,writer,is_footer)
    for page in case.pages:
        writer.add_page(page)
    for old in market[:1]:
        page = writer.add_page(old)
        strip_text_blocks(page, writer, is_footer)
        if crossrefs:
            replace_crossrefs(page, writer,crossrefs)
    market_cases,market_links=make_market_cases()
    for page in market_cases.pages:
        writer.add_page(page)
    links.extend(market_links)
    writer.add_page(make_pilot().pages[0])
    page = writer.add_page(sources)
    strip_text_blocks(page,writer,is_footer)
    if crossrefs:
        replace_crossrefs(page,writer,crossrefs)
    total = len(writer.pages)
    sections = [
        'Dossier de pilotage','Sommaire','KPI, OKR et décisions','Indicateurs / 1','Indicateurs / 2',
        'Synthèse KPI, OKR et décisions',
        'Question 1 / service', 'Question 2 / promesses', 'Question 3 / coût', 'Question 4 / stock',
        'Question 5 / temps', 'Question 6 / retours', 'Un arbitrage complet','Offshore et nearshore','Indicateurs et décisions',
        'Les fonctions du marché', 'Étude de marché / 1',
        'Étude de marché / 2', 'La preuve de valeur', 'Sources et conventions',
    ]
    for n, page in enumerate(writer.pages):
        page.merge_page(overlay_page(lambda c, n=n: footer(c, n+1, total, sections[n])))
    for src,rect,dst in links:
        annotation=writer.add_annotation(src,Link(rect=rect,target_page_index=dst))
        # Explicit local destinations must reference the actual page object.
        # This pypdf version initially serializes a numeric page index.
        annotation['/Dest'][0]=writer.pages[dst].indirect_reference
    last = writer.pages[-1]
    strip_text_blocks(last,writer,lambda b: '[1] ASCM' in text_of(b))
    source_gloss=('<b><font color="#236159">[1] ASCM - SCOR, performance</font></b><br/>'
                  '<font size="8">ASCM : association de la chaîne d’approvisionnement.<br/>'
                  'SCOR : référentiel des processus et de leur performance.</font>')
    def draw_source_gloss(c):
        s=ParagraphStyle('source_gloss',parent=styles['source'],leading=10.6)
        p=Paragraph(source_gloss,s)
        _,height=p.wrap(246.6378,H)
        assert height<34.2,'Source 1 glossary must fit before source 2'
        p.drawOn(c,M,573.7-height)
    last.merge_page(overlay_page(draw_source_gloss))
    strip_text_blocks(last, writer, lambda b: '[20]' in text_of(b) or '[21]' in text_of(b))
    if '/Annots' in last:
        last['/Annots'][:] = [a for a in last['/Annots'] if a.get_object().get('/A',{}).get('/URI') not in (ACADEMIC,OKR_SOURCE)]
    source = (f'<link href="{ACADEMIC}" color="#236159"><b>[20] Allon &amp; Van Mieghem - Global Dual Sourcing</b></link><br/>'
              'Management Science, 2010 : socle offshore et complément réactif. Référence théorique ; aucun gain du cas FLOW n’en est tiré.')
    last.merge_page(overlay_page(lambda c: para(c, source, 308.6378, 265, width=246.6378, style='source')))
    okr_source=(f'<link href="{OKR_SOURCE}" color="#236159"><b>[21] Microsoft - Écrire des OKR efficaces</b></link><br/>'
                'Objectifs, résultats mesurables et initiatives : rôles distincts pour organiser le progrès.')
    last.merge_page(overlay_page(lambda c: para(c,okr_source,308.6378,194,width=246.6378,style='source')))
    outline = [
        ('Couverture',0),('Sommaire',1),('KPI, OKR et décisions',2),('KPI prioritaires et compléments / 1',3),('KPI prioritaires et compléments / 2',4),
        ('Sept KPI prioritaires : OKR et décisions FLOW',5),
        ('1. Le service est-il tenu ?',6),('2. Quelles promesses sont menacées ?',7),('3. Combien coûte le service rendu ?',8),
        ('4. Stock financé et excédent',9),('5. Où le temps s’accumule-t-il ?',10),('6. Valeur des retours et excédents',11),
        ('Un arbitrage ATP, CTP et PTP',12),('Offshore et nearshore : le cas chiffré',13),
        ('Offshore et nearshore : indicateurs et décisions',14),('Les fonctions du marché',15),
        ('Cas par KPI : service, risque, coût et transferts',16),('Cas par KPI : stock, délais et valeur récupérée',17),
        ('Le pilote FLOW : vérifier les sept KPI prioritaires',18),('Sources',19),
    ]
    for title, page in outline:
        writer.add_outline_item(title,page)
    writer.add_metadata({'/Title':'FLOW - Piloter la supply chain : indicateurs, OKR et décisions',
                         '/Author':'FLOW / Atlas', '/Subject':'Sept KPI prioritaires, onze fiches complémentaires, six questions de pilotage SCM',
                         '/FLOWCaseVersion':VERSION,'/FLOWMeasurementEdition':EDITION})
    candidate = TMP / 'FLOW-scm-candidate.pdf'
    with candidate.open('wb') as f:
        writer.write(f)
    check = PdfReader(candidate)
    assert len(check.pages) == 20
    assert len(check.outline) == 20
    uris=[]
    internal=0
    for p in check.pages:
        for a in p.get('/Annots',[]):
            a=a.get_object()
            if '/URI' in a.get('/A',{}):
                uris.append(str(a['/A']['/URI']))
            elif '/Dest' in a:
                assert hasattr(a['/Dest'][0],'idnum'),'Internal destination must reference a page'
                internal+=1
    assert len(uris)==21,(len(uris),'external link count')
    assert internal==len(links),(internal,len(links),'internal links')
    for i,p in enumerate(check.pages):
        text = p.extract_text()
        assert text.count('Dossier de pilotage  /') == 1, (i+1, 'duplicate footer')
        assert 'Dossier d’aide à la décision' not in text, (i+1,'old footer')
        assert f'{i+1} / 20' in text, (i+1, 'bad pagination')
        assert not re.search(r'\|\s*\d+ / (13|15|19)\b', text), (i+1, 'old pagination')
    assert '19 050' in check.pages[13].extract_text()
    assert '92,5 %' in check.pages[13].extract_text()
    summary = check.pages[5].extract_text()
    assert '31 mars 2027' in summary and 'Exemples entièrement fictifs' in summary
    for code in PRIORITY_CODES:
        assert code+' / ' in summary
    market_text=' '.join((check.pages[16].extract_text()+' '+check.pages[17].extract_text()).split())
    for code in PRIORITY_CODES:
        assert code+' / ' in market_text
    for company in ('Electrolux Professional','Veseris','Howdens','Europris','Prinsel','Tuckernuck','JBS','JD.com'):
        assert company in market_text
    assert 'non chiffrées' in market_text and 'Aucune valeur nette récupérée' in market_text
    catalogue='\n'.join(check.pages[i].extract_text() for i in (3,4))
    assert catalogue.count('KPI PRIORITAIRE') == 7
    assert catalogue.count('COMPLÉMENT') == 11
    for page in check.pages:
        normalized=' '.join(page.extract_text().lower().split())
        assert not any(s in normalized for s in ('six repères','douze compléments','point d’entrée')),normalized
    for qi in range(6):
        t=check.pages[6+qi].extract_text()
        assert t.count('KPI PRIORITAIRE') == 1
        assert t.count('Cas d’entreprises : page') == 1
        for mi in range(qi*3,qi*3+3):
            assert f'M{mi+1:02d} / ' in t
    candidate.replace(PDF)
    print(f'Updated {PDF.name}: 20 pages, 21 external links, {internal} internal links, 20 bookmarks.')


if __name__ == '__main__':
    import sys
    from flow_scm_redesign import rebuild
    rebuild(sys.modules[__name__])
