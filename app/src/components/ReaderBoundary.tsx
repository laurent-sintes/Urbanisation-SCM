import {Component, type ReactNode} from 'react';

/** A stale lazy bundle or render error must never turn Atlas into a blank page. */
export class ReaderBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError() { return {failed:true}; }
  render() {
    if(this.state.failed) return <main className="empty-state" role="alert"><h1>La lecture d’Atlas a été interrompue</h1><p>Recharge l’application pour reprendre la lecture. Le lien et la publication sélectionnée seront conservés.</p><button className="secondary-button" onClick={()=>window.location.reload()}>Recharger Atlas</button></main>;
    return this.props.children;
  }
}
