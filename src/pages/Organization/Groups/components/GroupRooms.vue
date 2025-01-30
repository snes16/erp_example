<template>
  <div class="groups-main-data-blocks-rooms card mt-3">
    <div class="groups-main-data-blocks-rooms-title">
      <h3 class="mb-2">Комнаты</h3>
    </div>
    <div v-if="rooms && rooms.length" class="groups-main-data-blocks-rooms-list">
      <router-link v-for="room in formattedRooms"
                   :to="room.link"
                   class="groups-main-data-blocks-rooms-list-room"
                   :key="room.id"
      >
        <i class="color_icon mr-2" :style="`background-color: ${room.color || 'red'}`"/>
        <b>{{ room.title }}</b>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'group-rooms',
  props: {
    rooms: Array,
  },
  computed: {
    formattedRooms() {
      const rooms = [],
          currentRoute = this.$route;

      this.rooms.forEach(room => {
        if (room.is_deleted) return;
        rooms.push({
          ...room,
          link: {
            ...currentRoute,
            query: {
              ...currentRoute.query,
              room: room.id,
            },
          },
        })
      });

      return rooms;
    },
  },
}
</script>