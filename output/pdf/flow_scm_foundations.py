"""Flow, Lean and optimization chapters of the FLOW SCM dossier."""
from reportlab.lib import colors


def make_additions(layout):
    for name in ('start','finish','heading','para','banner','rect','chip','W','H','M','CW',
                 'GREEN','MINT','PAPER','INK','MUTED','LINE','PEACH'):
        globals()[name] = layout[name]
    return plumbing(), lean(), impacts(), sources()


def plumbing():
    s,c=start()
    y=heading(c,'COMPRENDRE / LA PLOMBERIE DES FLUX','Piloter un réseau de flux',
              'Des produits circulent, attendent et changent de destination ; l’information permet de décider où, quand et combien.')
    y=para(c,'Dans <i>Warehouse &amp; Distribution Science</i>, <b>John J. Bartholdi III et Steven T. Hackman, '
           'chercheurs à Georgia Tech</b>, décrivent les produits comme un flux traversant des conduites et des réservoirs. '
           'Cette analogie aide à voir les accumulations et les contraintes. Les six leviers ci-dessous sont notre adaptation pour FLOW. [22]',M,y,style='small')-16
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
    c.line(W-M-w/2,top-39,W-M-w/2,top-56)
    c.line(W-M-w/2,top-56,M+w+gap+w/2,top-56)
    c.line(M+w+gap+w/2,top-56,M+w+gap+w/2,top-40)
    para(c,'Retours → contrôle, remise en état, réemploi ou déstockage',M+10,top-67,CW-20,'tiny')
    y=top-97
    rows=[
        ('Éviter les fuites','Une réception ou une capacité modifiée arrive trop tard dans la décision.',
         'Rapprocher les événements et vérifier leur délai d’utilisation ; recalculer les promesses concernées. [31]'),
        ('Régler le débit','Les dossiers s’accumulent avant une étape limitante.',
         'Comparer charge, capacité et attente ; ajuster les lancements ou le parcours pour servir davantage à temps.'),
        ('Ouvrir une dérivation','Du stock est protégé pour un flux alors qu’un autre manque.',
         'Simuler une réallocation, puis l’autoriser selon son effet sur chaque groupe. Le droit d’usage peut changer sans déplacement physique.'),
        ('Casser les grumeaux','Une ligne manquante bloque un lot ou une commande entière.',
         'Séparer les lots ou livrer partiellement si le client l’accepte ; vérifier surcoût et promesse initiale.'),
        ('Prévenir les grumeaux','Seuils et tailles de lots provoquent des arrivées irrégulières.',
         'Revoir les seuils, lots et lancements selon consommation, délais et capacités ; mesurer stock et attente.'),
        ('Vidanger en fin de saison','Des entrées alimentent encore un stock sans débouché.',
         'Réduire les entrées modifiables, réaffecter ou déstocker ; conserver les quantités nécessaires aux engagements et au SAV.'),
    ]
    for title,problem,action in rows:
        top=y
        para(c,title,M,top,125,'head')
        y=para(c,f'{problem}<br/><b>Décision FLOW :</b> {action}',M+141,top,CW-141,'small')-10
        c.setStrokeColor(LINE);c.line(M,y+3,W-M,y+3)
    y=para(c,'<b>Limite de l’image.</b> Les produits circulent par unités et par lots. Chez les auteurs, une conduite plus large '
           'peut représenter davantage d’encours (quantités présentes dans le périmètre) à débit égal. Le schéma n’encode aucune capacité par sa largeur. '
           'Il ne s’agit pas d’une méthode normalisée en six étapes.',M,y-4,style='tiny')
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
        ('Lots et engagements [32]','Choisir des quantités indivisibles, un site ou un fractionnement en tenant compte des coûts fixes et des règles client.'),
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
           'Le CTP vérifie la faisabilité d’un apport à obtenir ; le PTP compare les conséquences économiques des options. '
           'Un optimum dépend du modèle et des hypothèses, et ne découle pas du seul sigle CTP. [2-5]',M,y,style='small')-10
    y=para(c,'<b>Mesurer sans déplacer le problème :</b> réduire les transferts avec OTIF et coût comme garde-fous ; '
           'fractionner une commande sans effacer sa promesse initiale. Les sept KPI et les six questions gardent ce rôle commun.',M,y,style='small')
    if y<58:raise ValueError(('Lean overflow',y))
    c.showPage();return finish(s,c)


