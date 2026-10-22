"""Six practical measurement pages for the FLOW supply-chain dossier.

Content is kept here so regeneration does not depend on extracting an older PDF.
The main authoring module supplies the Atlas layout API and adds global footers.
"""
from __future__ import annotations

import re
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph


QUESTION_PAGES = [
    {
        'title': 'Le service est-il tenu ?',
        'subtitle': 'Suivre ventes et remplacements du service après-vente (SAV) séparément ; une réparation a son propre engagement de fin. Pour le SAV, FLOW vérifie le stock de remplacement ou les ressources de réparation avant de confirmer le parcours.',
        'priority': ('M01',),
        'signal': 'La promesse initiale est moins souvent tenue.',
        'action': 'Tester site préparateur, accès au stock ou délai annoncé.',
        'result': 'Promesse tenue, date souhaitée et coût du service.',
        'cadence': 'Proposition pour le pilote, à confirmer : supply, commerce, SAV et logistique analysent les échecs chaque semaine ; les responsables habilités arbitrent délais et priorités, avec les achats si l’approvisionnement est en cause.',
        'note': '<b>Lecture commune aux six questions.</b> Fixer période, unité, date de calcul et exclusions. Une ligne correspond à un article ou une variante ; l’OTIF par ligne ne vaut pas l’OTIF par commande complète. OTIF signifie « à l’heure et en totalité ». Les annulations et changements demandés par le client restent traçables. Une donnée manquante est signalée, sans devenir un succès. Les formules sont proposées pour FLOW. [1]',
        'metrics': [
            ('M01', 'OTIF par ligne',
             'Ligne de commande, quantité attendue, première date promise acceptée, quantités et dates de réception chez le client. Sources : commandes et preuve de livraison.',
             '100 × lignes dues sur la période, livrées intégralement au plus tard à la promesse initiale / toutes les lignes dues. Une ligne partielle ou encore ouverte à l’échéance échoue. 94 sur 100 = 94 %.',
             'Repérer les causes d’échec, puis tester un autre délai annoncé, site préparateur ou accès au stock. Conserver la date initiale même si la promesse est révisée.'),
            ('M02', 'Service à la date souhaitée par le client',
             'Mêmes événements, avec la date demandée à l’entrée de la commande, conservée séparément de la date promise.',
             '100 × lignes intégralement livrées au plus tard à la date souhaitée / lignes dont la date souhaitée est échue dans la période.',
             'Détecter un OTIF élevé obtenu en promettant trop tard. Tester réaffectation du stock, autre site préparateur ou capacité supplémentaire pour rapprocher la promesse du besoin client.'),
            ('M03', 'Achats utilisables à temps',
             'Lignes d’achat, quantité et date confirmées initialement, réceptions, fin du contrôle, statut utilisable ; demandes aval liées. Sources : achats et entrepôt.',
             '100 × lignes d’achat intégralement reçues et utilisables à la date confirmée initiale / lignes d’achat dues. Un lot encore bloqué au contrôle ne réussit pas.',
             'Revoir le délai de planification du fournisseur ou proposer une source de secours. Vérifier aussi la date du besoin aval : un achat ponctuel peut arriver trop tard pour la vente.'),
        ],
    },
    {
        'title': 'Quelles promesses sont menacées ?',
        'subtitle': 'Calculer sur un même carnet de demandes, un même horizon et une même version des ressources. L’ATP est illustré page 14 ; le complément CTP, page 15. [2-5]',
        'priority': ('M04',),
        'signal': 'Des engagements ouverts deviennent irréalisables.',
        'action': 'Comparer réaffectation, complément vérifié ou réception accélérée.',
        'result': 'Risque, service des autres groupes et coût.',
        'cadence': 'Proposition pour le pilote, à confirmer : recalcul aux événements, tri quotidien par l’équipe supply ; responsables des flux concernés et décideurs habilités arbitrent stock, capacités et priorités.',
        'note': '<b>Règles de calcul.</b> Une même unité de stock ou capacité ne couvre pas plusieurs demandes simultanément. Afficher les effectifs évaluables et inconnus pour l’ATP comme pour le CTP ; sans dénominateur, afficher « non applicable ». Une nouvelle simulation ne constitue pas un engagement. Les règles d’autorisation de la décision restent à définir. Illustration marché : Electrolux Professional et JD.com, pages 18-19.',
        'metrics': [
            ('M04', 'Commandes à risque',
             'Promesse initiale, quantité restante, stock utilisable et droits d’accès, apports datés, temps de préparation et transport, capacités. Sources : carnet, entrepôt, achats et plans.',
             '100 × lignes ouvertes en retard prévisible ou sans solution réalisable / lignes ouvertes évaluables dues sur l’horizon. Retard prévisible : date réalisable après la promesse initiale. Afficher à part les lignes non calculables faute de données / toutes les lignes du périmètre.',
             'Trier les engagements à traiter, puis tester réallocation, réception accélérée ou autre parcours avant de modifier la promesse. L’absence de solution réalisable constitue un risque.'),
            ('M05', 'Couverture ATP et manques résolus par CTP',
             'Demandes avec date cible, stock libre et apports déjà prévus pour l’ATP ; fournisseurs, lots, délais, composants et capacités pour le complément CTP.',
             'ATP : 100 × lignes entièrement servables à la date cible / lignes évaluables. CTP : 100 × lignes non couvertes par ATP qu’un apport supplémentaire vérifié rend servables / lignes non couvertes par ATP et évaluables par CTP.',
             'Confirmer ce qui est couvert ; pour le reste, proposer un achat, une fabrication ou un transfert planifié. Si 12 des 20 manques évalués sont résolus, le complément CTP est de 60 %.'),
            ('M06', 'Effet d’une protection de stock',
             'Stock physique, quantités protégées, bénéficiaires, échéances, priorités et demandes de chaque groupe, dont le SAV. Conserver les deux versions de la règle.',
             'Pour chaque groupe, compter les lignes devenues servables et celles devenues non servables entre deux simulations ; mêmes demandes, dates et ressources, seule la protection change.',
             'Modifier la quantité, la durée ou les bénéficiaires de la protection. Aider 15 lignes de B tout en menaçant 3 lignes de A exige un arbitrage par priorité ; le solde +12 ne suffit pas.'),
        ],
    },
    {
        'title': 'Combien coûte le service rendu ?',
        'subtitle': 'Rapprocher la demande servie de son parcours complet. Séparer coût consommé, nouvelles dépenses à engager et stock restant. La page 14 compare deux sites préparateurs.',
        'priority': ('M07', 'M09'),
        'signal': 'Transferts préalables ou coût par livraison augmentent.',
        'action': 'Comparer site préparateur, placement du stock et regroupement.',
        'result': 'Moins de transferts, promesse tenue et coût complet maîtrisé.',
        'cadence': 'Proposition pour le pilote, à confirmer : supply et logistique analysent les causes chaque semaine ; Finance valide les coûts, puis les responsables habilités arbitrent les règles.',
        'note': '<b>Éviter le double compte.</b> Un transfert partagé compte comme dépendance pour chaque livraison concernée ; son mouvement physique et son coût ne sont enregistrés qu’une fois, puis répartis. Le réassort (réapprovisionnement) anticipé est suivi séparément. Une baisse de transferts doit rester compatible avec le service et le coût complet. Cas Howdens et Veseris : page 18 ; JD.com : page 19.',
        'metrics': [
            ('M07', 'Coût de service par livraison (CTS)',
             'Unités servies et coût d’achat ; manutention, stockage, transferts et transport attribuables. Sources : commandes, mouvements, factures et coûts de référence validés par Finance.',
             'Somme des coûts attribués aux unités servies / nombre de livraisons servies. Garder la même règle de répartition des coûts partagés et comparer des produits et canaux comparables.',
             'Comparer sites préparateurs, regroupements et fréquences d’expédition. Par exemple, vérifier si regrouper deux départs réduit le coût sans faire manquer un engagement.'),
            ('M09', 'Transferts avant préparation wholesale',
             'Livraison prévue, site préparateur, mouvements nécessaires et liens livraison-transfert. Sources : affectations, ordres de transfert et réceptions. Distinguer plan et réalisé.',
             'Part concernée : 100 × livraisons ayant au moins un transfert préalable / livraisons du périmètre. Nombre moyen : liens distincts livraison-transfert nécessaire / toutes ces livraisons, y compris celles sans transfert.',
             'Changer le site préparateur ou placer autrement le stock en amont. Exemple : 30 livraisons sur 100 dépendent de 40 liens, soit 30 % concernées et 0,40 transfert nécessaire par livraison.'),
            ('M08', 'Écart économique entre options : lecture PTP',
             'Pour chaque option : demandes servies, recettes attendues, coûts modifiés, dépenses à engager, stock final et valeur retenue pour ce stock. Même horizon et mêmes hypothèses.',
             'Gain économique attendu de B par rapport à A = variation des recettes moins variation des coûts consommés et des pertes de valeur. Afficher séparément variation des dépenses et valeur du stock final.',
             'Choisir une option compatible avec le service : autre site, autre trajet, achat ajusté ou remise en état. Une réduction des dépenses n’est pas automatiquement un gain de marge ; une vente avancée n’est pas une vente sauvée.'),
        ],
    },
    {
        'title': 'Combien de stock finance-t-on, et quel excédent se prépare ?',
        'subtitle': 'Lire le stock à la fois comme ressource de service et capital immobilisé. La vue par article et site explique le total et évite de compenser un excédent par une rupture ailleurs.',
        'priority': ('M11',),
        'signal': 'Un surplus se prépare à l’horizon choisi.',
        'action': 'Réaffecter le stock, ajuster les entrées ou préparer le déstockage.',
        'result': 'Excédent réduit sans menacer les ventes.',
        'cadence': 'Proposition pour le pilote, à confirmer : supply et achats révisent les projections chaque semaine et avant les engagements de saison ; Finance valide la valorisation.',
        'note': '<b>Pour une comparaison juste.</b> Ne pas soustraire deux fois une commande déjà comprise dans la prévision. Ne pas additionner stock vieillissant, bloqué et mal localisé si les catégories se recoupent. Des ventes observées en rupture ne mesurent pas toute la demande : isoler l’estimation. Les unités hétérogènes ne s’additionnent pas sans règle commune. Cas Europris et JD.com : page 19.',
        'metrics': [
            ('M11', 'Excédent projeté',
             'Stock physiquement présent, entrées et sorties prévues, commandes et prévisions rapprochées sans double compte, cible par article-site et coût unitaire. Compter le transit une fois, à réception ; le stock bloqué ne couvre une sortie qu’après sa libération prévue.',
             'Stock projeté = stock initial + entrées - sorties prévues. Excédent = maximum de zéro et de (stock projeté - stock cible), par article-site, puis valorisation. Exemple : 120 restants pour une cible de 80 = 40 excédentaires.',
             'Réduire ou fractionner un achat, différer une réception, déplacer le stock ou préparer le déstockage. Recalculer la promesse et les transferts pour chaque option ; le fournisseur peut imposer un minimum. [6, 15]'),
            ('M10', 'Valeur du stock détenu',
             'Quantités détenues à la date de mesure, article, site, statut, propriétaire et coût unitaire de référence. Inclure le transit détenu sans le recompter à destination.',
             'Somme des quantités détenues × coût unitaire. Présenter séparément disponible, bloqué et transit. Les décaissements effectifs dépendent des conditions de paiement.',
             'Localiser l’immobilisation, puis tester la baisse d’un stock cible ou la réaffectation d’un reliquat. Comparer le capital libéré aux engagements que ce changement mettrait en risque.'),
            ('M12', 'Erreur et biais de prévision',
             'Prévision figée à la date de décision et demande constatée, pour les mêmes articles, sites, périodes et horizon. Identifier promotions et demande perdue estimée. [14]',
             'Erreur : 100 × somme des écarts absolus / somme de la demande. Biais : 100 × somme (prévision - demande) / somme de la demande ; positif = sur-prévision. Ne pas calculer ces taux si la demande totale est nulle.',
             'Si la sur-prévision est persistante, revoir le plan d’achat et les quantités cibles ; si l’écart est ponctuel, tester un lot fractionné. Vérifier ensuite le service et le stock restant.'),
        ],
    },
    {
        'title': 'Où le temps s’accumule-t-il ?',
        'subtitle': 'Mesurer les opérations terminées et la file encore ouverte. La moyenne globale ne dit ni où agir, ni quelles commandes risquent d’attendre longtemps.',
        'priority': ('M13',),
        'signal': 'L’attente ou l’âge des dossiers augmente.',
        'action': 'Agir sur l’étape bloquante et contrôler la capacité aval.',
        'result': 'Délais, dossiers ouverts et charge des étapes.',
        'cadence': 'Proposition pour le pilote, à confirmer : les responsables d’étapes traitent les alertes au fil des événements ; supply et logistique arbitrent les moyens et règles chaque semaine.',
        'note': '<b>Cadence proposée.</b> Actualiser les alertes lors des événements qui changent la faisabilité ; revoir les causes et les règles en comité hebdomadaire. Les seuils sont fixés à partir du besoin de service et de la situation initiale. Les retours suivent leurs propres bornes page 13. Le cas Prinsel, page 19, illustre la réduction du temps de traitement dans l’entrepôt ; ce gain relève aussi de l’exécution logistique.',
        'metrics': [
            ('M13', 'Délai commande-livraison',
             'Événements datés par demande : acceptation, prêt à traiter, début et fin d’opération, livraison. Même calendrier, fuseau et unité de durée pour chaque comparaison.',
             'Délai vente = livraison - acceptation. Attente d’une étape = début de traitement - prêt à traiter. Présenter la médiane (délai couvrant 50 % des dossiers terminés) et le délai couvrant 90 %, par flux et étape.',
             'Agir sur l’étape qui explique l’attente : fractionner les lots, lisser les arrivées ou accélérer une décision. Un délai long peut venir du stock ou d’une règle, pas seulement d’un manque de personnel.'),
            ('M14', 'Nombre et âge des dossiers encore ouverts',
             'Identifiant de demande, étape courante, date d’entrée dans cette étape, motif de blocage, date promise et date de mesure.',
             'Nombre de dossiers ouverts ; âge de chacun = date de mesure - entrée dans l’étape. Compter ceux au-delà d’un seuil fixé avant l’analyse et afficher les plus anciens.',
             'Former une liste d’actions : libérer un contrôle, obtenir un accord, traiter une rupture ou arbitrer une priorité. Cela empêche un bon délai moyen de masquer les dossiers jamais terminés.'),
            ('M15', 'Charge rapportée à la capacité disponible',
             'Quantités à traiter, temps requis par opération, horaires, moyens qualifiés, arrêts et indisponibilités. Sources : plans de charge et calendriers opérationnels.',
             '100 × heures requises / heures réellement disponibles, pour la même opération, le même site et le même créneau. 600 h pour 500 h = 120 %. Une capacité inconnue reste inconnue ; zéro disponible signifie blocage.',
             'Décaler ou répartir la charge, changer la taille des lots, proposer des moyens supplémentaires ou un autre site. Vérifier réception, préparation et transport pour ne pas déplacer le blocage.'),
        ],
    },
    {
        'title': 'Quelle valeur récupère-t-on des retours et excédents ?',
        'subtitle': 'Orienter les retours et les invendus de saison, même sans retour client. Chaque remise en vente, réparation ou déstockage doit garder son délai, ses frais et son résultat.',
        'priority': ('M18',),
        'signal': 'Retours ou invendus attendent une destination et immobilisent de la valeur.',
        'action': 'Comparer remise en vente, réparation, retour fournisseur et déstockage.',
        'result': 'Valeur nette, délai et unités restant à traiter.',
        'cadence': 'Proposition pour le pilote, à confirmer : retours et logistique suivent les files chaque semaine ; commerce et Finance valident conditions et valeur, selon les délégations applicables.',
        'note': '<b>Lecture économique.</b> La valeur nette récupérée n’est pas la marge complète : elle n’a pas déduit le coût initial du bien. Un transfert ne crée pas une sortie du stock global. Éviter de compter deux fois un avoir fournisseur et la valeur du bien retourné. Les options futures restent des estimations jusqu’à réalisation. Cas Tuckernuck : page 19.',
        'metrics': [
            ('M18', 'Valeur nette récupérée',
             'Quantités effectivement sorties, recettes ou avoirs obtenus, frais supplémentaires de tri, réparation, transfert, transport et vente, coût du stock sorti.',
             'Recettes ou avoirs obtenus - frais supplémentaires de récupération. Afficher séparément le coût du stock sorti. Pour comparer des lots : valeur nette / valeur de référence figée du lot ; sans valeur de référence, pas de taux.',
             'Comparer réparation puis revente, autre canal, retour fournisseur ou déstockage. FLOW propose le parcours et ses effets ; prix et conditions commerciaux restent autorisés par leurs responsables.'),
            ('M16', 'Délai de remise à disposition des retours',
             'Retour identifié, réception, contrôle, état, destination retenue et date de disponibilité utilisable. Sources : retours et entrepôt ; lien avec la vente et le SAV si nécessaire.',
             'Pour les retours récupérables remis en stock : date de disponibilité - réception ; médiane et délai sous lequel passent 90 % des retours. Sur les mêmes cohortes reçues, afficher aussi le nombre encore ouvert et son âge.',
             'Accélérer contrôle ou réparation, changer le parcours de retour, puis rendre le stock admissible à l’ATP. Un produit non contrôlé ne devient pas disponible parce qu’il est physiquement revenu.'),
            ('M17', 'Part revendue dans un délai donné',
             'Unités retournées, date de réception, date et quantité de revente, avec traçabilité par unité ou lot. Fixer le périmètre des retours et le délai, par exemple 30 jours.',
             '100 × unités d’une cohorte revendues sous 30 jours après réception / unités retournées de cette cohorte. N’observer que les cohortes ayant 30 jours de recul ; présenter séparément rebut et retour fournisseur.',
             'Tester une remise en vente plus rapide ou un autre canal autorisé. Comparer le gain de délai à la valeur récupérée ; vendre plus vite grâce à une forte remise peut réduire cette valeur.'),
        ],
    },
]


