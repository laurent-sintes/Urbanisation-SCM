import { Component, type ReactNode } from 'react';
import { ui } from '../ui.ts';

/** A stale lazy bundle or render error must never turn Atlas into a blank page. */
export class ReaderBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="empty-state" role="alert">
          <h1>{ui('readerBoundary.la_lecture_d_atlas_a_ete_interrompue')}</h1>
          <p>{ui('readerBoundary.recharge_l_application_pour_reprendre_la_lecture_le_lien_et_la_pu')}</p>
          <button type="button" className="secondary-button" onClick={() => window.location.reload()}>
            {ui('readerBoundary.recharger_atlas')}
          </button>
        </main>
      );
    return this.props.children;
  }
}
