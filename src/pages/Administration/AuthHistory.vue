<template>
  <div class="auth_history">
    <div class="auth_history-header">
      <h3>История авторизаций</h3>
      <b-button v-if="userPermissions.admin.authorizationHistory.edit && formattedAuthHistoryUsers.length"
                class="auth_history-header-button"
                variant="outline-warning"
                :disabled="!activeAccounts.length"
                v-b-modal.restore_password_modal
      >Сбросить пароль</b-button>
    </div>
    <div class="roles">
      <div class="roles-sidebar">
        <ul class="roles-sidebar-links">
          <li v-for="(role, index) in filteredRoles" :key="index"
              class="roles-sidebar-links-link"
              :class="role.role === activeRoleCode ? '-active' : ''"
              @click="chooseRole(role.role)"
          >
            <span>{{ role.role_title }}</span>
            <b-badge v-if="role.count && (role.count !== '0')"
                     :variant="role.role === activeRoleCode ? 'primary' : 'custom'"
                     class="roles-sidebar-links-link-badge"
            >{{ role.count }}</b-badge>
          </li>
        </ul>
      </div>
      <div class="roles-content">
        <div class="card pt-3">
          <div class="auth_history-body-search">
              <b-input-group>
                <b-input-group-text slot="append">
                  <search/>
                </b-input-group-text>
                <b-form-input v-model="searchString"
                              placeholder="Поиск"
                              type="text"
                              @input="inputSearchString"
                />
              </b-input-group>
          </div>
          <div class="auth_history-body-table">
            <div class="auth_history-body-table-header">
              <div class="auth_history-body-table-cell -user">Пользователь</div>
              <div class="auth_history-body-table-cell -date">
                <span>дата входа</span>
                <i class="fa fa-chevron-down auth_history-body-table-cell-arrow"
                   :class="{'-active': (sortBy === 'user_authorizations.authorization_date') && sortAscending}"
                   @click="sortTable('user_authorizations.authorization_date')"
                />
              </div>
              <div class="auth_history-body-table-cell -ip">
                <span>ip адрес</span>
                <i class="fa fa-chevron-down auth_history-body-table-cell-arrow"
                   :class="{'-active': (sortBy === 'user_authorizations.ip') && sortAscending}"
                   @click="sortTable('user_authorizations.ip')"
                />
              </div>
              <div class="auth_history-body-table-cell -device">
                <span>устройство</span>
                <i class="fa fa-chevron-down auth_history-body-table-cell-arrow"
                   :class="{'-active': (sortBy === 'user_authorizations.user_agent') && sortAscending}"
                   @click="sortTable('user_authorizations.user_agent')"
                />
              </div>
              <div class="auth_history-body-table-cell -action"></div>
            </div>
            <div class="auth_history-body-table-body">
              <div v-for="user in formattedAuthHistoryUsers" v-if="user.authorizations.length" class="auth_history-body-table-body-user">
                <div class="auth_history-body-table-body-row">
                  <div class="auth_history-body-table-cell -user" @click="openMiniProfile(user.id)">
                    <p v-if="user.uid" class="text-gray-text mb-0"><b>{{ user.uid }}</b></p>
                    <p v-if="user.fullname" class="mb-0"><b>{{ user.fullname }}</b></p>
                    <div v-if="user.model_nickname" class="d-flex align-items-center">
                      <at class="flex-shrink-0 mr-1"/>
                      <span>{{ user.model_nickname }}</span>
                    </div>
                  </div>
                  <div class="auth_history-body-table-cell -date">{{ user.authorizations[0].authorization_date }}</div>
                  <div class="auth_history-body-table-cell -ip">
                    <template v-if="user.authorizations[0].group">
                      <span :id="`auth-history-${ user.authorizations[0].id }`"
                            :class="`flag-icon-${ user.authorizations[0].group.flag || 'default'}`"
                            class="mr-2 flag-icon"
                      ></span>
                      <b-tooltip :target="`auth-history-${ user.authorizations[0].id }`"
                                 custom-class="country-name"
                                 triggers="hover"
                      >{{ user.authorizations[0].group.country }}</b-tooltip>
                      <div>
                        <p class="mb-0"><b>{{ user.authorizations[0].group.office }}</b></p>
                        <p class="mb-0">{{ user.authorizations[0].group.city }}</p>
                      </div>
                    </template>
                    <template v-else>
                      <template v-if="user.authorizations[0].country">
                        <span :id="`auth-history-${ user.authorizations[0].id }`"
                              :class="`flag-icon-${ user.authorizations[0].flag_type || 'default'}`"
                              class="mr-2 flag-icon"
                        ></span>
                        <b-tooltip :target="`auth-history-${ user.authorizations[0].id }`" custom-class="country-name" triggers="hover">
                          {{ user.authorizations[0].country }}
                        </b-tooltip>
                      </template>
                      <p v-if="user.authorizations[0].ip" class="mb-0">{{ user.authorizations[0].ip }}</p>
                    </template>
                  </div>
                  <div class="auth_history-body-table-cell -device">{{ user.authorizations[0].user_agent }}</div>
                  <div class="auth_history-body-table-cell -action">
                    <div class="abc-checkbox auth_history-body-table-cell-checkbox">
                      <input :id="`auth-history-box-${ user.id }`"
                             v-model="activeAccounts"
                             :value="user.id"
                             type="checkbox"
                      />
                      <label :for="`auth-history-box-${ user.id }`"/>
                    </div>
                    <i class="fa fa-angle-down auth_history-body-table-cell-arrow"
                       :class="{'-active': userCollapseStatuses[user.id]}"
                       @click="toggleUserCollapse(user.id)"
                    />
                  </div>
                </div>
                <b-collapse v-model="userCollapseStatuses[user.id]"
                            :id="`auth-history-user-collapse-${user.id}`"
                            class="auth_history-body-table-body-collapse"
                >
                  <div v-for="(authObject, key) in user.authorizations" v-if="key" class="auth_history-body-table-body-row">
                    <div class="auth_history-body-table-cell -user"></div>
                    <div class="auth_history-body-table-cell -date">{{ authObject.authorization_date }}</div>
                    <div class="auth_history-body-table-cell -ip">
                      <template v-if="authObject.group">
                        <span :id="`auth-history-${ authObject.id }`"
                              :class="`flag-icon-${ authObject.group.flag || 'default'}`"
                              class="mr-2 flag-icon"
                        ></span>
                        <b-tooltip :target="`auth-history-${ authObject.id }`"
                                   custom-class="country-name"
                                   triggers="hover"
                        >{{ authObject.group.country }}</b-tooltip>
                        <div>
                          <p class="mb-0"><b>{{ authObject.group.office }}</b></p>
                          <p class="mb-0">{{ authObject.group.city }}</p>
                        </div>
                      </template>
                      <template v-else>
                        <template v-if="authObject.country">
                          <span :id="`auth-history-${ authObject.id }`"
                                :class="`flag-icon-${ authObject.flag_type || 'default'}`"
                                class="mr-2 flag-icon"
                          ></span>
                          <b-tooltip :target="`auth-history-${ authObject.id }`" custom-class="country-name" triggers="hover">
                            {{ authObject.country }}
                          </b-tooltip>
                        </template>
                        <p v-if="authObject.ip" class="mb-0">{{ authObject.ip }}</p>
                      </template>
                    </div>
                    <div class="auth_history-body-table-cell -device">{{ authObject.user_agent }}</div>
                    <div class="auth_history-body-table-cell -action"></div>
                  </div>
                </b-collapse>
              </div>
            </div>
          </div>
          <b-pagination v-if="formattedAuthHistoryUsers.length !== 0"
                        v-model="currentPage"
                        :per-page="perPage"
                        :total-rows="authHistoryHeaders.totalItems"
                        align="left"

          />
          <div v-else class="auth_history-body-empty">
            <h3>История авторизаций пуста</h3>
            <span>Здесь пока ничего нет. Под данной ролью ещё никто не заходил.</span>
          </div>
        </div>
      </div>
    </div>
    <b-modal id="restore_password_modal"
             centered
             title="Вы уверены, что хотите сбросить пароль?"
             body-bg-variant="white"
             ok-title="Сбросить"
             ok-variant="primary"
             cancel-title="Отменить"
             cancel-variant="outline-primary"
             @ok="restorePasswords"
    >Email-уведомление с новым паролем придёт на почту admin@el-ws.com</b-modal>
    <helper>
      <mini-profile v-if="droverType === 'mini-profile'" :user-id="userId"/>
    </helper>
  </div>
