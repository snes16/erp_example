<!--TO BE DELETED-->
<template>
  <div class="groups">
    <div class="groups-nav">
      <div class="groups-nav-header">
        <h3>Группы</h3>
        <div v-if="userPermissions.group.main.edit" id="add-group" class="btn-add groups-nav-header-add"
             @click="createGroup"></div>
      </div>
      <div class="groups-nav-list">
        <group-block v-for="(group, key) in groups"
                     :key="key"
                     :group="group"
                     :activeGroupId="activeGroup.id"
                     :groupLevel="0"
                     @setActiveGroup="setActiveGroup"
        />
      </div>
    </div>
    <div class="groups-details">
      <div class="groups-details-card-container -main">
        <div class="groups-details-card">
          <div class="groups-details-card-header">
            <div class="groups-details-card-header-data">
              <h3 class="groups-details-card-header-data-title">
                <span v-if="shownGroup.type === 'country'" class="groups-details-card-header-data-title-flag flag-icon"
                      :class="`flag-icon-${shownGroup.settings && shownGroup.settings.flag || 'default'}`"></span>
                <span v-else class="color_picker-dot" :style="`background-color: ${shownGroup.color}`"></span>
                <template v-if="shownGroup.id !== activeGroup.id">
                  <template v-if="parentGroup.id && (activeGroup.id !== parentGroup.id)">
                    <span class="groups-details-card-header-data-title-parent -clickable" id="parent-group"
                          @click="onClickParentGroup">{{ activeGroup.title }} /.../&nbsp;</span>
                    <b-tooltip v-if="parentGroup.build_group" target="parent-group" triggers="hover click">
                      <span v-if="parentGroup.build_group.country || !parentGroup.build_group.title"
                            class="flag-icon mr-1" :class="`flag-icon-${parentGroup.build_group.flag || 'default'}`"
                            :title="parentGroup.build_group.country"></span>
                      <span v-else>{{ parentGroup.build_group.title }}</span>
                      <span class="text-gray mr-1">{{ parentGroup.build_group.city }}</span>
                      <span>{{ parentGroup.build_group.office }}</span>
                    </b-tooltip>
                  </template>
                  <span v-else class="groups-details-card-header-data-title-parent">{{
                      activeGroup.title
                    }} /&nbsp;</span>
                </template>
                <span
                    v-if="shownGroup.is_system || !(shownGroup.sub_type === 'operator' ? userPermissions.group.operator.edit : userPermissions.group.main.edit)"
                    id="group-title">{{ shownGroup.title }}</span>
                <template v-else>
                  <input id="title" type="text" v-model="shownGroup.title"
                         class="input-plain groups-details-card-header-data-title-text"
                         :disabled="shownGroup.deactivate_at !== null"
                         v-autowidth="{maxWidth: '960px', minWidth: '20px', comfortZone: 4}" @change="editShownGroup"/>
                  <div v-if="shownGroup.deactivate_at">
                    <label for="title" class="groups-details-card-header-data-title-btn btn-cross"
                           :id="`deactivated-${shownGroup.id}`"></label>
                    <b-tooltip :target="`deactivated-${shownGroup.id}`" triggers="hover click">
                      <div class="profile-main-info-data-resign-tooltip">
                        <div>Офис деактивирован</div>
                        <div><b>Дата деактивации: </b>{{ showDateDeactivated(shownGroup.deactivate_at) }}</div>
                      </div>
                    </b-tooltip>
                  </div>
                  <div v-else>
                    <label for="title" class="groups-details-card-header-data-title-btn btn-edit"></label>
                  </div>
                </template>
              </h3>
              <div class="groups-details-card-header-data-additional">
                <span v-if="shownGroup.is_system"
                      class="groups-details-card-header-data-additional-type">Системная</span>
                <span v-else class="groups-details-card-header-data-additional-type">{{
                    groupTypes[shownGroup.type]
                  }}</span>
              </div>
            </div>
            <div class="groups-details-card-header-actions">
              <b-button
                  v-if="shownGroup.type && (shownGroup.sub_type === 'operator' ? userPermissions.group.operator.edit : userPermissions.group.main.edit)"
                  variant="outline-primary"
                  id="show-settings"
                  class="groups-details-card-header-actions-button"
                  @click="showGroupSettings"
              >Настройки</b-button>
              <b-button
                  v-if="!shownGroup.is_system && (shownGroup.sub_type === 'operator' ? userPermissions.group.operator.edit : userPermissions.group.main.edit)"
                  variant="outline-danger"
                  class="groups-details-card-header-actions-button"
                  v-b-modal.delete_modal
                  id="remove-group"
                  @click="chooseGroupForDeletion(shownGroup)"
              >Удалить группу</b-button>
            </div>
          </div>
          <b-navbar v-if="userPermissions.group.main.view" toggleable="sm" class="profile-main-tabs">
            <div class="profile-main-tabs-toggle">
              <span class="text-primary">{{ shownUserRoleDetails.title }} <span v-if="!!Number(shownUserRoleDetails.quantity)">({{ shownUserRoleDetails.quantity }})</span></span>
              <b-navbar-toggle target="tabs-collapse"></b-navbar-toggle>
            </div>
            <b-collapse id="tabs-collapse" is-nav>
              <a class="nav-link"
                 :class="{'active': shownUserRole === 'employees'}"
                 href="#"
                 @click.prevent="setShownUserRole('employees')"
              >Сотрудники <span v-if="shownGroupCounter.employees && !!Number(shownGroupCounter.employees.all)">({{ shownGroupCounter.employees.all }})</span></a>
              <a v-if="!(shownGroup.type === 'office' && shownGroup.sub_type === 'operator')"
                 class="nav-link"
                 :class="{'active': shownUserRole === 'models'}"
                 href="#"
                 @click.prevent="setShownUserRole('models')"
              >Модели <span v-if="shownGroupCounter.models && !!Number(shownGroupCounter.models.all)">({{ shownGroupCounter.models.all }})</span></a>
              <a v-if="userPermissions.group.operator.view"
                 class="nav-link"
                 :class="{'active': shownUserRole === 'operators'}"
                 href="#"
                 @click.prevent="setShownUserRole('operators')"
              >Операторы <span v-if="shownGroupCounter.operators && !!Number(shownGroupCounter.operators.all)">({{ shownGroupCounter.operators.all }})</span></a>
            </b-collapse>
          </b-navbar>
        </div>
      </div>
      <div class="groups-details-card-container">
        <div class="groups-details-card">
          <div class="groups-details-card-body">
            <div class="groups-details-card-body-subheader -actions -borderless">
              <div class="groups-details-card-body-subheader-main">
                <h3 class="groups-details-card-body-subheader-title">
                  {{
                    (shownUserRole === 'operators') ? 'Операторы' : (shownUserRole === 'models') ? 'Модели' : 'Сотрудники'
                  }}</h3>
                <div
                    v-if="!shownGroup.is_system && (shownGroup.sub_type === 'operator' ? (userPermissions.group.operator.edit || isOperatorsOfficeManager) : (((shownUserRole !== 'operators') || (shownGroup.type === 'office')) && userPermissions.group.main.edit))"
                    id="add-user" class="btn-add groups-nav-header-add" @click="addUsers"></div>
              </div>
              <div class="groups-details-card-body-subheader-actions -long">
                <div v-if="shownGroup.counter && userPermissions.group.deactivate.view"
                     class="groups-details-card-body-subheader-actions-blocked">
                  <div class="btn btn-default btn-sm btn-tab"
                       :class="showBlockedUsers ? '' : 'active'" id="status-filter-active-user"
                       @click="setBlockedFilter(false)"
                  >Активные <span v-if="shownGroup.counter[shownUserRole] && !!Number(shownGroup.counter[shownUserRole].active)">{{shownGroup.counter[shownUserRole].active}}</span></div>
                  <div class="btn btn-default btn-sm btn-tab"
                       :class="showBlockedUsers ? 'active' : ''" id="status-filter-inactive-user"
                       @click="setBlockedFilter(true)"
                  >Неактивные <span v-if="shownGroup.counter[shownUserRole] && !!Number(shownGroup.counter[shownUserRole].inactive)">{{shownGroup.counter[shownUserRole].inactive}}</span></div>
                </div>
                <div class="groups-details-card-body-subheader-actions-collapse ml-3"
                     v-b-toggle.collapse-users>
                </div>
                <span
                    v-if="!shownGroup.is_system && (shownGroup.sub_type === 'operator' ? (userPermissions.group.operator.edit || isOperatorsOfficeManager) : userPermissions.group.main.edit)"
                    class="glyphicon glyphicon-trash_alt ml-2 groups-details-card-body-subheader-actions-delete"
                    id="users-delete" @click="showUsersDeletionModal"/>
              </div>
            </div>
            <div class="groups-details-card-body-search">
              <b-input-group>
                <b-input-group-text slot="append"><i class="fa fa-search"/></b-input-group-text>
                <b-form-input v-model="searchString" type="text" placeholder="Поиск"></b-form-input>
              </b-input-group>
            </div>
            <b-collapse id="collapse-users" :visible="true">
              <div v-if="shownUsers && shownUsers.length || statusUsers === 'first-request' || statusUsers === 'request'" class="groups-details-card-body-list -users" @scroll="handleUsersScroll">
                <template v-if="statusUsers !== 'first-request'">
                  <div v-for="(user, key) in shownUsers" class="groups-details-card-body-list-item"
                       :key="key" @click="showUser(user)">
                    <div class="groups-details-card-body-list-item-cell -user"
                         :class="{'-full': shownGroup.is_system || !ifUserIncludedInShownGroup(user) || !(shownGroup.sub_type === 'operator' ? (userPermissions.group.operator.edit || isOperatorsOfficeManager) : userPermissions.group.main.edit)}"
                         :ref="`users-${key}`"
                         :id="`test-${key}`"
                    >
                      <avatar size="-lg"
                              :url="user.avatar"
                              is-large
                              :telegram="user.telegram_connected"
                              :is-fin-admin="user.is_fin_admin"
                      />
                      <div class="groups-details-card-body-list-item-cell-name">
                        <div class="d-flex align-items-center">
                          <b class="text-nowrap">
                            <template v-if="!user.uid || !user.fullname">
                              {{ user.uid || user.fullname }}
                            </template>
                            <template v-else>
                              <span class="text-gray mr-1">{{ user.uid }}</span>
                              <span>{{ user.fullname }}</span>
                            </template>
                          </b>
                          <user-resign-icon v-if="user.resign_date" :user="user" :id="`resign_info-${user.id}`" />
                          <div v-else-if="user.blocked" class="glyphicon-blocked"
                               v-b-tooltip.hover title="Сотрудник заблокирован"></div>
                          <template v-if="(shownUserRole === 'models') && user.new_model">
                            <div class="glyphicon glyphicon-new_model workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new ml-2" :id="`new-user-organization-${user.id}`"/>
                            <b-tooltip :target="`new-user-organization-${user.id}`" triggers="hover" placement="top">
                              <div class="text-center">Обратите внимание,<br />девушка работает недавно</div>
                            </b-tooltip>
                          </template>
                          <div v-if="user.is_solo" class="workshifts-card-main-body-office-room-shifts-period-shift-cell-text-solo ml-2">Соло</div>
                        </div>
                        <template v-if="user.main_group">
                          <span :id="`user-group-${key}`" class="groups-details-card-body-list-item-cell-name-group">{{ user.main_group.title }}</span>
                          <b-tooltip v-if="user.main_group.build_group && user.main_group.build_group.country && user.main_group.build_group.city"
                                     :target="`user-group-${key}`"
                                     triggers="hover"
                                     placement="bottom"
                          >
                            <span class="flag-icon mr-1"
                                  :class="`flag-icon-${user.main_group.build_group.flag || 'default'}`"
                                  :title="user.main_group.build_group.country"/>
                            <span class="text-gray mr-1">{{ user.main_group.build_group.city }}</span>
                            <span>{{ user.main_group.build_group.office }}</span>
                          </b-tooltip>
                        </template>
                        <div v-if="shownUserRole === 'employees'"
                             class="groups-details-card-body-list-item-cell-role"
                        >{{ user.role.title }}</div>
                      </div>
                    </div>
                    <div v-if="!shownGroup.is_system && ifUserIncludedInShownGroup(user)"
                         class="groups-details-card-body-list-item-cell -delete"
                         @click="stopPropagation">
                      <template
                          v-if="(shownGroup.sub_type === 'operator' ? (userPermissions.group.operator.edit || isOperatorsOfficeManager) : userPermissions.group.main.edit)">
                        <div class="abc-checkbox groups-details-card-body-list-item-cell-checkbox">
                          <input type="checkbox" :value="user.id" v-model="chosenUsers"
                                 :id="`user-${user.id}-checkbox`"/>
                          <label :for="`user-${user.id}-checkbox`"/>
                        </div>
                        <span class="glyphicon glyphicon-trash_alt" v-b-modal.delete_user_modal
                              :id="`user-${user.id}-delete`" @click="deleteUser(user)"/>
                      </template>
                    </div>
                  </div>
                </template>
                <div v-if="statusUsers === 'first-request' || statusUsers === 'request'" class="groups-details-card-body-list-throbber">
                  <throbber class="throbber -sm"/>
                </div>
              </div>
              <div v-else class="groups-details-card-body-list -empty">
                В данной группе
                {{(shownGroup.sub_type === 'operator') || (shownUserRole === 'operators') ? 'операторов' : (shownUserRole === 'models') ? 'моделей' : 'сотрудников' }}
                не найдено
              </div>
            </b-collapse>
          </div>
        </div>
      </div>
      <div v-if="!(shownGroup.is_system || (shownGroup.type === 'office' && shownGroup.sub_type === 'operator'))" class="groups-details-card-container">
        <div class="groups-details-card">
          <div class="groups-details-card-body">
            <div class="groups-details-card-body-subheader -actions">
              <div class="groups-details-card-body-subheader-main">
                <h3 class="groups-details-card-body-subheader-title">Подгруппы</h3>
                <div
                    v-if="((shownUserRole === 'operators') && (shownGroup.type === 'city') ? userPermissions.group.operator.edit : userPermissions.group.main.edit)"
                    id="add-subgroup" class="btn-add groups-nav-header-add" @click="createSubgroup"></div>
              </div>
              <div class="groups-details-card-body-subheader-actions">
                <div v-if="shownGroup.type === 'city'"
                     class="groups-details-card-body-subheader-actions-blocked">
                  <div class="btn btn-default btn-sm btn-tab"
                       :class="showDeactivatedGroup ? '' : 'active'" id="status-filter-active-group"
                       @click="setDeactivatedFilter(false)">Активные
                  </div>
                  <div class="btn btn-default btn-sm btn-tab"
                       :class="showDeactivatedGroup ? 'active' : ''" id="status-filter-inactive-group"
                       @click="setDeactivatedFilter(true)">Неактивные
                  </div>
                </div>
                <div class="groups-details-card-body-subheader-actions-collapse ml-3"
                     v-b-toggle.collapse-subgoups>
                </div>
              </div>
            </div>
            <b-collapse v-if="showSubgroupCityOffice && showSubgroupCityOffice.length" id="collapse-subgoups"
                        class="groups-details-card-body-list" :visible="true">
              <div v-for="(child, key) in showSubgroupCityOffice" v-if="!child.is_deleted"
                   class="groups-details-card-body-list-item" :key="key" @click="onClickSubgroup(child)">
                <div class="groups-details-card-body-list-item-cell -user"
                     :class="{'-full': child.sub_type === 'operator' ? !userPermissions.group.operator.edit : !userPermissions.group.main.edit}">
                  <div class="groups-nav-list-group-container-color"
                       :style="`background-color: ${child.color || 'red'}`"></div>
                  <span>{{ child.title }}</span>
                  <template v-if="child.deactivate_at">
                    <label for="title" class="groups-details-card-header-data-title-btn btn-cross"
                           :id="`deactivated-child-${child.id}`"></label>
                    <b-tooltip :target="`deactivated-child-${child.id}`" triggers="hover click">
                      <div class="profile-main-info-data-resign-tooltip">
                        <div>Офис деактивирован</div>
                        <div><b>Дата деактивации: </b>{{ showDateDeactivated(child.deactivate_at) }}
                        </div>
                      </div>
                    </b-tooltip>
                  </template>
                  <div class="groups-details-card-body-list-item-cell-quantity">{{countUsersInSubgroup(child)}}</div>
                </div>
                <div v-if="(child.sub_type === 'operator' ? userPermissions.group.operator.edit : userPermissions.group.main.edit)"
                     class="groups-details-card-body-list-item-cell -delete"
                     @click.stop
                >
                  <span class="glyphicon glyphicon-trash_alt"
                        :id="`subgroup-${child.id}-delete`"
                        v-b-modal.delete_modal @click="chooseGroupForDeletion(child)"
                  />
                </div>
              </div>
            </b-collapse>
          </div>
        </div>
      </div>
      <div v-if="(shownGroup.type === 'office') && (shownGroup.sub_type === 'model')" class="groups-details-card-container">
        <div class="groups-details-card">
          <div class="groups-details-card-body">
            <div class="groups-details-card-body-subheader">
              <h3 class="groups-details-card-body-subheader-title">Комнаты</h3>
              <!--                            <div v-if="userPermissions.group.main.edit" id="add-room" class="btn-add groups-nav-header-add" @click="clickCreateRoom"></div>-->
            </div>
            <div v-if="shownGroup.rooms && shownGroup.rooms.length" class="groups-details-card-body-list">
              <div v-for="(room, key) in shownGroup.rooms" v-if="!room.is_deleted"
                   class="groups-details-card-body-list-item" :key="key" @click="editRoom(room)">
                <div class="groups-details-card-body-list-item-cell -color">
                  <div class="groups-nav-list-group-container-color"
                       :style="`background-color: ${room.color || 'red'}`"></div>
                </div>
                <div class="groups-details-card-body-list-item-cell -title">{{ room.title }}</div>
                <div class="groups-details-card-body-list-item-cell -data"></div>
                <!--                                <div v-if="userPermissions.group.main.edit" class="groups-details-card-body-list-item-cell -delete"><span class="glyphicon glyphicon-trash_alt" :id="`room-${room.id}-delete`" @click.stop="showRoomDeletionModal(room)" /></div>-->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <helper contentClass="-paddingless">
      <group-creation v-if="droverType === 'create'"
                      :isSubgroup="newGroupIsSubgroup"
                      :parent-id="shownGroup.id"
                      :parent-group="shownGroup"
                      :is-operators-office="shownUserRole === 'operators'"
                      :type="shownUserRole"
      />
      <group-settings v-else-if="droverType === 'settings'"
                      :group="shownGroup"
                      @editGroup="editGroup"
      />
      <room-creation v-else-if="droverType === 'room'"
                     :originalRoom="activeRoom"
                     @close="closeDrover"
      />
      <mini-profile v-else-if="droverType === 'mini-profile'"
                    :userId="activeUserId"
                    :office-id="shownGroup.type === 'office' ? shownGroup.id : null"
      />
      <users-add v-else-if="droverType === 'users-add'"
                 :group="shownGroup"
                 :type="shownUserRole"
                 @createUser="createUser"
      />
      <user-create v-else-if="droverType === 'user-create'"
                   :group="shownGroup"
                   :type="shownUserRole"
                   @goBack="addUsers"
      />
    </helper>
    <b-modal id="delete_modal"
             centered
             :title="`Вы точно хотите удалить группу “${groupForDeletion.title}”?`"
             body-bg-variant="white"
             ok-title="Удалить"
             ok-variant="danger"
             cancel-title="Отменить"
             cancel-variant="outline-primary"
             @ok="deleteCurrentGroup">
      Это навсегда удалит группу и связанные с ней подгруппы. Эти группы больше не будут доступны вам или
      кому-либо еще.
    </b-modal>
    <b-modal id="delete_room_modal"
             centered
             :title="`Вы точно хотите удалить комнату “${roomForDeletion.title}”?`"
             body-bg-variant="white"
             ok-title="Удалить"
             ok-variant="danger"
             cancel-title="Отменить"
             cancel-variant="outline-primary"
             @ok="deleteCurrentRoom">
      Это навсегда удалит комнату. Её карточка больше не будет доступна вам или кому-либо еще.
    </b-modal>
    <b-modal id="delete_user_modal"
             centered
             title="Вы точно хотите исключить сотрудника из группы?"
             body-bg-variant="white"
             ok-title="Удалить"
             ok-variant="danger"
             cancel-title="Отменить"
             cancel-variant="outline-primary"
             @ok="removeCurrentUser">
      Его карточка перейдёт в категорию «Сотрудники без групп»
    </b-modal>
    <b-modal id="delete_users_modal"
             centered
             title="Вы точно хотите исключить сотрудников из группы?"
             body-bg-variant="white"
             ok-title="Удалить"
             ok-variant="danger"
             cancel-title="Отменить"
             cancel-variant="outline-primary"
             @ok="removeChosenUsers">
      Карточки сотрудников перейдут в категорию «Сотрудники без групп»
    </b-modal>
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex';
import Stub from "@/components/Stub/Stub.vue";
import GroupBlock from "./components/GroupBlock";
import ColorPicker from "@/components/Common/ColorPicker/ColorPicker";
import Select from "@/components/Common/Select/Select";
import Helper from '@/components/Helper/Helper.vue';
import GroupCreation from './components/GroupCreation/GroupCreation';
import GroupSettings from './components/GroupSettings/GroupSettings';
import RoomCreation from './components/RoomCreation/RoomCreation';
import MiniProfile from './components/UserDetails/UserDetails';
import UsersAdd from './components/UsersAdd/UsersAdd';
import UserCreate from './components/UserCreate/UserCreate';
import UserResignIcon from "@/components/Common/UserResignIcon";
import Avatar from "@/components/Common/Avatar/Avatar";
import info from '@/assets/vue-svg/info.svg';
import throbber from "@/assets/vue-svg/throbber.svg";
import moment from 'moment'
import {pluralize, updateList, getSmallImage, findInListRecursively} from "@/tools/tools";
import AvatarUpload from "../../../components/Common/AvatarUpload/AvatarUpload";

