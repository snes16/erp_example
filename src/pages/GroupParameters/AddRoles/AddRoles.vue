<template>
    <div class="add_roles">
        <div class="add_roles-header"></div>
        <p class="add_roles-link" @click="groupParameter()">
            &lt; {{ accessProp.title || 'Назад' }}
        </p>
        <h1 class="add_roles-title">
            Выберите роли, которые будут иметь доступ к параметрам заявки
        </h1>
        <b-input-group class="access_settings-search add_roles-search_field">
            <b-input-group-text slot="append"><i class="fa fa-search" /></b-input-group-text>
            <b-form-input  type="text" placeholder="Поиск" v-model="selectedRole"></b-form-input>
        </b-input-group>
        <div class="add_roles-role" v-for="(role, index) in filtredRoles" :key="index">
            {{role.title}}
            <div class="custom-control custom-checkbox add_roles-checkbox">
                <input v-model="passedGroupParameter.roles"
                       :value="role.id"
                       type="checkbox"
                       :id="role.id"
                       class="custom-control-input"
                       @change="changeGroupParameter(passedGroupParameter)"
                >
                <label class="custom-control-label" :for="role.id"></label>
            </div>
        </div>
    </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
export default {
    name: 'RolesEdit',
    props: {
        accessProp: Object,
        newGroupRoles: Array
    },
    data() {
        return {
            selectedRole: '',
            status: '',
            passedGroupParameter: {}
        }
    },
    computed: {
        ...mapState('layout', ['helperOpened']),
        filtredRoles() {
            let role = this.selectedRole.toLowerCase();
            return this.roles.filter(item => {
                return role === '' ? true : item.title.toLowerCase().includes(role);
            })
        },
        roles() {
            return this.$store.state.dictionaries.roles
        }
    },
    watch: {
        accessProp: function(newParameter) {
            this.passedGroupParameter = JSON.parse(JSON.stringify(newParameter));
        }
    },
    created() {
        this.$store.dispatch('dictionaries/fetchRoles', { pagination: false });
        let passedGroupParameter = JSON.parse(JSON.stringify(this.accessProp));
        if (!passedGroupParameter.id) passedGroupParameter.roles = this.newGroupRoles;
        this.passedGroupParameter = passedGroupParameter;
    },
    methods: {
        ...mapActions('layout', ['toggleHelper']),
        ...mapActions('groupparameters', ['changeGroupParameters', 'changeGroupParameterStatus']),
        groupParameter() {
            this.$emit('group-parameter', this.passedGroupParameter.roles);
        },
        changeGroupParameter(payload) {
            if (this.passedGroupParameter.id) this.changeGroupParameters(payload);
        }
    }
};
</script>

<style src="./AddRoles.scss" lang="scss"></style>
