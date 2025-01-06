'use strict';
/**
 * items-multiselect: Cuadro desplegable que permite seleccionar o no
 * una lista de elementos así como buscar los que se quieren seleccionar o no.
 *
 * @author miloter
 * @since 2025-01-03
 * @version 2025-01-03
 *
 * El componente permite poner o quitar la selección y se realiza siempre sobre
 * los elementos filtrados.
 * Posee un cuadro de búsqueda avanzada que permite buscar por:
 *      Contenido exacto.
 *      Rango alfanumérico.
 *      Comienzo.
 *      Final.
 *      Contenido parcial.
 *      Alguno de.
 *      Etc.
 * props:
 *      items: Un array de objetos donde cada objeto es de la forma
 *          {
 *              key: <Clave única del elemento>,
 *              title: <Título que se mostrará al usuario>
 *              [selected: <Booleano ppcional para indicar los elementos seleccionados>]
 *          }
 *
 *      maxHeight: Un número entero que indica la altura de la vista de
 *      elementos seleccionables, el número indica la cantidad de rem.
 * emits:
 *      selectedChanged(selectedItems): Recibe como argumento los elementos
 *      seleccionados.
 */
app.component('items-multiselect', {
    props: {
        items: { type: Array, default: () => [] },
        maxHeight: { type: Number, default: 16 }
    },
    emits: ['selectedChanged'],
    template: /*html*/`
        <div :class="componentUid + ' ' + instanceUid" @keyup.esc="selectDisplayed = false">                        
            <button type="button" @click="selectDisplayed = !selectDisplayed">
                {{ selectedItemsMessage  }} V
            </button>                            
            <div v-show="selectDisplayed" class="items-multiselect-checkboxes">            
                <div class="items-multiselect-header">
                    <input type="checkbox"
                        :checked="selectedItems.length === filteredItems.length"
                        @click="selectedChanged($event.target.checked, null)">
                    <input type="search" v-model="textFilter"
                        placeholder="Texto a buscar...">
                    <a href="#" @click.prevent="showHelpSearcher"
                        title="Pulse para ver ayuda sobre cómo buscar">?</a>                    
                </div>
                <template v-for="item in filteredItems" :key="item.key">
                    <label>
                        <input type="checkbox" :checked="item.selected"
                            @click="selectedChanged($event.target.checked, item)">
                        {{ item.title }}
                    </label><br>
                </template>            
            </div>
        </div>
    `,
    data() {
        return {
            // Indica si se estrá mostrando el selector de elementos
            selectDisplayed: false,
            textFilter: ''
        }
    },
    methods: {        
        selectedChanged(value, item) {
            if (item) {
                item.selected = value;
            } else {
                for (const item of this.filteredItems) {
                    item.selected = value;
                }
            }
            this.$emit('selectedChanged', this.selectedItems);
        },
        // Comprueba un click fuera del área del control
        clickOutside(e) {
            if (!this.selectDisplayed) return;

            // Se comprueba la existencia de un elemento contenedor
            let el = e.target;
            let exists = false;
            while (el !== null) {
                if (el.classList.contains(this.instanceUid)) {
                    exists = true;
                    break;
                }
                el = el.parentElement;
            }

            if (!exists) {
                this.selectDisplayed = false;
            }
        },
        // Estilos del componente
        setComponentStyles() {
            // Si los estilos ya están registrados sale                        
            if (document.querySelector(`head > style[${this.componentUid}]`)) return;

            const cssText = /*css*/`                
                .${this.componentUid} {
                    position: relative;
                    margin: 0.16rem;
                }
                .${this.componentUid} .items-multiselect-checkboxes {
                    position: absolute;
                    z-index: 1;
                    background-color: lightgray;
                    border: 1px solid black;
                    max-height: ${this.maxHeight}rem;
                    overflow: auto;
                }                
                .${this.componentUid} .items-multiselect-header {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    gap: 0.25rem;                    
                    padding-right: 0.25rem;
                }                
            `;

            // Inyecta los estilos en la página (una sola vez)
            const style = document.createElement('style');
            // Establece un atributo para identificar los estilos
            style.setAttribute(this.componentUid, '');
            style.appendChild(document.createTextNode(cssText));
            document.getElementsByTagName('head')[0].appendChild(style);
        },
        /**
         * Abre una ventana emergente para mostrar contenidos.
         * @param {string} title Título opcional de la ventana.
         * @param {string} content Contenido que se mostrará en la ventana.
         */
        openWindow(title, content) {
            const wnd = window.open();
            wnd.document.write(
                '<!DOCTYPE html>\
                <html lang="es">\
                    <head>\
                        <meta charset="UTF-8">\
                        <title>' + (title || 'Ventana') + '</title>\
                    </head>\
                    <body>' +
                content +
                '</body>\
                </html>'
            );
        },
        showHelpSearcher() {
            this.openWindow('Ayuda del buscador', /*html*/`
                <style>
                    .list {
                        margin-left: 2rem;
                        font-size: 1.2rem
                    }
                    .term {
                        font-style: italic;
                    }
                    .data {
                        font-size: 1.3rem;
                        font-family: monospace;
                        font-weight: bold;
                    }
                </style>
                <dl class="list">
                    <dt class="term">Buscar texto suelto  (busca todo lo que contenga ho):</dt>
                    <dd class="data">ho</dd>

                    <dt class="term">En un rango de valores (Orden alfabético entre la e y la k inclusive):</dt>
                    <dd class="data">>= e & <= k</dd>

                    <dt class="term">Distinto de algo (Cualquier entrada que no coincida con Edad):</dt>
                    <dd class="data">!= Edad</dd>

                    <dt class="term">Que contentan alguna letra o palabra (Cualquier entrada que contenga nombre, edad o trabajo):</dt>
                    <dd class="data">nombre | edad | trabajo</dd>

                    <dt class="term">Que contenga todas las letra o palabras (que contenga una e y una a):</dt>
                    <dd class="data">e & a</dd>

                    <dt class="term">Qe no contenga una letra o palabra (que no contenga un m):</dt>
                    <dd class="data">!m</dd>

                    <dt class="term">Una mezcla de lo anterior (que contenga una e y, una a o una i, y no contenga una m):</dt>
                    <dd class="data">e & (a | i) & !m</dd>

                    <dt class="term">Que comienze con algo (Entradas que comienzen con t):</dt>
                    <dd class="data">test '^t'</dd>

                    <dt class="term">Que termine con algo (Entradas que terminen con o):</dt>
                    <dd class="data">test 'o$'</dd>

                    <dt class="term">Etc.</dt>
                    <dd class="data"></dd>

                    <dt class="term">
                        No se distingue entre mayúsculas y minúsculas, ni signos diacríticos.
                        Los caracteres, palabras o frases pueden entrecomillarse, únicamente
                        con la comilla simple (').
                    </dt>
                    <dd class="data"></dd>

                    <dt class="term">
                        Si las letras o frases comienzan por un número, símbolo o tienen
                        espacios o símbolos en su contenido, deben entrecomillarse:</dt>
                    <dd class="data">(!'1a' & '@edad') | 'edad'</dd>

                    <dt class="term">
                        Si la expresión de búsqueda contiene el apóstofro (<b>'</b>) necesariamente se
                        debe entrecomillar y usar el carácter de escape (<b>&bsol;</b>), por ejemplo para
                        buscar dento de la cadena "Empresa ' Búsqueda", podemos usar:</dt>
                    <dd class="data">'a &bsol;' bus'</dd>

                    <dt class="term">
                        También se puede usar el operador <strong>test</strong>:</dt>
                    <dd class="data">test 'a &bsol;' bus'</dd>
                </dl>
            `);
        },
        /**
         * Convierte cualquier tipo de dato a string.
         * @param {any} value 
         * @returns {string}
         */
        toString(value) {
            if (typeof(value) === 'string') {
                return value;
            }

            if (value === null) {
                return 'null';
            }
            
            if (value === undefined) {
                return 'undefined'
            }        

            return value.toString();
        }
    },
    computed: {
        filteredItems() {            
            return this.items.filter(item => {
                // El campo de título debe pasarse como cadena
                return this.testSearch.eval(this.toString(item.title), this.textFilter)
            });
        },
        selectedItems() {
            return this.items.filter(item => item.selected);
        },
        /**
         * Devuelve un ID de instancia del componente único.
         */
        instanceUid() {
            return crypto.randomUUID();
        },
        /**
         * Devuelve un nombre de componente único basado en el nombre dado al
         * componente, esto significa que todos los componentes con este nombre
         * tendrán el mismo ID.
         * @returns {string}
         */
        componentUid() {
            let name = null;
            for (const entry of Object.entries(Vue.getCurrentInstance().appContext.components)) {
                if (this.$options === entry[1]) {
                    name = entry[0];
                    break;
                }
            }

            return `vue-${name}-${btoa(name).replace(/[+/=]/g, '')}`;
        },
        /**
         * Mantiene una instancia única de la utilidad de filtrado.
         * @returns 
         */
        testSearch() {            
            // Clases de utilidad para el componente
            class MiniScanner{static#e=/^[^\s\p{L}\d]+$/u;static#t=/^[\p{L}\d]$/u;static#i=/^[_\p{L}]$/u;static#r(e){switch(e){case"\t":case"\n":case"\v":case"\f":case"\r":case" ":return!0;default:return!1}}static#n(e){return MiniScanner.#r(e)&&!MiniScanner.#s(e)}static#s(e){return"\n"===e||"\r"===e}static#a(e){if(0===e.length)return!1;if(!MiniScanner.#i.test(e[0]))return!1;for(let t=1;t<e.length;t++)if(!MiniScanner.#t.test(e[t]))return!1;return!0}static get maxUserIndex(){return 4096}static get string(){return MiniScanner.maxUserIndex+1}static get uknown(){return MiniScanner.maxUserIndex+3}static get eof(){return MiniScanner.maxUserIndex+5}static get ident(){return MiniScanner.maxUserIndex+7}static get number(){return MiniScanner.maxUserIndex+8}static get operator(){return MiniScanner.maxUserIndex+9}static get keyword(){return MiniScanner.maxUserIndex+10}static get rangeInt(){return 0}static get rangeDouble(){return 1}static get rangeOverflow(){return 2}static get maxExpo(){return Number.MAX_SAFE_INTEGER}static get maxExpoNorm(){return 309}static get minExpoNorm(){return-323}static get maxMantissa(){return Number.MAX_SAFE_INTEGER}static#h(e){return MiniScanner.#e.test(e)}#o;#u;#f;#c;#l;#d;#x;#g;#m;#p;#k;#S;#C;#M;#w;#B;#b;#A;#E;#I;#v;#O;#N;#R;#L;constructor(e="",t=!1){this.#o=e,this.#u=t,this.#f="",this.#c=new Map,this.#l=new Map,this.#d=!0,this.#x="",this.#g=0,this.#m=MiniScanner.rangeInt,this.#p=0,this.#k=0,this.#S=1,this.#C=0,this.#M=0,this.#w=!1,this.resetVarsAnalisis()}#P(){let e,t=0,i=0,r=0,n=this.#E;this.#p=0,this.#k=0,this.#C=0,this.#w=!1;do{switch(n<=this.#b?(e=this.#o[n++],i++):t=4,t){case 0:t="0"===e?1:4;break;case 1:t="X"===e||"x"===e?2:4;break;case 2:case 3:e>="0"&&e<="9"?(t=3,r=i,this.#w||this.#U(e.charCodeAt(0)-48,16)):e>="A"&&e<="F"?(t=3,r=i,this.#w||this.#U(e.charCodeAt(0)-55,16)):e>="a"&&e<="f"?(t=3,r=i,this.#w||this.#U(e.charCodeAt(0)-87,16)):t=4;break}}while(4!==t);return r>0&&(this.#A=this.#E,this.#E+=r,this.#v+=r,!0)}#y(){let e=0,t=[];return this.#P()?(this.#w?this.#m=MiniScanner.rangeOverflow:this.#m=MiniScanner.rangeInt,e=!0):this.#T(t)?(this.#w?this.#m=MiniScanner.rangeOverflow:this.#m=t[0]?MiniScanner.rangeInt:MiniScanner.rangeDouble,e=!0):e=!1,e}#T(e){let t,i=0,r=0,n=0,s=this.#E,a=!1;if(e[0]=!0,this.#p=0,this.#k=0,this.#C=0,this.#M=0,this.#S=0,!(s<=this.#b))return!1;if(t=this.#o[s],t<"0"||t>"9")return!1;do{switch(s<=this.#b?(t=this.#o[s++],r++):i=7,i){case 0:t>="0"&&t<="9"?(i=1,n=r,this.#$(t.charCodeAt(0)-48,e)):i=7;break;case 1:t>="0"&&t<="9"?(n=r,this.#$(t.charCodeAt(0)-48,e)):t===(this.#d?".":",")?i=2:"E"===t||"e"===t?(i=4,e[0]=!1):i=7;break;case 2:t>="0"&&t<="9"?(i=3,e[0]=!1,n=r,this.#F(t.charCodeAt(0)-48)):i=7;break;case 3:t>="0"&&t<="9"?(n=r,this.#F(t.charCodeAt(0)-48)):i="E"===t||"e"===t?4:7;break;case 4:t>="0"&&t<="9"?(i=6,e[0]=!1,n=r,this.#D(t.charCodeAt(0)-48,a)):"+"===t?i=5:"-"===t?(i=5,a=!0):i=7;break;case 5:t>="0"&&t<="9"?(i=6,n=r,this.#D(t.charCodeAt(0)-48,a)):i=7;break;case 6:t>="0"&&t<="9"?(n=r,this.#D(t.charCodeAt(0)-48,a)):i=7;break}}while(7!==i);return n>0&&(this.#_(e[0],a),this.#A=this.#E,this.#E+=n,this.#v+=n,!0)}#_(e,t){this.#w=!1,e||0===this.#k?this.#p=this.#k:(t?this.#C-=this.#M:this.#C+=this.#M,this.#C+this.#S>MiniScanner.maxExpoNorm?(this.#w=!0,this.#p=1/0):this.#C+this.#S<MiniScanner.minExpoNorm?this.#p=0:this.#p=this.#k*Math.pow(10,this.#C))}#U(e,t){this.#k<=Math.floor((MiniScanner.maxMantissa-e)/t)?(this.#k=this.#k*t+e,this.#p=this.#k):this.#w=!0}#$(e,t){this.#k<=Math.floor((MiniScanner.maxMantissa-e)/10)?(this.#k=10*this.#k+e,(0!==this.#S||0!==e)&&this.#S++):(this.#C++,t[0]=!1)}#F(e){this.#k<=Math.floor((MiniScanner.maxMantissa-e)/10)&&(this.#k=10*this.#k+e,this.#C--,(0!==this.#S||0!==e)&&this.#S++)}#D(e,t){this.#M<=Math.floor((MiniScanner.maxExpo-e)/10)&&(this.#M=10*this.#M+e)}#W(){for(;this.#E<=this.#b;)if(this.#V(this.#E))this.#E++,this.#v++;else{if(!this.#X())break;this.#G()}}#H(){if(this.#K())return!1;if(!MiniScanner.#i.test(this.#j()))return!1;for(this.#A=this.#E++;this.#E<=this.#b&&MiniScanner.#t.test(this.#j());)this.#E++;return this.#v+=this.tokenLength(),!0}#q(){if(!this.#z(this.#x))return!1;this.#f="",this.#A=this.#E;let e=!1,t=!1;this.#E+=this.#x.length;do{if(this.#J())e=!0;else if(this.#Q(this.#x))this.#E+=this.#x.length,e=!0,t=!0;else if("\\"===this.#j()){const t=this.#Y();-1!==t?this.#f+=t:e=!0}else this.#f+=this.#Z()}while(!e);return t?this.#v+=this.tokenLength():this.#E=this.#A,t}#Y(){let e,t;if(this.#E++,this.#J())return-1;switch(this.#j()){case"a":return this.#E++,"";case"b":return this.#E++,"\b";case"f":return this.#E++,"\f";case"n":return this.#E++,"\n";case"r":return this.#E++,"\r";case"t":return this.#E++,"\t";case"v":return this.#E++,"\v";case"0":return this.#E++,"\0";case'"':return this.#E++,'"';case"'":return this.#E++,"'";case"\\":return this.#E++,"\\";case"x":if(this.#E++,this.#K())return-1;if(e=this.#Z(),e>="0"&&e<="9")t=e.charCodeAt(0)-48;else if(e>="A"&&e<="F")t=e.charCodeAt(0)-55;else{if(!(e>="a"&&e<="f"))return-1;t=e.charCodeAt(0)-87}if(this.#K())return-1;if(e=this.#Z(),e>="0"&&e<="9")t=16*t+e.charCodeAt(0)-48;else if(e>="A"&&e<="F")t=16*t+e.charCodeAt(0)-55;else{if(!(e>="a"&&e<="f"))return this.#E--,String.fromCharCode(t);t=16*t+e.charCodeAt(0)-87}if(this.#K())return-1;if(e=this.#Z(),e>="0"&&e<="9")t=16*t+e.charCodeAt(0)-48;else if(e>="A"&&e<="F")t=16*t+e.charCodeAt(0)-55;else{if(!(e>="a"&&e<="f"))return this.#E--,String.fromCharCode(t);t=16*t+e.charCodeAt(0)-87}if(this.#K())return-1;if(e=this.#Z(),e>="0"&&e<="9")t=16*t+e.charCodeAt(0)-48;else if(e>="A"&&e<="F")t=16*t+e.charCodeAt(0)-55;else{if(!(e>="a"&&e<="f"))return this.#E--,String.fromCharCode(t);t=16*t+e.charCodeAt(0)-87}return String.fromCharCode(t);case"u":if(this.#E++,this.#K())return-1;if(e=this.#Z(),e>="0"&&e<="9")t=e.charCodeAt(0)-48;else if(e>="A"&&e<="F")t=e.charCodeAt(0)-55;else{if(!(e>="a"&&e<="f"))return-1;t=e.charCodeAt(0)-87}if(this.#K())return-1;if(e=this.#Z(),e>="0"&&e<="9")t=16*t+e.charCodeAt(0)-48;else if(e>="A"&&e<="F")t=16*t+e.charCodeAt(0)-55;else{if(!(e>="a"&&e<="f"))return-1;t=16*t+e.charCodeAt(0)-87}if(this.#K())return-1;if(e=this.#Z(),e>="0"&&e<="9")t=16*t+e.charCodeAt(0)-48;else if(e>="A"&&e<="F")t=16*t+e.charCodeAt(0)-55;else{if(!(e>="a"&&e<="f"))return-1;t=16*t+e.charCodeAt(0)-87}if(this.#K())return-1;if(e=this.#Z(),e>="0"&&e<="9")t=16*t+e.charCodeAt(0)-48;else if(e>="A"&&e<="F")t=16*t+e.charCodeAt(0)-55;else{if(!(e>="a"&&e<="f"))return-1;t=16*t+e.charCodeAt(0)-87}return String.fromCharCode(t);default:return this.#Z()}}#K(){return this.#E>this.#b}#X(){return!this.#K()&&!!MiniScanner.#s(this.#j())}#J(){return!!this.#K()||!!this.#X()}#G(){this.#O=this.#v,"\r"===this.#j()?(this.#E++,this.#E<=this.#b&&"\n"===this.#j()&&this.#E++):this.#E++,this.#I++,this.#v=0}#Q(e){if(""===e)return!1;let t=this.#E,i=0;for(;t<=this.#b&&i<e.length&&this.#o[t]===e[i];)t++,i++;return i===e.length}#ee(e,t){e.length>this.#g&&(this.#g=e.length),this.#l.set(e,t)}#te(e,t){if(this.#K())return!1;for(e[0]=this.#o.substring(this.#E,this.#E+this.#g);void 0===this.#l.get(e[0])&&e[0].length>0;)e[0]=e[0].substring(0,e[0].length-1);return t&&e[0].length>0&&(this.#A=this.#E,this.#E+=e[0].length,this.#v+=e[0].length),e[0].length>0}#z(e){let t=[];return!this.#K()&&(0!==e.length&&(!!this.#te(t,!1)&&e===t[0]))}#j(){return this.#o[this.#E]}#Z(){const e=this.#j();return this.#E++,e}#V(e){return!(e<0||e>this.#b)&&MiniScanner.#n(this.#o[e])}resetVarsAnalisis(){this.#B=[],this.beginAnalisis(),this.#b=this.#o.length-1}beginAnalisis(){this.#A=0,this.#E=0,this.#I=1,this.#v=1,this.#O=this.#v,this.#N=MiniScanner.eof,this.#R=MiniScanner.eof,this.#L=MiniScanner.eof}isUsePoint(){return this.#d}setUsePoint(e){this.#d=e}getIndexBuffer(){return this.#E}getLin(){return this.#I}getCol(){return this.#v}getLastCol(){return this.#O}length(){return this.#b+1}tokenLength(){return this.#E-this.#A}getLexeme(){return this.#o.substring(this.#A,this.#E)}getText(){return this.#o}setText(e){this.#o=e,this.resetVarsAnalisis()}substring(e,t){return this.#o.substring(e,t)}getNum(){return this.#p}getNumOverflow(){return this.#w}getNumRange(){return this.#m}getMant(){return this.#k}getProcessedString(){return this.#f}getChar(e){if(e<0||e>this.#b)throw new RangeError("El índice debe estár entre cero y la longitud de la secuencia menos uno.");return this.#o[e]}getTokenClass(){return this.#L}getToken(){return this.#N}getTokenPrev(){return this.#R}tokenLin(){return this.#N===MiniScanner.eol?this.#I-1:this.#I}getTokenIndex(){return this.#A}tokenCol(){return this.#N===MiniScanner.eol?this.#O:this.#v-this.tokenLength()}setOperatorString(e){if(0===e.length)this.#x="";else{if(!MiniScanner.#h(e))throw new TypeError(`'${e}' no se admite como operador`);if(void 0!==this.#l.get(e))throw new Error(`'${e}' ya existe como operador`);this.#x=e,this.#ee(this.#x,MiniScanner.string)}}getOperatorString(){return this.#x}addKeyword(e,t){if(e>MiniScanner.maxUserIndex)throw new RangeError(`${e} debe ser menor o igual a ${MiniScanner.maxUserIndex}`);if(this.#u&&(t=t.toLowerCase()),!MiniScanner.#a(t))throw new TypeError(`${t} no es una palabra clave válida`);if(void 0!==this.#c.get(t))throw new Error(`'${t}' ya existe como palabra clave`);this.#c.set(t,e)}addOperator(e,t){if(e>MiniScanner.maxUserIndex)throw new RangeError(`${e} debe ser menor o igual a ${MiniScanner.maxUserIndex}`);if(!MiniScanner.#h(t))throw new TypeError(`'${t}' no se admite como operador`);if(void 0!==this.#l.get(t))throw new Error(`'${t}' ya existe como operador`);this.#ee(t,e)}nextToken(){let e=[];return this.#R=this.#N,this.#W(),this.#H()?(void 0!==this.#c.get(this.#u?this.getLexeme().toLowerCase():this.getLexeme())?(this.#L=MiniScanner.keyword,this.#N=this.#c.get(this.#u?this.getLexeme().toLowerCase():this.getLexeme())):(this.#L=MiniScanner.ident,this.#N=MiniScanner.ident),this.#N):this.#y()?(this.#L=MiniScanner.number,this.#N=MiniScanner.number,this.#N):this.#q()?(this.#L=MiniScanner.string,this.#N=MiniScanner.string,this.#N):this.#te(e,!0)?(this.#L=MiniScanner.operator,this.#N=this.#l.get(e[0]),this.#N):this.#K()?(this.#A=this.#E,this.#L=MiniScanner.eof,this.#N=MiniScanner.eof,this.#N):(this.#A=this.#E,this.#E++,this.#v++,this.#L=MiniScanner.uknown,this.#N=MiniScanner.uknown,this.#N)}push(){this.#B.push({indexBuffer:this.#E,tokenIndex:this.#A,tokenClass:this.#L,token:this.#N,tokenPrev:this.#R,lin:this.#I,col:this.#v,lastCol:this.#O,numRange:this.#m,num:this.#p,numOverflow:this.#w,mant:this.#k})}pop(){const e=this.#B.pop();return this.#E=e.indexBuffer,this.#A=e.tokenIndex,this.#L=e.claseToken,this.#N=e.token,this.#R=e.tokenPrev,this.#I=e.lin,this.#v=e.col,this.#O=e.lastCol,this.#m=e.numRange,this.#p=e.num,this.#w=e.numOverflow,this.#k=e.mant,this.#N}removeTopStack(){this.#B.pop()}}
            class TestSearch{static#t=1;static#s=2;static#e=3;static#a=4;static#n=5;static#h=6;static#i=7;static#r=8;static#c=9;static#o=10;static#T=11;static#p=12;static#k=13;static#S=14;#_;#d;#l;#O;#u;constructor(){this.#_="",this.#d=[],this.#u=null,this.#l=new MiniScanner("",!0),this.#l.setOperatorString("'"),this.#l.addOperator(TestSearch.#t,"!"),this.#l.addOperator(TestSearch.#s,"&"),this.#l.addOperator(TestSearch.#s,"&&"),this.#l.addOperator(TestSearch.#e,"|"),this.#l.addOperator(TestSearch.#e,"||"),this.#l.addOperator(TestSearch.#a,"("),this.#l.addOperator(TestSearch.#n,")"),this.#l.addOperator(TestSearch.#h,">="),this.#l.addOperator(TestSearch.#i,"<="),this.#l.addOperator(TestSearch.#r,">"),this.#l.addOperator(TestSearch.#c,"<"),this.#l.addOperator(TestSearch.#o,"="),this.#l.addOperator(TestSearch.#o,"=="),this.#l.addOperator(TestSearch.#T,"<>"),this.#l.addOperator(TestSearch.#T,"!="),this.#l.addOperator(TestSearch.#k,"+"),this.#l.addOperator(TestSearch.#S,"-"),this.#l.addKeyword(TestSearch.#p,"test")}#x(t){let s=this.#d.pop(),e=this.#d.pop();switch(t!==TestSearch.#s&&t!==TestSearch.#e||("boolean"!=typeof e&&(e=this.#_.indexOf(e)>=0),"boolean"!=typeof s&&(s=this.#_.indexOf(s)>=0)),t){case TestSearch.#h:return this.#d.push(e>=s);case TestSearch.#i:return this.#d.push(e<=s);case TestSearch.#r:return this.#d.push(e>s);case TestSearch.#c:return this.#d.push(e<s);case TestSearch.#o:return this.#d.push(e==s);case TestSearch.#T:return this.#d.push(e!=s);case TestSearch.#s:return this.#d.push(e&&s);case TestSearch.#e:return this.#d.push(e||s);case TestSearch.#p:return this.#d.push(new RegExp(s).test(e));default:throw new Error("Operación no implementada, en línea "+this.#l.tokenLin()+", columna "+this.#l.tokenCol())}}#E(t){return t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}eval(t,s){this.#u=null,this.#d=[],this.#_=this.#E(t),this.#l.setText(this.#E(s)),this.#O=this.#l.nextToken();try{if(this.#f(),this.#O!==MiniScanner.eof)throw new Error('Inesperado "'+this.#l.getLexeme()+'", en línea '+this.#l.tokenLin()+", columna "+this.#l.tokenCol());const t=this.#d.pop();return"boolean"==typeof t?t:this.#_.indexOf(t)>=0}catch(t){return this.#u=t,!1}}get error(){return this.#u}#m(){return this.#O===TestSearch.#h||this.#O===TestSearch.#i||this.#O===TestSearch.#r||this.#O===TestSearch.#c||this.#O===TestSearch.#o||this.#O===TestSearch.#T}#f(){this.#g()}#g(){this.#N(),this.#L()}#L(){for(;this.#O===TestSearch.#e;)this.#O=this.#l.nextToken(),this.#N(),this.#x(TestSearch.#e)}#N(){this.#R(),this.#A()}#A(){for(;this.#O===TestSearch.#s;)this.#O=this.#l.nextToken(),this.#R(),this.#x(TestSearch.#s)}#R(){this.#m()?(this.#d.push(this.#_),this.#w()):this.#M()}#w(){for(;this.#m();){const t=this.#O;this.#O=this.#l.nextToken(),this.#M(),this.#x(t)}}#M(){if(this.#O===TestSearch.#t||this.#O===TestSearch.#S||this.#O===TestSearch.#k){const t=this.#O;this.#O=this.#l.nextToken(),this.#M();const s=this.#d.length-1;t===TestSearch.#t?"boolean"==typeof this.#d[s]?this.#d[s]=!this.#d[s]:this.#d[s]=!(this.#_.indexOf(this.#d[s])>=0):t===TestSearch.#S?this.#d[s]=-this.#d[s]:this.#d[s]=+this.#d[s]}else this.#P()}#P(){if(this.#O===TestSearch.#a){if(this.#O=this.#l.nextToken(),this.#f(),this.#O!==TestSearch.#n)throw new Error('Se esperaba ")", en línea '+this.#l.tokenLin()+", columna "+this.#l.tokenCol())}else if(this.#O===MiniScanner.string)this.#d.push(this.#E(this.#l.getProcessedString()));else if(this.#O===MiniScanner.ident)this.#d.push(this.#E(this.#l.getLexeme()));else if(this.#O===MiniScanner.number)this.#l.getNumOverflow()?this.#d.push(this.#l.getLexeme()):this.#d.push(this.#l.getNum());else{if(this.#O===MiniScanner.eof&&0===this.#d.length)return void this.#d.push("");if(this.#O!==TestSearch.#p)throw new Error("Se esperaba una expresión de búsqueda, en línea "+this.#l.tokenLin()+", columna "+this.#l.tokenCol());if(this.#d.push(this.#_),this.#O=this.#l.nextToken(),this.#O!==MiniScanner.string)throw new Error("Se esperaba un literal de cadena, en línea "+this.#l.tokenLin()+", columna "+this.#l.tokenCol());this.#d.push(this.#E(this.#l.getLexeme().substring(1,this.#l.tokenLength()-1))),this.#x(TestSearch.#p)}this.#O=this.#l.nextToken()}}
            
            return new TestSearch();
        },        
        /**
         * Mensaje resumen para los elementos seleccionados.
         * @returns 
         */
        selectedItemsMessage() {
            const len = this.selectedItems.length;
            const str = this.selectedItems.map(si => si.title).join(', ');

            // Máxima longitud del mensaje cuando se indica un resumen
            // de los elementos seleccionados
            if (str.length >= 1 && str.length <= 48) {
                return str;
            }
            return len > 0 ? `${len} seleccionados` : `Nada seleccionado`;
        }
    },
    created() {
        // Estalece los estilos del componente
        this.setComponentStyles();
        // Al crearse el componente se emite un cambio en la selección
        this.$emit('selectedChanged', this.selectedItems);
    },
    mounted() {
        document.addEventListener('click', this.clickOutside);
    },
    unmounted() {
        document.removeEventListener('click', this.clickOutside);
    }
});
