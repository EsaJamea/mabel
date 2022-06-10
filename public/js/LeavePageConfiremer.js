const LeavePageConfirmer = (function () {

    let isDirty = false;
    let formSubmitting = false;
    let listenerAdded = false;
    let confirmMessage = 'It looks like you have been editing something. '
    + 'If you leave before saving, your changes will be lost.';

    function setUplistner(isDirty) {
        if (isDirty) {
            if (!listenerAdded) {
                window.addEventListener("beforeunload", beforeunloadHandeler);
                listenerAdded = true;
            }
            //else when set "isDirty = true" twice in a row
        } else {
            if (listenerAdded) {
                window.removeEventListener("beforeunload", beforeunloadHandeler);
                listenerAdded = false;
            }
        }
    }

    function beforeunloadHandeler(e) {

        /*you could remove "|| !isDirty" becuase when it's
        setted to false there is no event listner. Anyway
        I left it, just in case of some hidden powers
        from the 5th dimention, tryied to be funny. */

        if (formSubmitting || !isDirty) {
            return undefined;
        }

        (e || window.event).returnValue = confirmMessage; //Gecko + IE
        return confirmMessage; //Gecko + Webkit, Safari, Chrome etc.
    }

    return {

        get ConfirmMessage() {
            return confirmMessage;
        },
        set ConfirmMessage(value) {
            confirmMessage = value;
        },

        get FormSubmitting() {
            return formSubmitting;
        },
        set FormSubmitting(value) {
            formSubmitting = value;
        },

        get IsDirty() {
            return isDirty;
        },
        set IsDirty(value) {
            //Once isDirty changed, we setup the listner
            setUplistner(value);
            console.log(`IsDirty Changed`);
            isDirty = value;
        }
    }
})();

// Object.freeze(LeavePageConfirmer);




/*


//whenever you want to prevent leaving
Confirmer.isDirty = true;

const setFormSubmitting = function() { Confirmer.FormSubmitting = true; };
<form method="post" onsubmit="setFormSubmitting()">     
    <input type="submit" />
</form>
*/