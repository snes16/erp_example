<template>
  <li v-if="!childrenLinks && isHeader" :class="{headerLink: true, className}">
    <router-link :to="link" class="d-flex align-items-center sidebar-link sidebar-link-custom_styles">
      <span class="icon">
        <i :class="fullIconName"></i>
      </span>
      <component :is="isRouteActive ? 'b' : 'span'">{{header}}</component>
      <sup v-if="label" :class="'text-' + labelColor" class="headerLabel">{{label}}</sup>
      <b-badge v-if="badge" variant="primary" pill>{{badge}}</b-badge>
    </router-link>
  </li>
  <li v-else-if="childrenLinks" :class="{headerLink: true, className}">
    <div @click="() => togglePanelCollapse(link)" @mouseenter="() => this.childrenLinkHovered = true" @mouseleave="() => this.childrenLinkHovered = false" :class="{'sidebar-hover' : !sidebarStatic}">
      <router-link :to="link" event="" class="d-flex align-items-center sidebar-link sidebar-link-custom_styles">
        <span class="icon">
          <i :class="fullIconName"></i>
        </span>
        <component :is="isRouteActive ? 'b' : 'span'">{{header}}</component>
        <sup v-if="label" :class="'text-' + labelColor" class="ml-1 headerLabel">{{label}}</sup>
        <div :class="{caretWrapper: true, carretActive: isActive}">
          <i class="fa fa-angle-left" />
        </div>
      </router-link>
      <div v-if="childrenLinkHovered && !sidebarStatic && sidebarClose" class="hover-collapse">
        <NavLink v-for="(link, index) in childrenLinks"
                 :activeItem="activeItem"
                 :header="link.header"
                 :index="link.index"
                 :link="link.link"
                 :childrenLinks="link.childrenLinks"
                 :key="index"
        />
      </div>
    </div>
    <b-collapse :id="'collapse' + index" :visible="isActive">
      <ul class="sub-menu">
        <NavLink v-for="(link, index) in childrenLinks"
          :activeItem="activeItem"
          :header="link.header"
          :index="link.index"
          :link="link.link"
          :childrenLinks="link.childrenLinks"
          :key="index"
        />
      </ul>
    </b-collapse>
  </li>
  <li v-else>
    <router-link :to="index !== 'menu' && link">
      {{header}} <sup v-if="label" :class="'text-' + labelColor" class="headerLabel">{{label}}</sup>
    </router-link>
  </li>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'NavLink',
  props: {
    badge: { type: [String, Number], dafault: '' },
    header: { type: String, default: '' },
    iconName: { type: String, default: '' },
    headerLink: { type: String, default: '' },
    link: { type: String, default: '' },
    childrenLinks: { type: Array, default: null },
    className: { type: String, default: '' },
    isHeader: { type: Boolean, default: false },
    deep: { type: Number, default: 0 },
    activeItem: { type: String, default: '' },
    label: { type: String },
    labelColor: { type: String, default: 'warning' },
    index: { type: String },
    commonLink: String,
  },
  data() {
    return {
      headerLinkWasClicked: false,
      childrenLinkHovered: false
    };
  },
  watch: {
      /*link: function(nextLink, previousLink) {
          if(previousLink) previousLink = ''
      }*/
  },
  methods: {
    ...mapActions('layout', ['changeSidebarActive']),
    togglePanelCollapse(link) {
      if (!this.sidebarStatic && this.sidebarClose) return;
      if (this.isActive !== null) {
        this.changeSidebarActive(link);
        this.headerLinkWasClicked = !this.headerLinkWasClicked
            || !this.activeItem.includes(this.index);
      }
    }
  },
  computed: {
    ...mapState('layout', {
      sidebarClose: state => state.sidebarClose,
      sidebarStatic: state => state.sidebarStatic
    }),
    fullIconName() {
      return `fi ${this.iconName}`;
    },
    isActive() {
      return (this.activeItem && this.activeItem.includes(this.index) && this.headerLinkWasClicked);
    },
    currentRoute() {
      return this.$route.path;
    },
    isRouteActive() {
      return this.currentRoute.includes(this.commonLink || this.link) || this.childrenLinks?.some(child => this.currentRoute.includes(child.link));
    },
  },
};
</script>

<!--<style src="./navLink.scss" lang="scss" scoped />-->
