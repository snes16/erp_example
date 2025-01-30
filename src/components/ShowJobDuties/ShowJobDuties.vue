<template>
    <div class="show_job_duties">
        <div class="card show_job_duties-card">
            <div class="show_job_duties-card-body" @scroll="handleScroll" ref="duties_body">
              <div ref="duties_list">
                <h3 class="show_job_duties-card-body-title">Для дальнейшей работы в сервисе ознакомьтесь и примите ваши должностные обязанности</h3>
                <template>
                  <div v-for="jobDuties in jobDutiesList" class="show_job_duties-card-body-list">
                    <template v-if="user.job_duties.some(duties => jobDuties.id === duties)">
                      <div class="show_job_duties-card-body-list-title"><b>{{jobDuties.title}}</b></div>
                      <ul>
                        <li v-for="duty in jobDuties.children" v-if="user.job_duties.some(duties => duty.id === duties)">
                          <icon class="show_job_duties-card-body-list-icon"/>
                          <span class="ml-2">{{duty.title}}</span>
                        </li>
                      </ul>
                    </template>
                  </div>
                </template>
              </div>
            </div>
            <div class="show_job_duties-card-button">
              <button-throbber variant="primary"
                               :loading="jobDutiesStatus === 'editing-confirm'"
                               :class="{'show_job_duties-card-button-disabled': jobDutiesStatus !== 'editing-confirm'}"
                               :disabled="!scrollFinished || dictionaryStatus === 'request'"
                               @click="confirmJobDuties">
                Принимаю
              </button-throbber>
            </div>
        </div>
    </div>
</template>

<script>
import Icon from "@/assets/item-duty.svg";
import moment from "moment";
import ButtonThrobber from "@/components/Common/ButtonThrobber/ButtonThrobber";
export default {
    name: "ShowJobDuties",
    components: {
      ButtonThrobber,
        'icon': Icon
    },
    data () {
        return {
            scrollFinished: true
        }
    },
    computed: {
        jobDutiesList() {
            return this.$store.state.dictionaries.jobDuties;
        },
        dictionaryStatus() {
            return this.$store.state.dictionaries.status;
        },
        user() {
            return this.$store.state.auth.user;
        },
        jobDutiesStatus() {
            return this.$store.state.jobDuties.status;
        }
    },
    watch: {
        jobDutiesList() {
          setTimeout(()=> {
            if (this.$refs['duties_body'].scrollHeight > this.$refs['duties_body'].clientHeight) this.scrollFinished = false
          }, 10)
        },
        jobDutiesStatus(newStatus, oldStatus){
            if (newStatus === '' && oldStatus === 'editing-confirm') this.$store.dispatch('auth/getUser')
        },
    },
    created() {
        this.$store.dispatch('dictionaries/getJobDuties');
    },
    methods: {
        confirmJobDuties() {
          this.$store.dispatch('jobDuties/setConfirmJobDuties')
        },
        handleScroll(e) {
            if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) this.scrollFinished = true
        },
      userRole(code) {
        switch (code) {
          case 'ROLE_MODEL': return 'Model';
          case 'ROLE_OPERATOR': return 'Operator';
          default: return 'User';
        }
      },
    }
}
</script>