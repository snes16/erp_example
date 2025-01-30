<template>
  <div class="user_details">
    <div v-if="droverType === 'mini-profile'" class="theme-helper-content-main">
      <div class="theme-helper-content-main-header">
        <b-button id="user-details-profile"
                  variant="outline-primary"
                  size="sm"
                  class="theme-helper-content-main-header-button"
                  :to="`/app/profile/${partnerId || userId}`"
        >Открыть профиль
        </b-button>
        <!--        <b-button v-if="userPermissions.user.restore_password && !user.resign_date"
                          class="theme-helper-content-main-header-button"
                          id="user-details-restore_password"
                          variant="outline-primary"
                          size="sm"
                          :disabled="status === 'resetting'"
                          @click="resetPassword"
                >Восстановить пароль</b-button>-->
        <template v-if="userPermissions.resign_users.management">
          <b-button v-if="userPermissions.resign_users.management && !user.resign_date"
                    class="profile-header-actions-button"
                    variant="outline-danger"
                    size="sm"
                    v-b-modal.resign_modal
          >Уволить
          </b-button>
          <b-button v-else
                    class="profile-header-actions-button"
                    variant="outline-success"
                    size="sm"
                    @click="activateUser"
          >Активировать
          </b-button>
        </template>
        <!--        <template v-if="editPermission && !user.resign_date">
                  <b-button v-if="user.blocked"
                            id="user-details-unblock"
                            :disabled="status === 'editing'"
                            variant="outline-success"
                            size="sm"
                            class="theme-helper-content-main-header-button"
                            @click="toggleBlocked"
                  >Разблокировать
                  </b-button>
                  <b-button v-else
                            id="user-details-block"
                            variant="outline-danger"
                            size="sm"
                            class="theme-helper-content-main-header-button"
                            @click="toggleBlocked"
                  >Заблокировать
                  </b-button>
                </template>-->
      </div>
      <div v-if="breadcrumbsTitle && !!breadcrumbsTitle.length" class="theme-helper-content-main-subheader">
        <div class="theme-helper-content-main-subheader-link" @click="close">
          <i class="fa fa-angle-left"></i>
          <span>{{ breadcrumbsTitle }}</span>
        </div>
      </div>
      <div class="user_details-main">
        <!--<div class="user_details-main-resign">
            <div v-if="user.resign_date" class="profile-main-info-data-resign">
                <span>Уволен {{ formattedResignDate }}</span>
                <div id="resign_info-details" class="profile-main-info-data-resign-svg"><info /></div>
                <b-tooltip target="resign_info-details" triggers="hover">
                    <div class="profile-main-info-data-resign-tooltip"><b>Причина увольнения:</b><br/>{{ user.resign }}</div>
                </b-tooltip>
            </div>
        </div>-->
        <div class="user_details-main-user">
          <avatar :url="user.avatar"
                  class="user_details-main-user-avatar"
                  size="-xxl"
                  is-large
                  show-inactive-telegram-icon
                  :telegram="user.telegram_connected"
                  :is-fin-admin="user.is_fin_admin"
          />
          <!--          <div class="user_details-main-user-avatar avatar -xl"
               :style="user.avatar ? `background-image: url(${getSmallImage(user.avatar)}); background-size: cover;` : ''"/>-->
          <div class="user_details-main-user-info">
            <div class="d-flex align-items-center mb-1">
              <b>
                <template v-if="!user.uid || !user.fullname">{{ user.uid || user.fullname }}</template>
                <template v-else>
                  <span class="text-gray mr-1">{{ user.uid }}</span>
                  <span>{{ user.fullname }}</span>
                </template>
              </b>
              <user-resign-icon v-if="user.resign_date" :user="user" :offset="40" id="resign_info-details"/>
              <div v-else-if="user.blocked" class="glyphicon-blocked" v-b-tooltip.hover
                   title="Сотрудник заблокирован"></div>
              <template v-if="user.new_model">
                <div
                    class="glyphicon glyphicon-new_model workshifts-card-main-body-office-room-shifts-period-shift-cell-text-new ml-2"
                    id="new-user-details"/>
                <b-tooltip target="new-user-details" triggers="hover" placement="top">
                  <div class="text-center">Обратите внимание,<br/>девушка работает недавно</div>
                </b-tooltip>
              </template>
              <div v-if="user.is_solo"
                   class="workshifts-card-main-body-office-room-shifts-period-shift-cell-text-solo ml-2">Соло
              </div>
            </div>
            <div v-if="userType === 'model'" class="d-flex align-items-center">
              <div v-if="user.model_nickname" class="d-flex align-items-center mr-2">
                <at class="mr-1"/>
                <b>{{ user.model_nickname }}</b>
              </div>
              <payment-percentages-info
                  v-if="profile.payment_percentages_data && profile.payment_percentages_data.payment_percentages && profile.payment_percentages_data.payment_percentages.length"
                  :data="profile.payment_percentages_data"
                  id="user_details-payment_percentages"
                  class="mr-2"
              />
              <template v-if="profile.connected_models_with_ref">
                <div class="user_details-main-user-info-ref_models-icon mr-2">
                  <model/>
                </div>
                <span>{{ profile.connected_models_with_ref }}</span>
              </template>
            </div>
            <!-- <span>{{ user.role && user.role.title }}</span> -->
            <!--            <custom-select
                          v-if="editPermission && userType === 'employee'"
                          v-model="userRoleCode"
                          id="user-details-role"
                          valueField="code"
                          defaultText="Выберите роль"
                          :options="optionsRoles"
                          @change="editRole"
                        />
                        <p class="mb-0" v-else>{{profile.role && profile.role.title || profile.role_name || roles[profile.role_code] }}</span>
                        -->
            <div class="d-flex mb-1">
              <component :is="user.gender || 'male'"
                         v-b-tooltip.hover
                         :title="`Пол: ${user.gender === 'female' ? 'женский' : 'мужской'}`"
                         class="mr-2 mt-1"
              />
              <div class="d-flex align-items-center flex-wrap">
                <span class="mr-1">{{ userRoleTitle }}</span>
                <span v-if="user.position" class="mr-2">• {{ user.position.title }}</span>
                <headset v-if="user.role && user.role.type === 'operator'" class="mr-2"/>
                <template v-if="experience">
                  <span class="mr-2 text-gray-text">/</span>
                  <span class="mr-2 text-gray-text">Стаж:</span>
                  <div class="d-flex align-items-center">
                    <span class="mr-2">{{ experience }}</span>
                    <shifts-numbers-badge :shifts-numbers="profile.shifts_numbers"
                                          :group="user.main_group"
                                          :fullname="user.fullname || user.model_nickname"
                                          id="user-details-shifts-numbers"
                                          class="mr-2"
                    />
                  </div>
                </template>
                <template v-if="age">
                  <span class="mr-2 text-gray-text">/</span>
                  <span class="mr-2 text-gray-text">Возраст:</span>
                  <span class="mr-2">{{ age }}</span>
                </template>
                <template v-if="user.salary && viewPermission">
                  <span class="mr-2 text-gray-text">/</span>
                  <span class="mr-2 text-gray-text">Оклад:</span>
                  <span class="mr-2">$ {{ user.salary }}</span>
                </template>
                <template v-if="profile.connected_models_with_ref && (userType !== 'model')">
                  <span class="mr-2 text-gray-text">/</span>
                  <div class="user_details-main-user-info-ref_models-icon mr-2">
                    <model/>
                  </div>
                  <span>{{ profile.connected_models_with_ref }}</span>
                </template>
              </div>
            </div>
            <payment-percentages-info
                v-if="(userType === 'operator') && profile.payment_percentages_data && profile.payment_percentages_data.payment_percentages && profile.payment_percentages_data.payment_percentages.length"
                :data="profile.payment_percentages_data"
                id="user_details-payment_percentages"
            />
            <div v-if="user.main_group" class="d-flex align-items-center mb-1">
              <span class="flag-icon" :class="`flag-icon-${user.main_group.flag || 'default'}`"></span>
              <span v-if="user.main_group.city" class="ml-2_5 text-gray-text">{{ user.main_group.city }}</span>
              <span class="ml-2_5">{{
                  user.main_group.city ? user.main_group.office || '' : user.main_group.country
                }}</span>
              <b-badge
                  v-if="(user.role && user.role.type === 'operator') && user.operator_groups && user.operator_groups.length"
                  id="user-details-groups"
                  pill
                  variant="primary"
                  class="user_details-main-groups-badge"
                  @click="editGroups"
              >{{ user.operator_groups.length }}
              </b-badge>
              <b-badge v-else-if="user.groups && user.groups.length"
                       id="user-details-groups"
                       pill
                       variant="primary"
                       class="user_details-main-groups-badge"
                       @click="editGroups"
              >{{ user.groups.length }}
              </b-badge>
              <b-tooltip v-if="groupsListForToast.length"
                         target="user-details-groups"
                         custom-class="user_details-main-groups-tooltip"
              >
                <h5>Состоит в группах:</h5>
                <div class="user_details-main-groups-tooltip-content">
                  <div v-for="group in groupsListForToast" class="model_mini_profile-schedule-tooltip-workshift">
                    <div class="model_mini_profile-schedule-tooltip-workshift-group">
                    <span class="model_mini_profile-schedule-tooltip-workshift-group-flag flag-icon"
                          :class="`flag-icon-${group.flag || 'default'}`"
                    />
                      <div class="model_mini_profile-schedule-tooltip-workshift-group-info">
                        <span class="text-gray">{{ group.city }}</span>
                        <span>{{ group.city ? group.office : group.country }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </b-tooltip>
            </div>
            <div class="d-flex align-items-center">
              <template v-if="user.phone">
                <i class="glyphicon glyphicon-handset user_details-main-user-info-icon"/>
                <span class="ml-2_5">{{ user.phone }}</span>
              </template>
              <template v-if="user.email">
                <span v-if="user.phone" class="ml-2_5 mr-2 text-gray-text">/</span>
                <span class="text-gray-text">@</span>
                <span class="ml-2">{{ user.email }}</span>
              </template>
            </div>
          </div>
        </div>
        <!--        <div class="user_details-main-groups">
                  <h4>Группы</h4>
                  <b-badge v-if="mainGroups.length" pill variant="primary" class="user_details-main-groups-badge">
                    {{ mainGroups.length }}
                  </b-badge>
                  <div v-if="showGroupPermission" class="user_details-main-groups-edit" id="user-details-groups"
                       @click="editGroups">
                    <template v-if="editGroupPermission">
                      <span>Изменить</span>
                      <pen/>
                    </template>
                    <span v-else>Открыть</span>
                  </div>
                </div>-->
        <div v-if="user.role && user.role.type === 'operator'" class="user_details-main-groups">
          <h4>Доступ к группам</h4>
          <b-badge v-if="user.groups && user.groups.length" pill variant="primary"
                   class="user_details-main-groups-badge">
            {{ user.groups.length }}
          </b-badge>
          <div v-if="showGroupPermission" class="user_details-main-groups-edit" id="operator-details-groups"
               @click="editOperatorGroups">
            <template v-if="editGroupPermission">
              <span>Изменить</span>
              <pen/>
            </template>
            <span v-else>Открыть</span>
          </div>
        </div>
        <div v-if="paymentInfoViewPermission" class="response-info_data-title user_details-main-collapse"
             @click="visible.paymentInfo = !visible.paymentInfo">
          <div class="d-flex align-items-center">
            <h4>Платежные данные</h4>
            <b-badge v-if="profile.payment_info && profile.payment_info.length" pill variant="primary"
                     class="user_details-main-groups-badge">
              {{ profile.payment_info.length }}
            </b-badge>
          </div>
          <i :class="visible.paymentInfo ? 'fa fa-angle-up' : 'fa fa-angle-down'"/>
        </div>
        <b-collapse v-model="visible.paymentInfo" id="paymentInfoCollapse" class="position-relative">
          <payment-info :user-id="userId"
                        :payment-info="profile.payment_info"
                        :user-permissions="userPermissions"
                        :user-type="userType"
                        :subheader="user.fullname"
                        isUserDetails
                        :class="{'hidden': !(profile.payment_info && profile.payment_info.length)}"
                        @add="editPaymentInfo"
          />
          <div v-if="!(profile.payment_info && profile.payment_info.length)"
               class="d-flex flex-column align-items-center justify-content-center pb-4">
            <span class="mb-2">Нет данных карты</span>
            <b-button v-if="paymentInfoEditPermission" variant="outline-primary" size="sm" @click="editPaymentInfo()">
              Добавить
            </b-button>
          </div>
        </b-collapse>
        <template v-if="currentWeek && isShowSchedule">
          <div class="response-info_data-title user_details-main-collapse"
               @click="visible.workshifts = !visible.workshifts">
            <h4>Расписание на неделю</h4>
            <i :class="visible.workshifts ? 'fa fa-angle-up' : 'fa fa-angle-down'"/>
          </div>
          <b-collapse v-model="visible.workshifts" class="model_mini_profile-schedule" id="scheduleCollapse">
            <div v-if="user.is_resign" class="model_schedule-body-error m-0">
              <span>Невозможно сформировать расписание, модель уволена</span>
            </div>
            <div v-else-if="isModelScheduleEditable && isModel" class="model_mini_profile-schedule-edit"
                 @click="openModelSchedule">
              <span>Изменить</span>
              <pen/>
            </div>
            <div class="model_mini_profile-schedule-dates">
              <b><i class="fa fa-angle-left model_mini_profile-schedule-dates-button" @click="prevWeek"/>
                {{ currentWeek[0].dateString }} - {{ currentWeek[6].dateString }} <i
                    class="fa fa-angle-right model_mini_profile-schedule-dates-button"
                    :class="{'-disabled' : isLastDate}" @click="nextWeek"/></b>
            </div>
            <div class="model_mini_profile-schedule-week">
              <div v-for="(day, dayIndex) in currentWeek" class="model_mini_profile-schedule-week-day_container"
                   :key="dayIndex">
                <!--                  :class="[(day.workshifts && day.workshifts.length ? '-active' : '-default'), (isDayAbsence(day) ? '-disabled' : '')]"-->
                <div class="model_mini_profile-schedule-week-day_container-day"
                     :class="{'-active': day.workshifts && day.workshifts.length}"
                     v-b-tooltip.hover.left="{disabled: !isDayAbsence(day)}"
                     :title=isDayAbsence(day)
                     :id="day.workshifts && day.workshifts.length ? `day-workshifts-${day.dateStringCompare}` : ''"
                >
                  <p class="model_mini_profile-schedule-week-day_container-day-number">{{ day.dateTitle }}</p>
                  <p class="model_mini_profile-schedule-week-day_container-day-title">{{ day.dateSubtitle }}</p>
                </div>
                <div v-if="day.workshifts" class="model_mini_profile-schedule-week-day_container-periods">
                  <div v-for="shift in day.workshifts"
                       class="model_mini_profile-schedule-week-day_container-periods-period"
                       :key="shift.id"
                  >
                    <i class="color_icon -sm -shift model_mini_profile-schedule-week-day_container-periods-period-icon"
                       :class="`-${shift.status}`"/>
                    <span>{{ shift.time }}</span>
                  </div>
                </div>
                <template v-if="day.workshifts && day.workshifts.length">
                  <tooltip-info-workshifts :target="`day-workshifts-${day.dateStringCompare}`"
                                           :workshifts="day.workshifts"
                                           @openMiniProfile="openOtherProfile"
                  />
                </template>
                <!--                                <b-tooltip :target="`absence-${day.dateStringCompare}`" triggers="hover click">-->
                <!--                                  <div class="profile-main-info-data-resign-tooltip">-->
                <!--                                    <div v-for="absence in isDayAbsence(day)">-->
                <!--                                      <span>{{absence}}</span>-->
                <!--                                    </div>-->
                <!--                                  </div>-->
                <!--                                </b-tooltip>-->
              </div>
            </div>
          </b-collapse>
        </template>
        <template v-if="(userType === 'employee') && tasksViewPermission">
          <div class="response-info_data-title user_details-main-collapse" @click="visible.tasks = !visible.tasks">
            <div class="d-flex align-items-center">
              <h4>Активные задачи</h4>
              <b-badge v-if="formattedTasks.length" pill variant="primary" class="user_details-main-groups-badge">
                {{ profile.tasks.headers.totalItems }}
              </b-badge>
            </div>
            <i :class="visible.tasks ? 'fa fa-angle-up' : 'fa fa-angle-down'"/>
          </div>
          <b-collapse v-model="visible.tasks" id="tasksCollapse" class="user_details-main-tasks">
            <div v-if="profileTasksStatus === 'request'" class="tasks-body-main-table -empty">
              <throbber class="throbber"/>
              <span>Задачи загружаются, пожалуйста, подождите</span>
            </div>
            <div v-else class="tasks-body-main-table-container" @scroll="handleScroll">
              <v-client-table :data="formattedTasks"
                              :columns="columns"
                              :options="options"
                              class="hide_row tasks-body-main-table"
                              @row-click="openTask"
              >
                <div class="tasks-body-main-table-row" slot="title" slot-scope="props">
                  <div :id="`user-details-task-title-${props.row.id}`"
                       :ref="`user-details-task-title-${props.row.id}`"
                       class="tasks-body-main-table-row-container"
                  >{{ props.row.title }}
                  </div>
                  <b-tooltip v-if="cellWidths[props.row.id] && cellWidths[props.row.id].title === 130"
                             :target="`user-details-task-title-${props.row.id}`"
                             triggers="hover"
                  >{{ props.row.title }}
                  </b-tooltip>
                </div>
                <div class="tasks-body-main-table-row" slot="group" slot-scope="props">
                  <template v-if="props.row.group">
                    <div :id="`user-details-task-group-${props.row.id}`"
                         class="tasks-body-main-table-row-container"
                         :ref="`user-details-task-group-${props.row.id}`"
                    >
                    <span class="flag-icon mr-1"
                          :class="`flag-icon-${props.row.group.flag || 'default'}`"
                          :title="props.row.group.country"
                    />
                      <span class="text-gray mr-1">{{ props.row.group.city }}</span>
                      <span>{{ props.row.group.office }}</span>
                    </div>
                    <b-tooltip v-if="cellWidths[props.row.id] && cellWidths[props.row.id].group === 130"
                               :target="`user-details-task-group-${props.row.id}`"
                               triggers="hover"
                    >
                      <span class="flag-icon mr-1" :class="`flag-icon-${props.row.group.flag || 'default'}`"
                            :title="props.row.group.country"
                      ></span>
                      <span class="text-gray mr-1">{{ props.row.group.city }}</span>
                      <span>{{ props.row.group.city ? props.row.group.office : props.row.group.country }}</span>
                    </b-tooltip>
                  </template>
                </div>
                <div class="tasks-body-main-table-row" slot="formattedStartAt" slot-scope="props">
                  {{ props.row.formattedStartAt }}
                </div>
                <div class="tasks-body-main-table-row" slot="info" slot-scope="props">
                  <i class="glyphicon glyphicon-info" :id="`user-details-task-info-${props.row.id}`"/>
                  <b-tooltip :target="`user-details-task-info-${props.row.id}`" triggers="hover" placement="left"
                             custom-class="tasks-body-main-table-row-info_tooltip">
                    <div class="tasks-body-main-table-row-info_tooltip-title"><span>Информация о задаче</span></div>
                    <div v-if="props.row.author" class="tasks-body-main-table-row-info_tooltip-block">
                      <span class="text-gray mb-1">Автор задачи</span>
                      <div class="d-flex align-items-center">
                        <div class="avatar mr-2"
                             :style="props.row.author.avatar ? `background-image: url(${getSmallImage(props.row.author.avatar)}); background-size: cover;` : ''"></div>
                        <span class="tasks-body-main-table-row-username">{{ props.row.author.surname }}</span>
                      </div>
                    </div>
                    <div v-if="props.row.created_at" class="tasks-body-main-table-row-info_tooltip-block">
                      <span class="text-gray mb-1">Дата создания задачи</span>
                      <div class="d-flex align-items-center">{{ props.row.formattedCreatedAt }}</div>
                    </div>
                    <div v-if="props.row.complete_at" class="tasks-body-main-table-row-info_tooltip-block">
                      <span class="text-gray mb-1">Дата выполнения задачи</span>
                      <div class="d-flex align-items-center">{{ props.row.formattedCompletedAt }}</div>
                    </div>
                  </b-tooltip>
                </div>
              </v-client-table>
            </div>
          </b-collapse>
          <div class="response-info_data-title user_details-main-collapse"
               @click="visible.jobDuties = !visible.jobDuties">
            <div class="d-flex align-items-center">
              <h4>Обязанности</h4>
              <template v-if="profile.job_duty_settings && profile.job_duty_settings.confirmed_at">
                <i class="fi flaticon-done-sm d-flex ml-2" id="details-job-duties-confirm"/>
                <b-tooltip target="details-job-duties-confirm" triggers="hover">
                  <div class="mt-1 mb-1">
                    <span>Должностные обязаности <br/> приняты {{ jobDutyConfirmationDate }}</span>
                  </div>
                </b-tooltip>
              </template>
            </div>
            <i :class="visible.jobDuties ? 'fa fa-angle-up' : 'fa fa-angle-down'"/>
          </div>
          <b-collapse v-model="visible.jobDuties" id="jobDutiesCollapse">
            <template v-if="filteredJobDuties.length">
              <div v-for="jobDuties in filteredJobDuties" class="profile_main-card-body-list">
                <div class="profile_main-card-body-list-title"><b>{{ jobDuties.title }}</b></div>
                <ul>
                  <li v-for="duty in jobDuties.children">&mdash; {{ duty.title }}</li>
                </ul>
              </div>
            </template>
            <div v-else class="profile_main-card-body-empty_duties">
              <b class="text-gray">У сотрудника нет <br/> должностных обязанностей</b>
            </div>
          </b-collapse>
        </template>
        <div class="response-info_data-title user_details-main-collapse" @click="visible.absence = !visible.absence">
          <h4>Отсутствие</h4>
          <i :class="visible.absence ? 'fa fa-angle-up' : 'fa fa-angle-down'"/>
        </div>
        <b-collapse v-model="visible.absence" id="absenceCollapse">
          <template v-if="absencesWeek.length">
            <div v-for="absence in absencesWeek" class="row mb-4">
              <div class="col-5">
                <b>{{ absenceTypes[absence.type] }}</b>
              </div>
              <div class="col-7">
                <span>{{ getAbsencePeriod(absence) }}</span>
              </div>
            </div>
          </template>
          <div v-else class="profile_main-card-body-empty_duties">
            <b class="text-gray">У сотрудника нет <br/> отсутствий</b>
          </div>
        </b-collapse>
        <template v-if="userPermissions.admin.authorizationHistory.view">
          <div class="response-info_data-title user_details-main-collapse"
               @click="visible.authHistory = !visible.authHistory">
            <h4>История авторизаций</h4>
            <i :class="visible.authHistory ? 'fa fa-angle-up' : 'fa fa-angle-down'"/>
          </div>
          <b-collapse v-model="visible.authHistory" id="tasksCollapse" class="user_details-main-tasks">
            <div v-if="profileAuthHistoryStatus === 'request'" class="profile_main-card-body-empty_duties -loading">
              <throbber class="throbber"/>
              <span>История загружается, пожалуйста, подождите</span>
            </div>
            <div v-else-if="formattedAuthHistory.length" class="tasks-body-main-table-container"
                 @scroll="handleAuthHistoryScroll">
              <v-client-table :data="formattedAuthHistory"
                              :columns="authHistoryColumns"
                              :options="authHistoryOptions"
                              class="hide_row tasks-body-main-table"
              >
                <div slot="ip" slot-scope="{ row }" class="d-flex" :ref="`user-details-auth-history-group-${row.id}`">
                  <template v-if="row.country">
                 <span :id="`auth-history-${ row.id }`"
                       :class="`flag-icon-${ row.flag_type || 'default'}`"
                       class="groups-details-card-header-data-title-flag flag-icon">
                 </span>
                    <b-tooltip :target="`auth-history-${ row.id }`" custom-class="country-name" triggers="hover">
                      {{ row.country }}
                    </b-tooltip>
                  </template>

                  <p v-if="row.ip">{{ row.ip }}</p>
                </div>
              </v-client-table>
            </div>
            <div v-else class="profile_main-card-body-empty_duties">
              <span>История авторизаций отсутствует</span>
            </div>
          </b-collapse>
          <div v-if="isSuperAdmin" class="response-info_data-title user_details-main-collapse"
               @click="toggleCollapse('widgetFine')">
            <div class="d-flex align-items-center">
              <h4>Штрафы</h4>
            </div>
            <i :class="visible.widgetFine ? 'fa fa-angle-up' : 'fa fa-angle-down'"/>
          </div>
          <b-collapse v-if="isSuperAdmin" v-model="visible.widgetFine" id="fineCollapse" class="position-relative">
            <widget-fine :user-id="userId"
                         isUserDetails
                         @openFineDetails="openFineDetails"/>
          </b-collapse>
        </template>
        <!--        <div v-if="userPermissions.permissions_users.management" class="user_details-main-groups">
                  <h4>Настройки доступов</h4>
                  <div class="user_details-main-groups-edit" id="user-details-permissions" @click="editPermissions">
                    <span>Изменить</span>
                    <pen/>
                  </div>
                </div>-->
      </div>
    </div>
    <add-groups v-else-if="droverType === 'add-groups'"
                :userId="user.id"
                :backButton="user.fullname"
                :showGroupsForOperator="showGroupsForOperator"
                userDetails
                @clickBack="backToMiniProfile"
    />
    <task-control v-else-if="droverType === 'task-details'"
                  :task-prop="activeTask"
                  :vacancy-title="user.fullname"
                  @open-vacancy-creation="backToMiniProfile"
    />
    <model-schedule v-else-if="droverType === 'model-schedule'"
                    :modelData="user"
                    :office="mainGroup"
                    :rooms="mainGroup.rooms"
                    :absences="absencesWeek"
                    showModel
                    showAddAbsences
                    :backButton="user.fullname"
                    :user-permissions="userPermissions"
                    :default-date="currentDateRequest"
                    :workshiftPeriods="periods"
                    @open-mini-profile="backToMiniProfile"
                    @open-absence-details="openAbsenceDetails"
                    @go-back="backToMiniProfile"
    />
    <absence-details v-else-if="droverType === 'absence-details'"
                     backButton="Расписание на неделю"
                     @createAbsence="createUserAbsence"
                     @close="openModelSchedule"
    />
    <add-payment-type v-else-if="droverType === 'payment-info'"
                      :user-id="userId"
                      :payment-info="activePaymentInfo"
                      :subheader="user.fullname"
                      :is-first-info="!(profile.payment_info && profile.payment_info.length)"
                      @back="backToMiniProfile"
    />
    <fine-details v-else-if="droverType === 'fineDetails'"
                  :user-id="userId"
                  :fine-info="activeFine"
                  :subheader="user.fullname"
                  @back="backToMiniProfile"
    />
    <b-modal
        id="resign_modal"
        centered
        :title='`Вы уверены, что хотите уволить пользователя?`'
        body-bg-variant="white"
        ok-title="Уволить"
        ok-variant="danger"
        cancel-title="Отменить"
        cancel-variant="outline-primary"
        @ok="resignUser">
      <p class="mb-2">Укажите причину увольнения</p>
      <custom-select v-model="chosenResignReason"
                     :options="resignReasonsForSelect"
                     class="-white -alt"
                     :error="resignReasonError"
                     defaultText="Выбрать причину"
                     value-field="id"
                     returnWholeObject
                     @change="changeReasons"
      />
      <textarea v-model="resignComment"
                class="form-control resize-none mt-2 h-auto overflow-auto"
                placeholder="Комментарий к причине увольнения"
                rows="6"
                maxlength="350"
      />
    </b-modal>
  </div>
</template>

<script>
import moment from "moment";
import AddGroups from "@/pages/Profile/components/AddGroups/AddGroups";
import Select from "@/components/Common/Select/Select";
import TaskControl from '@/pages/Tasks/components/TaskControl.vue';
import ModelSchedule from '@/components/ModelSchedule/ModelSchedule';
import AbsenceDetails from "@/pages/Profile/components/WorkCalendar/AbsenceDetails";
import UserResignIcon from "@/components/Common/UserResignIcon";
import TooltipInfoWorkshifts from "@/pages/Workshifts/components/TooltipInfoWorkshifts";
import CardNumber from "@/components/Common/HiddenData/CardNumber";
import CardExpiresAt from "@/components/Common/HiddenData/CardExpiresAt";
import PaymentInfo from "@/pages/Profile/components/PaymentInfo.vue";
import AddPaymentType from "@/pages/Profile/components/AddPaymentType.vue";
import PaymentPercentagesInfo from "@/components/Common/PaymentPercentagesInfo";
import Avatar from "@/components/Common/Avatar/Avatar";
import ShiftsNumbersBadge from "@/components/Common/ShiftsNumbersBadge";
import WidgetFine from "@/pages/Profile/components/Widgets/WidgetFine.vue";
import FineDetails from "@/pages/Profile/components/FineDetails.vue";
import {showToast} from "@/tools/tools";
import pen from "@/assets/vue-svg/pen.svg";
import info from "@/assets/vue-svg/info.svg";
import male from "@/assets/vue-svg/male.svg";
import female from "@/assets/vue-svg/female.svg";
import throbber from "@/assets/vue-svg/throbber.svg";
import throbberWhite from "@/assets/vue-svg/throbber-white.svg";
import copy from "@/assets/vue-svg/copy-transparent.svg";
import headset from "@/assets/vue-svg/headset.svg";
import at from "@/assets/vue-svg/at.svg";
import model from "@/assets/vue-svg/model.svg";
import {filterListRecursively, getSmallImage, getTypeEditUser, pluralize, clipboard, closeToast} from "@/tools/tools";
// import EditPermissions from "@/pages/Organization/Groups/components/UserEditPermissions";

export default {
  name: 'user-details',
  components: {
    'tooltip-info-workshifts': TooltipInfoWorkshifts,
    'add-groups': AddGroups,
    'custom-select': Select,
    'task-control': TaskControl,
    'model-schedule': ModelSchedule,
    'absence-details': AbsenceDetails,
    'add-payment-type': AddPaymentType,
    'widget-fine': WidgetFine,
    'fine-details': FineDetails,
    UserResignIcon,
    CardNumber,
    CardExpiresAt,
    PaymentInfo,
    PaymentPercentagesInfo,
    Avatar,
    ShiftsNumbersBadge,
    'pen': pen,
    'info': info,
    'male': male,
    'female': female,
    'throbber': throbber,
    'throbber-white': throbberWhite,
    'copy': copy,
    'headset': headset,
    'at': at,
    'model': model,
  },
  props: {
    userId: Number,
    officeId: Number,
    breadcrumbsTitle: String,
  },
  data() {
    return {
      userRoleCode: null,
      activePaymentInfo: null,
      activeFine: null,
      currentDate: moment(),
      firstActiveDate: null,
      lastDate: null,
      resignComment: '',
      resignReasonError: false,
      isLastDate: true,
      visible: {
        workshifts: true,
        information: false,
        tasks: false,
        absence: false,
        jobDuties: false,
        widgetFine: false
      },
      partnerId: null,
      droverType: 'mini-profile',
      showGroupsForOperator: false,
      cellWidths: {},
      columns: ['title', 'group', 'formattedStartAt', 'info'],
      options: {
        headings: {
          title: 'Название',
          group: 'Регион',
          formattedStartAt: 'Дата',
          info: ''
        },
        perPage: 1000,
        texts: {filter: '', count: '', limit: '', noResults: 'Нет записей'},
        headerClass: {background: 'none'},
        // columnsClasses: { id: 'width-100', description: 'width-100', status: 'width-190' },
        skin: 'table',
        sortable: ['title', 'formattedStartAt', 'group'],
        sortIcon: {
          base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-chevron-down',
        },
        rowClassCallback(row) {
          return row.isOverdue ? 'overdue' : '';
        },
        cellClasses: {
          formattedStartAt: [
            {
              class: 'tasks-body-main-table-overdue_date',
              condition: row => row.isOverdue
            }
          ]
        },
      },
      authHistoryColumns: ['authorization_date', 'ip', 'user_agent'],
      authHistoryOptions: {
        headings: {
          authorization_date: 'дата входа',
          ip: 'ip адрес',
          user_agent: 'устройство',
        },
        perPage: 1000,
        sortable: [],
        texts: {filter: '', count: '', limit: '', noResults: ''},
        headerClass: {background: 'none'},
        skin: 'table',
        // sortable: ['authorization_date', 'ip', 'user_agent'],
        sortIcon: {
          base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-chevron-down',
        },
      },
      activeTask: {},
      chosenResignReason: {},
      otherResignReasonTitle: '',
    }
  },
  computed: {
    status() {
      return this.$store.state.users.status;
    },
    isModel() {
      return this.profile.user.role.code === 'ROLE_MODEL';
    },
    modelScheduleViewPermission() {
      return this.userPermissions.model.profile.schedule.view;
    },
    operatorScheduleViewPermission() {
      return this.userPermissions.operator.profile.schedule.view;
    },
    isShowSchedule() {
      if (this.userRoleCode === 'ROLE_OPERATOR') {
        return this.operatorScheduleViewPermission
      }
      if (this.userRoleCode === 'ROLE_MODEL') {
        return this.modelScheduleViewPermission
      }
      return false
    },
    profileStatus() {
      return this.$store.state.profile.status;
    },
    paymentStatus() {
      return this.$store.state.profile.paymentStatus;
    },
    profileTasksStatus() {
      return this.$store.state.profile.profileTasksStatus;
    },
    profileAuthHistoryStatus() {
      return this.$store.state.profile.profileAuthHistoryStatus;
    },
    fineStatus() {
      return this.$store.state.profile.fineStatus;
    },
    genders() {
      return this.$store.state.dictionaries.genders;
    },
    absenceTypes() {
      return this.$store.state.dictionaries.absenceTypes;
    },
    profile() {
      return this.$store.getters["profile/shortProfile"](this.partnerId || this.userId);
    },
    user() {
      return this.profile.user || {};
    },
    experience() {
      if (this.user.experience <= 30) {
        return pluralize(this.user.experience, ['день', 'дня', 'дней']);
      } else {
        let diffMonths = moment().diff(moment().subtract(this.user.experience, 'd'), 'months')
        let mounts = diffMonths % 12
        let years = (diffMonths - mounts) / 12
        return `${years ? pluralize(years, ['год', 'года', 'лет']) : ''} ${mounts ? pluralize(mounts, ['месяц', 'месяца', 'месяцев']) : ''}`
      }
    },
    age() {
      return this.user.birthday ? pluralize(moment().diff(this.user.birthday, 'years'), ['год', 'года', 'лет']) : '';
    },
    jobDutiesList() {
      return this.$store.state.dictionaries.jobDuties;
    },
    /*availableRoles() {
      return this.$store.state.auth.user.role?.available_roles || [];
    },
    roles() {
      if (this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN') return this.$store.state.dictionaries.roles;
      if (!this.userRoleCode || this.availableRoles.find(role => role.code === this.userRoleCode)) return this.availableRoles;
      return [this.profile.role, ...this.availableRoles];
    },
    optionsRoles() {
      return this.roles.filter(role => role.code !== 'ROLE_OPERATOR' && role.code !== 'ROLE_MODEL' )
    },
    selectedRole() {
      return this.roles.find(role => role.code === this.userRoleCode) || {};
    },*/
    userRoleTitle() {
      return this.user.role?.title || this.user.role_name;
    },
    formattedDate() {
      if (!this.user.birthday) return '';
      return new Date(this.user.birthday).format('dd.mm.yyyy');
    },
    userPermissions() {
      return this.$store.state.auth.userPermissions;
    },
    editPermission() {
      return this.userPermissions[this.userType].profile.personal.edit;
    },
    viewPermission() {
      return this.userPermissions[this.userType].profile.personal.view;
    },
    paymentInfoEditPermission() {
      return this.userPermissions[this.userType].profile.payment.information.edit;
    },
    paymentInfoViewPermission() {
      return this.userPermissions[this.userType].profile.payment.information.view;
    },
    showGroupPermission() {
      return this.userPermissions[this.userType].profile.group.view;
    },
    editGroupPermission() {
      return this.userPermissions[this.userType].profile.group.edit;
    },
    tasksViewPermission() {
      return this.userPermissions.task.call_center.view ||
          this.userPermissions.task.interview.view ||
          this.userPermissions.task.psych.view ||
          this.userPermissions.task.video.view ||
          this.userPermissions.task.registration.view ||
          this.userPermissions.task.dossier.view ||
          this.userPermissions.task.checking.view;
    },
    isSuperAdmin() {
      return this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN';
    },
    currentWeek() {
      if (this.profile.schedule && ((this.userType === 'model') || (this.userType === 'operator'))) {
        let date = moment(this.currentDate);
        if (date.weekday() !== 6) date.weekday(-2);
        else date.weekday(5);
        return [0, 1, 2, 3, 4, 5, 6].map(() => {
          date.add(1, 'd');
          let dateData = {
            dateString: date.format('DD.MM.YYYY'),
            dateStringCompare: date.format('YYYY-MM-DD'),
            dateTitle: date.format('D'),
            dateSubtitle: date.format('dd'),
            workshifts: []
          }
          let workshiftDay = this.profile.schedule[date.format('YYYY-MM-DD')];
          if (workshiftDay) {
            Object.values(workshiftDay).map(period => {
              Object.values(period).map(room => {
                room.workshifts.map(workshift => {
                  let workshiftInfo = {...workshift}
                  if (workshift.start_at && workshift.end_at) workshiftInfo.time = `${workshift.start_at} - ${workshift.end_at}`;
                  else if (workshift.planned_start_at && workshift.planned_end_at) workshiftInfo.time = `${workshift.planned_start_at} - ${workshift.planned_end_at}`;
                  workshiftInfo.partner = this.userType === 'model' ? (workshift.operator ? {
                    ...workshift.operator,
                    userType: 'operator'
                  } : {}) : {...workshift.model, userType: 'model'};
                  workshiftInfo.partner.office = {id: this.officeId};
                  dateData.workshifts.push(workshiftInfo);
                })
              })
            })
          }
          return dateData
        })
      } else return null;
    },
    absencesWeek() {
      return this.profile.absences || [];
    },
    avatar() {
      if ((this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN') && (this.$store.state.auth.user.id !== (this.partnerId || this.userId))) return this.user.manager_avatar;
      return this.userPermissions.personal_avatar.view ? this.user.avatar : this.user.manager_avatar;
    },
    mainGroups() {
      return (this.profile?.role?.code === 'ROLE_OPERATOR') ? (this.profile.profile.operator_groups || []) : (this.profile?.profile?.groups || []);
    },
    userType() {
      switch (this.userRoleCode) {
        case 'ROLE_MODEL':
          return 'model';
        case 'ROLE_OPERATOR':
          return 'operator';
      }
      return 'employee';
    },
    filteredJobDuties() {
      if (!this.jobDutiesList.length || !this.profile.job_duties?.length) return [];
      return filterListRecursively(this.jobDutiesList, (duty) => this.profile.job_duties.includes(duty.id));
    },
    jobDutyConfirmationDate() {
      return this.profile.job_duty_settings.confirmed_at ? moment(this.profile.job_duty_settings.confirmed_at).format('DD.MM.YYYY') : '';
    },
    jobDutiesPermissionsEdit() {
      return this.userPermissions.admin.roles.edit;
    },
    formattedTasks() {
      return (this.userType === 'employee') && this.profile.tasks?.list?.map(task => {
        let plannedStartAt = moment(task.planned_start_at),
            completedAt = task.complete_at && moment(task.complete_at);

        return {
          ...task,
          isOverdue: task.complete_at ? plannedStartAt < completedAt : plannedStartAt < this.currentDate,
          formattedStartAt: plannedStartAt.format('DD.MM.YYYY'),
          formattedCreatedAt: task.created_at && moment(task.created_at)?.format('DD.MM.YYYY') || '',
          formattedCompletedAt: completedAt?.format('DD.MM.YYYY') || '',
        }
      }) || [];
    },
    formattedAuthHistory() {
      return this.profile.authHistory?.list.map(object => ({
        ...object,
        authorization_date: moment.parseZone(object.authorization_date).format('DD.MM.YYYY HH:mm'),
      })) || [];
    },
    /*formattedResignDate() {
        return this.user.resign_date ? moment.parseZone(this.user.resign_date).format('DD.MM.YYYY') : '';
    }*/
    resignReasons() {
      return this.$store.state.dictionaries.resignReasons;
    },
    resignReasonsForSelect() {
      if (!this.user.role?.type) return []
      return [...this.resignReasons.filter(reason => reason.role_type === this.user.role.type), {
        title: 'Другое',
        id: 'other'
      }];
    },
    mainGroup() {
      let mainGroup = this.$store.state.groups.group || {};
      return mainGroup.id === this.user.main_group?.id ? mainGroup : {};
    },
    periods() {
      return this.$store.state.schedule.periods;
    },
    isModelScheduleEditable() {
      return this.userPermissions.model.profile.schedule.edit;
    },
    currentDateRequest() {
      return this.currentDate.format('YYYY-MM-DD');
    },
    errorMessage() {
      return this.$store.state.profile.errorMessage;
    },
    groupsListForToast() {
      if (!this.user.role?.type) return [];
      if (this.user.role.type === 'operator') return this.user.operator_groups || [];
      return this.user.groups || [];
    },
    workshiftStatuses() {
      return this.$store.state.schedule.workshiftStatuses;
    },
  },
  watch: {
    profile: function (newProfile, prevProfile) {
      this.userRoleCode = newProfile.user?.role.code;
      if (newProfile.user?.main_group?.id && (newProfile.user.main_group.id !== prevProfile.user?.main_group?.id) && this.userRoleCode === 'ROLE_MODEL') this.$store.dispatch('groups/fetchGroup', newProfile.user.main_group.id);
      if (newProfile.user?.id && (prevProfile?.user?.id !== newProfile.user.id)) this.updateNestedData(newProfile);
      else this.$nextTick(this.setCellWidths);
    },
    userId: function () {
      this.droverType = 'mini-profile';
      this.updateProfile();
    },
    formattedTasks: function () {
      this.$nextTick(this.setCellWidths);
    },
    mainGroup: function (newGroup, prevGroup) {
      if ((newGroup.type === 'office') && (newGroup.parent.id !== prevGroup.parent?.id) && ((this.userType === 'model') || (this.userType === 'operator')) && this.isModelScheduleEditable)
        this.$store.dispatch('schedule/fetchPeriodsForGroup', {
          group: newGroup.parent.id,
          'workweek': this.currentDate.format('YYYY-MM-DD')
        });
    },
    status: function (newStatus, prevStatus) {
      if ((newStatus === '') && (prevStatus === 'editing')) {
        this.chosenResignReason = {};
        this.resignComment = '';
      }
    },
    paymentStatus: function (newStatus, prevStatus) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'creating-payment-info':
            this.backToMiniProfile();
            showToast(this.$toasted, `Платежные данные созданы`);
            break;
          case 'editing-payment-info':
            this.backToMiniProfile();
            showToast(this.$toasted, 'Изменения сохранены');
            break;
          case 'deleting-payment-info':
            this.backToMiniProfile();
            showToast(this.$toasted, `Платежные данные удалены`);
            break;
        }
      }
    },
    fineStatus: function (newStatus, prevStatus) {
      if (newStatus === '') {
        switch (prevStatus) {
          case 'creating-fine':
            this.backToMiniProfile();
            showToast(this.$toasted, 'Сотруднику назначен штраф');
            break;
          case 'editing-fine':
            this.backToMiniProfile();
            showToast(this.$toasted, 'Штраф сохранён');
            break;
          case 'canceling-fine':
            this.backToMiniProfile();
            showToast(this.$toasted, 'Штраф отменён');
            break;
        }
      }
      if (newStatus === 'error') {
        switch (prevStatus) {
          case 'creating-fine':
            showToast(this.$toasted, 'Штраф не назначен. Пожалуйста, попробуйте ещё раз', 'error');
            break;
          case 'editing-fine':
            showToast(this.$toasted, 'Штраф не сохранен. Пожалуйста, попробуйте ещё раз', 'error');
            break;
          case 'canceling-fine':
            showToast(this.$toasted, 'Штраф не отменён. Пожалуйста, попробуйте ещё раз', 'error');
            break;
        }
      }
    },
    profileStatus: function (prevStatus, newStatus) {
      if ((newStatus === 'error') && this.errorMessage) this.$toasted.error(this.errorMessage, {
        position: 'bottom-left',
        keepOnHover: true,
        duration: 5000,
        action: {
          text: '',
          class: 'btn-close',
          onClick: closeToast,
        }
      });
    },
  },
  created() {
    let firstActiveDate = moment();
    if (firstActiveDate.weekday() !== 6) firstActiveDate.weekday(-2);
    else firstActiveDate.subtract(1, 'day');
    this.firstActiveDate = firstActiveDate;
    if (this.userId) this.updateProfile();
    this.lastDate = this.currentDate.format('DD.MM.YYYY');
    this.$store.dispatch('dictionaries/fetchAbsenceTypes');
    this.$store.dispatch('dictionaries/getRoles');
    if (this.jobDutiesPermissionsEdit)
      this.$store.dispatch('dictionaries/fetchJobDuties');
    this.$store.dispatch('dictionaries/fetchResignReasons');
    if (this.profile.id) this.updateNestedData();
  },
  mounted() {
    this.setCellWidths();
  },
  methods: {
    updateNestedData(profile = this.profile) {
      if (this.userPermissions.admin.authorizationHistory.view) {
        this.$store.dispatch('profile/fetchShortProfileAuthHistory', {['user.id']: this.partnerId || this.userId});
      }
      this.updateDataByUserType(profile);
    },
    updateDataByUserType(profile = this.profile) {
      switch (profile.user?.role.code) {
        case 'ROLE_MODEL':
          if (this.modelScheduleViewPermission) this.$store.dispatch('profile/fetchShortProfileSchedule', {
            userId: this.partnerId || this.userId,
            query: {
              office: this.officeId,
              workweek: this.currentDate.format('YYYY-MM-DD'),
              model: this.partnerId || this.userId,
            },
          });
          break;
        case 'ROLE_OPERATOR':
          if (this.operatorScheduleViewPermission) this.$store.dispatch('profile/fetchShortProfileSchedule', {
            userId: this.partnerId || this.userId,
            query: {
              workweek: this.currentDate.format('YYYY-MM-DD'),
              operator: this.partnerId || this.userId,
            },
          });
          break;
        default:
          if (this.tasksViewPermission) this.$store.dispatch('profile/fetchShortProfileTasks', {
            userId: this.partnerId || this.userId,
            query: {
              status: 'active',
            },
          });
      }
    },
    toggleCollapse(code) {
      this.visible = {
        ...this.visible,
        [code]: !this.visible[code],
      };
    },
    /*toggleBlocked() {
      if (this.status === 'editing') return;
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {id: this.user.id, blocked: !this.user.blocked});
    },*/
    resetPassword() {
      this.$store.dispatch('users/resetUserPassword', this.partnerId || this.userId);
    },
    /*editRole() {
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {id: this.user.id, role: this.selectedRole.id});
    },*/
    editGroups() {
      if (!this.showGroupPermission) return;
      this.showGroupsForOperator = false;
      this.droverType = 'add-groups';
    },
    editOperatorGroups() {
      this.showGroupsForOperator = true;
      this.droverType = 'add-groups';
    },
    close() {
      this.$emit('close');
    },
    updateProfile() {
      let requestData = {
        userId: this.partnerId || this.userId
      };
      requestData.query = {absence_at: this.currentDate.format('YYYY-MM-DD')};
      if (this.officeId) {
        requestData.query.office = this.officeId;
        requestData.query.workweek = this.currentDate.format('YYYY-MM-DD');
      }
      this.$store.dispatch('profile/fetchShortProfile', requestData);
    },
    prevWeek() {
      this.currentDate = this.currentDate.subtract(1, 'week');
      this.isLastDate = false;
      this.updateDataByUserType();
    },
    nextWeek() {
      if (this.isLastDate) return;
      this.currentDate = this.currentDate.add(1, 'week');
      this.isLastDate = this.lastDate === this.currentDate.format('DD.MM.YYYY');
      this.updateDataByUserType();
    },
    subtractDay(subtractDate) {
      let date = moment(subtractDate);
      date.subtract(1, 'days');
      return date;
    },
    openOtherProfile(partner) {
      if (partner.userType && !this.userPermissions[partner.userType].profile.view) return;
      this.partnerId = partner.id;
      this.updateProfile()
    },
    backToMiniProfile() {
      this.droverType = 'mini-profile';
      this.updateNestedData();
    },
    getSmallImage(link) {
      return getSmallImage(link);
    },
    isDayAbsence(day) {
      let absencesCurrentDay = this.absencesWeek.filter(absence => moment(day.dateStringCompare).isBetween(moment(absence.start_at).format('YYYY-MM-DD'), moment(this.subtractDay(absence.end_at)).format('YYYY-MM-DD'), undefined, '[]'))
      return absencesCurrentDay.length ? absencesCurrentDay.map(absence => {
        return ` ${this.absenceTypes[absence.type]} ${moment(absence.start_at).format('DD.MM')} - ${this.subtractDay(absence.end_at).format('DD.MM')} `
      }) : null
    },
    getAbsencePeriod(absence) {
      return absence.start_at && absence.end_at ? `${moment(absence.start_at).format('DD.MM.YYYY')} - ${moment(absence.end_at).format('DD.MM.YYYY')}` : '';
    },
    openTask(e) {
      this.activeTask = e.row;
      this.taskFlag = false;
      this.droverType = 'task-details';
    },
    setCellWidths() {
      let cellWidths = {};
      this.formattedTasks.map(task => {
        cellWidths[task.id] = {
          title: this.$refs[`user-details-task-title-${task.id}`]?.clientWidth,
          group: this.$refs[`user-details-task-group-${task.id}`]?.clientWidth,
        }
      });
      this.cellWidths = cellWidths;
    },
    resignUser(bvModalEvt) {
      bvModalEvt.preventDefault();
      if (!this.chosenResignReason.title) {
        this.resignReasonError = true
        return;
      }
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {
        id: this.user.id,
        resign: this.chosenResignReason.title,
        resign_comment: this.resignComment,
        is_resign: true
      });
      this.$nextTick(() => {
        this.$bvModal.hide('resign_modal');
      })
    },
    openFineDetails(fine) {
      this.activeFine = fine;
      this.droverType = 'fineDetails';
    },
    changeReasons() {
      this.resignReasonError = false
    },
    activateUser() {
      this.$store.dispatch(`users/edit${getTypeEditUser(this.userType)}`, {id: this.user.id, is_resign: false});
    },
    handleScroll() {
      if ((this.profileTasksStatus === 'request-page') || !this.profile.tasks?.headers?.currentPage || (this.profile.tasks.headers.currentPage >= this.profile.tasks.headers.totalPages)) return;
      let middleElement = this.profile.tasks.headers.perPage * this.profile.tasks.headers.currentPage - 3,
          middleElementId = this.formattedTasks[middleElement]?.id;

      if (!this.$refs[`user-details-task-title-${middleElementId}`]) return;
      let middleElementPosition = this.$refs[`user-details-task-title-${middleElementId}`]?.getBoundingClientRect()?.top;
      if (middleElementPosition < window.innerHeight) this.$store.dispatch('profile/fetchShortProfileTasksPage', {
        userId: this.partnerId || this.userId,
        query: {
          status: 'active',
          page: this.profile.tasks.headers.currentPage + 1,
        },
      });
    },
    handleAuthHistoryScroll() {
      if ((this.profileAuthHistoryStatus === 'request-page') || !this.profile.authHistory?.headers?.currentPage || (this.profile.authHistory.headers.currentPage >= this.profile.authHistory.headers.totalPages)) return;
      let middleElement = this.profile.authHistory.headers.perPage * this.profile.authHistory.headers.currentPage - 3,
          middleElementId = this.formattedAuthHistory[middleElement]?.id;

      if (!this.$refs[`user-details-auth-history-group-${middleElementId}`]) return;
      let middleElementPosition = this.$refs[`user-details-auth-history-group-${middleElementId}`]?.getBoundingClientRect()?.top;
      if (middleElementPosition < window.innerHeight) this.$store.dispatch('profile/fetchShortProfileAuthHistoryPage', {
        ['user.id']: this.profile.id,
        page: this.profile.authHistory.headers.currentPage + 1,
      });
    },
    openAbsenceDetails(currentScheduleDate) {
      this.currentScheduleDate = currentScheduleDate;
      this.droverType = 'absence-details';
    },
    createUserAbsence(absence) {
      absence.user = this.user.id;
      this.$store.dispatch('profile/createAbsence', absence);
    },
    openModelSchedule() {
      this.droverType = 'model-schedule';
    },
    editPaymentInfo(template) {
      this.activePaymentInfo = template;
      this.droverType = 'payment-info';
    },
    copyToClipboard(text) {
      clipboard(text, this.copyToClipboardSuccess);
    },
    copyToClipboardSuccess() {
      showToast(this.$toasted, 'Данные скопированы');
    },
  }
}
</script>
