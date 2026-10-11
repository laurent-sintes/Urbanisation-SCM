"""Build the Boardriders ARun synthesis from the reviewed July 2025 slides."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "boardriders-allocation-run-synthese.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))
pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold")

NAVY = colors.HexColor("#18304B")
BLUE = colors.HexColor("#276998")
PALE = colors.HexColor("#EAF2F7")
GOLD = colors.HexColor("#C78C32")
INK = colors.HexColor("#203044")
MUTED = colors.HexColor("#526579")

styles = {
    "eyebrow": ParagraphStyle("eyebrow", fontName="Arial-Bold", fontSize=8.5, leading=12, textColor=BLUE, spaceAfter=7),
    "title": ParagraphStyle("title", fontName="Arial-Bold", fontSize=22, leading=26, textColor=NAVY, spaceAfter=10),
    "subtitle": ParagraphStyle("subtitle", fontName="Arial", fontSize=10.4, leading=15, textColor=MUTED, spaceAfter=15),
    "h1": ParagraphStyle("h1", fontName="Arial-Bold", fontSize=14, leading=19, textColor=NAVY, spaceBefore=9, spaceAfter=7),
    "h2": ParagraphStyle("h2", fontName="Arial-Bold", fontSize=10.8, leading=15, textColor=BLUE, spaceBefore=10, spaceAfter=5),
    "body": ParagraphStyle("body", fontName="Arial", fontSize=9.2, leading=13.2, textColor=INK, spaceAfter=7, allowWidows=0, allowOrphans=0),
    "small": ParagraphStyle("small", fontName="Arial", fontSize=8.1, leading=11.2, textColor=MUTED, spaceAfter=5),
    "callout": ParagraphStyle("callout", fontName="Arial-Bold", fontSize=10.2, leading=15, textColor=NAVY, spaceAfter=0),
    "cell": ParagraphStyle("cell", fontName="Arial", fontSize=8.25, leading=11.4, textColor=INK, spaceAfter=0),
    "cellhead": ParagraphStyle("cellhead", fontName="Arial-Bold", fontSize=8.3, leading=11.6, textColor=NAVY, spaceAfter=0),
    "bullet": ParagraphStyle("bullet", fontName="Arial", fontSize=9.1, leading=13, textColor=INK, leftIndent=12, firstLineIndent=-9, spaceAfter=5),
}


def p(text, style="body"):
    return Paragraph(text, styles[style])


def bullet(text):
    return p("&#8226; " + text, "bullet")


def box(text):
    t = Table([[p(text, "callout")]], colWidths=[170 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("LINEBEFORE", (0, 0), (0, -1), 3, GOLD),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return t


def footer(canvas, doc):
    canvas.saveState()
    w, _ = A4
    canvas.setStrokeColor(colors.HexColor("#D6E1E9"))
    canvas.line(20 * mm, 17 * mm, w - 20 * mm, 17 * mm)
    canvas.setFont("Arial", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 12 * mm, "FLOW  |  Synthèse de source Boardriders  |  10 octobre 2026")
    canvas.drawRightString(w - 20 * mm, 12 * mm, f"{doc.page}")
    canvas.restoreState()


doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=20 * mm, bottomMargin=24 * mm)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
doc.addPageTemplates(PageTemplate(id="main", frames=frame, onPage=footer))

story = []

# 1. Functional synthesis
story += [
    p("SOURCE BOARDRIDERS  /  JUILLET 2025", "eyebrow"),
    p("Allocation Run : affecter les ressources aux commandes Wholesale", "title"),
    p("Synthèse du support « Allocation Run Process Flow and 2022 EMEA Early Allocation Set Up Review », 73 slides, présenté les 23 et 24 juillet 2025. EMEA signifie Europe, Moyen-Orient et Afrique.", "subtitle"),
    box("Le sujet C08 est la répartition du stock physique et des réceptions attendues entre des demandes concurrentes avant affermissement de la promesse client. Il ne se réduit pas à protéger un quota de stock par canal."),
    Spacer(1, 8 * mm),
    p("Ce que fait le processus décrit", "h1"),
    bullet("<b>Sélectionner les demandes.</b> Commandes de vente et contrats admissibles ; filtres par canal, type de commande, saison, blocage et date d'annulation. Les commandes Rush et certaines consignations ont des traitements immédiats distincts. <font color='#526579'>(slides 5, 7-12)</font>"),
    bullet("<b>Sélectionner les ressources.</b> Le run ordinaire prend le stock physique ; l'Early Allocation ajoute commandes d'achat et avis d'expédition. Les ordres de production ne sont pas pris en compte dans l'exécution Boardriders décrite. <font color='#526579'>(slides 14-15)</font>"),
    bullet("<b>Prioriser et relier.</b> Les demandes sont ordonnées par groupes de clients, priorité de livraison et ancienneté. Les ressources sont ordonnées par type et par fenêtre de date ; chaque lien tient compte des dates, magasins et catégories compatibles. <font color='#526579'>(slides 17, 19, 21-25)</font>"),
    bullet("<b>Libérer selon les règles.</b> Le statut <b>R</b> désigne une quantité réservée sur stock physique ou futur ; <b>F</b>, une quantité fixée sur stock physique, prête pour l'étape de livraison. La réception peut faire évoluer R vers F. <font color='#526579'>(slides 27-29)</font>"),
    p("Pegging, réservation et promesse", "h2"),
    p("Le lien entre une ligne de demande et un lot, une commande d'achat ou un avis d'expédition est comparable à un <b>pegging</b>. Dans FLOW, <b>Supply Assignment</b> décide du lien ; la réservation empêche un usage concurrent. Ni R ni F ne documentent à eux seuls ce qui a été promis au client. Cette dernière correspondance doit être vérifiée sur les parcours Wholesale."),
    p("La redistribution n'est pas automatique à chaque run", "h2"),
    p("Le support indique que les réservations existantes sur réceptions futures restent généralement liées aux mêmes ressources et que les quantités F ne sont pas réaffectées par le run suivant. Un changement de commande ou de ressource peut désallouer une quantité ; un nouveau run ou l'Optimizer peut ensuite l'affecter ailleurs. Les règles de désallocation conservent ou suppriment d'abord le lien existant : elles ne le remplacent pas immédiatement. <font color='#526579'>(slides 27, 40, 61-62, 68)</font>"),
    PageBreak(),
]

# 2. Standard vs local tailoring
story += [
    p("ÉCART AU STANDARD  /  ÉTAT DU SUPPORT", "eyebrow"),
    p("Fonctions SAP et choix Boardriders", "title"),
    p("« Spécifique » désigne ici ce qui est propre au fonctionnement Boardriders ; il ne signifie pas systématiquement développement logiciel. La comparaison SAP est indicative tant que la version AFS/ECC installée n'est pas inventoriée.", "subtitle"),
]

rows = [
    [p("Catégorie", "cellhead"), p("Constat étayé", "cellhead"), p("Conséquence pour FLOW", "cellhead")],
    [p("Fonctions SAP documentées", "cellhead"), p("ARun sait sélectionner, trier et affecter des commandes au stock physique et aux réceptions futures, appliquer des règles de libération, simuler et traiter des désallocations. Son workbench permet des corrections ciblées. [S1-S3]", "cell"), p("Ces mécanismes donnent des exemples de solution, sans imposer une copie d'ARun ni établir la couverture d'un Core System cible.", "cell")],
    [p("Paramétrage Boardriders", "cellhead"), p("Groupes de clients et rangs de priorité ; ensembles et séquences de jobs par canal ; fenêtres de stock et de livraison ; règles de libération, de sécurité et de désallocation. <font color='#526579'>(slides 8-10, 17, 24-25, 33-37, 40-60)</font>", "cell"), p("C'est la majeure partie de la complexité fonctionnelle observée. Relever la configuration active, les volumes et les exceptions avant de chiffrer une reprise.", "cell")],
    [p("Adaptations locales repérables", "cellhead"), p("Remplissage automatique du magasin, transaction Z pour certains flux MTO/PTO, types et jobs Z, rapports Z et ajustements BI. Le support ne fournit ni inventaire du code ni effort de maintenance. <font color='#526579'>(slides 14, 21, 30, 33, 63-64)</font>", "cell"), p("Distinguer configuration, développement et traitement manuel pour chaque écart ; ne pas qualifier tout le dispositif de « spécifique développé ».", "cell")],
]

table = Table(rows, colWidths=[34 * mm, 75 * mm, 61 * mm], repeatRows=1, hAlign="LEFT")
table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), PALE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LINEBELOW", (0, 0), (-1, 0), 1, BLUE),
    ("LINEBELOW", (0, 1), (-1, -1), 0.35, colors.HexColor("#D7E1EA")),
    ("LEFTPADDING", (0, 0), (-1, -1), 7),
    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ("TOPPADDING", (0, 0), (-1, -1), 8),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
]))
story += [table, Spacer(1, 8 * mm)]
story += [
    p("Évolutions encore ouvertes en juillet 2025", "h1"),
    bullet("<b>À étudier ou revoir :</b> moins d'ensembles à maintenir, règles de libération au niveau client, critères de priorité, usage plus large de l'Optimizer et questions de libération. <font color='#526579'>(slides 65-70)</font>"),
    bullet("<b>Projet explicitement requis :</b> le mode Preview, qui simule l'affectation sans modifier les vrais liens, nécessite selon le support un nouveau projet SAP/BI. <font color='#526579'>(slide 69)</font>"),
    bullet("<b>Écart technique signalé :</b> la désallocation pour certaines sorties de stock imprévues n'est pas activée ; un ajustement du traitement par IDoc est envisagé. <font color='#526579'>(slide 59)</font>"),
    box("« Ouvert en juillet 2025 » ne veut pas dire « jamais réalisé ». La version en production et les projets livrés depuis cette date doivent être contrôlés."),
    PageBreak(),
]

# 3. Complexity and evidence
story += [
    p("IMPACT SUR LE HOTSPOT C08", "eyebrow"),
    p("Complexité et vérifications utiles", "title"),
    p("L'estimation porte sur la reproduction d'une capacité métier dans FLOW, pas sur un remplacement technique un pour un de SAP.", "subtitle"),
    p("Estimation provisoire : L politique / XL implémentation / XL gravité", "h1"),
    p("Le <b>L politique</b> reflète l'arbitrage des priorités entre demandes et la définition de ce qui reste réaffectable avant promesse ferme. Le <b>XL d'implémentation</b> suppose que FLOW reprenne les règles EMEA utiles, les exceptions et les évolutions jugées prioritaires. Le support révèle une combinaison dense de sélections, tris, fenêtres, statuts, désallocations et jobs. Il ne chiffre ni le coût de reprise ni les volumes. La confiance reste faible."),
    box("Si le périmètre cible retient seulement les mécanismes standards et quelques règles vérifiées, l'implémentation pourrait être L. La gravité resterait XL avec la matrice Atlas actuelle (L/L → XL)."),
    Spacer(1, 6 * mm),
    p("Questions qui changent réellement la taille", "h1"),
    bullet("Quelles règles, ensembles et jobs sont actifs aujourd'hui ? Quels développements Z et traitements BI sont indispensables, et lesquels peuvent être abandonnés ?"),
    bullet("Quel statut de commande et quelle communication client correspondent à R, à F et aux dates annoncées ? Quelles affectations peuvent être revues sans modifier une promesse ferme ?"),
    bullet("Quels volumes, temps de calcul, corrections manuelles et incidents de désallocation sont observés ? Les projets Preview, Optimizer et IDoc ont-ils été livrés depuis juillet 2025 ?"),
    p("Lecture architecturale", "h2"),
    p("La capacité <b>Supply Assignment</b> choisit les liens demande–ressource ; <b>Demand Prioritization</b> fournit l'ordre de couverture ; <b>Supply Reassignment</b> révise les liens autorisés ; <b>Order Promising</b> et <b>Sales Order</b> tiennent séparément la réponse et l'engagement client. C14 concerne le calcul collectif du carnet. Une fonction produit ARun ne devient pas à elle seule une capacité FLOW."),
    p("Sources et limites", "h2"),
    p("<b>[B]</b> Boardriders, « Allocation Run Process Flow and 2022 EMEA Early Allocation Set Up Review », juillet 2025, slides citées ci-dessus ; copie conservée dans le dossier d'audit C08. SHA-256 : 59FFAEFF55D5F6FCF922FA1E018176EBA25EFAEB40AE9820FCDAD681E302C97B.", "small"),
    p("<b>[S1]</b> <link href='https://help.sap.com/docs/SAP_ERP_SPV/f48e74ad3b3740bc8c9eaade394a3c1e/3d1df055aa2a6d55e10000000a4450e5.html' color='#276998'>SAP, Steps in Order Allocation Run</link>. <b>[S2]</b> <link href='https://help.sap.com/docs/SAP_FASHION_MANAGEMENT/3d09d3032a1649f4abf6eea0a8f3ed11/80bb1f5385142e47e10000000a44538d.html' color='#276998'>SAP, Changing Sales Orders</link>. <b>[S3]</b> <link href='https://help.sap.com/docs/SAP_ERP_SPV/f48e74ad3b3740bc8c9eaade394a3c1e/f01ef055aa2a6d55e10000000a4450e5.html' color='#276998'>SAP, Order Allocation Run Workbench</link>. Documentation primaire consultée le 10 octobre 2026 ; la version du produit Boardriders reste à confirmer.", "small"),
]

doc.build(story)
print(OUTPUT)
