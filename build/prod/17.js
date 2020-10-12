(window.webpackJsonpLIB=window.webpackJsonpLIB||[]).push([[17],{461:function(e,i,r){"use strict";r.r(i);var o=r(95),a=r(202),t=r(158),d=r(172),l=r(201),n=o.b`header{
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.25em 0.5em;
  box-sizing: border-box;
  background: var(--color-background-secondary);
  border-bottom: 1px solid var(--color-border);
}

nav{
  display: flex;
  justify-content: space-between;
  padding: 0.1em;
  background: var(--color-background-secondary);
  border-bottom: 1px solid var(--color-border);
}

img.logo{
  margin: -0.5em 1em -0.5em 0;
  width: 3em;
}

#offline{
  display: none;
  position: absolute;
  top: 0.2em;
  right: 6.5em;
  width: 1em;
  padding: 0.5em;
  background-color: var(--color-warning);
  border-radius: 2em;
  border: 1px solid var(--color-border);
}

#offline[active]{
  display: block;
}

#breadcrumbs, #additional{
  display: flex;
  flex-direction: row;
}
#breadcrumbs{
  padding-left: 0.5;
}
li{
  padding: 0 0.25em;
  text-transform: capitalize;
}
#additional li{
  padding: 0 0.5em;
}`;class s extends a.a{static get properties(){return{title:{type:String}}}static get styles(){return[l.a,n]}render(){const e=[o.c`<li><a href="./">Home</a></li>`];for(const[r,a]of t.a.params){var i;e.push(o.c`<li>></li><li><a href="#${r}${a?"="+a:""}">${(null===(i=d.a.activeProject)||void 0===i?void 0:i.name)||r}</a></li>`)}return o.c`
            <header>
                <img src="assets/logo.png" alt="Coding4Fun" class="logo">
                <a href="/">
                    <h1>${this.title}</h1>
                </a>
            </header>
            <nav>
                <ul id="breadcrumbs">${e}</ul>
                <ul id="additional">
                    <li><a href="https://docs.google.com/forms/d/e/1FAIpQLSfrFYo0PnULmqOhQY4bxE_uWwe21m-RtxmboGFRlJW9Or5r4w/viewform?usp=sf_link">Feedback</a></li>
                    <li><a href="https://www.eduvidual.at/course/view.php?id=23313">Community</a></li>
                    <li><a href="#impressum">Impressum</a></li>
                </ul>
            </nav>
            <img id="offline" ?active="${t.a.offline}" src="assets/interface/connect.svg" title="you are currently offline">
        `}}window.customElements.define("ai-header",s)}}]);