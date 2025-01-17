import itemsMultiselect from "./components/items-multiselect/items-multiselect.js";

const app = Vue.createApp({
    components: { itemsMultiselect },
    template: /*html*/`
        <div class="header">
            <items-multiselect :items="items"            
                @selectedChanged="onSelectedChanged" />
            <items-multiselect :items="items2" />
        </div>
        <div class="container">
            <div v-for="item of selectedItems" :key="item.key" class="item">
                {{ item.title }}
            </div>
        </div>        
    `,
    data() {
        return {            
            items: [{
                key: 'name',
                title: 'Nombre'
            }, {
                key: 'surname',
                title: 'Apellidos',
                selected: true
            }, {
                key: 'address',
                title: 'Dirección',
                selected: true
            }, {
                key: 'age',
                title: 'Edad'
            }, {
                key: 'email',
                title: 'Email'
            }, {
                key: 'phone',
                title: 'Teléfono'
            }, {
                key: 'job',
                title: 'Trabajo'
            }, {
                key: 'company',
                title: 'Empresa \' Búsqueda'
            }],
            selectedItems: [],
            items2: []
        };
    },
    methods: {
        onSelectedChanged(selectedItems) {
            this.selectedItems = selectedItems;
        }
    },
    created() {
        for (let i = 1; i <= 4000; i++) {
            this.items2.push({
                key: `id${i}`,
                title: i,
                selected: true
            })
        }
    }
}); 

export default app;