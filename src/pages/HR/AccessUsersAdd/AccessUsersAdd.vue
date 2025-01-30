<template>
  <form class="vacancy_creation-access_modal" @submit.prevent="editUsers">
    <div class="users_add-header">
      <button-throbber variant="outline-primary"
                       size="sm"
                       type="submit"
                       colorThrobber="primary"
                       class="vacancy_creation-view_access-modal-button"
                       :class="!chosenUsers.length ? '-disabled' : ''"
                       :disabled="!chosenUsers.length"
                       :loading="isEditingLoading"
      >Добавить сотрудника
      </button-throbber>
    </div>
    <div class="theme-helper-content-main-subheader">
      <div class="theme-helper-content-main-subheader-link" @click="clickBack">
        <i class="fa fa-angle-left"></i>
        <span>Описание вакансии</span>
      </div>
    </div>
    <h4 class="assign-operators-title mb-2 pt-3">Добавить сотрудников</h4>
    <div class="users_add-body-search">
      <b-input-group>
        <b-input-group-text slot="append">
          <search/>
        </b-input-group-text>
        <b-form-input v-model="searchString"
                      id="users-add-search"
                      placeholder="Поиск"
                      @input="onInputSearchString"
        />
      </b-input-group>
    </div>
    <div class="vacancy_creation-view_access-modal" @scroll="handleScroll">
      <div v-for="role in formattedUsers" :key="role.id" class="users_add-body-roles-role">
        <div class="vacancy_creation-view_access-modal-role" @click="toggleCollapse(role.code)">
          <b>{{ role.title }}</b>
          <div class="users_add-body-roles-role-main-actions">
            <i class="fa fa-angle-down angle mr-2" :class="{'-active': collapseStatuses[role.code]}"/>
          </div>
        </div>
        <b-collapse :visible="!collapseStatuses[role.code]" class="users_add-body-roles-role-users">
          <div v-for="user in role.users" class="vacancy_creation-view_access-modal-user-list" :ref="`user-add-${user.id}`" :key="user.id">
            <avatar class="mr-3 ml-2"
                    :url="user.smallAvatar"
                    :telegram="user.telegram_connected"
                    :is-fin-admin="user.is_fin_admin"
            />
            <div class="vacancy_creation-view_access-modal-user-info">
                <template v-if="!user.uid || !user.fullname">
                  <span class="vacancy_creation-view_access-modal-user-info-fullname">
                    {{ user.uid || user.fullname }}
                  </span>
                </template>
                <template v-else>
                  <span class="vacancy_creation-view_access-modal-user-info-fullname text-gray">{{ user.uid }}</span>
                  <span class="vacancy_creation-view_access-modal-user-info-fullname ml-2">{{ user.fullname }}</span>
                </template>
            </div>
            <div class="vacancy_creation-view_access-modal-user-info">
              <div v-if="user.main_group" class="d-flex align-items-center">
                <span class="vacancy_creation-view_access-modal-user-info-office">{{ user.main_group.office || user.main_group.city || user.main_group.country}}</span>
              </div>
            </div>
            <div class="custom-control custom-checkbox">
              <input v-model="chosenUsers"
                     type="checkbox"
                     :value="user.id"
                     class="custom-control-input"
                     :id="'add-' + user.id"
              >
              <label class="custom-control-label" :for="'add-' + user.id"></label>
            </div>
          </div>
        </b-collapse>
      </div>
    </div>
  </form>
</template>

<script>
import Avatar from "@/components/Common/Avatar/Avatar";
import {getSmallImage} from "@/tools/tools";
import buttonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber.vue";
import search from "@/assets/vue-svg/search.svg";

export default {
  name: 'access-users-add',
  props: {
    vacancyProp: Object,
    visibleUsers: Array,
  },
  components: {
    'search': search,
    Avatar,
    buttonThrobber,
  },
  data() {
    return {
      searchString: '',
      chosenUsers: [],
      collapseStatuses: {},
    }
  },
  computed: {
    status() {
      return this.$store.state.users.status;
    },
    editStatus() {
      return this.$store.state.hr.editStatus;
    },
    users() {
      return this.$store.state.users.currentUsers;
    },
    usersHeaders() {
      return this.$store.state.users.currentUsersHeaders;
    },
    isEditingLoading() {
      return this.editStatus === 'editing';
    },
    formattedUsers() {
      const roles = [];
      let role = {};
      this.users.forEach(user => {
        const formattedUser = {
          ...user,
          smallAvatar: user.avatar ? getSmallImage(user.avatar) : null,
        }
        if (user.role.code !== role.code) {
          role = {
            ...user.role,
            users: [formattedUser],
          };
          roles.push(role);
        } else role.users.push(formattedUser);
      });
      return roles;
    },
  },
  created() {
    this.getUsers();
  },
  methods: {
    clickBack() {
      this.$emit('back');
    },
    editUsers() {
      this.$store.dispatch('hr/changeCurrentVacancy', {
        id: this.vacancyProp.id,
        users_access: [...this.chosenUsers, ...this.visibleUsers],
      });
    },
    getUsers(page = 1) {
      let query = {
        is_active: true,
        exclude_view_access_users: this.vacancyProp.id,
        page,
        search: this.searchString,
        'order[role]': 'asc',
        per_page: 20
      };
      this.$store.dispatch('users/fetchCurrentUsers', query);
    },
    handleScroll(e) {
      if ((this.status === 'fetching') || (this.usersHeaders.currentPage >= this.usersHeaders.totalPages) || !this.users.length) return;
      const anchorElementId = this.users[this.users.length - 2].id;
      if (this.$refs[`user-add-${anchorElementId}`]?.[0] && (this.$refs[`user-add-${anchorElementId}`][0].getBoundingClientRect().top <= e.target.getBoundingClientRect().top + e.target.getBoundingClientRect().height))
        this.getUsers(this.usersHeaders.currentPage + 1);
    },
    onInputSearchString() {
      const searchString = this.searchString;
      setTimeout(() => {
        if (searchString === this.searchString) this.changeFilters();
      }, 1000);
    },
    toggleCollapse(code) {
      this.collapseStatuses = {
        ...this.collapseStatuses,
        [code]: !this.collapseStatuses[code],
      };
    },
    changeFilters() {
      this.chosenUsers = [];
      this.getUsers();
    },
  }
}
</script>