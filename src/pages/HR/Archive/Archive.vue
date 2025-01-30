<template>
    <vacancies type="archive" />
</template>

<script>
    import Vacancies from '../Vacancies';

    export default {
        name: 'vacancies-all',
        components: {
            'vacancies': Vacancies
        }
    }
</script>