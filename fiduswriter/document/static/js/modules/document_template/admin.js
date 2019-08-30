import {whenReady, findTarget, postJson, escapeText, ensureCSS} from "../common"
import {DocumentTemplateDesigner} from "./designer"

export class DocumentTemplateAdmin {
    constructor({staticUrl}) {
        this.staticUrl = staticUrl
        this.definitionTextarea = false
        this.templateDesigner = false
        this.templateExtras = false
        const locationParts = window.location.href.split('/')
        let id = parseInt(locationParts[locationParts.length-3])
        if (isNaN(id)) {
            id = 0
        }
        this.id = id
    }

    init() {
        ensureCSS([
            'admin.css',
            'ui_dialogs.css',
            'buttons.css'
        ], this.staticUrl)
        const initialTasks = [
            whenReady()
        ]
        if (this.id) {
            initialTasks.push(
                postJson('/api/document/admin/get_template_extras/', {id: this.id}).then(
                    ({json}) => this.templateExtras = json
                )
            )
        }

        Promise.all(initialTasks).then(() => {
            this.titleInput = document.querySelector('#id_title')
            this.titleBlock = document.querySelector('div.field-title')
            this.definitionTextarea = document.querySelector('textarea[name=definition]')
            this.definitionHashInput = document.querySelector('#id_definition_hash')
            this.definitionHashBlock = document.querySelector('div.field-definition_hash')
            this.definitionBlock = document.querySelector('div.field-definition')
            this.modifyDOM()
            this.initDesigner()
            this.bind()
        })
    }

    initDesigner() {
        this.templateDesigner = new DocumentTemplateDesigner(
            {staticUrl: this.staticUrl},
            this.id,
            this.titleInput.value,
            JSON.parse(this.definitionTextarea.value),
            this.templateExtras.document_styles || [],
            this.templateExtras.export_templates || [],
            document.getElementById('template-editor')
        )
        this.templateDesigner.init()
    }

    modifyDOM() {
        this.definitionBlock.style.display='none'
        this.definitionHashBlock.style.display='none'
        this.titleBlock.style.display='none'
        this.titleBlock.insertAdjacentHTML(
            'beforebegin',
            `<div class="form-row"><ul class="object-tools right">
                <li>
                    <span class="link" id="toggle-editor">${gettext('Source/Editor')}</span>
                </li>
            </ul></div>
            <div class="form-row template-editor">
                <ul class="errorlist"></ul>
                <div id="template-editor"></div>
            </div>`
        )

        this.templateDesignerBlock = document.querySelector('div.template-editor')
    }

    setCurrentValue() {
        const {valid, value, errors, hash, title} = this.templateDesigner.getCurrentValue()
        this.definitionTextarea.value = JSON.stringify(value)
        this.definitionHashInput.value = hash
        this.titleInput.value = title
        this.showErrors(errors)
        return valid
    }

    showErrors(errors) {
        this.templateDesignerBlock.querySelector('ul.errorlist').innerHTML =
            Object.values(errors).map(error => `<li>${escapeText(error)}</li>`).join('')
    }


    bind() {

        document.body.addEventListener('click', event => {
            const el = {}
            switch (true) {
                case findTarget(event, '#toggle-editor', el):
                    event.preventDefault()
                    if (this.definitionBlock.style.display==='none') {
                        this.definitionBlock.style.display=''
                        this.definitionHashBlock.style.display=''
                        this.titleBlock.style.display=''
                        this.setCurrentValue()
                        this.templateDesigner.close()
                        this.templateDesigner = false
                        this.templateDesignerBlock.style.display='none'
                    } else {
                        this.definitionBlock.style.display='none'
                        this.definitionHashBlock.style.display='none'
                        this.titleBlock.style.display='none'
                        this.templateDesignerBlock.style.display=''
                        this.initDesigner()
                    }
                    break
                case findTarget(event, 'div.submit-row input[type=submit]', el):
                    if (this.definitionBlock.style.display==='none' && !this.setCurrentValue()) {
                        event.preventDefault()
                    }
                    break
                default:
                    break
            }
        })
    }
}
