<template>
  <div class="auth-page">
    <b-container>
      <Widget class="widget-auth mx-auto" title="<p class='widget-auth-header'>Авторизация</p>" customHeader>
        <p class="widget-auth-info use-email">Используйте email для входа</p>
        <form class="mt" @submit.prevent="loginUser">
          <b-alert class="alert-sm" variant="danger" :show="!!errorMessage">{{ errorText }}</b-alert>
          <div class="form-group">
            <input v-model="email" class="form-control no-border" required type="email" name="email" placeholder="Email"/>
          </div>
          <div class="form-group">
            <input v-model="password" class="form-control no-border" required type="password" name="password" placeholder="Password"/>
          </div>
          <b-button type="submit" size="sm" class="auth-btn mb-3" variant="info">
            {{ isFetching ? 'Загрузка...' : 'Войти' }}
          </b-button>
          <router-link class="forget-password" to="changepass">Забыли пароль?</router-link>
        </form>
      </Widget>
    </b-container>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import config from '@/config';

export default {
  name: 'LoginPage',
  components: {Widget},
  data() {
    return {
      email: '',
      password: '',
    }
  },
  computed: {
    errorMessage() {
      return this.$store.state.auth.errorMessage;
    },
    isFetching() {
      return ['authorization', 'request'].includes(this.$store.state.auth.status) || (this.$store.state.auth.loginStatus === 'request');
    },
    errorText() {
      const errorRecoveryPassword = this.errorMessage && this.errorMessage.data && this.errorMessage.data.code === 500;
      const banAcc = this.errorMessage && this.errorMessage.data && this.errorMessage.data.code === 403;
      if (banAcc) return this.errorMessage.data.message;
      if (errorRecoveryPassword) return 'При восстановлении пароля возникла ошибка. Если проблема повторяется сообщите о ней Администратору';
      return 'Введен неверный email или пароль';
    },
    needPin() {
      return this.$store.state.auth.needPin;
    },
    hasPin() {
      return this.$store.state.auth.hasPin;
    },
    status() {
      return this.$store.state.auth.status;
    },
    loginStatus() {
      return this.$store.state.auth.loginStatus;
    },
  },
  watch: {
    status(newStatus, prevStatus) {
      if ((prevStatus === 'authorization') && (newStatus === '')) {
        if (this.needPin || this.hasPin) this.$router.push('/enter-pin');
        else this.$store.dispatch('auth/loginUser');
      }
    },
    loginStatus(newStatus, prevStatus) {
      if ((prevStatus === 'request') && (newStatus === '')) this.$router.push('/');
    },
  },
  methods: {
    loginUser() {
      if (this.email.length !== 0 && this.password.length !== 0 && !this.isFetching) {
        this.$store.dispatch('auth/authUser', {email: this.email, password: this.password});
      }
    },
  },
  mounted() {
    const creds = config.auth;
    this.email = creds.email;
    this.password = creds.password;
  }
};
</script>