LAYOUT_METRICS = []


def _no_break_numbers(text):
    text = re.sub(r'(?<=\d) (?=\d{3}\b)', '&nbsp;', text)
    return text.replace(' %', '&nbsp;%').replace(' €', '&nbsp;€')


def make_questions(api):
    """Return six pages and links whose source page indices are local to them."""
    stream = api.io.BytesIO()
    c = api.canvas.Canvas(stream, pagesize=(api.W, api.H))
    links = []
    LAYOUT_METRICS.clear()

    def style_set(font_size):
        return {
            'body': ParagraphStyle('qbody', fontName='Segoe', fontSize=font_size,
                                   leading=font_size+2.6, textColor=api.INK),
            'title': ParagraphStyle('qtitle', fontName='Segoe-Bold', fontSize=11.1,
                                    leading=14.0, textColor=api.GREEN),
            'minor_title': ParagraphStyle('qminor', fontName='Segoe-Bold', fontSize=10.4,
                                          leading=13.2, textColor=api.GREEN),
            'signal': ParagraphStyle('qsignal', fontName='Segoe', fontSize=8.6,
                                     leading=11.0, textColor=api.INK),
            'note': ParagraphStyle('qnote', fontName='Segoe', fontSize=8.1,
                                   leading=10.6, textColor=api.MUTED),
            'label': ParagraphStyle('qlabel', fontName='Segoe-Bold', fontSize=8.2,
                                    leading=10.5, textColor=api.GREEN),
        }

    def paragraph(text, style, width):
        p = Paragraph(_no_break_numbers(text), style)
        _, height = p.wrap(width, api.H)
        return p, height

    def metric_blocks(metric, styles, width, primary):
        code,title,data,calculation,decision = metric
        blocks = [(paragraph(title,styles['title' if primary else 'minor_title'],width),4)]
        for label,text in [('Données.',data),('Calcul.',calculation),('Décision dans FLOW.',decision)]:
            blocks.append((paragraph(f'<b>{label}</b> {text}',styles['body'],width),3.0))
        return blocks

    def block_height(blocks):
        return sum(height+gap for (_,height),gap in blocks)

    def draw_blocks(blocks,x,y):
        for (p,height),gap in blocks:
            p.drawOn(c,x,y-height)
            y -= height+gap
        return y

    for qi,question in enumerate(QUESTION_PAGES):
        y = api.heading(c,f'QUESTION DE PILOTAGE {qi+1:02d}',question['title'],question['subtitle'])
        market_page = 18 if qi<3 else 19
        c.setFont('Segoe',8)
        c.setFillColor(api.GREEN)
        c.drawRightString(api.W-api.M,733,f'Cas d’entreprises : page {market_page}')
        links.append((qi,(api.W-api.M-145,729,api.W-api.M,741),market_page-1))
        priority = [m for m in question['metrics'] if m[0] in question['priority']]
        complements = [m for m in question['metrics'] if m[0] not in question['priority']]
        inner_width = api.CW-24
        column_width = (inner_width-24)/3
        chosen = None

        # Keep the same hierarchy throughout; reduce body text only when a
        # two-line heading or the two priority metrics require a little room.
        for font_size in (9.3,9.1,8.9):
            styles = style_set(font_size)
            signal_blocks = [paragraph(f'<b>{label}</b><br/>{question[key]}',styles['signal'],column_width)
                             for label,key in [('SIGNAL','signal'),('DÉCISION À COMPARER','action'),('RÉSULTAT À VÉRIFIER','result')]]
            signal_height = max(height for _,height in signal_blocks)
            priorities = [metric_blocks(m,styles,inner_width,True) for m in priority]
            minor = [metric_blocks(m,styles,api.CW,False) for m in complements]
            note = paragraph(question['note'],styles['note'],api.CW)
            cadence = paragraph(question['cadence'],styles['note'],api.CW)
            panel_height = 12+10.5+8+signal_height+10+sum(block_height(b) for b in priorities)+8*(len(priorities)-1)+10
            remainder = 12+10.5+7+sum(block_height(b)+10 for b in minor)+8+note[1]+9+cadence[1]
            bottom = y-panel_height-remainder
            if bottom>=59:
                chosen = (styles,signal_blocks,signal_height,priorities,minor,note,cadence,panel_height,bottom,font_size)
                break
        if chosen is None:
            raise ValueError(f'Question {qi+1} overflows: estimated bottom {bottom:.1f}')
        styles,signal_blocks,signal_height,priorities,minor,note,cadence,panel_height,bottom,font_size = chosen
        c.setFillColor(api.MINT)
        c.setStrokeColor(api.MINT)
        c.roundRect(api.M,y-panel_height,api.CW,panel_height,8,fill=1,stroke=0)
        top = y
        x = api.M+12
        y -= 12
        label = 'KPI PRIORITAIRES : 2 INDICATEURS' if len(priority)>1 else 'KPI PRIORITAIRE'
        lp,lh = paragraph(label,styles['label'],inner_width)
        lp.drawOn(c,x,y-lh)
        y -= lh+8
        for col,(p,height) in enumerate(signal_blocks):
            p.drawOn(c,x+col*(column_width+12),y-height)
        y -= signal_height+10
        for mi,blocks in enumerate(priorities):
            y = draw_blocks(blocks,x,y)
            if mi<len(priorities)-1:
                c.setStrokeColor(api.GREEN)
                c.setLineWidth(.3)
                c.line(x,y-2,x+inner_width,y-2)
                y -= 8
        y = top-panel_height-12
        lp,lh = paragraph('COMPLÉMENTS POUR EXPLIQUER ET ARBITRER',styles['label'],api.CW)
        lp.drawOn(c,api.M,y-lh)
        y -= lh+7
        for blocks in minor:
            y = draw_blocks(blocks,api.M,y)
            c.setStrokeColor(api.LINE)
            c.setLineWidth(.4)
            c.line(api.M,y-4,api.W-api.M,y-4)
            y -= 10
        y -= 8
        p,height=note
        p.drawOn(c,api.M,y-height)
        y -= height+9
        p,height=cadence
        p.drawOn(c,api.M,y-height)
        y -= height
        assert y>=59,(qi+1,y)
        LAYOUT_METRICS.append({'question':qi+1,'font_size':font_size,'bottom':round(y,1),'panel_height':round(panel_height,1)})
        c.showPage()
    c.save()
    stream.seek(0)
    return api.PdfReader(stream),links
