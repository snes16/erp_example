<template>
    <input
        class="modal_title"
        v-model="modalTitle"
        v-autowidth="{maxWidth: maxWidth, minWidth: minWidth, comfortZone: 8}"
        :placeholder="placeholder"
        @change="changeTitle"
        :required="required"
    />
</template>

<script>
    export default {
        name: 'modal-title',
        props: {
            value: String,
            maxWidth: String,
            minWidth: String,
            field: String,
            placeholder: { type: String, default: 'Введите название' },
            required: { type: Boolean, default: false }
        },
        computed: {
            modalTitle: {
                get() {
                    return this.value
                },
                set(value) {
                    this.$emit('setTitle', value);
                }
            }
        },
        methods: {
            changeTitle() {
                this.$emit('changeTitle', this.modalTitle, this.field);
            }
        }
    }
</script>