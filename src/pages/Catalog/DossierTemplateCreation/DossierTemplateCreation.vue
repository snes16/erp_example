<template>
    <div class="dossier_template">
        <div class="dossier_template-header"></div>
        <div class="dossier_template-title" :class="permission ? '' : '-show_border'">Шаблон досье модели</div>
        <div v-if="permission" class="dossier_template-add_parameter">
            <p class="dossier_template-add_parameter-text">Добавить параметр</p>
            <div class="dossier_template-add_parameter-button btn-add" @click="addDossiers"></div>
        </div>
            <div class="dossier_template-row" v-for="(dossierItem, index) in dossierList" :key="index">
                <p class="dossier_template-row-title">Название поля</p>
                <input
                    class="dossier_template-row-value"
                    placeholder="Укажите название"
                    v-model="dossierItem.title"
                    @change="changeDossierTitles(dossierItem)"
                    :disabled="!permission"
                >
                <div v-if="permission" class="dossier_template-row-delete glyphicon-trash_alt" @click="deleteDossiers(dossierItem)" />
            </div>
    </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
export default {
    name: 'dossier_template',
    props: {
        permission: Boolean
    },
    data() {
        return {
            dossierList: [],
        }
    },
    watch: {
        dossierTemplate: function(newDossier) {
            this.dossierList = JSON.parse(JSON.stringify(newDossier))
        }
    },
    created() {
        this.fetchDossierTemplate()
    },
    computed: {
        ...mapState('layout', ['helperOpened']),
        ...mapState('dossier', ['dossierTemplate'])
    },
    methods: {
        ...mapActions('layout', ['toggleHelper', 'blackoutScreen']),
        ...mapActions('dossier', ['fetchDossierTemplate', 'changeDossierTitle', 'deleteDossier', 'addDossier']),

        changeDossierTitles(dossier) {
            this.changeDossierTitle({id: dossier.id, title: dossier.title})
        },
        deleteDossiers(dossier) {
            this.deleteDossier(dossier)
        },
        addDossiers() {
            this.addDossier()
        }
    }
};
</script>