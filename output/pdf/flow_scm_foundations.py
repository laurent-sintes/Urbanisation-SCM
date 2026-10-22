"""Flow, Lean and optimization chapters of the FLOW SCM dossier."""
from reportlab.lib import colors


def make_additions(layout):
    for name in ('start','finish','heading','para','banner','rect','chip','W','H','M','CW',
                 'GREEN','MINT','PAPER','INK','MUTED','LINE','PEACH'):
        globals()[name] = layout[name]
    return plumbing(), lean(), packaging(), impacts(), sources()


def plumbing():
    s,c=start()
    y=heading(c,'COMPRENDRE / LA PLOMBERIE DES FLUX','Piloter un réseau de flux',
              'Des produits circulent, attendent et changent de destination ; l’information permet de décider où, quand et combien.')
    y=para(c,'<b>Bartholdi et Hackman, chercheurs à Georgia Tech</b>, comparent les flux à des conduites et réservoirs. '
           'Ils rappellent que les produits circulent par grains : palettes, cartons, pièces. '
           'Les six leviers ci-dessous adaptent cette image à FLOW ; ils ne constituent pas une méthode normalisée. [22]',M,y,style='small')-12
    top=y;w=110;gap=(CW-4*w)/3
    labels=['Approvisionner','Stocker','Préparer / livrer','Servir le client']
    for i,label in enumerate(labels):
        x=M+i*(w+gap)
        rect(c,x,top,w,36,MINT if i==1 else PAPER,LINE,r=8)
        para(c,f'<b>{label}</b>',x+8,top-11,w-16,'tiny')
        if i<3:
            c.setStrokeColor(GREEN);c.setLineWidth(1.2)
            c.line(x+w+2,top-18,x+w+gap-3,top-18)
            c.line(x+w+gap-7,top-21,x+w+gap-3,top-18)
            c.line(x+w+gap-7,top-15,x+w+gap-3,top-18)
    c.setStrokeColor(GREEN);c.setLineWidth(.9)
    c.line(W-M-w/2,top-39,W-M-w/2,top-50)
    c.line(W-M-w/2,top-50,M+w+gap+w/2,top-50)
    c.line(M+w+gap+w/2,top-50,M+w+gap+w/2,top-40)
    para(c,'Retours → contrôle, remise en état, réemploi ou déstockage',M+10,top-58,CW-20,'tiny')
    y=top-83
    rows=[
        ('Fiabiliser l’information',
         'Rendre les événements corrects, disponibles et utilisés à temps. Une réception tardivement connue peut fausser la promesse. [31, 35]'),
        ('Régler le débit',
         'Repérer l’étape qui limite les sorties ; ajuster lancements, capacité ou parcours selon les attentes et les engagements.'),
        ('Ouvrir une dérivation',
         'Réallouer du stock protégé après examen des autres demandes. Le droit d’usage peut changer sans déplacement physique.'),
        ('Adapter les lots et lever les blocages',
         'Comparer regroupement, fractionnement et autre source. Un lot trop grand et une ligne manquante demandent des réponses différentes.'),
        ('Lisser les flux',
         'Prévenir les engorgements en réglant lots, seuils et calendriers selon la capacité. Les seuils d’entrepôt ne suffisent pas. [36]'),
        ('Préparer la fin de saison',
         'Réduire les entrées modifiables, réaffecter ou déstocker ; conserver le reliquat nécessaire aux engagements et au SAV.'),
    ]
    for title,action in rows:
        top=y
        title_bottom=para(c,title,M,top,135,'head')
        body_bottom=para(c,action,M+150,top,CW-150,'small')
        y=min(title_bottom,body_bottom)-9
        c.setStrokeColor(LINE);c.line(M,y+3,W-M,y+3)
    y=para(c,'Décider à temps : trois délais distincts [34]',M,y-3,style='head')-5
    y=para(c,'<b>Information :</b> événement → signal exploitable. <b>Décision :</b> signal → choix autorisé. '
           '<b>Exécution :</b> choix → action réalisée. Le capteur peut alerter alors que l’on attend encore de décider quelle vanne ouvrir. '
           'Données et calculs : question 5, page 12.',M,y,style='small')-9
    y=para(c,'<b>Limite de l’image.</b> Un gros lot peut être économique. Chez les auteurs, une conduite plus large peut représenter '
           'davantage d’encours (quantités présentes) à débit égal ; le schéma n’encode aucune capacité par sa largeur.',M,y,style='tiny')
    if y<58:raise ValueError(('Plumbing overflow',y))
    c.showPage();return finish(s,c)


