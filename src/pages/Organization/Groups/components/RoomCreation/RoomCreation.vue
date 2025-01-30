<template>
  <b-form class="room_creation theme-helper-content-main">
    <div class="theme-helper-content-main-header">
      <b-button id="user-details-profile"
                variant="outline-primary"
                size="sm"
                class="theme-helper-content-main-header-button"
                type="button"
                @click="close"
      >Сохранить</b-button>
    </div>
    <div class="room_creation-body">
      <div class="room_creation-body-main">
        <h3>{{ room.title }}</h3>
        <color-picker v-model="room.color"
                      id="room-edit-color"
                      title="Цвет комнаты"
                      :disabled="!editPermissions"
                      @change="saveRoom"
        />
      </div>
      <div class="room_creation-body-accounts">
        <div class="room_creation-body-accounts-header">
          <h4>Аккаунты комнаты</h4>
          <div v-if="editPermissions" class="room_creation-body-accounts-header-add" id="room-edit-account-add"
               @click="addAccount">
            <span>Добавить аккаунт</span>
            <div class="btn-add"></div>
          </div>
        </div>
        <div class="room_creation-body-accounts-account" v-for="(account, key) in room.accounts" :key="key">
          <div class="room_creation-body-accounts-account-cell -type">
            <custom-select v-model="account.resource"
                           :id="`room-edit-account-${key}-resource`"
                           :options="resourcesRoom"
                           defaultText="Выберите сервис"
                           valueField="id"
                           :disabled="!editPermissions"
                           @change="saveRoom"
            />
          </div>
          <div class="room_creation-body-accounts-account-cell -login">
            <input v-model="account.login"
                   :id="`room-edit-account-${key}-login`"
                   placeholder="Логин"
                   type="text"
                   class="input-plain"
                   autocomplete="new-password"
                   :disabled="!editPermissions"
                   @change="saveRoom"
            />
          </div>
          <div class="room_creation-body-accounts-account-cell -password">
            <input v-model="account.password"
                   :id="`room-edit-account-${key}-password`"
                   placeholder="Пароль"
                   type="password"
                   class="input-plain"
                   autocomplete="new-password"
                   :disabled="!editPermissions"
                   @change="saveRoom"
            />
          </div>
          <div v-if="editPermissions" class="room_creation-body-accounts-account-cell -delete">
            <span class="glyphicon glyphicon-trash" :id="`room-edit-account-${key}-delete`"
                  @click="deleteAccount(key)"/>
          </div>
        </div>
      </div>
    </div>
  </b-form>
</template>

<script>
import ColorPicker from "@/components/Common/ColorPicker/ColorPicker";
import Select from "@/components/Common/Select/Select";

export default {
  name: 'room-creation',
  props: {
    originalRoom: Object,
  },
  components: {
    'color-picker': ColorPicker,
    'custom-select': Select,
  },
  data() {
    return {
      room: {},
    }
  },
  computed: {
    newRoom() {
      return this.$store.state.groups.newRoom;
    },
    resourcesRoom() {
      return this.$store.state.dictionaries.resourcesRoom;
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    editPermissions() {
      return this.userPermissions.group.main.edit;
    },
  },
  watch: {
    newRoom: function (newRoom) {
      this.room = JSON.parse(JSON.stringify(newRoom));
    },
    originalRoom: function (newRoom, oldRoom) {
      if (newRoom.id !== oldRoom.id) this.room = JSON.parse(JSON.stringify(newRoom));
    },
  },
  created() {
    this.room = JSON.parse(JSON.stringify(this.originalRoom));
  },
  methods: {
    addAccount() {
      this.room = {
        ...this.room,
        accounts: this.room.accounts && this.room.accounts.length ? [...this.room.accounts, {}] : [{}]
      };
    },
    saveRoom() {
      this.$store.dispatch('groups/editRoom', this.room);
    },
    deleteAccount(key) {
      let accounts = [...this.room.accounts];
      accounts.splice(key, 1);
      this.room = {
        ...this.room,
        accounts: accounts
      };
      this.saveRoom();
    },
    close() {
      this.$store.dispatch('layout/toggleHelper', false);
    },
  },
}
</script>