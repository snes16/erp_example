<template>
  <div class="emoji_textarea" @click="onClickContainer">
    <textarea-autosize v-model="text" class="emoji_textarea-area" :class="textareaClass" ref="textarea" @change="onChange"></textarea-autosize>
    <emojis-block icon="flaticon-emoji" height="150px" ref="emoji-picker" @click="insertEmoji" />
  </div>
</template>

<script>
import { VueChatEmoji } from 'vue-chat-emoji';

export default {
  name: 'emoji-textarea',
  props: {
    value: String,
    required: Boolean,
    error: Boolean,
    textareaClass: String,
  },
  components: {
    'emojis-block': VueChatEmoji,
  },
  computed: {
    text: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      }
    }
  },
  created() {
    this.$root.$on('click', this.onRootClick);
  },
  beforeDestroy() {
    this.$root.$off('click', this.onRootClick);
  },
  methods: {
    insertEmoji({unicode}) {
      if (this.$refs.textarea?.$el?.selectionStart === undefined) return;
      let selectionStart = this.$refs.textarea.$el.selectionStart;
      this.text = this.text.slice(0, selectionStart) + unicode + this.text.slice(selectionStart);
      this.$nextTick(() => this.$refs.textarea.$el.setSelectionRange(selectionStart + 2, selectionStart + 2));
    },
    onChange() {
      this.$emit('change', this.value);
    },
    onClickContainer(e) {
      e.stopPropagation();
    },
    onRootClick() {
      if (this.$refs["emoji-picker"].isPickerEnabled) this.$refs["emoji-picker"].toggleEmojiPicker();
    },
  }
}
</script>