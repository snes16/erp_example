<template>
    <div>
        <b-form v-if="droverType === 'task'" class="response" :class="{'-support' : taskPropCopy.type === 'support'}" @submit.prevent="openActionForm(action)">
          <header-buttons-task @runTaskMethod="runTaskMethod"
                               :taskTypesComplete="taskTypesComplete"
                               :taskPropCopy="taskPropCopy"
          />
            <task-loader  v-if="taskStatusCurrentTasks === 'request'" />
            <template v-else>
                <div class="response-task">
                  <top-head-task-control
                    :breadcrumbsTitle="breadcrumbsTitle"
                    :vacancyTitle="vacancyTitle"
                    @close="close"
                    @openVacancyCreation="openVacancyCreation"
                  />
                  
                  <task-executor
                    v-if="taskPropCopy && taskPropCopy.status"
                    
                    :currentExecutor="currentExecutor"
                    :activeTask="activeTask"
                    :shownErrors="shownErrors"
                    :taskPropCopy="taskPropCopy"
                    :currentUsersUpdated="currentUsersUpdated"
                    
                    @focusField="focusField"
                    @revisionNewAction="revisionNewAction"
                    @closeForm="closeForm"
                    @checkNewTime="checkNewTime"
                    @clickTaskTitle="clickTaskTitle"
                    @registartionAction="registartionAction"
                    @setNicknameFromEmail="setNicknameFromEmail"
                    @checkingNewAction="checkingNewAction"
                    @setNewExecutor="setNewExecutor"
                  />

                  <registration-offices
                    v-if="taskPropCopy.type === 'registration' && taskPropCopy.model.groups.length"
                    :groups="taskPropCopy.model.groups"
                    :mainGroup="taskPropCopy.model.main_group"/>
                  
                  <callCenter-form

                    v-if="activeTask === 'call-center'"
                    :task="taskPropCopy"
                    :executor="executor"
                    :datetime="datetime"
                    :users="currentUsersUpdated"
                    @close="closeForm"
                  />
                  
                  <interview-form
                    v-if="activeTask === 'interview' || (taskPropCopy && taskPropCopy.type === 'call_center' && taskPropCopy.status === 'completed' && taskOpened)"
                    :task="taskPropCopy"
                    :communications="communications"
                    :nextUsers="nextCurrentUsersUpdated"
                    :errorSendInterview="errorSendInterview"
                    :shownErrors="shownErrors"
                    :busyDates="busyDates"
                    :taskPropCopy="taskPropCopy"
                    
                    @send="sendInterview"
                    @focusField="focusField"
                    @setTimeWithExecutor="setTimeWithExecutor"
                    @setExecutor="setExecutor"
                    @updateBusyDates="updateBusyDates"
                    @close="closeForm"
                  />
                  
                  <ModelProfile
                    v-if="activeTask === 'psycho' && taskPropCopy|| (taskPropCopy && taskPropCopy.type === 'psych' && taskPropCopy.status === 'completed')"
                    
                    :taskPropCopy="taskPropCopy"
                    
                    @submit="psychTaskAction"
                  />
                  
                  <PsychoTestForm
                    v-if="currentTask && currentTask.type === 'psych' && taskPropCopy"
                    
                    :taskPropCopy="taskPropCopy"
                    :parametersDuplicate="parametersDuplicate"
                    
                    @clickUser="clickUser"
                    @openModalConfirm="openModalConfirm"
                  />
                  
                  <InterviewTaskForm
                    v-if="activeTask === 'recruit'|| (taskPropCopy && taskPropCopy.type === 'interview' && (taskPropCopy.status === 'completed' || taskPropCopy.status === 'check')) || openBlock"                    :task="currentTask"
                    
                    :chosenGroup="chosenGroup"
                    :shownErrors="shownErrors"
                    :showOfficeError="showOfficeError"
                    :resultFiles="resultFiles"
                    :taskPropCopy="taskPropCopy"
                    
                    @interviewTaskAction="interviewTaskAction"
                    @focusField="focusField"
                    @closeForm="closeForm"
                    @setDroverType="setDroverType"
                    @openOfficeList="openOfficeList"
                    @formattedDateWithoutTime="formattedDateWithoutTime"
                  />
                  
                    <support-chat
                      v-if="taskPropCopy.type === 'support'"
                      :is-loading="commentStatus === 'creating'"
                      :isSupport="true"
                      :messages="messagesSupport"
                      @send-message="sendMsgSupport"
                    />
                  
                    <div v-if="(taskPropCopy.status === 'completed') && (taskPropCopy.type === 'checking')" class="response-action_form">
                        <h4>Изменение статуса</h4>
                        <div class="row">
                            <div class="col-sm-6 col-xs-12">
                                <b>Статус аккаунта</b>
                            </div>
                            <div class="col-sm-6 col-xs-12">
                                <span>{{ credentialStatusesChecking[taskPropCopy.credential_status] }}</span>
                            </div>
                        </div>
                        <b-input v-model="taskPropCopy.result" class="mt-2" placeholder="Укажите причину отклонения" disabled />
                    </div>
                    <b-form v-else-if="activeTask === 'checking'" class="response-action_form" @submit.prevent="checkingNewTaskAction">
                        <div class="response-action_form-title">
                            <h4>Изменение статуса</h4>
                            <div class="helper-close" @click="closeForm"></div>
                        </div>
                        <div class="row">
                            <div class="col-sm-6 col-xs-12">
                                <b>Статус аккаунта</b>
                            </div>
                            <div class="col-sm-6 col-xs-12">
                                <custom-select v-model="credentialStatus" :options="credentialStatusesChecking" defaultText="Выберите статус" />
                            </div>
                        </div>
                        <b-input v-model="credentialComment" class="mt-2" placeholder="Добавьте комментарий" />
                        <div class="response-action_form-send_field -planned_date">
                            <div class="response-action_form-action_field-date -md">
                                <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar" />
                                <date-picker
                                    v-model="taskPropCopy.next_planned_start_at"
                                    lang="ru"
                                    type="date"
                                    input-class="form-control response-action_form-action_field-block-date"
                                    :input-class="'input-plain' + (shownErrors.includes('next_planned_start_at') ? '-error' : '')"
                                    placeholder="Выберите дату проверки"
                                    format="DD.MM.YYYY"
                                    value-type="YYYY-MM-DD"
                                    @focus="focusField('next_planned_start_at')"
                                >
                                    <i slot="calendar-icon" />
                                </date-picker>
                            </div>
                            <b-button size="md" variant="primary" type="submit">Изменить статус</b-button>
                        </div>
                    </b-form>
                    <div v-else-if="(((taskPropCopy.status === 'completed')) && (taskPropCopy.type === 'reregistration')) || (activeTask === 'reregistration')" class="response-action_form">
                        <h4>Созда{{ taskPropCopy.status === 'completed' ? 'ны' :'ть' }} новые аккаунты</h4>
                        <div v-for="(account, key) in credentials" class="response-action_form-account">
                            <div class="response-action_form-account-block -resource">
                                <b>{{ account.resource }}</b>
                            </div>
                            <div class="response-action_form-account-block -login">
                                <input v-model="account.login"
                                       class="input-plain"
                                       :class="{'-error': !account.loginState}"
                                       placeholder="Логин*"
                                       :disabled="taskPropCopy.status === 'completed'"
                                       autocomplete="new-password"
                                       @input="changeAccountField(key, 'login')"
                                />
                            </div>
                            <div class="response-action_form-account-block -screenname">
                                <input v-model="account.model_screen_name"
                                       class="input-plain"
                                       placeholder="Скриннейм"
                                       :class="{'-error': !account.screennameState}"
                                       :disabled="taskPropCopy.status === 'completed'"
                                       autocomplete="new-password"
                                       @change="changeAccountField(key, 'screenname')"
                                />
                            </div>
                            <div class="response-action_form-account-block -password">
                                <password-field v-model="account.password"
                                                placeholder="Пароль*"
                                                :class="{'-error': !account.passwordState}"
                                                :disabled="taskPropCopy.status === 'completed'"
                                                autocomplete="new-password"
                                                @input="changeAccountField(key, 'password')"
                                />
                            </div>
                        </div>
                        <div class="response-action_form-send_field -planned_date">
                            <div class="response-action_form-action_field-date -lg">
                                <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar" />
                                <date-picker
                                    v-model="taskPropCopy.next_planned_start_at"
                                    lang="ru"
                                    type="date"
                                    input-class="form-control response-action_form-action_field-block-date"
                                    :input-class="'input-plain' + (shownErrors.includes('next_planned_start_at') ? '-error' : '')"
                                    :placeholder="formattedDateWithoutTime(taskPropCopy.result_date) || 'Выберите дату проверки'"
                                    :disabled="(taskPropCopy.status === 'completed') || (taskPropCopy.status === 'check')"
                                    format="DD.MM.YYYY"
                                    value-type="YYYY-MM-DD"
                                    @focus="focusField('next_planned_start_at')"
                                >
                                    <i slot="calendar-icon" />
                                </date-picker>
                            </div>
                            <b-button v-if="(taskPropCopy.status !== 'completed') && (taskPropCopy.status !== 'check')" size="md" variant="primary" @click="reregisterTaskAction">Создать</b-button>
                        </div>
                    </div>
                    <div v-else-if="activeTask === 'restore_password'" class="response-action_form">
                        <div class="response-action_form-title">
                            <p class="response-action_form-title-text">Комментарий</p>
                            <div class="helper-close" @click="closeForm"></div>
                        </div>
                        <b-input placeholder="Добавьте комментарий" v-model="taskComment" :disabled="taskPropCopy.status === 'completed'" required/>
                        <div v-if="taskPropCopy.status !== 'completed'" class="response-action_form-send_field" :style="'border-top: none'">
                            <b-button size="md" variant="info" @click="restoreAction">Восстановить пароль</b-button>
                        </div>
                    </div>
                    <div v-else-if="activeTask === 'custom' || (taskPropCopy && taskPropCopy.type === 'custom' && taskPropCopy.status === 'completed')" class="response-action_form">
                        <div class="response-action_form-title">
                            <p class="response-action_form-title-text">Комментарий к задаче</p>
                            <div v-if="taskPropCopy.status !== 'completed'" class="helper-close" @click="closeForm"></div>
                        </div>
                        <b-input v-model="taskComment"
                                 :placeholder="taskPropCopy.status === 'completed' ? taskPropCopy.result || 'Комментарий не добавлен' : 'Добавьте комментарий'"
                                 :disabled="taskPropCopy.status === 'completed'"/>
                        <div v-if="taskPropCopy.status !== 'completed'" class="response-action_form-send_field" :style="'border-top: none'">
                            <b-button size="md" variant="info" @click="customAction">Добавить</b-button>
                        </div>
                    </div>
                    <b-form v-if="activeTask === 'video' || (taskPropCopy && taskPropCopy.type === 'video' && taskPropCopy.status === 'completed')" class="response-action_form" @submit.prevent="videoTaskAction">
                        <div class="response-action_form-title">
                            <p class="response-action_form-title-text">Результат тестирования</p>
                            <div v-if="!(taskPropCopy && taskPropCopy.type === 'video' && taskPropCopy.status === 'completed')" class="helper-close" @click="closeForm"></div>
                        </div>
                        <p class="response-action_form-subtitle-video">Ссылка на видео</p>
                        <b-input v-if="(taskPropCopy.status !== 'completed') && (taskPropCopy.status !== 'archive') && taskPropCopy.response.albums && taskPropCopy.response.albums.second_album && taskPropCopy.response.albums.second_album[0]" placeholder="Ссылка на видео" v-model="videoLink" required/>
                        <b-input v-else placeholder="Ссылка на видео" v-model="taskPropCopy.response.video_file" disabled/>
                        <p class="response-action_form-subtitle">Фотографии</p>
                        <div>
                            <drop-zone v-if="taskPropCopy.status !== 'completed'"
                                       id="video-drop-zone"
                                       ref="video-drop-zone"
                                       :useCustomSlot="true"
                                       :options="{
                                   url: `${config.baseURLApi}/files`,
                                   headers: { authorization: `Bearer ${accessToken}` },
                                   addRemoveLinks: true,
                                   clickable: true,
                                   thumbnailWidth: 80,
                                   thumbnailHeight: 80,
                                   dictRemoveFile: 'Удалить файл'
                               }"
                         @vdropzone-removed-file="removeFile"
                         @vdropzone-success="successFile"
                         @vdropzone-error="onUploadError(...arguments, 'video-drop-zone')"
              >
                <div class="dropzone-custom-content">
                  <h3 class="dropzone-custom-title">Добавьте файлы для загрузки</h3>
                </div>
              </drop-zone>
              <div
                v-else-if="taskPropCopy.response.albums && taskPropCopy.response.albums.second_album && taskPropCopy.response.albums.second_album[0] && taskPropCopy.response.albums.second_album[0].attachments"
                class="response-action_form-files_field">
                <div class="response-action_form-files_field-file"
                     v-for="(file, index) in taskPropCopy.response.albums.second_album[0].attachments" :key="index"
                     :style="file.link ? `background-image: url(${file.preview_link}); background-size: cover;` : ''">
                  <a :href="file.download_link" :download="file.filename"
                     class="response-action_form-files_field-file-link glyphicon-link"></a>
                </div>
              </div>
            </div>
            <p class="response-action_form-subtitle">Комментарий</p>
            <b-input v-if="(taskPropCopy.status !== 'completed') && (taskPropCopy.status !== 'archive')"
                     v-model="videoComment" placeholder="Добавьте комментарий"/>
            <p v-else class="response-action_form-comment">{{ taskPropCopy.result || '' }}</p>
            <div v-if="taskPropCopy && taskPropCopy.status !== 'completed'" class="response-action_form-send_field"
                 :style="'border-top: none'">
              <b-button size="md" variant="info" type="submit">Выполнить</b-button>
            </div>
          </b-form>
          <div v-if="activeTask === 'archive' || (taskPropCopy.status === 'archive')" class="response-action_form">
            <div class="response-action_form-title">
              <p class="response-action_form-title-text">{{ archiveTitleStatus }}</p>
              <div v-if="taskPropCopy.status !== 'archive'" class="helper-close" @click="closeForm"></div>
            </div>
            <b-input v-if="taskPropCopy.status === 'archive'"
                     :value="(taskPropCopy.is_reject ? (taskPropCopy.rejection_reason && taskPropCopy.rejection_reason.title) : taskPropCopy.result ) || ''"
                     disabled/>
            <custom-select v-else-if="rejected && ((taskPropCopy.status !== 'archive') || (cancellationReason))"
                           v-model="cancellationReason"
                           :options="taskPropCopy.rejection_reason_list"
                           :disabled="taskPropCopy.status === 'archive'"
                           :error="shownErrors.includes('cancellationReason')"
                           defaultText="Выберите причину отказа"
                           class="-white -alt"
                           valueField="id"
                           @change="focusField('cancellationReason')"
            />
            <b-input v-else v-model="taskComment" placeholder="Укажите причину архивирования"/>
            <div v-if="taskPropCopy.status !== 'archive'" class="response-action_form-send_field"
                 :class="isTaskCancellable && (taskPropCopy.type !== 'interview') ? 'justify-content-between' : ''">
              <div></div>
              <b-button size="md" variant="primary" @click="archiveAction">Отказать</b-button>
            </div>
          </div>
          <div v-if="activeTask === 'put-off'" class="response-action_form">
            <div class="response-action_form-title">
              <p class="response-action_form-title-text">Отложить заявку</p>
              <div class="helper-close" @click="closeForm"></div>
            </div>
            <div v-if="taskPropCopy.type === 'interview'">
              <custom-select v-model="chosenPostponemenetReason"
                             :options="optionsPostponementReasons"
                             class="-white -alt"
                             :error="shownErrors.includes('chosen_postponemenet_reason')"
                             defaultText="Укажите причину переноса"
                             value-field="id"
                             returnWholeObject
                             @change="focusField('chosen_postponemenet_reason')"
              />
              <b-input v-if="chosenPostponemenetReason.id === 'other'"
                       v-model="taskComment"
                       class="mt-2"
                       :class="{'-error': shownErrors.includes('postponemenet_reason')}"
                       placeholder="Укажите причину переноса"
                       @focus="focusField('postponemenet_reason')"
              />
            </div>
            <b-input v-else
                     v-model="taskComment"
                     placeholder="Укажите причину переноса"
                     :class="{'-error': shownErrors.includes('taskComment')}"
                     @input="focusField('taskComment')"
            />
            <div class="response-action_form-send_field justify-content-between">
              <div class="response-task-parameters-title-date -edit_background d-flex align-items-center">
                <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar"/>
                <date-picker v-model="taskPropCopy.complete_at"
                             class="datepicker-plain response-info_data-field-date p-0"
                             lang="ru"
                             type="datetime"
                             placeholder="Выберите дату"
                             :input-class="'input-plain' + (shownErrors.includes('complete_at') ? ' -error' : '')"
                             :time-picker-options="timePickerOptionsTask"
                                             format="DD.MM.YYYY, HH:mm"
                                             value-type="YYYY-MM-DDTHH:mm"
                                             @focus="focusField('complete_at')"
                                >
                                    <i style="display: none;" slot="calendar-icon" />
                                </date-picker>
                            </div>
                            <b-button size="md" variant="info" @click="doLaterAction">Отложить</b-button>
                        </div>
                    </div>
                    <div v-if="activeTask !== 'put-off' && taskPropCopy.status === 'postponed'" class="response-action_form">
                        <div class="response-action_form-title">
                            <p class="response-action_form-title-text">Заявка отложена</p>
                        </div>
                        <p class="response-action_form-postponed_result">{{taskPropCopy && taskPropCopy.postponed_last_comment && taskPropCopy.postponed_last_comment.text ? taskPropCopy.postponed_last_comment.text : 'Причина переноса не указана'}}</p>
                    </div>
                    <div v-if="activeTask === 'dossier' || (taskPropCopy && taskPropCopy.type === 'dossier' && taskPropCopy.status === 'completed')" class="response-action_form">
                        <div class="response-action_form-title">
                            <p class="response-action_form-title-text">Комментарий</p>
                            <div v-if="!(taskPropCopy.type === 'dossier' && taskPropCopy.status === 'completed')" class="helper-close" @click="closeForm"></div>
                        </div>
                        <b-input v-if="(taskPropCopy.status !== 'completed') && (taskPropCopy.status !== 'archive')" placeholder="Добавьте комментарий" v-model="taskComment" :disabled="taskPropCopy.status === 'completed'" required/>
                        <p v-else class="response-action_form-comment">{{ taskPropCopy.result || ''}}</p>
                        <div v-if="taskPropCopy && taskPropCopy.status !== 'completed'" class="response-action_form-send_field" :style="'border-top: none'">
                            <b-button size="md" variant="info" @click="dossierAction">Выполнить</b-button>
                        </div>
                    </div>
                    <template v-if="(taskPropCopy.type === 'checking') && taskPropCopy.resource_credential">
                        <div class="response-info_data">
                            <h4>Причина блокировки</h4>
                            <b-input :value="taskPropCopy.resource_credential.blocking_reason && taskPropCopy.resource_credential.blocking_reason.title" class="mt-2" placeholder="Укажите причину блокировки" disabled />
                        </div>
                        <div class="response-info_data">
                            <h4 class="mb-4">Аккаунт на сервисе</h4>
                            <div class="row mb-4">
                                <div class="col-sm-6 col-xs-12">
                                    <b>Название сервиса</b>
                                </div>
                                <div class="col-sm-6 col-xs-12">
                                    <span class="pl-3">{{ taskPropCopy.resource_credential.resource_title }}</span>
                                </div>
                            </div>
                            <div class="row mb-4">
                                <div class="col-sm-6 col-xs-12">
                                    <b>Статус</b>
                                </div>
                                <div class="col-sm-6 col-xs-12">
                                    <span class="pl-3">{{ profileCredentialStatuses[taskPropCopy.resource_credential.status] }}</span>
                                </div>
                            </div>
                            <div class="row mb-4">
                                <div class="col-sm-6 col-xs-12">
                                    <b>Логин</b>
                                </div>
                                <div class="col-sm-6 col-xs-12">
                                    <span class="pl-3">{{ taskPropCopy.resource_credential.login }}</span>
                                </div>
                            </div>
                            <div v-if="taskPropCopy.resource_credential.model_screen_name" class="row mb-4">
                                <div class="col-sm-6 col-xs-12">
                                    <b>Скриннейм</b>
                                </div>
                                <div class="col-sm-6 col-xs-12">
                                    <span class="pl-3">{{ taskPropCopy.resource_credential.model_screen_name }}</span>
                                </div>
                            </div>
                            <div class="row mb-4">
                                <div class="col-sm-6 col-xs-12">
                                    <b>Пароль</b>
                                </div>
                                <div class="col-sm-6 col-xs-12">
                                    <password-field class="pl-3" :value="taskPropCopy.resource_credential.password" disabled />
                                </div>
                            </div>
                        </div>
                    </template>
                    <template v-else-if="(taskPropCopy.type === 'checking_new')">
                        <div class="response-info_data">
                            <h4 class="mb-4">Аккаунты на ресурсах</h4>
                            <template v-if="credentials.length">
                                <div v-for="(account, key) in credentials" class="response-info_data-accounts-account">
                                    <div class="response-info_data-accounts-account-block -resource">
                                        <b>{{ account.resource }}</b>
                                    </div>
                                    <div class="response-info_data-accounts-account-block -login">
                                        <span>{{ account.login }}</span>
                                    </div>
                                    <div class="response-info_data-accounts-account-block -screenname">
                                        <span v-if="account.model_screen_name">{{ account.model_screen_name }}</span>
                                        <span v-else class="text-gray-text">Скриннейм</span>
                                    </div>
                                    <div class="response-info_data-accounts-account-block -password">
                                        <password-field :value="account.password" disabled />
                                    </div>
                                    <div class="response-info_data-accounts-account-block -status">
                                        <div v-if="(taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed')"
                                             class="response-info_data-accounts-account-block-status"
                                             :class="`-${account.actualStatus}`"
                                        >{{ credentialStatuses[account.actualStatus] }}</div>
                                        <custom-select v-else
                                                       v-model="account.status"
                                                       :options="credentialStatuses"
                                                       default-text="Выберите статус"
                                                       :error="!account.statusState"
                                                       :disabled="!editPermissions"
                                                       @change="changeAccountStatus(key)"
                                        />
                                    </div>
                                    <div v-if="(account.prevReason)" class="response-info_data-accounts-account-block">
                                        <b-input v-model="account.prevReason" placeholder="Укажите причину отклонения" disabled />
                                    </div>
                                    <div v-if="((account.status === 'need_improved') || (account.status === 'reregistration')) && ((taskPropCopy.status !== 'archive') && (taskPropCopy.status !== 'completed'))" class="response-info_data-accounts-account-block">
                                        <b-input v-model="account.reason" placeholder="Укажите причину отклонения" :state="account.reasonState" @input="changeAccountField(key, 'reason')"></b-input>
                                    </div>
                                </div>
                            </template>
                            <div v-else class="response-info_data-accounts-empty">
                                Аккаунты для проверки не найдены. Возможно, они уже были проверены
                            </div>
                        </div>
                        <div v-if="(taskPropCopy.resources && taskPropCopy.resources.length) || (taskPropCopy.resources_for_registration && taskPropCopy.resources_for_registration.length)" class="response-info_data">
                            <h4 class="mb-4">Создать дополнительные аккаунты</h4>
                            <div class="add_services-resources">
                                <div v-for="(resource) in (taskPropCopy.resources_for_registration || taskPropCopy.resources)" class="add_services-resources-resource">
                                    <div class="add_services-resources-resource-title">
                                        <b class="add_services-resources-resource-title-text">{{ resource.title }}</b>
                                        <span :id="`account-resource-${resource.id}`" class="add_services-resources-resource-title-account text-gray">{{ pluralizeAccount(resource.credentials.length) }}</span>
                                    </div>
                                    <div class="add_services-resources-resource-checkbox">
                                        <span class="add_services-resources-resource-checkbox-message">Зарегистрировать</span>
                                        <div class="abc-checkbox">
                                            <input v-model="chosenResourcesForAdding" :value="resource.id" type="checkbox" :id="`resource-${resource.id}`" :disabled="((taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed'))" />
                                            <label :for="`resource-${resource.id}`" />
                                        </div>
                                    </div>
                                    <b-tooltip v-if="resource.credentials.length" :target="`account-resource-${resource.id}`" triggers="hover" custom-class="add_services-resources-tooltip">
                                        <div v-for="credential in resource.credentials" class="add_services-resources-tooltip">
                                            <span class="add_services-resources-tooltip-title">{{ credential.login }}</span>
                                            <div class="add_services-resources-tooltip-status" :class="`-${credential.status}`">{{ allCredentialStatuses[credential.status] }}</div>
                                        </div>
                                    </b-tooltip>
                                </div>
                            </div>
                        </div>
                    </template>
                    <div v-else-if="(taskPropCopy.type === 'revision_new')" class="response-info_data">
                        <h4 class="mb-4">Аккаунты требующие доработки</h4>
                        <template v-if="credentials.length">
                            <div v-for="(account, key) in credentials" class="response-info_data-accounts-account">
                                <div v-if="account.status === 'revision_not_completed'" class="response-info_data-accounts-account-block -rerevision">
                                  <span class="text-semibold">Назначить доработку</span>
                                  <div class="response-info_data-accounts-account-block-card mt-2"
                                       :class="{'-active': (taskPropCopy.status === 'active') && (activeTask !== 'revision_new')}"
                                  >
                                    <div class="row">
                                      <div class="col-7">
                                        <div class="position-relative d-flex align-items-center">
                                          <avatar class="mr-2"
                                                  :url="account.responsible_user && account.responsible_user.avatar"
                                                  is-large
                                                  :telegram="account.responsible_user && account.responsible_user.telegram_connected"
                                                  :is-fin-admin="account.responsible_user && account.responsible_user.is_fin_admin"
                                          />
                                          <custom-select v-model="account.responsible_user"
                                                         :options="optionsCurrentUsersUpdated"
                                                         class="response-task-parameters-title-executor-full_name response-task-parameters-title-executor-settings"
                                                         valueField="id"
                                                         titleField="surname"
                                                         altTitleField="fullname"
                                                         defaultText="Исполнитель не назначен"
                                                         return-whole-object
                                                         :error="!account.responsibleUserState"
                                                         :disabled="!editPermissions || (taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed')"
                                                         searchable
                                                         @change="changeAccountField(key, 'responsibleUser')"
                                          >
                                            <template v-slot:chosen-variant="props">
                                              <template v-if="props.value">
                                                <span v-if="props.value.uid || props.value.surname || props.value.fullname">
                                                  <template v-if="!props.value.uid || !props.value.surname">{{ props.value.uid || props.value.surname || props.value.fullname }}</template>
                                                  <template v-else>
                                                      <span class="text-gray mr-1">{{ props.value.uid }}</span>
                                                      <span>{{ props.value.surname }}</span>
                                                  </template>
                                                </span>
                                                <span v-else>{{ props.shownText }}</span>
                                              </template>
                                              <span v-else>{{ props.shownText }}</span>
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
                                                  <template v-if="!props.variant.uid || !props.variant.surname">{{ props.variant.uid || props.variant.surname }}</template>
                                                  <template v-else>
                                                    <span class="text-gray mr-1">{{ props.variant.uid }}</span>
                                                    <span>{{ props.variant.surname }}</span>
                                                  </template>
                                                  <template v-for="absence in props.variant.checkedAbsences" class="response-task-parameters-title-executor-settings-setting-item-absence">
                                                    <b class="text-gray mr-1"><absence/> {{ absence }}</b>
                                                  </template>
                                                </div>
                                              </div>
                                            </template>
                                          </custom-select>
                                        </div>
                                      </div>
                                      <div class="col-5 d-flex justify-content-end align-items-center">
                                        <div v-if="taskPropCopy.status === 'active'" class="response-action_form-action_field-date -xs">
                                          <div class="response-action_form-action_field-block-icon glyphicon glyphicon-glyph-calendar" />
                                          <date-picker v-model="account.planned_start_at"
                                                       lang="ru"
                                                       format="DD.MM.YYYY"
                                                       value-type="YYYY-MM-DD"
                                                       type="date"
                                                       placeholder="Дата"
                                                       :clearable="false"
                                                       :input-class="'input-plain' + (!account.plannedStartAtState ? '-error' : '')"
                                                       :disabled="!editPermissions || (taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed')"
                                                       @change="changeAccountField(key, 'plannedStartAt')"
                                          >
                                            <i slot="calendar-icon" />
                                          </date-picker>
                                        </div>
                                        <span v-else class="text-gray-text text-size-normal">{{ account.formattedPlannedStartAt }}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="response-info_data-accounts-account-block -resource">
                                    <b>{{ account.resource }}</b>
                                </div>
                                <div class="response-info_data-accounts-account-block -login">
                                    <input v-model="account.login"
                                           class="input-plain"
                                           placeholder="Логин"
                                           :class="{'-error': !account.loginState}"
                                           :disabled="!editPermissions || (taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed') || preventEdit"
                                           autocomplete="new-password"
                                           @input="changeAccountField(key, 'login')"
                                    />
                                </div>
                                <div class="response-info_data-accounts-account-block -screenname">
                                    <input v-model="account.model_screen_name"
                                           class="input-plain"
                                           placeholder="Скриннейм"
                                           :class="{'-error': !account.screennameState}"
                                           :disabled="!editPermissions || (taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed') || preventEdit"
                                           autocomplete="new-password"
                                           @input="changeAccountField(key, 'screenname')"
                                    />
                                </div>
                                <div class="response-info_data-accounts-account-block -password">
                                    <password-field v-model="account.password"
                                                    :class="{'-error': !account.passwordState}"
                                                    :disabled="!editPermissions || (taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed') || preventEdit"
                                                    autocomplete="new-password"
                                                    @input="changeAccountField(key, 'password')"
                                    />
                                </div>
                                <div class="response-info_data-accounts-account-block -status">
                                    <div v-if="(taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed')"
                                         class="response-info_data-accounts-account-block-status -revision_new"
                                         :class="`-${account.actualStatus}`"
                                    >{{ credentialStatusesRevisionNew[account.actualStatus] }}</div>
                                    <custom-select v-else
                                                   v-model="account.status"
                                                   :options="credentialStatusesRevisionNew"
                                                   :error="!account.statusState"
                                                   default-text="Выберите статус"
                                                   :disabled="!editPermissions"
                                                   right
                                                   @change="changeAccountField(key, 'status')"
                                    />
                                </div>
                                <div v-if="account.prevReason" class="response-info_data-accounts-account-block">
                                    <b-input :value="account.prevReason" disabled />
                                </div>
                                <div class="response-info_data-accounts-account-block">
                                    <b-input v-model="account.reason"
                                             placeholder="Добавьте комментарий о доработке аккаунта"
                                             :state="account.reasonState"
                                             :disabled="!editPermissions || (taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed')"
                                             @input="changeAccountField(key, 'reason')"
                                    />
                                </div>
                            </div>
                        </template>
                        <div v-else class="response-info_data-accounts-empty">
                            Аккаунты для проверки не найдены. Возможно, они уже были проверены
                        </div>
                    </div>
                    <div v-else-if="(taskPropCopy.type === 'reregistration')" class="response-info_data">
                        <h4 class="mb-4">Аккаунты на ресурсах</h4>
                        <template v-if="taskPropCopy.check_credentials.length">
                            <div v-for="account in taskPropCopy.check_credentials" class="response-info_data-accounts-account">
                                <div class="response-info_data-accounts-account-block -resource">
                                    <b>{{ account.resource }}</b>
                                </div>
                                <div class="response-info_data-accounts-account-block -login">
                                    <span>{{ account.login }}</span>
                                </div>
                                <div class="response-info_data-accounts-account-block -screenname">
                                    <span v-if="account.model_screen_name">{{ account.model_screen_name }}</span>
                                    <span v-else class="text-gray-text">Скриннейм</span>
                                </div>
                                <div class="response-info_data-accounts-account-block -password">
                                    <password-field :value="account.password" disabled />
                                </div>
                                <div class="response-info_data-accounts-account-block -status">
                                    <div class="response-info_data-accounts-account-block-status" :class="`-${account.status}`">{{ credentialStatuses[account.status] }}</div>
                                </div>
                                <div v-if="account.reason" class="response-info_data-accounts-account-block">
                                    <b-input :value="account.reason" disabled />
                                </div>
                            </div>
                        </template>
                        <div v-else class="response-info_data-accounts-empty">
                            Аккаунты для проверки не найдены. Возможно, они уже были проверены
                        </div>
                    </div>
                    <div v-else-if="(taskPropCopy.type === 'password_change')" class="response-info_data">
                        <h4 class="mb-4">Аккаунты на ресурсах</h4>
                        <template v-if="taskPropCopy.check_credentials.length">
                            <div v-for="(account, key) in credentials" class="response-info_data-accounts-account">
                                <div class="response-info_data-accounts-account-block -resource -lg">
                                    <b>{{ account.resource }}</b>
                                </div>
                                <div class="response-info_data-accounts-account-block -login -lg">
                                    <span>{{ account.login }}</span>
                                </div>
                                <div class="response-info_data-accounts-account-block -screenname -lg">
                                    <span>{{ account.model_screen_name }}</span>
                                </div>
                                <div class="response-info_data-accounts-account-block -password -lg">
                                    <password-field v-model="account.new_password"
                                                    autocomplete="new-password"
                                                    :class="{'-error': !account.passwordState}"
                                                    :disabled="!editPermissions || taskPropCopy.status === 'completed'"
                                                    @change="changeAccountPassword(key)"
                                    />
                                </div>
                            </div>
                        </template>
                        <div v-else class="response-info_data-accounts-empty">
                            Аккаунты для проверки не найдены. Возможно, они уже были проверены
                        </div>
                    </div>
                    <div v-else-if="(taskPropCopy.type === 'custom')" class="response-info_data border-bottom-0">
                        <h4 class="mb-2">Описание задачи</h4>
                        <b-textarea class="input-plain response-info_data-description"
                                    :placeholder="taskPropCopy && taskPropCopy.status !== 'new' && !taskPropCopy.description ? 'Описание к задаче не добавлено' : 'Добавьте описание задаче'"
                                    v-model="taskPropCopy.description"
                                    :disabled="!editPermissions || (taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed')"
                                    rows="10"
                                    no-resize
                                    @change="editTaskDescription"/>
                    </div>
                    <div v-else-if="isShowApplicationData"
                         class="response-info_data">
                        <div class="response-info_data-title" @click="toggleAccordion('modelFieldVisible', 0)">
                            <p class="response-info_data-title-text">Данные заявки</p>
                            <i :class="`fa fa-angle-down`"/>
                        </div>
                        <div v-if="taskPropCopy.vacancy" class="response-info_data-resource">
                            Заявка поступила с сервиса
                            <p class="response-info_data-resource-text">{{taskPropCopy.vacancy.resource}}</p>
                        </div>
                        <div v-if="modelProfile.source_user" class="response-info_data-resource">
                            Заявка поступила
                            <p class="response-info_data-resource-text">от сотрудника</p>
                        </div>
                        <b-collapse :visible="modelFieldVisible === 0">
                            <div v-if="modelProfile.source_user" class="row align-items-center pt-4">
                                <template v-if="modelProfile.source_user">
                                    <div class="col-sm-6 col-xs-12 mb-4">
                                        <b>Источник прихода</b>
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4 pl-1">
                                        <b>{{ modelProfile.source_user.fullname }}</b>
                                        <div class="profile_main-card-body-row-value-group">
                                            <span class="flag-icon mr-1" :class="`flag-icon-${modelProfile.source_user.main_group.flag || 'default'}`" :title="modelProfile.source_user.main_group.country"></span>
                                            <span class="text-gray mr-1">{{ modelProfile.source_user.main_group.city }}</span>
                                            <span>{{ modelProfile.source_user.main_group.office }}</span>
                                        </div>
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4">
                                        <b>Город</b>
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4 pl-1">
                                        <div class="profile_main-card-body-row-value-group">
                                            <span class="flag-icon mr-1" :class="`flag-icon-${modelProfile.source_city.flag || 'default'}`" :title="modelProfile.source_city.country"></span>
                                            <span class="text-gray mr-1">{{ modelProfile.source_city.city }}</span>
                                        </div>
                                    </div>
                                </template>
                            </div>
                            <div v-if="taskPropCopy.vacancy" class="row align-items-center pt-4">
                                <div class="col-sm-6 col-xs-12  mb-4">
                                    <b>Вакансия</b>
                                </div>
                                <div class="col-sm-6 col-xs-12 mb-4">
                                    <span>{{ taskPropCopy.vacancy.title }}</span>
                                </div>
                                <div class="col-sm-6 col-xs-12  mb-4">
                                    <b>Город</b>
                                </div>
                                <div class="col-sm-6 col-xs-12 mb-4">
                                    <div v-if="taskPropCopy.group" class="d-flex align-items-center">
                                        <span class="flag-icon mr-1" :class="`flag-icon-${taskPropCopy.group.flag || 'default'}`" :title="taskPropCopy.group.country"></span>
                                        <span>{{ taskPropCopy.group.city || '' }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="response-contact_field border-top">
                                <div class="response-contact_field-phone_mail -phone">
                                    <div class="response-contact_field-phone_mail-icon glyphicon-handset" />
                                    <div class="response-contact_field-phone_mail-data">
                                        <phone-number-input v-model="modelProfile.phone"
                                                            :error="shownErrors.includes('phone')"
                                                            :disabled="(taskPropCopy.type === 'interview') || (taskPropCopy.type === 'call_center') || (taskPropCopy.type === 'restore_password')"
                                                            required
                                                            :key="`task-phone-input-main-${modelProfile.id}`"
                                                            @input="focusField('phone')"
                                                            @change="editPhone"
                                        />
                                    </div>
                                </div>
                                <div class="response-contact_field-phone_mail -email">
                                    <div class="response-contact_field-phone_mail-icon glyphicon-email" />
                                    <div class="response-contact_field-phone_mail-data">
                                        <input
                                            class="response-contact_field-phone_mail-data-number"
                                            type="email"
                                            placeholder="mail@example.com"
                                            v-model="modelProfile.email"
                                            @change="responseAction"
                                            :disabled="taskTypesComplete.includes('dossier') || (taskPropCopy.status === 'completed') || (taskPropCopy.type === 'call_center') || (taskPropCopy.type === 'interview') || (taskPropCopy.type === 'restore_password')"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div class="response-info_data-row pt-4">
                                <template v-if="(taskPropCopy.type === 'call_center') || (taskPropCopy.type === 'interview')">
                                    <div class="col-sm-6 col-xs-12 mb-4">
                                        <b>Фамилия</b>
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4 pl-1">
                                        <input
                                            class="response-info_data-field-input -name"
                                            :class="shownErrors.includes('surname') ? '-error_text' : ''"
                                            @focus="focusField('surname')"
                                            placeholder="Введите фамилию"
                                            v-model="modelProfile.surname"
                                            @change="responseAction"
                                            :disabled="!editPermissions || taskPropCopy.status === 'completed' || taskPropCopy.status === 'check'"
                                            :required="taskPropCopy.type === 'interview'"
                                        />
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4">
                                        <b>Имя</b>
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4 pl-1">
                                        <input
                                            class="response-info_data-field-input -name"
                                            :class="shownErrors.includes('name') ? '-error_text' : ''"
                                            @focus="focusField('name')"
                                            placeholder="Введите имя"
                                            v-model="modelProfile.name"
                                            @change="responseAction"
                                            :disabled="!editPermissions || taskPropCopy.status === 'completed' || taskPropCopy.status === 'check'"
                                            :required="taskPropCopy.type === 'interview'"
                                        />
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4">
                                        <b>Отчество</b>
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4 pl-1">
                                        <input
                                            class="response-info_data-field-input -name"
                                            :class="shownErrors.includes('patronymic') ? '-error_text' : ''"
                                            @focus="focusField('patronymic')"
                                            placeholder="Введите отчество"
                                            v-model="modelProfile.patronymic"
                                            :disabled="!editPermissions || taskPropCopy.status === 'completed' || taskPropCopy.status === 'check'"
                                            @change="responseAction"
                                        />
                                    </div>
                                    <template v-for="(phone, key) in modelProfile.additional_phones">
                                        <div class="response-info_data-row-title">
                                            <b>Дополнительный телефон</b>
                                        </div>
                                        <div class="response-info_data-row-field -additional_phone">
                                            <phone-number-input v-model="phone.value"
                                                                :error="shownErrors.includes(`additional_phone-${key}`)"
                                                                :disabled="!editPermissions || (taskPropCopy.status === 'archive') || (taskPropCopy.status === 'completed') || (taskPropCopy.status === 'check')"
                                                                :key="`task-phone-input-${key}-${modelProfile.id}`"
                                                                @input="changeAdditionalPhone(key)"
                                                                @change="editAdditionalPhone(key, $event)"
                                            />
                                            <div v-if="editPermissions && (taskPropCopy.status !== 'archive') && (taskPropCopy.status !== 'completed') && (taskPropCopy.status !== 'check') && ((modelProfile.additional_phones.length - 1) !== key)" class="response-info_data-row-field-delete">
                                                <div class="btn-remove" @click="removeAdditionalPhone(key)"></div>
                                            </div>
                                        </div>
                                    </template>
                                </template>
                                <template v-if="taskPropCopy.type === 'interview'">
                                    <div class="col-sm-6 col-xs-12 mb-4">
                                        <b>Номер документа</b>
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4 pl-1">
                                        <input
                                            class="response-info_data-field-input"
                                            type="tel"
                                            placeholder="Введите номер"
                                            v-model="modelProfile.docs && modelProfile.docs[0] && modelProfile.docs[0].number"
                                            @change="responseAction"
                                            :disabled="!editPermissions || taskPropCopy.status === 'completed' || taskPropCopy.status === 'check'"
                                            :required="taskPropCopy.type === 'interview'"
                                        />
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4">
                                        <b>Дата выдачи</b>
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4 pl-1">
                                        <date-picker v-model="modelProfile.docs && modelProfile.docs[0] && modelProfile.docs[0].date_of_issue"
                                                     class="datepicker-plain response-info_data-field-date response-info_data-field-input"
                                                     lang="ru"
                                                     :input-class="'input-plain' + (shownErrors.includes('date_of_issue') ? '-error' : '')"
                                                     :clearable="false"
                                                     format="DD.MM.YYYY"
                                                     value-type="YYYY-MM-DD"
                                                     :disabled="!editPermissions || (taskTypesComplete && taskTypesComplete.includes('dossier')) || (taskPropCopy.status === 'completed') || (taskPropCopy.status === 'check')"
                                                     :input-attr="{ required: true }"
                                                     :required="taskPropCopy.type === 'interview'"
                                                     placeholder="Выберите дату"
                                                     @change="responseAction"
                                        >
                                            <i style="display: none;" slot="calendar-icon" />
                                        </date-picker>
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4">
                                        <b>Срок действия</b>
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4 pl-1">
                                        <date-picker v-model="modelProfile.docs && modelProfile.docs[0] && modelProfile.docs[0].validity"
                                                     class="datepicker-plain response-info_data-field-date response-info_data-field-input"
                                                     lang="ru"
                                                     :input-class="'input-plain' + (shownErrors.includes('validity') ? '-error' : '')"
                                                     :clearable="false"
                                                     format="DD.MM.YYYY"
                                                     value-type="YYYY-MM-DD"
                                                     placeholder="Выберите дату"
                                                     :disabled="!editPermissions || (taskTypesComplete && taskTypesComplete.includes('dossier')) || (taskPropCopy.status === 'completed') || (taskPropCopy.status === 'check')"
                                                     @change="responseAction"
                                        >
                                            <i style="display: none;" slot="calendar-icon" />
                                        </date-picker>
                                    </div>
                                </template>
                                <template>
                                    <div class="col-sm-6 col-xs-12 mb-4">
                                        <b>Дата рождения</b>
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4 pl-1">
                                        <date-picker v-model="modelProfile.birthday"
                                                     class="datepicker-plain response-info_data-field-date response-info_data-field-input"
                                                     lang="ru"
                                                     :input-class="'input-plain' + (shownErrors.includes('birthday') ? '-error' : '')"
                                                     :clearable="false"
                                                     format="DD.MM.YYYY"
                                                     value-type="YYYY-MM-DD"
                                                     placeholder="Выберите дату"
                                                     :disabled="!editPermissions || (taskTypesComplete && taskTypesComplete.includes('dossier')) || (taskPropCopy.status === 'completed') || (taskPropCopy.type === 'restore_password') || (taskPropCopy.status === 'check')"
                                                     @change="dateChange"
                                        >
                                            <i style="display: none;" slot="calendar-icon" />
                                        </date-picker>
                                    </div>
                                    <template v-if="taskPropCopy.type !== 'restore_password'">
                                        <div class="col-sm-6 col-xs-12 mb-4">
                                            <b>Национальность</b>
                                        </div>
                                        <div class="col-sm-6 col-xs-12 mb-4 pl-1">
                                            <custom-select class="response-info_data-field-submit response-info_data-field-input"
                                                           v-model="modelProfile.nationality"
                                                           :options="nationalities"
                                                           :error="shownErrors.includes('nationality')"
                                                           returnWholeObject
                                                           defaultText="Выберите национальность"
                                                           titleField="title"
                                                           valueField="id"
                                                           searchable
                                                           :disabled="!editPermissions || (taskTypesComplete && taskTypesComplete.includes('dossier')) || (taskPropCopy.status === 'completed') || (taskPropCopy.type === 'restore_password') || (taskPropCopy.status === 'check')"
                                                           @change="nationalityChange"
                                            />
                                        </div>
                                    </template>
                                    <div class="col-sm-6 col-xs-12 mb-4">
                                        <b>Пол</b>
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4 pl-1">
                                        <custom-select
                                            class="response-info_data-field-submit response-info_data-field-input"
                                            valueField="type"
                                            titleField="title"
                                            defaultText="Выберите пол"
                                            v-model="modelProfile.gender"
                                            @change="genderChange"
                                            :error="shownErrors.includes('gender')"
                                            :options="gender"
                                            :disabled="!editPermissions || (taskTypesComplete && taskTypesComplete.includes('dossier')) || (taskPropCopy.status === 'completed') || (taskPropCopy.type === 'restore_password') || (taskPropCopy.status === 'check')"
                                        />
                                    </div>
                                </template>
                            </div>
                        </b-collapse>
                    </div>
                    <div v-if="psychResult && (Object.keys(taskPropCopy).length && (taskPropCopy.type === 'video' || taskPropCopy.type === 'dossier'))" class="response-info_data">
                        <div class="response-info_data-title" @click="toggleAccordion('psychoFieldVisible', 0)">
                            <p class="response-info_data-title-text">Комментарий психолога</p>
                            <i :class="`fa fa-angle-down`"/>
                        </div>
                        <b-collapse :visible="psychoFieldVisible === 0">
                            <div class="response-psych_comment">
                                <div class="response-psych_comment-avatar glyphicon-executor" :style="(psychResult.author && psychResult.author.avatar) ? `background-image: url(${getSmallImage(psychResult.author.avatar)}); background-size: cover;` : ''"></div>
                                <div class="response-psych_comment-main">
                                    <div class="response-psych_comment-main-title">
                                        <p class="response-psych_comment-main-title-user">
                                            {{ (psychResult.author && psychResult.author.fullname) ? psychResult.author.fullname : '' }}
                                        </p>
                                        <p class ="response-psych_comment-main-title-time">
                                            {{ moment(psychResult.created_at).format('DD.MM.YYYY, HH:mm') }}
                                        </p>
                                    </div>
                                    <p class="response-psych_comment-main-description">
                                        {{ psychResult.text }}
                                    </p>
                                </div>
                            </div>
                        </b-collapse>
                    </div>
                    <div v-if="videoResult && (Object.keys(taskPropCopy).length && taskPropCopy.type === 'dossier')" class="response-info_data">
                        <div class="response-info_data-title" @click="toggleAccordion('videoResultsFieldVisible', 0)">
                            <p class="response-info_data-title-text">Результаты видео-тестирования</p>
                            <i :class="`fa fa-angle-down`"/>
                        </div>
                        <b-collapse :visible="videoResultsFieldVisible === 0">
                            <p class="response-action_form-subtitle-video">Ссылка на видео</p>
                            <b-input placeholder="Ссылка на видео" v-model="modelProfile.video_file" disabled/>
                            <template v-if="taskPropCopy.response.albums && taskPropCopy.response.albums.second_album && taskPropCopy.response.albums.second_album[0] && taskPropCopy.response.albums.second_album[0].attachments && taskPropCopy.response.albums.second_album[0].attachments.length">
                                <p class="response-action_form-subtitle">Фотографии</p>
                                <div class="response-action_form-files_field">
                                    <div class="response-action_form-files_field-file" v-for="(file, index) in taskPropCopy.response.albums.second_album[0].attachments" :key="index" :style="file.link ? `background-image: url(${file.preview_link}); background-size: cover;` : ''">
                                        <a :href="file.download_link" :download="file.filename" class="response-action_form-files_field-file-link glyphicon-link"></a>
                                    </div>
                                </div>
                            </template>
                            <p class="response-action_form-subtitle">Комментарий</p>
                            <b-textarea placeholder="Добавьте комментарий" v-model="videoResult.text" disabled/>
                        </b-collapse>
                    </div>
                    <div v-if="taskPropCopy.type === 'dossier' && taskPropCopy.model && taskPropCopy.model.dossier" class="response-info_data">
                        <div class="response-info_data-title" @click="toggleAccordion('dossierFieldVisible', 0)">
                            <p class="response-info_data-title-text">Досье</p>
                            <i :class="`fa fa-angle-down`"/>
                        </div>
                        <b-collapse :visible="dossierFieldVisible === 0">
                            <div class="response-info_data-dossier" v-for="(parameter, index) in dossierTemplate" :key="index">
                                <div class="response-info_data-dossier-title" @click="toggleDossier(parameter.visible, 0, index)">
                                    <p class="response-info_data-dossier-title-text">{{parameter.title}}</p>
                                    <i :class="`fa fa-angle-down`"/>
                                </div>
                                <b-collapse class="response-info_data-dossier-field" :visible="parameter.visible === 0">
                                    <tiny-mce plugins="image" v-model="parameter.value" :init="tinymceInit" :disabled="!editPermissions || taskPropCopy.status === 'completed'" />
                                    <b-button v-if="editPermissions && (taskPropCopy.status !== 'completed') && (taskPropCopy.status !== 'archive')" size="sm" variant="outline-primary" class="response-title-submit-dossier_save" @click="saveDossier">
                                        Сохранить
                                    </b-button>
                                </b-collapse>
                            </div>
                        </b-collapse>
                    </div>
                    <div v-if="(taskPropCopy.type === 'registration') || (taskPropCopy.type === 'dossier')" class="response-info_data">
                        <div class="response-info_data-title" @click="toggleAccordion('registrationFieldVisible', 0)">
                            <p class="response-info_data-title-text">Аккаунты на ресурсах</p>
                            <div class="d-flex align-items-center">
                              <button-throbber v-if="(taskPropCopy.status !== 'completed') && editPermissions"
                                               class="mr-2"
                                               variant="outline-primary"
                                               size="sm"
                                               color-throbber="primary"
                                               :loading="registerTaskCredentialsLoading"
                                               @click.stop="saveRegisterTaskCredentials"
                              >Сохранить</button-throbber>
                              <i class="fa fa-angle-down"/>
                            </div>
                        </div>
                        <b-collapse :visible="registrationFieldVisible === 0">
                            <div class="response-info_data-table_registartion">
                                <div v-for="(resource, index) in webcamResourcesCopy" class="response-info_data-accounts-account">
                                    <div class="response-info_data-accounts-account-block -resource -lg">
                                        <b>{{ resource.title }}</b>
                                    </div>
                                    <div class="response-info_data-accounts-account-block -login -lg">
                                      <input v-model="resource.login"
                                             class="input-plain"
                                             placeholder="Логин*"
                                             :class="{'-error': webcamResourcesErrors[index] && webcamResourcesErrors[index].login}"
                                             :disabled="(taskPropCopy.type === 'dossier') || (taskPropCopy.status === 'completed') || !editPermissions || preventEdit || registerTaskCredentialsLoading"
                                             autocomplete="new-password"
                                             @change="editCredentialField(resource, index, 'login')"
                                      />
                                    </div>
                                    <div class="response-info_data-accounts-account-block -screenname -lg">
                                        <input v-model="resource.model_screen_name"
                                               class="input-plain"
                                               placeholder="Скриннейм"
                                               :class="{'-error': webcamResourcesErrors[index] && webcamResourcesErrors[index].model_screen_name}"
                                               :disabled="(taskPropCopy.type === 'dossier') || (taskPropCopy.status === 'completed') || !editPermissions || preventEdit || registerTaskCredentialsLoading"
                                               autocomplete="new-password"
                                               @change="editCredentialField(resource, index, 'model_screen_name')"
                                        />
                                    </div>
                                    <div class="response-info_data-accounts-account-block -password -lg">
                                        <password-field v-model="resource.password"
                                                        autocomplete="new-password"
                                                        placeholder="Пароль*"
                                                        :class="{'-error': webcamResourcesErrors[index] && webcamResourcesErrors[index].password}"
                                                        :disabled="(taskPropCopy.type === 'dossier') || (taskPropCopy.status === 'completed') || !editPermissions || preventEdit || registerTaskCredentialsLoading"
                                                        @change="editCredentialField(resource, index, 'password')"
                                        />
                                    </div>
                                </div>
                            </div>
                        </b-collapse>
                    </div>
                    <div v-if="(taskPropCopy.type === 'registration') || (taskPropCopy.type === 'psych') || (taskPropCopy.type === 'reregistration') || (taskPropCopy.type === 'revision_new')" class="response-info_data">
                        <div class="response-info_data-title" @click="toggleAccordion('filesFieldVisible', 0)">
                            <p class="response-info_data-title-text">Файлы</p>
                            <i :class="`fa fa-angle-down`"/>
                        </div>
                        <b-collapse :visible="filesFieldVisible === 0">
                            <div v-if="uploadedAlbumsLengths && uploadedAlbumsLengths.length" class="response-action_form-files">
                                <div v-for="(album, key) in taskPropCopy[taskPropCopy.type === 'psych' ? 'response' : 'model'].albums.first_album" v-if="uploadedAlbumsLengths[key]" class="response-action_form-files-album" :class="{'-small': (uploadedAlbumsLengths[key] < 3) && (key !== uploadedAlbumsLengths.length - 1) && (key !== uploadedAlbumsLengths.length - 2)}">
                                    <div class="response-action_form-files-album-container">
                                        <p class="response-action_form-files-album-container-title"><b>{{ album.title }}</b></p>
                                        <div class="response-action_form-files-album-container-files">
                                            <div v-for="(file, index) in album.attachments" v-if="file.id" class="response-action_form-files-album-container-files-file">
                                                <div class="tasks_files-main-album-files-file-image">
                                                    <div class="materials-files-field-file-image"
                                                         :style="file.type.includes('image') && file.link ? `background-image: url(${file.preview_link || file.link}); background-size: cover;` : ''"
                                                         :class="getClassFromApplicationType(file.type)"
                                                         @click="openGallery(index, album.attachments)"
                                                    >
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </b-collapse>
                    </div>
                    <div v-if="prevResponses" class="response-info_data">
                        <div class="response-info_data-title" @click="toggleAccordion('prevResponsesFieldVisible', 0)">
                            <div class="d-flex align-items-center">
                                <p class="response-info_data-title-text">Предыдущие заявки</p>
                            </div>
                            <i :class="`fa fa-angle-down`"/>
                        </div>
                        <b-collapse :visible="prevResponsesFieldVisible === 0">
                            <div class="row align-items-center pt-4">
                                <div v-for="response in prevResponses" class="response-info_data-other_responses">
                                    <div class="response-info_data-other_responses-date text-gray">
                                        {{formattedDateWithoutTime(response.created_at)}}
                                    </div>
                                    <div class="response-info_data-other_responses-title cursor-pointer" @click="openPrevResponse(response)">
                                        {{response.title}}
                                    </div>
                                    <div class="response-info_data-other_responses-status">
                                        <span class="vacancy_creation-responses-responses_list-item-status-item response-full_name-status" :class="`-${getStatusResponse(response)}`">{{ responseTypes[getStatusResponse(response)] }}</span>
                                    </div>
                                </div>
                            </div>
                        </b-collapse>
                    </div>
                    <div v-if="taskPropCopy && taskPropCopy.response && taskPropCopy.response.worksheet" class="response-info_data">
                        <div class="response-info_data-title" @click="toggleAccordion('profileFieldVisible', 0)">
                            <div class="d-flex align-items-center">
                                <p class="response-info_data-title-text">Анкета</p>
                                <template v-if="(taskPropCopy.type === 'interview') && ((taskPropCopy.status === 'active') || (taskPropCopy.status === 'postponed'))">
                                    <b-button @click="openDossier" class="response-title-submit-button ml-3" size="sm" variant="outline-primary" type="button">Открыть</b-button>
                                    <p @click="downloadLink" class="response-info_data-title-link-button">{{showLink ? 'Обновить ссылку' : 'Поделиться ссылкой'}}</p>
                                </template>
                            </div>
                            <i :class="`fa fa-angle-down`"/>
                        </div>
                        <b-input-group v-if="showLink" class="response-info_data-title-link-text">
                            <b-input-group-text slot="append">
                                <copy v-if="dossierLink" class="cursor-pointer" @click="copyLink"/>
                                <throbber v-else class="throbber -button-larger"/>
                            </b-input-group-text>
                            <b-form-input v-model="dossierLink" type="text" placeholder="Загрузка..." disabled></b-form-input>
                        </b-input-group>
                        <b-collapse :visible="profileFieldVisible === 0">
                            <div class="row align-items-center pt-4">
                                <template v-for="parameter in parameters">
                                    <div class="col-sm-6 col-xs-12 mb-4">
                                        <b>{{ parameter.label }}</b>
                                    </div>
                                    <div class="col-sm-6 col-xs-12 mb-4 pl-1">
                                        <input
                                            v-if="parameter.type === 'text'"
                                            class="response-info_data-field-input"
                                            placeholder="Введите значение"
                                            v-model="parameter.value"
                                            @change="editParameter(parameter)"
                                            :disabled="(taskPropCopy.status === 'completed') || (taskPropCopy.status === 'check') || (taskPropCopy.type !== 'interview') || !editPermissions"
                                            :required="taskPropCopy.type === 'interview'"
                                        />
                                        <date-picker
                                            v-else-if="parameter.type === 'date'"
                                            v-model="parameter.value"
                                            class="datepicker-plain response-info_data-field-input"
                                            lang="ru"
                                            input-class="input-plain"
                                            placeholder="Выберите дату"
                                            :clearable="false"
                                            format="DD.MM.YYYY"
                                            value-type="YYYY-MM-DD"
                                            :disabled="(taskPropCopy.status === 'completed') || (taskPropCopy.status === 'check') || (taskPropCopy.type !== 'interview') || !editPermissions"
                                            :input-attr="{ required: true }"
                                            :required="taskPropCopy.type === 'interview'"
                                            @change="editParameter(parameter)"
                                        >
                                            <i style="display: none;" slot="calendar-icon" />
                                        </date-picker>
                                        <custom-select
                                            v-else-if="parameter.type === 'choice'"
                                            class="response-info_data-field-submit response-info_data-field-input"
                                            :class="taskPropCopy.type === 'interview' ? '-editable_fields' : ''"
                                            valueField="value"
                                            titleField="value"
                                            defaultText="Выберите вариант"
                                            :options="parameter.answersList"
                                            v-model="parameter.value"
                                            @change="editParameter(parameter)"
                                            :disabled="(taskPropCopy.status === 'completed') || (taskPropCopy.status === 'check') || (taskPropCopy.type !== 'interview') || !editPermissions"
                                            :required="taskPropCopy.type === 'interview'"
                                        />
                                        <div v-else-if="parameter.type === 'range'" class="response-info_data-field-range">
                                            <div class="response-info_data-field-range-input">
                                                <input v-model="parameter.value"
                                                       class="form-control"
                                                       :required="taskPropCopy.type === 'interview'"
                                                       :disabled="(taskPropCopy.status === 'completed') || (taskPropCopy.status === 'check') || (taskPropCopy.type !== 'interview') || !editPermissions"
                                                       @change="editParameter(parameter)"
                                               />
                                            </div>
                                                <div class="response-info_data-field-range-slider">
                                                    <input v-model="parameter.value"
                                                           type="range"
                                                           class="input-range"
                                                           :max="parameter.answers.maxValue"
                                                           :min="parameter.answers.minValue"
                                                           :disabled="(taskPropCopy.status === 'completed') || (taskPropCopy.status === 'check') || (taskPropCopy.type !== 'interview') || !editPermissions"
                                                           @change="editParameter(parameter)"
                                                    />
                                                    <span class="response-info_data-field-range-slider-min">{{ parameter.answers.minValue }}</span>
                                                    <span class="response-info_data-field-range-slider-max">{{ parameter.answers.maxValue }}</span>
                                              </div>
                                          </div>
                                    </div>
                                </template>
                            </div>
                        </b-collapse>
                    </div>
                </div>
                <div v-if="taskPropCopy.status !== 'new' && taskPropCopy.type !== 'support'" class="response-comments" ref="commentsBlock">
                    <div class="response-comments-info" :class="userPermissions.comment.create || editPermissions ? '-with_input' : ''">
                        <div v-if="responseComments && responseComments.length" class="response-comments-history">
                            <p v-b-toggle.history-collapse class="response-comments-history-button">{{collapseResponseComments ? 'Свернуть' : 'История обработки заявки'}}</p>
                            <b-collapse v-model="collapseResponseComments" id="history-collapse">
                                <div class="response-comments-history-info">
                                    <div v-for="(commentsInfo, index) in responseComments" :key="index" class="response-comments-info-comment">
                                        <b class="cursor-pointer" @click="openMiniProfile(commentsInfo.user)">{{commentsInfo.user.fullname}}</b>
                                        <div v-if="commentsInfo.comments" v-for="comment in commentsInfo.comments">
                                            <div class="response-comments-info-comment-message-system">
                                                <span v-if="comment.type === 'system'">{{comment.system_message.message}} </span>
                                                <span v-if="comment.message"><br v-if="comment.type === 'system'"/>{{ comment.message }} </span>
                                                <span class="text-gray">{{moment(comment.created_at).format('DD.MM.YYYY HH:mm')}}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </b-collapse>
                        </div>
                        <div v-if="taskComments && taskComments.length">
                            <div v-if="(index === 0) || (index === taskComments.length - 1 && taskComments.length !== 1) || showAllComments" v-for="(commentsInfo, index) in taskComments" :key="index" class="response-comments-info-comment">
                                <b class="cursor-pointer" @click="openMiniProfile(commentsInfo.user)">{{commentsInfo.user.fullname}}</b>
                                <div v-if="commentsInfo.comments" v-for="(comment, indexComment) in commentsInfo.comments">
                                    <div v-if="(index === 0 && indexComment === 0) ||
                                     (index === taskComments.length - 1 && indexComment === commentsInfo.comments.length - 1) ||
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
          </div>
          <div
            v-if="(userPermissions.comment.create || editPermissions) && taskPropCopy.type !== 'support'"
            class="response-comments-button"
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
      <album-gallery :albumData="albumData"
                     :index="albumIndex"
                     without-remove
                     @closeGallery="closeGallery"/>
      <b-modal id="create_new_profile"
               centered
               title="Создать еще один профиль для модели?"
               body-bg-variant="white"
               ok-title="Создать профиль"
               ok-variant="primary"
               cancel-title="Отменить"
               cancel-variant="outline-primary"
               @ok="createNewProfile">
        Будет создан новый профиль с данными, заполненными на собеседовании
      </b-modal>
          <b-modal id="support_close"
               centered
               title="Вы уверены, что хотите закрыть Обращение?"
               body-bg-variant="white"
               ok-title="Закрыть обращение"
               ok-variant="primary"
               cancel-title="Отменить"
               cancel-variant="outline-primary"
               @ok="supportComplete">
            {{ taskPropCopy.title }} будет закрыто и задача перейдет в статус “Выполнена”.
          </b-modal>
      <b-modal id="join_profiles"
               centered
               title="Объединить профили?"
               body-bg-variant="white"
               ok-title="Объединить"
               ok-variant="primary"
               cancel-title="Отменить"
               cancel-variant="outline-primary"
               @ok="joinProfiles">
        Будьте внимательны, профили модели объединяться в один. Это действие нельзя отменить.
      </b-modal>
    </b-form>
    <groups-list v-else-if="droverType === 'office-list'"
                 :task="taskPropCopy"
                 :previousGroup="chosenGroup"
                 @open-task="setDroverType('task')"
                 @return-task-complete="returnTaskComplete"
    />
    <files-upload v-else-if="droverType === 'files-upload'"
                  v-model="resultFiles"
                  :albums="taskPropCopy.response && taskPropCopy.response.albums && taskPropCopy.response.albums.first_album"
                  :taskTitle="taskPropCopy.title"
                  @save-avatar="saveAvatar"
                  @close="setDroverType('task')"
    />
    <response-creation v-else-if="droverType === 'response-opened'"
                       :response-prop="chosenPrevResponse"
                       :breadcrumbs-title="breadcrumbsTask.title"
                       showDuplicateResponse
                       @close="returnCurrentTask"
                       @open-mini-profile="openMiniProfile"
    />
    <task-control v-else-if="droverType === 'task-opened'"
                  :task-prop="chosenPrevResponse.task"
                  :breadcrumbs-title="breadcrumbsTask.title"
                  @open-mini-profile="openMiniProfile"
                  @close="returnCurrentTask"
    />
    <user-details v-else-if="droverType === 'user-details'"
                  :user-id="activeUserId"
                  breadcrumbs-title="Назад"
                  @close="setDroverType('task')"
    />
  </div>
</template>

<script>
    import Select from "@/components/Common/Select/Select";
    import moment from 'moment';
    import DatePicker from '@/components/Common/Datepicker/index';
    import EmailField from "@/components/Common/EmailField";
    import vueDropzone from 'vue2-dropzone';
    import config from '../../../config';
    import Vue from 'vue';
    import { mapState, mapActions, mapGetters } from 'vuex';
    import {getSmallImage, pluralize, clipboard, emailDomain, showToast} from "@/tools/tools";
    import PasswordField from "@/components/Common/PasswordField/PasswordField";
    import AlbumGallery from "@/components/Common/AlbumGallery/AlbumGallery";
    import GroupsList from "@/pages/Tasks/components/GroupsList/GroupsList";
    import FilesUpload from "@/pages/Tasks/components/FilesUpload";
    import UserResignIcon from "@/components/Common/UserResignIcon";
    import PhoneNumberInput from "@/components/Common/PhoneNumberInput";
    import AvatarUpload from "@/components/Common/AvatarUpload/AvatarUpload";
    import Avatar from "@/components/Common/Avatar/Avatar";
    import ButtonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber";
    import absence from "@/assets/vue-svg/absence.svg";
    import copy from "@/assets/vue-svg/copy.svg";
    import throbber from "@/assets/vue-svg/throbber.svg";
    import warning from "@/assets/vue-svg/warning.svg";
    import at from "@/assets/vue-svg/at.svg";
    import HeaderButtonsTask from "@/components/Task/common/HeaderButtonsTask.vue";
    import {
      cancellableTypesTask,
      credentialStatusesCheckingTask,
      genderTask,
      makeIsEditTaskPermissions,
      makeSupportMessage,
      makeTaskButtonName,
      responseTypesTask,
      timePickerOptionsTask
    } from "@/components/Task/utils/CommonTaskUtils";
    import TaskLoader from "@/components/Task/common/TaskLoader.vue";
    import TopHeadTaskControl from "@/components/Task/common/TopHeadTaskControl.vue";
    import TaskExecutor from "@/components/Task/common/TaskExecutor.vue";
    import RegistrationOffices from "@/components/Task/TaskBody/RegistrationOffices.vue";
    import CallCenterForm from "@/components/Task/TaskBody/CallCenterForm.vue";
    import InterviewForm from "@/components/Task/TaskBody/InterviewForm.vue";
    import ModelProfile from "@/components/Task/TaskBody/ModelProfile.vue";
    import PsychoTestForm from "@/components/Task/TaskBody/PsychoTestForm.vue";
    import InterviewTaskForm from "@/components/Task/TaskBody/InterviewTaskForm.vue";
    import SupportChat from "@/pages/Profile/components/Support/SupportChat.vue";

    export default {
        name: 'task-control',
        components: {
          SupportChat,
            //fix for circular import error
            ResponseCreation: () => import("@/pages/HR/ResponseCreation/ResponseCreation"),
            'user-details': () => import("@/pages/Organization/Groups/components/UserDetails/UserDetails"),
            FilesUpload,
            GroupsList,
            AlbumGallery,
            'header-buttons-task': HeaderButtonsTask,
            PasswordField,
            EmailField,
            UserResignIcon,
            PhoneNumberInput,
            'date-picker': DatePicker,
            'custom-select': Select,
            'registration-offices': RegistrationOffices,
            'callCenter-form': CallCenterForm,
            'interview-form': InterviewForm,
            'drop-zone': vueDropzone,
            AvatarUpload,
            'avatar': Avatar,
            ButtonThrobber,
            'absence': absence,
            'copy': copy,
            'throbber': throbber,
            'warning': warning,
            'at': at,
            'task-loader': TaskLoader,
            'top-head-task-control': TopHeadTaskControl,
            'task-executor': TaskExecutor,
            ModelProfile,
            PsychoTestForm,
            InterviewTaskForm
        },
        props: {
            taskProp: Object,
            vacancyTitle: {
                type: String,
                default: null
            },
            taskOpened: {
                type: Boolean,
                default: false
            },
            openBlock: {
                type: Boolean,
                default: false
            },
            breadcrumbsTitle: String
        },
        data() {
            return {
                droverType: 'task',
                chosenGroup: null,
                resultFiles: {
                    additional: []
                },
                taskPropCopy: {status: ''},
                taskTypesComplete: [],
                action: '',
                activeTask: '',
                executor: null,
                communication: null,
                communicationStatus: true,
                currentExecutor: null,
                datetime: null,
                moment: moment,
                shownErrors: [],
                errorMessages: [],
                errorSendInterview: false,
                modelProfile: {},
                modelFieldVisible: 0,
                psychoFieldVisible: -1,
                videoResultsFieldVisible: -1,
                dossierFieldVisible: -1,
                registrationFieldVisible: 0,
                filesFieldVisible: -1,
                profileFieldVisible: 0,
                prevResponsesFieldVisible: 0,
                hisotryFieldVisible: -1,
                uploadFieldVisible: 0,
                modelItems: [{additional_phones: '', birthday: '', gender: ''}],
                psychResult: null,
                videoResult: null,
                videoFiles: null,
                registrationFiles: null,
                interviewFiles: null,
                dossierTemplate: null,
                dossiersId: null,
                webcamResourcesCopy: [],
                webcamResourcesErrors: [],
                parameters: [],
                interviewTemplate: [],
                commentsCopy: {},
                commentText: '',
                taskComment: '',
                videoComment: '',
                cancellationReason: null,
                rejected: false,
                laterStatus: false,
                config: config,
                filesIdName: [],
                videoLink: '',
                gender: genderTask,
                currentUsersUpdated: [],
                nextCurrentUsersUpdated: [],
                tinymceInit: {
                    selector: 'textarea',  // change this value according to your HTML
                    language: 'ru',
                    toolbar: 'undo redo | fontsizeselect | bold italic underline | link image',
                    plugins: 'link image',
                    fontsize_formats: '11px 12px 14px 16px 18px 24px 36px 48px',
                    images_upload_handler: async (blobInfo, success, failure) => {
                        try {
                            await this.$store.dispatch('files/createFile', {file: blobInfo.blob()});
                            success(this.uploadedFile.download_link);
                        } catch (e) {
                            failure('Ошибка');
                        }
                    }
                },
                cancellableTypes: cancellableTypesTask,
                flag: false,
                executorAvatar: '',
                showOfficeError: false,
                showResourceCredentialPassword: false,
                showReregistrationPassword: false,
                credentialStatusesChecking: credentialStatusesCheckingTask,
                credentialStatus: null,
                credentialComment: '',
                reregisterLogin: '',
                reregisterPassword: '',
                credentials: [],
                listOnly: true,
                chosenResourcesForAdding: [],
                isWaitingForResponseId: false,
                preventEdit: true,
                albumIndex: null,
                albumData: [],
                parametersDuplicate: [],
                showAllComments: false,
                showLink: false,
                commentsBlockHeight: null,
                collapseResponseComments: false,
                chosenPostponemenetReason: {},
                chosenPrevResponse: {},
                breadcrumbsTask: {},
                responseTypes: responseTypesTask,
                activeUserId: null,
                avatarId: null,
                registerTaskCredentialsLoading: false,
            }
        },
        computed: {
          commentStatus() {
            return this.$store.state.comments.commentStatus;
          },
          timePickerOptionsTask() {
            return timePickerOptionsTask
          },
          ...mapState('responses', ['fieldsErrors']),
          ...mapState('auth', ['userPermissions']),
          ...mapState('directory', ['hrResources', 'webcamResources', 'credential', 'resources']),
          ...mapState('comments', ['comments']),
          ...mapState('tasks', ['taskStatus', 'task', 'currentTask']),
          ...mapGetters('hr', ['getCityById']),
          accessToken() {
            return this.$store.state.auth.accessToken;
          },
          messagesSupport() {
            return  makeSupportMessage(this.taskPropCopy.comments, this.taskPropCopy.id);
          },
          isShowApplicationData() {
            const excludedTypes = [
              'psych',
              'video',
              'registration',
              'dossier',
              'checking',
              'custom',
              'support',
              'password_change'
            ];
            
            return (
              this.taskPropCopy &&
              !excludedTypes.includes(this.taskPropCopy.type)
            );
          },
            userFieldsErrors() {
                return this.$store.state.users.fieldsErrors
            },
            taskFieldsErrors() {
                return this.$store.state.tasks.fieldsErrors
            },
            taskStatusCurrentTasks() {
                return this.$store.state.tasks.taskStatusCurrentTasks
            },
            taskParameters() {
                let task = {
                    next: {planned_start_at: this.taskPropCopy.next_planned_start_at},
                    user: this.executor,
                    response: this.taskProp.response.id,
                    title: this.taskProp.user.fullname
                }
                if (!this.taskPropCopy.next_planned_start_at) delete task.next
                if (!this.executor) delete task.user
                if (this.communication) task.communication_id = this.communication;
                return task
            },
            archiveTitleStatus() {
                return 'Получен отказ';
                if (this.taskPropCopy.is_reject || (this.taskPropCopy.type === 'interview')) return 'Получен отказ';
                else if (this.taskPropCopy.status === 'archive' && this.modelProfile.status !== 'reject') return 'Заявка заархивирована';
                else return 'Переместить в архив';
            },
            userStatus() {
                return this.$store.state.users.status
            },
            communications() {
            if (!Array.isArray(this.$store.state.dictionaries.communications)) return Object.values(this.$store.state.dictionaries.communications)
                return this.$store.state.dictionaries.communications;
            },
            absenceTypes() {
                return this.$store.state.dictionaries.absenceTypes;
            },
            nationalities() {
              return this.$store.state.dictionaries.nationalities;
            },
            isTaskCancellable() {
                return this.cancellableTypes.includes(this.taskPropCopy.type);
            },
            link() {
                return this.$store.state.dossier.link
            },
            dossierLink() {
                return this.$store.state.dossier.dossierLink
            },
            privateLink() {
                return this.$store.state.dossier.privateLink
            },
            dossier() {
                return this.$store.state.dossier.dossier
            },
            editPermissions() {
                return makeIsEditTaskPermissions(this.$store, this.taskPropCopy)
            },
            editPlannedAtPermissions() {
                return this.userPermissions.task.planned_at_task
            },
   
            uploadedAlbumsLengths() {
                if (!(this.taskPropCopy && this.taskPropCopy[this.taskPropCopy.type === 'psych' ? 'response' : 'model']?.albums?.first_album)) return [];
                return this.taskPropCopy[this.taskPropCopy.type === 'psych' ? 'response' : 'model']?.albums.first_album?.map(album => album.attachments && Object.values(album.attachments).filter(file => file.id).length || 0) || [];
            },
            requiredAttachmentsForInterviewTasks() {
              return this.$store.state.tasks.requiredAttachmentsForInterviewTasks;
            },
            attachments() {
                return this.$store.state.dictionaries.attachments;
            },
            credentialStatuses() {
                let data = this.$store.state.dictionaries.credentialStatuses;
                return data ? {new: 'На проверке', ...data} : {};
            },
            credentialStatusesRevisionNew() {
                return this.$store.state.dictionaries.credentialStatusesRevisionNew;
            },
            profileCredentialStatuses() {
                return this.$store.state.dictionaries.profileCredentialStatuses;
            },
            responseStatus() {
                return this.$store.state.responses.responseStatus;
            },
            formattedResultDate() {
                if (!this.taskPropCopy.result_date) return '';
                return moment.parseZone(this.taskPropCopy.result_date).format('DD.MM.YYYY, HH.mm');
            },
            busyDates() {
                return this.$store.state.tasks.busyDates;
            },
            allCredentialStatuses() {
                return this.$store.state.dictionaries.allCredentialStatuses;
            },
            userPermissions() {
                return this.$store.state.auth.userPermissions;
            },
            optionsCurrentUsersUpdated() {
              if (!this.currentUsersUpdated.length) return []
              return this.currentUsersUpdated.map(user => {
                if (!user.id || !user.absences) return user
                user.checkedAbsences = this.isDayAbsence(moment(this.taskPropCopy.planned_start_at).format('YYYY-MM-DD'), user.absences)
                user.disabled = !!user.checkedAbsences
                return user
              })
            },
         
            isSuperAdmin() {
              return this.$store.state.auth.user.role?.code === 'ROLE_SUPERADMIN'
            },
            countRestComments() {
                let countAllComments = this.taskComments.reduce((count, taskCommentsInfo) => { return count + Number(taskCommentsInfo.comments.length) }, 0);
                return countAllComments > 2 ? `${pluralize(countAllComments - 2, ['событие', 'события', 'событий'])}` : null;
            },
            usersWithAccessCustomTasks() {
                return this.$store.state.users.usersList;
            },
            taskComments() {
                return this.currentTask?.comments || [];
            },
            responseComments() {
                return (this.currentTask.type === 'call_center' || this.currentTask.type === 'interview') ? this.currentTask.response_comments : null;
            },
            optionsPostponementReasons() {
                return [...this.$store.state.dictionaries.postponementReasons, {title: 'Другое', id: 'other'}];
            },
            prevResponses() {
                if (this.taskPropCopy.other_responses && this.taskPropCopy.other_responses.length) {
                    return this.taskPropCopy.other_responses.map(response => {
                        return {
                            ...response,
                            status: this.getStatusResponse(response)
                        }
                    })
                }
                return null
            },
            filesForAvatar() {
              return this.taskPropCopy?.model?.albums?.first_album?.flatMap((album, key) => {
                let result = [];
                switch (key) {
                  case 0:
                  case 1:
                    return;
                  case 2:
                    for (let imageType in album.attachments) {
                      result.push(album.attachments[imageType]);
                    }
                    break;
                  case 3:
                    result = album.attachments;
                }
                return result?.map(image => image?.link);
              }).filter(image => !!image) || [];
            },
        },
        watch: {
            taskProp: function (newProp, prevProp) {
                if (newProp.id !== prevProp.id) {
                    this.fetchCurrentTask(newProp.id);
                    this.updateTask(this.taskProp, true);
                }
                this.updateWebcamResources(newProp)
            },
            modelProfile: function (newModelProfile) {
                let psychResults = null,
                    videoResults = null,
                    taskType = []
                if (newModelProfile.task_list) newModelProfile.task_list?.map(function (task) {
                    taskType.push(task.type)
                    if (task.type === 'psych' && task.status === 'completed') psychResults = {
                        type: task.type,
                        text: task.result,
                        author: task.user,
                        created_at: task.created_at
                    }
                    if (task.type === 'video' && task.status === 'completed') videoResults = {
                        type: task.type,
                        text: task.result,
                        author: task.user,
                        created_at: task.created_at
                    }
                    return task
                })
                this.psychResult = psychResults
                this.videoResult = videoResults
                this.taskTypesComplete = taskType
            },
            taskPropCopy: function (newTask, previousTask) {
                if (newTask.type === 'call_center') this.$store.dispatch('dictionaries/fetchCommunications');
                if (previousTask.status && (newTask.status !== previousTask.status)) this.$emit('update-tasks');
                this.updateTaskCopy(newTask);
            },
            fieldsErrors: function (newErrors) {
                if (newErrors) {
                    this.shownErrors = newErrors.map(error => error.propertyPath)
                    this.errorMessages = newErrors.map(error => error.message)
                }
            },
            errorMessages: function () {
                this.showUserEditErrorMessage()
            },
            userFieldsErrors: function (newErrors) {
                if (newErrors) this.shownErrors = newErrors.map(error => error.propertyPath)
            },
            taskFieldsErrors: function (newErrors) {
                if (newErrors) {
                    this.shownErrors = newErrors.map(error => error.propertyPath)
                    this.errorMessages = newErrors.map(error => error.message)
                }
            },
            comments: function (newComments) {
                if (this.taskPropCopy && this.taskPropCopy.id) this.fetchCurrentTask(this.taskPropCopy.id)
                this.commentsCopy = JSON.parse(JSON.stringify(newComments))
            },
            taskStatus: function (newStatus, prevStatus) {
                if (newStatus === 'task-later') this.laterStatus = true;
                else if (newStatus === 'deleted') this.close();
                if ((prevStatus === 'editing')) this.registerTaskCredentialsLoading = false;
                if (newStatus === 'request-list') this.close();
            },
            currentTask: function (newTask) {
                this.preventEdit = false;
                if (newTask) this.updateTask(newTask)
                this.updateTaskCopy(this.taskPropCopy);
                this.updateWebcamResources(newTask);
            },
            currentVacancy: function (newVacancy) {
                this.currentCity = (this.currentVacancy && this.currentVacancy.group && this.currentVacancy.group.id) ? this.getCityById(this.currentVacancy.group.id) : this.currentCity
            },
            privateLink: function (newLink) {
                if (this.flag) {
                    window.open(newLink, '_blank');
                }
            },
            usersWithAccessCustomTasks(newList) {
                this.currentUsersUpdated = [...newList]
            },
           taskComments() {
                this.setHeightComments();
           },
           collapseResponseComments() {
                setTimeout(() => {this.setHeightComments()}, 300)
           },
        },
        created() {
            if (this.taskProp.id) {
                this.fetchCurrentTask(this.taskProp.id);
            }
            if (this.taskProp) this.updateTask(this.taskProp);
            this.listOnly = true;
            this.updateTaskCopy(this.taskProp);
            if (this.taskProp.response && this.taskProp.response.worksheet) this.fillTemplateParameters(this.taskProp.response.worksheet);
            this.$store.dispatch('dictionaries/fetchAbsenceTypes');
            this.$store.dispatch('dictionaries/getNationalities');
            if (this.taskProp.type === 'custom') this.$store.dispatch('users/fetchUsers', {'access.permissions.code[]': 'task.custom.edit', is_active: true});
            this.$store.dispatch('dictionaries/fetchPostponementReasons');
            this.$store.dispatch('tasks/getRequiredAttachmentsForInterviewTasks');
            this.$store.dispatch('dictionaries/getCredentialStatusesForRevisionNew');
        },
        methods: {
          makeTaskButtonName,
            ...mapActions('tasks', ['changeTaskCallCenterToInterview']),
            ...mapActions('responses', ['createResponse', 'editResponse']),
            ...mapActions('directory', ['getHrResources', 'getWebcamResources', 'saveCredential', 'changeCredential']),
            ...mapActions('dossier', ['fetchDossierTemplate', 'editDossier']),
            ...mapActions('comments', ['createComment', 'createTaskComment']),
            ...mapActions('tasks', ['createTaskCallCenter', 'createTaskInterview', 'changeTaskCallCenterToInterview', 'changeTaskArchive', 'editTask','editTaskSupport']),
          async sendMsgSupport(data) {
             await this.$store.dispatch('comments/createTaskComment', {
              id: this.taskPropCopy.id,
              type: this.taskPropCopy.type,
              comment: data.message,
              attachments: data.attachments,
            })
          },
          showModalForCloseSupport()  {
            this.$bvModal.show('support_close');
          },
          async supportComplete() {
           await this.$store.dispatch('tasks/editTaskSupport', {
              id: this.taskPropCopy.id,
              status: "completed"
            })
            this.close()
            showToast(this.$toasted, 'Обращение закрыто', 'success');
          },
          runTaskMethod(button) {
            const {task_action: method, set_task: task} = button
            if (method === 'recruitAction') this.profileFieldVisible = 0
            if (!task) this[method]()
            else this[method](task)
          },
          openOfficeList() {
            this.$emit('open-office-list', this.taskPropCopy.result);
          },
            fetchCurrentTask(id) {
                return this.$store.dispatch('tasks/fetchCurrentTask', id)
            },
            getGroups(query) {
                return this.$store.dispatch('hr/getGroups', query)
            },
            closeToast(e, toast) {
                toast.goAway(0);
            },
            setActiveTask(taskName) {
                this.activeTask = taskName
            },
            interviewAction() {
                this.action = 'interview'
            },
            sendInterview() {
                if (!this.taskPropCopy.next_planned_start_at) return this.shownErrors.push('next_planned_start_at');
                if (!this.communication) return this.communicationStatus = false;
                if (!this.taskPropCopy.id) {
                    if (this.taskStatus === 'creating') return;
                    this.createTaskInterview(this.taskParameters)
                    this.activeTask = 'close'
                } else {
                    if (this.taskStatus === 'editing') return;
                    this.changeTaskCallCenterToInterview({
                        id: this.taskPropCopy.id,
                        user: this.executor,
                        planned_start_at: this.taskPropCopy.next_planned_start_at,
                        communication_id: parseInt(this.communication)
                    })
                }
            },
            customNewAction() {
                if (this.taskStatus === 'creating') return;
                if (!this.taskPropCopy.title) this.shownErrors.push('title');
                if (!this.currentExecutor.id) this.shownErrors.push('user');
                if (!this.taskPropCopy.planned_start_at) this.shownErrors.push('planned_start_at');
                if (this.shownErrors.length) return this.showUserEditErrorMessage('Вы не заполнили обязательные поля');
                this.$store.dispatch('tasks/createTaskCustom', {
                    type: this.taskPropCopy.type,
                    title: this.taskPropCopy.title,
                    description: this.taskPropCopy.description,
                    planned_start_at: this.taskPropCopy.planned_start_at,
                    user: this.currentExecutor.id
                });
            },
            customAction() {
              this.editTask({
                id: this.taskPropCopy.id,
                status: 'completed',
                result: this.taskComment
              })
            },
            editTaskDescription() {
              if (!this.taskPropCopy.id) return;
                this.editTask({
                    id: this.taskPropCopy.id,
                    description: this.taskPropCopy.description
                })
            },
            openActionForm(action) {
                this.activeTask = action
            },
            closeForm() {
                this.activeTask = 'close'
                this.openBlock = false
            },
            responseAction() {
                if (!this.modelProfile.id) return this.isWaitingForResponseId = true;
                let query = {
                    vacancy: this.taskPropCopy.response.vacancy,
                    ...this.modelProfile,
                    additional_phones: this.modelProfile.additional_phones ? this.modelProfile.additional_phones.filter((phone, key) => phone && phone.value && !this.shownErrors.includes(`additional_phone-${key}`)).map(phone => ({value: phone.value})) : null,
                };
                if (!query.gender) delete query.gender;
                if (!query.nationality) delete query.nationality;
                else query.nationality = query.nationality.id;
                if (!query.worksheet) delete query.worksheet;
                if (query.group && query.group.id) query.group = query.group.id;
                if (query.source_user) delete query.source_user;
                if (query.source_city) delete query.source_city;
                if (this.shownErrors.includes('phone')) delete query.phone;
          
                if (!Object.keys(query.docs[0]).length) query.docs = null;
                this.editResponse(query);
            },
            editPhone(e) {
                if (!e.isValid) return this.shownErrors = [...this.shownErrors, 'phone'];
                this.responseAction();
            },
            editAdditionalPhone(key, e) {
                if (!e.isValid) return this.shownErrors = [...this.shownErrors, `additional_phone-${key}`];
                this.responseAction();
            },
            focusField(fieldName) {
                this.shownErrors = this.shownErrors.filter(error => error !== fieldName);
            },
            toggleAccordion(field, index) {
                if (this[field] !== index) Vue.set(this, field, index);
                else Vue.set(this, field, -1);
            },
            dateChange() {
                this.responseAction()
                this.focusField('birthday')
            },
            genderChange() {
                this.responseAction()
                this.focusField('gender')
            },
            nationalityChange() {
              this.responseAction()
              this.focusField('nationality')
            },
            resourceChange() {
                this.responseAction()
                this.focusField('resource')
            },
            toggleDossier(value, int, position) {
                this.dossierTemplate = this.dossierTemplate.map(function (parameter, index) {
                    if (index === position && parameter.visible !== int) parameter.visible = int
                    else if (index === position) parameter.visible = -1
                    return parameter
                })
            },
            saveDossier() {
                this.editDossier({id: this.dossiersId, parameters: this.dossierTemplate})
            },
            editCredentialField(resource, key, field) {
                if (this.webcamResourcesErrors[key]) this.webcamResourcesErrors[key][field] = false;
            },
            saveRegisterTaskCredentials() {
                const credentials = [],
                    errors = [];
                let isError = false;

                this.webcamResourcesCopy.forEach(resource => {
                  const error = {};
                  if (!resource.login && !resource.password && !resource.model_screen_name) return;
                  if (!resource.login) {
                    error.login = true;
                    isError = true;
                  }
                  if (!resource.password) {
                    error.password = true;
                    isError = true;
                  }
                  errors.push(error);
                  credentials.push({
                    login: resource.login,
                    password: resource.password,
                    resource: resource.resource,
                    model_screen_name: resource.model_screen_name,
                    id: resource.id,
                  });
                });

                if (isError) return this.webcamResourcesErrors = errors;

                this.editTask({
                    id: this.taskPropCopy.id,
                    credentials,
                });
                this.registerTaskCredentialsLoading = true;
            },
            saveCredentials(resource) {
                if (!resource.login || !resource.password || resource.creating) return;
                resource.creating = !resource.id;
                this.editTask({
                    id: this.taskPropCopy.id,
                    credential_login: resource.login,
                    credential_password: resource.password,
                    credential_resource: resource.resource,
                    credential_model_screen_name: resource.model_screen_name,
                    credential_id: resource.id,
                });
            },
            editParameter(changedParameter) {
                if (changedParameter.type === 'range') {
                  let parsedValue = parseInt(changedParameter.value);
                  changedParameter.value = isNaN(parsedValue) || (parsedValue < changedParameter.answers.minValue) ? changedParameter.answers.minValue :
                          (parsedValue > changedParameter.answers.maxValue ? changedParameter.answers.maxValue : parsedValue);
                }
                this.modelProfile.worksheet = this.interviewTemplate.map(function (groupParameter) {
                    groupParameter.parameters = groupParameter.parameters.map(function (parameter) {
                        if (parameter.id === changedParameter.id) parameter.value = changedParameter.value
                        return parameter
                    })
                    return groupParameter
                })
                this.responseAction()
            },
            commentAction() {
                this.createTaskComment({id: this.taskPropCopy.id, comment: this.commentText});
                this.commentText = '';
            },
            psychTaskAction() {
                if (this.taskStatus === 'editing') return;
                this.editTask({id: this.taskPropCopy.id, status: 'completed', result: this.taskPropCopy.result})
            },
            archiveAction() {
                if (this.taskStatus === 'editing') return;
                if (!this.cancellationReason) return this.shownErrors = [...this.shownErrors, 'cancellationReason'];
                this.changeTaskArchive({
                    id: this.taskPropCopy.id,
                    is_reject: this.rejected,
                    rejection_reason: this.rejected ? this.cancellationReason : null,
                    result: this.rejected ? null : this.taskComment
                })
            },
            doLaterAction() {
                if (this.taskStatus === 'editing') return;
                let isNotFilled = false;
                if (!this.taskPropCopy.complete_at) {
                    this.shownErrors = [...this.shownErrors, 'complete_at'];
                    isNotFilled = true;
                }
                if ((this.taskPropCopy.type === 'registration') && !this.taskComment) {
                    this.shownErrors = [...this.shownErrors, 'taskComment'];
                    isNotFilled = true;
                }
                if (isNotFilled) return showToast(this.$toasted, 'Необходимо  указать причину переноса и дату', 'error');
                if (this.taskPropCopy.type === 'interview') {
                    if (!this.chosenPostponemenetReason.id) return this.shownErrors = [...this.shownErrors, 'chosen_postponemenet_reason'];
                    if (this.chosenPostponemenetReason.id === 'other' && !this.taskComment) return this.shownErrors = [...this.shownErrors, 'postponemenet_reason'];
                }
                this.editTask({
                    id: this.taskPropCopy.id,
                    status: 'postponed',
                    result: this.taskPropCopy.type !== 'interview' ? this.taskComment : null,
                    postponement: this.taskPropCopy.type === 'interview' ? ((this.chosenPostponemenetReason.id === 'other') ? this.taskComment : this.chosenPostponemenetReason.title) : null,
                    complete_at: this.taskPropCopy.complete_at
                })
            },
            recruitAction() {
                this.action = 'recruit'
            },
            clickableDropZone() {
                return this.taskPropCopy.status !== 'completed'
            },
            removeFile(file) {
                this.filesIdName = this.filesIdName.filter(fileObject => fileObject.name !== file.name)
            },
            successFile(file, response) {
                this.filesIdName.push({name: file.name, id: response.id})
            },
            async interviewTaskAction() {
                if (!this.taskPropCopy.next_planned_start_at) return this.shownErrors.push('next_planned_start_at');
                if (!this.chosenGroup && !(this.taskPropCopy.response.group && this.taskPropCopy.response.group.id)) return this.showOfficeError = true;
                if (this.requiredAttachmentsForInterviewTasks.some(code => !this.resultFiles[code])) return this.$toasted.error('Необходимо загрузить все обязательные файлы', {
                  position: 'bottom-left',
                  keepOnHover: true,
                  duration: 2500,
                  action: {
                    text: '',
                    class: 'btn-close',
                    onClick: this.closeToast,
                  }
                });
                if ((this.responseStatus === 'editing') || (this.taskStatus === 'editing')) return;
                let files = [];
                for (let code in this.resultFiles) {
                    if (code === 'additional') files = [...files, ...this.resultFiles[code].map(file => {
                        return {id: file.id, code: null}
                    })];
                    else if (this.resultFiles[code]) files.push({id: this.resultFiles[code].id, code: code});
                }

                if (this.chosenGroup || this.taskPropCopy.response.group.id) this.editTask({
                    id: this.taskPropCopy.id,
                    status: 'completed',
                    files: files,
                    result: this.taskPropCopy.result,
                    next: { planned_start_at: this.taskPropCopy.next_planned_start_at},
                    response_group: this.chosenGroup && this.chosenGroup.id || this.taskPropCopy.response.group.id,
                    avatar_attachment_id: this.avatarId,
                })
            },
            dossierAction() {
                if (this.taskStatus === 'editing') return;
                this.editTask({
                    id: this.taskPropCopy.id,
                    status: 'completed',
                    result: this.taskComment
                })
            },
            registartionAction() {
                if (!this.taskPropCopy.next_planned_start_at) return this.shownErrors.push('next_planned_start_at');
                let accountsErrors = false;
                this.webcamResourcesErrors = this.webcamResourcesCopy.map(account => {
                  let result =  {
                    login: !account.login && (!!account.password || !!account.model_screen_name),
                    password: !account.password && (!!account.login || !!account.model_screen_name),
                  };
                  accountsErrors = accountsErrors || result.login || result.password;
                  return result;
                });
                if (accountsErrors) return;
                if (this.taskStatus === 'editing') return;
                this.editTask({
                    id: this.taskPropCopy.id,
                    status: 'completed',
                    email: this.taskPropCopy.model.email,
                    model_nickname: this.taskPropCopy.model.model_nickname,
                    next: {planned_start_at: this.taskPropCopy.next_planned_start_at}
                })
            },
            videoTaskAction() {
                if (this.taskStatus === 'editing') return;
                let files = this.filesIdName.map(file => {
                    return {id: file.id, code: null}
                })
                this.editTask({
                    id: this.taskPropCopy.id,
                    status: 'completed',
                    video_file: this.videoLink,
                    files: files,
                    result: this.videoComment
                })
            },
            createNewProfile() {
              if (this.taskStatus === 'editing') return;
              this.editTask({
                id: this.taskPropCopy.id,
                status: 'completed',
                method: 'new',
                next: {planned_start_at: this.taskPropCopy.result_date}
              })
              this.closeModalConfirm('create')
            },
            joinProfiles() {
              if (this.taskStatus === 'editing') return;
              this.editTask({
                id: this.taskPropCopy.id,
                status: 'completed',
                method: 'copy'
              })
              this.closeModalConfirm('join')
            },
            openModalConfirm(value) {
              switch (value) {
                case 'create': { this.$bvModal.show('create_new_profile'); break; }
                case 'join': { this.$bvModal.show('join_profiles'); break; }
              }
            },
            closeModalConfirm(value) {
              switch (value) {
                case 'create': { this.$bvModal.hide('create_new_profile'); break; }
                case 'join': { this.$bvModal.hide('join_profiles'); break; }
              }
            },
            fillTemplateParameters(worksheet) {
                if (!worksheet && worksheet.length) return;
                let parametersList = [],
                    index = 0;

                this.interviewTemplate = (JSON.parse(JSON.stringify(worksheet))).map(function (groupParameter) {
                    groupParameter.parameters = groupParameter.parameters?.map(function (parameter) {
                        parametersList.push({
                            ...parameter,
                            index: index,
                            key: `${parameter.title}`,
                            label: `${parameter.title}`,
                            class: 'response-info_data-field-title',
                            type: parameter.type,
                            answersList: Array.isArray(parameter.answers) ? parameter.answers?.map(function (answer) {
                                return {value: answer}
                            }) : [],
                            value: (parameter.type === 'date') && parameter.value ? moment.parseZone(parameter.value).format('YYYY-MM-DD') : parameter.value
                        });
                        index++;
                        return parameter;
                    })
                    return groupParameter;
                })
                this.parameters = parametersList
            },
          updateTask(task, force = false) {
            if (this.shouldSkipUpdate(task, force)) return;

            if (task.response && task.response.worksheet) {
              this.fillTemplateParameters(task.response.worksheet);
            }

            this.resetActiveTask(task);
            this.updateTaskProperties(task);
            this.updateModelProfile(task);
            this.updateTaskLists(task);
            this.updateExecutor(task);
            this.updateCredentials(task);
          },
          
          shouldSkipUpdate(task, force) {
            return (
              (this.taskPropCopy.id && this.taskPropCopy.id !== task.id && !force) ||
              (this.taskPropCopy.status === task.status &&
                this.taskPropCopy.id === task.id &&
                !this.listOnly && this.updateExistingWebcamResources(task.resource_credential))
            );
          },
          
          resetActiveTask(task) {
            this.activeTask = null;
            this.listOnly = this.taskPropCopy.id !== task.id;
          },
          
          updateTaskProperties(task) {
            if (task) {
              this.taskPropCopy = {
                ...JSON.parse(JSON.stringify(task)),
                result: task.result || '',
                response: task.response || {},
                complete_at: task.complete_at ? moment.parseZone(task.complete_at).format('YYYY-MM-DDTHH:mm') : null,
                next_at: null
              };
            }
          },
          
          updateModelProfile(task) {
            if (!this.modelProfile || !(task.response?.id || task.recipient)) return;
            
            let modelProfile = {}
            if (task.type === 'restore_password' || task.type === 'support') {
              modelProfile = JSON.parse(JSON.stringify(task.recipient))
            } else {
              modelProfile = JSON.parse(JSON.stringify(task.response));
            }
            modelProfile.docs = modelProfile.docs?.length ? modelProfile.docs : [{number: ''}];
            modelProfile.additional_phones = modelProfile.additional_phones || [];
            modelProfile.additional_phones.push({value: null, key: modelProfile.additional_phones.length});
            modelProfile.birthday = modelProfile.birthday ? moment.parseZone(modelProfile.birthday).format('YYYY-MM-DD') : null;
            
            if (modelProfile.docs && modelProfile.docs[0]) {
              modelProfile.docs[0].date_of_issue = modelProfile.docs[0].date_of_issue ? moment.parseZone(modelProfile.docs[0].date_of_issue)?.format('YYYY-MM-DD') : null;
              modelProfile.docs[0].validity = modelProfile.docs[0].validity ? moment.parseZone(modelProfile.docs[0].validity)?.format('YYYY-MM-DD') : null;
            }
            
            this.modelProfile = modelProfile;
            if (this.modelProfile.id && this.isWaitingForResponseId) {
              this.isWaitingForResponseId = false;
              this.responseAction();
            }
          },
          
          updateTaskLists(task) {
            if (task.response && task.response.task_list) {
              this.taskTypesComplete = task.response.task_list.map(t => t.type);
            }
            
            if (task.type === 'custom') {
              this.currentUsersUpdated = [...this.usersWithAccessCustomTasks];
            } else if (task.responsible_user_list) {
              this.currentUsersUpdated = this.getUpdatedUsersList(task.responsible_user_list);
            } else if (task.user && task.user.id) {
              this.currentUsersUpdated = this.getUpdatedUsersList([task.user]);
            } else {
              this.currentUsersUpdated = [];
            }
            
            if (task.next_responsible_user_list) {
              this.nextCurrentUsersUpdated = this.getUpdatedUsersList(task.next_responsible_user_list);
            } else if (task.user && task.user.id) {
              this.nextCurrentUsersUpdated = this.getUpdatedUsersList([task.user]);
            } else {
              this.nextCurrentUsersUpdated = [];
            }
          },
          
          getUpdatedUsersList(usersList) {
            let updatedUsers = [...usersList];
            if (updatedUsers.length) {
              updatedUsers.unshift({
                id: null,
                fullname: 'Исполнитель не назначен',
                surname: 'Исполнитель не назначен'
              });
            }
            return updatedUsers;
          },
          
          updateExecutor(task) {
            this.executor = null;
            this.currentExecutor = task.user && task.user.id ? task.user : {
              id: null,
              fullname: 'Исполнитель не назначен'
            };
            if (task.response) {
              this.commentsCopy = task.response.components;
            }
          },
          
          updateCredentials(task) {
            if (!task.check_credentials) return;
            
            if (task.type === 'checking_new') {
              this.updateCheckingNewCredentials(task);
            } else if (task.type === 'revision_new') {
              this.updateRevisionNewCredentials(task);
            } else if (task.type === 'reregistration') {
              this.updateReregistrationCredentials(task);
            } else if (task.type === 'password_change') {
              this.updatePasswordChangeCredentials(task);
            }
          },
          
          updateCheckingNewCredentials(task) {
            this.credentials = task.check_credentials.map(account => ({
              id: account.id,
              login: account.login,
              model_screen_name: account.model_screen_name,
              password: account.password,
              resource: account.resource,
              status: account.status === 'new' ? null : account.status,
              actualStatus: account.status,
              prevReason: account.reason || '',
              reason: '',
              statusState: true,
              reasonState: null,
            }));
            
            this.chosenResourcesForAdding = task.resources_for_registration?.filter(resource => resource.is_check).map(resource => resource.id) || [];
          },
          
          updateRevisionNewCredentials(task) {
            this.credentials = task.check_credentials.map(account => ({
              id: account.id,
              login: account.login,
              model_screen_name: account.model_screen_name,
              password: account.password,
              resource: account.resource,
              status: task.status === 'active' ? null : account.status,
              responsible_user: account.user,
              planned_start_at: account.planned_start_at,
              formattedPlannedStartAt: account.planned_start_at && moment(account.planned_start_at).format('DD.MM.YYYY'),
              actualStatus: account.status,
              reason: (task.status === 'archive' || task.status === 'completed') ? account.reason : '',
              prevReason: account.reason_history || account.reason || '',
              reasonState: null,
              loginState: true,
              screennameState: true,
              passwordState: true,
              statusState: true,
              responsibleUserState: true,
              plannedStartAtState: true,
            }));
          },
          
          updateReregistrationCredentials(task) {
            if (task.created_credentials) {
              this.credentials = task.created_credentials.map(account => ({
                login: account.login,
                password: account.password,
                resource: account.resource,
                model_screen_name: account.model_screen_name,
                loginState: true,
                passwordState: true,
                screennameState: true,
              }));
            } else {
              this.credentials = task.check_credentials.map(account => ({
                resource: account.resource,
                resourceId: account.resource_id,
                login: '',
                password: '',
                loginState: true,
                passwordState: true,
                screennameState: true,
              }));
            }
          },
          
          updatePasswordChangeCredentials(task) {
            this.credentials = task.check_credentials.map(account => ({
              id: account.id,
              login: account.login,
              password: account.password,
              new_password: account.password,
              resource: account.resource,
              passwordState: true,
              model_screen_name: account.model_screen_name,
            }));
          },
          updateTaskCopy(task) {
            this.videoFiles = this.getAttachmentsByTitle(task, 'Видеотестирование');
            this.registrationFiles = this.getAttachmentsByTitle(task, 'На регистрацию');
            this.dossierTemplate = this.getDossierTemplate(task);
            this.dossiersId = this.getDossierId(task);
            this.parametersDuplicate = this.getParametersDuplicate(task);
          },
          
          getAttachmentsByTitle(task, title) {
            if (task.response && task.response.albums && task.response.albums.length) {
              const album = task.response.albums.find(files => files.title === title);
              return album && album.attachments ? album.attachments : null;
            }
            return null;
          },
          
          getDossierTemplate(task) {
            if (task.type === 'dossier' && task.model && task.model.dossier && task.model.dossier.parameters) {
              task.model.dossier.parameters.forEach(parameter => parameter.visible = -1);
              return JSON.parse(JSON.stringify(task.model.dossier.parameters));
            }
            return null;
          },
          
          getDossierId(task) {
            if (task.type === 'dossier' && task.model && task.model.dossier) {
              return task.model.dossier.id;
            }
            return null;
          },
          
          getParametersDuplicate(task) {
            if (task.type === 'interview' && task.status === 'check' && this.isSuperAdmin && task.model) {
              const duplicateFields = task.model.duplicate_fields || [];
              return [
                {
                  label: 'Фамилия',
                  value: task.model.surname,
                  duplicate: duplicateFields.includes('surname'),
                  field: 'surname'
                },
                {label: 'Имя', value: task.model.name, duplicate: duplicateFields.includes('name'), field: 'name'},
                {
                  label: 'Телефон',
                  value: task.model.phone,
                  duplicate: duplicateFields.includes('phone'),
                  field: 'phone'
                },
                {
                  label: 'Дополнительный телефон',
                  value: task.model.additional_phone,
                  duplicate: duplicateFields.includes('additional_phone'),
                  field: 'additional_phone'
                },
                {label: 'Email', value: task.model.email, duplicate: duplicateFields.includes('email'), field: 'email'},
                {
                  label: 'Номер документа',
                  value: task.model.document_number,
                  duplicate: duplicateFields.includes('document_number'),
                  field: 'document_number'
                },
                {
                  label: 'Дата рождения',
                  value: task.model.birthday ? moment(task.model.birthday).format('DD.MM.YYYY') : null,
                  duplicate: duplicateFields.includes('birthday'),
                  field: 'birthday'
                }
              ];
            }
            return [];
          },
            openVacancyCreation() {
                this.$emit('open-vacancy-creation')
            },
            showUserEditErrorMessage(error = this.errorMessages[0]) {
                this.$toasted.error(error, {
                    position: 'bottom-left',
                    keepOnHover: true,
                    duration: 2500,
                    action: {
                        text: '',
                        class: 'btn-close',
                        onClick: this.closeToast
                    }
                });
            },
            changeCommunication() {
                this.communicationStatus = true;
            },
            downloadLink(e) {
              e.stopPropagation()
              this.flag = false
              this.showLink = true
              this.$store.dispatch('dossier/fetchDossierLink', {id: this.taskPropCopy.response.id})
            },
            copyLink() {
                this.copyTextToClipboard(this.dossierLink);
            },
            openDossier(e) {
                e.stopPropagation()
                this.flag = true
                this.$store.dispatch('dossier/fetchDossierLink', {id: this.taskPropCopy.response.id})
                localStorage.setItem('taskId', this.taskPropCopy.id);
            },
            async setNewExecutor(executor) {
                if (this.taskPropCopy.type === 'support') {
                this.editTaskSupport({
                    id: this.taskPropCopy.id,
                    user: executor.id,
                    complete_at: this.taskPropCopy.complete_at,
                    postponement: this.taskPropCopy.postponement,
                  });
                }
                else if (this.taskPropCopy.status === 'new') this.focusField('user')
                else this.editTask({
                  id: this.taskPropCopy.id,
                  user: executor.id,
                  complete_at: this.taskPropCopy.complete_at,
                  postponement: this.taskPropCopy.postponement,
                });
            },
            checkNewTime(time) {
                if (this.currentExecutor.id) {
                    if (!this.currentExecutor.absences) this.currentExecutor = this.currentUsersUpdated.find(user => user.id === this.currentExecutor.id);
                    if (this.isDayAbsence(moment(time).format('YYYY-MM-DD'), this.currentExecutor.absences))
                        this.showUserEditErrorMessage('Сотрудник будет отсутствовать в выбранную дату, выберите другого сотрудника или измените дату');
                    else if (this.taskPropCopy.status !== 'new') this.sendNewTime(time);
                    return;
                }
                if (this.taskPropCopy.status !== 'new') this.sendNewTime(time);
            },
            isDayAbsence(day, absences) {
              if (!absences?.length) return false
              let absencesCurrentDay = absences.filter(absence => moment.parseZone(day).isBetween(moment.parseZone(absence.start_at), moment.parseZone(absence.end_at), undefined, '[]'))
              return absencesCurrentDay.length ? absencesCurrentDay.map(absence => {return ` ${this.absenceTypes[absence.type]} ${moment.parseZone(absence.start_at).format('DD.MM')} - ${moment.parseZone(absence.end_at).format('DD.MM')} `}) : null
            },
            sendNewTime(time) {
              if (!time) this.editTask({id: this.taskPropCopy.id, planned_start_at: null})
              else if (moment(time).format('HH') === '00' && (this.taskPropCopy.type === 'call_center' || this.taskPropCopy.type === 'interview')) return;
              else this.editTask({
                  id: this.taskPropCopy.id,
                  planned_start_at: this.taskPropCopy.planned_start_at
                })
            },
            setExecutor(id) {
              this.errorSendInterview = false
              this.executorAvatar = this.nextCurrentUsersUpdated.find(executor => executor.id === id).avatar
            },
            setTimeWithExecutor(time) {
                this.errorSendInterview = false
                if (this.executor) {
                    if (this.isDayAbsence(moment.parseZone(time).format('YYYY-MM-DD'), this.nextCurrentUsersUpdated.find(user => user.id === this.executor).absences)) {
                        this.errorSendInterview = true
                        this.showUserEditErrorMessage('Сотрудник будет отсутствовать в выбранную дату, выберите другого сотрудника или измените дату')
                    }
                }
            },
            userRole(code) {
                switch (code) {
                  case 'ROLE_MODEL': return 'model';
                  case 'ROLE_OPERATOR': return 'operator';
                  default: return 'employee';
                }
            },
            setDroverType(type) {
                this.droverType = type
            },
            returnTaskComplete(group) {
                this.chosenGroup = group;
                this.droverType = 'task';
            },
            openMiniProfile(user) {
              if (this.userRole(user.role.code) && this.userPermissions[this.userRole(user.role.code)].profile.view) this.$emit('open-mini-profile', {id: user.id, fullname: user.fullname, breadcrumbsTitle: this.taskPropCopy.title});
            },
            checkingNewTaskAction() {
                if (!this.taskPropCopy.next_planned_start_at) return this.shownErrors.push('next_planned_start_at');
                this.editTask({
                    id: this.taskPropCopy.id,
                    status: 'completed',
                    credential_status: this.credentialStatus,
                    result: this.credentialComment,
                    next: {planned_start_at: this.taskPropCopy.next_planned_start_at}
                })
            },
            passwordChangeAction() {
                let isValid = true;
                this.credentials = this.credentials?.map(account => {
                    if (!account.new_password || (account.new_password === account.password)) isValid = false;
                    return {
                        ...account,
                        passwordState: account.new_password !== account.password,
                    }
                });
                if (!isValid) return this.showUserEditErrorMessage('Измените пароли от аккаунта на ресурсах');
                this.editTask({
                    id: this.taskPropCopy.id,
                    status: 'completed',
                    credentials: this.credentials?.map(account => {
                        return {
                            id: account.id,
                            password: account.new_password
                        }
                    }),
                })
              this.close()
            },
            updateWebcamResources(task) {
                this.webcamResourcesCopy = task?.resources?.map(resource => ({
                    resource: resource.id,
                    title: resource.title,
                    login: resource.credential?.login,
                    password: resource.credential?.password,
                    model_screen_name: resource.credential?.model_screen_name,
                    passwordFieldType: 'password',
                    creating: false,
                    id: resource.credential?.id,
                })) || Array.isArray(task.resource_credential) && task.resource_credential.map(resource => ({
                    resource: resource.resource,
                    title: resource.resource_title,
                    login: resource.login,
                    password: resource.password,
                    model_screen_name: resource.model_screen_name,
                    passwordFieldType: 'password',
                    creating: false,
                    id: resource.id,
                }))
            },
         
            getClassFromApplicationType(type) {
                switch (type) {
                    case 'application/pdf':
                        return 'image_placeholder -pdf';
                    case 'application/vnd.ms-excel':
                        return 'image_placeholder -xls';
                    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                        return 'image_placeholder -xlsx';
                    case 'application/msword':
                        return 'image_placeholder -doc';
                    case 'application/docx':
                        return 'image_placeholder -docx';
                }
                return '';
            },
            updateExistingWebcamResources(newResources) {
                if (!newResources || !this.webcamResourcesCopy) return;
                newResources.map(resource => {
                    let localResource = this.webcamResourcesCopy?.find(currentResource => currentResource.resource === resource.resource);
                    if (!localResource) return;
                    if (!localResource.id) {
                        localResource.id = resource.id;
                        localResource.creating = false;
                        this.saveCredentials(localResource);
                    }
                })
            },
            validateCheckingNew() {
                let isValid = true;
                this.credentials = this.credentials?.map(account => {
                    if (!account.status || ((account.status !== 'active') && (account.status !== 'new') && !account.reason)) isValid = false;
                    return {
                        ...account,
                        statusState: !!account.status,
                        reasonState: ((account.status === 'need_improved') || (account.status === 'reregistration')) && !account.reason ? false : null
                    }
                });
                if (!isValid) return;
                if (this.credentials.some(account => (account.status !== 'active') && (account.status !== 'new')) || this.chosenResourcesForAdding.length) this.activeTask = 'checking_new';
                else this.editTask({
                  id: this.taskPropCopy.id,
                  status: 'completed',
                  credentials: this.credentials?.map(account => {
                    return {
                      id: account.id,
                      status: account.status
                    }
                  }),
                  resources_for_registration: this.chosenResourcesForAdding
                })
            },
            checkingNewAction() {
                if (!this.taskPropCopy.next_planned_start_at) return this.shownErrors.push('next_planned_start_at');
                this.editTask({
                    id: this.taskPropCopy.id,
                    status: 'completed',
                    credentials: this.credentials?.map(account => {
                        return {
                            id: account.id,
                            reason: account.reason,
                            status: account.status
                        }
                    }),
                    resources_for_registration: this.chosenResourcesForAdding,
                    next: {planned_start_at: this.taskPropCopy.next_planned_start_at}
                })
            },
            validateRevisionNew() {
                let isValid = true,
                    includesReadyAccounts = false;

                this.credentials = this.credentials?.map(account => {
                    if (!account.reason || !account.login || !account.password || !account.status || ((account.status === 'revision_not_completed') && (!account.responsible_user || !account.planned_start_at))) isValid = false;
                    if (account.status === 'new') includesReadyAccounts = true;
                    return {
                        ...account,
                        reasonState: !account.reason ? false : null,
                        loginState: !!account.login,
                        passwordState: !!account.password,
                        responsibleUserState: !((account.status === 'revision_not_completed') && !account.responsible_user),
                        statusState: !!account.status,
                        plannedStartAtState: !!account.planned_start_at,
                    }
                });
                if (!isValid) return;
                if (includesReadyAccounts) return this.activeTask = 'revision_new';
                this.revisionNewAction(true);
            },
            revisionNewAction(preventNextDateCheck = false) {
                if (!this.taskPropCopy.next_planned_start_at && !preventNextDateCheck) return this.shownErrors.push('next_planned_start_at');
                this.$store.dispatch('tasks/editRevisionNewTask', {
                  id: this.taskPropCopy.id,
                  status: 'completed',
                  credentials: this.credentials?.map(account => ({
                    id: account.id,
                    login: account.login,
                    model_screen_name: account.model_screen_name,
                    password: account.password,
                    reason: account.reason,
                    planned_start_at: account.planned_start_at,
                    responsible_user: account.responsible_user?.id,
                    status: account.status,
                  })),
                  next: preventNextDateCheck ? undefined : {planned_start_at: this.taskPropCopy.next_planned_start_at},
                });
            },
            reregisterTaskAction() {
                let isValid = true;
                this.credentials = this.credentials?.map(account => {
                    if (!account.login || !account.password) isValid = false;
                    return {
                        ...account,
                        loginState: !!account.login,
                        passwordState: !!account.password
                    }
                });
                if (!isValid) return;
                if (!this.taskPropCopy.next_planned_start_at) return this.shownErrors.push('next_planned_start_at');
                this.editTask({
                    id: this.taskPropCopy.id,
                    status: 'completed',
                    credentials: this.credentials?.map(account => {
                        return {
                            login: account.login,
                            password: account.password,
                            resource: account.resourceId,
                            model_screen_name: account.model_screen_name,
                        }
                    }),
                    next: {planned_start_at: this.taskPropCopy.next_planned_start_at},
                })
            },
            restoreAction() {
                if(this.taskComment) this.createTaskComment({ id: this.taskPropCopy.id, comment: this.taskComment })
                this.editTask({ id: this.taskPropCopy.id, status: 'completed' })
            },
            changeAccountStatus(accountKey) {
                this.credentials = this.credentials?.map((account,key) => {
                    if (accountKey !== key) return account;
                    return {
                        ...account,
                        statusState: true,
                        reasonState: (account.status === 'active') ? null : account.reasonState
                    }
                });
            },
            changeAccountPassword(accountKey) {
                this.credentials = this.credentials?.map((account,key) => {
                    if (accountKey !== key) return account;
                    return {
                        ...account,
                        passwordState: true
                    }
                });
            },
            changeAccountField(accountKey, fieldName) {
                this.credentials = this.credentials?.map((account,key) => {
                    if (accountKey !== key) return account;
                    return {
                        ...account,
                        [`${fieldName}State`]: fieldName === 'reason' ? null : true
                    }
                });
            },
            changeAdditionalPhone(key) {
                this.shownErrors = this.shownErrors.filter(error => error !== `additional_phone-${key}`);
                if (key !== (this.modelProfile.additional_phones.length - 1)) return;
                Vue.set(this.modelProfile, 'additional_phones', [...this.modelProfile.additional_phones, {value: null, key: key + 1}]);
            },
            removeAdditionalPhone(key) {
                let newPhones = [...this.modelProfile.additional_phones];
                newPhones.splice(key, 1);
                this.shownErrors = this.shownErrors.filter(error => error !== `additional_phone-${key}`)
                    .map(error => error.replace(/(additional_phone-)(.+)/, (match, first, second) => {
                      let number = parseInt(second);
                      return number > key ? `${first}${number - 1}` : match;
                    }));
                this.modelProfile = {...this.modelProfile, additional_phones: newPhones};
                this.responseAction();
            },
            unarchiveTask() {
                if (this.taskStatus === 'editing') return;
                this.editTask({id: this.taskPropCopy.id, status: 'active'});
            },
            onUploadError(file, _b, error, ref) {
                if (error?.response) {
                    let element = this.$refs[ref];
                    if (element[0]) element[0].removeFile(file);
                    else element.removeFile(file);
                    let message = JSON.parse(error.response)?.violations[0]?.message;
                    if (message) this.$toasted.error(message, {
                        position: 'bottom-left',
                        keepOnHover: true,
                        duration: 5000,
                        action: {
                            text: '',
                            class: 'btn-close',
                            onClick: this.closeToast
                        }
                    });
                }
            },
            updateBusyDates(date) {
                this.$store.dispatch('tasks/fetchBusyDates', {type: 'interview', params: {group: this.taskPropCopy.group?.id, date_at: date}});
            },
            getSmallImage(link) {
                return getSmallImage(link);
            },
            pluralizeAccount(value) {
                if (!value) return 'Нет аккаунтов';
                return pluralize(value, ['аккаунт', 'аккаунта', 'аккаунтов']);
            },
            cancelTask() {
                this.rejected = true;
                this.setActiveTask('archive');
            },
            openGallery(index, albumData) {
                this.albumIndex = Array.isArray(albumData) ? index : Object.keys(albumData).indexOf(index)
                this.albumData = Array.isArray(albumData) ? albumData : Object.values(albumData)
            },
            closeGallery() {
                this.albumIndex = null
            },
            formattedDateWithoutTime(date) {
                return date ? moment(date).format('DD.MM.YYYY') : null
            },
          copyTextToClipboard(text) {
            return clipboard(text, this.copyTextToClipboardSuccess, this.copyTextToClipboardError);
          },
          copyTextToClipboardSuccess() {
            this.showLink = false;
            this.$toasted.success('Скопирована ссылка на анкету', {
              position: 'bottom-left',
              keepOnHover: true,
              duration: 2500,
              action: {
                text: '',
                class: 'btn-close',
                onClick: this.closeToast
              }
            });
          },
          copyTextToClipboardError(e) {
            this.$toasted.error(e || 'Ошибка', {
              position: 'bottom-left',
              keepOnHover: true,
              duration: 2500,
              action: {
                text: '',
                class: 'btn-close',
                onClick: this.closeToast
              }
            });
          },
          setHeightComments() {
            this.$nextTick(() => {
              this.commentsBlockHeight = this.$refs.commentsBlock && this.$refs.commentsBlock.clientHeight;
            })
          },
          toggleShowComments() {
            this.showAllComments = !this.showAllComments;
            this.setHeightComments();
          },
          getStatusResponse(response) {
             if (response.status === 'new' || response.task.status === 'completed') return response.status;
             if (response.task.status === 'active' || response.task.status === 'check' || response.task.status === 'postponed') return response.task.type;
             return response.task.status;
          },
          openPrevResponse(response) {
              this.chosenPrevResponse = response
              this.breadcrumbsTask = this.taskPropCopy
              if (response.status === 'call_center' || response.status === 'interview') this.droverType = 'task-opened'
              else this.droverType = 'response-opened'
          },
          returnCurrentTask() {
              this.droverType = 'task';
              this.taskPropCopy = this.breadcrumbsTask;
          },
          close() {
              this.$emit('close');
          },
          editUserAvatar() {
              if (!this.taskPropCopy.model?.avatar?.id) return;
              this.$store.dispatch('tasks/editTask', {id: this.taskPropCopy.id, avatar_attachment_id: this.taskPropCopy.model.avatar.id});
          },
          clickUser(user) {
            if (!this.userPermissions[user?.role?.code === 'ROLE_MODEL' ?
                'model' : (user.role.code === 'ROLE_OPERATOR' ? 'operator' : 'employee')].profile.view) return;
              if (!user?.id || !this.userPermissions.model.profile.view) return;
              this.activeUserId = user.id;
              this.setDroverType('user-details');
          },
          clickTaskTitle() {
              switch (this.taskPropCopy.type) {
                case 'registration':
                case 'revision_new':
                case 'password_change':
                  return this.clickUser(this.taskPropCopy.model);
                case 'checking_new': return this.clickUser({id: this.taskPropCopy.model_id});
                case 'restore_password': return this.clickUser(this.taskPropCopy.recipient);
                case 'checking': return this.clickUser({id: this.taskPropCopy.model_id});
              }
          },
          saveAvatar(avatar) {
              this.avatarId = avatar?.id;
          },
          setNicknameFromEmail() {
              this.taskPropCopy.model.model_nickname = this.taskPropCopy.model.email?.replace(emailDomain, '');
          },
        }
    }
</script>
