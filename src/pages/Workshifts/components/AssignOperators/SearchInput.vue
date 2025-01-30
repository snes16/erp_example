<template>
  <div class="assign-operators-body-search">
    <b-input-group>
      <b-input-group-text slot="append"><search/></b-input-group-text>
      <b-form-input :value="value" @input="setSearchUser" type="text" placeholder="Поиск"></b-form-input>
    </b-input-group>
  </div>
</template>

<script>
import search from "@/assets/vue-svg/search.svg";
export default {
  name: "SearchInput",
  components: {
    'search': search
  },
  props: {
    value: String
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  methods: {
    setSearchUser(search) {
      this.$emit('input', search);
      this.$emit('change', search);
    }
  }
}
</script>