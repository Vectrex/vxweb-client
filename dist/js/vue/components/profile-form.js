

    import FetchResponse from "../mixins/fetch-response.js";

    export default {
		template: '<form action="/" class="form-horizontal" v-on:submit.prevent="submit"><div class="form-sect"><div class="form-group"><label class="form-label col-3" for="username_input"><strong>Username*</strong></label><div class="col-9"><input name="username" maxlength="128" class="form-input" autocomplete="off" id="username_input" type="text" v-model="form.username"><p v-if="errors.username" class="form-input-hint vx-error-box error">{{ errors.username }}</p></div></div><div class="form-group"><label class="form-label col-3" for="email_input"><strong>Email*</strong></label><div class="col-9"><input name="email" id="email_input" class="form-input" autocomplete="off" maxlength="128" type="text" v-model="form.email"><p v-if="errors.email" class="form-input-hint vx-error-box error">{{ errors.email }}</p></div></div><div class="form-group"><label class="form-label col-3" for="name_input"><strong>Name*</strong></label><div class="col-9"><input name="name" id="name_input" class="form-input" autocomplete="off" maxlength="128" type="text" v-model="form.name"><p v-if="errors.name" class="form-input-hint vx-error-box error">{{ errors.name }}</p></div></div><div class="form-group"><label class="form-label col-3" for="pwd_input">Neues Passwort</label><div class="col-9"><input name="new_PWD" id="pwd_input" class="form-input" autocomplete="off" maxlength="128" type="password" v-model="form.new_PWD"><p v-if="errors.new_PWD" class="form-input-hint vx-error-box error">{{ errors.new_PWD }}</p></div></div><div class="form-group"><label class="form-label col-3" for="pwd2_input">Passwort wiederholen</label><div class="col-9"><input name="new_PWD_verify" id="pwd2_input" class="form-input" autocomplete="off" maxlength="128" type="password" v-model="form.new_PWD_verify"><p v-if="errors.new_PWD_verify" class="form-input-hint vx-error-box error">{{ errors.new_PWD_verify }}</p></div></div></div><div class="divider text-center" data-content="Benachrichtigungen"></div><div class="form-sect off-3"><div class="form-group" v-for="notification in notifications"><label class="form-switch"><input name="notification[]" v-bind:value="notification.alias" type="checkbox" v-model="form.notifications"><i class="form-icon"></i>{{ notification.label }}</label></div></div><div class="divider"></div><div class="form-base"><div class="form-group off-3"><button name="submit_profile" value="" type="submit" class="btn btn-success">Änderungen speichern</button></div></div></form>',

        mixins: [FetchResponse],
        props: {
            url: { type: String, required: true },
            initialData: { type: Object, default: () => { return {} } },
            notifications: { type: Array }
        },

        data() {
            return {
                form: {}
            }
        },

        computed: {
            errors () {
                return this.fetch.response ? (this.fetch.response.errors || {}) : {};
            },
            message () {
                return this.fetch.response ? this.fetch.response.message : "";
            }
        },

        watch: {
            initialData (newValue) {
                this.form = newValue;
            }
        },

        methods: {
            submit() {
                this.fetchPostResponse(this.url, this.form);
            }
        }

    }
