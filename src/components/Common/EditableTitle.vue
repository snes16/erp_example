<template>
    <span contenteditable="plaintext-only" v-on="basicCallback" ref="editable"></span>
</template>

<script>
    export default {
        props: {
            value: {
                type: String,
                default: ''
            }
        },
        computed: {
            basicCallback() {
                return { ...this.$listeners, input: this.inputCallback, focusout: this.focusoutCallback }
            }
        },
        watch: {
            value: function (nextValue, prevValue) {
                console.log(nextValue, prevValue);
            }
        },
        mounted() {
            this.$refs.editable.innerText = this.value;
        },
        methods: {
            inputCallback(e) {
                this.$emit('input', e.target.innerText);
            },
            focusoutCallback(e) {
                this.$emit('change', e.target.innerText);
            }
        }
    }
</script>