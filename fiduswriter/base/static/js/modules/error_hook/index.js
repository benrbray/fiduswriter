import StackTrace from "stacktrace-js"

import {getCookie} from "../common"

export class ErrorHook {
    constructor() {

    }

    init() {
        window.onerror = (msg, url, lineNumber, columnNumber, errorObj) => this.onError(msg, url, lineNumber, columnNumber, errorObj)

        if (window.addEventListener) {
            window.addEventListener('unhandledrejection', rejection => this.onUnhandledRejection(rejection))
        }
    }

    sendLog(details) {
        const xhr = new XMLHttpRequest()

        xhr.open("POST", "/api/django_js_error_hook/", true)
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        const cookie = getCookie('csrftoken')
        if (cookie) {
            xhr.setRequestHeader("X-CSRFToken", cookie)
        }
        const query = [], data = {
            context: navigator.userAgent,
            details
        }
        for (const key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        }
        xhr.send(query.join('&'))
    }

    onError(msg, url, lineNumber, columnNumber, errorObj) {
        if (settings_SOURCE_MAPS && errorObj) {
            StackTrace.fromError(errorObj).then(
                stackFrames => this.logError(msg, url, lineNumber, columnNumber, errorObj, stackFrames.map(sf => sf.toString()).join('\n'))
            ).catch(
                () => this.logError(msg, url, lineNumber, columnNumber, errorObj)
            )
        } else {
            this.logError(msg, url, lineNumber, columnNumber, errorObj)
        }
    }

    logError(msg, url, lineNumber, columnNumber, errorObj, mappedStack = false) {

        let logMessage = url + ': ' + lineNumber + ': ' + msg
        if (columnNumber) {
            logMessage += ", " + columnNumber
        }
        if (errorObj && errorObj.stack) {
            logMessage += ", " + errorObj.stack
        }
        if (mappedStack) {
            logMessage += "\n" + mappedStack
        }
        this.sendLog(logMessage)
    }

    onUnhandledRejection(rejection) {
        if (settings_SOURCE_MAPS && rejection.reason && rejection.reason.stack) {
            StackTrace.fromError(rejection.reason).then(
                stackFrames => this.logUnhandledRejection(rejection, stackFrames.map(sf => sf.toString()).join('\n'))
            ).catch(
                () => this.logUnhandledRejection(rejection)
            )
        } else {
            this.logUnhandledRejection(rejection)
        }
    }

    logUnhandledRejection(rejection, mappedStack = false) {
        let logMessage = rejection.type
        if (rejection.reason) {
            if (rejection.reason.message) {
                logMessage += ", " + rejection.reason.message
            } else {
                logMessage += ", " + JSON.stringify(rejection.reason)
            }
            if (rejection.reason.stack) {
                logMessage += ", " + rejection.reason.stack
            }
        }
        if (mappedStack) {
            logMessage += "\n" + mappedStack
        }
        this.sendLog(logMessage)
    }
}
