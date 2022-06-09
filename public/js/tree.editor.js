'use strict';

customElements.define('dialob-box', DialogBox);

class TreeEditor {

    #selected_node;
    #root

    constructor(root) {
        this.#root = root;
        this.#_tempIndex = 0;
    }

    removeSelectedNode() {
        if (this.#selected_node != null) {
            const parent = this.#selected_node.parentNode.parentNode;
            parent.removeChild(this.#selected_node.parentNode);
            if (parent instanceof HTMLUListElement) {
                if (parent.childNodes.length == 0) {
                    const ulParent = parent.parentNode;
                    ulParent.removeChild(parent);
                    ulParent.removeChild(ulParent.firstChild);
                    const label = ulParent.firstChild;
                    label.classList.remove('tree-editor-caret');
                    label.removeAttribute('for');
                }
            }
            this.#selected_node = null;
        }
    }

    selectNode(event_target) {

        if(event_target instanceof HTMLInputElement) {
            return null;
        }

        if (this.#selected_node != null) {
            this.#selected_node.classList.remove('tree-editor-selected-node');
        }

        if (event_target instanceof HTMLLabelElement) {


            this.#selected_node = event_target;

            this.#selected_node.classList.add('tree-editor-selected-node');

            if (this.#selected_node.childNodes.length >= 2) {
                document.getElementById('descView').value = this.#selected_node.lastChild.innerText;
            } else {
                document.getElementById('descView').value = '';
            }

            this.#root.classList.remove('tree-editor-active');

        } else {
            this.#selected_node = null;
            this.#root.classList.add('tree-editor-active');
        }
        
        return this.#selected_node;
    }

    loadObj(obj) {
        // console.log('begin of loadObj');
        this.clearTree();
        this._loadObj(null, obj);
        // console.log('end of loadObj');
    }

    
    _loadObj(parent, obj) {
        // console.log('begin of _loadObj');
        let newNode;

        if (obj.value) {
            newNode = this.insertItem(parent, obj.value);
            // console.log(newNode);
        }

        if (obj.childs) {
            this._loadObj(newNode, obj.childs);
        }

        if (obj instanceof Array) {

            // console.log('begin of _loadObj for');
            for (let index = 0; index < obj.length; index++) {
                console.log(`Iteration ${index} begin`);
                const element = obj[index];
                this._loadObj(parent, element);
                // console.log(`obj.length ${obj.length}`);
                // console.log(`Iteration ${index} End`);
            }
            // console.log('end of _loadObj for');
        }
        // console.log('end of _loadObj');
    }

    traverseRoot() {
        return this.traverse(this.#root);
    }

    traverse(node) {

        if(node == null){
            return null;
        }

        if (node instanceof HTMLLabelElement) {

            const obj = { value: node.firstChild.textContent };


            if (node.childNodes.length >= 2) {
                obj.desc = node.lastChild.innerText;
            }

            const childs = this.traverse(node.nextElementSibling);

            if (childs != null) {
                obj.childs = childs;
            }

            return obj;
        }

        if (node instanceof HTMLLIElement) {
            return this.traverse(node.firstChild);
        }

        if (node instanceof HTMLInputElement) {
            return this.traverse(node.nextElementSibling);
        }

        if (node instanceof Text) {
            return this.traverse(node.nextElementSibling);
        }

        if (node instanceof HTMLUListElement) {
            const childs = [];
            node.childNodes.forEach(item => {
                const newObj = this.traverse(item);
                if (newObj != null) {
                    childs.push(newObj);
                }
            })
            return childs;
        }

        return null;
    }


    rootInsert(text, description) {

        // console.log('rootInsert');
        
        const label = document.createElement('label');
        label.innerText = text;

        const li = document.createElement('li');
        li.appendChild(label);

        if (description) {
            const desc = document.createElement('div');
            desc.classList.add('tree-editor-description');
            desc.innerHTML = description;
            label.appendChild(desc);
        }

        this.#root.appendChild(li);
        return label;
    }

    addItem(caption, description) {
        this.insertItem(this.#selected_node, caption, description);
    }

    insertItem(node, caption, description) {

        // console.log('insertItem');

        let nestedUl;

        if (node == null) {
            return this.rootInsert(caption, description);
        }

        // console.log(caption);

        if (!node.classList.contains('tree-editor-caret')) {
            this.convertToNestedList(node);
        } 

        nestedUl = node.nextElementSibling;

        const label = document.createElement('label');
        label.innerText = caption;

        const li = document.createElement('li');
        li.appendChild(label);

        if (description) {
            const desc = document.createElement('div');
            desc.classList.add('tree-editor-description');
            desc.innerHTML = description;
            label.appendChild(desc);
        }

        nestedUl.appendChild(li);
        return label;
    }

    convertToNestedList(node) {

        const chx_id = 'chx' + Date.now();

        const parentNode = node.parentNode;

        const input = document.createElement('input');
        input.classList.add('tree-editor-list-togle');
        input.setAttribute('id', chx_id);
        input.setAttribute('type', 'checkbox');
        parentNode.insertBefore(input, node);
        node.setAttribute('for', chx_id);

        const ul = document.createElement('ul');
        ul.classList.add('tree-editor-nested');

        parentNode.insertBefore(ul, node.nextSibling);
        node.classList.add('tree-editor-caret');
    }

    clearTree() {
        while (this.#root.firstChild) {
            this.#root.removeChild(root.firstChild);
        }
        this.#selected_node = null;
    }


}