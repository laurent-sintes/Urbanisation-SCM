import { Download } from 'lucide-react';
import type { View } from '../navigation';
import { ui } from '../ui.ts';
import type { WorkshopStage } from '../workshop';
import { workshopUrl } from '../workshop';
import './help.css';

interface Props {
  topic: 'start' | 'workshop';
  supplyDomainName?: string;
  onNavigate: (view: View, topic?: 'workshop') => void;
  stage: WorkshopStage | null;
  stageMatchesPublication: boolean;
  stageError: string;
  onDownloadWorkingModel: () => void;
}

export function HelpPage({
  topic,
  supplyDomainName,
  onNavigate,
  stage,
  stageMatchesPublication,
  stageError,
  onDownloadWorkingModel,
}: Props) {
  if (topic === 'workshop') {
    return (
      <div className="help-page">
        {stageMatchesPublication && stage ? (
          <div className="help-notice" role="status">
            <strong>{ui('helpPage.atelier_actif')}</strong>
            <p>{ui('helpPage.change_count', { count: stage.operations.length, version: stage.base_version })}</p>
            <a href={workshopUrl()} download={`flow-atlas-staging-${stage.session_id}.json`}>
              <Download size={16} aria-hidden="true" />
              {ui('helpPage.telecharger_le_fichier_de_seance')}
            </a>
            {' · '}
            <button type="button" className="help-link" onClick={onDownloadWorkingModel}>
              <Download size={16} aria-hidden="true" />
              {ui('helpPage.telecharger_le_modele_de_travail')}
            </button>
          </div>
        ) : (
          <p className="help-notice" role="status">
            {stage
              ? ui('helpPage.cette_seance_a_ete_ouverte_sur_la_version_consulte_la_ou_demande_', {
                  base_version: stage.base_version,
                })
              : ui('helpPage.aucun_atelier_actif_sur_cette_version_la_saisie_en_atelier_est_di')}
          </p>
        )}
        {stageError && (
          <p role="alert">
            {ui('helpPage.chargement_de_la_seance')}
            {stageError}
          </p>
        )}
        <section>
          <h2>{ui('helpPage.procedure_pour_un_atelier_en_presentiel')}</h2>
          <ol>
            <li>{ui('helpPage.lancer_atlas_localement_choisir_la_publication_courante_et_projet')}</li>
            <li>{ui('helpPage.verifier_que_atelier_actif_apparait_ici_les_points_chauds_de_la_s')}</li>
            <li>{ui('helpPage.demander_a_codex_d_ajouter_ou_retirer_un_point_chaud_ou_de_modifi')}</li>
            <li>{ui('helpPage.telecharger_le_fichier_de_seance_et_le_modele_de_travail_avant_de')}</li>
            <li>{ui('helpPage.cloturer_la_seance_avec_codex_apres_avoir_conserve_ces_fichiers')}</li>
            <li>{ui('helpPage.plus_tard_demander_a_codex_un_apercu_des_changements_puis_l_integ')}</li>
            <li>{ui('helpPage.faire_valider_les_propositions_retenues_puis_demander_leur_public')}</li>
          </ol>
        </section>
        <section>
          <h2>{ui('helpPage.exemples_de_prompts_pour_codex')}</h2>
          <p>{ui('helpPage.une_phrase_courte_suffit_pour_demarrer_les_details_peuvent_etre_a')}</p>
          <ul className="help-prompts">
            <li>
              {ui('helpPage.ajoute_un_point_chaud_entre_logistics_et')}
              {supplyDomainName || ui('helpPage.le_domaine_supply')}
              {ui('helpPage.qui_decide_du_site_d_expedition')}
            </li>
            <li>{ui('helpPage.place_un_post_it_sur_order_management_clarifier_le_traitement_des')}</li>
            <li>{ui('helpPage.ajoute_a_ce_point_chaud_l_exemple_discute_une_commande_est_prepar')}</li>
            <li>{ui('helpPage.deplace_ce_point_chaud_vers_process_management_et_precise_que_la_')}</li>
            <li>{ui('helpPage.retire_le_post_it_cree_par_erreur_pendant_cette_seance')}</li>
            <li>{ui('helpPage.liste_les_points_chauds_ajoutes_aujourd_hui_et_prepare_le_fichier')}</li>
            <li>{ui('helpPage.cloture_la_seance_apres_sauvegarde_des_changements')}</li>
            <li>{ui('helpPage.prepare_un_apercu_des_changements_de_l_atelier_et_signale_les_con')}</li>
            <li>{ui('helpPage.integre_au_modele_en_preparation_les_points_chauds_retenus_dans_c')}</li>
          </ul>
          <p>{ui('helpPage.un_point_chaud_d_atelier_reste_une_proposition_son_affichage_ne_s')}</p>
          <p>{ui('helpPage.le_fichier_de_seance_permet_a_codex_de_reprendre_et_d_integrer_le')}</p>
        </section>
        <button type="button" className="help-link" onClick={() => onNavigate('hotspots')}>
          {ui('helpPage.voir_les_points_chauds_affiches')}
        </button>
      </div>
    );
  }

  return (
    <div className="help-page">
      <section>
        <h2>{ui('helpPage.explorer_en_quelques_etapes')}</h2>
        <ol>
          <li>
            <button type="button" className="help-link" onClick={() => onNavigate('map')}>
              {ui('helpPage.ouvrir_la_cartographie')}
            </button>{' '}
            {ui('helpPage.pour_situer_les_systemes_domaines_et_responsabilites_metier_sur_l')}
          </li>
          <li>{ui('helpPage.choisir_un_element_sur_la_carte_puis_ouvrir_sa_fiche_pour_lire_so')}</li>
          <li>{ui('helpPage.utiliser_la_recherche_dans_l_en_tete_ou_ctrl_k_pour_retrouver_un_')}</li>
          <li>
            <button type="button" className="help-link" onClick={() => onNavigate('hotspots')}>
              {ui('helpPage.explorer_les_points_chauds')}
            </button>{' '}
            {ui('helpPage.et_activer_leur_affichage_sur_les_cartes_qui_les_concernent')}
          </li>
          <li>{ui('helpPage.consulter_les_relations_pour_comprendre_les_dependances_explicite')}</li>
        </ol>
      </section>
      <section>
        <h2>{ui('helpPage.comprendre_ce_que_montre_atlas')}</h2>
        <p>
          {ui('helpPage.le')}{' '}
          <button type="button" className="help-link" onClick={() => onNavigate('metamodel')}>
            {ui('helpPage.metamodele_flow')}
          </button>{' '}
          {ui('helpPage.explique_les_types_d_objets_leurs_liens_et_les_regles_de_la_publi')}
        </p>
        <p>{ui('helpPage.atlas_presente_la_version_que_tu_as_choisie_dans_l_en_tete_docume')}</p>
      </section>
      <section>
        <h2>{ui('helpPage.preparer_une_seance_collective')}</h2>
        <p>
          {ui('helpPage.la_rubrique')}{' '}
          <button type="button" className="help-link" onClick={() => onNavigate('help', 'workshop')}>
            {ui('helpPage.mode_atelier')}
          </button>{' '}
          {ui('helpPage.explique_comment_recueillir_des_points_chauds_sur_la_carte_locale')}
        </p>
      </section>
    </div>
  );
}
