<template>
  <div class="auth-page">
    <b-container>
      <Widget class="widget-auth mx-auto" title="<p class='widget-auth-header'>Забыли пароль?</p>" customHeader>
        <p class="widget-auth-info input-new-pass">
          Введите Email, новый пароль будет отправлен на почту
        </p>
        <form class="mt" @submit.prevent="changePass">
          <b-alert class="alert-sm" variant="danger" :show="isFailure">
             {{errorText}}
          </b-alert>
          <div class="form-group">
            <input class="form-control no-border"
                   ref="email" type="email" required name="email" v-model="emailData"
                   placeholder="Email"/>
          </div>
          <b-button type="submit" variant="inverse" class="auth-btn mb-3 button-new-pass" size="sm">{{isFetching ? 'Загрузка...' : 'Восстановить'}}</b-button>
          <p class="text-new-pass">Вспомнили аккаунт? <router-link class="return-login" to="login" @click.native="resetErrors">Войдите</router-link></p>
        </form>
      </Widget>
    </b-container>
  </div>
</template>
<script>
  import Widget from '../../components/Widget/Widget';
  import router from '../../Routes';
  import {mapActions, mapState} from 'vuex';

  export default {
    name: 'Changepass',
    components: {Widget},
    data () {
      return {
        emailData: ''
      }
    },
    watch: {
      statusChangePass: function(newStatus) {
        if(newStatus === 'password-is-changed') {
          router.push('/login');
          this.addSuccessNotification();
        }
      }
    },
    created() {
      this.resetError()
    },
    computed: {
      ...mapState('changepass', ['isFailure', 'isSuccess', 'isFetching', 'statusChangePass']),
      errorMessage() {
        return this.$store.state.changepass.errorCode
      },
      errorText() {
        return this.errorMessage === 500 ? 'При восстановлении пароля возникла ошибка. Если проблема повторяется сообщите о ней Администратору' : 'Email не зарегистрирован в системе'
      }
    },
    methods: {
      ...mapActions('auth', ['resetError']),
      ...mapActions('changepass', ['changePassword', 'resetErrorFailure']),
      changePass() {
        // const email = this.$refs.email.value
        const mail = this.emailData
        this.changePassword({creds: { mail }, $toasted: this.$toasted});
      },
      addSuccessNotification() {
        this.$toasted.options.position = 'bottom-left'
        //В группах есть стили для тостов, нужно перейти на них
        this.$toasted.success(`Заявка на восстановления пароля отправлена`, {
          action: {
            text: 'X',
            onClick: (e, toastObject) => {
              toastObject.goAway(0);
          }
        },
      })
    },
      resetErrors() {
          this.resetErrorFailure()
      }
    }
  }
</script>