<template>
    <div class="opponent">
        <button class="btn"
                v-for="(item, key) in opponent"
                :key="key"
                :disabled="active.indexOf(item.value) === -1"
                @click="handleOpponent(item)">
            {{ item.text }}
        </button>
        <router-link class="btn" to="/log">对战记录</router-link>
    </div>
</template>

<script>
    import
    export default {
        name: "Home",
        data () {
            return {

            }
        },
        socket: {

        },
        mounted() {
            this.$store.dispatch()
        }
    }
</script>

<style lang="scss" scoped>
    .home {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 40px 0;
    }
    .opponent {
        display: flex;
        flex-direction: column;
        align-items: center;

        .btn {
            margin-top: 20px;
        }
    }
</style>