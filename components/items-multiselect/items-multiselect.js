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

import TestSearch from './requirements/test-search.js';

export default {
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
        }        
    },
    computed: {
        filteredItems() {            
            return this.items.filter(item => {
                // El campo de título debe pasarse como cadena
                return this.testSearch.eval(String(item.title), this.textFilter)
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
};
