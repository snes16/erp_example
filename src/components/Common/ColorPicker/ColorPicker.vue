<template>
    <div class="color_picker" @click="showPicker">
        <div class="color_picker-dot" :style="`background-color: ${value}`"></div>
        <span class="color_picker-title">{{ title }}</span>
        <div class="color_picker-picker" @click="clickPopup">
            <chrome
                    :class="!pickerShown ? 'd-none' : ''"
                    v-model="color"
                    @input="inputColor"
            />
        </div>
    </div>
</template>

<script>
    import { Chrome } from 'vue-color';

    export default {
        props: {
            value: {
                type: String,
                default: '#FFFFFF'
            },
            title: {
                type: String,
                default: 'Цвет'
            },
            disabled: Boolean
        },
        components: {
            'chrome': Chrome
        },
        data() {
            return {
                color: {},
                pickerShown: false,
                previousColor: {}
            }
        },
        watch: {
            value: function (nextValue) {
                if (nextValue !== this.color.hex) this.color = {hex: nextValue};
            }
        },
        created() {
            this.$root.$on('click', this.hidePicker);
        },
        destroyed() {
            this.$root.$off('click', this.hidePicker);
        },
        methods: {
            hidePicker() {
                this.pickerShown = false;
                if (this.previousColor.hex && (this.previousColor.hex !== this.color.hex)) {
                    this.previousColor = {...this.color};
                    this.$emit('change', this.color.hex);
                }
            },
            showPicker(e) {
                if (this.disabled) return;
                e.stopPropagation();
                e.stopImmediatePropagation();
                e.preventDefault();
                this.pickerShown = true;
                this.previousColor = {...this.color};
            },
            inputColor(e) {
                this.$emit('input', e.hex);
            },
            clickPopup(e) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        }
    }
</script>