import Ember from 'ember';
import BoxCommon from 'front/mixins/box-common';

const {
    Component,
    computed
} = Ember;

export default Component.extend(BoxCommon, {
    classNames: ['index-box'],
    alignToBottom: true,

    referral_link: computed('app.user.username', {
        get() {
            let username = this.get('app.user.username');
            return `${window.location.origin}/register?sponsor=${username}`;
        }
    }),

    actions: {
        copyReferralLink() {
            let text = this.get('referral_link');
            let textArea = document.createElement("textarea");

            textArea.style.position = 'fixed';
            textArea.style.top = 0;
            textArea.style.left = 0;
            textArea.style.width = '2em';
            textArea.style.height = '2em';
            textArea.style.padding = 0;
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';
            textArea.style.background = 'transparent';
            textArea.value = text;

            document.body.appendChild(textArea);
            textArea.select();

            try {
                document.execCommand('copy');
            } catch (err) {
                alert('Error: ' + err);
            }
        }
    }
});
