/** Hide editorial annotations in published prose without changing the snapshot.
 * Rules target contribution references and known editorial sentences. Business
 * reservations, proposed dates and scenario validation retain their meaning.
 */
export function publicText(text: string = ''): string {
  const refs = 'U\\d+(?:/U\\d+)*';
  let result = text;
  const editorialSentences = [
    'Notion locale en cours de consolidation ; consulter les sources et les réserves.',
    'Les deux derniers comportements et la formulation simplifiée sont proposés à la suite de U439/U440/U442.',
    'Les anciennes définitions et leurs accords sont conservés dans la capture préalable.',
    'U439/U440/U442 demandent une formulation plus lisible et l’examen du regroupement et de la fusion comme comportements distincts ; leurs descriptions restent proposées.',
    'Le nom est adopté U246 ; les détails de représentation et contrats restent proposés.',
    'Le nom et la composition sont adoptés U438 ; les descriptions développées et comparaisons sont proposées.',
    'U441/U443 précisent sa distinction d’avec l’affectation ; U445 adopte son nom Fulfillment Commitment.',
    'U438 remplace le nom Order Backlog Management adopté U413 et les rattachements concernés U417/U420.',
    'U445 adopte le nom Fulfillment Commitment, en remplacement de Promise Management.',
    'Ce parent proposé après U342 est adopté U343 ; les contrats détaillés restent proposés.',
    'Nom Order Freezing adopté U350 ; détails éditoriaux proposés.',
    'Nom développé Order Splitting éditorial, notion Split adoptée U362/U363.',
    'Frontière adoptée U395.',
    'Rattachement adopté U380.',
  ];
  for (const sentence of editorialSentences) result = result.replaceAll(sentence, '');
  result = result
    .replace(/Frontière U\d+(?:\/U\d+)*\s*:/g, 'Frontière :')
    .replace(
      /(?:Ce (?:placement|choix|déplacement|rattachement de domaine)|L’ancienne distinction)[^.\n]*\bU\d+[^.\n]*\./g,
      '',
    )
    .replace(/La définition développée et les contrats restent proposés ; /g, '')
    .replace(/Identité et définition U\d+ conservées ; /g, '')
    .replace(/Cette décomposition remplace la conclusion de non-décomposition U\d+ ; /g, '')
    .replace(/ selon les travaux A01, A03 et A07 conservés à la clôture U\d+/g, '')
    .replace(/, avec leur statut proposé/g, '')
    .replace(/Exemple fictif présenté et adopté :/g, 'Exemple fictif :')
    .replace(/Le périmètre adopté /g, 'Le périmètre ')
    .replace(/U\d+ adopte trois comportements :/g, 'Trois comportements :')
    .replace(new RegExp(`^(?:Précision éditoriale |Nommage |Convention )?${refs}\\s*:\\s*`, 'gm'), '')
    .replace(new RegExp(`\\b(?:Depuis|Selon) ${refs},\\s*`, 'g'), '')
    .replace(new RegExp(`(?: sont)? adopté[es]* ${refs}`, 'g'), '')
    .replace(/comportements adoptés —/g, 'comportements —')
    .replace(new RegExp(` demandé[es]* ${refs}`, 'g'), '')
    .replace(new RegExp(` retenus ${refs}`, 'g'), ' retenus')
    .replace(new RegExp(`, (?:intégré[es]*|précisée? par) ${refs}`, 'g'), '')
    .replace(new RegExp(` (?:selon|depuis|en) ${refs}`, 'g'), '')
    .replace(new RegExp(`\\s*\\(${refs}\\)`, 'g'), '')
    .replace(/ : U\d+ demeure applicable/g, '')
    .replace(/Sens métier précisé[^;]*;\s*/g, '')
    .replace(/; choix lexical Assignment confirmé[^.]*\./g, '.')
    .replace(/; convention de vocabulaire U\d+/g, '')
    .replace(/Terme métier Beaumanoir défini par Laurent U\d+\./g, 'Terme métier Beaumanoir.')
    .replace(
      /^(?:Sens de travail (?:dans le contexte Supply|proposé)|Définition métier proposée|Sens métier proposé|Convention U\d+)[^\n]*$/gm,
      '',
    )
    .replace(/Libellé FLOW adopté U\d+ ; /g, '')
    .replace(/Proposition FLOW issue de U\d+, /g, '')
    .replace(/Stock Protection désigne la gouvernance\/management discutée U\d+(?:\/U\d+)* ; /g, '');
  return result
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