def lean():
    s,c=start()
    y=heading(c,'COMPRENDRE / LEAN ET OPTIMISATION','Du diagnostic à la décision',
              'La cartographie révèle où le flux se dégrade. Le calcul compare les actions possibles. Les KPI vérifient le résultat.')
    y=para(c,'Le <b>Lean</b> vise à améliorer le service rendu en réduisant attentes, mouvements et autres gaspillages. '
           'La <b>Value Stream Mapping (VSM), ou cartographie des flux de valeur</b>, décrit ensemble produits et informations, '
           'puis un fonctionnement cible. Hines et Rich étudient ces outils pour les chaînes d’approvisionnement ; '
           'Jones et Womack étendent la lecture entre fournisseurs, entreprises et clients. [23-25]',M,y,style='small')-15
    y=banner(c,'Pour FLOW : suivre l’engagement sur tout son parcours',
             'Comparer temps de traitement, attente et mouvements depuis l’achat jusqu’au service client. '
             'Appliquer aussi cette lecture aux parcours SAV, retours et déstockage. Cette extension est une proposition pour FLOW ; '
             'la VSM ne calcule pas, à elle seule, une promesse CTP.',y,MINT)
    y=para(c,'Un repère quantitatif : la loi de Little [26]',M,y,style='head')-6
    y=para(c,'<b>Encours moyen = débit moyen × temps moyen de traversée.</b><br/>'
           'Exemple illustratif : 2 500 pièces présentes en moyenne et 500 pièces sorties par jour correspondent à <b>5 jours</b> de traversée. '
           'À débit inchangé, 3 jours correspondent à 1 500 pièces. Il faut ensuite trouver comment réduire les attentes.',M,y,style='small')-5
    y=para(c,'Même population, mêmes bornes et moyennes cohérentes sur un régime stable. Une photographie du stock ou un délai '
           'qui exclut les dossiers ouverts ne suffit pas. La relation ne prouve pas qu’une baisse forcée du stock maintiendra le débit.',M,y,style='tiny')-18
    y=para(c,'Quatre façons de comparer les options',M,y,style='head')-10
    cards=[
        ('Parcours et affectations [27]','Répartir les quantités entre sources, sites et clients selon coûts, disponibilités et capacités.'),
        ('Lots et engagements [32, 40]','Adapter les regroupements et les quantités indivisibles selon coûts fixes, capacité et règles client. Cas des conditionnements : page 17.'),
        ('Attente et saturation [33]','Simuler les arrivées irrégulières pour voir leur effet sur le délai ; une capacité moyenne ne garantit pas une date.'),
        ('Demande incertaine [20, 28]','Comparer plusieurs niveaux de demande et de capacité pour dimensionner stock et combinaison offshore/nearshore.'),
    ]
    w=(CW-14)/2;top=y
    for i,(title,body) in enumerate(cards):
        x=M+(i%2)*(w+14);t=top-(i//2)*100
        rect(c,x,t,w,90,PAPER,LINE)
        para(c,title,x+11,t-10,w-22,'cardhead')
        para(c,body,x+11,t-31,w-22,'small')
    y=top-211
    y=para(c,'<b>La règle avant le calcul.</b> Définir l’objectif économique, les engagements et protections à respecter. '
           'Le CTP teste la faisabilité ; ses résultats peuvent éclairer les lots et conditionnements. '
           'La comparaison économique, dans la logique PTP, aide à choisir parmi les options. Un optimum dépend des hypothèses. [2-5, 37-40]',M,y,style='small')-10
    y=para(c,'<b>Mesurer sans déplacer le problème :</b> réduire les transferts avec OTIF et coût comme garde-fous ; '
           'fractionner une commande sans effacer sa promesse initiale. Les sept KPI et les six questions gardent ce rôle commun.',M,y,style='small')
    if y<58:raise ValueError(('Lean overflow',y))
    c.showPage();return finish(s,c)


def packaging():
    s,c=start()
    y=heading(c,'ILLUSTRATION / CONDITIONNEMENTS ET PROMESSE','Choisir le bon grain du flux',
              'Le CTP peut révéler l’effet d’un conditionnement sur la promesse. La comparaison des options éclaire le choix du lot.')
    y=para(c,'<b>Exemple fictif.</b> Un client demande exactement <b>18 pièces pour vendredi</b>. '
           'Stock et transport sont suffisants. Les trois scénarios diffèrent par le conditionnement et les opérations nécessaires. '
           'Un pack désigne ici un paquet de plusieurs pièces.',M,y,style='small')-15
    top=y
    para(c,'CONDITIONNEMENT',M+10,top-3,155,'tiny')
    para(c,'CONSÉQUENCE SUR LA PROMESSE',M+180,top-3,CW-190,'tiny')
    y-=25
    scenarios=[
        ('Cartons de 12\nnon ouvrables',
         '<b>18 pièces exactes impossibles.</b> Un carton fournit 12 pièces ; deux en fournissent 24. '
         'Livrer 24 demanderait un accord du client.',False),
        ('Cartons de 12\nouvrables',
         '<b>Reconditionnement disponible lundi.</b> Le stock permet de servir 18, mais l’opération nécessaire '
         'empêche la livraison du vendredi.',False),
        ('Packs de 6\ndéjà disponibles',
         '<b>3 packs = 18 pièces.</b> Si le client accepte ce conditionnement, la livraison du vendredi '
         'est réalisable sans reconditionnement.',True),
    ]
    for title,body,highlight in scenarios:
        top=y
        if highlight:rect(c,M,top,CW,67,MINT,r=8)
        a=para(c,title.replace('\n','<br/>'),M+10,top-10,153,'head')
        b=para(c,body,M+180,top-10,CW-190,'small')
        y=min(top-67,a-10,b-10)-6
        if not highlight:
            c.setStrokeColor(LINE);c.line(M,y+3,W-M,y+3)
    y-=6
    y=para(c,'Ce que FLOW doit comparer',M,y,style='head')-5
    y=para(c,'<b>Le CTP teste quantités et dates réalisables</b> si les contraintes de conditionnement et de ressources sont représentées. '
           'Comparer ensuite le coût des emballages, de la manutention et du transport, les reliquats et les retards évités. '
           'Des packs plus petits ne sont pas toujours plus économiques. [37-40]',M,y,style='small')-12
    y=para(c,'<b>Données nécessaires :</b> pièces par pack et composition des assortiments de tailles ; unités et conversions ; '
           'droit d’ouvrir les colis ; opérations, temps, coûts et créneaux de reconditionnement ; règles client et engagements.',M,y,style='small')-12
    y=para(c,'Deux horizons de décision',M,y,style='head')-5
    y=para(c,'<b>Aujourd’hui :</b> choisir parmi les conditionnements et opérations réellement disponibles.<br/>'
           '<b>Pour les prochains flux :</b> rejouer plusieurs demandes pour recommander un conditionnement par produit et canal. '
           'Ces résultats peuvent éclairer conception produit, achats et organisation logistique, selon leurs responsabilités.',M,y,style='small')-12
    y=para(c,'<b>Mesurer :</b> promesses réalisables, coût de service, attente et excédent ; isoler les manipulations dues au conditionnement. '
           'Un lot de fabrication, un colis et une quantité livrée peuvent différer. Les références documentent lots et faisabilité ; '
           'elles ne prouvent pas un CTP qui conçoit automatiquement l’emballage physique.',M,y,style='tiny')
    if y<58:raise ValueError(('Packaging overflow',y))
    c.showPage();return finish(s,c)


def impacts():
    s,c=start()
    y=heading(c,'CONCLUSION / IMPACTS SUR FLOW','Ce que l’étude précise pour FLOW',
              'Relier les règles de gestion, les ressources et les décisions à leurs effets mesurés, sur tous les flux.')
    y=banner(c,'Une cible confortée, des choix de réalisation à éprouver',
             'La plomberie aide à comprendre les flux ; le Lean révèle leurs attentes ; l’optimisation compare les actions sous contraintes. '
             'Ces lectures confortent la cible documentée dans Atlas : relier planification, engagements, décisions et exécution.',y,MINT)
    rows=[
        ('1 / Partager les faits utiles à temps','Rapprocher besoins, stock, apports attendus, capacités et exécution, avec provenance et incertitudes. '
         'Mesurer quand un événement devient exploitable. La fiabilité des données conditionne celle des sept KPI.'),
        ('2 / Ajuster les vannes','Réviser protections, priorités et affectations selon les délégations. Exemple : libérer une quantité protégée '
         'pour une commande urgente après examen des autres demandes. Suivre OTIF, commandes à risque et excédent projeté.'),
        ('3 / Construire une promesse réalisable','L’ATP évalue les disponibilités admissibles ; le CTP vérifie l’apport à obtenir ; '
         'le PTP compare les conséquences économiques. Les résultats du CTP peuvent aussi éclairer les tailles de lots et conditionnements. '
         'Quantité, date, coût et autorisation restent explicites.'),
        ('4 / Décider à temps, puis coordonner','Distinguer attente d’information, délai d’arbitrage et délai d’exécution. '
         'Exposer échéance, responsable et options réalisables. En wholesale, comparer site préparateur et placement du stock ; '
         'suivre transferts, délai et coût de service.'),
        ('5 / Récupérer la valeur','Orienter les retours vers remise en stock, réparation, reconditionnement ou retour fournisseur. '
         'Coordonner le déstockage selon les décisions commerciales autorisées. Suivre excédent et valeur nette récupérée ; '
         'prix et remboursements gardent leurs responsables.'),
    ]
    for title,body in rows:
        y=para(c,title,M,y,style='head')-4
        y=para(c,body,M,y,style='small')-12
    y=para(c,'Un apport déjà intégré au modèle publié',M,y,style='head')-5
    y=para(c,'Le cas offshore/nearshore a précisé la préparation possible du socle dès Design &amp; Development, '
           'le recours au CTP et la décision d’appoint possible dans la SCM selon délégation, suivie d’une commande traçable. '
           'La planification appartient au même ensemble métier, même si plusieurs outils y contribuent.',M,y,style='small')-12
    y=para(c,'Ce que le projet doit maintenant démontrer',M,y,style='head')-5
    y=para(c,'Les sept KPI et les six questions restent le cadre de mesure. La réduction des délais de décision et la recommandation '
           'de conditionnements sont des propositions à éprouver : fixer données, délégations, critères et moteur, puis mesurer les effets. '
           'La cible publiée ne prouve ni installation actuelle ni gain garanti.',M,y,style='small')-8
    y=para(c,'Appui interne : cible Atlas v087 du 21 octobre 2026 ; précisions offshore/nearshore publiées. '
           'Appuis méthodologiques et fonctionnels : [22-28, 32-40]. Les priorités de réalisation restent à cadrer.',M,y,style='tiny')
    if y<58:raise ValueError(('Impacts overflow',y))
    c.showPage();return finish(s,c)


REFERENCES=[
    (22,'Bartholdi &amp; Hackman — Warehouse &amp; Distribution Science',
     '2019, v0.98.1, chap. 2, p.11–12 : modèle fluide et limites liées aux unités distinctes.',
     'https://www2.isye.gatech.edu/~jjb/wh/book/editions/wh-sci-0.98.1.pdf'),
    (23,'Lean Enterprise Institute — Value Stream Mapping',
     'Définition : flux de matières et d’information, état actuel et état futur.',
     'https://www.lean.org/lexicon-terms/value-stream-mapping/'),
    (24,'Hines &amp; Rich — The seven value stream mapping tools',
     '1997 : cartographie des chaînes et gaspillages. Résumé éditeur consulté ; texte intégral non consulté.',
     'https://doi.org/10.1108/01443579710157989'),
    (25,'Jones &amp; Womack — Seeing the Whole Value Stream',
     '2e édition, 2011. Annonce et extraits LEI consultés, dont l’avant-propos de John Shook ; pas le livre intégral.',
     'https://www.lean.org/about-lei/press-releases/lean-enterprise-institute-publishes-2nd-edition-of-seeing-the-whole-value-stream-with-new-examples-of-lean-supply-chain-analysis/'),
    (26,'Little &amp; Graves — Little’s Law',
     '2008 : relation entre moyennes d’encours, débit et temps ; conditions d’emploi.',
     'https://web.eng.ucsd.edu/~massimo/ECE158A/Handouts_files/Little.pdf'),
    (27,'Google OR-Tools — Minimum Cost Flows',
     'Réseaux de flux, capacités et coûts. Documentation d’un outil, sans preuve de gain FLOW.',
     'https://developers.google.com/optimization/flow/mincostflow'),
    (28,'Bertsimas &amp; Thiele — Optimisation robuste',
     'Recherche MIT : décisions de stock et de supply chain sous incertitude.',
     'https://dspace.mit.edu/entities/publication/079b92e1-0abf-4f38-b81a-e8b8b421b3ff'),
    (29,'Gartner — Cost-to-Serve',
     '22 avril 2025 : lecture des coûts par produit et client. Le périmètre du dossier inclut l’achat et reste explicite.',
     'https://www.gartner.com/en/newsroom/2025-04-22-gartner-says-supply-chain-leaders-should-implement-a-cost-to-serve-model-to-better-assess-customer-and-product-profitability'),
    (30,'TPA / McKinsey — Defining on-time, in-full',
     '2019 : écarts de conventions OTIF selon maille, date et fenêtre. Ne prouve pas une formule universelle.',
     'https://www.mckinsey.com/capabilities/operations/our-insights/defining-on-time-in-full-in-the-consumer-sector'),
    (31,'GS1 — Données de visibilité EPCIS',
     '30 mai 2025 : partage d’événements. EPCIS : Electronic Product Code Information Services. La qualité reste à vérifier.',
     'https://support.gs1.org/support/solutions/articles/43000755325-what-is-electronic-product-code-information-services-epcis-'),
    (32,'Google OR-Tools — Integer Optimization',
     'Décisions entières ou indivisibles ; appui technique pour lots et choix de parcours.',
     'https://developers.google.com/optimization/mip'),
    (33,'Charles R. Standridge — How Factory Physics Helps Simulation',
     '2004 : variabilité, attente et simulation des opérations. Ne fournit pas de gain spécifique pour FLOW.',
     'https://www.informs-sim.org/wsc04papers/141.pdf'),
    (34,'NC State — Visibilité et vitesse de décision',
     '29 juillet 2017 : attentes d’approbation et réactions tardives décrites comme des frictions. Article autour des travaux de Handfield et Linton.',
     'https://scm.ncsu.edu/scm-articles/article/managerial-practice-will-need-to-catch-up-with-the-emergence-of-real-time-supply-chains'),
    (35,'Lean Enterprise Institute — Information Flow',
     'Information qui oriente les opérations et simplification de ses circuits. N’emploie pas « fuites » pour ces défauts.',
     'https://www.lean.org/lexicon-terms/information-flow/'),
    (36,'Lean Enterprise Institute — Heijunka',
     'Lissage des quantités et des types de produits. Petits lots, changements de série et stock tampon : des choix à articuler.',
     'https://www.lean.org/lexicon-terms/heijunka/'),
    (37,'Microsoft Dynamics 365 — Calcul des dates par CTP',
     'Matières, capacités et délais pour une date réalisable. Le calcul ne prescrit pas un conditionnement optimal.',
     'https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/calculate-delivery-dates-using-ctp'),
    (38,'Microsoft Dynamics 365 — Unités et conditionnements',
     'Hiérarchie pièce, carton, palette et conversions ; distinction explicite avec les quantités paramétrées pour les commandes.',
     'https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/unit-measure-stocking-policies'),
    (39,'SAP S/4HANA — Planification et confirmation CTP',
     'Distingue optimisation des lots sous contraintes de capacité et confirmation selon production et ordonnancement.',
     'https://learning.sap.com/courses/planning-with-advanced-planning-methods-in-eppds/explaining-supply-chain-planning'),
    (40,'SAP S/4HANA — Optimisation discrète',
     'Lots entiers ou minimums de production et transport, consommations fixes de ressources et de matières.',
     'https://learning.sap.com/courses/planning-with-advanced-planning-methods-in-eppds/understanding-cost-based-discrete-mixed-integer-optimization'),
]


def sources():
    s,c=start()
    for page,entries in enumerate((REFERENCES[:12],REFERENCES[12:])):
        title='Plomberie, Lean et optimisation' if page==0 else 'Décision, lots et conditionnements'
        y=heading(c,'POUR VÉRIFIER ET APPROFONDIR / SUITE',title,
                  'Sources consultées le 22 octobre 2026. Titres cliquables. Les références [1] à [21] figurent page 25.')
        intro=('Les références étayent des concepts, des méthodes ou des intitulés. Leur application à FLOW, '
               'les exemples chiffrés et le cadre de pilotage sont des propositions à éprouver. '
               'Les six leviers de plomberie sont une adaptation pédagogique.' if page==0 else
               'Ces appuis précisent la circulation de l’information, le délai de décision et les contraintes de lots. '
               'Ils ne prouvent ni une réalisation installée chez Beaumanoir, ni une fonction CTP qui conçoit automatiquement l’emballage physique.')
        y=para(c,intro,M,y,style='small')-20
        top=y;w=(CW-22)/2;split=(len(entries)+1)//2
        for i,(n,title,body,url) in enumerate(entries):
            if i==split:y=top
            x=M+(w+22 if i>=split else 0)
            y=para(c,f'<link href="{url}" color="#236159"><b>[{n}] {title}</b></link>',x,y,w,'source')-5
            y=para(c,body,x,y,w,'tiny')-17
            if y<75:raise ValueError(('Sources overflow',n,y))
        c.showPage()
    return finish(s,c)
