<template>
  <div class="pin">
    <div v-if="isLoading" class="pin-loading">
      <throbber class="throbber"/>
      <span>Идет загрузка, пожалуйста,<br/>подождите</span>
    </div>
    <pin-input v-else-if="type"
               v-model="valuePin"
               :title="title"
               :sub-title="subTitle"
               :error="errorText"
               @input="resetErrorText"
               @change="onChangePin"
    >
      <div v-if="type === 'login/confirmPass'" class="pin-input-footer">
        <span class="pin-input-footer-text" @click="toCreatePass">Забыли PIN-код?</span>
      </div>
      <div v-else-if="type === 'checkUser/confirmPin'" class="pin-input-footer">
        <span class="pin-input-footer-text" @click="toAuth">
          <span>Забыли PIN-код, </span><span class="pin-input-footer-text-link">авторизуйтесь</span>
        </span>
      </div>
    </pin-input>
  </div>
</template>

<script>
import PinInput from '@/components/Common/PinInput.vue';
import throbber from '@/assets/vue-svg/throbber.svg';
import { pluralize } from '@/tools/tools';

export default {
  name: 'Pin',
  components: {
    PinInput,
    throbber,
  },
  data() {
    return {
      valuePin: '',
      oldValuePin: '',
      errorText: '',
      // 'login/createPass' | 'login/confirmPass' | 'checkUser/confirmPin' | ''
      type: '',
    }
  },
  computed: {
    prevScreen() {
      return this.$route.query.backPage;
    },
    pinAttemptsLeft() {
      return this.$store.state.auth.pinAttemptsLeft;
    },
    title() {
      switch (this.type) {
        case 'checkUser/confirmPin':
          return 'Введите PIN-код';
        case 'login/confirmPass':
          return 'Повторите PIN-код';
        case 'login/createPass':
          return 'Придумайте PIN-код';
      }
      return '';
    },
    subTitle() {
      switch (this.type) {
        case 'login/confirmPass':
          return 'Повторите ранее введеный PIN-код';
        case 'login/createPass':
          return 'Введите 4-значный PIN-код';
      }
      return '';
    },
    isLoading() {
      const isLoadLogin = this.$store.state.auth.loginStatus === 'request';
      const isLoadUser = this.$store.state.auth.status === 'request';
      const isUnlocking = this.$store.state.auth.pinLockStatus === 'unlocking';
      return isLoadLogin || isLoadUser || isUnlocking;
    },
    hasPin() {
      return this.$store.state.auth.hasPin;
    },
    isUserLockedBehindPin() {
      return this.$store.state.auth.isUserLockedBehindPin;
    },
    accessToken() {
      return this.$store.state.auth.accessToken;
    },
  },
  watch: {
    isLoading: function (isLoad) {
      if (!isLoad && this.accessToken && !this.isUserLockedBehindPin) this.toNextPage();
    },
    pinAttemptsLeft(newAttempts) {
      if (!newAttempts) return;
      this.errorText = 'Неверный PIN, осталось ' + pluralize(newAttempts, ['попытка', 'попытки', 'попыток']);
    },
    isUserLockedBehindPin(newStatus) {
      if (!newStatus) this.toNextPage();
    },
  },
  created() {
    if (!this.$store.state.auth.accessToken && !this.$store.state.auth.email) this.toAuth();
    this.setBeginState();
  },
  methods: {
    toNextPage() {
      if (this.prevScreen) return this.$router.replace(this.prevScreen);
      return this.$router.replace('/');
    },
    toCreatePass() {
      this.oldValuePin = '';
      this.valuePin = '';
      this.errorText = '';
      this.type = 'login/createPass';
    },
    toAuth() {
      this.$store.dispatch('auth/resetPassAndEmail');
      this.$store.dispatch('auth/removeTokens');
      this.$router.push('/login');
    },
    resetErrorText() {
      this.errorText = '';
    },
    onChangePin() {
      switch (this.type) {
        case 'login/createPass':
          this.oldValuePin = this.valuePin;
          this.valuePin = '';
          this.type = 'login/confirmPass';
          return;
        case 'login/confirmPass':
          if (this.oldValuePin === this.valuePin) {
            this.$store.dispatch('auth/loginUser',  this.valuePin);
          } else this.errorText = 'Введенный PIN не совпадает';
          return;
        case 'checkUser/confirmPin':
          if (this.accessToken) this.$store.dispatch('auth/unlockUserWithPin', this.valuePin);
          else this.$store.dispatch('auth/loginUser', this.valuePin);
      }
    },
    setBeginState() {
      this.type = (!this.hasPin && !this.accessToken) ? 'login/createPass' : 'checkUser/confirmPin';
    },
  },
}
</script>