def impacts():
    s,c=start()
    y=heading(c,'CONCLUSION / IMPACTS SUR FLOW','Ce que l’étude précise pour FLOW',
              'Relier les règles de gestion, les ressources et les décisions à leurs effets mesurés, sur tous les flux.')
    y=banner(c,'Une cible confortée, des choix de réalisation à éprouver',
             'La plomberie aide à comprendre les flux ; le Lean révèle leurs attentes ; l’optimisation compare les actions sous contraintes. '
             'Ces lectures confortent la cible documentée dans Atlas : relier planification, engagements, décisions et exécution.',y,MINT)
    rows=[
        ('1 / Partager les faits','Rapprocher besoins, stock, apports attendus, capacités et exécution, avec provenance et incertitudes. '
         'Une commande à risque doit conduire à une cause et une action possibles. La fiabilité des données conditionne celle des sept KPI.'),
        ('2 / Ajuster les vannes','Réviser protections, priorités et affectations selon les délégations. Exemple : libérer une quantité protégée '
         'pour une commande urgente après examen des autres demandes. Suivre OTIF, commandes à risque et excédent projeté.'),
        ('3 / Construire une promesse réalisable','L’ATP évalue les disponibilités admissibles ; le CTP vérifie l’apport à obtenir ; '
         'le PTP compare ses conséquences économiques. Expliciter quantité, date, conditions et coût avant engagement ; '
         'une option faisable doit encore être autorisée.'),
        ('4 / Réduire attentes et mouvements','Comparer affectations et scénarios de plan, puis coordonner l’exécution et ses adaptations. '
         'En wholesale, examiner placement du stock et site préparateur. Suivre transferts, délai commande-livraison et coût de service.'),
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
    y=para(c,'Les sept KPI et les six questions forment le cadre de mesure proposé. Le pilote doit fixer données, responsabilités, '
           'règles d’arbitrage, objectif économique et moteur de calcul, puis mesurer les effets réels. '
           'La cible publiée ne prouve ni installation actuelle ni gain garanti.',M,y,style='small')-8
    y=para(c,'Appui interne : cible Atlas v087 du 21 octobre 2026 ; précisions offshore/nearshore publiées. '
           'Appuis méthodologiques : [22-28, 32-33]. Les priorités de réalisation restent à cadrer.',M,y,style='tiny')
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
]


def sources():
    s,c=start()
    y=heading(c,'POUR VÉRIFIER ET APPROFONDIR / SUITE','Plomberie, Lean et optimisation',
              'Sources consultées le 22 octobre 2026. Les titres sont cliquables ; la page précédente conserve les références [1] à [21].')
    y=para(c,'Les références étayent des concepts, des méthodes ou des intitulés. Leur application à FLOW, '
           'les exemples chiffrés et le cadre de pilotage du dossier sont des propositions à éprouver. '
           'Les six images de plomberie sont une adaptation pédagogique, pas une méthode normalisée attribuée aux auteurs.',M,y,style='small')-20
    top=y;w=(CW-22)/2
    for i,(n,title,body,url) in enumerate(REFERENCES):
        if i==6:y=top
        x=M+(w+22 if i>=6 else 0)
        y=para(c,f'<link href="{url}" color="#236159"><b>[{n}] {title}</b></link>',x,y,w,'source')-5
        y=para(c,body,x,y,w,'tiny')-17
        if y<75:raise ValueError(('Sources overflow',n,y))
    c.showPage();return finish(s,c)
