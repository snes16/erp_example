<template>
  <div>
    <div class="profile_response">
      <div class="profile_response-col">
        <div v-if="userPermissions.model.profile.response.view" class="profile_response-col-card card">
          <div class="profile_response-col-card-header">
            <h3>История отклика</h3>
          </div>
          <div class="profile_response-col-card-body -history">
            <div v-for="(comment, key) in response.history" class="comments-comment" :key="key">
              <div class="comments-comment-avatar avatar"
                   :style="comment.user.avatar ? `background-image: url(${comment.user.avatar}; background-size: cover;` : ''"></div>
              <div class="comments-comment-main">
                <div class="comments-comment-main-row">
                  <b>{{ comment.user.fullname }}</b> <span
                    v-if="comment.system_message && comment.system_message.message"
                    class="comments-comment-main-event"> {{ comment.system_message.message }}</span>
                </div>
                <div class="comments-comment-main-row" v-if="comment.message">{{
                    comment.message
                  }}
                </div>
                <div class="comments-comment-main-date">
                  {{ formatDate(comment.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="userPermissions.model.profile.response.view" class="profile_response-col-card card">
          <div class="profile_response-col-card-header">
            <h3>Данные анкеты</h3>
          </div>
          <div class="profile_response-col-card-body">
            <template v-for="(block, key) in response.worksheet">
              <div v-for="(field, subkey) in block.parameters" class="profile_response-col-card-body-row"
                   :key="key + '-' + subkey">
                <div class="profile_response-col-card-body-row-col">
                  <b>{{ field.title }}</b>
                </div>
                <div class="profile_response-col-card-body-row-col">
                  <span>{{ formatWorksheetField(field.value, field.type) }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="profile_response-col">
        <div v-if="response.vacancy && userPermissions.model.profile.response.view"
             class="profile_response-col-card card">
          <div class="profile_response-col-card-header">
            <h3>Данные вакансии</h3>
          </div>
          <div class="profile_response-col-card-body">
            <div class="profile_response-col-card-body-row">
              <div class="profile_response-col-card-body-row-col">
                <b>Страна</b>
              </div>
              <div class="profile_response-col-card-body-row-col">
                <span>{{ response.vacancy.group && response.vacancy.group.path }}</span>
              </div>
            </div>
            <div class="profile_response-col-card-body-row">
              <div class="profile_response-col-card-body-row-col">
                <b>Город</b>
              </div>
              <div class="profile_response-col-card-body-row-col">
                <span>{{ response.vacancy.group && response.vacancy.group.title }}</span>
              </div>
            </div>
            <div class="profile_response-col-card-body-row">
              <div class="profile_response-col-card-body-row-col">
                <b>Ресурсы размещения</b>
              </div>
              <div class="profile_response-col-card-body-row-col">
                <p v-for="(resource, key) in response.vacancy.resources" :key="key">{{
                    resource.title
                  }}</p>
              </div>
            </div>
            <h4>Описание вакансии</h4>
            <span v-html="response.vacancy.description"></span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isHasDuplicate" class="profile-collapse">
      <div class="profile-collapse-title" v-b-toggle.collapse>
        <h3 class="profile-collapse-title-text">Архивные данные</h3>
        <i :class="`fa fa-angle-down`"/>
      </div>
      <b-collapse visible id="collapse">
        <div class="profile_response">
          <div class="profile_response-col">
            <div v-if="userPermissions.model.profile.response.view" class="profile_response-col-card card">
              <div class="profile_response-col-card-header">
                <h3>Данные анкеты</h3>
              </div>
              <div class="profile_response-col-card-body">
                <template v-for="(block, key) in response.archive">
                  <div v-for="(field, subkey) in block.parameters" class="profile_response-col-card-body-row"
                       :key="key + '-' + subkey">
                    <div class="profile_response-col-card-body-row-col">
                      <b>{{ field.title }}</b>
                    </div>
                    <div class="profile_response-col-card-body-row-col">
                      <span>{{ formatWorksheetField(field.value, field.type) }}</span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </b-collapse>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'response',
  props: {
    response: Object,
    userPermissions: Object,
    isHasDuplicate: Boolean
  },
  computed: {
    taskTypes() {
      return this.$store.state.dictionaries.taskTypes;
    }
  },
  methods: {
    clickCollapse(key) {
      this.$root.$emit('bv::toggle::collapse', 'comment_' + key);
    },
    formatDate(date) {
      if (!date) return '';
      return moment(date).format('DD.MM.YYYY, HH:mm');
    },
    formatWorksheetField(value, type) {
      if (type === 'date') return value ? moment(value).format('DD.MM.YYYY') : '';
      return value;
    }
  }
}
</script>