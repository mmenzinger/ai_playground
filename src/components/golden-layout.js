import { LitElement, html, unsafeCSS, css } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';

import { store } from '../store.js';

const sharedStyles = unsafeCSS(require('./shared-styles.css').toString());
const goldenLayoutBase = unsafeCSS(require('golden-layout/src/css/goldenlayout-base.css'));
const goldenLayoutTheme = unsafeCSS(require('golden-layout/src/css/goldenlayout-light-theme.css'));

const goldenLayout = require("golden-layout");

// TODO: react to attribute change
class GoldenLayout extends connect(store)(LitElement) {
  static get properties() {
    return {
      settings: { type: Object },
      dimensions: { type: Object },
      content: { type: Array },
      components: { type: Array },
    };
  }

  static get styles() {
    return [
      sharedStyles,
      goldenLayoutBase,
      goldenLayoutTheme,
      css`:host,div{height:100%}`
    ];
  }

  constructor(){
    super();

    this.settings = {
      hasHeaders: true,
      constrainDragToContainer: true,
      showPopoutIcon: false,
      showMaximiseIcon: true,
    };

    this.dimensions = {
      borderWidth: 3,
      minItemHeight: 75,
      minItemWidth: 75,
      headerHeight: 20,
      dragProxyWidth: 300,
      dragProxyHeight: 200
    };

    this.content = [];
    this.components = [];
  }

  render() {
    return html`<div></div>`;
  }

  firstUpdated(){
    const config = {
      settings: this.settings,
      dimensions: this.dimensions,
      content: this.content,
    };
    const myLayout = new goldenLayout( config, this.shadowRoot.querySelector('div') );
    this.components.forEach(component => {
      myLayout.registerComponent( component.name, function( container, componentState ) {
        container.getElement().html( component.content );
      });
    });
    myLayout.init();
    
    $(window).resize(() => {
        myLayout.updateSize();
    });
  }
}

window.customElements.define('golden-layout', GoldenLayout);
