<template>
    <vacancies type="active" />
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