</template>

<script>
import MiniProfile from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
import Helper from "@/components/Helper/Helper";
import at from "@/assets/vue-svg/at.svg";
import { showToast } from '@/tools/tools';
import moment from "moment";
import search from "@/assets/vue-svg/search.svg";

export default {
  name: 'auth-history',
  components: {
    'search': search,
    'mini-profile': MiniProfile,
    'helper': Helper,
    'at': at,
  },
  data() {
    return {
      activeAccounts: [],
      activeRoleCode: null,
      sortBy: 'user_authorizations.authorization_date',
      sortAscending: false,
      searchString: '',
      perPage: 10,
      userId: null,
      droverType: null,
      userCollapseStatuses: {},
    };
  },
  computed: {
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    roles() {
      return this.$store.state.authHistory.authHistoryRoles;
    },
    filteredRoles() {
      return this.roles.filter(role => role.role_title);
    },
    authHistoryUsers() {
      return this.$store.state.authHistory.authHistoryUsers;
    },
    authHistoryHeaders() {
      return this.$store.state.authHistory.authHistoryHeaders;
    },
    status() {
      return this.$store.state.authHistory.status;
    },
    columns() {
      if (this.userPermissions.admin.authorizationHistory.edit) return ['user', 'authorization_date', 'ip', 'user_agent', 'checkbox'];
      return ['user', 'authorization_date', 'ip', 'user_agent'];
    },
    formattedAuthHistoryUsers() {
      return this.authHistoryUsers.map(user => ({
        ...user,
        authorizations: user.authorizations.map(object => ({
          ...object,
          authorization_date: moment.parseZone(object.authorization_date).format('DD.MM.YYYY HH:mm'),
          last_action: moment.parseZone(object.last_action).format('DD.MM.YYYY HH:mm'),
        })),
      }));
    },
    currentPage: {
      get() {
        return this.authHistoryHeaders.currentPage || 1;
      },
      set(value) {
        this.getAuthHistory(value);
      },
    },
    userRoleType() {
      switch (this.activeRoleCode) {
        case 'ROLE_MODEL':
          return 'model';
        case 'ROLE_OPERATOR':
          return 'operator';
        default:
          return 'employee';
      }
    },
  },
  watch: {
    roles: function (newRoles) {
      if (!this.activeRoleCode && newRoles.length) this.chooseRole(newRoles[0].role);
    },
    activeRoleCode: function (newRoleCode) {
      this.activeAccounts = [];
    },
    status: function (newStatus, oldStatus) {
      if (oldStatus === 'resetting') {
        switch(newStatus) {
          case '':
            showToast(this.$toasted, 'Пароль успешно сброшен');
            this.activeAccounts = [];
            break;
          case 'error':
            showToast(this.$toasted, 'Ошибка сброса пароля. При повторном возникновнии обратитесь к администратору', 'error');
            this.activeAccounts = [];
            break;
        }
      }
    }
  },
  created() {
    this.$store.dispatch('authHistory/fetchAuthHistoryRoles');
  },
  methods: {
    getAuthHistory(page = this.authHistoryHeaders.page || 1) {
      this.$store.dispatch('authHistory/fetchAuthHistoryUsers', {
        ['role.code[]']: this.activeRoleCode,
        [`order[${this.sortBy}]`]: this.sortAscending ? 'asc' : 'desc',
        page,
        search: this.searchString || undefined,
      });
    },
    chooseRole(roleCode) {
      this.activeRoleCode = roleCode;
      this.getAuthHistory(1);
    },
    sortTable(field) {
      this.sortAscending = this.sortBy === field ? !this.sortAscending : true;
      this.sortBy = field;
      this.getAuthHistory(1);
    },
    inputSearchString() {
      let searchString = this.searchString;
      setTimeout(() => this.fetchSearchResults(searchString), 500);
    },
    fetchSearchResults(searchString) {
      if (searchString !== this.searchString) return;
      this.getAuthHistory();
    },
    restorePasswords() {
      this.$store.dispatch('authHistory/resetPasswords', this.activeAccounts);
    },
    openMiniProfile(userId) {
      if (this.userRoleType && this.userPermissions[this.userRoleType].profile.view) {
        this.userId = userId
        this.droverType = 'mini-profile';
        this.$store.dispatch('layout/toggleHelper', true)
      }
    },
    toggleUserCollapse(userId) {
      this.$root.$emit('bv::toggle::collapse', `auth-history-user-collapse-${userId}`);
    },
  }
}
</script>
