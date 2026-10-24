import study from '../../output/pdf/scm-study.json' with { type: 'json' };

export { default as scmStudyUrl } from '../../output/pdf/FLOW-Piloter-la-supply-chain-indicateurs-et-decisions.pdf?url';
export const scmStudyFilename = study.filename;
export const scmStudyTitle = study.title;
export const scmStudyFullTitle = study.full_title;
export const scmStudyDate = study.date;
export const scmStudyAuthor = study.author;
export const scmStudyPages = study.pages;
export const scmStudyDomainId = study.domain_id;
export const scmStudyDescription = study.description;
export const scmStudyTemporalLabel = study.temporal_label;
