'use strict'

if (typeof Object.assign !== 'function') {
    Object.assign = function (target) {
        'use strict'
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object')
        }

        target = Object(target)
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index]
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key]
                    }
                }
            }
        }
        return target
    }
}

module.exports = Object.assign({},

    require('./page/photo-confirm/PhotoConfirmForm'),
    require('./page/photo-upload/PhotoUploadForm'),
    require('./page/photo-upload-about/AboutYourPhotoForm'),
    require('./page/document-upload/DocumentUploadForm'),
    require('./page/photo-upload/PhotoUploadData')
)
