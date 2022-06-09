

class DialogBox extends HTMLElement {

    static close_event = new Event('DialogClosed');
    static cancel_event = new Event('DialogCanceled');
    
    #result
    #btnClose
    #contentHTML
    #modal
    #modalBackdrop
    #id

    constructor() {
        super();

        this.#id = Date.now();

        document.addEventListener('DOMContentLoaded',  this.build.bind(this));

        this.#result = {};
    }

    build() {

        this.#contentHTML = this.innerHTML;

        console.log(this.#contentHTML);

        this.innerHTML = this.templateHTML;

        const contentWrapper = document.getElementById('dialog-box-modal-body-content');

        contentWrapper.innerHTML = this.#contentHTML;

        this.#modal = document.getElementById('dialog-box-modal');

        this.#modalBackdrop = document.getElementById('dialog-box-modal-backdrop');

        this.#modalBackdrop.addEventListener('click',this.closeDialog.bind(this));

        this.#btnClose = document.getElementById('btnClose');

        this.#btnClose.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeDialog()
        });

        const me = this;
        document.getElementById('btnOK').addEventListener('click', function(e) {
            e.preventDefault();
            me.closeDialog('OK');
        });

        document.getElementById('btnCancel').addEventListener('click', function(e){
            e.preventDefault();
            me.cancelDialog();
        });
    }

    closeDialog(status) {
        this.#modal.style.display = 'none';
        if(status){
            this.#result.status = status;
        }else{
            this.#result.status = 'closed';
        }
        this.#result.caption = document.getElementById('txt_caption').value;
        this.#result.description = document.getElementById('descView').value;
        this.dispatchEvent(DialogBox.close_event);
    };

    cancelDialog() {
        this.#modal.style.display = 'none';
        this.#result.status = 'cancel';
        this.dispatchEvent(DialogBox.cancel_event);
    };

    showDialog() {
        this.#modal.style.display = 'block';
        const me = this;
        return new Promise(function(resolve, reject){
            me.addEventListener('DialogClosed', function (e) {
                resolve(me.#result)
             });
             me.addEventListener('DialogCanceled', function (e) {
                reject(me.#result)
             });
        });
    }

    connectedCallback() {
        // browser calls this method when the element is added to the document
        // (can be called many times if an element is repeatedly added/removed)
    }

    disconnectedCallback() {
        // browser calls this method when the element is removed from the document
        // (can be called many times if an element is repeatedly added/removed)
    }

    static get observedAttributes() {
        return [/* array of attribute names to monitor for changes */];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // called when one of attributes listed above is modified
    }

    adoptedCallback() {
        // called when the element is moved to a new document
        // (happens in document.adoptNode, very rarely used)
    }

    // there can be other element methods and properties

    get templateHTML() {
        return `
            <div class='dialog-box-modal' id='dialog-box-modal'>
                <div id='dialog-box-modal-backdrop' class='dialog-box-modal-backdrop'></div>
                <div id='modal-body' class='dialog-box-modal-body'>
                    <div id='dialog-box-modal-body-banner' class='dialog-box-modal-body-banner dialog-box-clearfix'>
                        <button class='dialog-box-modal-close' id='btnClose'>&#215;</button>
                    </div>
                    <div id='dialog-box-modal-body-content' class='dialog-box-modal-body-content'>

                    </div>
                    <div class='dialog-box-controls'>
                        <button class='dialog-box-btnOK' id='btnOK'>✔</button>
                        <button class='dialog-box-btnCancel' id='btnCancel'>❌</button>
                    </div>
                    <br>
                </div>
            </div>
        `;
    }
}