export default {
  name: 'Groups',
  components: {
    AvatarUpload,
    'color-picker': ColorPicker,
    'custom-select': Select,
    'group-block': GroupBlock,
    'helper': Helper,
    'group-creation': GroupCreation,
    'group-settings': GroupSettings,
    'room-creation': RoomCreation,
    'mini-profile': MiniProfile,
    'users-add': UsersAdd,
    'user-create': UserCreate,
    'avatar': Avatar,
    UserResignIcon,
    'stub': Stub,
    'info': info,
    'throbber': throbber,
  },
  data() {
    return {
      // activeGroup: {},
      color: {},
      isPickerActive: false,
      newGroupParentId: null,
      groupForDeletion: {},
      newGroupIsSubgroup: false,
      // activeRoom: {},
      droverType: '',
      showBlockedUsers: false,
      showDeactivatedGroup: false,
      chosenUsers: [],
      allRolesVariant: {
        title: 'Все сотрудники',
        value: null
      },
      // activeUserId: null,
      roomForDeletion: {},
      userForDeletion: {},
      // groupEditPermissions: false,
      shownGroup: {},
      // shownUserRole: 'employees',
      parentGroup: {},
      showGroupsForOperator: false,
      searchString: null,
      currentUsersGroups: {}
    }
  },
  computed: {
    ...mapState('groups', ['groups', 'groupTypes', 'status', 'newGroup', 'group', 'errorMessage', 'newRoom', 'updatedRoom', 'deletedRoomId']),
    ...mapState('dictionaries', ['timezones']),
    ...mapState('layout', ['layoutStatus']),
    ...mapState('users', ['newUser', 'updatedUser']),
    ...mapState('auth', ['user']),
    shownGroupEmployees() {
      return this.$store.state.groups.currentGroupEmployees;
    },
    shownGroupModels() {
      return this.$store.state.groups.currentGroupModels;
    },
    shownGroupOperators() {
      return this.$store.state.groups.currentGroupOperators;
    },
    shownGroupCounter() {
      if (!this.shownGroup?.counter) return {};
      let counters = {};
      for (const role in this.shownGroup.counter) {
        counters[role] = {
          ...this.shownGroup.counter[role],
          all: this.userPermissions.group.deactivate.view ? this.shownGroup.counter[role]?.all : this.shownGroup.counter[role]?.active,
        }
      }
      return counters;
    },
    /*currentGroupNestedOperators() {
        return this.$store.state.groups.currentGroupNestedOperators;
    },*/
    usersWithShownRole() {
      switch (this.shownUserRole) {
        case 'models':
          return this.shownGroupModels;
        case 'operators':
          return this.shownGroupOperators;
      }
      return this.shownGroupEmployees
    },
    shownUsers() {
      return this.usersWithShownRole.sort((firstUser, secondUser) => {
        let firstUserIncluded = this.ifUserIncludedInShownGroup(firstUser),
            secondUserIncluded = this.ifUserIncludedInShownGroup(secondUser);
        if (firstUserIncluded && !secondUserIncluded) return -1;
        if (!firstUserIncluded && secondUserIncluded) return 1;
        return 0;
      });
    },
    // filteredUsers() {
    //   if (!this.searchString) return this.shownUsers;
    //   let searchString = this.searchString.toLowerCase();
    //   return this.shownUsers.filter(user => user.fullname?.toLowerCase().includes(searchString) || user.uid?.toLowerCase().includes(searchString));
    // },
    /*usersNotBlockedNumber() {
        if (!(this.usersWithShownRole.length)) return 0;
        return this.usersWithShownRole.filter(user => !user.blocked && !user.resign_date).length;
    },*/
    userStatus() {
      return this.$store.state.users.status;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    checkId() {
      return this.activeUserId === (this.user && this.user.id);
    },
    profile() {
      return this.$store.getters["profile/shortProfile"](this.activeUserId);
    },
    activeUser() {
      return this.profile?.profile?.user || {};
    },
    activeUserGroups() {
      if (!this.activeUserId) return [];
      return this.profile?.profile?.groups.map(group => group.id) || [];
    },
    /*activeUserMainGroup() {
      if (!this.activeUserId) return null;
      return this.profile?.profile?.user?.main_group?.id || null;
    },*/
    groupEditPermissions() {
      return this.userPermissions[this.profile?.role?.code === 'ROLE_MODEL' ? 'model' : 'employee'].profile.group.edit;
    },
    shownSubgroups() {
      if (this.shownGroup.type !== 'city') return this.shownGroup.children;
      if (this.shownUserRole === 'operators') return this.shownGroup.children.filter(group => group.sub_type === 'operator');
      return this.shownGroup.children.filter(group => group.sub_type === 'model');
    },
    showSubgroupCityOffice() {
      if (this.shownGroup.type !== 'city') return this.shownSubgroups
      else return this.showDeactivatedGroup ? this.shownSubgroups.filter(group => group.deactivate_at !== null) : this.shownSubgroups.filter(group => group.deactivate_at === null)
    },
    isOperatorsOfficeManager() {
      return !!this.$store.state.auth.user.manager_operator_groups?.length;
    },
    headersGroupEmployees() {
      return this.$store.state.groups.headersGroupEmployees;
    },
    headersGroupModels() {
      return this.$store.state.groups.headersGroupModels;
    },
    headersGroupOperators() {
      return this.$store.state.groups.headersGroupOperators;
    },
    headersGroupCurrent() {
      switch (this.shownUserRole) {
        case 'operators':
          return this.headersGroupOperators;
        case 'models':
          return this.headersGroupModels;
      }
      return this.headersGroupEmployees;
    },
    statusUsers() {
      return this.$store.state.groups.statusUsers;
    },
    shownUserRoleDetails() {
      switch (this.shownUserRole) {
        case 'operators':
          return {
            title: 'Операторы',
            quantity: this.shownGroup?.counter?.operators?.all,
          };
        case 'models':
          return {
            title: 'Модели',
            quantity: this.shownGroup?.counter?.models?.all,
          };
      }
      return {
        title: 'Сотрудники',
        quantity: this.shownGroup?.counter?.employees?.all,
      };
    },
    activeGroupId() {
      let rawId = this.$route.query.group;
      return rawId && parseInt(rawId);
    },
    activeGroup() {
      return findInListRecursively(this.groups, (group) => group.id === this.activeGroupId, true) || {};
    },
    shownGroupId() {
      let rawId = this.$route.query.shown;
      return rawId && parseInt(rawId);
    },
    activeUserId() {
      let rawId = this.$route.query.user;
      return rawId && parseInt(rawId);
    },
    activeRoomId() {
      let rawId = this.$route.query.room;
      return rawId && parseInt(rawId);
    },
    activeRoom() {
      return this.shownGroup?.rooms?.find(room => room.id === this.activeRoomId) || {};
    },
    shownUserRole() {
      return this.$route.query.role || (this.userPermissions.group?.main?.view ? 'employees' : 'operators');
    },
  },
  watch: {
    groups: function (nextGroups, prevGroups) {
      if (!prevGroups.length && nextGroups.length) this.setDefaultGroup(nextGroups);
    },
    status: function (nextStatus, prevStatus) {
      if ((prevStatus === 'deleting') && (nextStatus === '')) {
        let deletedGroupName = this.groupForDeletion.title;
        this.$toasted.success(`Группа “${deletedGroupName}” удалена`, {
          position: 'bottom-left',
          keepOnHover: true,
          duration: 5000,
          action: [
            {
              text: 'Отменить',
              class: '-success',
              onClick: this.cancelDeletion(this.groupForDeletion.id)
            },
            {
              text: '',
              class: 'btn-close',
              onClick: this.closeToast
            }
          ]
        });
        this.shownGroup.children = this.shownGroup.children ? this.shownGroup.children.filter(child => child.id !== this.groupForDeletion.id) : [];
        // this.setDefaultGroup(this.groups);
        if (this.shownGroup.id === this.groupForDeletion.id) this.setActiveGroup(this.groups[0]);
      } else if ((prevStatus === 'creating') && (nextStatus === '')) this.toggleHelper(false);
      else if ((prevStatus === 'removing-user') && (nextStatus === '')) {
        this.$toasted.success(`Сотрудник исключен из группы`, {
          position: 'bottom-left',
          keepOnHover: true,
          duration: 5000,
          action: {
            text: '',
            class: 'btn-close',
            onClick: this.closeToast
          }
        });
        // this.getGroupUsers();
        this.$store.dispatch('groups/fetchGroup', this.shownGroup.id);
        this.updateGroupUsersLastPage();
      } else if ((prevStatus === 'removing-users') && (nextStatus === '')) {
        this.$toasted.success(`Сотрудники исключены из группы`, {
          position: 'bottom-left',
          keepOnHover: true,
          duration: 5000,
          action: {
            text: '',
            class: 'btn-close',
            onClick: this.closeToast
          },
        });
        // this.getGroupUsers();
        this.updateGroupUsersLastPage();
      } else if ((nextStatus === 'error') && (this.droverType !== 'add-groups')) this.$toasted.error(this.errorMessage || 'Ошибка', {
        position: 'bottom-left',
        keepOnHover: true,
        duration: 5000
      });
      else if ((nextStatus === '') && (prevStatus === 'adding-users')) {
        this.toggleHelper(false);
        this.getGroupUsers();
        this.$store.dispatch('groups/fetchGroup', this.shownGroup.id);
        this.$toasted.success('Сотрудники добавлены', {
          position: 'bottom-left',
          keepOnHover: true,
          duration: 5000,
          action: {
            text: '',
            class: 'btn-close',
            onClick: this.closeToast
          },
        });
      }
    },
    group: function (newGroup) {
      if (newGroup.id === this.shownGroup.id) this.shownGroup = {...newGroup};
    },
    newGroup: function (newGroup) {
      if (newGroup.parent && newGroup.parent.id === this.shownGroup.id) this.shownGroup.children = this.shownGroup.children && this.shownGroup.children.length ? [...this.shownGroup.children, newGroup] : [newGroup];
    },
    newRoom: function (newRoom) {
      if (newRoom.group === this.shownGroup.id) this.shownGroup.rooms = this.shownGroup.rooms && this.shownGroup.rooms.length ? [...this.shownGroup.rooms, newRoom] : [newRoom];
    },
    updatedRoom: function (newRoom) {
      if (newRoom.group === this.shownGroup.id) this.shownGroup.rooms = this.shownGroup.rooms && this.shownGroup.rooms.length ? updateList(this.shownGroup.rooms, newRoom) : [];
    },
    deletedRoomId: function (newRoomId) {
      this.shownGroup = {...this.shownGroup, rooms: this.shownGroup.rooms.filter(room => room.id !== newRoomId)};
    },
    layoutStatus: function (newStatus) {
      if (newStatus === 'blackout-screen-close') {
        this.droverType = '';
        if (this.activeUserId || this.activeRoomId) this.$router.push({
          name: this.$route.name,
          query: {
            ...this.$route.query,
            user: undefined,
            room: undefined,
          },
        });
      }
    },
    /*newUser: function (newUser) {
        if (newUser.groups.find(group => group.id === this.shownGroup.id)) {
            this.shownGroup = {...this.shownGroup, users: [...this.shownGroup.users, {...newUser, role_name: newUser.role.title}]};
            this.toggleHelper(false);
        }
    },*/
    updatedUser: function (newUser) {
      if (newUser.groups.find(group => group.id === this.shownGroup.id)) {
        this.shownGroup = {
          ...this.shownGroup,
          users: updateList(this.shownGroup.users, {...newUser, role_name: newUser.role.title})
        };
      }
    },
    userStatus: function (newStatus, prevStatus) {
      if (newStatus !== '') return;
      switch (prevStatus) {
        case 'resetting':
          this.$toasted.success(`Письмо с новым паролем отправлено на email сотрудника`, {
            position: 'bottom-left',
            keepOnHover: true,
            duration: 5000,
            action: {
              text: '',
              class: 'btn-close',
              onClick: this.closeToast
            }
          });
          break;
        case 'creating':
          /*this.$toasted.success(`Сотрудник создан`, {
            position: 'bottom-left',
            keepOnHover: true,
            duration: 5000,
            action: {
              text: '',
              class: 'btn-close',
              onClick: this.closeToast
            }
          });*/
          this.toggleHelper(false);
          this.getGroupUsers();
          this.$store.dispatch('groups/fetchGroup', this.shownGroup.id);
          break;
        case 'editing':
          if (this.droverType === 'add-groups') this.droverType = 'mini-profile';
      }
    },
    searchString: function () {
      this.getGroupUsers(this.shownUserRole);
    },
    userPermissions: function (newPermissions) {
      if (newPermissions.group.main.view) this.setShownUserRole('employees');
    },
    shownGroupId: function (newGroupId) {
      this.shownGroup = findInListRecursively(this.groups, (group) => group.id === newGroupId) || {};
      if (this.activeGroupId !== newGroupId) this.parentGroup = {...this.activeGroup};
      this.getGroupUsers();
      // this.findGroupToShow(this.groups, newGroupId, this.activeGroup.level);
    },
    activeUserId: function (newUserId) {
      if (newUserId) {
        this.droverType = 'mini-profile';
        this.toggleHelper(true);
      }
      else this.toggleHelper(false);
    },
    activeRoom: function (newRoom, prevRoom) {
      if (newRoom.id === prevRoom.id) return;
      if (newRoom.id) {
        this.droverType = 'room';
        this.toggleHelper(true);
      }
      else this.toggleHelper(false);
    },
  },
  created() {
    // this.shownUserRole = this.userPermissions.group?.main?.view ? 'employees' : 'operators';
    this.getGroups();
    this.$store.dispatch('dictionaries/fetchResources', {type: 'room'});
    this.getTimezones();
    this.$store.dispatch('groups/getGroupsNonSystem');
    this.$store.dispatch('dictionaries/fetchRoles');
    this.$store.dispatch('dictionaries/fetchGroupsNonSystem');
    this.$store.dispatch('dictionaries/getNationalities');
    this.$store.dispatch('roles/getRights');
    this.$store.dispatch('roles/getActions');
    if (this.groups.length) this.setDefaultGroup(this.groups);
    if (this.activeUserId) {
      this.droverType = 'mini-profile';
      this.toggleHelper(true);
    }
    this.$root.$on('showGroupFromStorage', this.setDefaultGroup);
  },
  destroyed() {
    this.$root.$off('showGroupFromStorage', this.setDefaultGroup);
  },
  methods: {
    ...mapActions('groups', ['getGroups', 'editGroup', 'deleteGroupUsers', 'deleteGroupUser', 'deleteGroup', 'createRoom', 'restoreGroup', 'deleteRoom']),
    ...mapActions('layout', ['toggleHelper']),
    ...mapActions('dictionaries', ['getTimezones']),
    ...mapActions('users', ['fetchUser']),
    setActiveGroup(group, level) {
      if (!this.$route.query.group) this.$router.replace({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          group: group.id,
          shown: group.id,
        },
      });
      else this.$router.push({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          group: group.id,
          shown: group.id,
        },
      });
      // this.activeGroup = {...group, level};
      // this.shownGroup = {...group};
      this.color = {hex: group.color};
      this.chosenUsers = [];
      this.showBlockedUsers = false;
      this.searchString = null;
      // this.getGroupUsers();
    },
    setDefaultGroup(groups = this.groups) {
      let groupToShowId = localStorage.getItem('groupToShow');
      if (!groupToShowId && this.shownGroupId) {
        this.shownGroup = findInListRecursively(this.groups, (group) => group.id === this.shownGroupId) || {};
        if (this.activeGroupId !== this.shownGroupId) this.parentGroup = {...this.activeGroup};
        this.getGroupUsers();
        return;
      }
      if (!groupToShowId && !this.shownGroupId) return this.setActiveGroup(groups[0]);
      // this.findGroupToShow(groups, parseInt(groupToShowId));
      this.$router.push({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          shown: groupToShowId || this.shownGroupId,
        },
      });
      localStorage.removeItem('groupToShow');
    },
    findGroupToShow(groups, groupToShowId, currentLevel = 0) {
      return groups.some(group => {
        if (group.id === groupToShowId) {
          this.shownGroup = group;
          // if (currentLevel < 2) this.activeGroup = group;
          return true;
        }
        if (!group.children?.length) return false;
        let isFoundInChildren = this.findGroupToShow(group.children, groupToShowId, currentLevel + 1);
        if (!isFoundInChildren) return false;
        if (currentLevel === 2) this.parentGroup = group;
        // else if (currentLevel === 1) this.activeGroup = group;
        return true;
      });
    },
    editShownGroup() {
      let group = {...this.shownGroup};
      delete group.children;
      delete group.rooms;
      delete group.users;
      delete group.parent;
      delete group.settings;
      this.editGroup(group);
    },
    chooseGroupForDeletion(group) {
      this.groupForDeletion = {...group};
    },
    deleteCurrentGroup() {
      this.deleteGroup(this.groupForDeletion.id);
    },
    createGroup() {
      this.newGroupIsSubgroup = false;
      this.droverType = 'create';
      this.toggleHelper(true);
    },
    createSubgroup() {
      this.newGroupIsSubgroup = true;
      this.droverType = 'create';
      this.toggleHelper(true);
    },
    showGroupSettings() {
      this.droverType = 'settings';
      this.toggleHelper(true);
    },
    cancelDeletion(id) {
      return (e, toast) => {
        this.closeToast(e, toast);
        this.restoreGroup(id);
      }
    },
    closeToast(e, toast) {
      toast.goAway(0);
    },
    /*clickCreateRoom() {
      this.createRoom({group: this.shownGroup.id, color: this.shownGroup.color});
      this.activeRoom = {group: this.shownGroup.id};
      this.droverType = 'room';
      this.toggleHelper(true);
    },*/
    editRoom(room) {
      this.$router.push({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          room: room.id,
        },
      });
      // this.activeRoom = room;
      // this.droverType = 'room';
      // this.toggleHelper(true);
    },
    showRoomDeletionModal(room) {
      // e.stopPropagation();
      // e.stopImmediatePropagation();
      this.roomForDeletion = room;
      this.$bvModal.show('delete_room_modal');
    },
    deleteCurrentRoom() {
      this.deleteRoom({...this.roomForDeletion, group: this.shownGroup.id});
    },
    setBlockedFilter(blocked) {
      this.showBlockedUsers = blocked;
      this.getGroupUsers();
    },
    setDeactivatedFilter(deactivated) {
      this.showDeactivatedGroup = deactivated;
    },
    showUser(user) {
      if (!this.userPermissions[user?.role?.code === 'ROLE_MODEL' ? 'model' : (user?.role?.code === 'ROLE_OPERATOR' ? 'operator' : 'employee')].profile.view) return;
      // this.activeUserId = user.id;
      this.$router.push({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          user: user.id,
        },
      });
    },
    deleteUser(user) {
      this.userForDeletion = user;
    },
    stopPropagation(e) {
      e.stopPropagation();
      e.stopImmediatePropagation();
    },
    addUsers() {
      this.droverType = 'users-add';
      this.toggleHelper(true);
    },
    createUser() {
      this.droverType = 'user-create';
      this.toggleHelper(true);
    },
    showUsersDeletionModal() {
      if (this.chosenUsers.length) this.$bvModal.show('delete_users_modal');
    },
    removeCurrentUser() {
      this.$store.dispatch('groups/removeUsersFromGroup', {
        groupId: this.shownGroup.id,
        users: [this.userForDeletion.id],
        operation: 'unset',
        type: this.shownGroup.sub_type,
        role: this.shownUserRole
      });
    },
    removeChosenUsers() {
      this.$store.dispatch('groups/removeUsersFromGroup', {
        groupId: this.shownGroup.id,
        users: this.chosenUsers,
        operation: 'unset',
        type: this.shownGroup.sub_type,
        role: this.shownUserRole
      });
    },
    onClickSubgroup(group) {
      if (this.activeGroup.level === 0) return this.setActiveGroup(group, 1);
      // this.parentGroup = {...this.shownGroup};
      // this.shownGroup = group;
      this.showBlockedUsers = false;
      this.$router.push({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          shown: group.id,
        },
      });
      // this.getGroupUsers();
    },
    setShownUserRole(role) {
      this.$router.push({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          role,
        },
      });
      this.getGroupUsers(role);
      this.searchString = null;
    },
    getGroupUsers(roleType = null) {
      if (this.shownGroup.type === 'office') {
        if (!roleType || roleType === 'operators') {
          this.$store.dispatch('groups/fetchCurrentGroupOperators', {
            currentGroup: this.shownGroup.id,
            query: {
              [this.shownGroup.sub_type === 'operator' ? 'operator_groups' : 'groups']: this.shownGroup.id,
              is_active: +!this.showBlockedUsers,
              per_page: 20,
              surname: this.searchString,
            },
          });
        }
        if (!roleType || roleType === 'employees') this.$store.dispatch('groups/fetchCurrentGroupUsers', {
          type: 'EMPLOYEES',
          currentGroup: this.shownGroup.id,
          query: {
            role_exclude: ['ROLE_MODEL', 'ROLE_OPERATOR'],
            groups: this.shownGroup.id,
            is_active: +!this.showBlockedUsers,
            per_page: 20,
            surname: this.searchString,
          }
        });
        if (this.shownGroup.sub_type === 'operator') return;
        if (!roleType || roleType === 'models') this.$store.dispatch('groups/fetchCurrentGroupUsers', {
          type: 'MODELS',
          currentGroup: this.shownGroup.id,
          query: {
            ['role']: 'ROLE_MODEL',
            groups: this.shownGroup.id,
            is_active: +!this.showBlockedUsers,
            per_page: 20,
            surname: this.searchString,
          }
        });
        return;
      }
      let groupsForUsers = [],
          groupsForOperators = [],
          operatorsOffices = [];
      this.getGroupsListForRequests(this.shownGroup, groupsForUsers, groupsForOperators, operatorsOffices);
      this.currentUsersGroups = {groupsForUsers, groupsForOperators, operatorsOffices};
      if (!roleType || (roleType === 'employees')) this.$store.dispatch('groups/fetchCurrentGroupUsers', {
        type: 'EMPLOYEES',
        currentGroup: this.shownGroup.id,
        query: {
          role_exclude: ['ROLE_MODEL', 'ROLE_OPERATOR'],
          groups: [...groupsForUsers, ...operatorsOffices],
          is_active: +!this.showBlockedUsers,
          per_page: 20,
          surname: this.searchString,
        }
      });
      if (!roleType || (roleType === 'models')) this.$store.dispatch('groups/fetchCurrentGroupUsers', {
        type: 'MODELS',
        currentGroup: this.shownGroup.id,
        query: {
          ['role']: 'ROLE_MODEL',
          groups: groupsForUsers,
          is_active: +!this.showBlockedUsers,
          per_page: 20,
          surname: this.searchString,
        }
      });
      if (operatorsOffices.length) {
        if (!roleType || (roleType === 'operators')) this.$store.dispatch('groups/fetchCurrentGroupOperators', {
          currentGroup: this.shownGroup.id,
          query: {
            operator_groups: operatorsOffices,
            is_active: +!this.showBlockedUsers,
            per_page: 20,
            surname: this.searchString,
          },
        });
      }
      else this.$store.dispatch('groups/clearCurrentGroupOperators');
    },
    getGroupUsersNextPage() {
      if (this.shownGroup.type === 'office') {
        switch (this.shownUserRole) {
          case 'operators':
            return this.$store.dispatch('groups/fetchCurrentGroupOperatorsNextPage', {
              currentGroup: this.shownGroup.id,
              query: {
                [this.shownGroup.sub_type === 'operator' ? 'operator_groups' : 'groups']: this.shownGroup.id,
                is_active: +!this.showBlockedUsers,
                page: this.headersGroupOperators.currentPage + 1,
                per_page: 20,
                surname: this.searchString
              },
            });
          case 'models':
            return this.$store.dispatch('groups/fetchCurrentGroupUsersNextPage', {
              type: 'MODELS',
              currentGroup: this.shownGroup.id,
              query: {
                ['role']: 'ROLE_MODEL',
                groups: this.shownGroup.id,
                is_active: +!this.showBlockedUsers,
                page: this.headersGroupModels.currentPage + 1,
                per_page: 20,
                surname: this.searchString
              }
            });
        }
        return this.$store.dispatch('groups/fetchCurrentGroupUsersNextPage', {
          type: 'EMPLOYEES',
          currentGroup: this.shownGroup.id,
          query: {
            role_exclude: ['ROLE_MODEL', 'ROLE_OPERATOR'],
            groups: this.shownGroup.id,
            is_active: +!this.showBlockedUsers,
            page: this.headersGroupEmployees.currentPage + 1,
            per_page: 20,
            surname: this.searchString
          }
        });
      }
      switch (this.shownUserRole) {
        case 'operators':
          return this.$store.dispatch('groups/fetchCurrentGroupOperatorsNextPage', {
            currentGroup: this.shownGroup.id,
            query: {
              operator_groups: this.currentUsersGroups.operatorsOffices,
              is_active: +!this.showBlockedUsers,
              page: this.headersGroupOperators.currentPage + 1,
              per_page: 20,
              surname: this.searchString
            },
          });
        case 'models':
          return this.$store.dispatch('groups/fetchCurrentGroupUsersNextPage', {
            type: 'MODELS',
            currentGroup: this.shownGroup.id,
            query: {
              ['role']: 'ROLE_MODEL',
              groups: this.currentUsersGroups.groupsForUsers,
              is_active: +!this.showBlockedUsers,
              page: this.headersGroupModels.currentPage + 1,
              per_page: 20,
              surname: this.searchString
            }
          });
      }
      return this.$store.dispatch('groups/fetchCurrentGroupUsersNextPage', {
        type: 'EMPLOYEES',
        currentGroup: this.shownGroup.id,
        query: {
          role_exclude: ['ROLE_MODEL', 'ROLE_OPERATOR'],
          groups: [...this.currentUsersGroups.groupsForUsers, ...this.currentUsersGroups.operatorsOffices],
          is_active: +!this.showBlockedUsers,
          page: this.headersGroupEmployees.currentPage + 1,
          per_page: 20,
          surname: this.searchString
        }
      });
    },
    updateGroupUsersLastPage() {
      if (this.shownGroup.type === 'office') {
        switch (this.shownUserRole) {
          case 'operators':
            return this.$store.dispatch('groups/fetchCurrentGroupOperatorsLastPage', {
              currentGroup: this.shownGroup.id,
              query: {
                [this.shownGroup.sub_type === 'operator' ? 'operator_groups' : 'groups']: this.shownGroup.id,
                is_active: +!this.showBlockedUsers,
                page: this.headersGroupOperators.currentPage,
                per_page: 20,
                surname: this.searchString
              },
            });
          case 'models':
            return this.$store.dispatch('groups/fetchCurrentGroupUsersLastPage', {
              type: 'MODELS',
              currentGroup: this.shownGroup.id,
              query: {
                ['role']: 'ROLE_MODEL',
                groups: this.shownGroup.id,
                is_active: +!this.showBlockedUsers,
                page: this.headersGroupModels.currentPage,
                per_page: 20,
                surname: this.searchString
              }
            });
        }
        return this.$store.dispatch('groups/fetchCurrentGroupUsersLastPage', {
          type: 'EMPLOYEES',
          currentGroup: this.shownGroup.id,
          query: {
            role_exclude: ['ROLE_MODEL', 'ROLE_OPERATOR'],
            groups: this.shownGroup.id,
            is_active: +!this.showBlockedUsers,
            page: this.headersGroupEmployees.currentPage,
            per_page: 20,
            surname: this.searchString
          }
        });
      }
      switch (this.shownUserRole) {
        case 'operators':
          return this.$store.dispatch('groups/fetchCurrentGroupOperatorsLastPage', {
            currentGroup: this.shownGroup.id,
            query: {
              operator_groups: this.currentUsersGroups.operatorsOffices,
              is_active: +!this.showBlockedUsers,
              page: this.headersGroupOperators.currentPage,
              per_page: 20,
              surname: this.searchString
            },
          });
        case 'models':
          return this.$store.dispatch('groups/fetchCurrentGroupUsersLastPage', {
            type: 'MODELS',
            currentGroup: this.shownGroup.id,
            query: {
              ['role']: 'ROLE_MODEL',
              groups: this.currentUsersGroups.groupsForUsers,
              is_active: +!this.showBlockedUsers,
              page: this.headersGroupModels.currentPage,
              per_page: 20,
              surname: this.searchString
            }
          });
      }
      return this.$store.dispatch('groups/fetchCurrentGroupUsersLastPage', {
        type: 'EMPLOYEES',
        currentGroup: this.shownGroup.id,
        query: {
          role_exclude: ['ROLE_MODEL', 'ROLE_OPERATOR'],
          groups: [...this.currentUsersGroups.groupsForUsers, ...this.currentUsersGroups.operatorsOffices],
          is_active: +!this.showBlockedUsers,
          page: this.headersGroupEmployees.currentPage,
          per_page: 20,
          surname: this.searchString
        }
      });
    },
    handleUsersScroll(e) {
      if ((this.statusUsers === 'request') || (this.headersGroupCurrent.currentPage >= this.headersGroupCurrent.totalPages)) return;
      let middleElement = this.headersGroupCurrent.perPage * this.headersGroupCurrent.currentPage - 10;
      if (this.$refs[`users-${middleElement}`]?.[0] && (this.$refs[`users-${middleElement}`][0].getBoundingClientRect().top <= e.target.getBoundingClientRect().top + e.target.getBoundingClientRect().height)) this.getGroupUsersNextPage();
    },
    getGroupsListForRequests(group, groupsForUsers, groupsForOperators, operatorsOffices) {
      if (group.type !== 'office') {
        groupsForUsers.push(group.id);
        groupsForOperators.push(group.id)
      } else if (!group.deactivate_at) {
        if (group.sub_type === 'model') groupsForUsers.push(group.id);
        else operatorsOffices.push(group.id);
      }
      if (group.children && group.children.length) return group.children.map(child => this.getGroupsListForRequests(child, groupsForUsers, groupsForOperators, operatorsOffices));
    },
    ifUserIncludedInShownGroup(user) {
      return user.groups.some(group => group.id === this.shownGroup.id) || user.operator_groups?.some(group => group.id === this.shownGroup.id);
    },
    countUsersInSubgroup(child) {
      if (!child.counter) return '';
      const currentNumberField = this.userPermissions.group.deactivate.view ? 'all' : 'active';
      switch (this.shownUserRole) {
        case 'employees':
          return pluralize(parseInt(child.counter.employees?.[currentNumberField] || 0), ['сотрудник', 'сотрудника', 'сотрудников']);
        case 'models':
          return pluralize(parseInt(child.counter.models?.[currentNumberField] || 0), ['модель', 'модели', 'моделей']);
        case 'operators':
          return pluralize(parseInt(child.counter.operators?.[currentNumberField] || 0), ['оператор', 'оператора', 'операторов']);
      }
      return '';
    },
    onClickParentGroup() {
      this.shownGroup = {...this.parentGroup};
      this.parentGroup = {...this.activeGroup};
    },
    showDateDeactivated(date) {
      return moment(date).format('DD.MM.YYYY')
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
    closeDrover() {
      this.toggleHelper(false);
    },
  }
};
</script>