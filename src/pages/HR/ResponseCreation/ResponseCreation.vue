<template>
  <div>
    <b-form v-if="droverType === 'current-response'" class="response" @submit.prevent="openActionForm(action)">
      <div class="theme-helper-content-main-header d-flex align-items-center">
        <template v-if="(status !== 'fetching') && (editPermissions || (source !== 'user' && userPermissions.vacancy_response.management) || isJustCreated)">
          <template v-if="(statusResponse === 'new' || isDuplicateCurrentResponse) && !showDuplicateResponse">
            <b-button class="response-title-submit-button"
                      size="sm"
                      variant="outline-primary"
                      type="submit"
                      @click="callCenterAction"
            >В call-центр</b-button>
            <b-button v-if="userPermissions.hr.edit || userPermissions.hr_response.edit"
                      class="response-title-submit-button"
                      size="sm"
                      variant="outline-primary"
                      type="submit"
                      @click="interviewAction"
            >На собеседование</b-button>
          </template>
          <b-button v-if="!statusResponse && !isDuplicateCurrentResponse && !showDuplicateResponse"
                    size="sm"
                    variant="outline-primary"
                    type="button"
                    :disabled="loading"
                    @click="createResponse"
          >Добавить заявку</b-button>
          <div v-if="editPermissions && modelProfile.status === 'new' && !showDuplicateResponse"
               class="btn btn-outline-danger btn-sm"
               id="response_delete"
               @click="deleteResponses"
          >Удалить</div>
        </template>
        <b-button v-if="(statusResponse === 'archive' || statusResponse === 'reject') && (userPermissions.hr_response.edit || userPermissions.vacancy_response.management)"
                  size="sm"
                  variant="outline-primary"
                  type="button"
                  v-b-modal.unarchive_task
        >Сделать активной</b-button>
      </div>
      <div v-if="status === 'fetching'" class="response-load">
        <throbber class="throbber"/>
        <span class="vacancies-table-load-title">Данные загружаются, пожалуйста, подождите</span>
      </div>
      <template v-else>
        <div class="response-task mt-0">
          <div v-if="breadcrumbsTitle" class="theme-helper-content-main-subheader">
            <div class="theme-helper-content-main-subheader-link" @click="closeResponseCreation">
              <i class="fa fa-angle-left"></i>
              <span>{{ breadcrumbsTitle }}</span>
            </div>
          </div>
          <div v-if="!modelProfile.task_sheet_status && !forbidden && source === 'vacancy' && vacancyProp"
               class="theme-helper-content-main-subheader">
            <div class="theme-helper-content-main-subheader-link" @click="closeResponseCreation">
              <i class="fa fa-angle-left"></i>
              <span>{{ vacancyProp.title }}</span>
            </div>
          </div>
          <div v-if="activeTask === 'call-center'" class="response-action_form">
            <div class="response-action_form-title">
              <p class="response-action_form-title-text">Отправить в call-центр</p>
              <div class="helper-close" @click="closeForm"/>
            </div>
            <div class="response-action_form-action_field">
              <div class="response-task-parameters-title-executor">
                <custom-select
                    class="response-action_form-action_field-block-choice response-task-parameters-title-executor-settings -icon"
                    valueField="id"
                    titleField="fullname"
                    v-model="executor"
                    defaultText="Выберите исполнителя"
                    :options="currentUsersUpdated"
                    @change="removeErrorSendInterview"
                >
                  <template v-slot:chosen-variant="props">
                    <div class="d-flex align-items-center">
                      <avatar v-if="props.value"
                              class="mr-2"
                              :url="props.value.avatar"
                              is-large
                              :telegram="props.value.telegram_connected"
                              :is-fin-admin="props.value.is_fin_admin"
                      />
                      <span v-if="props.value && (props.value.uid || props.value.fullname)" class="custom_select-text">
                        <template v-if="!props.value.uid || !props.value.fullname">{{props.value.uid || props.value.fullname }}</template>
                        <template v-else>
                          <span class="text-gray mr-1">{{ props.value.uid }}</span>
                          <span>{{ props.value.fullname }}</span>
                        </template>
                      </span>
                      <span v-else class="custom_select-text">{{ props.shownText }}</span>
                    </div>
                  </template>
                  <template v-slot:list-variant="props">
                    <div class="response-task-parameters-title-executor-settings-setting">
                      <avatar class="mr-2"
                              :url="props.variant.avatar"
                              is-large
                              :telegram="props.variant.telegram_connected"
                              :is-fin-admin="props.variant.is_fin_admin"
                      />
                      <div class="response-task-parameters-title-executor-settings-setting-item">
                        <template v-if="!props.variant.uid || !props.variant.fullname">
                          {{ props.variant.uid || props.variant.fullname }}
                        </template>
                        <template v-else>
                          <span class="text-gray mr-1">{{ props.variant.uid }}</span>
                          <span>{{ props.variant.fullname }}</span>
                        </template>
                        <template v-for="absence in props.variant.checkedAbsences"
                                  class="response-task-parameters-title-executor-settings-setting-item-absence">
                          <b class="text-gray mr-1">
                            <absence/>
                            {{ absence }}</b>
                        </template>
                      </div>
                    </div>
                  </template>
                </custom-select>
              </div>
              <div class="response-action_form-action_field-date">
                <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar"/>
                <date-picker v-model="datetime"
                             lang="ru"
                             type="datetime"
                             placeholder="Выберите дату"
                             :input-class="'input-plain' + (shownErrors.includes('complete_at') ? '-error' : '')"
                             :disabled-date="notBeforeToday"
                             :time-picker-options="{
                               start: '09:00',
                               step: '00:30',
                               end: '19:00',
                             }"
                             format="DD.MM.YYYY, HH:mm"
                             @focus="focusField('complete_at')"
                             @change="setTimeWithExecutor"
                ><i slot="calendar-icon"/></date-picker>
              </div>
            </div>
            <div class="response-action_form-send_field">
              <b-button size="md"
                        variant="info"
                        :disabled="errorSendInterview"
                        @click="sendCallCenter"
              >Отправить в call-центр</b-button>
            </div>
          </div>
          <div v-if="activeTask === 'interview'" class="response-action_form">
            <div class="response-action_form-title">
              <p class="response-action_form-title-text">Назначить собеседование</p>
              <div class="helper-close" @click="closeForm"></div>
            </div>
            <div class="response-action_form-action_field">
              <div class="response-action_form-action_field-block">
                <custom-select
                    class="response-action_form-action_field-block-choice response-task-parameters-title-executor-settings -icon"
                    valueField="id"
                    titleField="fullname"
                    v-model="executor"
                    defaultText="Выберите исполнителя"
                    :options="currentUsersUpdated"
                    @change="removeErrorSendInterview"
                >
                  <template v-slot:chosen-variant="props">
                    <div class="d-flex align-items-center">
                      <avatar v-if="props.value"
                              class="mr-2"
                              :url="props.value.avatar"
                              is-large
                              :telegram="props.value.telegram_connected"
                              :is-fin-admin="props.value.is_fin_admin"
                      />
                      <span v-if="props.value && (props.value.uid || props.value.fullname)" class="custom_select-text">
                        <template v-if="!props.value.uid || !props.value.fullname"
                        >{{props.value.uid || props.value.fullname }}</template>
                        <template v-else>
                          <span class="text-gray mr-1">{{ props.value.uid }}</span>
                          <span>{{ props.value.fullname }}</span>
                        </template>
                      </span>
                      <span v-else class="custom_select-text">{{ props.shownText }}</span>
                    </div>
                  </template>
                  <template v-slot:list-variant="props">
                    <div class="response-task-parameters-title-executor-settings-setting">
                      <avatar class="mr-2"
                              :url="props.variant.avatar"
                              is-large
                              :telegram="props.variant.telegram_connected"
                              :is-fin-admin="props.variant.is_fin_admin"
                      />
                      <div class="response-task-parameters-title-executor-settings-setting-item">
                        <template v-if="!props.variant.uid || !props.variant.fullname">
                          {{ props.variant.uid || props.variant.fullname }}
                        </template>
                        <template v-else>
                          <span class="text-gray mr-1">{{ props.variant.uid }}</span>
                          <span>{{ props.variant.fullname }}</span>
                        </template>
                        <template v-for="absence in props.variant.checkedAbsences"
                                  class="response-task-parameters-title-executor-settings-setting-item-absence"
                        ><b class="text-gray mr-1"><absence/>{{ absence }}</b></template>
                      </div>
                    </div>
                  </template>
                </custom-select>
              </div>
              <div class="response-action_form-action_field-date">
                <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar"/>
                <date-picker v-model="datetime"
                             lang="ru"
                             type="datetime"
                             placeholder="Выберите дату"
                             :input-class="'input-plain' + (shownErrors.includes('planned_start_at') ? '-error' : '')"
                             :disabled-date="notBeforeToday"
                             :time-picker-options="{
                               start: '09:00',
                               step: '00:30',
                               end: '19:00',
                             }"
                             format="DD.MM.YYYY, HH:mm"
                             :marked-dates="busyDates"
                             @focus="focusField('planned_start_at')"
                             @open="updateBusyDates()"
                             @calendar-change="updateBusyDates"
                             @change="setTimeWithExecutor"
                ><i slot="calendar-icon"/></date-picker>
              </div>
            </div>
            <div class="response-action_form-send_field">
              <b-button size="md" variant="info" @click="sendInterview" :disabled="errorSendInterview">Назначить
              </b-button>
            </div>
          </div>
          <div
              v-if="isDuplicateCurrentResponse && !showDuplicateResponse && (activeTask !== 'interview') && (activeTask !== 'call-center')"
              class="response-task-duplicate">
            <div class="response-task-duplicate-content">
              <div v-if="duplicateResponseUsers && duplicateResponseUsers.length"
                   :class='{"response-task-duplicate-content-users": duplicateResponse && duplicateResponse.id !== modelProfile.id}'>
                <h4>{{ duplicateResponseUsers.length === 1 ? 'Обнаружен сотрудник' : 'Обнаружены сотрудники' }} с такими
                  же данными</h4>
                <div v-for="user of duplicateResponseUsers" class="response-action_form-user cursor-pointer"
                     @click="openMiniProfile(user)">
                  <avatar class="mr-2"
                          size="-lg"
                          :url="user.avatar"
                          is-large
                          :telegram="user.telegram_connected"
                          :is-fin-admin="user.is_fin_admin"
                  />
                  <div class="response-action_form-user-item">
                    <div class="d-flex flex-wrap">
                      <b v-if="user.uid" class="text-gray mr-1">{{ user.uid }}</b>
                      <b v-if="user.fullname">{{ user.fullname }}</b>
                      <template v-if="user.is_resign">
                        <div :id="`resign_info-${user.id}`" class="glyphicon-fired ml-1"></div>
                        <b-tooltip :target="`resign_info-${user.id}`" triggers="hover">
                          <div class="profile-main-info-data-resign-tooltip">
                            <div>Сотрудник уволен</div>
                            <div><b>Причина увольнения:</b> {{ user.resign }}</div>
                          </div>
                        </b-tooltip>
                      </template>
                      <div v-else-if="user.blocked" class="glyphicon-blocked ml-1" v-b-tooltip.hover
                           title="Сотрудник заблокирован"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="duplicateResponse && duplicateResponse.id !== modelProfile.id">
                <h4>Обнаружена заявка с такими же данными</h4>
                <div class="response-task-duplicate-content-title">
                            <span class="vacancy_creation-responses-responses_list-item-status-item"
                                  :class="`-${statusDuplicateResponse}`">
                                {{ responseTypes[statusDuplicateResponse] }}
                            </span>
                  <b class="response-task-duplicate-content-title-text"
                     @click="openDuplicateResponse">{{ duplicateResponse.title }}</b>
                </div>
                <div v-if="duplicateResponse.comments && duplicateResponse.comments.length"
                     class="response-comments-history">
                  <p v-b-toggle.history-collapse class="response-comments-history-button">
                    {{ collapseResponseComments ? 'Свернуть' : 'История обработки заявки' }}</p>
                  <b-collapse v-model="collapseResponseComments" id="history-collapse">
                    <div v-for="(commentsInfo, index) in duplicateResponse.comments" :key="index"
                         class="response-comments-info-comment">
                      <b>{{ commentsInfo.user.fullname }}</b>
                      <div v-if="commentsInfo.comments" v-for="comment in commentsInfo.comments">
                        <div class="response-comments-info-comment-message-system">
                          <span v-if="comment.type === 'system'">{{ comment.system_message.message }} </span>
                          <span v-if="comment.message"><br v-if="comment.type === 'system'"/>{{
                              comment.message
                            }} </span>
                          <span class="text-gray">{{ moment(comment.created_at).format('DD.MM.YYYY HH:mm') }}</span>
                        </div>
                      </div>
                    </div>
                  </b-collapse>
                </div>
              </div>
            </div>
          </div>
          <div class="response-full_name" :class="{'border-bottom-0': source === 'user'}">
            <span v-if="statusResponse"
                  class="vacancy_creation-responses-responses_list-item-status-item response-full_name-status"
                  :class="`-${statusResponse}`">{{ responseTypes[statusResponse] }}</span>
            <input v-model="modelProfile.title"
                   v-autowidth="{maxWidth: '3000px', minWidth: '8px', comfortZone: 8}"
                   id="response_title"
                   class="response-full_name-personal-input"
                   type="text"
                   placeholder="Введите название"
                   :class="{'-error_text': shownErrors.includes('title'), '-empty': !(modelProfile.title)}"
                   :disabled="!editPermissions || (statusResponse && statusResponse !== 'new')"
                   required
                   @focus="focusField('title')"
                   @change="responseAction"
            />
          </div>
          <div v-if="source === 'user' && (!statusResponse || statusResponse === 'new')" class="response-info_data">
            <div class="row align-items-start">
              <div class="col-6 mb-4">
                <b>Регион</b>
              </div>
              <div class="col-5 mb-4">
                <group-select v-model="modelProfile.sourceGroup"
                              :groups="groupsNonOperators"
                              placeholder="Выберите регион"
                              class="response-info_data-select"
                              :error="shownErrors.includes('source_city')"
                              required
                              :disabled="!editPermissions"
                              :disable-rule="isGroupCityOrOffice"
                              right
                              alt-button-for-office
                              id="response_group"
                              @change="changeField('source_city')"
                />
              </div>
            </div>
            <div class="row align-items-center response-info_data-vacancy">
              <div class="col-6 mb-4">
                <b>Вакансия</b>
              </div>
              <div class="col-5 mb-4">
                <custom-select
                    v-model="modelProfile.vacancy"
                    :options="vacanciesOptions"
                    defaultText="Выберите вакансию"
                    valueField="id"
                    infinity-scroll
                    right
                    :error="shownErrors.includes('vacancy')"
                    :required="modelProfile.vacancy !== null"
                    :disabled="!vacancyPermissions || !editPermissions"
                    :loading="hrStatus === 'request'"
                    id="response_vacancy"
                    @getNextPage="getVacanciesNextPage"
                    @change="changeField('vacancy')"
                >
                  <template v-slot:list-variant="props">
                    <p class="mb-0">{{ props.variant.title }}</p>
                    <p v-if="props.variant.resource" class="text-gray mb-0 mr-2">{{ props.variant.resource.title }}</p>
                  </template>
                </custom-select>
              </div>
            </div>
            <div v-if="modelProfile.vacancy === null" class="row align-items-center">
              <div class="col-6">
                <b>Источник прихода</b>
              </div>
              <div class="col-5">
                <custom-select v-model="modelProfile.sourceUser"
                               :options="usersOptions"
                               class="response-info_data-select"
                               valueField="id"
                               titleField="title"
                               defaultText="Выберите пользователя"
                               :error="shownErrors.includes('source_user')"
                               required
                               returnWholeObject
                               infinityScroll
                               searchableRequest
                               right
                               :disabled="!editPermissions"
                               id="response_source"
                               @change="changeField('source_user')"
                               @getNextPage="getSourceUsersNextPage"
                               @searchList="searchSourceUsers"
                >
                  <template v-slot:chosen-variant="props">
                      <span v-if="props.value && (props.value.uid || props.value.surname)">
                        <template v-if="!props.value.uid || !props.value.surname">{{props.value.uid || props.value.surname }}</template>
                        <template v-else>
                          <span class="text-gray mr-1">{{ props.value.uid }}</span>
                          <span>{{ props.value.surname }}</span>
                        </template>
                      </span>
                    <span v-else>{{ props.shownText }}</span>
                  </template>
                  <template v-slot:list-variant="props">
                    <div class="d-flex align-items-center">
                      <avatar v-if="props.variant.id"
                              class="mr-2"
                              :url="props.variant.avatar"
                              is-large
                              :telegram="props.variant.telegram_connected"
                              :is-fin-admin="props.variant.is_fin_admin"
                      />
                      <template v-if="!props.variant.uid || !props.variant.surname">
                        {{ props.variant.uid || props.variant.surname }}
                      </template>
                      <template v-else>
                        <span class="text-gray mr-1">{{ props.variant.uid }}</span>
                        <span>{{ props.variant.surname }}</span>
                      </template>
                    </div>
                  </template>
                </custom-select>
              </div>
            </div>
          </div>
          <div class="response-info_data">
            <div class="response-info_data-title" @click="toggleAccordion('modelFieldVisible', 0)">
              <p class="response-info_data-title-text">Данные заявки</p>
              <i :class="`fa fa-angle-down`"/>
            </div>
            <template v-if="statusResponse">
              <div v-if="source === 'user'" class="response-info_data-resource">
                Заявка поступила
                <p class="response-info_data-resource-text">от сотрудника</p>
              </div>
              <div v-else class="response-info_data-resource">
                Заявка поступила с сервиса
                <p class="response-info_data-resource-text">
                  {{
                    currentVacancyResponse && currentVacancyResponse.resource && currentVacancyResponse.resource.title ? currentVacancyResponse.resource.title : ''
                  }}</p>
              </div>
            </template>
            <b-collapse :visible="modelFieldVisible === 0">
              <div v-if="statusResponse && statusResponse !== 'new'" class="response-info_data -no-offset">
                <div class="row align-items-center pt-4">
                  <template v-if="modelProfile.source_user">
                    <div class="col-sm-6 col-xs-12 mb-4">
                      <b>Источник прихода</b>
                    </div>
                    <div class="col-sm-6 col-xs-12 mb-4">
                      <b>{{ modelProfile.source_user.fullname }}</b>
                      <div v-if="modelProfile.source_user.main_group" class="profile_main-card-body-row-value-group">
                        <span class="flag-icon mr-1"
                              :class="`flag-icon-${modelProfile.source_user.main_group.flag || 'default'}`"
                              :title="modelProfile.source_user.main_group.country"></span>
                        <span class="text-gray mr-1">{{ modelProfile.source_user.main_group.city }}</span>
                        <span>{{ modelProfile.source_user.main_group.office }}</span>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="currentVacancyResponse">
                    <div class="col-sm-6 col-xs-12 mb-4">
                      <b>Вакансия</b>
                    </div>
                    <div class="col-sm-6 col-xs-12 mb-4">
                      <span>{{ currentVacancyResponse.title }}</span>
                    </div>
                  </template>
                  <div class="col-sm-6 col-xs-12 mb-4">
                    <b>Город</b>
                  </div>
                  <div class="col-sm-6 col-xs-12 mb-4">
                    <div v-if="modelProfile.source_city" class="profile_main-card-body-row-value-group">
                      <span class="flag-icon mr-1" :class="`flag-icon-${modelProfile.source_city.flag || 'default'}`"
                            :title="modelProfile.source_city.country"></span>
                      <span class="text-gray mr-1">{{ modelProfile.source_city.city }}</span>
                    </div>
                    <div v-else-if="currentVacancyResponse && currentVacancyResponse.group"
                         class="profile_main-card-body-row-value-group">
                      <span class="flag-icon mr-1"
                            :class="`flag-icon-${currentVacancyResponse.group.flag || 'default'}`"
                            :title="currentVacancyResponse.group.country"></span>
                      <span class="text-gray mr-1">{{ currentVacancyResponse.group.city }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="source !== 'user'" class="row align-items-start mt-3 mb-3">
                <div class="col-6">
                  <b>Офис</b>
                </div>
                <div class="col-5">
                  <group-select v-model="modelProfile.sourceOffice"
                                :groups="groupsForOfficeSelect"
                                placeholder="Выберите офис"
                                class="response-info_data-select"
                                :error="shownErrors.includes('source_office')"
                                :disabled="!editPermissions"
                                :disable-rule="isGroupOffice"
                                :default-collapse="true"
                                right
                                alt-button-for-office
                                @change="changeField('source_office')"
                  />
                </div>
              </div>
              <div class="response-contact_field">
                <div class="response-contact_field-phone_mail -phone">
                  <div class="response-contact_field-phone_mail-icon glyphicon-handset"/>
                  <div class="response-contact_field-phone_mail-data">
                    <phone-number-input v-model="modelProfile.phone"
                                        :error="shownErrors.includes('phone')"
                                        :disabled="!editPermissions || (statusResponse && statusResponse !== 'new')"
                                        :key="`response-phone-input-main-${modelProfile.id}`"
                                        id="response_phone"
                                        @input="focusField('phone')"
                                        @change="editPhone"
                    />
                  </div>
                </div>
                <div class="response-contact_field-phone_mail -email">
                  <div class="response-contact_field-phone_mail-icon glyphicon-email"/>
                  <div class="response-contact_field-phone_mail-data">
                    <input
                        class="response-contact_field-phone_mail-data-number"
                        type="email"
                        placeholder="Укажите email"
                        v-model="modelProfile.email"
                        :class="shownErrors.includes('email') ? ' -error_text' : ''" @focus="focusField('email')"
                        :disabled="!editPermissions || (statusResponse && statusResponse !== 'new')"
                        @change="responseAction"
                    />
                  </div>
                </div>
              </div>
              <div class="response-info_data-row pt-4">
                <template v-for="(phone, key) in modelProfile.additional_phones">
                  <div class="response-info_data-row-title">
                    <b>Дополнительный телефон</b>
                  </div>
                  <div class="response-info_data-row-field -additional_phone" :key="phone.key">
                    <phone-number-input v-model="phone.value"
                                        :error="shownErrors.includes(`additional_phone-${key}`)"
                                        :disabled="!editPermissions || (statusResponse && statusResponse !== 'new')"
                                        :key="`response-phone-input-${phone.key}-${modelProfile.id}`"
                                        :id="`response_additional_phone-${phone.key}`"
                                        @input="changeAdditionalPhone(key)"
                                        @change="editAdditionalPhone(key, $event)"
                    />
                    <div v-if="editPermissions && ((modelProfile.additional_phones.length - 1) !== key) && (!statusResponse || statusResponse === 'new')"
                         class="response-info_data-row-field-delete"
                    >
                      <div class="btn-remove" :id="`response_additional_phone_remove-${phone.key}`" @click="removeAdditionalPhone(key)"></div>
                    </div>
                  </div>
                </template>
                <div class="col-6 mb-4">
                  <b>Дата рождения</b>
                </div>
                <div class="col-5 mb-4 d-flex align-items-center">
                  <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar" />
                  <date-picker v-model="modelProfile.birthday"
                               class="datepicker-plain response-info_data-field-date"
                               lang="ru"
                               :input-class="'input-plain' + (shownErrors.includes('birthday') ? '-error' : '')"
                               :clearable="false"
                               format="DD.MM.YYYY"
                               :disabled="!editPermissions || (statusResponse && statusResponse !== 'new')"
                               placeholder="Выберите дату"
                               value-type="YYYY-MM-DD"
                               id="response_birthday"
                               @focus="focusField('complete_at')"
                               @change="changeField('birthday')"
                  >
                    <i style="display: none;" slot="calendar-icon"/>
                  </date-picker>
                </div>
                <div class="col-6 mb-4">
                  <b>Национальность</b>
                </div>
                <div class="col-5 mb-4">
                  <custom-select v-model="modelProfile.nationality"
                                 :options="nationalities"
                                 :error="shownErrors.includes('nationality')"
                                 returnWholeObject
                                 defaultText="Выберите национальность"
                                 titleField="title"
                                 valueField="id"
                                 searchable
                                 required
                                 :disabled="!editPermissions || (statusResponse && statusResponse !== 'new')"
                                 id="response_nationality"
                                 @change="changeField('nationality')"
                  />
                </div>
                <div class="col-6 mb-4">
                  <b>Пол</b>
                </div>
                <div class="col-5 mb-4">
                  <custom-select v-model="modelProfile.gender"
                                 :options="gender"
                                 valueField="type"
                                 titleField="title"
                                 defaultText="Выберите пол"
                                 :error="shownErrors.includes('gender')"
                                 :disabled="!editPermissions || (statusResponse && statusResponse !== 'new')"
                                 id="response_gender"
                                 @change="changeField('gender')"
                  />
                </div>
              </div>
            </b-collapse>
          </div>
        </div>
        <div v-if="modelProfile.id" class="response-comments" ref="commentsBlock">
          <div v-if="modelProfile.comments && modelProfile.comments.length" class="response-comments-info"
               :class="userPermissions.comment.create || editPermissions ? '-with_input' : ''">
            <div
                v-if="(index === 0) || (index === modelProfile.comments.length - 1 && modelProfile.comments.length !== 1) || showAllComments"
                v-for="(commentsInfo, index) in modelProfile.comments" :key="index"
                class="response-comments-info-comment">
              <b class="cursor-pointer" @click="openMiniProfile(commentsInfo.user)">{{ commentsInfo.user.fullname }}</b>
              <div v-if="commentsInfo.comments" v-for="(comment, indexComment) in commentsInfo.comments">
                <div v-if="(index === 0 && indexComment === 0) ||
                             (index === modelProfile.comments.length - 1 && indexComment === commentsInfo.comments.length - 1) ||
                             showAllComments"
                     :class="{'-offset': index === 0 && indexComment !== 0 && !showAllComments && countRestComments}"
                     class="response-comments-info-comment-message">
                  <span v-if="comment.type === 'system'">{{ comment.system_message.message }} </span>
                  <span v-if="comment.message"><br v-if="comment.type === 'system'"/>{{ comment.message }} </span>
                  <span class="text-gray">{{ moment(comment.created_at).format('DD.MM.YYYY HH:mm') }}</span>
                </div>
                <div
                    v-if="!showAllComments && index === 0 && ((commentsInfo.comments.length < 2 && indexComment === 0) || indexComment === 1) && countRestComments"
                    class="response-comments-info-comment-button">
                  <div class="response-comments-info-comment-button-drover"/>
                  <span class="response-comments-info-comment-button-title"
                        @click="toggleShowComments">+{{ countRestComments }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="userPermissions.comment.create || editPermissions" class="response-comments-button"
               :class="{'-shadow': commentsBlockHeight === 250}">
            <form class="response-comment_field" @submit.prevent="commentAction">
              <b-input-group>
                <b-form-input v-model="commentText" placeholder="Комментарий" required/>
                <b-input-group-append>
                  <b-button variant="primary" type="submit">Отправить</b-button>
                </b-input-group-append>
              </b-input-group>
            </form>
          </div>
        </div>
      </template>
    </b-form>
    <response-creation v-else-if="droverType === 'duplicate-response'"
                       :response-prop="duplicateResponse"
                       :breadcrumbs-title="newResponseWithDuplicate.response.title"
                       showDuplicateResponse
                       @close="returnCurrentResponse"/>
    <task-control v-else-if="droverType === 'duplicate-task'"
                  :task-prop="duplicateResponse && duplicateResponse.task || currentTask"
                  :breadcrumbs-title="newResponseWithDuplicate.response.title"
                  :task-opened="true"
                  :open-block="flag"
                  @close="returnCurrentResponse"
    />
    <mini-profile v-else-if="droverType === 'mini-profile'"
                  :user-id="choosenUser.id"
                  :breadcrumbs-title="newResponseWithDuplicate.response.title"
                  @close="returnCurrentResponse"/>
    <b-modal
        id="unarchive_task"
        centered
        title="Сделать заявку активной?"
        body-bg-variant="white"
        ok-title="Сделать активной"
        ok-variant="primary"
        cancel-title="Отменить"
        cancel-variant="outline-primary"
        @ok="unarchiveTask">
      Активируйте заявку, чтобы работать с ней
    </b-modal>
  </div>
</template>
<script>
import Vue from 'vue';
import DatePicker from '@/components/Common/Datepicker/index';
import {mapState} from 'vuex';
import Select from "@/components/Common/Select/Select";
import MiniProfile from "@/pages/Organization/Groups/components/UserDetails/UserDetails";
import TaskControl from '@/pages/Tasks/components/TaskControl';
import SelectGroup from "@/pages/Management/components/SelectGroup";
import GroupSelect from "@/components/Common/GroupSelect/GroupSelect";
import PhoneNumberInput from "@/components/Common/PhoneNumberInput";
import Avatar from "@/components/Common/Avatar/Avatar";
import absence from "@/assets/vue-svg/absence.svg";
import throbber from "@/assets/vue-svg/throbber.svg";
import {filterListRecursively, getSmallImage, isEmail, pluralize} from "@/tools/tools";
import moment from 'moment';

export default {
  name: 'response-creation',
  components: {
    'date-picker': DatePicker,
    'custom-select': Select,
    'mini-profile': MiniProfile,
    'task-control': TaskControl,
    'avatar': Avatar,
    SelectGroup,
    GroupSelect,
    PhoneNumberInput,
    'absence': absence,
    'throbber': throbber,
  },
  props: {
    vacancyProp: Object,
    responseProp: Object,
    taskProp: Object,
    groupId: Number,
    breadcrumbsTitle: String,
    showDuplicateResponse: {
      type: Boolean,
      default: false
    },
    forbidden: {
      type: Boolean,
      default: false
    },
    isSourceVacancy: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      droverType: 'current-response',
      moment: moment,
      modelFieldVisible: 0,
      modelProfile: {
        id: null,
        status: null,
        email: null,
        phone: null,
        title: '',
        gender: null,
        nationality: null,
        birthday: null,
        resource: null,
        video_file: null,
        workflow: {
          id: null,
          type: null,
          status: null
        }
      },
      activeTask: '',
      action: '',
      executor: null,
      interviewTemplate: [],
      parameters: [],
      datetime: null,
      gender: [
        {type: 'male', title: 'Мужской'},
        {type: 'female', title: 'Женский'}
      ],
      shownErrors: [],
      commentText: '',
      taskTitle: '',
      errorMessages: [],
      today: null,
      errorSendInterview: false,
      searchStringSourceUsers: '',
      showAllComments: false,
      commentsBlockHeight: null,
      collapseResponseComments: false,
      newResponseWithDuplicate: {},
      saveDuplicateResponse: null,
      saveDuplicateResponseUsers: null,
      choosenUser: {},
      flag: false,
      source: null,
      isJustCreated: false,
    }
  },
  computed: {
    ...mapState('auth', ['userPermissions']),
    ...mapState('hr', ['countries', 'currentVacancy']),
    ...mapState('groupparameters', ['groupParameters']),
    ...mapState('responses', ['fieldsErrors', 'response', 'responses']),
    ...mapState('tasks', ['task', 'currentTask']),
    taskFieldsErrors() {
      return this.$store.state.tasks.fieldsErrors
    },
    resources() {
      return this.$store.state.dictionaries.resourcesHr;
    },
    absenceTypes() {
      return this.$store.state.dictionaries.absenceTypes;
    },
    nationalities() {
      return this.$store.state.dictionaries.nationalities;
    },
    taskParameters() {
      this.taskTitle = this.modelProfile?.title
      let task = {
        planned_start_at: moment(this.datetime).format('YYYY-MM-DDTHH:mm:ss'),
        user: this.executor,
        response: this.modelProfile.id,
        title: this.taskTitle,
        vacancy: this.vacancyProp?.id
      }
      if (!this.datetime) delete task.planned_start_at
      if (!this.executor) delete task.user
      if (!this.vacancyProp) delete task.vacancy
      return task
    },
    vacancyPermissions() {
      return this.userPermissions.hr.view || this.userPermissions.vacancy_response.management;
    },
    editPermissions() {
      if (!this.statusResponse) return true;
      if (this.source === 'user') return this.userPermissions.hr_response.edit;
      return this.modelProfile.id ? this.userPermissions.hr.edit : this.userPermissions.hr.edit || this.userPermissions.vacancy_response.management;
    },
    currentUsersUpdated() {
      let users = [{id: null, fullname: 'Выберите исполнителя'}]
      if (!this.modelProfile?.responsible_user_list && this.isDuplicateCurrentResponse) {
        if (this.usersStatus === 'request') return users;
        users = [...users, ...this.usersResponsibleOptions]
      } else if (this.activeTask === 'call-center') users = [...users, ...(this.modelProfile.responsible_user_list.call_center || [])];
      else users = [...users, ...(this.modelProfile.responsible_user_list.interview || [])];
      return users.map(user => {
        if (!user.id || !user.absences) return user
        user.checkedAbsences = this.isDayAbsence(moment(this.datetime).format('YYYY-MM-DD'), user.absences)
        user.disabled = !!user.checkedAbsences
        return user
      })
    },
    status() {
      return this.$store.state.responses.responseStatus;
    },
    taskStatus() {
      return this.$store.state.tasks.taskStatus;
    },
    hrStatus() {
      return this.$store.state.hr.hrStatus;
    },
    loading() {
      return (this.status === 'fetching') || (this.status === 'creating');
    },
    busyDates() {
      return this.$store.state.tasks.busyDates;
    },
    currentResponse() {
      return this.$store.state.responses.currentResponse;
    },
    groupsNonOperators() {
      return this.$store.state.dictionaries.groupsNonOperators
    },
    groupsForOfficeSelect() {
      if (!this.vacancyProp?.group?.id) return this.groupsNonOperators;
      return filterListRecursively(this.groupsNonOperators, (group => group.id === this.vacancyProp.group.id), true);
    },
    /*groupsOptions() {
      let result = [];
      this.groupsNonOperators.forEach(groupCountry => {
        result.push({
          ...groupCountry,
          disabled: true,
        });
        groupCountry.children.forEach(groupCity => {
          result.push({...groupCity});
        })
      })
      return result;
    },*/
    usersOptions() {
      return this.$store.state.users.usersListWithPagination;
    },
    usersStatus() {
      return this.$store.state.users.status;
    },
    usersHeaders() {
      return this.$store.state.users.headers;
    },
    countRestComments() {
      let countAllComments = this.modelProfile.comments.reduce((count, taskCommentsInfo) => {
        return count + Number(taskCommentsInfo.comments.length)
      }, 0);
      return countAllComments > 2 ? `${pluralize(countAllComments - 2, ['событие', 'события', 'событий'])}` : null;
    },
    statusResponse() {
      return this.responseProp.status ? this.responseProp.status : (this.modelProfile.id ? 'new' : null);
    },
    responseTypes() {
      return this.$store.state.responses.responseTypes;
    },
    duplicateResponse() {
      return this.$store.state.responses.duplicateResponse.responses?.[0] || this.saveDuplicateResponse;
    },
    duplicateResponseUsers() {
      return this.$store.state.responses.duplicateResponse.users || this.saveDuplicateResponseUsers;
    },
    isDuplicateCurrentResponse() {
      return !!(this.duplicateResponse || (this.duplicateResponseUsers && this.duplicateResponseUsers.length));
    },
    statusDuplicateResponse() {
      if (!this.duplicateResponse.task) return 'new';
      if (this.duplicateResponse.task.status === 'active' || this.duplicateResponse.task.status === 'check') return this.duplicateResponse.task.type;
      return this.duplicateResponse.status ? this.duplicateResponse.status : (this.duplicateResponse.id ? 'new' : null);
    },
    usersResponsibleOptions() {
      return this.$store.state.users.usersList;
    },
    currentVacancyResponse() {
      return this.vacancyProp || this.currentVacancy
    },
    vacanciesList() {
      return this.$store.state.hr.vacanciesList;
    },
    vacanciesOptions() {
      return [
        {
          title: 'Заявка от агента',
          id: null,
        },
        ...this.vacanciesList,
      ];
    },
    vacanciesListHeaders() {
      return this.$store.state.hr.vacanciesListHeaders;
    },
    vacanciesListRequestPermissions() {
      return this.$store.state.auth.userPermissions.hr.edit || this.$store.state.auth.userPermissions.vacancy_response.management;
    },
  },
  watch: {
    taskFieldsErrors: function (newErrors) {
      if (newErrors) {
        this.shownErrors = newErrors.map(error => error.propertyPath)
        this.errorMessages = newErrors.map(error => error.message)
      }
      this.showUserEditErrorMessage(newErrors)
    },
    taskStatus: function (newStatus, oldStatus) {
      if (newStatus === 'task-created' && !this.newResponseWithDuplicate.response) {
        this.activeTask = 'close'
        return this.$emit('close', true);
      }
      if (newStatus === '' && oldStatus === 'editing') this.openTask()
    },
    fieldsErrors: function (newErrors) {
      if (newErrors) {
        this.shownErrors = newErrors.map(error => error.propertyPath)
        this.errorMessages = newErrors.map(error => error.message)
      }
      this.showUserEditErrorMessage(newErrors)
    },
    groupParameters: function (newGroupTemplateParameters) {
      this.interviewTemplate = (JSON.parse(JSON.stringify(newGroupTemplateParameters))).map(function (groupParameter) {
        groupParameter.parameters = groupParameter.parameters.map(function (parameter) {
          parameter.value = ''
          return parameter
        })
        return groupParameter
      })
      let parametersList = [],
          index = 0
      if (this.modelProfile.id && this.modelProfile.worksheet) {
        this.interviewTemplate = this.modelProfile.worksheet
      }
      this.interviewTemplate.map(function (groupParameter) {
        groupParameter.parameters.map(function (parameter) {
          parametersList.push({
            ...parameter,
            index: index,
            key: `${parameter.title}`,
            label: `${parameter.title}`,
            class: 'response-info_data-field-title',
            type: parameter.type,
            answersList: Array.isArray(parameter.answers) ? parameter.answers.map(function (answer) {
              return {value: answer}
            }) : [],
          })
          index++
          return parameter
        })
      })
      this.modelProfile.worksheet = this.interviewTemplate
      this.parameters = parametersList
    },
    response: function (newResponse) {
      if (this.vacancyProp?.id) this.getCurrentVacancy(this.vacancyProp.id)
      if (this.modelProfile.id !== newResponse.id) {
        this.isJustCreated = true;
        let modelProfile = JSON.parse(JSON.stringify(newResponse));
        if (!modelProfile.additional_phones) modelProfile.additional_phones = [];
        modelProfile.additional_phones.push({value: ''});
        if (!modelProfile.workflow) modelProfile.workflow = {id: null, type: '', status: ''};
        modelProfile.birthday = modelProfile.birthday ? moment.parseZone(modelProfile.birthday).format('YYYY-MM-DD') : null;
        modelProfile.sourceUser = modelProfile.source_user || null;
        modelProfile.sourceCity = modelProfile.source_city || null;
        modelProfile.sourceOffice = modelProfile.source_office || null;
        modelProfile.sourceGroup = modelProfile.sourceOffice || modelProfile.sourceCity || null;
        this.modelProfile = modelProfile;
      }
    },
    vacancyProp: function (newVacancy) {
      if (!this.modelProfile.phone) this.modelProfile.phone = newVacancy.phone_code
    },
    modelProfile: function () {
      this.setHeightComments()
    },
    responseProp: function () {
      if (this.responseProp.id) this.$store.dispatch('responses/fetchCurrentResponse', this.responseProp.id);
    },
    currentResponse: function (newResponse) {
      if (newResponse.vacancy?.id) {
        this.source = 'vacancy';
        this.getCurrentVacancy(newResponse.vacancy);
      }
      let modelProfile = JSON.parse(JSON.stringify(newResponse));
      if (!modelProfile.additional_phones) modelProfile.additional_phones = [];
      modelProfile.additional_phones.push({value: ''});
      if (!modelProfile.workflow) modelProfile.workflow = {id: null, type: '', status: ''};
      modelProfile.birthday = modelProfile.birthday ? moment.parseZone(modelProfile.birthday).format('YYYY-MM-DD') : null;
      modelProfile.sourceUser = modelProfile.source_user || null;
      modelProfile.sourceCity = modelProfile.source_city || null;
      modelProfile.sourceOffice = modelProfile.source_office || null;
      modelProfile.sourceGroup = modelProfile.sourceOffice || modelProfile.sourceCity || null;
      this.modelProfile = modelProfile;
      if (newResponse.worksheet) {
        let parametersList = [],
            index = 0
        this.interviewTemplate = newResponse.worksheet
        this.interviewTemplate.map(function (groupParameter) {
          groupParameter.parameters.map(function (parameter) {
            parametersList.push({
              ...parameter,
              index: index,
              key: `${parameter.title}`,
              label: `${parameter.title}`,
              class: 'response-info_data-field-title',
              type: parameter.type,
              answersList: Array.isArray(parameter.answers) ? parameter.answers.map(function (answer) {
                return {value: answer}
              }) : [],
            })
            index++
            return parameter
          })
        })
        this.modelProfile.worksheet = this.interviewTemplate
        this.parameters = parametersList
      }
    },
    currentTask: function (newTask) {
      if (this.vacancyProp?.id) this.getCurrentVacancy(this.vacancyProp.id)
    },
    status: function (newStatus, prevStatus) {
      if (newStatus === '' && prevStatus === 'creating-duplicate') {
        this.activeTask = 'close'
        this.$emit('close')
      }
    }
  },
  created() {
    this.$store.dispatch('dictionaries/fetchGroupsNonOperators');
    this.$store.dispatch('dictionaries/getNationalities');
    if (!this.source) this.source = this.isSourceVacancy ? 'vacancy' : 'user';
    if (this.responseProp.id) this.$store.dispatch('responses/fetchCurrentResponse', this.responseProp.id);
    this.$store.dispatch('groupparameters/fetchGroupParameters');
    let modelProfile = JSON.parse(JSON.stringify(this.responseProp))
    if (!modelProfile.phone && this.vacancyProp && this.vacancyProp.phone_code) modelProfile.phone = this.vacancyProp.phone_code
    if (!modelProfile.additional_phones) modelProfile.additional_phones = [];
    else modelProfile.additional_phones = modelProfile.additional_phones.map((phone, key) => ({value: phone.value, key: key}));
    modelProfile.additional_phones.push({value: null, key: modelProfile.additional_phones.length});
    if (!modelProfile.workflow) modelProfile.workflow = {id: null, type: '', status: ''}
    modelProfile.birthday = modelProfile.birthday ? moment.parseZone(modelProfile.birthday).format('YYYY-MM-DD') : null;
    this.modelProfile = modelProfile;
    // if(this.responseProp.id) this.fetchComments(this.responseProp)
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    this.today = today;
    if (this.source === 'user') {
      this.getSourceUsers();
      this.vacancyPermissions ?
          this.$store.dispatch('hr/fetchVacanciesList', {per_page: 10, page: 1}):
          this.modelProfile.vacancy = null;
    }
  },
  beforeDestroy() {
    this.$store.dispatch('responses/clearDuplicateResponse');
  },
  methods: {
    responseAction() {
      if (!this.modelProfile.id) return;
      // if (this.vacancyProp?.length_phone && !(this.modelProfile.phone && this.modelProfile.phone.length === (this.vacancyProp.length_phone + this.vacancyProp.phone_code.length))) return this.shownErrors.push('phone');
      let query = {
        vacancy: this.responseProp?.vacancy_id || null,
        source_user: this.modelProfile.sourceUser?.id || null,
        source_city: this.modelProfile.sourceCity?.id || null,
        source_office: this.modelProfile.sourceOffice?.id || null,
        title: this.modelProfile?.title || null,
        phone: this.modelProfile.phone && !this.shownErrors.includes('phone') ? this.modelProfile.phone : this.response.phone,
        email: this.modelProfile.email ? this.modelProfile.email : null,
        // birthday: this.modelProfile.birthday ? moment(this.modelProfile.birthday.getTime()).format('YYYY-MM-DD') : null,
        birthday: this.modelProfile.birthday,
        nationality: this.modelProfile.nationality ? this.modelProfile.nationality.id : null,
        gender: this.modelProfile.gender ? this.modelProfile.gender : null,
        additional_phones: this.modelProfile.additional_phones ? this.modelProfile.additional_phones.filter((phone, key) => phone && phone.value && !this.shownErrors.includes(`additional_phone-${key}`)).map(phone => ({value: phone.value})) : null
        // worksheet: this.modelProfile.worksheet ? this.modelProfile.worksheet : null
      }

      this.$store.dispatch('responses/editResponse', {id: this.modelProfile.id, ...query});
    },
    createResponse(params = null) {
      if (!this.modelProfile.phone) this.shownErrors.push('phone');
      if (!this.modelProfile.title?.trim()) this.shownErrors.push('title');
      if (!this.modelProfile.nationality) this.shownErrors.push('nationality');
      if (!this.responseProp.vacancy_id && (this.modelProfile.vacancy === undefined)) this.shownErrors.push('vacancy');
      if ((this.modelProfile.vacancy === null) && !this.modelProfile?.sourceUser) this.shownErrors.push('source_user');
      if (!this.responseProp.vacancy_id && !this.modelProfile?.sourceCity) this.shownErrors.push('source_city');
      if (this.modelProfile.email && !isEmail(this.modelProfile.email)) this.shownErrors.push('email');
      if (this.shownErrors.length) return this.shownErrors;

      let response = {
        vacancy: this.modelProfile.vacancy || this.responseProp?.vacancy_id || null,
        source_user: this.modelProfile.sourceUser?.id || null,
        source_city: this.modelProfile.sourceCity?.id || null,
        source_office: this.modelProfile.sourceOffice?.id || null,
        title: this.modelProfile?.title || null,
        phone: this.modelProfile.phone && !this.shownErrors.includes('phone') ? this.modelProfile.phone : this.response.phone,
        email: this.modelProfile.email ? this.modelProfile.email : null,
        // birthday: this.modelProfile.birthday ? moment(this.modelProfile.birthday.getTime()).format('YYYY-MM-DD') : null,
        birthday: this.modelProfile.birthday,
        nationality: this.modelProfile.nationality ? this.modelProfile.nationality.id : null,
        gender: this.modelProfile.gender ? this.modelProfile.gender : null,
        worksheet: this.modelProfile.worksheet || null,
        additional_phones: this.modelProfile.additional_phones ? this.modelProfile.additional_phones.filter((phone, key) => phone && phone.value && !this.shownErrors.includes(`additional_phone-${key}`)).map(phone => ({value: phone.value})) : null
      }
      if (this.isDuplicateCurrentResponse) {
        response.next = {
          planned_start_at: moment(this.datetime).format('YYYY-MM-DDTHH:mm:ss'),
          user: this.executor
        }
        this.$store.dispatch('responses/createDuplicateResponse', {response, params});
      } else this.$store.dispatch('responses/createResponse', response);
    },
    deleteResponses() {
      this.$store.dispatch('responses/deleteResponse', this.modelProfile);
      this.$emit('close')
    },
    changeField(field) {
      this.focusField(field);
      if (field === 'source_city') {
        this.modelProfile = {
          ...this.modelProfile,
          sourceCity: this.modelProfile.sourceGroup?.type === 'office' ? this.modelProfile.sourceGroup.city : this.modelProfile.sourceGroup,
          sourceOffice: this.modelProfile.sourceGroup?.type === 'office' ? this.modelProfile.sourceGroup : null,
          vacancy: this.vacanciesListRequestPermissions ? undefined : null,
        };
        if (this.vacanciesListRequestPermissions || this.vacancyPermissions) this.$store.dispatch('hr/fetchVacanciesList', {
          per_page: 10,
          page: 1,
          group: this.modelProfile.sourceCity.id || undefined,
        });
      }
      this.responseAction();
    },
    editPhone(e) {
      if (!e.isValid) return this.shownErrors = [...this.shownErrors, 'phone'];
      this.responseAction();
    },
    editAdditionalPhone(key, e) {
      if (!e.isValid) return this.shownErrors = [...this.shownErrors, `additional_phone-${key}`];
      this.responseAction();
    },
    toggleAccordion(field, index) {
      if (this[field] !== index) Vue.set(this, field, index);
      else Vue.set(this, field, -1);
    },
    callCenterAction() {
      let groupId
      if (this.vacancyProp && this.vacancyProp.group) groupId = this.vacancyProp.group.id
      else if (this.currentVacancy && this.currentVacancy.group) groupId = this.currentVacancy.group.id
      if (this.isDuplicateCurrentResponse) this.getResponsibleUsers(groupId, 'task.call_center.edit')
      this.action = 'call-center'
    },
    interviewAction() {
      let groupId
      if (this.vacancyProp && this.vacancyProp.group) groupId = this.vacancyProp.group.id
      else if (this.currentVacancy && this.currentVacancy.group) groupId = this.currentVacancy.group.id
      if (this.isDuplicateCurrentResponse) this.getResponsibleUsers(groupId, 'task.interview.edit')
      this.action = 'interview'
    },
    openActionForm(action) {
      this.activeTask = action
    },
    closeForm() {
      this.activeTask = 'close'
    },
    closeResponseCreation() {
      if (this.loading) return;
      this.$emit('close')
    },
    editParameter(changedParameter) {
      this.modelProfile.worksheet = this.interviewTemplate.map(function (groupParameter) {
        groupParameter.parameters = groupParameter.parameters.map(function (parameter) {
          if (parameter.id === changedParameter.id) parameter.value = changedParameter.value
          return parameter
        })
        return groupParameter
      })
      this.responseAction()
    },
    sendCallCenter() {
      if (this.taskStatus === 'creating') return;
      if (this.isDuplicateCurrentResponse) return this.createResponse({is_force: true, task_type: 'call_center'})
      this.$store.dispatch('tasks/createTaskCallCenter', this.taskParameters);
    },
    sendInterview() {
      if (!this.datetime) {
        this.shownErrors.push('planned_start_at')
        return;
      }
      if (this.taskStatus === 'creating') return;
      if (this.isDuplicateCurrentResponse) return this.createResponse({is_force: true, task_type: 'interview'});
      this.$store.dispatch('tasks/createTaskInterview', this.taskParameters);
    },
    focusField(fieldName) {
      this.shownErrors = this.shownErrors.filter(error => error !== fieldName);
    },
    async commentAction(commentText) {
      await this.$store.dispatch('comments/createComment', {id: this.modelProfile.id, text: this.commentText});
      this.$store.dispatch('responses/fetchCurrentResponse', this.modelProfile.id);
      this.commentText = ''
    },
    closeToast(e, toast) {
      toast.goAway(0)
    },
    showUserEditErrorMessage(errors) {
      this.$toasted.error(errors[0].message, {
        position: 'bottom-left',
        keepOnHover: true,
        duration: 5000,
        action: {
          text: '',
          class: 'btn-close',
          onClick: this.closeToast
        }
      });
    },
    notBeforeToday(date) {
      return date.getTime() < this.today.getTime();
    },
    getCurrentVacancy(id) {
      this.$store.dispatch('hr/getCurrentVacancy', id)
    },
    changeAdditionalPhone(key) {
      this.shownErrors = this.shownErrors.filter(error => error !== `additional_phone-${key}`);
      if (key !== (this.modelProfile.additional_phones.length - 1)) return;
      Vue.set(this.modelProfile, 'additional_phones', [...this.modelProfile.additional_phones, {value: null, key: key + 1}]);
    },
    removeAdditionalPhone(key) {
      let newPhones = [...this.modelProfile.additional_phones];
      newPhones.splice(key, 1);
      // Vue.set(this.modelProfile, 'additional_phones', newPhones);
      this.shownErrors = this.shownErrors.filter(error => error !== `additional_phone-${key}`)
          .map(error => error.replace(/(additional_phone-)(.+)/, (match, first, second) => {
            let number = parseInt(second);
            return number > key ? `${first}${number - 1}` : match;
      }));
      this.modelProfile = {...this.modelProfile, additional_phones: newPhones};
      this.responseAction();
    },
    updateBusyDates(date) {
      this.$store.dispatch('tasks/fetchBusyDates', {
        type: 'interview',
        params: {group: this.vacancyProp?.group?.id || this.modelProfile.sourceCity?.id, date_at: date}
      });
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
    setTimeWithExecutor(time) {
      this.errorSendInterview = false
      if (this.executor) {
        if (this.isDayAbsence(moment(time).format('YYYY-MM-DD'), this.currentUsersUpdated.find(user => user.id === this.executor).absences)) {
          this.errorSendInterview = true
          this.showUserEditErrorMessage([{message: 'Сотрудник будет отсутствовать в выбранную дату, выберите другого сотрудника или измените дату'}])
        }
      }
    },
    isDayAbsence(day, absences) {
      if (!absences?.length) return false
      let absencesCurrentDay = absences.filter(absence => moment(day).isBetween(moment(absence.start_at).format('YYYY-MM-DD'), moment(this.subtractDay(absence.end_at)).format('YYYY-MM-DD'), undefined, '[]'))
      return absencesCurrentDay.length ? absencesCurrentDay.map(absence => {
        return ` ${this.absenceTypes[absence.type]} ${moment(absence.start_at).format('DD.MM')} - ${moment(this.subtractDay(absence.end_at)).format('DD.MM')} `
      }) : null
    },
    subtractDay(subtractDate) {
      let date = moment(subtractDate);
      date.subtract(1, 'days');
      return date;
    },
    removeErrorSendInterview() {
      this.errorSendInterview = false
    },
    getSourceUsers() {
      this.$store.dispatch('users/fetchUsersWithPagination', {
        surname: this.searchStringSourceUsers.length ? this.searchStringSourceUsers : null,
        is_active: true,
        per_page: 20,
        page: 1
      });
    },
    getSourceUsersNextPage() {
      if ((this.usersHeaders.currentPage >= this.usersHeaders.totalPages) || (this.usersStatus === 'request')) return;
      this.$store.dispatch('users/fetchUsersNextPage', {
        surname: this.searchStringSourceUsers.length ? this.searchStringSourceUsers : null,
        is_active: true,
        per_page: 20,
        page: this.usersHeaders.currentPage + 1
      });
    },
    searchSourceUsers(search) {
      this.searchStringSourceUsers = search
      this.getSourceUsers()
    },
    toggleShowComments() {
      this.showAllComments = !this.showAllComments
      this.setHeightComments();
    },
    openMiniProfile(user) {
      if (this.userRole(user.role.code) && this.userPermissions[this.userRole(user.role.code)].profile.view) {
        this.choosenUser = user;
        this.newResponseWithDuplicate.response = this.modelProfile;
        this.newResponseWithDuplicate.source = this.source;
        this.droverType = 'mini-profile';
      }
    },
    openDuplicateResponse() {
      this.newResponseWithDuplicate.response = this.modelProfile;
      this.newResponseWithDuplicate.source = this.source;
      this.saveDuplicateResponse = this.duplicateResponse;
      this.saveDuplicateResponseUsers = this.duplicateResponseUsers;
      this.droverType = (this.statusDuplicateResponse === 'call_center' || this.statusDuplicateResponse === 'interview') ? 'duplicate-task' : 'duplicate-response';
    },
    openTask() {
      this.newResponseWithDuplicate.response = {title: ''};
      this.droverType = 'duplicate-task';
    },
    returnCurrentResponse() {
      this.droverType = 'current-response';
      this.modelProfile = this.newResponseWithDuplicate.response;
      this.source = this.newResponseWithDuplicate.source;
      this.newResponseWithDuplicate = {};
    },
    close() {
      this.$emit('close');
    },
    userRole(code) {
      switch (code) {
        case 'ROLE_MODEL':
          return 'model';
        case 'ROLE_OPERATOR':
          return 'operator';
        default:
          return 'employee';
      }
    },
    setHeightComments() {
      this.$nextTick(() => {
        this.commentsBlockHeight = this.$refs.commentsBlock && this.$refs.commentsBlock.clientHeight;
      })
    },
    getResponsibleUsers(group, permission) {
      this.$store.dispatch('users/fetchUsers', {
        'access.permissions.code[]': permission,
        groups: group || this.modelProfile.sourceOffice?.id || this.modelProfile.sourceCity?.id,
        is_active: true
      });
    },
    unarchiveTask() {
      if (this.taskStatus === 'editing') return;
      let taskId = this.modelProfile.task_list?.length ? this.modelProfile.task_list[this.modelProfile.task_list.length - 1].id : null;
      if (taskId) this.$store.dispatch('tasks/editTask', {id: taskId, status: 'active'});
    },
    getVacanciesNextPage() {
      if ((this.vacanciesListHeaders.currentPage >= this.vacanciesListHeaders.totalPages) || (this.hrStatus === 'request')) return;
      if (this.vacancyPermissions) this.$store.dispatch('hr/fetchVacanciesList', {
        per_page: 10,
        page: this.vacanciesListHeaders.currentPage + 1,
        group: this.modelProfile.sourceCity?.id || undefined,
      });
    },
    isGroupOffice(group) {
      return group.type === 'office';
    },
    isGroupCityOrOffice(group) {
      return (group.type === 'city') || (group.type === 'office');
    },
  },
};
</script>
